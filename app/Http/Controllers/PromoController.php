<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index()
    {
        return response()->json(Promo::withSum('transactions', 'discount_amount')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'promo_code' => 'required|string|unique:promos,promo_code',
            'name' => 'required|string|max:255',
            'discount_type' => 'required|in:percentage,nominal',
            'discount_value' => 'required|numeric',
            'min_purchase' => 'numeric',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'applicable_to' => 'required|in:TICKET,RESORT,EVENT,ALL',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer',
            'used_count' => 'nullable|integer',
        ]);

        $promo = Promo::create($validated);
        return response()->json($promo, 201);
    }

    public function show($id)
    {
        $promo = Promo::findOrFail($id);
        return response()->json($promo);
    }

    public function update(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);
        
        $validated = $request->validate([
            'promo_code' => 'sometimes|string|unique:promos,promo_code,'.$id,
            'name' => 'sometimes|string|max:255',
            'discount_type' => 'sometimes|in:percentage,nominal',
            'discount_value' => 'sometimes|numeric',
            'min_purchase' => 'numeric',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'applicable_to' => 'sometimes|in:TICKET,RESORT,EVENT,ALL',
            'is_active' => 'boolean',
            'usage_limit' => 'nullable|integer',
            'used_count' => 'nullable|integer',
        ]);

        $promo->update($validated);
        return response()->json($promo);
    }

    public function destroy($id)
    {
        $promo = Promo::findOrFail($id);
        $promo->delete();
        return response()->json(['message' => 'Promo deleted successfully']);
    }

    public function validatePromo(Request $request)
    {
        $request->validate([
            'promo_code' => 'required|string',
            'booking_type' => 'nullable|in:TICKET,RESORT,EVENT',
            'total_amount' => 'nullable|numeric'
        ]);

        $promo = Promo::where('promo_code', $request->promo_code)->first();

        if (!$promo) {
            return response()->json(['message' => 'Kode promo tersebut tidak ditemukan.'], 404);
        }

        if (!$promo->is_active) {
            return response()->json(['message' => 'Maaf, promo ini sedang tidak aktif.'], 400);
        }

        if (today()->lt($promo->start_date)) {
            $startDate = \Carbon\Carbon::parse($promo->start_date);
            return response()->json(['message' => 'Promo ini baru bisa digunakan mulai tanggal ' . $startDate->format('d M Y')], 400);
        }

        if (today()->gt($promo->end_date)) {
            return response()->json(['message' => 'Maaf, masa berlaku promo ini sudah berakhir.'], 400);
        }

        if ($request->booking_type && $promo->applicable_to !== 'ALL' && $promo->applicable_to !== $request->booking_type) {
            $target = match($promo->applicable_to) {
                'TICKET' => 'Tiket Wisata',
                'RESORT' => 'Reservasi Resort',
                'EVENT'  => 'Tiket Event',
                default  => $promo->applicable_to,
            };
            return response()->json(['message' => "Kode promo ini hanya berlaku untuk kategori {$target}."], 400);
        }

        if ($request->has('total_amount') && $request->total_amount < $promo->min_purchase) {
            return response()->json([
                'message' => "Minimal pembelian untuk promo ini adalah " . number_format($promo->min_purchase, 0, ',', '.') . ". (Kurang " . number_format($promo->min_purchase - $request->total_amount, 0, ',', '.') . " lagi)",
                'min_purchase' => $promo->min_purchase
            ], 400);
        }

        if ($promo->usage_limit !== null && $promo->used_count >= $promo->usage_limit) {
            return response()->json(['message' => 'Maaf, kuota penggunaan promo ini sudah habis.'], 400);
        }

        return response()->json($promo);
    }
}
