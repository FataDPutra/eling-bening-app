<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('role', 'user')->first() ?? User::factory()->create(['role' => 'user']);
        $ticketResort = Ticket::first();
        $eventTicket = Event::where('is_ticketed', true)->first();

        // 1. Contoh Pesanan Tiket Wisata (Sudah Bayar & Sudah Scan Sebagian)
        if ($ticketResort) {
            $txId = 'EB-TICK-' . date('Ymd') . '-001';
            $transaction = Transaction::create([
                'id' => $txId,
                'user_id' => $user->id,
                'booking_type' => 'TICKET',
                'booker_name' => 'Fata Dwi Putra',
                'booker_email' => 'fata@example.com',
                'check_in_date' => now(),
                'payment_method' => 'QRIS',
                'total_price' => $ticketResort->price * 2,
                'total_qty' => 2,
                'status' => 'success'
            ]);

            $item = $transaction->items()->create([
                'item_id' => $ticketResort->id,
                'item_type' => Ticket::class,
                'quantity' => 2,
                'price' => $ticketResort->price,
                'subtotal' => $ticketResort->price * 2
            ]);

            // Buat Tiket Individual (Format Baru dengan Singkatan Nama Tiket)
            $words = explode(' ', $ticketResort->name);
            $initials = ''; foreach ($words as $w) { if(!empty($w)) $initials .= $w[0]; }
            $prefix = 'EB-TICK-' . strtoupper($initials) . '-';

            // Tiket 1 (Sudah di Scan)
            $transaction->tickets()->create([
                'transaction_item_id' => $item->id,
                'ticket_id' => $prefix . strtoupper(Str::random(12)),
                'guest_name' => 'Fata Dwi Putra',
                'is_used' => true
            ]);
            // Tiket 2 (Belum di Scan)
            $transaction->tickets()->create([
                'transaction_item_id' => $item->id,
                'ticket_id' => $prefix . strtoupper(Str::random(12)),
                'guest_name' => 'Rina Ambarawa',
                'is_used' => false
            ]);
        }

        // 2. Contoh Pesanan Event (Status Pending)
        if ($eventTicket) {
            $txIdEv = 'EB-EVT-' . date('Ymd') . '-002';
            $transactionEv = Transaction::create([
                'id' => $txIdEv,
                'user_id' => $user->id,
                'booking_type' => 'EVENT',
                'booker_name' => 'Dwi Ahmad',
                'booker_email' => 'dwi@example.com',
                'check_in_date' => $eventTicket->event_date,
                'payment_method' => 'VA Mandiri',
                'total_price' => $eventTicket->price * 3,
                'total_qty' => 3,
                'status' => 'pending'
            ]);

            $transactionEv->items()->create([
                'item_id' => $eventTicket->id,
                'item_type' => Event::class,
                'quantity' => 3,
                'price' => $eventTicket->price,
                'subtotal' => $eventTicket->price * 3
            ]);
            
            // Tiket event belum dibuat karena status masih pending
        }
    }
}
