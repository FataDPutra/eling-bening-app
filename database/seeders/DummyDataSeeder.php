<?php

namespace Database\Seeders;

use App\Models\Resort;
use App\Models\Ticket;
use App\Models\Promo;
use App\Models\Expense;
use Illuminate\Database\Seeder;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        Resort::create([
            'name' => 'Villa Merbabu',
            'description' => 'Villa mewah dengan pemandangan langsung Gunung Merbabu.',
            'facilities' => [
                ['name' => 'AC Premium', 'icon' => 'Wind'],
                ['name' => 'Smart TV 55"', 'icon' => 'Monitor'],
                ['name' => 'Private Pool', 'icon' => 'Waves'],
                ['name' => 'Teras Santai', 'icon' => 'Trees'],
                ['name' => 'Wifi Kencang', 'icon' => 'Wifi'],
                ['name' => 'Breakfast 4 Pax', 'icon' => 'Coffee']
            ],
            'price' => 1500000,
            'price_weekend' => 1800000,
            'stock' => 5,
            'capacity' => 4,
            'bed_type' => '2 King Bed',
            'room_size' => '45',
            'gallery' => []
        ]);

        Resort::create([
            'name' => 'Glamping Rawa Pening',
            'description' => 'Pengalaman glamping unik di pinggir bukit dengan udara sejuk.',
            'facilities' => [
                ['name' => 'AC', 'icon' => 'Wind'],
                ['name' => 'Kamar Mandi Dalam', 'icon' => 'Bath'],
                ['name' => 'Api Unggun', 'icon' => 'Flame'],
                ['name' => 'Breakfast 2 Pax', 'icon' => 'Coffee'],
                ['name' => 'Mini Bar', 'icon' => 'Wine']
            ],
            'price' => 800000,
            'price_weekend' => 1000000,
            'stock' => 10,
            'capacity' => 2,
            'bed_type' => '1 Queen Bed',
            'room_size' => '20',
            'gallery' => []
        ]);
        
        Resort::create([
            'name' => 'Family Suite Ungaran',
            'description' => 'Ruang luas untuk rombongan keluarga besar dengan fasilitas lengkap.',
            'facilities' => [
                ['name' => 'AC Central', 'icon' => 'Wind'],
                ['name' => 'Smart TV & Sound', 'icon' => 'Tv'],
                ['name' => 'Dapur Lengkap', 'icon' => 'Utensils'],
                ['name' => 'Living Room', 'icon' => 'LayoutGrid'],
                ['name' => 'Breakfast 6 Pax', 'icon' => 'Coffee'],
                ['name' => 'Akses All-Area', 'icon' => 'MapPin']
            ],
            'price' => 2500000,
            'price_weekend' => 3000000,
            'stock' => 2,
            'capacity' => 6,
            'bed_type' => '3 King Bed',
            'room_size' => '80',
            'gallery' => []
        ]);

        Resort::create([
            'name' => 'Superior Room',
            'description' => 'Kamar superior dengan fasilitas standar yang nyaman untuk pasangan atau perjalanan dinas.',
            'facilities' => [
                ['name' => 'AC', 'icon' => 'Wind'],
                ['name' => 'TV', 'icon' => 'Tv'],
                ['name' => 'Hot Shower', 'icon' => 'ShowerHead'],
                ['name' => 'Breakfast 2 Pax', 'icon' => 'Coffee']
            ],
            'price' => 500000,
            'price_weekend' => 650000,
            'stock' => 8,
            'capacity' => 2,
            'bed_type' => '1 Double Bed',
            'room_size' => '18',
            'gallery' => []
        ]);

        Ticket::create([
            'id' => 'EB-TICK-101',
            'name' => 'Tiket Masuk Reguler',
            'description' => 'Akses seluruh area wisata Eling Bening dan spot foto.',
            'validity_day' => 'weekday',
            'price' => 30000,
            'is_active' => true,
        ]);

        Ticket::create([
            'id' => 'EB-TICK-102',
            'name' => 'Tiket Masuk Weekend',
            'description' => 'Akses seluruh area wisata Eling Bening, spot foto, dan kolam renang weekend.',
            'validity_day' => 'weekend',
            'price' => 35000,
            'is_active' => true,
        ]);

        Ticket::create([
            'id' => 'EB-TICK-VIP',
            'name' => 'Tiket VIP Terusan',
            'description' => 'Akses jalur VIP, kolam renang infinity, free 1 soft drink.',
            'validity_day' => 'all_days',
            'price' => 75000,
            'is_active' => true,
        ]);

        Promo::create([
            'promo_code' => 'KEMERDEKAAN',
            'name' => 'Promo Kemerdekaan 17 Agustus',
            'discount_type' => 'percentage',
            'discount_value' => 17,
            'min_purchase' => 100000,
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->addMonths(2),
            'is_active' => true,
        ]);

        Promo::create([
            'promo_code' => 'EBHEMAT50',
            'name' => 'Potongan 50 Ribu',
            'discount_type' => 'nominal',
            'discount_value' => 50000,
            'min_purchase' => 500000,
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->addMonths(5),
            'is_active' => true,
        ]);

        Expense::create([
            'name' => 'Gaji Karyawan Bulan Ini',
            'notes' => 'Pembayaran gaji reguler',
            'category' => 'gaji_karyawan',
            'amount' => 45000000,
            'transaction_date' => now()->subDays(5)
        ]);

        Expense::create([
            'name' => 'Maintenance Kolam',
            'notes' => 'Kuras kolam bulanan dan beli bahan',
            'category' => 'pemeliharaan',
            'amount' => 3500000,
            'transaction_date' => now()->subDays(2)
        ]);
        
        Expense::create([
            'name' => 'Ads Instagram',
            'notes' => 'Boost post kampanye akhir tahun',
            'category' => 'pemasaran',
            'amount' => 5000000,
            'transaction_date' => now()->subDays(10)
        ]);
    }
}
