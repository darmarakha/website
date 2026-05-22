# Build Progress — Partikel Module & Game Engine

## Protokol
- Setiap selesai satu FILE → auto commit + tag.
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
| Fase 1E | Particle Quest RPG — 7 dungeon + boss (679 baris) | ✅ SELESAI | `83f3ba8` |

## Status Fase 2 — Shared Game Engine

| Fase | Deskripsi | Status | Commit |
|------|-----------|--------|--------|
| Fase 2A | `game-engine.js` — 516 baris reusable + refactor partikel (97 baris) | ✅ SELESAI | `505d2bf` |
| Fase 2B | Kanji Quest RPG — 8 dungeon, mixed quiz (kanji→arti, arti→kanji, onyomi) | ✅ SELESAI | `24d56d3` |
| Fase 2C | Kotoba Dungeon — 8 dungeon, vocabulary quiz (jp→id, id→jp, romaji→kana) | ✅ SELESAI | `4dddd0b` |

## File Engine (Baru)
- `assets/js/game-engine.js` — 516 baris, reusable RPG engine
  - `GameEngine.createRPG(config)` → game object
  - Lobby, battle, boss intro, boss battle, boss victory, game over
  - Player stats, level-up, hint system, dungeon progression
  - Fully configurable via callbacks (questionGenerator, renderQuestion, getEnemy, dll)

## File Game (Menggunakan Engine)
- `assets/js/partikel.game.js` — 97 baris (turun dari 679!) — Particle Quest RPG
- `assets/js/kanji.game.js` — 118 baris — Kanji Quest RPG
- `assets/js/kotoba.game.js` — 127 baris — Kotoba Dungeon

## Resume Jika Ganti Model
```bash
cd /run/media/darma/Darma/Projek/Website/website/Belajar/Bahasa-Jepang
git log --oneline -5
cat PROGRESS.md
```

## File Proyek
```
assets/js/
  game-engine.js          ← shared engine (516 lines)
  partikel.game.js        ← partikel RPG (97 lines, refactored)
  kanji.game.js           ← kanji RPG (118 lines)
  kotoba.game.js          ← kotoba RPG (127 lines)
  partikel.data.js        ← 40+ particle definitions
  partikel.js             ← partikel module main
  partikel.decision-tree.js
  partikel.contrast-lab.js
  partikel.practice.js
  partikel.utils.js       ← shared utilities (escapeHtml, shuffleArray)
  choukai.js, kaiwa-studio.js, speech-utils.js, furigana-utils.js, script.js

views/
  partikel.view.php       ← includes game-engine + partikel.game
  kanji.view.php          ← includes game-engine + kanji.game
  (kotoba langsung di kotoba.php)

kotoba.php                ← includes game-engine + kotoba.game
```
