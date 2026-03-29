# 🏔️ Eling Bening - Integrated Resort & Tourism Management System

Sistem manajemen terpadu untuk destinasi wisata **Eling Bening**, mencakup reservasi resort mewah, manajemen tiket wisata, audit keuangan, dan pangkalan data tamu yang diproses secara real-time.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan server Anda memenuhi spesifikasi berikut:
- **PHP** >= 8.2
- **Node.js** >= 20.x & **NPM**
- **Composer** (PHP Dependency Manager)
- **Database**: MySQL 8.0+ atau PostgreSQL 15+
- **Web Server**: Nginx atau Apache (dengan dukungan HTTPS)

---

## 🚀 Panduan Instalasi (Step-by-Step)

Ikuti langkah-langkah di bawah ini untuk memasang aplikasi di lingkungan produksi atau pengembangan:

### 1. Clone Repositori
```bash
git clone https://github.com/username/eling-bening-app.git
cd eling-bening-app
```

### 2. Instalasi Dependensi
Instal paket-paket PHP dan JavaScript yang diperlukan:
```bash
# Instal dependensi PHP
composer install --optimize-autoloader --no-dev

# Instal dependensi JavaScript
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin file contoh konfigurasi dan buat kunci aplikasi:
```bash
cp .env.example .env
php artisan key:generate
```
**PENTING**: Edit file `.env` dan sesuaikan bagian database (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), serta kredensial provider (Midtrans, Google Socialite).

### 4. Setup Database & Seeding
Jalankan migrasi untuk membuat struktur tabel dan isi data awal (admin & dummy):
```bash
php artisan migrate --force --seed
```

### 5. Kompilasi Aset Frontend (Production)
Bangun bundle aset React menggunakan Vite:
```bash
npm run build
```

### 6. Konfigurasi Storage & Permissions
```bash
# Buat symlink untuk folder storage
php artisan storage:link

# Pastikan folder storage dan bootstrap/cache memiliki izin tulis
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data .
```

---

## 🏗️ Optimasi Produksi (Recommended)

Untuk performa maksimal di server produksi, jalankan perintah optimasi berikut:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🌟 Fitur Utama Aplikasi

- **Resort Booking Engine**: Reservasi villa/kamar dengan meta tracking (ETA, Fasilitas Khusus, Pesan Bespoke).
- **Interactive Villa Grid**: Daftar kamar dengan layout simetris, filter ketersediaan real-time, dan efek hover premium (`card-lift`).
- **Ticket Audit System**: Pemindaian QR Code tiket wisata secara langsung melalui dashboard admin.
- **Admin Intelligence Dashboard**: Monitoring transaksi, okupansi resort, dan laporan keuangan terpadu.
- **Modern Iconology System**: Komponen terpusat yang memetakan icon Lucide secara dinamis ke seluruh antarmuka.
- **Automatic Multi-service Receipt**: Pengiriman resi pembayaran otomatis ke email tamu setelah transaksi berhasil.

---

## 🎨 Visual & UI Standard

Aplikasi ini mengedepankan estetika tinggi untuk kenyamanan pengguna:
- **Emoji-Free Environment**: Seluruh sistem ikon kuno (emoji) telah diganti dengan icon berbasis vektor (SVG) yang tajam dan profesional.
- **Centralized Icon Selection**: Admin dapat memilih icon dari katalog modern yang telah dikurasi langsung dari modul master fasilitas.
- **High-Fidelity Transitions**: Penggunaan micro-interactions seperti `card-lift` (hover effect) dan shadow-blooms untuk kesan platform premium.
- **Optimized Layout Geometry**: Standarisasi ukuran grid yang simetris menjamin tampilan dashboard tetap rapi pada berbagai ukuran konten.

---

## 📄 Lisensi
Sistem ini dikembangkan secara eksklusif untuk **Eling Bening Resort**. Seluruh hak cipta terlindungi.

---
*Developed by Antigravity AI for Advancing Hospitality Experience.*
