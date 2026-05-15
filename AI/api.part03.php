<?php
function local_folder_browse_reply(string $q): array {
    $term = gemu_extract_folder_query($q);
    $term = trim(preg_replace('/[?!.]+$/', '', $term));
    $term = safe_text($term, 120);
    if ($term === '') return ['message'=>'Tulis nama folder yang mau dicek, contoh: buka folder sabila.'];
    $root = SITE_ROOT;
    $denyDirs = ['.git','node_modules','vendor','AI/backups','AI/reports','AI/file-brain','storage','cache','tmp','logs','__MACOSX'];
    $matches = [];
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::SELF_FIRST);
    foreach ($it as $file) {
        if (!$file->isDir()) continue;
        $path = $file->getPathname();
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $rel = str_replace('\\', '/', $rel);
        foreach ($denyDirs as $deny) if ($rel === $deny || strpos($rel, $deny . '/') === 0 || strpos($rel, '/' . $deny . '/') !== false) continue 2;
        $base = basename($rel); $score = 0;
        if (strcasecmp($base, $term) === 0) $score = 100;
        elseif (stripos($base, $term) !== false) $score = 80;
        elseif (stripos($rel, $term) !== false) $score = 60;
        if ($score > 0) $matches[] = ['score'=>$score, 'rel'=>$rel, 'full'=>$path, 'mtime'=>@filemtime($path) ?: 0];
        if (count($matches) > 30) break;
    }
    usort($matches, fn($a,$b)=>($b['score'] <=> $a['score']) ?: ($b['mtime'] <=> $a['mtime']));
    if (!$matches) {
        add_activity('file', 'Pencarian folder lokal tidak menemukan: '.$term, ['query'=>$term]);
        return ['message'=>'Aku belum menemukan folder bernama/mengandung “'.$term.'” di area website yang aman dibaca. Coba pakai nama folder lebih tepat, misalnya: buka folder uploads atau baca file path/nama-file.php.', 'query'=>$term, 'folders'=>[]];
    }
    $top = $matches[0]; $items = [];
    foreach (scandir($top['full']) ?: [] as $name) {
        if ($name === '.' || $name === '..') continue;
        if (preg_match('/^\./', $name)) continue;
        $full = $top['full'] . DIRECTORY_SEPARATOR . $name;
        $relItem = $top['rel'] . '/' . $name;
        $isDir = is_dir($full);
        $bytes = $isDir ? gemu_recursive_dir_size($full, 120, 20971520) : (@filesize($full) ?: 0);
        $items[] = ['name'=>$name,'path'=>$relItem,'type'=>$isDir ? 'folder' : 'file','bytes'=>$bytes,'human_size'=>bytes_human($bytes),'mtime'=>@filemtime($full) ?: 0];
        if (count($items) >= 18) break;
    }
    usort($items, fn($a,$b)=>($b['bytes'] <=> $a['bytes']));
    $lines = [];
    foreach (array_slice($items, 0, 8) as $i => $it) $lines[] = ($i+1).'. '.($it['type']==='folder'?'📁':'📄').' '.$it['name'].' — '.$it['human_size'];
    $message = "Bisa, Darma. Aku cek folder lokal, bukan internet dan bukan Smart Edit.\n\n";
    $message .= "Folder cocok: {$top['rel']}\n";
    $message .= "Isi teratas: ".count($items)." item terbaca".($items ? "\n".implode("\n", $lines) : "\nFolder terlihat kosong/terbatas akses baca.");
    $message .= "\n\nUntuk membaca file tertentu, tulis: baca file path/nama-file.";
    add_activity('file', 'Owner membuka folder lokal: '.$top['rel'], ['query'=>$term, 'items'=>count($items)]);
    return ['message'=>safe_text($message, 1200), 'query'=>$term, 'folder'=>$top['rel'], 'items'=>$items, 'matches'=>array_map(fn($m)=>$m['rel'], array_slice($matches,0,8))];
}

function resolve_safe_path(string $rel): array {
    $rel = trim(str_replace('\\', '/', $rel));
    $rel = ltrim($rel, '/');
    if ($rel === '' || strpos($rel, '..') !== false || preg_match('/(^|\/)\./', $rel)) out(false, ['message'=>'Path file tidak aman.'], 400);
    $deny = ['auth.php','AI/api.php','AI/secret.php','AI/cron.php','AI/api-cron-lib.php','.htaccess'];
    foreach ($deny as $d) if (strcasecmp($rel, $d) === 0) out(false, ['message'=>'File ini dilindungi dan tidak boleh diedit lewat GEMU.'], 403);
    if (strpos($rel, 'AI/backups/') === 0 || strpos($rel, 'AI/file-brain/') === 0) out(false, ['message'=>'Folder internal AI tidak boleh diedit lewat GEMU.'], 403);
    $allowedExt = ['php','js','css','html','json','txt','md'];
    $ext = strtolower(pathinfo($rel, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) out(false, ['message'=>'Ekstensi file tidak diizinkan untuk diedit lewat GEMU.'], 400);
    $full = SITE_ROOT . DIRECTORY_SEPARATOR . $rel;
    $realParent = realpath(dirname($full));
    if ($realParent === false || strpos($realParent, SITE_ROOT) !== 0) out(false, ['message'=>'Folder tujuan tidak ditemukan/di luar website.'], 400);
    return [$rel, $full];
}

function file_excerpt(string $rel, int $limit = 2200): string {
    $full = SITE_ROOT . DIRECTORY_SEPARATOR . $rel;
    if (!is_file($full)) return '';
    $txt = @file_get_contents($full, false, null, 0, $limit);
    return $txt === false ? '' : trim($txt);
}

function gemu_clean_js_text(string $text): string {
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = strip_tags($text);
    $text = str_replace(['\\n','\n'], ' ', $text);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

function dynamic_site_context(): array {
    $dataFile = SITE_ROOT . '/data.js';
    $indexFile = SITE_ROOT . '/index.php';
    $txt = is_file($dataFile) ? (string)file_get_contents($dataFile) : '';
    $index = is_file($indexFile) ? (string)file_get_contents($indexFile) : '';
    $ctx = [
        'name' => 'Darma Alif Rakhaa',
        'education' => 'S1 Fisika Universitas Negeri Malang',
        'hero' => 'Lulusan S1 Fisika yang berfokus pada Data Analysis dan Python Programming.',
        'about' => [],
        'skills' => [],
        'tools' => [],
        'certificates' => [],
        'projects' => [],
        'counts' => ['skills'=>0, 'certificates'=>0, 'projects'=>0],
    ];
    if ($txt !== '') {
        if (preg_match("/'hero\.desc'\s*:\s*\{\s*id\s*:\s*'((?:\\\\'|[^'])*)'/s", $txt, $m)) $ctx['hero'] = gemu_clean_js_text($m[1]);
        foreach (['about.p1','about.p2','about.p3'] as $key) {
            if (preg_match("/'".preg_quote($key, '/')."'\s*:\s*\{\s*id\s*:\s*'((?:\\\\'|[^'])*)'/s", $txt, $m)) $ctx['about'][] = gemu_clean_js_text($m[1]);
        }
        if (preg_match_all("/key\s*:\s*'([^']+)'\s*,\s*pct\s*:\s*(\d+)/", $txt, $m, PREG_SET_ORDER)) {
            foreach ($m as $row) $ctx['skills'][] = ['name'=>$row[1], 'pct'=>(int)$row[2]];
        }
        if (preg_match('/const\s+toolBadges\s*=\s*\[([^\]]+)\]/s', $txt, $m) && preg_match_all("/'([^']+)'/", $m[1], $tools)) $ctx['tools'] = $tools[1];
        if (preg_match_all("/'cert\.t\d+'\s*:\s*\{\s*id\s*:\s*'((?:\\\\'|[^'])*)'/s", $txt, $m)) {
            $ctx['certificates'] = array_values(array_unique(array_map('gemu_clean_js_text', $m[1])));
        }
        if (preg_match_all("/'proj\.t\d+'\s*:\s*\{\s*id\s*:\s*'((?:\\\\'|[^'])*)'/s", $txt, $m)) {
            $ctx['projects'] = array_values(array_unique(array_map('gemu_clean_js_text', $m[1])));
        }
        $ctx['counts']['skills'] = count($ctx['skills']);
        $ctx['counts']['certificates'] = count($ctx['certificates']);
        $ctx['counts']['projects'] = count($ctx['projects']);
    }
    $ctx['design_philosophy'] = 'Website ini menggunakan tema Premium Dark dengan efek Glassmorphism untuk menciptakan kesan futuristik, profesional, dan fokus pada konten visual. Warna gelap dipilih untuk mengurangi kelelahan mata (eye strain) dan menonjolkan elemen-elemen penting seperti badge skill dan kartu proyek.';
    if ($index !== '' && preg_match('/<title>(.*?)<\/title>/is', $index, $m)) $ctx['title'] = gemu_clean_js_text($m[1]);
    return $ctx;
}

function website_profile_answer(string $q, string $mode = 'public'): array {
    $ctx = dynamic_site_context();
    $lower = strtolower($q);
    $msg = '';
    if (gemu_is_self_intro_question($q)) {
        return ['message'=>gemu_self_identity_message($mode), 'context'=>$ctx];
    }
    if (preg_match('/warna|gelap|tema|desain|tampilan|design|layout|glassmorphism|aesthetic/i', $q)) {
        $msg = $ctx['design_philosophy'];
    } elseif (preg_match('/sertifikat|certificate/i', $q)) {
        $names = $ctx['certificates'] ? implode(', ', array_slice($ctx['certificates'], 0, 5)) : 'sertifikat bahasa Inggris, Microsoft Excel, dan magang riset';
        $msg = 'Di website ini terdata sekitar '.$ctx['counts']['certificates'].' sertifikat. Yang terbaca: '.$names.'. Buka section Sertifikat untuk melihat gambar/PDF lengkapnya.';
    } elseif (preg_match('/proyek|project|portfolio|portofolio/i', $q)) {
        $names = $ctx['projects'] ? implode('; ', array_slice($ctx['projects'], 0, 4)) : 'analisis radioisotop, website belajar Jepang, dan eksplorasi IoT';
        $msg = 'Proyek Darma yang terbaca dari website: '.$names.'. Bagian proyek bisa dibuka langsung dari section Proyek.';
    } elseif (preg_match('/skill|keahlian|tools|alat|kemampuan/i', $q)) {
        $skills = array_map(fn($s) => $s['name'].' '.$s['pct'].'%', array_slice($ctx['skills'], 0, 8));
        $tools = $ctx['tools'] ? ' Tools: '.implode(', ', array_slice($ctx['tools'], 0, 8)).'.' : '';
        $msg = 'Keahlian Darma yang terbaca: '.($skills ? implode(', ', $skills) : 'Python, Data Analysis, Machine Learning, Web Development, MATLAB, dan IoT').'.'.$tools;
    } elseif (preg_match('/pengalaman|experience|riset|intern|cosine|korea|ibs/i', $q)) {
        $msg = 'Pengalaman Darma di website menonjolkan riset internasional di Korea Selatan/IBS, COSINE-100, analisis data eksperimen, background modeling, Gaussian peak fitting, dan simulasi efisiensi.';
    } elseif (preg_match('/kontak|contact|hubungi|email/i', $q)) {
        $msg = 'Untuk menghubungi Darma, gunakan section Contact Me di website. Form kontak meminta nama, email, subjek, dan pesan.';
    } elseif (preg_match('/kurang|jelek|buruk|lemah|cacat|salah|kekurangan|kelemahan|kritik|saran/i', $q)) {
        $msg = 'Sebagai asisten AI, saya selalu memantau performa website ini. Saat ini Darma terus melakukan optimasi pada kecepatan load, responsivitas mobile, dan integrasi fitur AI. Jika Anda memiliki kritik atau saran spesifik, silakan sampaikan melalui formulir kontak agar bisa dipelajari lebih lanjut.';
    } else {
        $about = $ctx['about'] ? ' '.$ctx['about'][0] : '';
        $msg = 'Darma Alif Rakhaa adalah owner website ini. '.$ctx['hero'].$about.' Website ini berisi profil, pengalaman, skill, sertifikat, proyek, bisnis, belajar, dan GEMU AI.';
    }
    return ['message'=>safe_text($msg, 900), 'context'=>$ctx];
}

function gemu_reasoning_router(string $q, string $mode = 'owner'): array {
    $qClean = normalize_prompt(safe_text($q, 420));
    $scores = [
        'storage_audit' => 0,
        'folder_browse' => 0,
        'smart_or_analyze' => 0,
        'site_context' => 0,
        'internet' => 0,
        'local_answer' => 1,
    ];
    $reasons = [];
    $signals = [];

    $hasLocalStorage = preg_match('/\b(file|berkas|storage|penyimpanan|disk|kapasitas|ukuran|size|backup|cadangan|folder)\b/i', $qClean);
    $asksAudit = preg_match('/besar|paling|mana|berapa|penuh|hapus|bersih|audit|cek|lihat|daftar|list|buka/i', $qClean);
    if (preg_match('/\b(folder|direktori)\b/i', $qClean) && preg_match('/\b(buka|lihat|cek|cari|daftar|list)\b/i', $qClean)) { $scores['folder_browse'] += 8; $signals[]='folder_browse'; $reasons[]='Pertanyaan meminta folder lokal, jadi router membuka daftar folder/file aman.'; }
    if ($hasLocalStorage && $asksAudit) { $scores['storage_audit'] += 5; $signals[]='local_storage'; $reasons[]='Ada konteks file/storage/backup lokal, jadi router mengarah ke audit website lokal.'; }

    if (preg_match('/navbar|nav\b|navigasi|burger|garis\s*tiga|menu|website|tampilan|bug|error|eror|fitur|edit|ubah|perbaiki|homepage|footer|mobile|responsive|halaman/i', $qClean)) {
        $scores['smart_or_analyze'] += $mode === 'owner' ? 6 : 1;
        $scores['site_context'] += $mode === 'owner' ? 1 : 3;
        $signals[]='website';
        $reasons[]='Ada konteks website/tampilan/bug/fitur, jadi baca file lokal atau Smart Edit dulu.';
    }

    if (preg_match('/darma|proyek|project|sertifikat|certificate|pengalaman|experience|skill|keahlian|kontak|contact|portfolio|portofolio|tentang|profil|profile/i', $qClean)) {
        $scores['site_context'] += 6;
        $signals[]='profile';
        $reasons[]='Pertanyaan cocok dengan data website Darma, jadi jawab dari konteks lokal.';
    }

    $explicitInternet = preg_match('/\b(cari\s+di\s+internet|cari\s+online|search\s+web|google|internet|web\s+search|sumber\s+terbaru|berita\s+terbaru|harga\s+terbaru|online)\b/i', $qClean);
    if ($explicitInternet) { $scores['internet'] += 7; $signals[]='explicit_internet'; $reasons[]='Ada permintaan eksplisit memakai internet/online/google.'; }

    if (preg_match('/^(kenapa|mengapa|apa itu|bagaimana|gimana)\b/i', $qClean)) {
        $scores['local_answer'] += 3;
        $signals[]='why_local_first';
        $reasons[]='Pertanyaan kenapa/apa itu dijawab lokal dulu; internet hanya jika diminta jelas.';
    }

    if (preg_match('/^cari\s+/i', $qClean) && !$explicitInternet) {
        $scores['local_answer'] += 2;
        $signals[]='search_local_first';
        $reasons[]='Kata “cari” tidak otomatis internet; router mencari konteks lokal dahulu.';
    }

    if ($mode === 'owner' && preg_match('/tolong|buatkan|tambahkan|perbaiki|edit|ubah|fitur|website/i', $qClean)) {
        $scores['smart_or_analyze'] += 2;
        $signals[]='owner_action';
    }

    if ($hasLocalStorage && $asksAudit) $scores['internet'] = 0; // contoh: “cari file besar” wajib lokal, bukan Wikipedia.
    arsort($scores);
    $winner = array_key_first($scores);
    $top = (int)$scores[$winner];
    $second = (int)(array_values($scores)[1] ?? 0);
    $confidence = max(0.50, min(0.98, 0.45 + ($top * 0.07) + (($top-$second) * 0.03)));

    $intentMap = [
        'storage_audit' => 'local_storage_audit',
        'folder_browse' => 'local_folder_browse',
        'smart_or_analyze' => $mode === 'owner' ? 'website_smart_edit_or_analysis' : 'website_local_explanation',
        'site_context' => 'local_website_profile',
        'internet' => 'internet_search',
        'local_answer' => preg_match('/^(kenapa|mengapa|apa itu|bagaimana|gimana)/i', $qClean) ? 'local_reasoning_first' : 'general_local'
    ];

    $tool = $winner;
    if ($winner === 'site_context') $tool = 'site_context';
    if ($winner === 'local_answer') $tool = 'local_answer';
    if ($winner === 'internet') $tool = 'internet';
    if ($winner === 'storage_audit') $tool = 'storage_audit';
    if ($winner === 'folder_browse') $tool = 'folder_browse';

    return ['intent'=>$intentMap[$winner] ?? 'general_local', 'tool'=>$tool, 'confidence'=>$confidence, 'reasons'=>$reasons, 'signals'=>$signals, 'scores'=>$scores, 'query'=>$qClean];
}

function local_reasoning_answer(string $q, string $mode = 'public'): array {
    $ctx = dynamic_site_context();
    $relevant = retrieve_relevant_memory($q, $mode === 'owner' ? 4 : 2);
    $base = preg_replace('/^(kenapa|mengapa|apa itu|bagaimana|gimana|cari)\s+/i', '', trim($q));
    $base = $base !== '' ? $base : $q;
    if (preg_match('/file|storage|backup|disk|penyimpanan/i', $q) && $mode === 'owner') return storage_audit_reply($q);
    if (preg_match('/darma|proyek|sertifikat|skill|pengalaman|kontak|portfolio|website/i', $q)) {
        $reply = website_profile_answer($q, $mode);
        if ($relevant && $mode === 'owner') $reply['message'] .= "\n\nMemori relevan: ".implode(' | ', array_map(fn($m)=>$m['text'], array_slice($relevant,0,2)));
        return $reply;
    }
    
    if ($mode === 'owner') {
        $msg = 'Berdasarkan analisis internal saya, inti dari “'.$base.'” berkaitan dengan tujuan dan dampaknya. ';
        $msg .= 'Saya memprioritaskan jawaban dari basis data lokal agar informasi tetap akurat dengan konteks website Anda. ';
        if ($relevant) $msg .= 'Memori terkait yang ditemukan: '.implode(' | ', array_map(fn($m)=>$m['text'], array_slice($relevant,0,2))).'. ';
    } else {
        $msg = 'Berdasarkan informasi yang saya miliki, “'.$base.'” berkaitan dengan informasi yang ada di website ini. ';
        $msg .= 'Namun, jika Anda mencari informasi umum atau berita terbaru yang tidak ada di profil Darma, ';
    }
    $msg .= 'Anda bisa mencoba menulis “cari di internet '.$base.'” untuk mendapatkan hasil dari pencarian web.';
    return ['message'=>safe_text($msg, 900), 'context'=>$ctx, 'relevant_memory'=>$relevant];
}


function security_audit_scan(): array {
    $root = SITE_ROOT;
    $settings = load_gemu_settings();
    $level = $settings['security_audit_level'] ?? 'complex';
    $skipDirs = ['.git','node_modules','vendor','AI/backups','AI/reports','AI/file-brain','uploads','storage','cache','tmp','logs','__MACOSX'];
    $allowedExt = ['php','js','html','css','htaccess'];
    $issues = [];
    $filesChecked = 0;
    $linesChecked = 0;

    $patterns = [
        ['critical','RCE','/\b(eval|assert|shell_exec|system|passthru|exec|proc_open|popen)\s*\(/i','Fungsi eksekusi command/kode berisiko. Hindari di file web publik.','code'],
        ['critical','SQL Injection','/\b(mysqli_query|mysql_query)\s*\([^;]*(\$_GET|\$_POST|\$_REQUEST|\$_COOKIE|\$q|\$query)/i','Query SQL terlihat bisa menerima input mentah. Pakai PDO prepared statement dan binding parameter.','code'],
        ['high','Dynamic include','/\b(include|require|include_once|require_once)\s*\(?\s*(\$_GET|\$_POST|\$_REQUEST|\$path|\$file)/i','Include/require dari input dinamis dapat membuka Local File Inclusion. Batasi whitelist path.','code'],
        ['high','Upload validation','/move_uploaded_file\s*\(/i','Ada upload file. Pastikan cek ekstensi, MIME, ukuran, nama file aman, dan simpan di folder non-eksekusi.','code'],
        ['high','XSS','/\becho\s+\$_(GET|POST|REQUEST|COOKIE)\b|innerHTML\s*=\s*[^;]*(location|search|hash|input|value)/i','Output/input user perlu escaping agar tidak XSS. PHP pakai htmlspecialchars; JS pakai textContent bila memungkinkan.','code'],
        ['medium','CSRF','/<form\b(?![\s\S]{0,700}(csrf|token))/i','Form terdeteksi tanpa token CSRF dekat tag form. Untuk aksi login/edit/upload, token wajib.','raw'],
        ['medium','Weak permission','/chmod\s*\([^;]*(0777|777|0666|666)/i','Permission terlalu longgar. Pakai 0644 untuk file dan 0755 untuk folder.','code'],
        ['medium','Secret leakage','/(password|passwd|secret|api[_-]?key|token)\s*=\s*(?:\x27|")[^\x27"]{8,}(?:\x27|")/i','Ada pola secret hardcoded. Pastikan file sensitif tidak publik dan tidak ikut repo.','raw'],
        ['low','Debug leak','/\b(var_dump|print_r|die\s*\()\s*/i','Debug output boleh untuk admin, tapi jangan bocor ke publik bila memuat data sensitif.','code'],
    ];

    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        if (!$file->isFile()) continue;
        $path = $file->getPathname();
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $rel = str_replace('\\', '/', $rel);
        foreach ($skipDirs as $skip) {
            if (strpos($rel, $skip . '/') === 0 || strpos($rel, '/' . $skip . '/') !== false) continue 2;
        }
        $ext = strtolower(pathinfo($rel, PATHINFO_EXTENSION));
        if ($rel === '.htaccess') $ext = 'htaccess';
        if (!in_array($ext, $allowedExt, true)) continue;
        if (@filesize($path) > 800000) continue;
        $txt = (string)@file_get_contents($path);
        $filesChecked++;
        $fileLines = preg_split('/\R/', $txt);
        $linesChecked += count($fileLines ?: []);

        $scanTxt = executable_risk_scan_content($txt, $ext);
        foreach ($patterns as [$severity,$category,$rx,$advice,$mode]) {
            $haystack = $mode === 'raw' ? $txt : $scanTxt;
            if ($haystack === '') continue;
            if (!preg_match_all($rx, $haystack, $matches, PREG_OFFSET_CAPTURE)) continue;
            foreach (array_slice($matches[0], 0, $level === 'complex' ? 12 : 3) as $m) {
                $offset = $m[1];
                $line = substr_count(substr($haystack, 0, $offset), "\n") + 1;
                $evidence = trim(preg_replace('/\s+/', ' ', substr($m[0], 0, 150)));
                $issues[] = ['severity'=>$severity, 'category'=>$category, 'file'=>$rel, 'line'=>$line, 'evidence'=>$evidence, 'advice'=>$advice];
            }
        }

        if ($ext === 'php' && preg_match('/\$pdo->query\s*\([^;]*(\$_GET|\$_POST|\$_REQUEST|\.\s*\$)/i', $txt, $m, PREG_OFFSET_CAPTURE)) {
            $line = substr_count(substr($txt, 0, $m[0][1]), "\n") + 1;
            $issues[] = ['severity'=>'high','category'=>'SQL Injection','file'=>$rel,'line'=>$line,'evidence'=>'$pdo->query dengan input/concat terdeteksi','advice'=>'Ganti ke $pdo->prepare(...) dan execute([...]).'];
        }
        if ($ext === 'php' && preg_match('/password_hash\s*\(/i', $txt) && !preg_match('/password_verify\s*\(/i', $txt) && preg_match('/login|auth|akun/i', $rel)) {
            $issues[] = ['severity'=>'low','category'=>'Auth review','file'=>$rel,'line'=>1,'evidence'=>'File auth memiliki password_hash tanpa password_verify di file yang sama','advice'=>'Pastikan proses login memakai password_verify dan rate limit.'];
        }
    }

    $headers = [];
    $htaccess = SITE_ROOT.'/.htaccess';
    $htext = is_file($htaccess) ? (string)@file_get_contents($htaccess) : '';
    foreach (['Content-Security-Policy','X-Frame-Options','X-Content-Type-Options','Referrer-Policy','Permissions-Policy'] as $header) {
        $present = stripos($htext, $header) !== false;
        $headers[] = ['name'=>$header, 'present'=>$present];
        if (!$present) $issues[] = ['severity'=>'medium','category'=>'Security Header','file'=>'.htaccess','line'=>1,'evidence'=>$header.' belum terlihat','advice'=>'Tambahkan security header bertahap agar tidak mematahkan asset website.'];
    }

    $rank = ['critical'=>4,'high'=>3,'medium'=>2,'low'=>1];
    usort($issues, fn($a,$b)=>($rank[$b['severity']] ?? 0) <=> ($rank[$a['severity']] ?? 0));
    $counts = ['critical'=>0,'high'=>0,'medium'=>0,'low'=>0];
    foreach ($issues as $i) $counts[$i['severity']] = ($counts[$i['severity']] ?? 0) + 1;
    $risk = min(45, $counts['critical'] * 16) + min(30, $counts['high'] * 7) + min(20, $counts['medium'] * 2) + min(8, $counts['low'] * 0.5);
    $score = (int)max(0, min(100, round(100 - $risk)));
    if ($counts['critical'] === 0) $score = max($score, 45);
    if ($counts['critical'] === 0 && $counts['high'] === 0) $score = max($score, 60);
    if (count($issues) === 0) $score = 100;
    $summary = [
        'time'=>date('Y-m-d H:i:s'),
        'files_checked'=>$filesChecked,
        'lines_checked'=>$linesChecked,
        'issue_total'=>count($issues),
        'counts'=>$counts,
        'score'=>$score,
        'level'=>$level,
        'headers'=>$headers,
    ];
    add_activity('security', 'GEMU menjalankan security audit kompleks website.', ['files'=>$filesChecked, 'issues'=>count($issues), 'score'=>$score]);
    append_brain_event('analysis', 'Security audit kompleks: score '.$score.'/100, temuan '.count($issues), ['summary'=>$summary, 'top'=>array_slice($issues,0,8)]);
    return ['summary'=>$summary, 'issues'=>array_slice($issues, 0, 80), 'message'=>security_audit_message($summary, $issues)];
}

function security_audit_message(array $summary, array $issues): string {
    $c = $summary['counts'] ?? [];
    $lines = [];
    $lines[] = 'Security audit GEMU selesai 🛡️';
    $lines[] = 'Skor keamanan: '.($summary['score'] ?? 0).'/100. File dicek: '.($summary['files_checked'] ?? 0).'. Temuan: '.($summary['issue_total'] ?? 0).'.';
    $lines[] = 'Kritis: '.($c['critical'] ?? 0).' • High: '.($c['high'] ?? 0).' • Medium: '.($c['medium'] ?? 0).' • Low: '.($c['low'] ?? 0).'.';
    if ($issues) {
        $lines[] = 'Prioritas perbaikan:';
        foreach (array_slice($issues, 0, 5) as $i) {
            $lines[] = '- '.strtoupper($i['severity']).' '.$i['category'].' — '.$i['file'].':'.$i['line'].' — '.$i['advice'];
        }
    } else {
        $lines[] = 'Belum ada pola risiko besar dari scan statis. Tetap lakukan update hosting, backup, dan uji login/upload.';
    }
    $lines[] = 'Catatan: ini scan statis lokal, bukan antivirus penuh. GEMU tidak mengubah website; kalau perlu patch, tetap harus jadi draft dan menunggu ✓ Darma.';
    return implode("\n", $lines);
}

function audit_local_storage(int $limit = 20): array {
    $root = SITE_ROOT;
    $reportCleanup = cleanup_old_reports(7, 10);
    $skipDirs = ['.git','node_modules','vendor','storage/cache','cache','tmp','logs','__MACOSX'];
    $files = [];
    $dirTotals = [];
    $total = 0;
    $count = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        if (!$file->isFile()) continue;
        $path = $file->getPathname();
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $rel = str_replace('\\', '/', $rel);
        foreach ($skipDirs as $skip) {
            if (strpos($rel, $skip . '/') === 0 || strpos($rel, '/' . $skip . '/') !== false) continue 2;
        }
        $size = (int)$file->getSize();
        $total += $size; $count++;
        $files[] = ['file'=>$rel, 'bytes'=>$size, 'human'=>bytes_human($size), 'ext'=>strtolower(pathinfo($rel, PATHINFO_EXTENSION)) ?: 'none'];
        $top = explode('/', $rel)[0] ?: '(root)';
        $dirTotals[$top] = ($dirTotals[$top] ?? 0) + $size;
    }
    usort($files, fn($a,$b) => $b['bytes'] <=> $a['bytes']);
    arsort($dirTotals);
    $dirs = [];
    foreach ($dirTotals as $name=>$bytes) $dirs[] = ['dir'=>$name, 'bytes'=>$bytes, 'human'=>bytes_human((int)$bytes)];
    $backupBase = AI_DIR . '/backups';
    $backupDirs = [];
    if (is_dir($backupBase)) {
        foreach (scandir($backupBase) ?: [] as $name) {
            if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
            $full = $backupBase . '/' . $name;
            if (is_dir($full)) $backupDirs[] = ['name'=>$name, 'bytes'=>gemu_recursive_dir_size($full), 'human'=>bytes_human(gemu_recursive_dir_size($full)), 'mtime'=>@filemtime($full) ?: 0];
        }
        usort($backupDirs, fn($a,$b) => $b['bytes'] <=> $a['bytes']);
    }
    $fileBrain = load_json(AI_DIR . '/file-brain-index.json', []);
    $reportFiles = [];
    $reportBase = AI_DIR . '/reports';
    if (is_dir($reportBase)) {
        foreach (scandir($reportBase) ?: [] as $name) {
            if ($name === '.' || $name === '..' || $name === '.htaccess' || $name === 'index.html') continue;
            $full = $reportBase . '/' . $name;
            if (is_file($full)) $reportFiles[] = ['name'=>$name, 'bytes'=>@filesize($full) ?: 0, 'human'=>bytes_human((int)(@filesize($full) ?: 0)), 'mtime'=>@filemtime($full) ?: 0];
        }
        usort($reportFiles, fn($a,$b)=>$b['mtime'] <=> $a['mtime']);
    }
    return [
        'time'=>date('Y-m-d H:i:s'),
        'total_files'=>$count,
        'total_bytes'=>$total,
        'total_human'=>bytes_human($total),
        'top_files'=>array_slice($files, 0, $limit),
        'top_dirs'=>array_slice($dirs, 0, 12),
        'backups'=>['count'=>count($backupDirs), 'total_bytes'=>array_sum(array_map(fn($b)=>(int)$b['bytes'], $backupDirs)), 'total_human'=>bytes_human((int)array_sum(array_map(fn($b)=>(int)$b['bytes'], $backupDirs))), 'top'=>array_slice($backupDirs, 0, 8)],
        'file_brain'=>['count'=>count($fileBrain), 'bytes'=>gemu_recursive_dir_size(AI_DIR . '/file-brain'), 'human'=>bytes_human(gemu_recursive_dir_size(AI_DIR . '/file-brain')), 'limit_human'=>'1 GB'],
        'reports'=>['count'=>count($reportFiles), 'total_bytes'=>array_sum(array_map(fn($r)=>(int)$r['bytes'], $reportFiles)), 'total_human'=>bytes_human((int)array_sum(array_map(fn($r)=>(int)$r['bytes'], $reportFiles))), 'top'=>array_slice($reportFiles,0,10), 'cleanup'=>$reportCleanup],
    ];
}

function storage_audit_reply(string $q = ''): array {
    $audit = audit_local_storage(20);
    $lines = [];
    $lines[] = 'Audit storage lokal GEMU selesai.';
    $lines[] = 'Total file terbaca: '.$audit['total_files'].' file, ukuran terhitung: '.$audit['total_human'].'.';
    $lines[] = 'File terbesar:';
    foreach (array_slice($audit['top_files'], 0, 8) as $i=>$f) $lines[] = ($i+1).'. '.$f['file'].' — '.$f['human'];
    $lines[] = 'Folder terbesar: '.implode(', ', array_map(fn($d)=>$d['dir'].' '.$d['human'], array_slice($audit['top_dirs'],0,5))).'.';
    $lines[] = 'Backup: '.$audit['backups']['count'].' folder, total '.$audit['backups']['total_human'].'. File brain owner: '.$audit['file_brain']['human'].' / '.$audit['file_brain']['limit_human'].'.';
    $lines[] = 'Laporan GEMU: '.$audit['reports']['count'].' file di AI/reports, total '.$audit['reports']['total_human'].'. Cleanup root/report: pindah '.$audit['reports']['cleanup']['moved_count'].', hapus '.$audit['reports']['cleanup']['removed_count'].'.';
    $lines[] = 'Catatan: ini audit lokal, bukan Wikipedia. Backup lama juga punya auto-cleanup saat scan/backup berjalan.';
    add_activity('storage-audit', 'GEMU menjalankan audit storage lokal.', ['top'=>array_slice($audit['top_files'],0,5), 'total'=>$audit['total_bytes']]);
    append_brain_event('analysis', 'Audit storage lokal: '.$audit['total_human'], ['top_files'=>array_slice($audit['top_files'],0,8)]);
    return ['message'=>implode("\n", $lines), 'audit'=>$audit];
}


function candidate_files_for(string $q): array {
    $q = normalize_prompt($q);
    $candidates = [];
    $add = function($file) use (&$candidates) { if (is_file(SITE_ROOT . '/' . $file) && !in_array($file, $candidates, true)) $candidates[] = $file; };
    $addMany = function(array $files) use ($add) { foreach ($files as $file) $add($file); };

    if (is_agent_dialogue_prompt($q)) {
        $addMany(['AI/api.php','AI/index.php','AI/gemu.js','AI/gemu.css','AI/guide-widget.js','AI/guide-widget.css','AI/cron.php']);
    }
    if (preg_match('/navbar|nav\b|navigasi|menu|burger|garis\s*tiga|mobile\s*menu|side\s*menu|responsive/i', $q)) {
        $addMany(['partials/navbar.php','app.js','index.php','data.js','partials/footer.php']);
    }
    if (preg_match('/footer|kaki\s*halaman|copyright|bawah/i', $q)) { $addMany(['partials/footer.php','index.php','app.js']); }
    if (preg_match('/home|homepage|landing|hero|tampilan|ui|ux|cantik|modern|rapi|rapih|warna|animasi/i', $q)) { $addMany(['index.php','partials/navbar.php','partials/footer.php','app.js','data.js']); }
    if (preg_match('/sertifikat|certificate|project|proyek|pengalaman|experience|skill|keahlian|kontak|contact|profil|profile|about/i', $q)) { $addMany(['data.js','index.php','app.js','partials/navbar.php']); }
    if (preg_match('/login|auth|akun|owner|member|role/i', $q)) { $addMany(['auth.php','edit/api.php','edit/index.php','index.php']); }
    if (preg_match('/bisnis|produk|toko|jualan/i', $q)) { $addMany(['Bisnis/index.php','Bisnis/edit/index.php','Bisnis/edit/api.php']); }
    if (preg_match('/sabila/i', $q)) { $addMany(['sabila/index.php','sabila/app.js','sabila/data.js']); }
    if (preg_match('/hiragana|katakana|jepang|bahasa|flashcard|audio|ai membaca/i', $q)) {
        $base = SITE_ROOT . '/Belajar/Bahasa-Jepang';
        if (is_dir($base)) {
            foreach (['Belajar/Bahasa-Jepang/hiragana.php','Belajar/Bahasa-Jepang/index.php','Belajar/Bahasa-Jepang/assets/js/script.js','Belajar/Bahasa-Jepang/assets/css/style.css','Belajar/Bahasa-Jepang/hiragana/materi.js','Belajar/Bahasa-Jepang/hiragana/flashcard.js','Belajar/Bahasa-Jepang/hiragana/ai-membaca.js'] as $f) $add($f);
        }
    }
    if (preg_match('/ai|gemu|chat|guide|bubble|memori|scan|otak|upload|log|smart\s*edit|mandiri|draft/i', $q)) { $addMany(['AI/api.php','AI/index.php','AI/gemu.js','AI/gemu.css','AI/guide-widget.js','AI/guide-widget.css','AI/cron.php']); }
    if (preg_match('/seo|meta|google|search|judul|description|schema/i', $q)) { $addMany(['index.php','.htaccess','partials/navbar.php']); }
    if (preg_match('/bug|error|eror|tidak\s*muncul|tidak\s*jalan|rusak|blank|fatal|warning|fix|perbaiki/i', $q) && !$candidates) { $addMany(['index.php','app.js','data.js','partials/navbar.php']); }
    if (!$candidates) { $addMany(['index.php','app.js','data.js','partials/navbar.php','partials/footer.php']); }
    return array_values(array_slice(array_unique($candidates), 0, 22));
}




function smart_prompt_intent(string $question): array {
    $question = normalize_prompt($question);
    $q = strtolower($question);
    $intent = 'generic_improvement';
    $confidence = 0.66;
    $keywords = [];
    $needsDraft = true;

    $rules = [
        'navbar_fix' => ['/navbar|nav\b|navigasi|menu|burger|garis\s*tiga|mobile\s*menu|side\s*menu/i', 0.96, ['navbar','burger','partials/navbar.php','responsive menu']],
        'daily_activity_feature' => ['/aktivitas\s*harian|daily\s*activity|to\s*do|todo|jadwal\s*harian|habit|kebiasaan|produktif/i', 0.93, ['aktivitas harian','produktifitas','catatan kegiatan','dashboard owner']],
        'visual_polish_homepage' => ['/menarik|cantik|modern|rapi|rapih|aesthetic|tampilan|landing|hero|warna|animasi|ui|ux|bagus/i', 0.88, ['tampilan','visual','homepage','micro-interaction','mobile']],
        'content_profile_update' => ['/profil|profile|about|tentang|bio|pengalaman|experience|skill|keahlian|sertifikat|certificate|project|proyek|kontak|contact/i', 0.84, ['konten portfolio','data.js','profile section']],
        'footer_fix' => ['/footer|kaki\s*halaman|copyright|bagian\s*bawah/i', 0.82, ['footer','partials/footer.php','copyright']],
        'seo_improvement' => ['/seo|meta|google|search|description|judul\s*website|schema|ranking/i', 0.80, ['SEO','meta description','struktur heading']],
        'performance_mobile_audit' => ['/lemot|berat|speed|performa|performance|mobile|hp|responsive|overflow|layar/i', 0.78, ['performa','mobile','responsive','aksesibilitas']],
        'bugfix_analysis' => ['/bug|error|eror|tidak\s*muncul|tidak\s*jalan|rusak|blank|fatal|warning|fix|perbaiki|benarkan/i', 0.76, ['bugfix','analisis risiko','patch kecil']],
        'ai_owner_feature' => ['/ai|gemu|otak|memori|mandiri|smart\s*edit|draft|approve|log|upload/i', 0.82, ['GEMU AI','owner mode','safe automation']],
        'new_feature_scaffold' => ['/fitur|buatkan|tambahkan|module|modul|halaman\s*baru|page\s*baru|aplikasi/i', 0.74, ['fitur baru','halaman baru','struktur awal','aman diterapkan']],
    ];
    foreach ($rules as $name => $r) {
        if (preg_match($r[0], $question)) { $intent = $name; $confidence = $r[1]; $keywords = $r[2]; break; }
    }
    if (is_agent_dialogue_prompt($question)) { $intent = 'multi_agent_orchestration'; $confidence = 0.96; $keywords = ['GEMU Sistem','GEMU Frontline','GEMU Backend','diskusi agent','rating 0-100']; $needsDraft = false; }
    if ($intent === 'bugfix_analysis' && preg_match('/navbar|burger|menu/i', $question)) { $intent = 'navbar_fix'; $confidence = 0.97; $keywords = ['navbar','burger','menu tidak muncul']; }
    if ($intent === 'generic_improvement' && preg_match('/ubah|edit|tambahkan|buat|tolong/i', $question)) { $confidence = 0.70; $keywords = ['prompt bebas','analisis mandiri','draft aman']; }

    return [
        'intent' => $intent,
        'confidence' => $confidence,
        'keywords' => $keywords,
        'needs_draft' => $needsDraft,
        'owner_permission_rule' => 'GEMU boleh menganalisis dan membuat draft program dari prompt sederhana. Apply cukup lewat tombol ✓ approve atau × tolak; server tetap memvalidasi token owner Darma.'
    ];
}



function gemu_v19_terms(string $question, array $intent = []): array {
    $q = strtolower(normalize_prompt($question));
    $terms = [];
    $base = preg_split('/[^a-z0-9_\/\.\-]+/i', $q);
    $stop = ['gemu','tolong','coba','bisa','dong','ya','yaa','saya','aku','kamu','untuk','yang','dan','atau','di','ke','dari','agar','lebih','buat','edit','perbaiki','tambahkan','website','halaman','darma'];
    foreach ($base as $b) {
        $b = trim($b);
        if ($b !== '' && strlen($b) >= 3 && !in_array($b, $stop, true)) $terms[] = $b;
    }
    foreach (($intent['keywords'] ?? []) as $k) {
        foreach (preg_split('/[^a-z0-9_\/\.\-]+/i', strtolower((string)$k)) as $part) {
            if ($part !== '' && strlen($part) >= 3 && !in_array($part, $stop, true)) $terms[] = $part;
        }
    }
    $map = [
        'logo' => ['logo','brand','avatar','favicon','icon','navbar','header'],
        'burger' => ['burger','menu','navbar','nav','toggle'],
        'navbar' => ['navbar','nav','menu','partials/navbar.php'],
        'footer' => ['footer','partials/footer.php','copyright'],
        'tamu' => ['guest','public','guide','mode tamu','guide-widget'],
        'security' => ['sql','xss','csrf','upload','header','session','pdo','prepare'],
        'storage' => ['upload','backup','reports','file','storage'],
        'sabila' => ['sabila','data.js','app.js','index.php'],
    ];
    foreach ($map as $needle => $adds) {
        if (strpos($q, $needle) !== false) foreach ($adds as $a) $terms[] = strtolower($a);
    }
    $terms = array_values(array_unique(array_filter($terms)));
    return array_slice($terms, 0, 18);
}

function gemu_v19_file_evidence(string $question, array $intent, array $files): array {
    $terms = gemu_v19_terms($question, $intent);
    $items = [];
    $read = 0;
    $hitFiles = 0;
    $explicitFile = preg_match('/\b[A-Za-z0-9_\-\/]+\.(php|js|css|html|json|md)\b/', $question) === 1;
    foreach (array_values(array_unique($files)) as $rel) {
        if ($read >= 14) break;
        try {
            [$safe, $full] = resolve_safe_path((string)$rel);
        } catch (Throwable $e) {
            continue;
        }
        if (!is_file($full)) {
            $items[] = ['file'=>$safe, 'exists'=>false, 'size'=>0, 'hits'=>[], 'reason'=>'kandidat belum ada'];
            continue;
        }
        $read++;
        $size = @filesize($full) ?: 0;
        $raw = @file_get_contents($full, false, null, 0, 220000);
        if (!is_string($raw)) $raw = '';
        $hay = strtolower($raw);
        $hits = [];
        foreach ($terms as $t) {
            $needle = strtolower((string)$t);
            if ($needle === '') continue;
            if (stripos($safe, $needle) !== false || strpos($hay, $needle) !== false) {
                $pos = strpos($hay, $needle);
                $line = $pos === false ? null : (substr_count(substr($hay, 0, $pos), "\n") + 1);
                $hits[] = ['term'=>$needle, 'line'=>$line];
            }
        }
        $hits = array_slice($hits, 0, 8);
        if ($hits) $hitFiles++;
        $items[] = [
            'file'=>$safe,
            'exists'=>true,
            'size'=>$size,
            'hits'=>$hits,
            'reason'=>$hits ? 'ada bukti istilah/target di file' : 'dibaca, belum ada bukti kuat dari istilah target'
        ];
    }
    $ambiguous = [];
    $q = strtolower($question);
    if (preg_match('/\blogo\b/i', $question) && !preg_match('/navbar|header|favicon|avatar|brand|icon/i', $question)) {
        $ambiguous[] = 'Kata “logo” masih ambigu: bisa brand header, favicon, avatar, atau ikon menu.';
    }
    if (preg_match('/\b(ini|itu|bagian ini|yang tadi)\b/i', $question) && !$explicitFile) {
        $ambiguous[] = 'Ada kata rujukan seperti “ini/itu”; perlu bukti file lebih kuat sebelum patch.';
    }
    $certainty = 40;
    if ($read > 0) $certainty = 58;
    if ($hitFiles === 1) $certainty = 72;
    if ($hitFiles >= 2) $certainty = 86;
    if ($explicitFile && $hitFiles >= 1) $certainty = 92;
    if ($explicitFile && $read > 0 && $hitFiles === 0) $certainty = 78;
    if ($ambiguous) $certainty = min($certainty, 74);
    return [
        'terms'=>$terms,
        'items'=>$items,
        'files_read'=>$read,
        'hit_files'=>$hitFiles,
        'target_certainty'=>$certainty,
        'ambiguous'=>$ambiguous,
        'explicit_file'=>$explicitFile,
    ];
}

function gemu_v19_quality_gate(string $question, array $intent, array $evidence, array $issues, array $edits = []): array {
    $confidence = (float)($intent['confidence'] ?? 0.60);
    $intentScore = (int)round(max(0, min(1, $confidence)) * 20);
    $fileScore = (int)round(max(0, min(100, (int)($evidence['target_certainty'] ?? 0))) / 100 * 15);

    $dangerIssues = 0;
    foreach ($issues as $it) {
        $sev = strtolower((string)($it['severity'] ?? $it['level'] ?? ''));
        $msg = strtolower((string)($it['message'] ?? $it['title'] ?? ''));
        if (preg_match('/danger|critical|high|system\(|shell_exec|eval|sql|xss|upload|csrf/', $sev.' '.$msg)) $dangerIssues++;
    }
    $securityScore = 25;
    if ($dangerIssues > 0) $securityScore = 20;
    if (preg_match('/\b(eval|shell_exec|system|exec|passthru|raw sql)\b/i', $question)) $securityScore = min($securityScore, 17);

    $patchCount = count($edits);
    $riskScore = 15;
    if ($patchCount > 2) $riskScore -= 3;
    if ($patchCount > 4) $riskScore -= 5;
    if (($evidence['ambiguous'] ?? [])) $riskScore = min($riskScore, 10);
    $riskScore = max(4, $riskScore);

    $qualityErrors = 0;
    foreach ($edits as $edit) {
        if (empty($edit['quality']['ok'])) $qualityErrors++;
    }
    $testScore = $patchCount === 0 ? 10 : 15;
    if ($qualityErrors > 0) $testScore = 3;

    $uxScore = 8;
    if (preg_match('/tampilan|ui|ux|mode tamu|mobile|rapi|presentasi|grafik|navbar|logo|footer/i', $question)) $uxScore = 10;
    if (preg_match('/hapus|delete|overwrite|timpa/i', $question)) $uxScore = min($uxScore, 7);

    $hardBlocks = [];
    if ($intentScore < 16) $hardBlocks[] = 'Intent belum cukup jelas di atas 80%.';
    if ($fileScore < 12 && !empty($intent['needs_draft'])) $hardBlocks[] = 'File target belum terbukti kuat dari pembacaan lokal.';
    if ($securityScore < 22 && $patchCount > 0) $hardBlocks[] = 'Keamanan patch belum layak; perlu audit ulang.';
    if ($qualityErrors > 0) $hardBlocks[] = 'Ada draft yang gagal test otomatis.';
    foreach (($evidence['ambiguous'] ?? []) as $amb) $hardBlocks[] = $amb;

    $total = $intentScore + $securityScore + $fileScore + $riskScore + $testScore + $uxScore;
    if ($hardBlocks && $patchCount === 0) $total = min($total, 79);
    if ($hardBlocks && $patchCount > 0) $total = min($total, 79);
    if ($qualityErrors > 0) $total = min($total, 59);
    $total = max(0, min(100, $total));

    if ($total < 60) { $decision = 'rejected_auto'; $decisionText = 'ditolak otomatis; jangan buat draft'; }
    elseif ($total < 80) { $decision = 'analysis_only'; $decisionText = 'analisis/saran dulu; belum layak tombol approve'; }
    elseif ($total < 90) { $decision = 'draft_waiting_owner'; $decisionText = 'layak draft; tetap menunggu ✓ owner'; }
    else { $decision = 'strong_draft_waiting_owner'; $decisionText = 'draft kuat; tetap menunggu ✓ owner'; }

    return [
        'components'=>[
            'Pemahaman intent'=>$intentScore,
            'Keamanan perubahan'=>$securityScore,
            'Kesesuaian file target'=>$fileScore,
            'Risiko bug kecil'=>$riskScore,
            'Test dasar lolos'=>$testScore,
            'UX/tampilan tidak rusak'=>$uxScore,
        ],
        'score'=>$total,
        'decision'=>$decision,
        'decision_text'=>$decisionText,
        'hard_blocks'=>$hardBlocks,
        'can_draft'=>($total >= 80 && !$hardBlocks),
        'quality_errors'=>$qualityErrors,
        'danger_issues'=>$dangerIssues,
    ];
}

function gemu_agent_slug(string $name): string {
    $n = strtolower($name);
    if (strpos($n, 'front') !== false) return 'frontline';
    if (strpos($n, 'back') !== false) return 'backend';
    return 'sistem';
}

function gemu_agent_memory_path(string $agent): string {
    global $agentsDir;
    $slug = gemu_agent_slug($agent);
    ensure_protection($agentsDir);
    return $agentsDir . '/' . $slug . '-memory.json';
}

function gemu_agent_memory_add(string $agent, string $note, array $meta = []): void {
    $path = gemu_agent_memory_path($agent);
    $list = load_json($path, []);
    if (!is_array($list)) $list = [];
    array_unshift($list, ['time'=>date('Y-m-d H:i:s'), 'ts'=>time(), 'agent'=>gemu_agent_slug($agent), 'note'=>safe_text($note, 600), 'meta'=>$meta]);
    save_json($path, array_slice($list, 0, 160));
}

function gemu_agent_memories(): array {
    $out = [];
    foreach (['sistem','frontline','backend'] as $agent) {
        $out[$agent] = array_slice(load_json(gemu_agent_memory_path($agent), []), 0, 12);
    }
    return $out;
}

function gemu_agent_session_default(): array {
    return [
        'active'=>false,
        'last_time'=>null,
        'last_score'=>0,
        'last_decision'=>'Belum ada diskusi agent.',
        'rounds'=>0,
        'dialogue'=>[],
        'role_ratings'=>['frontline'=>0,'backend'=>0,'system'=>0],
        'agent_notes'=>[],
    ];
}

function gemu_save_agent_session(array $review, string $question, array $intent, array $files): void {
    global $agentSessionFile;
    $session = [
        'active'=>true,
        'question'=>safe_text($question, 360),
        'intent'=>$intent['intent'] ?? 'generic_improvement',
        'confidence'=>round(((float)($intent['confidence'] ?? 0)) * 100),
        'files'=>array_slice($files, 0, 10),
        'last_time'=>date('Y-m-d H:i:s'),
        'last_ts'=>time(),
        'last_score'=>(int)($review['score'] ?? 0),
        'last_decision'=>(string)($review['system']['decision_text'] ?? '-'),
        'rounds'=>(int)($review['rounds'] ?? 0),
        'role_ratings'=>$review['role_ratings'] ?? [],
        'dialogue'=>array_slice($review['dialogue'] ?? [], -24),
        'components'=>$review['system']['components'] ?? [],
        'agent_notes'=>[
            'sistem'=>$review['system']['decision_text'] ?? '',
            'frontline'=>$review['frontline']['summary'] ?? '',
            'backend'=>'Target: '.implode(', ', array_slice((array)($review['backend']['target_files'] ?? []), 0, 5)),
        ],
    ];
    save_json($agentSessionFile, $session);
    gemu_agent_memory_add('sistem', 'Keputusan: '.($session['last_decision'] ?? '-').' untuk prompt '.$session['question'], ['score'=>$session['last_score']]);
    gemu_agent_memory_add('frontline', (string)($review['frontline']['summary'] ?? 'Frontline mengecek bahasa owner.'), ['intent'=>$session['intent']]);
    gemu_agent_memory_add('backend', 'File target: '.implode(', ', $session['files']), ['drafts'=>count((array)($review['staged_edit_ids'] ?? []))]);
}

function gemu_agent_session(): array {
    global $agentSessionFile;
    $state = load_json($agentSessionFile, gemu_agent_session_default());
    if (!is_array($state)) $state = gemu_agent_session_default();
    return array_replace(gemu_agent_session_default(), $state);
}


function load_agent_decisions(): array {
    global $agentDecisionsFile;
    $data = load_json($agentDecisionsFile, []);
    return is_array($data) ? $data : [];
}

function save_agent_decisions(array $items): void {
    global $agentDecisionsFile;
    save_json($agentDecisionsFile, array_slice($items, 0, 120));
}

function public_agent_decisions(): array {
    $items = load_agent_decisions();
    $pending = array_values(array_filter($items, fn($i) => ($i['status'] ?? '') === 'pending'));
    $done = array_values(array_filter($items, fn($i) => ($i['status'] ?? '') !== 'pending'));
    return ['pending'=>array_slice($pending,0,20), 'history'=>array_slice($done,0,50)];
}

function create_agent_decision(string $title, string $detail, array $payload = []): array {
    $items = load_agent_decisions();
    $fingerprint = sha1($title.'|'.$detail.'|'.json_encode($payload, JSON_UNESCAPED_UNICODE));
    foreach ($items as $it) if (($it['status'] ?? '') === 'pending' && ($it['fingerprint'] ?? '') === $fingerprint) return $it;
    $decision = [
        'id'=>bin2hex(random_bytes(5)),
        'type'=>'agent_decision',
        'status'=>'pending',
        'time'=>date('Y-m-d H:i:s'),
        'ts'=>time(),
        'title'=>safe_text($title, 160),
        'detail'=>safe_text($detail, 900),
        'payload'=>$payload,
        'fingerprint'=>$fingerprint,
        'quality'=>['status'=>'review_ready','ok'=>true]
    ];
    array_unshift($items, $decision);
    save_agent_decisions($items);
    add_activity('multi-agent', 'Agent membuat keputusan yang menunggu reaksi owner: '.$decision['title'], ['decision_id'=>$decision['id']]);
    return $decision;
}

function resolve_agent_decision(string $id, bool $approve, string $reason = ''): array {
    $items = load_agent_decisions();
    foreach ($items as &$it) {
        if (($it['id'] ?? '') === $id && ($it['status'] ?? '') === 'pending') {
            $it['status'] = $approve ? 'approved' : 'rejected';
            $it['resolved_at'] = date('Y-m-d H:i:s');
            $it['resolved_by'] = 'owner_darma';
            $it['reason'] = safe_text($reason, 300);
            save_agent_decisions($items);
            add_activity('multi-agent', ($approve ? 'Owner menyetujui' : 'Owner menolak').' keputusan agent: '.($it['title'] ?? $id), ['decision_id'=>$id]);
            append_brain_event('analysis', 'Keputusan agent '.($approve?'disetujui':'ditolak').': '.($it['title'] ?? $id), ['decision'=>$it]);
            return $it;
        }
    }
    out(false, ['message'=>'Keputusan agent tidak ditemukan atau sudah selesai.'], 404);
}

function is_agent_dialogue_prompt(string $q): bool {
    return preg_match('/\b(3\s*role|tiga\s*role|agent|agen|frontline|backend|sistem|diskusi|ngobrol|rating|skor|score)\b/i', $q)
        && preg_match('/\b(gemu|ai|role|agent|frontline|backend|sistem|diskusi|ngobrol)\b/i', $q);
}

function gemu_agent_dialogue_request(string $question): array {
    global $tasksFile;
    $question = normalize_prompt(safe_text($question, 1400));
    $intent = smart_prompt_intent($question);
    if (is_agent_dialogue_prompt($question)) {
        $intent['intent'] = 'multi_agent_orchestration';
        $intent['confidence'] = max((float)($intent['confidence'] ?? 0.72), 0.96);
        $intent['keywords'] = ['GEMU Sistem','GEMU Frontline','GEMU Backend','diskusi agent','rating 0-100','owner approve'];
        $intent['needs_draft'] = false;
    }
    $files = candidate_files_for($question);
    if (is_agent_dialogue_prompt($question)) {
        foreach (['AI/api.php','AI/gemu.js','AI/index.php','AI/gemu.css','AI/cron.php','AI/guide-widget.js','AI/guide-widget.css'] as $must) {
            if (is_file(SITE_ROOT.'/'.$must) && !in_array($must, $files, true)) $files[] = $must;
        }
    }
    $scan = scan_site('agent_dialogue');
    $issues = $scan[1] ?? [];
    $related = array_values(array_filter($issues, function($i) use ($files) {
        $f = strtolower((string)($i['file'] ?? ''));
        foreach ($files as $cand) if ($f && (strpos($f, strtolower($cand)) !== false || strpos(strtolower($cand), $f) !== false)) return true;
        return false;
    }));
    $review = gemu_multi_agent_discussion($question, $intent, $files, $related, [], 7);
    gemu_save_agent_session($review, $question, $intent, $files);

    $decision = null;
    if (($review['score'] ?? 0) >= 80) {
        $decision = create_agent_decision(
            'Lanjutkan rencana 3 Role Agent GEMU',
            'Skor '.$review['score'].'/100. '.$review['system']['decision_text'].'. Jika disetujui, GEMU memakai alur Frontline → Backend → Sistem, diskusi ulang bila skor di bawah 80, dan semua edit website tetap staged-edit menunggu ✓ owner.',
            ['kind'=>'multi_agent_plan','question'=>$question,'review'=>$review,'files'=>array_slice($files,0,12)]
        );
    }

    $task = [
        'id'=>bin2hex(random_bytes(5)),
        'task'=>$question,
        'status'=> (($review['score'] ?? 0) >= 80) ? 'agent-dialogue-awaiting-owner' : 'agent-dialogue-analysis-only',
        'time'=>date('Y-m-d H:i:s'),
        'intent'=>$intent,
        'agent_review'=>$review,
        'files'=>$files,
        'decision_id'=>$decision['id'] ?? null,
    ];
    $tasks = load_json($tasksFile, []);
    array_unshift($tasks, $task);
    save_json($tasksFile, array_slice($tasks, 0, 100));
    $message = 'Diskusi 3 role GEMU selesai. Skor akhir '.$review['score'].'/100. '.$review['system']['decision_text'].'. '.($decision ? 'Tombol ✓/× untuk menyetujui rencana agent sudah muncul di Reaksi Draft.' : 'Skor belum cukup, jadi aku simpan sebagai analisis saja.');
    append_owner_chat('gemu', $message, ['source'=>'agent_dialogue','agent_review'=>$review, 'decision'=>$decision]);
    add_activity('multi-agent', 'Diskusi agent eksplisit dibuat dari perintah owner.', ['score'=>$review['score'], 'rounds'=>$review['rounds'], 'decision_id'=>$decision['id'] ?? null]);
    append_brain_event('analysis', 'Diskusi agent GEMU: '.$question, ['score'=>$review['score'], 'rounds'=>$review['rounds'], 'decision'=>$decision]);
    return ['message'=>$message, 'task'=>$task, 'agent_review'=>$review, 'decision'=>$decision, 'agent_decisions'=>public_agent_decisions(), 'summary'=>$scan[0] ?? null, 'issues'=>array_slice($related,0,20)];
}

function existing_site_snapshot(array $files): array {
    $snapshot = [];
    foreach (array_slice($files, 0, 10) as $file) {
        $full = SITE_ROOT . '/' . $file;
        $snapshot[] = [
            'file' => $file,
            'exists' => is_file($full),
            'bytes' => is_file($full) ? (int)filesize($full) : 0,
            'excerpt' => file_excerpt($file, 900)
        ];
    }
    return $snapshot;
}


