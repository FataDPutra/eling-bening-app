<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isMine = $request->query('mine') === '1';
        $month = $request->query('month');
        $year = $request->query('year');

        $query = Transaction::with(['user', 'items.item', 'promo', 'tickets.transactionItem.item'])
            ->orderBy('created_at', 'desc');

        if ($user && $user->role !== 'admin' || $isMine) {
            $query->where('user_id', $user->id);
        } elseif (!$user || ($user->role !== 'admin' && !$isMine)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($month && $month !== 'all') {
            $query->whereMonth('check_in_date', $month);
        }
        if ($year && $month !== 'all') {
            $query->whereYear('check_in_date', $year);
        }

        return response()->json($query->get());
    }

    public function checkBooking(Request $request, $id)
    {
        $transaction = Transaction::where('id', $id)
            ->where('booking_type', 'RESORT')
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'Kode booking tidak ditemukan atau bukan tipe resort.'], 404);
        }

        if ($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Anda tidak memiliki akses ke pesanan ini.'], 403);
        }

        return response()->json([
            'id' => $transaction->id,
            'check_in_date' => $transaction->check_in_date->format('Y-m-d'),
            'booker_name' => $transaction->booker_name,
            'status' => $transaction->status,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:transactions,id',
            'booking_type' => 'required|in:TICKET,RESORT,EVENT',
            'booker_name' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'promo_id' => 'nullable|exists:promos,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'nullable|date|after_or_equal:check_in_date',
            'total_price' => 'required|numeric',
            'total_qty' => 'integer',
            'discount_amount' => 'numeric',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required',
            'items.*.item_type' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.guest_names' => 'nullable|array',
            'special_requests' => 'nullable|string',
            'booker_email' => 'nullable|email',
            'booker_phone' => 'nullable|string',
            'arrival_time' => 'nullable|string',
            'additional_facilities' => 'nullable|array',
        ]);

        if ($validated['booking_type'] === 'TICKET') {
            $totalTicketQty = collect($validated['items'])->sum('quantity');
            if ($totalTicketQty > 10) {
                return response()->json(['message' => 'Maksimal pembelian adalah 10 tiket per transaksi.'], 422);
            }
        }

        return DB::transaction(function() use ($request, $validated) {
            // Resort Availability Check (Omitted for brevity if unchanged, but I must keep it)
            if ($validated['booking_type'] === 'RESORT') {
                foreach ($validated['items'] as $item) {
                    if ($item['item_type'] === 'App\\Models\\Resort') {
                        $resort = \App\Models\Resort::findOrFail($item['item_id']);
                        $bookedCount = \App\Models\TransactionItem::where('item_id', $item['item_id'])
                            ->where('item_type', 'App\\Models\\Resort')
                            ->whereHas('transaction', function($q) use ($validated) {
                                $q->whereIn('status', ['pending', 'paid', 'success'])
                                  ->where(function($dateFilter) use ($validated) {
                                      $dateFilter->where('check_in_date', '<', $validated['check_out_date'])
                                                 ->where('check_out_date', '>', $validated['check_in_date']);
                                  });
                            })->sum('quantity');

                        if (($bookedCount + $item['quantity']) > $resort->stock) {
                            return response()->json([
                                'message' => "Slot untuk {$resort->name} sudah penuh pada tanggal tersebut."
                            ], 422);
                        }
                    }
                }
            }

            $transaction = Transaction::create([
                'id' => $validated['id'],
                'user_id' => $request->user()->id,
                'booking_type' => $validated['booking_type'],
                'booker_name' => $validated['booker_name'] ?? $request->user()->name,
                'check_in_date' => $validated['check_in_date'],
                'check_out_date' => $validated['check_out_date'] ?? null,
                'payment_method' => $validated['payment_method'],
                'promo_id' => $validated['promo_id'] ?? null,
                'total_price' => $validated['total_price'],
                'total_qty' => $validated['total_qty'] ?? 1,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'special_requests' => $validated['special_requests'] ?? null,
                'booker_email' => $validated['booker_email'] ?? $request->user()->email,
                'booker_phone' => $validated['booker_phone'] ?? null,
                'arrival_time' => $validated['arrival_time'] ?? null,
                'additional_facilities' => $validated['additional_facilities'] ?? null,
                'status' => 'success' // Default to success for testing as requested
            ]);

            foreach ($validated['items'] as $item) {
                $transaction->items()->create([
                    'item_id' => $item['item_id'],
                    'item_type' => $item['item_type'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['quantity'] * $item['price'],
                    'guest_names' => $item['guest_names'] ?? []
                ]);
            }

            // Generate tickets immediately since status is 'success'
            $this->generateTickets($transaction, $validated['items']);

            // Increment used_count if promo is applied
            if ($transaction->promo_id) {
                $transaction->promo()->increment('used_count');
            }

            return response()->json($transaction->load(['items', 'tickets']), 201);
        });
    }

    public function show(Request $request, $id)
    {
        $transaction = Transaction::with(['user', 'items.item', 'promo', 'reschedules'])->findOrFail($id);
        
        $user = $request->user();
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($transaction);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::with('items')->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,success,failed,cancelled',
        ]);

        $oldStatus = $transaction->status;
        $transaction->update($validated);

        // If status changes to PAID/SUCCESS and it's a TICKET or EVENT type, generate tickets if not already generated
        if (in_array($validated['status'], ['paid', 'success']) && 
            !in_array($oldStatus, ['paid', 'success']) &&
            ($transaction->booking_type === 'TICKET' || $transaction->booking_type === 'EVENT')) {
            
            // Map items for generateTickets
            $itemsData = collect($transaction->items)->map(function($item) {
                return [
                    'item_id' => $item->item_id,
                    'quantity' => $item->quantity,
                    'guest_names' => $item->guest_names ?? []
                ];
            })->toArray();
            
            $this->generateTickets($transaction, $itemsData);
        }

        // If transaction has promo and status changes from active to inactive, decrement used_count
        if ($transaction->promo_id && 
            in_array($oldStatus, ['pending', 'paid', 'success']) && 
            in_array($validated['status'], ['failed', 'cancelled'])) {
            $transaction->promo()->decrement('used_count');
        }

        return response()->json($transaction->load('tickets'));
    }

    private function generateTickets($transaction, $itemsData)
    {
        // Don't generate if tickets already exist for this transaction
        if ($transaction->tickets()->count() > 0) return;
        if (!in_array($transaction->booking_type, ['TICKET', 'EVENT'])) return;

        foreach ($transaction->items as $idx => $transItem) {
            // Find matched names from request itemsData if available, otherwise use booker name
            $requestItem = collect($itemsData)->where('item_id', $transItem->item_id)->first();
            
            for ($i = 0; $i < $transItem->quantity; $i++) {
                // Check in request itemData first, then in stored guest_names from DB
                $guestName = null;
                if (isset($requestItem['guest_names']) && !empty($requestItem['guest_names'][$i])) {
                    $guestName = $requestItem['guest_names'][$i];
                } else if ($transItem->guest_names && !empty($transItem->guest_names[$i])) {
                    $guestName = $transItem->guest_names[$i];
                } else {
                    $guestName = $transaction->booker_name;
                }

                $prefix = 'EB-TICK-';
                if ($transaction->booking_type === 'EVENT') {
                    $prefix = 'EB-EVT-';
                } else if ($transItem->item && isset($transItem->item->name)) {
                    // Extract initials from ticket name (e.g. Tiket Kolam Renang -> TKR)
                    $words = explode(' ', $transItem->item->name);
                    $initials = '';
                    foreach ($words as $w) {
                        if (!empty($w)) $initials .= $w[0];
                    }
                    $prefix .= strtoupper($initials) . '-';
                }

                $transaction->tickets()->create([
                    'transaction_item_id' => $transItem->id,
                    'ticket_id' => $prefix . strtoupper(\Illuminate\Support\Str::random(12)),
                    'guest_name' => $guestName,
                    'is_used' => false
                ]);
            }
        }
    }

    public function reschedule(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        if ($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Anda tidak memiliki akses ke pesanan ini.'], 403);
        }

        if ($transaction->booking_type !== 'RESORT') {
            return response()->json(['message' => 'Hanya pemesanan resort yang dapat di-reschedule'], 400);
        }

        // Check reschedule policy
        $maxDays = (int) (\App\Models\SystemSetting::where('key', 'max_reschedule_days')->first()?->value ?? 7);
        $checkInDate = \Carbon\Carbon::parse($transaction->check_in_date)->startOfDay();
        $now = \Carbon\Carbon::now()->startOfDay();

        if ($now->diffInDays($checkInDate, false) < $maxDays) {
            return response()->json(['message' => "Batas waktu reschedule sudah terlewati. Harus dilakukan minimal {$maxDays} hari sebelum tanggal check-in."], 400);
        }

        $validated = $request->validate([
            'new_check_in_date' => 'required|date|after:today',
            'new_check_out_date' => 'nullable|date|after:new_check_in_date',
            'reason' => 'nullable|string',
        ]);

        $oldDate = $transaction->check_in_date;
        
        return DB::transaction(function() use ($transaction, $validated, $oldDate) {
            $transaction->reschedules()->create([
                'old_date' => $oldDate,
                'new_date' => $validated['new_check_in_date'],
                'reason' => $validated['reason'] ?? null,
                'status' => 'pending',
            ]);

            $transaction->increment('reschedule_count');
            return response()->json(['message' => 'Permintaan reschedule telah diajukan.'], 200);
        });
    }

    public function checkInTicket(Request $request, $ticketUid)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat melakukan check-in'], 403);
        }

        $ticket = \App\Models\TransactionTicket::where('ticket_id', $ticketUid)->firstOrFail();
        
        // Check if the transaction is paid/success
        if (!in_array($ticket->transaction->status, ['paid', 'success'])) {
            return response()->json(['message' => 'Transaksi belum lunas'], 422);
        }

        $newStatus = !$ticket->is_used;
        $ticket->update([
            'is_used' => $newStatus,
            'used_at' => $newStatus ? now() : null
        ]);

        // Load relationships to get item name and booker info
        $ticket->load(['transaction', 'transactionItem.item']);

        return response()->json([
            'message' => 'Tiket Berhasil ' . ($ticket->is_used ? 'Divalidasi' : 'Dibatalkan Validasi'),
            'is_used' => $ticket->is_used,
            'guest_name' => $ticket->guest_name,
            'ticket_id' => $ticket->ticket_id,
            'item_name' => $ticket->transactionItem?->item?->name ?? 'Tiket Wisata',
            'booker_name' => $ticket->transaction?->booker_name,
            'check_in_date' => $ticket->transaction?->check_in_date?->format('d M Y'),
            'status' => 'Valid'
        ]);
    }

    public function checkIn($id)
    {
        $transaction = Transaction::findOrFail($id);
        if ($transaction->booking_type !== 'RESORT') {
            return response()->json(['message' => 'Hanya reservasi resort yang dapat melakukan check-in'], 400);
        }
        
        $transaction->update([
            'stay_status' => 'checked_in',
            'checked_in_at' => now()
        ]);

        return response()->json(['message' => 'Check-in berhasil diaktifkan', 'data' => $transaction]);
    }

    public function checkOut($id)
    {
        $transaction = Transaction::findOrFail($id);
        if ($transaction->stay_status !== 'checked_in') {
            return response()->json(['message' => 'Tamu harus check-in terlebih dahulu'], 400);
        }

        $transaction->update([
            'stay_status' => 'checked_out',
            'checked_out_at' => now()
        ]);

        return response()->json(['message' => 'Check-out berhasil diproses', 'data' => $transaction]);
    }
}
