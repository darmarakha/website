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
</body>
</html>
