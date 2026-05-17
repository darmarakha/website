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
        $ai_classification = "Novice (New User)";
        $ai_feedback_msg = "Welcome to your English journey! Start with the basic materials and exercises.";
    } else {
        if (!$fondasi_kuat) {
            $w_mat = 0.50; $w_lat = 0.30; $w_dia = 0.10; $w_lis = 0.10;
            $ai_classification = "Cluster A: Grammar & Vocabulary Focus";
        } else if ($prog_listening < 60) {
            $w_mat = 0.10; $w_lat = 0.10; $w_dia = 0.20; $w_lis = 0.60;
            $ai_classification = "Cluster B: Listening Comprehension Focus";
        } else {
            $w_mat = 0.10; $w_lat = 0.10; $w_dia = 0.50; $w_lis = 0.30;
            $ai_classification = "Cluster C: Advanced Conversation Focus";
        }

        $raw_score = ($prog_materi * $w_mat) + ($prog_latihan * $w_lat) + ($prog_dialog * $w_dia) + ($prog_listening * $w_lis);

        $ai_penalty = 0;
        if ($prog_dialog > 30 && $prog_materi < 40) {
            $ai_penalty = 15;
        }

        $ai_total_progress = round(max(0, $raw_score - $ai_penalty));

        if ($ai_penalty > 0) {
            $ai_feedback_msg = "⚠️ AI Anomaly Detected: You are trying advanced dialogs without mastering basic materials. Score adjusted.";
        } elseif ($ai_total_progress < 30) {
            $ai_feedback_msg = "AI Insight ($ai_classification): Focus on building your vocabulary and grammar foundations.";
        } elseif ($ai_total_progress < 60) {
            $ai_feedback_msg = "AI Insight ($ai_classification): Great progress! Now try to improve your listening skills.";
        } elseif ($ai_total_progress < 85) {
            $ai_feedback_msg = "AI Insight ($ai_classification): You are quite competent! Focus on real-life dialogues with the AI.";
        } else {
            $ai_feedback_msg = "🎯 AI Prediction: Excellent proficiency level! You're ready for advanced English communication.";
        }
    }
}

require __DIR__ . '/views/index.view.php';
