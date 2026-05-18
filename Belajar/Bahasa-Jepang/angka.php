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
// Simulasi progress untuk angka (atau bisa ditambahkan field khusus jika ada nanti)
$prog_angka = 0;

if (!empty($_SESSION['user_name'])) {
    $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;
    // Bisa tambahkan logika database di sini nanti jika diperlukan
}

// Load view
require __DIR__ . '/views/angka.view.php';
