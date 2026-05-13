<?php
if ($action === 'staged_edits') {
    out(true, ['staged_edits'=>public_staged_edits(), 'agent_decisions'=>public_agent_decisions(), 'autonomy'=>autonomy_state()]);
}

if ($action === 'agent_dialogue') {
    $question = safe_text($body['question'] ?? '', 1400);
    if ($question === '') out(false, ['message'=>'Prompt diskusi agent kosong.'], 400);
    out(true, gemu_agent_dialogue_request($question));
}

if ($action === 'smart_edit') {
    $question = safe_text($body['question'] ?? '', 1200);
    if ($question === '') out(false, ['message'=>'Prompt kosong. Tulis permintaan sederhana, contoh: Gemu tambahkan fitur aktivitas harian.'], 400);
    out(true, smart_website_request($question));
}

if ($action === 'stage_edit') {
    $path = (string)($body['path'] ?? '');
    $content = (string)($body['content'] ?? '');
    $reason = safe_text($body['reason'] ?? 'Owner/GEMU menyiapkan draft edit website', 420);
    if ($path === '') out(false, ['message'=>'Path file kosong.'], 400);
    if ($content === '') out(false, ['message'=>'Konten draft kosong.'], 400);
    $edit = stage_website_edit($path, $content, $reason, ['source'=>'stage_edit_action']);
    out(true, ['message'=>'Draft edit disimpan. GEMU belum menulis file website. Terapkan hanya jika Darma klik tombol ✓ approve.', 'staged_edit'=>$edit]);
}

if ($action === 'apply_staged_edit') {
    $id = safe_text($body['id'] ?? '', 80);
    $approved = !empty($body['approved']);
    if ($id === '') out(false, ['message'=>'ID draft edit kosong.'], 400);
    $edit = apply_staged_edit_by_id($id, $approved);
    out(true, ['message'=>'Draft edit berhasil diterapkan ke website lewat tombol ✓ owner, dengan backup otomatis dan test ulang.', 'staged_edit'=>$edit]);
}

if ($action === 'reject_staged_edit') {
    $id = safe_text($body['id'] ?? '', 80);
    $reason = safe_text($body['reason'] ?? '', 300);
    if ($id === '') out(false, ['message'=>'ID draft edit kosong.'], 400);
    $edit = reject_staged_edit_by_id($id, $reason);
    out(true, ['message'=>'Draft edit sudah ditolak/dibuang dari daftar pending.', 'staged_edit'=>$edit]);
}

if ($action === 'approve_agent_decision') {
    $id = safe_text($body['id'] ?? '', 80);
    if ($id === '') out(false, ['message'=>'ID keputusan agent kosong.'], 400);
    $decision = resolve_agent_decision($id, true, 'Disetujui lewat tombol ✓ owner.');
    out(true, ['message'=>'Keputusan agent disetujui. GEMU akan memakai arahan ini untuk proses berikutnya, tapi edit website tetap harus staged-edit dan butuh ✓ lagi bila menyentuh file.', 'decision'=>$decision]);
}

if ($action === 'reject_agent_decision') {
    $id = safe_text($body['id'] ?? '', 80);
    $reason = safe_text($body['reason'] ?? '', 300);
    if ($id === '') out(false, ['message'=>'ID keputusan agent kosong.'], 400);
    $decision = resolve_agent_decision($id, false, $reason ?: 'Ditolak lewat tombol × owner.');
    out(true, ['message'=>'Keputusan agent ditolak. Website tidak diubah dan GEMU tidak akan menjalankan rencana itu.', 'decision'=>$decision]);
}

if ($action === 'file_read') {
    [$rel, $full] = resolve_safe_path((string)($body['path'] ?? ''));
    if (!is_file($full)) out(false, ['message'=>'File tidak ditemukan: '.$rel], 404);
    $content = file_get_contents($full);
    append_brain_event('analysis', 'Owner membaca file '.$rel);
    add_activity('file', 'Owner membaca file: '.$rel, ['size'=>strlen($content)]);
    out(true, ['path'=>$rel, 'content'=>$content, 'size'=>strlen($content)]);
}

if ($action === 'file_write') {
    [$rel, $full] = resolve_safe_path((string)($body['path'] ?? ''));
    $content = (string)($body['content'] ?? '');
    if (strlen($content) > 900000) out(false, ['message'=>'Konten terlalu besar untuk diedit lewat GEMU.'], 400);
    $edit = stage_website_edit($rel, $content, 'Draft dari perintah tulis file. GEMU tidak menulis langsung; menunggu tombol ✓ owner Darma.', ['source'=>'file_write_always_staged']);
    out(true, ['message'=>'Perintah tulis file sudah disimpan sebagai draft edit. Website belum ditulis. Klik ✓ Setujui di panel owner untuk menerapkan, atau × Tolak untuk membuang.', 'requires_approval'=>true, 'staged_edit'=>$edit]);
}

if ($action === 'upload_files') {
    out(true, handle_upload_files());
}

if ($action === 'file_brain') {
    $files = load_json($fileIndexFile, []);
    out(true, ['files'=>array_slice($files, 0, 200), 'storage'=>['used'=>dir_size($fileBrainDir), 'limit'=>GEMU_FILE_BRAIN_LIMIT, 'human_used'=>bytes_human(dir_size($fileBrainDir)), 'human_limit'=>'1 GB']]);
}

if ($action === 'diagnose' || $action === 'analyze') {
    $question = safe_text($body['question'] ?? '', 1400);
    if ($question === '') out(false, ['message'=>'Perintah analisis kosong.']);
    out(true, analyze_owner_request($question));
}


if ($action === 'agent_pulse') {
    agent_page_pulse();
    $feed = agent_feed_read();
    out(true, ['agent_feed'=>$feed, 'agent_thoughts'=>agent_feed_thoughts($feed)]);
}

out(false, ['message' => 'Aksi tidak dikenal.']);
?>
