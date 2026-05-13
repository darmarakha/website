PATCH v37 - Lobby Room Flow

Fokus perbaikan:
1. Setiap room di Lobby punya tombol Play/Masuk yang jelas: "Masuk / Enter / Play".
2. Saat tombol Play ditekan, user masuk ke tampilan dalam room, bukan hanya memilih room aktif di bawah daftar lobby.
3. Tampilan dalam room dipisahkan:
   - Player View: sheet karakter, skill, item, log event, chat, dan AI info player.
   - GM View: control room, map dadakan, NPC/monster, karakter room, event log, chat, dan AI asisten GM.
4. Owner punya switcher "Masuk Player" dan "Masuk GM" di dalam room, bisa ganti kapan pun tanpa mengubah role player lain.
5. Tombol "Kembali ke List Lobby" ditambahkan agar user bisa keluar dari tampilan room dan melihat daftar room lagi.
6. Room baru yang dibuat GM/Owner otomatis langsung masuk ke tampilan room.
7. Cache CSS dibump ke v37 supaya browser menarik update terbaru.

File yang diubah:
- dnd.css
- css/dnd-v34-extra-3.css
- js/dnd-app-part-1.js
- js/dnd-app-part-2.js
- js/dnd-app-part-5.js

Catatan pasang:
Upload/replace file sesuai path di folder DnD-2014.
Setelah upload, hard refresh browser jika tampilan masih memakai cache lama.
