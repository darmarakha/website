<?php
declare(strict_types=1);

/**
 * GEMU cPanel Config
 *
 * Cara pakai:
 * - Edit nilai env di bawah (atau set environment variables di hosting).
 * - File ini sengaja PHP (bukan .env) supaya cocok di cPanel shared-hosting.
 */

function gemu_config(): array
{
    static $cfg = null;
    if (is_array($cfg)) return $cfg;

    $cfg = [
        'db' => [
            'host' => getenv('GEMU_DB_HOST') ?: 'localhost',
            'name' => getenv('GEMU_DB_NAME') ?: 'ubah_ini_nama_db',
            'user' => getenv('GEMU_DB_USER') ?: 'ubah_ini_user_db',
            'pass' => getenv('GEMU_DB_PASS') ?: 'ubah_ini_password_db',
            'charset' => 'utf8mb4',
        ],
    ];

    return $cfg;
}

function gemu_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $c = gemu_config()['db'];
    $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";
    $pdo = new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

