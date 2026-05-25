<?php
// Wajib di baris pertama untuk mencegah caching (Hard Refresh) dan melacak status login
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
require_once __DIR__ . '/config/csrf.php';
$gemu_csrf_token = csrf_token_value();
$gemu_asset_version = max(
    @filemtime(__DIR__ . '/index.php') ?: time(),
    @filemtime(__DIR__ . '/app.js') ?: time(),
    @filemtime(__DIR__ . '/data.js') ?: time(),
    @filemtime(__DIR__ . '/AI/guide-widget.css') ?: time(),
    @filemtime(__DIR__ . '/AI/guide-widget.js') ?: time(),
    @filemtime(__DIR__ . '/partials/navbar.php') ?: time(),
    @filemtime(__DIR__ . '/partials/footer.php') ?: time()
);
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">

<head>
    <meta charset="UTF-8">
    <!-- Diperbarui agar fit di mobile dan tidak bisa di-zoom out secara tidak sengaja -->
    <meta name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

    <!-- Meta tambahan untuk memastikan browser tidak menyimpan cache halaman lama -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">

    <title>Darma Alif Rakhaa — Portfolio</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
    <script>window.__GEMU_BUILD_VERSION = '<?php echo (int) $gemu_asset_version; ?>';</script>
    <link rel="stylesheet" href="AI/guide-widget.css?v=<?php echo (int) $gemu_asset_version; ?>">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 50: '#f0f4f8', 100: '#d9e2ec', 200: '#bcccdc', 300: '#9fb3c8', 400: '#829ab1', 500: '#627d98', 600: '#486581', 700: '#334e68', 800: '#243b53', 900: '#102a43', 950: '#0a1929' },
                        accent: { 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' }
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Playfair Display', 'serif'] }
                }
            }
        }
    </script>
    <style>

        /* GitHub Contribution Graph Styles */
        .gh-contrib-card {
            color: #c9d1d9;
        }

        .gh-contrib-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: .75rem;
        }

        .gh-contrib-topbar h3 {
            color: #f0f6fc;
            font-size: 1rem;
            font-weight: 500;
        }

        .gh-contrib-settings {
            color: #8b949e;
            font-size: .75rem;
        }

        .gh-contrib-panel {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 14px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .gh-contrib-months {
            display: grid;
            grid-template-columns: repeat(53, 12px);
            gap: 3px;
            margin-left: 34px;
            color: #c9d1d9;
            font-size: 12px;
            min-width: max-content;
        }

        .gh-contrib-body {
            display: flex;
            gap: 8px;
            min-width: max-content;
        }

        .gh-contrib-weekdays {
            display: grid;
            grid-template-rows: repeat(7, 12px);
            gap: 3px;
            width: 26px;
            color: #c9d1d9;
            font-size: 12px;
        }

        .gh-contrib-grid {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 12px;
            grid-template-rows: repeat(7, 12px);
            gap: 3px;
        }

        .gh-contrib-cell,
        .gh-level {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }

        .gh-level-0 { background: #161b22; }
        .gh-level-1 { background: #0e4429; }
        .gh-level-2 { background: #006d32; }
        .gh-level-3 { background: #26a641; }
        .gh-level-4 { background: #39d353; }

        .gh-contrib-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 10px;
            color: #8b949e;
            font-size: 12px;
        }

        .gh-contrib-footer a {
            color: #8b949e;
        }

        .gh-contrib-legend {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        body {
            font-family: 'Inter', sans-serif;
            -webkit-tap-highlight-color: transparent
        }

        ::selection {
            background: #0ea5e9;
            color: #fff
        }

        ::-webkit-scrollbar {
            width: 6px
        }

        ::-webkit-scrollbar-track {
            background: #f0f4f8
        }

        ::-webkit-scrollbar-thumb {
            background: #9fb3c8;
            border-radius: 4px
        }

        .hero-gradient {
            background: linear-gradient(135deg, #0a1929 0%, #102a43 30%, #1e3a5f 60%, #243b53 100%);
            position: relative;
            overflow: hidden
        }

        .hero-gradient::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 500px 350px at 20% 50%, rgba(14, 165, 233, .12) 0%, transparent 70%), radial-gradient(ellipse 400px 400px at 80% 20%, rgba(56, 189, 248, .08) 0%, transparent 70%);
            pointer-events: none
        }

        .hero-gradient::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(255, 255, 255, .025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .025) 1px, transparent 1px);
            background-size: 50px 50px;
            pointer-events: none
        }

        .particle {
            position: absolute;
            border-radius: 50%;
            background: rgba(14, 165, 233, .15);
            pointer-events: none;
            animation: float linear infinite
        }

        @keyframes float {
            0% {
                transform: translateY(0);
                opacity: 0
            }

            10% {
                opacity: 1
            }

            90% {
                opacity: 1
            }

            100% {
                transform: translateY(-100vh);
                opacity: 0
            }
        }

        .progress-fill {
            width: 0;
            transition: width 1.5s cubic-bezier(.4, 0, .2, 1)
        }

        .reveal {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity .6s ease, transform .6s ease
        }

        .reveal.visible {
            opacity: 1;
            transform: translateY(0)
        }

        .timeline-line {
            position: absolute;
            left: 15px;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, #0ea5e9, #bcccdc)
        }

        @media(min-width:768px) {
            .timeline-line {
                left: 50%;
                transform: translateX(-50%)
            }
        }

        .cert-card {
            transition: transform .3s ease, box-shadow .3s ease
        }

        @media(hover:hover) {
            .cert-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 20px 40px rgba(10, 25, 41, .12)
            }
        }

        .lightbox {
            opacity: 0;
            visibility: hidden;
            transition: opacity .3s ease, visibility .3s ease
        }

        .lightbox.active {
            opacity: 1;
            visibility: visible
        }

        .lightbox-img {
            transform: scale(.92);
            transition: transform .3s ease
        }

        .lightbox.active .lightbox-img {
            transform: scale(1)
        }

        .toast {
            transform: translateX(calc(100% + 2rem));
            transition: transform .4s cubic-bezier(.4, 0, .2, 1)
        }

        .toast.show {
            transform: translateX(0)
        }

        .nav-link {
            position: relative
        }

        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 50%;
            width: 0;
            height: 2px;
            background: #0ea5e9;
            transition: width .3s ease, left .3s ease;
            border-radius: 1px
        }

        .nav-link.active::after {
            width: 100%;
            left: 0
        }

        @media(hover:hover) {
            .nav-link:hover::after {
                width: 100%;
                left: 0
            }
        }

        .pulse-dot {
            animation: pulse-ring 2s ease infinite
        }

        @keyframes pulse-ring {
            0% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, .4)
            }

            70% {
                box-shadow: 0 0 0 8px rgba(14, 165, 233, 0)
            }

            100% {
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0)
            }
        }

        .project-card {
            transition: transform .3s ease, box-shadow .3s ease
        }

        @media(hover:hover) {
            .project-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 16px 32px rgba(10, 25, 41, .1)
            }

            .project-card:hover img {
                transform: scale(1.05)
            }
        }

        @supports(padding:env(safe-area-inset-bottom)) {
            .mobile-safe-bottom {
                padding-bottom: env(safe-area-inset-bottom)
            }
        }

        html,
        body {
            overflow-x: hidden;
            max-width: 100vw
        }

        /* Language toggle */
        .lang-toggle {
            display: flex;
            border-radius: 8px;
            overflow: hidden;
            border: 1.5px solid rgba(255, 255, 255, .2);
            background: rgba(255, 255, 255, .05);
            backdrop-filter: blur(4px)
        }

        .lang-toggle.scrolled {
            border-color: #d9e2ec;
            background: #f0f4f8
        }

        .lang-btn {
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: .5px;
            transition: all .2s;
            cursor: pointer;
            border: none;
            background: transparent;
            color: rgba(255, 255, 255, .5)
        }

        .lang-btn.scrolled {
            color: #627d98
        }

        .lang-btn.active {
            background: #0ea5e9;
            color: #fff !important
        }

        .lang-btn:not(.active):hover {
            background: rgba(255, 255, 255, .1);
            color: rgba(255, 255, 255, .8)
        }

        .lang-btn.scrolled:not(.active):hover {
            background: #d9e2ec;
            color: #102a43
        }

        /* Fade transition */
        .i18n-fade {
            transition: opacity .15s ease
        }

        .i18n-fading {
            opacity: 0
        }


        /* PATCH GEMU: navbar, mobile layout, cache-safe UI */
        #navbar {
            z-index: 9990;
            will-change: background, box-shadow, backdrop-filter
        }

        #navbar.gemu-navbar-open {
            z-index: 10010;
            background: rgba(10, 25, 41, .96) !important;
            backdrop-filter: blur(18px);
            box-shadow: 0 18px 40px rgba(0, 0, 0, .22)
        }

        #mobile-menu {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: min(390px, 92vw) !important;
            max-width: min(92vw, 390px) !important;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            background: #0a1929 !important;
            box-shadow: -24px 0 60px rgba(0, 0, 0, .32);
            z-index: 10000 !important;
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
            transform: translateX(110%) !important;
            transition: transform .32s cubic-bezier(.22, 1, .36, 1), opacity .22s ease, visibility .22s ease;
            will-change: transform, opacity
        }

        #mobile-menu.menu-open,
        #mobile-menu.gemu-menu-open {
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(0) !important
        }

        #mobile-menu-overlay {
            position: fixed !important;
            inset: 0 !important;
            z-index: 9998 !important;
            background: rgba(0, 0, 0, .56);
            opacity: 0;
            pointer-events: none;
            transition: opacity .25s ease;
            will-change: opacity
        }

        #mobile-menu-overlay.gemu-overlay-open {
            display: block !important;
            opacity: 1 !important;
            pointer-events: auto !important
        }

        #mobile-menu-btn {
            position: relative;
            z-index: 10020 !important
        }

        #mobile-menu .mobile-link {
            text-decoration: none
        }

        @supports not (display:flex) {
            #mobile-menu .mobile-link {
                display: block;
                color: rgba(255, 255, 255, .82);
                padding: .875rem 1rem;
                border-radius: .75rem
            }
        }

        body.menu-locked,
        html.menu-locked {
            overflow: hidden
        }

        @media(max-width:767px) {
            #hero .max-w-3xl {
                max-width: 100%
            }

            #hero h1 {
                word-break: normal;
                overflow-wrap: anywhere
            }

            #about {
                scroll-margin-top: 72px
            }

            #about .grid {
                gap: 2rem
            }

            #about img {
                max-height: 520px
            }

            #project-card {
                max-height: 94dvh;
                border-radius: 1rem
            }

            #project-card .overflow-y-auto {
                padding-bottom: 1rem
            }

            #project-modal-frame {
                height: 46vh !important;
                min-height: 280px
            }

            .toast {
                left: .75rem;
                right: .75rem;
                width: auto
            }
        }

        @media(min-width:768px) {
            #mobile-menu {
                width: min(390px, 92vw)
            }
        }
        /* Success Overlay */
        #success-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(10, 25, 41, 0.85);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        #success-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .success-card {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 32px;
            padding: 48px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            transform: scale(0.9) translateY(20px);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        #success-overlay.active .success-card {
            transform: scale(1) translateY(0);
        }

        .check-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
            animation: check-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes check-pop {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
    </style>
</head>

<body class="bg-white text-navy-900 antialiased">

    <?php require __DIR__ . '/partials/navbar.php'; ?>


    <section id="hero" class="hero-gradient min-h-screen min-h-[100dvh] flex items-center relative">
        <div id="particles" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
        <div
            class="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 relative z-10 w-full flex flex-col md:flex-row items-center justify-between">
            <div class="max-w-3xl relative z-10">
                <div
                    class="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 sm:mb-8 reveal">
                    <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent-400 pulse-dot"></span>
                    <span class="text-xs sm:text-sm text-navy-200 font-medium i18n-fade" data-i18n="hero.badge">Open to
                        Opportunities</span>
                </div>
                <p class="text-accent-400 font-medium text-base sm:text-lg md:text-xl mb-3 sm:mb-4 reveal i18n-fade"
                    style="transition-delay:.1s" data-i18n="hero.greeting">Halo, saya</p>
                <h1 class="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 reveal"
                    style="transition-delay:.2s">
                    Darma Alif<br><span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 via-accent-400 to-accent-500">Rakhaa</span>
                </h1>
                <p class="text-base sm:text-lg md:text-xl text-navy-300 leading-relaxed max-w-xl mb-4 sm:mb-6 reveal i18n-fade"
                    style="transition-delay:.3s" data-i18n="hero.desc">Lulusan S1 Fisika dari Universitas Negeri Malang
                    yang berfokus pada <span class="text-white font-medium">Data Analysis</span> dan <span
                        class="text-white font-medium">Python Programming</span>.</p>

                <div class="lg:hidden flex flex-wrap justify-center items-center gap-2 mb-6 sm:mb-8 text-xs font-mono text-navy-300 bg-white/5 border border-white/10 rounded-full px-4 py-2 reveal" style="transition-delay:.35s">
                    <span class="text-accent-400">status:</span> <span class="text-green-400">portfolio.ready()</span>
                    <span class="text-navy-500 hidden sm:inline">|</span>
                    <span class="text-accent-400">stack:</span> <span class="text-white">python &middot; data &middot; web</span>
                </div>

                <div class="flex items-center gap-4 mb-8 sm:mb-10">
                    <a href="https://www.linkedin.com/in/darmarakhaa" target="_blank" rel="noopener"
                        class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-[#0077b5] hover:border-[#0077b5]/50 hover:bg-[#0077b5]/10 transition-all duration-300 shadow-lg"
                        title="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-linkedin">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect width="4" height="12" x="2" y="9" />
                            <circle cx="4" cy="4" r="2" />
                        </svg>
                    </a>
                    <a href="https://github.com/darmarakha" target="_blank" rel="noopener"
                        class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-300 shadow-lg"
                        title="GitHub">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-github">
                            <path
                                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                            <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                    </a>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 reveal relative z-20" style="transition-delay:.4s">
                    <a href="#certifications"
                        class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-accent-500 text-white font-semibold rounded-xl active:scale-[0.98] transition-all duration-200 shadow-xl shadow-accent-500/25 text-sm sm:text-base">
                        <i data-lucide="award" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        <span data-i18n="hero.cta1">Lihat Sertifikat</span>
                    </a>
                    <a href="#projects"
                        class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-accent-500 text-white font-semibold rounded-xl active:scale-[0.98] transition-all duration-200 shadow-xl shadow-accent-500/25 text-sm sm:text-base">
                        <i data-lucide="folder-open" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        <span>Lihat Projek</span>
                    </a>
                    <a href="#contact"
                        class="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 border border-white/20 text-white font-semibold rounded-xl active:scale-[0.98] transition-all duration-200 backdrop-blur-sm text-sm sm:text-base">
                        <i data-lucide="mail" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                        <span data-i18n="hero.cta2">Hubungi Saya</span>
                    </a>
                </div>
                <div class="flex gap-6 sm:gap-8 mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 reveal"
                    style="transition-delay:.5s">
                    <div>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">4</p>
                        <p class="text-xs sm:text-sm text-navy-400 mt-0.5 sm:mt-1 i18n-fade" data-i18n="hero.stat1">
                            Sertifikat</p>
                    </div>
                    <div>
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">2</p>
                        <p class="text-xs sm:text-sm text-navy-400 mt-0.5 sm:mt-1 i18n-fade" data-i18n="hero.stat2">
                            Proyek</p>
                    </div>
                    <div class="min-w-0">
                        <p class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">1</p>
                        <p class="text-xs sm:text-sm text-navy-400 mt-0.5 sm:mt-1 i18n-fade" data-i18n="hero.stat3">
                            Riset Internasional</p>
                    </div>
                </div>
            </div>

            <!-- VIBE CODING EFFECT CARD -->
            <div class="hidden lg:block w-80 xl:w-96 bg-[#0a1929]/80 backdrop-blur-md border border-[#0ea5e9]/20 rounded-xl shadow-[0_0_40px_rgba(14,165,233,0.15)] reveal mt-12 md:mt-0 relative z-0" style="transition-delay:.6s">
                <div class="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5 rounded-t-xl">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <span class="text-[10px] text-navy-300 font-mono ml-2">profile.js</span>
                </div>
                <div class="p-5 font-mono text-xs sm:text-sm text-navy-200 space-y-1.5 overflow-hidden" id="vibe-coding-text">
                    <!-- Typing effect akan dirender di sini lewat JS -->
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-navy-400">
            <span class="text-[10px] sm:text-xs font-medium tracking-widest uppercase">Scroll</span>
            <div class="w-5 h-7 sm:w-5 sm:h-8 border-2 border-navy-500 rounded-full flex justify-center pt-1">
                <div class="w-1 h-1.5 sm:h-2 bg-accent-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </section>

    <section id="about" class="py-16 sm:py-20 md:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
                <div class="reveal order-1">
                    <div class="relative max-w-md mx-auto lg:max-w-none">
                        <div class="aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                            <img src="edit/uploads/1777173612_WhatsAppImage20260426at09.59.27.jpeg"
                                alt="Darma Alif Rakhaa" class="w-full h-full object-cover" loading="lazy">
                        </div>
                        <div
                            class="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-24 sm:w-32 h-24 sm:h-32 bg-accent-500/10 rounded-xl sm:rounded-2xl -z-10">
                        </div>
                        <div
                            class="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 sm:w-24 h-16 sm:h-24 border-2 border-accent-500/20 rounded-xl sm:rounded-2xl -z-10">
                        </div>
                        <div
                            class="hidden sm:block absolute -right-3 md:-right-8 top-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-navy-100">
                            <div class="flex items-center gap-2 sm:gap-3">
                                <div
                                    class="w-8 h-8 sm:w-10 sm:h-10 bg-accent-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i data-lucide="graduation-cap" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i>
                                </div>
                                <div>
                                    <p class="text-xs sm:text-sm font-semibold text-navy-900">S1 Fisika</p>
                                    <p class="text-[10px] sm:text-xs text-navy-500">UM Malang</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="reveal order-2" style="transition-delay:.15s">
                    <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                        data-i18n="about.label">Tentang Saya</p>
                    <h2
                        class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 mb-4 sm:mb-6 leading-tight">
                        <span data-i18n="about.title1">Driven by Data,</span><br><span class="text-accent-500"
                            data-i18n="about.title2">Powered by Curiosity</span>
                    </h2>
                    <div class="space-y-3 sm:space-y-4 text-sm sm:text-base text-navy-600 leading-relaxed">
                        <p class="i18n-fade" data-i18n="about.p1">Saya adalah lulusan S1 Fisika dari Universitas Negeri
                            Malang yang memiliki ketertarikan mendalam di bidang analisis data dan pemrograman. Latar
                            belakang pendidikan fisika membekali saya dengan kemampuan berpikir logis, matematis, dan
                            analitis yang kuat.</p>
                        <p class="i18n-fade" data-i18n="about.p2">Saya sangat <strong
                                class="text-navy-800">termotivasi</strong>, berorientasi pada <strong
                                class="text-navy-800">detail</strong>, dan senantiasa mencari peluang untuk berkembang.
                            Pengalaman magang riset internasional di Korea Selatan telah membentuk saya menjadi individu
                            yang adaptif dan siap menghadapi tantangan di lingkungan kerja yang dinamis.</p>
                        <p class="i18n-fade" data-i18n="about.p3">Saat ini saya sedang aktif mencari tantangan
                            profesional yang memungkinkan saya mengaplikasikan keahlian teknis sekaligus terus belajar
                            dan berkontribusi secara nyata.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 mt-6 sm:mt-8">
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="target"
                                class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade"
                                    data-i18n="about.h1t">Detail-Oriented</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade"
                                    data-i18n="about.h1d">Presisi dalam setiap pekerjaan</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="globe"
                                class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade"
                                    data-i18n="about.h2t">Internasional</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade"
                                    data-i18n="about.h2d">Pengalaman riset di Korsel</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="trending-up"
                                class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade"
                                    data-i18n="about.h3t">Growth Mindset</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade"
                                    data-i18n="about.h3d">Selalu ingin belajar hal baru</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="users"
                                class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade"
                                    data-i18n="about.h4t">Kolaboratif</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade"
                                    data-i18n="about.h4d">Mudah bekerja dalam tim</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="experience" class="py-16 sm:py-20 md:py-32 bg-navy-50/50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                    data-i18n="exp.label">Perjalanan Saya</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade"
                    data-i18n="exp.title">Pengalaman & Pendidikan</h2>
            </div>
            <div class="relative">
                <div class="timeline-line"></div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 mb-8 sm:mb-12 reveal">
                    <div
                        class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5">
                    </div>
                    <div class="md:w-[45%] md:pr-8 md:text-right">
                        <span
                            class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade"
                            data-i18n="exp.tag1">Pendidikan</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">S1 Fisika</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1">Universitas Negeri Malang</p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade"
                            data-i18n="exp.desc1">Fokus pada fisika komputasional, analisis data, dan pemodelan
                            matematis. Menguasai berbagai tools pemrograman untuk riset ilmiah.</p>
                    </div>
                </div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 mb-8 sm:mb-12 reveal" style="transition-delay:.1s">
                    <div
                        class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5">
                    </div>
                    <div class="md:w-[45%] md:ml-auto md:pl-8">
                        <span
                            class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-navy-900/10 text-navy-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade"
                            data-i18n="exp.tag2">Magang Riset Internasional</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">Research Intern</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1">Institute of Basic Sciences
                            (IBS), <span data-i18n="exp.korea">Korea Selatan</span></p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade"
                            data-i18n="exp.desc2">Melaksanakan magang riset di lingkungan internasional, terlibat dalam
                            proyek penelitian tingkat global bersama peneliti dari berbagai negara.</p>
                    </div>
                </div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 reveal" style="transition-delay:.2s">
                    <div
                        class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5">
                    </div>
                    <div class="md:w-[45%] md:pr-8 md:text-right">
                        <span
                            class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade"
                            data-i18n="exp.tag3">Pengembangan Diri</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">Continuous Learning</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1 i18n-fade" data-i18n="exp.sub3">
                            Self-Directed Study</p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade"
                            data-i18n="exp.desc3">Aktif mengejar sertifikasi profesional, mengembangkan proyek
                            independen di bidang Data Science, Machine Learning, dan Web Development.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="skills" class="py-16 sm:py-20 md:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                    data-i18n="skills.label">Kemampuan Teknis</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade"
                    data-i18n="skills.title">Keahlian Saya</h2>
            </div>
            <div class="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto" id="skills-grid"></div>
            <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-12 reveal" style="transition-delay:.3s"
                id="skill-badges"></div>
        </div>
    </section>

    <section id="certifications" class="py-16 sm:py-20 md:py-32 bg-navy-950 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-accent-500/5 rounded-full blur-3xl">
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-400 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                    data-i18n="cert.label">Bukti Kompetensi</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white i18n-fade"
                    data-i18n="cert.title">Sertifikat Saya</h2>
                <p class="text-navy-300 mt-3 sm:mt-4 max-w-lg mx-auto text-sm sm:text-base px-2 i18n-fade"
                    data-i18n="cert.subtitle">Klik pada setiap kartu untuk melihat gambar sertifikat secara lengkap.</p>
            </div>
            <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8" id="cert-grid"></div>
        </div>
    </section>

    <section id="projects" class="py-16 sm:py-20 md:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                    data-i18n="proj.label">Karya Saya</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade"
                    data-i18n="proj.title">Proyek</h2>
                <!-- TAMBAHAN SUBTITLE UNTUK PROYEK AGAR SAMA SEPERTI SERTIFIKAT -->
                <p class="text-navy-600 mt-3 sm:mt-4 max-w-lg mx-auto text-sm sm:text-base px-2 i18n-fade"
                    data-i18n="proj.subtitle">Klik pada setiap kartu untuk melihat detail proyek secara lengkap.</p>
            </div>
            <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8" id="proj-grid"></div>
        </div>
    </section>

    <section id="github" class="py-16 sm:py-20 md:py-32 bg-navy-950 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-400 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4">Open Source</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github md:w-10 md:h-10"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    GitHub Activity
                </h2>
                <p class="text-navy-300 mt-3 sm:mt-4 max-w-lg mx-auto text-sm sm:text-base px-2">Aktivitas open source dan repositori publik saya.</p>
            </div>

            <div class="grid lg:grid-cols-3 gap-6 sm:gap-8 items-start">
                <!-- GitHub Profile Card -->
                <div class="lg:col-span-1 reveal bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm" id="github-profile-card">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-16 h-16 rounded-full bg-navy-800 animate-pulse" id="gh-avatar-skeleton"></div>
                        <img id="gh-avatar" src="" alt="GitHub Avatar" class="w-16 h-16 rounded-full border-2 border-white/20 hidden">
                        <div>
                            <div class="h-5 w-32 bg-navy-800 rounded animate-pulse mb-2" id="gh-name-skeleton"></div>
                            <h3 class="text-lg font-bold text-white hidden" id="gh-name"></h3>
                            <div class="h-4 w-24 bg-navy-800 rounded animate-pulse" id="gh-login-skeleton"></div>
                            <a id="gh-login" href="https://github.com/darmarakha" target="_blank" rel="noopener" class="text-accent-400 text-sm hover:underline hidden">@darmarakha</a>
                        </div>
                    </div>

                    <div class="h-4 w-full bg-navy-800 rounded animate-pulse mb-6" id="gh-bio-skeleton"></div>
                    <p class="text-navy-300 text-sm mb-6 hidden" id="gh-bio"></p>

                    <div class="flex justify-between items-center py-4 border-t border-white/10">
                        <div class="text-center">
                            <div class="h-6 w-8 bg-navy-800 rounded animate-pulse mx-auto mb-1" id="gh-repos-skeleton"></div>
                            <p class="text-xl font-bold text-white hidden" id="gh-repos">0</p>
                            <p class="text-xs text-navy-400">Repositories</p>
                        </div>
                        <div class="text-center">
                            <div class="h-6 w-8 bg-navy-800 rounded animate-pulse mx-auto mb-1" id="gh-followers-skeleton"></div>
                            <p class="text-xl font-bold text-white hidden" id="gh-followers">0</p>
                            <p class="text-xs text-navy-400">Followers</p>
                        </div>
                        <div class="text-center">
                            <div class="h-6 w-8 bg-navy-800 rounded animate-pulse mx-auto mb-1" id="gh-following-skeleton"></div>
                            <p class="text-xl font-bold text-white hidden" id="gh-following">0</p>
                            <p class="text-xs text-navy-400">Following</p>
                        </div>
                    </div>

                    <a href="https://github.com/darmarakha" target="_blank" rel="noopener" class="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors border border-white/10">
                        <span>Visit Profile</span>
                        <i data-lucide="external-link" class="w-4 h-4"></i>
                    </a>
                </div>


                <!-- GitHub Contribution Heatmap -->
                <div class="lg:col-span-2 reveal" style="transition-delay: .15s">
                    <div class="gh-contrib-card">
                        <div class="gh-contrib-topbar">
                            <h3 id="gh-contrib-title" class="text-white text-lg font-bold">Loading contributions...</h3>
                            <button type="button" class="gh-contrib-settings hover:text-white transition-colors" aria-label="Contribution settings">
                                Contribution settings ▾
                            </button>
                        </div>

                        <div class="gh-contrib-panel">
                            <div id="gh-contrib-months" class="gh-contrib-months"></div>

                            <div class="gh-contrib-body">
                                <div class="gh-contrib-weekdays">
                                    <span></span>
                                    <span>Mon</span>
                                    <span></span>
                                    <span>Wed</span>
                                    <span></span>
                                    <span>Fri</span>
                                    <span></span>
                                </div>

                                <div id="gh-contrib-grid" class="gh-contrib-grid" aria-label="GitHub contribution heatmap"></div>
                            </div>

                            <div class="gh-contrib-footer">
                                <a href="https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference"
                                   target="_blank"
                                   rel="noopener"
                                   class="hover:text-accent-400 transition-colors">
                                    Learn how we count contributions
                                </a>

                                <div class="gh-contrib-legend">
                                    <span>Less</span>
                                    <span class="gh-level gh-level-0"></span>
                                    <span class="gh-level gh-level-1"></span>
                                    <span class="gh-level gh-level-2"></span>
                                    <span class="gh-level gh-level-3"></span>
                                    <span class="gh-level gh-level-4"></span>
                                    <span>More</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <section id="contact" class="py-16 sm:py-20 md:py-32 bg-navy-50/50 mobile-safe-bottom">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade"
                    data-i18n="contact.label">Mari Terhubung</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade"
                    data-i18n="contact.title">Hubungi Saya</h2>
            </div>
            <div class="grid lg:grid-cols-5 gap-8 sm:gap-12 max-w-5xl mx-auto">
                <div class="lg:col-span-2 reveal">
                    <p class="text-sm sm:text-base text-navy-600 leading-relaxed mb-6 sm:mb-8 i18n-fade"
                        data-i18n="contact.desc">Saya selalu terbuka untuk peluang baru, kolaborasi, atau sekadar
                        diskusi. Jangan ragu untuk menghubungi saya.</p>
                    <div class="space-y-4 sm:space-y-5">
                        <a href="mailto:darmarakha2@gmail.com" class="flex items-center gap-3 sm:gap-4 group">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 bg-accent-500/10 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
                                <i data-lucide="mail" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i></div>
                            <div class="min-w-0">
                                <p class="text-[10px] sm:text-xs text-navy-400 font-medium uppercase tracking-wider i18n-fade"
                                    data-i18n="contact.emailLabel">Email</p>
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 truncate">darmarakha2@gmail.com
                                </p>
                            </div>
                        </a>
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 bg-accent-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <i data-lucide="map-pin" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i></div>
                            <div>
                                <p class="text-[10px] sm:text-xs text-navy-400 font-medium uppercase tracking-wider i18n-fade"
                                    data-i18n="contact.locLabel">Lokasi</p>
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade"
                                    data-i18n="contact.locValue">Indonesia</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <i data-lucide="check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-green-500"></i></div>
                            <div>
                                <p class="text-[10px] sm:text-xs text-navy-400 font-medium uppercase tracking-wider i18n-fade"
                                    data-i18n="contact.statusLabel">Status</p>
                                <p class="text-xs sm:text-sm font-semibold text-green-600 i18n-fade"
                                    data-i18n="contact.statusValue">Terbuka untuk kesempatan</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lg:col-span-3 reveal" style="transition-delay:.15s">
                    <form id="contact-form"
                        class="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-navy-100">
                        <div class="grid sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
                            <div>
                                <label
                                    class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade"
                                    data-i18n="contact.nameLabel">Nama</label>
                                <input type="text" name="name" required data-i18n-placeholder="contact.namePh"
                                    placeholder="Nama lengkap"
                                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                            </div>
                            <div>
                                <label
                                    class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade"
                                    data-i18n="contact.emailInputLabel">Email</label>
                                <input type="email" name="email" required data-i18n-placeholder="contact.emailPh"
                                    placeholder="email@contoh.com"
                                    class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                            </div>
                        </div>
                        <div class="mb-3 sm:mb-5">
                            <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade"
                                data-i18n="contact.subjectLabel">Subjek</label>
                            <input type="text" name="subject" required data-i18n-placeholder="contact.subjectPh"
                                placeholder="Topik pesan Anda"
                                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                        </div>
                        <div class="mb-4 sm:mb-6">
                            <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade"
                                data-i18n="contact.msgLabel">Pesan</label>
                            <textarea name="message" rows="4" required data-i18n-placeholder="contact.msgPh"
                                placeholder="Tulis pesan Anda di sini..."
                                class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all resize-none"></textarea>
                        </div>
                        <button type="submit"
                            class="w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-navy-900 text-white font-semibold rounded-lg sm:rounded-xl active:scale-[0.98] transition-all duration-200 shadow-lg shadow-navy-900/20 text-sm sm:text-base">
                            <i data-lucide="send" class="w-4 h-4"></i>
                            <span data-i18n="contact.submit">Kirim Pesan</span>
                        </button>
                        <p id="form-error" class="text-red-500 text-xs sm:text-sm mt-2 sm:mt-3 hidden"></p>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <?php require __DIR__ . '/partials/footer.php'; ?>

    <div id="lightbox"
        class="lightbox fixed inset-0 z-[100] bg-navy-950/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-8">
        <button onclick="closeLightbox()"
            class="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors z-10 flex-shrink-0"
            aria-label="Close">
            <i data-lucide="x" class="w-4 h-4 sm:w-5 sm:h-5"></i>
        </button>
        <div class="lightbox-img w-full max-w-5xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
            <p id="lightbox-title"
                class="text-white text-center font-semibold mb-2 sm:mb-4 text-sm sm:text-lg flex-shrink-0 px-8"></p>
            <img id="lightbox-img" src="" alt=""
                class="w-full h-auto max-h-[80vh] object-contain rounded-lg sm:rounded-xl shadow-2xl"
                oncontextmenu="return false;">
            <iframe id="lightbox-pdf" src="" class="hidden w-full h-[80vh] rounded-lg sm:rounded-xl shadow-2xl bg-white"
                title="Certificate PDF" loading="lazy" sandbox="allow-same-origin allow-scripts"
                referrerpolicy="no-referrer"></iframe>
        </div>
    </div>

    <!-- MODAL UNTUK MELIHAT DETAIL PROYEK -->
    <div id="project-modal"
        class="lightbox fixed inset-0 z-[105] bg-navy-950/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden relative transition-transform transform scale-95 opacity-0"
            id="project-card">
            <button onclick="closeProjectModal()"
                class="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-navy-100 text-navy-600 transition-colors z-20 shadow-sm border border-navy-100"
                aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>

            <div class="overflow-y-auto p-4 sm:p-6 md:p-8">
                <div class="grid lg:grid-cols-5 gap-5 sm:gap-7 items-start">
                    <div class="lg:col-span-2">
                        <p class="text-accent-600 font-semibold text-xs tracking-widest uppercase mb-2"
                            data-i18n="proj.detailBtn">Detail Proyek</p>
                        <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900 mb-3 leading-tight"
                            id="project-modal-title">Judul Proyek</h3>
                        <div class="flex flex-wrap gap-2 mb-4" id="project-modal-tags"></div>
                        <img id="project-modal-img" src="" alt="Screenshot Proyek"
                            class="w-full h-auto max-h-72 object-contain bg-navy-50 rounded-xl mb-5 shadow-sm border border-navy-100">

                        <div class="space-y-4">
                            <div>
                                <h4 class="text-sm font-bold text-navy-900 mb-2">Ringkasan</h4>
                                <div class="text-sm sm:text-base text-navy-600 leading-relaxed" id="project-modal-desc">
                                    Deskripsi proyek akan tampil di sini.
                                </div>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-navy-900 mb-2">Penjelasan Detail</h4>
                                <div class="text-sm sm:text-base text-navy-600 leading-relaxed"
                                    id="project-modal-detail">
                                    Penjelasan detail proyek akan tampil di sini.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-3">
                        <div class="rounded-2xl border border-navy-100 bg-navy-50/70 overflow-hidden"
                            id="project-preview-container">
                            <div
                                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-navy-100 bg-white">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold text-accent-600 uppercase tracking-widest"
                                        data-i18n="proj.filePreview">Preview File Proyek</p>
                                    <p class="text-sm font-bold text-navy-900 truncate" id="project-file-label">Project
                                        file</p>
                                </div>
                                <a href="#" target="_blank" rel="noopener" id="project-modal-link"
                                    class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 transition-colors text-xs sm:text-sm whitespace-nowrap">
                                    <i data-lucide="external-link" class="w-4 h-4"></i>
                                    <span data-i18n="proj.openNewTab">Buka di Tab Baru</span>
                                </a>
                            </div>

                            <div class="bg-white" id="project-preview-body">
                                <iframe id="project-modal-frame" src="" class="hidden w-full h-[55vh] bg-white"
                                    title="Project Preview" loading="lazy"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"></iframe>
                                <img id="project-modal-preview-img" src="" alt="Preview File Proyek"
                                    class="hidden w-full h-auto max-h-[55vh] object-contain bg-white">
                                <div id="project-no-file" class="hidden p-6 text-sm text-navy-500 text-center">
                                    File proyek belum tersedia. Tambahkan <code
                                        class="px-1.5 py-0.5 bg-navy-100 rounded text-navy-700">fileUrl</code> di <code
                                        class="px-1.5 py-0.5 bg-navy-100 rounded text-navy-700">data.js</code>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="auth-modal"
        class="lightbox fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-transform transform scale-95 opacity-0"
            id="auth-card">
            <button onclick="closeAuthModal()"
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-navy-50 hover:bg-navy-100 text-navy-500 transition-colors z-10"
                aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="p-6 sm:p-8">
                <div class="text-center mb-6">
                    <div class="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-lg">DR</span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-navy-900" id="auth-title" data-i18n="auth.loginTitle">
                        Selamat Datang</h3>
                    <p class="text-sm text-navy-500 mt-1" id="auth-subtitle" data-i18n="auth.loginSub">Silakan masuk ke
                        akun Anda</p>
                </div>

                <form id="auth-form" class="space-y-4">
                    <input type="hidden" name="_csrf_token" value="<?php echo htmlspecialchars($gemu_csrf_token, ENT_QUOTES, 'UTF-8'); ?>">
                    <div id="auth-name-group" class="hidden">
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1"
                            data-i18n="contact.nameLabel">Nama</label>
                        <input type="text" id="auth-name" autocomplete="name"
                            class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1"
                            data-i18n="contact.emailInputLabel">Email</label>
                        <input type="email" id="auth-email" required autocomplete="email"
                            class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1"
                            data-i18n="auth.passLabel">Kata Sandi</label>
                        <input type="password" id="auth-pass" required autocomplete="current-password"
                            class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>

                    <button type="submit"
                        class="w-full py-3 bg-navy-900 text-white font-semibold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-navy-900/20 text-sm sm:text-base mt-2"
                        id="auth-submit-btn" data-i18n="auth.loginBtn">Masuk</button>
                </form>

                <div class="mt-6 text-center text-sm">
                    <span class="text-navy-500" id="auth-switch-text" data-i18n="auth.noAccount">Belum punya
                        akun?</span>
                    <button onclick="toggleAuthMode()"
                        class="text-accent-600 font-semibold hover:text-accent-700 transition-colors ml-1"
                        id="auth-switch-btn" data-i18n="auth.registerNow">Daftar sekarang</button>
                </div>
            </div>
        </div>
    </div>

    </div>

    <!-- SUCCESS OVERLAY FOR LOGIN/REGISTER -->
    <div id="success-overlay">
        <div class="success-card">
            <div class="check-icon">
                <i data-lucide="check" class="w-10 h-10"></i>
            </div>
            <h2 id="success-title" class="text-2xl font-bold text-white mb-2">Login Berhasil!</h2>
            <p id="success-message" class="text-navy-300">Selamat datang kembali, Darma.</p>
        </div>
    </div>

    <script src="data.js?v=<?php echo (int) $gemu_asset_version; ?>"></script>
    <script src="app.js?v=<?php echo (int) $gemu_asset_version; ?>"></script>
    <script src="AI/guide-widget.js?v=<?php echo (int) $gemu_asset_version; ?>" defer></script>

    <script>
        // SCRIPT GITHUB ACTIVITY
        document.addEventListener('DOMContentLoaded', () => {
            const githubUsername = 'darmarakha';

            // Elements
            const els = {
                avatar: document.getElementById('gh-avatar'),
                name: document.getElementById('gh-name'),
                login: document.getElementById('gh-login'),
                bio: document.getElementById('gh-bio'),
                reposCount: document.getElementById('gh-repos'),
                followers: document.getElementById('gh-followers'),
                following: document.getElementById('gh-following'),

            };

            // Skeletons
            const skeletons = [
                'gh-avatar-skeleton', 'gh-name-skeleton', 'gh-login-skeleton',
                'gh-bio-skeleton', 'gh-repos-skeleton', 'gh-followers-skeleton',
                'gh-following-skeleton'
            ];

            // Fetch Profile
            fetch(`https://api.github.com/users/${githubUsername}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message) throw new Error(data.message);

                    // Hide Skeletons
                    skeletons.forEach(id => {
                        const el = document.getElementById(id);
                        if(el) el.classList.add('hidden');
                    });

                    // Populate Data
                    els.avatar.src = data.avatar_url;
                    els.avatar.classList.remove('hidden');

                    els.name.textContent = data.name || data.login;
                    els.name.classList.remove('hidden');

                    els.login.textContent = `@${data.login}`;
                    els.login.classList.remove('hidden');

                    if (data.bio) {
                        els.bio.textContent = data.bio;
                        els.bio.classList.remove('hidden');
                    }

                    els.reposCount.textContent = data.public_repos;
                    els.reposCount.classList.remove('hidden');

                    els.followers.textContent = data.followers;
                    els.followers.classList.remove('hidden');

                    els.following.textContent = data.following;
                    els.following.classList.remove('hidden');
                })
                .catch(err => {
                    console.error('GitHub API Error (Profile):', err);
                });

            // Fetch Contributions from our backend API
            fetch('/api/github_contributions.php')
                .then(res => res.json())
                .then(data => {
                    const titleEl = document.getElementById('gh-contrib-title');
                    const monthsEl = document.getElementById('gh-contrib-months');
                    const gridEl = document.getElementById('gh-contrib-grid');

                    if (!data.ok || !data.weeks) {
                        titleEl.textContent = 'Contribution activity could not be loaded. Visit GitHub profile.';
                        titleEl.classList.add('text-red-400');
                        gridEl.innerHTML = '';
                        return;
                    }

                    titleEl.textContent = `${data.totalContributions} contributions in the last year`;

                    monthsEl.innerHTML = '';
                    gridEl.innerHTML = '';

                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    let currentMonth = -1;

                    data.weeks.forEach(week => {
                        if (week.days.length > 0) {
                            const firstDayDate = new Date(week.days[0].date);
                            const monthIndex = firstDayDate.getMonth();
                            // Check if this is the first week of a month (roughly)
                            if (monthIndex !== currentMonth) {
                                // Add month label
                                const span = document.createElement('span');
                                span.textContent = monthNames[monthIndex];
                                // Span spanning column
                                monthsEl.appendChild(span);
                                currentMonth = monthIndex;
                            } else {
                                const span = document.createElement('span');
                                monthsEl.appendChild(span); // Empty spacer
                            }
                        }

                        // Grid column
                        week.days.forEach(day => {
                            const cell = document.createElement('div');
                            cell.className = `gh-contrib-cell gh-level-${day.level}`;
                            cell.title = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`;
                            gridEl.appendChild(cell);
                        });
                    });
                })
                .catch(err => {
                    console.error('GitHub API Error (Contributions):', err);
                    const titleEl = document.getElementById('gh-contrib-title');
                    if (titleEl) {
                        titleEl.textContent = 'Failed to load contributions.';
                        titleEl.classList.add('text-red-400');
                    }
                });
        });

            // SCRIPT TAMBAHAN UNTUK HARD REFRESH OTOMATIS BROWSER
            (function () {
                const key = 'gemu_build_version';
                const current = window.__GEMU_BUILD_VERSION || String(Date.now());
                const previous = localStorage.getItem(key);
                if (previous && previous !== current && !sessionStorage.getItem('gemu_reloaded_' + current)) {
                    sessionStorage.setItem('gemu_reloaded_' + current, '1');
                    try {
                        ['portfolio-cache', 'gemu-guide-cache'].forEach(k => localStorage.removeItem(k));
                    } catch (e) { }
                    if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k))).finally(() => location.reload());
                    else location.reload();
                }
                localStorage.setItem(key, current);
                if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => { });
            })();

        window.onpageshow = function (event) {
            // Jika halaman ditarik dari cache (bfcache) akibat tombol back/forward
            if (event.persisted) {
                window.location.reload();
            }
        };

        // SCRIPT LOGIKA BUKA LIHAT PROYEK
        function openProjectModalFromData(encodedPayload) {
            try {
                const data = JSON.parse(decodeURIComponent(encodedPayload));
                openProjectModal(
                    data.title || 'Project',
                    data.image || '',
                    data.desc || '',
                    data.tags || [],
                    data.fileUrl || data.linkUrl || '',
                    data.detail || '',
                    data.fileLabel || data.title || 'Project file'
                );
            } catch (error) {
                console.error('Gagal membuka detail proyek:', error);
                alert('Detail proyek gagal dibuka. Cek format data proyek di data.js.');
            }
        }

        function openProjectModal(title, image, desc, tags, fileUrl = "", detail = "", fileLabel = "") {
            document.getElementById('project-modal-title').textContent = title;
            document.getElementById('project-modal-img').src = image || '';
            document.getElementById('project-modal-desc').innerHTML = desc || '-';
            document.getElementById('project-modal-detail').innerHTML = detail || desc || '-';
            document.getElementById('project-file-label').textContent = fileLabel || title;

            const tagsContainer = document.getElementById('project-modal-tags');
            tagsContainer.innerHTML = '';
            if (tags) {
                let tagsArray = Array.isArray(tags) ? tags : String(tags).split(',');
                tagsArray.forEach(tag => {
                    if (!String(tag).trim()) return;
                    tagsContainer.innerHTML += `<span class="px-2.5 py-1 bg-accent-50 text-accent-600 text-xs font-semibold rounded-md border border-accent-100">${String(tag).trim()}</span>`;
                });
            }

            const linkBtn = document.getElementById('project-modal-link');
            const frame = document.getElementById('project-modal-frame');
            const previewImg = document.getElementById('project-modal-preview-img');
            const noFile = document.getElementById('project-no-file');

            frame.classList.add('hidden');
            previewImg.classList.add('hidden');
            noFile.classList.add('hidden');
            frame.removeAttribute('src');
            previewImg.removeAttribute('src');

            const cleanUrl = (fileUrl || '').trim();
            if (cleanUrl && cleanUrl !== '#') {
                linkBtn.href = cleanUrl;
                linkBtn.classList.remove('hidden');

                const lower = cleanUrl.split('?')[0].split('#')[0].toLowerCase();
                const imageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
                const archiveExt = ['.zip', '.rar', '.7z'];

                if (imageExt.some(ext => lower.endsWith(ext))) {
                    previewImg.src = cleanUrl;
                    previewImg.classList.remove('hidden');
                } else if (archiveExt.some(ext => lower.endsWith(ext))) {
                    noFile.innerHTML = 'File proyek berbentuk arsip tidak bisa di-preview langsung di browser. Klik <b>Buka di Tab Baru</b> untuk mengakses file.';
                    noFile.classList.remove('hidden');
                } else {
                    frame.src = cleanUrl;
                    frame.classList.remove('hidden');
                }
            } else {
                linkBtn.classList.add('hidden');
                noFile.textContent = (typeof t === 'function') ? t('proj.noFile') : 'File proyek belum tersedia.';
                noFile.classList.remove('hidden');
            }

            const modal = document.getElementById('project-modal');
            const card = document.getElementById('project-card');
            modal.classList.add('active');
            setTimeout(() => {
                card.classList.remove('scale-95', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            }, 10);
            document.body.style.overflow = 'hidden';
            if (window.lucide) lucide.createIcons();
        }

        function closeProjectModal() {
            const modal = document.getElementById('project-modal');
            const card = document.getElementById('project-card');
            const frame = document.getElementById('project-modal-frame');
            card.classList.remove('scale-100', 'opacity-100');
            card.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.remove('active');
                frame.removeAttribute('src');
                document.body.style.overflow = '';
            }, 300);
        }

        // Tutup modal proyek saat klik area di luar card
        document.getElementById('project-modal').addEventListener('click', e => {
            if (e.target === document.getElementById('project-modal')) closeProjectModal();
        });

        // Script asli untuk warna teks username saat di-scroll
        const navUserName = document.getElementById('nav-user-name');
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 60;
            if (navUserName) {
                navUserName.classList.toggle('text-navy-900', scrolled);
                navUserName.classList.toggle('text-white', !scrolled);
            }
        });

        // SCRIPT VIBE CODING EFFECT
        document.addEventListener('DOMContentLoaded', () => {
            const vibeContainer = document.getElementById('vibe-coding-text');
            if (!vibeContainer) return;


            const vibeLines = [
                { text: "$ git status --short", color: "text-navy-300", delay: 800 },
                { text: "$ python analyze_profile.py", color: "text-navy-300", delay: 1000 },
                { text: "$ npm run build:portfolio", color: "text-navy-300", delay: 1200 },
                { text: "$ deploy --target gemuyokai", color: "text-navy-300", delay: 1500 },
                { text: "", color: "", delay: 500 },
                { text: "portfolio.ready()", color: "text-green-400", delay: 800 },
                { text: "stack: python · data · web", color: "text-white", delay: 500 },
                { text: "focus: data analysis / automation / web", color: "text-white", delay: 500 },
                { text: "research: COSINE-100 data quality", color: "text-white", delay: 500 },
                { text: "status: open_to_opportunities", color: "text-accent-400", delay: 500 }
            ];

            let vLine = 0;
            let vChar = 0;
            let vHtml = "";
            let vCursor = '<span class="inline-block w-2 h-4 bg-accent-400 animate-pulse ml-1 align-middle"></span>';

            function typeNextChar() {
                if (vLine >= vibeLines.length) {
                    vibeContainer.innerHTML = vHtml; // Remove cursor at end
                    return;
                }

                const line = vibeLines[vLine];
                if (vChar === 0) {
                    // Start of new line
                    if (vLine > 0) {
                        vHtml += "<br>";
                    }
                    if (line.text === "") {
                        vLine++;
                        setTimeout(typeNextChar, line.delay);
                        return;
                    }
                }

                let currentText = line.text.substring(0, vChar + 1);
                let coloredText = `<span class="${line.color}">${currentText}</span>`;

                vibeContainer.innerHTML = vHtml + coloredText + vCursor;

                vChar++;
                if (vChar >= line.text.length) {
                    vHtml += `<span class="${line.color}">${line.text}</span>`;
                    vLine++;
                    vChar = 0;
                    setTimeout(typeNextChar, line.delay);
                } else {
                    setTimeout(typeNextChar, 30 + Math.random() * 50);
                }
            }

            setTimeout(typeNextChar, 800);

        });
    </script>
    <!-- Scroll to Top Button -->
    <button id="scrollToTopBtn" class="fixed bottom-6 right-6 w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 z-50 hover:bg-accent-600 focus:outline-none" aria-label="Scroll to top">
        <i data-lucide="arrow-up" class="w-6 h-6"></i>
    </button>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const scrollBtn = document.getElementById('scrollToTopBtn');
            if (scrollBtn) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        scrollBtn.classList.remove('translate-y-20', 'opacity-0');
                    } else {
                        scrollBtn.classList.add('translate-y-20', 'opacity-0');
                    }
                });
                scrollBtn.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            if (window.lucide) lucide.createIcons();
        });
    </script>
</body>
</html>