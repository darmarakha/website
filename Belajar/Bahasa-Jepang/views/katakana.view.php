<?php
// View template extracted to keep each file <= 1000 lines.
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Belajar Katakana Lengkap & AI Membaca</title>
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
                        emerald: { 300:'#6EE7B7', 400:'#34D399', 500:'#10B981', 600:'#059669' },
                        cyan: { 300:'#67E8F9', 400:'#22D3EE', 500:'#06B6D4', 600:'#0891B2' },
                        dark: { 900:'#040a18', 800:'#0b1528', 700:'#11203d', 600:'#1a2e54', 500:'#223d6b' }
                    },
                    fontFamily: { sans:['Inter','sans-serif'], jp:['Noto Sans JP','sans-serif'] }
                }
            }
        }
    </script>
    <style>
        body { font-family:'Inter',sans-serif; background-color: #040a18; }

        /* Digital Tech Particles (Katakana Theme) */
        @keyframes techFall { 0% { transform:translateY(-10vh); opacity:0; } 10% { opacity:0.8; } 90% { opacity:0.5; } 100% { transform:translateY(110vh); opacity:0; } }
        .tech-particle { position:fixed; width:3px; height:15px; background:cyan; box-shadow:0 0 10px cyan; border-radius:2px; pointer-events:none; z-index:5; }

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
        @keyframes urgentPulse{0%{color:#ef4444;transform:scale(1)}50%{color:#fca5a5;transform:scale(1.05)}100%{color:#ef4444;transform:scale(1)}}
        .timer-urgent{animation:urgentPulse 1s infinite}

        /* Genkouyoushi grid (Background Kanji) */
        .genkouyoushi {
            position:relative;
            background:rgba(255,255,255,.01);
            border:2px solid rgba(6,182,212,.15);
        }
        .genkouyoushi::before {
            content:'';position:absolute;inset:0;pointer-events:none;
            background:
                linear-gradient(to right,transparent calc(50% - 1px),rgba(6,182,212,.2) calc(50% - 1px),rgba(6,182,212,.2) calc(50% + 1px),transparent calc(50% + 1px)),
                linear-gradient(to bottom,transparent calc(50% - 1px),rgba(6,182,212,.15) calc(50% - 1px),rgba(6,182,212,.15) calc(50% + 1px),transparent calc(50% + 1px));
        }
        .genkouyoushi::after {
            content:'';position:absolute;inset:0;pointer-events:none;
            background:
                linear-gradient(135deg,transparent calc(50% - 1px),rgba(6,182,212,.1) calc(50% - 1px),rgba(6,182,212,.1) calc(50% + 1px),transparent calc(50% + 1px)),
                linear-gradient(225deg,transparent calc(50% - 1px),rgba(6,182,212,.1) calc(50% - 1px),rgba(6,182,212,.1) calc(50% + 1px),transparent calc(50% + 1px));
        }

        /* Glass card */
        .glass-card{background:rgba(11,21,40,.6);backdrop-filter:blur(20px);border:1px solid rgba(34,211,238,.1)}

        /* Kana hover */
        .kana-cell{transition:all .3s cubic-bezier(.175,.885,.32,1.275)}
        .kana-cell:hover{transform:translateY(-4px) scale(1.05); border-color: rgba(34,211,238,.5); background: rgba(34,211,238,.05);}
        .kana-cell:hover .kana-char{text-shadow:0 0 20px currentColor}

        /* Scrollbar */
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#040a18}
        ::-webkit-scrollbar-thumb{background:#1a2e54;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#06B6D4}

        /* ===== Custom Stroke Board ===== */
        .stroke-board-wrap {
            position: relative; width: 100%; max-width: 280px; height: 220px;
            margin: 0 auto; touch-action: none; user-select: none;
            -webkit-user-select: none; -webkit-touch-callout: none;
        }

        #stroke-svg-board, #practice-canvas {
            position: absolute; inset: 0; width: 100%; height: 100%;
            touch-action: none; user-select: none; -webkit-user-select: none;
        }

        #practice-canvas { z-index: 5; cursor: crosshair; }
        #stroke-svg-board { z-index: 4; pointer-events: none; }

        .stroke-path {
            fill: none; stroke: #22D3EE; stroke-width: 13;
            stroke-linecap: round; stroke-linejoin: round;
            filter: drop-shadow(0 0 8px rgba(34, 211, 238, .4));
        }

        .stroke-guide-path {
            fill: none; stroke: rgba(34, 211, 238, .18); stroke-width: 13;
            stroke-linecap: round; stroke-linejoin: round;
        }
    </style>
</head>
<body class="text-white min-h-screen selection:bg-cyan-500 selection:text-white pb-20" data-logged-in="<?php echo $isLoggedIn?'true':'false'; ?>" data-ai-level="<?php echo htmlspecialchars($aiLevel); ?>">

    <div class="tech-particle" style="left:15%;animation:techFall 8s linear infinite"></div>
    <div class="tech-particle" style="left:30%;animation:techFall 6s linear infinite;animation-delay:2s"></div>
    <div class="tech-particle" style="left:50%;animation:techFall 10s linear infinite;animation-delay:4s"></div>
    <div class="tech-particle" style="left:70%;animation:techFall 7s linear infinite;animation-delay:1s"></div>
    <div class="tech-particle" style="left:85%;animation:techFall 9s linear infinite;animation-delay:3s"></div>
    
    <div class="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/[.03] rounded-full blur-[150px] pointer-events-none"></div>
    <div class="fixed bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-emerald-500/[.03] rounded-full blur-[120px] pointer-events-none"></div>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6 relative z-10">

        <!-- HEADER -->
        <header class="glass-card rounded-3xl p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:justify-between relative overflow-hidden">
            <div class="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-jp font-black text-2xl text-white shadow-lg shadow-cyan-500/20 shrink-0">ア</div>
                <div>
                    <h1 class="text-2xl md:text-3xl font-black tracking-tight">
                        <span class="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">Materi Katakana</span>
                    </h1>
                    <p class="text-neutral-400 text-sm mt-0.5 flex items-center gap-2">
                        <span class="text-xs font-jp text-cyan-400/60">カタカナ</span>
                        <span class="text-neutral-600">·</span> AI & Smart Canvas
                    </p>
                </div>
            </div>
            <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
                <?php if($isLoggedIn): ?>
                    <div class="flex items-center gap-3 bg-white/[.02] px-4 py-2.5 rounded-2xl border border-white/[.05] self-end w-full md:w-auto justify-end">
                        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shrink-0"><?php echo strtoupper(substr($userName,0,1)); ?></div>
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
                    <a href="index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-white/[.05] hover:bg-white/[.1] text-neutral-300 font-semibold text-sm border border-white/[.05] hover:border-white/[.15] transition-all flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali
                    </a>
                    <a href="/index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold text-sm shadow-lg shadow-cyan-500/15 flex items-center gap-2">
                        <i data-lucide="home" class="w-4 h-4"></i> Home
                    </a>
                </div>
            </div>
        </header>

        <!-- TABS -->
        <nav class="flex flex-wrap sm:flex-nowrap gap-2 glass-card p-2 rounded-2xl">
            <button onclick="switchTab('materi')" id="tab-materi" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20">📚 Materi</button>
            <button onclick="switchTab('flashcard')" id="tab-flashcard" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-neutral-400 hover:text-white hover:bg-white/[.05]">🎴 Flashcard</button>
            <button onclick="switchTab('ai')" id="tab-ai" class="flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20">📖 AI Membaca</button>
        </nav>

        <div id="content-container" class="min-h-[500px]"></div>

        <footer class="mt-12 text-center">
            <div class="flex items-center justify-center gap-2 mb-3">
                <div class="w-6 h-px bg-white/10"></div><span class="text-lg text-cyan-400">⚡</span><div class="w-6 h-px bg-white/10"></div>
            </div>
            <p class="text-neutral-500 text-sm">Credit: <strong class="text-neutral-300">Darma</strong> — Dikembangkan dengan ❤️ & AI</p>
        </footer>

        <!-- ===== STROKE ORDER MODAL CANGGIH ===== -->
        <div id="strokeModal" class="hidden fixed inset-0 bg-dark-900/90 z-50 flex justify-center items-center px-4 backdrop-blur-sm transition-opacity">
            <div class="glass-card rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl border border-cyan-400/20 flex flex-col items-center bg-dark-800">
                <button onclick="hideStrokeModal()" class="absolute top-4 right-4 text-neutral-500 hover:text-white bg-white/[.05] hover:bg-white/[.1] p-2 rounded-xl w-9 h-9 flex items-center justify-center transition border border-white/[.05] text-sm z-10">✕</button>

                <h3 class="text-lg font-bold text-cyan-400 mb-4 text-center w-full border-b border-white/[.06] pb-3">Papan Penulisan</h3>

                <div class="flex items-center gap-2 mb-5 w-full">
                    <button onclick="hwAnimate()" id="mode-auto" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-400/20 shadow-inner">✨ Tonton Animasi</button>
                    <button onclick="hwPractice()" id="mode-practice" class="flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-white/[.02] text-neutral-400 border border-white/[.05] hover:bg-white/[.08]">✏️ Latihan Nulis</button>
                </div>

                <div class="genkouyoushi rounded-2xl w-full max-w-[280px] h-[220px] mx-auto mb-4 flex items-center justify-center p-2 relative overflow-hidden bg-dark-900 shadow-inner" style="touch-action: none;" id="modal-svg-container">
                    <div class="stroke-board-wrap">
                        <svg id="stroke-svg-board" viewBox="0 0 280 220"></svg>
                        <canvas id="practice-canvas" width="280" height="220"></canvas>
                    </div>
                </div>

                <p class="text-center text-xs text-neutral-400 mb-3 min-h-[18px] font-medium" id="stroke-label">Memuat papan penulisan...</p>

                <div id="practice-tools" class="hidden w-full mb-4 space-y-3">
                    <div class="flex gap-2">
                        <button onclick="resetWritingBoard()" class="flex-1 py-2 rounded-xl text-xs font-bold bg-white/[.05] hover:bg-white/[.1] text-neutral-200 border border-white/[.05] transition">↺ Ulang</button>
                        <button onclick="scoreWritingBoard()" class="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/20 transition">✓ Nilai Tulisan</button>
                    </div>
                    <div class="bg-white/[.02] border border-white/[.05] rounded-2xl p-3">
                        <div class="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                            <span>Skor Kemiripan</span>
                            <span id="writing-score-text" class="text-cyan-300 font-bold">0%</span>
                        </div>
                        <div class="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div id="writing-score-bar" class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500" style="width:0%"></div>
                        </div>
                        <p id="writing-score-desc" class="mt-2 text-[10px] text-neutral-500 leading-relaxed text-center">Tulis huruf di atas bayangan, lalu tekan Nilai Tulisan.</p>
                    </div>
                </div>

                <div class="w-full bg-white/[.02] p-4 rounded-2xl text-center mb-4 border border-white/[.05]">
                    <p class="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Romaji</p>
                    <p class="text-2xl font-mono text-emerald-400 font-bold" id="modal-romaji">a</p>
                </div>

                <div class="flex items-center justify-center gap-4 text-xs text-neutral-500 mb-2 w-full">
                    <span>Kategori: <strong class="text-cyan-300" id="modal-type">Seion</strong></span>
                    <span class="text-neutral-700">|</span>
                    <span>Total Goresan: <strong class="text-emerald-300" id="modal-strokes">3</strong></span>
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
                body: JSON.stringify({ update_progress: true, points: points, material: 'katakana' }) 
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
                body: JSON.stringify({ update_level: true, level: newLevel, material: 'katakana' }) 
            }).catch(err => console.error('Gagal menyimpan level AI:', err));
        }

        // ML ALGORITHM 1: Levenshtein Distance (NLP)
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

        // ML ALGORITHM 2: Fuzzy Logic & Decision Tree
        function evaluateAIResponse(inputStr, targetStr, timeTaken, currentLevel) {
            const dist = getLevenshteinDistance(inputStr, targetStr);
            const accuracy = Math.max(0, 100 - (dist / targetStr.length) * 100);
            const cps = targetStr.length / Math.max(1, timeTaken); 
            
            let status = 'fail', points = 0, feedback = '', nextLevel = currentLevel;

            if (accuracy >= 90) { 
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
            } else if (accuracy >= 65) { 
                status = 'partial'; points = 5;
                feedback = `Hampir benar (Akurasi: ${accuracy.toFixed(1)}%). AI mendeteksi ada ${dist} huruf salah ketik.`;
            } else { 
                status = 'fail'; points = -5;
                feedback = `Kurang Tepat (Akurasi: ${accuracy.toFixed(1)}%). AI menyarankan periksa ejaan.`;
                if (currentLevel === 'pro' && accuracy < 40) nextLevel = 'mahir';
                else if (currentLevel === 'mahir' && accuracy < 40) nextLevel = 'pemula';
            }
            return { status, points, feedback, nextLevel, accuracy, cps };
        }

        // ==========================================
        // 2. DATABASE KATAKANA
        // ==========================================
        const dataGojuuon = [
            {k:'ア',r:'a',type:'Seion'},{k:'イ',r:'i',type:'Seion'},{k:'ウ',r:'u',type:'Seion'},{k:'エ',r:'e',type:'Seion'},{k:'オ',r:'o',type:'Seion'},
            {k:'カ',r:'ka',type:'Seion'},{k:'キ',r:'ki',type:'Seion'},{k:'ク',r:'ku',type:'Seion'},{k:'ケ',r:'ke',type:'Seion'},{k:'コ',r:'ko',type:'Seion'},
            {k:'サ',r:'sa',type:'Seion'},{k:'シ',r:'shi',type:'Seion'},{k:'ス',r:'su',type:'Seion'},{k:'セ',r:'se',type:'Seion'},{k:'ソ',r:'so',type:'Seion'},
            {k:'タ',r:'ta',type:'Seion'},{k:'チ',r:'chi',type:'Seion'},{k:'ツ',r:'tsu',type:'Seion'},{k:'テ',r:'te',type:'Seion'},{k:'ト',r:'to',type:'Seion'},
            {k:'ナ',r:'na',type:'Seion'},{k:'ニ',r:'ni',type:'Seion'},{k:'ヌ',r:'nu',type:'Seion'},{k:'ネ',r:'ne',type:'Seion'},{k:'ノ',r:'no',type:'Seion'},
            {k:'ハ',r:'ha',type:'Seion'},{k:'ヒ',r:'hi',type:'Seion'},{k:'フ',r:'fu',type:'Seion'},{k:'ヘ',r:'he',type:'Seion'},{k:'ホ',r:'ho',type:'Seion'},
            {k:'マ',r:'ma',type:'Seion'},{k:'ミ',r:'mi',type:'Seion'},{k:'ム',r:'mu',type:'Seion'},{k:'メ',r:'me',type:'Seion'},{k:'モ',r:'mo',type:'Seion'},
            {k:'ヤ',r:'ya',type:'Seion'},{k:'',r:'',type:''},{k:'ユ',r:'yu',type:'Seion'},{k:'',r:'',type:''},{k:'ヨ',r:'yo',type:'Seion'},
            {k:'ラ',r:'ra',type:'Seion'},{k:'リ',r:'ri',type:'Seion'},{k:'ル',r:'ru',type:'Seion'},{k:'レ',r:'re',type:'Seion'},{k:'ロ',r:'ro',type:'Seion'},
            {k:'ワ',r:'wa',type:'Seion'},{k:'',r:'',type:''},{k:'ヲ',r:'wo',type:'Seion'},{k:'',r:'',type:''},{k:'ン',r:'n',type:'Seion'}
        ];
        const dataDakuon = [
            {k:'ガ',r:'ga',type:'Dakuon'},{k:'ギ',r:'gi',type:'Dakuon'},{k:'グ',r:'gu',type:'Dakuon'},{k:'ゲ',r:'ge',type:'Dakuon'},{k:'ゴ',r:'go',type:'Dakuon'},
            {k:'ザ',r:'za',type:'Dakuon'},{k:'ジ',r:'ji',type:'Dakuon'},{k:'ズ',r:'zu',type:'Dakuon'},{k:'ゼ',r:'ze',type:'Dakuon'},{k:'ゾ',r:'zo',type:'Dakuon'},
            {k:'ダ',r:'da',type:'Dakuon'},{k:'ヂ',r:'ji',type:'Dakuon'},{k:'ヅ',r:'zu',type:'Dakuon'},{k:'デ',r:'de',type:'Dakuon'},{k:'ド',r:'do',type:'Dakuon'},
            {k:'バ',r:'ba',type:'Dakuon'},{k:'ビ',r:'bi',type:'Dakuon'},{k:'ブ',r:'bu',type:'Dakuon'},{k:'ベ',r:'be',type:'Dakuon'},{k:'ボ',r:'bo',type:'Dakuon'},
            {k:'パ',r:'pa',type:'Handakuon'},{k:'ピ',r:'pi',type:'Handakuon'},{k:'プ',r:'pu',type:'Handakuon'},{k:'ペ',r:'pe',type:'Handakuon'},{k:'ポ',r:'po',type:'Handakuon'}
        ];
        const dataYoon = [
            {k:'キャ',r:'kya',type:'Yoon'},{k:'キュ',r:'kyu',type:'Yoon'},{k:'キョ',r:'kyo',type:'Yoon'},
            {k:'シャ',r:'sha',type:'Yoon'},{k:'シュ',r:'shu',type:'Yoon'},{k:'ショ',r:'sho',type:'Yoon'},
            {k:'チャ',r:'cha',type:'Yoon'},{k:'チュ',r:'chu',type:'Yoon'},{k:'チョ',r:'cho',type:'Yoon'},
            {k:'ニャ',r:'nya',type:'Yoon'},{k:'ニュ',r:'nyu',type:'Yoon'},{k:'ニョ',r:'nyo',type:'Yoon'},
            {k:'ヒャ',r:'hya',type:'Yoon'},{k:'ヒュ',r:'hyu',type:'Yoon'},{k:'ヒョ',r:'hyo',type:'Yoon'},
            {k:'ミャ',r:'mya',type:'Yoon'},{k:'ミュ',r:'myu',type:'Yoon'},{k:'ミョ',r:'myo',type:'Yoon'},
            {k:'リャ',r:'rya',type:'Yoon'},{k:'リュ',r:'ryu',type:'Yoon'},{k:'リョ',r:'ryo',type:'Yoon'},
            {k:'ギャ',r:'gya',type:'Yoon (Dakuon)'},{k:'ギュ',r:'gyu',type:'Yoon (Dakuon)'},{k:'ギョ',r:'gyo',type:'Yoon (Dakuon)'},
            {k:'ジャ',r:'ja',type:'Yoon (Dakuon)'},{k:'ジュ',r:'ju',type:'Yoon (Dakuon)'},{k:'ジョ',r:'jo',type:'Yoon (Dakuon)'},
            {k:'ビャ',r:'bya',type:'Yoon (Dakuon)'},{k:'ビュ',r:'byu',type:'Yoon (Dakuon)'},{k:'ビョ',r:'byo',type:'Yoon (Dakuon)'},
            {k:'ピャ',r:'pya',type:'Yoon (Handakuon)'},{k:'ピュ',r:'pyu',type:'Yoon (Handakuon)'},{k:'ピョ',r:'pyo',type:'Yoon (Handakuon)'}
        ];
        const allKana = [...dataGojuuon,...dataDakuon,...dataYoon].filter(i=>i.k!=='');

        // ==========================================
        // 3. DATA CERITA AI (KATA SERAPAN/KATAKANA)
        // ==========================================
        const aiReadingData = {
            pemula: [
                { hiragana:'わたしは カメラを かいます。', romaji:'watashi wa kamera o kaimasu', indo:'Saya membeli kamera.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>私 (わたし)</span> : Saya.</li><li><span class='text-cyan-400 font-bold text-lg'>買います (かいます)</span> : Membeli (dari 買う).</li>", bunpouInfo:"$$\\text{[Subjek]} + \\text{は (wa)} + \\text{[Objek Katakana]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" },
                { hiragana:'あした デパートへ いきます。', romaji:'ashita depaato e ikimasu', indo:'Besok pergi ke department store.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>明日 (あした)</span> : Besok.</li><li><span class='text-cyan-400 font-bold text-lg'>行きます (いきます)</span> : Pergi (dari 行く).</li>", bunpouInfo:"$$\\text{[Waktu]} + \\text{[Tempat Katakana]} + \\text{へ (e)} + \\text{[Kata Kerja Perpindahan]}$$" },
                { hiragana:'まいにち コーヒーを のみます。', romaji:'mainichi koohii o nomimasu', indo:'Setiap hari minum kopi.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>毎日 (まいにち)</span> : Setiap hari.</li><li><span class='text-cyan-400 font-bold text-lg'>飲みます (のみます)</span> : Minum (dari 飲む).</li>", bunpouInfo:"$$\\text{[Waktu Keterangan]} + \\text{[Objek Katakana]} + \\text{を (o)} + \\text{[Kata Kerja]}$$" }
            ],
            mahir: [
                { hiragana:'コンビニで チョコレートと ジュースを かいました。', romaji:'konbini de chokoreeto to juusu o kaimashita', indo:'Saya membeli cokelat dan jus di minimarket.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>買いました (かいました)</span> : Telah membeli (bentuk lampau dari 買います).</li>", bunpouInfo:"$$\\text{[Tempat]} + \\text{で} + \\text{[Objek 1]} + \\text{と} + \\text{[Objek 2]} + \\text{を} + \\text{[Kerja Lampau]}$$" },
                { hiragana:'かれは パソコンで アニメを みます。', romaji:'kare wa pasokon de anime o mimasu', indo:'Dia (laki-laki) menonton anime menggunakan PC.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>彼 (かれ)</span> : Dia laki-laki.</li><li><span class='text-cyan-400 font-bold text-lg'>見ます (みます)</span> : Menonton/Melihat (dari 見る).</li>", bunpouInfo:"$$\\text{[Subjek]} + \\text{は} + \\text{[Alat/Katakana]} + \\text{で} + \\text{[Objek]} + \\text{を} + \\text{[Kerja]}$$<br><em>Partikel De di sini bermakna 'menggunakan (alat)'.</em>" }
            ],
            pro: [
                { hiragana:'アメリカから きました。にほんの 文化と アニメが だいすきです。', romaji:'amerika kara kimashita nihon no bunka to anime ga daisukidesu', indo:'Saya datang dari Amerika. Saya sangat suka budaya Jepang dan anime.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>来ました (きました)</span> : Datang.</li><li><span class='text-cyan-400 font-bold text-lg'>日本 (にほん)</span> : Jepang.</li><li><span class='text-cyan-400 font-bold text-lg'>文化 (ぶんか)</span> : Budaya.</li><li><span class='text-cyan-400 font-bold text-lg'>大好き (だいすき)</span> : Sangat suka.</li>", bunpouInfo:"$$\\text{[Negara Asal]} + \\text{から} + \\text{来ました} \\dots \\text{[Hal 1]} + \\text{と} + \\text{[Hal 2]} + \\text{が} + \\text{大好きです}$$" },
                { hiragana:'レストランで ステーキを たべながら、ワインを のみました。', romaji:'resutoran de suteeki o tabenagara wain o nomimashita', indo:'Saya minum wine sambil makan steak di restoran.', kanjiInfo:"<li><span class='text-cyan-400 font-bold text-lg'>食べながら (たべながら)</span> : Sambil makan.</li><li><span class='text-cyan-400 font-bold text-lg'>飲みました (のみました)</span> : Telah minum.</li>", bunpouInfo:"$$\\text{[Tempat Katakana]} + \\text{で} + \\text{[Aktivitas 1]} + \\text{ながら} + \\text{、} + \\text{[Aktivitas 2]}$$<br><em>Nagara</em> digunakan untuk aktivitas simultan (sambil)." }
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
                if(t===tab) btn.className = t==='ai' ? "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20";
                else btn.className = t==='ai' ? "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20" : "flex-1 min-w-[120px] py-3 px-3 rounded-xl font-bold text-sm transition-all text-neutral-400 hover:text-white hover:bg-white/[.05]";
            });
            if(tab==='materi') renderMateri();
            if(tab==='flashcard'){ initFCWeights(); getNextFlashcard(); renderFlashcard(); }
            if(tab==='ai') initAIReading();
            if(window.MathJax) MathJax.typesetPromise().catch(()=>{});
        }

        window.checkQuickAnswer = (ans) => {
            const ok = (ans === 'a');
            const msg = document.getElementById('kat-msg');
            if(ok){ msg.className='mt-3 text-sm font-bold text-emerald-300'; msg.innerHTML='✅ Benar, +10 poin dikirim ke Leaderboard!'; sendScore(1,0,10); }
            else{ msg.className='mt-3 text-sm font-bold text-rose-300'; msg.innerHTML='❌ Salah, jawaban benar: a'; sendScore(0,1,-3); }
        };

        function buildGrid(data, cols=5) {
            let h = `<div class="grid grid-cols-3 sm:grid-cols-${cols} gap-2 sm:gap-3 mb-8">`;
            data.forEach(item => {
                if(item.k==='') { h += '<div class="hidden sm:block"></div>'; return; }
                // Menambahkan data stroke manual pada UI
                h += `<div onclick="showStrokeModal('${item.k}','${item.r}','${item.type}')"
                    class="kana-cell glass-card rounded-2xl p-3 sm:p-4 text-center cursor-pointer group flex flex-col items-center justify-center border border-white/[.04]">
                    <div class="kana-char text-3xl sm:text-4xl font-black text-cyan-300 mb-1 font-jp transition-all">${item.k}</div>
                    <div class="text-[11px] sm:text-xs text-emerald-400/70 font-mono tracking-widest">${item.r}</div>
                </div>`;
            });
            h += '</div>';
            return h;
        }

        function renderMateri() {
            contentDiv.innerHTML = `
                <div class="tab-content space-y-6">
                    <section class="glass-card rounded-3xl p-5 sm:p-6 border border-blue-400/15 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-[60px] pointer-events-none"></div>
                        <h2 class="text-lg sm:text-xl font-bold flex items-center gap-2 text-blue-300 relative">
                            <div class="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center"><i data-lucide="zap" class="w-4 h-4 text-blue-400"></i></div> Latihan Cepat
                        </h2>
                        <p class="text-sm text-neutral-400 mt-3 relative">Romaji dari <span class="text-2xl font-jp font-black text-cyan-300 mx-1">ア</span> adalah?</p>
                        <div class="mt-4 flex flex-wrap gap-2 sm:gap-3 relative">
                            <button onclick="checkQuickAnswer('a')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.05] hover:border-cyan-400/40 transition-all font-mono font-bold text-lg text-white">a</button>
                            <button onclick="checkQuickAnswer('i')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.05] hover:border-cyan-400/40 transition-all font-mono font-bold text-lg text-white">i</button>
                            <button onclick="checkQuickAnswer('u')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.05] hover:border-cyan-400/40 transition-all font-mono font-bold text-lg text-white">u</button>
                        </div>
                        <p id="kat-msg" class="mt-3 text-sm font-medium h-6 relative"></p>
                    </section>
                    <div class="glass-card rounded-2xl p-4 border border-cyan-400/10 text-sm flex gap-3 items-center">
                        <span class="text-xl shrink-0">💡</span>
                        <p class="text-neutral-300"><strong class="text-cyan-300">Tips:</strong> Klik huruf Katakana untuk melihat <strong class="text-white">animasi cara penulisan</strong>!</p>
                    </div>
                    <section class="glass-card rounded-3xl p-5 md:p-8 relative overflow-hidden border border-white/[.03]">
                        <div class="absolute -top-20 -left-20 w-40 h-40 bg-cyan-400/5 rounded-full blur-[80px] pointer-events-none"></div>
                        <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                            <span class="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 text-xs font-black flex items-center justify-center border border-cyan-400/15">01</span>
                            <span class="text-white">Huruf Dasar</span>
                            <span class="text-xs font-jp text-cyan-400/40">五十音</span>
                        </h2>
                        ${buildGrid(dataGojuuon,5)}
                    </section>
                    <section class="grid lg:grid-cols-2 gap-5">
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-emerald-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-400/5 rounded-full blur-[60px] pointer-events-none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-400/15">02</span>
                                <span class="text-white">Dakuon & Handakuon</span>
                            </h2>
                            ${buildGrid(dataDakuon,5)}
                        </div>
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-indigo-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-400/5 rounded-full blur-[60px] pointer-events-none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-indigo-400/10 text-indigo-400 text-xs font-black flex items-center justify-center border border-indigo-400/15">03</span>
                                <span class="text-white">Bunyi Campuran</span>
                                <span class="text-xs text-indigo-400/40">拗音</span>
                            </h2>
                            ${buildGrid(dataYoon,3)}
                        </div>
                    </section>
                </div>`;
            lucide.createIcons();
        }

        // ==========================================
        // 5b. PAPAN TULIS KATAKANA (SVG Paths Algorithm)
        // ==========================================
        window.currentStrokeKana = '';
        window.currentStrokeRomaji = '';
        window.currentStrokeType = '';
        window.strokeAnimationToken = 0;
        window.isPracticeMode = false;
        window.practiceDrawing = false;
        window.practiceCanvasReady = false;
        window.practicePoints = [];

        const BOARD_W = 280, BOARD_H = 220;

        // Path generator disempurnakan (Bezier Curve Halus sesuai Wikimedia Commons Katakana)
        const katakanaStrokeData = {
            'ア': ['M95 75 L185 75 Q160 110 110 160', 'M145 110 Q145 155 125 190'],
            'イ': ['M155 45 Q125 100 95 155', 'M125 105 L125 190'],
            'ウ': ['M140 40 L140 65', 'M100 75 L100 110', 'M100 75 L180 75 Q160 140 110 180'],
            'エ': ['M100 65 L180 65', 'M140 65 L140 165', 'M90 165 L190 165'],
            'オ': ['M95 75 L185 75', 'M140 45 L140 165 Q135 180 115 180', 'M140 110 Q165 140 185 170'],
            'カ': ['M95 85 L185 85 Q160 130 110 180', 'M140 50 Q140 110 120 185'],
            'キ': ['M95 70 L185 70', 'M90 100 L190 100', 'M145 45 L130 180'],
            'ク': ['M135 55 Q115 80 95 105', 'M125 80 L185 80 Q155 130 105 180'],
            'ケ': ['M125 55 Q105 95 90 140', 'M125 85 L185 85', 'M155 85 Q155 140 120 185'],
            'コ': ['M100 75 L175 75 L175 160', 'M100 160 L180 160'],
            'サ': ['M90 80 L190 80', 'M125 55 L125 115', 'M165 55 L165 110 Q160 160 110 180'],
            'シ': ['M100 70 L125 85', 'M95 115 L120 130', 'M100 180 Q140 140 175 60'],
            'ス': ['M95 75 L180 75 Q140 120 95 175', 'M140 125 Q165 150 185 180'],
            'セ': ['M90 75 L185 75 L185 155 Q185 165 165 165', 'M140 60 Q140 110 110 170'],
            'ソ': ['M100 70 L130 95', 'M170 60 Q140 110 110 175'],
            'タ': ['M130 55 Q110 80 90 105', 'M125 75 L180 75 Q150 120 110 175', 'M140 115 Q160 140 180 160'],
            'チ': ['M145 45 Q125 65 100 80', 'M90 105 L190 105', 'M140 105 Q140 150 110 185'],
            'ツ': ['M105 70 L125 95', 'M145 65 L160 95', 'M190 60 Q150 120 105 180'],
            'テ': ['M95 75 L185 75', 'M90 115 L190 115', 'M140 115 Q140 150 100 185'],
            'ト': ['M140 50 L140 180', 'M140 105 Q165 130 185 160'],
            'ナ': ['M90 85 L190 85', 'M140 50 Q140 120 105 180'],
            'ニ': ['M100 80 L180 80', 'M90 140 L190 140'],
            'ヌ': ['M95 80 L180 80 Q145 130 100 180', 'M130 110 Q160 145 185 170'],
            'ネ': ['M140 45 L140 70', 'M95 85 L180 85 L115 155', 'M140 115 L140 185', 'M140 125 Q165 150 185 175'],
            'ノ': ['M170 60 Q140 120 90 170'],
            'ハ': ['M120 75 Q105 120 85 165', 'M160 75 Q175 120 195 165'],
            'ヒ': ['M95 90 L165 90', 'M95 90 L95 150 Q95 165 110 165 L185 165'],
            'フ': ['M95 75 L175 75 Q145 130 100 185'],
            'ヘ': ['M90 145 L140 75 L195 145'],
            'ホ': ['M95 75 L185 75', 'M140 50 L140 175', 'M140 120 Q115 150 90 175', 'M140 120 Q165 150 190 175'],
            'マ': ['M90 75 L185 75 L125 150', 'M135 120 Q165 145 185 170'],
            'ミ': ['M100 70 L175 85', 'M95 110 L180 125', 'M90 150 L185 165'],
            'ム': ['M135 60 L110 120 L185 120', 'M160 135 Q175 155 190 175'],
            'メ': ['M170 65 Q130 120 90 175', 'M110 90 Q150 130 185 175'],
            'モ': ['M100 70 L180 70', 'M95 105 L185 105', 'M140 50 L140 150 Q140 165 160 165 L190 165'],
            'ヤ': ['M95 85 L180 85 Q150 130 110 180', 'M125 55 Q135 90 135 140'],
            'ユ': ['M100 70 L175 70 L175 160', 'M90 160 L185 160'],
            'ヨ': ['M100 60 L180 60 L180 170', 'M100 115 L180 115', 'M95 170 L185 170'],
            'ラ': ['M100 65 L180 65', 'M95 105 L180 105 Q150 140 115 180'],
            'リ': ['M115 75 L115 145', 'M165 65 L165 130 Q165 160 135 185'],
            'ル': ['M115 65 Q115 120 95 170', 'M160 65 L160 145 Q160 170 190 170'],
            'レ': ['M140 60 L140 140 Q140 175 190 175'],
            'ロ': ['M100 70 L100 165', 'M100 70 L180 70 L180 165', 'M95 165 L185 165'],
            'ワ': ['M105 70 L105 140', 'M105 70 L175 70 Q160 130 120 180'],
            'ヲ': ['M95 70 L180 70', 'M95 115 L180 115', 'M140 70 Q130 140 95 185'],
            'ン': ['M135 60 L155 85', 'M100 175 Q135 130 185 70']
        };

        function getStrokeData(k) {
            if (katakanaStrokeData[k]) return katakanaStrokeData[k];
            // Untuk kana dakuten/kombinasi, sumber bentuk utama tetap huruf pertama.
            const first = Array.from(k || '')[0] || '';
            return katakanaStrokeData[first] || [];
        }

        function safeText(str) {
            return String(str || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'}[ch]));
        }

        function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
        function kanaFontSize(k) { const len = Array.from(k || '').length; if (len >= 3) return 68; if (len === 2) return 92; return 132; }
        function kanaTextY(k) { return Array.from(k || '').length > 1 ? 142 : 150; }

        function setStrokeLabel(text, className) {
            const label = document.getElementById('stroke-label');
            if (!label) return;
            label.className = className || 'text-center text-xs text-neutral-400 mb-3 min-h-[18px] font-medium';
            label.innerHTML = text;
        }

        function setStrokeMode(mode) {
            const autoBtn = document.getElementById('mode-auto');
            const practiceBtn = document.getElementById('mode-practice');
            const tools = document.getElementById('practice-tools');
            const activeClass = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-400/20 shadow-inner';
            const inactiveClass = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-white/[.02] text-neutral-400 border border-white/[.05] hover:bg-white/[.08]';
            if (autoBtn) autoBtn.className = mode === 'auto' ? activeClass : inactiveClass;
            if (practiceBtn) practiceBtn.className = mode === 'practice' ? activeClass : inactiveClass;
            if (tools) tools.classList.toggle('hidden', mode !== 'practice');
        }

        function resetScoreBox() {
            const text = document.getElementById('writing-score-text'), bar = document.getElementById('writing-score-bar'), desc = document.getElementById('writing-score-desc');
            if (text) text.textContent = '0%';
            if (bar) bar.style.width = '0%';
            if (desc) desc.textContent = 'Tulis huruf di atas bayangan, lalu tekan Nilai Tulisan.';
        }

        function getPracticeCanvas() { return document.getElementById('practice-canvas'); }

        function clearPracticeCanvas() {
            const canvas = getPracticeCanvas();
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            window.practicePoints = [];
        }

        function resetWritingBoard() {
            clearPracticeCanvas(); resetScoreBox(); drawPracticeGuide(window.currentStrokeKana);
            setStrokeLabel('✏️ Papan dibersihkan. Tulis lagi di atas bayangan huruf.', 'text-center text-xs text-neutral-300 mb-3 min-h-[18px] font-bold');
        }
        window.resetWritingBoard = resetWritingBoard;

        function createSvgEl(name, attrs = {}) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', name);
            Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
            return el;
        }

        function clampNumber(value, min, max) { return Math.max(min, Math.min(max, value)); }
        function getPathNumbers(d) { return String(d || '').match(/-?\d*\.?\d+/g)?.map(Number) || []; }

        function getStrokePathBox(paths) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            paths.forEach(d => {
                const nums = getPathNumbers(d);
                for (let i = 0; i < nums.length - 1; i += 2) {
                    const x = nums[i], y = nums[i + 1];
                    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
                    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
                }
            });
            if (!Number.isFinite(minX)) return { x: 18, y: 18, width: 244, height: 184, cx: BOARD_W / 2, cy: BOARD_H / 2 };
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
        }

        function getKanaPixelBox(k) {
            const c = document.createElement('canvas'); c.width = BOARD_W; c.height = BOARD_H;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.clearRect(0, 0, BOARD_W, BOARD_H); ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            ctx.font = `900 ${kanaFontSize(k)}px "Noto Sans JP", sans-serif`;
            ctx.fillText(k || '', BOARD_W / 2, kanaTextY(k));

            const data = ctx.getImageData(0, 0, BOARD_W, BOARD_H).data;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (let y = 0; y < BOARD_H; y++) {
                for (let x = 0; x < BOARD_W; x++) {
                    if (data[(y * BOARD_W + x) * 4 + 3] > 18) {
                        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
                    }
                }
            }
            if (!Number.isFinite(minX)) return { x: 66, y: 36, width: 148, height: 150, cx: BOARD_W / 2, cy: BOARD_H / 2 };
            const pad = 18;
            minX = clampNumber(minX - 4, pad, BOARD_W - pad); minY = clampNumber(minY - 4, pad, BOARD_H - pad);
            maxX = clampNumber(maxX + 4, pad, BOARD_W - pad); maxY = clampNumber(maxY + 4, pad, BOARD_H - pad);
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
        }

        function getFittedStrokeMatrix(k, paths) {
            const source = getStrokePathBox(paths), target = getKanaPixelBox(k);
            const targetW = Math.max(20, target.width * 0.96), targetH = Math.max(20, target.height * 0.96);
            const scaleX = targetW / Math.max(1, source.width), scaleY = targetH / Math.max(1, source.height);
            const scale = clampNumber(Math.min(scaleX, scaleY), 0.72, 1.28);
            const tx = target.cx - (source.cx * scale), ty = target.cy - (source.cy * scale);
            return `matrix(${scale.toFixed(5)} 0 0 ${scale.toFixed(5)} ${tx.toFixed(3)} ${ty.toFixed(3)})`;
        }

        function drawGrid(svg) {
            const grid = createSvgEl('g', { opacity: '.15' });
            [['M140 0 L140 220'], ['M0 110 L280 110'], ['M0 0 L280 220'], ['M280 0 L0 220']].forEach(d => grid.appendChild(createSvgEl('path', { d: d[0], stroke: '#22D3EE', 'stroke-width': '1', fill: 'none' })));
            svg.appendChild(grid);
        }

        function drawTargetKanaOnSvg(k, options = {}) {
            const svg = document.getElementById('stroke-svg-board'); if (!svg) return;
            const fill = options.fill || 'rgba(34,211,238,.12)', opacity = options.opacity ?? 1, size = kanaFontSize(k), y = kanaTextY(k);
            svg.innerHTML = ''; drawGrid(svg);
            svg.appendChild(createSvgEl('text', { x: '140', y: String(y), 'text-anchor': 'middle', 'font-size': String(size), 'font-family': 'Noto Sans JP, sans-serif', 'font-weight': '900', fill, opacity: String(opacity) })).textContent = k || '';
        }

        function drawPracticeGuide(k) {
            const svg = document.getElementById('stroke-svg-board'); if (!svg) return;
            drawTargetKanaOnSvg(k, { fill: 'rgba(34,211,238,.08)' });
            const paths = getStrokeData(k), guides = createSvgEl('g', { transform: getFittedStrokeMatrix(k, paths), opacity: '.72' });
            paths.forEach((d, index) => {
                guides.appendChild(createSvgEl('path', { d, fill: 'none', stroke: 'rgba(52,211,153,.34)', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '5 8', 'vector-effect': 'non-scaling-stroke' }));
                const start = d.match(/M\s*([0-9.]+)\s+([0-9.]+)/);
                if (start) {
                    const cx = Number(start[1]), cy = Number(start[2]);
                    guides.appendChild(createSvgEl('circle', { cx: String(cx), cy: String(cy), r: '8', fill: 'rgba(52,211,153,.18)', stroke: 'rgba(52,211,153,.58)', 'stroke-width': '1.4', 'vector-effect': 'non-scaling-stroke' }));
                    const num = createSvgEl('text', { x: String(cx), y: String(cy + 4), 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '900', 'font-family': 'Inter, sans-serif', fill: '#6EE7B7' });
                    num.textContent = String(index + 1); guides.appendChild(num);
                }
            });
            svg.appendChild(guides);
        }

        async function animateStrokePath(svg, fittedGroup, d, index, total, token) {
            return new Promise(resolve => {
                if (token !== window.strokeAnimationToken) return resolve();
                const strokeLayer = createSvgEl('g', { transform: fittedGroup.getAttribute('transform') || '' }); svg.appendChild(strokeLayer);
                const path = createSvgEl('path', { d, fill: 'none', stroke: '#22D3EE', 'stroke-width': '6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', filter: 'drop-shadow(0 0 5px rgba(34,211,238,.42))' });
                strokeLayer.appendChild(path);
                let length = 400; try { length = Math.max(1, path.getTotalLength()); } catch (e) {}
                path.style.strokeDasharray = String(length); path.style.strokeDashoffset = String(length);
                const start = d.match(/M\s*([0-9.]+)\s+([0-9.]+)/);
                if (start) {
                    const marker = createSvgEl('g', { opacity: '.95' });
                    marker.appendChild(createSvgEl('circle', { cx: String(start[1]), cy: String(start[2]), r: '9', fill: 'rgba(52,211,153,.18)', stroke: 'rgba(52,211,153,.68)', 'stroke-width': '1.4', 'vector-effect': 'non-scaling-stroke' }));
                    const num = createSvgEl('text', { x: String(start[1]), y: String(Number(start[2]) + 4), 'text-anchor': 'middle', 'font-size': '10', 'font-weight': '900', 'font-family': 'Inter, sans-serif', fill: '#6EE7B7' });
                    num.textContent = String(index + 1); marker.appendChild(num); strokeLayer.appendChild(marker);
                }
                requestAnimationFrame(() => { path.style.transition = 'stroke-dashoffset 820ms cubic-bezier(.25,.8,.25,1)'; path.style.strokeDashoffset = '0'; });
                setTimeout(resolve, 940);
            });
        }

        async function drawAnimatedKana(k) {
            const svg = document.getElementById('stroke-svg-board'); if (!svg) return;
            const token = ++window.strokeAnimationToken, paths = getStrokeData(k);
            window.isPracticeMode = false; clearPracticeCanvas(); resetScoreBox(); setStrokeMode('auto');
            svg.innerHTML = ''; drawGrid(svg);
            const ghost = createSvgEl('text', { x: '140', y: String(kanaTextY(k)), 'text-anchor': 'middle', 'font-size': String(kanaFontSize(k)), 'font-family': 'Noto Sans JP, sans-serif', 'font-weight': '900', fill: 'rgba(34,211,238,.10)' });
            ghost.textContent = k || ''; svg.appendChild(ghost);
            
            if (!paths.length) { drawTargetKanaOnSvg(k, { fill: '#22D3EE' }); setStrokeLabel('✅ Selesai menonton!', 'text-center text-xs text-emerald-400 mb-3 min-h-[18px] font-bold tracking-wider'); return; }
            const fittedGroup = createSvgEl('g', { transform: getFittedStrokeMatrix(k, paths) });
            setStrokeLabel(`Langkah 1/${paths.length}: ikuti garis tipis.`, 'text-center text-xs text-neutral-300 mb-3 min-h-[18px] font-bold');
            for (let i = 0; i < paths.length; i++) {
                if (token !== window.strokeAnimationToken) return;
                setStrokeLabel(`Langkah ${i + 1}/${paths.length}: perhatikan arah goresan.`, 'text-center text-xs text-neutral-300 mb-3 min-h-[18px] font-bold');
                await animateStrokePath(svg, fittedGroup, paths[i], i, paths.length, token); await wait(180);
            }
            if (token !== window.strokeAnimationToken) return; await wait(180);
            drawTargetKanaOnSvg(k, { fill: '#22D3EE' }); setStrokeLabel('✅ Selesai menonton!', 'text-center text-xs text-emerald-400 mb-3 min-h-[18px] font-bold tracking-wider');
        }

        function setupPracticeCanvas() {
            const canvas = getPracticeCanvas(); if (!canvas) return;
            if (window.practiceCanvasReady) { const clone = canvas.cloneNode(true); canvas.parentNode.replaceChild(clone, canvas); window.practiceCanvasReady = false; return setupPracticeCanvas(); }
            canvas.style.touchAction = 'none';
            const ctx = canvas.getContext('2d'); ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#22D3EE'; ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
            let last = null;
            function getPos(e) { const rect = canvas.getBoundingClientRect(); const p = e.touches && e.touches.length ? e.touches[0] : e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e; return { x: (p.clientX - rect.left) * (canvas.width / rect.width), y: (p.clientY - rect.top) * (canvas.height / rect.height) }; }
            function drawLine(from, to) { const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2; ctx.quadraticCurveTo(from.x, from.y, midX, midY); ctx.stroke(); }
            function startDraw(e) { if (!window.isPracticeMode) return; e.preventDefault(); const pos = getPos(e); window.practiceDrawing = true; last = pos; window.practicePoints.push(pos); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(pos.x + 0.01, pos.y + 0.01); ctx.stroke(); }
            function moveDraw(e) { if (!window.isPracticeMode || !window.practiceDrawing) return; e.preventDefault(); const pos = getPos(e); window.practicePoints.push(pos); if (last) drawLine(last, pos); last = pos; }
            function stopDraw(e) { if (!window.isPracticeMode) return; if (e) e.preventDefault(); window.practiceDrawing = false; last = null; ctx.beginPath(); }
            ['pointerdown','touchstart','mousedown'].forEach(evt => canvas.addEventListener(evt, startDraw, { passive:false }));
            ['pointermove','touchmove','mousemove'].forEach(evt => canvas.addEventListener(evt, moveDraw, { passive:false }));
            ['pointerup','pointercancel','pointerleave','touchend','mouseup','mouseleave'].forEach(evt => canvas.addEventListener(evt, stopDraw, { passive:false }));
            window.practiceCanvasReady = true;
        }

        function buildTargetMask(k) {
            const target = document.createElement('canvas'); target.width = BOARD_W; target.height = BOARD_H;
            const tctx = target.getContext('2d'); tctx.clearRect(0, 0, BOARD_W, BOARD_H); tctx.fillStyle = '#000'; tctx.textAlign = 'center'; tctx.textBaseline = 'alphabetic'; tctx.font = `900 ${kanaFontSize(k)}px "Noto Sans JP", sans-serif`; tctx.fillText(k, BOARD_W / 2, kanaTextY(k));
            const base = tctx.getImageData(0, 0, BOARD_W, BOARD_H), src = base.data, mask = new Uint8ClampedArray(src.length), radius = 5;
            for (let y = 0; y < BOARD_H; y++) {
                for (let x = 0; x < BOARD_W; x++) {
                    const i = (y * BOARD_W + x) * 4;
                    if (src[i + 3] > 20) {
                        for (let dy = -radius; dy <= radius; dy++) {
                            for (let dx = -radius; dx <= radius; dx++) {
                                if ((dx * dx + dy * dy) > radius * radius) continue;
                                const nx = x + dx, ny = y + dy;
                                if (nx < 0 || ny < 0 || nx >= BOARD_W || ny >= BOARD_H) continue;
                                mask[(ny * BOARD_W + nx) * 4 + 3] = 255;
                            }
                        }
                    }
                }
            }
            return { source: src, tolerance: mask };
        }

        function scoreWritingBoard() {
            const canvas = getPracticeCanvas(); if (!canvas) return;
            const drawn = canvas.getContext('2d').getImageData(0, 0, BOARD_W, BOARD_H).data, target = buildTargetMask(window.currentStrokeKana || ''), source = target.source, tolerance = target.tolerance;
            let drawnPixels = 0, goodPixels = 0, targetPixels = 0, coveredTarget = 0;
            for (let i = 3; i < drawn.length; i += 4) {
                const userHasInk = drawn[i] > 20, targetHasInk = source[i] > 20, nearTarget = tolerance[i] > 20;
                if (targetHasInk) targetPixels++; if (userHasInk) drawnPixels++; if (userHasInk && nearTarget) goodPixels++; if (targetHasInk && drawn[i] > 8) coveredTarget++;
            }
            const precision = drawnPixels ? goodPixels / drawnPixels : 0, coverage = targetPixels ? coveredTarget / targetPixels : 0;
            let score = Math.round((precision * 0.58 + coverage * 0.42) * 100);
            if (drawnPixels < 80) score = 0; if (drawnPixels > targetPixels * 2.2) score = Math.min(score, 76);
            score = Math.max(0, Math.min(100, score));
            const text = document.getElementById('writing-score-text'), bar = document.getElementById('writing-score-bar'), desc = document.getElementById('writing-score-desc');
            if (text) text.textContent = score + '%'; if (bar) bar.style.width = score + '%';
            let message = 'Coba lagi, ikuti bayangan huruf lebih dekat.';
            if (score >= 90) message = 'Bagus sekali. Bentuk huruf sudah mirip dan rapi.'; else if (score >= 75) message = 'Sudah bagus, tinggal rapikan beberapa bagian.'; else if (score >= 55) message = 'Lumayan, tetapi masih perlu lebih dekat.';
            if (desc) desc.textContent = message;
            setStrokeLabel(`Skor tulisan: ${score}%`, score >= 75 ? 'text-center text-xs text-emerald-400 mb-3 min-h-[18px] font-bold' : 'text-center text-xs text-amber-300 mb-3 min-h-[18px] font-bold');
        }
        window.scoreWritingBoard = scoreWritingBoard;

        function showStrokeModal(kana, romaji, type) {
            window.currentStrokeKana = kana || ''; window.currentStrokeRomaji = romaji || ''; window.currentStrokeType = type || '';
            const modal = document.getElementById('strokeModal'), roma = document.getElementById('modal-romaji'), category = document.getElementById('modal-type'), total = document.getElementById('modal-strokes');
            if (roma) roma.textContent = romaji || '-'; if (category) category.textContent = type || '-'; if (total) total.textContent = getStrokeData(kana).length || '-';
            if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            window.isPracticeMode = false; clearPracticeCanvas(); resetScoreBox(); setStrokeMode('auto'); drawAnimatedKana(kana);
        }
        window.showStrokeModal = showStrokeModal;

        function hideStrokeModal() {
            window.strokeAnimationToken++; const modal = document.getElementById('strokeModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            window.isPracticeMode = false; clearPracticeCanvas();
        }
        window.hideStrokeModal = hideStrokeModal;
        window.hwAnimate = () => { window.isPracticeMode = false; clearPracticeCanvas(); resetScoreBox(); setStrokeMode('auto'); drawAnimatedKana(window.currentStrokeKana); };
        window.hwPractice = () => { window.strokeAnimationToken++; window.isPracticeMode = true; clearPracticeCanvas(); resetScoreBox(); setStrokeMode('practice'); drawPracticeGuide(window.currentStrokeKana); setupPracticeCanvas(); setStrokeLabel('✏️ Latihan: tulis tipis mengikuti bayangan.', 'text-center text-xs text-neutral-300 mb-3 min-h-[18px] font-bold'); };

        // ====================================================================
        // 6. ML ALGORITHM 3: SPACED REPETITION SYSTEM (SRS)
        // ====================================================================
        let fcWeights = {}, isCardFlipped = false, currentFCItem = null, fcSessionTotal = 0;
        function initFCWeights() { if(Object.keys(fcWeights).length === 0) { allKana.forEach(k => fcWeights[k.r] = 1.0); } }
        function getNextFlashcard() {
            let totalWeight = 0; for(let r in fcWeights) totalWeight += fcWeights[r];
            let rand = Math.random() * totalWeight;
            for(let i=0; i<allKana.length; i++) {
                rand -= fcWeights[allKana[i].r];
                if(rand <= 0) { currentFCItem = allKana[i]; fcSessionTotal++; return; }
            }
            currentFCItem = allKana[0];
        }
        function updateFCWeight(romaji, isCorrect) {
            if(isCorrect) fcWeights[romaji] = Math.max(0.1, fcWeights[romaji] * 0.4);
            else fcWeights[romaji] = Math.min(10.0, fcWeights[romaji] * 3.0);
        }

        function renderFlashcard() {
            const item = currentFCItem, cl = item.k.length, fSize = cl <= 1 ? 'text-[8rem]' : cl === 2 ? 'text-[5.5rem]' : 'text-[4rem]', bSize = item.r.length <= 2 ? 'text-6xl' : item.r.length <= 3 ? 'text-5xl' : 'text-4xl';
            contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 tab-content">
                    <div class="mb-5 text-center">
                        <span class="glass-card px-4 py-1.5 rounded-full text-sm font-semibold text-cyan-300 border border-cyan-400/15">AI Adaptive Spaced Repetition · Sesi ke-${fcSessionTotal}</span>
                        <p class="text-neutral-500 mt-2 text-sm">Ketik Romaji lalu Kirim atau Enter</p>
                    </div>
                    <div class="perspective-1000 w-64 ${cl>=3?'h-72':'h-80'} mb-2 cursor-pointer ${isCardFlipped?'flipped':''}" onclick="toggleFlashcard()">
                        <div class="flip-card-inner relative w-full h-full transform-style-3d shadow-2xl rounded-3xl">
                            <div class="absolute w-full h-full backface-hidden bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-cyan-400/20 rounded-3xl flex items-center justify-center p-4">
                                <span class="${fSize} font-black text-cyan-400 font-jp drop-shadow-lg leading-none">${item.k}</span>
                            </div>
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-600/20 to-dark-800 border-2 border-emerald-400/30 rounded-3xl flex flex-col items-center justify-center p-4">
                                <span class="text-2xl mb-2">🎉</span><span class="text-sm text-emerald-200 mb-1 font-bold">Jawaban Anda</span>
                                <span class="${bSize} font-black text-white font-mono uppercase">${item.r}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center w-full max-w-xs mx-auto mb-6 mt-4">
                        <div class="flex w-full gap-2 relative">
                            <input type="text" id="fc-input"
                                class="flex-1 w-full bg-dark-800 border-2 border-white/[.05] rounded-2xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-cyan-400/60 transition placeholder-neutral-600"
                                placeholder="Ketik romaji..." autocomplete="off" autocapitalize="none" ${isCardFlipped?'disabled':''}
                                oninput="document.getElementById('fc-msg').innerHTML=''" onkeydown="if(event.key==='Enter'){event.preventDefault();submitFCAnswer();}">
                            <button onclick="submitFCAnswer()" class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white p-3 rounded-2xl transition flex items-center justify-center shadow-lg shadow-cyan-500/20" ${isCardFlipped?'disabled':''}>
                                <i data-lucide="send" class="w-5 h-5"></i>
                            </button>
                            ${isCardFlipped?'<div class="absolute right-[4.5rem] top-3.5 text-emerald-400 font-black text-xl">✓</div>':''}
                        </div>
                        <p id="fc-msg" class="h-6 mt-2 text-sm font-bold text-rose-400 text-center"></p>
                    </div>
                    <button onclick="skipFlashcard()" class="px-6 py-2.5 rounded-xl bg-white/[.05] hover:bg-white/[.1] transition font-semibold text-sm text-neutral-400 border border-white/[.05]">Lewati →</button>
                </div>`;
            lucide.createIcons();
            if(!isCardFlipped && window.innerWidth>640) setTimeout(()=>{const e=document.getElementById('fc-input');if(e)e.focus();},100);
        }

        window.toggleFlashcard = () => { isCardFlipped = !isCardFlipped; renderFlashcard(); };
        window.submitFCAnswer = () => {
            if(isCardFlipped) return;
            const inp = document.getElementById('fc-input'), msg = document.getElementById('fc-msg'), val = inp.value.trim().toLowerCase(), item = currentFCItem;
            if(val===''){ msg.innerText='⚠️ Jawaban tidak boleh kosong.'; return; }
            const isCorrect = (val === item.r); updateFCWeight(item.r, isCorrect);
            if(isCorrect){
                msg.className='h-6 mt-2 text-sm font-bold text-emerald-400 text-center'; msg.innerText='✅ Benar! AI mencatat perkembangan Anda.'; isCardFlipped=true; sendScore(1,0,5); renderFlashcard();
                setTimeout(()=>{ if(isCardFlipped) advanceFlashcard(); }, 1200);
            } else {
                msg.className='h-6 mt-2 text-sm font-bold text-rose-400 text-center'; msg.innerText='❌ Salah, AI akan mengulang huruf ini nanti.'; sendScore(0,1,-2); inp.value=''; inp.focus();
            }
        };
        window.skipFlashcard = () => advanceFlashcard();
        function advanceFlashcard() { isCardFlipped=false; getNextFlashcard(); renderFlashcard(); }

        // ==========================================
        // 7. AI MEMBACA MENGGUNAKAN FUZZY LOGIC & NLP
        // ==========================================
        function normalizeRomaji(s){ return s.toLowerCase().replace(/[^a-z]/g,'').replace(/wo/g,'o').replace(/si/g,'shi').replace(/ti/g,'chi').replace(/tu/g,'tsu').replace(/hu/g,'fu').replace(/zi/g,'ji').replace(/koohii/g,'kohi').replace(/depaato/g,'depato').replace(/chokoreeto/g,'chokoreto').replace(/juusu/g,'jusu').replace(/suteeki/g,'suteki'); }

        function initAIReading(){
            const a = aiReadingData[aiUserLevel]; aiCurrentStory = a[Math.floor(Math.random()*a.length)];
            aiTimerStarted = false; aiFinished = false; aiTimeElapsed = 0; aiCurrentFeedback = '';
            aiTimeLimit = Math.floor(aiCurrentStory.romaji.replace(/[^a-z]/g,'').length * (aiUserLevel==='mahir'? 2.5 : 1.2));
            aiTimeRemaining = aiTimeLimit; clearInterval(aiTimerInterval); renderAIReading();
        }

        window.startAITimerIfNeeded = () => {
            if(!aiTimerStarted && !aiFinished){
                aiTimerStarted=true;
                aiTimerInterval = setInterval(() => {
                    aiTimeElapsed++;
                    if(aiUserLevel !== 'pemula') {
                        aiTimeRemaining--; if(aiTimeRemaining <= 0) handleAITimeout();
                    }
                    updateTimerUI();
                }, 1000);
                updateTimerUI();
            }
        };

        function updateTimerUI(){
            const t = document.getElementById('ai-timer-display'); if(!t) return;
            if(aiUserLevel==='pemula'){
                t.innerText=`⏱️ Waktu: ${aiTimeElapsed} detik`; t.className='text-lg font-mono font-bold text-cyan-400';
            } else {
                t.innerText=`⏳ Tersisa: ${aiTimeRemaining} detik`; t.className=aiTimeRemaining<=5 ? 'text-lg font-mono font-bold timer-urgent' : 'text-lg font-mono font-bold text-cyan-400';
            }
        }

        function handleAITimeout(){
            clearInterval(aiTimerInterval); aiFinished = { status: 'timeout' };
            aiCurrentFeedback = 'Waktu Anda Habis. AI akan memberikan penyesuaian level jika perlu.'; sendScore(0,1,-5);
            if(aiUserLevel==='pro') saveAILevel('mahir'); else if(aiUserLevel==='mahir') saveAILevel('pemula');
            renderAIReading(); if(window.MathJax) MathJax.typesetPromise();
        }

        window.submitAIAnswer = () => {
            if(aiFinished) return;
            const inp = document.getElementById('ai-read-input'), msg = document.getElementById('ai-msg'), val = inp.value;
            if(val.trim()===''){ msg.innerText='⚠️ Anda belum mengetik apapun.'; return; }
            clearInterval(aiTimerInterval);
            let nu = normalizeRomaji(val), nt = normalizeRomaji(aiCurrentStory.romaji), timeTaken = (aiUserLevel === 'pemula') ? aiTimeElapsed : (aiTimeLimit - aiTimeRemaining);
            if(timeTaken <= 0) timeTaken = 1;
            let aiEvaluation = evaluateAIResponse(nu, nt, timeTaken, aiUserLevel);
            aiFinished = { status: aiEvaluation.status }; aiCurrentFeedback = aiEvaluation.feedback;
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
                            <textarea id="ai-read-input" rows="2" class="flex-1 w-full bg-dark-800 border-2 border-white/[.05] rounded-2xl p-4 text-xl sm:text-2xl text-white focus:outline-none focus:border-cyan-400/60 transition placeholder-neutral-600 font-bold resize-none" placeholder="Ketik romaji di sini..." autocomplete="off" autocapitalize="none" spellcheck="false" oninput="startAITimerIfNeeded();document.getElementById('ai-msg').innerHTML=''" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitAIAnswer();}"></textarea>
                            <button onclick="submitAIAnswer()" class="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white px-6 py-4 rounded-2xl transition flex items-center justify-center shadow-lg shadow-cyan-500/20 sm:w-auto w-full font-bold gap-2"><i data-lucide="send" class="w-5 h-5"></i> Kirim</button>
                        </div>
                        <p id="ai-msg" class="h-6 mt-2 text-sm font-bold text-rose-400"></p>
                        <p class="text-xs text-neutral-600 mt-2 text-center">*Abaikan spasi/tanda baca. Gunakan double huruf vocal (oo) untuk kata serapan.</p>
                    </div>`;
            }else{
                let iconClass = aiFinished.status==='success' ? 'text-emerald-400' : (aiFinished.status==='partial' ? 'text-amber-400' : 'text-rose-400');
                fb=`
                    <div class="mt-8 glass-card rounded-3xl p-6 sm:p-8 shadow-xl tab-content w-full border border-white/[.05]">
                        <h3 class="text-2xl sm:text-3xl font-black ${iconClass} mb-2 flex items-center gap-2 justify-center"><i data-lucide="brain-circuit" class="w-8 h-8"></i> Hasil Evaluasi AI</h3>
                        <p class="text-center text-white text-lg font-bold mb-1">${aiCurrentFeedback}</p>
                        <p class="text-center text-neutral-400 text-sm mb-8">Kalimat asli: <strong class="text-cyan-300">"${aiCurrentStory.indo}"</strong></p>
                        <div class="grid lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="book-a" class="w-4 h-4 text-cyan-400"></i> Bedah 漢字</h4>
                                <ul class="list-none space-y-3 bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full">${aiCurrentStory.kanjiInfo}</ul>
                            </div>
                            <div>
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="graduation-cap" class="w-4 h-4 text-emerald-400"></i> Analisis 文法</h4>
                                <div class="text-base text-neutral-300 leading-relaxed bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full flex flex-col justify-center text-center overflow-x-auto">${aiCurrentStory.bunpouInfo}</div>
                            </div>
                        </div>
                        <div class="mt-8 flex justify-center">
                            <button onclick="initAIReading()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 transition font-black tracking-wide text-white shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-2">Tantangan AI Selanjutnya <i data-lucide="arrow-right-circle" class="w-5 h-5"></i></button>
                        </div>
                    </div>`;
            }
            let bc=aiUserLevel==='pemula'?'bg-cyan-400/10 border-cyan-400/20 text-cyan-300':aiUserLevel==='mahir'?'bg-blue-400/10 border-blue-400/20 text-blue-300':'bg-rose-400/10 border-rose-400/20 text-rose-300';
            contentDiv.innerHTML=`
                <div class="max-w-4xl mx-auto py-4 tab-content px-2 sm:px-0 flex flex-col items-center w-full">
                    <div class="mb-6 flex justify-between items-center glass-card p-4 rounded-2xl w-full border border-white/[.04]">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/15"><i data-lucide="brain-circuit" class="w-5 h-5 text-cyan-400"></i></div>
                            <div><h2 class="text-white font-bold text-sm sm:text-base">AI Membaca Tingkat Cerdas</h2><p class="text-xs text-neutral-500">Mendeteksi kecepatan & keakuratan (NLP Katakana).</p></div>
                        </div>
                        <span class="inline-flex items-center gap-1.5 border font-bold px-4 py-2 rounded-full text-xs sm:text-sm uppercase tracking-widest ${bc}">${aiUserLevel}</span>
                    </div>
                    <div class="glass-card rounded-3xl p-6 sm:p-10 mb-2 relative overflow-hidden text-center w-full border border-white/[.04]">
                        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
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
