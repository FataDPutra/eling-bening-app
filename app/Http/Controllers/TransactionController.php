<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Resort;
use App\Models\TransactionItem;
use App\Models\Reschedule;
use App\Models\SystemSetting;
use App\Models\TransactionTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isMine = $request->query('mine') === '1';
        $month = $request->query('month');
        $year = $request->query('year');

        // Load full relations including addon items so they are available in the frontend detail modal
        $query = Transaction::with(['items.item', 'promo', 'addons.items.item', 'reschedules', 'user', 'tickets'])
            ->orderBy('created_at', 'desc');

        if ($user && $user->role !== 'admin' || $isMine) {
            $query->where('user_id', $user->id);
            
            // If not specifically asking for addons, hide pending addons from primary list
            if (!$request->query('include_addons')) {
                $query->where(function($q) {
                    $q->whereNull('parent_id')
                      ->orWhereIn('status', ['success', 'paid']);
                });
            }
        } elseif (!$user || ($user->role !== 'admin' && !$isMine)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($month && $month !== 'all') {
            $query->whereMonth('check_in_date', $month);
        }
        if ($year && $year !== 'all') {
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
            'check_in_date' => $transaction->check_in_date ? Carbon::parse($transaction->check_in_date)->format('Y-m-d') : null,
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
            if ($validated['booking_type'] === 'RESORT') {
                foreach ($validated['items'] as $item) {
                    if ($item['item_type'] === 'App\\Models\\Resort') {
                        $resort = Resort::findOrFail($item['item_id']);
                        
                        $ci = Carbon::parse($validated['check_in_date']);
                        $co = Carbon::parse($validated['check_out_date']);
                        $nightsNum = max(1, $ci->diffInDays($co));

                        // Peak occupancy check
                        $overlappingTransactions = TransactionItem::where('item_id', $item['item_id'])
                            ->where('item_type', Resort::class)
                            ->whereHas('transaction', function($q) use ($validated) {
                                $q->whereIn('status', ['pending', 'paid', 'success'])
                                  ->where(function($dateFilter) use ($validated) {
                                      $dateFilter->where('check_in_date', '<', $validated['check_out_date'])
                                                 ->where('check_out_date', '>', $validated['check_in_date']);
                                  });
                            })->get();

                        $overlappingReschedules = Reschedule::whereIn('status', ['pending', 'approved_awaiting_payment'])
                            ->where(function ($q) {
                                $q->whereNull('expires_at')
                                  ->orWhere('expires_at', '>', now());
                            })
                            ->where(function ($q) use ($validated) {
                                $q->where('new_date', '<', $validated['check_out_date'])
                                  ->where('new_check_out_date', '>', $validated['check_in_date']);
                            })
                            ->whereHas('transaction.items', function($q) use ($item) {
                                $q->where('item_id', $item['item_id'])->where('item_type', Resort::class);
                            })->with('transaction.items')->get();

                        $maxOccupancy = 0;
                        for ($i = 0; $i < $nightsNum; $i++) {
                            $nightDate = (clone $ci)->addDays($i)->format('Y-m-d');
                            $nextNightDate = (clone $ci)->addDays($i + 1)->format('Y-m-d');

                            $occ = $overlappingTransactions->filter(function($io) use ($nightDate, $nextNightDate) {
                                return $io->transaction->check_in_date < $nextNightDate && $io->transaction->check_out_date > $nightDate;
                            })->sum('quantity');

                            $resOcc = $overlappingReschedules->filter(function($ro) use ($nightDate, $nextNightDate) {
                                $nr_co = $ro->new_check_out_date ?? Carbon::parse($ro->new_date)->addDay()->format('Y-m-d');
                                return $ro->new_date < $nextNightDate && $nr_co > $nightDate;
                            })->sum(function($r) use ($item) {
                                return $r->transaction->items->where('item_id', $item['item_id'])->where('item_type', Resort::class)->sum('quantity');
                            });

                            if (($occ + $resOcc) > $maxOccupancy) $maxOccupancy = $occ + $resOcc;
                        }

                        if (($maxOccupancy + $item['quantity']) > $resort->stock) {
                            return response()->json([
                                'message' => "Slot untuk {$resort->name} sudah penuh atau sedang ditahan untuk perubahan jadwal tamu lain."
                            ], 422);
                        }
                    }
                }
            }

            // RE-ENABLED MIDTRANS FLOW
            $status = 'pending';

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
                'net_total' => $validated['booking_type'] === 'RESORT' ? ($validated['total_price'] - round($validated['total_price'] * (10 / 110))) : $validated['total_price'],
                'tax_total' => $validated['booking_type'] === 'RESORT' ? round($validated['total_price'] * (10 / 110)) : 0,
                'total_qty' => $validated['total_qty'] ?? 1,
                'discount_amount' => $validated['discount_amount'] ?? 0,
                'special_requests' => $validated['special_requests'] ?? null,
                'booker_email' => $validated['booker_email'] ?? $request->user()->email,
                'booker_phone' => $validated['booker_phone'] ?? null,
                'arrival_time' => $validated['arrival_time'] ?? null,
                'additional_facilities' => $validated['additional_facilities'] ?? null,
                'status' => $status
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

            if ($status === 'success') {
                $this->generateTickets($transaction, $validated['items']);
            } else {
                $this->configureMidtrans();
                $params = [
                    'transaction_details' => [
                        'order_id' => $transaction->id,
                        'gross_amount' => (int) $transaction->total_price,
                    ],
                    'customer_details' => [
                        'first_name' => $transaction->booker_name,
                        'email' => $transaction->booker_email,
                        'phone' => $transaction->booker_phone,
                    ],
                ];
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                $transaction->update(['snap_token' => $snapToken]);
            }

            if ($transaction->promo_id) {
                $transaction->promo()->increment('used_count');
            }

            return response()->json($transaction->load(['items', 'tickets']), 201);

            if ($transaction->promo_id) {
                $transaction->promo()->increment('used_count');
            }

            return response()->json($transaction->load(['items', 'tickets']), 201);
        });
    }

    private function configureMidtrans()
    {
        \Midtrans\Config::$serverKey = SystemSetting::where('key', 'midtrans_server_key')->first()?->value ?? '';
        \Midtrans\Config::$isProduction = SystemSetting::where('key', 'midtrans_is_production')->first()?->value === 'true';
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;
    }

    public function show(Request $request, $id)
    {
        $transaction = Transaction::with([
            'user', 
            'items.item', 
            'promo', 
            'reschedules', 
            'addons' => function($query) {
                $query->with(['items' => function($q) {
                    $q->with('item');
                }]);
            }, 
            'tickets'
        ])->findOrFail($id);
        
        $user = $request->user();
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Forcefully ensure addon items are loaded with details
        if ($transaction->addons) {
            foreach ($transaction->addons as $addon) {
                $items = TransactionItem::with('item')->where('transaction_id', $addon->id)->get();
                if ($items->isEmpty() && !empty($addon->additional_facilities)) {
                    $items = collect($addon->additional_facilities)->map(function($f) {
                        $facility = \App\Models\Facility::find($f['item_id'] ?? ($f['id'] ?? null));
                        return (object)[
                            'item' => $facility,
                            'quantity' => $f['quantity'] ?? 1,
                            'price' => $f['price'] ?? ($facility ? $facility->price : 0),
                            'subtotal' => ($f['quantity'] ?? 1) * ($f['price'] ?? ($facility ? $facility->price : 0))
                        ];
                    });
                }
                $addon->setRelation('items', $items);
            }
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

        if (in_array($validated['status'], ['paid', 'success']) && 
            !in_array($oldStatus, ['paid', 'success']) &&
            ($transaction->booking_type === 'TICKET' || $transaction->booking_type === 'EVENT')) {
            
            $itemsData = collect($transaction->items)->map(function($item) {
                return [
                    'item_id' => $item->item_id,
                    'quantity' => $item->quantity,
                    'guest_names' => $item->guest_names ?? []
                ];
            })->toArray();
            
            $this->generateTickets($transaction, $itemsData);
        }

        if ($transaction->promo_id && 
            in_array($oldStatus, ['pending', 'paid', 'success']) && 
            in_array($validated['status'], ['failed', 'cancelled'])) {
            $transaction->promo()->decrement('used_count');
        }

        return response()->json($transaction->load('tickets'));
    }

    public function payToken(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);
        
        $user = $request->user();
        if ($user->role !== 'admin' && $user->id !== $transaction->user_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi tidak dapat dibayar lagi.'], 400);
        }

        if ($transaction->total_price <= 0) {
            return response()->json(['message' => 'Tidak memerlukan pembayaran gateway.', 'snap_token' => null]);
        }

        $this->configureMidtrans();

        // Append unix timestamp to orderId to bypass identical order_id restriction if cart amount changed
        $orderId = $transaction->id . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $transaction->total_price,
            ],
            'customer_details' => [
                'first_name' => collect($transaction->items)->first()?->guest_names[0] ?? $transaction->booker_name,
                'email' => $transaction->booker_email ?? $transaction->user->email,
            ],
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);
        $transaction->update(['snap_token' => $snapToken]);

        return response()->json([
            'message' => 'Token berhasil diambil',
            'snap_token' => $snapToken
        ]);
    }

    public function success($id)
    {
        $transaction = Transaction::findOrFail($id);
        if ($transaction->user_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->update(['status' => 'paid']);

        try {
            $email = $transaction->booker_email ?? $transaction->user->email;
            if ($email) {
                \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\TransactionReceipt($transaction));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed sending receipt ' . $transaction->id . ': ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Status transaksi diperbarui menjadi PAID',
            'transaction' => $transaction
        ]);
    }

    public function generateTickets($transaction, $itemsData)
    {
        if ($transaction->tickets()->count() > 0) return;
        if (!in_array($transaction->booking_type, ['TICKET', 'EVENT'])) return;

        foreach ($transaction->items as $idx => $transItem) {
            $requestItem = collect($itemsData)->where('item_id', $transItem->item_id)->first();
            
            for ($i = 0; $i < $transItem->quantity; $i++) {
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
                    $words = explode(' ', $transItem->item->name);
                    $initials = '';
                    foreach ($words as $w) {
                        if (!empty($w)) $initials .= $w[0];
                    }
                    $prefix .= strtoupper($initials) . '-';
                }

                $transaction->tickets()->create([
                    'transaction_item_id' => $transItem->id,
                    'ticket_id' => $prefix . strtoupper(Str::random(12)),
                    'guest_name' => $guestName,
                    'is_used' => false
                ]);
            }
        }
    }

    public function reschedule(Request $request, $id)
    {
        $transaction = Transaction::with('items.item')->findOrFail($id);

        if ($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Anda tidak memiliki akses ke pesanan ini.'], 403);
        }

        if ($transaction->booking_type !== 'RESORT') {
            return response()->json(['message' => 'Hanya pemesanan resort yang dapat di-reschedule'], 400);
        }

        if ($transaction->reschedule_count > 0 && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Reschedule hanya dapat dilakukan maksimal satu kali per transaksi.'], 400);
        }

        $maxDays = (int) (SystemSetting::where('key', 'max_reschedule_days')->first()?->value ?? 7);
        $minLead = (int) (SystemSetting::where('key', 'min_reschedule_lead_days')->first()?->value ?? 2);
        
        $checkInDate = Carbon::parse($transaction->check_in_date)->startOfDay();
        $now = Carbon::now()->startOfDay();

        if ($now->diffInDays($checkInDate, false) < $maxDays) {
            return response()->json(['message' => "Batas waktu reschedule sudah terlewati. Harus dilakukan minimal {$maxDays} hari sebelum tanggal check-in."], 400);
        }

        $validated = $request->validate([
            'new_check_in_date'  => 'required|date|after:today',
            'new_check_out_date' => 'nullable|date|after:new_check_in_date',
            'reason'             => 'nullable|string',
        ]);

        $newDate = Carbon::parse($validated['new_check_in_date'])->startOfDay();
        if ($now->diffInDays($newDate, false) < $minLead) {
            return response()->json(['message' => "Tanggal baru terlalu dekat. Minimal harus dilakukan {$minLead} hari dari hari ini."], 400);
        }

        $orig_ci = Carbon::parse($transaction->check_in_date);
        $orig_co = Carbon::parse($transaction->check_out_date);
        $origNights = max(1, $orig_ci->diffInDays($orig_co));

        $newCheckOut = $validated['new_check_out_date'] ?? Carbon::parse($newDate)->addDays($origNights)->format('Y-m-d');
        
        foreach ($transaction->items as $item) {
            if ($item->item_type === 'App\Models\Resort') {
                $resort = Resort::findOrFail($item->item_id);
                
                $range_start = Carbon::parse($newDate);
                $range_end = Carbon::parse($newCheckOut);
                $nightsNum = max(1, $range_start->diffInDays($range_end));

                // Peak occupancy check
                $overlappingTransactions = TransactionItem::where('item_id', $item->item_id)
                    ->where('item_type', 'App\Models\Resort')
                    ->whereHas('transaction', function($q) use ($newDate, $newCheckOut) {
                        $q->whereIn('status', ['pending', 'paid', 'success'])
                          ->where(function($dateFilter) use ($newDate, $newCheckOut) {
                              $dateFilter->where('check_in_date', '<', $newCheckOut)
                                         ->where('check_out_date', '>', $newDate);
                          });
                    })->get();

                $overlappingReschedules = Reschedule::whereIn('status', ['pending', 'approved_awaiting_payment'])
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    })
                    ->where(function ($q) use ($newDate, $newCheckOut) {
                        $q->where('new_date', '<', $newCheckOut)
                          ->where('new_check_out_date', '>', $newDate);
                    })
                    ->whereHas('transaction.items', function($q) use ($item) {
                        $q->where('item_id', $item->item_id)->where('item_type', 'App\Models\Resort');
                    })->with('transaction.items')->get();

                $maxOccupancy = 0;
                for ($i = 0; $i < $nightsNum; $i++) {
                    $nightDate = (clone $range_start)->addDays($i)->format('Y-m-d');
                    $nextNightDate = (clone $range_start)->addDays($i+1)->format('Y-m-d');

                    $occ = $overlappingTransactions->filter(function($io) use ($nightDate, $nextNightDate) {
                        return $io->transaction->check_in_date < $nextNightDate && $io->transaction->check_out_date > $nightDate;
                    })->sum('quantity');

                    $resOcc = $overlappingReschedules->filter(function($ro) use ($nightDate, $nextNightDate) {
                        $nr_co = $ro->new_check_out_date ?? Carbon::parse($ro->new_date)->addDay()->format('Y-m-d');
                        return $ro->new_date < $nextNightDate && $nr_co > $nightDate;
                    })->sum(function($r) use ($item) {
                        return $r->transaction->items->where('item_id', $item->item_id)->where('item_type', Resort::class)->sum('quantity');
                    });

                    if (($occ + $resOcc) > $maxOccupancy) $maxOccupancy = $occ + $resOcc;
                }

                if (($maxOccupancy + $item->quantity) > $resort->stock) {
                    return response()->json([
                        'message' => "Maaf, unit {$resort->name} tidak tersedia pada tanggal baru yang Anda pilih."
                    ], 422);
                }
            }
        }

        $adminFee   = (float) (SystemSetting::where('key', 'reschedule_admin_fee')->first()?->value ?? 0);
        $penaltyFee = (float) (SystemSetting::where('key', 'reschedule_penalty')->first()?->value ?? 0);


        $oldCheckIn  = $transaction->check_in_date;
        $oldCheckOut = $transaction->check_out_date;
        $oldNights   = max(1, Carbon::parse($oldCheckIn)->startOfDay()->diffInDays(Carbon::parse($oldCheckOut)->startOfDay()));

        $newCheckIn  = $validated['new_check_in_date'];
        $newCheckOut = $validated['new_check_out_date'] ?? Carbon::parse($newCheckIn)->addDays($oldNights)->format('Y-m-d');
        
        $newNights = max(1, Carbon::parse($newCheckIn)->startOfDay()->diffInDays(Carbon::parse($newCheckOut)->startOfDay()));

        $resortItem = $transaction->items->where('item_type', Resort::class)->first();
        $resort = Resort::find($resortItem?->item_id);
        
        $priceWeekday = (float) ($resort?->price ?? $resortItem?->price ?? 0);
        $priceWeekend = (float) ($resort?->price_weekend ?? $priceWeekday);
        $qty = (int) ($resortItem?->quantity ?? 1);

        $calculateTotal = function($checkIn, $checkOut) use ($priceWeekday, $priceWeekend, $qty) {
            $start = Carbon::parse($checkIn);
            $end = Carbon::parse($checkOut);
            $nights = max(1, $start->diffInDays($end));
            $total = 0;
            for ($i = 0; $i < $nights; $i++) {
                $day = (clone $start)->addDays($i)->dayOfWeek;
                $isWeekend = ($day === 6 || $day === 0);
                $total += ($isWeekend && $priceWeekend > 0) ? $priceWeekend : $priceWeekday;
            }
            return $total * $qty;
        };

        $oldTotal = $calculateTotal($oldCheckIn, $oldCheckOut);
        $newTotal = $calculateTotal($newCheckIn, $newCheckOut);

        $priceDiff  = max(0, $newTotal - $oldTotal);
        $finalCharge = $priceDiff + $adminFee + $penaltyFee;

        return DB::transaction(function () use ($transaction, $validated, $oldCheckIn, $newCheckOut, $priceDiff, $adminFee, $penaltyFee, $finalCharge, $oldTotal, $newTotal) {
            $reschedule = $transaction->reschedules()->create([
                'old_date'           => $oldCheckIn,
                'new_date'           => $validated['new_check_in_date'],
                'new_check_out_date' => $newCheckOut,
                'reason'             => $validated['reason'] ?? null,
                'status'             => 'pending',
                'price_diff'         => $priceDiff,
                'admin_fee'          => $adminFee,
                'penalty_fee'        => $penaltyFee,
                'final_charge'       => $finalCharge,
            ]);

            $transaction->increment('reschedule_count');

            return response()->json([
                'message'      => 'Permintaan reschedule telah diajukan.',
                'cost_breakdown' => [
                    'old_total'    => $oldTotal,
                    'new_total'    => $newTotal,
                    'price_diff'   => $priceDiff,
                    'admin_fee'    => $adminFee,
                    'penalty_fee'  => $penaltyFee,
                    'final_charge' => $finalCharge,
                ],
                'reschedule' => $reschedule,
            ], 200);
        });
    }

    public function checkInTicket(Request $request, $ticketUid)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Hanya admin yang dapat melakukan check-in'], 403);
        }

        $ticket = TransactionTicket::where('ticket_id', $ticketUid)->firstOrFail();
        
        if (!in_array($ticket->transaction->status, ['paid', 'success'])) {
            return response()->json(['message' => 'Transaksi belum lunas'], 422);
        }

        $newStatus = !$ticket->is_used;
        $ticket->update([
            'is_used' => $newStatus,
            'used_at' => $newStatus ? now() : null
        ]);

        $ticket->load(['transaction', 'transactionItem.item']);

        return response()->json([
            'message' => 'Tiket Berhasil ' . ($ticket->is_used ? 'Divalidasi' : 'Dibatalkan Validasi'),
            'is_used' => $ticket->is_used,
            'guest_name' => $ticket->guest_name,
            'ticket_id' => $ticket->ticket_id,
            'item_name' => $ticket->transactionItem?->item?->name ?? 'Tiket Wisata',
            'booker_name' => $ticket->transaction?->booker_name,
            'check_in_date' => $ticket->transaction?->check_in_date ? Carbon::parse($ticket->transaction->check_in_date)->format('d M Y') : null,
            'status' => 'Valid'
        ]);
    }

    public function checkIn($id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->booking_type !== 'RESORT') {
            return response()->json(['message' => 'Hanya reservasi resort yang dapat melakukan check-in'], 400);
        }

        // Guard: only allow check-in if payment is confirmed
        if (!in_array($transaction->status, ['paid', 'success'])) {
            return response()->json(['message' => 'Tamu harus melunasi pembayaran sebelum dapat melakukan check-in.'], 400);
        }

        if ($transaction->stay_status === 'checked_in') {
            return response()->json(['message' => 'Tamu sudah dalam kondisi check-in.'], 400);
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

    public function getAddonFacilities()
    {
        return response()->json(\App\Models\Facility::where('is_addon', true)->where('is_active', true)->get());
    }

    public function storeAddon(Request $request, $id)
    {
        $rootParent = Transaction::findOrFail($id);
        $user = Auth::user();

        // Security: Only the owner or an admin can add addons
        if ($rootParent->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Rule: Cannot add addons after checkout
        if ($rootParent->stay_status === 'checked_out') {
            return response()->json(['message' => 'Tidak dapat menambah fasilitas setelah tamu melakukan check-out.'], 403);
        }

        $validated = $request->validate([
            'items'            => 'required|array|min:1',
            'items.*.item_id'  => 'required|exists:facilities,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method'   => 'nullable|in:Manual/Transfer,Cash,QRIS,automated,Manual/Admin,Midtrans,Midtrans/Automated',
        ]);

        return DB::transaction(function() use ($validated, $rootParent, $user) {
            // Check for existing pending addon session for this parent
            $addonOrder = Transaction::where('parent_id', $rootParent->id)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->first();
            
            // Always start as pending so the user can pay via Midtrans from their profile
            $status = 'pending';

            if (!$addonOrder) {
                $addonOrder = Transaction::create([
                    'id'             => 'ADD-' . strtoupper(Str::random(8)),
                    'parent_id'      => $rootParent->id,
                    'user_id'        => $rootParent->user_id,
                    'booker_name'    => $rootParent->booker_name,
                    'booker_email'   => $rootParent->booker_email,
                    'booker_phone'   => $rootParent->booker_phone,
                    'booking_type'   => 'RESORT',
                    'status'         => $status,
                    'check_in_date'  => $rootParent->check_in_date,
                    'payment_method' => $validated['payment_method'] ?? 'Midtrans',
                    'total_price'    => 0,
                    'net_total'      => 0,
                    'tax_total'      => 0,
                ]);
            }

            $addonOrder->load('items');
            $currentItems = $addonOrder->items;

            foreach ($validated['items'] as $itemData) {
                $facility = \App\Models\Facility::findOrFail($itemData['item_id']);
                $existingItem = $currentItems->where('item_id', $facility->id)->first();
                
                if ($existingItem) {
                    $newQty = $existingItem->quantity + $itemData['quantity'];
                    $existingItem->update([
                        'quantity' => $newQty,
                        'subtotal' => $facility->price * $newQty
                    ]);
                } else {
                    $addonOrder->items()->create([
                        'item_id' => $facility->id,
                        'item_type' => \App\Models\Facility::class,
                        'quantity' => $itemData['quantity'],
                        'price' => $facility->price,
                        'subtotal' => $facility->price * $itemData['quantity'],
                    ]);
                }
            }

            $total = (float)$addonOrder->items()->sum('subtotal');
            $addonOrder->update([
                'total_price' => $total,
                'net_total'   => $total, // Addons are net for now or simple
                'tax_total'   => 0
            ]);

            // GENERATE SNAP TOKEN FOR ADDON SO GUEST CAN PAY
            if ($addonOrder->payment_method === 'Midtrans' || $addonOrder->payment_method === 'automated' || $addonOrder->payment_method === 'Midtrans/Automated') {
                try {
                    $this->configureMidtrans();
                    $params = [
                        'transaction_details' => [
                            'order_id' => $addonOrder->id,
                            'gross_amount' => (int) $addonOrder->total_price,
                        ],
                        'customer_details' => [
                            'first_name' => $addonOrder->booker_name,
                            'email' => $addonOrder->booker_email,
                            'phone' => $addonOrder->booker_phone,
                        ],
                    ];
                    $snapToken = \Midtrans\Snap::getSnapToken($params);
                    $addonOrder->update(['snap_token' => $snapToken]);
                } catch (\Exception $e) {
                    \Log::error("Midtrans Addon Error: " . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Pesanan tambahan berhasil diproses.',
                'transaction' => $addonOrder->load('items')
            ]);
        });
    }
}
