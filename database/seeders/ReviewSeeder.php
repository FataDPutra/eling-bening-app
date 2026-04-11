<?php
namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.s@example.com',
                'rating' => 5,
                'comment' => 'Pemandangannya luar biasa indah! Pelayanan sangat ramah dan kolam renangnya juara. Sangat cocok untuk liburan keluarga.',
                'image' => null,
                'is_visible' => true,
                'created_at' => now()->subDays(10),
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti.a@example.com',
                'rating' => 4,
                'comment' => 'Tempatnya estetik banget buat foto-foto. Makanannya juga enak, walaupun pas weekend agak ramai.',
                'image' => null,
                'is_visible' => true,
                'created_at' => now()->subDays(5),
            ],
            [
                'name' => 'Andi Wijaya',
                'email' => 'andi.w@example.com',
                'rating' => 5,
                'comment' => 'Resort-nya nyaman dan bersih. Pagi-pagi bisa lihat kabut di atas Rawa Pening. Pengalaman yang tak terlupakan!',
                'image' => null,
                'is_visible' => true,
                'created_at' => now()->subDays(2),
            ]
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}
