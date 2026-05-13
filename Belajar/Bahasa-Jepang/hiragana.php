<?php
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true, 'samesite' => 'Lax',
]);
session_start();
require_once __DIR__ . '/../../config.php';

// =========================================================================
// API HANDLER: MENERIMA SKOR DARI JAVASCRIPT & MENYIMPAN KE SQL
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 1. Logika Update Progress (Skor)
    if (isset($input['update_progress']) && !empty($_SESSION['user_id'])) {
        try {
            $pdo = gemu_pdo();
            
            $points = (int)$input['points'];
            $userId = $_SESSION['user_id'];
            
            // Cek progress saat ini
            $stmt = $pdo->prepare("SELECT hiragana_score FROM user_progress WHERE user_id = :uid");
            $stmt->execute(['uid' => $userId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                $current_score = (int)$row['hiragana_score'];
                // Tambahkan poin, batas maksimal adalah 100%
                $new_score = min(100, max(0, $current_score + $points));
                
                $updateStmt = $pdo->prepare("UPDATE user_progress SET hiragana_score = :score WHERE user_id = :uid");
                $updateStmt->execute(['score' => $new_score, 'uid' => $userId]);
            } else {
                // Jika belum ada row di user_progress, buat baru
                $new_score = min(100, max(0, $points));
                $insertStmt = $pdo->prepare("INSERT INTO user_progress (user_id, hiragana_score, katakana_score, bunpou_score, kanji_score) VALUES (:uid, :score, 0, 0, 0)");
                $insertStmt->execute(['uid' => $userId, 'score' => $new_score]);
            }
            
            echo json_encode(['status' => 'success', 'new_score' => $new_score]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit;
        }
    }

    // 2. Logika Update Level AI (Menyimpan preferensi tingkat kesulitan ke Sesi)
    if (isset($input['update_level']) && !empty($_SESSION['user_id'])) {
        $_SESSION['ai_level'] = $input['level'];
        echo json_encode(['status' => 'success', 'level' => $input['level']]);
        exit;
    }
}

$isLoggedIn = !empty($_SESSION['user_name']);
$userName = $isLoggedIn ? $_SESSION['user_name'] : 'Guest';
$aiLevel = isset($_SESSION['ai_level']) ? $_SESSION['ai_level'] : 'pemula';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Belajar Hiragana Lengkap & AI Membaca</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        orange: { 450:'#FF5A1F', 500:'#F74E09', 600:'#D93D00' },
                        sakura: { 300:'#F9A8D4', 400:'#F472B6', 500:'#EC4899', 600:'#DB2777' },
                        dark: { 900:'#0a0a0a', 800:'#111111', 700:'#1a1a1a', 600:'#242424', 500:'#2e2e2e' }
                    },
                    fontFamily: { sans:['Inter','sans-serif'], jp:['Noto Sans JP','sans-serif'] }
                }
            }
        }
    </script>
    <style>
        body { font-family:'Inter',sans-serif; }

        /* Sakura Petals */
        @keyframes fall1{0%{transform:translate(0,-10%) rotate(0);opacity:0}10%{opacity:.6}90%{opacity:.3}100%{transform:translate(80px,110vh) rotate(360deg);opacity:0}}
        @keyframes fall2{0%{transform:translate(0,-10%) rotate(0);opacity:0}10%{opacity:.5}90%{opacity:.2}100%{transform:translate(-60px,110vh) rotate(-300deg);opacity:0}}
        @keyframes fall3{0%{transform:translate(0,-10%) rotate(0);opacity:0}10%{opacity:.7}90%{opacity:.3}100%{transform:translate(100px,110vh) rotate(420deg);opacity:0}}
        @keyframes fall4{0%{transform:translate(0,-10%) rotate(0);opacity:0}10%{opacity:.5}90%{opacity:.2}100%{transform:translate(-90px,110vh) rotate(-380deg);opacity:0}}
        .sakura-petal{position:fixed;width:10px;height:10px;background:radial-gradient(ellipse at center,#F9A8D4 0%,#F472B6 50%,transparent 70%);border-radius:50% 0 50% 0;pointer-events:none;z-index:5}

        /* Flashcard */
        .perspective-1000{perspective:1000px}
        .transform-style-3d{transform-style:preserve-3d}
        .backface-hidden{backface-visibility:hidden}
        .rotate-y-180{transform:rotateY(180deg)}
        .flip-card-inner{transition:transform .6s cubic-bezier(.4,.2,.2,1)}
        .flipped .flip-card-inner{transform:rotateY(180deg)}

        /* Tab fade */
        .tab-content{animation:fadeIn .4s ease-out forwards}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        /* Timer urgent */
        @keyframes urgentPulse{0%{color:#f43f5e;transform:scale(1)}50%{color:#fda4af;transform:scale(1.05)}100%{color:#f43f5e;transform:scale(1)}}
        .timer-urgent{animation:urgentPulse 1s infinite}

        /* Genkouyoushi grid (Background Kanji) */
        .genkouyoushi{
            position:relative;
            background:rgba(255,255,255,.02);
            border:2px solid rgba(255,255,255,.08);
        }
        .genkouyoushi::before{
            content:'';position:absolute;inset:0;pointer-events:none;
            background:
                linear-gradient(to right,transparent calc(50% - 1px),rgba(244,114,182,.12) calc(50% - 1px),rgba(244,114,182,.12) calc(50% + 1px),transparent calc(50% + 1px)),
                linear-gradient(to bottom,transparent calc(50% - 1px),rgba(244,114,182,.08) calc(50% - 1px),rgba(244,114,182,.08) calc(50% + 1px),transparent calc(50% + 1px));
        }
        .genkouyoushi::after{
            content:'';position:absolute;inset:0;pointer-events:none;
            background:
                linear-gradient(135deg,transparent calc(50% - 1px),rgba(244,114,182,.06) calc(50% - 1px),rgba(244,114,182,.06) calc(50% + 1px),transparent calc(50% + 1px)),
                linear-gradient(225deg,transparent calc(50% - 1px),rgba(244,114,182,.06) calc(50% - 1px),rgba(244,114,182,.06) calc(50% + 1px),transparent calc(50% + 1px));
        }

        /* Glass card */
        .glass-card{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.07)}

        /* Kana hover */
        .kana-cell{transition:all .3s cubic-bezier(.175,.885,.32,1.275)}
        .kana-cell:hover{transform:translateY(-4px) scale(1.05)}
        .kana-cell:hover .kana-char{text-shadow:0 0 20px currentColor}

        /* Scrollbar */
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0a0a0a}
        ::-webkit-scrollbar-thumb{background:#2e2e2e;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#F74E09}

        /* ===== Wikimedia GIF Stroke Board + Practice Canvas ===== */
        .stroke-board-wrap {
            position: relative;
            width: 280px;
            height: 220px;
            margin: 0 auto;
            overflow: hidden;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }

        #stroke-gif-image,
        #target-canvas,
        #practice-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
        }

        #stroke-gif-image {
            z-index: 3;
            object-fit: contain;
            opacity: 1;
            pointer-events: none;
            image-rendering: auto;
        }

        #target-canvas {
            z-index: 2;
            pointer-events: none;
        }

        #practice-canvas {
            z-index: 5;
            cursor: crosshair;
        }

        /* FIX MODAL: tombol silang tetap terlihat walau feedback AI membuat konten tinggi */
        #strokeModal {
            align-items: flex-start;
            overflow-y: auto;
            padding-top: 24px;
            padding-bottom: 24px;
        }
        .stroke-modal-card {
            max-height: calc(100vh - 48px);
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
        }
        .stroke-close-btn {
            position: sticky !important;
            top: 0;
            align-self: flex-end;
            margin-bottom: -36px;
            z-index: 60;
        }
        .stroke-modal-card::-webkit-scrollbar { width: 5px; }
        .stroke-modal-card::-webkit-scrollbar-track { background: rgba(255,255,255,.03); border-radius: 10px; }
        .stroke-modal-card::-webkit-scrollbar-thumb { background: rgba(244,114,182,.35); border-radius: 10px; }



        /* Update UI: kartu kana aman untuk PC/mobile, audio tidak menimpa romaji/dakuten */
        .kana-cell{
            min-height:118px;
            background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018));
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:3px;
        }
        .kana-char{line-height:1;}
        .kana-romaji-label{line-height:1.15;min-height:16px;display:flex;align-items:center;justify-content:center;}
        .kana-audio-btn{
            position:relative;
            width:46px;
            height:26px;
            margin-top:2px;
            border-radius:999px;
            background:rgba(249,115,22,.13);
            border:1px solid rgba(251,146,60,.22);
            color:#fdba74;
            font-size:12px;
            display:flex;
            align-items:center;
            justify-content:center;
            transition:.2s;
            z-index:8;
            flex:0 0 auto;
        }
        .kana-audio-btn:hover{background:rgba(249,115,22,.27);transform:scale(1.06)}
        .kana-cell-daku .kana-char,.kana-cell-handa .kana-char{padding-top:2px;padding-right:0;line-height:1;}
        .safe-scroll-x{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%;}
        .ai-safe-grid{display:grid;grid-template-columns:1fr;gap:1rem;max-width:100%;}
        @media (min-width:1024px){.ai-safe-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:1.5rem;}}
        .ai-panel-safe{min-width:0;max-width:100%;overflow:hidden;}
        .ai-panel-safe ul,.ai-panel-safe div{max-width:100%;}
        .ai-panel-safe .math-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:normal;word-break:break-word;}
        .ai-mobile-card{max-width:100%;overflow-x:hidden;}
        .tip-card{background:linear-gradient(135deg,rgba(236,72,153,.10),rgba(249,115,22,.08),rgba(96,165,250,.06));}
        .soft-glow-pink{box-shadow:0 0 35px rgba(236,72,153,.12)}
        .answer-choice:active{transform:scale(.98)}
        .feedback-mobile-safe{max-height:42vh;overflow-y:auto;overscroll-behavior:contain;}

        @media (min-width: 640px) {
            #strokeModal { align-items: center; }
        }
    </style>
</head>
<body class="bg-dark-900 text-white min-h-screen selection:bg-sakura-500 selection:text-white pb-20" data-logged-in="<?php echo $isLoggedIn?'true':'false'; ?>" data-ai-level="<?php echo htmlspecialchars($aiLevel); ?>">

    <div class="sakura-petal" style="left:5%;top:0;animation:fall1 12s linear infinite"></div>
    <div class="sakura-petal" style="left:20%;top:0;animation:fall2 10s linear infinite;animation-delay:3s"></div>
    <div class="sakura-petal" style="left:40%;top:0;animation:fall3 14s linear infinite;animation-delay:6s"></div>
    <div class="sakura-petal" style="left:60%;top:0;animation:fall4 9s linear infinite;animation-delay:1.5s"></div>
    <div class="sakura-petal" style="left:78%;top:0;animation:fall1 11s linear infinite;animation-delay:5s"></div>
    <div class="sakura-petal" style="left:92%;top:0;animation:fall3 13s linear infinite;animation-delay:8s"></div>
    <div class="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-sakura-400/[.03] rounded-full blur-[150px] pointer-events:none"></div>
    <div class="fixed bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-orange-500/[.03] rounded-full blur-[120px] pointer-events-none"></div>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6 relative z-10">

        <!-- HEADER -->
        <header class="glass-card rounded-3xl p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:justify-between relative overflow-hidden">
            <div class="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-sakura-400/15 to-transparent rounded-full blur-3xl pointer-events:none"></div>
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center font-jp font-black text-2xl text-white shadow-lg shadow-sakura-500/20 shrink-0">あ</div>
                <div>
                    <h1 class="text-2xl md:text-3xl font-black tracking-tight">
                        <span class="bg-gradient-to-r from-sakura-300 to-orange-400 bg-clip-text text-transparent">Materi Hiragana</span>
                    </h1>
                    <p class="text-neutral-400 text-sm mt-0.5 flex items-center gap-2">
                        <span class="text-xs font-jp text-sakura-400/60">ひらがな</span>
                        <span class="text-neutral-600">·</span> Flashcard & AI Membaca
                    </p>
                </div>
            </div>
            <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
                <?php if($isLoggedIn): ?>
                    <div class="flex items-center gap-3 bg-white/[.04] px-4 py-2.5 rounded-2xl border border-white/[.08] self-end w-full md:w-auto justify-end">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-sakura-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white shrink-0"><?php echo strtoupper(substr($userName,0,1)); ?></div>
                        <div class="text-right">
                            <p class="text-[11px] text-neutral-500 uppercase tracking-wider">Masuk sebagai</p>
                            <p class="text-sm text-white font-bold"><?php echo htmlspecialchars($userName); ?></p>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="flex items-center justify-end gap-2 bg-amber-500/[.08] px-4 py-2.5 rounded-2xl border border-amber-500/15 text-amber-300 text-sm font-medium self-end w-full md:w-auto">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i> Belum Login (Guest)
                    </div>
                <?php endif; ?>
                <div class="flex gap-2.5 w-full md:w-auto">
                    <a href="index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-white/[.05] hover:bg-white/[.1] text-neutral-300 font-semibold text-sm border border-white/[.08] hover:border-white/[.15] transition-all flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali
                    </a>
                    <a href="/index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-sakura-500 to-orange-500 hover:from-sakura-400 hover:to-orange-400 text-white font-semibold text-sm shadow-lg shadow-sakura-500/15 flex items-center gap-2">
                        <i data-lucide="home" class="w-4 h-4"></i> Home
                    </a>
                </div>
            </div>
        </header>

        <!-- TABS -->
        <nav class="flex flex-wrap sm:flex-nowrap gap-2 glass-card p-2 rounded-2xl">
            <button onclick="switchTab('materi')" id="tab-materi" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-sakura-500 to-sakura-600 text-white shadow-lg shadow-sakura-500/20">📚 Materi</button>
            <button onclick="switchTab('flashcard')" id="tab-flashcard" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-neutral-400 hover:text-white hover:bg-white/[.05]">🎴 Flashcard</button>
            <button onclick="switchTab('ai')" id="tab-ai" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20">📖 AI Membaca</button>
        </nav>

        <div class="glass-card rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/[.06]">
            <div class="text-sm text-neutral-400"><span class="text-sakura-300 font-bold">🌐 Bahasa / Language</span> · Pilih tampilan materi</div>
            <select onchange="setUILanguage(this.value)" class="bg-dark-800 border border-white/[.10] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-sakura-400/60">
                <option value="id">Indonesia</option>
                <option value="en">English</option>
            </select>
        </div>

        <div id="content-container" class="min-h-[500px]"></div>

        <footer class="mt-12 text-center">
            <div class="flex items-center justify-center gap-2 mb-3">
                <div class="w-6 h-px bg-white/10"></div><span class="text-lg">🌸</span><div class="w-6 h-px bg-white/10"></div>
            </div>
            <p class="text-neutral-600 text-sm"><strong class="text-neutral-400">by Darma</strong></p>
        </footer>

        <!-- ===== STROKE ORDER MODAL CANGGIH (Animasi per garis & Mode Latihan) ===== -->
        <div id="strokeModal" class="hidden fixed inset-0 bg-dark-900/90 z-50 flex justify-center px-4 backdrop-blur-sm transition-opacity">
            <div class="glass-card stroke-modal-card rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-sakura-400/20 flex flex-col items-center">
                <button onclick="hideStrokeModal()" class="stroke-close-btn text-neutral-500 hover:text-white bg-white/[.08] hover:bg-white/[.14] p-2 rounded-xl w-9 h-9 flex items-center justify-center transition border border-white/[.12] text-sm shadow-lg shadow-black/20">✕</button>

                <h3 class="text-lg font-bold text-sakura-400 mb-4 text-center w-full border-b border-white/[.06] pb-3">Papan Penulisan</h3>

                <!-- Mode Tabs -->
                <div class="flex items-center gap-2 mb-3 w-full">
                    <button onclick="hwAnimate()" id="mode-auto" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-sakura-500/20 text-sakura-300 border border-sakura-400/20 shadow-inner">✨ Tonton Animasi</button>
                    <button onclick="hwPractice()" id="mode-practice" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-white/[.04] text-neutral-400 border border-white/[.08] hover:bg-white/[.08]">✏️ Latihan Nulis</button>
                </div>

                <button onclick="playCurrentKanaSound(event)" id="modal-sound-btn" class="w-full mb-5 py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/20 text-orange-300 text-xs font-black tracking-wide transition-all flex items-center justify-center gap-2">
                    🔊 Dengarkan Suara
                </button>

                <!-- Papan Tulis: Animasi Wikimedia + Canvas Latihan -->
                <div class="genkouyoushi rounded-2xl w-full max-w-[280px] h-[220px] mx-auto mb-4 flex items-center justify-center p-2 relative overflow-hidden bg-dark-900 border-2 border-white/[.08] shadow-inner" style="touch-action: none;" id="modal-svg-container">
                    <div class="stroke-board-wrap">
                        <img id="stroke-gif-image" alt="Hiragana stroke order animation" draggable="false">
                        <canvas id="target-canvas" width="280" height="220"></canvas>
                        <canvas id="practice-canvas" width="280" height="220"></canvas>
                    </div>
                </div>

                <p class="text-center text-xs text-neutral-400 mb-5 h-4 font-medium" id="stroke-label">Memuat data garis...</p>

                <div class="grid grid-cols-2 gap-2 w-full mb-4">
                    <button onclick="resetWriting()" class="py-3 rounded-xl bg-white/[.06] hover:bg-white/[.1] border border-white/[.1] text-white text-sm font-bold transition-all">
                        ↻ Ulang
                    </button>
                    <button onclick="checkWritingScore()" class="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-sm font-bold transition-all">
                        ✓ Nilai Tulisan
                    </button>
                </div>

                <div id="scoreBox" class="hidden w-full bg-white/[.04] p-4 rounded-2xl border border-white/[.08] mb-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Skor Kemiripan</span>
                        <span id="scoreText" class="text-sm font-black text-sakura-300">0%</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-white/[.08] overflow-hidden mb-3">
                        <div id="scoreBar" class="h-full rounded-full bg-gradient-to-r from-sakura-500 to-orange-400 transition-all duration-500" style="width:0%"></div>
                    </div>
                    <p id="scoreNote" class="text-xs text-neutral-500 text-center">Tulis huruf terlebih dahulu, lalu klik Nilai Tulisan.</p>
                </div>

                <!-- Info Box -->
                <div class="w-full bg-white/[.04] p-4 rounded-2xl text-center mb-4 border border-white/[.08]">
                    <p class="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Romaji</p>
                    <p class="text-2xl font-mono text-orange-400 font-bold" id="modal-romaji">a</p>
                </div>

                <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 mb-2 w-full">
                    <span>Kategori: <strong class="text-sakura-300" id="modal-type">Seion</strong></span>
                    <span class="text-neutral-700">|</span>
                    <span>Total Goresan: <strong class="text-orange-300" id="modal-strokes">3</strong></span>
                </div>
                
                <p class="text-[10px] text-neutral-600 text-center w-full leading-relaxed">Tonton Animasi untuk melihat urutan goresan. Latihan Nulis memakai bayangan huruf dan skor kemiripan pixel.</p>
            </div>
        </div>
    </main>

    <script src="assets/js/hiragana-lang-id.js"></script>
    <script src="assets/js/hiragana-lang-en.js"></script>
    <script>
        const isLoggedIn = document.body.getAttribute('data-logged-in') === 'true';
        const LANG_PACKS = { id: window.HIRAGANA_LANG_ID || {}, en: window.HIRAGANA_LANG_EN || {} };
        let currentUILang = localStorage.getItem('hiragana_ui_lang') || 'id';
        function tr(key) { return (LANG_PACKS[currentUILang] && LANG_PACKS[currentUILang][key]) || (LANG_PACKS.id && LANG_PACKS.id[key]) || key; }
        window.setUILanguage = function(lang) {
            currentUILang = lang === 'en' ? 'en' : 'id';
            localStorage.setItem('hiragana_ui_lang', currentUILang);
            const activeTab = document.querySelector('nav button[class*="gradient"]')?.id?.replace('tab-', '') || 'materi';
            switchTab(activeTab);
        };


        // ====================================================================
        // AUDIO HIRAGANA
        // ====================================================================
        // File suara eksternal tidak ditempel ulang di file ini.
        // Simpan MP3 legal di: ./assets/audio/hiragana/a.mp3, i.mp3, u.mp3, ka.mp3, dst.
        // Bila file lokal belum ada, browser otomatis memakai Web Speech API Jepang.
        const kanaAudioCache = {};
        const kanaAudioBasePath = './assets/audio/hiragana/';
        let cachedJapaneseVoice = null;
        let speechWarmStarted = false;
        let speechUnlocked = false;

        function refreshJapaneseVoice() {
            if (!('speechSynthesis' in window)) return null;
            const voices = window.speechSynthesis.getVoices() || [];
            cachedJapaneseVoice = voices.find(v => /ja-JP/i.test(v.lang)) || voices.find(v => /ja|japanese/i.test(v.lang + ' ' + v.name)) || cachedJapaneseVoice;
            return cachedJapaneseVoice;
        }

        function warmJapaneseSpeechEngine() {
            if (speechWarmStarted || !('speechSynthesis' in window)) return;
            speechWarmStarted = true;
            refreshJapaneseVoice();
            let tries = 0;
            const loader = setInterval(() => {
                tries++;
                refreshJapaneseVoice();
                if (cachedJapaneseVoice || tries > 12) clearInterval(loader);
            }, 180);
        }

        function unlockSpeechOnce() {
            if (speechUnlocked || !('speechSynthesis' in window)) return;
            speechUnlocked = true;
            try {
                refreshJapaneseVoice();
                const u = new SpeechSynthesisUtterance('あ');
                u.lang = 'ja-JP';
                u.volume = 0.01;
                u.rate = 1.0;
                const v = refreshJapaneseVoice();
                if (v) u.voice = v;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(u);
                setTimeout(() => window.speechSynthesis.cancel(), 80);
            } catch (_) {}
        }
        warmJapaneseSpeechEngine();
        window.addEventListener('pointerdown', unlockSpeechOnce, { once:true, passive:true });
        window.addEventListener('touchstart', unlockSpeechOnce, { once:true, passive:true });

        function normalizeRomajiForAudio(romaji) {
            return String(romaji || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        }

        function stopAllKanaAudio() {
            Object.values(kanaAudioCache).forEach(audio => {
                try { audio.pause(); audio.currentTime = 0; } catch (_) {}
            });
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }

        function speakKanaWithJapaneseVoice(kana, romaji) {
            if (!('speechSynthesis' in window)) {
                alert('Browser ini belum mendukung suara otomatis. Tambahkan file MP3 lokal di folder assets/audio/hiragana/.');
                return;
            }

            const text = String(kana || '').trim() || String(romaji || '').trim();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.78;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            const jpVoice = cachedJapaneseVoice || refreshJapaneseVoice();
            if (jpVoice) utterance.voice = jpVoice;

            // Langsung speak pada klik yang sama. Tidak menunggu fallback MP3 agar respon cepat.
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        }

        const USE_LOCAL_MP3_FIRST = false;

        function playKanaSound(kana, romaji, event) {
            if (event) { event.preventDefault(); event.stopPropagation(); }
            stopAllKanaAudio();

            const key = normalizeRomajiForAudio(romaji);
            if (!USE_LOCAL_MP3_FIRST || !key) {
                speakKanaWithJapaneseVoice(kana, romaji);
                return;
            }

            const src = `${kanaAudioBasePath}${key}.mp3`;
            let audio = kanaAudioCache[key];
            if (!audio) {
                audio = new Audio(src);
                audio.preload = 'auto';
                kanaAudioCache[key] = audio;
            }

            audio.currentTime = 0;
            audio.onerror = () => speakKanaWithJapaneseVoice(kana, romaji);
            audio.play().catch(() => speakKanaWithJapaneseVoice(kana, romaji));
        }

        function playCurrentKanaSound(event) {
            playKanaSound(window.currentStrokeKana || '', window.currentStrokeRomaji || '', event);
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = () => refreshJapaneseVoice();
            refreshJapaneseVoice();
        }

        // ====================================================================
        // 1. API SQL & MACHINE LEARNING UTILITIES (NLP & ADAPTIVE)
        // ====================================================================
        function sendScore(correct, wrong, points) {
            if (!isLoggedIn) return;
            fetch('', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ update_progress: true, points: points, material: 'hiragana' }) 
            })
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') console.log('SQL Progress tersimpan: ' + data.new_score + '%');
            }).catch(err => console.error('Gagal menyimpan skor ke SQL:', err));
        }

        function saveAILevel(newLevel) {
            if (aiUserLevel === newLevel) return;
            aiUserLevel = newLevel;
            if (!isLoggedIn) return;
            fetch('', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ update_level: true, level: newLevel, material: 'hiragana' }) 
            }).catch(err => console.error('Gagal menyimpan level AI:', err));
        }

        // ML ALGORITHM 1: Levenshtein Distance (NLP) untuk deteksi typo
        function getLevenshteinDistance(a, b) {
            if(a.length === 0) return b.length;
            if(b.length === 0) return a.length;
            var matrix = [];
            for(var i=0; i<=b.length; i++){ matrix[i] = [i]; }
            for(var j=0; j<=a.length; j++){ matrix[0][j] = j; }
            for(var i=1; i<=b.length; i++){
                for(var j=1; j<=a.length; j++){
                    if(b.charAt(i-1) == a.charAt(j-1)){ matrix[i][j] = matrix[i-1][j-1]; }
                    else { matrix[i][j] = Math.min(matrix[i-1][j-1]+1, Math.min(matrix[i][j-1]+1, matrix[i-1][j]+1)); }
                }
            }
            return matrix[b.length][a.length];
        }

        // ML ALGORITHM 2: Fuzzy Logic & Decision Tree untuk Kelulusan Kalimat AI
        function evaluateAIResponse(inputStr, targetStr, timeTaken, currentLevel) {
            const dist = getLevenshteinDistance(inputStr, targetStr);
            const accuracy = Math.max(0, 100 - (dist / targetStr.length) * 100);
            const cps = targetStr.length / Math.max(1, timeTaken); // Kecepatan Mengetik (Char per Sec)
            
            let status = 'fail', points = 0, feedback = '', nextLevel = currentLevel;

            if (accuracy >= 90) { // Toleransi typo 10% diizinkan
                status = 'success';
                if (currentLevel === 'pemula') {
                    if (cps > 1.2) { nextLevel = 'mahir'; points = 25; feedback = `Luar Biasa! Akurasi ${accuracy.toFixed(1)}%, Kec: ${cps.toFixed(1)} c/s. AI Promosi ke MAHIR!`; }
                    else { points = 15; feedback = `Benar! Akurasi ${accuracy.toFixed(1)}%. Tingkatkan kecepatanmu.`; }
                } else if (currentLevel === 'mahir') {
                    if (cps > 2.0) { nextLevel = 'pro'; points = 40; feedback = `Sempurna! Akurasi ${accuracy.toFixed(1)}%, Kec: ${cps.toFixed(1)} c/s. AI Promosi ke PRO!`; }
                    else { points = 25; feedback = `Bagus Sekali! Akurasi ${accuracy.toFixed(1)}%. Latihan terus untuk kecepatan Pro.`; }
                } else {
                    points = 50; feedback = `Master Class! Kemampuan Anda setara Native. Kec: ${cps.toFixed(1)} c/s.`;
                }
            } else if (accuracy >= 65) { // Partial Credit (Cukup Paham tapi Typo banyak)
                status = 'partial';
                points = 5;
                feedback = `Hampir benar (Akurasi: ${accuracy.toFixed(1)}%). AI mendeteksi ada ${dist} huruf salah ketik.`;
            } else { // Fail & Demotion
                status = 'fail';
                points = -5;
                feedback = `Kurang Tepat (Akurasi: ${accuracy.toFixed(1)}%). AI menyarankan periksa pola kalimat.`;
                if (currentLevel === 'pro' && accuracy < 40) nextLevel = 'mahir';
                else if (currentLevel === 'mahir' && accuracy < 40) nextLevel = 'pemula';
            }
            
            return { status, points, feedback, nextLevel, accuracy, cps, distance: dist };
        }

        // ==========================================
        // 2. DATABASE HIRAGANA
        // ==========================================
        const dataGojuuon = [
            {k:'あ',r:'a',type:'Seion',s:3},{k:'い',r:'i',type:'Seion',s:2},{k:'う',r:'u',type:'Seion',s:2},{k:'え',r:'e',type:'Seion',s:2},{k:'お',r:'o',type:'Seion',s:3},
            {k:'か',r:'ka',type:'Seion',s:3},{k:'き',r:'ki',type:'Seion',s:4},{k:'く',r:'ku',type:'Seion',s:2},{k:'け',r:'ke',type:'Seion',s:3},{k:'こ',r:'ko',type:'Seion',s:2},
            {k:'さ',r:'sa',type:'Seion',s:3},{k:'し',r:'shi',type:'Seion',s:3},{k:'す',r:'su',type:'Seion',s:2},{k:'せ',r:'se',type:'Seion',s:3},{k:'そ',r:'so',type:'Seion',s:2},
            {k:'た',r:'ta',type:'Seion',s:4},{k:'ち',r:'chi',type:'Seion',s:3},{k:'つ',r:'tsu',type:'Seion',s:3},{k:'て',r:'te',type:'Seion',s:2},{k:'と',r:'to',type:'Seion',s:2},
            {k:'な',r:'na',type:'Seion',s:4},{k:'に',r:'ni',type:'Seion',s:3},{k:'ぬ',r:'nu',type:'Seion',s:2},{k:'ね',r:'ne',type:'Seion',s:2},{k:'の',r:'no',type:'Seion',s:2},
            {k:'は',r:'ha',type:'Seion',s:4},{k:'ひ',r:'hi',type:'Seion',s:3},{k:'ふ',r:'fu',type:'Seion',s:4},{k:'へ',r:'he',type:'Seion',s:2},{k:'ほ',r:'ho',type:'Seion',s:4},
            {k:'ま',r:'ma',type:'Seion',s:3},{k:'み',r:'mi',type:'Seion',s:3},{k:'む',r:'mu',type:'Seion',s:3},{k:'め',r:'me',type:'Seion',s:2},{k:'も',r:'mo',type:'Seion',s:3},
            {k:'や',r:'ya',type:'Seion',s:3},{k:'',r:'',type:'',s:0},{k:'ゆ',r:'yu',type:'Seion',s:2},{k:'',r:'',type:'',s:0},{k:'よ',r:'yo',type:'Seion',s:3},
            {k:'ら',r:'ra',type:'Seion',s:3},{k:'り',r:'ri',type:'Seion',s:2},{k:'る',r:'ru',type:'Seion',s:3},{k:'れ',r:'re',type:'Seion',s:2},{k:'ろ',r:'ro',type:'Seion',s:2},
            {k:'わ',r:'wa',type:'Seion',s:2},{k:'',r:'',type:'',s:0},{k:'を',r:'wo',type:'Seion',s:2},{k:'',r:'',type:'',s:0},{k:'ん',r:'n',type:'Seion',s:2}
        ];
        const dataDakuon = [
            {k:'が',r:'ga',type:'Dakuon',s:3},{k:'ぎ',r:'gi',type:'Dakuon',s:4},{k:'ぐ',r:'gu',type:'Dakuon',s:2},{k:'げ',r:'ge',type:'Dakuon',s:3},{k:'ご',r:'go',type:'Dakuon',s:2},
            {k:'ざ',r:'za',type:'Dakuon',s:3},{k:'じ',r:'ji',type:'Dakuon',s:3},{k:'ず',r:'zu',type:'Dakuon',s:2},{k:'ぜ',r:'ze',type:'Dakuon',s:3},{k:'ぞ',r:'zo',type:'Dakuon',s:2},
            {k:'だ',r:'da',type:'Dakuon',s:4},{k:'ぢ',r:'ji',type:'Dakuon',s:3},{k:'づ',r:'zu',type:'Dakuon',s:3},{k:'で',r:'de',type:'Dakuon',s:2},{k:'ど',r:'do',type:'Dakuon',s:2},
            {k:'ば',r:'ba',type:'Dakuon',s:4},{k:'び',r:'bi',type:'Dakuon',s:3},{k:'ぶ',r:'bu',type:'Dakuon',s:4},{k:'べ',r:'be',type:'Dakuon',s:2},{k:'ぼ',r:'bo',type:'Dakuon',s:4},
            {k:'ぱ',r:'pa',type:'Handakuon',s:4},{k:'ぴ',r:'pi',type:'Handakuon',s:3},{k:'ぷ',r:'pu',type:'Handakuon',s:4},{k:'ぺ',r:'pe',type:'Handakuon',s:2},{k:'ぽ',r:'po',type:'Handakuon',s:4}
        ];
        const dataYoon = [
            {k:'きゃ',r:'kya',type:'Yoon',s:4},{k:'きゅ',r:'kyu',type:'Yoon',s:4},{k:'きょ',r:'kyo',type:'Yoon',s:4},
            {k:'しゃ',r:'sha',type:'Yoon',s:5},{k:'しゅ',r:'shu',type:'Yoon',s:5},{k:'しょ',r:'sho',type:'Yoon',s:5},
            {k:'ちゃ',r:'cha',type:'Yoon',s:5},{k:'ちゅ',r:'chu',type:'Yoon',s:5},{k:'ちょ',r:'cho',type:'Yoon',s:5},
            {k:'にゃ',r:'nya',type:'Yoon',s:5},{k:'にゅ',r:'nyu',type:'Yoon',s:5},{k:'にょ',r:'nyo',type:'Yoon',s:5},
            {k:'ひゃ',r:'hya',type:'Yoon',s:5},{k:'ひゅ',r:'hyu',type:'Yoon',s:5},{k:'ひょ',r:'hyo',type:'Yoon',s:5},
            {k:'みゃ',r:'mya',type:'Yoon',s:5},{k:'みゅ',r:'myu',type:'Yoon',s:5},{k:'みょ',r:'myo',type:'Yoon',s:5},
            {k:'りゃ',r:'rya',type:'Yoon',s:5},{k:'りゅ',r:'ryu',type:'Yoon',s:5},{k:'りょ',r:'ryo',type:'Yoon',s:5},
            {k:'ぎゃ',r:'gya',type:'Yoon (Dakuon)',s:5},{k:'ぎゅ',r:'gyu',type:'Yoon (Dakuon)',s:5},{k:'ぎょ',r:'gyo',type:'Yoon (Dakuon)',s:5},
            {k:'じゃ',r:'ja',type:'Yoon (Dakuon)',s:5},{k:'じゅ',r:'ju',type:'Yoon (Dakuon)',s:5},{k:'じょ',r:'jo',type:'Yoon (Dakuon)',s:5},
            {k:'びゃ',r:'bya',type:'Yoon (Dakuon)',s:5},{k:'びゅ',r:'byu',type:'Yoon (Dakuon)',s:5},{k:'びょ',r:'byo',type:'Yoon (Dakuon)',s:5},
            {k:'ぴゃ',r:'pya',type:'Yoon (Handakuon)',s:5},{k:'ぴゅ',r:'pyu',type:'Yoon (Handakuon)',s:5},{k:'ぴょ',r:'pyo',type:'Yoon (Handakuon)',s:5}
        ];
        const allKana = [...dataGojuuon,...dataDakuon,...dataYoon].filter(i=>i.k!=='' && i.s>0);

        // ==========================================
        // 3. DATA CERITA AI & MATERI RENDER
        // ==========================================
        const aiReadingData = {
            pemula: [
                { hiragana:'わたしは にほんごを べんきょうします。', romaji:'watashi wa nihongo o benkyoushimasu', indo:'Saya belajar bahasa Jepang.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>私 (わたし)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>wa ta shi</span><br><span class='text-sm text-neutral-300'>Saya.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>日本語 (にほんご)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ni ho n go</span><br><span class='text-sm text-neutral-300'>Bahasa Jepang.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>勉強します (べんきょうします)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>be n kyo u shi ma su</span><br><span class='text-sm text-neutral-300'>Belajar.</span></li>", bunpouInfo:"$$\\text{[Subjek]} + \\text{は (wa)} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" },
                { hiragana:'あした がっこうへ いきます。', romaji:'ashita gakkou e ikimasu', indo:'Besok pergi ke sekolah.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>明日 (あした)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>a shi ta</span><br><span class='text-sm text-neutral-300'>Besok.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>学校 (がっこう)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ga k ko u</span><br><span class='text-sm text-neutral-300'>Sekolah.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>行きます (いきます)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>i ki ma su</span><br><span class='text-sm text-neutral-300'>Pergi.</span></li>", bunpouInfo:"$$\\text{[Waktu]} + \\text{[Tempat]} + \\text{へ (e)} + \\text{[Kata Kerja Perpindahan]}$$" },
                { hiragana:'まいにち りんごを たべます。', romaji:'mainichi ringo o tabemasu', indo:'Setiap hari makan apel.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>毎日 (まいにち)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ma i ni chi</span><br><span class='text-sm text-neutral-300'>Setiap hari.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>林檎 (りんご)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ri n go</span><br><span class='text-sm text-neutral-300'>Apel.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>食べます (たべます)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ta be ma su</span><br><span class='text-sm text-neutral-300'>Makan.</span></li>", bunpouInfo:"$$\\text{[Waktu Keterangan]} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" }
            ],
            mahir: [
                { hiragana:'むかしむかし、ある ところに、おじいさんと おばあさんが いました。', romaji:'mukashimukashi aru tokoroni ojiisan to obaasan ga imashita', indo:'Zaman dahulu kala, di suatu tempat, ada seorang kakek dan nenek.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>昔々 (むかしむかし)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>mu ka shi mu ka shi</span><br><span class='text-sm text-neutral-300'>Zaman dahulu kala.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>所 (ところ)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>to ko ro</span><br><span class='text-sm text-neutral-300'>Tempat.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>お爺さん (おじいさん)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>o ji i sa n</span><br><span class='text-sm text-neutral-300'>Kakek.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>お婆さん (おばあさん)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>o ba a sa n</span><br><span class='text-sm text-neutral-300'>Nenek.</span></li>", bunpouInfo:"$$\\text{[Waktu Lampau]} + \\text{、} + \\text{[Tempat]} + \\text{に} + \\text{、} + \\text{[Subjek 1]} + \\text{と} + \\text{[Subjek 2]} + \\text{が} + \\text{いました}$$" },
                { hiragana:'きょうの てんきは とても いいですから、こうえんを さんぽしましょう。', romaji:'kyou no tenkiwa totemo iidesukara kouen o sanposhimashou', indo:'Karena cuaca hari ini sangat bagus, mari kita jalan-jalan di taman.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>今日 (きょう)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>kyo u</span><br><span class='text-sm text-neutral-300'>Hari ini.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>天気 (てんき)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>te n ki</span><br><span class='text-sm text-neutral-300'>Cuaca.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>公園 (こうえん)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ko u e n</span><br><span class='text-sm text-neutral-300'>Taman.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>散歩しましょう (さんぽしましょう)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>sa n po shi ma sho u</span><br><span class='text-sm text-neutral-300'>Mari jalan-jalan.</span></li>", bunpouInfo:"$$\\text{[Alasan/Sebab]} + \\text{から (kara)} + \\text{、} + \\text{[Aktivitas Ajakan \~mashou]}$$" }
            ],
            pro: [
                { hiragana:'あきの ゆうぐれ、もみじが とても きれいでした。わたしたちは おちゃを のみながら、けしきを たのしみました。', romaji:'akinoyuugure momijiga totemo kireideshita watashitachiwa ocha o nominagara keshiki o tanoshimimashita', indo:'Di senja musim gugur, dedaunan merah sangatlah cantik. Kami menikmati pemandangan sambil meminum teh.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>秋 (あき)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>a ki</span><br><span class='text-sm text-neutral-300'>Musim gugur.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>夕暮れ (ゆうぐれ)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>yu u gu re</span><br><span class='text-sm text-neutral-300'>Senja.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>紅葉 (もみじ)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>mo mi ji</span><br><span class='text-sm text-neutral-300'>Daun musim gugur.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>綺麗 (きれい)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ki re i</span><br><span class='text-sm text-neutral-300'>Cantik.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>私達 (わたしたち)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>wa ta shi ta chi</span><br><span class='text-sm text-neutral-300'>Kami.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>お茶 (おちゃ)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>o cha</span><br><span class='text-sm text-neutral-300'>Teh.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>景色 (けしき)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ke shi ki</span><br><span class='text-sm text-neutral-300'>Pemandangan.</span></li>", bunpouInfo:"$$\\text{[Aktivitas 1 (Bentuk Masu Coret)]} + \\text{ながら} + \\text{、} + \\text{[Aktivitas 2]}$$<br><em>Nagara</em> digunakan untuk aktivitas yang dilakukan bersamaan (sambil)." },
                { hiragana:'にほんの ぶんかは とても おもしろいです。とくに、おまつりの ときに たべる たこやきが だいすきです。', romaji:'nihonnobunkawa totemo omoshiroidesu tokuni omatsurinotokini taberu takoyakiga daisukidesu', indo:'Budaya Jepang sangatlah menarik. Terutama, saya sangat suka takoyaki yang dimakan saat festival.', kanjiInfo:"<li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>日本 (にほん)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>ni ho n</span><br><span class='text-sm text-neutral-300'>Jepang.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>文化 (ぶんか)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>bu n ka</span><br><span class='text-sm text-neutral-300'>Budaya.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>面白い (おもしろい)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>o mo shi ro i</span><br><span class='text-sm text-neutral-300'>Menarik.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>特に (とくに)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>to ku ni</span><br><span class='text-sm text-neutral-300'>Terutama.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>お祭り (おまつり)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>o ma tsu ri</span><br><span class='text-sm text-neutral-300'>Festival.</span></li><li class='mb-3'><span class='text-sakura-400 font-bold text-lg'>大好き (だいすき)</span><br><span class='text-xs text-orange-300 font-mono tracking-widest'>da i su ki</span><br><span class='text-sm text-neutral-300'>Sangat suka.</span></li>", bunpouInfo:"$$\\text{[Kata Benda]} + \\text{の} + \\text{時に (Toki ni)}$$<br><em>Toki ni</em> berarti 'saat' atau 'ketika'." }
            ]
        };

        const contentDiv = document.getElementById('content-container');
        let aiUserLevel = document.body.getAttribute('data-ai-level') || 'pemula';
        let aiCurrentStory = null, aiTimerInterval = null, aiTimeElapsed = 0, aiTimeLimit = 0, aiTimeRemaining = 0, aiTimerStarted = false, aiFinished = false, aiCurrentFeedback = '', aiLastUserInput = '', aiLastEvaluation = null;
        let aiRecentByLevel = { pemula: [], mahir: [], pro: [] };

        function pickAdaptiveReadingStory(level) {
            const list = aiReadingData[level] || aiReadingData.pemula;
            let pool = list.filter(x => !aiRecentByLevel[level].includes(x.hiragana));
            if (pool.length < 1) { aiRecentByLevel[level] = []; pool = list; }
            // Acak berbobot ringan: pemula cenderung pendek, pro cenderung panjang.
            const weighted = [];
            pool.forEach(story => {
                const len = normalizeRomaji(story.romaji).length;
                let w = 3;
                if (level === 'pemula') w = len < 22 ? 5 : 3;
                if (level === 'mahir') w = len >= 35 ? 5 : 3;
                if (level === 'pro') w = len >= 70 ? 5 : 3;
                for (let i=0;i<w;i++) weighted.push(story);
            });
            const chosen = shuffleArray(weighted)[0] || pool[0];
            aiRecentByLevel[level].push(chosen.hiragana);
            if (aiRecentByLevel[level].length > Math.max(2, Math.floor(list.length * 0.65))) aiRecentByLevel[level].shift();
            return chosen;
        }

        // TABS
        function switchTab(tab) {
            ['materi','flashcard','ai'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if(!btn) return;
                if(t===tab) btn.className = t==='ai' ? "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20" : "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-sakura-500 to-sakura-600 text-white shadow-lg shadow-sakura-500/20";
                else btn.className = t==='ai' ? "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20" : "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-neutral-400 hover:text-white hover:bg-white/[.05]";
            });
            if(tab==='materi') renderMateri();
            if(tab==='flashcard'){ initFCWeights(); getNextFlashcard(); renderFlashcard(); }
            if(tab==='ai') initAIReading();
            if(window.MathJax) MathJax.typesetPromise().catch(()=>{});
        }
    </script>
    <script src="hiragana/materi.js"></script>
    <script src="hiragana/flashcard.js"></script>
    <script src="hiragana/ai-membaca.js"></script>
    <script>
        setTimeout(()=>{ const sel=document.querySelector('select[onchange*="setUILanguage"]'); if(sel) sel.value=currentUILang; },0);
        switchTab('materi');
    </script>
</body>
</html>
