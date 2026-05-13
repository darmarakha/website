<?php
/**
 * CSRF Token Protection — Shared helper.
 * Include di halaman yang butuh form protection.
 *
 * Cara pakai:
 *   require_once __DIR__ . '/../config/csrf.php';
 *   // Di form: echo csrf_field();
 *   // Di handler: csrf_verify($_POST['_csrf_token'] ?? '');
 */

/**
 * Generate CSRF token dan simpan di session.
 */
function csrf_generate(): string {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    if (empty($_SESSION['_csrf_token']) || empty($_SESSION['_csrf_time']) || (time() - $_SESSION['_csrf_time']) > 3600) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['_csrf_time'] = time();
    }
    return $_SESSION['_csrf_token'];
}

/**
 * Output hidden input field dengan CSRF token.
 */
function csrf_field(): string {
    return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars(csrf_generate(), ENT_QUOTES, 'UTF-8') . '">';
}

/**
 * Mendapatkan token untuk digunakan di JavaScript (AJAX).
 */
function csrf_token_value(): string {
    return csrf_generate();
}

/**
 * Verifikasi CSRF token. Return true jika valid.
 */
function csrf_verify(string $token): bool {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
    if (empty($_SESSION['_csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['_csrf_token'], $token);
}

/**
 * Verifikasi CSRF dan langsung reject jika gagal.
 */
function csrf_require(string $token): void {
    if (!csrf_verify($token)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Token keamanan tidak valid. Refresh halaman dan coba lagi.']);
        exit;
    }
}
