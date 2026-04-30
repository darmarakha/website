<?php
session_start();
header('Content-Type: application/json');
if (empty($_SESSION['belajar_user'])) { echo json_encode(['ok'=>false]); exit; }
$data = json_decode(file_get_contents('php://input'), true) ?: [];
$file = __DIR__ . '/../leaderboard.json';
$list = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
$name = $_SESSION['belajar_user'];
$found = false;
foreach ($list as &$row) {
    if (($row['name'] ?? '') === $name) {
        $row['correct'] = max((int)($row['correct'] ?? 0), (int)($data['correct'] ?? 0));
        $row['wrong'] = max((int)($row['wrong'] ?? 0), (int)($data['wrong'] ?? 0));
        $row['points'] = max((int)($row['points'] ?? 0), (int)($data['points'] ?? 0));
        $found = true; break;
    }
}
unset($row);
if (!$found) $list[] = ['name'=>$name,'correct'=>(int)($data['correct']??0),'wrong'=>(int)($data['wrong']??0),'points'=>(int)($data['points']??0)];
file_put_contents($file, json_encode($list, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo json_encode(['ok'=>true]);
