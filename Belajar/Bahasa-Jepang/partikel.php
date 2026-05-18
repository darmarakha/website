<?php
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true, 'samesite' => 'Lax',
]);
session_start();
require_once __DIR__ . '/../../config.php';

// Partikel Module currently uses localStorage for progress tracking.
// No PHP backend tracking is implemented in this phase, as requested by the user.

$isLoggedIn = !empty($_SESSION['user_name']);
$userName = $isLoggedIn ? $_SESSION['user_name'] : 'Guest';

require __DIR__ . '/views/partikel.view.php';
