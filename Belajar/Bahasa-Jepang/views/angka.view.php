<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Materi Angka (Sūji) - GemuYokai Nihongo</title>
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
    body { background: #0a0a0a; color: #ffffff; overflow-x: hidden; }
    .glass-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .btn-primary {
      background: linear-gradient(135deg, #F74E09, #D93D00);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(247,78,9,0.4);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      transition: all 0.3s ease;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(244,114,182,0.5);
    }
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
  <header class="pt-32 pb-16 px-6 lg:px-12 relative">
    <div class="absolute top-20 right-1/4 w-96 h-96 bg-sakura-400/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="max-w-7xl mx-auto text-center">
      <h1 class="text-5xl md:text-6xl font-bold mb-6">Materi <span class="text-transparent bg-clip-text bg-gradient-to-r from-sakura-400 to-orange-400">Angka (Sūji)</span></h1>
      <p class="text-neutral-400 text-lg max-w-2xl mx-auto">Pelajari cara menyebutkan angka dasar, tanggal, waktu, dan uang dalam bahasa Jepang.</p>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 lg:px-12 pb-24 space-y-16 relative z-10">

    <!-- 1. ANGKA DASAR -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="hash" class="w-6 h-6 text-sakura-400"></i>
        <h2 class="text-2xl font-bold">Hitungan Dasar</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- 1-10 -->
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">一</div>
          <div class="text-sakura-300 font-semibold text-lg">いち (ichi)</div>
          <div class="text-neutral-400 text-sm">1</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">二</div>
          <div class="text-sakura-300 font-semibold text-lg">に (ni)</div>
          <div class="text-neutral-400 text-sm">2</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">三</div>
          <div class="text-sakura-300 font-semibold text-lg">さん (san)</div>
          <div class="text-neutral-400 text-sm">3</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">四</div>
          <div class="text-sakura-300 font-semibold text-lg">よん / し (yon/shi)</div>
          <div class="text-neutral-400 text-sm">4</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">五</div>
          <div class="text-sakura-300 font-semibold text-lg">ご (go)</div>
          <div class="text-neutral-400 text-sm">5</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">六</div>
          <div class="text-sakura-300 font-semibold text-lg">ろく (roku)</div>
          <div class="text-neutral-400 text-sm">6</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">七</div>
          <div class="text-sakura-300 font-semibold text-lg">なな / しち (nana/shichi)</div>
          <div class="text-neutral-400 text-sm">7</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">八</div>
          <div class="text-sakura-300 font-semibold text-lg">はち (hachi)</div>
          <div class="text-neutral-400 text-sm">8</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">九</div>
          <div class="text-sakura-300 font-semibold text-lg">きゅう / く (kyuu/ku)</div>
          <div class="text-neutral-400 text-sm">9</div>
        </div>
        <div class="glass-card rounded-2xl p-4 text-center hover:border-sakura-400 transition-colors">
          <div class="text-3xl font-jp mb-1">十</div>
          <div class="text-sakura-300 font-semibold text-lg">じゅう (juu)</div>
          <div class="text-neutral-400 text-sm">10</div>
        </div>
      </div>

      <div class="mt-8 grid md:grid-cols-3 gap-4">
        <div class="glass-card rounded-xl p-5 border-l-4 border-l-orange-500">
          <div class="text-xl font-bold mb-2">Ratusan (百 - hyaku)</div>
          <ul class="text-neutral-300 space-y-1 text-sm">
            <li>100: ひゃく (hyaku)</li>
            <li><span class="text-rose-400 font-bold">300: さんびゃく (sanbyaku)</span></li>
            <li><span class="text-rose-400 font-bold">600: ろっぴゃく (roppyaku)</span></li>
            <li><span class="text-rose-400 font-bold">800: はっぴゃく (happyaku)</span></li>
          </ul>
        </div>
        <div class="glass-card rounded-xl p-5 border-l-4 border-l-sakura-400">
          <div class="text-xl font-bold mb-2">Ribuan (千 - sen)</div>
          <ul class="text-neutral-300 space-y-1 text-sm">
            <li>1,000: せん (sen)</li>
            <li><span class="text-rose-400 font-bold">3,000: さんぜん (sanzen)</span></li>
            <li><span class="text-rose-400 font-bold">8,000: はっせん (hassen)</span></li>
          </ul>
        </div>
        <div class="glass-card rounded-xl p-5 border-l-4 border-l-blue-400">
          <div class="text-xl font-bold mb-2">Puluh Ribuan (万 - man)</div>
          <ul class="text-neutral-300 space-y-1 text-sm">
            <li>10,000: いちまん (ichiman)</li>
            <li>*Jepang mengelompokkan angka per 4 nol, bukan 3.</li>
            <li>Contoh: 20,000 = にまん (niman)</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 2. TANGGAL & BULAN -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="calendar" class="w-6 h-6 text-orange-400"></i>
        <h2 class="text-2xl font-bold">Tanggal & Bulan</h2>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Bulan -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-orange-300">Bulan (月 - gatsu)</h3>
          <p class="text-sm text-neutral-400 mb-4">Sangat mudah, cukup [Angka] + 月 (gatsu).</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">1月: いちがつ (Januari)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">2月: にがつ (Februari)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">3月: さんがつ (Maret)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10 border-orange-500/50"><span class="text-orange-400 font-bold">4月: しがつ (April)</span></div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">5月: ごがつ (Mei)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">6月: ろくがつ (Juni)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10 border-orange-500/50"><span class="text-orange-400 font-bold">7月: しちがつ (Juli)</span></div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">8月: はちがつ (Agustus)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10 border-orange-500/50"><span class="text-orange-400 font-bold">9月: くがつ (September)</span></div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">10月: じゅうがつ (Oktober)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">11月: じゅういちがつ (Nov)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-white/10">12月: じゅうにがつ (Des)</div>
          </div>
        </div>

        <!-- Tanggal Pengecualian -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-orange-300">Tanggal (日 - nichi / ka)</h3>
          <p class="text-sm text-neutral-400 mb-4">Tanggal 1-10 memiliki cara baca khusus (kunyomi).</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">1日: ついたち (tsuitachi)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">2日: ふつか (futsuka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">3日: みっか (mikka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">4日: よっか (yokka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">5日: いつか (itsuka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">6日: むいか (muika)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">7日: なのか (nanoka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">8日: ようか (youka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">9日: ここのか (kokonoka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">10日: とおか (tooka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">14日: じゅうよっか</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">20日: はつか (hatsuka)</div>
            <div class="bg-white/5 p-3 rounded-lg text-sm border border-orange-500/30 text-orange-200">24日: にじゅうよっか</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. WAKTU (Jam & Menit) -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="clock" class="w-6 h-6 text-blue-400"></i>
        <h2 class="text-2xl font-bold">Waktu (Jam & Menit)</h2>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <div class="glass-card rounded-2xl p-6">
          <h3 class="text-xl font-bold mb-4 text-blue-300">Jam (時 - ji)</h3>
          <p class="text-sm text-neutral-400 mb-4">Rumus: [Angka] + 時 (ji)</p>
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between border-b border-white/5 pb-1"><span>1:00</span> <span>いちじ (ichiji)</span></li>
            <li class="flex justify-between border-b border-white/5 pb-1"><span>2:00</span> <span>にじ (niji)</span></li>
            <li class="flex justify-between border-b border-white/5 pb-1 text-blue-300 font-bold"><span>4:00</span> <span>よじ (yoji) - BUKAN yonji</span></li>
            <li class="flex justify-between border-b border-white/5 pb-1"><span>7:00</span> <span>しちじ (shichiji)</span></li>
            <li class="flex justify-between border-b border-white/5 pb-1 text-blue-300 font-bold"><span>9:00</span> <span>くじ (kuji) - BUKAN kyuuji</span></li>
          </ul>
        </div>

        <div class="glass-card rounded-2xl p-6">
          <h3 class="text-xl font-bold mb-4 text-emerald-300">Menit (分 - fun / pun)</h3>
          <p class="text-sm text-neutral-400 mb-4">Menit berubah bacaan tergantung angka di depannya.</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <ul class="space-y-2">
              <li>1分: いっぷん (ippun)</li>
              <li>2分: にふん (nifun)</li>
              <li>3分: さんぷん (sanpun)</li>
              <li>4分: よんぷん (yonpun)</li>
              <li>5分: ごふん (gofun)</li>
            </ul>
            <ul class="space-y-2">
              <li>6分: ろっぷん (roppun)</li>
              <li>7分: ななふん (nanafun)</li>
              <li>8分: はっぷん (happun)</li>
              <li>9分: きゅうふん (kyuufun)</li>
              <li>10分: じゅっぷん (juppun)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. UANG & HARGA -->
    <section>
      <div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <i data-lucide="coins" class="w-6 h-6 text-yellow-400"></i>
        <h2 class="text-2xl font-bold">Uang & Harga (Yen)</h2>
      </div>

      <div class="glass-card rounded-2xl p-8">
        <p class="text-neutral-300 mb-6">Mata uang Jepang adalah Yen (<span class="font-jp text-xl text-yellow-400">円 - えん</span>). Cara menyebutkan harga sama dengan angka dasar ditambah "en".</p>

        <div class="grid md:grid-cols-2 gap-6">
           <div class="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
              <span class="text-xl font-bold text-yellow-400">¥100</span>
              <span class="font-jp text-lg">ひゃくえん (hyakuen)</span>
           </div>
           <div class="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
              <span class="text-xl font-bold text-yellow-400">¥1,000</span>
              <span class="font-jp text-lg">せんえん (sen'en)</span>
           </div>
           <div class="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
              <span class="text-xl font-bold text-yellow-400">¥10,000</span>
              <span class="font-jp text-lg">いちまんえん (ichiman'en)</span>
           </div>
           <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30 flex items-center justify-between">
              <span class="text-xl font-bold text-yellow-400">Tanya Harga:</span>
              <span class="font-jp text-lg">いくらですか (Ikura desu ka?)</span>
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
  </script>
</body>
</html>
