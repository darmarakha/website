<?php
include_once 'api_sandbox.php';
function gemu_multi_agent_review(string $question, array $intent, array $files, array $issues, array $edits = []): array {
    $intentName = (string)($intent['intent'] ?? 'generic_improvement');
    $evidence = gemu_v19_file_evidence($question, $intent, $files);
    $gate = gemu_v19_quality_gate($question, $intent, $evidence, $issues, $edits);
    $score = (int)$gate['score'];
    $components = $gate['components'];

    $frontlineRating = max(0, min(100, (int)round(
        ($components['Pemahaman intent'] / 20 * 55) +
        ($components['UX/tampilan tidak rusak'] / 10 * 25) +
        ($components['Kesesuaian file target'] / 15 * 20)
    )));
    $backendRating = max(0, min(100, (int)round(
        ($components['Keamanan perubahan'] / 25 * 35) +
        ($components['Kesesuaian file target'] / 15 * 25) +
        ($components['Test dasar lolos'] / 15 * 25) +
        ($components['Risiko bug kecil'] / 15 * 15)
    )));
    $systemRating = $score;

    $proofFiles = array_values(array_filter($evidence['items'] ?? [], fn($it) => !empty($it['exists'])));
    $proofShort = array_map(function($it) {
        $hit = $it['hits'][0]['term'] ?? null;
        return ($it['file'] ?? '-') . ($hit ? ' • hit: '.$hit : ' • dibaca');
    }, array_slice($proofFiles, 0, 5));

    $frontline = [
        'role'=>'GEMU Frontline',
        'focus'=>'komunikasi, mode tamu, UX, dan pemahaman bahasa Darma',
        'rating'=>$frontlineRating,
        'summary'=>'Maksud dibaca sebagai '.$intentName.'. Frontline wajib menolak ringkasan yang terlalu panjang dan menandai perintah ambigu.',
        'notes'=>array_values(array_filter([
            'Confidence intent: '.(int)round(((float)($intent['confidence'] ?? 0))*100).'%',
            ($evidence['ambiguous'] ?? []) ? 'Masih ambigu: '.implode(' | ', $evidence['ambiguous']) : 'Bahasa perintah cukup jelas untuk dianalisis.',
            'Output ke Darma harus ringkas: skor, bukti file, risiko, lalu tombol keputusan bila layak.',
        ])),
    ];
    $backend = [
        'role'=>'GEMU Backend',
        'focus'=>'PHP/JS/CSS/security/storage/database, patch kecil, test, backup, rollback',
        'rating'=>$backendRating,
        'summary'=>'Backend membaca file kandidat sebelum patch. Draft hanya valid kalau target file terbukti dan test dasar lolos.',
        'notes'=>array_values(array_filter([
            'File dibaca: '.(int)($evidence['files_read'] ?? 0).', file dengan bukti: '.(int)($evidence['hit_files'] ?? 0).'.',
            $proofShort ? 'Bukti: '.implode(' | ', $proofShort) : 'Belum ada bukti file yang cukup.',
            count($edits).' draft teknis disiapkan; '.(int)($gate['quality_errors'] ?? 0).' gagal test.',
        ])),
    ];
    $system = [
        'role'=>'GEMU Sistem',
        'focus'=>'hakim keputusan, skor, hard gate, approve owner, anti patch spekulatif',
        'rating'=>$systemRating,
        'summary'=>'Sistem memakai hard-gate: intent, file target, keamanan, test, dan UX. Satu gate penting gagal = tidak boleh masuk draft.',
        'components'=>$components,
        'decision'=>$gate['decision'],
        'decision_text'=>$gate['decision_text'],
        'hard_blocks'=>$gate['hard_blocks'],
        'can_draft'=>$gate['can_draft'],
        'notes'=>array_values(array_filter([
            'Skor akhir: '.$score.'/100.',
            $gate['hard_blocks'] ? 'Blokir: '.implode(' | ', $gate['hard_blocks']) : 'Tidak ada hard-block; tetap menunggu approve owner.',
            'Aturan owner: website tidak ditulis sebelum Darma klik ✓; × membuang draft.',
        ])),
    ];

    return [
        'version'=>'v19-real-agent-gated',
        'score'=>$score,
        'components'=>$components,
        'frontline'=>$frontline,
        'backend'=>$backend,
        'system'=>$system,
        'role_ratings'=>[
            'frontline'=>$frontlineRating,
            'backend'=>$backendRating,
            'sistem'=>$systemRating,
        ],
        'evidence'=>$evidence,
        'hard_blocks'=>$gate['hard_blocks'],
        'can_create_draft'=>$gate['can_draft'],
        'quality_errors'=>$gate['quality_errors'],
        'danger_issues'=>$gate['danger_issues'],
        'decision'=>$gate['decision'],
        'decision_text'=>$gate['decision_text'],
    ];
}



// gemu_dialogue_line v19 moved below with multi-agent discussion.





function gemu_dialogue_line(string $round, string $role, string $text, array $meta = []): array {
    return [
        'round'=>$round,
        'role'=>$role,
        'text'=>safe_text($text, 620),
        'meta'=>$meta,
        'time'=>date('H:i:s'),
    ];
}

function gemu_multi_agent_discussion(string $question, array $intent, array $files, array $issues, array $edits = [], int $maxRounds = 5): array {
    $review = gemu_multi_agent_review($question, $intent, $files, $issues, $edits);
    $dialogue = [];
    $learning = [];
    $roundCount = 0;
    $intentName = (string)($intent['intent'] ?? 'generic_improvement');
    $evidence = $review['evidence'] ?? [];
    $hardBlocks = $review['hard_blocks'] ?? [];
    $score = (int)($review['score'] ?? 0);

    $minRounds = 3;
    $maxRounds = max($minRounds, min(6, $maxRounds));
    for ($round = 1; $round <= $maxRounds; $round++) {
        $roundCount = $round;
        $label = 'Ronde '.$round;

        if ($round === 1) {
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Frontline', 'Saya pahami maksud Darma sebagai '.$intentName.'. Saya belum boleh membuat jawaban panjang; saya minta Backend membuktikan file target dulu.', [
                'intent'=>$intentName,
                'confidence'=>(int)round(((float)($intent['confidence'] ?? 0))*100),
            ]);
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Backend', 'Saya membaca kandidat file lokal: '.implode(', ', array_slice($files, 0, 6)).'. Target certainty sementara '.$evidence['target_certainty'].'%.', [
                'files_read'=>$evidence['files_read'] ?? 0,
                'hit_files'=>$evidence['hit_files'] ?? 0,
            ]);
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Sistem', 'Saya hitung skor awal '.$score.'/100. Kalau ada hard-block, saya larang draft dan paksa diskusi ulang.', [
                'score'=>$score,
                'hard_blocks'=>$hardBlocks,
            ]);
        } elseif ($round === 2) {
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Backend → GEMU Sistem', ($evidence['hit_files'] ?? 0) > 0
                ? 'Saya menemukan bukti pada file kandidat. Saya hanya boleh patch kecil, bertahap, dan setelah test.'
                : 'Saya belum menemukan bukti target yang cukup. Saya minta Sistem menahan draft agar tidak spekulatif.', [
                'evidence'=>array_slice($evidence['items'] ?? [], 0, 5),
            ]);
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Sistem → GEMU Frontline', $hardBlocks
                ? 'Blokir aktif: '.implode(' | ', $hardBlocks).'. Frontline harus jelaskan singkat ke Darma, bukan memaksa tombol approve.'
                : 'Gate utama lolos. Frontline siapkan ringkasan yang mudah dibaca: skor, file, risiko, test, dan tombol ✓/×.', [
                'decision'=>$review['decision_text'] ?? '',
            ]);
            $dialogue[] = gemu_dialogue_line($label, 'GEMU Frontline', 'Saya ubah hasil menjadi format dashboard: angka persentase, bukti file, risiko, dan status keputusan.', []);
        } else {
            $review = gemu_multi_agent_review($question, $intent, $files, $issues, $edits);
            $score = (int)($review['score'] ?? 0);
            $hardBlocks = $review['hard_blocks'] ?? [];
            if ($score < 80 || $hardBlocks) {
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Sistem', 'Skor masih '.$score.'/100. Karena belum memenuhi batas 80 atau masih ada hard-block, keputusan tetap analisis dulu.', [
                    'score'=>$score,
                    'hard_blocks'=>$hardBlocks,
                ]);
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Backend', 'Saya tidak membuat patch spekulatif. Langkah aman: baca file tambahan, minta konteks, atau buat rencana teknis tanpa menulis website.', []);
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Frontline', 'Saya simpan pembelajaran: kalau target belum jelas, jawaban harus meminta fokus area dan menampilkan bukti yang kurang.', []);
                $learning[] = 'Jika skor <80 atau file target belum terbukti, GEMU harus berdiskusi ulang dan tidak membuat draft website.';
            } else {
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Sistem', 'Skor '.$score.'/100 dan gate lolos. Draft boleh menunggu owner, bukan langsung menulis website.', [
                    'score'=>$score,
                    'can_create_draft'=>true,
                ]);
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Backend', 'Saya siapkan staged edit yang sudah test dasar. Apply nanti berurutan: lock, backup, hash, tulis file, test, rollback kalau gagal.', []);
                $dialogue[] = gemu_dialogue_line($label, 'GEMU Frontline', 'Saya tampilkan tombol ✓ Setujui dan × Tolak dengan laporan ringkas agar Darma tidak membaca tembok teks.', []);
                $learning[] = 'Draft kuat tetap butuh approve owner; eksekusi wajib bertahap dan rollback-ready.';
                if ($round >= $minRounds) break;
            }
        }
        if ($round >= $minRounds && $score >= 80 && !$hardBlocks) break;
    }

    $review['dialogue'] = $dialogue;
    $review['rounds'] = $roundCount;
    $review['learning'] = array_values(array_unique($learning));
    $review['learning_policy'] = [
        'internet'=>'Role boleh belajar internet hanya bila Darma meminta sumber eksternal secara jelas; hasil disimpan sebagai ringkasan.',
        'local_first'=>'Pertanyaan website/file/storage/security dibaca dari lokal dulu; kata “cari” tidak otomatis menjadi internet.',
        'owner_approval'=>'Semua perubahan website final tetap menunggu tombol ✓ owner Darma; × menolak tanpa mengubah website.',
        'hard_gate'=>'Rata-rata skor tidak cukup. Intent, file target, keamanan, test, dan UX harus melewati batas minimum.'
    ];
    $review['final_summary'] = safe_text('Diskusi '.$roundCount.' ronde selesai. Skor '.$review['score'].'/100; '.$review['system']['decision_text'].'.', 300);
    gemu_save_agent_session($review, $question, $intent, $files);
    foreach (['sistem','frontline','backend'] as $role) {
        $r = $role === 'sistem' ? $review['system'] : ($role === 'frontline' ? $review['frontline'] : $review['backend']);
        gemu_agent_memory_add($role, 'Diskusi '.$roundCount.' ronde: '.($r['summary'] ?? '').' Skor akhir '.$review['score'].'/100.', ['score'=>$review['score'], 'intent'=>$intentName]);
    }
    return $review;
}



function gemu_agent_review_text(array $review): string {
    $score = (int)($review['score'] ?? 0);
    $decisionText = (string)($review['system']['decision_text'] ?? '-');
    $parts = [];
    foreach (($review['system']['components'] ?? []) as $k=>$v) $parts[] = $k.': '.$v;
    $rounds = (int)($review['rounds'] ?? 1);
    return "Diskusi 3 role {$rounds} ronde. Skor GEMU Sistem: {$score}/100 ({$decisionText}). Komponen: ".implode('; ', $parts).'.';
}

function smart_analysis_text(string $question, array $intent, array $files, array $issues, array $edits): string {
    $intentName = $intent['intent'] ?? 'generic_improvement';
    $confidence = (int)round(((float)($intent['confidence'] ?? 0)) * 100);
    $lines = [];
    $lines[] = "Analisis mandiri GEMU";
    $lines[] = "Permintaan Darma: " . $question;
    $lines[] = "Intensi terdeteksi: {$intentName} ({$confidence}% yakin).";
    $lines[] = "Kenapa ini perlu: GEMU menafsirkan perintah sederhana sebagai tujuan produk, bukan menyuruh Darma menulis program sendiri.";
    $lines[] = "File/area kandidat: " . implode(', ', array_slice($files, 0, 8));
    if ($issues) {
        $lines[] = "Temuan scan terkait: " . count($issues) . " item. GEMU tetap memilih patch kecil supaya tidak merusak bagian yang sudah benar.";
    } else {
        $lines[] = "Temuan scan terkait: belum ada masalah langsung pada area ini.";
    }
    if ($edits) {
        $paths = array_map(fn($e) => $e['path'] ?? '-', $edits);
        $quality = array_map(fn($e) => (($e['path'] ?? '-') . ' = ' . (($e['quality']['status'] ?? 'tested'))), $edits);
        $lines[] = "Draft program dibuat: " . implode(', ', $paths) . ".";
        $lines[] = "Test otomatis draft: " . implode('; ', $quality) . ".";
    } else {
        $lines[] = "Draft program belum dibuat karena intent butuh konteks file lebih spesifik. GEMU tetap menyimpan rencana teknis agar tidak memberi saran kosong.";
    }
    $lines[] = "Risiko yang dicegah: edit langsung tanpa backup, salah file target, menimpa perubahan terbaru, dan menambah fitur tanpa izin owner.";
    $lines[] = "Cara pakai: Darma cukup klik ✓ approve atau × tolak. GEMU yang menyiapkan analisis, file target, isi program, dan test otomatisnya.";
    return implode("\n", $lines);
}

function generate_daily_activity_page(string $request): string {
    $safeReq = htmlspecialchars($request, ENT_QUOTES, 'UTF-8');
    return <<<'PHP'
<?php
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
$isOwner = isset($_SESSION['user_role']) && strtolower((string)$_SESSION['user_role']) === 'owner';
$name = isset($_SESSION['user_name']) ? htmlspecialchars((string)$_SESSION['user_name'], ENT_QUOTES, 'UTF-8') : 'Darma';
?>
<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aktivitas Harian — Darma</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#071422;--card:rgba(255,255,255,.08);--line:rgba(255,255,255,.14);--text:#eef7ff;--muted:#9fb4c8;--accent:#38bdf8;--good:#22c55e;--warn:#f59e0b;--bad:#ef4444}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:radial-gradient(circle at top left,rgba(56,189,248,.18),transparent 34%),linear-gradient(135deg,#071422,#102a43 55%,#08111d);color:var(--text);min-height:100vh}.wrap{width:min(1120px,100%);margin:auto;padding:24px}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:22px}.brand{display:flex;gap:12px;align-items:center}.logo{width:44px;height:44px;border-radius:16px;background:linear-gradient(135deg,#38bdf8,#0284c7);display:grid;place-items:center;font-weight:800;box-shadow:0 18px 40px rgba(56,189,248,.22)}a{color:inherit}.btn{border:1px solid var(--line);background:rgba(255,255,255,.09);color:var(--text);border-radius:14px;padding:11px 14px;font-weight:700;cursor:pointer}.btn.primary{background:linear-gradient(135deg,#38bdf8,#0284c7);border:0}.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.card{border:1px solid var(--line);background:var(--card);backdrop-filter:blur(18px);border-radius:24px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.22)}.hero{padding:24px}.hero h1{font-size:clamp(2rem,5vw,4.4rem);line-height:1;margin:8px 0}.muted{color:var(--muted)}.form{display:grid;grid-template-columns:1fr 145px 120px;gap:10px}.input,.select{width:100%;border:1px solid var(--line);background:rgba(0,0,0,.18);color:var(--text);border-radius:14px;padding:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.stat{padding:16px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid var(--line)}.stat b{font-size:1.8rem}.list{display:grid;gap:10px;margin-top:14px}.task{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:13px;border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.06)}.check{width:24px;height:24px}.task.done{opacity:.62}.task.done .title{text-decoration:line-through}.pill{font-size:.75rem;border-radius:999px;padding:5px 9px;background:rgba(56,189,248,.13);color:#bae6fd}.danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35)}.row{display:flex;gap:8px;flex-wrap:wrap}.quote{line-height:1.7}.empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:18px}@media(max-width:820px){.top,.grid{grid-template-columns:1fr;display:grid}.form{grid-template-columns:1fr}.stats{grid-template-columns:1fr}.wrap{padding:16px}.task{grid-template-columns:auto 1fr}.task .row{grid-column:1/-1}}</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="brand" href="index.php" style="text-decoration:none"><div class="logo">DR</div><div><b>Aktivitas Harian</b><div class="muted">Dashboard pribadi Darma</div></div></a>
    <div class="row"><a class="btn" href="index.php">← Portfolio</a><button class="btn primary" id="exportBtn">Export JSON</button></div>
  </div>

  <section class="card hero">
    <p class="pill">Mode Owner Produktif</p>
    <h1>Catat, pilih prioritas, lalu bereskan satu per satu.</h1>
    <p class="muted">Fitur ini dibuat agar aktivitas harian tidak tercecer. Data tersimpan di browser melalui localStorage, jadi ringan dan tidak mengubah database.</p>
  </section>

  <div class="grid" style="margin-top:18px">
    <main class="card">
      <h2>Tambah Aktivitas</h2>
      <?php if(!$isOwner): ?><div class="card danger"><b>Mode baca</b><p class="muted">Login sebagai owner untuk memakai dashboard ini secara penuh.</p></div><?php endif; ?>
      <form class="form" id="taskForm">
        <input class="input" id="taskTitle" placeholder="Contoh: Update halaman portfolio" required <?php echo !$isOwner?'disabled':''; ?>>
        <select class="select" id="taskPriority" <?php echo !$isOwner?'disabled':''; ?>><option value="tinggi">Prioritas tinggi</option><option value="sedang" selected>Prioritas sedang</option><option value="rendah">Prioritas rendah</option></select>
        <button class="btn primary" <?php echo !$isOwner?'disabled':''; ?>>Tambah</button>
      </form>
      <div class="stats">
        <div class="stat"><span class="muted">Total</span><br><b id="totalStat">0</b></div>
        <div class="stat"><span class="muted">Selesai</span><br><b id="doneStat">0</b></div>
        <div class="stat"><span class="muted">Progress</span><br><b id="progressStat">0%</b></div>
      </div>
      <div class="list" id="taskList"></div>
    </main>
    <aside class="card">
      <h2>Analisis GEMU</h2>
      <p class="quote muted">GEMU menyarankan aktivitas dibuat singkat, diberi prioritas, dan dicek harian. Jika terlalu banyak, pecah menjadi tugas kecil agar tidak terasa berat.</p>
      <hr style="border-color:var(--line);border-width:0 0 1px;margin:18px 0">
      <h3>Filter cepat</h3>
      <div class="row"><button class="btn" data-filter="all">Semua</button><button class="btn" data-filter="open">Belum selesai</button><button class="btn" data-filter="done">Selesai</button></div>
      <p class="muted" style="margin-top:16px">Halo, <?php echo $name; ?>. Fokus utama hari ini cukup 1–3 tugas penting dulu.</p>
    </aside>
  </div>
</div>
<script>
const KEY='darma_daily_activities_v1';let filter='all';const isOwner=<?php echo $isOwner?'true':'false'; ?>;
const $=id=>document.getElementById(id);function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}function save(data){localStorage.setItem(KEY,JSON.stringify(data))}
function render(){const data=load();const visible=data.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));$('totalStat').textContent=data.length;$('doneStat').textContent=data.filter(t=>t.done).length;$('progressStat').textContent=data.length?Math.round(data.filter(t=>t.done).length/data.length*100)+'%':'0%';$('taskList').innerHTML=visible.length?visible.map(t=>`<div class="task ${t.done?'done':''}"><input class="check" type="checkbox" ${t.done?'checked':''} data-id="${t.id}" ${!isOwner?'disabled':''}><div><b class="title">${escapeHtml(t.title)}</b><div class="muted">${t.date} • ${t.priority}</div></div><div class="row"><button class="btn" data-del="${t.id}" ${!isOwner?'disabled':''}>Hapus</button></div></div>`).join(''):'<div class="empty">Belum ada aktivitas. Mulai dari satu tugas kecil dulu.</div>'}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]))}
$('taskForm').addEventListener('submit',e=>{e.preventDefault();if(!isOwner)return;const title=$('taskTitle').value.trim();if(!title)return;const data=load();data.unshift({id:Date.now().toString(36),title,priority:$('taskPriority').value,done:false,date:new Date().toLocaleDateString('id-ID')});save(data);e.target.reset();$('taskPriority').value='sedang';render()});
document.addEventListener('click',e=>{const f=e.target.dataset.filter;if(f){filter=f;render()}const del=e.target.dataset.del;if(del&&isOwner){save(load().filter(t=>t.id!==del));render()}});document.addEventListener('change',e=>{if(e.target.matches('.check')&&isOwner){const data=load();const item=data.find(t=>t.id===e.target.dataset.id);if(item)item.done=e.target.checked;save(data);render()}});
$('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='aktivitas-harian-darma.json';a.click();URL.revokeObjectURL(a.href)});render();
</script>
</body>
</html>
PHP;
}

function patch_index_add_activity_link(string $html): string {
    if (strpos($html, 'aktivitas-harian.php') !== false) return $html;
    $desktopNeedle = '<a href="AI/" class="nav-link text-sm font-bold text-accent-300 hover:text-accent-200 transition-colors">GEMU AI</a>';
    $desktopAdd = $desktopNeedle . "\n                        <a href=\"aktivitas-harian.php\" class=\"nav-link text-sm font-bold text-accent-300 hover:text-accent-200 transition-colors\">Aktivitas</a>";
    if (strpos($html, $desktopNeedle) !== false) $html = str_replace($desktopNeedle, $desktopAdd, $html);

    $mobileNeedle = "<i data-lucide=\"edit-3\" class=\"w-4 h-4\"></i> Edit Web
                            </a>";
    $mobileAdd = $mobileNeedle . "\n                            <a href=\"aktivitas-harian.php\" class=\"flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-accent-500/20 text-accent-200 font-semibold rounded-xl border border-accent-500/30 active:bg-accent-500/40 transition-colors text-sm mt-3\">\n                                <i data-lucide=\"calendar-check\" class=\"w-4 h-4\"></i> Aktivitas Harian\n                            </a>";
    if (strpos($html, $mobileNeedle) !== false) $html = str_replace($mobileNeedle, $mobileAdd, $html);
    return $html;
}

function patch_homepage_visual_polish(string $html): string {
    $marker = '/* GEMU AUTONOMOUS VISUAL POLISH */';
    if (strpos($html, $marker) !== false) return $html;
    $css = <<<CSS

        {$marker}
        .gemu-polish-glow{position:relative}
        .hero-gradient .inline-flex,.hero-gradient a{box-shadow:0 16px 45px rgba(14,165,233,.16)}
        .hero-gradient h1 span{filter:drop-shadow(0 10px 28px rgba(56,189,248,.18))}
        #navbar{backdrop-filter:blur(18px)}
        .cert-card,.project-card,.reveal .bg-navy-50{will-change:transform}
        @media(hover:hover){
            .hero-gradient a:hover{transform:translateY(-2px);box-shadow:0 20px 55px rgba(14,165,233,.24)}
            .bg-navy-50:hover{transform:translateY(-3px);transition:transform .25s ease,box-shadow .25s ease;box-shadow:0 16px 36px rgba(16,42,67,.10)}
        }
        @media(max-width:640px){
            .hero-gradient h1{letter-spacing:-.045em}
            .hero-gradient .max-w-3xl{padding-bottom:1rem}
        }
CSS;
    return str_replace("\n    </style>", $css . "\n    </style>", $html);
}

function generic_feature_page(string $request): string {
    $title = safe_text($request, 90);
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    return <<<HTML
<?php
session_start();
\$isOwner = isset(\$_SESSION['user_role']) && strtolower((string)\$_SESSION['user_role']) === 'owner';
?>
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Draft Fitur GEMU</title><style>body{margin:0;font-family:system-ui,sans-serif;background:#071422;color:#eaf6ff}.wrap{max-width:900px;margin:auto;padding:28px}.card{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);border-radius:24px;padding:22px;margin:16px 0}a{color:#7dd3fc}.pill{display:inline-block;padding:6px 10px;border-radius:99px;background:rgba(56,189,248,.14);color:#bae6fd}</style></head>
<body><main class="wrap"><a href="index.php">← Portfolio</a><section class="card"><span class="pill">Draft fitur dari GEMU</span><h1>{$safeTitle}</h1><p>Halaman ini adalah scaffold awal yang dibuat GEMU dari prompt sederhana. Darma bisa approve sebagai pondasi, lalu GEMU dapat mengembangkan detail berikutnya lewat draft edit lanjutan.</p></section><section class="card"><h2>Analisis awal</h2><ol><li>Tujuan fitur perlu jelas untuk pengunjung/owner.</li><li>Data yang disimpan harus aman dan tidak menimpa sistem login.</li><li>Perubahan besar sebaiknya dipisah menjadi halaman/modul agar tidak merusak homepage.</li></ol></section></main></body></html>
HTML;
}

function slug_from_request(string $request): string {
    $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', safe_text($request, 70)), '-'));
    if ($slug === '') $slug = 'fitur-gemu';
    return substr($slug, 0, 42);
}

function generate_analysis_report_page(string $question, array $intent, array $files, array $issues = []): string {
    $safeQuestion = htmlspecialchars($question, ENT_QUOTES, 'UTF-8');
    $safeIntent = htmlspecialchars((string)($intent['intent'] ?? 'generic'), ENT_QUOTES, 'UTF-8');
    $fileLis = '';
    foreach (array_slice($files, 0, 12) as $f) $fileLis .= '<li><code>'.htmlspecialchars($f, ENT_QUOTES, 'UTF-8').'</code></li>';
    $issueLis = '';
    foreach (array_slice($issues, 0, 8) as $i) $issueLis .= '<li><b>'.htmlspecialchars($i['level'] ?? 'info', ENT_QUOTES, 'UTF-8').'</b> — <code>'.htmlspecialchars($i['file'] ?? '-', ENT_QUOTES, 'UTF-8').'</code>: '.htmlspecialchars($i['message'] ?? '-', ENT_QUOTES, 'UTF-8').'</li>';
    if ($issueLis === '') $issueLis = '<li>Belum ada temuan scan langsung pada area ini.</li>';
    return <<<HTML
<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Analisis GEMU</title><style>body{margin:0;font-family:system-ui,sans-serif;background:#071422;color:#eaf6ff}.wrap{width:min(980px,100% - 32px);margin:auto;padding:28px}.card{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);border-radius:24px;padding:20px;margin:14px 0}code{color:#7dd3fc}li{margin:8px 0}.pill{display:inline-block;padding:6px 10px;border-radius:99px;background:rgba(56,189,248,.14);color:#bae6fd}</style></head>
<body><main class="wrap"><a href="index.php" style="color:#7dd3fc">← Portfolio</a><section class="card"><span class="pill">Draft Analisis GEMU</span><h1>Analisis mandiri sebelum edit</h1><p><b>Permintaan:</b> {$safeQuestion}</p><p><b>Intent:</b> {$safeIntent}</p></section><section class="card"><h2>File kandidat</h2><ol>{$fileLis}</ol></section><section class="card"><h2>Temuan scan terkait</h2><ol>{$issueLis}</ol></section><section class="card"><h2>Keputusan aman</h2><p>GEMU belum mengubah website. Draft ini menjadi catatan analisis agar saran tidak kosong. Patch teknis berikutnya tetap harus dibuat kecil, dites, lalu Darma approve dengan tombol ✓.</p></section></main></body></html>
HTML;
}

function patch_navbar_resilience(string $html): string {
    $marker = 'GEMU NAVBAR SELF-HEAL V7';
    if (strpos($html, $marker) !== false) return $html;
    $style = <<<CSS

    /* {$marker}: fallback agar ikon burger dan panel menu tetap terlihat walau CSS/JS lain konflik */
    #site-menu-button.gemu-burger-button{display:inline-flex!important;visibility:visible!important;opacity:1!important}
    #site-side-menu.gemu-side-menu.is-open{transform:translateX(0)!important;visibility:visible!important;pointer-events:auto!important}
    #site-menu-overlay.gemu-menu-overlay.is-open{opacity:1!important;visibility:visible!important;pointer-events:auto!important}
CSS;
    $html = str_replace('</style>', $style."\n</style>", $html);
    $js = <<<JS

    // {$marker}: penanda siap untuk diagnosa GEMU
    window.gemuNavbarReady = true;
    try { btn.style.display = 'inline-flex'; btn.style.visibility = 'visible'; } catch(e) {}
JS;
    $html = str_replace('    window.gemuNavbarClose = function(){ setOpen(false); };', '    window.gemuNavbarClose = function(){ setOpen(false); };'.$js, $html);
    return $html;
}

function patch_homepage_seo(string $html, string $request): string {
    $marker = '<!-- GEMU SEO V7 -->';
    if (strpos($html, $marker) !== false) return $html;
    $meta = $marker."\n    <meta name=\"description\" content=\"Portfolio Darma Alif Rakhaa: fisika, data analysis, Python programming, proyek, sertifikat, dan GEMU AI.\">\n    <meta property=\"og:title\" content=\"Darma Alif Rakhaa — Portfolio\">\n    <meta property=\"og:description\" content=\"Portfolio Darma Alif Rakhaa untuk proyek, sertifikat, pengalaman, dan pembelajaran teknologi.\">";
    if (strpos($html, '<meta name="viewport"') !== false) return preg_replace('/(<meta name="viewport"[^>]*>)/i', '$1' . "\n    " . $meta, $html, 1);
    return str_replace('</head>', $meta."\n</head>", $html);
}

function patch_mobile_performance_css(string $html): string {
    $marker = '/* GEMU MOBILE PERFORMANCE V7 */';
    if (strpos($html, $marker) !== false) return $html;
    $css = <<<CSS

        {$marker}
        img{max-width:100%;height:auto}
        button,a{touch-action:manipulation}
        @media(max-width:640px){
            body{overflow-x:hidden}
            .container,.max-w-7xl{max-width:100%;}
            .nav-link,.gemu-menu-link{min-height:44px}
        }
CSS;
    return str_replace("\n    </style>", $css . "\n    </style>", $html);
}


function patch_footer_resilience(string $footer): string {
    $patched = $footer;
    if (strpos($patched, 'data-gemu-footer-ready') === false) {
        $patched = str_replace('<footer', '<footer data-gemu-footer-ready="1"', $patched);
    }
    if (strpos($patched, 'GEMU footer resilience') === false) {
        $patched .= "\n<!-- GEMU footer resilience: partial footer aman dipanggil ulang. -->\n";
    }
    return $patched;
}

function patch_homepage_polish(string $index): string {
    if (strpos($index, 'gemu-home-polish-v19') !== false) return $index;
    $css = "\n<style id=\"gemu-home-polish-v19\">\n".
           "@media (max-width: 768px){.hero,.home-hero{padding-inline:18px}.hero h1,.home-hero h1{font-size:clamp(42px,16vw,74px)}}\n".
           ".hero,.home-hero{scroll-margin-top:90px}.btn,.button,a[class*=\"btn\"]{transition:transform .18s ease, box-shadow .18s ease}.btn:hover,.button:hover,a[class*=\"btn\"]:hover{transform:translateY(-2px)}\n".
           "</style>\n";
    if (stripos($index, '</head>') !== false) return str_ireplace('</head>', $css.'</head>', $index);
    return $index . $css;
}

function patch_basic_seo(string $index): string {
    if (stripos($index, 'name="description"') !== false) return $index;
    $meta = "\n<meta name=\"description\" content=\"Portfolio Darma Alif Rakhaa: Data Analysis, Python Programming, proyek, sertifikat, dan pengalaman.\">\n";
    if (stripos($index, '</head>') !== false) return str_ireplace('</head>', $meta.'</head>', $index);
    return $meta . $index;
}

function build_smart_website_edits(string $question, array $intent, array $files): array {
    $edits = [];
    $intentName = $intent['intent'] ?? 'generic_improvement';

    if ($intentName === 'daily_activity_feature') {
        $page = generate_daily_activity_page($question);
        $edits[] = stage_website_edit('aktivitas-harian.php', $page, 'GEMU membuat fitur Aktivitas Harian dari prompt sederhana owner.', ['smart_intent'=>$intentName, 'request'=>$question]);
        $nav = @file_get_contents(SITE_ROOT . '/partials/navbar.php');
        if (is_string($nav) && $nav !== '' && strpos($nav, 'aktivitas-harian.php') === false) {
            $patchedNav = str_replace('<a href="<?php echo $gemuBase; ?>/edit/"', '<a href="<?php echo $gemuBase; ?>/aktivitas-harian.php" class="gy-link"><span class="gemu-menu-icon">✅</span><span>Aktivitas</span></a>'."\n".'        <a href="<?php echo $gemuBase; ?>/edit/"', $nav);
            if ($patchedNav !== $nav) $edits[] = stage_website_edit('partials/navbar.php', $patchedNav, 'GEMU menambahkan link Aktivitas Harian ke navbar setelah membuat fitur.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'navbar_fix') {
        $nav = @file_get_contents(SITE_ROOT . '/partials/navbar.php');
        if (is_string($nav) && $nav !== '') {
            $patched = patch_navbar_resilience($nav);
            if ($patched !== $nav) $edits[] = stage_website_edit('partials/navbar.php', $patched, 'GEMU memperbaiki navbar/burger menu dengan patch kecil dan aman.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'footer_fix') {
        $footer = @file_get_contents(SITE_ROOT . '/partials/footer.php');
        if (is_string($footer) && $footer !== '') {
            $patched = patch_footer_resilience($footer);
            if ($patched !== $footer) $edits[] = stage_website_edit('partials/footer.php', $patched, 'GEMU merapikan footer partial dengan patch kecil.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'visual_polish_homepage') {
        $index = @file_get_contents(SITE_ROOT . '/index.php');
        if (is_string($index) && $index !== '') {
            $patched = patch_homepage_polish($index);
            if ($patched !== $index) $edits[] = stage_website_edit('index.php', $patched, 'GEMU merapikan tampilan homepage tanpa mengubah logika inti.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'seo_improvement') {
        $index = @file_get_contents(SITE_ROOT . '/index.php');
        if (is_string($index) && $index !== '') {
            $patched = patch_basic_seo($index);
            if ($patched !== $index) $edits[] = stage_website_edit('index.php', $patched, 'GEMU menambahkan perbaikan SEO dasar pada homepage.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'performance_mobile_audit') {
        $index = @file_get_contents(SITE_ROOT . '/index.php');
        if (is_string($index) && $index !== '') {
            $patched = patch_mobile_performance_css($index);
            if ($patched !== $index) $edits[] = stage_website_edit('index.php', $patched, 'GEMU memperbaiki performa/responsif mobile dengan patch kecil.', ['smart_intent'=>$intentName, 'request'=>$question]);
        }
    } elseif ($intentName === 'new_feature_scaffold') {
        $slug = slug_from_request($question) . '-' . date('Ymd-His') . '.php';
        $edits[] = stage_website_edit($slug, generic_feature_page($question), 'GEMU membuat scaffold fitur baru dari prompt sederhana owner.', ['smart_intent'=>$intentName, 'request'=>$question]);
    }

    return $edits;
}



function smart_website_request(string $question): array {
    global $tasksFile, $logFile;
    $question = normalize_prompt(safe_text($question, 1200));
    $settings = load_gemu_settings();
    $pendingNow = public_staged_edits()['pending'] ?? [];
    if (!empty($settings['block_edit_stacking']) && count($pendingNow) > 0) {
        add_activity('smart-edit', 'Smart edit ditahan karena masih ada draft pending.', ['pending'=>count($pendingNow)]);
        return [
            'message'=>'Aku tahan dulu, Darma. Masih ada '.count($pendingNow).' draft pending. Selesaikan ✓/× dulu supaya proses edit tidak numpuk.',
            'blocked_by_pending'=>true,
            'staged_edits'=>$pendingNow,
            'intent'=>['intent'=>'blocked_pending_edit','confidence'=>0.99,'keywords'=>['anti-numpuk','owner-approval']]
        ];
    }

    [$summary, $issues] = scan_site('smart_edit');
    $history = load_json($logFile, []);
    $intent = smart_prompt_intent($question);
    $files = candidate_files_for($question);
    if (($intent['intent'] ?? '') === 'daily_activity_feature' && !in_array('aktivitas-harian.php', $files, true)) array_unshift($files, 'aktivitas-harian.php');

    $relatedIssues = array_values(array_filter($issues, function($i) use ($files, $question) {
        $f = strtolower($i['file'] ?? '');
        if ($f === '') return false;
        foreach ($files as $cand) if (strpos($f, strtolower($cand)) !== false || strpos(strtolower($cand), basename($f)) !== false) return true;
        return false;
    }));

    $agentReview = gemu_multi_agent_discussion($question, $intent, $files, $relatedIssues, [], 5);
    $edits = [];
    $preScore = (int)($agentReview['score'] ?? 0);
    if ($preScore >= 80 && !empty($agentReview['can_create_draft'])) {
        $edits = build_smart_website_edits($question, $intent, $files);
        if ($edits) {
            $agentReview = gemu_multi_agent_discussion($question, $intent, $files, $relatedIssues, $edits, 5);
            if (((int)($agentReview['score'] ?? 0)) < 80 || !empty($agentReview['hard_blocks'])) {
                foreach ($edits as $edit) reject_staged_edit_by_id((string)($edit['id'] ?? ''), 'Skor agent final di bawah 80 atau ada hard-block setelah review.');
                $edits = [];
            }
        } else {
            $agentReview['no_patch_reason'] = 'Intent belum punya patch teknis aman atau target masih perlu dibuktikan. GEMU tidak lagi membuat laporan HTML sebagai draft website.';
        }
    }

    $task = [
        'id' => bin2hex(random_bytes(4)),
        'title' => safe_text($question, 90),
        'status' => $edits ? 'draft_waiting_owner' : 'analysis_only',
        'intent' => $intent,
        'agent_review'=>$agentReview,
        'files'=>$files,
        'created_at'=>date('Y-m-d H:i:s'),
        'staged_edit_ids'=>array_map(fn($e) => $e['id'] ?? '', $edits),
    ];
    $tasks = load_json($tasksFile, []);
    array_unshift($tasks, $task);
    save_json($tasksFile, array_slice($tasks, 0, 80));

    $analysis = 'Smart edit v19: intent '.($intent['intent'] ?? '-').', skor '.($agentReview['score'] ?? 0).'/100, draft '.count($edits).', file dibaca '.(int)($agentReview['evidence']['files_read'] ?? 0).'.';
    append_brain_event('analysis', $analysis, ['smart_edit'=>$question, 'intent'=>$intent, 'agent_review'=>$agentReview, 'staged'=>count($edits)]);
    if ($edits) {
        queue_suggestion('Draft mandiri siap: '.safe_text($question, 80), 'GEMU membuat '.count($edits).' draft edit. Apply hanya lewat tombol ✓ owner.', ['edits'=>$edits, 'intent'=>$intent, 'agent_score'=>$agentReview['score'] ?? 0]);
    } else {
        queue_suggestion('Analisis agent GEMU: '.safe_text($question, 80), 'Belum dibuat draft karena gate v19 meminta bukti/patch lebih kuat.', ['intent'=>$intent, 'agent_score'=>$agentReview['score'] ?? 0, 'hard_blocks'=>$agentReview['hard_blocks'] ?? []]);
    }
    add_activity('multi-agent', 'GEMU Frontline + Backend + Sistem menyelesaikan diskusi v19.', ['intent'=>$intent['intent'] ?? '', 'score'=>$agentReview['score'] ?? 0, 'drafts'=>count($edits)]);

    $message = "Ringkasan Smart Edit v19\n";
    $message .= "Skor: ".($agentReview['score'] ?? 0)."/100 • keputusan: ".($agentReview['system']['decision_text'] ?? '-')."\n";
    $message .= "File dibaca: ".(int)($agentReview['evidence']['files_read'] ?? 0)." • bukti file: ".(int)($agentReview['evidence']['hit_files'] ?? 0)."\n\n";
    $message .= gemu_agent_review_text($agentReview) . "\n\n";
    if ($edits) {
        $message .= "Draft siap menunggu ✓/×:\n";
        foreach ($edits as $edit) {
            $diff = $edit['diff'] ?? [];
            $message .= "- {$edit['path']} • Δ baris " . ($diff['changed_lines_estimate'] ?? '-') . " • test " . ($edit['quality']['status'] ?? 'tested') . "\n";
        }
        $message .= "\nAku belum mengubah website. Klik ✓ di Reaksi Draft untuk apply bertahap, atau × untuk menolak.";
    } else {
        $why = $agentReview['no_patch_reason'] ?? (($agentReview['hard_blocks'] ?? []) ? implode(' | ', $agentReview['hard_blocks']) : 'Belum ada patch teknis yang aman untuk intent ini.');
        $message .= "Belum ada tombol approve karena: ".$why;
    }
    append_owner_chat('gemu', $message, ['source'=>'smart_edit_v19', 'agent_review'=>$agentReview]);

    return ['message'=>$message, 'task'=>$task, 'summary'=>$summary, 'issues'=>$relatedIssues, 'analysis'=>$analysis, 'intent'=>$intent, 'agent_review'=>$agentReview];
}



function analyze_owner_request(string $question): array {
    global $tasksFile, $logFile, $memoryFile;
    $question = normalize_prompt(safe_text($question, 1200));
    [$summary, $issues] = scan_site('analysis');
    $history = load_json($logFile, []);
    array_unshift($history, ['summary'=>$summary, 'issues'=>$issues, 'source'=>'owner-analysis']);
    $history = array_slice($history, 0, 40);
    save_json($logFile, $history);

    $files = candidate_files_for($question);
    $fileNotes = [];
    foreach ($files as $file) {
        $txt = file_excerpt($file, 1800);
        $fileNotes[] = ['file'=>$file, 'bytes'=>strlen($txt), 'hint'=> $txt === '' ? 'File belum bisa dibaca atau kosong.' : 'File relevan terbaca untuk dianalisis.'];
    }

    $relatedIssues = array_values(array_filter($issues, function($i) use ($files, $question) {
        $f = strtolower((string)($i['file'] ?? ''));
        foreach ($files as $cand) if (strpos($f, strtolower($cand)) !== false || strpos(strtolower($cand), $f) !== false) return true;
        if (preg_match('/hiragana|katakana/i', $question) && preg_match('/hiragana|katakana|bahasa-jepang/i', $f)) return true;
        if (preg_match('/navbar|mobile|burger/i', $question) && preg_match('/index\.php|app\.js|data\.js|partials\/navbar\.php|partials\/footer\.php/i', $f)) return true;
        return false;
    }));

    $next = [];
    if (preg_match('/perbaiki|fix|bug|eror|error/i', $question)) $next[] = 'Baca file kandidat paling relevan, lalu buat patch kecil hanya pada bagian yang salah.';
    if (preg_match('/edit|ubah|tambah|tambahkan|rata|tengah/i', $question)) $next[] = 'Siapkan perubahan, tampilkan isi final, jalankan test otomatis, lalu tunggu tombol ✓ owner sebelum menulis file.';
    if (preg_match('/belajar|kenapa|internet|search|cari/i', $question)) $next[] = 'Cari jawaban ringkas dari internet, simpan inti ilmunya ke otak GEMU, lalu ringkas bila memori penuh.';
    if (!$next) $next[] = 'Simpan sebagai draft analisis dan tunggu instruksi lanjutan dari owner.';

    $agentReview = null;
    if (is_agent_dialogue_prompt($question)) {
        $agentIntent = smart_prompt_intent($question);
        $agentReview = gemu_multi_agent_discussion($question, $agentIntent, $files, $relatedIssues, [], 6);
    }

    $task = [
        'id'=>bin2hex(random_bytes(5)),
        'task'=>$question,
        'status'=>'analysis-ready',
        'time'=>date('Y-m-d H:i:s'),
        'files'=>$files,
        'related_issues'=>array_slice($relatedIssues,0,12),
        'backup'=>$summary['backup'] ?? null,
        'next'=>$next,
        'agent_review'=>$agentReview
    ];
    $tasks = load_json($tasksFile, []);
    array_unshift($tasks, $task);
    $tasks = array_slice($tasks, 0, 90);
    save_json($tasksFile, $tasks);
    append_brain_event('analysis', $question, ['files'=>$files, 'issues'=>count($relatedIssues)]);
    queue_suggestion('Analisis update: '.safe_text($question, 80), 'File kandidat: '.implode(', ', array_slice($files, 0, 6)).'. GEMU boleh menyiapkan draft edit, tetapi penerapan ke website tetap wajib tombol ✓ owner Darma.', ['task_id'=>$task['id']]);

    $message = "Oke Darma, ini ringkasnya.\n";
    $message .= "Backup: ".(($summary['backup']['path'] ?? 'sudah dibuat'))." ✅\n";
    $message .= "Scan: {$summary['checked_files']} file, {$summary['issues_total']} temuan, {$summary['danger_total']} bahaya.\n";
    $message .= "File kandidat:\n- ".implode("\n- ", $files)."\n";
    if ($relatedIssues) {
        $message .= "\nTemuan terkait:\n";
        foreach (array_slice($relatedIssues,0,4) as $issue) $message .= "- {$issue['level']} • {$issue['file']} — {$issue['message']}\n";
    }
    $message .= "\nLangkah aman:\n- ".implode("\n- ", $next)."\n\n";
    $message .= "Aku belum menulis file. Aku boleh lanjut menyiapkan draft edit/staging, tapi penerapan ke website tetap menunggu tombol ✓ owner Darma. Balas: baca file {$files[0]} jika mau lanjut cek isi file.";
    if ($agentReview) $message .= "
" . gemu_agent_review_text($agentReview);
    append_owner_chat('gemu', $message, ['source'=>'analyze', 'agent_review'=>$agentReview]);
    add_activity('analysis', 'Analisis owner dibuat: '.$question, ['files'=>count($files), 'issues'=>count($relatedIssues)]);

    return ['message'=>$message, 'task'=>$task, 'summary'=>$summary, 'issues'=>array_slice($relatedIssues,0,25), 'files'=>$fileNotes, 'agent_review'=>$agentReview];
}

function dir_size(string $dir): int {
    if (!is_dir($dir)) return 0;
    $size = 0;
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) if ($file->isFile()) $size += (int)$file->getSize();
    return $size;
}

function safe_upload_name(string $name): string {
    $name = basename(str_replace('\\', '/', $name));
    $name = preg_replace('/[^A-Za-z0-9._ -]+/', '_', $name);
    $name = preg_replace('/\s+/', '_', trim($name));
    return $name ?: ('file_'.bin2hex(random_bytes(4)));
}

function summarize_uploaded_file(string $path, string $ext, string $name): string {
    $summary = 'File '.$name.' disimpan.';
    $textLike = ['txt','md','json','csv','log','xml','html','css'];
    if (in_array($ext, $textLike, true)) {
        $txt = @file_get_contents($path, false, null, 0, 2600);
        if (is_string($txt) && trim($txt) !== '') $summary = 'Ringkasan awal '.$name.': '.safe_text($txt, 900);
    } elseif (in_array($ext, ['jpg','jpeg','png','gif','webp','svg'], true)) {
        $summary = 'Gambar '.$name.' disimpan sebagai referensi visual. Detail gambar perlu dibuka manual jika ingin dianalisis.';
    } elseif (in_array($ext, ['pdf','doc','docx','xls','xlsx','ppt','pptx'], true)) {
        $summary = 'Dokumen '.$name.' disimpan. GEMU mencatat metadata; isi detail bisa diringkas manual dari file jika dibutuhkan.';
    }
    return safe_text($summary, 1200);
}

function handle_upload_files(): array {
    global $fileBrainDir, $fileIndexFile;
    ensure_protection($fileBrainDir);
    $files = $_FILES['files'] ?? null;
    if (!$files) out(false, ['message'=>'Tidak ada file yang diterima.'], 400);

    $list = [];
    $count = is_array($files['name']) ? count($files['name']) : 1;
    for ($i=0; $i<$count; $i++) {
        $list[] = [
            'name' => is_array($files['name']) ? $files['name'][$i] : $files['name'],
            'tmp_name' => is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'],
            'error' => is_array($files['error']) ? $files['error'][$i] : $files['error'],
            'size' => is_array($files['size']) ? (int)$files['size'][$i] : (int)$files['size'],
            'type' => is_array($files['type']) ? $files['type'][$i] : $files['type'],
        ];
    }

    $currentSize = dir_size($fileBrainDir);
    $incomingSize = array_sum(array_map(fn($f) => (int)$f['size'], $list));
    if ($currentSize + $incomingSize > GEMU_FILE_BRAIN_LIMIT) {
        $index = load_json($fileIndexFile, []);
        $summaries = [];
        foreach (array_slice($index, 0, 18) as $item) $summaries[] = ($item['name'] ?? 'file').' — '.($item['summary'] ?? 'tanpa ringkasan');
        $msg = 'Ruang file AI melewati 1GB. Aku belum upload file baru. Aku bisa meringkas file lama dulu, lalu Darma pilih mana yang boleh dihapus. Ringkasan lama: '.safe_text(implode(' | ', $summaries), 1800);
        queue_suggestion('Ruang file AI hampir penuh', $msg, ['current'=>$currentSize, 'incoming'=>$incomingSize]);
        append_owner_chat('gemu', $msg, ['source'=>'upload-limit']);
        out(false, ['message'=>$msg, 'current_size'=>$currentSize, 'incoming_size'=>$incomingSize], 413);
    }

    $blockedExt = ['php','phtml','phar','cgi','pl','htaccess','exe','sh','bat','cmd'];
    $saved = [];
    $index = load_json($fileIndexFile, []);
    foreach ($list as $file) {
        if ((int)$file['error'] !== UPLOAD_ERR_OK) {
            $saved[] = ['name'=>$file['name'], 'ok'=>false, 'message'=>'Upload error code '.$file['error']];
            continue;
        }
        $original = safe_upload_name($file['name']);
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (in_array($ext, $blockedExt, true)) {
            $saved[] = ['name'=>$original, 'ok'=>false, 'message'=>'Ekstensi ini diblokir demi keamanan.'];
            continue;
        }
        $folder = $fileBrainDir . '/' . date('Ymd');
        ensure_protection($folder);
        $targetName = date('His') . '_' . bin2hex(random_bytes(3)) . '_' . $original;
        $target = $folder . '/' . $targetName;
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            $saved[] = ['name'=>$original, 'ok'=>false, 'message'=>'Gagal memindahkan file.'];
            continue;
        }
        @chmod($target, 0600);
        $hash = hash_file('sha256', $target);
        $summary = summarize_uploaded_file($target, $ext, $original);
        $rel = 'AI/file-brain/' . date('Ymd') . '/' . $targetName;
        $item = [
            'id'=>bin2hex(random_bytes(6)),
            'name'=>$original,
            'stored_as'=>$rel,
            'bytes'=>(int)$file['size'],
            'human_size'=>bytes_human((int)$file['size']),
            'mime'=>safe_text($file['type'], 120),
            'ext'=>$ext,
            'sha256'=>$hash,
            'summary'=>$summary,
            'time'=>date('Y-m-d H:i:s'),
            'ts'=>time()
        ];
        array_unshift($index, $item);
        $saved[] = ['name'=>$original, 'ok'=>true, 'stored_as'=>$rel, 'size'=>bytes_human((int)$file['size']), 'summary'=>$summary];
        append_brain_event('owner', 'Upload file owner: '.$original, ['file'=>$item]);
        add_activity('upload', 'File owner diupload: '.$original, ['size'=>$file['size']]);
    }
    $index = array_slice($index, 0, 500);
    save_json($fileIndexFile, $index);
    return ['message'=>'Upload diproses. File yang berhasil masuk ke otak file GEMU tidak memerlukan konfirmasi tambahan.', 'files'=>$saved, 'total_storage'=>dir_size($fileBrainDir), 'limit'=>GEMU_FILE_BRAIN_LIMIT];
}

if ($action === 'public_chat' || $action === 'public_search') {
    $q = (string)($body['message'] ?? $body['query'] ?? '');
    $reply = public_reply($q);
    out(true, $reply);
}

require_owner_token($body);

if ($action === 'settings_get') {
    out(true, ['settings'=>load_gemu_settings()]);
}

if ($action === 'settings_save') {
    $settings = save_gemu_settings((array)($body['settings'] ?? []));
    out(true, ['message'=>'Setting khusus GEMU sudah disimpan. Prompt ini ikut dipakai sebagai arahan lokal GEMU.', 'settings'=>$settings]);
}

if ($action === 'security_audit') {
    $result = security_audit_scan();
    append_owner_chat('gemu', $result['message'], ['source'=>'security-audit']);
    out(true, $result);
}

if ($action === 'owner_chat_add') {
    $who = (string)($body['who'] ?? 'gemu');
    $text = (string)($body['text'] ?? '');
    append_owner_chat($who === 'owner' ? 'owner' : 'gemu', $text, ['source'=>'ui']);
    out(true, ['message'=>'Chat tersimpan.']);
}

if ($action === 'chat_history') {
    $chat = load_json($chatFile, []);
    out(true, ['chat'=>array_slice($chat, -400)]);
}

if ($action === 'chat_clear') {
    save_json($chatFile, []);
    add_activity('chat', 'Chat owner dibersihkan. Otak dan file tidak dihapus.');
    out(true, ['message'=>'Chat owner sudah dibersihkan. Otak, memori, file, dan ringkasan tetap aman.']);
}

if ($action === 'activity_logs') {
    agent_page_pulse();
    $idleDialogue = load_json(AI_DIR . '/agents/idle-dialogue.json', []);
    $feed = agent_feed_read();
    out(true, ['logs'=>activity_logs(), 'idle_dialogue'=>array_slice($idleDialogue, 0, 20), 'agent_feed'=>$feed, 'agent_thoughts'=>agent_feed_thoughts($feed), 'retention_seconds'=>GEMU_LOG_RETENTION_SECONDS]);
}

if ($action === 'scan') {
    [$summary, $issues] = scan_site('scan');
    $history = load_json($logFile, []);
    array_unshift($history, ['summary' => $summary, 'issues' => $issues, 'source'=>'owner-scan']);
    $history = array_slice($history, 0, 40);
    save_json($logFile, $history);
    append_brain_event('analysis', 'Scan website otomatis', ['issues'=>count($issues), 'backup'=>$summary['backup']['path'] ?? '']);
    out(true, ['summary' => $summary, 'issues' => $issues]);
}

if ($action === 'memory_add') {
    $note = safe_text($body['note'] ?? '', 1600);
    if ($note === '') out(false, ['message' => 'Catatan kosong.']);
    $memory = load_json($memoryFile, []);
    array_unshift($memory, ['text' => $note, 'time' => date('Y-m-d H:i:s'), 'ts'=>time()]);
    $memory = array_slice($memory, 0, 220);
    save_json($memoryFile, $memory);
    append_brain_event('owner', $note);
    add_activity('memory', 'Memori owner baru disimpan.', ['length'=>strlen($note)]);
    out(true, ['message' => 'GEMU sudah menyimpan catatan baru tanpa perlu konfirmasi tambahan.', 'memory' => $memory]);
}

if ($action === 'memory_compact') {
    compact_brain_if_needed();
    add_activity('memory', 'Owner meminta ringkas otak GEMU.');
    out(true, ['message'=>'Otak GEMU sudah dicek dan diringkas jika melewati batas.']);
}

if ($action === 'memory_list' || $action === 'brain') {
    $brain = normalize_brain(load_json($brainFile, default_brain()));
    $files = load_json($fileIndexFile, []);
    $suggestions = suggestion_state();
    out(true, [
        'memory' => load_json($memoryFile, []),
        'brain' => $brain,
        'tasks' => load_json($tasksFile, []),
        'scan_history' => array_slice(load_json($logFile, []), 0, 8),
        'files' => array_slice($files, 0, 80),
        'file_storage' => ['used'=>dir_size($fileBrainDir), 'limit'=>GEMU_FILE_BRAIN_LIMIT, 'human_used'=>bytes_human(dir_size($fileBrainDir)), 'human_limit'=>'1 GB'],
        'suggestions' => $suggestions,
        'staged_edits' => public_staged_edits(),
        'autonomy' => autonomy_state(),
        'activity_logs' => activity_logs(),
        'agent_feed' => agent_feed_read(),
        'agent_thoughts' => agent_feed_thoughts(),
        'settings' => load_gemu_settings(),
        'process_lock' => gemu_process_lock_status(),
        'agent_session' => gemu_agent_session(),
        'agent_memories' => gemu_agent_memories(),
        'agent_decisions' => public_agent_decisions(),
        'reports_cleanup' => cleanup_old_reports(7, 10)
    ]);
}

if ($action === 'search' || $action === 'internet_learn') {
    $q = safe_text($body['query'] ?? '', 220);
    if ($q === '') out(false, ['message' => 'Kata kunci pencarian kosong.']);
    $router = gemu_reasoning_router($q, 'owner');
    if ($action === 'search' && ($router['tool'] ?? '') !== 'internet') {
        $result = concise_local_reply($q, 'owner');
        append_owner_chat('gemu', $result['message'], ['source'=>'router-local-search', 'router'=>$router]);
        out(true, ['query'=>$q] + $result);
    }
    $result = learn_from_internet($q, 'owner');
    append_owner_chat('gemu', $result['message'], ['source'=>'internet']);
    out(true, ['query'=>$q] + $result);
}

if ($action === 'folder_open') {
    $q = safe_text($body['query'] ?? '', 300);
    $result = local_folder_browse_reply($q);
    append_owner_chat('gemu', $result['message'], ['source'=>'folder-open']);
    out(true, $result);
}

if ($action === 'reports_cleanup') {
    $cleanup = cleanup_old_reports(7, 10);
    add_activity('reports-cleanup', 'Owner menjalankan cleanup laporan GEMU manual.', $cleanup);
    out(true, ['message'=>'Cleanup laporan GEMU selesai. Laporan root dipindahkan ke AI/reports dan laporan lama/duplikat dibersihkan.', 'cleanup'=>$cleanup]);
}

if ($action === 'storage_audit') {
    $q = safe_text($body['query'] ?? '', 300);
    $result = storage_audit_reply($q);
    append_owner_chat('gemu', $result['message'], ['source'=>'storage-audit']);
    out(true, $result);
}

if ($action === 'owner_reply') {
    $q = safe_text($body['message'] ?? '', 900);
    if ($q === '') out(false, ['message'=>'Pesan kosong.']);
    if (preg_match('/\bingat(?:an)?\b/i', $q)) {
        $_note = preg_replace('/^\s*(gemu|tolong|please)?\s*(ingat(?:an|kan)?|simpan\s+ingatan|buat\s+ingatan|tambahkan\s+ingatan)\s*[:,-]?\s*/i', '', $q);
        $_note = safe_text($_note !== '' ? $_note : $q, 1800);
        $memory = load_json($memoryFile, []);
        array_unshift($memory, ['text'=>$_note, 'time'=>date('Y-m-d H:i:s'), 'ts'=>time()]);
        save_json($memoryFile, array_slice($memory,0,220));
        append_brain_event('owner', $_note);
        add_activity('memory', 'Memori owner baru disimpan lewat fallback owner_reply.', ['length'=>strlen($_note)]);
        out(true, ['message'=>'Siap Darma. Ini kusimpan sebagai memori, bukan audit/storage ✅']);
    }
    $result = concise_local_reply($q, 'owner');
    append_owner_chat('gemu', $result['message'], ['source'=>'owner-reply']);
    add_activity('chat', 'GEMU menjawab owner secara ringkas.', ['question'=>safe_text($q,100)]);
    out(true, $result);
}

if ($action === 'task_add') {
    $taskText = safe_text($body['task'] ?? '', 1400);
    if ($taskText === '') out(false, ['message'=>'Tugas kosong.']);
    $tasks = load_json($tasksFile, []);
    $id = bin2hex(random_bytes(5));
    array_unshift($tasks, ['id'=>$id, 'task'=>$taskText, 'status'=>'draft', 'time'=>date('Y-m-d H:i:s'), 'ts'=>time()]);
    $tasks = array_slice($tasks, 0, 90);
    save_json($tasksFile, $tasks);
    append_brain_event('analysis', 'Draft tugas: '.$taskText);
    queue_suggestion('Draft update website', $taskText, ['task_id'=>$id]);
    add_activity('task', 'Draft tugas update disimpan.', ['task_id'=>$id]);
    out(true, ['message'=>'Tugas update sudah masuk daftar GEMU dan digabung ke laporan saran 2 jam.', 'tasks'=>$tasks]);
}

if ($action === 'suggestions_digest') {
    $force = !empty($body['force']);
    out(true, build_suggestion_digest($force));
}


if ($action === 'autonomous_cycle') {
    $reason = !empty($body['force']) ? 'manual_force' : 'manual';
    out(true, run_autonomous_cycle($reason));
}
if ($action === 'sandbox_stress_test') {
    $q = safe_text($body['message'] ?? '', 500);
    out(true, gemu_run_sandbox_stress_test($q));
}

