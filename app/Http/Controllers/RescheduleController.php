<?php

namespace App\Http\Controllers;

use App\Models\Reschedule;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RescheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'admin') {
            return response()->json(Reschedule::with(['transaction.user', 'transaction.items.item'])->orderBy('created_at', 'desc')->get());
        }
        
        // For guest: list their reschedules
        return response()->json(
            Reschedule::whereHas('transaction', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with('transaction')->orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        return app(TransactionController::class)->reschedule($request, $request->transaction_id);
    }

    public function update(Request $request, $id)
    {
        $reschedule = Reschedule::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,approved_awaiting_payment,completed,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        // When admin moves to "approved_awaiting_payment", set expiration
        if ($validated['status'] === 'approved_awaiting_payment' && $reschedule->status === 'pending') {
            $holdHours = (int) (\App\Models\SystemSetting::where('key', 'reschedule_hold_hours')->first()?->value ?? 2);
            $validated['expires_at'] = now()->addHours($holdHours);
        }

        $reschedule->update($validated);
        
        if ($validated['status'] === 'completed') {
            $this->finalizeReschedule($reschedule);
        }

        return response()->json($reschedule);
    }

    /**
     * Guest "Pay" action
     */
    public function pay(Request $request, $id)
    {
        $reschedule = Reschedule::with('transaction')->findOrFail($id);
        $user = $request->user();

        if ($user->id !== $reschedule->transaction->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reschedule->status !== 'approved_awaiting_payment') {
            return response()->json(['message' => 'Status permintaan tidak valid untuk pembayaran'], 400);
        }

        // CHECK EXPIRY
        if ($reschedule->expires_at && $reschedule->expires_at->isPast()) {
            return response()->json(['message' => 'Batas waktu pembayaran reschedule telah habis. Silakan ajukan ulang.'], 400);
        }

        return DB::transaction(function() use ($reschedule, $request) {
            $reschedule->update([
                'status' => 'completed',
                'paid_at' => now(),
                'payment_method' => $request->payment_method ?? 'automated'
            ]);

            $this->finalizeReschedule($reschedule);

            return response()->json([
                'message' => 'Pembayaran berhasil. Jadwal Anda telah diperbarui.',
                'reschedule' => $reschedule
            ]);
        });
    }

    /**
     * Guest "Cancel" action - Immediately releases hold
     */
    public function cancel(Request $request, $id)
    {
        $reschedule = Reschedule::with('transaction')->findOrFail($id);
        $user = $request->user();

        if ($user->id !== $reschedule->transaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow cancel if not already completed or rejected
        if (in_array($reschedule->status, ['completed', 'rejected'])) {
            return response()->json(['message' => 'Permintaan sudah selesai diproses.'], 400);
        }

        $reschedule->update(['status' => 'rejected', 'admin_notes' => 'Dibatalkan oleh pelanggan.']);

        return response()->json(['message' => 'Permintaan reschedule berhasil dibatalkan. Stok telah dilepas.']);
    }

    private function finalizeReschedule($reschedule)
    {
        $transaction = $reschedule->transaction;
        $transaction->update([
            'check_in_date' => $reschedule->new_date,
            'check_out_date' => $reschedule->new_check_out_date ?? $transaction->check_out_date,
            'total_price' => $transaction->total_price + $reschedule->final_charge,
        ]);
        
        if ($reschedule->price_diff > 0) {
            $resortItem = $transaction->items()->where('item_type', \App\Models\Resort::class)->first();
            if ($resortItem) {
                $resortItem->increment('subtotal', $reschedule->price_diff);
                $resortItem->increment('price', $reschedule->price_diff / $resortItem->quantity);
            }
        }
    }
}
