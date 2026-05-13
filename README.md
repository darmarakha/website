# Website Project: Gemu Yokai

## Deskripsi Proyek
Proyek ini adalah platform pembelajaran Bahasa Jepang (fokus pada N5) dan mesin permainan DnD 2014 yang terintegrasi dengan database MySQL.

## Struktur Proyek
- `/AI`: Komponen integrasi AI.
- `/Belajar`: Modul pembelajaran Bahasa Jepang (N5, Hiragana, Katakana, Kaiwa, Choukai).
- `/Bisnis`: Modul terkait bisnis.
- `/Game`: Mesin permainan DnD-2014.
- `/SQL`: Berkas skema database.
- `/assets`: Aset statis (gambar, CSS, JS).
- `/config`: Konfigurasi sistem dan database.
- `/partials`: Komponen UI yang dapat digunakan kembali (navbar, footer).
- `index.php`: Halaman utama website.

## Teknologi yang Digunakan
- **Backend**: PHP (Vanilla) & MySQL.
- **Frontend**: HTML, CSS (Vanilla), Javascript.
- **Audio**: Web Speech API untuk TTS (Text-to-Speech).
- **Version Control**: Git & GitHub.

## Panduan Deployment (Garis Keras)
Untuk menjaga integritas proyek, ikuti langkah-langkah berikut:

### 1. Update ke GitHub
Semua perubahan harus di-commit dan di-push ke repository GitHub:
`https://github.com/darmarakha/website`

### 2. Upload ke Hosting (FTP)
Deployment dilakukan dengan cara:
1. Membungkus seluruh file proyek (kecuali folder `.git`) ke dalam file `website_deploy.zip`.
2. Mengunggah file ZIP tersebut ke direktori `/home/httpgemu/public_html` via FTP.
3. Mengekstrak file ZIP tersebut di File Manager hosting.

### 3. Konfigurasi Database
- Nama DB: `httpgemu_dnd` (atau sesuai konfigurasi cPanel).
- Impor skema dari folder `/SQL`.
- Sesuaikan kredensial di `config/database.php`.

## Catatan Penting
- Jangan mengubah struktur file `.md` tanpa permintaan eksplisit dari pemilik proyek.
- Pastikan semua path di file PHP bersifat relatif agar tidak pecah saat dipindah ke hosting.
