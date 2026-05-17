<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$gemu_base_path = '../../';
$gemu_js_parts_version = 0;
foreach (glob(__DIR__ . '/js/dnd-app-part-*.js') ?: [] as $gemu_part_file) {
    $gemu_js_parts_version = max($gemu_js_parts_version, @filemtime($gemu_part_file) ?: 0);
}
$gemu_css_parts_version = 0;
foreach (glob(__DIR__ . '/css/*.css') ?: [] as $gemu_css_file) {
    $gemu_css_parts_version = max($gemu_css_parts_version, @filemtime($gemu_css_file) ?: 0);
}
$gemu_asset_version = max(
    $gemu_js_parts_version,
    $gemu_css_parts_version,
    @filemtime(__DIR__ . '/index.php') ?: time(),
    @filemtime(__DIR__ . '/dnd.css') ?: time(),
    @filemtime(__DIR__ . '/dnd-data.php') ?: time(),
    @filemtime(__DIR__ . '/dnd-app.php') ?: time(),
    @filemtime(__DIR__ . '/dnd-map-ai.js') ?: time(),
    @filemtime(__DIR__ . '/dnd-expansion.js') ?: time(),
    @filemtime(__DIR__ . '/dnd_auth.php') ?: time(),
    @filemtime(__DIR__ . '/dnd_api.php') ?: time()
);

$gemu_user_id = $_SESSION['gy_user_id']
    ?? $_SESSION['user_id']
    ?? $_SESSION['id_user']
    ?? $_SESSION['id']
    ?? '';
$gemu_user_name = $_SESSION['gy_nickname']
    ?? $_SESSION['gy_user_name']
    ?? $_SESSION['user_name']
    ?? $_SESSION['nama_panggilan']
    ?? $_SESSION['nama_lengkap']
    ?? '';
$gemu_user_email = $_SESSION['gy_user_email']
    ?? $_SESSION['user_email']
    ?? $_SESSION['email']
    ?? '';
$gemu_user_role = $_SESSION['gy_user_role']
    ?? $_SESSION['user_role']
    ?? $_SESSION['role']
    ?? '';

if (empty($_SESSION['gemu_dnd_token'])) {
    $_SESSION['gemu_dnd_token'] = bin2hex(random_bytes(24));
}
$gemu_dnd_token = $_SESSION['gemu_dnd_token'];
$gemu_site_auth_api = '../../auth.php';
$gemu_login_url = '../../index.php';
$gemu_signup_url = '../../index.php';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>DnD 2014 Table - Gemuyokai</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐉</text></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="dnd.css?v=<?php echo (int)$gemu_asset_version; ?>">
</head>
<body class="dnd-page">
    <script>
        window.switchLang = window.switchLang || function(lang){ document.documentElement.lang = lang || 'id'; };
    </script>
    <?php
    $gemu_navbar = __DIR__ . '/../../partials/navbar.php';
    if (is_file($gemu_navbar)) {
        require $gemu_navbar;
    } else {
        echo '<nav class="dnd-fallback-nav"><a href="../../bahasa-jepang/">← Back Home</a><strong>GemuYokai DnD 2014</strong></nav>';
    }
    ?>

    <main id="dnd-app"
          class="dnd-shell"
          data-session-id="<?php echo htmlspecialchars((string)$gemu_user_id, ENT_QUOTES, 'UTF-8'); ?>"
          data-session-name="<?php echo htmlspecialchars((string)$gemu_user_name, ENT_QUOTES, 'UTF-8'); ?>"
          data-session-email="<?php echo htmlspecialchars((string)$gemu_user_email, ENT_QUOTES, 'UTF-8'); ?>"
          data-session-role="<?php echo htmlspecialchars((string)$gemu_user_role, ENT_QUOTES, 'UTF-8'); ?>"
          data-api="dnd_api.php"
          data-auth-api="dnd_auth.php"
          data-image-api="dnd_image_api.php"
          data-website-auth-api="<?php echo htmlspecialchars($gemu_site_auth_api, ENT_QUOTES, 'UTF-8'); ?>"
          data-login-url="<?php echo htmlspecialchars($gemu_login_url, ENT_QUOTES, 'UTF-8'); ?>"
          data-signup-url="<?php echo htmlspecialchars($gemu_signup_url, ENT_QUOTES, 'UTF-8'); ?>"
          data-sync-token="<?php echo htmlspecialchars((string)$gemu_dnd_token, ENT_QUOTES, 'UTF-8'); ?>">
        <noscript>Aktifkan JavaScript untuk menjalankan DnD 2014 Table.</noscript>
    </main>

    <div id="dnd-toast" class="dnd-toast" role="status" aria-live="polite"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
    <script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js" defer></script>
    <script src="../../data.js?v=<?php echo (int)$gemu_asset_version; ?>"></script>
    <script src="../../app.js?v=<?php echo (int)$gemu_asset_version; ?>"></script>
    <script src="dnd-data.php?v=<?php echo (int)$gemu_asset_version; ?>" defer></script>
    <script src="dnd-expansion.js?v=<?php echo (int)$gemu_asset_version; ?>" defer></script>
    <script src="dnd-map-ai.js?v=<?php echo (int)$gemu_asset_version; ?>" defer></script>
    <script src="dnd-app.php?v=<?php echo (int)$gemu_asset_version; ?>" defer></script>
    <audio id="dnd-bg-music" loop preload="none">
        <source src="assets/Celtic Music - Fantasy Worlds Through Flute Sounds _ Relaxing Medieval Music Mix for Work & Study, [LnmY5Rgpb1Y].mp3" type="audio/mpeg">
    </audio>

    <button id="dnd-music-toggle" class="floating-music-btn" title="Play/Pause Fantasy Music">
        🔇
    </button>

    <style>
    .floating-music-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 2px solid var(--dnd-highlight, #e6c27a);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.5);
        transition: all 0.3s ease;
        user-select: none;
    }
    .floating-music-btn:hover {
        background: rgba(20, 20, 20, 0.95);
        transform: scale(1.1);
    }
    .floating-music-btn.playing {
        animation: dnd-pulse-border 2s infinite, dnd-dance 1s infinite;
        border-color: #fce8a4;
        background: rgba(80, 60, 20, 0.9);
    }
    @keyframes dnd-pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(230, 194, 122, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(230, 194, 122, 0); }
        100% { box-shadow: 0 0 0 0 rgba(230, 194, 122, 0); }
    }
    @keyframes dnd-dance {
        0%, 100% { transform: rotate(0deg) scale(1.1); }
        25% { transform: rotate(-15deg) scale(1.2); }
        75% { transform: rotate(15deg) scale(1.2); }
    }
    </style>

    <script>
    document.addEventListener("DOMContentLoaded", () => {
        const musicBtn = document.getElementById("dnd-music-toggle");
        const audioEl = document.getElementById("dnd-bg-music");
        let isPlaying = false;

        if (musicBtn && audioEl) {
            musicBtn.addEventListener("click", () => {
                if (isPlaying) {
                    audioEl.pause();
                    musicBtn.classList.remove("playing");
                    musicBtn.textContent = "🔇";
                    isPlaying = false;
                } else {
                    audioEl.volume = 0.4;
                    audioEl.play().then(() => {
                        musicBtn.classList.add("playing");
                        musicBtn.textContent = "🔊";
                        isPlaying = true;
                    }).catch(err => {
                        console.error("Gagal memutar musik:", err);
                        alert("Gagal memutar musik!\n\nSilakan pastikan Anda telah meletakkan file MP3 musik ke dalam folder assets.");
                    });
                }
            });
        }
    });
    </script>
</body>
</html>
