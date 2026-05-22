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
// CSRF token
if (empty($_SESSION['_csrf'])) {
    $_SESSION['_csrf'] = bin2hex(random_bytes(32));
}

// Logika Logout — hanya via POST untuk mencegah CSRF
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    $token = $_POST['_csrf'] ?? '';
    if (!isset($_SESSION['_csrf']) || !hash_equals($_SESSION['_csrf'], $token)) {
        http_response_code(403);
        exit('CSRF token invalid.');
    }
    session_unset();
    session_destroy();
    header('Location: /Index.php');
    exit;
}

// =========================================================================
// SISTEM KONEKSI SQL UNTUK MENYIMPAN PROGRESS
// =========================================================================
require_once __DIR__ . '/../../config.php';

$user_id = 0;
$prog_kanji = 0;

if (!empty($_SESSION['user_name'])) {
    if (empty($_SESSION['user_id'])) {
        error_log("Kanji: session user_id tidak ditemukan padahal user_name ada.");
    } else {
        $user_id = (int)$_SESSION['user_id'];
        try {
            $pdo = gemu_pdo();
            
            $stmt = $pdo->prepare("SELECT kanji_score FROM user_progress WHERE user_id = :uid");
            $stmt->execute(['uid' => $user_id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($data) {
                $prog_kanji = (int)$data['kanji_score'];
            } else {
                $stmtInsert = $pdo->prepare("INSERT INTO user_progress (user_id, hiragana_score, katakana_score, bunpou_score, kanji_score) VALUES (:uid, 0, 0, 0, 0) ON DUPLICATE KEY UPDATE user_id = :uid2");
                $stmtInsert->execute(['uid' => $user_id, 'uid2' => $user_id]);
            }
        } catch (PDOException $e) {
            error_log("Gagal mengambil progress Kanji: " . $e->getMessage());
        }
    }
}

// Load view
require __DIR__ . '/views/kanji.view.php';
