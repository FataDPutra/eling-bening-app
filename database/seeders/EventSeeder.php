<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'name' => 'Live Music Weekend',
                'description' => 'Nikmati senja dengan alunan musik akustik terbaik dari band lokal pilihan. Setiap Sabtu & Minggu di area restoran utama.',
                'category' => 'Entertainment',
                'date_info' => 'Setiap Sabtu & Minggu, 16:00 WIB',
                'event_date' => now()->addDays(2),
                'price' => 0,
                'is_ticketed' => false,
                'images' => ['/images/generated/event.png'],
                'is_active' => true,
            ],
            [
                'name' => 'Yoga in the Clouds',
                'description' => 'Sesi yoga pagi yang menyegarkan jiwa dengan latar belakang kabut Rawa Pening. Sempurna untuk kesehatan raga dan pikiran.',
                'category' => 'Wellness',
                'date_info' => 'Minggu, 06:00 WIB',
                'event_date' => now()->addDays(4),
                'price' => 75000,
                'is_ticketed' => true,
                'ticket_quota' => 50,
                'images' => ['/images/generated/hero.png'],
                'is_active' => true,
            ],
            [
                'name' => 'Ambarawa Heritage Gathering',
                'description' => 'Acara pertemuan tahunan komunitas pecinta sejarah Ambarawa. Sharing session mengenai peninggalan budaya di Kabupaten Semarang.',
                'category' => 'Community',
                'date_info' => '15 April 2026',
                'event_date' => '2026-04-15',
                'price' => 0,
                'is_ticketed' => false,
                'images' => ['/images/generated/resort.png'],
                'is_active' => true,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
