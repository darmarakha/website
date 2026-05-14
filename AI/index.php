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
        <section class="gemu-workspace">
            <!-- Left Sidebar -->
            <aside class="quick-actions" id="quick-actions">
                <h2 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Aksi Cepat</h2>
                <button class="action-card" data-action="home"><b>Home</b><span>Kembali ke website.</span></button>
                <button class="action-card" data-action="scan"><b>Scan + Backup</b><span>Backup dan cek file.</span></button>
                <button class="action-card" data-action="brain"><b>Otak GEMU</b><span>Memori dan tugas.</span></button>
                <button class="action-card" data-action="security"><b>Security Audit</b><span>Cek celah keamanan.</span></button>
                <button class="action-card" data-action="clear"><b>Bersihkan Chat</b><span>Chat baru.</span></button>
            </aside>

            <!-- Main Chat Area -->
            <div class="gemu-grid">
                <div class="chat-panel">
                    <div class="chat-header">
                        <div>
                            <b class="text-sm">Ruang Komando Owner</b>
                            <span class="text-xs text-slate-500">Kendalikan website dengan bahasa natural</span>
                        </div>
                        <div class="chat-actions">
                            <button id="settings-btn" class="tiny-btn">⚙️ Setting</button>
                        </div>
                    </div>
                    <div id="chat-log" class="chat-log"></div>
                    <div id="draft-reaction-dock" class="draft-reaction-dock"></div>
                    <form id="chat-form" class="chat-form">
                        <button id="upload-btn" type="button" title="Upload">📎</button>
                        <input id="file-input" type="file" multiple hidden>
                        <textarea id="chat-input" rows="1" placeholder="Tulis perintah untuk GEMU..."></textarea>
                        <button type="submit">Kirim</button>
                    </form>
                </div>
            </div>

            <!-- Right Status Area -->
            <aside class="status-panel">
                <h2>Status Sistem</h2>
                <div id="status-box" class="status-box">Belum ada scan.</div>

                <h2>Agent Board</h2>
                <div id="agent-board" class="agent-board"></div>

                <h2>Terminal Aktif</h2>
                <div id="terminal-box" class="terminal-box">Terminal standby...</div>

                <h2>Memori & Aktivitas</h2>
                <div id="memory-box" class="memory-box"></div>
                <div id="activity-box" class="activity-box"></div>
                <div id="autonomy-box" class="autonomy-box"></div>

                <h2>File Brain</h2>
                <div id="file-box" class="file-box"></div>
            </aside>
        </section>
    </main>
    <script src="gemu.js?v=<?php echo filemtime(__DIR__.'/gemu.js'); ?>"></script>
</body>
</html>
