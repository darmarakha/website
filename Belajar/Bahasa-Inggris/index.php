<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../Index.php');
    die();
}

require_once __DIR__ . '/../../config.php';

$gemu_base_path = '../../';
$gemu_nav_context = [
    'mode' => 'learning',
    'brand_text' => 'GemuYokai Belajar',
    'brand_badge' => 'GB',
    'show_profile' => true,
    'show_owner_tools' => false,
    'show_contact' => false,
    'compact' => true,
];

$ai_total_progress = 0;
$prog_materi = 0;
$prog_latihan = 0;
$prog_dialog = 0;
$prog_listening = 0;
$ai_feedback_msg = "Please log in first to save and track your learning progress.";
$ai_classification = "Unranked";

if (!empty($_SESSION['user_name'])) {
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;

    try {
        $pdo = gemu_pdo();

        // Auto-create table to prevent DB errors on live server
        $pdo->exec("CREATE TABLE IF NOT EXISTS `user_progress_en` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `materi_score` int(11) DEFAULT '0',
            `latihan_score` int(11) DEFAULT '0',
            `dialog_score` int(11) DEFAULT '0',
            `listening_score` int(11) DEFAULT '0',
            PRIMARY KEY (`id`),
            UNIQUE KEY `user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $stmt = $pdo->prepare("SELECT materi_score, latihan_score, dialog_score, listening_score FROM user_progress_en WHERE user_id = :uid");
        $stmt->execute(['uid' => $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $prog_materi = (int)$data['materi_score'];
            $prog_latihan = (int)$data['latihan_score'];
            $prog_dialog   = (int)$data['dialog_score'];
            $prog_listening    = (int)$data['listening_score'];
        } else {
            $stmtInsert = $pdo->prepare("INSERT IGNORE INTO user_progress_en (user_id, materi_score, latihan_score, dialog_score, listening_score) VALUES (:uid, 0, 0, 0, 0)");
            $stmtInsert->execute(['uid' => $user_id]);
        }

    } catch (PDOException $e) {
        error_log("Failed to fetch English progress: " . $e->getMessage());
    }

        $fondasi_kuat = ($prog_materi >= 70 && $prog_latihan >= 60);

    if ($prog_materi === 0 && $prog_latihan === 0 && $prog_dialog === 0 && $prog_listening === 0) {
        $ai_total_progress = 0;
        $ai_classification = "Pemula (Materi Dasar)";
        $ai_feedback_msg = "Analisis awal: mulai dari materi dasar untuk mengukur level kamu.";
    } else {
        // Formula: materi (25%) + latihan (30%) + listening (20%) + dialog (15%) + bonus konsistensi (10%)
        // Because consistency bonus needs history, we just distribute the remaining 10% evenly for now or grant it if they are active in all.
        $w_mat = 0.25; $w_lat = 0.30; $w_lis = 0.20; $w_dia = 0.15;
        $bonus = ($prog_materi > 0 && $prog_latihan > 0 && $prog_listening > 0 && $prog_dialog > 0) ? 10 : 0;

        $raw_score = ($prog_materi * $w_mat) + ($prog_latihan * $w_lat) + ($prog_listening * $w_lis) + ($prog_dialog * $w_dia) + $bonus;
        $ai_total_progress = min(100, round(max(0, $raw_score)));

        if ($ai_total_progress < 30) {
            $ai_classification = "Dasar (A1)";
            $ai_feedback_msg = "Pertahankan! Fokus pada kosakata dasar dan pengucapan (Pronunciation).";
        } elseif ($ai_total_progress < 60) {
            $ai_classification = "Menengah (A2/B1 awal)";
            $ai_feedback_msg = "Perkembangan bagus. Tingkatkan skor Listening kamu lewat dikte.";
        } elseif ($ai_total_progress < 85) {
            $ai_classification = "Lanjut (B1/B2)";
            $ai_feedback_msg = "Sangat baik! Banyak praktik Roleplay di bagian Dialog untuk lebih lancar.";
        } else {
            $ai_classification = "Profesional";
            $ai_feedback_msg = "Luar biasa! Pemahaman bahasa Inggrismu sudah di tahap mahir.";
        }
    }
}

require __DIR__ . '/views/index.view.php';
