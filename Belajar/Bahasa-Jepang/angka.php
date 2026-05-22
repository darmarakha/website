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

// Logika Logout — hanya via POST untuk mencegah CSRF
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout'])) {
    $token = $_POST['_csrf'] ?? '';
    if (!isset($_SESSION['_csrf']) || !hash_equals($_SESSION['_csrf'], $token)) {
        http_response_code(403);
        exit('CSRF token invalid.');
    }
    session_unset();
    session_destroy();
    header('Location: ../index.php');
    exit;
}

// =========================================================================
// SISTEM KONEKSI SQL UNTUK MENYIMPAN PROGRESS
// =========================================================================
require_once __DIR__ . '/../../config.php';

$user_id = 0;
// Simulasi progress untuk angka (atau bisa ditambahkan field khusus jika ada nanti)
$prog_angka = 0;

if (!empty($_SESSION['user_name'])) {
    $user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
}

// Load view
require __DIR__ . '/views/angka.view.php';
