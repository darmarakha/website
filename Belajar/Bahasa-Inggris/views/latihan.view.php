<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Exercises - GemuYokai</title>
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
        .quiz-option {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
        }
        .quiz-option:hover:not(:disabled) {
            background: rgba(79, 70, 229, 0.2);
            border-color: rgba(99, 102, 241, 0.5);
        }
        .quiz-option.correct {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(74, 222, 128, 0.5);
            color: #4ade80;
        }
        .quiz-option.wrong {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(248, 113, 113, 0.5);
            color: #f87171;
        }
    </style>
</head>
<body class="antialiased">
    <?php require __DIR__ . '/../../../partials/navbar.php'; ?>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div class="mb-8">
            <a href="index.php" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium mb-4 w-fit">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Dashboard
            </a>
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Practice Exercises</h1>
            <p class="text-slate-400">Pilih topik latihan untuk menguji pemahamanmu.</p>
        </div>

        <div id="exercise-list" class="grid sm:grid-cols-2 gap-4">
            <!-- Rendered via JS -->
        </div>

        <div id="quiz-container" class="hidden">
            <button onclick="closeExercise()" class="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium mb-6">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar Latihan
            </button>
            <div class="content-card p-6 md:p-8" id="quiz-content">
                <!-- Rendered via JS -->
            </div>
        </div>
    </main>

    <script>
        const lessons = <?php echo json_encode($englishLessons, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;
        const PROGRESS_KEY = 'gy_english_progress_v1';
        let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{"materi":[], "latihan":[], "listening":[], "dialog":[]}');
        if (!progress.latihan) progress.latihan = [];

        function renderList() {
            const container = document.getElementById('exercise-list');
            const exerciseLessons = lessons.filter(l => l.quiz && l.quiz.length > 0);
            if (exerciseLessons.length === 0) {
                container.innerHTML = '<div class="col-span-full text-center text-slate-500 py-10">Belum ada latihan tersedia.</div>';
                return;
            }
            container.innerHTML = exerciseLessons.map(l => {
                const isDone = progress.latihan.includes(l.id);
                return `
                    <div onclick="startExercise('${l.id}')" class="content-card p-5 cursor-pointer group hover:border-indigo-500/50 transition-colors">
                        <div class="flex justify-between items-center mb-2">
                            <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded uppercase tracking-wider">Quiz</span>
                            ${isDone ? '<i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>' : ''}
                        </div>
                        <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">${l.title}</h3>
                        <p class="text-sm text-slate-400 mt-1">${l.quiz.length} Questions</p>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        let currentLessonId = null;
        let currentQuizData = null;

        function startExercise(id) {
            const lesson = lessons.find(l => l.id === id);
            if (!lesson || !lesson.quiz) return;
            currentLessonId = lesson.id;
            currentQuizData = lesson.quiz;

            document.getElementById('exercise-list').classList.add('hidden');
            document.getElementById('quiz-container').classList.remove('hidden');

            renderQuizQuestions();
            window.scrollTo({top:0, behavior:'smooth'});
        }

        function renderQuizQuestions() {
            let html = `
                <div class="mb-6 pb-4 border-b border-slate-700/50 flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-white">Quiz: ${lessons.find(l=>l.id===currentLessonId).title}</h2>
                </div>
                <div class="space-y-8">
            `;

            currentQuizData.forEach((q, qIdx) => {
                html += `<div class="quiz-item" id="q-${qIdx}">
                            <p class="text-lg text-white font-medium mb-4">${qIdx+1}. ${q.question}</p>`;

                if (q.type === 'multiple') {
                    html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">`;
                    q.options.forEach((opt, oIdx) => {
                        html += `<button onclick="checkAnswer(${qIdx}, '${opt.replace(/'/g, "\\'")}')" class="quiz-option w-full p-4 rounded-xl text-left font-medium text-slate-300">
                                    ${opt}
                                 </button>`;
                    });
                    html += `</div>`;
                } else if (q.type === 'input') {
                    html += `<div class="flex gap-3">
                                <input type="text" id="input-${qIdx}" class="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500" placeholder="Type your answer...">
                                <button onclick="checkAnswer(${qIdx}, document.getElementById('input-${qIdx}').value)" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors">Check</button>
                             </div>`;
                }

                html += `<div id="feedback-${qIdx}" class="mt-4 hidden p-4 rounded-xl text-sm"></div>
                         </div>`;
            });

            html += `</div>
                     <div class="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <button onclick="finishExercise()" class="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all">Selesai Latihan</button>
                     </div>`;

            document.getElementById('quiz-content').innerHTML = html;
        }

        function checkAnswer(qIdx, selected) {
            const q = currentQuizData[qIdx];
            const feedback = document.getElementById(`feedback-${qIdx}`);
            const qItem = document.getElementById(`q-${qIdx}`);
            const isCorrect = selected.trim().toLowerCase() === q.answer.trim().toLowerCase();

            // Disable buttons if multiple
            if (q.type === 'multiple') {
                const btns = qItem.querySelectorAll('button.quiz-option');
                btns.forEach(btn => {
                    btn.disabled = true;
                    if (btn.textContent.trim() === q.answer) btn.classList.add('correct');
                    else if (btn.textContent.trim() === selected) btn.classList.add('wrong');
                });
            }

            feedback.classList.remove('hidden');
            if (isCorrect) {
                feedback.className = 'mt-4 p-4 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-400';
                feedback.innerHTML = `<strong class="block mb-1">Correct!</strong> ${q.explanation}`;
            } else {
                feedback.className = 'mt-4 p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400';
                feedback.innerHTML = `<strong class="block mb-1">Incorrect.</strong> The correct answer is: ${q.answer}<br>${q.explanation}`;
            }
        }

        async function finishExercise() {
            if (!progress.latihan.includes(currentLessonId)) {
                progress.latihan.push(currentLessonId);
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

                try {
                    const formData = new FormData();
                    formData.append('type', 'latihan');
                    formData.append('score', progress.latihan.length * 10);
                    await fetch('api/save_progress.php', { method: 'POST', body: formData });
                } catch(e) {}
            }
            closeExercise();
        }

        function closeExercise() {
            document.getElementById('quiz-container').classList.add('hidden');
            document.getElementById('exercise-list').classList.remove('hidden');
            renderList();
            window.scrollTo({top:0, behavior:'smooth'});
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderList();
        });
    </script>
</body>
</html>