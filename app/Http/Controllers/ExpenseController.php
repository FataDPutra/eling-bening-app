<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::orderBy('transaction_date', 'desc');

        if ($request->query('month') && $request->query('month') !== 'all') {
            $query->whereMonth('transaction_date', $request->query('month'));
        }
        if ($request->query('year') && $request->query('year') !== 'all') {
            $query->whereYear('transaction_date', $request->query('year'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'category' => 'required|in:operasional,pemeliharaan,gaji_karyawan,pemasaran,lainnya',
            'amount' => 'required|numeric',
            'transaction_date' => 'required|date',
        ]);

        $expense = Expense::create($validated);
        return response()->json($expense, 201);
    }

    public function show($id)
    {
        $expense = Expense::findOrFail($id);
        return response()->json($expense);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            'category' => 'sometimes|in:operasional,pemeliharaan,gaji_karyawan,pemasaran,lainnya',
            'amount' => 'sometimes|numeric',
            'transaction_date' => 'sometimes|date',
        ]);

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
