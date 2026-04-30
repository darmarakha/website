<?php
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/', 'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true, 'samesite' => 'Lax',
]);
session_start();

// =========================================================================
// API HANDLER: MENERIMA SKOR DARI JAVASCRIPT & MENYIMPAN KE SQL
// =========================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // 1. Logika Update Progress (Skor)
    if (isset($input['update_progress']) && !empty($_SESSION['user_id'])) {
        $db_host = 'localhost';
        $db_user = 'httpgemu_darma';
        $db_pass = 'macanputih123';
        $db_name = 'httpgemu_website';
        
        try {
            $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
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

        /* ===== STROKE ORDER ANIMATION ===== */
        @keyframes drawStroke{to{stroke-dashoffset:0}}
        @keyframes fillStroke{0%,75%{fill-opacity:0}100%{fill-opacity:1}}
        @keyframes brushGlow{
            0%,100%{opacity:.3;transform:translate(-50%,-50%) scale(1)}
            50%{opacity:.8;transform:translate(-50%,-50%) scale(1.5)}
        }
        .stroke-draw{animation:drawStroke forwards ease-in-out}
        .stroke-fill{animation:fillStroke forwards ease-in-out}
        .stroke-dot-active{background:#F472B6!important;border-color:#F472B6!important;box-shadow:0 0 8px rgba(244,114,182,.5)}

        /* Genkouyoushi grid */
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

        <div id="content-container" class="min-h-[500px]"></div>

        <footer class="mt-12 text-center">
            <div class="flex items-center justify-center gap-2 mb-3">
                <div class="w-6 h-px bg-white/10"></div><span class="text-lg">🌸</span><div class="w-6 h-px bg-white/10"></div>
            </div>
            <p class="text-neutral-600 text-sm">Credit: <strong class="text-neutral-400">Darma</strong> — Dikembangkan dengan ❤️ & AI</p>
        </footer>

        <!-- ===== STROKE ORDER MODAL ===== -->
        <div id="strokeModal" class="hidden fixed inset-0 bg-dark-900/90 z-50 flex justify-center items-center px-4 backdrop-blur-sm transition-opacity">
            <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-sakura-400/20">
                <button onclick="hideStrokeModal()" class="absolute top-4 right-4 text-neutral-500 hover:text-white bg-white/[.05] hover:bg-white/[.1] p-2 rounded-xl w-9 h-9 flex items-center justify-center transition border border-white/[.08] text-sm">✕</button>

                <h3 class="text-lg font-bold text-sakura-400 mb-5 text-center">Cara Penulisan</h3>

                <!-- Genkouyoushi Grid + SVG Animation -->
                <div class="genkouyoushi rounded-2xl w-48 h-48 mx-auto mb-5 flex items-center justify-center relative overflow-hidden" id="modal-svg-container">
                    <!-- Brush glow indicator -->
                    <div id="brush-glow" class="absolute w-6 h-6 rounded-full bg-sakura-400/40 blur-md pointer-events-none" style="top:30%;left:30%;animation:brushGlow 1.5s ease-in-out infinite"></div>
                    <!-- SVG akan di-inject via JS -->
                    <div id="modal-svg" class="relative z-10"></div>
                </div>

                <!-- Stroke Progress Dots -->
                <div class="flex items-center justify-center gap-2 mb-4" id="stroke-dots"></div>
                <p class="text-center text-xs text-neutral-500 mb-4" id="stroke-label">Menulis...</p>

                <!-- Info -->
                <div class="bg-white/[.04] p-4 rounded-2xl text-center mb-4 border border-white/[.08]">
                    <p class="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Romaji</p>
                    <p class="text-2xl font-mono text-orange-400 font-bold" id="modal-romaji">a</p>
                </div>

                <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 mb-4">
                    <span>Kategori: <strong class="text-sakura-300" id="modal-type">Seion</strong></span>
                    <span class="text-neutral-700">|</span>
                    <span>Goresan: <strong class="text-orange-300" id="modal-strokes">3</strong></span>
                </div>

                <div class="p-4 bg-dark-900 border border-white/[.06] rounded-2xl text-sm text-neutral-300 text-left leading-relaxed">
                    <strong class="text-white block mb-2 text-xs">📌 Panduan Coretan:</strong>
                    <ul class="list-disc pl-4 mt-1 space-y-0.5 text-neutral-400 text-xs">
                        <li>Dari <strong class="text-neutral-200">Kiri</strong> ke <strong class="text-neutral-200">Kanan</strong></li>
                        <li>Dari <strong class="text-neutral-200">Atas</strong> ke <strong class="text-neutral-200">Bawah</strong></li>
                        <li>Perhatikan ujung garis (Tome, Hane, Harai)</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>

    <script>
        const isLoggedIn = document.body.getAttribute('data-logged-in') === 'true';

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
            
            return { status, points, feedback, nextLevel, accuracy, cps };
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
                { hiragana:'わたしは にほんごを べんきょうします。', romaji:'watashi wa nihongo o benkyoushimasu', indo:'Saya belajar bahasa Jepang.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>私 (わたし)</span> : Saya.</li><li><span class='text-sakura-400 font-bold text-lg'>日本語 (にほんご)</span> : Bahasa Jepang.</li><li><span class='text-sakura-400 font-bold text-lg'>勉強します (べんきょうします)</span> : Belajar.</li>", bunpouInfo:"$$\\text{[Subjek]} + \\text{は (wa)} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" },
                { hiragana:'あした がっこうへ いきます。', romaji:'ashita gakkou e ikimasu', indo:'Besok pergi ke sekolah.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>明日 (あした)</span> : Besok.</li><li><span class='text-sakura-400 font-bold text-lg'>学校 (がっこう)</span> : Sekolah.</li><li><span class='text-sakura-400 font-bold text-lg'>行きます (いきます)</span> : Pergi.</li>", bunpouInfo:"$$\\text{[Waktu]} + \\text{[Tempat]} + \\text{へ (e)} + \\text{[Kata Kerja Perpindahan]}$$" },
                { hiragana:'まいにち りんごを たべます。', romaji:'mainichi ringo o tabemasu', indo:'Setiap hari makan apel.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>毎日 (まいにち)</span> : Setiap hari.</li><li><span class='text-sakura-400 font-bold text-lg'>林檎 (りんご)</span> : Apel.</li><li><span class='text-sakura-400 font-bold text-lg'>食べます (たべます)</span> : Makan.</li>", bunpouInfo:"$$\\text{[Waktu Keterangan]} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" }
            ],
            mahir: [
                { hiragana:'むかしむかし、ある ところに、おじいさんと おばあさんが いました。', romaji:'mukashimukashi aru tokoroni ojiisan to obaasan ga imashita', indo:'Zaman dahulu kala, di suatu tempat, ada seorang kakek dan nenek.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>昔々 (むかしむかし)</span> : Zaman dahulu kala.</li><li><span class='text-sakura-400 font-bold text-lg'>所 (ところ)</span> : Tempat.</li><li><span class='text-sakura-400 font-bold text-lg'>お爺さん (おじいさん)</span> : Kakek.</li><li><span class='text-sakura-400 font-bold text-lg'>お婆さん (おばあさん)</span> : Nenek.</li>", bunpouInfo:"$$\\text{[Waktu Lampau]} + \\text{、} + \\text{[Tempat]} + \\text{に} + \\text{、} + \\text{[Subjek 1]} + \\text{と} + \\text{[Subjek 2]} + \\text{が} + \\text{いました}$$" },
                { hiragana:'きょうの てんきは とても いいですから、こうえんを さんぽしましょう。', romaji:'kyou no tenkiwa totemo iidesukara kouen o sanposhimashou', indo:'Karena cuaca hari ini sangat bagus, mari kita jalan-jalan di taman.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>今日 (きょう)</span> : Hari ini.</li><li><span class='text-sakura-400 font-bold text-lg'>天気 (てんき)</span> : Cuaca.</li><li><span class='text-sakura-400 font-bold text-lg'>公園 (こうえん)</span> : Taman.</li><li><span class='text-sakura-400 font-bold text-lg'>散歩しましょう (さんぽしましょう)</span> : Mari jalan-jalan.</li>", bunpouInfo:"$$\\text{[Alasan/Sebab]} + \\text{から (kara)} + \\text{、} + \\text{[Aktivitas Ajakan \~mashou]}$$" }
            ],
            pro: [
                { hiragana:'あきの ゆうぐれ、もみじが とても きれいでした。わたしたちは おちゃを のみながら、けしきを たのしみました。', romaji:'akinoyuugure momijiga totemo kireideshita watashitachiwa ocha o nominagara keshiki o tanoshimimashita', indo:'Di senja musim gugur, dedaunan merah sangatlah cantik. Kami menikmati pemandangan sambil meminum teh.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>秋 (あき)</span> : Musim gugur.</li><li><span class='text-sakura-400 font-bold text-lg'>夕暮れ (ゆうぐれ)</span> : Senja.</li><li><span class='text-sakura-400 font-bold text-lg'>紅葉 (もみじ)</span> : Daun musim gugur.</li><li><span class='text-sakura-400 font-bold text-lg'>綺麗 (きれい)</span> : Cantik.</li><li><span class='text-sakura-400 font-bold text-lg'>私達 (わたしたち)</span> : Kami.</li><li><span class='text-sakura-400 font-bold text-lg'>お茶 (おちゃ)</span> : Teh.</li><li><span class='text-sakura-400 font-bold text-lg'>景色 (けしき)</span> : Pemandangan.</li>", bunpouInfo:"$$\\text{[Aktivitas 1 (Bentuk Masu Coret)]} + \\text{ながら} + \\text{、} + \\text{[Aktivitas 2]}$$<br><em>Nagara</em> digunakan untuk aktivitas yang dilakukan bersamaan (sambil)." },
                { hiragana:'にほんの ぶんかは とても おもしろいです。とくに、おまつりの ときに たべる たこやきが だいすきです。', romaji:'nihonnobunkawa totemo omoshiroidesu tokuni omatsurinotokini taberu takoyakiga daisukidesu', indo:'Budaya Jepang sangatlah menarik. Terutama, saya sangat suka takoyaki yang dimakan saat festival.', kanjiInfo:"<li><span class='text-sakura-400 font-bold text-lg'>日本 (にほん)</span> : Jepang.</li><li><span class='text-sakura-400 font-bold text-lg'>文化 (ぶんか)</span> : Budaya.</li><li><span class='text-sakura-400 font-bold text-lg'>面白い (おもしろい)</span> : Menarik.</li><li><span class='text-sakura-400 font-bold text-lg'>特に (とくに)</span> : Terutama.</li><li><span class='text-sakura-400 font-bold text-lg'>お祭り (おまつり)</span> : Festival.</li><li><span class='text-sakura-400 font-bold text-lg'>大好き (だいすき)</span> : Sangat suka.</li>", bunpouInfo:"$$\\text{[Kata Benda]} + \\text{の} + \\text{時に (Toki ni)}$$<br><em>Toki ni</em> berarti 'saat' atau 'ketika'." }
            ]
        };

        const contentDiv = document.getElementById('content-container');
        let aiUserLevel = document.body.getAttribute('data-ai-level') || 'pemula';
        let aiCurrentStory = null, aiTimerInterval = null, aiTimeElapsed = 0, aiTimeLimit = 0, aiTimeRemaining = 0, aiTimerStarted = false, aiFinished = false, aiCurrentFeedback = '';

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

        window.checkQuickAnswer = (ans) => {
            const ok = (ans === 'a');
            const msg = document.getElementById('hir-msg');
            if(ok){ msg.className='mt-3 text-sm font-bold text-emerald-300'; msg.innerHTML='✅ Benar, +10 poin dikirim ke Leaderboard!'; sendScore(1,0,10); }
            else{ msg.className='mt-3 text-sm font-bold text-rose-300'; msg.innerHTML='❌ Salah, jawaban benar: a'; sendScore(0,1,-3); }
        };

        function buildGrid(data, cols=5) {
            let h = `<div class="grid grid-cols-3 sm:grid-cols-${cols} gap-2 sm:gap-3 mb-8">`;
            data.forEach(item => {
                if(item.k==='') { h += '<div class="hidden sm:block"></div>'; return; }
                h += `<div onclick="showStrokeModal('${item.k}','${item.r}','${item.type}',${item.s})"
                    class="kana-cell glass-card rounded-2xl p-3 sm:p-4 text-center cursor-pointer group flex flex-col items-center justify-center border border-white/[.06] hover:border-sakura-400/30">
                    <div class="kana-char text-3xl sm:text-4xl font-black text-sakura-300 mb-1 font-jp transition-all">${item.k}</div>
                    <div class="text-[11px] sm:text-xs text-orange-400/70 font-mono tracking-widest">${item.r}</div>
                </div>`;
            });
            h += '</div>';
            return h;
        }

        function renderMateri() {
            contentDiv.innerHTML = `
                <div class="tab-content space-y-6">
                    <section class="glass-card rounded-3xl p-5 sm:p-6 border border-blue-400/15 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-[60px] pointer-events:none"></div>
                        <h2 class="text-lg sm:text-xl font-bold flex items-center gap-2 text-blue-300 relative">
                            <div class="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center"><i data-lucide="zap" class="w-4 h-4 text-blue-400"></i></div> Latihan Cepat
                        </h2>
                        <p class="text-sm text-neutral-400 mt-3 relative">Romaji dari <span class="text-2xl font-jp font-black text-sakura-300 mx-1">あ</span> adalah?</p>
                        <div class="mt-4 flex flex-wrap gap-2 sm:gap-3 relative">
                            <button onclick="checkQuickAnswer('a')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.08] hover:border-sakura-400/40 transition-all font-mono font-bold text-lg text-white">a</button>
                            <button onclick="checkQuickAnswer('i')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.08] hover:border-sakura-400/40 transition-all font-mono font-bold text-lg text-white">i</button>
                            <button onclick="checkQuickAnswer('u')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.08] hover:border-sakura-400/40 transition-all font-mono font-bold text-lg text-white">u</button>
                        </div>
                        <p id="hir-msg" class="mt-3 text-sm font-medium h-6 relative"></p>
                    </section>
                    <div class="glass-card rounded-2xl p-4 border border-sakura-400/10 text-sm flex gap-3 items-center">
                        <span class="text-xl shrink-0">💡</span>
                        <p class="text-neutral-300"><strong class="text-sakura-300">Tips:</strong> Klik huruf Hiragana untuk melihat <strong class="text-white">animasi cara penulisan</strong>!</p>
                    </div>
                    <section class="glass-card rounded-3xl p-5 md:p-8 relative overflow-hidden">
                        <div class="absolute -top-20 -left-20 w-40 h-40 bg-sakura-400/5 rounded-full blur-[80px] pointer-events:none"></div>
                        <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                            <span class="w-8 h-8 rounded-lg bg-sakura-400/10 text-sakura-400 text-xs font-black flex items-center justify-center border border-sakura-400/15">01</span>
                            <span class="text-white">Huruf Dasar</span>
                            <span class="text-xs font-jp text-sakura-400/40">五十音</span>
                        </h2>
                        ${buildGrid(dataGojuuon,5)}
                    </section>
                    <section class="grid lg:grid-cols-2 gap-5">
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-orange-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-400/5 rounded-full blur-[60px] pointer-events:none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-orange-400/10 text-orange-400 text-xs font-black flex items-center justify-center border border-orange-400/15">02</span>
                                <span class="text-white">Dakuon & Handakuon</span>
                            </h2>
                            ${buildGrid(dataDakuon,5)}
                        </div>
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-purple-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-400/5 rounded-full blur-[60px] pointer-events:none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 text-xs font-black flex items-center justify-center border border-purple-400/15">03</span>
                                <span class="text-white">Bunyi Campuran</span>
                                <span class="text-xs text-purple-400/40">拗音</span>
                            </h2>
                            ${buildGrid(dataYoon,3)}
                        </div>
                    </section>
                </div>`;
            lucide.createIcons();
        }

        // ==========================================
        // 5b. STROKE ORDER MODAL DENGAN ANIMASI
        // ==========================================
        let strokeAnimTimeout = [];

        window.showStrokeModal = (k, r, type, strokes) => {
            strokeAnimTimeout.forEach(t => clearTimeout(t)); strokeAnimTimeout = [];
            document.getElementById('modal-romaji').innerText = r;
            document.getElementById('modal-type').innerText = type;
            document.getElementById('modal-strokes').innerText = strokes;

            let dotsHtml = '';
            for(let i=0; i<strokes; i++) dotsHtml += `<span class="stroke-dot w-3 h-3 rounded-full bg-white/10 border border-white/20 transition-all duration-300" data-i="${i}"></span>`;
            
            document.getElementById('stroke-dots').innerHTML = dotsHtml;
            document.getElementById('stroke-label').innerText = 'Menulis...';
            document.getElementById('stroke-label').className = 'text-center text-xs text-sakura-400 mb-4';

            const charLen = k.length;
            const svgFontSize = charLen <= 1 ? 130 : charLen === 2 ? 90 : 65;
            const totalDur = strokes * 0.55; 

            document.getElementById('modal-svg').innerHTML = `
                <svg viewBox="0 0 200 200" class="w-full h-full" style="font-family:'Noto Sans JP','Yu Mincho',serif">
                    <text x="100" y="${charLen<=1?145:135}" text-anchor="middle" font-size="${svgFontSize}"
                        fill="transparent" stroke="#F472B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                        stroke-dasharray="900" stroke-dashoffset="900" class="stroke-draw" style="animation-duration:${totalDur}s">${k}</text>
                    <text x="100" y="${charLen<=1?145:135}" text-anchor="middle" font-size="${svgFontSize}"
                        fill="white" fill-opacity="0" class="stroke-fill" style="animation-duration:${totalDur}s">${k}</text>
                </svg>`;

            const dotEls = document.querySelectorAll('.stroke-dot');
            const perStroke = (totalDur * 1000) / strokes;
            dotEls.forEach((dot, i) => { strokeAnimTimeout.push(setTimeout(() => dot.classList.add('stroke-dot-active'), (i + 1) * perStroke)); });

            strokeAnimTimeout.push(setTimeout(() => {
                document.getElementById('stroke-label').innerText = '✅ Selesai!';
                document.getElementById('stroke-label').className = 'text-center text-xs text-emerald-400 mb-4 font-semibold';
            }, totalDur * 1000 + 200));

            document.getElementById('strokeModal').classList.remove('hidden');
        };

        window.hideStrokeModal = () => {
            document.getElementById('strokeModal').classList.add('hidden');
            document.getElementById('modal-svg').innerHTML = '';
            strokeAnimTimeout.forEach(t => clearTimeout(t)); strokeAnimTimeout = [];
        };

        // ====================================================================
        // 6. ML ALGORITHM 3: SPACED REPETITION SYSTEM (SRS) UNTUK FLASHCARD
        // AI Mengingat huruf yang sering salah dan memunculkannya lebih sering
        // ====================================================================
        let fcWeights = {}, isCardFlipped = false, currentFCItem = null, fcSessionTotal = 0;

        function initFCWeights() {
            if(Object.keys(fcWeights).length === 0) {
                allKana.forEach(k => fcWeights[k.r] = 1.0); // Base probability 100%
            }
        }

        function getNextFlashcard() {
            let totalWeight = 0;
            for(let r in fcWeights) totalWeight += fcWeights[r];
            let rand = Math.random() * totalWeight;
            
            // Roulette Wheel Selection (ML Weights)
            for(let i=0; i<allKana.length; i++) {
                rand -= fcWeights[allKana[i].r];
                if(rand <= 0) {
                    currentFCItem = allKana[i];
                    fcSessionTotal++;
                    return;
                }
            }
            currentFCItem = allKana[0];
        }

        function updateFCWeight(romaji, isCorrect) {
            if(isCorrect) {
                fcWeights[romaji] = Math.max(0.1, fcWeights[romaji] * 0.4); // Probabilitas diturunkan drastis jika benar
            } else {
                fcWeights[romaji] = Math.min(10.0, fcWeights[romaji] * 3.0); // Probabilitas dinaikkan 3x lipat jika salah (AI Penalty)
            }
        }

        function renderFlashcard() {
            const item = currentFCItem;
            const cl = item.k.length;
            const fSize = cl <= 1 ? 'text-[8rem]' : cl === 2 ? 'text-[5.5rem]' : 'text-[4rem]';
            const bSize = item.r.length <= 2 ? 'text-6xl' : item.r.length <= 3 ? 'text-5xl' : 'text-4xl';

            contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 tab-content">
                    <div class="mb-5 text-center">
                        <span class="glass-card px-4 py-1.5 rounded-full text-sm font-semibold text-sakura-300 border border-sakura-400/15">AI Adaptive Spaced Repetition · Sesi ke-${fcSessionTotal}</span>
                        <p class="text-neutral-500 mt-2 text-sm">Ketik Romaji lalu Kirim atau Enter</p>
                    </div>

                    <div class="perspective-1000 w-64 ${cl>=3?'h-72':'h-80'} mb-2 cursor-pointer ${isCardFlipped?'flipped':''}" onclick="toggleFlashcard()">
                        <div class="flip-card-inner relative w-full h-full transform-style-3d shadow-2xl rounded-3xl">
                            <div class="absolute w-full h-full backface-hidden bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-white/[.08] rounded-3xl flex items-center justify-center p-4">
                                <span class="${fSize} font-black text-sakura-300 font-jp drop-shadow-lg leading-none">${item.k}</span>
                            </div>
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-orange-600/20 to-dark-800 border-2 border-orange-400/30 rounded-3xl flex flex-col items-center justify-center p-4">
                                <span class="text-2xl mb-2">🎉</span>
                                <span class="text-sm text-orange-200 mb-1 font-bold">Jawaban Anda</span>
                                <span class="${bSize} font-black text-white font-mono uppercase">${item.r}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col items-center w-full max-w-xs mx-auto mb-6 mt-4">
                        <div class="flex w-full gap-2 relative">
                            <input type="text" id="fc-input"
                                class="flex-1 w-full bg-dark-800 border-2 border-white/[.08] rounded-2xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-sakura-400/60 transition placeholder-neutral-600"
                                placeholder="Ketik romaji..." autocomplete="off" autocapitalize="none"
                                ${isCardFlipped?'disabled':''}
                                oninput="document.getElementById('fc-msg').innerHTML=''"
                                onkeydown="if(event.key==='Enter'){event.preventDefault();submitFCAnswer();}">
                            <button onclick="submitFCAnswer()" class="bg-gradient-to-r from-sakura-500 to-sakura-600 hover:from-sakura-400 hover:to-sakura-500 text-white p-3 rounded-2xl transition flex items-center justify-center shadow-lg shadow-sakura-500/20" ${isCardFlipped?'disabled':''}>
                                <i data-lucide="send" class="w-5 h-5"></i>
                            </button>
                            ${isCardFlipped?'<div class="absolute right-[4.5rem] top-3.5 text-sakura-400 font-black text-xl">✓</div>':''}
                        </div>
                        <p id="fc-msg" class="h-6 mt-2 text-sm font-bold text-rose-400 text-center"></p>
                    </div>
                    <button onclick="skipFlashcard()" class="px-6 py-2.5 rounded-xl bg-white/[.05] hover:bg-white/[.1] transition font-semibold text-sm text-neutral-400 border border-white/[.08]">Lewati →</button>
                </div>`;
            lucide.createIcons();
            if(!isCardFlipped && window.innerWidth>640) setTimeout(()=>{const e=document.getElementById('fc-input');if(e)e.focus();},100);
        }

        window.toggleFlashcard = () => { isCardFlipped = !isCardFlipped; renderFlashcard(); };
        window.submitFCAnswer = () => {
            if(isCardFlipped) return;
            const inp = document.getElementById('fc-input'), msg = document.getElementById('fc-msg');
            const val = inp.value.trim().toLowerCase(), item = currentFCItem;
            
            if(val===''){ msg.innerText='⚠️ Jawaban tidak boleh kosong.'; return; }
            
            const isCorrect = (val === item.r);
            updateFCWeight(item.r, isCorrect); // Train AI SRS

            if(isCorrect){
                msg.className='h-6 mt-2 text-sm font-bold text-emerald-400 text-center';
                msg.innerText='✅ Benar! AI mencatat perkembangan Anda.';
                isCardFlipped=true;
                sendScore(1,0,5);
                renderFlashcard();
                setTimeout(()=>{ if(isCardFlipped) advanceFlashcard(); }, 1200);
            } else {
                msg.className='h-6 mt-2 text-sm font-bold text-rose-400 text-center';
                msg.innerText='❌ Salah, AI akan mengulang huruf ini nanti.';
                sendScore(0,1,-2);
                inp.value=''; inp.focus();
            }
        };
        window.skipFlashcard = () => advanceFlashcard();
        function advanceFlashcard() { isCardFlipped=false; getNextFlashcard(); renderFlashcard(); }

        // ==========================================
        // 7. AI MEMBACA MENGGUNAKAN FUZZY LOGIC & NLP
        // ==========================================
        function normalizeRomaji(s){ return s.toLowerCase().replace(/[^a-z]/g,'').replace(/wo/g,'o').replace(/si/g,'shi').replace(/ti/g,'chi').replace(/tu/g,'tsu').replace(/hu/g,'fu').replace(/zi/g,'ji'); }

        function initAIReading(){
            const a = aiReadingData[aiUserLevel]; 
            aiCurrentStory = a[Math.floor(Math.random()*a.length)];
            aiTimerStarted = false; 
            aiFinished = false; 
            aiTimeElapsed = 0;
            aiCurrentFeedback = '';
            
            // Set dynamic limit based on length & level
            aiTimeLimit = Math.floor(aiCurrentStory.romaji.replace(/[^a-z]/g,'').length * (aiUserLevel==='mahir'? 2.5 : 1.2));
            aiTimeRemaining = aiTimeLimit;
            
            clearInterval(aiTimerInterval); 
            renderAIReading();
        }

        window.startAITimerIfNeeded = () => {
            if(!aiTimerStarted && !aiFinished){
                aiTimerStarted=true;
                aiTimerInterval = setInterval(() => {
                    aiTimeElapsed++;
                    if(aiUserLevel !== 'pemula') {
                        aiTimeRemaining--;
                        if(aiTimeRemaining <= 0) handleAITimeout();
                    }
                    updateTimerUI();
                }, 1000);
                updateTimerUI();
            }
        };

        function updateTimerUI(){
            const t = document.getElementById('ai-timer-display'); if(!t) return;
            if(aiUserLevel==='pemula'){
                t.innerText=`⏱️ Waktu: ${aiTimeElapsed} detik`;
                t.className='text-lg font-mono font-bold text-orange-400';
            } else {
                t.innerText=`⏳ Tersisa: ${aiTimeRemaining} detik`;
                t.className=aiTimeRemaining<=5 ? 'text-lg font-mono font-bold timer-urgent' : 'text-lg font-mono font-bold text-sakura-400';
            }
        }

        function handleAITimeout(){
            clearInterval(aiTimerInterval); aiFinished = { status: 'timeout' };
            aiCurrentFeedback = 'Waktu Anda Habis. AI akan memberikan penyesuaian level jika perlu.';
            sendScore(0,1,-5);
            if(aiUserLevel==='pro') saveAILevel('mahir'); else if(aiUserLevel==='mahir') saveAILevel('pemula');
            renderAIReading(); if(window.MathJax) MathJax.typesetPromise();
        }

        window.submitAIAnswer = () => {
            if(aiFinished) return;
            const inp = document.getElementById('ai-read-input'), msg = document.getElementById('ai-msg');
            const val = inp.value;
            
            if(val.trim()===''){ msg.innerText='⚠️ Anda belum mengetik apapun.'; return; }
            
            clearInterval(aiTimerInterval);
            let nu = normalizeRomaji(val), nt = normalizeRomaji(aiCurrentStory.romaji);
            let timeTaken = (aiUserLevel === 'pemula') ? aiTimeElapsed : (aiTimeLimit - aiTimeRemaining);
            if(timeTaken <= 0) timeTaken = 1;

            // Trigger AI Decision Tree & NLP
            let aiEvaluation = evaluateAIResponse(nu, nt, timeTaken, aiUserLevel);
            
            aiFinished = { status: aiEvaluation.status };
            aiCurrentFeedback = aiEvaluation.feedback;
            
            sendScore(aiEvaluation.status === 'success' ? 1 : 0, aiEvaluation.status === 'fail' ? 1 : 0, aiEvaluation.points);
            saveAILevel(aiEvaluation.nextLevel);
            
            renderAIReading(); if(window.MathJax) MathJax.typesetPromise();
        };

        function renderAIReading(){
            let fb='', inp='';
            if(!aiFinished){
                let tl = aiUserLevel==='pemula' ? '⏱️ Ketik huruf pertama untuk memulai waktu...' : `⏳ Waktu Target: ${aiTimeRemaining}s`;
                inp=`
                    <div class="mt-6 flex flex-col items-center w-full">
                        <div id="ai-timer-display" class="text-lg font-mono font-bold text-neutral-500 mb-3">${tl}</div>
                        <div class="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
                            <textarea id="ai-read-input" rows="2" class="flex-1 w-full bg-dark-800 border-2 border-white/[.08] rounded-2xl p-4 text-xl sm:text-2xl text-white focus:outline-none focus:border-orange-400/60 transition placeholder-neutral-600 font-bold resize-none" placeholder="Ketik romaji di sini..." autocomplete="off" autocapitalize="none" spellcheck="false" oninput="startAITimerIfNeeded();document.getElementById('ai-msg').innerHTML=''" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitAIAnswer();}"></textarea>
                            <button onclick="submitAIAnswer()" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-6 py-4 rounded-2xl transition flex items-center justify-center shadow-lg shadow-orange-500/20 sm:w-auto w-full font-bold gap-2"><i data-lucide="send" class="w-5 h-5"></i> Kirim</button>
                        </div>
                        <p id="ai-msg" class="h-6 mt-2 text-sm font-bold text-rose-400"></p>
                        <p class="text-xs text-neutral-600 mt-2 text-center">*Abaikan spasi/tanda baca. Tekan <strong class="text-neutral-400">Enter</strong> untuk mengirim.</p>
                    </div>`;
            }else{
                let iconClass = aiFinished.status==='success' ? 'text-emerald-400' : (aiFinished.status==='partial' ? 'text-amber-400' : 'text-rose-400');
                let sh = `<h3 class="text-2xl sm:text-3xl font-black ${iconClass} mb-2 flex items-center gap-2 justify-center"><i data-lucide="brain-circuit" class="w-8 h-8"></i> Hasil Evaluasi AI</h3>`;
                fb=`
                    <div class="mt-8 glass-card rounded-3xl p-6 sm:p-8 shadow-xl tab-content w-full border border-white/[.08]">
                        ${sh}
                        <p class="text-center text-white text-lg font-bold mb-1">${aiCurrentFeedback}</p>
                        <p class="text-center text-neutral-400 text-sm mb-8">Kalimat asli: <strong class="text-orange-300">"${aiCurrentStory.indo}"</strong></p>
                        <div class="grid lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="book-a" class="w-4 h-4 text-sakura-400"></i> Bedah 漢字</h4>
                                <ul class="list-none space-y-3 bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full">${aiCurrentStory.kanjiInfo}</ul>
                            </div>
                            <div>
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="graduation-cap" class="w-4 h-4 text-orange-400"></i> Analisis 文法</h4>
                                <div class="text-base text-neutral-300 leading-relaxed bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full flex flex-col justify-center text-center overflow-x-auto">${aiCurrentStory.bunpouInfo}</div>
                            </div>
                        </div>
                        <div class="mt-8 flex justify-center">
                            <button onclick="initAIReading()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-sakura-500 hover:from-orange-400 hover:to-sakura-400 transition font-black tracking-wide text-white shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2">Tantangan AI Selanjutnya <i data-lucide="arrow-right-circle" class="w-5 h-5"></i></button>
                        </div>
                    </div>`;
            }
            let bc=aiUserLevel==='pemula'?'bg-sakura-400/10 border-sakura-400/20 text-sakura-300':aiUserLevel==='mahir'?'bg-blue-400/10 border-blue-400/20 text-blue-300':'bg-rose-400/10 border-rose-400/20 text-rose-300';
            contentDiv.innerHTML=`
                <div class="max-w-4xl mx-auto py-4 tab-content px-2 sm:px-0 flex flex-col items-center w-full">
                    <div class="mb-6 flex justify-between items-center glass-card p-4 rounded-2xl w-full border border-white/[.06]">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center border border-orange-400/15"><i data-lucide="brain-circuit" class="w-5 h-5 text-orange-400"></i></div>
                            <div><h2 class="text-white font-bold text-sm sm:text-base">AI Membaca Tingkat Cerdas</h2><p class="text-xs text-neutral-500">Mendeteksi kecepatan, typo, & keakuratan (NLP).</p></div>
                        </div>
                        <span class="inline-flex items-center gap-1.5 border font-bold px-4 py-2 rounded-full text-xs sm:text-sm uppercase tracking-widest ${bc}">${aiUserLevel}</span>
                    </div>
                    <div class="glass-card rounded-3xl p-6 sm:p-10 mb-2 relative overflow-hidden text-center w-full border border-white/[.06]">
                        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sakura-400/20 to-transparent"></div>
                        <h2 class="text-neutral-500 text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 flex items-center justify-center gap-2"><i data-lucide="glasses" class="w-4 h-4"></i> Baca Huruf di Bawah Ini</h2>
                        <div class="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-relaxed sm:leading-loose font-jp break-keep">${aiCurrentStory.hiragana}</div>
                    </div>
                    ${inp}${fb}
                </div>`;
            lucide.createIcons();
            if(!aiFinished&&window.innerWidth>640)setTimeout(()=>{const e=document.getElementById('ai-read-input');if(e)e.focus();},100);
        }

        switchTab('materi');
    </script>
</body>
</html>
