<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'admin') {
            return response()->json(Transaction::with(['user', 'item', 'promo'])->orderBy('created_at', 'desc')->get());
        } elseif ($user) {
            return response()->json(Transaction::with(['item', 'promo'])->whereUserId($user->id)->orderBy('created_at', 'desc')->get());
        }
        
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:transactions,id',
            'payment_method' => 'nullable|string',
            'item_type' => 'required|string',
            'item_id' => 'required|string', 
            'promo_id' => 'nullable|exists:promos,id',
            'check_in_date' => 'required|date',
            'total_price' => 'required|numeric',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $transaction = Transaction::create($validated);
        return response()->json($transaction, 201);
    }

    public function show(Request $request, $id)
    {
        $transaction = Transaction::with(['user', 'item', 'promo', 'reschedules'])->findOrFail($id);
        
        $user = $request->user();
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($transaction);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,success,failed,cancelled',
        ]);

        $transaction->update($validated);
        return response()->json($transaction);
    }
}
