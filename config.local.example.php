<?php
declare(strict_types=1);

/**
 * Salin file ini menjadi config.local.php di hosting/lokal.
 * Isi nilainya di config.local.php, bukan di file ini.
 * config.local.php sudah masuk .gitignore agar tidak ikut ter-commit.
 */

return [
    'db' => [
        'host' => 'localhost',
        'name' => 'nama_database',
        'user' => 'username_database',
        'pass' => 'password_database',
    ],
];
