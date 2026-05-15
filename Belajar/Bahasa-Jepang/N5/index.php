<?php
$staticExport = __DIR__ . '/out/index.html';
if (is_file($staticExport)) {
    readfile($staticExport);
    exit;
}

$modules = [
    ['id' => 'kana', 'title' => 'Kana Library', 'desc' => 'Hiragana dan Katakana dasar dengan latihan baca.', 'icon' => 'あ', 'tag' => 'Kana'],
    ['id' => 'vocab', 'title' => 'Kosakata N5', 'desc' => 'Kata penting JLPT N5 untuk percakapan harian.', 'icon' => '語', 'tag' => 'Vocab'],
    ['id' => 'kanji', 'title' => 'Kanji Mastery', 'desc' => 'Kanji dasar dengan bacaan dan contoh sederhana.', 'icon' => '日', 'tag' => 'Kanji'],
    ['id' => 'grammar', 'title' => 'Grammar Guide', 'desc' => 'Pola kalimat N5 dari dasar sampai latihan.', 'icon' => '文', 'tag' => 'Bunpou'],
    ['id' => 'flashcards', 'title' => 'Flashcards', 'desc' => 'Latihan mengingat aktif untuk kosakata dan kana.', 'icon' => '⚡', 'tag' => 'Recall'],
    ['id' => 'quiz', 'title' => 'Boss Quiz', 'desc' => 'Tantangan soal untuk menguji pemahaman.', 'icon' => '🎮', 'tag' => 'Quiz'],
    ['id' => 'ai-chat', 'title' => 'Gemu AI Chat', 'desc' => 'Tanya jawab latihan bahasa Jepang berbasis AI.', 'icon' => '🤖', 'tag' => 'AI'],
    ['id' => 'kaiwa', 'title' => 'Kaiwa Studio', 'desc' => 'Latihan percakapan Jepang dengan format JP, RO, ID.', 'icon' => '🎙️', 'tag' => 'Speaking'],
    ['id' => 'choukai', 'title' => 'Choukai Lab', 'desc' => 'Latihan listening dengan dialog dan pertanyaan.', 'icon' => '🎧', 'tag' => 'Listening'],
    ['id' => 'writing', 'title' => 'Menulis Kana', 'desc' => 'Latihan menulis dan mengenali bentuk huruf.', 'icon' => '✍️', 'tag' => 'Writing'],
    ['id' => 'kazu', 'title' => 'Latihan Angka', 'desc' => 'Angka, harga, jam, dan hitungan sederhana.', 'icon' => '一', 'tag' => 'Number'],
    ['id' => 'exam', 'title' => 'Ujian Latihan', 'desc' => 'Simulasi soal untuk mengukur kesiapan N5.', 'icon' => '🏆', 'tag' => 'Exam'],
];

$dictionaryFile = __DIR__ . '/src/lib/n5-dictionary.ts';
$pageFile = __DIR__ . '/src/app/page.tsx';
$packageFile = __DIR__ . '/package.json';
$hasDictionary = is_file($dictionaryFile);
$hasNextPage = is_file($pageFile);
$hasPackage = is_file($packageFile);
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f766e">
    <title>Gemu Nihongo N5 | Bahasa Jepang</title>
    <meta name="description" content="Modul belajar bahasa Jepang JLPT N5 GemuYokai: Kana, kosakata, kanji, grammar, kaiwa, choukai, flashcards, dan latihan ujian.">
    <style>
        :root {
            --bg: #f7fbfa;
            --panel: rgba(255, 255, 255, .82);
            --panel-strong: rgba(255, 255, 255, .96);
            --text: #10201d;
            --muted: #60726e;
            --line: rgba(15, 118, 110, .16);
            --teal: #0f766e;
            --mint: #14b8a6;
            --emerald: #10b981;
            --rose: #fb7185;
            --amber: #f59e0b;
            --shadow: 0 24px 70px rgba(15, 118, 110, .16);
        }

        * { box-sizing: border-box; }

        html { scroll-behavior: smooth; }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: var(--text);
            background:
                radial-gradient(circle at 14% 12%, rgba(20, 184, 166, .20), transparent 30%),
                radial-gradient(circle at 86% 6%, rgba(251, 113, 133, .16), transparent 28%),
                linear-gradient(135deg, #f8fffd 0%, #eefbf8 45%, #fff7f8 100%);
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: .42;
            background-image:
                linear-gradient(rgba(15, 118, 110, .045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(15, 118, 110, .045) 1px, transparent 1px);
            background-size: 36px 36px;
            mask-image: linear-gradient(to bottom, #000, transparent 78%);
        }

        a { color: inherit; text-decoration: none; }

        .wrap {
            width: min(1180px, calc(100% - 32px));
            margin: 0 auto;
            position: relative;
            z-index: 2;
        }

        .topbar {
            position: sticky;
            top: 0;
            z-index: 20;
            backdrop-filter: blur(18px);
            background: rgba(247, 251, 250, .76);
            border-bottom: 1px solid rgba(15, 118, 110, .11);
        }

        .nav {
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 900;
            letter-spacing: -.04em;
        }

        .brand-mark {
            width: 44px;
            height: 44px;
            border-radius: 16px;
            display: grid;
            place-items: center;
            color: white;
            background: linear-gradient(135deg, var(--teal), var(--mint));
            box-shadow: 0 12px 32px rgba(20, 184, 166, .32);
            font-weight: 900;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--muted);
            font-weight: 800;
            font-size: 13px;
        }

        .nav-links a {
            padding: 10px 13px;
            border-radius: 999px;
            border: 1px solid transparent;
        }

        .nav-links a:hover {
            color: var(--teal);
            background: rgba(20, 184, 166, .08);
            border-color: rgba(20, 184, 166, .16);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            border: 0;
            cursor: pointer;
            border-radius: 999px;
            padding: 13px 18px;
            font-weight: 900;
            color: white;
            background: linear-gradient(135deg, var(--teal), var(--emerald));
            box-shadow: 0 18px 42px rgba(16, 185, 129, .28);
            transition: transform .2s ease, box-shadow .2s ease;
        }

        .btn:hover { transform: translateY(-2px); box-shadow: 0 22px 50px rgba(16, 185, 129, .36); }

        .btn.secondary {
            color: var(--teal);
            background: rgba(255, 255, 255, .72);
            border: 1px solid var(--line);
            box-shadow: none;
        }

        .hero {
            padding: 78px 0 44px;
            display: grid;
            grid-template-columns: 1.04fr .96fr;
            gap: 36px;
            align-items: center;
        }

        .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 18px;
            border: 1px solid rgba(20, 184, 166, .24);
            background: rgba(255, 255, 255, .72);
            color: var(--teal);
            border-radius: 999px;
            padding: 8px 13px;
            font-size: 12px;
            font-weight: 950;
            text-transform: uppercase;
            letter-spacing: .12em;
        }

        h1 {
            margin: 0;
            font-size: clamp(42px, 7vw, 86px);
            line-height: .92;
            letter-spacing: -.08em;
        }

        h1 span {
            display: block;
            background: linear-gradient(135deg, var(--teal), var(--mint), var(--rose));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .lead {
            max-width: 680px;
            color: var(--muted);
            font-size: clamp(16px, 2vw, 19px);
            line-height: 1.8;
            margin: 22px 0 0;
        }

        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 30px;
        }

        .hero-card {
            border: 1px solid var(--line);
            border-radius: 34px;
            padding: 22px;
            background: var(--panel);
            box-shadow: var(--shadow);
            position: relative;
            overflow: hidden;
        }

        .hero-card::before {
            content: '日本語';
            position: absolute;
            right: -12px;
            top: -22px;
            font-size: 112px;
            font-weight: 950;
            color: rgba(20, 184, 166, .08);
            letter-spacing: -.14em;
            pointer-events: none;
        }

        .kanji-card {
            min-height: 370px;
            border-radius: 28px;
            padding: 28px;
            background: linear-gradient(135deg, #0f766e, #14b8a6 48%, #fb7185);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }

        .kanji-card::after {
            content: '';
            position: absolute;
            inset: 16px;
            border: 1px solid rgba(255,255,255,.24);
            border-radius: 22px;
            pointer-events: none;
        }

        .big-kana {
            font-size: clamp(92px, 16vw, 180px);
            line-height: 1;
            font-weight: 950;
            letter-spacing: -.12em;
            text-shadow: 0 18px 46px rgba(0,0,0,.18);
        }

        .mini-line { display: flex; align-items: center; justify-content: space-between; gap: 14px; }

        .pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 8px 11px;
            border-radius: 999px;
            background: rgba(255, 255, 255, .18);
            border: 1px solid rgba(255, 255, 255, .2);
            font-size: 12px;
            font-weight: 900;
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
            margin: 22px 0 0;
        }

        .status {
            padding: 16px;
            border-radius: 22px;
            background: rgba(255, 255, 255, .62);
            border: 1px solid var(--line);
        }

        .status b { display: block; font-size: 22px; color: var(--teal); }
        .status span { display: block; margin-top: 4px; color: var(--muted); font-size: 12px; font-weight: 800; }

        .section { padding: 42px 0; }

        .section-head {
            display: flex;
            align-items: end;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 22px;
        }

        .section-title { margin: 0; font-size: clamp(26px, 3.5vw, 42px); letter-spacing: -.05em; }
        .section-sub { margin: 8px 0 0; color: var(--muted); line-height: 1.7; max-width: 680px; }

        .grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
        }

        .module {
            min-height: 220px;
            padding: 18px;
            border-radius: 26px;
            border: 1px solid var(--line);
            background: var(--panel-strong);
            box-shadow: 0 14px 44px rgba(15, 118, 110, .08);
            position: relative;
            overflow: hidden;
            transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }

        .module:hover {
            transform: translateY(-5px);
            border-color: rgba(20, 184, 166, .38);
            box-shadow: 0 20px 58px rgba(15, 118, 110, .16);
        }

        .module::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 80% 0%, rgba(20, 184, 166, .14), transparent 42%);
            pointer-events: none;
        }

        .module-top {
            position: relative;
            display: flex;
            justify-content: space-between;
            gap: 14px;
            align-items: flex-start;
        }

        .icon {
            width: 52px;
            height: 52px;
            border-radius: 18px;
            display: grid;
            place-items: center;
            color: white;
            font-size: 24px;
            font-weight: 950;
            background: linear-gradient(135deg, var(--teal), var(--mint));
            box-shadow: 0 12px 34px rgba(20, 184, 166, .28);
        }

        .tag {
            color: var(--teal);
            background: rgba(20, 184, 166, .10);
            border: 1px solid rgba(20, 184, 166, .15);
            padding: 7px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 950;
        }

        .module h3 { position: relative; margin: 22px 0 8px; font-size: 19px; letter-spacing: -.035em; }
        .module p { position: relative; margin: 0; color: var(--muted); line-height: 1.6; font-size: 14px; }

        .module button {
            position: absolute;
            left: 18px;
            right: 18px;
            bottom: 16px;
            border: 0;
            border-radius: 16px;
            padding: 11px 14px;
            cursor: pointer;
            color: var(--teal);
            background: rgba(20, 184, 166, .09);
            font-weight: 950;
        }

        .module button:hover { background: rgba(20, 184, 166, .15); }

        .panel {
            border: 1px solid var(--line);
            border-radius: 30px;
            background: rgba(255,255,255,.78);
            box-shadow: var(--shadow);
            padding: 24px;
            display: grid;
            grid-template-columns: 1.08fr .92fr;
            gap: 24px;
            align-items: stretch;
        }

        .lesson-box {
            border-radius: 24px;
            padding: 22px;
            background: linear-gradient(135deg, rgba(15,118,110,.10), rgba(251,113,133,.09));
            border: 1px solid rgba(15,118,110,.13);
        }

        .lesson-box h3 { margin: 0 0 10px; font-size: 24px; letter-spacing: -.04em; }
        .lesson-box p, .lesson-box li { color: var(--muted); line-height: 1.7; }

        .jp-sample {
            margin-top: 16px;
            border-radius: 22px;
            padding: 18px;
            background: #0f172a;
            color: #dffcf5;
            font-weight: 800;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
        }

        .jp-sample .jp { font-size: 28px; line-height: 1.35; }
        .jp-sample .ro { color: #67e8f9; margin-top: 10px; }
        .jp-sample .id { color: #fbcfe8; margin-top: 6px; }

        .steps {
            display: grid;
            gap: 12px;
        }

        .step {
            border-radius: 20px;
            padding: 16px;
            border: 1px solid var(--line);
            background: rgba(255,255,255,.76);
            display: flex;
            gap: 14px;
            align-items: flex-start;
        }

        .num {
            width: 32px;
            height: 32px;
            border-radius: 12px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            color: white;
            background: var(--teal);
            font-weight: 950;
        }

        .step b { display: block; margin-bottom: 3px; }
        .step span { color: var(--muted); line-height: 1.55; font-size: 14px; }

        .footer {
            margin-top: 34px;
            padding: 32px 0 42px;
            color: var(--muted);
            text-align: center;
        }

        .hide-mobile { display: inline-flex; }

        @media (max-width: 980px) {
            .hero, .panel { grid-template-columns: 1fr; }
            .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .nav-links { display: none; }
            .hero { padding-top: 52px; }
        }

        @media (max-width: 640px) {
            .wrap { width: min(100% - 22px, 1180px); }
            .nav { height: 66px; }
            .brand-text small { display: none; }
            .hero-actions .btn { width: 100%; }
            .hero-card { padding: 14px; border-radius: 26px; }
            .kanji-card { min-height: 310px; border-radius: 22px; padding: 22px; }
            .status-grid, .grid { grid-template-columns: 1fr; }
            .section-head { align-items: flex-start; flex-direction: column; }
            .panel { padding: 16px; border-radius: 24px; }
            .hide-mobile { display: none; }
        }
    </style>
</head>
<body>
    <header class="topbar">
        <div class="wrap nav">
            <a class="brand" href="./index.php" aria-label="Gemu Nihongo N5">
                <span class="brand-mark">N5</span>
                <span class="brand-text">Gemu Nihongo<br><small style="color:var(--muted);letter-spacing:0;font-weight:800">JLPT N5 Learning Hub</small></span>
            </a>
            <nav class="nav-links" aria-label="Navigasi N5">
                <a href="#modul">Modul</a>
                <a href="#belajar">Belajar</a>
                <a href="../index.php">Bahasa Jepang</a>
            </nav>
            <a class="btn secondary hide-mobile" href="../index.php">← Kembali</a>
        </div>
    </header>

    <main>
        <section class="wrap hero">
            <div>
                <div class="eyebrow">🌸 GemuYokai Bahasa Jepang</div>
                <h1>Belajar Jepang <span>Level N5</span></h1>
                <p class="lead">Halaman ini adalah gerbang modul N5 di folder <b>Belajar/Bahasa-Jepang/N5</b>. Mode PHP fallback ini menjaga URL <b>N5/index.php</b> tetap hidup di cPanel sambil tetap membaca struktur project N5 yang sudah ada.</p>
                <div class="hero-actions">
                    <a class="btn" href="#modul">Mulai dari Modul N5 →</a>
                    <a class="btn secondary" href="#belajar">Lihat Alur Belajar</a>
                </div>
                <div class="status-grid" aria-label="Status project N5">
                    <div class="status"><b><?php echo $hasPackage ? 'Aktif' : 'Cek'; ?></b><span>package.json</span></div>
                    <div class="status"><b><?php echo $hasNextPage ? 'Ada' : 'Belum'; ?></b><span>src/app/page.tsx</span></div>
                    <div class="status"><b><?php echo $hasDictionary ? 'Siap' : 'Cek'; ?></b><span>Kamus N5 AI</span></div>
                </div>
            </div>

            <aside class="hero-card" aria-label="Kartu pembuka N5">
                <div class="kanji-card">
                    <div class="mini-line">
                        <span class="pill">JLPT N5</span>
                        <span class="pill">Kaiwa + Choukai</span>
                    </div>
                    <div>
                        <div class="big-kana">日本語</div>
                        <p style="margin:8px 0 0;font-weight:800;line-height:1.7">Nihongo • Bahasa Jepang • Dasar sampai siap latihan.</p>
                    </div>
                    <div class="mini-line">
                        <span>あ い う え お</span>
                        <span>文法・語彙・聴解</span>
                    </div>
                </div>
            </aside>
        </section>

        <section class="wrap section" id="modul">
            <div class="section-head">
                <div>
                    <h2 class="section-title">Modul N5</h2>
                    <p class="section-sub">Disusun dari kana, kosakata, kanji, tata bahasa, latihan AI, kaiwa, choukai, sampai ujian latihan. Tombol di bawah menyiapkan fokus belajar pada panel ringkasan.</p>
                </div>
                <a class="btn secondary" href="../index.php">Halaman Bahasa Jepang</a>
            </div>

            <div class="grid">
                <?php foreach ($modules as $module): ?>
                    <article class="module">
                        <div class="module-top">
                            <span class="icon"><?php echo htmlspecialchars($module['icon'], ENT_QUOTES, 'UTF-8'); ?></span>
                            <span class="tag"><?php echo htmlspecialchars($module['tag'], ENT_QUOTES, 'UTF-8'); ?></span>
                        </div>
                        <h3><?php echo htmlspecialchars($module['title'], ENT_QUOTES, 'UTF-8'); ?></h3>
                        <p><?php echo htmlspecialchars($module['desc'], ENT_QUOTES, 'UTF-8'); ?></p>
                        <button type="button" data-module="<?php echo htmlspecialchars($module['id'], ENT_QUOTES, 'UTF-8'); ?>" data-title="<?php echo htmlspecialchars($module['title'], ENT_QUOTES, 'UTF-8'); ?>" data-desc="<?php echo htmlspecialchars($module['desc'], ENT_QUOTES, 'UTF-8'); ?>">Fokus modul ini</button>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="wrap section" id="belajar">
            <div class="panel">
                <div class="lesson-box">
                    <h3 id="focusTitle">Alur Belajar N5</h3>
                    <p id="focusDesc">Mulai dari kana, lanjut kosakata dan grammar, lalu gunakan Kaiwa dan Choukai untuk melatih respons serta pendengaran.</p>
                    <div class="jp-sample">
                        <div class="jp">私[わたし]は 日本語[にほんご]を 勉強[べんきょう]します。</div>
                        <div class="ro">Watashi wa nihongo o benkyou shimasu.</div>
                        <div class="id">Saya belajar bahasa Jepang.</div>
                    </div>
                </div>

                <div class="steps">
                    <div class="step"><span class="num">1</span><div><b>Kana dulu</b><span>Kenali Hiragana dan Katakana agar tidak bergantung pada romaji.</span></div></div>
                    <div class="step"><span class="num">2</span><div><b>Kosakata + grammar</b><span>Gabungkan kata dasar dengan pola N5 seperti です, ます, ませんか, dan ください.</span></div></div>
                    <div class="step"><span class="num">3</span><div><b>Kaiwa dan Choukai</b><span>Latih bicara dan listening memakai format JP, RO, ID serta kamus N5 internal.</span></div></div>
                    <div class="step"><span class="num">4</span><div><b>Quiz dan ujian</b><span>Gunakan flashcards, boss quiz, dan mock exam untuk mengukur pemahaman.</span></div></div>
                </div>
            </div>
        </section>
    </main>

    <footer class="wrap footer">
        <b>GemuYokai N5</b> • Halaman fallback PHP untuk memastikan <code>N5/index.php</code> tidak 404 di hosting.
    </footer>

    <script>
        const focusTitle = document.getElementById('focusTitle');
        const focusDesc = document.getElementById('focusDesc');

        document.querySelectorAll('[data-module]').forEach((button) => {
            button.addEventListener('click', () => {
                const title = button.getAttribute('data-title') || 'Modul N5';
                const desc = button.getAttribute('data-desc') || 'Latihan bahasa Jepang level N5.';
                focusTitle.textContent = title;
                focusDesc.textContent = desc + ' Modul ini terhubung dengan struktur belajar N5 yang sudah ada di project.';
                document.getElementById('belajar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    </script>
</body>
</html>
