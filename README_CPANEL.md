# Deploy ke cPanel (PHP)

## 1) Upload

- Extract ZIP final.
- Upload semua isi folder ini ke `public_html/` (atau subfolder domain) di cPanel.
- Pastikan `index.php` berada tepat di root folder web kamu.

## 2) Database

1. Buat database + user di cPanel (MySQL Databases).
2. Import schema: `database/schema.sql` via phpMyAdmin.

## 3) Konfigurasi koneksi DB

Edit `config.php` lalu isi:

- `ubah_ini_nama_db`
- `ubah_ini_user_db`
- `ubah_ini_password_db`

Alternatif: set environment variables (kalau hosting mendukung):

- `GEMU_DB_HOST`
- `GEMU_DB_NAME`
- `GEMU_DB_USER`
- `GEMU_DB_PASS`

## 4) Cek halaman penting

- `/index.php`
- `/Belajar/Index.php`
- `/Belajar/Bahasa-Jepang/index.php`
- `/Belajar/Bahasa-Jepang/hiragana.php`
- `/Belajar/Bahasa-Jepang/katakana.php`
- `/Belajar/Bahasa-Jepang/kaiwa.php`
- `/Belajar/Bahasa-Jepang/choukai.php`

## Catatan Audio

Choukai & Kaiwa pakai Web Speech API (SpeechSynthesis / SpeechRecognition).

- Mic (SpeechRecognition) tidak selalu tersedia di semua browser.
- Untuk menghindari bug “suara tidak keluar”, klik/tekan layar sekali dulu (unlock audio) lalu coba tombol 🔊.

