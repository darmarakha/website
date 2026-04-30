<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
header('Content-Type: application/json');
if (empty($_SESSION['belajar_user'])) { echo json_encode(['ok'=>false, 'message'=>'not_logged_in']); exit; }
$data = json_decode(file_get_contents('php://input'), true) ?: [];
$file = __DIR__ . '/../leaderboard.json';
$list = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
$name = $_SESSION['belajar_user'];
$material = strtolower(trim((string)($data['material'] ?? 'umum')));
$material = preg_replace('/[^a-z0-9_-]/', '', $material) ?: 'umum';
$found = false;
foreach ($list as &$row) {
    if (($row['name'] ?? '') === $name) {
        if (!isset($row['materials']) || !is_array($row['materials'])) {
            $row['materials'] = [];
        }
        $oldMaterial = $row['materials'][$material] ?? ['correct' => 0, 'wrong' => 0, 'points' => 0];
        $row['materials'][$material] = [
            'correct' => max((int)($oldMaterial['correct'] ?? 0), (int)($data['correct'] ?? 0)),
            'wrong' => max((int)($oldMaterial['wrong'] ?? 0), (int)($data['wrong'] ?? 0)),
            'points' => max((int)($oldMaterial['points'] ?? 0), (int)($data['points'] ?? 0)),
        ];
        $found = true; break;
    }
}
unset($row);
if (!$found) {
    $list[] = [
        'name' => $name,
        'materials' => [
            $material => [
                'correct' => (int)($data['correct'] ?? 0),
                'wrong' => (int)($data['wrong'] ?? 0),
                'points' => (int)($data['points'] ?? 0),
            ]
        ],
    ];
}

foreach ($list as &$row) {
    $row['correct'] = 0;
    $row['wrong'] = 0;
    $row['points'] = 0;
    foreach (($row['materials'] ?? []) as $stat) {
        $row['correct'] += (int)($stat['correct'] ?? 0);
        $row['wrong'] += (int)($stat['wrong'] ?? 0);
        $row['points'] += (int)($stat['points'] ?? 0);
    }
}
unset($row);
file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo json_encode(['ok'=>true]);
