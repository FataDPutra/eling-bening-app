# 🏔️ Eling Bening - Integrated Resort & Tourism Management System

Sistem manajemen terpadu untuk destinasi wisata **Eling Bening**, mencakup reservasi resort mewah, manajemen tiket wisata (Wisata & Event), audit keuangan, pendataan tamu real-time, dan **Sistem CMS Mandiri**.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan server Anda memenuhi spesifikasi berikut:
- **PHP** >= 8.2 (Ekstensi: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
- **Node.js** >= 20.x & **NPM**
- **Composer** (PHP Dependency Manager)
- **Database**: MySQL 8.0+ atau PostgreSQL 15+
- **Web Server**: Nginx (direkomendasikan) atau Apache
- **SSL Certificate**: Wajib (HTTPS) untuk fitur Scanner QR Code dan Google Login.

---

## 🚀 Panduan Instalasi (Step-by-Step Deployment)

Ikuti langkah-langkah di bawah ini untuk memastikan seluruh fitur (CMS, Google Auth, Scanner) berfungsi sempurna di lingkungan produksi:

### 1. Persiapan Repositori & Dependensi
```bash
git clone https://github.com/username/eling-bening-app.git
cd eling-bening-app

# Instal dependensi PHP (Optimalkan untuk produksi)
composer install --optimize-autoloader --no-dev

# Instal dependensi JavaScript & Build Aset
npm install
npm run build
```

### 2. Konfigurasi Lingkungan (.env)
Salin konfigurasi dan generate key:
```bash
cp .env.example .env
php artisan key:generate
```
**Konfigurasi Wajib di `.env`:**
- `APP_URL`: Pastikan menggunakan `https://`
- `DB_`: Sesuaikan kredensial database Anda.
- `MAIL_`: Konfigurasi SMTP untuk fitur pengiriman tiket ke email tamu.
- `MIDTRANS_`: Masukkan Client Key & Server Key untuk gateway pembayaran.

### 3. Setup Database & Seeding Awal
Fitur **CMS Content** memerlukan data awal agar tampilan website tidak kosong:
```bash
# Migrasi table dan seeding konten awal (Logo, Judul, Fasilitas Default)
php artisan migrate --force --seed
```

### 4. Konfigurasi Izin Folder & Link Storage
PENTING agar gambar yang diupload via CMS dapat tampil:
```bash
# Link folder storage ke public
php artisan storage:link

# Izin akses folder (Linux/Unix)
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data .
```

### 5. Aktivasi Fitur Khusus (Pasca Instalasi)

#### **A. Google Login (Socialite Dinamis)**
Aplikasi ini menggunakan sistem **Dynamic Socialite**. Anda tidak perlu mengisi Client ID Google di `.env`. 
1. Login ke Panel Admin (`/admin`).
2. Buka menu **System Settings**.
3. Masukkan `Google Client ID` dan `Google Client Secret` di form yang tersedia.
4. Klik Simpan. Fitur login Google akan aktif otomatis.

#### **B. CMS & Live Preview**
1. Buka menu **Konten CMS**.
2. Ubah Logo, Favicon, atau Deskripsi di sidebar editor.
3. Gunakan **Device Switcher** (Desktop/Tablet/Mobile) untuk mengecek responsivitas.
4. Klik tombol **Simpan & Publikasikan** untuk memperbarui tampilan di sisi tamu.

#### **C. Scanner QR Code**
Fitur scanner memerlukan akses kamera. Pastikan:
1. Website diakses melalui **HTTPS**.
2. Browser telah memberikan izin (Permission) akses kamera.
3. Scanner sudah dioptimasi untuk menghilangkan background biru dan memiliki animasi pemindaian modern.

---

## 🏗️ Optimasi Produksi (Recommended)
Jalankan setiap kali ada update kode atau konfigurasi:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🌟 Fitur Unggulan Versi Terbaru

- **Real-time CMS Builder**: Editor visual dengan pratinjau interaktif (klik menu di preview untuk navigasi editor).
- **Dynamic Google Auth**: Konfigurasi OAuth via database (tanpa restart server/.env).
- **Advanced Finance Filter**: Laporan bulanan/tahunan di Dashboard, Pesanan Resort, Tiket Wisata, dan Tiket Event.
- **Futuristic QR Scanner**: Scanner tanpa refresh, UI transparan, dan overlay animasi modern.
- **Zebra-Themed Layout**: Tampilan guest yang dinamis dengan selang-seling seksi terang dan gelap secara otomatis.

---

## 📄 Lisensi & Support
Sistem ini dikembangkan secara eksklusif untuk **Eling Bening Resort**. Seluruh hak cipta terlindungi.
*Developed by Antigravity AI for Advancing Hospitality Experience.*
