<?php

namespace App\Http\Controllers;

use App\Models\Reschedule;
use App\Models\Transaction;
use Illuminate\Http\Request;

class RescheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'admin') {
            return response()->json(Reschedule::with('transaction.user')->orderBy('created_at', 'desc')->get());
        }
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'new_date' => 'required|date|after:today',
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);

        if ($request->user()->id !== $transaction->user_id && $request->user()->role !== 'admin') {
             return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $reschedule = Reschedule::create([
            'transaction_id' => $transaction->id,
            'old_date' => $transaction->check_in_date,
            'new_date' => $validated['new_date'],
            'status' => 'pending'
        ]);

        return response()->json($reschedule, 201);
    }

    public function update(Request $request, $id)
    {
        $reschedule = Reschedule::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $reschedule->update($validated);
        
        if ($validated['status'] === 'approved') {
            $transaction = $reschedule->transaction;
            $transaction->update(['check_in_date' => $reschedule->new_date]);
        }

        return response()->json($reschedule);
    }
}
