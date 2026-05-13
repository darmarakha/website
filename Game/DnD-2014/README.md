# Gemuyokai DnD 2014 Table

Modul game front-end untuk campaign DnD 2014.

## Fokus update ini

- Login website dibaca dari session GemuYokai (`gy_user_id`, `gy_nickname`, `gy_user_email`, `gy_user_role`) dan fallback beberapa nama session lama (`user_id`, `user_name`, `user_email`, `user_role`).
- Logout website diproses lewat `dnd_auth.php`, membersihkan session login dan reload halaman.
- Login lokal DND dimatikan. DND memakai akun website sebagai sumber role; Owner/Admin otomatis memiliki akses Player + GM.
- Tombol yang sebelumnya berpotensi mati diperbaiki: reward GM, batal reward, import close, delete character, voice-to-text di session panel, dan action handler sekarang punya error guard.
- Layout mobile/desktop diberi patch anti-overlap untuk appbar, tombol, tab, modal, map canvas, card, dan teks panjang.
- `dnd_api.php` dibuat lebih aman terhadap variasi file config database (`config/database.php`, `config/db.php`, `db.php`) dan tidak menyimpan password akun lokal ke snapshot SQL.

## Fitur

- Login website/session saja; akun lokal DND lama dibersihkan supaya akun dan karakter masuk MySQL.
- Player wajib membuat karakter sebelum masuk map/dice.
- Character builder dan sheet editable untuk nama, race, class, dan level.
- Autosave/load utama via MySQL `httpgemu_dnd` melalui `dnd_api.php`. Cache lokal lama dibersihkan agar data akun/karakter tidak bercabang.
- Export/import save JSON.
- Download character sheet ke PDF ringkas buatan sistem, siap print untuk permainan offline dan tidak bergantung field PDF template.
- GM screen untuk adjust HP, XP, item, kondisi, NPC, reward, dan map.
- Procedural map generator berwarna untuk wilderness, dungeon, city, kingdom, cave, coast, swamp, desert, mountain, ruins.
- NPC placement di map oleh GM.
- Dice roller animatif dan skill roll.
- Rule helper lokal untuk menegur potensi pelanggaran DnD 2014.

## SQL

Gunakan `httpgemu_dnd.sql` sebagai dasar integrasi MySQL DND. Endpoint `dnd_api.php` tidak lagi memakai fallback localStorage untuk akun/karakter. Jika SQL belum tersambung, halaman tetap tampil tetapi penyimpanan menunggu koneksi MySQL benar.


## Update AI Map Gemini
- Generate Gambar AI memakai `dnd_image_api.php` dan Google Gemini Image API dari server-side PHP.
- API key tersimpan di `dnd_ai_config.php`; jangan pindahkan ke file `.js`.
- Jika ingin mengganti key, ubah `google_api_key` di `dnd_ai_config.php` atau set environment variable `GEMINI_API_KEY` di hosting.
