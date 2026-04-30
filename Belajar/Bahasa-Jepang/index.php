<?php
// Wajib di baris pertama untuk mengambil sesi dari login utama
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// Logika Logout opsional jika user menekan tombol logout dari halaman ini
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../Index.php'); // Arahkan kembali ke halaman utama setelah logout
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belajar Bahasa Jepang Mulai dari N5</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <!-- MathJax untuk Render LaTeX Murni -->
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

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
          },
          animation: {
            'float-slow': 'floatSlow 8s ease-in-out infinite',
            'float-medium': 'floatMedium 6s ease-in-out infinite',
            'float-fast': 'floatFast 4s ease-in-out infinite',
            'fall-1': 'fall1 12s linear infinite',
            'fall-2': 'fall2 10s linear infinite',
            'fall-3': 'fall3 14s linear infinite',
            'fall-4': 'fall4 9s linear infinite',
            'fall-5': 'fall5 11s linear infinite',
            'fall-6': 'fall6 13s linear infinite',
            'spin-slow': 'spin 20s linear infinite',
            'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
            'progress-fill': 'progressFill 2s ease-out forwards',
          }
        }
      }
    }
  </script>
    <link rel="stylesheet" href="assets/index.css">

</head>
<body>

  <!-- ========== NAVBAR ========== -->
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="navbar">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center font-jp font-bold text-lg text-white shadow-lg">
          日
        </div>
        <span class="text-xl font-semibold tracking-tight">
          <span class="text-white">Nihongo</span><span class="text-sakura-400">Lab</span>
        </span>
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#fitur" class="text-sm text-neutral-400 hover:text-white transition-colors">Fitur</a>
        <a href="#materi" class="text-sm text-neutral-400 hover:text-white transition-colors">Materi</a>
        <a href="#misi-harian" class="text-sm text-neutral-400 hover:text-white transition-colors">Misi</a>
        <a href="#progress" class="text-sm text-neutral-400 hover:text-white transition-colors">Progress</a>
      </div>
      <div class="flex items-center gap-3">
        <!-- INTEGRASI PHP: Menampilkan Profil / Logout jika ada Session, atau Tombol Login jika belum -->
        <?php if (!empty($_SESSION['user_name'])): ?>
            <div class="hidden sm:flex items-center gap-3 text-sm text-white font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-sakura-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white">
                   <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
                </div>
                Hai, <?php echo htmlspecialchars($_SESSION['user_name']); ?>
            </div>
            <a href="?logout=1" class="btn-secondary text-sm font-semibold text-white px-5 py-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500/80 hover:bg-rose-500/20 hidden sm:block">
                Keluar
            </a>
        <?php else: ?>
            <button class="hidden sm:flex items-center gap-2 text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
            <i data-lucide="user" class="w-4 h-4"></i>
            Masuk
            </button>
            <button class="btn-primary text-sm font-semibold text-white px-5 py-2.5 rounded-xl hidden sm:block">
            Daftar Gratis
            </button>
        <?php endif; ?>

        <button class="md:hidden text-neutral-400 hover:text-white p-2" id="mobileMenuBtn">
          <i data-lucide="menu" class="w-6 h-6"></i>
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu -->
  <div class="fixed inset-0 z-40 bg-dark-900/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-300 opacity-0 pointer-events-none" id="mobileMenu">
    <button class="absolute top-6 right-6 text-neutral-400 hover:text-white" id="mobileMenuClose">
      <i data-lucide="x" class="w-6 h-6"></i>
    </button>

    <?php if (!empty($_SESSION['user_name'])): ?>
        <div class="text-center mb-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-sakura-400 to-orange-400 flex items-center justify-center text-2xl font-bold text-white mb-2">
                <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
            </div>
            <p class="text-xl font-semibold text-white"><?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
        </div>
    <?php endif; ?>

    <a href="#fitur" class="text-2xl font-semibold text-neutral-300 hover:text-white transition-colors mobile-link">Fitur</a>
    <a href="#materi" class="text-2xl font-semibold text-neutral-300 hover:text-white transition-colors mobile-link">Materi</a>
    <a href="#misi-harian" class="text-2xl font-semibold text-neutral-300 hover:text-white transition-colors mobile-link">Misi Harian</a>
    <a href="#progress" class="text-2xl font-semibold text-neutral-300 hover:text-white transition-colors mobile-link">Progress</a>
    
    <?php if (!empty($_SESSION['user_name'])): ?>
        <a href="?logout=1" class="btn-secondary text-lg font-semibold text-rose-400 hover:text-white px-8 py-3 rounded-xl mt-4 border border-rose-500/30">Keluar</a>
    <?php else: ?>
        <button class="btn-primary text-lg font-semibold text-white px-8 py-3 rounded-xl mt-4">Daftar Gratis</button>
    <?php endif; ?>
  </div>

  <!-- ========== HERO ========== -->
  <section class="hero-bg relative min-h-screen flex items-center overflow-hidden">
    <!-- Sakura petals -->
    <div class="sakura-petal animate-fall-1" style="left:5%; top:0; animation-delay:0s; width:10px; height:10px;"></div>
    <div class="sakura-petal animate-fall-2" style="left:15%; top:0; animation-delay:2s; width:8px; height:8px;"></div>
    <div class="sakura-petal animate-fall-3" style="left:30%; top:0; animation-delay:4s; width:14px; height:14px;"></div>
    <div class="sakura-petal animate-fall-4" style="left:50%; top:0; animation-delay:1s; width:9px; height:9px;"></div>
    <div class="sakura-petal animate-fall-5" style="left:65%; top:0; animation-delay:3s; width:11px; height:11px;"></div>
    <div class="sakura-petal animate-fall-6" style="left:80%; top:0; animation-delay:5s; width:7px; height:7px;"></div>
    <div class="sakura-petal animate-fall-1" style="left:90%; top:0; animation-delay:6s; width:12px; height:12px;"></div>
    <div class="sakura-petal animate-fall-3" style="left:42%; top:0; animation-delay:7s; width:10px; height:10px;"></div>
    <div class="sakura-petal animate-fall-2" style="left:72%; top:0; animation-delay:8s; width:8px; height:8px;"></div>
    <div class="sakura-petal animate-fall-5" style="left:25%; top:0; animation-delay:9s; width:13px; height:13px;"></div>

    <!-- Decorative blurred orbs -->
    <div class="absolute top-20 right-1/4 w-96 h-96 bg-sakura-400/10 rounded-full blur-[120px] animate-float-slow"></div>
    <div class="absolute bottom-20 left-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-[100px] animate-float-medium"></div>

    <!-- Torii gate decoration -->
    <div class="torii-gate font-jp select-none" aria-hidden="true">⛩</div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-20 w-full">
      <div class="grid lg:grid-cols-12 gap-12 items-center">
        <!-- Left content -->
        <div class="lg:col-span-7 space-y-8">
          <div class="reveal">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sakura-400/10 border border-sakura-400/20 text-sakura-300 text-sm font-medium">
              <span class="w-2 h-2 rounded-full bg-sakura-400 animate-pulse"></span>
              JLPT N5 · Level Pemula
            </div>
          </div>

          <h1 class="reveal text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.9] tracking-tight" style="transition-delay: 100ms">
            <span class="text-white">Belajar</span><br>
            <span class="bg-gradient-to-r from-sakura-300 via-sakura-400 to-orange-400 bg-clip-text text-transparent">Bahasa Jepang</span><br>
            <span class="text-white/90">Mulai dari</span>
            <span class="relative inline-block">
              <span class="text-white font-jp text-6xl md:text-8xl lg:text-9xl">N5</span>
              <span class="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-sakura-400 to-orange-400 rounded-full"></span>
            </span>
          </h1>

          <p class="reveal text-lg md:text-xl text-neutral-400 max-w-lg leading-relaxed" style="transition-delay: 200ms">
            Kuasai dasar bahasa Jepang dengan metode belajar terstruktur. Dari <span class="text-sakura-300">Hiragana</span>, <span class="text-sakura-300">Katakana</span>, hingga <span class="text-sakura-300">Kanji</span> dasar — semua dalam satu platform.
          </p>

          <div class="reveal flex flex-wrap gap-4" style="transition-delay: 300ms">
            <button class="btn-primary text-lg font-semibold text-white px-8 py-4 rounded-2xl flex items-center gap-3" id="mulaiBelajarBtn">
              <i data-lucide="play" class="w-5 h-5"></i>
              Mulai Belajar
              <i data-lucide="arrow-right" class="w-5 h-5"></i>
            </button>
            <button class="btn-secondary text-lg font-medium text-white px-8 py-4 rounded-2xl flex items-center gap-3" id="cekLevelBtn">
              <i data-lucide="clipboard-check" class="w-5 h-5"></i>
              Cek Level
            </button>
          </div>

          <div class="reveal flex items-center gap-8 pt-4" style="transition-delay: 400ms">
            <div class="flex items-center gap-2">
              <div class="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=11" class="w-8 h-8 rounded-full border-2 border-dark-900" alt="">
                <img src="https://i.pravatar.cc/100?img=32" class="w-8 h-8 rounded-full border-2 border-dark-900" alt="">
                <img src="https://i.pravatar.cc/100?img=47" class="w-8 h-8 rounded-full border-2 border-dark-900" alt="">
                <img src="https://i.pravatar.cc/100?img=23" class="w-8 h-8 rounded-full border-2 border-dark-900" alt="">
              </div>
              <span class="text-sm text-neutral-400"><span class="text-white font-semibold">2,400+</span> pelajar</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="flex gap-0.5">
                <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
                <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
                <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
                <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
                <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
              </div>
              <span class="text-sm text-neutral-400">4.9/5</span>
            </div>
          </div>
        </div>

        <!-- Right: Progress Card -->
        <div class="lg:col-span-5 reveal" style="transition-delay: 300ms">
          <div class="relative">
            <!-- Glow -->
            <div class="absolute -inset-4 bg-gradient-to-b from-sakura-400/20 via-orange-500/10 to-transparent rounded-[3rem] blur-2xl"></div>

            <div class="relative glass-card rounded-3xl p-8 space-y-6 animate-float-slow">
              <!-- Header -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-neutral-400 mb-1">Progress Belajar</p>
                  <h3 class="text-2xl font-semibold font-jp">日本語 N5</h3>
                </div>
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sakura-400/20 to-sakura-600/20 flex items-center justify-center border border-sakura-400/20">
                  <span class="text-2xl font-jp">🀄</span>
                </div>
              </div>

              <!-- Circular Progress -->
              <div class="flex items-center justify-center py-4">
                <div class="relative w-44 h-44">
                  <svg class="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="url(#progressGrad)" stroke-width="10"
                      stroke-linecap="round" stroke-dasharray="440" stroke-dashoffset="154"
                      class="progress-circle transition-all duration-1000" id="progressCircle"/>
                    <defs>
                      <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#F472B6"/>
                        <stop offset="100%" stop-color="#F74E09"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-4xl font-bold text-white" id="progressNumber">0</span>
                    <span class="text-sm text-neutral-400">% Selesai</span>
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p class="text-lg font-semibold text-sakura-300 font-jp">46</p>
                  <p class="text-xs text-neutral-500">Hiragana</p>
                </div>
                <div class="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p class="text-lg font-semibold text-sakura-300 font-jp">46</p>
                  <p class="text-xs text-neutral-500">Katakana</p>
                </div>
                <div class="bg-white/[0.04] rounded-xl p-3 text-center">
                  <p class="text-lg font-semibold text-sakura-300 font-jp">100</p>
                  <p class="text-xs text-neutral-500">Kanji</p>
                </div>
              </div>

              <!-- CTA -->
              <div class="pt-2">
                <button class="w-full py-3.5 rounded-xl bg-gradient-to-r from-sakura-500 to-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sakura-500/20 transition-all hover:-translate-y-0.5" id="sertifikatBtn">
                  <i data-lucide="award" class="w-4 h-4"></i>
                  Dapatkan Sertifikat N5
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom gradient fade -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent"></div>
  </section>

  <!-- ========== FEATURES ========== -->
  <section class="relative py-24 px-6 lg:px-12" id="fitur">
    <div class="max-w-7xl mx-auto">
      <!-- Section header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-6">
          <i data-lucide="sparkles" class="w-4 h-4 text-sakura-400"></i>
          Kenapa Memilih Kami
        </div>
        <h2 class="reveal text-4xl md:text-5xl font-semibold tracking-tight mb-4" style="transition-delay:100ms">
          Cara Belajar yang
          <span class="bg-gradient-to-r from-sakura-300 to-orange-400 bg-clip-text text-transparent">Efektif</span>
        </h2>
        <p class="reveal text-lg text-neutral-400" style="transition-delay:200ms">
          Empat pilar utama yang memastikan perjalanan belajar bahasa Jepangmu berjalan lancar
        </p>
      </div>

      <!-- Feature cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card 1 -->
        <div class="reveal card-hover glass-card rounded-3xl p-8 group" style="transition-delay:100ms">
          <div class="feature-icon-wrap w-14 h-14 rounded-2xl bg-sakura-400/10 flex items-center justify-center mb-6 border border-sakura-400/20" style="perspective:800px">
            <i data-lucide="book-open" class="w-6 h-6 text-sakura-400"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3">Materi Terstruktur</h3>
          <p class="text-neutral-400 text-sm leading-relaxed">
            Kurikulum N5 yang disusun sistematis dari dasar hingga mahir, mengikuti standar JLPT resmi.
          </p>
          <div class="mt-6 flex items-center gap-2 text-sakura-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Pelajari <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="reveal card-hover glass-card rounded-3xl p-8 group" style="transition-delay:200ms">
          <div class="feature-icon-wrap w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20" style="perspective:800px">
            <i data-lucide="gamepad-2" class="w-6 h-6 text-orange-400"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3">Latihan Interaktif</h3>
          <p class="text-neutral-400 text-sm leading-relaxed">
            Quiz, flashcard, dan drag-and-drop exercise yang membuat belajar terasa menyenangkan.
          </p>
          <div class="mt-6 flex items-center gap-2 text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Coba sekarang <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>
        </div>

        <!-- Card 3 -->
        <div class="reveal card-hover glass-card rounded-3xl p-8 group" style="transition-delay:300ms">
          <div class="feature-icon-wrap w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20" style="perspective:800px">
            <i data-lucide="file-check" class="w-6 h-6 text-blue-400"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3">Simulasi Ujian</h3>
          <p class="text-neutral-400 text-sm leading-relaxed">
            Try out JLPT N5 yang menyerupai ujian asli dengan timer dan scoring otomatis.
          </p>
          <div class="mt-6 flex items-center gap-2 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Mulai simulasi <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>
        </div>

        <!-- Card 4 -->
        <div class="reveal card-hover glass-card rounded-3xl p-8 group" style="transition-delay:400ms">
          <div class="feature-icon-wrap w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20" style="perspective:800px">
            <i data-lucide="trending-up" class="w-6 h-6 text-emerald-400"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3">Lacak Progress</h3>
          <p class="text-neutral-400 text-sm leading-relaxed">
            Dashboard visual yang menunjukkan pencapaianmu secara real-time dan area yang perlu diperbaiki.
          </p>
          <div class="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Lihat progress <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== LEARNING MATERIALS ========== -->
  <section class="relative py-24 px-6 lg:px-12" id="materi">
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-sakura-400/5 rounded-full blur-[150px]"></div>

    <div class="max-w-7xl mx-auto relative">
      <div class="grid lg:grid-cols-12 gap-12 items-start">
        <!-- Left: Title + Image -->
        <div class="lg:col-span-5 space-y-8">
          <div class="reveal">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-6">
              <i data-lucide="library" class="w-4 h-4 text-orange-400"></i>
              Materi Pembelajaran
            </div>
            <h2 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Semua yang Kamu
              <span class="bg-gradient-to-r from-orange-400 to-sakura-400 bg-clip-text text-transparent">Butuhkan</span>
            </h2>
            <p class="text-lg text-neutral-400 leading-relaxed">
              Materi N5 lengkap yang mencakup fondasi bahasa Jepang: dari membaca, menulis, hingga tata bahasa dasar.
            </p>
          </div>

          <div class="reveal rounded-3xl overflow-hidden relative group" style="transition-delay:200ms">
            <img src="https://picsum.photos/seed/japanese-calligraphy/600/400.jpg" alt="Japanese study materials" class="w-full h-64 object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent rounded-3xl"></div>
            <div class="absolute bottom-6 left-6 right-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-sakura-400/20 backdrop-blur-sm flex items-center justify-center">
                  <i data-lucide="headphones" class="w-5 h-5 text-sakura-300"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">Audio Native Speaker</p>
                  <p class="text-xs text-neutral-400">Pelajari pengucapan yang benar</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Category Cards (DIUBAH KE LINK A HREF UNTUK NAVIGASI MATERI) -->
        <div class="lg:col-span-7 space-y-4">
          <!-- Hiragana -->
          <a href="hiragana.php" class="block reveal category-card glass-card rounded-2xl p-5 flex items-center gap-5" style="transition-delay:100ms">
            <div class="cat-icon w-16 h-16 rounded-2xl bg-sakura-400/10 flex items-center justify-center border border-sakura-400/15 transition-all shrink-0">
              <span class="text-2xl font-jp font-semibold text-sakura-300">あ</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold text-white">Hiragana</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-sakura-400/10 text-sakura-300 border border-sakura-400/15">46 Karakter</span>
              </div>
              <p class="text-sm text-neutral-400 truncate">Huruf dasar bahasa Jepang untuk kata-kata asli Jepang</p>
              <div class="mt-2 w-full bg-white/5 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-sakura-400 to-sakura-500 h-1.5 rounded-full" style="width:100%"></div>
              </div>
            </div>
            <div class="cat-arrow opacity-50 transition-all shrink-0">
              <i data-lucide="chevron-right" class="w-5 h-5 text-neutral-500"></i>
            </div>
          </a>

          <!-- Katakana -->
          <a href="katakana.php" class="block reveal category-card glass-card rounded-2xl p-5 flex items-center gap-5" style="transition-delay:200ms">
            <div class="cat-icon w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/15 transition-all shrink-0">
              <span class="text-2xl font-jp font-semibold text-orange-300">ア</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold text-white">Katakana</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/15">46 Karakter</span>
              </div>
              <p class="text-sm text-neutral-400 truncate">Huruf untuk kata serapan dari bahasa asing</p>
              <div class="mt-2 w-full bg-white/5 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full" style="width:80%"></div>
              </div>
            </div>
            <div class="cat-arrow opacity-50 transition-all shrink-0">
              <i data-lucide="chevron-right" class="w-5 h-5 text-neutral-500"></i>
            </div>
          </a>

          <!-- Grammar (Kaiwa) -->
          <a href="kaiwa.php" class="block reveal category-card glass-card rounded-2xl p-5 flex items-center gap-5" style="transition-delay:300ms">
            <div class="cat-icon w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/15 transition-all shrink-0">
              <i data-lucide="puzzle" class="w-6 h-6 text-blue-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold text-white">Kaiwa & Tata Bahasa</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/15">Intensif 2 Hari</span>
              </div>
              <p class="text-sm text-neutral-400 truncate">Latihan percakapan intensif dan pola kalimat fundamental</p>
              <div class="mt-2 w-full bg-white/5 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-blue-400 to-blue-500 h-1.5 rounded-full" style="width:55%"></div>
              </div>
            </div>
            <div class="cat-arrow opacity-50 transition-all shrink-0">
              <i data-lucide="chevron-right" class="w-5 h-5 text-neutral-500"></i>
            </div>
          </a>

          <!-- Kanji -->
          <div class="reveal category-card glass-card rounded-2xl p-5 flex items-center gap-5" style="transition-delay:400ms">
            <div class="cat-icon w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15 transition-all shrink-0">
              <span class="text-2xl font-jp font-semibold text-emerald-300">漢</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold">Kanji Dasar</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/15">100 Karakter</span>
              </div>
              <p class="text-sm text-neutral-400 truncate">Karakter Tionghoa yang digunakan dalam bahasa Jepang sehari-hari</p>
              <div class="mt-2 w-full bg-white/5 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full" style="width:30%"></div>
              </div>
            </div>
            <div class="cat-arrow opacity-50 transition-all shrink-0">
              <i data-lucide="chevron-right" class="w-5 h-5 text-neutral-500"></i>
            </div>
          </div>

          <!-- Vocabulary -->
          <div class="reveal category-card glass-card rounded-2xl p-5 flex items-center gap-5" style="transition-delay:500ms">
            <div class="cat-icon w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/15 transition-all shrink-0">
              <i data-lucide="message-circle" class="w-6 h-6 text-purple-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-lg font-semibold">Kosakata N5</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/15">800+ Kata</span>
              </div>
              <p class="text-sm text-neutral-400 truncate">Kosakata sehari-hari yang wajib dikuasai untuk level N5</p>
              <div class="mt-2 w-full bg-white/5 rounded-full h-1.5">
                <div class="bg-gradient-to-r from-purple-400 to-purple-500 h-1.5 rounded-full" style="width:45%"></div>
              </div>
            </div>
            <div class="cat-arrow opacity-50 transition-all shrink-0">
              <i data-lucide="chevron-right" class="w-5 h-5 text-neutral-500"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== MISI HARIAN (WAJIB KANJI, BUNPOU & LATEX) ========== -->
  <section class="relative py-24 px-6 lg:px-12 bg-dark-800/50 border-y border-white/5" id="misi-harian">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <div class="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sakura-400/10 border border-sakura-400/20 text-sm text-sakura-300 mb-4 font-medium shadow-lg shadow-sakura-500/10">
          <i data-lucide="star" class="w-4 h-4 fill-sakura-400"></i>
          Misi Harian (Daily Challenge)
        </div>
        <h2 class="reveal text-3xl md:text-5xl font-semibold tracking-tight">
          Latihan <span class="bg-gradient-to-r from-sakura-300 to-orange-400 bg-clip-text text-transparent">Analisis Kalimat</span>
        </h2>
        <p class="reveal text-neutral-400 mt-4">Selesaikan tantangan 漢字 (Kanji) dan 文法 (Bunpou) hari ini!</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
          <!-- 1. BEDAH KANJI -->
          <div class="reveal glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden" style="transition-delay:100ms">
              <div class="absolute top-0 right-0 w-32 h-32 bg-sakura-500/10 rounded-full blur-[50px] pointer-events-none"></div>
              <h3 class="text-lg font-semibold text-sakura-300 mb-6 flex items-center gap-2">
                  <i data-lucide="languages" class="w-5 h-5"></i> Bedah Kanji
              </h3>
              <ul class="space-y-4 relative z-10">
                  <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-sakura-400/30 transition-colors">
                      <div class="w-14 h-14 flex-shrink-0 bg-dark-900 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-inner font-jp">私</div>
                      <div>
                          <p class="font-bold text-sakura-300 text-lg">わたし (Watashi)</p>
                          <p class="text-sm text-neutral-400 mt-0.5">Saya. Kata ganti orang pertama (sopan).</p>
                      </div>
                  </li>
                  <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-orange-400/30 transition-colors">
                      <div class="w-14 h-14 flex-shrink-0 bg-dark-900 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-inner font-jp">毎日</div>
                      <div>
                          <p class="font-bold text-orange-300 text-lg">まいにち (Mainichi)</p>
                          <p class="text-sm text-neutral-400 mt-0.5">Setiap hari. (毎: setiap, 日: hari).</p>
                      </div>
                  </li>
                  <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-400/30 transition-colors">
                      <div class="w-14 h-14 flex-shrink-0 bg-dark-900 border-2 border-white/10 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-inner font-jp">日本語</div>
                      <div>
                          <p class="font-bold text-blue-300 text-lg">にほんご (Nihongo)</p>
                          <p class="text-sm text-neutral-400 mt-0.5">Bahasa Jepang. (日本: Jepang, 語: bahasa).</p>
                      </div>
                  </li>
              </ul>
          </div>

          <!-- 2. SOAL LATEX & BUNPOU -->
          <div class="reveal glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col" style="transition-delay:200ms">
              <h3 class="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <i data-lucide="brain-circuit" class="w-5 h-5"></i> Latihan Soal
              </h3>
              <p class="text-sm text-neutral-300 mb-6">Pilih partikel yang tepat untuk melengkapi rumus kalimat di bawah ini:</p>
              
              <!-- Render LaTeX (MathJax) -->
              <div class="bg-dark-900 py-6 px-4 rounded-2xl text-center border border-white/10 shadow-inner mb-8 overflow-x-auto">
                  $$\text{私} \ \text{は} \ \text{毎日} \ \text{日本語} \ \mathbf{[\ ? \ ]} \ \text{勉強します。}$$
                  <p class="text-xs text-neutral-500 mt-3 font-mono">(Watashi wa mainichi nihongo [ ? ] benkyou shimasu.)</p>
              </div>

              <!-- Opsi Jawaban -->
              <div class="grid grid-cols-3 gap-3 mb-4 mt-auto">
                  <button onclick="checkDailyAns('ni', this)" class="btn-secondary py-4 rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:border-sakura-400 transition-all">に</button>
                  <button onclick="checkDailyAns('de', this)" class="btn-secondary py-4 rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:border-sakura-400 transition-all">で</button>
                  <button onclick="checkDailyAns('o', this)" class="btn-secondary py-4 rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:border-sakura-400 transition-all">を</button>
              </div>

              <!-- Area Feedback & Bunpou -->
              <div id="bunpou-box" class="hidden mt-6 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg relative transition-all duration-300">
                  <div id="daily-feedback" class="font-bold mb-3 text-base flex items-center gap-2"></div>
                  <div class="h-px w-full bg-white/10 my-4"></div>
                  <h4 class="font-bold text-sakura-300 text-sm flex items-center gap-2 mb-2">
                      <i data-lucide="info" class="w-4 h-4"></i> Penjelasan 文法 (Bunpou)
                  </h4>
                  <p class="text-sm text-neutral-300 leading-relaxed">
                      Jawaban yang tepat adalah partikel <strong class="text-emerald-400 font-bold text-lg">を (o)</strong>.<br>
                      Partikel <strong>を (o)</strong> digunakan untuk menandai <strong>Objek Langsung</strong> dari kata kerja transitif (aksi). Karena "Nihongo" adalah objek dari pekerjaan "Belajar", maka wajib memakai "o".
                  </p>
                  <div class="mt-4 bg-dark-900 p-3 rounded-xl text-neutral-300 font-mono text-xs border border-white/10 text-center">
                      Rumus: [Objek] + を (o) + [Kata Kerja Transitif]
                  </div>
              </div>
          </div>
      </div>
    </div>
  </section>

  <!-- ========== PROGRESS SECTION ========== -->
  <section class="relative py-24 px-6 lg:px-12" id="progress">
    <div class="max-w-7xl mx-auto">
      <div class="reveal glass-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
        <!-- Background decorations -->
        <div class="absolute top-0 right-0 w-80 h-80 bg-sakura-400/5 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-0 left-0 w-60 h-60 bg-orange-500/5 rounded-full blur-[80px]"></div>

        <div class="relative">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
            <div>
              <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Perjalanan Belajarmu
              </h2>
              <p class="text-neutral-400">Lihat sejauh mana kamu sudah melangkah menuju sertifikat N5</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-neutral-400">Target:</span>
              <span class="px-4 py-2 rounded-xl bg-sakura-400/10 border border-sakura-400/20 text-sakura-300 text-sm font-semibold">
                🎯 Sertifikat JLPT N5
              </span>
            </div>
          </div>

          <!-- Progress steps -->
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div class="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs uppercase tracking-wider text-neutral-500 font-medium">Hiragana</span>
                <span class="text-sm font-semibold text-emerald-400">✓ Selesai</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-2 mb-3">
                <div class="bg-emerald-400 h-2 rounded-full" style="width:100%"></div>
              </div>
              <p class="text-xs text-neutral-500">46/46 karakter dikuasai</p>
            </div>

            <div class="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs uppercase tracking-wider text-neutral-500 font-medium">Katakana</span>
                <span class="text-sm font-semibold text-orange-400">80%</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-2 mb-3">
                <div class="bg-orange-400 h-2 rounded-full" style="width:80%"></div>
              </div>
              <p class="text-xs text-neutral-500">37/46 karakter dikuasai</p>
            </div>

            <div class="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs uppercase tracking-wider text-neutral-500 font-medium">Tata Bahasa</span>
                <span class="text-sm font-semibold text-blue-400">55%</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-2 mb-3">
                <div class="bg-blue-400 h-2 rounded-full" style="width:55%"></div>
              </div>
              <p class="text-xs text-neutral-500">15/28 pola kalimat</p>
            </div>

            <div class="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs uppercase tracking-wider text-neutral-500 font-medium">Kanji</span>
                <span class="text-sm font-semibold text-sakura-400">30%</span>
              </div>
              <div class="w-full bg-white/5 rounded-full h-2 mb-3">
                <div class="bg-sakura-400 h-2 rounded-full" style="width:30%"></div>
              </div>
              <p class="text-xs text-neutral-500">30/100 karakter dikuasai</p>
            </div>
          </div>

          <!-- Motivational CTA -->
          <div class="text-center py-8 border-t border-white/5">
            <div class="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-sakura-400/10 to-orange-500/10 border border-sakura-400/15">
              <span class="text-3xl">🌸</span>
              <div class="text-left">
                <p class="text-sm font-semibold text-white">Kamu sudah 65% lebih dekat ke sertifikat N5!</p>
                <p class="text-xs text-neutral-400">Terus belajar, kamu pasti bisa! 頑張って!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== TESTIMONIALS ========== -->
  <section class="relative py-24 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <div class="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-6">
          <i data-lucide="heart" class="w-4 h-4 text-sakura-400"></i>
          Testimoni Pelajar
        </div>
        <h2 class="reveal text-4xl md:text-5xl font-semibold tracking-tight" style="transition-delay:100ms">
          Apa Kata
          <span class="bg-gradient-to-r from-sakura-300 to-orange-400 bg-clip-text text-transparent">Mereka</span>
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="reveal card-hover glass-card rounded-3xl p-8" style="transition-delay:100ms">
          <div class="flex gap-1 mb-4">
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
          </div>
          <p class="text-neutral-300 text-sm leading-relaxed mb-6">"Awalnya takut belajar Kanji, tapi di sini cara mengajarkannya sangat mudah dipahami. 3 bulan sudah lulus N5!"</p>
          <div class="flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=44" class="w-10 h-10 rounded-full" alt="">
            <div>
              <p class="text-sm font-semibold">Rina Saputri</p>
              <p class="text-xs text-neutral-500">Mahasiswa, Jakarta</p>
            </div>
          </div>
        </div>

        <div class="reveal card-hover glass-card rounded-3xl p-8" style="transition-delay:200ms">
          <div class="flex gap-1 mb-4">
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
          </div>
          <p class="text-neutral-300 text-sm leading-relaxed mb-6">"Fitur simulasi ujiannya sangat membantu! Saya bisa merasakan suasana ujian JLPT sebelum hari-H. Lulus dengan skor 145!"</p>
          <div class="flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=12" class="w-10 h-10 rounded-full" alt="">
            <div>
              <p class="text-sm font-semibold">Budi Hartono</p>
              <p class="text-xs text-neutral-500">Karyawan, Bandung</p>
            </div>
          </div>
        </div>

        <div class="reveal card-hover glass-card rounded-3xl p-8" style="transition-delay:300ms">
          <div class="flex gap-1 mb-4">
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
            <i data-lucide="star" class="w-4 h-4 fill-yellow-400 text-yellow-400"></i>
          </div>
          <p class="text-neutral-300 text-sm leading-relaxed mb-6">"Suka banget sama flashcard interaktifnya. Belajar sambil main jadi lebih seru. Progress tracking-nya juga memotivasi!"</p>
          <div class="flex items-center gap-3">
            <img src="https://i.pravatar.cc/100?img=26" class="w-10 h-10 rounded-full" alt="">
            <div>
              <p class="text-sm font-semibold">Dian Ayu</p>
              <p class="text-xs text-neutral-500">Freelancer, Surabaya</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== CTA SECTION ========== -->
  <section class="relative py-24 px-6 lg:px-12">
    <div class="max-w-4xl mx-auto">
      <div class="reveal relative rounded-[2.5rem] overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0 bg-gradient-to-br from-sakura-600/20 via-dark-700 to-orange-600/20"></div>
        <div class="absolute inset-0 bg-[url('https://picsum.photos/seed/sakura-tree/1200/600.jpg')] bg-cover bg-center opacity-15"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-dark-900/70"></div>

        <div class="relative text-center py-16 md:py-20 px-8">
          <div class="text-6xl mb-6 font-jp">🏠 日本 🗻</div>
          <h2 class="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
            Siap Memulai Perjalanan
            <span class="bg-gradient-to-r from-sakura-300 to-orange-400 bg-clip-text text-transparent">Jepangmu</span>?
          </h2>
          <p class="text-lg text-neutral-400 max-w-lg mx-auto mb-8">
            Bergabung dengan 2,400+ pelajar lainnya. Daftar gratis dan mulai belajar N5 sekarang.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <button class="btn-primary text-lg font-semibold text-white px-10 py-4 rounded-2xl flex items-center gap-3" id="ctaBelajarBtn">
              <i data-lucide="rocket" class="w-5 h-5"></i>
              Mulai Gratis Sekarang
            </button>
            <button class="btn-secondary text-lg font-medium text-white px-10 py-4 rounded-2xl flex items-center gap-3">
              <i data-lucide="play-circle" class="w-5 h-5"></i>
              Lihat Demo
            </button>
          </div>
          <p class="text-xs text-neutral-500 mt-6">Tidak perlu kartu kredit · Akses gratis selamanya untuk materi dasar</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== FOOTER ========== -->
  <footer class="relative border-t border-white/5 py-16 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-4 gap-12 mb-12">
        <div class="md:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center font-jp font-bold text-lg text-white">
              日
            </div>
            <span class="text-xl font-semibold">
              <span class="text-white">Nihongo</span><span class="text-sakura-400">Lab</span>
            </span>
          </div>
          <p class="text-sm text-neutral-500 leading-relaxed">Platform belajar bahasa Jepang terstruktur dari N5 hingga N1.</p>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Materi</h4>
          <ul class="space-y-2.5">
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Hiragana</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Katakana</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Kanji N5</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Tata Bahasa</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Kosakata</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Fitur</h4>
          <ul class="space-y-2.5">
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Flashcard</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Simulasi JLPT</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Audio Pelajaran</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Lainnya</h4>
          <ul class="space-y-2.5">
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Tentang Kami</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Blog</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">FAQ</a></li>
            <li><a href="#" class="text-sm text-neutral-500 hover:text-sakura-400 transition-colors">Kontak</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-neutral-600">© 2025 NihongoLab. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-neutral-600 hover:text-sakura-400 transition-colors"><i data-lucide="twitter" class="w-4 h-4"></i></a>
          <a href="#" class="text-neutral-600 hover:text-sakura-400 transition-colors"><i data-lucide="instagram" class="w-4 h-4"></i></a>
          <a href="#" class="text-neutral-600 hover:text-sakura-400 transition-colors"><i data-lucide="youtube" class="w-4 h-4"></i></a>
          <a href="#" class="text-neutral-600 hover:text-sakura-400 transition-colors"><i data-lucide="github" class="w-4 h-4"></i></a>
        </div>
      </div>
    </div>
  </footer>

  <!-- ========== TOAST ========== -->
  <div class="fixed bottom-6 right-6 z-50" id="toastContainer">
    <div class="toast glass-card rounded-2xl p-4 flex items-center gap-3 max-w-sm" id="toast">
      <div class="w-10 h-10 rounded-xl bg-sakura-400/15 flex items-center justify-center shrink-0">
        <i data-lucide="check-circle" class="w-5 h-5 text-sakura-400" id="toastIcon"></i>
      </div>
      <div>
        <p class="text-sm font-semibold text-white" id="toastTitle">Berhasil!</p>
        <p class="text-xs text-neutral-400" id="toastMsg">Aksi berhasil dilakukan.</p>
      </div>
      <button class="text-neutral-500 hover:text-white shrink-0" onclick="hideToast()">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>
  </div>

  <!-- ========== LEVEL CHECK MODAL ========== -->
  <div class="level-modal-overlay fixed inset-0 z-50 flex items-center justify-center px-6" id="levelModal">
    <div class="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onclick="closeLevelModal()"></div>
    <div class="modal-box relative glass-card rounded-3xl p-8 max-w-md w-full">
      <button class="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors" onclick="closeLevelModal()">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-sakura-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4 border border-sakura-400/20">
          <span class="text-3xl font-jp">📝</span>
        </div>
        <h3 class="text-2xl font-semibold mb-2">Cek Level Bahasa Jepangmu</h3>
        <p class="text-sm text-neutral-400">Jawab 5 pertanyaan singkat untuk mengetahui levelmu</p>
      </div>

      <div id="quizContent">
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-neutral-500">Pertanyaan <span id="qNum">1</span>/5</span>
            <span class="text-xs text-sakura-400 font-medium" id="qProgress">20%</span>
          </div>
          <div class="w-full bg-white/5 rounded-full h-1.5">
            <div class="bg-gradient-to-r from-sakura-400 to-orange-400 h-1.5 rounded-full transition-all duration-500" id="qBar" style="width:20%"></div>
          </div>
        </div>

        <p class="text-lg font-medium mb-6" id="questionText">Apa arti dari 「おはようございます」?</p>

        <div class="space-y-3" id="optionsContainer">
          <button class="quiz-option w-full text-left px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:bg-white/[0.08] hover:border-sakura-400/30 transition-all" onclick="selectAnswer(this, 0)">
            Selamat malam
          </button>
          <button class="quiz-option w-full text-left px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:bg-white/[0.08] hover:border-sakura-400/30 transition-all" onclick="selectAnswer(this, 1)">
            Selamat pagi
          </button>
          <button class="quiz-option w-full text-left px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:bg-white/[0.08] hover:border-sakura-400/30 transition-all" onclick="selectAnswer(this, 2)">
            Selamat siang
          </button>
          <button class="quiz-option w-full text-left px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:bg-white/[0.08] hover:border-sakura-400/30 transition-all" onclick="selectAnswer(this, 3)">
            Sampai jumpa
          </button>
        </div>
      </div>

      <div id="quizResult" class="hidden text-center">
        <div class="text-6xl mb-4" id="resultEmoji">🎉</div>
        <h4 class="text-xl font-semibold mb-2" id="resultTitle">Level: N5 Pemula</h4>
        <p class="text-sm text-neutral-400 mb-6" id="resultDesc">Kamu cocok memulai dari N5. Ayo mulai belajar!</p>
        <button class="btn-primary w-full py-3 rounded-xl text-white font-semibold text-sm" onclick="closeLevelModal(); document.getElementById('mulaiBelajarBtn').click();">
          Mulai Belajar N5
        </button>
      </div>
    </div>
  </div>

    <script src="assets/index.js"></script>


</body>
</html>
