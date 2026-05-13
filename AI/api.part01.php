<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

set_exception_handler(function(Throwable $e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'ok' => false,
        'message' => 'Terjadi error PHP di API GEMU. Server tetap mengembalikan JSON supaya frontend tidak bingung.',
        'error_type' => get_class($e),
        'error_detail' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
});

register_shutdown_function(function() {
    $e = error_get_last();
    if (!$e) return;
    $fatal = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];
    if (!in_array($e['type'], $fatal, true)) return;
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'ok' => false,
        'message' => 'Fatal error PHP di API GEMU. Cek detail untuk patch file terkait.',
        'error_detail' => basename((string)$e['file']).':'.$e['line'].' — '.$e['message']
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
});

require_once __DIR__ . '/secret.php';

define('AI_DIR', __DIR__);
define('SITE_ROOT', realpath(__DIR__ . '/..'));
define('GEMU_FILE_BRAIN_LIMIT', 1073741824); // 1GB total ruang file AI owner.
define('GEMU_LOG_RETENTION_SECONDS', 3600); // Log aktivitas otomatis hanya disimpan 1 jam.
define('GEMU_SUGGESTION_INTERVAL_SECONDS', 7200); // Saran update dikumpulkan per 2 jam.

$memoryFile      = AI_DIR . '/memory.json';
$brainFile       = AI_DIR . '/brain.json';
$tasksFile       = AI_DIR . '/owner-tasks.json';
$logFile         = AI_DIR . '/scan-log.json';
$activityFile    = AI_DIR . '/activity-log.json';
$chatFile        = AI_DIR . '/owner-chat.json';
$suggestionFile  = AI_DIR . '/owner-suggestions.json';
$fileBrainDir    = AI_DIR . '/file-brain';
$fileIndexFile   = AI_DIR . '/file-brain-index.json';
$stagedEditFile  = AI_DIR . '/staged-edits.json';
$autonomyFile    = AI_DIR . '/autonomy-state.json';
$settingsFile    = AI_DIR . '/gemu-settings.json';
$reportDir       = AI_DIR . '/reports';
$processLockFile = AI_DIR . '/process-lock.json';
$agentSessionFile = AI_DIR . '/agent-session.json';
$agentDecisionsFile = AI_DIR . '/agent-decisions.json';
$agentsDir       = AI_DIR . '/agents';

function out($ok, $data = [], $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok] + $data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body)) $body = $_POST;
$action = (string)($body['action'] ?? '');

function is_owner_session(): bool {
    $role = strtolower((string)($_SESSION['user_role'] ?? ''));
    $name = strtolower((string)($_SESSION['user_name'] ?? ''));
    $ownerName = strtolower((string)(defined('GEMU_OWNER_NAME') ? GEMU_OWNER_NAME : 'Darma'));
    return $role === 'owner' && $ownerName !== '' && strpos($name, $ownerName) !== false;
}

function require_owner_token(array $body): void {
    if (!is_owner_session()) {
        out(false, ['message' => 'Akses ditolak. GEMU hanya menerima perintah akun OWNER bernama Darma.'], 403);
    }
    $token = (string)($body['token'] ?? '');
    if (!isset($_SESSION['gemu_ai_token']) || !hash_equals($_SESSION['gemu_ai_token'], $token)) {
        out(false, ['message' => 'Token keamanan tidak valid. Refresh halaman GEMU lalu coba lagi.'], 403);
    }
}

function load_json($file, $fallback) {
    if (!is_file($file)) return $fallback;
    $json = json_decode((string)file_get_contents($file), true);
    return is_array($json) ? $json : $fallback;
}

function save_json($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    @chmod($file, 0600);
    return true;
}

function safe_text($text, $limit = 700) {
    $text = trim(strip_tags((string)$text));
    $text = preg_replace('/\s+/', ' ', $text);
    return function_exists('mb_substr') ? mb_substr($text, 0, $limit) : substr($text, 0, $limit);
}


function default_gemu_settings(): array {
    return [
        'custom_prompt' => 'GEMU harus mengutamakan owner Darma, menjawab ringkas, membaca konteks lokal dulu, menyimpan ingatan tanpa konfirmasi, dan hanya mengubah website setelah owner klik tombol ✓.',
        'answer_style' => 'ringkas_rapi',
        'local_first' => true,
        'owner_approval_required' => true,
        'block_edit_stacking' => true,
        'security_audit_level' => 'complex',
        'updated_at' => date('Y-m-d H:i:s'),
    ];
}

function load_gemu_settings(): array {
    global $settingsFile;
    $data = load_json($settingsFile, default_gemu_settings());
    $base = default_gemu_settings();
    $data = array_merge($base, array_intersect_key($data, $base));
    $data['custom_prompt'] = safe_text($data['custom_prompt'] ?? $base['custom_prompt'], 4000);
    $data['answer_style'] = in_array(($data['answer_style'] ?? ''), ['ringkas_rapi','normal','detail_teknis'], true) ? $data['answer_style'] : 'ringkas_rapi';
    foreach (['local_first','owner_approval_required','block_edit_stacking'] as $key) $data[$key] = !empty($data[$key]);
    $data['security_audit_level'] = in_array(($data['security_audit_level'] ?? ''), ['basic','complex'], true) ? $data['security_audit_level'] : 'complex';
    return $data;
}

function save_gemu_settings(array $input): array {
    global $settingsFile;
    $current = load_gemu_settings();
    if (array_key_exists('custom_prompt', $input)) $current['custom_prompt'] = safe_text((string)$input['custom_prompt'], 4000);
    if (array_key_exists('answer_style', $input) && in_array($input['answer_style'], ['ringkas_rapi','normal','detail_teknis'], true)) $current['answer_style'] = $input['answer_style'];
    foreach (['local_first','owner_approval_required','block_edit_stacking'] as $key) {
        if (array_key_exists($key, $input)) $current[$key] = (bool)$input[$key];
    }
    if (array_key_exists('security_audit_level', $input) && in_array($input['security_audit_level'], ['basic','complex'], true)) $current['security_audit_level'] = $input['security_audit_level'];
    $current['updated_at'] = date('Y-m-d H:i:s');
    save_json($settingsFile, $current);
    add_activity('settings', 'Setting/prompt khusus GEMU diperbarui owner.', ['style'=>$current['answer_style'], 'security'=>$current['security_audit_level']]);
    append_brain_event('owner', 'Setting GEMU diperbarui: '.$current['custom_prompt'], ['settings'=>true, 'answer_style'=>$current['answer_style']]);
    return $current;
}

function gemu_settings_hint(): string {
    $s = load_gemu_settings();
    return safe_text((string)($s['custom_prompt'] ?? ''), 700);
}

function str_contains_any(string $haystack, array $needles): bool {
    $haystack = strtolower($haystack);
    foreach ($needles as $needle) {
        if ($needle !== '' && strpos($haystack, strtolower($needle)) !== false) return true;
    }
    return false;
}

function bytes_human(int $bytes): string {
    $units = ['B','KB','MB','GB','TB'];
    $i = 0;
    $num = max(0, $bytes);
    while ($num >= 1024 && $i < count($units)-1) { $num /= 1024; $i++; }
    return ($i === 0 ? (string)$num : number_format($num, 2)) . ' ' . $units[$i];
}

function ensure_protection(string $dir): void {
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $ht = $dir . '/.htaccess';
    if (!is_file($ht)) {
        file_put_contents($ht, "Options -Indexes\nRequire all denied\n", LOCK_EX);
        @chmod($ht, 0644);
    }
    $idx = $dir . '/index.html';
    if (!is_file($idx)) file_put_contents($idx, '<!doctype html><title>Denied</title>', LOCK_EX);
}

function gemu_recursive_dir_size(string $dir): int {
    if (!is_dir($dir)) return 0;
    $bytes = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        if ($file->isFile()) $bytes += (int)$file->getSize();
    }
    return $bytes;
}

function gemu_delete_tree(string $path): bool {
    if (!file_exists($path)) return true;
    if (is_file($path) || is_link($path)) return @unlink($path);
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $file) {
        if ($file->isDir()) @rmdir($file->getPathname());
        else @unlink($file->getPathname());
    }
    return @rmdir($path);
}

function cleanup_old_backups(int $keepDays = 7, int $keepLatest = 12, int $maxBytes = 125829120): array {
    $base = AI_DIR . '/backups';
    ensure_protection($base);
    $dirs = [];
    foreach (scandir($base) ?: [] as $name) {
        if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
        $full = $base . '/' . $name;
        if (!is_dir($full)) continue;
        $dirs[] = ['name'=>$name, 'path'=>$full, 'mtime'=>@filemtime($full) ?: 0, 'bytes'=>gemu_recursive_dir_size($full)];
    }
    usort($dirs, fn($a,$b) => $b['mtime'] <=> $a['mtime']);
    $now = time();
    $total = array_sum(array_map(fn($d) => (int)$d['bytes'], $dirs));
    $removed = [];
    foreach ($dirs as $i => $d) {
        $tooOld = $d['mtime'] > 0 && $d['mtime'] < ($now - ($keepDays * 86400));
        $tooMany = $i >= $keepLatest;
        $tooBig = $total > $maxBytes && $i >= max(3, (int)floor($keepLatest / 2));
        if ($tooOld || $tooMany || $tooBig) {
            $bytes = (int)$d['bytes'];
            if (gemu_delete_tree($d['path'])) {
                $removed[] = ['name'=>$d['name'], 'bytes'=>$bytes, 'reason'=>$tooOld?'old':($tooMany?'excess':'storage_limit')];
                $total -= $bytes;
            }
        }
    }
    if ($removed) add_activity('backup-cleanup', 'Backup lama dibersihkan otomatis: '.count($removed).' folder.', ['removed'=>$removed, 'remaining_bytes'=>$total]);
    return ['removed_count'=>count($removed), 'removed'=>$removed, 'remaining_bytes'=>$total, 'remaining_human'=>bytes_human((int)$total), 'keep_days'=>$keepDays, 'keep_latest'=>$keepLatest, 'max_human'=>bytes_human($maxBytes)];
}

function add_activity(string $type, string $message, array $meta = []): void {
    global $activityFile;
    $now = time();
    $logs = load_json($activityFile, []);
    $fresh = [];
    foreach ($logs as $log) {
        $ts = (int)($log['ts'] ?? 0);
        if ($ts >= ($now - GEMU_LOG_RETENTION_SECONDS)) $fresh[] = $log;
    }
    array_unshift($fresh, [
        'id' => bin2hex(random_bytes(4)),
        'ts' => $now,
        'time' => date('Y-m-d H:i:s', $now),
        'type' => safe_text($type, 40),
        'message' => safe_text($message, 420),
        'meta' => $meta
    ]);
    save_json($activityFile, array_slice($fresh, 0, 140));
}



function agent_feed_read(): array {
    global $agentFeedFile;
    ensure_protection(dirname($agentFeedFile));
    $feed = is_file($agentFeedFile) ? json_decode((string)@file_get_contents($agentFeedFile), true) : [];
    if (!is_array($feed)) $feed = [];
    $now = time();
    $feed = array_values(array_filter($feed, fn($l) => (int)($l['ts'] ?? 0) >= ($now - 86400)));
    return array_slice($feed, 0, 300);
}

function agent_feed_add(string $role, string $type, string $message, array $meta = []): void {
    global $agentFeedFile;
    ensure_protection(dirname($agentFeedFile));
    $role = safe_text($role, 60);
    $type = safe_text($type, 40);
    $message = safe_text($message, 420);
    $feed = agent_feed_read();
    $now = time();
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
        'message' => $message,
        'meta' => $meta,
    ]);
    $feed = array_slice($feed, 0, 300);
    @file_put_contents($agentFeedFile, json_encode($feed, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    @chmod($agentFeedFile, 0600);
}

function agent_feed_thoughts(array $feed = []): array {
    if (!$feed) $feed = agent_feed_read();
    $roles = ['GEMU Sistem', 'GEMU Frontline', 'GEMU Backend', 'Watcher Agent'];
    $out = [];
    foreach ($roles as $role) {
        $found = null;
        foreach ($feed as $item) {
            if (($item['role'] ?? '') === $role) { $found = $item; break; }
        }
        $out[$role] = $found ?: ['role'=>$role, 'message'=>'Standby. Menunggu bukti baru atau perintah Darma.', 'type'=>'standby', 'time'=>null, 'ts'=>0];
    }
    return $out;
}

function agent_page_pulse(): void {
    $pulseFile = AI_DIR . '/agents/page-pulse.json';
    ensure_protection(dirname($pulseFile));
    $state = is_file($pulseFile) ? json_decode((string)@file_get_contents($pulseFile), true) : [];
    if (!is_array($state)) $state = [];
    $now = time();
    if (($now - (int)($state['last_ts'] ?? 0)) < 60) return;
    $state['last_ts'] = $now;
    $state['last_time'] = date('Y-m-d H:i:s', $now);
    @file_put_contents($pulseFile, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    @chmod($pulseFile, 0600);
    $pending = list_staged_edits()['pending'] ?? [];
    agent_feed_add('GEMU Frontline', 'UI-PULSE', 'Memperbarui panel chat, reaksi draft, dan terminal aktif agar Darma melihat kondisi terbaru.', ['pending'=>count($pending)]);
    agent_feed_add('GEMU Sistem', 'GATEKEEPER', count($pending) ? 'Ada draft menunggu keputusan. Perubahan website tetap terkunci sampai Darma klik ✓.' : 'Tidak ada draft pending. Sistem siap menerima perintah baru tanpa menumpuk proses.', ['pending'=>count($pending)]);
}

function activity_logs(): array {
    global $activityFile;
    $now = time();
    $logs = load_json($activityFile, []);
    $fresh = array_values(array_filter($logs, function($log) use ($now) {
        return (int)($log['ts'] ?? 0) >= ($now - GEMU_LOG_RETENTION_SECONDS);
    }));
    if (count($fresh) !== count($logs)) save_json($activityFile, $fresh);
    return $fresh;
}

function default_brain(): array {
    return [
        'schema_version' => 4,
        'identity' => [
            'name' => 'GEMU AI',
            'owner' => 'Darma Alif Rakhaa',
            'priority_rule' => 'Owner Darma adalah prioritas tertinggi. GEMU boleh menyiapkan draft/rancangan edit website secara mandiri, tetapi penulisan file website hanya boleh diterapkan setelah owner Darma klik tombol ✓ approve.'
        ],
        'public_questions' => [],
        'owner_lessons' => [],
        'analysis_history' => [],
        'web_knowledge' => [],
        'summaries' => [],
        'self_diagnostics' => [
            'failed_intents' => [],
            'unanswered_count' => 0,
            'last_self_check' => null,
            'learned_corrections' => [],
            'router_notes' => []
        ],
        'integrity' => ['checksum'=>null, 'updated_at'=>null],
        'stats' => ['public_count'=>0, 'owner_count'=>0, 'analysis_count'=>0, 'web_count'=>0, 'summary_count'=>0, 'dedup_skipped'=>0],
        'last_compact_at' => null
    ];
}

function normalize_brain(array $brain): array {
    $base = default_brain();
    foreach ($base as $k => $v) {
        if (!array_key_exists($k, $brain) || (is_array($v) && !is_array($brain[$k] ?? null))) $brain[$k] = $v;
    }
    $brain['schema_version'] = max((int)($brain['schema_version'] ?? 1), (int)$base['schema_version']);
    $brain['stats'] = is_array($brain['stats'] ?? null) ? array_merge($base['stats'], $brain['stats']) : $base['stats'];
    foreach (['public_questions','owner_lessons','analysis_history','web_knowledge','summaries'] as $key) {
        if (!is_array($brain[$key] ?? null)) $brain[$key] = [];
    }
    if (!is_array($brain['identity'] ?? null)) $brain['identity'] = $base['identity'];
    if (!is_array($brain['self_diagnostics'] ?? null)) $brain['self_diagnostics'] = $base['self_diagnostics'];
    $brain['self_diagnostics'] = array_merge($base['self_diagnostics'], $brain['self_diagnostics']);
    if (!is_array($brain['integrity'] ?? null)) $brain['integrity'] = $base['integrity'];
    return $brain;
}

function brain_checksum(array $brain): string {
    $copy = $brain;
    unset($copy['integrity']);
    return substr(hash('sha256', json_encode($copy, JSON_UNESCAPED_UNICODE)), 0, 24);
}

function save_brain(array $brain): bool {
    global $brainFile;
    $brain = normalize_brain($brain);
    $brain['integrity'] = ['checksum'=>brain_checksum($brain), 'updated_at'=>date('Y-m-d H:i:s')];
    return save_json($brainFile, $brain);
}

function normalize_prompt(string $q): string {
    $q = trim($q);
    $replacements = [
        '/\brapih\b/i' => 'rapi',
        '/\beror\b/i' => 'error',
        '/\bfiksi\b/i' => 'fitur',
        '/\bfiture\b/i' => 'fitur',
        '/\bgemu\s+tolong\b/i' => 'tolong',
        '/\bbuat(in|kan)?\b/i' => 'buatkan',
        '/\bmemberishkan\b/i' => 'membersihkan',
        '/\bkatif\b/i' => 'aktif'
    ];
    foreach ($replacements as $pattern => $replacement) $q = preg_replace($pattern, $replacement, $q);
    return preg_replace('/\s+/', ' ', (string)$q);
}

function brain_bucket_for_type(string $type): string {
    if ($type === 'public') return 'public_questions';
    if ($type === 'owner') return 'owner_lessons';
    if ($type === 'web') return 'web_knowledge';
    return 'analysis_history';
}

function event_hash(string $type, string $text): string {
    $norm = function_exists('mb_strtolower') ? mb_strtolower(safe_text($text, 1500), 'UTF-8') : strtolower(safe_text($text, 1500));
    return substr(hash('sha256', $type.'|'.$norm), 0, 16);
}

function distill_knowledge(array $entries, string $label, int $maxWords = 8): string {
    $stop = array_flip(['yang','dan','atau','dari','untuk','dengan','dalam','ini','itu','adalah','karena','pada','akan','tidak','sudah','bisa','file','website','gemu','darma']);
    $topics = [];
    foreach ($entries as $entry) {
        $txt = strtolower((string)($entry['text'] ?? $entry['question'] ?? $entry['answer'] ?? $entry['title'] ?? ''));
        preg_match_all('/[a-z0-9_\-]{5,}/i', $txt, $m);
        foreach ($m[0] ?? [] as $w) {
            $w = strtolower($w);
            if (isset($stop[$w])) continue;
            $topics[$w] = ($topics[$w] ?? 0) + 1;
        }
    }
    arsort($topics);
    $top = array_slice(array_keys($topics), 0, $maxWords);
    return $top ? ($label.' — inti topik: '.implode(', ', $top)) : summarize_entries($entries, $label, 10);
}

function log_failed_response(string $q, string $tool, string $reason): void {
    global $brainFile;
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    $brain['self_diagnostics']['failed_intents'][] = [
        'query' => safe_text($q, 180),
        'tool' => safe_text($tool, 60),
        'reason' => safe_text($reason, 260),
        'time' => date('Y-m-d H:i:s'),
        'hash' => event_hash('failed', $q.'|'.$tool.'|'.$reason)
    ];
    $brain['self_diagnostics']['failed_intents'] = array_slice($brain['self_diagnostics']['failed_intents'], 0, 40);
    $brain['self_diagnostics']['unanswered_count'] = (int)($brain['self_diagnostics']['unanswered_count'] ?? 0) + 1;
    save_brain($brain);
}

function self_diagnose_and_suggest(): array {
    global $brainFile;
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    $failed = $brain['self_diagnostics']['failed_intents'] ?? [];
    $counts = [];
    foreach ($failed as $f) {
        $tool = (string)($f['tool'] ?? 'unknown');
        $counts[$tool] = ($counts[$tool] ?? 0) + 1;
    }
    arsort($counts);
    $suggestions = [];
    foreach ($counts as $tool => $count) {
        if ($count >= 2) $suggestions[] = 'Self-diagnostic: intent '.$tool.' gagal/kurang yakin '.$count.'x. Tambah sinyal router atau handler khusus agar jawaban tidak template.';
    }
    $brain['self_diagnostics']['last_self_check'] = date('Y-m-d H:i:s');
    $brain['self_diagnostics']['router_notes'] = array_slice($suggestions, 0, 10);
    save_brain($brain);
    return $suggestions;
}

function gemu_keywords(string $text): array {
    $text = strtolower(safe_text($text, 1000));
    preg_match_all('/[a-z0-9_\-]{4,}/i', $text, $m);
    $stop = array_flip(['yang','dari','untuk','dengan','atau','bisa','akan','sudah','tidak','agar','pada','dalam','kalau','gimana','kenapa','apa','kamu','anda','saya','aku','milik','punya']);
    $out = [];
    foreach ($m[0] ?? [] as $w) if (!isset($stop[$w])) $out[$w] = true;
    return array_keys($out);
}

function retrieve_relevant_memory(string $q, int $limit = 4): array {
    global $brainFile, $memoryFile;
    $qNorm = strtolower(safe_text($q, 1000));
    $keys = gemu_keywords($q);
    if (!$keys) return [];
    $items = [];
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    foreach (['owner_lessons','summaries','web_knowledge','analysis_history','public_questions'] as $bucket) {
        foreach (array_slice($brain[$bucket] ?? [], 0, 80) as $entry) {
            $txt = (string)($entry['text'] ?? '');
            if ($txt === '' || strtolower(safe_text($txt, 1000)) === $qNorm) continue;
            if (preg_match('/^(Setting GEMU diperbarui|Kamu adalah GEMU AI|GEMU AI, asisten profesional)/i', trim($txt))) continue;
            $score = 0;
            foreach ($keys as $k) if (stripos($txt, $k) !== false) $score++;
            if ($score > 1) $items[] = ['score'=>$score, 'bucket'=>$bucket, 'text'=>safe_text($txt, 160), 'time'=>$entry['time'] ?? null];
        }
    }
    foreach (array_slice(load_json($memoryFile, []), 0, 120) as $entry) {
        $txt = (string)($entry['text'] ?? '');
        if (strtolower(safe_text($txt, 1000)) === $qNorm) continue;
        $score = 0;
        foreach ($keys as $k) if (stripos($txt, $k) !== false) $score += 2;
        if ($score > 1) $items[] = ['score'=>$score, 'bucket'=>'memory', 'text'=>safe_text($txt, 160), 'time'=>$entry['time'] ?? null];
    }
    usort($items, fn($a,$b) => ($b['score'] <=> $a['score']));
    return array_slice($items, 0, $limit);
}

function summarize_entries(array $entries, string $label, int $max = 18): string {
    $parts = [];
    foreach (array_slice($entries, 0, $max) as $entry) {
        $txt = safe_text($entry['text'] ?? $entry['question'] ?? $entry['answer'] ?? $entry['title'] ?? '', 160);
        if ($txt !== '') $parts[] = $txt;
    }
    if (!$parts) return '';
    return $label . ': ' . implode(' | ', $parts);
}

function compact_brain_if_needed(): void {
    global $brainFile, $memoryFile;
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    $memory = load_json($memoryFile, []);
    $brainSize = is_file($brainFile) ? filesize($brainFile) : 0;
    $needCompact = $brainSize > 550000 || count($brain['public_questions']) > 140 || count($brain['owner_lessons']) > 180 || count($brain['analysis_history']) > 100 || count($brain['web_knowledge']) > 180 || count($memory) > 190;
    if (!$needCompact) return;

    $summaryParts = [];
    if (count($brain['public_questions']) > 80) {
        $old = array_slice($brain['public_questions'], 80);
        $summaryParts[] = distill_knowledge($old, 'Ringkasan pertanyaan tamu lama');
        $brain['public_questions'] = array_slice($brain['public_questions'], 0, 80);
    }
    if (count($brain['owner_lessons']) > 120) {
        $old = array_slice($brain['owner_lessons'], 120);
        $summaryParts[] = distill_knowledge($old, 'Ringkasan instruksi owner lama');
        $brain['owner_lessons'] = array_slice($brain['owner_lessons'], 0, 120);
    }
    if (count($brain['analysis_history']) > 70) {
        $old = array_slice($brain['analysis_history'], 70);
        $summaryParts[] = distill_knowledge($old, 'Ringkasan analisis lama');
        $brain['analysis_history'] = array_slice($brain['analysis_history'], 0, 70);
    }
    if (count($brain['web_knowledge']) > 100) {
        $old = array_slice($brain['web_knowledge'], 100);
        $summaryParts[] = distill_knowledge($old, 'Ringkasan ilmu internet lama');
        $brain['web_knowledge'] = array_slice($brain['web_knowledge'], 0, 100);
    }
    if (count($memory) > 140) {
        $old = array_slice($memory, 140);
        $summaryParts[] = distill_knowledge($old, 'Ringkasan memori owner lama');
        $memory = array_slice($memory, 0, 140);
        save_json($memoryFile, $memory);
    }
    $summaryText = safe_text(implode(' || ', array_filter($summaryParts)), 2500);
    if ($summaryText !== '') {
        array_unshift($brain['summaries'], ['time'=>date('Y-m-d H:i:s'), 'text'=>$summaryText, 'reason'=>'auto-compact']);
        $brain['summaries'] = array_slice($brain['summaries'], 0, 50);
        $brain['stats']['summary_count'] = (int)($brain['stats']['summary_count'] ?? 0) + 1;
        $brain['last_compact_at'] = date('Y-m-d H:i:s');
        add_activity('memory', 'Otak GEMU diringkas otomatis agar tidak terlalu panjang.', ['summary_bytes'=>strlen($summaryText)]);
    }
    save_brain($brain);
}

function append_brain_event(string $type, string $text, array $meta = []): void {
    global $brainFile;
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    $text = safe_text($text, 1800);
    if ($text === '') return;
    $bucket = brain_bucket_for_type($type);
    $hash = event_hash($type, $text);

    foreach (array_slice($brain[$bucket] ?? [], 0, 80) as $entry) {
        if (($entry['hash'] ?? '') === $hash || safe_text($entry['text'] ?? '', 1800) === $text) {
            $brain['stats']['dedup_skipped'] = (int)($brain['stats']['dedup_skipped'] ?? 0) + 1;
            save_brain($brain);
            return;
        }
    }

    $entry = ['text'=>$text, 'hash'=>$hash, 'time'=>date('Y-m-d H:i:s'), 'ts'=>time()] + $meta;
    if ($type === 'public') {
        $brain['stats']['public_count'] = (int)($brain['stats']['public_count'] ?? 0) + 1;
        $entry['text'] = safe_text($text, 320);
        array_unshift($brain['public_questions'], $entry);
        $brain['public_questions'] = array_slice($brain['public_questions'], 0, 160);
    } elseif ($type === 'owner') {
        $brain['stats']['owner_count'] = (int)($brain['stats']['owner_count'] ?? 0) + 1;
        $entry['text'] = safe_text($text, 1200);
        array_unshift($brain['owner_lessons'], $entry);
        $brain['owner_lessons'] = array_slice($brain['owner_lessons'], 0, 200);
    } elseif ($type === 'web') {
        $brain['stats']['web_count'] = (int)($brain['stats']['web_count'] ?? 0) + 1;
        $entry['text'] = safe_text($text, 1600);
        array_unshift($brain['web_knowledge'], $entry);
        $brain['web_knowledge'] = array_slice($brain['web_knowledge'], 0, 180);
    } else {
        $brain['stats']['analysis_count'] = (int)($brain['stats']['analysis_count'] ?? 0) + 1;
        $entry['text'] = safe_text($text, 1500);
        array_unshift($brain['analysis_history'], $entry);
        $brain['analysis_history'] = array_slice($brain['analysis_history'], 0, 110);
    }
    save_brain($brain);
    compact_brain_if_needed();
}

function append_owner_chat(string $who, string $text, array $meta = []): void {
    global $chatFile;
    $who = $who === 'owner' ? 'owner' : 'gemu';
    $text = safe_text($text, 5000);
    if ($text === '') return;
    $chat = load_json($chatFile, []);
    $chat[] = ['id'=>bin2hex(random_bytes(5)), 'who'=>$who, 'text'=>$text, 'time'=>date('Y-m-d H:i:s'), 'ts'=>time(), 'meta'=>$meta];
    if (count($chat) > 520) {
        $old = array_slice($chat, 0, count($chat)-500);
        $summary = distill_knowledge($old, 'Ringkasan chat owner lama', 10);
        append_brain_event('owner', $summary, ['source'=>'owner-chat-auto-summary']);
        $chat = array_slice($chat, -500);
    }
    save_json($chatFile, $chat);
}

function suggestion_state(): array {
    global $suggestionFile;
    $state = load_json($suggestionFile, ['last_digest_ts'=>0, 'pending'=>[], 'history'=>[]]);
    if (!is_array($state['pending'] ?? null)) $state['pending'] = [];
    if (!is_array($state['history'] ?? null)) $state['history'] = [];
    $state['last_digest_ts'] = (int)($state['last_digest_ts'] ?? 0);
    return $state;
}

function queue_suggestion(string $title, string $detail, array $meta = []): void {
    global $suggestionFile;
    $state = suggestion_state();
    array_unshift($state['pending'], [
        'id' => bin2hex(random_bytes(5)),
        'title' => safe_text($title, 140),
        'detail' => safe_text($detail, 1200),
        'time' => date('Y-m-d H:i:s'),
        'ts' => time(),
        'meta' => $meta
    ]);
    $state['pending'] = array_slice($state['pending'], 0, 120);
    save_json($suggestionFile, $state);
}

function suggestion_items_from_live_context(): array {
    $items = [];
    $ideas = autonomous_deep_ideas([], []);
    foreach (array_slice($ideas, 0, 8) as $idea) {
        $items[] = [
            'id' => bin2hex(random_bytes(5)),
            'title' => safe_text($idea['title'] ?? 'Saran mandiri GEMU', 140),
            'detail' => safe_text($idea['detail'] ?? 'Saran dibuat dari konteks website terbaru.', 1200),
            'time' => date('Y-m-d H:i:s'),
            'ts' => time(),
            'meta' => ['source'=>'live_context', 'idea_key'=>$idea['key'] ?? 'context']
        ];
    }
    if (!$items) {
        $items[] = [
            'id' => bin2hex(random_bytes(5)),
            'title' => 'Saran mandiri: audit ringan website',
            'detail' => 'GEMU belum menemukan saran spesifik dari memori. Langkah aman: baca file kunci website, cek navbar, homepage, storage, lalu buat patch kecil yang tetap menunggu tombol ✓ owner Darma.',
            'time' => date('Y-m-d H:i:s'),
            'ts' => time(),
            'meta' => ['source'=>'fallback_context']
        ];
    }
    return $items;
}

function generate_suggestion_report_page(array $items): string {
    $time = htmlspecialchars(date('Y-m-d H:i:s'), ENT_QUOTES, 'UTF-8');
    $list = '';
    foreach (array_slice($items, 0, 20) as $i => $s) {
        $no = $i + 1;
        $title = htmlspecialchars((string)($s['title'] ?? 'Saran GEMU'), ENT_QUOTES, 'UTF-8');
        $detail = htmlspecialchars((string)($s['detail'] ?? '-'), ENT_QUOTES, 'UTF-8');
        $list .= "<article class=\"item\"><span>#{$no}</span><h2>{$title}</h2><p>{$detail}</p></article>";
    }
    if ($list === '') $list = '<article class="item"><h2>Belum ada saran spesifik</h2><p>GEMU menunggu data scan, chat owner, atau konteks website berikutnya.</p></article>';
    return <<<HTML
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Laporan Saran GEMU</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(circle at top left,rgba(56,189,248,.18),transparent 34%),linear-gradient(135deg,#061323,#102a43);color:#eaf6ff}.wrap{width:min(1040px,100% - 32px);margin:auto;padding:30px 0}.hero,.item,.note{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.075);border-radius:24px;padding:20px;margin:14px 0;box-shadow:0 18px 45px rgba(0,0,0,.16)}.pill{display:inline-flex;padding:7px 12px;border-radius:999px;background:rgba(56,189,248,.16);color:#bae6fd;font-weight:800}.hero h1{font-size:clamp(2.1rem,5vw,4rem);line-height:1;margin:14px 0}.item span{display:inline-flex;border-radius:999px;padding:4px 10px;background:rgba(24,193,132,.14);color:#b9f6dc;font-weight:900}.item h2{font-size:1.1rem;margin:12px 0 8px}.item p,.note p{line-height:1.75;color:#cbdff4}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.safe{border-color:rgba(24,193,132,.28)}
</style>
</head>
<body><main class="wrap"><section class="hero"><span class="pill">Draft saran — menunggu keputusan Darma</span><h1>Laporan Saran GEMU</h1><p>Dibuat: {$time}. Approve ✓ hanya membuat halaman laporan ini sebagai arsip keputusan; GEMU tetap tidak mengubah file utama tanpa izin owner.</p></section><section class="grid">{$list}</section><section class="note safe"><h2>Aturan Aman</h2><p>Darma bisa klik ✓ untuk menyimpan laporan saran ini, atau × untuk menolak. Untuk saran yang mengubah website utama, GEMU tetap harus membuat draft edit terpisah dan menunggu approve owner lagi.</p></section></main></body></html>
HTML;
}

function create_suggestion_staged_draft(array $items, string $source = 'suggestions_digest'): ?array {
    $state = public_staged_edits();
    if (count($state['pending'] ?? []) > 0) return null;
    $html = generate_suggestion_report_page($items);
    $path = gemu_report_path('gemu-laporan-saran', $html);
    if ($path === null) return ['message'=>'Laporan saran tidak dibuat ulang karena isinya sama dengan laporan terakhir.', 'skipped_duplicate'=>true];
    return stage_website_edit($path, $html, 'GEMU membuat draft laporan saran agar tombol ✓/× langsung muncul saat Darma meminta saran.', ['source'=>$source, 'suggestion_count'=>count($items)]);
}

function build_suggestion_digest(bool $force = false): array {
    global $suggestionFile;
    $state = suggestion_state();
    $now = time();
    $due = $force || $state['last_digest_ts'] === 0 || ($now - $state['last_digest_ts']) >= GEMU_SUGGESTION_INTERVAL_SECONDS;
    if (!$due) {
        return ['due'=>false, 'next_in_seconds'=>GEMU_SUGGESTION_INTERVAL_SECONDS - ($now - $state['last_digest_ts']), 'pending'=>$state['pending']];
    }
    $pending = $state['pending'];
    $generatedLive = false;
    if (!$pending && $force) {
        $pending = suggestion_items_from_live_context();
        $generatedLive = true;
    }
    if (!$pending) return ['due'=>true, 'message'=>'Belum ada saran update baru. Otak GEMU masih tenang, tidak bikin drama server 😄', 'pending'=>[]];

    $draft = null;
    $existingPendingEdits = public_staged_edits()['pending'] ?? [];
    if (!$existingPendingEdits) {
        $draft = create_suggestion_staged_draft($pending, $generatedLive ? 'suggestions_live_context' : 'suggestions_digest');
    }

    $lines = [];
    foreach (array_slice($pending, 0, 20) as $i => $s) {
        $lines[] = ($i+1).'. '.$s['title'].' — '.$s['detail'];
    }
    $message = "Laporan saran GEMU:\n" . implode("\n", $lines) . "\n\n";
    if ($draft) {
        $message .= "Aku juga sudah membuat draft laporan saran supaya tombol ✓ Setujui dan × Tolak langsung muncul di bawah chat pada Reaksi Draft. Website utama belum diubah.";
    } elseif ($existingPendingEdits) {
        $message .= "Tombol ✓ dan × sudah tersedia pada draft pending di bawah chat pada Reaksi Draft. Selesaikan draft itu dulu agar tidak menumpuk.";
    } else {
        $message .= "Aku belum mengubah website. Kalau saran ini akan dijadikan perubahan website, GEMU harus membuat draft edit dulu lalu menunggu tombol ✓ owner.";
    }

    $state['history'][] = ['time'=>date('Y-m-d H:i:s'), 'ts'=>$now, 'items'=>$pending, 'message'=>$message, 'staged_edit_id'=>$draft['id'] ?? null];
    $state['history'] = array_slice($state['history'], -40);
    if (!$generatedLive) $state['pending'] = [];
    $state['last_digest_ts'] = $now;
    save_json($suggestionFile, $state);
    append_brain_event('analysis', 'Digest saran dibuat', ['items'=>count($pending), 'staged_edit_id'=>$draft['id'] ?? null, 'generated_live'=>$generatedLive]);
    return ['due'=>true, 'message'=>$message, 'pending'=>[], 'history'=>$state['history'], 'staged_edit'=>$draft];
}


function default_autonomy_state(): array {
    return [
        'enabled' => true,
        'mode_name' => 'Mode Mandiri Aman',
        'last_cycle_ts' => 0,
        'last_cycle_time' => null,
        'last_scan_ts' => 0,
        'last_scan_time' => null,
        'cycle_count' => 0,
        'idea_cursor' => 0,
        'goals' => [
            'Mengamati kesehatan website secara berkala.',
            'Mengumpulkan saran update tanpa spam.',
            'Menyiapkan draft edit bila ada kebutuhan perubahan.',
            'Tidak menulis file website tanpa tombol ✓ owner Darma.'
        ],
        'last_summary' => 'Mode mandiri belum berjalan.'
    ];
}

function autonomy_state(): array {
    global $autonomyFile;
    $state = load_json($autonomyFile, default_autonomy_state());
    $base = default_autonomy_state();
    foreach ($base as $k => $v) {
        if (!array_key_exists($k, $state)) $state[$k] = $v;
    }
    if (!is_array($state['goals'] ?? null)) $state['goals'] = $base['goals'];
    $state['enabled'] = (bool)($state['enabled'] ?? true);
    $state['last_cycle_ts'] = (int)($state['last_cycle_ts'] ?? 0);
    $state['last_scan_ts'] = (int)($state['last_scan_ts'] ?? 0);
    $state['cycle_count'] = (int)($state['cycle_count'] ?? 0);
    $state['idea_cursor'] = (int)($state['idea_cursor'] ?? 0);
    return $state;
}

function save_autonomy_state(array $state): void {
    global $autonomyFile;
    save_json($autonomyFile, $state);
}

function staged_edit_state(): array {
    global $stagedEditFile;
    $state = load_json($stagedEditFile, ['pending'=>[], 'applied'=>[], 'rejected'=>[]]);
    foreach (['pending','applied','rejected'] as $key) {
        if (!is_array($state[$key] ?? null)) $state[$key] = [];
    }
    return $state;
}

function save_staged_edit_state(array $state): void {
    global $stagedEditFile;
    $state['pending'] = array_slice(array_values($state['pending'] ?? []), 0, 80);
    $state['applied'] = array_slice(array_values($state['applied'] ?? []), 0, 120);
    $state['rejected'] = array_slice(array_values($state['rejected'] ?? []), 0, 120);
    save_json($stagedEditFile, $state);
}

function compact_diff_note(string $old, string $new): array {
    $oldLines = preg_split('/\R/', $old);
    $newLines = preg_split('/\R/', $new);
    $oldCount = is_array($oldLines) ? count($oldLines) : 0;
    $newCount = is_array($newLines) ? count($newLines) : 0;
    return [
        'old_bytes' => strlen($old),
        'new_bytes' => strlen($new),
        'old_lines' => $oldCount,
        'new_lines' => $newCount,
        'line_delta' => $newCount - $oldCount,
        'byte_delta' => strlen($new) - strlen($old),
    ];
}

function gemu_check_balanced_pairs(string $content): array {
    $stack = [];
    $pairs = [')'=>'(', ']'=>'[', '}'=>'{'];
    $open = ['('=>true,'['=>true,'{'=>true];
    $inString = null;
    $escaped = false;
    $line = 1;
    $len = strlen($content);
    for ($i=0; $i<$len; $i++) {
        $ch = $content[$i];
        if ($ch === "\n") $line++;
        if ($inString !== null) {
            if ($escaped) { $escaped = false; continue; }
            if ($ch === '\\') { $escaped = true; continue; }
            if ($ch === $inString) $inString = null;
            continue;
        }
        if ($ch === '"' || $ch === "'") { $inString = $ch; continue; }
        if (isset($open[$ch])) $stack[] = [$ch,$line];
        elseif (isset($pairs[$ch])) {
            $last = array_pop($stack);
            if (!$last || $last[0] !== $pairs[$ch]) return ['ok'=>false, 'message'=>'Pasangan simbol tidak seimbang di sekitar baris '.$line.' pada karakter '.$ch.'.'];
        }
    }
    if ($inString !== null) return ['ok'=>false, 'message'=>'Ada string yang belum tertutup.'];
    if ($stack) {
        $last = end($stack);
        return ['ok'=>false, 'message'=>'Ada simbol pembuka '.$last[0].' yang belum ditutup sejak baris '.$last[1].'.'];
    }
    return ['ok'=>true, 'message'=>'Kurung/brace/bracket dasar seimbang.'];
}

function gemu_extract_html_ids(string $content): array {
    preg_match_all('/\bid\s*=\s*(["\'])(.*?)\1/i', $content, $m);
    $ids = [];
    foreach ($m[2] ?? [] as $id) {
        $id = trim((string)$id);
        if ($id !== '') $ids[] = $id;
    }
    return $ids;
}

function gemu_duplicate_values(array $values): array {
    $seen = [];
    $dup = [];
    foreach ($values as $v) {
        if (isset($seen[$v])) $dup[$v] = true;
        $seen[$v] = true;
    }
    return array_keys($dup);
}

function gemu_related_files_for_path(string $rel): array {
    $map = [
        'index.php' => ['partials/navbar.php','partials/footer.php','app.js','data.js'],
        'partials/navbar.php' => ['index.php','app.js','data.js'],
        'partials/footer.php' => ['index.php','app.js'],
        'app.js' => ['index.php','partials/navbar.php','data.js'],
        'data.js' => ['index.php','app.js'],
        'AI/index.php' => ['AI/gemu.js','AI/gemu.css'],
        'AI/gemu.js' => ['AI/index.php','AI/gemu.css'],
        'AI/gemu.css' => ['AI/index.php','AI/gemu.js'],
    ];
    $files = $map[$rel] ?? [];
    if (preg_match('/Belajar\/Bahasa-Jepang/i', $rel)) $files = array_merge($files, ['Belajar/Bahasa-Jepang/index.php','Belajar/Bahasa-Jepang/assets/js/script.js','Belajar/Bahasa-Jepang/assets/css/style.css']);
    return array_values(array_unique(array_filter($files, fn($f) => is_file(SITE_ROOT . '/' . $f))));
}

function run_syntax_command(array $cmd, string $stdin = '', int $timeout = 6): array {
    if (!function_exists('proc_open')) return ['ran'=>false, 'ok'=>true, 'detail'=>'proc_open tidak tersedia di hosting, lint eksternal dilewati.'];
    $descriptor = [0=>['pipe','r'], 1=>['pipe','w'], 2=>['pipe','w']];
    $process = @proc_open($cmd, $descriptor, $pipes, SITE_ROOT);
    if (!is_resource($process)) return ['ran'=>false, 'ok'=>true, 'detail'=>'Command lint tidak bisa dijalankan di hosting.'];
    if ($stdin !== '') fwrite($pipes[0], $stdin);
    fclose($pipes[0]);
    $out = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $err = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $code = proc_close($process);
    return ['ran'=>true, 'ok'=>$code === 0, 'code'=>$code, 'detail'=>safe_text(trim($out."\n".$err), 900)];
}

function external_syntax_check(string $rel, string $content): array {
    $ext = strtolower(pathinfo($rel, PATHINFO_EXTENSION));
    if (!in_array($ext, ['php','js'], true)) return ['ran'=>false, 'ok'=>true, 'detail'=>'Tidak perlu lint eksternal untuk ekstensi ini.'];
    $tmp = tempnam(sys_get_temp_dir(), 'gemu_lint_');
    if ($tmp === false) return ['ran'=>false, 'ok'=>true, 'detail'=>'Tidak bisa membuat file sementara lint.'];
    $tmpPath = $tmp . '.' . $ext;
    @rename($tmp, $tmpPath);
    file_put_contents($tmpPath, $content, LOCK_EX);
    if ($ext === 'php') {
        $php = defined('PHP_BINARY') && PHP_BINARY ? PHP_BINARY : 'php';
        $result = run_syntax_command([$php, '-l', $tmpPath]);
        @unlink($tmpPath);
        return $result + ['name'=>'php -l'];
    }
    $result = run_syntax_command(['node', '--check', $tmpPath]);
    @unlink($tmpPath);
    if (!empty($result['ran']) && ($result['code'] ?? 0) === 127) return ['ran'=>false, 'ok'=>true, 'detail'=>'Node.js tidak tersedia, JS lint eksternal dilewati.', 'name'=>'node --check'];
    return $result + ['name'=>'node --check'];
}

