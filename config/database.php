<?php
/**
 * Konfigurasi Database — File ini TIDAK BOLEH diakses dari browser.
 * Diproteksi oleh config/.htaccess (Require all denied).
 * 
 * File ini berada di dalam folder config/ yang sudah di-blokir
 * oleh .htaccess dengan "Require all denied". Tidak bisa diakses
 * langsung via browser.
 */

// Kredensial database
$_GEMU_DB = [
    'website' => [
        'host' => 'localhost',
        'name' => 'httpgemu_website',
        'user' => 'httpgemu_darma',
        'pass' => 'macanputih123',
    ],
    'dnd' => [
        'host' => 'localhost',
        'name' => 'httpgemu_dnd',
        'user' => 'httpgemu_darma', // Assuming same user/pass or update if different
        'pass' => 'macanputih123',
    ]
];

/**
 * Mendapatkan koneksi PDO.
 * @param string $target 'website' atau 'dnd'
 * @return PDO
 */
function gemu_db_connect(string $target = 'website'): PDO {
    global $_GEMU_DB;
    $db = $_GEMU_DB[$target] ?? $_GEMU_DB['website'];
    
    $pdo = new PDO(
        "mysql:host={$db['host']};dbname={$db['name']};charset=utf8mb4",
        $db['user'],
        $db['pass']
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}

return $_GEMU_DB;
