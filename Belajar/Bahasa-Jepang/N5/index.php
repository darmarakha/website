<?php
function h($value) {
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function safe_id($value) {
    return preg_replace('/[^a-z0-9\-]/', '', strtolower((string) $value));
}

$menus = [
    'hiragana' => [
        'title' => 'Hiragana',
        'kana' => 'あ',
        'tag' => 'Huruf Dasar',
        'desc' => 'Belajar bentuk, bunyi, dakuten, handakuten, dan yoon hiragana.',
        'status' => 'Siap dipelajari',
        'accent' => 'cyan',
        'points' => ['A-I-U-E-O sampai N', 'Dakuten dan handakuten', 'Yoon seperti きゃ・しゅ・ちょ', 'Latihan baca tanpa romaji bertahap'],
        'sample' => 'あ・い・う・え・お',
        'romaji' => 'a・i・u・e・o',
    ],
    'katakana' => [
        'title' => 'Katakana',
        'kana' => 'ア',
        'tag' => 'Kata Serapan',
        'desc' => 'Latihan katakana untuk nama asing, makanan, teknologi, dan bunyi serapan.',
        'status' => 'Siap dipelajari',
        'accent' => 'blue',
        'points' => ['A-I-U-E-O katakana', 'Kata serapan umum', 'Panjang bunyi dengan ー', 'Perbandingan hiragana vs katakana'],
        'sample' => 'アイス・カメラ・ゲーム',
        'romaji' => 'aisu・kamera・geemu',
    ],
    'kanji' => [
        'title' => 'Kanji N5',
        'kana' => '日',
        'tag' => 'Makna & Bacaan',
        'desc' => 'Kanji dasar N5 dengan arti, contoh, dan bacaan yang diberi furigana.',
        'status' => 'Menu aktif',
        'accent' => 'amber',
        'points' => ['日・月・人・本・語', 'Bacaan onyomi dan kunyomi ringan', 'Contoh kalimat pendek', 'Latihan mengenali bentuk'],
        'sample' => '日本語・月曜日・人',
        'romaji' => 'nihongo・getsuyoubi・hito',
    ],
    'kosakata' => [
        'title' => 'Kosakata',
        'kana' => '語',
        'tag' => 'N5 Core',
        'desc' => 'Kata harian untuk salam, sekolah, rumah, waktu, arah, makanan, dan belanja.',
        'status' => 'Menu aktif',
        'accent' => 'emerald',
        'points' => ['Kata benda harian', 'Kata kerja bentuk ます', 'Kata tanya N5', 'Tema sekolah, rumah, stasiun, restoran'],
        'sample' => '水・学校・駅・先生',
        'romaji' => 'mizu・gakkou・eki・sensei',
    ],
    'partikel' => [
        'title' => 'Partikel',
        'kana' => 'は',
        'tag' => 'Grammar Dasar',
        'desc' => 'Fokus partikel penting: は, を, に, へ, で, も, と, か.',
        'status' => 'Menu aktif',
        'accent' => 'pink',
        'points' => ['は dibaca wa', 'へ dibaca e', 'を dibaca o', 'に untuk waktu/tempat', 'で untuk lokasi aksi'],
        'sample' => '学校へ行きます。',
        'romaji' => 'gakkou e ikimasu',
    ],
    'grammar' => [
        'title' => 'Grammar',
        'kana' => '文',
        'tag' => 'Bunpou',
        'desc' => 'Pola kalimat N5 dari A は B です sampai ajakan sederhana.',
        'status' => 'Menu aktif',
        'accent' => 'violet',
        'points' => ['A は B です', '〜ですか', 'N を Vます', '〜ませんか', '〜てください'],
        'sample' => '私は学生です。',
        'romaji' => 'watashi wa gakusei desu',
    ],
    'membaca' => [
        'title' => 'AI Membaca',
        'kana' => '読',
        'tag' => 'Reading',
        'desc' => 'Latihan membaca kalimat N5 dengan koreksi romaji, arti, dan petunjuk partikel.',
        'status' => 'Disiapkan',
        'accent' => 'cyan',
        'points' => ['Baca kalimat pendek', 'Cek partikel khusus', 'Feedback JP / Romaji / Indonesia', 'Cocok untuk latihan pelafalan'],
        'sample' => '今日は学校へ行きます。',
        'romaji' => 'kyou wa gakkou e ikimasu',
    ],
    'mendengar' => [
        'title' => 'Choukai',
        'kana' => '聞',
        'tag' => 'Listening',
        'desc' => 'Latihan mendengar kata kunci waktu, tempat, harga, arah, dan dialog pendek.',
        'status' => 'Disiapkan',
        'accent' => 'blue',
        'points' => ['Dengar waktu dan tempat', 'Tangkap kata kunci', 'Ulang audio yang salah', 'Latihan dialog N5'],
        'sample' => '午後三時に駅で会います。',
        'romaji' => 'gogo sanji ni eki de aimasu',
    ],
    'berbicara' => [
        'title' => 'Kaiwa',
        'kana' => '話',
        'tag' => 'Speaking',
        'desc' => 'Latihan percakapan sederhana: salam, perkenalan, bertanya, dan membuat ajakan.',
        'status' => 'Disiapkan',
        'accent' => 'emerald',
        'points' => ['Salam dan perkenalan', 'Tanya hobi dan kegiatan', 'Ajakan dengan ませんか', 'Respons pendek yang sopan'],
        'sample' => '一緒に映画を見ませんか。',
        'romaji' => 'issho ni eiga o mimasen ka',
    ],
    'flashcard' => [
        'title' => 'Flashcard',
        'kana' => '札',
        'tag' => 'Recall',
        'desc' => 'Kartu hafalan untuk kana, kosakata, kanji, dan partikel yang sering tertukar.',
        'status' => 'Menu aktif',
        'accent' => 'amber',
        'points' => ['Tebak sebelum buka jawaban', 'Ulang kartu salah', 'Acak kartu', 'Target hafalan per sesi'],
        'sample' => '表: 学校 / 裏: sekolah',
        'romaji' => 'omote: gakkou / ura: sekolah',
    ],
    'quiz' => [
        'title' => 'Quiz N5',
        'kana' => '問',
        'tag' => 'Latihan Soal',
        'desc' => 'Latihan soal campuran untuk cek pemahaman kana, kosakata, partikel, dan grammar.',
        'status' => 'Menu aktif',
        'accent' => 'pink',
        'points' => ['Pilihan ganda', 'Pembahasan langsung', 'Review materi salah', 'Cek kesiapan N5'],
        'sample' => 'これは何ですか。',
        'romaji' => 'kore wa nan desu ka',
    ],
    'ujian' => [
        'title' => 'Ujian Latihan',
        'kana' => '試',
        'tag' => 'Mock Test',
        'desc' => 'Simulasi akhir setelah belajar kana, kosakata, grammar, listening, dan speaking.',
        'status' => 'Disiapkan',
        'accent' => 'violet',
        'points' => ['Review menyeluruh', 'Soal campuran', 'Catatan kelemahan', 'Persiapan ujian N5'],
        'sample' => '明日学校へ行きます。',
        'romaji' => 'ashita gakkou e ikimasu',
    ],
];

$activeId = safe_id($_GET['menu'] ?? '');
$active = $menus[$activeId] ?? null;

if (($_GET['api'] ?? '') === 'menu') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'active' => $active, 'menus' => $menus], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$readyCount = count(array_filter($menus, fn($menu) => str_contains(strtolower($menu['status']), 'aktif') || str_contains(strtolower($menu['status']), 'siap')));
$totalCount = count($menus);
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#07111f">
    <title>Menu N5 | GemuYokai Nihongo</title>
    <meta name="description" content="Menu utama pembelajaran Bahasa Jepang N5 GemuYokai: Hiragana, Katakana, Kanji, Kosakata, Partikel, Grammar, AI Membaca, Choukai, Kaiwa, Flashcard, Quiz, dan Ujian.">
    <style>
        :root{--bg:#07111f;--panel:rgba(15,23,42,.82);--panel2:rgba(30,41,59,.72);--text:#eef6ff;--muted:#a9b8c9;--line:rgba(148,163,184,.22);--cyan:#35d6d6;--blue:#58a6ff;--emerald:#34d399;--amber:#f59e0b;--pink:#fb7185;--violet:#a78bfa;--shadow:0 24px 80px rgba(0,0,0,.35)}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text);background:radial-gradient(circle at 12% 0%,rgba(53,214,214,.20),transparent 34%),radial-gradient(circle at 86% 6%,rgba(251,113,133,.16),transparent 30%),linear-gradient(135deg,#07111f 0%,#0f172a 48%,#111827 100%);overflow-x:hidden}body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(148,163,184,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.055) 1px,transparent 1px);background-size:38px 38px;mask-image:linear-gradient(to bottom,#000,transparent 82%)}a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 28px));margin:auto;position:relative;z-index:1}.top{position:sticky;top:0;z-index:10;border-bottom:1px solid var(--line);background:rgba(7,17,31,.78);backdrop-filter:blur(18px)}.nav{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:14px}.brand{display:flex;align-items:center;gap:12px;font-weight:950;letter-spacing:-.035em}.mark{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,var(--cyan),var(--blue));color:#06121d;box-shadow:0 18px 42px rgba(53,214,214,.22)}.brand small{display:block;color:var(--muted);font-weight:750;letter-spacing:0}.nav-actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:0;border-radius:999px;padding:11px 15px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#06121d;background:linear-gradient(135deg,var(--cyan),var(--blue));box-shadow:0 16px 38px rgba(53,214,214,.20);transition:.18s}.btn:hover{transform:translateY(-2px)}.btn.ghost{color:var(--text);background:rgba(255,255,255,.06);border:1px solid var(--line);box-shadow:none}.intro{padding:38px 0 24px;display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:stretch}.panel{border:1px solid var(--line);border-radius:28px;background:var(--panel);box-shadow:var(--shadow);padding:24px;position:relative;overflow:hidden}.panel:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 86% 0%,rgba(53,214,214,.12),transparent 42%);pointer-events:none}.eyebrow{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(53,214,214,.25);background:rgba(53,214,214,.08);color:var(--cyan);border-radius:999px;padding:8px 11px;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.12em}.intro h1{font-size:clamp(34px,5vw,58px);line-height:.98;margin:16px 0 0;letter-spacing:-.065em}.intro p{color:var(--muted);line-height:1.75;margin:14px 0 0;max-width:740px}.statbox{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.stat{border:1px solid var(--line);background:rgba(255,255,255,.055);border-radius:18px;padding:13px}.stat b{display:block;font-size:24px;color:var(--cyan)}.stat span{display:block;color:var(--muted);font-size:12px;font-weight:800}.preview{min-height:100%;display:flex;flex-direction:column;justify-content:space-between}.preview-kana{font-size:clamp(68px,9vw,124px);line-height:1;font-weight:950;letter-spacing:-.08em;background:linear-gradient(135deg,var(--cyan),var(--blue),var(--pink));-webkit-background-clip:text;background-clip:text;color:transparent}.preview-title{font-size:24px;font-weight:950;margin-top:8px}.preview-desc{color:var(--muted);line-height:1.7}.section{padding:24px 0 44px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:16px}.section-head h2{font-size:clamp(26px,4vw,42px);margin:0;letter-spacing:-.055em}.section-head p{margin:7px 0 0;color:var(--muted)}.menu-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.menu-card{min-height:205px;border:1px solid var(--line);border-radius:24px;padding:17px;background:rgba(15,23,42,.78);box-shadow:0 14px 46px rgba(0,0,0,.18);position:relative;overflow:hidden;transition:.18s}.menu-card:hover,.menu-card.active{transform:translateY(-4px);border-color:rgba(53,214,214,.52);box-shadow:0 20px 60px rgba(0,0,0,.28)}.menu-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 84% 0%,var(--glow),transparent 46%);pointer-events:none}.card-top{position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.icon{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;font-size:27px;font-weight:950;color:#06121d;background:linear-gradient(135deg,var(--a),var(--b))}.tag{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);border-radius:999px;padding:7px 9px;font-size:11px;font-weight:900;color:var(--soft)}.menu-card h3{position:relative;margin:17px 0 8px;font-size:18px;letter-spacing:-.03em}.menu-card p{position:relative;margin:0;color:var(--muted);font-size:13px;line-height:1.55}.status{position:absolute;left:17px;right:17px;bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--soft);font-size:12px;font-weight:900}.arrow{width:28px;height:28px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.07);border:1px solid var(--line)}.cyan{--a:var(--cyan);--b:var(--blue);--soft:#67e8f9;--glow:rgba(53,214,214,.14)}.blue{--a:var(--blue);--b:#7dd3fc;--soft:#93c5fd;--glow:rgba(88,166,255,.14)}.emerald{--a:var(--emerald);--b:var(--cyan);--soft:#86efac;--glow:rgba(52,211,153,.14)}.amber{--a:var(--amber);--b:#facc15;--soft:#fde68a;--glow:rgba(245,158,11,.16)}.pink{--a:var(--pink);--b:#f0abfc;--soft:#fda4af;--glow:rgba(251,113,133,.15)}.violet{--a:var(--violet);--b:#60a5fa;--soft:#c4b5fd;--glow:rgba(167,139,250,.16)}.detail{margin-top:18px;display:grid;grid-template-columns:.82fr 1.18fr;gap:14px}.detail .big{min-height:250px;display:grid;place-items:center;text-align:center}.big-char{font-size:clamp(84px,16vw,170px);line-height:1;font-weight:950;background:linear-gradient(135deg,var(--cyan),var(--blue),var(--pink));-webkit-background-clip:text;background-clip:text;color:transparent}.detail h2{margin:0 0 8px;font-size:32px;letter-spacing:-.045em}.sample{border:1px solid var(--line);background:rgba(255,255,255,.055);border-radius:20px;padding:15px;margin:14px 0}.sample strong{font-size:26px;display:block}.sample span{display:block;color:var(--cyan);font-weight:850;margin-top:6px}.points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.point{border:1px solid var(--line);background:rgba(255,255,255,.045);border-radius:16px;padding:12px;color:var(--muted);font-size:13px;line-height:1.5}.empty{border:1px dashed rgba(148,163,184,.32);background:rgba(255,255,255,.035);border-radius:24px;padding:20px;color:var(--muted);text-align:center}.footer{padding:24px 0 44px;color:var(--muted);text-align:center;font-size:13px}@media(max-width:980px){.intro,.detail{grid-template-columns:1fr}.menu-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nav{align-items:flex-start;padding:12px 0}.statbox{grid-template-columns:repeat(3,1fr)}}@media(max-width:620px){.wrap{width:min(100% - 22px,1180px)}.menu-grid,.points,.statbox{grid-template-columns:1fr}.panel{padding:18px}.brand small{display:none}.nav-actions{width:100%}.nav-actions .btn{flex:1}.menu-card{min-height:190px}.section-head{display:block}}
    </style>
</head>
<body>
    <header class="top">
        <div class="wrap nav">
            <a class="brand" href="index.php" aria-label="Menu N5">
                <div class="mark">N5</div>
                <div>GemuYokai Nihongo<small>Menu utama Bahasa Jepang N5</small></div>
            </a>
            <div class="nav-actions">
                <a class="btn ghost" href="../index.php">← Bahasa Jepang</a>
                <a class="btn" href="#menu">Pilih Menu</a>
            </div>
        </div>
    </header>

    <main class="wrap">
        <section class="intro" aria-labelledby="page-title">
            <div class="panel">
                <span class="eyebrow">入口・Menu N5</span>
                <h1 id="page-title">Pilih bagian belajar dulu.</h1>
                <p>Halaman ini sekarang dibuat sebagai menu utama N5. Dari sini baru masuk ke Hiragana, Katakana, Kanji, Kosakata, Partikel, Grammar, AI Membaca, Listening, Speaking, Flashcard, Quiz, atau Ujian.</p>
                <div class="statbox">
                    <div class="stat"><b><?= h($totalCount) ?></b><span>total menu</span></div>
                    <div class="stat"><b><?= h($readyCount) ?></b><span>siap / aktif</span></div>
                    <div class="stat"><b>N5</b><span>level belajar</span></div>
                </div>
            </div>
            <aside class="panel preview" aria-label="Preview menu">
                <div>
                    <div class="preview-kana">日本語</div>
                    <div class="preview-title">Menu ringkas, bukan modul langsung</div>
                    <p class="preview-desc">Klik salah satu kartu di bawah untuk melihat ringkasan materi. Setelah struktur fitur dipisah, tombolnya bisa diarahkan ke halaman latihan masing-masing.</p>
                </div>
                <a class="btn ghost" href="#menu">Lihat semua menu</a>
            </aside>
        </section>

        <section class="section" id="menu">
            <div class="section-head">
                <div>
                    <h2>Menu Belajar N5</h2>
                    <p>Pilih satu pintu masuk. Tidak langsung dipaksa masuk modul panjang.</p>
                </div>
            </div>
            <div class="menu-grid">
                <?php foreach ($menus as $id => $item): ?>
                    <a class="menu-card <?= h($item['accent']) ?> <?= $activeId === $id ? 'active' : '' ?>" href="?menu=<?= h($id) ?>#detail" aria-label="Buka <?= h($item['title']) ?>">
                        <div class="card-top">
                            <div class="icon"><?= h($item['kana']) ?></div>
                            <span class="tag"><?= h($item['tag']) ?></span>
                        </div>
                        <h3><?= h($item['title']) ?></h3>
                        <p><?= h($item['desc']) ?></p>
                        <div class="status"><span><?= h($item['status']) ?></span><span class="arrow">→</span></div>
                    </a>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="section" id="detail">
            <?php if ($active): ?>
                <div class="detail">
                    <div class="panel big <?= h($active['accent']) ?>">
                        <div>
                            <div class="big-char"><?= h($active['kana']) ?></div>
                            <span class="tag"><?= h($active['tag']) ?></span>
                        </div>
                    </div>
                    <div class="panel">
                        <span class="eyebrow">Detail Menu</span>
                        <h2><?= h($active['title']) ?></h2>
                        <p><?= h($active['desc']) ?></p>
                        <div class="sample">
                            <strong><?= h($active['sample']) ?></strong>
                            <span><?= h($active['romaji']) ?></span>
                        </div>
                        <div class="points">
                            <?php foreach ($active['points'] as $point): ?>
                                <div class="point">✓ <?= h($point) ?></div>
                            <?php endforeach; ?>
                        </div>
                        <div class="nav-actions">
                            <a class="btn" href="#menu">Pilih menu lain</a>
                            <a class="btn ghost" href="index.php">Kembali ke awal N5</a>
                        </div>
                    </div>
                </div>
            <?php else: ?>
                <div class="empty">Pilih salah satu menu di atas untuk melihat ringkasan. Halaman awal sengaja dibuat bersih sebagai launcher.</div>
            <?php endif; ?>
        </section>
    </main>

    <footer class="footer wrap">GemuYokai Nihongo N5 · Menu utama pembelajaran Bahasa Jepang</footer>
</body>
</html>
