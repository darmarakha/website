# PRD — GemuYokai Website

## 1. Tujuan Dokumen
PRD ini menjadi acuan utama agar pengembangan website GemuYokai tetap terarah, tidak keluar dari permintaan owner, dan tidak mengubah bagian yang sudah benar tanpa alasan jelas.

Dokumen ini wajib dibaca sebelum membuat fitur, memperbaiki bug, atau merapikan struktur proyek.

---

## 2. Identitas Produk

**Nama produk:** GemuYokai Website  
**Jenis:** Website portfolio, edukasi, komunitas, dan fitur interaktif  
**Backend utama:** PHP  
**Database:** MySQL/MariaDB  
**Frontend:** HTML, CSS, JavaScript  
**Target hosting:** cPanel/shared hosting  
**Repository:** GitHub private repository

---

## 3. Visi Produk
GemuYokai adalah platform personal dan komunitas yang menggabungkan:

1. Portfolio owner.
2. Pembelajaran interaktif.
3. Sistem akun dan role.
4. Game dan fitur kreatif.
5. Pengelolaan konten dari halaman edit/admin.
6. Bantuan AI untuk mengatur alur belajar dan pengembangan fitur.

Produk harus terasa modern, rapi, cepat, aman, dan mudah dikembangkan tanpa merusak fitur lama.

---

## 4. Prinsip Utama Pengembangan

### 4.1 Jangan Keluar dari Permintaan
Setiap perubahan harus sesuai permintaan owner. Jangan menambahkan fitur besar di luar instruksi tanpa alasan kuat.

### 4.2 Jangan Mengubah yang Sudah Benar
Jika bug hanya ada di satu file atau satu fungsi, perbaiki bagian itu saja. Jangan rewrite seluruh modul jika tidak diminta.

### 4.3 Pull Request Wajib untuk Perubahan GitHub
Perubahan kode, dokumentasi, struktur folder, atau konfigurasi harus dibuat melalui branch dan Pull Request.

Tidak boleh langsung mengubah branch utama tanpa review.

### 4.4 File `.md` Tidak Boleh Diubah Sembarangan
File dokumentasi seperti `README.md`, `README_CPANEL.md`, dan `PRD.md` hanya boleh diubah jika owner meminta secara eksplisit.

### 4.5 Tidak Menyimpan Data Rahasia di Dokumentasi
Dokumen tidak boleh memuat password, token, kredensial hosting, kredensial database, kunci API, atau akses server.

### 4.6 Bahasa Jepang Dilindungi
Folder atau fitur Bahasa Jepang tidak boleh disentuh kecuali owner meminta secara eksplisit.

Aturan ini berlaku untuk:
- materi Bahasa Jepang,
- Hiragana/Katakana,
- audio,
- AI membaca,
- flashcard Jepang,
- file pendukung modul Jepang.

---

## 5. Role Pengguna

### 5.1 Guest
Pengguna belum login.

Akses:
- melihat halaman publik,
- melihat portfolio publik,
- melihat sebagian fitur belajar publik,
- tidak bisa edit konten,
- tidak bisa melihat data khusus member.

### 5.2 Member
Pengguna terdaftar dan login.

Akses:
- melihat konten member,
- menyimpan progress belajar,
- menggunakan fitur interaktif yang membutuhkan akun.

### 5.3 Admin
Pengelola konten.

Akses:
- mengelola konten tertentu,
- memantau data user sesuai izin,
- tidak boleh mengubah hak owner.

### 5.4 Owner
Pemilik sistem.

Akses:
- mengedit halaman utama,
- mengelola certificate,
- mengelola project,
- mengelola konten portfolio,
- melihat tombol edit khusus,
- mengatur deployment dan keputusan final.

---

## 6. Modul Utama

## 6.1 Autentikasi

### Tujuan
User bisa register, login, logout, dan sistem bisa mengenali role pengguna.

### Kebutuhan
- Login memakai email atau nickname jika tersedia.
- Password harus diverifikasi dengan `password_verify()` jika tersimpan hash.
- Session harus aman dan memakai regenerasi session setelah login.
- Error login harus jelas, tetapi tidak membocorkan detail database.

### Acceptance Criteria
- Login berhasil jika kredensial benar.
- Login gagal jika password salah.
- Error database tidak menampilkan password, host detail sensitif, atau stack trace ke user publik.
- Role user tersimpan di session.

---

## 6.2 Database dan Konfigurasi

### Tujuan
Website terhubung ke database hosting secara stabil.

### Kebutuhan
- Koneksi utama melalui `config.php`.
- Konfigurasi lokal server boleh memakai `config.local.php` atau environment variable.
- File rahasia tidak boleh masuk commit.
- Query harus memakai PDO prepared statement.

### Acceptance Criteria
- Website bisa konek ke database produksi.
- User database punya privilege sesuai kebutuhan.
- Tidak ada kredensial rahasia di dokumentasi.
- Error database bisa dilacak dari log server.

---

## 6.3 Portfolio Owner

### Tujuan
Menampilkan profil, pengalaman, project, certificate, kontak, dan informasi owner.

### Kebutuhan
- Tampilan rapi di desktop dan mobile.
- Data certificate dan project bisa tampil konsisten.
- Informasi sensitif user harus dimasking jika belum login atau tidak punya izin.
- Owner bisa edit konten tertentu dari halaman edit/admin.

### Acceptance Criteria
- Halaman utama tidak error saat data kosong.
- Gambar tidak pecah jika path salah; harus ada fallback.
- Data portfolio mudah diperbarui tanpa rewrite halaman penuh.

---

## 6.4 Certificate

### Tujuan
Owner bisa menampilkan sertifikat dalam bentuk gambar atau PDF.

### Kebutuhan
- Certificate dapat memakai file gambar: JPG, JPEG, PNG, WEBP.
- Certificate dapat memakai file PDF.
- Upload certificate harus memvalidasi ekstensi dan MIME type.
- File upload disimpan pada folder yang jelas.
- PDF tidak boleh dirender sebagai `<img>` karena dapat menyebabkan render error.
- PDF harus dibuka lewat viewer aman seperti `<iframe>` atau link file.
- Jika certificate berupa PDF, kartu certificate harus memakai cover/placeholder yang valid.

### Acceptance Criteria
- Upload PDF certificate berhasil.
- PDF certificate muncul di halaman utama tanpa broken image.
- Klik certificate PDF membuka PDF viewer atau file PDF.
- Upload file selain format yang diizinkan ditolak.
- File besar melebihi batas ditolak.

---

## 6.5 Edit/Admin Folder

### Tujuan
Folder edit menjadi tempat pengelolaan konten owner secara aman.

### Kebutuhan
- Hanya owner yang boleh mengakses action edit.
- API edit harus memakai whitelist action.
- Upload harus memakai validasi ukuran, ekstensi, dan MIME.
- Nama file upload harus disanitasi.
- API harus mengembalikan JSON yang jelas.

### Acceptance Criteria
- Non-owner tidak bisa upload atau edit.
- Response API selalu JSON.
- Tidak ada arbitrary file write di luar file yang diizinkan.
- Upload certificate PDF dan gambar bisa dipakai untuk data certificate.

---

## 6.6 Modul Belajar

### Tujuan
Menyediakan pembelajaran bertahap dari pemula sampai profesional.

### Cakupan
- Matematika.
- Bahasa Inggris.
- Pengetahuan Umum.
- Modul lain non-Bahasa Jepang sesuai permintaan owner.

### Aturan Khusus
Modul Bahasa Jepang tidak boleh disentuh tanpa instruksi eksplisit.

### Level Belajar
Setiap user harus diarahkan ke level yang sesuai:

1. Pemula.
2. Dasar.
3. Menengah.
4. Lanjut.
5. Profesional.

### AI Leveling
AI atau sistem adaptif harus menentukan level berdasarkan:
- hasil latihan,
- akurasi jawaban,
- riwayat progress,
- tingkat kesulitan soal,
- konsistensi performa.

### Acceptance Criteria
- Setiap subject punya materi bertingkat.
- Progress disimpan per user.
- User tidak langsung dilempar ke materi sulit tanpa data kemampuan.
- Sistem bisa menurunkan atau menaikkan level berdasarkan performa.

---

## 6.7 Game / DnD 2014

### Tujuan
Menyediakan fitur game berbasis DnD 2014 dengan lobby, karakter, map, dice, dan role GM/Player.

### Kebutuhan Umum
- Lobby harus jelas dan tidak penuh teks berantakan.
- Room memiliki mode Player dan GM.
- Owner boleh memilih tampilan GM atau Player.
- Dice harus mendukung dadu standar DnD.
- Player hanya bisa menggerakkan karakter sendiri.
- Jika bukan giliran player, player tidak boleh melakukan action permainan.
- GM mengatur giliran.

### Acceptance Criteria
- Masuk room tidak menampilkan menu utama yang tidak relevan.
- GM bisa memilih map dan map tampil ke player.
- Turn system berjalan sesuai aturan permainan.
- Player tetap bisa melihat stat dan item walau bukan gilirannya.

---

## 6.8 AI Internal

### Tujuan
AI membantu pengembangan, review, dan pengaturan materi belajar tanpa keluar dari aturan owner.

### Role AI
1. AI Sistem: menjaga aturan, arsitektur, keamanan, dan keputusan final.
2. AI Backend: fokus PHP, database, API, session, dan keamanan server.
3. AI Frontend: fokus UI, CSS, JS, responsif, dan UX.

### Aturan AI
- AI tidak boleh mengubah file `.md` tanpa perintah owner.
- AI tidak boleh menyentuh modul Bahasa Jepang tanpa perintah owner.
- AI harus membuat PR untuk perubahan GitHub.
- AI harus menjelaskan perubahan secara jelas dan singkat.
- AI tidak boleh menyimpan kredensial rahasia ke dokumentasi.

---

## 7. Keamanan

### 7.1 Wajib
- PDO prepared statement.
- Session regeneration setelah login.
- Validasi role sebelum action admin.
- Validasi upload file.
- Sanitasi nama file.
- Batasi ukuran upload.
- Jangan tampilkan stack trace ke user publik.
- Jangan simpan secret di dokumentasi.

### 7.2 Dilarang
- Menyimpan password/server secret di `.md`.
- Membiarkan upload PHP, JS, atau file executable dari editor.
- Query SQL langsung dengan input user tanpa prepared statement.
- Mengubah semua file karena bug kecil.
- Menyentuh folder Bahasa Jepang tanpa instruksi.

---

## 8. Deployment

### Tujuan
Setiap perubahan final dari GitHub harus dapat dikirim ke hosting secara rapi.

### Aturan
1. Perubahan harus masuk Pull Request.
2. Setelah PR disetujui dan merge, buat paket ZIP deployment.
3. ZIP tidak boleh menyertakan `.git`, file backup, cache, arsip lama, atau file lokal pribadi.
4. Upload ZIP ke lokasi produksi yang ditentukan owner.
5. Ekstrak di lokasi produksi.
6. Cek halaman utama, login, register, dan fitur yang berubah.
7. Jika error, cek log hosting sebelum mengubah kode lagi.

### Acceptance Criteria
- ZIP deployment bersih.
- Website tidak error setelah upload.
- Login tetap bisa berjalan.
- Fitur yang diubah berhasil dites minimal secara manual.

---

## 9. Standar Pull Request

Setiap PR harus memiliki:

1. Ringkasan perubahan.
2. File yang diubah.
3. Alasan perubahan.
4. Risiko perubahan.
5. Cara testing.
6. Catatan jika ada bagian yang sengaja tidak disentuh.

### Format PR Minimal
```md
### Ringkasan
- ...

### File Diubah
- ...

### Alasan
- ...

### Testing
- ...

### Catatan
- ...
```

---

## 10. Definition of Done
Sebuah fitur dianggap selesai jika:

1. Sesuai permintaan owner.
2. Tidak merusak fitur lama.
3. Tidak menyentuh modul terlarang.
4. Tidak menyimpan data rahasia.
5. Tidak ada error PHP fatal.
6. UI tetap rapi di desktop dan mobile.
7. Ada PR yang bisa direview.
8. Ada penjelasan perubahan.
9. Jika sudah merge, siap dibuat ZIP deployment.

---

## 11. Prioritas Saat Ini

### Prioritas Tinggi
1. Login dan koneksi SQL harus stabil.
2. Certificate PDF harus bisa upload dan tampil tanpa render error.
3. Folder edit harus aman.
4. Dokumentasi deployment harus jelas.
5. Modul belajar non-Bahasa Jepang dikembangkan bertahap.

### Prioritas Sedang
1. Rapikan UI mobile.
2. Rapikan data project dan certificate.
3. Tambahkan logging error yang aman.
4. Buat sistem progress belajar berbasis user.

### Prioritas Rendah
1. Animasi tambahan.
2. Efek visual besar.
3. Fitur kosmetik yang tidak memengaruhi fungsi utama.

---

## 12. Catatan Owner
- Jangan ubah bagian yang sudah benar.
- Jika bug kecil, perbaiki bagian bug saja.
- Jika butuh perubahan besar, buat PR dan jelaskan alasannya.
- Jika menyangkut file `.md`, harus ada permintaan eksplisit.
- Jika menyangkut Bahasa Jepang, harus ada izin eksplisit.
- Jika menyangkut database, pastikan sesuai struktur SQL yang ada.

---

Dokumen ini menjadi pegangan utama agar pengembangan GemuYokai tetap rapi, aman, dan sesuai arah owner.
