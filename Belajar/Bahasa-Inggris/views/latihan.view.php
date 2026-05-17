<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Exercises - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            background-image:
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            background-attachment: fixed;
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .question-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
            transition: all 0.3s ease;
        }

        .option-btn {
            position: relative;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .option-btn:hover:not(:disabled) {
            transform: translateX(5px);
            background: rgba(51, 65, 85, 0.8);
            border-color: rgba(52, 211, 153, 0.5);
        }

        .gradient-text {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-6 md:p-10 relative overflow-hidden">
        <!-- Background decorative elements -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold mb-2"><span class="bg-gradient-to-r from-emerald-400 to-teal-400 gradient-text">Grammar Exercises</span></h1>
                    <p class="text-slate-400">Test your knowledge with these adaptive questions.</p>
                </div>
                <a href="index.php" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl transition shadow-lg shrink-0">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <div id="quiz-container" class="space-y-6">
                <!-- Question 1 -->
                <div class="question-card p-6 md:p-8" data-answered="false">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</div>
                        <h3 class="text-xl font-bold text-white">She _____ to the store yesterday.</h3>
                    </div>
                    <div class="space-y-3 pl-11">
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="false">
                            <span><span class="font-bold text-slate-400 mr-3">A)</span> goes</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="true">
                            <span><span class="font-bold text-slate-400 mr-3">B)</span> went</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="false">
                            <span><span class="font-bold text-slate-400 mr-3">C)</span> gone</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                    </div>
                </div>

                <!-- Question 2 -->
                <div class="question-card p-6 md:p-8" data-answered="false">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">2</div>
                        <h3 class="text-xl font-bold text-white">I have lived here _____ 2010.</h3>
                    </div>
                    <div class="space-y-3 pl-11">
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="false">
                            <span><span class="font-bold text-slate-400 mr-3">A)</span> for</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="true">
                            <span><span class="font-bold text-slate-400 mr-3">B)</span> since</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                        <button class="w-full text-left px-5 py-4 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 option-btn flex items-center justify-between group" data-correct="false">
                            <span><span class="font-bold text-slate-400 mr-3">C)</span> in</span>
                            <i class="fas fa-check text-emerald-400 opacity-0 transition-opacity"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-10 pt-6 border-t border-slate-700/50 hidden" id="submitArea">
                <div class="bg-slate-800/50 rounded-2xl p-6 mb-6 flex justify-between items-center border border-slate-700">
                    <div>
                        <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Current Score</p>
                        <p class="text-3xl font-bold text-white"><span id="scoreDisplay">0</span> <span class="text-lg text-slate-500 font-normal">/ 2</span></p>
                    </div>
                    <div class="text-right">
                        <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Accuracy</p>
                        <p class="text-2xl font-bold text-emerald-400" id="accuracyDisplay">0%</p>
                    </div>
                </div>

                <button id="submitBtn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 md:py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-3 text-lg">
                    <i class="fas fa-save"></i> Submit Results (+15% Progress max)
                </button>

                <div id="successMsg" class="hidden mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center transform transition-all">
                    <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-trophy text-3xl text-emerald-400"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-emerald-400 mb-2">Great Effort!</h3>
                    <p class="text-emerald-200/70" id="finalMsgText">Your score has been updated in your profile.</p>
                    <a href="dialog.php" class="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 transition">Continue to AI Dialog <i class="fas fa-arrow-right ml-1"></i></a>
                </div>
            </div>
        </div>
    </div>

    <script>
        let answered = 0;
        const total = 2;
        let score = 0;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const parentCard = this.closest('.question-card');
                if (parentCard.dataset.answered === 'true') return;

                parentCard.dataset.answered = 'true';
                answered++;

                // Disable all buttons in this question
                parentCard.querySelectorAll('.option-btn').forEach(b => {
                    b.disabled = true;
                    b.classList.remove('hover:bg-slate-600');
                    b.classList.add('opacity-50', 'cursor-not-allowed');
                });

                if (this.dataset.correct === 'true') {
                    this.classList.remove('bg-slate-800/80', 'border-slate-700', 'opacity-50');
                    this.classList.add('bg-emerald-600/20', 'border-emerald-500', 'text-emerald-400');
                    this.querySelector('i').classList.remove('opacity-0');
                    score++;
                } else {
                    this.classList.remove('bg-slate-800/80', 'border-slate-700', 'opacity-50');
                    this.classList.add('bg-rose-600/20', 'border-rose-500', 'text-rose-400');
                    this.querySelector('i').className = 'fas fa-times text-rose-400';

                    // Highlight correct answer
                    const correctBtn = parentCard.querySelector('[data-correct="true"]');
                    correctBtn.classList.remove('bg-slate-800/80', 'border-slate-700', 'opacity-50');
                    correctBtn.classList.add('bg-emerald-600/20', 'border-emerald-500', 'text-emerald-400');
                    correctBtn.querySelector('i').classList.remove('opacity-0');
                }

                if (answered === total) {
                    const submitArea = document.getElementById('submitArea');
                    submitArea.classList.remove('hidden');
                    document.getElementById('scoreDisplay').innerText = score;
                    document.getElementById('accuracyDisplay').innerText = Math.round((score / total) * 100) + '%';

                    // Animate area appearing
                    submitArea.style.animation = 'slideUp 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
                }
            });
        });

        document.getElementById('submitBtn').addEventListener('click', async () => {
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.classList.add('opacity-80', 'cursor-not-allowed');

            try {
                // Max progress added is 15%, scaled by score
                const progressScore = Math.round((score / total) * 15);
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'latihan', score: progressScore })
                });

                const data = await res.json();

                if(data.success) {
                    btn.classList.add('hidden');
                    document.getElementById('successMsg').classList.remove('hidden');
                    document.getElementById('successMsg').style.animation = 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-save"></i> Try Again';
                    btn.classList.remove('opacity-80', 'cursor-not-allowed');
                }
            } catch(e) {
                console.error(e);
                alert("Network error occurred.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Try Again';
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes scaleIn {
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
