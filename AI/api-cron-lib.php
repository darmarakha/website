<?php
function gemu_cron_dir_size(string $dir): int {
    if (!is_dir($dir)) return 0;
    $bytes = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) if ($file->isFile()) $bytes += (int)$file->getSize();
    return $bytes;
}

function gemu_cron_delete_tree(string $path): bool {
    if (!file_exists($path)) return true;
    if (is_file($path) || is_link($path)) return @unlink($path);
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($it as $file) {
        if ($file->isDir()) @rmdir($file->getPathname());
        else @unlink($file->getPathname());
    }
    return @rmdir($path);
}

function gemu_cron_cleanup_backups(int $keepDays = 14, int $keepLatest = 30, int $maxBytes = 314572800): array {
    $base = __DIR__ . '/backups';
    if (!is_dir($base)) mkdir($base, 0755, true);
    $dirs = [];
    foreach (scandir($base) ?: [] as $name) {
        if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
        $full = $base . '/' . $name;
        if (is_dir($full)) $dirs[] = ['name'=>$name, 'path'=>$full, 'mtime'=>@filemtime($full) ?: 0, 'bytes'=>gemu_cron_dir_size($full)];
    }
    usort($dirs, fn($a,$b) => $b['mtime'] <=> $a['mtime']);
    $total = array_sum(array_map(fn($d)=>(int)$d['bytes'], $dirs));
    $removed = [];
    $now = time();
    foreach ($dirs as $i=>$d) {
        $tooOld = $d['mtime'] > 0 && $d['mtime'] < ($now - ($keepDays * 86400));
        $tooMany = $i >= $keepLatest;
        $tooBig = $total > $maxBytes && $i >= max(3, (int)floor($keepLatest / 2));
        if ($tooOld || $tooMany || $tooBig) {
            $bytes = (int)$d['bytes'];
            if (gemu_cron_delete_tree($d['path'])) { $removed[] = ['name'=>$d['name'], 'bytes'=>$bytes]; $total -= $bytes; }
        }
    }
    return ['removed_count'=>count($removed), 'removed'=>$removed, 'remaining_bytes'=>$total];
}


function gemu_cron_cleanup_reports(int $keepDays = 7, int $keepLatest = 10): array {
    $root = realpath(__DIR__ . '/..');
    $reportDir = __DIR__ . '/reports';
    if (!is_dir($reportDir)) mkdir($reportDir, 0755, true);
    $moved = [];
    foreach (scandir($root) ?: [] as $name) {
        if (!preg_match('/^gemu\-(laporan|analisis|smart\-analysis)[A-Za-z0-9_.\-]*\.html$/i', $name)) continue;
        $from = $root . DIRECTORY_SEPARATOR . $name;
        $to = $reportDir . DIRECTORY_SEPARATOR . $name;
        if (is_file($from)) {
            if (!is_file($to)) @rename($from, $to); else @unlink($from);
            if (is_file($to)) $moved[] = 'AI/reports/'.$name;
        }
    }
    $files = [];
    foreach (scandir($reportDir) ?: [] as $name) {
        if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
        $full = $reportDir . DIRECTORY_SEPARATOR . $name;
        if (is_file($full) && preg_match('/^gemu\-(laporan|analisis|smart\-analysis)[A-Za-z0-9_.\-]*\.html$/i', $name)) {
            $files[] = ['name'=>$name,'path'=>$full,'mtime'=>@filemtime($full) ?: 0,'bytes'=>@filesize($full) ?: 0,'hash'=>@hash_file('sha256',$full) ?: ''];
        }
    }
    usort($files, fn($a,$b)=>$b['mtime'] <=> $a['mtime']);
    $removed = [];
    $seen = [];
    $now = time();
    foreach ($files as $i=>$f) {
        $tooOld = $f['mtime'] > 0 && $f['mtime'] < ($now - ($keepDays * 86400));
        $tooMany = $i >= $keepLatest;
        $duplicate = $f['hash'] && isset($seen[$f['hash']]);
        if ($tooOld || $tooMany || $duplicate) {
            if (@unlink($f['path'])) $removed[] = ['name'=>$f['name'], 'bytes'=>$f['bytes'], 'reason'=>$duplicate?'duplicate':($tooOld?'old':'limit')];
        } elseif ($f['hash']) $seen[$f['hash']] = true;
    }
    return ['moved_count'=>count($moved),'removed_count'=>count($removed),'moved'=>$moved,'removed'=>$removed];
}

function gemu_cron_scan_site() {
    $root = realpath(__DIR__ . '/..');
    $issues = [];
    $checked = 0;
    $maxFiles = 1200;
    $skipDirs = ['.git','node_modules','vendor','AI/backups','AI/reports','AI/file-brain','storage','cache','tmp','logs','__MACOSX'];
    $skipPatternFiles = ['AI/api.php','AI/api-cron-lib.php','AI/cron.php','AI/secret.php'];
    $badPatterns = [
        'eval\s*\(' => 'Penggunaan eval() perlu dicek manual.',
        'base64_decode\s*\(' => 'base64_decode() bisa normal, tapi sering dipakai obfuscation.',
        'shell_exec\s*\(' => 'shell_exec() memberi akses command server.',
        'passthru\s*\(' => 'passthru() memberi akses command server.',
        'system\s*\(' => 'system() memberi akses command server.',
        'exec\s*\(' => 'exec() memberi akses command server.',
        'assert\s*\(' => 'assert() rawan jika input tidak aman.'
    ];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        $path = $file->getPathname();
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        foreach ($skipDirs as $skip) {
            if (strpos($rel, $skip . DIRECTORY_SEPARATOR) === 0 || strpos($rel, DIRECTORY_SEPARATOR . $skip . DIRECTORY_SEPARATOR) !== false) continue 2;
        }
        if (!$file->isFile()) continue;
        $checked++;
        if ($checked > $maxFiles) break;
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (in_array($rel, $skipPatternFiles, true)) continue;
        if (in_array($ext, ['php','js','html','css','htaccess','txt'], true)) {
            $content = @file_get_contents($path, false, null, 0, 250000);
            if ($content !== false) {
                foreach ($badPatterns as $rx => $msg) {
                    if (preg_match('/'.$rx.'/i', $content)) $issues[] = ['level'=>'warning','file'=>$rel,'message'=>$msg];
                }
            }
        }
    }
    $summary = [
        'checked_files' => $checked,
        'issues_total' => count($issues),
        'danger_total' => count(array_filter($issues, fn($i) => $i['level'] === 'danger')),
        'time' => date('Y-m-d H:i:s'),
        'note' => 'Scan berkala GEMU via cron.'
    ];
    return [$summary, array_slice($issues, 0, 120)];
}

function gemu_cron_site_profile(): array {
    $root = realpath(__DIR__ . '/..');
    $important = ['index.php','partials/navbar.php','partials/footer.php','app.js','data.js','AI/index.php','AI/gemu.js','AI/gemu.css','AI/guide-widget.js','AI/guide-widget.css'];
    $signals = [];
    $files = [];
    $missing = [];
    foreach ($important as $file) {
        $full = $root . DIRECTORY_SEPARATOR . $file;
        if (!is_file($full)) { $missing[] = $file; continue; }
        $txt = (string)@file_get_contents($full, false, null, 0, 160000);
        $files[$file] = strlen($txt);
        if ($file === 'partials/navbar.php') {
            $signals['navbar_partial'] = true;
            $signals['burger_button'] = preg_match('/site-menu-button|gemu-burger-button|burger/i', $txt) ? true : false;
            $signals['side_menu'] = preg_match('/site-side-menu|menu-overlay/i', $txt) ? true : false;
            $signals['navbar_self_heal'] = strpos($txt, 'GEMU NAVBAR SELF-HEAL') !== false;
        }
        if ($file === 'index.php') {
            $signals['uses_navbar_partial'] = strpos($txt, 'partials/navbar.php') !== false;
            $signals['has_meta_description'] = strpos($txt, 'name="description"') !== false || strpos($txt, "name='description'") !== false;
        }
        if ($file === 'AI/gemu.js') {
            $signals['approve_buttons'] = strpos($txt, 'approved:true') !== false && strpos($txt, '✓ Setujui') !== false;
            $signals['manual_confirm_removed'] = strpos($txt, 'KONFIRMASI'.' OWNER DARMA') === false;
        }
    }
    return ['files'=>$files, 'missing'=>$missing, 'signals'=>$signals];
}

function gemu_cron_build_deep_suggestion(array $summary, array $issues, int $cursor = 0): array {
    $profile = gemu_cron_site_profile();
    $signals = $profile['signals'];
    $ideas = [];
    if (!empty($signals['navbar_partial'])) {
        $ideas[] = ['key'=>'navbar_partial_health','title'=>'Usulan cron: audit navbar partial yang benar','detail'=>'Cron membaca struktur aktual: navbar ada di partials/navbar.php. Burger '.(!empty($signals['burger_button'])?'terdeteksi':'belum jelas').', side menu '.(!empty($signals['side_menu'])?'terdeteksi':'belum jelas').', self-heal '.(!empty($signals['navbar_self_heal'])?'sudah ada':'belum ada').'. Jika ada patch, GEMU harus menarget partials/navbar.php dan tetap menunggu ✓ owner Darma.'];
    }
    if (empty($signals['approve_buttons']) || empty($signals['manual_confirm_removed'])) {
        $ideas[] = ['key'=>'approve_ui','title'=>'Usulan cron: sederhanakan approve draft','detail'=>'Cron melihat alur approve perlu dipastikan memakai tombol ✓/×. Backend tetap validasi token owner, tetapi tidak perlu prompt KONFIRMASI manual supaya Darma tidak capek ketik mantra server.'];
    }
    if (empty($signals['has_meta_description'])) {
        $ideas[] = ['key'=>'seo_meta','title'=>'Usulan cron: tambah meta SEO homepage','detail'=>'Cron belum mendeteksi meta description di index.php. Ide: tambah meta SEO dan Open Graph ringan agar portfolio Darma lebih jelas saat dibagikan.'];
    }
    if (!empty($issues)) {
        $files = array_values(array_unique(array_map(fn($x) => (string)($x['file'] ?? '-'), array_slice($issues, 0, 8))));
        $ideas[] = ['key'=>'scan_findings','title'=>'Temuan cron mandiri GEMU','detail'=>'Cron menemukan '.count($issues).' temuan. File awal: '.implode(', ', $files).'. GEMU harus memilah warning aman vs perlu patch, membaca file terkait, lalu membuat draft edit yang dites otomatis sebelum pending.'];
    }
    $ideas[] = ['key'=>'mobile_quality','title'=>'Usulan cron: audit mobile berdasarkan file aktual','detail'=>'Cron membaca file kunci website. Ide: audit index.php, partials/navbar.php, app.js, dan widget AI untuk z-index, area klik, overflow-x, serta menu mobile. Patch dibuat kecil dan menunggu ✓ owner.'];
    $ideas[] = ['key'=>'daily_activity','title'=>'Usulan cron: fitur Aktivitas Harian Owner','detail'=>'Kenapa: Darma mengelola banyak update. Ide: halaman aktivitas-harian.php dengan checklist, prioritas, progress, dan export JSON. Halaman baru berarti risiko rendah dan tidak menyentuh database.'];
    return $ideas[$cursor % count($ideas)];
}
?>
