<?php
// GEMU v20 Cron: Watcher + Mode Mandiri + cleanup berjalan proaktif.
// Jalankan via cPanel Cron Job setiap 5 menit:
//   php /home/USERNAME/public_html/AI/cron.php
// atau via URL:
//   https://domainmu/AI/cron.php?key=ISI_DARI_AI_SECRET
require_once __DIR__ . '/secret.php';

$isCli = (PHP_SAPI === 'cli');
if (!$isCli) {
    header('Content-Type: application/json; charset=utf-8');
    $key = $_GET['key'] ?? '';
    if (!hash_equals(GEMU_CRON_KEY, (string)$key)) {
        http_response_code(403);
        echo json_encode(['ok'=>false, 'message'=>'Cron key salah.']);
        exit;
    }
}

define('GEMU_CRON_MODE', true);
require_once __DIR__ . '/api-cron-lib.php';

function gemu_cron_json(string $file, array $fallback = []): array {
    $data = is_file($file) ? json_decode((string)@file_get_contents($file), true) : null;
    return is_array($data) ? $data : $fallback;
}

function gemu_cron_save_json(string $file, array $data, int $chmod = 0600): void {
    $dir = dirname($file);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    @chmod($file, $chmod);
}

function gemu_cron_feed(string $role, string $type, string $message, array $meta = []): void {
    $file = __DIR__ . '/agents/agent-feed.json';
    $feed = gemu_cron_json($file, []);
    $now = time();
    $feed = array_values(array_filter($feed, fn($i) => (int)($i['ts'] ?? 0) >= ($now - 86400)));
    $last = $feed[0] ?? null;
    if ($last && ($last['role'] ?? '') === $role && ($last['type'] ?? '') === $type && ($last['message'] ?? '') === $message && ($now - (int)($last['ts'] ?? 0)) < 60) {
        return;
    }
    array_unshift($feed, [
        'id' => bin2hex(random_bytes(4)),
        'ts' => $now,
        'time' => date('Y-m-d H:i:s', $now),
        'role' => $role,
        'type' => $type,
        'message' => substr(strip_tags($message), 0, 420),
        'meta' => $meta,
    ]);
    gemu_cron_save_json($file, array_slice($feed, 0, 300));
}

function gemu_cron_due(array $state, string $key, int $seconds, int $now): bool {
    return ($now - (int)($state[$key] ?? 0)) >= $seconds;
}

$now = time();
$autonomyFile = __DIR__ . '/autonomy-state.json';
$autonomy = gemu_cron_json($autonomyFile, []);
$autonomy = array_merge([
    'enabled' => true,
    'mode_name' => 'Mode Mandiri Aman v20',
    'last_cycle_ts' => 0,
    'last_cycle_time' => null,
    'last_scan_ts' => 0,
    'last_scan_time' => null,
    'last_deep_suggestion_ts' => 0,
    'last_deep_suggestion_time' => null,
    'last_report_ts' => 0,
    'last_report_time' => null,
    'cycle_count' => 0,
    'watcher_count' => 0,
    'idea_cursor' => 0,
    'goals' => [
        'Watcher Agent mengecek file/storage/backup secara berkala tanpa menunggu chat.',
        'GEMU Frontline menjaga laporan tetap mudah dibaca.',
        'GEMU Backend menyiapkan patch hanya lewat staged edit.',
        'GEMU Sistem menahan semua perubahan sampai tombol ✓ owner Darma.'
    ],
    'last_summary' => 'Mode mandiri belum berjalan.'
], $autonomy);
$autonomy['enabled'] = true;
$autonomy['last_cycle_ts'] = $now;
$autonomy['last_cycle_time'] = date('Y-m-d H:i:s', $now);
$autonomy['cycle_count'] = (int)($autonomy['cycle_count'] ?? 0) + 1;

[$summary, $issues] = gemu_cron_scan_site();
$backupCleanup = gemu_cron_cleanup_backups(14, 30, 314572800);
$reportCleanup = gemu_cron_cleanup_reports(7, 10);

$autonomy['last_scan_ts'] = $now;
$autonomy['last_scan_time'] = date('Y-m-d H:i:s', $now);
$autonomy['watcher_count'] = (int)($autonomy['watcher_count'] ?? 0) + 1;
$autonomy['last_summary'] = 'Watcher v20 selesai: '.$summary['checked_files'].' file dicek, '.count($issues).' temuan. Cleanup backup: '.($backupCleanup['removed_count'] ?? 0).', laporan: '.($reportCleanup['removed_count'] ?? 0).'.';

gemu_cron_feed('Watcher Agent', 'SCAN', 'Scan proaktif selesai: '.$summary['checked_files'].' file dicek, '.count($issues).' temuan. Cleanup backup/laporan sudah dicek.', ['checked'=>$summary['checked_files'], 'issues'=>count($issues)]);
gemu_cron_feed('GEMU Backend', 'FILE-AUDIT', count($issues) ? 'Saya menemukan '.count($issues).' sinyal yang perlu ditinjau. Belum ada patch otomatis tanpa skor dan approve owner.' : 'Tidak ada temuan risiko baru pada scan ringan. Saya tetap memantau file inti.', ['issues'=>array_slice($issues, 0, 5)]);

$logFile = __DIR__ . '/scan-log.json';
$history = gemu_cron_json($logFile, []);
array_unshift($history, ['summary'=>$summary, 'issues'=>$issues, 'source'=>'cron-v20']);
gemu_cron_save_json($logFile, array_slice($history, 0, 30));

$activityFile = __DIR__ . '/activity-log.json';
$activity = gemu_cron_json($activityFile, []);
$activity = array_values(array_filter($activity, fn($l) => (int)($l['ts'] ?? 0) >= ($now - 3600)));
array_unshift($activity, [
    'id' => bin2hex(random_bytes(4)),
    'ts' => $now,
    'time' => date('Y-m-d H:i:s', $now),
    'type' => 'cron',
    'message' => 'Watcher v20 scan selesai. Cleanup backup: '.($backupCleanup['removed_count'] ?? 0).' folder, cleanup laporan: '.($reportCleanup['removed_count'] ?? 0).' file.',
    'meta' => ['checked'=>$summary['checked_files'] ?? 0, 'issues'=>count($issues), 'backup_cleanup'=>$backupCleanup, 'report_cleanup'=>$reportCleanup]
]);
gemu_cron_save_json($activityFile, array_slice($activity, 0, 140));

// Saran mendalam tidak dibuat setiap cron. Minimal 2 jam agar tidak spam dan tidak menumpuk draft.
$deepDue = gemu_cron_due($autonomy, 'last_deep_suggestion_ts', 7200, $now);
$suggestionMade = false;
$suggestionFile = __DIR__ . '/owner-suggestions.json';
$suggestionState = gemu_cron_json($suggestionFile, []);
if (!isset($suggestionState['pending']) || !is_array($suggestionState['pending'])) $suggestionState['pending'] = [];
if (!isset($suggestionState['history']) || !is_array($suggestionState['history'])) $suggestionState['history'] = [];

if ($deepDue) {
    $cursor = (int)($autonomy['idea_cursor'] ?? 0);
    $idea = gemu_cron_build_deep_suggestion($summary, $issues, $cursor);
    $autonomy['idea_cursor'] = $cursor + 1;
    $autonomy['last_deep_suggestion_ts'] = $now;
    $autonomy['last_deep_suggestion_time'] = date('Y-m-d H:i:s', $now);
    $title = $idea['title'];
    $detail = $idea['detail'];
    $lastPending = $suggestionState['pending'][0]['detail'] ?? '';
    if (trim($lastPending) !== trim($detail)) {
        array_unshift($suggestionState['pending'], [
            'id' => bin2hex(random_bytes(5)),
            'title' => $title,
            'detail' => $detail,
            'time' => date('Y-m-d H:i:s', $now),
            'ts' => $now,
            'meta' => ['source'=>'cron-v20', 'issues'=>array_slice($issues, 0, 8), 'deep_autonomous'=>true]
        ]);
        $suggestionState['pending'] = array_slice($suggestionState['pending'], 0, 80);
        $suggestionMade = true;
        gemu_cron_feed('GEMU Sistem', '2H-REPORT', 'Saran mandiri 2 jam dibuat dan menunggu keputusan Darma. Tidak ada file website yang ditulis.', ['title'=>$title]);
        gemu_cron_feed('GEMU Frontline', 'REPORT', 'Saya merangkum hasil Watcher menjadi saran singkat agar Darma tidak membaca log mentah.', ['pending'=>count($suggestionState['pending'])]);
    } else {
        gemu_cron_feed('GEMU Sistem', 'DEDUP', 'Saran terbaru sama dengan laporan sebelumnya, jadi tidak ditambahkan agar tidak spam.', []);
    }
    gemu_cron_save_json($suggestionFile, $suggestionState);
} else {
    $next = max(0, 7200 - ($now - (int)($autonomy['last_deep_suggestion_ts'] ?? 0)));
    gemu_cron_feed('GEMU Sistem', 'WAIT-2H', 'Belum waktunya laporan saran 2 jam. Watcher tetap aktif, tapi saran tidak dibuat agar tidak menumpuk.', ['next_seconds'=>$next]);
}

// Morning report: sekali per hari sekitar jam 08, hanya catatan ringkas di feed/state.
$hour = (int)date('G', $now);
if ($hour === 8 && gemu_cron_due($autonomy, 'last_report_ts', 20 * 3600, $now)) {
    $autonomy['last_report_ts'] = $now;
    $autonomy['last_report_time'] = date('Y-m-d H:i:s', $now);
    gemu_cron_feed('GEMU Frontline', 'MORNING-REPORT', 'Morning report siap: kondisi scan, cleanup, dan saran pending diringkas di panel owner.', ['issues'=>count($issues), 'suggestion_made'=>$suggestionMade]);
}

gemu_cron_save_json($autonomyFile, $autonomy);

// Idle dialogue 3 agent: terlihat seperti diskusi, tetapi tetap berbasis scan nyata.
$agentsDir = __DIR__ . '/agents';
if (!is_dir($agentsDir)) @mkdir($agentsDir, 0755, true);
$idleFile = $agentsDir . '/idle-dialogue.json';
$idle = gemu_cron_json($idleFile, []);
$score = 88;
if (!empty($issues)) $score -= min(30, count($issues) * 5);
if (($summary['checked_files'] ?? 0) > 1000) $score -= 4;
$score = max(0, min(100, $score));
$round = [
    'time' => date('Y-m-d H:i:s', $now),
    'score' => $score,
    'dialogue' => [
        ['role'=>'GEMU Backend','text'=>'Saya memeriksa file lokal, backup, laporan, dan sinyal keamanan. File dicek: '.($summary['checked_files'] ?? 0).'. Temuan: '.count($issues).'.'],
        ['role'=>'GEMU Sistem','text'=>'Skor idle '.$score.'%. Kalau di bawah 80, saya hanya izinkan analisis/saran, bukan draft apply. Approve tetap milik Darma.'],
        ['role'=>'GEMU Frontline','text'=>'Saya tampilkan hasil sebagai feed, kartu status, dan ringkasan supaya tidak menjadi chat panjang.'],
    ],
    'learning' => $score < 80 ? 'Mode idle perlu mengurangi risiko dan meminta analisis lanjutan sebelum draft.' : 'Mode idle aman: monitoring aktif, cleanup berjalan, dan saran tidak spam.'
];
array_unshift($idle, $round);
gemu_cron_save_json($idleFile, array_slice($idle, 0, 60));

$response = ['ok'=>true, 'mode'=>'v20-proactive-agents', 'summary'=>$summary, 'issues'=>count($issues), 'backup_cleanup'=>$backupCleanup, 'report_cleanup'=>$reportCleanup, 'suggestion_made'=>$suggestionMade];
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
