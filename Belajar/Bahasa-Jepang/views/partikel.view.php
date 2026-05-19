<?php
// View template for Partikel Module.
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belajar Partikel Jepang N5</title>
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
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/partikel.css">
</head>
<body class="bg-dark-900 text-white overflow-x-hidden font-sans">

  <!-- ========== NAVBAR ========== -->
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-dark-900/80 backdrop-blur-md border-b border-white/5" id="navbar">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
      <a href="index.php" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-jp font-bold text-lg text-white shadow-lg">
          助
        </div>
        <span class="text-xl font-semibold tracking-tight">
          <span class="text-white">Partikel</span><span class="text-purple-400">Dojo</span>
        </span>
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="index.php" class="text-sm font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          Kembali ke Nihongo Lab
        </a>
      </div>
      <div class="flex items-center gap-3">
        <?php if (!empty($_SESSION['user_name'])): ?>
            <div class="hidden sm:flex items-center gap-3 text-sm text-white font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-400 to-orange-400 flex items-center justify-center text-xs font-bold text-white">
                   <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
                </div>
                Hai, <?php echo htmlspecialchars($_SESSION['user_name']); ?>
            </div>
        <?php else: ?>
            <a href="../Index.php" class="hidden sm:flex items-center gap-2 text-sm text-neutral-300 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <i data-lucide="user" class="w-4 h-4"></i>
                Masuk
            </a>
        <?php endif; ?>
      </div>
    </div>
  </nav>

  <!-- ========== HERO SECTION ========== -->
  <section class="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="max-w-7xl mx-auto relative z-10 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold mb-6">
        <i data-lucide="book-open" class="w-4 h-4"></i> JLPT N5 · Pemula
      </div>
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
        Kuasai <span class="bg-gradient-to-r from-purple-400 to-sakura-400 bg-clip-text text-transparent">Partikel</span> Jepang
      </h1>
      <p class="text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Partikel adalah perekat dalam kalimat bahasa Jepang. Pelajari fungsi は, が, を, に, で, dan lainnya dari pola dasar hingga nuansa mahir.
      </p>

      <!-- Mini Progress -->
      <div class="max-w-3xl mx-auto bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-left">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2"><i data-lucide="award" class="w-5 h-5 text-purple-400"></i> Progress Belajar</h3>
            <span class="text-purple-400 font-bold text-xl" id="totalProgressText">0%</span>
        </div>
        <div class="w-full bg-dark-900 rounded-full h-3 mb-6 overflow-hidden border border-white/5 shadow-inner">
            <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-sakura-400 h-3 rounded-full transition-all duration-1000" style="width: 0%" id="totalProgressBar"></div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                <p class="text-xs text-neutral-400 uppercase tracking-wider mb-1">Partikel Dasar</p>
                <p class="text-2xl font-bold text-white" id="progDasar">0/15</p>
            </div>
            <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                <p class="text-xs text-neutral-400 uppercase tracking-wider mb-1">Latihan Kontras</p>
                <p class="text-2xl font-bold text-white" id="progKontras">0/2</p>
            </div>
            <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5 text-center flex flex-col justify-center">
                <p class="text-xs text-neutral-400 uppercase tracking-wider mb-1">Latihan / Ujian</p>
                <p class="text-xl font-bold text-white" id="progQuiz">0/2</p>
            </div>
            <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                <p class="text-xs text-neutral-400 uppercase tracking-wider mb-1">Badge</p>
                <div class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700" id="badgeIcon">
                    <i data-lucide="shield" class="w-4 h-4 text-neutral-500"></i>
                </div>
            </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== SECTION: APA ITU PARTIKEL ========== -->
  <section class="py-16 px-6 lg:px-12 border-t border-white/5">
    <div class="max-w-4xl mx-auto">
      <div class="glass-card bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
        <div class="absolute -right-10 -top-10 text-9xl text-white/5 font-jp font-bold pointer-events-none">助詞</div>
        <h2 class="text-3xl font-bold mb-4 flex items-center gap-3">
          <i data-lucide="info" class="w-8 h-8 text-sakura-400"></i> Apa itu Partikel?
        </h2>
        <p class="text-lg text-neutral-300 leading-relaxed mb-6">
          Partikel (助詞 - Joshi) adalah penanda kecil dalam bahasa Jepang yang biasanya diletakkan <strong>setelah</strong> kata. Tugasnya adalah menunjukkan fungsi kata tersebut dalam kalimat: apakah sebagai topik, subjek, objek, tempat, tujuan, alat, dan sebagainya.
        </p>
        <div class="bg-dark-900/80 p-6 rounded-2xl border border-white/5 font-mono text-sm md:text-base">
          <p class="text-white mb-2"><span class="text-sakura-400 font-bold">わたし は</span> <span class="text-orange-400 font-bold">がくせい</span> です。</p>
          <p class="text-neutral-400">Watashi <strong class="text-sakura-400">wa</strong> gakusei desu.</p>
          <p class="text-neutral-300 mt-2">Saya adalah pelajar. (Partikel <strong class="text-sakura-400">は (wa)</strong> menunjukkan topik: "Kalau tentang saya...")</p>
        </div>
        <div class="mt-6 flex items-start gap-3 bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-purple-200">
            <i data-lucide="alert-circle" class="w-5 h-5 shrink-0 mt-0.5"></i>
            <div>
                <strong>Catatan Pelafalan Penting:</strong>
                <ul class="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Partikel <strong>は</strong> dibaca "wa", bukan "ha".</li>
                    <li>Partikel <strong>へ</strong> dibaca "e", bukan "he".</li>
                    <li>Partikel <strong>を</strong> umumnya dibaca "o", walau ditulis "wo".</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== SECTION: PARTIKEL DASAR N5 ========== -->
  <section class="py-16 px-6 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Partikel Dasar N5</h2>
        <p class="text-neutral-400">Pelajari 15 partikel fundamental bahasa Jepang beserta pola penggunaannya.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="partikelGrid">
        <!-- Rendered by JS -->
      </div>
    </div>
  </section>

  <!-- ========== SECTION: LATIHAN KONTRAS (CODING VIBE) ========== -->
  <section class="py-16 px-6 lg:px-12 border-t border-white/5 bg-dark-950">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 flex justify-center items-center gap-3">
          <i data-lucide="git-compare" class="w-8 h-8 text-cyan-400"></i> Latihan Kontras: Diff Checker
        </h2>
        <p class="text-neutral-400">Bedah perbedaan partikel layaknya membandingkan baris kode.</p>
      </div>

      <div class="space-y-12">
        <!-- Contrast 1: Wa vs Ga -->
        <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl">
            <!-- Mac Window Header -->
            <div class="bg-[#161b22] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div class="text-xs text-neutral-400 font-mono tracking-wider flex items-center gap-2">
                   <i data-lucide="file-code" class="w-4 h-4"></i> wa_vs_ga.jp
                </div>
                <div></div> <!-- spacing -->
            </div>

            <!-- Code Diff Layout -->
            <div class="grid md:grid-cols-2 text-sm font-mono leading-relaxed">
                <!-- Kiri: は -->
                <div class="p-6 border-b md:border-b-0 md:border-r border-white/5 bg-[#0d1117]/80">
                    <div class="text-sakura-400 font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <span class="text-3xl font-jp">は</span> <span>(wa) - Topik</span>
                        <span class="ml-auto text-2xl">🧑</span>
                    </div>
                    <div class="flex">
                        <div class="text-neutral-600 select-none pr-4 text-right">1<br>2<br>3<br>4</div>
                        <div class="text-neutral-300">
                            <span class="text-purple-400">const</span> subject = <span class="text-green-400">"Topik Pembicaraan"</span>;<br>
                            <br>
                            <span class="text-neutral-500">// Kalau tentang saya...</span><br>
                            わたし <span class="text-sakura-400 font-bold bg-sakura-500/20 px-1 rounded">は</span> ダルマ です。
                        </div>
                    </div>
                    <p class="mt-6 text-xs text-neutral-400 font-sans">Digunakan untuk memperkenalkan topik yang sedang dibicarakan. Fokusnya ada pada informasi <em>setelah</em> partikel は.</p>
                </div>

                <!-- Kanan: が -->
                <div class="p-6 bg-[#0d1117]">
                    <div class="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <span class="text-3xl font-jp">が</span> <span>(ga) - Identifikasi</span>
                        <span class="ml-auto text-2xl">🫵</span>
                    </div>
                    <div class="flex">
                        <div class="text-neutral-600 select-none pr-4 text-right">1<br>2<br>3<br>4</div>
                        <div class="text-neutral-300">
                            <span class="text-purple-400">const</span> focus = <span class="text-green-400">"Subjek Penekanan"</span>;<br>
                            <br>
                            <span class="text-neutral-500">// Sayalah Darma (Bukan orang lain)</span><br>
                            わたし <span class="text-orange-400 font-bold bg-orange-500/20 px-1 rounded">が</span> ダルマ です。
                        </div>
                    </div>
                    <p class="mt-6 text-xs text-neutral-400 font-sans">Digunakan untuk mengidentifikasi siapa/apa yang melakukan aksi. Fokusnya ada pada kata <em>sebelum</em> partikel が.</p>
                </div>
            </div>

            <!-- Terminal Execution Action -->
            <div class="bg-[#161b22] p-4 border-t border-white/5 flex items-center justify-between font-mono">
                <div class="text-green-400 text-xs hidden md:block">
                    $ analyzer compare wa ga --status success
                </div>
                <button class="btn-mark-contrast px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition flex items-center gap-2 border border-white/10 ml-auto" data-id="kontras_wa_ga">
                    > git commit -m "Memahami は vs が"
                </button>
            </div>
        </div>

        <!-- Contrast 2: Ni vs De -->
        <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl">
            <!-- Mac Window Header -->
            <div class="bg-[#161b22] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div class="text-xs text-neutral-400 font-mono tracking-wider flex items-center gap-2">
                   <i data-lucide="file-code" class="w-4 h-4"></i> ni_vs_de.jp
                </div>
                <div></div> <!-- spacing -->
            </div>

            <!-- Code Diff Layout -->
            <div class="grid md:grid-cols-2 text-sm font-mono leading-relaxed">
                <!-- Kiri: に -->
                <div class="p-6 border-b md:border-b-0 md:border-r border-white/5 bg-[#0d1117]/80">
                    <div class="text-cyan-400 font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <span class="text-3xl font-jp">に</span> <span>(ni) - Lokasi Statis</span>
                        <span class="ml-auto text-2xl">📍</span>
                    </div>
                    <div class="flex">
                        <div class="text-neutral-600 select-none pr-4 text-right">1<br>2<br>3<br>4</div>
                        <div class="text-neutral-300">
                            <span class="text-purple-400">let</span> verb = <span class="text-green-400">"います/あります"</span>;<br>
                            <br>
                            <span class="text-neutral-500">// Saya berada di sekolah.</span><br>
                            がっこう <span class="text-cyan-400 font-bold bg-cyan-500/20 px-1 rounded">に</span> います。
                        </div>
                    </div>
                    <p class="mt-6 text-xs text-neutral-400 font-sans">Menunjukkan di mana sesuatu <em>berada/eksis</em>. Selalu berpasangan dengan kata kerja statis seperti います atau あります.</p>
                </div>

                <!-- Kanan: で -->
                <div class="p-6 bg-[#0d1117]">
                    <div class="text-purple-400 font-bold text-lg mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        <span class="text-3xl font-jp">で</span> <span>(de) - Tempat Aksi</span>
                        <span class="ml-auto text-2xl">🛠️</span>
                    </div>
                    <div class="flex">
                        <div class="text-neutral-600 select-none pr-4 text-right">1<br>2<br>3<br>4</div>
                        <div class="text-neutral-300">
                            <span class="text-purple-400">let</span> verb = <span class="text-green-400">"べんきょうします"</span>;<br>
                            <br>
                            <span class="text-neutral-500">// Saya belajar di sekolah.</span><br>
                            がっこう <span class="text-purple-400 font-bold bg-purple-500/20 px-1 rounded">で</span> べんきょうします。
                        </div>
                    </div>
                    <p class="mt-6 text-xs text-neutral-400 font-sans">Menunjukkan di mana sebuah <em>aksi aktif</em> dilakukan (makan, belajar, bermain, dll).</p>
                </div>
            </div>

            <!-- Terminal Execution Action -->
            <div class="bg-[#161b22] p-4 border-t border-white/5 flex items-center justify-between font-mono">
                <div class="text-green-400 text-xs hidden md:block">
                    $ analyzer compare ni de --status success
                </div>
                <button class="btn-mark-contrast px-5 py-2 rounded bg-white/10 hover:bg-white/20 text-white text-xs transition flex items-center gap-2 border border-white/10 ml-auto" data-id="kontras_ni_de">
                    > git commit -m "Memahami に vs で"
                </button>
            </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Partikel Detail Modal -->
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 opacity-0 pointer-events-none" id="partikelModal">
    <div class="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onclick="closePartikelModal()"></div>
    <div class="relative w-full max-w-lg glass-card rounded-2xl md:rounded-3xl border border-white/10 p-5 md:p-8 shadow-2xl scale-95 transition-transform duration-300 overflow-hidden flex flex-col" id="partikelModalCard">
        <button class="absolute top-4 right-4 text-neutral-500 hover:text-rose-400 transition-colors z-10" onclick="closePartikelModal()">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
        <div id="modalContent"></div>
    </div>
  </div>

    <!-- ========== SECTION: LATIHAN PARTIKEL ========== -->
  <section class="py-16 px-6 lg:px-12">
    <div class="max-w-3xl mx-auto text-center mb-12">
      <h2 class="text-3xl font-bold mb-4">Latihan Partikel N5</h2>
      <p class="text-neutral-400">Pemanasan sebelum ujian. Latihan ini memiliki 5 soal acak dengan bantuan Hint (Petunjuk) dan umpan balik instan.</p>
    </div>

    <div class="max-w-2xl mx-auto glass-card rounded-3xl p-8 border border-white/10" id="latihanContainer">
      <div class="text-center py-10" id="latihanStartMenu">
          <i data-lucide="help-circle" class="w-16 h-16 text-purple-400 mx-auto mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">Mulai Pemanasan</h3>
          <p class="text-neutral-400 mb-6">Cocok untuk memperkuat insting. Jika kesulitan, tekan tombol Hint untuk melihat petunjuk.</p>
          <button id="btnStartLatihan" class="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition">Mulai Latihan</button>
      </div>
    </div>
  </section>

    <!-- ========== SECTION: GAME PUZZLE ========== -->
  <section class="py-16 px-6 lg:px-12 bg-dark-800/20 border-t border-white/5" id="sectionPuzzle">
    <div class="max-w-4xl mx-auto text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold mb-6">
        <i data-lucide="gamepad-2" class="w-4 h-4"></i> Visual Puzzle
      </div>
      <h2 class="text-3xl font-bold mb-4">Game Puzzle Partikel</h2>
      <p class="text-neutral-400">Pilih dan masukkan partikel yang tepat ke dalam slot kalimat rumpang berdasar gambar.</p>
    </div>

    <div class="max-w-3xl mx-auto glass-card rounded-3xl p-8 border border-white/10" id="puzzleContainer">
      <div class="text-center py-10" id="puzzleStartMenu">
          <i data-lucide="puzzle" class="w-16 h-16 text-cyan-400 mx-auto mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">Mainkan Puzzle</h3>
          <p class="text-neutral-400 mb-6">Game visual interaktif untuk merangkai kalimat dengan partikel yang tepat.</p>
          <button id="btnStartPuzzle" class="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition">Mulai Main</button>
      </div>
    </div>
  </section>

<!-- ========== SECTION: UJIAN JLPT PARTIKEL ========== -->
  <section class="py-16 px-6 lg:px-12 bg-dark-800/20 border-t border-white/5">
    <div class="max-w-4xl mx-auto text-center mb-12">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm font-semibold mb-6">
        <i data-lucide="award" class="w-4 h-4"></i> Simulasi JLPT
      </div>
      <h2 class="text-3xl font-bold mb-4">Ujian JLPT: Partikel</h2>
      <p class="text-neutral-400">Uji seberapa dalam pemahamanmu. Ujian ini berisi soal pilihan ganda dan essai (ketik partikel yang tepat).</p>
    </div>

    <div class="max-w-3xl mx-auto glass-card rounded-3xl p-8 border border-white/10" id="ujianContainer">
      <div class="text-center py-10" id="ujianStartMenu">
          <i data-lucide="graduation-cap" class="w-16 h-16 text-orange-400 mx-auto mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">Simulasi JLPT N5 Partikel</h3>
          <p class="text-neutral-400 mb-6">Ujian komprehensif. Keyboard akan otomatis mengubah huruf Romaji menjadi Hiragana pada sesi essai.</p>
          <button id="btnStartUjian" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-sakura-500 hover:from-orange-600 hover:to-sakura-600 text-white font-bold rounded-xl shadow-lg transition">Mulai Ujian JLPT</button>
      </div>
    </div>
  </section>

  <!-- Toast -->
  <div class="fixed bottom-8 right-8 z-[70] translate-y-24 transition-all duration-500 opacity-0" id="toast">
    <div class="glass-card rounded-2xl border border-white/10 p-4 shadow-2xl flex items-center gap-4 min-w-[300px] bg-dark-800">
      <div class="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
        <i data-lucide="check-circle" class="w-5 h-5 text-purple-400"></i>
      </div>
      <div>
        <h4 class="text-sm font-bold text-white" id="toastTitle">Berhasil</h4>
        <p class="text-xs text-neutral-400" id="toastMsg">Tindakan selesai.</p>
      </div>
    </div>
  </div>

  <!-- Wanakana JS for Romaji -> Kana conversion -->
  <script src="https://unpkg.com/wanakana"></script>
  <script src="assets/js/partikel.js"></script>
  <script>
    lucide.createIcons();
  </script>
</body>
</html>
