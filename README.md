# 🌟 Website Project: Gemu Yokai 🌟

Selamat datang di proyek **Gemu Yokai**! Proyek ini dirancang sebagai platform multifungsi yang menggabungkan edukasi interaktif dan hiburan berkualitas.

---

## 📖 Deskripsi Proyek
**Gemu Yokai** adalah platform modern yang berfokus pada:
- 🇯🇵 **Pembelajaran Bahasa Jepang**: Kursus interaktif tingkat N5.
- 🎲 **DnD 2014 Engine**: Sistem permainan Roleplay (Dungeons & Dragons) yang terintegrasi dengan database.
- 🚀 **Pengembangan Berkelanjutan**: Fitur-fitur baru terus ditambahkan untuk memberikan pengalaman terbaik.

---

## 📂 Struktur Proyek & Informasi Folder
Berikut adalah gambaran mendetail tentang susunan folder dalam proyek ini:

- 🧠 **`/AI`**: Komponen integrasi Kecerdasan Buatan (AI) untuk asisten pintar.
- 🎓 **`/Belajar`**: Pusat pembelajaran interaktif.
    - 📁 *Status*: **Tahap Pengembangan** 🚧
    - 📁 *Isi*: Berbagai macam materi pembelajaran (Matematika, Bahasa Inggris, dll).
    - 📁 *Materi Tersedia*: Saat ini fokus utama ada pada **Bahasa Jepang (N5)** yang mencakup Hiragana, Katakana, Kaiwa, dan Choukai.
- 💼 **`/Bisnis`**: Modul fungsional untuk keperluan manajemen bisnis.
- 🎮 **`/Game`**: Mesin permainan **DnD-2014** yang lengkap dengan sistem lobby dan dadu.
- 🗄️ **`/SQL`**: Berkas skema database MySQL untuk menjaga data tetap aman.
- 🎨 **`/assets`**: Aset visual dan teknis (Gambar, CSS, JS) yang mempercantik tampilan.
- ⚙️ **`/config`**: Jantung konfigurasi sistem dan koneksi database.
- 🧱 **`/partials`**: Komponen UI modular (Navbar, Footer) untuk konsistensi desain.
- 🏠 **`index.php`**: Pintu gerbang utama menuju platform Gemu Yokai.

---

## 🛠️ Teknologi yang Digunakan
- **Backend**: 🐘 PHP (Vanilla) & 🐬 MySQL.
- **Frontend**: 🏗️ HTML5, 🎨 CSS3 (Vanilla), ⚡ Javascript.
- **Audio**: 🔊 Web Speech API untuk fitur Choukai & Kaiwa.
- **Versi Kontrol**: 🐙 Git & GitHub.

---

## 🚀 Panduan Deployment (Garis Keras)
> [!IMPORTANT]
> Harap ikuti protokol ini dengan ketat untuk menjaga keamanan dan kestabilan proyek:

### 1️⃣ Update ke GitHub
Pastikan semua kode terbaru sudah masuk ke repository:
`https://github.com/darmarakha/website`

### 2️⃣ Upload ke Hosting (FTP)
Prosedur pengunggahan:
1. Bersihkan file `.zip`, `.rar`, atau `.tar` lama dari folder proyek.
2. Buat file `website_deploy.zip` (tanpa folder `.git`).
3. Upload ke direktori `/home/httpgemu/public_html` via FTP.
4. **Ekstrak** file ZIP di File Manager hosting.

### 3️⃣ Konfigurasi Database
- Nama DB: `httpgemu_dnd`.
- Impor skema terbaru dari folder `/SQL`.
- Pastikan kredensial di `config/database.php` sudah benar.

---

## ⚠️ Catatan Penting
- 🛑 **Jangan mengubah struktur file `.md`** tanpa permintaan eksplisit.
- 🔗 Pastikan semua path bersifat relatif agar sistem tetap berjalan di server manapun.
- 🧹 Selalu bersihkan file arsip lokal setelah proses deployment selesai.

---
*Dibuat dengan ❤️ untuk komunitas Gemu Yokai.*
