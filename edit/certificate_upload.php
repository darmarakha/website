<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['user_role']) || strtolower((string) $_SESSION['user_role']) !== 'owner') {
    echo json_encode(['status' => 'error', 'message' => 'Akses ditolak.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan.']);
    exit;
}

if (!isset($_FILES['certificate']) || !is_array($_FILES['certificate'])) {
    echo json_encode(['status' => 'error', 'message' => 'File sertifikat belum dipilih.']);
    exit;
}

$file = $_FILES['certificate'];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Upload sertifikat gagal.']);
    exit;
}

$maxSize = 15 * 1024 * 1024;
if ((int) $file['size'] > $maxSize) {
    echo json_encode(['status' => 'error', 'message' => 'Ukuran file maksimal 15 MB.']);
    exit;
}

$originalName = basename((string) $file['name']);
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExt = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

if (!in_array($extension, $allowedExt, true)) {
    echo json_encode(['status' => 'error', 'message' => 'Format sertifikat harus PDF, JPG, JPEG, PNG, atau WEBP.']);
    exit;
}

$tmpPath = (string) $file['tmp_name'];
$mime = '';
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo !== false) {
        $mime = (string) finfo_file($finfo, $tmpPath);
        finfo_close($finfo);
    }
}

$allowedMime = [
    'pdf' => ['application/pdf', 'application/x-pdf'],
    'jpg' => ['image/jpeg'],
    'jpeg' => ['image/jpeg'],
    'png' => ['image/png'],
    'webp' => ['image/webp'],
];

if ($mime !== '' && !in_array($mime, $allowedMime[$extension], true)) {
    echo json_encode(['status' => 'error', 'message' => 'Isi file tidak sesuai dengan format sertifikat.']);
    exit;
}

$uploadDir = __DIR__ . '/certificates';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    echo json_encode(['status' => 'error', 'message' => 'Folder sertifikat gagal dibuat.']);
    exit;
}

$safeName = preg_replace('/[^a-zA-Z0-9._-]/', '-', pathinfo($originalName, PATHINFO_FILENAME));
$safeName = trim((string) $safeName, '-_.');
if ($safeName === '') {
    $safeName = 'certificate';
}

$finalName = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '_' . $safeName . '.' . $extension;
$targetPath = $uploadDir . '/' . $finalName;

if (!move_uploaded_file($tmpPath, $targetPath)) {
    echo json_encode(['status' => 'error', 'message' => 'File gagal disimpan ke server.']);
    exit;
}

$url = '/edit/certificates/' . $finalName;
$isPdf = $extension === 'pdf';
$cover = $isPdf ? '/asset/pdf-certificate-placeholder.svg' : $url;

$snippet = [
    'coverSrc' => $cover,
    'imgSrc' => $cover,
    'fullSrc' => $url,
    'pdfSrc' => $isPdf ? $url : '',
    'tagKey' => 'cert.tagTech',
    'tagIcon' => 'award',
    'titleKey' => 'cert.t4',
    'descKey' => 'cert.d4',
    'featured' => false,
    'span' => '',
];

echo json_encode([
    'status' => 'success',
    'message' => $isPdf ? 'Sertifikat PDF berhasil diupload.' : 'Sertifikat gambar berhasil diupload.',
    'type' => $isPdf ? 'pdf' : 'image',
    'url' => $url,
    'cover_url' => $cover,
    'datajs_snippet' => $snippet,
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
