<?php
// Wajib di baris pertama untuk mengambil sesi dari login utama
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$isLoggedIn = !empty($_SESSION['user_name']);
$userName = $isLoggedIn ? $_SESSION['user_name'] : 'Guest';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Belajar Hiragana Lengkap</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- MathJax untuk LaTeX Bunpou -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        .tab-content { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .flashcard-inner { transition: transform 0.6s; transform-style: preserve-3d; }
        .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { backface-visibility: hidden; position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .flashcard-back { transform: rotateY(180deg); }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased" data-logged-in="<?php echo $isLoggedIn ? 'true' : 'false'; ?>">
    <main class="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        
        <!-- HEADER & STATUS LOGIN -->
        <header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between shadow-lg">
            <div>
                <h1 class="text-2xl md:text-4xl font-black text-white">Materi Hiragana</h1>
                <p class="text-slate-400 mt-1">Materi komprehensif, Flashcard, dan Latihan AI Kalimat Acak.</p>
            </div>
            
            <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
                <?php if ($isLoggedIn): ?>
                    <div class="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 self-end w-full md:w-auto justify-end">
                        <div class="text-right">
                            <p class="text-xs text-slate-400">Masuk sebagai:</p>
                            <p class="text-base text-white font-bold tracking-wide"><?php echo htmlspecialchars($userName); ?></p>
                        </div>
                    </div>
                <?php else: ?>
                    <div class="flex items-center justify-end gap-2 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 text-amber-300 text-sm font-medium self-end w-full md:w-auto">
                        <i data-lucide="alert-circle" class="w-4 h-4"></i> Anda belum login (Guest)
                    </div>
                <?php endif; ?>

                <div class="flex gap-2 w-full md:w-auto">
                    <a href="index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali
                    </a>
                    <a href="/index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center gap-2">
                        <i data-lucide="home" class="w-4 h-4"></i> Home
                    </a>
                </div>
            </div>
        </header>

        <!-- TABS NAVIGASI -->
        <nav class="flex flex-wrap gap-2 md:gap-4 p-2 bg-slate-900 rounded-xl border border-slate-700 overflow-x-auto">
            <button id="tab-materi" onclick="switchTab('materi')" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-cyan-600 text-white shadow-md">📚 Materi</button>
            <button id="tab-flashcard" onclick="switchTab('flashcard')" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800">🎴 Flashcard</button>
            <button id="tab-kuis" onclick="switchTab('kuis')" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800">📝 Kuis (Statis)</button>
            <button id="tab-ai" onclick="switchTab('ai')" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-emerald-400 bg-emerald-900/20 border border-emerald-900 hover:bg-emerald-800/40 flex items-center justify-center gap-2">
                <i data-lucide="bot" class="w-4 h-4"></i> AI Kalimat
            </button>
        </nav>

        <!-- KONTEN -->
        <div id="content-container" class="tab-content min-h-[500px]"></div>

    </main>

    <script>
        // Data Hiragana dipindahkan langsung ke JS untuk mencegah SyntaxError ketika file di-preview
        const rawGojuon = [
            [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']],
            [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']],
            [['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']],
            [['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']],
            [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']],
            [['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']],
            [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']],
            [['や','ya'],['',''],['ゆ','yu'],['',''],['よ','yo']],
            [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']],
            [['わ','wa'],['',''],['',''],['',''],['を','wo']],
            [['ん','n'],['',''],['',''],['',''],['','']]
        ];

        const rawDakuon = [
            ['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],
            ['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],
            ['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do'],
            ['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],
            ['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']
        ];

        const rawYoon = [
            ['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],
            ['しゃ','sha'],['しゅ','shu'],['しょ','sho'],
            ['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],
            ['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],
            ['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],
            ['みゃ','mya'],['みゅ','myu'],['みょ','myo'],
            ['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],
            ['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo'],
            ['じゃ','ja'],['じゅ','ju'],['じょ','jo'],
            ['びゃ','bya'],['びゅ','byu'],['びょ','byo'],
            ['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']
        ];
        
        let allKana = [];
        rawGojuon.forEach(row => { row.forEach(item => { if(item[0]) allKana.push({k: item[0], r: item[1], type: 'Seion (Huruf Dasar)'}); }); });
        rawDakuon.forEach(item => { allKana.push({k: item[0], r: item[1], type: item[0].match(/[ぱぴぷぺぽ]/) ? 'Handakuon' : 'Dakuon'}); });
        rawYoon.forEach(item => { allKana.push({k: item[0], r: item[1], type: 'Yoon'}); });

        // Mengambil status login dengan aman dari atribut body untuk mencegah error PHP di Canvas
        const isLoggedIn = document.body.getAttribute('data-logged-in') === 'true';

        // ==========================================
        // DATA KUIS STATIS
        // ==========================================
        const dataKuis = [
            {
                question: "Lengkapilah kalimat berikut ini:\n「わたしは にほんご ___ はなします。」\n(Saya berbicara bahasa Jepang.)",
                options: ["を (o)", "で (de)", "に (ni)", "が (ga)"],
                correct: 0,
                kanjiInfo: `
                    <ul class="space-y-1">
                        <li><strong>私 (わたし)</strong> : Artinya "Saya".</li>
                        <li><strong>日本語 (にほんご)</strong> : Bahasa Jepang.</li>
                        <li><strong>話します (はなします)</strong> : Berasal dari kata kerja 話す (hanasu). Artinya "Berbicara".</li>
                    </ul>
                `,
                bunpouInfo: `
                    $$\\text{[Subjek]} + \\text{は} + \\text{[Objek Penderita]} + \\text{を} + \\text{[Kata Kerja]}$$
                    <p class="mt-2 text-slate-300">Partikel <strong>を (o)</strong> digunakan sebagai penanda objek langsung yang dikenai pekerjaan (Berbicara Bahasa Jepang).</p>
                `
            },
            {
                question: "Pilihlah partikel yang tepat:\n「あした がっこう ___ いきます。」\n(Saya pergi ke sekolah besok.)",
                options: ["を (o)", "へ (e)", "が (ga)", "で (de)"],
                correct: 1,
                kanjiInfo: `
                    <ul class="space-y-1">
                        <li><strong>明日 (あした)</strong> : Artinya "Besok".</li>
                        <li><strong>学校 (がっこう)</strong> : Artinya "Sekolah".</li>
                        <li><strong>行きます (いきます)</strong> : Berasal dari kata kerja 行く (iku). Artinya "Pergi".</li>
                    </ul>
                `,
                bunpouInfo: `
                    $$\\text{[Waktu]} + \\text{[Tempat Tujuan]} + \\text{へ (e)} + \\text{[Kata Kerja Pindah/Pergi]}$$
                    <p class="mt-2 text-slate-300">Partikel <strong>へ (e)</strong> digunakan untuk menunjukkan arah pergerakan atau destinasi (menuju ke sekolah).</p>
                `
            }
        ];

        // Kirim Skor ke SQL
        function sendScore(correct, wrong, points) {
            if (!isLoggedIn) return; // Jangan kirim jika belum login
            fetch('save_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correct, wrong, points, material: 'hiragana' })
            }).catch(err => console.error('Gagal menyimpan skor:', err));
        }

        const contentDiv = document.getElementById('content-container');
        
        // Pindah Tab
        function switchTab(tab) {
            ['materi', 'flashcard', 'kuis', 'ai'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (btn) {
                    if(t === tab) {
                        btn.className = t === 'ai' 
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-cyan-600 text-white shadow-md flex items-center justify-center gap-2";
                    } else {
                        btn.className = t === 'ai'
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-emerald-400 bg-emerald-900/20 border border-emerald-900 hover:bg-emerald-800/40 flex items-center justify-center gap-2"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center gap-2";
                    }
                }
            });

            if (tab === 'materi') renderMateri();
            if (tab === 'flashcard') initFlashcard();
            if (tab === 'kuis') { activeQuizIndex = 0; quizAnswered = false; renderKuis(); }
            if (tab === 'ai') initAI();

            if (window.MathJax) { MathJax.typesetPromise(); }
            lucide.createIcons();
        }

        // ==========================================
        // 1. RENDER MATERI (Dukung Mobile)
        // ==========================================
        function buildGrid(data, cols = 5) {
            let gridCols = cols === 5 ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3';
            let html = `<div class="grid ${gridCols} gap-2 mb-4">`;
            data.forEach(item => {
                if (!item[0]) {
                    html += `<div class="rounded-lg p-3 text-center bg-slate-800/40 hidden sm:block"></div>`; 
                } else {
                    html += `
                        <div class="rounded-xl p-3 text-center bg-slate-800 border border-slate-700 hover:bg-slate-700 transition cursor-pointer flex flex-col items-center justify-center shadow-md">
                            <div class="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow">${item[0]}</div>
                            <div class="text-xs sm:text-sm text-cyan-300 font-mono tracking-widest">${item[1]}</div>
                        </div>
                    `;
                }
            });
            html += `</div>`;
            return html;
        }

        function renderMateri() {
            let gojuonHtml = '';
            rawGojuon.forEach(row => { gojuonHtml += buildGrid(row, 5); });

            contentDiv.innerHTML = `
                <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-8 shadow-lg mb-6">
                    <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="book" class="text-cyan-400"></i> Huruf Dasar (Gojuon)</h2>
                    ${gojuonHtml}
                </section>
                <section class="grid lg:grid-cols-2 gap-4">
                    <div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 md:p-5 shadow-lg">
                        <h2 class="text-base sm:text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="sparkles" class="text-indigo-400"></i> Dakuon & Handakuon</h2>
                        ${buildGrid(rawDakuon, 5)}
                    </div>
                    <div class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 md:p-5 shadow-lg">
                        <h2 class="text-base sm:text-lg font-bold mb-4 flex items-center gap-2"><i data-lucide="zap" class="text-emerald-400"></i> Bunyi Campuran (Yoon)</h2>
                        ${buildGrid(rawYoon, 3)}
                    </div>
                </section>
            `;
        }

        // ==========================================
        // 2. FLASHCARD ACAK (Dukung Mobile)
        // ==========================================
        let shuffledCards = [];
        let fcIndex = 0;
        let fcFlipped = false;

        function shuffle(array) {
            let currentIndex = array.length, randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        function initFlashcard() {
            shuffledCards = shuffle([...allKana]);
            fcIndex = 0;
            fcFlipped = false;
            renderFlashcard();
        }

        function renderFlashcard() {
            const card = shuffledCards[fcIndex];
            contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 sm:py-8 px-2 animate-[fadeIn_0.3s_ease-out]">
                    <p class="text-slate-400 mb-4 text-sm">Kartu ${fcIndex + 1} / ${shuffledCards.length} (Acak)</p>
                    <div class="flashcard w-full max-w-[240px] sm:max-w-xs h-72 sm:h-80 relative perspective-1000 ${fcFlipped ? 'flipped' : ''}" style="perspective: 1000px;">
                        <div class="flashcard-inner absolute w-full h-full shadow-2xl rounded-2xl">
                            <!-- Depan (Kana) -->
                            <div class="flashcard-front bg-slate-800 border-2 border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center p-6">
                                <span class="text-7xl sm:text-8xl font-black text-white mb-4 drop-shadow-lg">${card.k}</span>
                            </div>
                            <!-- Belakang (Romaji) -->
                            <div class="flashcard-back bg-cyan-900 border-2 border-cyan-400 rounded-2xl flex flex-col items-center justify-center p-6">
                                <span class="text-xl sm:text-2xl text-cyan-200 mb-2 font-bold">Tepat Sekali!</span>
                                <span class="text-5xl sm:text-6xl font-black text-white drop-shadow-lg uppercase">${card.r}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 w-full max-w-sm">
                        <input type="text" id="fc-input" autocomplete="off" autocapitalize="none" placeholder="Ketik romaji di sini..." class="w-full bg-slate-900 border-2 border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-center text-lg sm:text-xl font-bold outline-none transition-colors" ${fcFlipped ? 'disabled' : ''}>
                        <div id="fc-msg" class="text-center mt-3 h-6 text-sm font-bold"></div>
                    </div>
                </div>
            `;
            
            if (!fcFlipped) {
                if(window.innerWidth > 640) {
                    setTimeout(() => { const el = document.getElementById('fc-input'); if(el) el.focus(); }, 100);
                }
            }

            document.getElementById('fc-input')?.addEventListener('input', (e) => {
                const val = e.target.value.trim().toLowerCase();
                if (val === card.r) {
                    fcFlipped = true;
                    sendScore(1, 0, 10);
                    renderFlashcard();
                    document.getElementById('fc-msg').innerHTML = '<span class="text-emerald-400">✅ Benar! +10 Poin</span>';
                    setTimeout(() => {
                        fcIndex = (fcIndex + 1) % shuffledCards.length;
                        fcFlipped = false;
                        renderFlashcard();
                    }, 1500);
                }
            });
        }

        // ==========================================
        // 3. KUIS KALIMAT (Statis)
        // ==========================================
        let activeQuizIndex = 0;
        let quizAnswered = false;

        function renderKuis() {
            const q = dataKuis[activeQuizIndex];
            
            let optionsHtml = q.options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition font-medium text-base sm:text-lg";
                if (quizAnswered) {
                    if (idx === q.correct) {
                        btnClass = "w-full text-left p-4 rounded-xl border-2 border-cyan-500 bg-cyan-900/30 text-cyan-300 font-bold";
                    } else {
                        btnClass = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed";
                    }
                }
                return `<button ${quizAnswered ? 'disabled' : ''} onclick="answerQuiz(${idx})" class="${btnClass}">${String.fromCharCode(65+idx)}. ${opt}</button>`;
            }).join('');

            let explanationHtml = '';
            if (quizAnswered) {
                explanationHtml = `
                    <div class="mt-6 bg-slate-950 rounded-xl border border-cyan-500/30 p-4 sm:p-6 animate-[fadeIn_0.5s_ease-out]">
                        <h3 class="text-cyan-400 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">✅ Penjelasan Lengkap</h3>
                        <div class="mb-5">
                            <h4 class="text-xs sm:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2"><i data-lucide="book-a" class="w-4 h-4"></i> Bedah 漢字 (Kanji)</h4>
                            <div class="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-800 text-xs sm:text-sm leading-relaxed">${q.kanjiInfo}</div>
                        </div>
                        <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2"><i data-lucide="graduation-cap" class="w-4 h-4"></i> Penjelasan 文法 (Bunpou)</h4>
                            <div class="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-800 overflow-x-auto text-xs sm:text-sm">${q.bunpouInfo}</div>
                        </div>
                        <button onclick="nextQuiz()" class="mt-6 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors text-sm sm:text-base">
                            ${activeQuizIndex < dataKuis.length - 1 ? 'Soal Selanjutnya ➡' : 'Ulangi Kuis 🔄'}
                        </button>
                    </div>
                `;
            }

            contentDiv.innerHTML = `
                <div class="max-w-3xl mx-auto px-2 sm:px-0">
                    <div class="mb-4 text-cyan-400 font-bold tracking-wider text-xs sm:text-sm">Soal Statis ${activeQuizIndex + 1} / ${dataKuis.length}</div>
                    <div class="text-lg sm:text-2xl font-bold text-white mb-6 leading-relaxed whitespace-pre-line">${q.question}</div>
                    <div class="space-y-3">${optionsHtml}</div>
                    ${explanationHtml}
                </div>
            `;
            if (window.MathJax) MathJax.typesetPromise();
            lucide.createIcons();
        }

        window.answerQuiz = (idx) => {
            quizAnswered = true;
            const q = dataKuis[activeQuizIndex];
            if (idx === q.correct) sendScore(1, 0, 15);
            else sendScore(0, 1, -5);
            renderKuis();
        };

        window.nextQuiz = () => {
            quizAnswered = false;
            activeQuizIndex = (activeQuizIndex + 1) % dataKuis.length;
            renderKuis();
        };

        // ==========================================
        // 4. KUIS AI GENERATOR (MACHINE LEARNING ALGORITHM)
        // ==========================================
        
        // Kamus AI Lengkap (Mencakup Seion, Dakuon, Handakuon, Yoon)
        const aiDict = {
            subjects: [
                { j: '私', h: 'わたし', m: 'Saya (Seion)' },
                { j: '彼', h: 'かれ', m: 'Dia (Laki-laki)' },
                { j: '彼女', h: 'かのじょ', m: 'Dia (Perempuan - Yoon)' },
                { j: '先生', h: 'せんせい', m: 'Guru' },
                { j: '医者', h: 'いしゃ', m: 'Dokter (Yoon)' }
            ],
            places: [
                { j: '学校', h: 'がっこう', m: 'Sekolah (Dakuon)' },
                { j: '病院', h: 'びょういん', m: 'Rumah Sakit (Yoon)' },
                { j: '会社', h: 'かいしゃ', m: 'Perusahaan (Yoon)' },
                { j: '食堂', h: 'しょくどう', m: 'Kantin (Yoon)' },
                { j: '公園', h: 'こうえん', m: 'Taman' }
            ],
            objects: [
                { j: '辞書', h: 'じしょ', m: 'Kamus (Yoon)' },
                { j: '雑誌', h: 'ざっし', m: 'Majalah (Dakuon)' },
                { j: 'お茶', h: 'おちゃ', m: 'Teh (Yoon)' },
                { j: '手紙', h: 'てがみ', m: 'Surat (Dakuon)' },
                { j: '鉛筆', h: 'えんぴつ', m: 'Pensil (Handakuon)' },
                { j: '鞄', h: 'かばん', m: 'Tas (Dakuon)' },
                { j: '切符', h: 'きっぷ', m: 'Tiket (Handakuon)' },
                { j: '新聞', h: 'しんぶん', m: 'Koran (Dakuon)' }
            ],
            verbs: [
                { j: '買います', h: 'かいます', m: 'Membeli', k: '買' },
                { j: '読みます', h: 'よみます', m: 'Membaca', k: '読' },
                { j: '見ます', h: 'みます', m: 'Melihat', k: '見' },
                { j: '書きます', h: 'かきます', m: 'Menulis', k: '書' }
            ]
        };

        let currentAIQ = null;
        let aiQuizAnswered = false;

        function initAI() {
            // Algoritma Generator (Ratusan Kombinasi)
            let s = aiDict.subjects[Math.floor(Math.random() * aiDict.subjects.length)];
            let p = aiDict.places[Math.floor(Math.random() * aiDict.places.length)];
            let o = aiDict.objects[Math.floor(Math.random() * aiDict.objects.length)];
            let v = aiDict.verbs[Math.floor(Math.random() * aiDict.verbs.length)];

            // Pertanyaan: Tebak Hiragana dari Objek
            let questionText = `Lengkapilah kalimat berikut dengan Hiragana yang tepat:\n「${s.j} は ${p.j} で ___ を ${v.j}。」\n(${s.m.split(' ')[0]} ${v.m.toLowerCase()} ${o.m.split(' ')[0].toLowerCase()} di ${p.m.split(' ')[0].toLowerCase()}.)`;

            let correctAns = o.h;

            // Buat pilihan salah (Ambil 3 objek lain secara acak)
            let wrongOptions = shuffle(aiDict.objects.filter(x => x.h !== correctAns)).slice(0, 3).map(x => x.h);
            let options = shuffle([correctAns, ...wrongOptions]);
            let correctIdx = options.indexOf(correctAns);

            let kanjiHtml = `
                <ul class="space-y-2">
                    <li><strong>${s.j} (${s.h})</strong> : ${s.m}</li>
                    <li><strong>${p.j} (${p.h})</strong> : ${p.m}</li>
                    <li><strong class="text-emerald-400 text-lg">${o.j} (${o.h})</strong> : ${o.m} <em>(Ini jawaban benar!)</em></li>
                    <li><strong>${v.j} (${v.h})</strong> : Menggunakan kanji ${v.k}, artinya "${v.m}"</li>
                </ul>
            `;

            let bunpouHtml = `
                $$\\text{[Subjek]} + \\text{は (wa)} + \\text{[Tempat]} + \\text{で (de)} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$
                <p class="mt-3 text-slate-300">
                    <strong>Penjelasan Struktur:</strong><br>
                    - <strong class="text-emerald-400">は (wa)</strong> : Penanda subjek kalimat (Siapa yang melakukan).<br>
                    - <strong class="text-emerald-400">で (de)</strong> : Penanda tempat aktivitas berlangsung.<br>
                    - <strong class="text-emerald-400">を (o)</strong> : Penanda objek yang dikenai aktivitas (${o.m.split(' ')[0]}).
                </p>
            `;

            currentAIQ = {
                q: questionText,
                opts: options,
                ans: correctIdx,
                kanji: kanjiHtml,
                bunpou: bunpouHtml
            };

            aiQuizAnswered = false;
            renderAIQuiz();
        }

        function renderAIQuiz() {
            let optionsHtml = currentAIQ.opts.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border border-emerald-700/50 bg-emerald-900/10 hover:bg-emerald-900/30 transition font-bold text-base sm:text-xl text-white tracking-widest";
                if (aiQuizAnswered) {
                    if (idx === currentAIQ.ans) {
                        btnClass = "w-full text-left p-4 rounded-xl border-2 border-emerald-400 bg-emerald-600 text-white font-black drop-shadow-md";
                    } else {
                        btnClass = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed font-medium";
                    }
                }
                return `<button ${aiQuizAnswered ? 'disabled' : ''} onclick="answerAIQuiz(${idx})" class="${btnClass}">${String.fromCharCode(65+idx)}. ${opt}</button>`;
            }).join('');

            let explanationHtml = '';
            if (aiQuizAnswered) {
                explanationHtml = `
                    <div class="mt-6 bg-slate-950 rounded-xl border border-emerald-500/50 p-4 sm:p-6 animate-[fadeIn_0.5s_ease-out] shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <h3 class="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base"><i data-lucide="check-circle" class="w-5 h-5"></i> Penjelasan Cerdas AI</h3>
                        <div class="mb-5">
                            <h4 class="text-xs sm:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2"><i data-lucide="book-a" class="w-4 h-4"></i> Bedah 漢字 (Kanji)</h4>
                            <div class="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-800 text-xs sm:text-sm leading-relaxed">${currentAIQ.kanji}</div>
                        </div>
                        <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2"><i data-lucide="graduation-cap" class="w-4 h-4"></i> Penjelasan 文法 (Bunpou)</h4>
                            <div class="bg-slate-900 rounded-lg p-3 sm:p-4 border border-slate-800 overflow-x-auto text-xs sm:text-sm">${currentAIQ.bunpou}</div>
                        </div>
                        <button onclick="initAI()" class="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-wide rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i> Buat Kalimat Acak Baru
                        </button>
                    </div>
                `;
            }

            contentDiv.innerHTML = `
                <div class="max-w-3xl mx-auto px-2 sm:px-0">
                    <div class="mb-4 text-emerald-400 font-bold tracking-wider text-xs sm:text-sm flex items-center gap-2">
                        <i data-lucide="cpu" class="w-4 h-4"></i> AI Sentence Generator (Tidak Terbatas)
                    </div>
                    <div class="text-lg sm:text-2xl font-bold text-white mb-6 leading-relaxed whitespace-pre-line">${currentAIQ.q}</div>
                    <div class="grid sm:grid-cols-2 gap-3 mb-6">${optionsHtml}</div>
                    ${explanationHtml}
                </div>
            `;
            if (window.MathJax) MathJax.typesetPromise();
            lucide.createIcons();
        }

        window.answerAIQuiz = (idx) => {
            aiQuizAnswered = true;
            if (idx === currentAIQ.ans) {
                sendScore(1, 0, 25); // Poin lebih besar karena soal acak/AI
            } else {
                sendScore(0, 1, -5);
            }
            renderAIQuiz();
        };

        // Inisialisasi awal
        switchTab('materi');
    </script>
</body>
</html>
