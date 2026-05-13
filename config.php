<?php
declare(strict_types=1);

/**
 * GEMU cPanel Config
 *
 * Catatan:
 * - Nilai default di bawah mengikuti konfigurasi database hosting yang dipakai website.
 * - Environment variable tetap diprioritaskan supaya hosting bisa override tanpa mengubah kode.
 */

function gemu_config(): array
{
    static $cfg = null;
    if (is_array($cfg)) {
        return $cfg;
    }

    $host = getenv('GEMU_DB_HOST') ?: 'localhost';
    $dbname = getenv('GEMU_DB_NAME') ?: 'httpgemu_website';
    $username = getenv('GEMU_DB_USER') ?: 'httpgemu_darma';
    $password = getenv('GEMU_DB_PASS') ?: 'Macanputih123;';

    $cfg = [
        'db' => [
            'host' => $host,
            'name' => $dbname,
            'user' => $username,
            'pass' => $password,
            'charset' => 'utf8mb4',
        ],
    ];

    return $cfg;
}

function gemu_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $c = gemu_config()['db'];
    $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";

    $pdo = new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
