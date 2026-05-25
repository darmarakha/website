<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/config/csrf.php';

csrf_require(gemu_input('_csrf_token'));

function gemu_auth_json(array $payload, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function gemu_input(string $key, string $default = ''): string
{
    return trim((string)($_POST[$key] ?? $_GET[$key] ?? $default));
}

function gemu_pick(array $row, array $keys, string $default = ''): string
{
    foreach ($keys as $key) {
        if (array_key_exists($key, $row) && $row[$key] !== null && $row[$key] !== '') {
            return (string)$row[$key];
        }
    }
    return $default;
}

function gemu_table_columns(PDO $pdo, string $table): array
{
    $stmt = $pdo->query('SHOW COLUMNS FROM `' . str_replace('`', '``', $table) . '`');
    $columns = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
        $columns[] = (string)$col['Field'];
    }
    return $columns;
}

function gemu_has_column(array $columns, string $name): bool
{
    return in_array($name, $columns, true);
}

function gemu_first_column(array $columns, array $candidates): ?string
{
    foreach ($candidates as $candidate) {
        if (gemu_has_column($columns, $candidate)) {
            return $candidate;
        }
    }
    return null;
}

try {
    $pdo = gemu_pdo();
} catch (Throwable $e) {
    error_log('GEMU DB connection failed: ' . $e->getMessage());
    gemu_auth_json([
        'status' => 'error',
        'message' => 'Koneksi database gagal. Periksa config.php dan database hosting.',
    ], 500);
}

$action = gemu_input('action');
$table = 'users';

try {
    $columns = gemu_table_columns($pdo, $table);
} catch (Throwable $e) {
    error_log('GEMU users table check failed: ' . $e->getMessage());
    gemu_auth_json([
        'status' => 'error',
        'message' => 'Tabel users tidak ditemukan atau struktur SQL belum sesuai.',
    ], 500);
}

if ($action === 'register') {
    $name = gemu_input('name');
    $email = strtolower(gemu_input('email'));
    $password = (string)($_POST['password'] ?? '');

    if ($name === '' || $email === '' || $password === '') {
        gemu_auth_json(['status' => 'error', 'message' => 'Semua kolom wajib diisi.'], 422);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        gemu_auth_json(['status' => 'error', 'message' => 'Format email tidak valid.'], 422);
    }

    if (strlen($password) < 6) {
        gemu_auth_json(['status' => 'error', 'message' => 'Kata sandi minimal 6 karakter.'], 422);
    }

    $emailCol = gemu_first_column($columns, ['email', 'user_email']);
    $passwordCol = gemu_first_column($columns, ['password', 'pass_hash', 'password_hash', 'pass']);
    $nameCol = gemu_first_column($columns, ['nama_lengkap', 'name', 'nama', 'full_name']);
    $nicknameCol = gemu_first_column($columns, ['nama_panggilan', 'nickname', 'username']);
    $roleCol = gemu_first_column($columns, ['role', 'level', 'user_role']);

    if ($emailCol === null || $passwordCol === null || $nameCol === null) {
        gemu_auth_json([
            'status' => 'error',
            'message' => 'Struktur tabel users belum sesuai. Minimal perlu kolom nama, email, dan password/pass_hash.',
        ], 500);
    }

    $stmt = $pdo->prepare("SELECT id FROM `$table` WHERE `$emailCol` = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        gemu_auth_json(['status' => 'error', 'message' => 'Email sudah terdaftar, silakan login.'], 409);
    }

    $insert = [
        $nameCol => $name,
        $emailCol => $email,
        $passwordCol => password_hash($password, PASSWORD_DEFAULT),
    ];

    if ($nicknameCol !== null && $nicknameCol !== $nameCol) {
        $insert[$nicknameCol] = $name;
    }
    if ($roleCol !== null) {
        $insert[$roleCol] = 'Member';
    }

    $fieldSql = '`' . implode('`, `', array_keys($insert)) . '`';
    $paramSql = ':' . implode(', :', array_keys($insert));
    $stmt = $pdo->prepare("INSERT INTO `$table` ($fieldSql) VALUES ($paramSql)");
    $stmt->execute($insert);

    gemu_auth_json(['status' => 'success', 'message' => 'Akun berhasil dibuat! Silakan login.']);
}

if ($action === 'login') {
    $identity = strtolower(gemu_input('email'));
    $password = (string)($_POST['password'] ?? '');

    if ($identity === '' || $password === '') {
        gemu_auth_json(['status' => 'error', 'message' => 'Email dan kata sandi wajib diisi.'], 422);
    }

    $emailCol = gemu_first_column($columns, ['email', 'user_email']);
    $nicknameCol = gemu_first_column($columns, ['nama_panggilan', 'nickname', 'username']);
    $passwordCol = gemu_first_column($columns, ['password', 'pass_hash', 'password_hash', 'pass']);

    if ($emailCol === null || $passwordCol === null) {
        gemu_auth_json([
            'status' => 'error',
            'message' => 'Struktur tabel users belum sesuai. Kolom email dan password/pass_hash wajib ada.',
        ], 500);
    }

    if ($nicknameCol !== null) {
        $sql = "SELECT * FROM `$table` WHERE LOWER(`$emailCol`) = :identity OR LOWER(`$nicknameCol`) = :identity LIMIT 1";
    } else {
        $sql = "SELECT * FROM `$table` WHERE LOWER(`$emailCol`) = :identity LIMIT 1";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['identity' => $identity]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $storedPassword = $user ? (string)($user[$passwordCol] ?? '') : '';
    if (!$user || $storedPassword === '' || !password_verify($password, $storedPassword)) {
        gemu_auth_json(['status' => 'error', 'message' => 'Email atau kata sandi Anda salah.'], 401);
    }

    session_regenerate_id(true);

    $userId = gemu_pick($user, ['id', 'user_id', 'id_user']);
    $fullName = gemu_pick($user, ['nama_lengkap', 'name', 'nama', 'full_name'], 'User');
    $nickname = gemu_pick($user, ['nama_panggilan', 'nickname', 'username'], $fullName);
    $email = gemu_pick($user, ['email', 'user_email']);
    $role = gemu_pick($user, ['role', 'level', 'user_role'], 'Member');
    $avatar = gemu_pick($user, ['avatar_path', 'avatar', 'foto', 'photo']);

    $_SESSION['user_id'] = $userId;
    $_SESSION['user_role'] = $role;
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_email'] = $email;

    $_SESSION['gy_user_id'] = $userId;
    $_SESSION['gy_nickname'] = $nickname;
    $_SESSION['gy_user_name'] = $fullName;
    $_SESSION['gy_user_email'] = $email;
    $_SESSION['gy_user_role'] = $role;
    $_SESSION['gy_avatar_path'] = $avatar;
    $_SESSION['logged_in'] = true;

    gemu_auth_json([
        'status' => 'success',
        'message' => 'Login berhasil!',
        'data' => [
            'id' => $userId,
            'nama' => $fullName,
            'nickname' => $nickname,
            'email' => $email,
            'role' => $role,
            'avatar_path' => $avatar,
        ],
    ]);
}

gemu_auth_json(['status' => 'error', 'message' => 'Aksi tidak valid.'], 400);
