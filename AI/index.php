<?php
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

$isOwner = isset($_SESSION['user_role']) && strtolower((string)$_SESSION['user_role']) === 'owner' && stripos((string)($_SESSION['user_name'] ?? ''), 'darma') !== false;
$ownerName = $_SESSION['user_name'] ?? '';
if (!$isOwner) {
    http_response_code(403);
    ?>
    <!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GEMU AI — Owner Only</title><link rel="stylesheet" href="gemu.css?v=<?php echo time(); ?>"></head>
    <body class="blocked"><main class="blocked-card"><h1>GEMU AI terkunci 🔐</h1><p>Halaman ini hanya untuk akun OWNER bernama Darma. Untuk pengunjung biasa, pakai bubble chat GEMU di pojok kanan bawah website.</p><a href="../">Kembali ke website</a></main></body></html>
    <?php exit;
}
if (empty($_SESSION['gemu_ai_token'])) $_SESSION['gemu_ai_token'] = bin2hex(random_bytes(24));
$token = $_SESSION['gemu_ai_token'];
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>GEMU AI — Owner Brain</title>
    <link rel="stylesheet" href="gemu.css?v=<?php echo filemtime(__DIR__.'/gemu.css'); ?>">
</head>
<body>
    <main class="gemu-shell" data-token="<?php echo htmlspecialchars($token, ENT_QUOTES); ?>">
        <section class="gemu-hero">
            <div>
                <p class="eyebrow">OWNER MODE • GEMU BRAIN</p>
                <h1>GEMU AI</h1>
                <p class="subtitle">Asisten Darma dengan router lokal: bisa memahami prompt sederhana, audit storage/backup, membaca konteks website, menganalisis kebutuhan, membuat draft program, belajar, mengamati, dan memberi saran. File website baru berubah setelah owner Darma klik tombol ✓ approve; tombol × menolak draft.</p>
            </div>
            <div class="hero-tools"><a class="home-link" href="../">← Home</a><div class="owner-pill"><span class="dot"></span><span>Prioritas owner: <?php echo htmlspecialchars($ownerName ?: 'Darma'); ?></span></div></div>
        </section>

        <button class="mobile-nav-btn" type="button" id="mobile-nav-btn">☰ Panel GEMU</button>
        <section class="gemu-workspace" id="gemu-workspace">
        <section class="quick-actions" id="quick-actions" aria-label="Aksi Cepat GEMU">
            <button class="action-card" data-action="home"><b>Home</b><span>Kembali cepat ke halaman utama website.</span></button>
            <button class="action-card" data-action="scan"><b>Scan + Backup</b><span>Backup otomatis dan cek ringan file website.</span></button>
            <button class="action-card" data-action="brain"><b>Otak GEMU</b><span>Lihat memori, file brain, log, dan tugas update.</span></button>
            <button class="action-card" data-action="memory"><b>Ajari GEMU</b><span>Simpan instruksi owner tanpa konfirmasi tambahan.</span></button>
            <button class="action-card" data-action="upload"><b>Upload File</b><span>Simpan gambar/dokumen ke file brain owner.</span></button>
            <button class="action-card" data-action="digest"><b>Laporan Saran</b><span>Kumpulkan saran update agar tidak spam request.</span></button>
            <button class="action-card" data-action="autonomy"><b>Mode Mandiri</b><span>GEMU aktif cek, belajar, dan menyiapkan draft tanpa menulis file.</span></button>
            <button class="action-card" data-action="smart"><b>Smart Edit</b><span>Contoh: “Gemu tambahkan fitur aktivitas harian”.</span></button>
            <button class="action-card" data-action="staged"><b>Draft Edit</b><span>Lihat perubahan website yang menunggu ✓/× Darma.</span></button>
            <button class="action-card" data-action="voice"><b>Voice Command</b><span>Gunakan suara untuk memberi perintah.</span></button>
            <button class="action-card" data-action="settings"><b>Setting GEMU</b><span>Muat prompt dan aturan khusus otak GEMU.</span></button>
            <button class="action-card" data-action="security"><b>Security Audit</b><span>Cek celah SQL, XSS, upload, header, dan fungsi berisiko.</span></button>
            <button class="action-card" data-action="clear"><b>Bersihkan Chat</b><span>Chat jadi baru, otak/file/memori tetap aman.</span></button>
        </section>

        <section class="gemu-grid">
            <div class="chat-panel">
                <div class="chat-header">
                    <div><b>Ruang Komando Owner</b><span>Contoh: “Gemu edit halaman website Darma agar lebih menarik” • “Gemu tambahkan fitur aktivitas harian” • “cari file besar” • “analisis bug hiragana”</span></div>
                    <div class="chat-actions">
                        <button id="speak-toggle" class="tiny-btn" type="button">🔊 Suara: ON</button>
                        <button id="digest-btn" class="tiny-btn" type="button">📝 Saran</button>
                        <button id="settings-btn" class="tiny-btn" type="button">⚙️ Setting</button>
                        <button id="security-btn" class="tiny-btn" type="button">🛡️ Audit</button>
                        <button id="clear-chat-btn" class="tiny-btn" type="button">🧹 Chat</button>
                    </div>
                </div>
                <div id="chat-log" class="chat-log" aria-live="polite"></div>
                <div id="draft-reaction-dock" class="draft-reaction-dock">Belum ada draft pending.</div>
                <form id="chat-form" class="chat-form">
                    <button id="voice-btn" type="button" title="Voice command">🎙️</button>
                    <button id="upload-btn" type="button" title="Upload file">📎</button>
                    <input id="file-input" type="file" multiple hidden>
                    <textarea id="chat-input" rows="1" autocomplete="off" placeholder="Tulis perintah sederhana untuk GEMU..."></textarea>
                    <button type="submit">Kirim</button>
                </form>
                <div id="settings-modal" class="settings-modal" hidden>
                    <div class="settings-card" role="dialog" aria-modal="true" aria-label="Setting GEMU">
                        <div class="settings-head"><b>⚙️ Setting Khusus GEMU</b><button id="settings-close-btn" type="button">×</button></div>
                        <label>Prompt/aturan khusus GEMU</label>
                        <textarea id="settings-prompt" rows="7" placeholder="Contoh: kalau ada kata ingat, simpan ke memori. Jawab ringkas dan lokal dulu..."></textarea>
                        <div class="settings-grid">
                            <label>Gaya jawaban<select id="settings-style"><option value="ringkas_rapi">Ringkas & rapi</option><option value="normal">Normal</option><option value="detail_teknis">Detail teknis</option></select></label>
                            <label>Level keamanan<select id="settings-security-level"><option value="complex">Complex audit</option><option value="basic">Basic audit</option></select></label>
                        </div>
                        <label class="check-row"><input id="settings-local-first" type="checkbox"> Router lokal dulu sebelum internet</label>
                        <label class="check-row"><input id="settings-block-stack" type="checkbox"> Kunci proses edit supaya draft tidak numpuk</label>
                        <button id="settings-save-btn" class="settings-save" type="button">Simpan Setting GEMU</button>
                    </div>
                </div>
            </div>

            <aside class="status-panel">
                <h2>Status Sistem</h2>
                <div id="status-box" class="status-box">Belum ada scan. Klik <b>Scan + Backup</b> dulu ya 😄</div>


                <h2>3 Role Agent GEMU</h2>
                <div class="agent-board" id="agent-board">
                    <div class="agent-card"><b>🧭 GEMU Sistem</b><span>Skor, keputusan, approve owner, anti-numpuk.</span></div>
                    <div class="agent-card"><b>💬 GEMU Frontline</b><span>Bahasa natural, UI/UX, mode tamu, ringkas.</span></div>
                    <div class="agent-card"><b>🛠️ GEMU Backend</b><span>File, PHP/JS, security, backup, rollback, test.</span></div>
                </div>

                <h2>Otak & Memori</h2>
                <div id="memory-box" class="memory-box">Memuat catatan...</div>

                <h2>File Brain Owner</h2>
                <div id="file-box" class="file-box">Belum ada file yang dimuat.</div>

                <h2>Mode Mandiri & Draft Edit</h2>
                <div id="autonomy-box" class="autonomy-box">Mode mandiri belum dimuat.</div>

                <h2>Log Aktivitas</h2>
                <div id="activity-box" class="activity-box">Log akan muncul di sini dan otomatis bersih setelah 1 jam.</div>

                <h2>Terminal Aktif</h2>
                <div id="terminal-box" class="terminal-box">Terminal memantau aktivitas GEMU tiap 5 detik dan hanya menampilkan 5 menit terakhir.</div>

                <h2>Aturan Aman GEMU</h2>
                <div class="safe-note">
                    <b>Memori/ilmu/file:</b> boleh ditambahkan tanpa konfirmasi tambahan.<br>
                    <b>Edit website:</b> GEMU boleh memahami prompt sederhana, membuat analisis mendalam, dan menyiapkan draft program sendiri. File website hanya ditulis setelah owner Darma klik ✓ approve. Tombol × menolak draft tanpa mengubah website.<br>
                    <b>Router lokal:</b> pertanyaan file/storage/backup diaudit lokal; pertanyaan website dibaca dari file; internet dipakai jika diminta jelas.<br>
                    <b>Saran update:</b> dikumpulkan menjadi laporan per 2 jam agar tidak spam, tetapi draft edit tetap menunggu keputusan Darma.<br>
                    <b>Laporan GEMU:</b> disimpan di <code>AI/reports/</code>, bukan root public_html, lalu auto-cleanup: maksimal 10 laporan terbaru dan usia 7 hari.
                </div>

                <h2>Smart Edit Aman</h2>
                <div class="safe-note">
                    <b>Prompt sederhana:</b> <code>Gemu tambahkan fitur aktivitas harian</code><br>
                    <b>Prompt tampilan:</b> <code>Gemu edit halaman website Darma agar lebih menarik</code><br>
                    <b>Baca manual:</b> <code>baca file data.js</code><br>
                    GEMU boleh membuat draft program sendiri. Saat Darma klik ✓, GEMU test ulang, backup file lama ke <code>AI/backups/</code>, lalu menulis file. Klik × untuk menolak tanpa ketik manual.
                </div>

                <h2>Cron Berkala</h2>
                <div class="safe-note">
                    Supaya mode mandiri berjalan saat halaman tidak dibuka, buat Cron Job cPanel:<br>
                    <code>php /home/USERNAME/public_html/AI/cron.php</code><br>
                    Ganti USERNAME sesuai akun hosting kamu.
                </div>
            </aside>
        </section>
        </section>
    </main>
    <script src="gemu.js?v=<?php echo filemtime(__DIR__.'/gemu.js'); ?>"></script>
</body>
</html>
