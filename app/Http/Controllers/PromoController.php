<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index()
    {
        return response()->json(Promo::all());
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
            'is_active' => 'boolean',
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
            'is_active' => 'boolean',
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
        $request->validate(['promo_code' => 'required|string']);
        $promo = Promo::where('promo_code', $request->promo_code)
                      ->where('is_active', true)
                      ->whereDate('start_date', '<=', today())
                      ->whereDate('end_date', '>=', today())
                      ->first();

        if (!$promo) {
            return response()->json(['message' => 'Promo tidak valid atau sudah kadaluarsa'], 400);
        }

        return response()->json($promo);
    }
}
