<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Belajar Katakana Lengkap & AI Pintar</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- MathJax untuk render LaTeX Bunpou -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        /* Animasi Bolak-Balik Flashcard */
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .flip-card-inner { transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
        .flipped .flip-card-inner { transform: rotateY(180deg); }
        
        /* Transisi Lembut */
        .tab-content { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Animasi Penulisan Huruf */
        @keyframes drawPulse {
            0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(6, 182, 212, 0)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.6)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(6, 182, 212, 0)); }
        }
        .draw-animation { animation: drawPulse 2s infinite ease-in-out; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-cyan-500 selection:text-white pb-20">

    <main class="max-w-4xl mx-auto px-4 py-8 relative">
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-800 pb-6">
            <div>
                <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Belajar Katakana (カタカナ)
                </h1>
                <p class="text-slate-400 mt-2">Pelajari materi, lalu uji kemampuanmu dengan AI!</p>
            </div>
            <!-- Tombol Navigasi Sesuai Request -->
            <div class="flex flex-wrap gap-2">
                <a href="/Belajar/Index.php" class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm hover:bg-slate-700 font-medium transition">Back Belajar</a>
                <a href="/index.php" class="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm hover:bg-cyan-500 font-bold transition">Home Utama</a>
            </div>
        </header>

        <!-- Navigasi Tab -->
        <nav class="flex flex-wrap sm:flex-nowrap gap-2 mb-8 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button onclick="switchTab('materi')" id="tab-materi" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-cyan-600 text-white shadow-md">📚 Materi Katakana</button>
            <button onclick="switchTab('flashcard')" id="tab-flashcard" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800">🎴 Flashcard Acak</button>
            <button onclick="switchTab('kuis')" id="tab-kuis" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800">📝 Kuis AI (Kalimat)</button>
            <button onclick="switchTab('ai')" id="tab-ai" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-emerald-400 bg-emerald-900/20 border border-emerald-900 hover:bg-emerald-800/40">🤖 Latihan AI (Huruf)</button>
        </nav>

        <!-- Kontainer Utama -->
        <div id="content-container" class="min-h-[400px]"></div>

        <footer class="mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
            Credit: <strong>Darma</strong> - Dikembangkan dengan ❤️ & AI
        </footer>

        <!-- Modal Cara Penulisan (Stroke Order) -->
        <div id="strokeModal" class="hidden fixed inset-0 bg-slate-950/90 z-50 flex justify-center items-center px-4 backdrop-blur-sm transition-opacity">
            <div class="bg-slate-900 border border-cyan-500/50 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl shadow-cyan-900/20">
                <button onclick="hideStrokeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full w-10 h-10 flex items-center justify-center transition">✕</button>
                <h3 class="text-xl font-bold text-cyan-400 mb-6 text-center">Cara Penulisan & Detail</h3>
                
                <!-- Animasi Penulisan -->
                <div class="text-9xl font-black text-white text-center border-4 border-dashed border-slate-700 bg-slate-800/50 rounded-2xl py-10 mb-6 relative draw-animation" style="font-family: 'Yu Mincho', 'Klee One', serif;">
                    <span id="modal-kana">ア</span>
                </div>
                
                <div class="bg-slate-800 p-4 rounded-xl text-center mb-4">
                    <p class="text-slate-400 text-sm uppercase tracking-widest mb-1">Romaji</p>
                    <p class="text-3xl font-mono text-emerald-400 font-bold" id="modal-romaji">a</p>
                </div>
                
                <p class="text-center text-slate-400 text-sm mb-4">Kategori Huruf: <span id="modal-type" class="text-cyan-300 font-bold">Seion</span></p>
                
                <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 text-left leading-relaxed">
                    <strong class="text-white block mb-2">📌 Panduan Coretan:</strong>
                    Secara umum, ikuti prinsip dasar penulisan bahasa Jepang:
                    <ul class="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                        <li>Dari <strong>Kiri</strong> ke <strong>Kanan</strong>.</li>
                        <li>Dari <strong>Atas</strong> ke <strong>Bawah</strong>.</li>
                        <li>Garis melintang (horizontal) ditulis sebelum garis tegak (vertikal).</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>

    <script>
        // ==========================================
        // 1. DATABASE MATERI KATAKANA (LENGKAP)
        // ==========================================
        const dataGojuuon = [
            {k: 'ア', r: 'a', type: 'Seion'}, {k: 'イ', r: 'i', type: 'Seion'}, {k: 'ウ', r: 'u', type: 'Seion'}, {k: 'エ', r: 'e', type: 'Seion'}, {k: 'オ', r: 'o', type: 'Seion'},
            {k: 'カ', r: 'ka', type: 'Seion'}, {k: 'キ', r: 'ki', type: 'Seion'}, {k: 'ク', r: 'ku', type: 'Seion'}, {k: 'ケ', r: 'ke', type: 'Seion'}, {k: 'コ', r: 'ko', type: 'Seion'},
            {k: 'サ', r: 'sa', type: 'Seion'}, {k: 'シ', r: 'shi', type: 'Seion'}, {k: 'ス', r: 'su', type: 'Seion'}, {k: 'セ', r: 'se', type: 'Seion'}, {k: 'ソ', r: 'so', type: 'Seion'},
            {k: 'タ', r: 'ta', type: 'Seion'}, {k: 'チ', r: 'chi', type: 'Seion'}, {k: 'ツ', r: 'tsu', type: 'Seion'}, {k: 'テ', r: 'te', type: 'Seion'}, {k: 'ト', r: 'to', type: 'Seion'},
            {k: 'ナ', r: 'na', type: 'Seion'}, {k: 'ニ', r: 'ni', type: 'Seion'}, {k: 'ヌ', r: 'nu', type: 'Seion'}, {k: 'ネ', r: 'ne', type: 'Seion'}, {k: 'ノ', r: 'no', type: 'Seion'},
            {k: 'ハ', r: 'ha', type: 'Seion'}, {k: 'ヒ', r: 'hi', type: 'Seion'}, {k: 'フ', r: 'fu', type: 'Seion'}, {k: 'ヘ', r: 'he', type: 'Seion'}, {k: 'ホ', r: 'ho', type: 'Seion'},
            {k: 'マ', r: 'ma', type: 'Seion'}, {k: 'ミ', r: 'mi', type: 'Seion'}, {k: 'ム', r: 'mu', type: 'Seion'}, {k: 'メ', r: 'me', type: 'Seion'}, {k: 'モ', r: 'mo', type: 'Seion'},
            {k: 'ヤ', r: 'ya', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ユ', r: 'yu', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ヨ', r: 'yo', type: 'Seion'},
            {k: 'ラ', r: 'ra', type: 'Seion'}, {k: 'リ', r: 'ri', type: 'Seion'}, {k: 'ル', r: 'ru', type: 'Seion'}, {k: 'レ', r: 're', type: 'Seion'}, {k: 'ロ', r: 'ro', type: 'Seion'},
            {k: 'ワ', r: 'wa', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ヲ', r: 'wo', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ン', r: 'n', type: 'Seion'}
        ];

        const dataDakuon = [
            {k: 'ガ', r: 'ga', type: 'Dakuon'}, {k: 'ギ', r: 'gi', type: 'Dakuon'}, {k: 'グ', r: 'gu', type: 'Dakuon'}, {k: 'ゲ', r: 'ge', type: 'Dakuon'}, {k: 'ゴ', r: 'go', type: 'Dakuon'},
            {k: 'ザ', r: 'za', type: 'Dakuon'}, {k: 'ジ', r: 'ji', type: 'Dakuon'}, {k: 'ズ', r: 'zu', type: 'Dakuon'}, {k: 'ゼ', r: 'ze', type: 'Dakuon'}, {k: 'ゾ', r: 'zo', type: 'Dakuon'},
            {k: 'ダ', r: 'da', type: 'Dakuon'}, {k: 'ヂ', r: 'ji', type: 'Dakuon'}, {k: 'ヅ', r: 'zu', type: 'Dakuon'}, {k: 'デ', r: 'de', type: 'Dakuon'}, {k: 'ド', r: 'do', type: 'Dakuon'},
            {k: 'バ', r: 'ba', type: 'Dakuon'}, {k: 'ビ', r: 'bi', type: 'Dakuon'}, {k: 'ブ', r: 'bu', type: 'Dakuon'}, {k: 'ベ', r: 'be', type: 'Dakuon'}, {k: 'ボ', r: 'bo', type: 'Dakuon'},
            {k: 'パ', r: 'pa', type: 'Handakuon'}, {k: 'ピ', r: 'pi', type: 'Handakuon'}, {k: 'プ', r: 'pu', type: 'Handakuon'}, {k: 'ペ', r: 'pe', type: 'Handakuon'}, {k: 'ポ', r: 'po', type: 'Handakuon'}
        ];

        const dataYoon = [
            {k: 'キャ', r: 'kya', type: 'Yoon'}, {k: 'キュ', r: 'kyu', type: 'Yoon'}, {k: 'キョ', r: 'kyo', type: 'Yoon'},
            {k: 'シャ', r: 'sha', type: 'Yoon'}, {k: 'シュ', r: 'shu', type: 'Yoon'}, {k: 'ショ', r: 'sho', type: 'Yoon'},
            {k: 'チャ', r: 'cha', type: 'Yoon'}, {k: 'チュ', r: 'chu', type: 'Yoon'}, {k: 'チョ', r: 'cho', type: 'Yoon'},
            {k: 'ニャ', r: 'nya', type: 'Yoon'}, {k: 'ニュ', r: 'nyu', type: 'Yoon'}, {k: 'ニョ', r: 'nyo', type: 'Yoon'},
            {k: 'ヒャ', r: 'hya', type: 'Yoon'}, {k: 'ヒュ', r: 'hyu', type: 'Yoon'}, {k: 'ヒョ', r: 'hyo', type: 'Yoon'},
            {k: 'ミャ', r: 'mya', type: 'Yoon'}, {k: 'ミュ', r: 'myu', type: 'Yoon'}, {k: 'ミョ', r: 'myo', type: 'Yoon'},
            {k: 'リャ', r: 'rya', type: 'Yoon'}, {k: 'リュ', r: 'ryu', type: 'Yoon'}, {k: 'リョ', r: 'ryo', type: 'Yoon'},
            {k: 'ギャ', r: 'gya', type: 'Yoon (Dakuon)'}, {k: 'ギュ', r: 'gyu', type: 'Yoon (Dakuon)'}, {k: 'ギョ', r: 'gyo', type: 'Yoon (Dakuon)'},
            {k: 'ジャ', r: 'ja', type: 'Yoon (Dakuon)'}, {k: 'ジュ', r: 'ju', type: 'Yoon (Dakuon)'}, {k: 'ジョ', r: 'jo', type: 'Yoon (Dakuon)'},
            {k: 'ビャ', r: 'bya', type: 'Yoon (Dakuon)'}, {k: 'ビュ', r: 'byu', type: 'Yoon (Dakuon)'}, {k: 'ビョ', r: 'byo', type: 'Yoon (Dakuon)'},
            {k: 'ピャ', r: 'pya', type: 'Yoon (Handakuon)'}, {k: 'ピュ', r: 'pyu', type: 'Yoon (Handakuon)'}, {k: 'ピョ', r: 'pyo', type: 'Yoon (Handakuon)'}
        ];

        const allKana = [...dataGojuuon, ...dataDakuon, ...dataYoon].filter(item => item.k !== '');

        // ==========================================
        // 2. DICTIONARY AI PENYUSUN KALIMAT (DINAMIS)
        // ==========================================
        const aiSubjects = [
            { j: "私", h: "わたし", id: "Saya", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>私 (わたし)</span> : Artinya 'Saya'.</li>" },
            { j: "彼", h: "かれ", id: "Dia (Laki-laki)", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>彼 (かれ)</span> : Artinya 'Dia (laki-laki)'.</li>" },
            { j: "彼女", h: "かのじょ", id: "Dia (Perempuan)", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>彼女 (かのじょ)</span> : Terdiri dari kanji 彼 (dia) dan 女 (perempuan). Artinya 'Dia (perempuan)'.</li>" },
            { j: "先生", h: "せんせい", id: "Guru", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>先生 (せんせい)</span> : Terdiri dari 先 (sebelum/duluan) dan 生 (hidup/lahir). Artinya 'Guru'.</li>" },
            { j: "友達", h: "ともだち", id: "Teman", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>友達 (ともだち)</span> : Terdiri dari kanji 友 (teman) dan 達 (jamak). Artinya 'Teman'.</li>" }
        ];

        const aiPlaces = [
            { j: "コンビニ", id: "Minimarket", kInfo: "" },
            { j: "デパート", id: "Department Store", kInfo: "" },
            { j: "ホテル", id: "Hotel", kInfo: "" },
            { j: "部屋", h: "へや", id: "Kamar", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>部屋 (へや)</span> : Terdiri dari 部 (bagian) dan 屋 (atap/toko). Artinya 'Kamar'.</li>" },
            { j: "会社", h: "かいしゃ", id: "Perusahaan/Kantor", kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>会社 (かいしゃ)</span> : Terdiri dari 会 (berkumpul) dan 社 (perusahaan). Artinya 'Perusahaan / Kantor'.</li>" }
        ];

        const aiVerbsAction = [
            { j: "買います", h: "かいます", id: "membeli", validObjects: ["パン", "コーヒー", "ケーキ", "カメラ", "パソコン", "ペン", "シャツ"], kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>買います (かいます)</span> : Berasal dari kata kerja 買う (membeli) yang menggunakan kanji 買 (beli). Artinya 'Membeli'.</li>" },
            { j: "食べます", h: "たべます", id: "makan", validObjects: ["パン", "ケーキ", "チョコレート"], kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>食べます (たべます)</span> : Berasal dari kata kerja 食べる (makan) yang menggunakan kanji 食 (makan). Artinya 'Makan'.</li>" },
            { j: "飲みます", h: "のみます", id: "minum", validObjects: ["コーヒー", "ジュース", "ミルク"], kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>飲みます (のみます)</span> : Berasal dari kata kerja 飲む (minum) yang menggunakan kanji 飲 (minum). Artinya 'Minum'.</li>" },
            { j: "見ます", h: "みます", id: "melihat/menonton", validObjects: ["テレビ", "アニメ", "ニュース"], kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>見ます (みます)</span> : Berasal dari kata kerja 見る (melihat) yang menggunakan kanji 見 (melihat). Artinya 'Melihat / Menonton'.</li>" },
            { j: "作ります", h: "つかります", id: "membuat", validObjects: ["ケーキ", "パン", "コーヒー"], kInfo: "<li><span class='text-cyan-400 font-bold text-lg'>作ります (つかります)</span> : Berasal dari kata kerja 作る (membuat) yang menggunakan kanji 作 (membuat). Artinya 'Membuat'.</li>" }
        ];

        const aiObjects = {
            "パン": { r: "pan", id: "roti" },
            "コーヒー": { r: "koohii", id: "kopi" },
            "ケーキ": { r: "keeki", id: "kue" },
            "カメラ": { r: "kamera", id: "kamera" },
            "パソコン": { r: "pasokon", id: "PC/Laptop" },
            "ペン": { r: "pen", id: "pulpen" },
            "テレビ": { r: "terebi", id: "TV" },
            "アニメ": { r: "anime", id: "anime" },
            "ニュース": { r: "nyuusu", id: "berita" },
            "ジュース": { r: "juusu", id: "jus" },
            "ミルク": { r: "miruku", id: "susu" },
            "シャツ": { r: "shatsu", id: "kemeja" },
            "チョコレート": { r: "chokoreeto", id: "cokelat" }
        };

        const aiCountries = [
            { k: "アメリカ", id: "Amerika" },
            { k: "イギリス", id: "Inggris" },
            { k: "インドネシア", id: "Indonesia" },
            { k: "ドイツ", id: "Jerman" },
            { k: "フランス", id: "Prancis" },
            { k: "オーストラリア", id: "Australia" }
        ];

        // State Aplikasi
        let flashcardSequence = [];
        let currentFlashcardIndex = 0;
        let isCardFlipped = false;
        
        let currentQuiz = null; // Menyimpan soal kalimat yang di-generate AI
        let quizAnswered = false;
        
        let aiCurrentKana = null; // Menyimpan huruf untuk kuis AI huruf tunggal
        let aiAnswered = false;
        
        let totalQuizzesDone = 0;

        const contentDiv = document.getElementById('content-container');

        // ==========================================
        // LEADERBOARD SCRIPTING (Pengiriman API ke Backend)
        // ==========================================
        window.sendScore = (correct, wrong, points) => {
            // Gapu ta daytoy ket agtartaray iti sandbox (blob URL), ti relative URL nga 'save_score.php' ket saan a mabalin a ma-parse.
            // Sinukatantayo iti mock API request tapno agtuloy ti panagtaray ti app a saan a mangted ti error.
            console.log(`Skor a nairekord (Mock): Benar=${correct}, Salah=${wrong}, Poin=${points}`);
            
            return new Promise((resolve) => {
                setTimeout(() => resolve({ status: 'success' }), 300);
            });
        }

        window.checkQuickAnswer = (ans) => {
            const ok = (ans === 'a');
            const msg = document.getElementById('kat-msg');
            
            if(ok){ 
                msg.className = 'mt-3 text-sm font-bold text-emerald-300'; 
                msg.innerHTML = '✅ Benar, +10 poin dikirim ke Leaderboard!'; 
                sendScore(1, 0, 10);
            } else { 
                msg.className = 'mt-3 text-sm font-bold text-rose-300'; 
                msg.innerHTML = '❌ Salah, jawaban benar: a'; 
                sendScore(0, 1, -3);
            }
        }

        // Initialize score connection as requested
        sendScore(0,0,0);

        // ==========================================
        // 3. FUNGSI NAVIGASI TAB
        // ==========================================
        function switchTab(tab) {
            // Update Tampilan Tombol Navigasi
            ['materi', 'flashcard', 'kuis', 'ai'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (btn) {
                    if(t === tab) {
                        btn.className = t === 'ai' 
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-cyan-600 text-white shadow-md";
                    } else {
                        btn.className = t === 'ai'
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-emerald-400 bg-emerald-900/20 border border-emerald-900 hover:bg-emerald-800/40"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800";
                    }
                }
            });

            // Render Konten
            if (tab === 'materi') renderMateri();
            if (tab === 'flashcard') {
                if(flashcardSequence.length === 0) initFlashcards();
                renderFlashcard();
            }
            if (tab === 'kuis') {
                if(!currentQuiz) currentQuiz = generateDynamicQuiz();
                renderKuis();
            }
            if (tab === 'ai') renderAI();
            
            // Re-render MathJax
            if (window.MathJax) {
                MathJax.typesetPromise().catch((err) => console.log('MathJax error: ', err));
            }
        }

        // ==========================================
        // 4. RENDER MATERI & MODAL PENULISAN
        // ==========================================
        function buildGrid(data, cols = 5) {
            let html = `<div class="grid grid-cols-${cols} gap-2 sm:gap-3 mb-8">`;
            data.forEach(item => {
                if (item.k === '') {
                    html += `<div></div>`;
                } else {
                    html += `
                        <div onclick="showStrokeModal('${item.k}', '${item.r}', '${item.type}')" 
                             class="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 text-center hover:bg-slate-700 hover:border-cyan-500/50 transition cursor-pointer group shadow-sm">
                            <div class="text-3xl sm:text-4xl font-black text-cyan-400 mb-1 group-hover:scale-110 transition-transform">${item.k}</div>
                            <div class="text-xs sm:text-sm text-slate-400 font-mono">${item.r}</div>
                        </div>
                    `;
                }
            });
            html += `</div>`;
            return html;
        }

        function renderMateri() {
            contentDiv.innerHTML = `
                <div class="tab-content space-y-10">
                    
                    <!-- Latihan Cepat Terintegrasi Leaderboard API (Mobile Friendly) -->
                    <section class="mt-2 rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-5 sm:p-6 shadow-md backdrop-blur-sm">
                        <h2 class="text-xl sm:text-2xl font-black flex items-center gap-2 text-fuchsia-400">
                            <span>⚡</span> Latihan Cepat
                        </h2>
                        <p class="text-sm sm:text-base text-slate-300 mt-2">Romaji dari 「ア」 adalah?</p>
                        
                        <div class="mt-4 flex flex-wrap gap-2 sm:gap-3">
                            <button onclick="checkQuickAnswer('a')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-fuchsia-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">a</button>
                            <button onclick="checkQuickAnswer('i')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-fuchsia-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">i</button>
                            <button onclick="checkQuickAnswer('u')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-fuchsia-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">u</button>
                        </div>
                        <p id="kat-msg" class="mt-3 text-sm sm:text-base font-medium h-6"></p>
                    </section>

                    <div class="bg-cyan-900/20 border border-cyan-800/50 p-4 rounded-xl text-cyan-300 text-sm flex gap-3 items-center">
                        <span class="text-2xl">💡</span>
                        <p><strong>Tips Interaktif:</strong> Klik pada huruf Katakana mana saja di bawah ini untuk melihat panduan cara penulisannya!</p>
                    </div>
                    <section>
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <span class="bg-cyan-900 text-cyan-400 px-2 py-1 rounded text-sm">01</span> Huruf Dasar (Seion)
                        </h2>
                        ${buildGrid(dataGojuuon, 5)}
                    </section>
                    <section>
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <span class="bg-cyan-900 text-cyan-400 px-2 py-1 rounded text-sm">02</span> Modifikasi Bunyi (Dakuon & Handakuon)
                        </h2>
                        ${buildGrid(dataDakuon, 5)}
                    </section>
                    <section>
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <span class="bg-cyan-900 text-cyan-400 px-2 py-1 rounded text-sm">03</span> Bunyi Campuran (Yoon)
                        </h2>
                        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                            ${dataYoon.map(item => `
                                <div onclick="showStrokeModal('${item.k}', '${item.r}', '${item.type}')" 
                                     class="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center hover:bg-slate-700 hover:border-emerald-500/50 transition cursor-pointer group shadow-sm">
                                    <div class="text-2xl sm:text-3xl font-black text-emerald-400 mb-1 group-hover:scale-110 transition-transform">${item.k}</div>
                                    <div class="text-xs text-slate-400 font-mono">${item.r}</div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            `;
        }

        window.showStrokeModal = (k, r, type) => {
            document.getElementById('modal-kana').innerText = k;
            document.getElementById('modal-romaji').innerText = r;
            document.getElementById('modal-type').innerText = type;
            document.getElementById('strokeModal').classList.remove('hidden');
        };

        window.hideStrokeModal = () => {
            document.getElementById('strokeModal').classList.add('hidden');
        };

        // ==========================================
        // 5. FLASHCARD ACAK (RANDOMIZER)
        // ==========================================
        function shuffleArray(array) {
            let curId = array.length;
            while (0 !== curId) {
                let randId = Math.floor(Math.random() * curId);
                curId -= 1;
                let tmp = array[curId];
                array[curId] = array[randId];
                array[randId] = tmp;
            }
            return array;
        }

        function initFlashcards() {
            flashcardSequence = shuffleArray([...allKana]);
            currentFlashcardIndex = 0;
            isCardFlipped = false;
        }

        function renderFlashcard() {
            const currentItem = flashcardSequence[currentFlashcardIndex];
            contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 tab-content">
                    <div class="mb-4 text-center">
                        <span class="bg-cyan-900/50 text-cyan-400 font-bold px-3 py-1 rounded-full text-sm">Mode Acak | Kartu ${currentFlashcardIndex + 1} / ${flashcardSequence.length}</span>
                        <p class="text-slate-400 mt-2 text-sm">Ketik Romaji dari huruf di bawah ini! (Urutan sudah diacak AI)</p>
                    </div>
                    
                    <div class="perspective-1000 w-64 h-80 mb-6 cursor-pointer ${isCardFlipped ? 'flipped' : ''}" onclick="toggleFlashcard()">
                        <div class="flip-card-inner relative w-full h-full transform-style-3d shadow-2xl rounded-2xl">
                            <!-- Sisi Depan -->
                            <div class="absolute w-full h-full backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center">
                                <span class="text-9xl font-black text-cyan-400 drop-shadow-lg">${currentItem.k}</span>
                            </div>
                            <!-- Sisi Belakang (Jawaban Benar) -->
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-900 to-slate-900 border-2 border-emerald-500 rounded-2xl flex flex-col items-center justify-center">
                                <span class="text-4xl mb-2">🎉</span>
                                <span class="text-xl text-emerald-200 mb-1">Benar Sekali!</span>
                                <span class="text-6xl font-black text-white font-mono">${currentItem.r}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Input Interaktif -->
                    <div class="w-64 relative mb-8">
                        <input type="text" id="fc-input" 
                            class="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-center text-xl text-white focus:outline-none focus:border-cyan-500 transition shadow-inner"
                            placeholder="Ketik disini..." autocomplete="off"
                            ${isCardFlipped ? 'disabled' : ''}
                            onkeyup="checkFCInput(event)">
                        ${isCardFlipped ? '<div class="absolute right-3 top-3.5 text-emerald-500 font-bold text-xl">✓</div>' : ''}
                    </div>

                    <div class="flex gap-4">
                        <button onclick="skipFlashcard()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-bold text-slate-300">Lewati ➡</button>
                    </div>
                </div>
            `;
            
            if (!isCardFlipped) {
                setTimeout(() => {
                    const input = document.getElementById('fc-input');
                    if(input) input.focus();
                }, 100);
            }
        }

        window.toggleFlashcard = () => {
            isCardFlipped = !isCardFlipped;
            renderFlashcard();
        };

        window.checkFCInput = (e) => {
            const val = e.target.value.trim().toLowerCase();
            const currentItem = flashcardSequence[currentFlashcardIndex];
            if (val === currentItem.r) {
                isCardFlipped = true;
                renderFlashcard();
                setTimeout(() => {
                    if(isCardFlipped) advanceFlashcard();
                }, 1500);
            }
        };

        window.skipFlashcard = () => {
            advanceFlashcard();
        }

        function advanceFlashcard() {
            isCardFlipped = false;
            currentFlashcardIndex++;
            if (currentFlashcardIndex >= flashcardSequence.length) {
                alert("Luar biasa! Anda telah menyelesaikan seluruh Flashcard. Sistem akan mengacak ulang untuk putaran baru!");
                initFlashcards();
            }
            renderFlashcard();
        }

        // ==========================================
        // 6. GENERATOR KUIS KALIMAT AI
        // ==========================================
        function generateDynamicQuiz() {
            const templates = ['action', 'origin', 'tool'];
            const template = templates[Math.floor(Math.random() * templates.length)];
            
            let questionText, optionsData, correctOptionIndex, kanjiExplanation, bunpouExplanation;
            
            const subj = aiSubjects[Math.floor(Math.random() * aiSubjects.length)];
            
            if (template === 'action') {
                const place = aiPlaces[Math.floor(Math.random() * aiPlaces.length)];
                const verb = aiVerbsAction[Math.floor(Math.random() * aiVerbsAction.length)];
                const correctObjKey = verb.validObjects[Math.floor(Math.random() * verb.validObjects.length)];
                const correctObj = aiObjects[correctObjKey];
                
                let wrongKeys = Object.keys(aiObjects).filter(k => k !== correctObjKey);
                wrongKeys = shuffleArray(wrongKeys).slice(0, 3);
                
                let allOptionKeys = shuffleArray([correctObjKey, ...wrongKeys]);
                correctOptionIndex = allOptionKeys.indexOf(correctObjKey);
                optionsData = allOptionKeys.map(k => `${k} (${aiObjects[k].r})`);
                
                questionText = `Lengkapi kalimat ini dengan Katakana yang paling tepat secara logika!\n「${subj.j}は${place.j}で ___ を${verb.j}。」\n(${subj.id} ${verb.id} ${correctObj.id} di ${place.id}.)`;
                
                kanjiExplanation = subj.kInfo + (place.kInfo || "") + verb.kInfo;
                bunpouExplanation = `
                    <div class="my-6 bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-x-auto text-center shadow-inner">
                        $$\\text{[Subjek]} + \\text{は} + \\text{[Tempat]} + \\text{で} + \\text{[Objek]} + \\text{を} + \\text{[Kata Kerja]}$$
                    </div>
                    <ul class="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Partikel は (wa)</strong>: Penanda subjek atau topik yang dibicarakan dalam kalimat.</li>
                        <li><strong>Partikel で (de)</strong>: Penanda lokasi atau tempat terjadinya suatu aktivitas.</li>
                        <li><strong>Partikel を (o)</strong>: Penanda objek penderita yang dikenai tindakan dari kata kerja transitif.</li>
                    </ul>
                `;
            } 
            else if (template === 'origin') {
                const correctCountry = aiCountries[Math.floor(Math.random() * aiCountries.length)];
                let wrongCountries = aiCountries.filter(c => c.k !== correctCountry.k);
                wrongCountries = shuffleArray(wrongCountries).slice(0, 3);
                
                let allOptions = shuffleArray([correctCountry, ...wrongCountries]);
                correctOptionIndex = allOptions.findIndex(c => c.k === correctCountry.k);
                optionsData = allOptions.map(c => `${c.k} (${c.id})`);
                
                questionText = `Pilih Katakana yang tepat!\n「${subj.j}は ___ から来ました。」\n(${subj.id} datang dari ${correctCountry.id}.)`;
                
                kanjiExplanation = subj.kInfo + `<li><span class='text-cyan-400 font-bold text-lg'>来ました (きました)</span> : Berasal dari kata kerja 来る (datang) yang menggunakan kanji 来 (datang). Artinya 'Telah datang/Berasal dari'.</li>`;
                bunpouExplanation = `
                    <div class="my-6 bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-x-auto text-center shadow-inner">
                        $$\\text{[Subjek]} + \\text{は} + \\text{[Asal/Negara]} + \\text{から} + \\text{来ました}$$
                    </div>
                    <ul class="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Partikel から (kara)</strong>: Artinya "Dari" atau "Semenjak". Digunakan untuk menunjukkan titik awal ruang (tempat asal) atau waktu.</li>
                    </ul>
                `;
            }
            else {
                const validTools = ["パソコン", "カメラ", "ペン"];
                const correctToolKey = validTools[Math.floor(Math.random() * validTools.length)];
                const correctTool = aiObjects[correctToolKey];
                
                let wrongKeys = Object.keys(aiObjects).filter(k => k !== correctToolKey && !validTools.includes(k));
                wrongKeys = shuffleArray(wrongKeys).slice(0, 3);
                
                let allOptionKeys = shuffleArray([correctToolKey, ...wrongKeys]);
                correctOptionIndex = allOptionKeys.indexOf(correctToolKey);
                optionsData = allOptionKeys.map(k => `${k} (${aiObjects[k].r})`);
                
                questionText = `Lengkapi kalimat ini dengan Katakana yang tepat!\n「${subj.j}は ___ を使って仕事をします。」\n(${subj.id} melakukan pekerjaan dengan menggunakan ${correctTool.id}.)`;
                
                kanjiExplanation = subj.kInfo + 
                    `<li><span class='text-cyan-400 font-bold text-lg'>使って (つかって)</span> : Berasal dari kata kerja 使う (menggunakan) dengan kanji 使.</li>` +
                    `<li><span class='text-cyan-400 font-bold text-lg'>仕事 (しごと)</span> : Terdiri dari 仕 (melayani) dan 事 (hal/perkara). Artinya 'Pekerjaan'.</li>`;
                bunpouExplanation = `
                    <div class="my-6 bg-slate-900 p-4 rounded-xl border border-slate-700 overflow-x-auto text-center shadow-inner">
                        $$\\text{[Alat/Sarana]} + \\text{を} + \\text{使って} + \\text{、} + \\text{[Aktivitas Utama]}$$
                    </div>
                    <ul class="list-disc pl-5 space-y-2 text-slate-300">
                        <li><strong>Kata Kerja Bentuk て (te)</strong>: Berfungsi menyambungkan dua kalimat. Di sini artinya "Menggunakan (alat), lalu melakukan (pekerjaan)".</li>
                    </ul>
                `;
            }

            totalQuizzesDone++;

            return {
                question: questionText,
                options: optionsData,
                correct: correctOptionIndex,
                kanjiInfo: kanjiExplanation,
                bunpouInfo: bunpouExplanation
            };
        }

        function renderKuis() {
            const q = currentQuiz;
            
            let optionsHtml = q.options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition font-medium text-lg";
                if (quizAnswered) {
                    if (idx === q.correct) {
                        btnClass = "w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-900/30 text-emerald-300 font-bold shadow-lg shadow-emerald-900/50";
                    } else {
                        btnClass = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-600 cursor-not-allowed";
                    }
                }
                return `<button ${quizAnswered ? 'disabled' : ''} onclick="answerQuiz(${idx})" class="${btnClass}">${String.fromCharCode(65+idx)}. ${opt}</button>`;
            }).join('');

            let explanationHtml = '';
            if (quizAnswered) {
                explanationHtml = `
                    <div class="mt-8 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl tab-content">
                        <h3 class="text-2xl font-black text-emerald-400 mb-6 flex items-center gap-2">
                            <span>✅</span> Pembahasan Tuntas AI
                        </h3>
                        <div class="mb-6">
                            <h4 class="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">📝 Bedah 漢字 (Kanji)</h4>
                            <ul class="list-none space-y-3">
                                ${q.kanjiInfo}
                            </ul>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2">📚 Analisis 文法 (Bunpou)</h4>
                            <div class="text-base text-slate-300 leading-relaxed">
                                ${q.bunpouInfo}
                            </div>
                        </div>
                        <div class="mt-8 flex justify-end">
                            <button onclick="nextQuiz()" class="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition font-bold text-white shadow-lg shadow-cyan-500/30">
                                Buat Kalimat AI Baru 🤖➡
                            </button>
                        </div>
                    </div>
                `;
            }

            contentDiv.innerHTML = `
                <div class="max-w-3xl mx-auto py-6 tab-content">
                    <div class="mb-6 flex justify-between items-center">
                        <span class="bg-cyan-900/50 text-cyan-400 font-bold px-3 py-1 rounded-full text-sm border border-cyan-800">Soal Generated #${totalQuizzesDone}</span>
                        <span class="text-slate-400 text-sm">♾️ Kalimat Tidak Terbatas</span>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-bold leading-relaxed mb-8 whitespace-pre-line text-white">${q.question}</h2>
                    <div class="space-y-3">
                        ${optionsHtml}
                    </div>
                    ${explanationHtml}
                </div>
            `;
        }

        window.answerQuiz = (selectedIndex) => {
            quizAnswered = true;
            renderKuis();
            if (window.MathJax) MathJax.typesetPromise();
        };

        window.nextQuiz = () => {
            quizAnswered = false;
            currentQuiz = generateDynamicQuiz();
            renderKuis();
            if (window.MathJax) MathJax.typesetPromise();
        };

        // ==========================================
        // 7. LATIHAN AI (HURUF TUNGGAL)
        // ==========================================
        function initAIKana() {
            aiCurrentKana = allKana[Math.floor(Math.random() * allKana.length)];
            aiAnswered = false;
            renderAI();
        }

        function renderAI() {
            if (!aiCurrentKana) {
                initAIKana();
                return;
            }

            let feedbackHtml = '';
            if (aiAnswered) {
                const isCorrect = aiAnswered.correct;
                const userText = aiAnswered.val;
                
                let latexFormula = '';
                if (aiCurrentKana.type === 'Seion') {
                    latexFormula = `$$\\text{Huruf Dasar (Seion): } \\text{Tabel Murni Katakana}$$`;
                } else if (aiCurrentKana.type === 'Dakuon') {
                    latexFormula = `$$\\text{Seion} + \\text{゛(Tenten)} \\rightarrow \\text{Dakuon (Suara Tebal)}$$`;
                } else if (aiCurrentKana.type === 'Handakuon') {
                    latexFormula = `$$\\text{Seion (Ha-gyou)} + \\text{゜(Maru)} \\rightarrow \\text{Handakuon (Suara Letup Pa-gyou)}$$`;
                } else {
                    latexFormula = `$$\\text{Huruf Akhiran (i)} + \\text{ャ/ュ/ョ (Kecil)} \\rightarrow \\text{Yoon (Bunyi Campuran)}$$`;
                }

                if (isCorrect) {
                    feedbackHtml = `
                        <div class="mt-6 bg-emerald-900/30 border border-emerald-700 rounded-xl p-5 tab-content text-left">
                            <h3 class="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2"><span>🤖</span> AI Checker: Benar Sekali!</h3>
                            <p class="text-slate-300 text-sm mb-4">Tebakan Anda sangat tepat. Huruf <strong>${aiCurrentKana.k}</strong> dibaca <strong>${aiCurrentKana.r}</strong>.</p>
                            <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center mb-3">
                                ${latexFormula}
                            </div>
                            <p class="text-xs text-slate-400">Kategori Huruf: <span class="text-cyan-400 font-bold">${aiCurrentKana.type}</span></p>
                        </div>
                    `;
                } else {
                    feedbackHtml = `
                        <div class="mt-6 bg-red-900/30 border border-red-700 rounded-xl p-5 tab-content text-left">
                            <h3 class="text-xl font-bold text-red-400 mb-2 flex items-center gap-2"><span>🤖</span> AI Checker: Kurang Tepat</h3>
                            <p class="text-slate-300 text-sm mb-4">Jawaban Anda "<span class="text-red-300">${userText}</span>" salah. Jawaban yang benar adalah <strong>${aiCurrentKana.r}</strong>.</p>
                            <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center mb-3">
                                ${latexFormula}
                            </div>
                            <p class="text-xs text-slate-400">Silakan pelajari lagi rumus pembentukan <span class="text-cyan-400 font-bold">${aiCurrentKana.type}</span> di atas.</p>
                        </div>
                    `;
                }
            }

            contentDiv.innerHTML = `
                <div class="max-w-xl mx-auto py-8 text-center tab-content">
                    <div class="mb-4">
                        <span class="inline-block bg-emerald-900/50 border border-emerald-500/50 text-emerald-400 font-bold px-4 py-1.5 rounded-full text-sm">
                            Sistem AI Generator Menyala ⚡
                        </span>
                    </div>
                    
                    <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-10 mb-8 shadow-inner relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <div class="absolute -left-10 -bottom-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
                        
                        <h2 class="text-slate-400 text-sm font-bold tracking-widest uppercase mb-4">Tebak Huruf Acak Ini</h2>
                        <div class="text-8xl sm:text-9xl font-black text-white mb-2 filter drop-shadow-lg">${aiCurrentKana.k}</div>
                    </div>

                    <div class="flex gap-2">
                        <input type="text" id="ai-input" 
                            class="flex-1 bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-xl text-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
                            placeholder="Ketik romaji..." autocomplete="off"
                            ${aiAnswered ? 'disabled' : ''}
                            onkeydown="if(event.key === 'Enter') submitAI()">
                        <button onclick="${aiAnswered ? 'initAIKana()' : 'submitAI()'}" 
                            class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-bold text-white shadow-lg shadow-emerald-500/30">
                            ${aiAnswered ? 'Acak Baru 🔄' : 'Cek Jawaban ✔️'}
                        </button>
                    </div>

                    ${feedbackHtml}
                </div>
            `;

            if (!aiAnswered) {
                setTimeout(() => {
                    const input = document.getElementById('ai-input');
                    if(input) input.focus();
                }, 100);
            }
        }

        window.submitAI = () => {
            if (aiAnswered) return;
            const input = document.getElementById('ai-input');
            const val = input.value.trim().toLowerCase();
            if (!val) return;

            const isCorrect = (val === aiCurrentKana.r);
            aiAnswered = { val: val, correct: isCorrect };
            renderAI();
            
            if (window.MathJax) MathJax.typesetPromise();
        };

        // Mulai aplikasi
        switchTab('materi');

    </script>
</body>
</html>
