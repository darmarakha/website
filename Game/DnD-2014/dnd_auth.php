<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function dnd_auth_json(array $payload, int $code = 200): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$raw = file_get_contents('php://input') ?: '';
$input = [];
if ($raw !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        $input = $decoded;
    }
}
$action = (string)($input['action'] ?? $_POST['action'] ?? $_GET['action'] ?? 'session');

if ($action === 'session') {
    dnd_auth_json([
        'ok' => true,
        'user' => [
            'id' => $_SESSION['gy_user_id'] ?? $_SESSION['user_id'] ?? $_SESSION['id_user'] ?? $_SESSION['id'] ?? '',
            'name' => $_SESSION['gy_nickname'] ?? $_SESSION['gy_user_name'] ?? $_SESSION['user_name'] ?? $_SESSION['nama_panggilan'] ?? $_SESSION['nama_lengkap'] ?? '',
            'email' => $_SESSION['gy_user_email'] ?? $_SESSION['user_email'] ?? $_SESSION['email'] ?? '',
            'role' => $_SESSION['gy_user_role'] ?? $_SESSION['user_role'] ?? $_SESSION['role'] ?? '',
        ],
    ]);
}

if ($action !== 'logout') {
    dnd_auth_json(['ok' => false, 'message' => 'Action auth DND tidak dikenal.'], 400);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    dnd_auth_json(['ok' => false, 'message' => 'Logout wajib memakai POST.'], 405);
}

$sessionToken = (string)($_SESSION['gemu_dnd_token'] ?? '');
$clientToken = (string)($input['token'] ?? $_POST['token'] ?? '');
if ($sessionToken === '' || !hash_equals($sessionToken, $clientToken)) {
    dnd_auth_json(['ok' => false, 'message' => 'Token logout DND tidak valid. Refresh halaman lalu coba lagi.'], 403);
}

$knownKeys = [
    'gy_user_id', 'gy_nickname', 'gy_user_name', 'gy_user_email', 'gy_avatar_path', 'gy_user_role',
    'user_id', 'user_name', 'user_email', 'user_role',
    'id_user', 'id', 'nama_panggilan', 'nama_lengkap', 'email', 'role',
    'logged_in', 'is_login', 'login',
];
foreach ($knownKeys as $key) {
    unset($_SESSION[$key]);
}
unset($_SESSION['gemu_dnd_token']);

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();

dnd_auth_json(['ok' => true, 'message' => 'Logout website berhasil.']);
