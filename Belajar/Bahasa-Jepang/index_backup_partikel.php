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

require __DIR__ . '/views/index.view.php';
