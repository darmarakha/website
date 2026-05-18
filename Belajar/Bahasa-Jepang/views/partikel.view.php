<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Materi Partikel (Joshi) - GemuYokai Nihongo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            orange: { 450: '#FF5A1F', 500: '#F74E09', 600: '#D93D00' },
            sakura: { 300: '#F9A8D4', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777' },
            dark: { 900: '#0a0a0a', 800: '#111111', 700: '#1a1a1a', 600: '#242424', 500: '#2e2e2e' }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            jp: ['Noto Sans JP', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { background: #0a0a0a; color: #ffffff; overflow-x: hidden; scroll-behavior: smooth; }
    .glass-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .btn-primary {
      background: linear-gradient(135deg, #F74E09, #D93D00);
      transition: all 0.3s ease;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(247,78,9,0.4); }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      transition: all 0.3s ease;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.12); border-color: rgba(244,114,182,0.5); }
    .partikel-card { transition: all 0.3s ease; }
    .partikel-card:hover { transform: translateY(-4px); border-color: rgba(244,114,182,0.4); background: rgba(255,255,255,0.06); }
  </style>
</head>
<body class="antialiased">

  <!-- NAVBAR -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/10">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
      <a href="index.php" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center font-jp font-bold text-lg text-white">日</div>
        <span class="text-xl font-semibold"><span class="text-white">Nihongo</span><span class="text-sakura-400">Lab</span></span>
      </a>
      <div class="flex gap-4">
        <a href="index.php" class="btn-secondary text-sm font-semibold text-white px-5 py-2.5 rounded-xl">Kembali</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <header class="pt-32 pb-16 px-6 lg:px-12 relative overflow-hidden">
    <div class="absolute top-20 right-1/4 w-96 h-96 bg-sakura-400/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-10 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="max-w-7xl mx-auto text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sakura-400/10 border border-sakura-400/20 text-sakura-300 text-sm font-medium mb-6">
        JLPT N5-N4 · Tata Bahasa
      </div>
      <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        <span class="font-jp text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-sakura-400 to-orange-400 block mb-2">助</span>
        Partikel Jepang
      </h1>
      <p class="text-neutral-400 text-lg max-w-2xl mx-auto">Dari pola dasar sampai nuansa mahir. Pahami fungsi setiap partikel untuk merangkai kalimat yang natural.</p>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 lg:px-12 pb-24 space-y-24 relative z-10">

    <!-- PROGRESS MINI -->
    <section class="glass-card rounded-3xl p-8 border border-white/10">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div>
                <h2 class="text-2xl font-bold">Progress Partikel</h2>
                <p class="text-sm text-neutral-400">Particle Dojo - Kuasai perlahan</p>
            </div>
            <div class="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-sm flex items-center gap-2">
                <i data-lucide="award" class="w-4 h-4"></i> Badge: Starter
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white/5 p-4 rounded-2xl">
                <div class="text-xs text-neutral-500 uppercase font-bold mb-2">N5 Dasar</div>
                <div class="text-xl font-bold text-sakura-400 mb-2">0%</div>
                <div class="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden"><div class="h-full bg-sakura-400 w-0 transition-all"></div></div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl">
                <div class="text-xs text-neutral-500 uppercase font-bold mb-2">Kontras Mirip</div>
                <div class="text-xl font-bold text-orange-400 mb-2">0%</div>
                <div class="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden"><div class="h-full bg-orange-400 w-0 transition-all"></div></div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl opacity-50 grayscale cursor-not-allowed">
                <div class="text-xs text-neutral-500 uppercase font-bold mb-2">Praktis N4</div>
                <div class="text-xl font-bold text-white mb-2">Terkunci</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl opacity-50 grayscale cursor-not-allowed">
                <div class="text-xs text-neutral-500 uppercase font-bold mb-2">Mahir N3+</div>
                <div class="text-xl font-bold text-white mb-2">Terkunci</div>
            </div>
        </div>
    </section>

    <!-- APA ITU PARTIKEL -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="info" class="w-6 h-6 text-sakura-400"></i>
        <h2 class="text-2xl font-bold">Apa itu Partikel?</h2>
      </div>
      <div class="glass-card rounded-2xl p-8">
        <p class="text-neutral-300 leading-relaxed mb-6 text-lg">
          Partikel (助詞 - joshi) adalah penanda kecil dalam bahasa Jepang yang biasanya diletakkan <strong>setelah kata</strong>. Tugasnya adalah menunjukkan fungsi kata tersebut dalam kalimat: apakah sebagai topik, subjek, objek, tempat, atau arah.
        </p>
        <div class="bg-dark-900 border border-white/10 p-6 rounded-xl">
            <p class="font-jp text-2xl mb-2">わたし <span class="text-sakura-400 font-bold">は</span> がくせい です。</p>
            <p class="text-neutral-400 text-sm mb-4">Watashi <span class="text-sakura-400 font-bold">wa</span> gakusei desu. (Saya adalah pelajar.)</p>
            <p class="text-sm"><span class="bg-sakura-400/20 text-sakura-300 px-2 py-1 rounded">は</span> menunjukkan topik: "kalau tentang saya..."</p>
        </div>
        <div class="mt-6 flex flex-wrap gap-4 text-sm">
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-2 rounded-lg">⚠️ は dibaca "wa", bukan "ha"</div>
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-2 rounded-lg">⚠️ へ dibaca "e", bukan "he"</div>
            <div class="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-2 rounded-lg">⚠️ を dibaca "o", walau ditulis "wo"</div>
        </div>
      </div>
    </section>

    <!-- PARTIKEL DASAR N5 -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="grid" class="w-6 h-6 text-orange-400"></i>
        <h2 class="text-2xl font-bold">Partikel Dasar N5</h2>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- WA -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">は</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-sakura-400">は</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">wa</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Penanda Topik</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Menunjukkan apa yang sedang dibicarakan ("Kalau tentang...").</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">これ<strong class="text-sakura-400">は</strong>本です。</span><br>
                <span class="text-neutral-500 text-xs">Ini adalah buku.</span>
            </div>
        </div>

        <!-- GA -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">が</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-orange-400">が</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">ga</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Subjek / Penekanan</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Menunjukkan siapa/apa yang melakukan aksi. Menekankan subjek.</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">猫<strong class="text-orange-400">が</strong>います。</span><br>
                <span class="text-neutral-500 text-xs">Ada kucing.</span>
            </div>
        </div>

        <!-- O -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">を</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-blue-400">を</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">o</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Objek Langsung</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Menandai benda yang dikenai tindakan / kata kerja transitif.</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">水<strong class="text-blue-400">を</strong>飲みます。</span><br>
                <span class="text-neutral-500 text-xs">Minum air.</span>
            </div>
        </div>

        <!-- NI -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">に</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-emerald-400">に</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">ni</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Waktu / Tujuan / Titik</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Menunjukkan waktu spesifik, lokasi keberadaan, atau target akhir.</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">日本<strong class="text-emerald-400">に</strong>行きます。</span><br>
                <span class="text-neutral-500 text-xs">Pergi ke Jepang.</span>
            </div>
        </div>

        <!-- DE -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">で</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-purple-400">で</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">de</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Tempat Aksi / Alat</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Lokasi terjadinya aktivitas, atau alat/cara yang digunakan.</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">学校<strong class="text-purple-400">で</strong>勉強します。</span><br>
                <span class="text-neutral-500 text-xs">Belajar di sekolah.</span>
            </div>
        </div>

        <!-- NO -->
        <div class="glass-card partikel-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
            <div class="absolute -right-4 -top-4 text-8xl font-jp opacity-[0.03] group-hover:opacity-10 transition-opacity">の</div>
            <div class="flex justify-between items-start mb-4">
                <div class="font-jp text-4xl font-bold text-yellow-400">の</div>
                <span class="text-xs bg-white/5 px-2 py-1 rounded text-neutral-400">no</span>
            </div>
            <h3 class="font-bold text-lg mb-2">Kepemilikan / Modifikasi</h3>
            <p class="text-sm text-neutral-400 mb-4 line-clamp-2">Menghubungkan dua kata benda. Sering diartikan "milik".</p>
            <div class="bg-dark-900 rounded-lg p-3 text-sm border border-white/5">
                <span class="font-jp">私<strong class="text-yellow-400">の</strong>本です。</span><br>
                <span class="text-neutral-500 text-xs">Buku (milik) saya.</span>
            </div>
        </div>
      </div>
    </section>

    <!-- PARTIKEL YANG SERING TERTUKAR -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="arrow-left-right" class="w-6 h-6 text-sakura-400"></i>
        <h2 class="text-2xl font-bold">Partikel yang Sering Tertukar</h2>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
          <!-- HA vs GA -->
          <div class="glass-card rounded-2xl p-6 border-l-4 border-l-sakura-400">
              <h3 class="text-xl font-bold mb-4 font-jp flex items-center gap-3">
                  <span class="bg-white/10 px-3 py-1 rounded text-sakura-400">は</span> vs <span class="bg-white/10 px-3 py-1 rounded text-orange-400">が</span>
              </h3>
              <div class="space-y-4">
                  <div class="bg-dark-900 p-4 rounded-xl border border-white/5">
                      <p class="font-jp text-lg mb-1">私<strong class="text-sakura-400">は</strong>ダルマです。</p>
                      <p class="text-sm text-neutral-400">Topik: "Kalau tentang saya, saya Darma." Fokus pada informasi yang mengikuti (Darma).</p>
                  </div>
                  <div class="bg-dark-900 p-4 rounded-xl border border-white/5">
                      <p class="font-jp text-lg mb-1">私<strong class="text-orange-400">が</strong>ダルマです。</p>
                      <p class="text-sm text-neutral-400">Subjek/Identifikasi: "Sayalah Darma (bukan orang lain)." Fokus pada siapa pelakunya.</p>
                  </div>
              </div>
          </div>

          <!-- NI vs DE -->
          <div class="glass-card rounded-2xl p-6 border-l-4 border-l-purple-400">
              <h3 class="text-xl font-bold mb-4 font-jp flex items-center gap-3">
                  <span class="bg-white/10 px-3 py-1 rounded text-emerald-400">に</span> vs <span class="bg-white/10 px-3 py-1 rounded text-purple-400">で</span>
              </h3>
              <div class="space-y-4">
                  <div class="bg-dark-900 p-4 rounded-xl border border-white/5">
                      <p class="font-jp text-lg mb-1">学校<strong class="text-emerald-400">に</strong>います。</p>
                      <p class="text-sm text-neutral-400">Keberadaan: "Saya berada di sekolah." Menggunakan kata kerja statis (います, あります).</p>
                  </div>
                  <div class="bg-dark-900 p-4 rounded-xl border border-white/5">
                      <p class="font-jp text-lg mb-1">学校<strong class="text-purple-400">で</strong>勉強します。</p>
                      <p class="text-sm text-neutral-400">Tempat Aksi: "Saya belajar di sekolah." Ada aktivitas dinamis yang terjadi di lokasi.</p>
                  </div>
              </div>
          </div>
      </div>
    </section>

    <!-- LATIHAN INTERAKTIF -->
    <section id="latihan" class="relative">
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="brain-circuit" class="w-6 h-6 text-orange-400"></i>
        <h2 class="text-2xl font-bold">Latihan Interaktif: Analisis Kalimat</h2>
      </div>

      <div class="glass-card rounded-[2rem] p-8 border border-white/10 shadow-2xl">
          <p class="text-neutral-300 mb-8">Pilih partikel yang tepat untuk melengkapi kalimat di bawah ini.</p>

          <div id="quiz-container" class="space-y-8">
              <!-- Quiz 1 -->
              <div class="quiz-item" data-answered="false">
                  <div class="bg-dark-900 py-6 px-4 rounded-2xl text-center border border-white/10 mb-6 text-2xl font-jp">
                      わたし <span class="inline-block w-12 border-b-2 border-white/30 mx-2 quiz-blank"></span> ほん <span class="inline-block w-12 border-b-2 border-white/30 mx-2 quiz-blank"></span> よみます。
                      <div class="text-sm text-neutral-500 mt-3 font-sans">(Watashi ___ hon ___ yomimasu.) "Saya membaca buku."</div>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 options">
                      <button class="btn-secondary py-3 rounded-xl font-bold text-lg" onclick="checkAnswer(this, 1, false)">が ・ に</button>
                      <button class="btn-secondary py-3 rounded-xl font-bold text-lg" onclick="checkAnswer(this, 1, true)">は ・ を</button>
                      <button class="btn-secondary py-3 rounded-xl font-bold text-lg" onclick="checkAnswer(this, 1, false)">で ・ を</button>
                      <button class="btn-secondary py-3 rounded-xl font-bold text-lg" onclick="checkAnswer(this, 1, false)">の ・ が</button>
                  </div>
                  <div class="explanation hidden mt-6 bg-white/5 p-5 rounded-xl border border-white/10">
                      <h4 class="font-bold text-sakura-300 mb-2">Penjelasan:</h4>
                      <p class="text-sm text-neutral-300"><strong class="text-sakura-400">は</strong> menandai "Saya" sebagai topik. <strong class="text-blue-400">を</strong> menandai "buku" sebagai objek langsung dari aksi "membaca".</p>
                  </div>
              </div>
          </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="border-t border-white/5 py-8 text-center text-sm text-neutral-500">
    <p>© 2026 NihongoLab. GemuYokai.</p>
  </footer>

  <script>
    lucide.createIcons();

    function checkAnswer(btn, quizId, isCorrect) {
        const parent = btn.closest('.quiz-item');
        if(parent.dataset.answered === 'true') return;

        parent.dataset.answered = 'true';
        const buttons = parent.querySelectorAll('button');
        buttons.forEach(b => { b.disabled = true; b.classList.add('opacity-50', 'cursor-not-allowed'); });

        if (isCorrect) {
            btn.classList.remove('btn-secondary', 'opacity-50');
            btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400', 'opacity-100');
        } else {
            btn.classList.remove('btn-secondary', 'opacity-50');
            btn.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-400', 'opacity-100');

            // Highlight correct answer
            const correctBtn = Array.from(buttons).find(b => b.getAttribute('onclick').includes('true'));
            if(correctBtn) {
                correctBtn.classList.remove('btn-secondary', 'opacity-50');
                correctBtn.classList.add('bg-emerald-500/10', 'border-emerald-500/50', 'text-emerald-400', 'opacity-100');
            }
        }

        parent.querySelector('.explanation').classList.remove('hidden');
    }
  </script>
</body>
</html>
