<?php
// Set header agar output dibaca sebagai JSON oleh Javascript
header('Content-Type: application/json');
session_start();

// Konfigurasi Database (Sesuai dengan cPanel Jagoan Hosting Anda)
$host = 'localhost';
$db   = 'httpgemu_website';
$user = 'httpgemu_darma';
$pass = 'macanputih123'; // Menggunakan password yang Anda cantumkan

// Membuat koneksi ke database menggunakan PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $e->getMessage()]);
    exit;
}

// Menangkap jenis aksi yang dikirim dari formulir (login atau register)
$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Validasi data kosong
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Semua kolom wajib diisi.']);
        exit;
    }

    // Cek apakah email sudah pernah didaftarkan
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Email sudah terdaftar, silakan login.']);
        exit;
    }

    // Mengamankan password dengan teknik hashing
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Menyimpan data pengguna baru dengan role default 'member'
    $stmt = $pdo->prepare("INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'member')");
    if ($stmt->execute([$name, $email, $hashedPassword])) {
        echo json_encode(['status' => 'success', 'message' => 'Akun berhasil dibuat! Silakan login.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mendaftarkan akun.']);
    }

} elseif ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Email dan kata sandi wajib diisi.']);
        exit;
    }

    // Mencari pengguna di database berdasarkan email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Memverifikasi password
    if ($user && password_verify($password, $user['password'])) {
        // Menyimpan sesi pengguna yang berhasil login (Disesuaikan dengan index.php)
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_name'] = $user['nama_lengkap'];

        echo json_encode([
            'status' => 'success',
            'message' => 'Login berhasil!',
            'data' => [
                'nama' => $user['nama_lengkap'],
                'role' => $user['role'] 
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email atau kata sandi Anda salah.']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Aksi tidak valid.']);
}
?>