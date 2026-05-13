<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';

if (empty($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Belum login.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($data)) $data = [];

try {
    $pdo = gemu_pdo();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)$_SESSION['user_id'];

// Mode 1: update ai_level (legacy)
if (isset($data['level'])) {
    $newLevel = (string)$data['level'];
    if ($newLevel === '') {
        echo json_encode(['status' => 'error', 'message' => 'Level kosong.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $stmt = $pdo->prepare("UPDATE users SET ai_level = ? WHERE id = ?");
    $stmt->execute([$newLevel, $userId]);
    $_SESSION['ai_level'] = $newLevel;
    echo json_encode(['status' => 'success', 'message' => 'Level AI diupdate: ' . $newLevel], JSON_UNESCAPED_UNICODE);
    exit;
}

// Mode 2: update score/points
$correct = isset($data['correct']) ? (int)$data['correct'] : 0;
$wrong   = isset($data['wrong']) ? (int)$data['wrong'] : 0;
$points  = isset($data['points']) ? (int)$data['points'] : 0;

if ($correct === 0 && $wrong === 0 && $points === 0) {
    echo json_encode(['status' => 'success', 'message' => 'No-op.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Prevent absurd values
$correct = max(-5, min(50, $correct));
$wrong   = max(-5, min(50, $wrong));
$points  = max(-100, min(200, $points));

$stmt = $pdo->prepare("
  UPDATE users
  SET correct = GREATEST(correct + :c, 0),
      wrong   = GREATEST(wrong + :w, 0),
      points  = points + :p
  WHERE id = :id
");
$stmt->execute(['c' => $correct, 'w' => $wrong, 'p' => $points, 'id' => $userId]);

echo json_encode(['status' => 'success', 'message' => 'Score tersimpan.'], JSON_UNESCAPED_UNICODE);

