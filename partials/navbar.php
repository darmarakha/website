<?php
// Partial navbar GemuYokai/Darma Portfolio.
// Aman dipanggil dari halaman root. Untuk halaman subfolder, set $gemu_base_path sebelum include.
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
$gemu_base_path = isset($gemu_base_path) ? rtrim((string)$gemu_base_path, '/') . '/' : '';
$gemu_is_owner = isset($_SESSION['user_role']) && strtolower((string)$_SESSION['user_role']) === 'owner';
$gemu_user_name = isset($_SESSION['user_name']) ? (string)$_SESSION['user_name'] : '';
$gemu_user_role = isset($_SESSION['user_role']) ? (string)$_SESSION['user_role'] : 'Member';
?>
<style id="gemu-navbar-style">
    :root{--gemu-nav-z:99990;--gemu-panel-z:100000;--gemu-overlay-z:99998}
    .gemu-site-navbar{position:fixed;top:0;left:0;right:0;z-index:var(--gemu-nav-z);transition:background .25s ease,box-shadow .25s ease,backdrop-filter .25s ease;border-bottom:1px solid transparent}
    .gemu-site-navbar.is-scrolled,.gemu-site-navbar.is-open{background:rgba(10,25,41,.92);backdrop-filter:blur(18px);box-shadow:0 18px 50px rgba(0,0,0,.22);border-bottom-color:rgba(255,255,255,.08)}
    .gemu-site-navbar-inner{max-width:80rem;margin:0 auto;padding:0 1rem;height:3.75rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
    @media(min-width:640px){.gemu-site-navbar-inner{height:4.25rem;padding:0 1.5rem}}
    @media(min-width:768px){.gemu-site-navbar-inner{height:5rem}}
    .gemu-site-brand{display:inline-flex;align-items:center;gap:.65rem;text-decoration:none;min-width:0;color:#fff}
    .gemu-site-brand-badge{width:2.35rem;height:2.35rem;border-radius:.8rem;background:#0ea5e9;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:.82rem;box-shadow:0 12px 24px rgba(14,165,233,.22);flex:0 0 auto}
    .gemu-site-brand-text{font-weight:750;letter-spacing:-.02em;font-size:1rem;white-space:nowrap;color:#fff}
    @media(min-width:640px){.gemu-site-brand-text{font-size:1.1rem}}

    .gemu-burger-button{width:2.8rem;height:2.8rem;border-radius:1rem;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;position:relative;z-index:calc(var(--gemu-panel-z) + 5);box-shadow:0 12px 30px rgba(0,0,0,.18);transition:background .2s ease,border-color .2s ease,transform .15s ease,box-shadow .2s ease}
    .gemu-burger-button:hover{background:rgba(255,255,255,.15);border-color:rgba(56,189,248,.55);box-shadow:0 14px 34px rgba(14,165,233,.18)}
    .gemu-burger-button:active{transform:scale(.96)}
    .gemu-burger-button:focus-visible{outline:3px solid rgba(56,189,248,.35);outline-offset:3px}
    .gemu-burger-lines{width:1.28rem;height:1rem;position:relative;display:block}
    .gemu-burger-lines span{position:absolute;left:0;width:100%;height:2px;border-radius:999px;background:currentColor;box-shadow:0 0 1px rgba(255,255,255,.75);transition:transform .24s ease,top .24s ease,opacity .18s ease}
    .gemu-burger-lines span:nth-child(1){top:0}
    .gemu-burger-lines span:nth-child(2){top:calc(50% - 1px)}
    .gemu-burger-lines span:nth-child(3){top:calc(100% - 2px)}
    .gemu-burger-button[aria-expanded="true"] .gemu-burger-lines span:nth-child(1){top:calc(50% - 1px);transform:rotate(45deg)}
    .gemu-burger-button[aria-expanded="true"] .gemu-burger-lines span:nth-child(2){opacity:0;transform:translateX(.4rem)}
    .gemu-burger-button[aria-expanded="true"] .gemu-burger-lines span:nth-child(3){top:calc(50% - 1px);transform:rotate(-45deg)}
    .gemu-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

    .gemu-menu-overlay{position:fixed;inset:0;background:rgba(2,6,23,.62);backdrop-filter:blur(2px);z-index:var(--gemu-overlay-z);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .24s ease,visibility .24s ease}
    .gemu-menu-overlay.is-open{opacity:1;visibility:visible;pointer-events:auto}
    .gemu-side-menu{position:fixed;top:0;right:0;height:100dvh;width:min(24rem,92vw);z-index:var(--gemu-panel-z);background:linear-gradient(160deg,#071524 0%,#0a1929 48%,#102a43 100%);box-shadow:-28px 0 70px rgba(0,0,0,.38);transform:translateX(110%);visibility:hidden;pointer-events:none;transition:transform .34s cubic-bezier(.22,1,.36,1),visibility .34s ease;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border-left:1px solid rgba(255,255,255,.08)}
    .gemu-side-menu.is-open{transform:translateX(0);visibility:visible;pointer-events:auto}
    .gemu-side-menu::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 8%,rgba(56,189,248,.18),transparent 28rem),radial-gradient(circle at 92% 38%,rgba(14,165,233,.12),transparent 18rem);pointer-events:none}
    .gemu-side-menu-inner{position:relative;min-height:100%;display:flex;flex-direction:column;padding:5.2rem 1.1rem 1.25rem}
    .gemu-menu-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem;margin-bottom:1rem;padding:.9rem;border:1px solid rgba(255,255,255,.09);border-radius:1.25rem;background:rgba(255,255,255,.045)}
    .gemu-menu-title{color:#fff;font-weight:800;letter-spacing:-.02em;line-height:1.2}
    .gemu-menu-subtitle{color:rgba(226,232,240,.68);font-size:.75rem;margin-top:.15rem}
    .gemu-close-button{width:2.35rem;height:2.35rem;border-radius:.85rem;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto;position:relative}
    .gemu-close-button::before,.gemu-close-button::after{content:"";position:absolute;width:1rem;height:2px;border-radius:999px;background:currentColor}
    .gemu-close-button::before{transform:rotate(45deg)}
    .gemu-close-button::after{transform:rotate(-45deg)}
    .gemu-close-button:hover{background:rgba(255,255,255,.12)}
    .gemu-nav-section{display:flex;flex-direction:column;gap:.35rem;margin-top:.4rem;flex:1}
    .gemu-menu-link,.gemu-menu-action{display:flex;align-items:center;gap:.75rem;text-decoration:none;border:0;width:100%;text-align:left;padding:.88rem .95rem;border-radius:1rem;color:rgba(255,255,255,.82);background:transparent;font-size:.93rem;font-weight:650;transition:background .18s ease,color .18s ease,transform .15s ease;cursor:pointer}
    .gemu-menu-link:hover,.gemu-menu-action:hover{background:rgba(255,255,255,.08);color:#fff;transform:translateX(-2px)}
    .gemu-menu-link:active,.gemu-menu-action:active{transform:scale(.985)}
    .gemu-menu-link.nav-link::after{display:none!important}
    .gemu-menu-icon{width:1.65rem;height:1.65rem;border-radius:.7rem;display:inline-flex;align-items:center;justify-content:center;background:rgba(56,189,248,.10);color:#7dd3fc;font-size:.92rem;flex:0 0 auto;border:1px solid rgba(125,211,252,.12)}
    .gemu-menu-link.active{background:rgba(14,165,233,.14);color:#7dd3fc}
    .gemu-menu-divider{height:1px;background:rgba(255,255,255,.09);margin:.8rem 0}
    .gemu-menu-primary{justify-content:center;background:#0ea5e9;color:#fff;box-shadow:0 16px 36px rgba(14,165,233,.25);font-weight:800}
    .gemu-menu-primary:hover{background:#0284c7;color:#fff;transform:none}
    .gemu-menu-danger{justify-content:center;background:rgba(239,68,68,.13);color:#fecaca;border:1px solid rgba(248,113,113,.22)}
    .gemu-menu-owner{color:#7dd3fc;background:rgba(14,165,233,.10);border:1px solid rgba(56,189,248,.18)}
    .gemu-user-box{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.85rem;border-radius:1rem;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.05);color:#fff}
    .gemu-user-mini{display:flex;align-items:center;gap:.7rem;min-width:0}
    .gemu-user-avatar{width:2rem;height:2rem;border-radius:.75rem;background:rgba(14,165,233,.18);color:#7dd3fc;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.75rem;flex:0 0 auto}
    .gemu-user-name{font-size:.9rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:11rem}
    .gemu-user-role{font-size:.67rem;text-transform:uppercase;letter-spacing:.12em;color:#38bdf8;margin-top:.12rem}
    .gemu-logout{color:rgba(255,255,255,.62);text-decoration:none;font-size:.8rem;font-weight:700;padding:.45rem .55rem;border-radius:.7rem;background:rgba(255,255,255,.05)}
    .gemu-logout:hover{color:#fecaca;background:rgba(239,68,68,.16)}
    body.gemu-menu-locked,html.gemu-menu-locked{overflow:hidden!important}
</style>
<nav id="site-navbar" class="gemu-site-navbar" aria-label="Navigasi utama">
    <div class="gemu-site-navbar-inner">
        <a href="#hero" class="gemu-site-brand" aria-label="Ke halaman utama">
            <span class="gemu-site-brand-badge">DR</span>
            <span class="gemu-site-brand-text" id="nav-logo-text">Darma Rakhaa</span>
        </a>
        <button id="site-menu-button" class="gemu-burger-button" type="button" aria-label="Buka menu navigasi" aria-controls="site-side-menu" aria-expanded="false">
            <span class="gemu-sr-only">Menu</span>
            <span class="gemu-burger-lines" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
    </div>
</nav>
<div id="site-menu-overlay" class="gemu-menu-overlay" aria-hidden="true"></div>
<aside id="site-side-menu" class="gemu-side-menu" role="dialog" aria-modal="true" aria-label="Menu navigasi" aria-hidden="true">
    <div class="gemu-side-menu-inner">
        <div class="gemu-menu-head">
            <div>
                <div class="gemu-menu-title">Menu Website</div>
                <div class="gemu-menu-subtitle">Navigasi Darma Rakhaa</div>
            </div>
            <button id="site-menu-close" class="gemu-close-button" type="button" aria-label="Tutup menu"></button>
        </div>

        <div class="flex justify-center mb-3">
            <div class="lang-toggle" id="lang-toggle-mobile">
                <button class="lang-btn" data-lang="id" onclick="switchLang('id')">ID</button>
                <button class="lang-btn" data-lang="en" onclick="switchLang('en')">EN</button>
            </div>
        </div>

        <div class="gemu-menu-divider"></div>

        <div class="gemu-nav-section">
            <a href="<?php echo $gemu_base_path; ?>#about" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">👤</span><span data-i18n="nav.about">Tentang</span></a>
            <a href="<?php echo $gemu_base_path; ?>#experience" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">💼</span><span data-i18n="nav.experience">Pengalaman</span></a>
            <a href="<?php echo $gemu_base_path; ?>#skills" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">⚡</span><span data-i18n="nav.skills">Keahlian</span></a>
            <a href="<?php echo $gemu_base_path; ?>#certifications" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">🏅</span><span data-i18n="nav.certificates">Sertifikat</span></a>
            <a href="<?php echo $gemu_base_path; ?>#projects" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">📁</span><span data-i18n="nav.projects">Proyek</span></a>
            <a href="<?php echo $gemu_base_path; ?>#github" class="gemu-menu-link nav-link site-menu-link"><span class="gemu-menu-icon">🐙</span><span>GitHub</span></a>
            <a href="<?php echo $gemu_base_path; ?>Game/index.php" class="gemu-menu-link site-menu-link"><span class="gemu-menu-icon">🎮</span><span data-i18n="nav.game">Game</span></a>
            <a href="<?php echo $gemu_base_path; ?>Belajar/Index.php" class="gemu-menu-link site-menu-link"><span class="gemu-menu-icon">📚</span><span data-i18n="nav.learn">Belajar</span></a>
            <a href="<?php echo $gemu_base_path; ?>Bisnis/" class="gemu-menu-link site-menu-link"><span class="gemu-menu-icon">📊</span><span data-i18n="nav.business">Bisnis</span></a>
            <?php if($gemu_is_owner): ?>
                <a href="<?php echo $gemu_base_path; ?>AI/" class="gemu-menu-link gemu-menu-owner site-menu-link"><span class="gemu-menu-icon">🤖</span><span>GEMU AI</span></a>
                <a href="<?php echo $gemu_base_path; ?>edit/" class="gemu-menu-link gemu-menu-owner site-menu-link"><span class="gemu-menu-icon">✏️</span><span>Edit Web</span></a>
            <?php endif; ?>
        </div>

        <div class="gemu-menu-divider"></div>
        <div class="space-y-3">
            <a href="#contact" class="gemu-menu-link gemu-menu-primary site-menu-link"><span data-i18n="nav.contactFull">Hubungi Saya</span></a>
            <?php if($gemu_user_name !== ''): ?>
                <div class="gemu-user-box">
                    <div class="gemu-user-mini">
                        <div class="gemu-user-avatar">DR</div>
                        <div class="min-w-0">
                            <div class="gemu-user-name" id="nav-user-name"><?php echo htmlspecialchars($gemu_user_name, ENT_QUOTES, 'UTF-8'); ?></div>
                            <div class="gemu-user-role"><?php echo htmlspecialchars($gemu_user_role, ENT_QUOTES, 'UTF-8'); ?></div>
                        </div>
                    </div>
                    <a href="<?php echo $gemu_base_path; ?>logout.php" class="gemu-logout">Keluar</a>
                </div>
            <?php else: ?>
                <button type="button" onclick="if(typeof openAuthModal==='function'){openAuthModal();}" class="gemu-menu-action gemu-menu-danger site-menu-link"><span>Login / Sign Up</span></button>
            <?php endif; ?>
        </div>
    </div>
</aside>
<script id="gemu-navbar-script">
(function(){
    'use strict';
    const nav = document.getElementById('site-navbar');
    const btn = document.getElementById('site-menu-button');
    const closeBtn = document.getElementById('site-menu-close');
    const menu = document.getElementById('site-side-menu');
    const overlay = document.getElementById('site-menu-overlay');
    if (!nav || !btn || !menu || !overlay) return;

    let isOpen = false;
    const lock = (state) => {
        document.body.classList.toggle('gemu-menu-locked', state);
        document.documentElement.classList.toggle('gemu-menu-locked', state);
    };
    const syncScroll = () => {
        nav.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    const setOpen = (state) => {
        isOpen = !!state;
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        btn.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
        menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        menu.classList.toggle('is-open', isOpen);
        overlay.classList.toggle('is-open', isOpen);
        nav.classList.toggle('is-open', isOpen);
        lock(isOpen);
        syncScroll();
        if (isOpen) {
            const firstLink = menu.querySelector('a,button');
            window.setTimeout(() => { try { firstLink && firstLink.focus({preventScroll:true}); } catch(e) {} }, 80);
        }
    };

    btn.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); setOpen(!isOpen); });
    if (closeBtn) closeBtn.addEventListener('click', function(e){ e.preventDefault(); setOpen(false); });
    overlay.addEventListener('click', function(){ setOpen(false); });
    menu.querySelectorAll('.site-menu-link').forEach(function(el){ el.addEventListener('click', function(){ setOpen(false); }); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });
    window.addEventListener('hashchange', function(){ setOpen(false); }, {passive:true});
    window.addEventListener('pageshow', function(){ setOpen(false); }, {passive:true});
    window.addEventListener('resize', function(){ if(isOpen) setOpen(false); }, {passive:true});
    window.addEventListener('scroll', syncScroll, {passive:true});
    syncScroll();
    window.gemuNavbarOpen = function(){ setOpen(true); };
    window.gemuNavbarClose = function(){ setOpen(false); };
})();
</script>
