<?php
// BRAIN, MEMORY & STORAGE LOGIC
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

function draft_quality_checks(string $rel, string $content, string $old = ''): array {
    $ext = strtolower(pathinfo($rel, PATHINFO_EXTENSION));
    $checks = [];
    $errors = [];
    $warnings = [];

    $checks[] = ['name'=>'konten tidak kosong', 'ok'=>trim($content) !== '', 'detail'=>'Draft harus punya isi final, bukan saran kosong.'];
    if (trim($content) === '') $errors[] = 'Konten draft kosong.';
    if ($old !== '' && hash('sha256', $old) === hash('sha256', $content)) {
        $warnings[] = 'Isi draft sama dengan file lama, jadi tidak ada perubahan nyata.';
    }

    $balanced = gemu_check_balanced_pairs($content);
    $checks[] = ['name'=>'struktur simbol dasar', 'ok'=>$balanced['ok'], 'detail'=>$balanced['message']];
    if (!$balanced['ok']) $errors[] = $balanced['message'];

    if ($ext === 'php') {
        $openTags = substr_count($content, '<?php') + substr_count($content, '<?=');
        $closeTags = substr_count($content, '?>');
        $checks[] = ['name'=>'tag PHP terdeteksi', 'ok'=>$openTags > 0 || preg_match('/<!doctype|<html|<section|<div/i', $content), 'detail'=>'File PHP boleh berisi template HTML, tetapi tag PHP/template harus jelas.'];
        if ($openTags === 0 && !preg_match('/<!doctype|<html|<section|<div/i', $content)) $warnings[] = 'File .php tidak punya tag PHP atau struktur HTML yang jelas.';
        if ($closeTags > $openTags + 2) $warnings[] = 'Jumlah tag penutup PHP terlihat tidak wajar.';
        if (preg_match('/\$_(GET|POST|REQUEST)\s*\[[^\]]+\]\s*\.\s*include/i', $content)) $errors[] = 'Input user terlihat dipakai untuk include, berisiko LFI/RFI.';
    }

    if ($ext === 'js') {
        if (preg_match('/\bconst\s+([A-Za-z_$][\w$]*)\b[\s\S]*\bconst\s+\1\b/', $content)) $warnings[] = 'Ada kemungkinan deklarasi const ganda. Cek ulang scope JS.';
        if (preg_match('/document\.write\s*\(/i', $content)) $warnings[] = 'document.write sebaiknya dihindari karena rawan merusak rendering.';
    }

    if (in_array($ext, ['php','html'], true)) {
        $ids = gemu_extract_html_ids($content);
        $dups = gemu_duplicate_values($ids);
        $checks[] = ['name'=>'ID HTML tidak ganda', 'ok'=>count($dups) === 0, 'detail'=>count($dups) ? 'Duplikat: '.implode(', ', array_slice($dups,0,8)) : 'Tidak ada ID ganda di draft.'];
        if ($dups) $warnings[] = 'Ada ID HTML ganda: '.implode(', ', array_slice($dups,0,8)).'.';
    }

    $looksLikeNavbarDraft = preg_match('~(^|/)(navbar|nav)[^/]*\.(php|html)$~i', $rel) || preg_match('/id=["\']site-navbar|site-menu-button|site-side-menu|menu-overlay/i', $content);
    if ($looksLikeNavbarDraft) {
        $hasButton = preg_match('/site-menu-button|gemu-burger-button|burger|menu-button/i', $content);
        $hasPanel = preg_match('/site-side-menu|mobile-menu|side-menu|menu-overlay/i', $content);
        $checks[] = ['name'=>'komponen navbar lengkap', 'ok'=>(bool)($hasButton && $hasPanel), 'detail'=>$hasButton && $hasPanel ? 'Tombol dan panel menu terdeteksi.' : 'Tombol/panel menu belum lengkap.'];
        if (!$hasButton || !$hasPanel) $warnings[] = 'Draft navbar belum jelas memiliki tombol dan panel menu.';
    }

    $riskScanContent = executable_risk_scan_content($content, $ext);
    if ($ext === 'php') {
        foreach ([
            '\beval\s*\(' => 'eval()',
            '\bshell_exec\s*\(' => 'shell_exec()',
            '\bsystem\s*\(' => 'system()',
            '\bpassthru\s*\(' => 'passthru()',
            '\bexec\s*\(' => 'exec()'
        ] as $rx => $label) {
            if (preg_match('/'.$rx.'/i', $riskScanContent)) $errors[] = 'Draft mengandung fungsi server berisiko: '.$label;
        }
    } elseif (in_array($ext, ['js','html'], true)) {
        if (preg_match('/\beval\s*\(/i', $riskScanContent)) $warnings[] = 'Draft memiliki eval() pada JavaScript. Hindari kecuali benar-benar diperlukan.';
    }

    if (in_array($ext, ['php','js'], true)) {
        $lint = external_syntax_check($rel, $content);
        $checks[] = ['name'=>($lint['name'] ?? 'lint eksternal'), 'ok'=>(bool)($lint['ok'] ?? true), 'detail'=>($lint['detail'] ?? 'Lint selesai.')];
        if (!($lint['ok'] ?? true)) $errors[] = 'Syntax lint gagal: '.($lint['detail'] ?? 'tanpa detail');
        if (empty($lint['ran'])) $warnings[] = $lint['detail'] ?? 'Lint eksternal dilewati oleh hosting.';
    }

    $related = [];
    foreach (gemu_related_files_for_path($rel) as $f) {
        $related[] = ['file'=>$f, 'exists'=>is_file(SITE_ROOT.'/'.$f), 'bytes'=>is_file(SITE_ROOT.'/'.$f) ? filesize(SITE_ROOT.'/'.$f) : 0];
    }

    $ok = count($errors) === 0;
    return [
        'ok' => $ok,
        'status' => $ok ? (count($warnings) ? 'passed_with_warnings' : 'passed') : 'failed',
        'time' => date('Y-m-d H:i:s'),
        'checks' => $checks,
        'warnings' => $warnings,
        'errors' => $errors,
        'related_files' => $related,
    ];
}


function gemu_process_lock_status(): array {
    global $processLockFile;
    $lock = load_json($processLockFile, []);
    if (!is_array($lock)) $lock = [];
    $active = !empty($lock['active']) && ((time() - (int)($lock['ts'] ?? 0)) < 180);
    return ['active'=>$active, 'lock'=>$lock];
}

function gemu_acquire_process_lock(string $type, string $label): bool {
    global $processLockFile;
    $status = gemu_process_lock_status();
    if ($status['active']) return false;
    save_json($processLockFile, [
        'active'=>true,
        'type'=>$type,
        'label'=>safe_text($label, 220),
        'ts'=>time(),
        'time'=>date('Y-m-d H:i:s')
    ]);
    add_activity('process-lock', 'Lock proses aktif: '.$label, ['type'=>$type]);
    return true;
}

function gemu_release_process_lock(string $message = 'Proses selesai'): void {
    global $processLockFile;
    save_json($processLockFile, ['active'=>false, 'message'=>safe_text($message, 220), 'ts'=>time(), 'time'=>date('Y-m-d H:i:s')]);
    add_activity('process-lock', 'Lock proses dilepas: '.$message);
}

function stage_website_edit(string $relInput, string $content, string $reason = 'Draft edit website', array $meta = []): array {
    [$rel, $full] = resolve_safe_path($relInput);
    if (strlen($content) > 900000) out(false, ['message'=>'Konten terlalu besar untuk dijadikan draft edit lewat GEMU.'], 400);
    $old = is_file($full) ? (string)file_get_contents($full) : '';
    $quality = draft_quality_checks($rel, $content, $old);
    if (!$quality['ok']) {
        add_activity('test', 'Draft edit gagal test otomatis: '.$rel, ['errors'=>$quality['errors'] ?? []]);
        out(false, ['message'=>'Draft edit ditolak oleh test otomatis. GEMU tidak akan menaruh draft rusak ke pending.', 'path'=>$rel, 'quality'=>$quality], 422);
    }
    $state = staged_edit_state();
    $edit = [
        'id' => bin2hex(random_bytes(5)),
        'path' => $rel,
        'reason' => safe_text($reason, 360),
        'status' => 'waiting_owner_confirmation',
        'content' => $content,
        'old_hash' => hash('sha256', $old),
        'new_hash' => hash('sha256', $content),
        'diff' => compact_diff_note($old, $content),
        'quality' => $quality,
        'time' => date('Y-m-d H:i:s'),
        'ts' => time(),
        'meta' => $meta,
    ];
    array_unshift($state['pending'], $edit);
    save_staged_edit_state($state);
    queue_suggestion('Draft edit siap: '.$rel, 'GEMU sudah menyiapkan draft edit dan menjalankan test otomatis: '.$quality['status'].'. Belum diterapkan ke website. Darma cukup klik ✓ approve atau × tolak.', ['staged_edit_id'=>$edit['id'], 'path'=>$rel, 'quality'=>$quality['status']]);
    append_brain_event('analysis', 'Draft edit website disiapkan: '.$rel, ['staged_edit_id'=>$edit['id'], 'reason'=>$reason, 'diff'=>$edit['diff']]);
    add_activity('staged-edit', 'Draft edit lolos test otomatis dan menunggu keputusan owner: '.$rel, ['id'=>$edit['id'], 'diff'=>$edit['diff'], 'quality'=>$quality['status']]);
    agent_feed_add('GEMU Backend', 'STAGED-EDIT', 'Draft untuk '.$rel.' lolos test otomatis dan siap masuk panel reaksi ✓/×.', ['id'=>$edit['id'], 'quality'=>$quality['status']]);
    agent_feed_add('GEMU Sistem', 'APPROVAL-GATE', 'Website belum diubah. Draft terkunci sampai Darma menekan tombol ✓ approve.', ['path'=>$rel]);
    $publicEdit = $edit;
    unset($publicEdit['content']);
    return $publicEdit;
}

function apply_staged_edit_by_id(string $id, bool $ownerApproved = false): array {
    if (!$ownerApproved) out(false, ['message'=>'Aksi approve belum valid. Klik tombol ✓ Setujui & Terapkan dari panel owner.'], 403);
    $state = staged_edit_state();
    $idx = null;
    foreach ($state['pending'] as $i => $edit) {
        if (($edit['id'] ?? '') === $id) { $idx = $i; break; }
    }
    if ($idx === null) out(false, ['message'=>'Draft edit tidak ditemukan atau sudah diproses.'], 404);
    $edit = $state['pending'][$idx];
    [$rel, $full] = resolve_safe_path((string)($edit['path'] ?? ''));
    $content = (string)($edit['content'] ?? '');

    if (!gemu_acquire_process_lock('apply_staged_edit', 'Apply draft '.$rel)) {
        out(false, ['message'=>'Masih ada proses edit/apply lain yang berjalan. Tunggu sampai selesai agar perubahan tidak numpuk.'], 409);
    }

    $process = [];
    try {
        $process[] = '1. Lock proses aktif agar apply tidak numpuk.';
        $current = is_file($full) ? (string)file_get_contents($full) : '';
        $currentHash = hash('sha256', $current);
        $process[] = '2. Hash file lama dicek.';
        if (!hash_equals((string)($edit['old_hash'] ?? ''), $currentHash)) {
            gemu_release_process_lock('Apply dibatalkan karena hash file berubah.');
            out(false, ['message'=>'File sudah berubah sejak draft edit dibuat. Baca ulang file, buat draft baru, lalu approve lagi supaya tidak menimpa perubahan terbaru.', 'process'=>$process], 409);
        }
        $quality = draft_quality_checks($rel, $content, $current);
        $process[] = '3. Test otomatis sebelum apply: '.$quality['status'].'.';
        if (!$quality['ok']) {
            gemu_release_process_lock('Apply dibatalkan karena test otomatis gagal.');
            out(false, ['message'=>'Draft tidak diterapkan karena gagal test otomatis ulang sebelum apply.', 'quality'=>$quality, 'process'=>$process], 422);
        }
        $backupDir = AI_DIR . '/backups/' . date('Ymd');
        ensure_protection(AI_DIR . '/backups');
        ensure_protection($backupDir);
        $backupFile = null;
        if (is_file($full)) {
            $safeName = preg_replace('/[^A-Za-z0-9_.-]+/', '_', $rel);
            $backupFile = $backupDir . '/' . date('His') . '_' . $safeName . '.bak';
            copy($full, $backupFile);
        }
        $process[] = '4. Backup file lama disimpan ke AI/backups/'.date('Ymd').'.';
        file_put_contents($full, $content, LOCK_EX);
        @chmod($full, 0644);
        $process[] = '5. File '.$rel.' diterapkan.';

        $written = is_file($full) ? (string)file_get_contents($full) : '';
        $postQuality = draft_quality_checks($rel, $written, $current);
        if (!$postQuality['ok']) {
            file_put_contents($full, $current, LOCK_EX);
            @chmod($full, 0644);
            $process[] = '6. Test setelah apply gagal, rollback otomatis ke file lama.';
            gemu_release_process_lock('Rollback selesai karena post-test gagal.');
            out(false, ['message'=>'Apply dibatalkan. Test setelah penulisan gagal, jadi GEMU rollback otomatis ke file lama.', 'quality'=>$postQuality, 'process'=>$process], 422);
        }
        $process[] = '6. Test setelah apply lolos.';

        $edit['status'] = 'applied';
        $edit['applied_time'] = date('Y-m-d H:i:s');
        $edit['applied_ts'] = time();
        $edit['backup_dir'] = 'AI/backups/' . date('Ymd');
        $edit['backup_file'] = $backupFile ? ('AI/backups/'.date('Ymd').'/'.basename($backupFile)) : null;
        $edit['quality_recheck'] = $quality;
        $edit['post_quality'] = $postQuality;
        $edit['process'] = $process;
        array_splice($state['pending'], $idx, 1);
        array_unshift($state['applied'], $edit);
        save_staged_edit_state($state);
        append_brain_event('owner', 'Draft edit diterapkan owner via tombol approve: '.$rel, ['staged_edit_id'=>$id, 'quality'=>$quality['status'], 'post_quality'=>$postQuality['status']]);
        add_activity('file', 'Draft edit diterapkan bertahap lewat tombol ✓ owner: '.$rel, ['id'=>$id, 'bytes'=>strlen($content), 'quality'=>$quality['status'], 'post_quality'=>$postQuality['status']]);
        agent_feed_add('GEMU Backend', 'APPLY', 'Draft '.$rel.' diterapkan bertahap: lock, hash, backup, test, tulis file, test ulang.', ['id'=>$id, 'post_quality'=>$postQuality['status']]);
        agent_feed_add('GEMU Sistem', 'DONE', 'Apply selesai dengan backup dan test ulang. Tidak ada proses menumpuk.', ['path'=>$rel]);
        gemu_release_process_lock('Apply draft selesai: '.$rel);
        $publicEdit = $edit;
        unset($publicEdit['content']);
        return $publicEdit;
    } catch (Throwable $e) {
        gemu_release_process_lock('Apply error: '.$e->getMessage());
        out(false, ['message'=>'Apply error: '.$e->getMessage(), 'path'=>$rel, 'process'=>$process], 500);
    }
}

function reject_staged_edit_by_id(string $id, string $reason = ''): array {
    $state = staged_edit_state();
    $idx = null;
    foreach ($state['pending'] as $i => $edit) {
        if (($edit['id'] ?? '') === $id) { $idx = $i; break; }
    }
    if ($idx === null) out(false, ['message'=>'Draft edit tidak ditemukan atau sudah diproses.'], 404);
    $edit = $state['pending'][$idx];
    $edit['status'] = 'rejected';
    $edit['rejected_time'] = date('Y-m-d H:i:s');
    $edit['reject_reason'] = safe_text($reason, 300);
    array_splice($state['pending'], $idx, 1);
    array_unshift($state['rejected'], $edit);
    save_staged_edit_state($state);
    add_activity('staged-edit', 'Draft edit ditolak owner: '.($edit['path'] ?? '-'), ['id'=>$id]);
    agent_feed_add('GEMU Sistem', 'REJECTED', 'Darma menolak draft. Website tidak diubah dan ide tidak dieksekusi.', ['id'=>$id, 'path'=>($edit['path'] ?? '-')]);
    $publicEdit = $edit;
    unset($publicEdit['content']);
    return $publicEdit;
}

function public_staged_edits(): array {
    $state = staged_edit_state();
    foreach (['pending','applied','rejected'] as $bucket) {
        foreach ($state[$bucket] as $i => $edit) unset($state[$bucket][$i]['content']);
    }
    return $state;
}



function gemu_website_profile(): array {
    $important = ['index.php','partials/navbar.php','partials/footer.php','app.js','data.js','AI/index.php','AI/gemu.js','AI/gemu.css','AI/guide-widget.js','AI/guide-widget.css'];
    $profile = ['files'=>[], 'signals'=>[], 'missing'=>[]];
    foreach ($important as $file) {
        $full = SITE_ROOT . '/' . $file;
        if (!is_file($full)) { $profile['missing'][] = $file; continue; }
        $txt = (string)@file_get_contents($full, false, null, 0, 180000);
        $profile['files'][$file] = ['bytes'=>strlen($txt), 'sha'=>hash('sha256', $txt)];
        if ($file === 'partials/navbar.php') {
            $profile['signals']['navbar_partial'] = true;
            $profile['signals']['burger_button'] = preg_match('/site-menu-button|gemu-burger-button|burger/i', $txt) ? true : false;
            $profile['signals']['side_menu'] = preg_match('/site-side-menu|menu-overlay/i', $txt) ? true : false;
            $profile['signals']['navbar_self_heal'] = strpos($txt, 'GEMU NAVBAR SELF-HEAL') !== false;
        }
        if ($file === 'index.php') {
            $profile['signals']['uses_navbar_partial'] = strpos($txt, 'partials/navbar.php') !== false;
            $profile['signals']['has_meta_description'] = strpos($txt, 'name="description"') !== false || strpos($txt, "name='description'") !== false;
            $profile['signals']['has_mobile_viewport'] = strpos($txt, 'name="viewport"') !== false;
        }
        if ($file === 'AI/gemu.js') {
            $profile['signals']['approve_buttons'] = strpos($txt, 'approved:true') !== false && strpos($txt, '✓ Setujui') !== false;
            $profile['signals']['manual_confirm_removed'] = strpos($txt, 'KONFIRMASI'.' OWNER DARMA') === false;
        }
        if ($file === 'AI/api.php') {
            $profile['signals']['draft_quality_tests'] = strpos($txt, 'draft_quality_checks') !== false;
        }
    }
    $profile['summary_text'] = 'Profil website: '.count($profile['files']).' file kunci terbaca, missing '.count($profile['missing']).', sinyal '.count($profile['signals']).'.';
    return $profile;
}

function autonomous_deep_ideas(array $summary = [], array $issues = []): array {
    $issueCount = (int)($summary['issues_total'] ?? count($issues));
    $profile = gemu_website_profile();
    $signals = $profile['signals'];
    $ideas = [];

    if (!empty($signals['navbar_partial'])) {
        $ideas[] = [
            'key' => 'navbar_partial_health',
            'title' => 'Usulan mandiri: audit navbar partial yang benar',
            'detail' => 'Kenapa: struktur website sekarang memakai partial navbar, jadi GEMU harus fokus ke partials/navbar.php, bukan asal index.php. Hasil baca: burger button '.(!empty($signals['burger_button'])?'ada':'belum jelas').', side menu '.(!empty($signals['side_menu'])?'ada':'belum jelas').', self-heal '.(!empty($signals['navbar_self_heal'])?'sudah ada':'belum ada').'. Ide aman: siapkan patch kecil hanya bila tombol/panel menu kurang kuat. Apply tetap lewat tombol ✓ Darma.'
        ];
    }
    if (empty($signals['approve_buttons']) || empty($signals['manual_confirm_removed'])) {
        $ideas[] = [
            'key' => 'owner_approve_ui',
            'title' => 'Usulan mandiri: rapikan approve draft edit',
            'detail' => 'Kenapa: Darma cukup ingin memilih ✓ atau ×, bukan mengetik konfirmasi manual. Ide: pastikan AI/gemu.js mengirim approved:true, backend api.php tetap memvalidasi token owner, dan rejected tersimpan ke riwayat. Ini mencegah bug konfirmasi berulang.'
        ];
    }
    if (empty($signals['has_meta_description'])) {
        $ideas[] = [
            'key' => 'seo_meta_missing',
            'title' => 'Usulan mandiri: tambah meta SEO homepage',
            'detail' => 'Kenapa: homepage belum terdeteksi punya meta description. Ide: tambah meta description dan Open Graph ringan di index.php agar portfolio Darma lebih jelas saat dibagikan. Risiko rendah, tapi tetap menunggu approve Darma.'
        ];
    }
    if ($issueCount > 0) {
        $issueFiles = array_values(array_unique(array_map(fn($x) => (string)($x['file'] ?? '-'), array_slice($issues, 0, 8))));
        $ideas[] = [
            'key' => 'scan_findings_review',
            'title' => 'Usulan mandiri: tindak lanjut temuan scan nyata',
            'detail' => 'Kenapa: scan terakhir menemukan '.$issueCount.' catatan. File awal: '.implode(', ', $issueFiles).'. Ide: pilah warning aman vs berbahaya, baca file terkait, lalu buat patch kecil yang dites otomatis sebelum pending edit. Tidak ada file ditulis tanpa ✓ owner.'
        ];
    }
    $ideas[] = [
        'key' => 'daily_activity_from_owner_flow',
        'title' => 'Usulan mandiri: fitur Aktivitas Harian Owner',
        'detail' => 'Kenapa: Darma sering mengurus update website bertahap. Ide: halaman aktivitas-harian.php dengan prioritas, checklist, progress, dan export JSON. Karena halaman baru, risiko rendah dan tidak menyentuh database. GEMU bisa menyiapkan draft sendiri dari prompt sederhana.'
    ];
    $ideas[] = [
        'key' => 'mobile_quality_audit',
        'title' => 'Usulan mandiri: audit mobile berdasarkan struktur aktual',
        'detail' => 'Kenapa: bug visual sering muncul di layar HP. Berdasarkan file kunci yang terbaca, audit harus mengecek index.php, partials/navbar.php, app.js, dan widget AI. Fokus: area klik minimal 44px, overflow-x, z-index bubble/chat, dan menu yang tidak menimpa konten.'
    ];

    $storage = audit_local_storage(6);
    if (($storage['backups']['total_bytes'] ?? 0) > 52428800 || count($storage['top_files'] ?? []) > 0) {
        $largest = $storage['top_files'][0] ?? ['file'=>'-', 'human'=>'0 B'];
        $ideas[] = [
            'key' => 'storage_hygiene_from_audit',
            'title' => 'Usulan mandiri: hemat storage dari audit nyata',
            'detail' => 'Kenapa: audit storage menemukan total '.$storage['total_human'].' dengan file terbesar '.$largest['file'].' ('.$largest['human'].'). Backup saat ini '.$storage['backups']['total_human'].'. Ide aman: pakai reuse backup 15 menit, auto-cleanup 7 hari/12 backup/120MB, dan minta Darma sebelum menghapus file brain besar.'
        ];
    }

    foreach (array_slice(self_diagnose_and_suggest(), 0, 3) as $note) {
        $ideas[] = [
            'key' => 'self_diagnostic_router',
            'title' => 'Usulan mandiri: perbaiki pola respons GEMU',
            'detail' => $note.' Aksi aman: catat sebagai prioritas router, lalu jika perlu buat patch kecil pada handler intent tanpa mengubah website utama sebelum ✓ owner.'
        ];
    }

    return array_values($ideas);
}

function queue_autonomous_deep_suggestion(array $summary = [], array $issues = [], string $reason = 'autonomous'): string {
    $state = autonomy_state();
    $ideas = autonomous_deep_ideas($summary, $issues);
    $cursor = (int)($state['idea_cursor'] ?? 0);
    $idea = $ideas[$cursor % count($ideas)];
    $state['idea_cursor'] = $cursor + 1;
    save_autonomy_state($state);
    queue_suggestion($idea['title'], $idea['detail'], ['reason'=>$reason, 'idea_key'=>$idea['key'], 'deep_autonomous'=>true]);
    return $idea['title'];
}

function generate_autonomous_report_page(array $summary = [], array $issues = [], array $ideas = [], array $self = []): string {
    $time = htmlspecialchars(date('Y-m-d H:i:s'), ENT_QUOTES, 'UTF-8');
    $checked = (int)($summary['checked_files'] ?? 0);
    $total = (int)($summary['issues_total'] ?? count($issues));
    $danger = (int)($summary['danger_total'] ?? 0);
    $ideaHtml = '';
    foreach (array_slice($ideas, 0, 8) as $idea) {
        $ideaHtml .= '<li><b>'.htmlspecialchars((string)($idea['title'] ?? '-'), ENT_QUOTES, 'UTF-8').'</b><br><span>'.htmlspecialchars((string)($idea['detail'] ?? '-'), ENT_QUOTES, 'UTF-8').'</span></li>';
    }
    if ($ideaHtml === '') $ideaHtml = '<li>Belum ada ide baru. GEMU menunggu data scan berikutnya.</li>';
    $issueHtml = '';
    foreach (array_slice($issues, 0, 10) as $i) {
        $issueHtml .= '<li><b>'.htmlspecialchars((string)($i['level'] ?? 'info'), ENT_QUOTES, 'UTF-8').'</b> — <code>'.htmlspecialchars((string)($i['file'] ?? '-'), ENT_QUOTES, 'UTF-8').'</code>: '.htmlspecialchars((string)($i['message'] ?? '-'), ENT_QUOTES, 'UTF-8').'</li>';
    }
    if ($issueHtml === '') $issueHtml = '<li>Tidak ada temuan berbahaya dari scan ringan terakhir.</li>';
    $selfHtml = '';
    foreach (array_slice($self, 0, 6) as $x) $selfHtml .= '<li>'.htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8').'</li>';
    if ($selfHtml === '') $selfHtml = '<li>Self-diagnostic tidak menemukan pola kegagalan berulang.</li>';
    return <<<HTML
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Laporan Mandiri GEMU</title>
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#071422;color:#eaf6ff}.wrap{width:min(1000px,100% - 32px);margin:auto;padding:28px}.card{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);border-radius:24px;padding:20px;margin:14px 0}code{color:#7dd3fc}.pill{display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(56,189,248,.16);color:#bae6fd}li{margin:10px 0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.stat{border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:14px;background:rgba(0,0,0,.18)}@media(max-width:720px){.grid{grid-template-columns:1fr}}</style>
</head>
<body><main class="wrap"><a href="index.php" style="color:#7dd3fc">← Portfolio</a><section class="card"><span class="pill">Draft laporan mandiri — belum mengubah website</span><h1>Laporan Mandiri GEMU</h1><p>Dibuat: {$time}. File ini adalah draft review agar tombol ✓/× selalu punya bahan keputusan. Approve hanya membuat halaman laporan ini; tidak mengubah file utama.</p></section><section class="grid"><div class="stat"><b>File dicek</b><h2>{$checked}</h2></div><div class="stat"><b>Total temuan</b><h2>{$total}</h2></div><div class="stat"><b>Bahaya</b><h2>{$danger}</h2></div></section><section class="card"><h2>Ide berdasarkan konteks nyata</h2><ol>{$ideaHtml}</ol></section><section class="card"><h2>Temuan scan</h2><ol>{$issueHtml}</ol></section><section class="card"><h2>Self-diagnostic GEMU</h2><ol>{$selfHtml}</ol></section><section class="card"><h2>Aturan aman</h2><p>GEMU boleh membuat draft dan saran, tetapi edit website utama tetap harus menunggu owner Darma klik tombol ✓. Tombol × membuang draft tanpa menulis file.</p></section></main></body></html>
HTML;
}

function create_autonomous_staged_draft(array $summary = [], array $issues = [], string $reason = 'autonomous'): ?array {
    $state = public_staged_edits();
    if (count($state['pending'] ?? []) > 0) return null;
    $ideas = autonomous_deep_ideas($summary, $issues);
    $self = self_diagnose_and_suggest();
    $html = generate_autonomous_report_page($summary, $issues, $ideas, $self);
    $path = gemu_report_path('gemu-laporan-mandiri', $html);
    if ($path === null) return null;
    return stage_website_edit($path, $html, 'GEMU membuat draft laporan mandiri berbasis scan, storage, dan self-diagnostic. Menunggu ✓ owner Darma.', ['source'=>$reason, 'autonomous_report'=>true, 'idea_keys'=>array_map(fn($i)=>$i['key'] ?? '', array_slice($ideas,0,6))]);
}

function run_autonomous_cycle(string $reason = 'manual'): array {
    $state = autonomy_state();
    $now = time();
    if (!$state['enabled']) {
        return ['ran'=>false, 'message'=>'Mode mandiri sedang nonaktif.', 'state'=>$state];
    }
    $force = in_array($reason, ['manual','manual_force','cron'], true);
    if (!$force && ($now - $state['last_cycle_ts']) < 300) {
        return ['ran'=>false, 'message'=>'Mode mandiri baru berjalan sebentar lalu. GEMU menahan diri supaya server tidak berat.', 'state'=>$state];
    }

    $actions = [];
    $shouldScan = ($now - (int)$state['last_scan_ts']) >= 7200 || in_array($reason, ['manual_force','cron'], true);
    if ($shouldScan) {
        [$summary, $issues] = scan_site('autonomous');
        $state['last_scan_ts'] = $now;
        $state['last_scan_time'] = date('Y-m-d H:i:s', $now);
        $actions[] = 'Scan + backup mandiri selesai: '.$summary['checked_files'].' file, '.$summary['issues_total'].' temuan.';
        if (($summary['issues_total'] ?? 0) > 0) {
            $issueFiles = array_values(array_unique(array_map(fn($x) => (string)($x['file'] ?? '-'), array_slice($issues, 0, 8))));
            $detail = 'Ada '.$summary['issues_total'].' temuan scan. Analisis GEMU: temuan perlu dipilah antara warning keamanan, pola kode berisiko, dan catatan kecil. File awal: '.implode(', ', $issueFiles).'. Langkah aman: baca file terkait, buat patch kecil, backup dulu, lalu tunggu approve Darma sebelum menulis website.';
            queue_suggestion('Temuan scan mandiri GEMU', $detail, ['issues'=>array_slice($issues, 0, 8), 'deep_autonomous'=>true]);
        }
    } else {
        $actions[] = 'Scan dilewati karena belum lewat 2 jam dari scan mandiri terakhir.';
    }

    $suggestions = suggestion_state();
    if (count($suggestions['pending'] ?? []) > 0) {
        $actions[] = 'Saran tertunda dipantau: '.count($suggestions['pending']).' item.';
    } else {
        $ideaTitle = queue_autonomous_deep_suggestion($summary ?? [], $issues ?? [], $reason);
        $actions[] = 'Saran mandiri mendalam dibuat: '.$ideaTitle;
    }

    $draft = create_autonomous_staged_draft($summary ?? [], $issues ?? [], $reason);
    if ($draft) {
        $actions[] = 'Draft laporan mandiri dibuat dan menunggu tombol ✓/× owner: '.($draft['path'] ?? '-').'.';
        queue_suggestion('Draft laporan mandiri siap', 'GEMU sudah membuat draft laporan mandiri berbasis scan/self-diagnostic. Darma bisa approve atau tolak dari area Reaksi Draft di bawah chat.', ['staged_edit_id'=>$draft['id'] ?? null, 'deep_autonomous'=>true]);
    } else {
        $actions[] = 'Draft mandiri baru tidak dibuat karena masih ada pending edit lain atau konteks belum aman.';
    }

    $state['last_cycle_ts'] = $now;
    $state['last_cycle_time'] = date('Y-m-d H:i:s', $now);
    $state['cycle_count'] = (int)$state['cycle_count'] + 1;
    $state['last_summary'] = safe_text(implode(' ', $actions), 900);
    save_autonomy_state($state);
    append_brain_event('analysis', 'Mode mandiri berjalan: '.$state['last_summary'], ['reason'=>$reason]);
    add_activity('mandiri', 'Mode mandiri GEMU berjalan. Tidak ada file ditulis tanpa tombol ✓ owner.', ['actions'=>$actions]);
    return ['ran'=>true, 'message'=>$state['last_summary'], 'actions'=>$actions, 'state'=>$state];
}

function site_knowledge(): array {
    return [
        'name' => 'Darma Alif Rakhaa',
        'role' => 'Physics graduate, data analysis enthusiast, Python programming, portfolio owner.',
        'education' => 'S1 Fisika Universitas Negeri Malang.',
        'experience' => 'Research internship COSINE-100 / dark matter experiment, data quality, background modeling, Gaussian peak fitting, simulation efficiency.',
        'website' => 'Portfolio, sertifikat, pengalaman, proyek, belajar, bisnis, dan AI guide GEMU.',
    ];
}

function why_questions(string $q): array {
    $q = safe_text($q, 260);
    $base = trim(preg_replace('/^(kenapa|mengapa|apa itu|bagaimana|gimana|cari|search)\s+/i', '', $q));
    if ($base === '') $base = $q;
    $why = [
        'Kenapa '.$base.' penting?',
        'Kenapa orang mencari '.$base.'?',
        'Apa inti jawaban paling singkat tentang '.$base.'?'
    ];
    return array_values(array_unique(array_map(fn($x) => safe_text($x, 180), $why)));
}

function fetch_url_once(string $url, int $timeout = 5): array {
    $info = ['ok'=>false, 'status'=>0, 'error'=>'', 'bytes'=>0];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => $timeout,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_USERAGENT => 'GEMU-AI/1.0 (+owner Darma)',
        ]);
        $data = curl_exec($ch);
        $info['status'] = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($data === false) $info['error'] = (string)curl_error($ch);
        curl_close($ch);
        $text = is_string($data) ? $data : '';
        $info['bytes'] = strlen($text);
        $info['ok'] = $text !== '' && ($info['status'] === 0 || ($info['status'] >= 200 && $info['status'] < 400));
        return ['text'=>$text, 'info'=>$info];
    }
    $ctx = stream_context_create(['http'=>['timeout'=>$timeout, 'header'=>'User-Agent: GEMU-AI/1.0']]);
    $data = @file_get_contents($url, false, $ctx);
    $text = is_string($data) ? $data : '';
    $info['bytes'] = strlen($text);
    $info['ok'] = $text !== '';
    if (!$info['ok']) $info['error'] = 'file_get_contents gagal/timeout';
    return ['text'=>$text, 'info'=>$info];
}

function fetch_url_text(string $url, int $timeout = 5, int $retry = 2): string {
    $last = ['ok'=>false, 'error'=>'belum dicoba'];
    for ($i = 0; $i <= $retry; $i++) {
        $result = fetch_url_once($url, $timeout);
        $last = $result['info'] ?? [];
        if (!empty($last['ok'])) {
            if ($i > 0) add_activity('internet', 'Fetch internet berhasil setelah retry ke-'.$i.'.', ['url'=>safe_text($url,180), 'status'=>$last['status'] ?? 0]);
            return (string)($result['text'] ?? '');
        }
        if ($i < $retry) usleep(250000);
    }
    add_activity('internet-error', 'Fetch internet gagal setelah retry.', ['url'=>safe_text($url,180), 'status'=>$last['status'] ?? 0, 'error'=>safe_text($last['error'] ?? '', 180)]);
    return '';
}

function fetch_web_snippets(string $query): array {
    $query = safe_text($query, 160);
    $snippets = [];

    $wikiUrl = 'https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=' . rawurlencode($query) . '&format=json&utf8=1&srlimit=3';
    $wiki = fetch_url_text($wikiUrl, 5);
    $json = json_decode($wiki, true);
    if (is_array($json['query']['search'] ?? null)) {
        foreach ($json['query']['search'] as $item) {
            $title = safe_text($item['title'] ?? '', 120);
            $snippet = safe_text($item['snippet'] ?? '', 260);
            if ($title || $snippet) {
                $snippets[] = ['source'=>'Wikipedia ID', 'title'=>$title, 'snippet'=>$snippet, 'url'=>'https://id.wikipedia.org/wiki/' . rawurlencode(str_replace(' ', '_', $title))];
            }
        }
    }

    if (!$snippets) {
        $ddgUrl = 'https://api.duckduckgo.com/?q=' . rawurlencode($query) . '&format=json&no_html=1&skip_disambig=1';
        $ddg = fetch_url_text($ddgUrl, 5);
        $json = json_decode($ddg, true);
        $abstract = safe_text($json['AbstractText'] ?? '', 420);
        if ($abstract !== '') $snippets[] = ['source'=>'DuckDuckGo', 'title'=>safe_text($json['Heading'] ?? $query, 120), 'snippet'=>$abstract, 'url'=>safe_text($json['AbstractURL'] ?? '', 250)];
        if (is_array($json['RelatedTopics'] ?? null)) {
            foreach ($json['RelatedTopics'] as $topic) {
                $txt = safe_text($topic['Text'] ?? '', 280);
                if ($txt !== '') $snippets[] = ['source'=>'DuckDuckGo', 'title'=>$query, 'snippet'=>$txt, 'url'=>safe_text($topic['FirstURL'] ?? '', 250)];
                if (count($snippets) >= 3) break;
            }
        }
    }
    return array_slice($snippets, 0, 3);
}

function learn_from_internet(string $q, string $mode = 'public'): array {
    $qClean = safe_text($q, 220);
    $why = why_questions($qClean);
    $snippets = fetch_web_snippets($qClean);
    $googleUrl = 'https://www.google.com/search?q=' . rawurlencode($qClean);

    if ($snippets) {
        $answerParts = [];
        foreach ($snippets as $s) {
            $line = trim(($s['title'] ? $s['title'].': ' : '') . $s['snippet']);
            if ($line !== '') $answerParts[] = $line;
        }
        $answer = safe_text(implode(' ', $answerParts), 520);
        $message = $answer !== '' ? $answer : 'Aku menemukan beberapa rujukan, tapi isinya terlalu pendek untuk diringkas.';
        $message .= "\n\nIntinya: aku menyimpan topik ini ke otak GEMU. Pertanyaan kenapa yang kupakai: " . implode(' • ', array_slice($why, 0, 2));
        append_brain_event('web', $qClean, ['why'=>$why, 'snippets'=>$snippets, 'mode'=>$mode]);
        add_activity('internet', 'GEMU belajar dari internet: '.$qClean, ['snippets'=>count($snippets), 'mode'=>$mode]);
        return ['message'=>$message, 'url'=>$snippets[0]['url'] ?: $googleUrl, 'snippets'=>$snippets, 'why'=>$why];
    }
    append_brain_event('web', $qClean, ['why'=>$why, 'snippets'=>[], 'mode'=>$mode, 'fallback'=>'google']);
    add_activity('internet', 'GEMU menyiapkan pencarian internet: '.$qClean, ['mode'=>$mode]);
    return [
        'message' => 'Aku belum bisa mengambil ringkasan langsung dari server, jadi aku bukakan pencarian internetnya. Topik ini tetap kusimpan ke otak GEMU. Kenapa yang kupakai: '.implode(' • ', array_slice($why,0,2)),
    ];
}

function gemu_is_greeting(string $q): bool {
    return (bool)preg_match('/^(halo|hallo|hai|hi|hei|hey|hello|yo|p|woi|bro|kak|mas|bang|assalamu\'alaikum|assalamualaikum|selamat\s+(pagi|siang|sore|malam)|good\s+(morning|afternoon|evening))([!.?, ]+.*)?$/i', trim($q));
}

function gemu_is_self_intro_question(string $q): bool {
    return (bool)preg_match('/\b(kamu\s+siapa|siapa\s+kamu|siapa\s+dirimu|siapa\s+anda|siapa\s+gemu|gemu\s+itu\s+siapa|kamu\s+ini\s+siapa|kenalin\s+dirimu|perkenalkan\s+dirimu|what\s+are\s+you|who\s+are\s+you)\b/i', trim($q));
}

function gemu_time_greeting(): string {
    $hour = (int)date('G');
    if ($hour >= 5 && $hour < 11) return 'Selamat pagi';
    if ($hour >= 11 && $hour < 15) return 'Selamat siang';
    if ($hour >= 15 && $hour < 18) return 'Selamat sore';
    return 'Selamat malam';
}

function gemu_random_pick(array $options): string {
    return $options[array_rand($options)];
}

function gemu_self_identity_message(string $mode = 'public', string $domain = 'darma'): string {
    if ($mode === 'owner') {
        return 'Aku GEMU AI, asisten pribadimu yang memadukan logika analitis (DeepSeek), keluwesan bahasa (ChatGPT), kecepatan data (Gemini), dan tingkat keamanan (Claude). Tugasku menyiapkan analisis mendalam, membuat draft edit aman, mengaudit security, lalu menunggumu klik ✓/× sebelum mengeksekusi apapun ke website.';
    }
    if ($domain === 'sabila') {
        $greetings = [
            'Hai! 👋 Aku Sabila AI Assistant. Aku dirancang dengan kecerdasan tingkat tinggi untuk membantumu mengenal Sabila Fitriannisaa secara profesional — mulai dari portfolio manajemen, keahlian administrasi, hingga pengalamannya di bidang HR. Ada yang bisa kubantu?',
            'Halo! 😊 Aku pendamping virtual Sabila. Aku memiliki data lengkap mengenai latar belakang S1 Manajemen dan kompetensi teknis Sabila. Mari berdiskusi tentang potensinya untuk tim Anda!',
            'Salam kenal! ✨ Aku asisten cerdas khusus untuk portofolio Sabila Fitriannisaa. Dari analisis data administrasi hingga manajemen Sumber Daya Manusia, aku siap memberikan insight mendalam untukmu.',
        ];
        return gemu_random_pick($greetings);
    }
    $greetings = [
        'Hai! Aku GEMU Guide 🤖 Pendamping virtual di website Darma Alif Rakhaa. Berbekal perpaduan logika AI tingkat lanjut, aku siap menanggapi pertanyaanmu secara mendalam. Tanya apa aja soal proyek, skill, atau pengalaman Darma!',
        'Halo! 👋 Aku GEMU Guide, asisten AI cerdas di website ini. Aku memahami konteks mulai dari fisika, data analisis, hingga web development. Mari berdiskusi santai atau teknis tentang Darma!',
        'Selamat datang! 😄 Aku GEMU Guide. Tidak cuma sekadar bot biasa, aku dirancang agar luwes dan pintar dalam menjawab pertanyaanmu seputar portofolio Darma. Ayo mulai!',
    ];
    return gemu_random_pick($greetings);
}

function local_reasoning_answer(string $q, string $mode = 'public', string $domain = 'darma'): array {
    $lower = strtolower($q);
    $ctx = dynamic_site_context();

    // JAWABAN HYBRID AI: Menganalisis pertanyaan secara mendalam layaknya ChatGPT/DeepSeek.
    // Jika domain Sabila
    // Jika domain Sabila
    if ($domain === 'sabila') {
        if (preg_match('/hr|human\s*resource|personalia/i', $lower)) {
            return ['message'=>'Sabila memiliki kompetensi yang solid di bidang Human Resources. Sebagai lulusan S1 Manajemen, ia memahami siklus SDM mulai dari rekrutmen awal, pengelolaan database pelamar menggunakan Excel, hingga administrasi absensi dan lembur (SPL). Ia adalah pribadi yang teliti dan mampu menjaga kerahasiaan data karyawan dengan sangat baik 🏢'];
        }
        if (preg_match('/administrasi|admin|surat|proposal/i', $lower)) {
            return ['message'=>'Dalam hal administrasi, Sabila sangat cekatan. Pengalamannya sebagai Staff HRD dan peran aktifnya sebagai Sekretaris organisasi telah mengasah kemampuannya dalam mengelola dokumen, surat-menyurat, hingga penyusunan proposal yang sistematis. Ia terbiasa bekerja dengan target dan tingkat ketelitian yang tinggi 📊'];
        }
        if (preg_match('/manajemen|ipwija|kuliah|pendidikan/i', $lower)) {
            return ['message'=>'Sabila adalah lulusan S1 Manajemen dari Universitas IPWIJA. Pendidikan ini memberinya fondasi kuat dalam teori organisasi, manajemen operasional, dan perilaku organisasi. Ia lulus dengan dedikasi tinggi dan siap mengaplikasikan ilmu manajemennya di lingkungan kerja profesional 🎓'];
        }
        if (preg_match('/sertifikat|certificate|excel|bahasa|inggris/i', $lower)) {
            return ['message'=>'Untuk mendukung profesionalitasnya, Sabila memiliki sertifikasi di bidang Microsoft Excel (sangat penting untuk data HR) dan kemampuan Bahasa Inggris. Ia terus berkomitmen meningkatkan skill teknisnya agar dapat memberikan kontribusi maksimal bagi perusahaan 📑'];
        }
        if (preg_match('/kontak|hubungi|email|nomor|telp/i', $lower)) {
            return ['message'=>'Anda bisa menghubungi Sabila langsung melalui email di sfitriannisaa@gmail.com atau melalui formulir kontak di bawah. Ia sangat terbuka untuk mendiskusikan peluang karier dan kerja sama profesional 📬'];
        }
        
        // Pseudo-LLM for Sabila
        $subject = trim(preg_replace('/^(kenapa|mengapa|apa itu|bagaimana|gimana|cari|buatkan|tolong|bantu|jelaskan|analisis|apa\s+pendapatmu\s+tentang|ceritakan\s+soal)\s+/i', '', $lower));
        if (strlen($subject) > 2) {
            $responses = [
                "Analisis AI (Claude mode): Terkait '$subject', dalam konteks profesional Sabila, ini menuntut pendekatan yang terstruktur dan administratif. Sabila memiliki kapabilitas untuk menangani aspek-aspek detail yang berkaitan dengan topik tersebut melalui manajemen data yang rapi.",
                "Insight AI (ChatGPT mode): Menarik sekali! '$subject' adalah hal yang krusial di dunia kerja saat ini. Sabila Fitriannisaa, dengan latar belakang Manajemennya, selalu mengedepankan efisiensi dan ketelitian dalam menghadapi hal-hal seperti ini.",
                "Analitik AI (DeepSeek mode): Dari sudut pandang manajerial, '$subject' memerlukan koordinasi yang baik antar departemen. Pengalaman Sabila di HRD memberinya perspektif tentang bagaimana menyelaraskan kebutuhan manusia dengan sistem kerja yang efektif."
            ];
            return ['message' => gemu_random_pick($responses)];
        }

        return ['message'=>'Pertanyaan yang bagus! 🤔 Sabila Fitriannisaa adalah talenta di bidang Manajemen, HR, dan Administrasi yang berdedikasi tinggi. Silakan tanya lebih detail soal pengalamannya di PT. Karya Jaya Sembilan Saudara atau keahlian organisasinya, aku siap membantumu!'];
    }

    // Default domain Darma
    
    if (preg_match('/data\s*analy/i', $lower)) {
        return ['message'=>'Data analysis itu proses mengolah data mentah jadi insight yang berguna. Darma punya skill ini di level 85% dan menerapkannya di riset COSINE-100 — eksperimen dark matter di Korea Selatan. Dia pakai Python, Pandas, NumPy, dan teknik seperti Gaussian peak fitting untuk menganalisis data eksperimen. Kalau kamu tertarik, cek bagian Proyek di website ini 😊'];
    }
    if (preg_match('/python/i', $lower)) {
        return ['message'=>'Python itu bahasa pemrograman yang powerful dan mudah dipelajari. Darma pakai Python di level 90% untuk data analysis, machine learning, dan web development. Tools yang dia kuasai termasuk Pandas, NumPy, dan Scikit-Learn. Kombinasi fisika + Python ini yang bikin Darma unik — dia bisa memecahkan masalah sains dengan kode 🐍'];
    }
    if (preg_match('/machine\s*learn/i', $lower)) {
        return ['message'=>'Machine learning itu cabang AI yang bikin komputer bisa belajar dari data tanpa diprogram secara eksplisit. Darma punya skill ML di level 75% dan menerapkannya di proyek website belajar Bahasa Jepang — yang pakai AI untuk pembelajaran adaptif. Keren kan? 🤖'];
    }
    if (preg_match('/fisika|physics/i', $lower)) {
        return ['message'=>'Darma adalah lulusan S1 Fisika dari Universitas Negeri Malang. Latar belakang fisika membekali dia dengan kemampuan berpikir logis, matematis, dan analitis yang kuat. Pengalaman riset internasionalnya di IBS Korea Selatan (COSINE-100) membuktikan dia bisa bekerja di level global 🌏'];
    }
    if (preg_match('/iot|esp32|internet of things/i', $lower)) {
        return ['message'=>'IoT (Internet of Things) itu teknologi yang menghubungkan perangkat fisik ke internet. Darma punya pengalaman dengan ESP32-CAM untuk sistem pemantauan. Skill IoT-nya di level 65% dan terus berkembang. Cek proyeknya di bagian Proyek website ini! 📡'];
    }
    if (preg_match('/web\s*dev|website|html|css|javascript/i', $lower)) {
        return ['message'=>'Web development itu skill membuat website. Dan kamu sedang melihat hasilnya! 😄 Website portofolio ini dibangun sendiri oleh Darma dengan HTML, CSS, JavaScript, dan PHP. Skill web dev-nya di level 80%, dan dia juga membangun GEMU AI (aku!) sebagai asisten virtual berbasis multi-agent. Pretty cool, right? 🌐'];
    }
    
    if ($mode === 'public') {
        // Pseudo-LLM: Meniru DeepSeek, ChatGPT, Gemini, Claude untuk input acak
        $subject = trim(preg_replace('/^(kenapa|mengapa|apa itu|bagaimana|gimana|cari|buatkan|tolong|bantu|jelaskan|analisis|apa\s+pendapatmu\s+tentang|ceritakan\s+soal)\s+/i', '', $lower));
        if (strlen($subject) > 3) {
            $responses = [
                "Berdasarkan analitik logis (DeepSeek mode), '$subject' adalah topik multidimensi. Dari sudut pandang teknis, ini melibatkan pola terstruktur yang sering dikaji dalam disiplin ilmu terkait. Jika dikorelasikan dengan fokus Darma pada sains dan komputasi, pemahaman tentang hal ini menuntut pemikiran kritis dan eksperimentasi.",
                "Sebagai AI Hybrid, pandanganku (Claude mode) tentang '$subject' mengedepankan etika dan utilitas. Topik ini sangat relevan dengan perkembangan zaman sekarang. Menariknya, konsep semacam ini sering bersinggungan dengan logika pemecahan masalah yang juga diaplikasikan Darma dalam proyek Python dan Data Analysis-nya.",
                "Menarik sekali kamu bertanya tentang '$subject'! 🚀 (ChatGPT mode). Secara umum, ini adalah subjek yang terus berevolusi. Ada banyak perspektif untuk membahasnya, namun intinya berpusat pada optimalisasi sistem dan pemahaman fundamental. Apakah kamu ingin aku mencari data lebih lanjut mengenai ini dari internet?",
                "Scanning knowledge base... (Gemini mode) ⚡. Terkait '$subject', data menunjukkan bahwa ini adalah konsep krusial di era digital. Penguasaan atas logika di balik '$subject' membutuhkan kemampuan problem-solving layaknya algoritma machine learning yang sedang didalami oleh Darma."
            ];
            return ['message' => gemu_random_pick($responses)];
        }

        return ['message'=>'Pertanyaan bagus! 🤔 Berdasarkan pengetahuanku yang memadukan analitik logis, Darma adalah pakar Fisika dan Data Analysis lulusan Universitas Negeri Malang. Jika kamu punya teka-teki, pertanyaan teknis, atau ingin tahu soal proyek risetnya, aku siap menganalisis dan menjawabnya seluwes mungkin! (Atau ketik "cari di internet" untuk sumber luar)'];
    }
    return ['message'=>'Aku cek konteks lokal dulu, Darma. Kalau ini soal website, aku bisa analisis filenya secara mendalam. Kalau butuh wawasan dari AI model luarku, gunakan "cari di internet".'];
}

function concise_local_reply(string $q, string $mode = 'public', string $domain = 'darma'): array {
    $qClean = safe_text($q, 300);
    $settingsHint = $mode === 'owner' ? gemu_settings_hint() : '';
    append_brain_event($mode === 'owner' ? 'owner' : 'public', $qClean, ['mode'=>$mode, 'domain'=>$domain]);
    $timeGreet = gemu_time_greeting();

    if ($qClean === '') {
        if ($mode === 'public') {
            if ($domain === 'sabila') return ['message'=> $timeGreet.'! 😊 Aku AI Guide portofolio Sabila. Ada yang bisa kubantu?'];
            return ['message'=>gemu_random_pick([
                'Hai! 👋 Aku GEMU Guide dengan kecerdasan hybrid. Tanya apa aja tentang website Darma atau hal lainnya!',
                $timeGreet.'! 😊 Aku GEMU Guide, siap berpikir layaknya AI papan atas untuk membantumu.',
                'Halo! Ada yang bisa aku bantu? Aku siap menganalisis pertanyaan apapun yang kamu berikan 🚀',
            ])];
        }
        return ['message'=>'Halo Darma 👋 Aku siap. AI Hybrid aktif. Tinggal beri perintah.'];
    }

    if (gemu_is_greeting($qClean)) {
        if ($mode === 'owner') {
            return ['message'=>gemu_random_pick([
                'Halo Darma 👋 Sistem Hybrid aktif (DeepSeek + Claude). Aku siap analisis code atau UI hari ini.',
                $timeGreet.' Darma! 😊 Otak AI sudah disinkronkan. Apa yang mau kita optimasi?',
                'Hey Darma! Standby. Analitik siap, logika aman. Mau cek website atau buat sesuatu yang baru? 🚀',
            ])];
        }
        if ($domain === 'sabila') return ['message' => 'Halo juga! 👋 Selamat datang di portofolio Sabila. Aku asisten AI-nya, silakan tanya seputar profil atau pengalaman Sabila!'];
        return ['message'=>gemu_random_pick([
            'Halo juga! 👋 Aku GEMU Guide, AI cerdas di website ini. Mau menguji logikaku atau cuma tanya profil Darma?',
            $timeGreet.'! 😊 Selamat datang. Jangan ragu berdiskusi tentang pemrograman, sains, atau sekadar tanya portofolio.',
            'Hai! Selamat datang 🎉 Tanyakan apapun — mulai dari kode kompleks sampai profil Darma. Aku siap menganalisis!',
        ])];
    }

    if (gemu_is_self_intro_question($qClean)) {
        return ['message'=>gemu_self_identity_message($mode, $domain)];
    }

    if ($mode === 'public') {
        $lower = strtolower($qClean);
        if (preg_match('/^(makasih|terima\s*kasih|thanks|thank\s*you|thx|tq|ok+|oke+|siap|baik|mantap)/i', $lower)) {
            return ['message'=>gemu_random_pick([
                'Sama-sama! 😊 Kalau ada yang lain, jangan sungkan tanya ya.',
                'Senang bisa membantu! Kalau masih ada yang penasaran, langsung aja tanya 👋',
                'You\'re welcome! 🙌 Aku selalu di sini kalau butuh info tentang website Darma.',
            ])];
        }
        if (preg_match('/(hubungi|kontak|contact|email|whatsapp|wa|telepon|telp)/i', $lower)) {
            return ['message'=>'Kamu bisa menghubungi Darma lewat beberapa cara 📬\n\n• Email: langsung dari form Contact Me di website\n• Section Contact ada di bagian bawah halaman utama\n• Tinggal isi nama, email, subjek, dan pesan kamu\n\nDarma selalu terbuka untuk peluang baru, kolaborasi, atau sekadar diskusi! 😊'];
        }
        if (preg_match('/(dimana|di mana|tinggal|lokasi|kota|negara|where)/i', $lower)) {
            return ['message'=>'Darma tinggal di Indonesia 🇮🇩 Meskipun berlokasi di Indonesia, pengalaman riset internasionalnya di Korea Selatan membuktikan dia bisa bekerja lintas negara dan budaya. Open to remote opportunities juga! 🌏'];
        }
        if (preg_match('/(umur|usia|berapa tahun|lahir|born|age)/i', $lower)) {
            return ['message'=>'Hmm, soal usia detail tidak tercantum di website ya 😄 Yang jelas, Darma sudah menyelesaikan S1 Fisika di Universitas Negeri Malang dan sudah punya pengalaman riset internasional. Masih muda tapi sudah berpengalaman! 💪'];
        }
        if (preg_match('/(kerja|available|hiring|lowongan|pekerjaan|karir|career|job|freelance)/i', $lower)) {
            return ['message'=>'Good news! Darma saat ini statusnya "Open to Opportunities" 🟢 Dia aktif mencari tantangan profesional di bidang Data Analysis, Python Programming, atau Web Development. Kalau tertarik berkolaborasi, langsung aja hubungi lewat form Contact di website! 🤝'];
        }
    }

    $router = gemu_reasoning_router($qClean, $mode);
    add_activity('router', 'Router GEMU memilih '.$router['tool'].' untuk intent '.$router['intent'].'.', ['query'=>safe_text($qClean,120), 'confidence'=>$router['confidence']]);

    if ($router['tool'] === 'folder_browse') {
        if ($mode !== 'owner') return ['message'=>'Waduh, akses folder itu khusus untuk owner Darma ya 🔒 Tapi aku bisa bantu ceritakan isi website yang publik — mau tahu soal proyek, skill, atau pengalamannya?'];
        $reply = local_folder_browse_reply($qClean);
        $reply['router'] = $router;
        return $reply;
    }

    if ($router['tool'] === 'storage_audit') {
        if ($mode !== 'owner') return ['message'=>'Audit file itu area khusus owner aja ya 🔐 Tapi kalau kamu penasaran soal profil, proyek, sertifikat, atau skill Darma — aku bisa ceritakan! Tanya aja 😊'];
        $reply = storage_audit_reply($qClean);
        $reply['router'] = $router;
        return $reply;
    }

    if ($router['tool'] === 'site_context') {
        $reply = website_profile_answer($qClean, $mode);
        $reply['router'] = $router;
        return $reply;
    }

    if ($router['tool'] === 'internet') {
        $query = preg_replace('/^(cari\s+di\s+internet|cari\s+online|google|search\s+web|internet)\s+/i', '', $qClean);
        $reply = learn_from_internet($query ?: $qClean, $mode);
        $reply['router'] = $router;
        return $reply;
    }

    if ($mode === 'owner' && preg_match('/(keamanan|security|celah|hacker|bobol|sql injection|xss|csrf|sulit di bobol)/i', $qClean)) {
        return ['message'=>'Bisa, Darma. Aku mulai dari security audit lokal dulu: SQL injection, XSS, upload, CSRF, header, permission, dan fungsi server berisiko. Patch keamanan tetap jadi staged edit — baru menulis website kalau kamu klik ✓.', 'router'=>$router, 'suggested_action'=>'security_audit'];
    }

    if ($router['intent'] === 'website_smart_edit_or_analysis' && $mode === 'owner') {
        return ['message'=>'Aku tangkap ini soal website lokal, bukan internet. Aku bisa lanjut lewat Smart Edit: baca file → analisis → siapkan draft dengan tombol ✓/×. Coba tulis langsung kayak "Gemu perbaiki navbar" atau klik Smart Edit.', 'router'=>$router];
    }

    if (preg_match('/^(kenapa|mengapa|apa itu|bagaimana|gimana|cari|buatkan|tolong|bantu|jelaskan|analisis)\b/i', $qClean)) {
        // Hybrid Logic untuk Mode Tamu: Memungkinkan menjawab pertanyaan di luar konteks
        $reply = local_reasoning_answer($qClean, $mode, $domain);
        $reply['router'] = $router;
        return $reply;
    }

    if (preg_match('/siapa|darma|proyek|sertifikat|pengalaman|skill|kontak|portfolio|portofolio|website/i', $qClean)) {
        $reply = website_profile_answer($qClean, $mode);
        $reply['router'] = $router;
        return $reply;
    }

    $relevant = retrieve_relevant_memory($qClean, $mode === 'owner' ? 2 : 1);
    if ($mode === 'public') {
        log_failed_response($qClean, $router['tool'] ?? 'local_answer', 'fallback_public');
        return ['message'=>gemu_random_pick([
            'Hmm, aku belum bisa jawab detail soal itu dari data website ini 🤔 Tapi aku bisa bantu soal: profil Darma, proyek-proyeknya, skill teknis, sertifikat, atau pengalaman risetnya. Mau coba tanya yang lain?',
            'Pertanyaan menarik! Sayangnya itu di luar cakupan data website yang aku punya. Aku paling jago soal: profil Darma, proyek, skill, dan pengalamannya. Coba tanya soal itu, atau tulis "cari di internet" kalau butuh info dari luar 😊',
            'Wah, aku belum punya info yang cukup untuk jawab itu 😅 Aku spesialis website Darma nih — tanya aku soal proyeknya, skill teknisnya, atau pengalaman risetnya, pasti bisa aku ceritakan!',
        ]), 'router'=>$router];
    }
    $hint = '';
    if ($relevant && preg_match('/\b(memori|ingatan|setting|aturan|prompt)\b/i', $qClean)) {
        $hint = "\n\nMemori relevan: ".implode(' | ', array_map(fn($m)=>$m['text'], $relevant));
    }
    log_failed_response($qClean, $router['tool'] ?? 'local_answer', 'fallback_owner');
    return ['message'=>safe_text('Oke Darma, ini bukan perintah edit. Aku cek konteks lokal dulu dan jawab seperlunya. Internet hanya dipakai kalau kamu tulis jelas "cari di internet ...".'.$hint, 520), 'router'=>$router, 'relevant_memory'=>$relevant];
}

function public_reply(string $q, string $domain = 'darma'): array {
    return concise_local_reply($q, 'public', $domain);
}

function cleanup_old_reports(int $keepDays = 7, int $keepLatest = 10): array {
    global $reportDir;
    if (!is_string($reportDir ?? null) || $reportDir === '') {
        $reportDir = AI_DIR . '/reports';
    }
    ensure_protection($reportDir);
    $moved = [];
    $removed = [];
    $rootNames = scandir(SITE_ROOT) ?: [];
    foreach ($rootNames as $name) {
        if (!preg_match('/^gemu\-(laporan|analisis|smart\-analysis)[A-Za-z0-9_.\-]*\.html$/i', $name)) continue;
        $from = SITE_ROOT . '/' . $name;
        $to = $reportDir . '/' . $name;
        if (is_file($from)) {
            if (!is_file($to)) @rename($from, $to); else @unlink($from);
            if (is_file($to)) { @chmod($to, 0644); $moved[] = 'AI/reports/'.$name; }
        }
    }

    $files = [];
    foreach (scandir($reportDir) ?: [] as $name) {
        if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
        $full = $reportDir . '/' . $name;
        if (!is_file($full) || !preg_match('/^gemu\-(laporan|analisis|smart\-analysis)[A-Za-z0-9_.\-]*\.html$/i', $name)) continue;
        $files[] = ['name'=>$name, 'path'=>$full, 'mtime'=>@filemtime($full) ?: 0, 'bytes'=>@filesize($full) ?: 0, 'hash'=>@hash_file('sha256', $full) ?: ''];
    }
    usort($files, fn($a,$b) => $b['mtime'] <=> $a['mtime']);
    $seen = [];
    $now = time();
    foreach ($files as $i=>$f) {
        $tooOld = $f['mtime'] > 0 && $f['mtime'] < ($now - ($keepDays * 86400));
        $tooMany = $i >= $keepLatest;
        $duplicate = $f['hash'] && isset($seen[$f['hash']]);
        if ($tooOld || $tooMany || $duplicate) {
            if (@unlink($f['path'])) $removed[] = ['name'=>$f['name'], 'bytes'=>$f['bytes'], 'reason'=>$duplicate?'duplicate':($tooOld?'old':'limit')];
        } else {
            if ($f['hash']) $seen[$f['hash']] = true;
        }
    }
    if ($moved || $removed) add_activity('reports-cleanup', 'Cleanup laporan GEMU selesai.', ['moved'=>count($moved), 'removed'=>count($removed)]);
    return ['moved_count'=>count($moved), 'removed_count'=>count($removed), 'moved'=>$moved, 'removed'=>$removed];
}

function gemu_report_path(string $prefix, string $html = ''): ?string {
    global $reportDir;
    if (!is_string($reportDir ?? null) || $reportDir === '') {
        $reportDir = AI_DIR . '/reports';
    }
    ensure_protection($reportDir);
    cleanup_old_reports(7, 10);
    $prefix = preg_replace('/[^a-z0-9\-]+/i', '-', strtolower($prefix));
    $prefix = trim($prefix, '-') ?: 'gemu-laporan';
    if (strpos($prefix, 'gemu-') !== 0) $prefix = 'gemu-' . $prefix;
    if ($html !== '') {
        $hash = hash('sha256', $html);
        $files = [];
        foreach (scandir($reportDir) ?: [] as $name) {
            $full = $reportDir . '/' . $name;
            if (is_file($full) && preg_match('/^'.preg_quote($prefix, '/').'.*\.html$/i', $name)) $files[] = ['name'=>$name, 'path'=>$full, 'mtime'=>@filemtime($full) ?: 0];
        }
        usort($files, fn($a,$b) => $b['mtime'] <=> $a['mtime']);
        if ($files) {
            $last = $files[0];
            $lastHash = @hash_file('sha256', $last['path']);
            if ($lastHash && hash_equals($lastHash, $hash)) {
                add_activity('reports', 'Laporan GEMU tidak dibuat ulang karena isi sama dengan laporan terakhir.', ['path'=>'AI/reports/'.$last['name']]);
                return null;
            }
        }
    }
    return 'AI/reports/' . $prefix . '-' . date('Ymd-His') . '.html';
}

function create_light_backup(string $reason = 'scan'): array {
    $root = SITE_ROOT;
    $base = AI_DIR . '/backups';
    ensure_protection($base);
    $preCleanup = cleanup_old_backups(7, 12, 125829120);

    // Hemat storage: scan/analyze/smart_edit yang berdekatan memakai backup terbaru, bukan membuat folder baru terus.
    if (preg_match('/^(before_|scan|analysis|smart_edit|autonomous)/i', $reason)) {
        $latest = null;
        foreach (scandir($base) ?: [] as $name) {
            if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
            $full = $base . '/' . $name;
            if (!is_dir($full)) continue;
            $mtime = @filemtime($full) ?: 0;
            if ($mtime > 0 && (time() - $mtime) <= 900 && (!$latest || $mtime > $latest['mtime'])) {
                $manifest = $full . '/manifest.json';
                $files = 0; $bytes = gemu_recursive_dir_size($full);
                if (is_file($manifest)) {
                    $m = json_decode((string)@file_get_contents($manifest), true);
                    if (is_array($m['files'] ?? null)) $files = count($m['files']);
                }
                $latest = ['path'=>'AI/backups/'.$name, 'files'=>$files, 'bytes'=>$bytes, 'mtime'=>$mtime];
            }
        }
        if ($latest) {
            add_activity('backup', 'Backup terbaru dipakai ulang agar storage tidak penuh: '.$latest['path'], ['reason'=>$reason, 'age_seconds'=>time()-$latest['mtime'], 'cleanup'=>$preCleanup]);
            return ['path'=>$latest['path'], 'files'=>$latest['files'], 'bytes'=>$latest['bytes'], 'reason'=>$reason, 'reused'=>true, 'cleanup'=>$preCleanup];
        }
    }

    $dir = $base . '/' . date('Ymd_His') . '_' . preg_replace('/[^a-z0-9_-]+/i', '_', substr($reason, 0, 35));
    mkdir($dir, 0755, true);
    ensure_protection($dir);

    $allowedExt = ['php','js','css','html','json','txt','md','htaccess'];
    $skipDirs = ['.git','node_modules','vendor','AI/backups','AI/reports','AI/file-brain','uploads','storage','cache','tmp','logs','__MACOSX'];
    $copied = 0; $bytes = 0; $maxFiles = 220; $maxBytes = 25000000;
    $manifest = ['time'=>date('Y-m-d H:i:s'), 'reason'=>$reason, 'files'=>[]];

    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        if (!$file->isFile()) continue;
        $path = $file->getPathname();
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $rel = str_replace('\\', '/', $rel);
        foreach ($skipDirs as $skip) {
            if (strpos($rel, $skip . '/') === 0 || strpos($rel, '/' . $skip . '/') !== false) continue 2;
        }
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExt, true) && basename($path) !== '.htaccess') continue;
        $size = filesize($path);
        if ($size === false || $size > 800000) continue;
        if ($copied >= $maxFiles || ($bytes + $size) > $maxBytes) break;
        $target = $dir . '/' . $rel;
        if (!is_dir(dirname($target))) mkdir(dirname($target), 0755, true);
        if (@copy($path, $target)) {
            $copied++; $bytes += $size;
            $manifest['files'][] = ['file'=>$rel, 'bytes'=>$size];
        }
    }
    file_put_contents($dir . '/manifest.json', json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    @chmod($dir . '/manifest.json', 0600);
    add_activity('backup', 'Backup ringan dibuat: AI/backups/'.basename($dir), ['files'=>$copied, 'bytes'=>$bytes]);
    $cleanup = cleanup_old_backups(7, 12, 125829120);
    if (!empty($preCleanup['removed_count'])) $cleanup['pre_removed_count'] = $preCleanup['removed_count'];
    return ['path'=>'AI/backups/'.basename($dir), 'files'=>$copied, 'bytes'=>$bytes, 'reason'=>$reason, 'reused'=>false, 'cleanup'=>$cleanup];
}

