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
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
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
                    <h1 class="text-3xl md:text-4xl font-extrabold mb-2"><span class="bg-gradient-to-r from-indigo-400 to-blue-400 gradient-text">Advanced Grammar Assessment</span></h1>
                    <p class="text-slate-400">Study the material carefully. You must pass the quick comprehension check below to earn your progress points.</p>
                </div>
                <a href="index.php" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl transition shadow-lg shrink-0">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <div class="space-y-6 mb-10">
                <div class="content-card p-6 md:p-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="w-full">
                            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">The Third Conditional</h3>
                            <p class="text-slate-300 mb-6 leading-relaxed">Used to talk about a condition in the past that did not happen. That is why there is no possibility for this condition.</p>

                            <div class="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                <h4 class="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">Structure & Examples</h4>
                                <div class="font-mono text-sm space-y-2 text-slate-300">
                                    <p><span class="text-indigo-300">Form:</span> If + past perfect, ... would + have + past participle</p>
                                    <p><span class="text-emerald-300">(+)</span> If she had studied, she would have passed the exam.</p>
                                    <p class="text-slate-500 text-xs mt-1">(Meaning: She didn't study, so she didn't pass.)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-card p-6 md:p-8">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl shrink-0">
                            <i class="fas fa-quote-left"></i>
                        </div>
                        <div class="w-full">
                            <h3 class="text-xl md:text-2xl font-bold text-white mb-2">Reported Speech (Backshift)</h3>
                            <p class="text-slate-300 mb-6 leading-relaxed">When we report what someone said in the past, we usually change the tense 'one step back' into the past.</p>

                            <div class="bg-slate-900/80 p-5 rounded-lg border border-slate-700/50 relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                <h4 class="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Structure & Examples</h4>
                                <div class="font-mono text-sm space-y-2 text-slate-300">
                                    <p><span class="text-rose-300">Direct:</span> "I am working in London."</p>
                                    <p><span class="text-emerald-300">Reported:</span> He said (that) he was working in London.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-slate-700/50 pt-8">
                <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-clipboard-check text-indigo-400"></i> Comprehension Check</h3>
                <p class="text-sm text-slate-400 mb-6">You must answer correctly to prove you've mastered this material.</p>

                <div class="bg-slate-800/80 rounded-xl p-6 border border-slate-700 mb-6">
                    <p class="font-semibold text-lg text-white mb-4">"If I had known you were coming, I _____ a cake."</p>
                    <div class="space-y-3" id="quiz-options">
                        <button class="w-full text-left p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:border-indigo-500 transition opt-btn group" data-correct="false">
                            <span class="font-bold text-slate-500 group-hover:text-indigo-400 mr-2 transition">A)</span> would bake
                        </button>
                        <button class="w-full text-left p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:border-indigo-500 transition opt-btn group" data-correct="false">
                            <span class="font-bold text-slate-500 group-hover:text-indigo-400 mr-2 transition">B)</span> will bake
                        </button>
                        <button class="w-full text-left p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:border-indigo-500 transition opt-btn group" data-correct="true">
                            <span class="font-bold text-slate-500 group-hover:text-indigo-400 mr-2 transition">C)</span> would have baked
                        </button>
                    </div>
                </div>

                <div id="result-area" class="hidden mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 text-center transform transition-all">
                    <p id="result-msg" class="font-bold text-xl mb-4"></p>
                    <button id="claimBtn" class="w-full sm:w-auto px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg mx-auto hidden">
                        <i class="fas fa-gem mr-2"></i> Claim Progress (+10%)
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.querySelectorAll('.opt-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Disable all
                document.querySelectorAll('.opt-btn').forEach(b => {
                    b.disabled = true;
                    b.classList.remove('hover:border-indigo-500');
                    b.classList.add('opacity-70');
                });

                const isCorrect = this.dataset.correct === 'true';
                const resArea = document.getElementById('result-area');
                const resMsg = document.getElementById('result-msg');
                const claimBtn = document.getElementById('claimBtn');

                resArea.classList.remove('hidden');
                this.classList.remove('opacity-70', 'bg-slate-900/80');

                if (isCorrect) {
                    this.classList.add('bg-emerald-900/40', 'border-emerald-500', 'text-emerald-400');
                    resMsg.className = "font-bold text-xl mb-4 text-emerald-400";
                    resMsg.innerHTML = '<i class="fas fa-check-circle mr-2 text-2xl"></i> Brilliant! You correctly identified the Third Conditional.';
                    claimBtn.classList.remove('hidden');
                } else {
                    this.classList.add('bg-rose-900/40', 'border-rose-500', 'text-rose-400');
                    resMsg.className = "font-bold text-xl mb-4 text-rose-400";
                    resMsg.innerHTML = '<i class="fas fa-times-circle mr-2 text-2xl"></i> Incorrect. Review the form: <strong>would + have + past participle</strong>.<br><span class="text-sm mt-2 block font-normal text-slate-400">Please refresh the page to try again.</span>';
                }
            });
        });

        document.getElementById('claimBtn').addEventListener('click', async () => {
            const btn = document.getElementById('claimBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'materi', score: 10 })
                });
                const data = await res.json();
                if(data.success) {
                    btn.classList.add('hidden');
                    document.getElementById('result-msg').innerHTML = '<i class="fas fa-star text-amber-400 mr-2"></i> Progress Successfully Saved!';
                    document.getElementById('result-msg').className = "font-bold text-2xl mb-4 text-emerald-400 drop-shadow-md";
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-gem mr-2"></i> Try Again';
                }
            } catch(e) {
                console.error(e);
                alert("Network error.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-gem mr-2"></i> Try Again';
            }
        });
    </script>
</body>
</html>
