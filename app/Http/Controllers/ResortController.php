<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use Illuminate\Http\Request;

class ResortController extends Controller
{
    public function index()
    {
        return response()->json(Resort::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
            'price' => 'required|numeric',
            'price_weekend' => 'nullable|numeric',
            'stock' => 'required|integer',
            'capacity' => 'required|integer',
            'bed_type' => 'nullable|string|max:255',
            'room_size' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
        ]);

        $resort = Resort::create($validated);
        return response()->json($resort, 201);
    }

    public function show($id)
    {
        $resort = Resort::findOrFail($id);
        return response()->json($resort);
    }

    public function update(Request $request, $id)
    {
        $resort = Resort::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
            'price' => 'sometimes|numeric',
            'price_weekend' => 'nullable|numeric',
            'stock' => 'sometimes|integer',
            'capacity' => 'sometimes|integer',
            'bed_type' => 'nullable|string|max:255',
            'room_size' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
        ]);

        $resort->update($validated);
        return response()->json($resort);
    }

    public function destroy($id)
    {
        $resort = Resort::findOrFail($id);
        $resort->delete();
        return response()->json(['message' => 'Resort deleted successfully']);
    }
}
