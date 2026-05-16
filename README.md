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
> Harap ikuti protokol ini dengan ketat untuk menjaga keamanan dan kestabilan proyek.

### 1️⃣ Update ke GitHub
Pastikan semua kode terbaru sudah masuk ke repository:
`https://github.com/darmarakha/website`

### 2️⃣ Aturan Paket Setelah Perubahan GitHub
Setiap perubahan yang sudah disetujui dan siap dipakai wajib mengikuti alur berikut:
1. Ambil versi terbaru dari branch utama.
2. Buat paket `website_deploy.zip` dari isi project terbaru.
3. Jangan masukkan folder `.git`, file arsip lama, file backup, cache, atau file lokal pribadi.
4. Kirim paket ZIP ke lokasi produksi yang sudah ditentukan oleh owner.
5. Ekstrak paket ZIP di lokasi produksi.
6. Setelah ekstrak, cek minimal halaman utama, login, register, dan fitur yang baru diubah.
7. Jika muncul error, baca log server terlebih dahulu sebelum mengubah kode lagi.

### 3️⃣ Konfigurasi Database
- Koneksi utama website memakai `config.php`.
- Konfigurasi lokal memakai `config.local.php` atau environment variable.
- `config.local.php` tidak boleh masuk commit karena berisi data khusus server.
- Jangan mengubah struktur database tanpa menyesuaikan kode backend yang memakainya.

---

## ⚠️ Catatan Penting
- 🛑 **Jangan mengubah struktur file `.md`** tanpa permintaan eksplisit.
- 🔗 Pastikan semua path bersifat relatif agar sistem tetap berjalan di server manapun.
- 🧹 Selalu bersihkan file arsip lokal setelah proses deployment selesai.
- 📦 Setiap perubahan GitHub yang sudah final wajib dibuatkan paket ZIP deployment sebelum dikirim ke lokasi produksi.
- ✅ Setelah deployment, wajib cek minimal halaman utama, autentikasi, dan fitur yang baru diubah.

---
*Dibuat dengan ❤️ untuk komunitas Gemu Yokai.*
