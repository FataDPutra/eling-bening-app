<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'max_reschedule_days',
                'value' => '7',
                'description' => 'Batas minimal hari sebelum check-in untuk melakukan reschedule.'
            ],
            [
                'key' => 'admin_email',
                'value' => 'cs@elingbeningapp.com',
                'description' => 'Email admin untuk notifikasi transaksi.'
            ],
            [
                'key' => 'app_name',
                'value' => 'Eling Bening Resort',
                'description' => 'Nama aplikasi publik.'
            ],
            [
                'key' => 'google_analytics_id',
                'value' => '',
                'description' => 'Measurement ID untuk Google Analytics 4 (GA4).'
            ]
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
