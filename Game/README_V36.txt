V36 - Skill Proficiency render loop fix

File yang diubah:
- DnD-2014/dnd-app.js
- DnD-2014/app_concat.js

Perbaikan:
1. Area Skill Proficiency sekarang punya root tunggal: data-skill-proficiency-root="1".
2. updateCharacterBuilderGuide() mengganti root utama, bukan grid anak .class-skill-grid.
3. Setelah render, root duplikat langsung dibersihkan supaya input/change tidak membuat blok Skill Proficiency bertambah terus.
4. Pilihan skill tetap memakai aturan class/race D&D 2014 5e dari data yang sudah ada: Wizard 2 dari daftar Wizard, Rogue 4, Elf otomatis Perception, Half-Elf 2 skill bebas, Variant Human 1 skill bebas, Half-Orc otomatis Intimidation.

Cara pasang patch:
- Upload isi folder DnD-2014 dari patch ini ke folder /Game/DnD-2014/ di hosting.
- Replace file lama.
- Setelah upload, hard refresh browser: Ctrl + F5.
