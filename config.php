<?php
declare(strict_types=1);

/**
 * GEMU cPanel Config
 *
 * Prioritas konfigurasi:
 * 1. Environment variable hosting: GEMU_DB_HOST, GEMU_DB_NAME, GEMU_DB_USER, GEMU_DB_PASS.
 * 2. File lokal non-repository: config.local.php.
 *
 * Jangan menyimpan username/password database asli di GitHub.
 */

function gemu_config(): array
{
    static $cfg = null;
    if (is_array($cfg)) {
        return $cfg;
    }

    $local = [];
    $localFile = __DIR__ . '/config.local.php';
    if (is_file($localFile)) {
        $loaded = require $localFile;
        if (is_array($loaded)) {
            $local = $loaded;
        }
    }

    $localDb = $local['db'] ?? $local;
    if (!is_array($localDb)) {
        $localDb = [];
    }

    $host = getenv('GEMU_DB_HOST') ?: (string)($localDb['host'] ?? 'localhost');
    $dbname = getenv('GEMU_DB_NAME') ?: (string)($localDb['name'] ?? $localDb['dbname'] ?? 'httpgemu_website');
    $username = getenv('GEMU_DB_USER') ?: (string)($localDb['user'] ?? $localDb['username'] ?? 'httpgemu_darma');
    $password = getenv('GEMU_DB_PASS') ?: (string)($localDb['pass'] ?? $localDb['password'] ?? 'Macanputih123');

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
    if ($c['name'] === '' || $c['user'] === '') {
        throw new RuntimeException('Konfigurasi database belum lengkap. Isi environment variable GEMU_DB_* atau buat config.local.php dari config.local.example.php.');
    }

    $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";

    $pdo = new PDO($dsn, $c['user'], $c['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
