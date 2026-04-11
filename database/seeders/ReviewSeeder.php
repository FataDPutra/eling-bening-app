<?php
namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil satu user dan satu transaksi untuk contoh
        $user = \App\Models\User::where('role', 'customer')->first() ?? \App\Models\User::first();
        $transaction = \App\Models\Transaction::first();

        // Jika tidak ada data transaksi, jangan seed review dulu karena akan error Foreign Key
        if (!$user || !$transaction) {
            return;
        }

        $reviews = [
            [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'rating' => 5,
                'comment' => 'Pemandangannya luar biasa indah! Pelayanan sangat ramah dan kolam renangnya juara. Sangat cocok untuk liburan keluarga.',
                'is_visible' => true,
                'created_at' => now()->subDays(10),
            ],
            [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'rating' => 4,
                'comment' => 'Tempatnya estetik banget buat foto-foto. Makanannya juga enak, walaupun pas weekend agak ramai.',
                'is_visible' => true,
                'created_at' => now()->subDays(5),
            ]
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}
