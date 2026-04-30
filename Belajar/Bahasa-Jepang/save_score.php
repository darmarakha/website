<?php
// Script ini berfungsi untuk menerima data skor dari hiragana.php / katakana.php
// dan memasukkannya (UPDATE) ke dalam tabel SQL.

session_start();
header('Content-Type: application/json');

// 1. Cek apakah user sudah login
// Jika belum login (Guest), skor tidak akan disimpan ke database
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Belum login, skor tidak disimpan.']);
    exit;
}

// 2. Ambil data JSON yang dikirim oleh fungsi fetch() di Javascript
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak valid.']);
    exit;
}

// 3. Ekstrak data
$correct = isset($data['correct']) ? (int)$data['correct'] : 0;
$wrong   = isset($data['wrong']) ? (int)$data['wrong'] : 0;
$points  = isset($data['points']) ? (int)$data['points'] : 0;
$userId  = $_SESSION['user_id'];

// 4. Konfigurasi Database (Sesuai dengan cPanel Jagoan Hosting Anda)
$host = 'localhost';
$db   = 'httpgemu_website';
$user = 'httpgemu_darma';
$pass = 'macanputih123';

try {
    // Buat Koneksi PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 5. Query SQL untuk menambahkan skor yang baru didapat ke skor yang sudah ada di database
    // Menggunakan user_id agar tepat sasaran ke akun yang sedang login
    $stmt = $pdo->prepare("UPDATE users SET correct = correct + ?, wrong = wrong + ?, points = points + ? WHERE id = ?");
    $stmt->execute([$correct, $wrong, $points, $userId]);

    echo json_encode(['status' => 'success', 'message' => 'Skor berhasil diupdate di database!']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $e->getMessage()]);
}
?>
