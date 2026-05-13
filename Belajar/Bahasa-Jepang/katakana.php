<?php
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true, 'samesite' => 'Lax',
]);
session_start();
require_once __DIR__ . '/../../config.php';

// =========================================================================
// API HANDLER: MENERIMA SKOR DARI JAVASCRIPT & MENYIMPAN KE SQL
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 1. Logika Update Progress (Skor Katakana)
    if (isset($input['update_progress']) && !empty($_SESSION['user_id'])) {
        try {
            $pdo = gemu_pdo();
            
            $points = (int)$input['points'];
            $userId = $_SESSION['user_id'];
            
            // Cek progress saat ini
            $stmt = $pdo->prepare("SELECT katakana_score FROM user_progress WHERE user_id = :uid");
            $stmt->execute(['uid' => $userId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                $current_score = (int)$row['katakana_score'];
                // Tambahkan poin, batas maksimal adalah 100%
                $new_score = min(100, max(0, $current_score + $points));
                
                $updateStmt = $pdo->prepare("UPDATE user_progress SET katakana_score = :score WHERE user_id = :uid");
                $updateStmt->execute(['score' => $new_score, 'uid' => $userId]);
            } else {
                // Jika belum ada row di user_progress, buat baru
                $new_score = min(100, max(0, $points));
                $insertStmt = $pdo->prepare("INSERT INTO user_progress (user_id, hiragana_score, katakana_score, bunpou_score, kanji_score) VALUES (:uid, 0, :score, 0, 0)");
                $insertStmt->execute(['uid' => $userId, 'score' => $new_score]);
            }
            
            echo json_encode(['status' => 'success', 'new_score' => $new_score]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit;
        }
    }

    // 2. Logika Update Level AI (Menyimpan preferensi tingkat kesulitan ke Sesi)
    if (isset($input['update_level']) && !empty($_SESSION['user_id'])) {
        $_SESSION['ai_level_katakana'] = $input['level'];
        echo json_encode(['status' => 'success', 'level' => $input['level']]);
        exit;
    }
}

$isLoggedIn = !empty($_SESSION['user_name']);
$userName = $isLoggedIn ? $_SESSION['user_name'] : 'Guest';
$aiLevel = isset($_SESSION['ai_level_katakana']) ? $_SESSION['ai_level_katakana'] : 'pemula';

require __DIR__ . '/views/katakana.view.php';
