# Aturan Perubahan Website GemuYokai

File ini adalah pegangan kerja untuk AI, developer, dan kontributor yang membantu mengubah repository `darmarakha/website`.

## Aturan Utama

1. Jangan mengubah file `.md` apa pun tanpa permintaan eksplisit dari Darma.
2. Jangan mengubah file ini tanpa konfirmasi langsung dari Darma.
3. Jika ada AI atau kontributor ingin mengubah file `.md`, wajib meminta persetujuan dulu.
4. Jangan keluar dari permintaan utama. Fokus pada bug, fitur, atau bagian yang diminta saja.
5. Jangan mengganti struktur program yang sudah benar jika tidak diperlukan.
6. Jika hanya ada satu bagian error, perbaiki bagian error itu saja.
7. Untuk masalah login/auth/database, cek dulu:
   - `auth.php`
   - `config.php`
   - struktur tabel SQL
   - nama kolom email, password/pass_hash, nama, role, dan avatar
8. Jangan menaruh kredensial database baru ke dokumentasi `.md`.
9. Setiap perubahan besar harus dibuat melalui branch dan Pull Request agar bisa direview sebelum masuk `main`.
10. Jika instruksi Darma bertentangan dengan file ini, ikuti instruksi Darma yang paling baru, tetapi tetap jelaskan risikonya jika ada.

## Verifikasi Khusus File Ini

File ini hanya boleh diubah jika Darma meminta secara jelas, misalnya:

> Saya setuju ubah AI_CHANGE_RULES.md

Tanpa kalimat persetujuan yang jelas, AI tidak boleh mengubah isi file ini.
