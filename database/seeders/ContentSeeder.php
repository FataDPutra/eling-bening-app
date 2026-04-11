<?php

namespace Database\Seeders;

use App\Models\Content;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // Home Hero
            [
                'key' => 'home_hero_badge',
                'content' => 'WISATA ALAM & RESORT',
                'type' => 'text',
                'page' => 'home'
            ],
            [
                'key' => 'home_hero_title_1',
                'content' => 'Nikmati Keindahan Alam',
                'type' => 'text',
                'page' => 'home'
            ],
            [
                'key' => 'home_hero_title_2',
                'content' => 'Terbaik di Ambarawa',
                'type' => 'text',
                'page' => 'home'
            ],
            [
                'key' => 'home_hero_subtitle',
                'content' => 'Eling Bening menawarkan pemandangan Rawa Pening yang menakjubkan dengan fasilitas resort mewah, kolam renang, dan restoran berkualitas untuk liburan keluarga Anda.',
                'type' => 'text',
                'page' => 'home'
            ],
            [
                'key' => 'home_cta_primary',
                'content' => 'Pesan Tiket',
                'type' => 'text',
                'page' => 'home'
            ],
            [
                'key' => 'home_cta_secondary',
                'content' => 'Pesan Resort',
                'type' => 'text',
                'page' => 'home'
            ],

            // About Page
            [
                'key' => 'about_hero_title',
                'content' => 'Tentang Eling Bening',
                'type' => 'text',
                'page' => 'about'
            ],
            [
                'key' => 'about_hero_desc',
                'content' => 'Destinasi wisata terpadu yang menggabungkan keindahan pemandangan Rawa Pening dengan fasilitas modern.',
                'type' => 'text',
                'page' => 'about'
            ],
            [
                'key' => 'about_story_title',
                'content' => 'Sejarah & Visi Kami',
                'type' => 'text',
                'page' => 'about'
            ],
            [
                'key' => 'about_story_p1',
                'content' => 'Berawal dari kecintaan akan keindahan alam Ambarawa, Eling Pening dibangun untuk menjadi ikon wisata Jawa Tengah yang ramah keluarga.',
                'type' => 'text',
                'page' => 'about'
            ],
            [
                'key' => 'about_story_p2',
                'content' => 'Kami terus berkomitmen memberikan pelayanan terbaik dan menjaga kelestarian alam sekitar untuk dinikmati generasi mendatang.',
                'type' => 'text',
                'page' => 'about'
            ],

            // Contact
            [
                'key' => 'contact_title',
                'content' => 'Hubungi Kami',
                'type' => 'text',
                'page' => 'contact'
            ],
            [
                'key' => 'contact_subtitle',
                'content' => 'Tim kami siap membantu kebutuhan informasi dan reservasi Anda.',
                'type' => 'text',
                'page' => 'contact'
            ],
            [
                'key' => 'contact_email',
                'content' => 'info@elingbening.com',
                'type' => 'text',
                'page' => 'contact'
            ],
            [
                'key' => 'contact_phone',
                'content' => '+62 812 3456 7890',
                'type' => 'text',
                'page' => 'contact'
            ],
            [
                'key' => 'contact_address',
                'content' => 'Jl. Sarjono, Ambarawa, Jawa Tengah, Indonesia',
                'type' => 'text',
                'page' => 'contact'
            ],

            // Facilities (Complex JSON data)
            [
                'key' => 'global_facilities',
                'content' => null,
                'data' => [
                    ['id' => 1, 'name' => 'Kolam Renang Infinity', 'desc' => 'Kolam renang dengan pemandangan pegunungan yang menakjubkan.', 'icon' => 'Waves', 'image' => '/images/hero-bg.png'],
                    ['id' => 2, 'name' => 'Restoran & Cafe', 'desc' => 'Hidangan lezat dengan bahan lokal segar dan suasana nyaman.', 'icon' => 'Utensils', 'image' => '/images/hero-bg.png'],
                    ['id' => 3, 'name' => 'Entertainment & Musik', 'desc' => 'Live music dan hiburan setiap akhir pekan untuk keceriaan Anda.', 'icon' => 'Music', 'image' => '/images/hero-bg.png'],
                    ['id' => 4, 'name' => 'Spot Foto Skydeck', 'desc' => 'Sudut terbaik untuk mengabadikan momen dengan latar Rawa Pening.', 'icon' => 'Camera', 'image' => '/images/hero-bg.png'],
                    ['id' => 5, 'name' => 'Fasilitas Umum & Toilet', 'desc' => 'Area bersih dan nyaman yang tersebar di seluruh lokasi wisata.', 'icon' => 'Toilet', 'image' => '/images/hero-bg.png']
                ],
                'type' => 'json',
                'page' => 'facilities'
            ],
            [
                'key' => 'global_map_image',
                'content' => '/images/hero-bg.png',
                'type' => 'image',
                'page' => 'facilities'
            ],
        ];

        foreach ($contents as $content) {
            Content::updateOrCreate(['key' => $content['key']], $content);
        }
    }
}
