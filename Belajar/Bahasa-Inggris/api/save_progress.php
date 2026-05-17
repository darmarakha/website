<?php
session_start();
require_once __DIR__ . '/../../../config.php';

header('Content-Type: application/json');

if (empty($_SESSION['user_name'])) {
    die(json_encode(['success' => false, 'message' => 'Not logged in']));
}

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 1;

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['type']) || !isset($data['score'])) {
    die(json_encode(['success' => false, 'message' => 'Invalid data']));
}

$type = $data['type'];
$score_to_add = (int)$data['score'];

$allowed_types = ['materi', 'latihan', 'dialog', 'listening'];

if (!in_array($type, $allowed_types)) {
    die(json_encode(['success' => false, 'message' => 'Invalid type']));
}

$column = $type . '_score';

try {
    $pdo = gemu_pdo();

    // Auto-create table to prevent DB errors on live server
    $pdo->exec("CREATE TABLE IF NOT EXISTS `user_progress_en` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `materi_score` int(11) DEFAULT '0',
        `latihan_score` int(11) DEFAULT '0',
        `dialog_score` int(11) DEFAULT '0',
        `listening_score` int(11) DEFAULT '0',
        PRIMARY KEY (`id`),
        UNIQUE KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Get current score
    $stmt = $pdo->prepare("SELECT $column FROM user_progress_en WHERE user_id = :uid");
    $stmt->execute(['uid' => $user_id]);
    $current = $stmt->fetchColumn();

    if ($current === false) {
        // Insert new record
        $stmtInsert = $pdo->prepare("INSERT INTO user_progress_en (user_id, $column) VALUES (:uid, :score)");
        $stmtInsert->execute(['uid' => $user_id, 'score' => min(100, max(0, $score_to_add))]);
        $new_score = $score_to_add;
    } else {
        // Update existing record
        $new_score = min(100, max(0, (int)$current + $score_to_add));
        $stmtUpdate = $pdo->prepare("UPDATE user_progress_en SET $column = :score WHERE user_id = :uid");
        $stmtUpdate->execute(['score' => $new_score, 'uid' => $user_id]);
    }

    echo json_encode(['success' => true, 'new_score' => $new_score]);

} catch (PDOException $e) {
    error_log("Progress save error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
