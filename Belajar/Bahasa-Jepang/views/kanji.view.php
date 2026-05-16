<?php
// Tampilan View untuk Modul Kanji N5
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Belajar Kanji N5 - NihongoLab</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- HanziWriter untuk render animasi goresan Kanji Jepang -->
  <script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js"></script>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            orange: { 450: '#FF5A1F', 500: '#F74E09', 600: '#D93D00' },
            sakura: { 300: '#F9A8D4', 400: '#F472B6', 500: '#EC4899', 600: '#DB2777' },
            emerald: { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669' },
            dark: { 900: '#0a0a0a', 800: '#111111', 700: '#1a1a1a', 600: '#242424', 500: '#2e2e2e' }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            jp: ['Noto Sans JP', 'sans-serif']
          },
          animation: {
            'float-slow': 'floatSlow 8s ease-in-out infinite',
            'float-medium': 'floatMedium 6s ease-in-out infinite',
            'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
            'fall-1': 'fall1 12s linear infinite',
            'fall-2': 'fall2 10s linear infinite',
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    /* Custom Scrollbar for Modal */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.5); border-radius: 10px; }
    
    .glass-modal {
        background: rgba(17, 17, 17, 0.85);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    #hanzi-writer-container svg {
        display: block;
        margin: 0 auto;
        border-radius: 12px;
        background: rgba(255,255,255,0.02);
    }
  </style>
</head>
<body class="bg-dark-900 text-white min-h-screen relative overflow-x-hidden">

  <!-- ========== NAVBAR ========== -->
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-dark-900/80 backdrop-blur-md border-b border-white/5" id="navbar">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
      <a href="index.php" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-jp font-bold text-lg text-white shadow-lg">
          漢
        </div>
        <span class="text-xl font-semibold tracking-tight">
          <span class="text-white">Kanji</span><span class="text-emerald-400">Master</span>
        </span>
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="index.php" class="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          Kembali ke Menu
        </a>
      </div>
      <div class="flex items-center gap-3">
        <?php if (!empty($_SESSION['user_name'])): ?>
            <div class="hidden sm:flex items-center gap-3 text-sm text-white font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                   <?php echo strtoupper(substr($_SESSION['user_name'], 0, 1)); ?>
                </div>
                <?php echo htmlspecialchars($_SESSION['user_name']); ?>
            </div>
            <a href="?logout=1" class="btn-secondary text-sm font-semibold text-white px-5 py-2.5 rounded-xl border border-rose-500/30 hover:border-rose-500/80 hover:bg-rose-500/20 hidden sm:block">Keluar</a>
        <?php else: ?>
            <a href="../Index.php" class="btn-primary text-sm font-semibold text-white px-5 py-2.5 rounded-xl hidden sm:flex items-center justify-center bg-emerald-500 hover:bg-emerald-600">Masuk</a>
        <?php endif; ?>
      </div>
    </div>
  </nav>

  <!-- ========== HERO & SEARCH ========== -->
  <section class="relative pt-32 pb-16 px-6 lg:px-12">
    <!-- Decorative -->
    <div class="absolute top-20 left-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[120px] animate-float-slow pointer-events-none"></div>
    <div class="sakura-petal animate-fall-1" style="left:15%; top:0; animation-delay:0s; width:8px; height:8px; background: rgba(52,211,153,0.3)"></div>
    <div class="sakura-petal animate-fall-2" style="left:80%; top:0; animation-delay:2s; width:12px; height:12px; background: rgba(52,211,153,0.3)"></div>
    
    <div class="max-w-7xl mx-auto relative z-10 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm font-medium mb-6">
        <i data-lucide="book-open" class="w-4 h-4"></i> JLPT N5 Masterclass
      </div>
      <h1 class="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
        Database <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Kanji N5</span> Lengkap
      </h1>
      <p class="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">
        Pelajari 80 Kanji fundamental bahasa Jepang, lengkap dengan animasi goresan (stroke order), Onyomi, Kunyomi, dan contoh kosakata.
      </p>

      <!-- Search Bar -->
      <div class="max-w-xl mx-auto relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <i data-lucide="search" class="w-5 h-5 text-neutral-400 group-focus-within:text-emerald-400 transition-colors"></i>
        </div>
        <input type="text" id="searchInput" placeholder="Cari berdasarkan Kanji, Romaji, atau Arti bahasa Indonesia..." class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all text-sm md:text-base shadow-inner">
      </div>
    </div>
  </section>

  <!-- ========== KANJI GRID ========== -->
  <section class="relative pb-32 px-6 lg:px-12">
    <div class="max-w-7xl mx-auto">
        
        <!-- Progress Bar -->
        <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-neutral-400">Total Kanji N5: <strong class="text-white" id="totalKanjiCount">80</strong></span>
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-emerald-400">Progress: <?php echo $prog_kanji; ?>%</span>
                <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-400 rounded-full" style="width: <?php echo $prog_kanji; ?>%;"></div>
                </div>
            </div>
        </div>

        <div id="kanjiGrid" class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
            <!-- Dinamis dirender oleh JavaScript -->
        </div>

        <div id="noResult" class="hidden text-center py-20">
            <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <i data-lucide="ghost" class="w-8 h-8 text-neutral-500"></i>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2">Kanji Tidak Ditemukan</h3>
            <p class="text-neutral-400 text-sm">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
    </div>
  </section>

  <!-- ========== MODAL DETAIL KANJI ========== -->
  <div id="kanjiModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
      <!-- Overlay -->
      <div id="kanjiModalOverlay" class="absolute inset-0 bg-dark-900/90 backdrop-blur-sm"></div>
      
      <!-- Modal Content -->
      <div class="relative glass-modal w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 transform scale-95 opacity-0 transition-all duration-300 flex flex-col max-h-[90vh]" id="kanjiModalContent">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/10">
              <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                      N5
                  </div>
                  <h2 class="text-xl font-semibold" id="modalTitle">Detail Kanji</h2>
              </div>
              <button id="closeModalBtn" class="text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <i data-lucide="x" class="w-6 h-6"></i>
              </button>
          </div>

          <!-- Body -->
          <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div class="grid md:grid-cols-12 gap-8 items-start">
                  
                  <!-- Kiri: Animasi & Goresan -->
                  <div class="md:col-span-5 flex flex-col items-center">
                      <div class="w-full aspect-square bg-dark-800 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 mb-6 shadow-inner relative group overflow-hidden">
                          <!-- Label Background Grid untuk Kanji -->
                          <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 50% 50%;"></div>
                          <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <div class="w-full h-px bg-white/5 absolute top-1/2"></div>
                              <div class="h-full w-px bg-white/5 absolute left-1/2"></div>
                          </div>
                          
                          <!-- Container HanziWriter -->
                          <div id="hanzi-writer-container" class="relative z-10 w-[200px] h-[200px] md:w-[250px] md:h-[250px]"></div>
                      </div>
                      
                      <div class="flex items-center gap-3 w-full">
                          <button id="animateKanjiBtn" class="flex-1 btn-primary bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20">
                              <i data-lucide="play" class="w-4 h-4"></i> Animasi Goresan
                          </button>
                      </div>
                      <p class="text-xs text-neutral-500 text-center mt-4">
                          * Animasi menggunakan standar stroke Jepang. Urutan goresan mengikuti aturan N5 resmi.
                      </p>
                  </div>

                  <!-- Kanan: Detail Data -->
                  <div class="md:col-span-7 space-y-6">
                      <!-- Arti Utama -->
                      <div class="bg-white/5 rounded-2xl p-5 border border-white/5">
                          <p class="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Arti Utama</p>
                          <h3 class="text-3xl font-bold text-white capitalize" id="modalMeaning">Satu</h3>
                      </div>

                      <!-- Cara Baca -->
                      <div class="grid grid-cols-2 gap-4">
                          <div class="bg-white/5 rounded-2xl p-5 border border-white/5">
                              <p class="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Onyomi</p>
                              <p class="text-lg font-jp text-white" id="modalOnyomi">イチ, イツ</p>
                              <p class="text-[10px] text-neutral-500 mt-1">Cara baca Cina (Katakana)</p>
                          </div>
                          <div class="bg-white/5 rounded-2xl p-5 border border-white/5">
                              <p class="text-xs font-semibold text-sakura-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><i data-lucide="volume-1" class="w-3.5 h-3.5"></i> Kunyomi</p>
                              <p class="text-lg font-jp text-white" id="modalKunyomi">ひと(つ)</p>
                              <p class="text-[10px] text-neutral-500 mt-1">Cara baca Jepang (Hiragana)</p>
                          </div>
                      </div>

                      <!-- Mnemonic / Penjelasan -->
                      <div>
                          <h4 class="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <i data-lucide="lightbulb" class="w-4 h-4 text-yellow-400"></i> Cara Mudah Mengingat
                          </h4>
                          <p class="text-neutral-400 text-sm leading-relaxed bg-dark-900/50 p-4 rounded-xl border border-white/5" id="modalExplain">
                              Berbentuk seperti satu garis mendatar.
                          </p>
                      </div>

                      <!-- Contoh Kosakata -->
                      <div>
                          <h4 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                              <i data-lucide="book-open-check" class="w-4 h-4 text-cyan-400"></i> Contoh Pemakaian Kosakata
                          </h4>
                          <div class="space-y-3" id="modalExamples">
                              <!-- Dirender dinamis oleh JS -->
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>

  <script>
    if (window.lucide) lucide.createIcons();

    // ---------------------------------------------------------
    // DATABASE 80 KANJI N5
    // ---------------------------------------------------------
    const N5_KANJI = [
      { k: '一', o: 'イチ, イツ', kun: 'ひと(つ)', m: 'Satu', ex: [{w:'一つ', r:'ひとつ', m:'Satu buah'}, {w:'一日', r:'ついたち', m:'Tanggal satu'}], x: 'Garis horizontal melambangkan angka 1.' },
      { k: '二', o: 'ニ', kun: 'ふた(つ)', m: 'Dua', ex: [{w:'二つ', r:'ふたつ', m:'Dua buah'}, {w:'二日', r:'ふつか', m:'Tanggal dua'}], x: 'Dua garis horizontal melambangkan angka 2.' },
      { k: '三', o: 'サン', kun: 'みっ(つ)', m: 'Tiga', ex: [{w:'三つ', r:'みっつ', m:'Tiga buah'}, {w:'三日', r:'みっか', m:'Tanggal tiga'}], x: 'Tiga garis horizontal melambangkan angka 3.' },
      { k: '四', o: 'シ', kun: 'よん, よっ(つ)', m: 'Empat', ex: [{w:'四つ', r:'よっつ', m:'Empat buah'}, {w:'四月', r:'しがつ', m:'Bulan April'}], x: 'Bentuk kotak dengan nafas di dalamnya, membagi ke 4 arah.' },
      { k: '五', o: 'ゴ', kun: 'いつ(つ)', m: 'Lima', ex: [{w:'五つ', r:'いつつ', m:'Lima buah'}, {w:'五日', r:'いつか', m:'Tanggal lima'}], x: 'Garis yang bersilangan antara dua garis vertikal dan horizontal.' },
      { k: '六', o: 'ロク', kun: 'むっ(つ)', m: 'Enam', ex: [{w:'六つ', r:'むっつ', m:'Enam buah'}, {w:'六日', r:'むいか', m:'Tanggal enam'}], x: 'Dua tangan yang menunjukkan angka enam dari atap.' },
      { k: '七', o: 'シチ', kun: 'なな(つ)', m: 'Tujuh', ex: [{w:'七つ', r:'ななつ', m:'Tujuh buah'}, {w:'七月', r:'しちがつ', m:'Bulan Juli'}], x: 'Garis silang yang terpotong di tengah.' },
      { k: '八', o: 'ハチ', kun: 'やっ(つ)', m: 'Delapan', ex: [{w:'八つ', r:'やっつ', m:'Delapan buah'}, {w:'八日', r:'ようか', m:'Tanggal delapan'}], x: 'Dua garis yang terbelah/membuka melambangkan angka 8.' },
      { k: '九', o: 'キュウ, ク', kun: 'ここの(つ)', m: 'Sembilan', ex: [{w:'九つ', r:'ここのつ', m:'Sembilan buah'}, {w:'九月', r:'くがつ', m:'Bulan September'}], x: 'Garis bengkok seperti lengan yang membungkuk.' },
      { k: '十', o: 'ジュウ', kun: 'とお', m: 'Sepuluh', ex: [{w:'十', r:'とお', m:'Sepuluh'}, {w:'十日', r:'とおか', m:'Tanggal sepuluh'}], x: 'Garis vertikal dan horizontal yang bersilangan sempurna (lengkap).' },
      { k: '百', o: 'ヒャク', kun: 'もも', m: 'Seratus', ex: [{w:'百', r:'ひゃく', m:'Seratus'}, {w:'三百', r:'さんびゃく', m:'Tiga ratus'}], x: 'Satu garis (一) di atas warna putih (白).' },
      { k: '千', o: 'セン', kun: 'ち', m: 'Seribu', ex: [{w:'千', r:'せん', m:'Seribu'}, {w:'三千', r:'さんぜん', m:'Tiga ribu'}], x: 'Satu garis ditambah palang menyilang.' },
      { k: '万', o: 'マン, バン', kun: '-', m: 'Sepuluh Ribu', ex: [{w:'一万', r:'いちまん', m:'Sepuluh ribu'}], x: 'Angka dalam jumlah sangat besar.' },
      { k: '円', o: 'エン', kun: 'まる(い)', m: 'Yen / Lingkaran', ex: [{w:'百円', r:'ひゃくえん', m:'Seratus yen'}, {w:'円い', r:'まるい', m:'Bulat'}], x: 'Bentuk uang koin di dalam kotak.' },
      { k: '日', o: 'ニチ, ジツ', kun: 'ひ, -か', m: 'Matahari / Hari', ex: [{w:'日曜日', r:'にちようび', m:'Hari minggu'}, {w:'日本', r:'にほん', m:'Jepang'}], x: 'Bentuk kotak dengan garis tengah yang melambangkan matahari.' },
      { k: '月', o: 'ゲツ, ガツ', kun: 'つき', m: 'Bulan (Benda langit / Kalender)', ex: [{w:'月曜日', r:'げつようび', m:'Hari senin'}, {w:'一月', r:'いちがつ', m:'Bulan Januari'}], x: 'Bentuk bulan sabit di malam hari.' },
      { k: '火', o: 'カ', kun: 'ひ, ほ', m: 'Api', ex: [{w:'火曜日', r:'かようび', m:'Hari selasa'}, {w:'火花', r:'ひばな', m:'Percikan api'}], x: 'Bentuk kobaran api.' },
      { k: '水', o: 'スイ', kun: 'みず', m: 'Air', ex: [{w:'水曜日', r:'すいようび', m:'Hari rabu'}, {w:'水', r:'みず', m:'Air'}], x: 'Aliran air sungai yang mengalir ke bawah.' },
      { k: '木', o: 'モク, ボク', kun: 'き', m: 'Pohon / Kayu', ex: [{w:'木曜日', r:'もくようび', m:'Hari kamis'}, {w:'木', r:'き', m:'Pohon'}], x: 'Bentuk batang pohon dengan akar di bawahnya.' },
      { k: '金', o: 'キン, コン', kun: 'かね, かな', m: 'Emas / Uang', ex: [{w:'金曜日', r:'きんようび', m:'Hari jumat'}, {w:'お金', r:'おかね', m:'Uang'}], x: 'Serpihan emas yang disembunyikan di bawah atap (tanah).' },
      { k: '土', o: 'ド, ト', kun: 'つち', m: 'Tanah', ex: [{w:'土曜日', r:'どようび', m:'Hari sabtu'}, {w:'土地', r:'とち', m:'Tanah lahan'}], x: 'Tunas yang tumbuh dari sebidang tanah.' },
      { k: '山', o: 'サン', kun: 'やま', m: 'Gunung', ex: [{w:'富士山', r:'ふじさん', m:'Gunung Fuji'}, {w:'山', r:'やま', m:'Gunung'}], x: 'Tiga puncak gunung yang berjajar.' },
      { k: '川', o: 'セン', kun: 'かわ', m: 'Sungai', ex: [{w:'川', r:'かわ', m:'Sungai'}, {w:'天の川', r:'あまのがわ', m:'Bimasakti'}], x: 'Tiga garis vertikal melambangkan aliran sungai.' },
      { k: '田', o: 'デン', kun: 'た', m: 'Sawah', ex: [{w:'田んぼ', r:'たんぼ', m:'Sawah'}, {w:'山田', r:'やまだ', m:'Yamada (nama)'}], x: 'Sebidang tanah sawah yang terbagi empat.' },
      { k: '人', o: 'ジン, ニン', kun: 'ひと', m: 'Orang', ex: [{w:'日本人', r:'にほんじん', m:'Orang Jepang'}, {w:'人', r:'ひと', m:'Orang'}], x: 'Bentuk orang yang sedang melangkah / berdiri.' },
      { k: '口', o: 'コウ, ク', kun: 'くち', m: 'Mulut', ex: [{w:'入口', r:'いりぐち', m:'Pintu masuk'}, {w:'出口', r:'でぐち', m:'Pintu keluar'}], x: 'Bentuk mulut yang sedang terbuka.' },
      { k: '目', o: 'モク, ボク', kun: 'め', m: 'Mata', ex: [{w:'目', r:'め', m:'Mata'}, {w:'目的', r:'もくてき', m:'Tujuan'}], x: 'Bentuk bola mata manusia.' },
      { k: '耳', o: 'ジ', kun: 'みみ', m: 'Telinga', ex: [{w:'耳', r:'みみ', m:'Telinga'}], x: 'Bentuk daun telinga.' },
      { k: '手', o: 'シュ', kun: 'て', m: 'Tangan', ex: [{w:'手', r:'て', m:'Tangan'}, {w:'上手', r:'じょうず', m:'Pintar / Mahir'}], x: 'Garis yang melambangkan jari-jari tangan.' },
      { k: '足', o: 'ソク', kun: 'あし, た(りる)', m: 'Kaki / Cukup', ex: [{w:'足', r:'あし', m:'Kaki'}, {w:'足りる', r:'たりる', m:'Cukup'}], x: 'Orang yang sedang berdiri dengan kakinya.' },
      { k: '力', o: 'リョク, リキ', kun: 'ちから', m: 'Kekuatan', ex: [{w:'力', r:'ちから', m:'Kekuatan / Tenaga'}], x: 'Otot lengan yang sedang memompa kekuatan.' },
      { k: '男', o: 'ダン, ナン', kun: 'おとこ', m: 'Laki-laki', ex: [{w:'男の子', r:'おとこのこ', m:'Anak laki-laki'}], x: 'Kekuatan (力) yang membajak sawah (田).' },
      { k: '女', o: 'ジョ, ニョ', kun: 'おんな, め', m: 'Perempuan', ex: [{w:'女の子', r:'おんなのこ', m:'Anak perempuan'}, {w:'彼女', r:'かのじょ', m:'Dia (Pr) / Pacar'}], x: 'Bentuk tubuh perempuan yang sedang duduk elegan.' },
      { k: '子', o: 'シ, ス', kun: 'こ', m: 'Anak', ex: [{w:'子供', r:'こども', m:'Anak-anak'}], x: 'Bayi yang masih dibedong, kepala besar dan lengan kecil.' },
      { k: '学', o: 'ガク', kun: 'まな(ぶ)', m: 'Belajar / Pengetahuan', ex: [{w:'学校', r:'がっこう', m:'Sekolah'}, {w:'学生', r:'がくせい', m:'Pelajar'}], x: 'Anak (子) yang belajar di bawah atap sekolah dengan bimbingan.' },
      { k: '校', o: 'コウ', kun: '-', m: 'Sekolah', ex: [{w:'学校', r:'がっこう', m:'Sekolah'}, {w:'高校', r:'こうこう', m:'SMA'}], x: 'Bangunan tempat belajar (dibuat dari kayu 木).' },
      { k: '先', o: 'セン', kun: 'さき', m: 'Sebelumnya / Masa lalu / Ujung', ex: [{w:'先生', r:'せんせい', m:'Guru'}, {w:'先月', r:'せんげつ', m:'Bulan lalu'}], x: 'Seseorang yang berjalan di depan (lebih dulu maju).' },
      { k: '生', o: 'セイ, ショウ', kun: 'い(きる), う(まれる), なま', m: 'Hidup / Lahir / Mentah', ex: [{w:'先生', r:'せんせい', m:'Guru'}, {w:'誕生日', r:'たんじょうび', m:'Ulang tahun'}], x: 'Tunas tanaman yang tumbuh subur dari tanah (hidup).' },
      { k: '車', o: 'シャ', kun: 'くるま', m: 'Mobil / Kendaraan', ex: [{w:'車', r:'くるま', m:'Mobil'}, {w:'電車', r:'でんしゃ', m:'Kereta listrik'}], x: 'Bentuk roda gerobak jika dilihat dari atas.' },
      { k: '本', o: 'ホン', kun: 'もと', m: 'Buku / Asal', ex: [{w:'本', r:'ほん', m:'Buku'}, {w:'日本', r:'にほん', m:'Jepang (Asal matahari)'}], x: 'Pohon (木) yang diberi tanda di bagian akarnya (dasar/asal).' },
      { k: '見', o: 'ケン', kun: 'み(る), み(える)', m: 'Melihat', ex: [{w:'見る', r:'みる', m:'Melihat'}, {w:'花見', r:'はなみ', m:'Melihat bunga (Sakura)'}], x: 'Mata (目) yang berdiri dengan kakinya.' },
      { k: '言', o: 'ゲン, ゴン', kun: 'い(う), こと', m: 'Berkata / Mengucapkan', ex: [{w:'言う', r:'いう', m:'Berkata'}, {w:'言葉', r:'ことば', m:'Kosakata / Bahasa'}], x: 'Gelombang suara yang keluar dari mulut (口).' },
      { k: '語', o: 'ゴ', kun: 'かた(る)', m: 'Bahasa / Bercerita', ex: [{w:'日本語', r:'にほんご', m:'Bahasa Jepang'}, {w:'物語', r:'ものがたり', m:'Kisah / Cerita'}], x: 'Menggunakan kata-kata (言) bersama lima (五) mulut (口).' },
      { k: '行', o: 'コウ, ギョウ', kun: 'い(く), ゆ(く)', m: 'Pergi / Melakukan', ex: [{w:'行く', r:'いく', m:'Pergi'}, {w:'旅行', r:'りょこう', m:'Wisata'}], x: 'Persimpangan jalan raya.' },
      { k: '来', o: 'ライ', kun: 'く(る)', m: 'Datang / Masa depan', ex: [{w:'来る', r:'くる', m:'Datang'}, {w:'来年', r:'らいねん', m:'Tahun depan'}], x: 'Tanaman gandum yang datang tumbuh di ladang.' },
      { k: '食', o: 'ショク', kun: 'た(べる)', m: 'Makan', ex: [{w:'食べる', r:'たべる', m:'Makan'}, {w:'食事', r:'しょくじ', m:'Aktivitas makan'}], x: 'Seseorang yang menyatukan makanan di bawah atap (mulut).' },
      { k: '飲', o: 'イン', kun: 'の(む)', m: 'Minum', ex: [{w:'飲む', r:'のむ', m:'Minum'}, {w:'飲み物', r:'のみもの', m:'Minuman'}], x: 'Seseorang yang minum cairan (berasal dari 食 makan + ハ).' },
      { k: '買', o: 'バイ', kun: 'か(う)', m: 'Membeli', ex: [{w:'買う', r:'かう', m:'Membeli'}, {w:'買い物', r:'かいもの', m:'Belanja'}], x: 'Mengeluarkan uang/koin (貝) lewat jaring untuk transaksi.' },
      { k: '出', o: 'シュツ', kun: 'で(る), だ(す)', m: 'Keluar', ex: [{w:'出る', r:'でる', m:'Keluar'}, {w:'外出', r:'がいしゅつ', m:'Keluar rumah'}], x: 'Gunung yang ditumpuk di atas gunung lain (tumbuh ke atas/keluar).' },
      { k: '入', o: 'ニュウ', kun: 'はい(る), い(れる)', m: 'Masuk', ex: [{w:'入る', r:'はいる', m:'Masuk'}, {w:'入口', r:'いりぐち', m:'Pintu masuk'}], x: 'Akar pohon yang menembus masuk ke tanah.' },
      { k: '休', o: 'キュウ', kun: 'やす(む)', m: 'Istirahat', ex: [{w:'休む', r:'やすむ', m:'Istirahat / Libur'}, {w:'休み', r:'やすみ', m:'Liburan'}], x: 'Orang (人) yang bersandar pada pohon (木) untuk istirahat.' },
      { k: '読', o: 'ドク', kun: 'よ(む)', m: 'Membaca', ex: [{w:'読む', r:'よむ', m:'Membaca'}, {w:'読書', r:'どくしょ', m:'Membaca buku'}], x: 'Mengucapkan kata (言) untuk menjual/menyebarkan ide.' },
      { k: '書', o: 'ショ', kun: 'か(く)', m: 'Menulis', ex: [{w:'書く', r:'かく', m:'Menulis'}, {w:'辞書', r:'じしょ', m:'Kamus'}], x: 'Tangan memegang kuas (pembagian garis).' },
      { k: '聞', o: 'ブン, モン', kun: 'き(く), き(こえる)', m: 'Mendengar', ex: [{w:'聞く', r:'きく', m:'Mendengar'}, {w:'新聞', r:'しんぶん', m:'Koran (Mendengar hal baru)'}], x: 'Telinga (耳) di antara dua daun pintu (門).' },
      { k: '話', o: 'ワ', kun: 'はな(す), はなし', m: 'Berbicara', ex: [{w:'話す', r:'はなす', m:'Berbicara'}, {w:'電話', r:'でんわ', m:'Telepon'}], x: 'Kata-kata (言) yang keluar dari lidah (舌).' },
      { k: '上', o: 'ジョウ', kun: 'うえ, あ(がる)', m: 'Atas', ex: [{w:'上', r:'うえ', m:'Atas'}, {w:'上がる', r:'あがる', m:'Naik'}], x: 'Garis yang menunjuk ke atas batas mendatar.' },
      { k: '下', o: 'カ, ゲ', kun: 'した, さ(がる)', m: 'Bawah', ex: [{w:'下', r:'した', m:'Bawah'}, {w:'下がる', r:'さがる', m:'Turun'}], x: 'Garis yang menunjuk ke bawah batas mendatar.' },
      { k: '左', o: 'サ', kun: 'ひだり', m: 'Kiri', ex: [{w:'左', r:'ひだり', m:'Kiri'}, {w:'左手', r:'ひだりて', m:'Tangan kiri'}], x: 'Tangan memegang alat (huruf エ).' },
      { k: '右', o: 'ウ, ユウ', kun: 'みぎ', m: 'Kanan', ex: [{w:'右', r:'みぎ', m:'Kanan'}, {w:'右手', r:'みぎて', m:'Tangan kanan'}], x: 'Tangan memegang mulut (suara/mulut arah ke kanan saat makan).' },
      { k: '大', o: 'ダイ, タイ', kun: 'おお(きい)', m: 'Besar', ex: [{w:'大きい', r:'おおきい', m:'Besar'}, {w:'大学', r:'だいがく', m:'Universitas'}], x: 'Orang (人) yang merentangkan tangannya seluas mungkin.' },
      { k: '小', o: 'ショウ', kun: 'ちい(さい), こ', m: 'Kecil', ex: [{w:'小さい', r:'ちいさい', m:'Kecil'}, {w:'小学校', r:'しょうがっこう', m:'SD (Sekolah Dasar)'}], x: 'Sesuatu yang terbelah dua menjadi lebih kecil.' },
      { k: '中', o: 'チュウ', kun: 'なか', m: 'Dalam / Tengah', ex: [{w:'中', r:'なか', m:'Di dalam'}, {w:'中国', r:'ちゅうごく', m:'Tiongkok'}], x: 'Garis panah yang menembus tepat di tengah kotak (target).' },
      { k: '外', o: 'ガイ, ゲ', kun: 'そと, ほか', m: 'Luar', ex: [{w:'外', r:'そと', m:'Di luar'}, {w:'外国人', r:'がいこくじん', m:'Orang asing'}], x: 'Malam (夕) dan ramalan (卜). Sesuatu di luar dugaan.' },
      { k: '前', o: 'ゼン', kun: 'まえ', m: 'Depan / Sebelum', ex: [{w:'前', r:'まえ', m:'Di depan / Sebelum'}, {w:'午前', r:'ごぜん', m:'AM (Pagi)'}], x: 'Daging yang dipotong di depan dengan pisau.' },
      { k: '後', o: 'ゴ, コウ', kun: 'うし(ろ), あと', m: 'Belakang / Setelah', ex: [{w:'後ろ', r:'うしろ', m:'Di belakang'}, {w:'午後', r:'ごご', m:'PM (Siang/Malam)'}], x: 'Langkah (彳) yang terseret ke belakang atau tertinggal.' },
      { k: '午', o: 'ゴ', kun: '-', m: 'Siang (Jam 12)', ex: [{w:'午前', r:'ごぜん', m:'AM'}, {w:'午後', r:'ごご', m:'PM'}], x: 'Batang penumbuk padi yang dipakai di tengah hari.' },
      { k: '門', o: 'モン', kun: 'かど', m: 'Gerbang / Pintu', ex: [{w:'門', r:'もん', m:'Gerbang'}, {w:'専門', r:'せんもん', m:'Keahlian'}], x: 'Dua daun pintu besar bersisian.' },
      { k: '間', o: 'カン, ケン', kun: 'あいだ, ま', m: 'Antara / Ruang / Waktu', ex: [{w:'時間', r:'じかん', m:'Waktu'}, {w:'間', r:'あいだ', m:'Di antara'}], x: 'Matahari (日) yang bersinar di antara celah pintu (門).' },
      { k: '東', o: 'トウ', kun: 'ひがし', m: 'Timur', ex: [{w:'東', r:'ひがし', m:'Timur'}, {w:'東京', r:'とうきょう', m:'Tokyo'}], x: 'Matahari (日) yang terbit dari balik pohon (木).' },
      { k: '西', o: 'セイ, サイ', kun: 'にし', m: 'Barat', ex: [{w:'西', r:'にし', m:'Barat'}, {w:'関西', r:'かんさい', m:'Kansai (Area)'}], x: 'Matahari tenggelam hingga burung masuk ke sarang di atap.' },
      { k: '南', o: 'ナン', kun: 'みなみ', m: 'Selatan', ex: [{w:'南', r:'みなみ', m:'Selatan'}, {w:'東南', r:'とうなん', m:'Tenggara'}], x: 'Angin dari lembah yang hangat di arah selatan.' },
      { k: '北', o: 'ホク', kun: 'きた', m: 'Utara', ex: [{w:'北', r:'きた', m:'Utara'}, {w:'北海道', r:'ほっかいどう', m:'Hokkaido (Provinsi utara)'}], x: 'Dua orang yang saling membelakangi karena hawa dingin dari utara.' },
      { k: '父', o: 'フ', kun: 'ちち', m: 'Ayah', ex: [{w:'父', r:'ちち', m:'Ayah (sendiri)'}, {w:'お父さん', r:'おとうさん', m:'Ayah (orang lain)'}], x: 'Dua tangan yang sedang memegang tongkat/cambuk mendidik anak.' },
      { k: '母', o: 'ボ', kun: 'はは', m: 'Ibu', ex: [{w:'母', r:'はは', m:'Ibu (sendiri)'}, {w:'お母さん', r:'おかあさん', m:'Ibu (orang lain)'}], x: 'Payudara perempuan yang menyusui anaknya.' },
      { k: '名', o: 'メイ, ミョウ', kun: 'な', m: 'Nama', ex: [{w:'名前', r:'なまえ', m:'Nama'}, {w:'有名', r:'ゆうめい', m:'Terkenal'}], x: 'Mulut (口) di malam hari (夕) memanggil nama agar ketahuan.' },
      { k: '白', o: 'ハク, ビャク', kun: 'しろ(い)', m: 'Putih', ex: [{w:'白い', r:'しろい', m:'Putih (ks)'}, {w:'白黒', r:'しろくろ', m:'Hitam putih'}], x: 'Sinar matahari yang muncul sedikit (putih bersinar).' },
      { k: '高', o: 'コウ', kun: 'たか(い)', m: 'Tinggi / Mahal', ex: [{w:'高い', r:'たかい', m:'Tinggi / Mahal'}, {w:'高校', r:'こうこう', m:'SMA'}], x: 'Bentuk bangunan bertingkat yang menjulang tinggi.' },
      { k: '長', o: 'チョウ', kun: 'なが(い)', m: 'Panjang / Ketua', ex: [{w:'長い', r:'ながい', m:'Panjang'}, {w:'社長', r:'しゃちょう', m:'Presiden Perusahaan'}], x: 'Orang tua dengan rambut/janggut panjang (tetua).' },
      { k: '多', o: 'タ', kun: 'おお(い)', m: 'Banyak', ex: [{w:'多い', r:'おおい', m:'Banyak'}, {w:'多分', r:'たぶん', m:'Mungkin'}], x: 'Dua karakter malam (夕), menunjukkan hari berlalu sangat banyak.' },
      { k: '少', o: 'ショウ', kun: 'すく(ない), すこ(し)', m: 'Sedikit', ex: [{w:'少ない', r:'すくない', m:'Sedikit (kuantitas)'}, {w:'少し', r:'すこし', m:'Sedikit (takaran)'}], x: 'Sesuatu yang kecil (小) kemudian diiris (丿) lagi jadi lebih sedikit.' },
      { k: '新', o: 'シン', kun: 'あたら(しい)', m: 'Baru', ex: [{w:'新しい', r:'あたらしい', m:'Baru'}, {w:'新聞', r:'しんぶん', m:'Koran (Berita baru)'}], x: 'Memotong pohon menggunakan kapak untuk dibuat barang baru.' },
      { k: '古', o: 'コ', kun: 'ふる(い)', m: 'Lama / Kuno', ex: [{w:'古い', r:'ふるい', m:'Lama / Tua (benda)'}, {w:'中古', r:'ちゅうこ', m:'Barang bekas'}], x: 'Sesuatu yang diceritakan lewat mulut (口) secara turun temurun melintasi 10 (十) generasi.' },
      { k: '何', o: 'カ', kun: 'なに, なん', m: 'Apa / Berapa', ex: [{w:'何', r:'なに', m:'Apa'}, {w:'何時', r:'なんじ', m:'Jam berapa'}], x: 'Seseorang (人) memikul beban bertanya-tanya.' }
    ];

    // ---------------------------------------------------------
    // INISIALISASI HALAMAN
    // ---------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        const grid = document.getElementById('kanjiGrid');
        const searchInput = document.getElementById('searchInput');
        const noResult = document.getElementById('noResult');
        
        // Element Modal
        const modal = document.getElementById('kanjiModal');
        const modalOverlay = document.getElementById('kanjiModalOverlay');
        const modalContent = document.getElementById('kanjiModalContent');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const animateBtn = document.getElementById('animateKanjiBtn');
        
        let hanziWriter = null;

        // Render Cards Function
        function renderCards(data) {
            grid.innerHTML = '';
            if(data.length === 0) {
                noResult.classList.remove('hidden');
            } else {
                noResult.classList.add('hidden');
                data.forEach((item, index) => {
                    const card = document.createElement('button');
                    card.className = `glass-card aspect-square rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-2 hover:bg-emerald-400/10 border border-white/5 hover:border-emerald-400/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/20 reveal group`;
                    card.style.transitionDelay = `${(index % 10) * 50}ms`;
                    
                    card.innerHTML = `
                        <span class="text-3xl md:text-5xl font-jp font-bold text-white group-hover:text-emerald-300 transition-colors mb-1 md:mb-2">${item.k}</span>
                        <span class="text-[10px] md:text-xs text-neutral-400 font-medium truncate w-full px-1">${item.m}</span>
                    `;
                    
                    card.addEventListener('click', () => openModal(item));
                    grid.appendChild(card);
                });
                
                // Trigger reveal animations
                setTimeout(() => {
                    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
                }, 10);
            }
        }

        // Search Filter
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = N5_KANJI.filter(item => 
                item.k.includes(val) || 
                item.m.toLowerCase().includes(val) ||
                item.o.toLowerCase().includes(val) ||
                item.kun.toLowerCase().includes(val) ||
                // Coba cari di romaji (sangat kasar)
                item.o.includes(val.toUpperCase())
            );
            renderCards(filtered);
        });

        // Open Modal
        function openModal(item) {
            // Update Text
            document.getElementById('modalTitle').textContent = `Kanji: ${item.k}`;
            document.getElementById('modalMeaning').textContent = item.m;
            document.getElementById('modalOnyomi').textContent = item.o || '-';
            document.getElementById('modalKunyomi').textContent = item.kun || '-';
            document.getElementById('modalExplain').textContent = item.x || 'Penjelasan belum tersedia.';
            
            // Render Examples
            const exContainer = document.getElementById('modalExamples');
            exContainer.innerHTML = '';
            item.ex.forEach(ex => {
                exContainer.innerHTML += `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div class="flex items-center gap-3">
                            <span class="text-xl font-bold font-jp text-cyan-300">${ex.w}</span>
                            <span class="text-sm text-neutral-400 font-jp bg-dark-900 px-2 py-0.5 rounded-md border border-white/10">${ex.r}</span>
                        </div>
                        <span class="text-sm font-medium text-white text-right">${ex.m}</span>
                    </div>
                `;
            });

            // Init HanziWriter
            const writerContainer = document.getElementById('hanzi-writer-container');
            writerContainer.innerHTML = ''; // Reset
            
            // Set up config based on viewport
            const isMobile = window.innerWidth < 768;
            const size = isMobile ? 200 : 250;
            
            hanziWriter = HanziWriter.create('hanzi-writer-container', item.k, {
                width: size,
                height: size,
                padding: 10,
                strokeAnimationSpeed: 1.5,
                delayBetweenStrokes: 150,
                strokeColor: '#34d399', // Emerald 400
                radicalColor: '#f472b6', // Sakura 400
                outlineColor: 'rgba(255, 255, 255, 0.1)',
                drawingColor: '#10b981',
                showCharacter: false
            });

            // Animate on load
            setTimeout(() => hanziWriter.animateCharacter(), 500);

            // Show Modal
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = '';
            }, 300);
        }

        // Events
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        animateBtn.addEventListener('click', () => {
            if(hanziWriter) {
                hanziWriter.cancelAnimations();
                hanziWriter.animateCharacter();
            }
        });

        // Initial Render
        renderCards(N5_KANJI);
        document.getElementById('totalKanjiCount').textContent = N5_KANJI.length;
    });

    // Reveal Animation Script (sama dengan home)
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight - 50) {
                el.classList.add('visible');
            }
        });
    });
    // Trigger sekali pas load
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight - 50) {
                el.classList.add('visible');
            }
        });
    }, 100);
  </script>
</body>
</html>
