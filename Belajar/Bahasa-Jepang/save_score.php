<?php
// Script ini berfungsi untuk menerima data pembaruan kelas (Level AI) 
// dari fitur AI Membaca dan memperbaruinya di tabel SQL.

session_start();
header('Content-Type: application/json');

// 1. Cek apakah user sudah login
// Jika belum login (Guest), level tidak akan disimpan ke database
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Belum login, level tidak disimpan.']);
    exit;
}

// 2. Ambil data JSON yang dikirim oleh fungsi fetch() di Javascript
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['level'])) {
    echo json_encode(['status' => 'error', 'message' => 'Data tidak valid.']);
    exit;
}

// 3. Ekstrak data
$newLevel = $data['level']; // Contoh: 'pemula', 'mahir', atau 'pro'
$userId   = $_SESSION['user_id'];

// 4. Konfigurasi Database (Sesuai dengan save_score.php Anda)
$host = 'localhost';
$db   = 'httpgemu_website';
$user = 'httpgemu_darma';
$pass = 'macanputih123';

try {
    // Buat Koneksi PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 5. Query SQL untuk memperbarui (UPDATE) ai_level yang sudah ada di database
    // Menggunakan user_id (id) agar tepat sasaran ke akun yang sedang login
    $stmt = $pdo->prepare("UPDATE users SET ai_level = ? WHERE id = ?");
    $stmt->execute([$newLevel, $userId]);

    // 6. KUNCI PENTING: Sinkronisasi Session PHP!
    // Ini yang memastikan jika pengguna me-refresh halaman, 
    // AI tetap ingat kalau dia sudah 'mahir' atau 'pro'
    $_SESSION['ai_level'] = $newLevel;

    echo json_encode(['status' => 'success', 'message' => 'Level AI berhasil diupdate di database menjadi: ' . $newLevel]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $e->getMessage()]);
}
?>
