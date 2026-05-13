<?php
session_start();
header('Content-Type: application/json');

// Cek keamanan ganda: Hanya Owner yang boleh mengeksekusi file ini
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'owner') {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak!']);
    exit;
}

$action = $_POST['action'] ?? '';

if ($action === 'load_file') {
    $filename = $_POST['filename'] ?? '';
    
    // Daftar putih (Whitelist) file yang diizinkan untuk diedit demi keamanan
    $allowed_files = ['../index.php', '../data.js', '../app.js'];
    if (!in_array($filename, $allowed_files)) {
        echo json_encode(['status' => 'error', 'message' => 'File tidak diizinkan untuk diedit.']);
        exit;
    }

    if (file_exists($filename)) {
        $content = file_get_contents($filename);
        echo json_encode(['status' => 'success', 'content' => $content]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'File tidak ditemukan di server.']);
    }

} elseif ($action === 'save_file') {
    $filename = $_POST['filename'] ?? '';
    $content = $_POST['content'] ?? '';

    $allowed_files = ['../index.php', '../data.js', '../app.js'];
    if (!in_array($filename, $allowed_files)) {
        echo json_encode(['status' => 'error', 'message' => 'File tidak diizinkan untuk disimpan.']);
        exit;
    }

    // Tulis ulang file dengan konten baru
    if (file_put_contents($filename, $content) !== false) {
        echo json_encode(['status' => 'success', 'message' => 'File berhasil diperbarui!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan file. Pastikan Permission file di cPanel adalah 0644.']);
    }

} elseif ($action === 'upload_image') {
    // Memproses unggahan gambar
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengupload gambar.']);
        exit;
    }

    // Buat folder 'uploads' di dalam folder 'edit' jika belum ada
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Bersihkan nama file agar aman dan tidak menimpa file lama
    $fileName = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "", basename($_FILES['image']['name']));
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        // Kembalikan path lengkap dari root website (misal: edit/uploads/gambar.jpg)
        echo json_encode(['status' => 'success', 'url' => 'edit/' . $targetPath]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memindahkan file gambar ke server.']);
    }

} elseif ($action === 'upload_project_file') {
    // Upload file proyek agar bisa dipasang ke projData.fileUrl di data.js
    if (!isset($_FILES['project_file']) || $_FILES['project_file']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Gagal mengupload file proyek.']);
        exit;
    }

    $maxSize = 25 * 1024 * 1024; // 25 MB
    if ($_FILES['project_file']['size'] > $maxSize) {
        echo json_encode(['status' => 'error', 'message' => 'Ukuran file maksimal 25 MB.']);
        exit;
    }

    $originalName = basename($_FILES['project_file']['name']);
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'html', 'htm', 'zip', 'rar', '7z'];

    if (!in_array($extension, $allowedExtensions)) {
        echo json_encode(['status' => 'error', 'message' => 'Tipe file tidak diizinkan. Gunakan gambar, PDF, HTML, ZIP, RAR, atau 7Z.']);
        exit;
    }

    $uploadDir = 'project-files/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $safeBase = preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
    $fileName = time() . '_' . $safeBase;
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['project_file']['tmp_name'], $targetPath)) {
        echo json_encode(['status' => 'success', 'url' => '/edit/' . $targetPath]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal memindahkan file proyek ke server.']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Aksi tidak diketahui.']);
}
?>