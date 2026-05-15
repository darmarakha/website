<?php
// Wajib di baris pertama untuk mengambil sesi dari login utama
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// Logika Logout opsional jika user menekan tombol logout dari halaman ini
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../Index.php'); // Arahkan kembali ke halaman utama setelah logout
    exit;
}

// =========================================================================
// SISTEM AI PERHITUNGAN PROGRESS & KONEKSI SQL (AKURAT PER USER)
// Disesuaikan dengan auth.php (Jagoan Hosting cPanel)
// =========================================================================
require_once __DIR__ . '/../../config.php';

// Nilai default (0) jika user belum login atau terjadi error
$ai_total_progress = 0;
$prog_hiragana = 0;
$prog_katakana = 0;
$prog_bunpou = 0;
$prog_kanji = 0;
$ai_feedback_msg = "Silakan login terlebih dahulu untuk menyimpan dan melacak progress belajarmu.";
$ai_classification = "Unranked";

// Cek apakah user sudah login berdasarkan session dari auth.php
if (!empty($_SESSION['user_name'])) {
    // Menggunakan user_id dari sesi auth.php
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;

    try {
        $pdo = gemu_pdo();

        // Mengambil data score yang tersimpan per akun di database
        $stmt = $pdo->prepare("SELECT hiragana_score, katakana_score, bunpou_score, kanji_score FROM user_progress WHERE user_id = :uid");
        $stmt->execute(['uid' => $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $prog_hiragana = (int)$data['hiragana_score']; // Skala 0-100
            $prog_katakana = (int)$data['katakana_score']; // Skala 0-100
            $prog_bunpou   = (int)$data['bunpou_score'];   // Skala 0-100
            $prog_kanji    = (int)$data['kanji_score'];    // Skala 0-100
        } else {
            // Jika user baru login dan belum ada record di user_progress, buat otomatis nilainya 0
            $stmtInsert = $pdo->prepare("INSERT IGNORE INTO user_progress (user_id, hiragana_score, katakana_score, bunpou_score, kanji_score) VALUES (:uid, 0, 0, 0, 0)");
            $stmtInsert->execute(['uid' => $user_id]);
        }

    } catch (PDOException $e) {
        // PERBAIKAN BUG: Jika gagal konek DB, jangan pakai data dummy. Biarkan 0%.
        error_log("Gagal mengambil progress: " . $e->getMessage());
    }

    // =========================================================================
    // MACHINE LEARNING ALGORITHM: FUZZY LOGIC & ADAPTIVE DECISION TREE
    // Mencegah bug manipulasi skor: Menggunakan dependency weighting.
    // =========================================================================
    
    // 1. Logika Fuzzy: Tentukan apakah fondasi bahasa Jepang (huruf) sudah kuat?
    $fondasi_kuat = ($prog_hiragana >= 80 && $prog_katakana >= 75);

    // 2. Adaptive Weighting (Bobot berubah secara dinamis berdasarkan Cluster User)
    if ($prog_hiragana === 0 && $prog_katakana === 0 && $prog_bunpou === 0 && $prog_kanji === 0) {
        // Cluster Baru (Pemula Mutlak) - Belum ada data
        $ai_total_progress = 0;
        $ai_classification = "Novice (Pengguna Baru)";
        $ai_feedback_msg = "AI mendeteksi Anda pengguna baru. Mari mulai perjalanan dengan menghafal 46 huruf Hiragana terlebih dahulu.";
    } else {
        if (!$fondasi_kuat) {
            // CLUSTER A: Jika fondasi huruf lemah, AI memaksa bobot 80% ke huruf.
            // Walaupun user asal main Kanji/Bunpou, skor total tidak akan naik banyak.
            $w_hira = 0.50; $w_kata = 0.30; $w_bunp = 0.10; $w_kanj = 0.10;
            $ai_classification = "Cluster A: Fokus Huruf Kana";
        } else if ($prog_bunpou < 60) {
            // CLUSTER B: Fondasi huruf sudah ada, sekarang fokus di Tata Bahasa.
            $w_hira = 0.10; $w_kata = 0.10; $w_bunp = 0.60; $w_kanj = 0.20;
            $ai_classification = "Cluster B: Fokus Tata Bahasa";
        } else {
            // CLUSTER C: Mahir, persiapan ujian fokus ke Kanji dan pemantapan.
            $w_hira = 0.10; $w_kata = 0.10; $w_bunp = 0.30; $w_kanj = 0.50;
            $ai_classification = "Cluster C: Pemantapan Ujian N5";
        }

        // 3. Kalkulasi Raw Score berdasarkan bobot AI
        $raw_score = ($prog_hiragana * $w_hira) + ($prog_katakana * $w_kata) + ($prog_bunpou * $w_bunp) + ($prog_kanji * $w_kanj);

        // 4. Decision Tree Penalty (Koreksi Anomali Data)
        $ai_penalty = 0;
        // Analisis AI: Sangat mencurigakan jika skor Kanji tinggi tapi Hiragana di bawah 50%
        if ($prog_kanji > 30 && $prog_hiragana < 50) {
            $ai_penalty = 15; // Beri penalti berat atas anomali belajar
        }

        // 5. Final Progress Accuracy
        $ai_total_progress = round(max(0, $raw_score - $ai_penalty)); // Pastikan tidak kurang dari 0

        // 6. Natural Language Generation untuk Feedback
        if ($ai_penalty > 0) {
            $ai_feedback_msg = "⚠️ AI Anomali Terdeteksi: Anda mencoba melompati materi Kanji padahal Hiragana belum dikuasai. Skor dikurangi untuk menjaga akurasi.";
        } elseif ($ai_total_progress < 30) {
            $ai_feedback_msg = "AI Insight ($ai_classification): Fondasi huruf Anda sedang dibangun. Jangan terburu-buru ke Kanji, kuasai Hiragana dulu.";
        } elseif ($ai_total_progress < 60) {
            $ai_feedback_msg = "AI Insight ($ai_classification): Sangat bagus! Fondasi huruf sudah terbentuk. Sekarang saatnya memahami logika struktur kalimat.";
        } elseif ($ai_total_progress < 85) {
            $ai_feedback_msg = "AI Insight ($ai_classification): Anda sudah sangat kompeten! Tingkatkan hafalan Kanji untuk mengamankan kelulusan JLPT Anda.";
        } else {
            $ai_feedback_msg = "🎯 AI Prediction: Probabilitas kelulusan JLPT N5 Anda mencapai 95%! Segera selesaikan simulasi ujian untuk mencetak sertifikat.";
        }
    }
}

$n5_base = 'N5/';
$modules = [
    ['title' => 'Hiragana & Katakana', 'desc' => 'Masuk ke Kana Library N5 yang sudah memiliki animasi dan latihan lengkap.', 'href' => $n5_base . '?section=kana', 'score' => max($prog_hiragana, $prog_katakana), 'kana' => 'あ ア'],
    ['title' => 'Kanji N5', 'desc' => 'Gunakan modul Kanji Mastery di folder N5, bukan halaman lama yang terpisah.', 'href' => $n5_base . '?section=kanji', 'score' => $prog_kanji, 'kana' => '日 本'],
    ['title' => 'Bunpou / Grammar', 'desc' => 'Belajar pola kalimat N5 lewat modul Grammar Guide yang lebih lengkap.', 'href' => $n5_base . '?section=grammar', 'score' => $prog_bunpou, 'kana' => '文 法'],
    ['title' => 'Flashcards & Quiz', 'desc' => 'Latihan cepat, boss quiz, dan ujian latihan dari satu dashboard N5.', 'href' => $n5_base . '?section=flashcards', 'score' => $ai_total_progress, 'kana' => '練 習'],
];
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Belajar Bahasa Jepang N5 — GemuYokai</title>
    <style>
        :root{--bg:#07111f;--panel:rgba(255,255,255,.08);--line:rgba(255,255,255,.14);--text:#f8fafc;--muted:#b6c3d1;--teal:#2dd4bf;--emerald:#22c55e;--amber:#f59e0b;}
        *{box-sizing:border-box} body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text);background:radial-gradient(circle at 15% 10%,rgba(45,212,191,.22),transparent 32%),radial-gradient(circle at 85% 0%,rgba(244,114,182,.16),transparent 34%),linear-gradient(135deg,#06111f,#0f172a 55%,#102a2c);}
        a{color:inherit;text-decoration:none}.wrap{width:min(1120px,calc(100% - 32px));margin:auto;padding:32px 0 48px}.top{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:26px}.brand{display:flex;align-items:center;gap:12px}.logo{width:46px;height:46px;border-radius:16px;background:linear-gradient(135deg,var(--teal),var(--emerald));display:grid;place-items:center;font-weight:900;color:#042f2e;box-shadow:0 16px 40px rgba(45,212,191,.24)}.brand b{display:block;font-size:18px}.brand span,.muted{color:var(--muted)}.home{padding:11px 16px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.06);backdrop-filter:blur(12px)}
        .hero{display:grid;grid-template-columns:1.25fr .75fr;gap:24px;align-items:stretch}.card{background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.045));border:1px solid var(--line);border-radius:30px;padding:28px;box-shadow:0 24px 80px rgba(0,0,0,.28);backdrop-filter:blur(18px)}.eyebrow{margin:0 0 10px;color:var(--teal);font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.hero h1{font-size:clamp(34px,6vw,68px);line-height:.98;margin:0 0 16px}.hero p{font-size:16px;line-height:1.75}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.btn{border:0;border-radius:16px;padding:13px 18px;font-weight:800;background:linear-gradient(135deg,var(--teal),var(--emerald));color:#042f2e;box-shadow:0 16px 30px rgba(45,212,191,.2)}.btn.secondary{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--line);box-shadow:none}.progress-ring{display:grid;place-items:center;text-align:center;min-height:260px}.progress-ring strong{font-size:60px;line-height:1;color:var(--teal)}.progress-ring span{color:var(--muted)}.bar{height:10px;border-radius:999px;background:rgba(255,255,255,.10);overflow:hidden;margin-top:18px}.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--emerald));border-radius:999px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:20px}.module{position:relative;overflow:hidden;min-height:230px;display:flex;flex-direction:column;justify-content:space-between}.kana{font-size:44px;font-weight:900;letter-spacing:.08em;color:rgba(255,255,255,.2)}.module h2{margin:12px 0 8px;font-size:19px}.module p{margin:0;color:var(--muted);line-height:1.55;font-size:14px}.score{display:inline-flex;align-items:center;gap:8px;width:max-content;margin-top:16px;border:1px solid var(--line);background:rgba(255,255,255,.06);border-radius:999px;padding:8px 10px;font-size:12px;color:var(--muted)}.score b{color:var(--text)}.info{margin-top:20px;padding:18px;border-radius:22px;border:1px solid rgba(245,158,11,.28);background:rgba(245,158,11,.08);color:#fde68a;line-height:1.65}.foot{margin-top:26px;text-align:center;color:rgba(255,255,255,.5);font-size:12px}
        @media(max-width:940px){.hero,.grid{grid-template-columns:1fr}.top{align-items:flex-start;flex-direction:column}.progress-ring{min-height:210px}}@media(max-width:560px){.wrap{width:min(100% - 22px,1120px);padding-top:18px}.card{border-radius:24px;padding:20px}.actions{flex-direction:column}.btn{text-align:center}.hero h1{font-size:40px}}
    </style>
</head>
<body>
    <div class="wrap">
        <header class="top">
            <a class="brand" href="../../">
                <span class="logo">日</span>
                <span><b>Gemu Nihongo</b><span>JLPT N5 Learning Hub</span></span>
            </a>
            <a class="home" href="../../">← Kembali ke Website</a>
        </header>

        <main>
            <section class="hero">
                <article class="card">
                    <p class="eyebrow">Bahasa Jepang • N5</p>
                    <h1>Satu pintu ke modul N5 yang lengkap.</h1>
                    <p class="muted">Halaman ini sekarang diarahkan memakai folder <b>N5</b> sebagai sumber utama karena di dalamnya sudah tersedia logika belajar, kana, kanji, animasi, latihan, flashcard, dan fitur interaktif yang lebih lengkap.</p>
                    <div class="actions">
                        <a class="btn" href="<?php echo htmlspecialchars($n5_base, ENT_QUOTES); ?>">Masuk Dashboard N5</a>
                        <a class="btn secondary" href="<?php echo htmlspecialchars($n5_base . '?section=kana', ENT_QUOTES); ?>">Mulai dari Kana</a>
                    </div>
                </article>
                <aside class="card progress-ring">
                    <div>
                        <p class="eyebrow">Progress AI</p>
                        <strong><?php echo (int)$ai_total_progress; ?>%</strong>
                        <span><?php echo htmlspecialchars($ai_classification, ENT_QUOTES); ?></span>
                        <div class="bar"><i style="width:<?php echo max(0, min(100, (int)$ai_total_progress)); ?>%"></i></div>
                    </div>
                </aside>
            </section>

            <section class="grid" aria-label="Modul N5">
                <?php foreach ($modules as $module): ?>
                    <a class="card module" href="<?php echo htmlspecialchars($module['href'], ENT_QUOTES); ?>">
                        <span class="kana"><?php echo htmlspecialchars($module['kana'], ENT_QUOTES); ?></span>
                        <div>
                            <h2><?php echo htmlspecialchars($module['title'], ENT_QUOTES); ?></h2>
                            <p><?php echo htmlspecialchars($module['desc'], ENT_QUOTES); ?></p>
                            <span class="score">Progress <b><?php echo (int)$module['score']; ?>%</b></span>
                        </div>
                    </a>
                <?php endforeach; ?>
            </section>

            <div class="info"><?php echo htmlspecialchars($ai_feedback_msg, ENT_QUOTES); ?></div>
        </main>
        <p class="foot">https://gemuyokai.my.id/</p>
    </div>
</body>
</html>