<?php
session_start();

$gemu_base_path = '../../';
$gemu_nav_context = [
    'mode' => 'learning',
    'brand_text' => 'GemuYokai Belajar',
    'brand_badge' => 'GB',
    'show_profile' => true,
    'show_owner_tools' => false,
    'show_contact' => false,
    'compact' => true,
];

// Load lessons
$lessonsFile = __DIR__ . '/data/lessons.json';
$lessons = is_file($lessonsFile) ? json_decode(file_get_contents($lessonsFile), true) : [];
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Belajar Matematika — GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 50:'#f0f4f8',100:'#d9e2ec',200:'#bcccdc',300:'#9fb3c8',400:'#829ab1',500:'#627d98',600:'#486581',700:'#334e68',800:'#243b53',900:'#102a43',950:'#0a1929' },
                        accent: { 300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1' }
                    },
                    fontFamily: { sans:['Inter','sans-serif'] }
                }
            }
        }
    </script>
    <style>
        body{font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent}
        .lesson-card{transition:transform .2s ease,box-shadow .2s ease}
        .lesson-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.15)}
    </style>
</head>
<body class="bg-navy-950 text-white antialiased">
    <?php require __DIR__ . '/../../partials/navbar.php'; ?>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <header class="mb-12 text-center">
            <h1 class="text-4xl font-bold text-white mb-4">Matematika</h1>
            <p class="text-navy-300 max-w-2xl mx-auto">Tingkatkan pemahaman matematikan kamu melalui materi dan latihan soal interaktif dari level pemula hingga mahir.</p>
        </header>

        <div id="app-root" class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Sidebar / Progress -->
            <div class="md:col-span-1 space-y-6">
                <div class="bg-navy-900 border border-white/10 rounded-2xl p-6">
                    <h2 class="font-bold text-white mb-4 flex items-center gap-2"><i data-lucide="bar-chart-2" class="w-5 h-5 text-accent-400"></i> Progress Belajar</h2>
                    <div class="w-full bg-navy-800 rounded-full h-2 mb-2">
                        <div class="bg-accent-500 h-2 rounded-full" id="progress-bar" style="width: 0%"></div>
                    </div>
                    <p class="text-xs text-navy-400"><span id="progress-text">0</span>% Selesai</p>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="md:col-span-3">
                <div id="lesson-list" class="space-y-4">
                    <!-- Lessons rendered here -->
                </div>

                <div id="lesson-detail" class="hidden bg-navy-900 border border-white/10 rounded-2xl p-6">
                    <button onclick="closeLesson()" class="text-accent-400 hover:text-accent-300 mb-6 flex items-center gap-2 text-sm font-medium"><i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Daftar</button>
                    <div id="lesson-content"></div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const lessons = <?php echo json_encode($lessons, JSON_UNESCAPED_UNICODE); ?>;
        let progressData = JSON.parse(localStorage.getItem('gy_math_progress_v1') || '{}');
        if(!progressData.completed) progressData.completed = [];

        function updateProgressUI() {
            const pct = lessons.length > 0 ? Math.round((progressData.completed.length / lessons.length) * 100) : 0;
            document.getElementById('progress-bar').style.width = pct + '%';
            document.getElementById('progress-text').textContent = pct;
        }

        function renderLessonList() {
            const container = document.getElementById('lesson-list');
            container.innerHTML = lessons.map(lesson => {
                const isCompleted = progressData.completed.includes(lesson.id);
                return `
                    <div onclick="openLesson('${lesson.id}')" class="lesson-card cursor-pointer bg-navy-900 border ${isCompleted ? 'border-green-500/50' : 'border-white/10'} rounded-xl p-5 flex items-center justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-1">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-800 text-accent-400 uppercase tracking-wider">${lesson.level}</span>
                                ${isCompleted ? '<span class="text-green-400 flex items-center gap-1 text-xs"><i data-lucide="check-circle" class="w-3 h-3"></i> Selesai</span>' : ''}
                            </div>
                            <h3 class="font-bold text-lg text-white">${lesson.title}</h3>
                            <p class="text-sm text-navy-300">${lesson.summary}</p>
                        </div>
                        <i data-lucide="chevron-right" class="w-5 h-5 text-navy-500"></i>
                    </div>
                `;
            }).join('');
            lucide.createIcons();
            updateProgressUI();
        }

        function openLesson(id) {
            const lesson = lessons.find(l => l.id === id);
            if(!lesson) return;

            document.getElementById('lesson-list').classList.add('hidden');
            document.getElementById('lesson-detail').classList.remove('hidden');

            let html = `
                <div class="mb-6 pb-6 border-b border-white/10">
                    <h2 class="text-2xl font-bold text-white mb-2">${lesson.title}</h2>
                    <p class="text-navy-200 leading-relaxed">${lesson.explanation}</p>
                </div>
            `;

            if(lesson.formula) {
                html += `
                    <div class="bg-navy-800/50 p-4 rounded-xl mb-6 border border-accent-500/20">
                        <h4 class="text-xs text-accent-400 font-bold uppercase tracking-wider mb-2">Rumus</h4>
                        <code class="text-white">${lesson.formula}</code>
                    </div>
                `;
            }

            if(lesson.examples && lesson.examples.length > 0) {
                html += `<h3 class="text-lg font-bold text-white mb-4">Contoh Soal</h3><div class="space-y-4 mb-8">`;
                lesson.examples.forEach((ex, idx) => {
                    html += `
                        <div class="bg-navy-800 rounded-xl p-4">
                            <p class="font-medium text-white mb-3">Q: ${ex.question}</p>
                            <ul class="list-disc list-inside text-sm text-navy-300 space-y-1 ml-4 mb-3">
                                ${ex.steps.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                            <p class="text-sm font-bold text-accent-400">Jawaban: ${ex.answer}</p>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            if(lesson.quiz && lesson.quiz.length > 0) {
                html += `<h3 class="text-lg font-bold text-white mb-4">Latihan Singkat</h3><div class="space-y-4">`;
                lesson.quiz.forEach((q, idx) => {
                    html += `<div class="bg-navy-800 rounded-xl p-4" id="quiz-${lesson.id}-${idx}">
                        <p class="font-medium text-white mb-3">${idx+1}. ${q.question}</p>`;
                    if(q.type === 'multiple') {
                        html += `<div class="grid grid-cols-2 gap-2">`;
                        q.options.forEach(opt => {
                            html += `<button onclick="checkAnswer('${lesson.id}', ${idx}, '${opt}')" class="py-2 px-3 bg-navy-900 border border-white/10 rounded-lg text-sm text-white hover:border-accent-500 hover:text-accent-400 transition-colors text-left">${opt}</button>`;
                        });
                        html += `</div>`;
                    } else if(q.type === 'input') {
                        html += `<div class="flex gap-2">
                                    <input type="text" id="input-${lesson.id}-${idx}" class="flex-1 px-3 py-2 bg-navy-900 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-accent-500">
                                    <button onclick="checkInputAnswer('${lesson.id}', ${idx})" class="px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg text-white text-sm font-medium">Cek</button>
                                 </div>`;
                    }
                    html += `<div id="feedback-${lesson.id}-${idx}" class="mt-3 text-sm hidden"></div>
                    </div>`;
                });
                html += `</div>`;
            }

            html += `<div class="mt-8 pt-6 border-t border-white/10 text-center">
                        <button onclick="markCompleted('${lesson.id}')" class="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors">Tandai Selesai</button>
                     </div>`;

            document.getElementById('lesson-content').innerHTML = html;
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function closeLesson() {
            document.getElementById('lesson-detail').classList.add('hidden');
            document.getElementById('lesson-list').classList.remove('hidden');
            renderLessonList();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function checkAnswer(lessonId, quizIdx, selected) {
            const lesson = lessons.find(l => l.id === lessonId);
            const quiz = lesson.quiz[quizIdx];
            const feedback = document.getElementById(`feedback-${lessonId}-${quizIdx}`);
            feedback.classList.remove('hidden');
            if(selected === quiz.answer) {
                feedback.innerHTML = `<span class="text-green-400 font-medium">Benar!</span> ${quiz.explanation}`;
            } else {
                feedback.innerHTML = `<span class="text-red-400 font-medium">Kurang tepat.</span> Coba lagi!`;
            }
        }

        function checkInputAnswer(lessonId, quizIdx) {
            const val = document.getElementById(`input-${lessonId}-${quizIdx}`).value.trim();
            checkAnswer(lessonId, quizIdx, val);
        }

        function markCompleted(lessonId) {
            if(!progressData.completed.includes(lessonId)) {
                progressData.completed.push(lessonId);
                localStorage.setItem('gy_math_progress_v1', JSON.stringify(progressData));
            }
            alert('Materi ditandai selesai!');
            closeLesson();
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderLessonList();
            lucide.createIcons();
        });
    </script>
</body>
</html>
