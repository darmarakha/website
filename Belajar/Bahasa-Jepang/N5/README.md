# Gemu Nihongo N5

App belajar bahasa Jepang JLPT N5 berbasis React/Vite.

## Deploy cPanel

1. Jalankan `npm run build`.
2. Untuk upload cPanel, pastikan `index.html` hasil build dan folder `assets/` berada langsung di folder `N5`.
3. File `index.source.html` adalah backup entry Vite dev asli jika suatu hari perlu build ulang dari template sumber.

Router menggunakan hash route agar aman di shared hosting tanpa konfigurasi rewrite.

## Upload ringan

Folder `node_modules/` hanya dipakai untuk development/build React/Vite di komputer lokal. cPanel tidak perlu menerima folder itu karena browser hanya membaca `index.html` dan file hasil build di `assets/`.

Menghapus `node_modules/` dari zip upload tidak menghapus fitur kaiwa, dialog, latihan, audio UI, atau data pelajaran karena semua fitur runtime sudah dibundle ke file `assets/index-*.js` dan `assets/index-*.css`. Folder besar itu baru diperlukan lagi kalau kamu ingin mengubah source React lalu build ulang.

Zip upload yang disarankan untuk hosting:

- Sertakan `Belajar/Bahasa-Jepang/N5/index.html`.
- Sertakan `Belajar/Bahasa-Jepang/N5/assets/`.
- Jangan sertakan `Belajar/Bahasa-Jepang/N5/node_modules/`.
- Jangan sertakan `Belajar/Bahasa-Jepang/N5/dist/` kalau isi build sudah dipindahkan ke folder `N5`.

Kalau suatu hari perlu rebuild dari source lokal, jalankan:

```bash
npm install
npm run build
```

Update maintenance 2026-05-08: build N5 sudah dibersihkan dari credit/template Google AI Studio dan siap diupload sebagai paket ringan.
