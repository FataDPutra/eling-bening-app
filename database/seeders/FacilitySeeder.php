<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            // Fasilitas Kamar (Fixed)
            ['name' => 'AC Premium', 'icon' => 'Wind', 'is_addon' => false],
            ['name' => 'Smart TV 55"', 'icon' => 'Monitor', 'is_addon' => false],
            ['name' => 'Private Pool', 'icon' => 'Waves', 'is_addon' => false],
            ['name' => 'Wifi Kencang', 'icon' => 'Wifi', 'is_addon' => false],
            ['name' => 'Hot Shower', 'icon' => 'ShowerHead', 'is_addon' => false],
            ['name' => 'Kamar Mandi Dalam', 'icon' => 'Bath', 'is_addon' => false],
            ['name' => 'Breakfast 2 Pax', 'icon' => 'Coffee', 'is_addon' => false],
            ['name' => 'Breakfast 4 Pax', 'icon' => 'Coffee', 'is_addon' => false],
            ['name' => 'Breakfast 6 Pax', 'icon' => 'Coffee', 'is_addon' => false],
            ['name' => 'Living Room', 'icon' => 'LayoutGrid', 'is_addon' => false],
            ['name' => 'Dapur Lengkap', 'icon' => 'Utensils', 'is_addon' => false],
            ['name' => 'Mini Bar', 'icon' => 'Wine', 'is_addon' => false],
            ['name' => 'Akses All-Area', 'icon' => 'MapPin', 'is_addon' => false],
            ['name' => 'Api Unggun', 'icon' => 'Flame', 'is_addon' => false],

            // Fasilitas Add-on (Bisa Dipesan)
            ['name' => 'Tambah Extra Bed', 'icon' => 'Bed', 'is_addon' => true, 'price' => 150000],
            ['name' => 'Floating Breakfast', 'icon' => 'Coffee', 'is_addon' => true, 'price' => 100000],
            ['name' => 'Romantic Dinner Decor', 'icon' => 'Heart', 'is_addon' => true, 'price' => 500000],
            ['name' => 'Late Check-out (2 Jam)', 'icon' => 'Clock', 'is_addon' => true, 'price' => 200000],
        ];

        foreach ($facilities as $facility) {
            Facility::updateOrCreate(
                ['name' => $facility['name']],
                array_merge($facility, ['is_active' => true])
            );
        }
    }
}
