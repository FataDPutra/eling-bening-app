<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Resort;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatController extends Controller
{
    public function getStats(Request $request)
    {
        $isAllTime = $request->get('month') === 'all';
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));
        
        $selectedDate = Carbon::create($year, $isAllTime ? 1 : $month, 1);
        $startOfPeriod = $isAllTime ? Carbon::create(2023, 1, 1) : $selectedDate->copy()->startOfMonth();
        $endOfPeriod = $isAllTime ? Carbon::now() : $selectedDate->copy()->endOfMonth();
        
        $lastMonth = $selectedDate->copy()->subMonth();
        $startOfLastMonth = $lastMonth->copy()->startOfMonth();
        $endOfLastMonth = $lastMonth->copy()->endOfMonth();

        // 1. Basic Stats (For selected period)
        $revenueQuery = Transaction::whereIn('status', ['paid', 'success']);
        if (!$isAllTime) {
            $revenueQuery->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]);
        }
        $revenue = $revenueQuery->sum('total_price');

        $lastMonthRevenue = Transaction::whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_price');

        $revenueTrend = $lastMonthRevenue > 0 
            ? (($revenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : ($revenue > 0 ? 100 : 0);

        $ticketSoldQuery = Transaction::where('booking_type', 'TICKET')->whereIn('status', ['paid', 'success']);
        if (!$isAllTime) {
            $ticketSoldQuery->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]);
        }
        $ticketSold = $ticketSoldQuery->sum('total_qty');

        $resortBookingsQuery = Transaction::where('booking_type', 'RESORT')->whereIn('status', ['paid', 'success']);
        if (!$isAllTime) {
            $resortBookingsQuery->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]);
        }
        $resortBookings = $resortBookingsQuery->count();

        // 2. Occupancy Rate (Average across the selected period)
        $totalStock = Resort::sum('stock');
        $daysInPeriod = $isAllTime ? Carbon::now()->diffInDays(Carbon::create(2023, 1, 1)) : $selectedDate->daysInMonth;
        
        $occupancyQuery = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.booking_type', 'RESORT')
            ->whereIn('transactions.status', ['paid', 'success']);
        
        if (!$isAllTime) {
            $occupancyQuery->where(function($query) use ($startOfPeriod, $endOfPeriod) {
                $query->whereBetween('transactions.check_in_date', [$startOfPeriod->toDateString(), $endOfPeriod->toDateString()])
                      ->orWhereBetween('transactions.check_out_date', [$startOfPeriod->toDateString(), $endOfPeriod->toDateString()]);
            });
        }
        $occupiedDaysAcrossPeriod = $occupancyQuery->sum('transaction_items.quantity');

        $potentialCapacity = $totalStock * $daysInPeriod;
        $occupancyRate = $potentialCapacity > 0 ? ($occupiedDaysAcrossPeriod / $potentialCapacity) * 100 : 0;

        // 3. Daily Tickets
        $dailyTicketsQuery = DB::table('transactions')
            ->where('booking_type', 'TICKET')
            ->whereIn('status', ['paid', 'success']);
        
        if (!$isAllTime) {
            $dailyTicketsQuery->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]);
        } else {
             // In all time, maybe show month-wise instead of day-wise?
             // But for now, let's just show top active dates or similar
             $dailyTicketsQuery->limit(30);
        }

        $dailyTickets = $dailyTicketsQuery->select(DB::raw('DATE_FORMAT(created_at, "%d") as day'), DB::raw('SUM(total_qty) as val'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // 4. Booking Types (Market Share for selected period)
        $totalTransactionsQuery = Transaction::whereIn('status', ['paid', 'success']);
        if (!$isAllTime) {
            $totalTransactionsQuery->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]);
        }
        $totalTransactions = $totalTransactionsQuery->count();

        $typeShare = [
            'ticket' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'TICKET')->whereIn('status', ['paid', 'success'])->where(fn($q) => $isAllTime ? $q : $q->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]))->count() / $totalTransactions) * 100 : 0,
            'resort' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'RESORT')->whereIn('status', ['paid', 'success'])->where(fn($q) => $isAllTime ? $q : $q->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]))->count() / $totalTransactions) * 100 : 0,
            'event' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'EVENT')->whereIn('status', ['paid', 'success'])->where(fn($q) => $isAllTime ? $q : $q->whereBetween('created_at', [$startOfPeriod, $endOfPeriod]))->count() / $totalTransactions) * 100 : 0,
        ];

        return response()->json([
            'stats' => [
                'revenue' => [
                    'value' => $revenue,
                    'trend' => $revenueTrend >= 0 ? 'up' : 'down',
                    'sub' => number_format($revenueTrend, 1) . '%'
                ],
                'tickets' => [
                    'value' => number_format($ticketSold, 0, ',', '.'),
                    'trend' => 'up',
                    'sub' => 'Selected Period'
                ],
                'reservations' => [
                    'value' => $resortBookings,
                    'trend' => 'up', 
                    'sub' => 'Selected Period'
                ],
                'occupancy' => [
                    'value' => round($occupancyRate) . '%',
                    'trend' => 'up',
                    'sub' => 'Avg Rate'
                ]
            ],
            'daily_tickets' => $dailyTickets,
            'booking_types' => [
                ['label' => 'Tiket Wisata', 'val' => round($typeShare['ticket']), 'color' => '#C62828'],
                ['label' => 'Resort Booking', 'val' => round($typeShare['resort']), 'color' => '#2E7D32'],
                ['label' => 'Event / Konser', 'val' => round($typeShare['event']), 'color' => '#0284c7']
            ]
        ]);
    }
}
