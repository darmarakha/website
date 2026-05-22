# Build Progress — Belajar Bahasa Jepang

## Protokol
- Setiap selesai satu FILE → auto commit.
- `git log --oneline -5` untuk resume.
- `git diff --name-only HEAD~1..HEAD` → tahu file terakhir.

## Status Fase 1 — Partikel Module

| Fase | Deskripsi | Status | Commit |
|------|-----------|--------|--------|
| Fase 0 | Init git + progress tracker | ✅ SELESAI | `73e5b2d` |
| Fase 1A | Data 40+ partikel lengkap (7 kategori, 1663 baris) | ✅ SELESAI | `46f8c45` |
| Fase 1A.5 | Update partikel.js — progress dinamis, filter, badge | ✅ SELESAI | `916cf19` |
| Fase 1B | Decision Tree interaktif — 14+ kategori pilihan | ✅ SELESAI | `e8d82e6` |
| Fase 1C | Contrast Lab — 12 pasang perbandingan detail | ✅ SELESAI | `d5bc8ad` |
| Fase 1D | Visual guide: cerita, semuaFungsi, JLPT di modal | ✅ SELESAI | `0cae16c` |
| Fase 1E | Particle Quest RPG — 7 dungeon + boss | ✅ SELESAI | `83f3ba8` |
| Fase 1F | Ujian JLPT Partikel (20 soal, MCQ + essay) | ✅ SELESAI | `ade2cba` |

## Status Fase 2 — Shared Game Engine

| Fase | Deskripsi | Status | Commit |
|------|-----------|--------|--------|
| Fase 2A | `game-engine.js` — 516 baris reusable + refactor partikel (97 baris) | ✅ SELESAI | `505d2bf` |
| Fase 2B | Kanji Quest RPG — 8 dungeon, mixed quiz | ✅ SELESAI | `24d56d3` |
| Fase 2C | Kotoba Dungeon — 7 dungeon, vocabulary quiz | ✅ SELESAI | `4dddd0b` |
| Fase 2D | Kotoba Dungeon + dungeon 'Orang' (8 dungeon total) | ✅ SELESAI | `ade2cba` |

## Status Fase 3 — Bug Fix & Security

| Fase | Deskripsi | Status | Commit |
|------|-----------|--------|--------|
| Fase 3A | Code review seluruh codebase (23 file) | ✅ SELESAI | `ade2cba` |
| Fase 3B | Fix critical: XSS, crash, data typo, progress logic | ✅ SELESAI | `ade2cba` |
| Fase 3C | CSRF protection + POST-only logout + session hardening | ✅ SELESAI | `ade2cba` |
| Fase 3D | Implementasi Bunpou module (25 grammar pola N5) | ✅ SELESAI | `ade2cba` |
| Fase 3E | Polyfill.io removal (supply-chain attack) | ✅ SELESAI | `ade2cba` |
| Fase 3F | Fix UI: animate-wrong-shake, progress bar, notif toast | ✅ SELESAI | `ade2cba` |
| Fase 3G | Cleanup: dead code, duplicate shuffleArray, fraglie selectors | ✅ SELESAI | `ade2cba` |

## Resume Jika Ganti Model
```bash
cd /run/media/darma/Darma/Projek/Website/website/Belajar/Bahasa-Jepang
git log --oneline -5
cat PROGRESS.md
```

## File Proyek
```
assets/js/
  game-engine.js          ← shared RPG engine (~520 baris)
  partikel.game.js        ← partikel RPG (97 baris)
  kanji.game.js           ← kanji RPG (118 baris)
  kotoba.game.js          ← kotoba RPG (130 baris, +dungeon Orang)
  partikel.data.js        ← 40+ partikel definitions + soal JLPT
  partikel.js             ← partikel module main (grid, modal, progress)
  partikel.decision-tree.js
  partikel.contrast-lab.js
  partikel.practice.js    ← latihan, kontras trainer, Ujian JLPT
  partikel.utils.js       ← escapeHtml, shuffleArray
  choukai.js, kaiwa-studio.js, speech-utils.js, furigana-utils.js

assets/css/
  partikel.css            ← +animate-wrong-shake
  games.css               ← RPG styles

views/
  partikel.view.php       ← includes game-engine + partikel.game
  kanji.view.php          ← includes game-engine + kanji.game
  katakana.view.php       ← CSRF + notif feedback

bunpou.php                ← 25 grammar patterns N5 (tidak lagi placeholder)
```

## Perbaikan Terakhir (commit `ade2cba`)
- **Critical bugs (12):** opsi string→array, typo penjelasanSingkat, perbandinganDetail, DOMContentLoaded, JLPT handler, empty dungeon guard, dead return, trap question, XSS (3 tempat), CSRF (3 endpoint), logout CSRF, user_id fallback
- **Medium (7):** progress bar, clearInterval→clearTimeout, Bunpou isi, dungeon Orang, NaN validation, animate-wrong-shake CSS, notif toast
- **Low (3):** shuffleArray cleanup, dead code, fragile selector
