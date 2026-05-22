<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';

if (empty($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Belum login.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// CSRF token
if (empty($_SESSION['_csrf'])) {
    $_SESSION['_csrf'] = bin2hex(random_bytes(32));
}

$data = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($data)) $data = [];

// Validasi CSRF token
$token = $data['_csrf'] ?? '';
if (!hash_equals($_SESSION['_csrf'], $token)) {
    echo json_encode(['status' => 'error', 'message' => 'CSRF token invalid.'], JSON_UNESCAPED_UNICODE);
    exit;
}

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
    $allowedLevels = ['pemula', 'mahir', 'pro'];
    if (!in_array($newLevel, $allowedLevels, true)) {
        echo json_encode(['status' => 'error', 'message' => 'Level tidak valid.'], JSON_UNESCAPED_UNICODE);
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

// Prevent absurd values — hanya terima >= 0
$correct = max(0, min(50, $correct));
$wrong   = max(0, min(50, $wrong));
$points  = max(0, min(200, $points));

$stmt = $pdo->prepare("
  UPDATE users
  SET correct = GREATEST(correct + :c, 0),
      wrong   = GREATEST(wrong + :w, 0),
      points  = GREATEST(points + :p, 0)
  WHERE id = :id
");
$stmt->execute(['c' => $correct, 'w' => $wrong, 'p' => $points, 'id' => $userId]);

echo json_encode(['status' => 'success', 'message' => 'Score tersimpan.'], JSON_UNESCAPED_UNICODE);
