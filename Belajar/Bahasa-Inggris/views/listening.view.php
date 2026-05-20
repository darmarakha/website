<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Listening - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        .content-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
        }
    </style>
</head>
<body class="antialiased">
    <?php require __DIR__ . '/../../../partials/navbar.php'; ?>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div class="mb-8 text-center">
            <a href="index.php" class="text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-2 text-sm font-medium mb-4">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Dashboard
            </a>
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Listening Comprehension</h1>
            <p class="text-slate-400">Dengarkan audio atau teks-ke-suara untuk melatih pendengaranmu.</p>
        </div>

        <div class="content-card p-6 md:p-10 text-center">
            <i data-lucide="headphones" class="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50"></i>
            <h2 class="text-2xl font-bold text-white mb-2">Uji Pendengaran Singkat</h2>
            <p class="text-slate-400 max-w-md mx-auto mb-6">Klik tombol di bawah ini untuk mendengarkan kalimat, lalu ketik apa yang kamu dengar.</p>

            <button onclick="playAudio('Hello, welcome to GemuYokai. Have a great day learning English.')" class="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all mb-6 flex items-center justify-center gap-2 mx-auto border border-slate-600">
                <i data-lucide="volume-2" class="w-5 h-5 text-indigo-400"></i> Putar Suara
            </button>

            <div class="max-w-md mx-auto flex gap-2">
                <input type="text" id="listen_answer" class="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="Ketik kalimat di sini...">
                <button onclick="checkListening()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">Cek</button>
            </div>

            <div id="feedback-listen" class="mt-4 hidden p-4 rounded-xl text-sm max-w-md mx-auto"></div>
        </div>
    </main>

    <script>
        const PROGRESS_KEY = 'gy_english_progress_v1';
        let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{"materi":[], "latihan":[], "listening":[], "dialog":[]}');
        if (!progress.listening) progress.listening = [];

        function playAudio(text) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            } else {
                alert("Maaf, browser kamu tidak mendukung fitur Text-to-Speech.");
            }
        }

        async function checkListening() {
            const answer = document.getElementById('listen_answer').value.trim().toLowerCase();
            const expected = "hello, welcome to gemuyokai. have a great day learning english.".toLowerCase();
            const feedback = document.getElementById('feedback-listen');

            // Remove punctuation for easier match
            const cleanAnswer = answer.replace(/[.,]/g, '');
            const cleanExpected = expected.replace(/[.,]/g, '');

            feedback.classList.remove('hidden');
            if (cleanAnswer === cleanExpected) {
                feedback.className = 'mt-4 p-4 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-400 max-w-md mx-auto';
                feedback.innerHTML = `<strong class="block mb-1">Tepat Sekali!</strong> Pendengaranmu sangat baik.`;

                if (!progress.listening.includes('listen-1')) {
                    progress.listening.push('listen-1');
                    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
                    try {
                        const formData = new FormData();
                        formData.append('type', 'listening');
                        formData.append('score', 100);
                        await fetch('api/save_progress.php', { method: 'POST', body: formData });
                    } catch(e) {}
                }
            } else {
                feedback.className = 'mt-4 p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400 max-w-md mx-auto';
                feedback.innerHTML = `<strong class="block mb-1">Coba Lagi</strong> Pastikan ejaan bahasa Inggrismu benar.`;
            }
        }
        lucide.createIcons();
    </script>
</body>
</html>