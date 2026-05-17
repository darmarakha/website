<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GemuYokai - AI English Learning</title>
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

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(147, 197, 253, 0.3);
        }

        .progress-ring__circle {
            transition: stroke-dashoffset 0.8s ease-in-out;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
        }

        .ai-pulse {
            animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        .gradient-text {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-glass {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <!-- Navigation -->
    <nav class="nav-glass sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-4">
                    <a href="../../Index.php" class="text-slate-400 hover:text-white transition">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </a>
                    <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 gradient-text">English AI</span>
                </div>

                <?php if (!empty($_SESSION['user_name'])): ?>
                    <div class="flex items-center gap-4">
                        <div class="hidden md:flex flex-col items-end">
                            <span class="text-sm font-semibold text-slate-200"><?= htmlspecialchars($_SESSION['user_name']) ?></span>
                            <span class="text-xs text-blue-400">Level: <?= htmlspecialchars($ai_classification) ?></span>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-800">
                            <?= strtoupper(substr($_SESSION['user_name'], 0, 1)) ?>
                        </div>
                        <a href="?logout=1" class="text-slate-400 hover:text-red-400 transition" title="Logout">
                            <i class="fas fa-sign-out-alt"></i>
                        </a>
                    </div>
                <?php else: ?>
                    <a href="../../auth.php" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-lg shadow-blue-500/30">Login / Register</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        <?php if (!empty($_SESSION['user_name'])): ?>
            <!-- AI Dashboard Section -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                <!-- Overall Progress Card -->
                <div class="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h2 class="text-lg font-semibold text-slate-300 mb-4 z-10">AI Evaluated Progress</h2>

                    <div class="relative w-40 h-40 mb-4 z-10">
                        <svg class="w-full h-full" viewBox="0 0 100 100">
                            <!-- Background circle -->
                            <circle class="text-slate-700 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                            <!-- Progress circle -->
                            <circle class="text-blue-500 progress-ring__circle stroke-current" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="<?= 251.2 - (251.2 * $ai_total_progress) / 100 ?>"></circle>
                        </svg>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span class="text-4xl font-bold text-white"><?= $ai_total_progress ?></span><span class="text-xl text-blue-400">%</span>
                        </div>
                    </div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium z-10 border border-blue-500/30">
                        <i class="fas fa-robot"></i> AI Certified
                    </div>
                </div>

                <!-- AI Feedback & Radar -->
                <div class="glass-card p-6 lg:col-span-2 flex flex-col relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10">
                        <i class="fas fa-brain text-8xl text-blue-300"></i>
                    </div>

                    <div class="flex items-center gap-3 mb-4 z-10">
                        <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 ai-pulse">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h2 class="text-xl font-bold text-white">Sensei AI Analysis</h2>
                    </div>

                    <p class="text-slate-300 mb-6 leading-relaxed z-10 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <?= htmlspecialchars($ai_feedback_msg) ?>
                    </p>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto z-10">
                        <!-- Stat 1 -->
                        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center">
                            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Materials</span>
                            <span class="text-2xl font-bold text-indigo-400"><?= $prog_materi ?>%</span>
                        </div>
                        <!-- Stat 2 -->
                        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center">
                            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Exercises</span>
                            <span class="text-2xl font-bold text-emerald-400"><?= $prog_latihan ?>%</span>
                        </div>
                        <!-- Stat 3 -->
                        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center">
                            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Dialogues</span>
                            <span class="text-2xl font-bold text-amber-400"><?= $prog_dialog ?>%</span>
                        </div>
                        <!-- Stat 4 -->
                        <div class="bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center">
                            <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Listening</span>
                            <span class="text-2xl font-bold text-rose-400"><?= $prog_listening ?>%</span>
                        </div>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <!-- Hero Section for Guests -->
            <div class="glass-card p-10 text-center mb-10 relative overflow-hidden">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full max-w-3xl opacity-20 pointer-events-none">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-3xl rounded-full mix-blend-screen"></div>
                </div>
                <h1 class="text-4xl md:text-5xl font-extrabold mb-4 z-10 relative"><span class="bg-gradient-to-r from-blue-400 to-purple-400 gradient-text">Master English</span> with AI</h1>
                <p class="text-xl text-slate-300 mb-8 max-w-2xl mx-auto z-10 relative">Adaptive learning path powered by machine learning to accelerate your fluency.</p>
                <div class="z-10 relative">
                    <a href="../../auth.php" class="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full transition shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                        Get Started Free <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        <?php endif; ?>

        <!-- Learning Modules Grid -->
        <h3 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <i class="fas fa-layer-group text-blue-400"></i> Learning Modules
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <!-- Materi -->
            <a href="materi.php" class="glass-card p-6 flex flex-col group cursor-pointer h-full">
                <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-500/10">
                    <i class="fas fa-book-open"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">Materials</h4>
                <p class="text-slate-400 text-sm mb-4 flex-grow">Grammar, vocabulary, and basic concepts explained clearly.</p>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-auto">
                    <div class="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style="width: <?= $prog_materi ?>%"></div>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs font-semibold text-slate-500">
                    <span>Progress</span>
                    <span class="text-indigo-400"><?= $prog_materi ?>%</span>
                </div>
            </a>

            <!-- Latihan -->
            <a href="latihan.php" class="glass-card p-6 flex flex-col group cursor-pointer h-full">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-500/10">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">Exercises</h4>
                <p class="text-slate-400 text-sm mb-4 flex-grow">Test your knowledge with adaptive quizzes and fill-in-the-blanks.</p>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-auto">
                    <div class="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style="width: <?= $prog_latihan ?>%"></div>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs font-semibold text-slate-500">
                    <span>Progress</span>
                    <span class="text-emerald-400"><?= $prog_latihan ?>%</span>
                </div>
            </a>

            <!-- Listening -->
            <a href="listening.php" class="glass-card p-6 flex flex-col group cursor-pointer h-full">
                <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-rose-500/10">
                    <i class="fas fa-headphones-alt"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">Listening</h4>
                <p class="text-slate-400 text-sm mb-4 flex-grow">Train your ears with native speaker audio and dictation exercises.</p>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-auto">
                    <div class="bg-rose-500 h-2 rounded-full transition-all duration-1000" style="width: <?= $prog_listening ?>%"></div>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs font-semibold text-slate-500">
                    <span>Progress</span>
                    <span class="text-rose-400"><?= $prog_listening ?>%</span>
                </div>
            </a>

            <!-- Talk with AI (Dialog) -->
            <a href="dialog.php" class="glass-card p-6 flex flex-col group cursor-pointer h-full relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/40 transition-colors"></div>
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] z-10">
                    <i class="fas fa-microphone-alt"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2 flex items-center gap-2 z-10">
                    Talk with AI <span class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide animate-pulse">Beta</span>
                </h4>
                <p class="text-slate-400 text-sm mb-4 flex-grow z-10">Practice real-time speaking with our voice-enabled AI tutor.</p>
                <div class="w-full bg-slate-800 rounded-full h-2 mt-auto z-10">
                    <div class="bg-amber-500 h-2 rounded-full transition-all duration-1000" style="width: <?= $prog_dialog ?>%"></div>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs font-semibold text-slate-500 z-10">
                    <span>Progress</span>
                    <span class="text-amber-400"><?= $prog_dialog ?>%</span>
                </div>
            </a>

        </div>
    </main>

    <footer class="mt-auto border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        <p>&copy; 2026 GemuYokai. Advanced Learning Algorithm.</p>
    </footer>

</body>
</html>
