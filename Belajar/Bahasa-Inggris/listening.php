<?php
session_start();
$gemu_base_path = '../../';
$gemu_nav_context = [
    'mode' => 'learning',
    'brand_text' => 'GemuYokai Belajar',
    'brand_badge' => 'GB',
    'show_profile' => true,
    'show_owner_tools' => false,
    'show_contact' => false,
    'compact' => true,
];

$lessonsFile = __DIR__ . '/data/lessons.json';
$englishLessons = is_file($lessonsFile) ? json_decode(file_get_contents($lessonsFile), true) : [];
if (!is_array($englishLessons)) $englishLessons = [];

require __DIR__ . '/views/listening.view.php';
