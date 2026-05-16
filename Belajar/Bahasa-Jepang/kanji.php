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
// SISTEM KONEKSI SQL UNTUK MENYIMPAN PROGRESS
// =========================================================================
require_once __DIR__ . '/../../config.php';

$user_id = 0;
$prog_kanji = 0;

if (!empty($_SESSION['user_name'])) {
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;
    
    try {
        $pdo = gemu_pdo();
        
        $stmt = $pdo->prepare("SELECT kanji_score FROM user_progress WHERE user_id = :uid");
        $stmt->execute(['uid' => $user_id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $prog_kanji = (int)$data['kanji_score']; // Skala 0-100
        } else {
            // Jika user baru login dan belum ada record di user_progress, buat otomatis nilainya 0
            $stmtInsert = $pdo->prepare("INSERT IGNORE INTO user_progress (user_id, hiragana_score, katakana_score, bunpou_score, kanji_score) VALUES (:uid, 0, 0, 0, 0)");
            $stmtInsert->execute(['uid' => $user_id]);
        }
    } catch (PDOException $e) {
        error_log("Gagal mengambil progress Kanji: " . $e->getMessage());
    }
}

// Load view
require __DIR__ . '/views/kanji.view.php';
