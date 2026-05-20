<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Materials - GemuYokai</title>
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
            transition: all 0.3s ease;
        }
        .content-card:hover {
            background: rgba(30, 41, 59, 0.8);
            border-color: rgba(99, 102, 241, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="antialiased">
    <?php require __DIR__ . '/../../../partials/navbar.php'; ?>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div class="mb-8">
            <a href="index.php" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium mb-4 w-fit">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Dashboard
            </a>
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Learning Materials</h1>
            <p class="text-slate-400">Pilih materi dan pelajari secara bertahap.</p>
        </div>

        <div id="lesson-list" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Rendered via JS -->
        </div>

        <div id="lesson-detail" class="hidden">
            <button onclick="closeLesson()" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium mb-6">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar Materi
            </button>
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-8" id="lesson-content">
                <!-- Rendered via JS -->
            </div>
        </div>
    </main>

    <script>
        const lessons = <?php echo json_encode($englishLessons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
        const PROGRESS_KEY = 'gy_english_progress_v1';
        let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{"materi":[], "latihan":[], "listening":[], "dialog":[]}');
        if (!progress.materi) progress.materi = [];

        function renderList() {
            const container = document.getElementById('lesson-list');
            if (lessons.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-slate-500 py-10">Materi sedang disiapkan.</div>';
                return;
            }
            container.innerHTML = lessons.map(l => {
                const isDone = progress.materi.includes(l.id);
                return `
                    <div onclick="openLesson('${l.id}')" class="content-card p-6 cursor-pointer group">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded uppercase tracking-wider">${l.level}</span>
                            ${isDone ? '<i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>' : ''}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">${l.title}</h3>
                        <p class="text-sm text-slate-400 line-clamp-2">${l.summary}</p>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        function openLesson(id) {
            const lesson = lessons.find(l => l.id === id);
            if (!lesson) return;

            document.getElementById('lesson-list').classList.add('hidden');
            document.getElementById('lesson-detail').classList.remove('hidden');

            let html = `
                <div class="mb-8 border-b border-slate-700/50 pb-8">
                    <h2 class="text-3xl font-bold text-white mb-4">${lesson.title}</h2>
                    <p class="text-slate-300 leading-relaxed text-lg">${lesson.explanation}</p>
                </div>
            `;

            if (lesson.vocabulary && lesson.vocabulary.length > 0) {
                html += `<h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="book-open" class="w-5 h-5 text-indigo-400"></i> Vocabulary</h3>
                         <div class="grid sm:grid-cols-2 gap-3 mb-8">`;
                lesson.vocabulary.forEach(v => {
                    html += `<div class="bg-slate-900/50 p-3 rounded-xl border border-slate-700/30 flex justify-between">
                                <span class="font-bold text-indigo-300">${v.en}</span>
                                <span class="text-slate-400">${v.id}</span>
                             </div>`;
                });
                html += `</div>`;
            }

            if (lesson.examples && lesson.examples.length > 0) {
                html += `<h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="message-square" class="w-5 h-5 text-indigo-400"></i> Examples</h3>
                         <div class="space-y-4 mb-8">`;
                lesson.examples.forEach(ex => {
                    html += `<div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                                <p class="text-lg text-white font-medium mb-1">${ex.en}</p>
                                <p class="text-slate-400 text-sm mb-2">${ex.id}</p>
                                ${ex.note ? `<p class="text-xs text-indigo-400 bg-indigo-500/10 inline-block px-2 py-1 rounded">Note: ${ex.note}</p>` : ''}
                             </div>`;
                });
                html += `</div>`;
            }

            html += `<div class="text-center pt-6">
                        <button onclick="markDone('${lesson.id}')" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all">Tandai Selesai</button>
                     </div>`;

            document.getElementById('lesson-content').innerHTML = html;
            lucide.createIcons();
            window.scrollTo({top:0, behavior:'smooth'});
        }

        function closeLesson() {
            document.getElementById('lesson-detail').classList.add('hidden');
            document.getElementById('lesson-list').classList.remove('hidden');
            renderList();
            window.scrollTo({top:0, behavior:'smooth'});
        }

        async function markDone(id) {
            if (!progress.materi.includes(id)) {
                progress.materi.push(id);
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

                // Try save to API
                try {
                    const formData = new FormData();
                    formData.append('type', 'materi');
                    formData.append('score', progress.materi.length * 10);
                    await fetch('api/save_progress.php', { method: 'POST', body: formData });
                } catch(e) { console.log('API save failed, local saved.'); }
            }
            closeLesson();
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderList();
            lucide.createIcons();
        });
    </script>
</body>
</html>