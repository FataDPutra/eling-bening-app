<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use App\Models\TransactionItem;
use Illuminate\Http\Request;

class ResortController extends Controller
{
    public function index(Request $request)
    {
        $resorts = Resort::with('facilities')->get();

        if ($request->has(['check_in', 'check_out'])) {
            $startDate = $request->check_in;
            $endDate   = $request->check_out;

            foreach ($resorts as $resort) {
                $bookedCount = \App\Models\TransactionItem::where('item_type', Resort::class)
                    ->where('item_id', $resort->id)
                    ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                        $query->whereIn('status', ['pending', 'paid', 'success'])
                              ->where(function ($q) use ($startDate, $endDate) {
                                  $q->where('check_in_date', '<', $endDate)
                                    ->where('check_out_date', '>', $startDate);
                              });
                    })
                    ->sum('quantity');

                $resort->available_stock = max(0, $resort->stock - $bookedCount);

                if ($resort->available_stock <= 0) {
                    $resort->status = 'full';
                }
            }
        }

        return response()->json($resorts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'integer|exists:facilities,id',
            'price'        => 'required|numeric',
            'price_weekend'=> 'nullable|numeric',
            'stock'        => 'required|integer',
            'capacity'     => 'required|integer',
            'bed_type'     => 'nullable|string|max:255',
            'room_size'    => 'nullable|string|max:255',
            'gallery'      => 'nullable|array',
        ]);

        $facilityIds = $validated['facility_ids'] ?? [];
        unset($validated['facility_ids']);

        $resort = Resort::create($validated);
        $resort->facilities()->sync($facilityIds);

        return response()->json($resort->load('facilities'), 201);
    }

    public function show(Request $request, $id)
    {
        $resort = Resort::with('facilities')->findOrFail($id);

        if ($request->has(['check_in', 'check_out'])) {
            $startDate = $request->check_in;
            $endDate   = $request->check_out;

            $bookedCount = \App\Models\TransactionItem::where('item_type', Resort::class)
                ->where('item_id', $resort->id)
                ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                    $query->whereIn('status', ['pending', 'paid', 'success'])
                          ->where(function ($q) use ($startDate, $endDate) {
                              $q->where('check_in_date', '<', $endDate)
                                ->where('check_out_date', '>', $startDate);
                          });
                })
                ->sum('quantity');

            $resort->available_stock = max(0, $resort->stock - $bookedCount);
        }

        return response()->json($resort);
    }

    public function update(Request $request, $id)
    {
        $resort = Resort::findOrFail($id);

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'nullable|string',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'integer|exists:facilities,id',
            'price'        => 'sometimes|numeric',
            'price_weekend'=> 'nullable|numeric',
            'stock'        => 'sometimes|integer',
            'capacity'     => 'sometimes|integer',
            'bed_type'     => 'nullable|string|max:255',
            'room_size'    => 'nullable|string|max:255',
            'gallery'      => 'nullable|array',
        ]);

        if (array_key_exists('facility_ids', $validated)) {
            $resort->facilities()->sync($validated['facility_ids'] ?? []);
            unset($validated['facility_ids']);
        }

        $resort->update($validated);
        return response()->json($resort->load('facilities'));
    }

    public function destroy($id)
    {
        $resort = Resort::findOrFail($id);
        $resort->facilities()->detach(); // clean pivot
        $resort->delete();
        return response()->json(['message' => 'Resort deleted successfully']);
    }
}
