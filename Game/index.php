<?php
session_start();
$gemu_base_path = '../';
$gemu_asset_version = @filemtime(__DIR__ . '/../data.js') ?: time();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemu Games - Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        body { 
            background-color: #020617; 
            color: #94a3b8; 
            font-family: 'Plus Jakarta Sans', sans-serif;
            overflow-x: hidden;
        }
        .glass {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(51, 65, 85, 0.5);
        }
        .game-card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(51, 65, 85, 0.5);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .game-card:hover {
            border-color: #3b82f6;
            background: rgba(30, 41, 59, 0.6);
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px -20px rgba(59, 130, 246, 0.3);
        }
        .bg-glow {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
            pointer-events: none;
            z-index: -1;
        }
    </style>
</head>
<body class="min-h-screen">

    <div class="bg-glow"></div>

    <?php
    $gemu_navbar = __DIR__ . '/../partials/navbar.php';
    if (is_file($gemu_navbar)) {
        require $gemu_navbar;
    }
    ?>

    <main class="max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        <!-- Hero Section -->
        <div class="text-center mb-20 reveal">
            <h2 class="text-blue-500 font-bold tracking-[0.2em] text-xs mb-4 uppercase">Entertainment Hub</h2>
            <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Gemu<span class="text-blue-500">Games</span> Library
            </h1>
            <p class="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Koleksi permainan interaktif dan alat bantu tabletop RPG yang dirancang untuk pengalaman bermain yang lebih seru.
            </p>
        </div>

        <!-- Games Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <!-- Game Card: DnD 2014 -->
            <a href="DnD-2014/" class="game-card group rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                <div class="aspect-[16/10] relative overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800" alt="DnD 2014" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent opacity-60"></div>
                    <div class="absolute top-6 left-6 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg">POPULAR</div>
                </div>
                <div class="p-8 flex flex-col flex-1">
                    <div class="flex items-center gap-2 mb-4 text-blue-400">
                        <i data-lucide="shield" class="w-4 h-4"></i>
                        <span class="text-[10px] font-bold tracking-widest uppercase">Tabletop RPG Tool</span>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-3">DnD 2014 Table</h3>
                    <p class="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                        Alat bantu digital untuk kampanye Dungeons & Dragons 2014. Manajemen karakter, inventory, dan tracking stats dalam satu layar.
                    </p>
                    <div class="flex items-center justify-between mt-auto">
                        <span class="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            MULAI BERMAIN <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </span>
                        <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <i data-lucide="play" class="w-4 h-4 fill-current"></i>
                        </div>
                    </div>
                </div>
            </a>

            <!-- Placeholder for Future Games -->
            <div class="game-card rounded-[2.5rem] border-dashed border-slate-800 bg-transparent flex flex-col items-center justify-center p-12 text-center opacity-50">
                <div class="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                    <i data-lucide="plus" class="w-8 h-8 text-slate-700"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-700 mb-2">Coming Soon</h3>
                <p class="text-slate-800 text-xs font-medium uppercase tracking-widest">Stay Tuned for More</p>
            </div>

        </div>

    </main>

    <script src="../data.js?v=<?php echo (int)$gemu_asset_version; ?>"></script>
    <script src="../app.js?v=<?php echo (int)$gemu_asset_version; ?>"></script>
    <script>
        lucide.createIcons();
        // Animation Reveal
        const revealObs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('opacity-100', 'translate-y-0'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-1000');
            revealObs.observe(el);
        });
    </script>
</body>
</html>
