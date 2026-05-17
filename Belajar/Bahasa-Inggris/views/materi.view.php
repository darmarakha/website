<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Materials - GemuYokai</title>
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
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold mb-2"><span class="bg-gradient-to-r from-indigo-400 to-blue-400 gradient-text">Grammar & Vocabulary</span></h1>
                    <p class="text-slate-400">Master the foundation of the English language.</p>
                </div>
                <a href="index.php" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl transition shadow-lg shrink-0">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <div class="space-y-6">
                <!-- Section 1 -->
                <div class="content-card p-6 md:p-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="w-full">
                            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">1. Present Simple Tense</h3>
                            <p class="text-slate-300 mb-6 leading-relaxed">The present simple tense is used for habitual actions, general truths, scheduled events in the future, and permanent situations.</p>

                            <div class="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                <h4 class="text-sm font-semibold text-green-400 uppercase tracking-wider mb-2">Structure & Examples</h4>
                                <div class="font-mono text-sm space-y-2 text-slate-300">
                                    <p><span class="text-indigo-300">Form:</span> Subject + V1 (s/es) + Object</p>
                                    <p><span class="text-emerald-300">(+)</span> She plays tennis every Sunday.</p>
                                    <p><span class="text-rose-300">(-)</span> She doesn't play tennis every Sunday.</p>
                                    <p><span class="text-amber-300">(?)</span> Does she play tennis every Sunday?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 2 -->
                <div class="content-card p-6 md:p-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="w-full">
                            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">2. Past Simple Tense</h3>
                            <p class="text-slate-300 mb-6 leading-relaxed">The past simple tense describes actions or states that began and ended at a specific time in the past.</p>

                            <div class="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                <h4 class="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Structure & Examples</h4>
                                <div class="font-mono text-sm space-y-2 text-slate-300">
                                    <p><span class="text-indigo-300">Form:</span> Subject + V2 + Object</p>
                                    <p><span class="text-emerald-300">(+)</span> I visited London last year.</p>
                                    <p><span class="text-rose-300">(-)</span> I didn't visit London last year.</p>
                                    <p><span class="text-amber-300">(?)</span> Did you visit London last year?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 3 -->
                <div class="content-card p-6 md:p-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
                            <i class="fas fa-font"></i>
                        </div>
                        <div class="w-full">
                            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">3. Essential Vocabulary: Business</h3>
                            <p class="text-slate-300 mb-6 leading-relaxed">Common words used in a professional or corporate environment.</p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
                                    <p class="font-bold text-indigo-300">Agenda</p>
                                    <p class="text-sm text-slate-400">A list of items to be discussed at a formal meeting.</p>
                                </div>
                                <div class="bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
                                    <p class="font-bold text-indigo-300">Deadline</p>
                                    <p class="text-sm text-slate-400">The latest time or date by which something should be completed.</p>
                                </div>
                                <div class="bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
                                    <p class="font-bold text-indigo-300">Merge</p>
                                    <p class="text-sm text-slate-400">Combine or cause to combine to form a single entity.</p>
                                </div>
                                <div class="bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
                                    <p class="font-bold text-indigo-300">Revenue</p>
                                    <p class="text-sm text-slate-400">Income, especially when of a company or organization.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-10 pt-6 border-t border-slate-700/50">
                <button id="completeBtn" class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 md:py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-3 text-lg">
                    <i class="fas fa-check-circle"></i> I Have Mastered This Material (+10% Progress)
                </button>

                <div id="successMsg" class="hidden mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center transform transition-all">
                    <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-star text-3xl text-emerald-400"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-emerald-400 mb-2">Excellent Work!</h3>
                    <p class="text-emerald-200/70">Your progress has been successfully saved to your learning profile.</p>
                    <a href="latihan.php" class="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 transition">Continue to Exercises <i class="fas fa-arrow-right ml-1"></i></a>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('completeBtn').addEventListener('click', async () => {
            const btn = document.getElementById('completeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Progress...';
            btn.classList.add('opacity-80', 'cursor-not-allowed');

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'materi', score: 10 })
                });

                const data = await res.json();

                if(data.success) {
                    btn.classList.add('hidden');
                    const successMsg = document.getElementById('successMsg');
                    successMsg.classList.remove('hidden');
                    // Add a little pop animation
                    successMsg.style.animation = 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Try Again';
                    btn.classList.remove('opacity-80', 'cursor-not-allowed');
                }
            } catch(e) {
                console.error(e);
                alert("Network error occurred.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Try Again';
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        });

        // Add custom animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scaleIn {
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
