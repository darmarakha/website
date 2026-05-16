# Gemu Nihongo N5 Materials

Folder ini berisi materi inti untuk modul `Belajar/Bahasa-Jepang/N5`.

## File

- `n5-materials.php` — dataset PHP untuk kana, partikel, grammar, kosakata, kanji, listening, speaking, dan aturan AI.

## Cara pakai di PHP

```php
$materials = require __DIR__ . '/data/n5-materials.php';
$particles = $materials['particles'];
$vocabulary = $materials['vocabulary'];
```

## Catatan Kuromoji

Kuromoji dipakai untuk tokenisasi kalimat Jepang: memecah teks menjadi kata, kelas kata, bentuk dasar, dan bacaan. Untuk modul N5, hasil tokenisasi tetap harus dicek lagi terhadap kamus internal N5 agar AI tidak terlalu jauh memakai kosakata di luar level pemula.

Format jawaban belajar yang disarankan:

1. JP — teks Jepang, kanji diberi bacaan jika perlu.
2. RO — romaji.
3. ID — arti bahasa Indonesia.
4. Koreksi — khusus partikel, grammar, atau bacaan.
