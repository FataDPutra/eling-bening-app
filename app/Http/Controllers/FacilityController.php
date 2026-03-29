<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index()
    {
        return response()->json(Facility::orderBy('is_addon')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_addon'    => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $facility = Facility::create($validated);
        return response()->json($facility, 201);
    }

    public function show($id)
    {
        return response()->json(Facility::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'nullable|numeric|min:0',
            'is_addon'    => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $facility->update($validated);
        return response()->json($facility);
    }

    public function destroy($id)
    {
        Facility::findOrFail($id)->delete();
        return response()->json(['message' => 'Facility deleted successfully']);
    }
}
