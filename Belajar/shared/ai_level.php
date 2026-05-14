<?php
declare(strict_types=1);

function belajar_level_definitions(): array
{
    return [
        'pemula' => ['label' => 'Pemula', 'min' => 0, 'desc' => 'Mulai dari istilah dasar, contoh sederhana, dan latihan pendek.'],
        'dasar' => ['label' => 'Dasar', 'min' => 35, 'desc' => 'Mulai memahami pola umum dan siap latihan bertahap.'],
        'menengah' => ['label' => 'Menengah', 'min' => 60, 'desc' => 'Mulai menghubungkan konsep dan menyelesaikan variasi soal.'],
        'lanjut' => ['label' => 'Lanjut', 'min' => 80, 'desc' => 'Siap menganalisis soal panjang, konteks, dan strategi.'],
        'profesional' => ['label' => 'Profesional', 'min' => 92, 'desc' => 'Fokus pada evaluasi, penerapan kompleks, dan ketelitian tinggi.'],
    ];
}

function belajar_normalize_subject(string $subject): string
{
    $subject = strtolower(trim($subject));
    return preg_replace('/[^a-z0-9_-]+/', '-', $subject) ?: 'umum';
}

function belajar_user_key(): string
{
    $id = $_SESSION['user_id'] ?? $_SESSION['gy_user_id'] ?? null;
    if ($id !== null && $id !== '') {
        return 'user_' . preg_replace('/[^a-zA-Z0-9_-]+/', '', (string)$id);
    }
    return 'guest_' . substr(session_id(), 0, 16);
}

function belajar_progress_file(): string
{
    $dir = __DIR__ . '/../progress';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir . '/learning_progress.json';
}

function belajar_load_progress(): array
{
    $file = belajar_progress_file();
    if (!is_file($file)) {
        return [];
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function belajar_save_progress(array $data): void
{
    file_put_contents(
        belajar_progress_file(),
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    );
}

function belajar_score_to_level(float $score): string
{
    $level = 'pemula';
    foreach (belajar_level_definitions() as $key => $info) {
        if ($score >= (float)$info['min']) {
            $level = $key;
        }
    }
    return $level;
}

function belajar_current_level_info(string $level): array
{
    $defs = belajar_level_definitions();
    return $defs[$level] ?? $defs['pemula'];
}

function belajar_get_subject_progress(string $subject): array
{
    $subject = belajar_normalize_subject($subject);
    $userKey = belajar_user_key();
    $data = belajar_load_progress();
    $row = $data[$userKey][$subject] ?? [];
    $score = isset($row['score']) ? (float)$row['score'] : 0.0;
    $level = isset($row['level']) ? (string)$row['level'] : belajar_score_to_level($score);

    return [
        'user_key' => $userKey,
        'subject' => $subject,
        'score' => round($score, 2),
        'level' => $level,
        'correct' => (int)($row['correct'] ?? 0),
        'wrong' => (int)($row['wrong'] ?? 0),
        'last_accuracy' => (float)($row['last_accuracy'] ?? 0),
        'updated_at' => (string)($row['updated_at'] ?? ''),
    ];
}

function belajar_update_subject_progress(string $subject, int $correct, int $total): array
{
    $subject = belajar_normalize_subject($subject);
    $userKey = belajar_user_key();
    $data = belajar_load_progress();
    $old = $data[$userKey][$subject] ?? [];

    $total = max(1, $total);
    $correct = max(0, min($correct, $total));
    $accuracy = round(($correct / $total) * 100, 2);
    $oldScore = isset($old['score']) ? (float)$old['score'] : 0.0;
    $newScore = round(($oldScore * 0.65) + ($accuracy * 0.35), 2);
    $level = belajar_score_to_level($newScore);

    $data[$userKey][$subject] = [
        'score' => $newScore,
        'level' => $level,
        'correct' => (int)($old['correct'] ?? 0) + $correct,
        'wrong' => (int)($old['wrong'] ?? 0) + ($total - $correct),
        'last_accuracy' => $accuracy,
        'updated_at' => date('c'),
    ];

    belajar_save_progress($data);
    return belajar_get_subject_progress($subject);
}

function belajar_select_level_content(array $levels, string $level): array
{
    if (isset($levels[$level])) {
        return $levels[$level];
    }
    return $levels['pemula'] ?? reset($levels);
}

function belajar_grade_answers(array $questions, array $answers): array
{
    $correct = 0;
    $details = [];

    foreach ($questions as $index => $q) {
        $given = trim((string)($answers['q' . $index] ?? ''));
        $expected = trim((string)($q['answer'] ?? ''));
        $isCorrect = mb_strtolower($given) === mb_strtolower($expected);
        if ($isCorrect) {
            $correct++;
        }
        $details[] = [
            'question' => (string)($q['question'] ?? ''),
            'given' => $given,
            'expected' => $expected,
            'correct' => $isCorrect,
            'explain' => (string)($q['explain'] ?? ''),
        ];
    }

    return [
        'correct' => $correct,
        'total' => count($questions),
        'details' => $details,
    ];
}
