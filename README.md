# Multi-Platform Web Project

Proyek ini adalah ekosistem web campuran yang terdiri dari aplikasi berbasis PHP (Legacy/Main Site) dan aplikasi modern berbasis Next.js.

## 📂 Struktur Folder Utama

- `/` : Root direktori berisi sistem berbasis PHP.
- `/Belajar/Bahasa-Jepang/N5` : Aplikasi pembelajaran Bahasa Jepang N5 (Next.js + TypeScript).
- `/Bisnis` : Modul manajemen bisnis/produk.
- `/Game` : Modul engine game (D&D).
- `/SQL` : Berisi backup database MySQL.
- `/assets` : Aset statis (CSS, JS, Images).

## 🚀 Teknologi yang Digunakan

- **Backend Utama**: PHP
- **Modern App**: Next.js 15+, TypeScript, Tailwind CSS
- **Database**: MySQL
- **Tooling**: Bun / NPM, Prisma ORM (di dalam modul N5)

## 🗄️ Database (SQL)

Folder `/SQL` berisi struktur dan data database yang diperlukan:
1. `httpgemu_website.sql`: Database utama untuk konten website.
2. `httpgemu_dnd.sql`: Database khusus untuk modul Game/D&D.

**Cara Import:**
- Buat database baru di MySQL/phpMyAdmin.
- Gunakan fitur **Import** dan pilih file `.sql` dari folder tersebut.
- Sesuaikan konfigurasi koneksi di `config.php` (untuk PHP) atau file `.env` (untuk Next.js).

## 🛠️ Cara Menjalankan

### 1. PHP Site
Akses langsung melalui web server (Apache/Nginx). Pastikan `index.php` terbaca sebagai entry point.

### 2. Next.js N5 App
```bash
cd Belajar/Bahasa-Jepang/N5
npm install   # atau bun install
npm run dev   # jalankan server development
```

---
*Dibuat dengan bantuan Antigravity AI.*
