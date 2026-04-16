<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use App\Models\TransactionItem;
use App\Models\Reschedule;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class ResortController extends Controller
{
    public function index(Request $request)
    {
        $resorts = Resort::with('facilities', 'facilities.resorts')->get();

        if ($request->has(['check_in', 'check_out'])) {
            $startDate = $request->check_in;
            $endDate   = $request->check_out;

            foreach ($resorts as $resort) {
                // Pre-load transactions for this specific resort to ensure 'filter' works correctly
                $overlappingTransactions = TransactionItem::where('item_type', Resort::class)
                    ->where('item_id', $resort->id)
                    ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                        $query->whereIn('status', ['pending', 'paid', 'success'])
                              ->where(function ($q) use ($startDate, $endDate) {
                                  $q->where('check_in_date', '<', $endDate)
                                    ->where('check_out_date', '>', $startDate);
                              });
                    })
                    ->with('transaction') // Critical: Ensure trans is loaded for the filter loop below
                    ->get();

                // Get all active reschedules
                $overlappingReschedules = Reschedule::whereIn('status', ['pending', 'approved_awaiting_payment'])
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    })
                    ->where(function ($q) use ($startDate, $endDate) {
                        $q->where('new_date', '<', $endDate)
                          ->where('new_check_out_date', '>', $startDate);
                    })
                    ->whereHas('transaction.items', function($q) use ($resort) {
                        $q->where('item_id', $resort->id)->where('item_type', Resort::class);
                    })->with('transaction.items')->get();

                $maxOccupancy = 0;
                $isRescheduleHold = false;

                $start = Carbon::parse($startDate)->startOfDay();
                $end = Carbon::parse($endDate)->startOfDay();
                $nightsNum = max(1, $start->diffInDays($end));

                for ($i = 0; $i < $nightsNum; $i++) {
                    $nightStart = (clone $start)->addDays($i);
                    $nightEnd = (clone $nightStart)->addDay();

                    // Booked for this specific night
                    $nightOccupancy = $overlappingTransactions->filter(function($item) use ($nightStart, $nightEnd) {
                        $trans = $item->transaction;
                        if (!$trans) return false;
                        $tci = Carbon::parse($trans->check_in_date)->startOfDay();
                        $tco = Carbon::parse($trans->check_out_date)->startOfDay();
                        return $tci < $nightEnd && $tco > $nightStart;
                    })->sum('quantity');

                    // Reschedule holds for this specific night
                    $nightRescheduleHold = $overlappingReschedules->filter(function($res) use ($nightStart, $nightEnd, $resort) {
                        $nr_ci = Carbon::parse($res->new_date)->startOfDay();
                        $nr_co = Carbon::parse($res->new_check_out_date ?? $nr_ci->copy()->addDay())->startOfDay();
                        return $nr_ci < $nightEnd && $nr_co > $nightStart;
                    })->sum(function($r) use ($resort) {
                        return $r->transaction->items->where('item_id', $resort->id)->where('item_type', Resort::class)->sum('quantity');
                    });

                    $totalNightOccupancy = $nightOccupancy + $nightRescheduleHold;
                    if ($totalNightOccupancy > $maxOccupancy) {
                        $maxOccupancy = $totalNightOccupancy;
                    }

                    if ($nightRescheduleHold > 0) $isRescheduleHold = true;
                }

                $resort->available_stock = (int) max(0, $resort->stock - $maxOccupancy);
                $resort->is_on_hold = ($resort->available_stock <= 0 && $isRescheduleHold);
                
                if ($resort->is_on_hold) {
                    $minExpiry = $overlappingReschedules->whereNotNull('expires_at')->min('expires_at');
                    $resort->hold_expiry = $minExpiry ? Carbon::parse($minExpiry)->toISOString() : null;
                } else {
                    $resort->hold_expiry = null;
                }

                if ($resort->available_stock <= 0) {
                    $resort->status = 'full';
                }

                $resort->weekday_price = $resort->price;
                $resort->has_weekend_price = ($resort->price_weekend > 0);
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

            // More accurate stock checking for multi-day stays:
            // Calculate peak occupancy for each night in the range
            $checkIn = Carbon::parse($startDate);
            $checkOut = Carbon::parse($endDate);
            $nightsNum = max(1, $checkIn->diffInDays($checkOut));

            // Get all potentially overlapping transactions
            $overlappingTransactions = TransactionItem::where('item_type', Resort::class)
                ->where('item_id', $resort->id)
                ->whereHas('transaction', function ($query) use ($startDate, $endDate) {
                    $query->whereIn('status', ['pending', 'paid', 'success'])
                          ->where(function ($q) use ($startDate, $endDate) {
                              $q->where('check_in_date', '<', $endDate)
                                ->where('check_out_date', '>', $startDate);
                          });
                })->get();

            // Get all active reschedules
            $overlappingReschedules = Reschedule::whereIn('status', ['pending', 'approved_awaiting_payment'])
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
                })
                ->where(function ($q) use ($startDate, $endDate) {
                    $q->where('new_date', '<', $endDate)
                      ->where('new_check_out_date', '>', $startDate);
                })
                ->whereHas('transaction.items', function($q) use ($resort) {
                    $q->where('item_id', $resort->id)->where('item_type', Resort::class);
                })->with('transaction.items')->get();

            $maxOccupancy = 0;
            $isRescheduleHold = false;
            $holdExpiry = null;

            for ($i = 0; $i < $nightsNum; $i++) {
                $nightDate = (clone $checkIn)->addDays($i)->format('Y-m-d');
                $nextNightDate = (clone $checkIn)->addDays($i + 1)->format('Y-m-d');

                // Booked for this specific night
                $nightOccupancy = $overlappingTransactions->filter(function($item) use ($nightDate, $nextNightDate) {
                    $trans = $item->transaction;
                    return $trans->check_in_date < $nextNightDate && $trans->check_out_date > $nightDate;
                })->sum('quantity');

                // Reschedule holds for this specific night
                $nightRescheduleHold = $overlappingReschedules->filter(function($res) use ($nightDate, $nextNightDate, $resort) {
                    $isOverlap = $res->new_date < $nextNightDate && 
                                ($res->new_check_out_date ?? Carbon::parse($res->new_date)->addDay()->format('Y-m-d')) > $nightDate;
                    return $isOverlap;
                })->sum(function($r) use ($resort) {
                    return $r->transaction->items->where('item_id', $resort->id)->where('item_type', Resort::class)->sum('quantity');
                });

                $totalNightOccupancy = $nightOccupancy + $nightRescheduleHold;
                if ($totalNightOccupancy > $maxOccupancy) {
                    $maxOccupancy = $totalNightOccupancy;
                }

                if ($nightRescheduleHold > 0) $isRescheduleHold = true;
            }

            $resort->available_stock = max(0, $resort->stock - $maxOccupancy);
            $resort->is_on_hold = ($resort->available_stock <= 0 && $isRescheduleHold);
            
            if ($resort->is_on_hold) {
                $minExpiry = $overlappingReschedules->whereNotNull('expires_at')->min('expires_at');
                $resort->hold_expiry = $minExpiry ? Carbon::parse($minExpiry)->toISOString() : null;
            } else {
                $resort->hold_expiry = null;
            }

            // Adjust price based on stay duration and weekend rates
            $checkInDate = Carbon::parse($startDate);
            $checkOutDate = Carbon::parse($endDate);
            $nights = max(1, $checkInDate->diffInDays($checkOutDate));
            $totalStayPrice = 0;

            for ($i = 0; $i < $nights; $i++) {
                $currentDay = (clone $checkInDate)->addDays($i);
                $dayOfWeek = $currentDay->dayOfWeek;
                $isWeekend = ($dayOfWeek === 6 || $dayOfWeek === 0);
                
                if ($isWeekend && $resort->price_weekend > 0) {
                    $totalStayPrice += $resort->price_weekend;
                } else {
                    $totalStayPrice += $resort->price;
                }
            }

            // Add metadata for frontend display
            $resort->weekday_price = $resort->price;
            $resort->has_weekend_price = ($resort->price_weekend > 0);
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
        $resort->facilities()->detach();
        $resort->delete();
        return response()->json(['message' => 'Resort deleted successfully']);
    }
}
