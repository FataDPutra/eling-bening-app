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
        $month = $request->get('month', date('m'));
        $year = $request->get('year', date('Y'));
        
        $selectedDate = Carbon::create($year, $month, 1);
        $startOfPeriod = $selectedDate->copy()->startOfMonth();
        $endOfPeriod = $selectedDate->copy()->endOfMonth();
        
        $lastMonth = $selectedDate->copy()->subMonth();
        $startOfLastMonth = $lastMonth->copy()->startOfMonth();
        $endOfLastMonth = $lastMonth->copy()->endOfMonth();

        // 1. Basic Stats (For selected period)
        $revenue = Transaction::whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])
            ->sum('total_price');

        $lastMonthRevenue = Transaction::whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_price');

        $revenueTrend = $lastMonthRevenue > 0 
            ? (($revenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 
            : ($revenue > 0 ? 100 : 0);

        $ticketSold = Transaction::where('booking_type', 'TICKET')
            ->whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])
            ->sum('total_qty');

        $resortBookings = Transaction::where('booking_type', 'RESORT')
            ->whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])
            ->count();

        // 2. Occupancy Rate (Average across the selected month)
        $totalStock = Resort::sum('stock');
        $daysInMonth = $selectedDate->daysInMonth;
        
        $occupiedDaysAcrossMonth = DB::table('transaction_items')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.booking_type', 'RESORT')
            ->whereIn('transactions.status', ['paid', 'success'])
            ->where(function($query) use ($startOfPeriod, $endOfPeriod) {
                $query->whereBetween('transactions.check_in_date', [$startOfPeriod->toDateString(), $endOfPeriod->toDateString()])
                      ->orWhereBetween('transactions.check_out_date', [$startOfPeriod->toDateString(), $endOfPeriod->toDateString()]);
            })
            ->sum('transaction_items.quantity');

        // Simple occupancy representation (Occupied items across total possible unit-nights)
        $potentialCapacity = $totalStock * $daysInMonth;
        $occupancyRate = $potentialCapacity > 0 ? ($occupiedDaysAcrossMonth / $potentialCapacity) * 100 : 0;

        // 3. Daily Tickets (Last 30 days of the selected period if current, or full month if past)
        $dailyTickets = DB::table('transactions')
            ->where('booking_type', 'TICKET')
            ->whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])
            ->select(DB::raw('DATE_FORMAT(created_at, "%d") as day'), DB::raw('SUM(total_qty) as val'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // 4. Booking Types (Market Share for selected period)
        $totalTransactions = Transaction::whereIn('status', ['paid', 'success'])
            ->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])
            ->count();

        $typeShare = [
            'ticket' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'TICKET')->whereIn('status', ['paid', 'success'])->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])->count() / $totalTransactions) * 100 : 0,
            'resort' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'RESORT')->whereIn('status', ['paid', 'success'])->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])->count() / $totalTransactions) * 100 : 0,
            'event' => $totalTransactions > 0 ? (Transaction::where('booking_type', 'EVENT')->whereIn('status', ['paid', 'success'])->whereBetween('created_at', [$startOfPeriod, $endOfPeriod])->count() / $totalTransactions) * 100 : 0,
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
