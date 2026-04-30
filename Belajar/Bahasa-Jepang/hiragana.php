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

// Menarik level AI dari session SQL (Pemula, Mahir, Pro)
// Catatan: Pastikan saat Login, Anda juga menyimpan $_SESSION['ai_level']
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
    <!-- MathJax untuk LaTeX Bunpou -->
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
        
        /* Animasi Penulisan Huruf & Denyut Timer */
        @keyframes drawPulse {
            0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.6)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0)); }
        }
        .draw-animation { animation: drawPulse 2s infinite ease-in-out; }
        
        @keyframes urgentPulse {
            0% { color: #f43f5e; transform: scale(1); }
            50% { color: #fda4af; transform: scale(1.05); }
            100% { color: #f43f5e; transform: scale(1); }
        }
        .timer-urgent { animation: urgentPulse 1s infinite; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-white pb-20" data-logged-in="<?php echo $isLoggedIn ? 'true' : 'false'; ?>" data-ai-level="<?php echo htmlspecialchars($aiLevel); ?>">

    <main class="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 relative">
        
        <!-- HEADER & STATUS LOGIN -->
        <header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between shadow-lg">
            <div>
                <h1 class="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                    Materi Hiragana (ひらがな)
                </h1>
                <p class="text-slate-400 mt-1">Materi komprehensif, Flashcard Acak, dan AI Membaca Hiragana.</p>
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
                    <a href="/index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-2">
                        <i data-lucide="home" class="w-4 h-4"></i> Home
                    </a>
                </div>
            </div>
        </header>

        <!-- TABS NAVIGASI -->
        <nav class="flex flex-wrap sm:flex-nowrap gap-2 mb-8 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button onclick="switchTab('materi')" id="tab-materi" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white shadow-md">📚 Materi Hiragana</button>
            <button onclick="switchTab('flashcard')" id="tab-flashcard" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800">🎴 Flashcard Acak</button>
            <button onclick="switchTab('ai')" id="tab-ai" class="flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-cyan-400 bg-cyan-900/20 border border-cyan-900 hover:bg-cyan-800/40">📖 AI Membaca (Cerita)</button>
        </nav>

        <!-- KONTEN -->
        <div id="content-container" class="min-h-[500px]"></div>

        <footer class="mt-12 pt-6 border-t border-slate-800 text-center text-slate-500 text-sm">
            Credit: <strong>Darma</strong> - Dikembangkan dengan ❤️ & AI
        </footer>

        <!-- Modal Cara Penulisan (Stroke Order) -->
        <div id="strokeModal" class="hidden fixed inset-0 bg-slate-950/90 z-50 flex justify-center items-center px-4 backdrop-blur-sm transition-opacity">
            <div class="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl shadow-emerald-900/20">
                <button onclick="hideStrokeModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full w-10 h-10 flex items-center justify-center transition">✕</button>
                <h3 class="text-xl font-bold text-emerald-400 mb-6 text-center">Cara Penulisan & Detail</h3>
                
                <!-- Animasi Penulisan -->
                <div class="text-9xl font-black text-white text-center border-4 border-dashed border-slate-700 bg-slate-800/50 rounded-2xl py-10 mb-6 relative draw-animation" style="font-family: 'Yu Mincho', 'Klee One', serif;">
                    <span id="modal-kana">あ</span>
                </div>
                
                <div class="bg-slate-800 p-4 rounded-xl text-center mb-4">
                    <p class="text-slate-400 text-sm uppercase tracking-widest mb-1">Romaji</p>
                    <p class="text-3xl font-mono text-cyan-400 font-bold" id="modal-romaji">a</p>
                </div>
                
                <p class="text-center text-slate-400 text-sm mb-4">Kategori Huruf: <span id="modal-type" class="text-emerald-300 font-bold">Seion</span></p>
                
                <div class="p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-300 text-left leading-relaxed">
                    <strong class="text-white block mb-2">📌 Panduan Coretan:</strong>
                    Secara umum, ikuti prinsip dasar penulisan bahasa Jepang:
                    <ul class="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                        <li>Dari <strong>Kiri</strong> ke <strong>Kanan</strong>.</li>
                        <li>Dari <strong>Atas</strong> ke <strong>Bawah</strong>.</li>
                        <li>Perhatikan ujung garis (Tome: Berhenti, Hane: Memantul, Harai: Menyapu).</li>
                    </ul>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Mengambil status login dengan aman dari atribut body
        const isLoggedIn = document.body.getAttribute('data-logged-in') === 'true';

        // ==========================================
        // 1. LOGIKA KIRIM SKOR 
        // ==========================================
        function sendScore(correct, wrong, points) {
            if (!isLoggedIn) return; // Jangan kirim jika belum login
            fetch('save_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correct, wrong, points, material: 'hiragana' })
            }).catch(err => console.error('Gagal menyimpan skor:', err));
        }

        // Sinkronisasi Level AI ke Database SQL
        function saveAILevel(newLevel) {
            if (aiUserLevel === newLevel) return; // Jangan kirim jika level tidak berubah
            aiUserLevel = newLevel;
            if (!isLoggedIn) return; // Hanya simpan jika user sudah login
            
            fetch('save_level.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level: newLevel, material: 'hiragana' })
            }).catch(err => console.error('Gagal menyimpan level AI:', err));
        }

        window.checkQuickAnswer = (ans) => {
            const ok = (ans === 'a');
            const msg = document.getElementById('hir-msg');
            
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

        // ==========================================
        // 2. DATABASE MATERI HIRAGANA LENGKAP
        // ==========================================
        const dataGojuuon = [
            {k: 'あ', r: 'a', type: 'Seion'}, {k: 'い', r: 'i', type: 'Seion'}, {k: 'う', r: 'u', type: 'Seion'}, {k: 'え', r: 'e', type: 'Seion'}, {k: 'お', r: 'o', type: 'Seion'},
            {k: 'か', r: 'ka', type: 'Seion'}, {k: 'き', r: 'ki', type: 'Seion'}, {k: 'く', r: 'ku', type: 'Seion'}, {k: 'け', r: 'ke', type: 'Seion'}, {k: 'こ', r: 'ko', type: 'Seion'},
            {k: 'さ', r: 'sa', type: 'Seion'}, {k: 'し', r: 'shi', type: 'Seion'}, {k: 'す', r: 'su', type: 'Seion'}, {k: 'せ', r: 'se', type: 'Seion'}, {k: 'そ', r: 'so', type: 'Seion'},
            {k: 'た', r: 'ta', type: 'Seion'}, {k: 'ち', r: 'chi', type: 'Seion'}, {k: 'つ', r: 'tsu', type: 'Seion'}, {k: 'て', r: 'te', type: 'Seion'}, {k: 'と', r: 'to', type: 'Seion'},
            {k: 'な', r: 'na', type: 'Seion'}, {k: 'に', r: 'ni', type: 'Seion'}, {k: 'ぬ', r: 'nu', type: 'Seion'}, {k: 'ね', r: 'ne', type: 'Seion'}, {k: 'の', r: 'no', type: 'Seion'},
            {k: 'は', r: 'ha', type: 'Seion'}, {k: 'ひ', r: 'hi', type: 'Seion'}, {k: 'ふ', r: 'fu', type: 'Seion'}, {k: 'へ', r: 'he', type: 'Seion'}, {k: 'ほ', r: 'ho', type: 'Seion'},
            {k: 'ま', r: 'ma', type: 'Seion'}, {k: 'み', r: 'mi', type: 'Seion'}, {k: 'む', r: 'mu', type: 'Seion'}, {k: 'め', r: 'me', type: 'Seion'}, {k: 'も', r: 'mo', type: 'Seion'},
            {k: 'や', r: 'ya', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ゆ', r: 'yu', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'よ', r: 'yo', type: 'Seion'},
            {k: 'ら', r: 'ra', type: 'Seion'}, {k: 'り', r: 'ri', type: 'Seion'}, {k: 'る', r: 'ru', type: 'Seion'}, {k: 'れ', r: 're', type: 'Seion'}, {k: 'ろ', r: 'ro', type: 'Seion'},
            {k: 'わ', r: 'wa', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'を', r: 'wo', type: 'Seion'}, {k: '', r: '', type: ''}, {k: 'ん', r: 'n', type: 'Seion'}
        ];

        const dataDakuon = [
            {k: 'が', r: 'ga', type: 'Dakuon'}, {k: 'ぎ', r: 'gi', type: 'Dakuon'}, {k: 'ぐ', r: 'gu', type: 'Dakuon'}, {k: 'げ', r: 'ge', type: 'Dakuon'}, {k: 'ご', r: 'go', type: 'Dakuon'},
            {k: 'ざ', r: 'za', type: 'Dakuon'}, {k: 'じ', r: 'ji', type: 'Dakuon'}, {k: 'ず', r: 'zu', type: 'Dakuon'}, {k: 'ぜ', r: 'ze', type: 'Dakuon'}, {k: 'ぞ', r: 'zo', type: 'Dakuon'},
            {k: 'だ', r: 'da', type: 'Dakuon'}, {k: 'ぢ', r: 'ji', type: 'Dakuon'}, {k: 'づ', r: 'zu', type: 'Dakuon'}, {k: 'で', r: 'de', type: 'Dakuon'}, {k: 'ど', r: 'do', type: 'Dakuon'},
            {k: 'ば', r: 'ba', type: 'Dakuon'}, {k: 'び', r: 'bi', type: 'Dakuon'}, {k: 'ぶ', r: 'bu', type: 'Dakuon'}, {k: 'べ', r: 'be', type: 'Dakuon'}, {k: 'ぼ', r: 'bo', type: 'Dakuon'},
            {k: 'ぱ', r: 'pa', type: 'Handakuon'}, {k: 'ぴ', r: 'pi', type: 'Handakuon'}, {k: 'ぷ', r: 'pu', type: 'Handakuon'}, {k: 'ぺ', r: 'pe', type: 'Handakuon'}, {k: 'ぽ', r: 'po', type: 'Handakuon'}
        ];

        const dataYoon = [
            {k: 'きゃ', r: 'kya', type: 'Yoon'}, {k: 'きゅ', r: 'kyu', type: 'Yoon'}, {k: 'きょ', r: 'kyo', type: 'Yoon'},
            {k: 'しゃ', r: 'sha', type: 'Yoon'}, {k: 'しゅ', r: 'shu', type: 'Yoon'}, {k: 'しょ', r: 'sho', type: 'Yoon'},
            {k: 'ちゃ', r: 'cha', type: 'Yoon'}, {k: 'ちゅ', r: 'chu', type: 'Yoon'}, {k: 'ちょ', r: 'cho', type: 'Yoon'},
            {k: 'にゃ', r: 'nya', type: 'Yoon'}, {k: 'にゅ', r: 'nyu', type: 'Yoon'}, {k: 'にょ', r: 'nyo', type: 'Yoon'},
            {k: 'ひゃ', r: 'hya', type: 'Yoon'}, {k: 'ひゅ', r: 'hyu', type: 'Yoon'}, {k: 'ひょ', r: 'hyo', type: 'Yoon'},
            {k: 'みゃ', r: 'mya', type: 'Yoon'}, {k: 'みゅ', r: 'myu', type: 'Yoon'}, {k: 'みょ', r: 'myo', type: 'Yoon'},
            {k: 'りゃ', r: 'rya', type: 'Yoon'}, {k: 'りゅ', r: 'ryu', type: 'Yoon'}, {k: 'りょ', r: 'ryo', type: 'Yoon'},
            {k: 'ぎゃ', r: 'gya', type: 'Yoon (Dakuon)'}, {k: 'ぎゅ', r: 'gyu', type: 'Yoon (Dakuon)'}, {k: 'ぎょ', r: 'gyo', type: 'Yoon (Dakuon)'},
            {k: 'じゃ', r: 'ja', type: 'Yoon (Dakuon)'}, {k: 'じゅ', r: 'ju', type: 'Yoon (Dakuon)'}, {k: 'じょ', r: 'jo', type: 'Yoon (Dakuon)'},
            {k: 'びゃ', r: 'bya', type: 'Yoon (Dakuon)'}, {k: 'びゅ', r: 'byu', type: 'Yoon (Dakuon)'}, {k: 'びょ', r: 'byo', type: 'Yoon (Dakuon)'},
            {k: 'ぴゃ', r: 'pya', type: 'Yoon (Handakuon)'}, {k: 'ぴゅ', r: 'pyu', type: 'Yoon (Handakuon)'}, {k: 'ぴょ', r: 'pyo', type: 'Yoon (Handakuon)'}
        ];

        const allKana = [...dataGojuuon, ...dataDakuon, ...dataYoon].filter(item => item.k !== '');

        // ==========================================
        // 3. DATA CERITA AI MEMBACA (LENGKAP DGN BUNPOU LATEX)
        // ==========================================
        const aiReadingData = {
            pemula: [
                {
                    hiragana: 'わたしは にほんごを べんきょうします。',
                    romaji: 'watashi wa nihongo o benkyoushimasu',
                    indo: 'Saya belajar bahasa Jepang.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>私 (わたし)</span> : Saya.</li><li><span class='text-emerald-400 font-bold text-lg'>日本語 (にほんご)</span> : Bahasa Jepang.</li><li><span class='text-emerald-400 font-bold text-lg'>勉強します (べんきょうします)</span> : Belajar.</li>",
                    bunpouInfo: "$$\\text{[Subjek]} + \\text{は (wa)} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$"
                },
                {
                    hiragana: 'あした がっこうへ いきます。',
                    romaji: 'ashita gakkou e ikimasu',
                    indo: 'Besok pergi ke sekolah.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>明日 (あした)</span> : Besok.</li><li><span class='text-emerald-400 font-bold text-lg'>学校 (がっこう)</span> : Sekolah.</li><li><span class='text-emerald-400 font-bold text-lg'>行きます (いきます)</span> : Pergi.</li>",
                    bunpouInfo: "$$\\text{[Waktu]} + \\text{[Tempat]} + \\text{へ (e)} + \\text{[Kata Kerja Perpindahan]}$$"
                },
                {
                    hiragana: 'まいにち りんごを たべます。',
                    romaji: 'mainichi ringo o tabemasu',
                    indo: 'Setiap hari makan apel.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>毎日 (まいにち)</span> : Setiap hari.</li><li><span class='text-emerald-400 font-bold text-lg'>林檎 (りんご)</span> : Apel.</li><li><span class='text-emerald-400 font-bold text-lg'>食べます (たべます)</span> : Makan.</li>",
                    bunpouInfo: "$$\\text{[Waktu Keterangan]} + \\text{[Objek]} + \\text{を (o)} + \\text{[Kata Kerja]}$$"
                }
            ],
            mahir: [
                {
                    hiragana: 'むかしむかし、ある ところに、おじいさんと おばあさんが いました。',
                    romaji: 'mukashimukashi aru tokoroni ojiisan to obaasan ga imashita',
                    indo: 'Zaman dahulu kala, di suatu tempat, ada seorang kakek dan nenek.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>昔々 (むかしむかし)</span> : Zaman dahulu kala.</li><li><span class='text-emerald-400 font-bold text-lg'>所 (ところ)</span> : Tempat.</li><li><span class='text-emerald-400 font-bold text-lg'>お爺さん (おじいさん)</span> : Kakek.</li><li><span class='text-emerald-400 font-bold text-lg'>お婆さん (おばあさん)</span> : Nenek.</li>",
                    bunpouInfo: "$$\\text{[Waktu Lampau]} + \\text{、} + \\text{[Tempat]} + \\text{に} + \\text{、} + \\text{[Subjek 1]} + \\text{と} + \\text{[Subjek 2]} + \\text{が} + \\text{いました}$$"
                },
                {
                    hiragana: 'きょうの てんきは とても いいですから、こうえんを さんぽしましょう。',
                    romaji: 'kyou no tenkiwa totemo iidesukara kouen o sanposhimashou',
                    indo: 'Karena cuaca hari ini sangat bagus, mari kita jalan-jalan di taman.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>今日 (きょう)</span> : Hari ini.</li><li><span class='text-emerald-400 font-bold text-lg'>天気 (てんき)</span> : Cuaca.</li><li><span class='text-emerald-400 font-bold text-lg'>公園 (こうえん)</span> : Taman.</li><li><span class='text-emerald-400 font-bold text-lg'>散歩しましょう (さんぽしましょう)</span> : Mari jalan-jalan.</li>",
                    bunpouInfo: "$$\\text{[Alasan/Sebab]} + \\text{から (kara)} + \\text{、} + \\text{[Aktivitas Ajakan \~mashou]}$$"
                }
            ],
            pro: [
                {
                    hiragana: 'あきの ゆうぐれ、もみじが とても きれいでした。わたしたちは おちゃを のみながら、けしきを たのしみました。',
                    romaji: 'akinoyuugure momijiga totemo kireideshita watashitachiwa ocha o nominagara keshiki o tanoshimimashita',
                    indo: 'Di senja musim gugur, dedaunan merah sangatlah cantik. Kami menikmati pemandangan sambil meminum teh.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>秋 (あき)</span> : Musim gugur.</li><li><span class='text-emerald-400 font-bold text-lg'>夕暮れ (ゆうぐれ)</span> : Senja.</li><li><span class='text-emerald-400 font-bold text-lg'>紅葉 (もみじ)</span> : Daun musim gugur.</li><li><span class='text-emerald-400 font-bold text-lg'>綺麗 (きれい)</span> : Cantik.</li><li><span class='text-emerald-400 font-bold text-lg'>私達 (わたしたち)</span> : Kami.</li><li><span class='text-emerald-400 font-bold text-lg'>お茶 (おちゃ)</span> : Teh.</li><li><span class='text-emerald-400 font-bold text-lg'>景色 (けしき)</span> : Pemandangan.</li>",
                    bunpouInfo: "$$\\text{[Aktivitas 1 (Bentuk Masu Coret)]} + \\text{ながら} + \\text{、} + \\text{[Aktivitas 2]}$$<br><em>Nagara</em> digunakan untuk aktivitas yang dilakukan bersamaan (sambil)."
                },
                {
                    hiragana: 'にほんの ぶんかは とても おもしろいです。とくに、おまつりの ときに たべる たこやきが だいすきです。',
                    romaji: 'nihonnobunkawa totemo omoshiroidesu tokuni omatsurinotokini taberu takoyakiga daisukidesu',
                    indo: 'Budaya Jepang sangatlah menarik. Terutama, saya sangat suka takoyaki yang dimakan saat festival.',
                    kanjiInfo: "<li><span class='text-emerald-400 font-bold text-lg'>日本 (にほん)</span> : Jepang.</li><li><span class='text-emerald-400 font-bold text-lg'>文化 (ぶんか)</span> : Budaya.</li><li><span class='text-emerald-400 font-bold text-lg'>面白い (おもしろい)</span> : Menarik.</li><li><span class='text-emerald-400 font-bold text-lg'>特に (とくに)</span> : Terutama.</li><li><span class='text-emerald-400 font-bold text-lg'>お祭り (おまつり)</span> : Festival.</li><li><span class='text-emerald-400 font-bold text-lg'>大好 (だいす)き</span> : Sangat suka.</li>",
                    bunpouInfo: "$$\\text{[Kata Benda]} + \\text{の} + \\text{時に (Toki ni)}$$<br><em>Toki ni</em> berarti 'saat' atau 'ketika'."
                }
            ]
        };

        // State Aplikasi
        const contentDiv = document.getElementById('content-container');

        // AI Reading State
        let aiUserLevel = document.body.getAttribute('data-ai-level') || 'pemula'; 
        let aiCurrentStory = null;
        let aiTimerInterval = null;
        let aiTimeElapsed = 0; 
        let aiTimeRemaining = 0; 
        let aiTimerStarted = false;
        let aiFinished = false;

        // ==========================================
        // 4. FUNGSI NAVIGASI TAB
        // ==========================================
        function switchTab(tab) {
            ['materi', 'flashcard', 'ai'].forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                if (btn) {
                    if(t === tab) {
                        btn.className = t === 'ai' 
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-cyan-600 text-white shadow-md shadow-cyan-500/30"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all bg-emerald-600 text-white shadow-md";
                    } else {
                        btn.className = t === 'ai'
                            ? "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-cyan-400 bg-cyan-900/20 border border-cyan-900 hover:bg-cyan-800/40"
                            : "flex-1 min-w-[120px] py-3 px-2 rounded-lg font-bold text-sm transition-all text-slate-400 hover:text-white hover:bg-slate-800";
                    }
                }
            });

            if (tab === 'materi') renderMateri();
            if (tab === 'flashcard') {
                if(flashcardSequence.length === 0) initFlashcards();
                renderFlashcard();
            }
            if (tab === 'ai') initAIReading();
            
            if (window.MathJax) {
                MathJax.typesetPromise().catch((err) => console.log('MathJax error: ', err));
            }
        }

        // ==========================================
        // 5. RENDER MATERI & MODAL PENULISAN
        // ==========================================
        function buildGrid(data, cols = 5) {
            let html = `<div class="grid grid-cols-3 sm:grid-cols-${cols} gap-2 sm:gap-3 mb-8">`;
            data.forEach(item => {
                if (item.k === '') {
                    html += `<div class="hidden sm:block"></div>`;
                } else {
                    html += `
                        <div onclick="showStrokeModal('${item.k}', '${item.r}', '${item.type}')" 
                             class="bg-slate-800 border border-slate-700 rounded-xl p-3 sm:p-4 text-center hover:bg-slate-700 hover:border-emerald-500/50 transition cursor-pointer group shadow-sm flex flex-col items-center justify-center">
                            <div class="text-3xl sm:text-4xl font-black text-emerald-400 mb-1 group-hover:scale-110 transition-transform drop-shadow">${item.k}</div>
                            <div class="text-xs sm:text-sm text-cyan-300 font-mono tracking-widest">${item.r}</div>
                        </div>
                    `;
                }
            });
            html += `</div>`;
            return html;
        }

        function renderMateri() {
            contentDiv.innerHTML = `
                <div class="tab-content space-y-8">
                    
                    <!-- Latihan Cepat -->
                    <section class="mt-2 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-5 sm:p-6 shadow-md backdrop-blur-sm">
                        <h2 class="text-xl sm:text-2xl font-black flex items-center gap-2 text-indigo-400">
                            <span>⚡</span> Latihan Cepat
                        </h2>
                        <p class="text-sm sm:text-base text-slate-300 mt-2">Romaji dari 「あ」 adalah?</p>
                        
                        <div class="mt-4 flex flex-wrap gap-2 sm:gap-3">
                            <button onclick="checkQuickAnswer('a')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-indigo-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">a</button>
                            <button onclick="checkQuickAnswer('i')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-indigo-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">i</button>
                            <button onclick="checkQuickAnswer('u')" class="flex-1 min-w-[80px] sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-indigo-400 transition-all font-mono font-bold text-lg text-white border border-slate-600 shadow-sm">u</button>
                        </div>
                        <p id="hir-msg" class="mt-3 text-sm sm:text-base font-medium h-6"></p>
                    </section>

                    <div class="bg-emerald-900/20 border border-emerald-800/50 p-4 rounded-xl text-emerald-300 text-sm flex gap-3 items-center">
                        <span class="text-2xl">💡</span>
                        <p><strong>Tips Interaktif:</strong> Klik pada huruf Hiragana mana saja di bawah ini untuk melihat panduan cara penulisannya secara detail!</p>
                    </div>

                    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-8 shadow-lg mb-6">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                            <span class="bg-emerald-900 text-emerald-400 px-2 py-1 rounded text-sm">01</span> Huruf Dasar (Gojuon)
                        </h2>
                        ${buildGrid(dataGojuuon, 5)}
                    </section>

                    <section class="grid lg:grid-cols-2 gap-4">
                        <div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 md:p-5 shadow-lg">
                            <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <span class="bg-indigo-900 text-indigo-400 px-2 py-1 rounded text-sm">02</span> Dakuon & Handakuon
                            </h2>
                            ${buildGrid(dataDakuon, 5)}
                        </div>
                        <div class="rounded-2xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4 md:p-5 shadow-lg">
                            <h2 class="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                                <span class="bg-fuchsia-900 text-fuchsia-400 px-2 py-1 rounded text-sm">03</span> Bunyi Campuran (Yoon)
                            </h2>
                            ${buildGrid(dataYoon, 3)}
                        </div>
                    </section>
                </div>
            `;
            lucide.createIcons();
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
        // 6. FLASHCARD ACAK DGN SISTEM ENTER/SUBMIT
        // ==========================================
        let flashcardSequence = [];
        let currentFlashcardIndex = 0;
        let isCardFlipped = false;

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
                <div class="flex flex-col items-center justify-center py-6 tab-content animate-[fadeIn_0.3s_ease-out]">
                    <div class="mb-4 text-center">
                        <span class="bg-emerald-900/50 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm border border-emerald-800">Mode Acak | Kartu ${currentFlashcardIndex + 1} / ${flashcardSequence.length}</span>
                        <p class="text-slate-400 mt-2 text-sm">Ketik Romaji lalu klik tombol Kirim atau Enter!</p>
                    </div>
                    
                    <div class="perspective-1000 w-64 h-80 mb-2 cursor-pointer ${isCardFlipped ? 'flipped' : ''}" onclick="toggleFlashcard()">
                        <div class="flip-card-inner relative w-full h-full transform-style-3d shadow-2xl rounded-2xl">
                            <!-- Sisi Depan -->
                            <div class="absolute w-full h-full backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center">
                                <span class="text-9xl font-black text-emerald-400 drop-shadow-lg">${currentItem.k}</span>
                            </div>
                            <!-- Sisi Belakang (Jawaban Benar) -->
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-cyan-900 to-slate-900 border-2 border-cyan-500 rounded-2xl flex flex-col items-center justify-center">
                                <span class="text-4xl mb-2">🎉</span>
                                <span class="text-xl text-cyan-200 mb-1 font-bold" id="fc-result-title">Benar Sekali!</span>
                                <span class="text-6xl font-black text-white font-mono uppercase">${currentItem.r}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Input Interaktif dengan Tombol Submit -->
                    <div class="flex flex-col items-center w-full max-w-xs mx-auto mb-6 mt-4">
                        <div class="flex w-full gap-2 relative">
                            <input type="text" id="fc-input" 
                                class="flex-1 w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-emerald-500 transition shadow-inner"
                                placeholder="Ketik romaji..." autocomplete="off" autocapitalize="none"
                                ${isCardFlipped ? 'disabled' : ''}
                                oninput="document.getElementById('fc-msg').innerHTML=''"
                                onkeydown="if(event.key === 'Enter') { event.preventDefault(); submitFCAnswer(); }">
                            <button onclick="submitFCAnswer()" class="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition flex items-center justify-center shadow-lg" ${isCardFlipped ? 'disabled' : ''}>
                                <i data-lucide="send" class="w-6 h-6"></i>
                            </button>
                            ${isCardFlipped ? '<div class="absolute right-[4.5rem] top-3.5 text-cyan-400 font-black text-xl">✓</div>' : ''}
                        </div>
                        <p id="fc-msg" class="h-6 mt-2 text-sm font-bold text-rose-400 text-center"></p>
                    </div>

                    <div class="flex gap-4">
                        <button onclick="skipFlashcard()" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-bold text-slate-300">Lewati ➡</button>
                    </div>
                </div>
            `;
            
            lucide.createIcons();
            if (!isCardFlipped && window.innerWidth > 640) {
                setTimeout(() => { const el = document.getElementById('fc-input'); if(el) el.focus(); }, 100);
            }
        }

        window.toggleFlashcard = () => {
            isCardFlipped = !isCardFlipped;
            renderFlashcard();
        };

        window.submitFCAnswer = () => {
            if(isCardFlipped) return; // Jika sudah terjawab
            
            const inputEl = document.getElementById('fc-input');
            const msgEl = document.getElementById('fc-msg');
            const val = inputEl.value.trim().toLowerCase();
            const currentItem = flashcardSequence[currentFlashcardIndex];
            
            if (val === '') {
                msgEl.innerText = "⚠️ Jawaban tidak boleh kosong.";
                return;
            }

            if (val === currentItem.r) {
                // Jawaban Benar
                msgEl.className = "h-6 mt-2 text-sm font-bold text-emerald-400 text-center";
                msgEl.innerText = "✅ Benar!";
                isCardFlipped = true;
                sendScore(1, 0, 10);
                renderFlashcard();
                setTimeout(() => {
                    if(isCardFlipped) advanceFlashcard();
                }, 1500);
            } else {
                // Jawaban Salah - Feedback Diberikan
                msgEl.className = "h-6 mt-2 text-sm font-bold text-rose-400 text-center";
                msgEl.innerText = "❌ Salah, coba lagi!";
                sendScore(0, 1, -3); // Penalti
                inputEl.value = '';
                inputEl.focus();
            }
        };

        window.skipFlashcard = () => advanceFlashcard();

        function advanceFlashcard() {
            isCardFlipped = false;
            currentFlashcardIndex++;
            if (currentFlashcardIndex >= flashcardSequence.length) {
                initFlashcards();
            }
            renderFlashcard();
        }

        // ==========================================
        // 7. AI MEMBACA CERITA (DGN SUBMIT/ENTER & TIMER)
        // ==========================================
        function normalizeRomaji(str) {
            return str.toLowerCase()
                      .replace(/[^a-z]/g, '') // Hapus spasi dan tanda baca
                      .replace(/wo/g, 'o')    // Normalisasi partikel 'wo' ke 'o'
                      .replace(/si/g, 'shi')
                      .replace(/ti/g, 'chi')
                      .replace(/tu/g, 'tsu')
                      .replace(/hu/g, 'fu')
                      .replace(/zi/g, 'ji');
        }

        function initAIReading() {
            const availableStories = aiReadingData[aiUserLevel];
            aiCurrentStory = availableStories[Math.floor(Math.random() * availableStories.length)];
            
            aiTimerStarted = false;
            aiFinished = false;
            
            if(aiUserLevel === 'pemula') {
                aiTimeElapsed = 0; 
            } else if (aiUserLevel === 'mahir') {
                aiTimeRemaining = Math.floor(aiCurrentStory.romaji.replace(/[^a-z]/g, '').length * 2.5);
            } else if (aiUserLevel === 'pro') {
                aiTimeRemaining = Math.floor(aiCurrentStory.romaji.replace(/[^a-z]/g, '').length * 1.2);
            }
            
            clearInterval(aiTimerInterval);
            renderAIReading();
        }

        window.startAITimerIfNeeded = () => {
            if(!aiTimerStarted && !aiFinished) {
                aiTimerStarted = true;
                if(aiUserLevel === 'pemula') {
                    aiTimerInterval = setInterval(() => {
                        aiTimeElapsed++;
                        updateTimerUI();
                    }, 1000);
                } else {
                    aiTimerInterval = setInterval(() => {
                        aiTimeRemaining--;
                        updateTimerUI();
                        if(aiTimeRemaining <= 0) handleAITimeout();
                    }, 1000);
                }
                updateTimerUI();
            }
        };

        function updateTimerUI() {
            const timerEl = document.getElementById('ai-timer-display');
            if(!timerEl) return;

            if(aiUserLevel === 'pemula') {
                timerEl.innerText = `⏱️ Waktu: ${aiTimeElapsed} detik`;
                timerEl.className = "text-xl font-mono font-bold text-cyan-400";
            } else {
                timerEl.innerText = `⏳ Tersisa: ${aiTimeRemaining} detik`;
                if(aiTimeRemaining <= 5) {
                    timerEl.className = "text-xl font-mono font-bold timer-urgent";
                } else {
                    timerEl.className = "text-xl font-mono font-bold text-emerald-400";
                }
            }
        }

        function handleAITimeout() {
            clearInterval(aiTimerInterval);
            aiFinished = { status: 'timeout' };
            sendScore(0, 1, -5); 
            
            if(aiUserLevel === 'pro') saveAILevel('mahir');
            else if (aiUserLevel === 'mahir') saveAILevel('pemula');
            
            renderAIReading();
            if (window.MathJax) MathJax.typesetPromise();
        }

        window.submitAIAnswer = () => {
            if(aiFinished) return;
            
            const inputEl = document.getElementById('ai-read-input');
            const msgEl = document.getElementById('ai-msg');
            let userVal = inputEl.value;
            
            if(userVal.trim() === '') {
                msgEl.innerText = "⚠️ Anda belum mengetik apapun.";
                return;
            }

            let normalizedUser = normalizeRomaji(userVal);
            let normalizedTarget = normalizeRomaji(aiCurrentStory.romaji);

            if(normalizedUser === normalizedTarget) {
                // Jawaban Benar
                clearInterval(aiTimerInterval);
                aiFinished = { status: 'success' };
                
                let charCount = normalizedTarget.length;
                if(aiUserLevel === 'pemula') {
                    sendScore(1, 0, 15);
                    if(charCount / aiTimeElapsed > 1.0) saveAILevel('mahir');
                } else if (aiUserLevel === 'mahir') {
                    sendScore(1, 0, 25);
                    let maxTime = Math.floor(charCount * 2.5);
                    if(aiTimeRemaining > (maxTime * 0.3)) saveAILevel('pro');
                } else {
                    sendScore(1, 0, 40);
                }

                renderAIReading();
                if (window.MathJax) MathJax.typesetPromise();
            } else {
                // Jawaban Salah - Feedback Diberikan
                msgEl.innerText = "❌ Jawaban kurang tepat atau ada typo. Ayo periksa lagi!";
                sendScore(0, 1, -2); // Penalti salah tebak kalimat
            }
        };

        function renderAIReading() {
            let feedbackHtml = '';
            let inputSectionHtml = '';

            if (!aiFinished) {
                let timerLabel = aiUserLevel === 'pemula' ? `⏱️ Ketik huruf pertama untuk memulai waktu...` : `⏳ Waktu Target: ${aiTimeRemaining}s`;
                
                inputSectionHtml = `
                    <div class="mt-6 flex flex-col items-center w-full">
                        <div id="ai-timer-display" class="text-xl font-mono font-bold text-slate-400 mb-3">${timerLabel}</div>
                        <div class="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
                            <textarea id="ai-read-input" rows="2" 
                                class="flex-1 w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 text-xl sm:text-2xl text-white focus:outline-none focus:border-cyan-500 transition shadow-inner font-bold resize-none"
                                placeholder="Ketik romaji di sini..." autocomplete="off" autocapitalize="none" spellcheck="false"
                                oninput="startAITimerIfNeeded(); document.getElementById('ai-msg').innerHTML=''"
                                onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitAIAnswer(); }"></textarea>
                            <button onclick="submitAIAnswer()" class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-4 rounded-2xl transition flex items-center justify-center shadow-lg sm:w-auto w-full font-bold gap-2">
                                <i data-lucide="send" class="w-5 h-5"></i> Kirim
                            </button>
                        </div>
                        <p id="ai-msg" class="h-6 mt-2 text-sm font-bold text-rose-400"></p>
                        <p class="text-xs text-slate-500 mt-2 text-center">*Abaikan spasi/tanda baca. Anda bisa menekan tombol <strong>Enter</strong> untuk mengirim jawaban.</p>
                    </div>
                `;
            } else {
                let statusHeader = '';
                if(aiFinished.status === 'success') {
                    statusHeader = `<h3 class="text-2xl sm:text-3xl font-black text-emerald-400 mb-2 flex items-center gap-2 justify-center"><i data-lucide="check-circle-2" class="w-8 h-8"></i> Membaca Selesai!</h3>`;
                } else {
                    statusHeader = `<h3 class="text-2xl sm:text-3xl font-black text-rose-400 mb-2 flex items-center gap-2 justify-center"><i data-lucide="timer-off" class="w-8 h-8"></i> Waktu Habis!</h3>`;
                }

                feedbackHtml = `
                    <div class="mt-8 bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl tab-content w-full">
                        ${statusHeader}
                        <p class="text-center text-slate-300 mb-8">Kalimat asli: <strong class="text-white">"${aiCurrentStory.indo}"</strong></p>
                        
                        <div class="grid lg:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2 flex items-center gap-2"><i data-lucide="book-a" class="w-5 h-5 text-cyan-400"></i> Bedah 漢字 (Kanji) Asli</h4>
                                <ul class="list-none space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800 h-full">
                                    ${aiCurrentStory.kanjiInfo}
                                </ul>
                            </div>
                            <div>
                                <h4 class="text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2 flex items-center gap-2"><i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-400"></i> Analisis 文法 (Bunpou)</h4>
                                <div class="text-base text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 h-full flex flex-col justify-center text-center overflow-x-auto">
                                    ${aiCurrentStory.bunpouInfo}
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 flex justify-center">
                            <button onclick="initAIReading()" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition font-black tracking-wide text-white shadow-lg shadow-cyan-500/30 flex justify-center items-center gap-2">
                                Baca Cerita Selanjutnya <i data-lucide="arrow-right-circle" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                `;
            }

            let badgeClass = aiUserLevel === 'pemula' ? 'bg-cyan-900/50 border-cyan-500/50 text-cyan-400' :
                             aiUserLevel === 'mahir' ? 'bg-indigo-900/50 border-indigo-500/50 text-indigo-400' :
                             'bg-rose-900/50 border-rose-500/50 text-rose-400';

            contentDiv.innerHTML = `
                <div class="max-w-4xl mx-auto py-4 tab-content px-2 sm:px-0 flex flex-col items-center w-full">
                    <div class="mb-6 flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md w-full">
                        <div class="flex items-center gap-3">
                            <i data-lucide="brain-circuit" class="w-6 h-6 text-emerald-400"></i>
                            <div>
                                <h2 class="text-white font-bold text-sm sm:text-base">AI Membaca Tingkat Cerdas</h2>
                                <p class="text-xs text-slate-400">Mendeteksi kecepatan & keakuratan.</p>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-2 border font-black px-4 py-2 rounded-full text-xs sm:text-sm uppercase tracking-widest ${badgeClass}">
                            Kelas: ${aiUserLevel}
                        </span>
                    </div>
                    
                    <div class="bg-slate-800/80 border-t border-slate-700/50 rounded-3xl p-6 sm:p-10 mb-2 shadow-2xl relative overflow-hidden text-center backdrop-blur-sm w-full">
                        <h2 class="text-slate-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 flex items-center justify-center gap-2"><i data-lucide="glasses" class="w-4 h-4"></i> Baca Huruf di Bawah Ini</h2>
                        <div class="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-relaxed sm:leading-loose filter drop-shadow-md break-keep">
                            ${aiCurrentStory.hiragana}
                        </div>
                    </div>

                    ${inputSectionHtml}
                    ${feedbackHtml}
                </div>
            `;

            lucide.createIcons();
            if (!aiFinished && window.innerWidth > 640) {
                setTimeout(() => { const el = document.getElementById('ai-read-input'); if(el) el.focus(); }, 100);
            }
        }

        // Mulai aplikasi
        switchTab('materi');

    </script>
</body>
</html>
