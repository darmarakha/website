PATCH V29 — D&D 2014 Skill & Race Data

Upload/replace file berikut ke folder /Game/DnD-2014/:
1. dnd-data.js
2. dnd-app.js

Isi perbaikan:
- Data 18 skill D&D 2014 disesuaikan dengan ability tambahan dan fungsi tiap skill.
- Race skill proficiency mengikuti data yang diberikan:
  * Elf otomatis Perception.
  * Half-Orc otomatis Intimidation.
  * Half-Elf memilih 2 skill bebas.
  * Variant Human memilih 1 skill bebas.
  * Dwarf/Halfling/Dragonborn/Gnome/Tiefling/Human biasa tidak mendapat skill proficiency ras.
- Variant Human ditambahkan sebagai opsi race terpisah agar ability +1/+1, skill bebas, bahasa, dan feat tidak bercampur dengan Human biasa.
- Validasi penyimpanan tetap menolak skill class/ras yang belum lengkap atau melebihi batas.
- Perbaikan bug penyimpanan karakter: field skills sekarang memakai hasil validasi skillBreakdown.all, bukan variabel kosong.

Catatan:
- Setelah upload, lakukan hard refresh browser: Ctrl + F5.
- Bila masih melihat data lama, hapus cache browser untuk halaman /Game/DnD-2014/.
