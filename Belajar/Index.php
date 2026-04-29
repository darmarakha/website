<?php
$kategori = [
    [
        'nama' => 'Bahasa Jepang',
        'deskripsi' => 'Fokus Hiragana & Katakana + latihan hafalan flashcard interaktif.',
        'path' => 'Bahasa-Jepang/',
        'tag' => 'Fokus Utama'
    ],
    [
        'nama' => 'Bahasa Inggris',
        'deskripsi' => 'Vocabulary, grammar dasar, dan latihan percakapan.',
        'path' => 'Bahasa-Inggris/',
        'tag' => 'Bahasa'
    ],
    [
        'nama' => 'Matematika',
        'deskripsi' => 'Aritmatika, aljabar dasar, dan latihan bertahap.',
        'path' => 'Matematika/',
        'tag' => 'Pengetahuan Umum'
    ],
    [
        'nama' => 'Pengetahuan Umum',
        'deskripsi' => 'Sains, sejarah, geografi, dan wawasan umum.',
        'path' => 'Pengetahuan-Umum/',
        'tag' => 'Pengetahuan Umum'
    ],
];

$hiragana = [
    ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
    ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
];

$katakana = [
    ['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o'],
    ['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko'],
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pusat Belajar</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100">
  <main class="max-w-6xl mx-auto px-4 py-10">
    <header class="mb-10">
      <h1 class="text-3xl md:text-4xl font-bold">Pusat Belajar</h1>
      <p class="text-slate-300 mt-2">Pilih kategori belajar, disusun rapi per folder agar mudah dikelola.</p>
    </header>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Kategori Pembelajaran</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <?php foreach ($kategori as $k): ?>
          <a href="<?php echo htmlspecialchars($k['path']); ?>" class="block rounded-xl border border-slate-700 bg-slate-900 p-4 hover:border-cyan-400 transition">
            <span class="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300"><?php echo htmlspecialchars($k['tag']); ?></span>
            <h3 class="mt-3 font-semibold text-lg"><?php echo htmlspecialchars($k['nama']); ?></h3>
            <p class="text-sm text-slate-300 mt-1"><?php echo htmlspecialchars($k['deskripsi']); ?></p>
          </a>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="mb-12 rounded-2xl border border-cyan-600/40 bg-slate-900 p-6">
      <h2 class="text-2xl font-semibold">Fokus: Bahasa Jepang</h2>
      <p class="text-slate-300 mt-2">Materi awal: hafalan Huruf <strong>Hiragana</strong> dan <strong>Katakana</strong>.</p>

      <div class="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 class="text-xl font-semibold mb-3">Hiragana Dasar</h3>
          <div class="grid grid-cols-5 gap-2 text-center">
            <?php foreach ($hiragana as $h): ?>
              <div class="rounded-lg bg-slate-800 p-3">
                <div class="text-2xl font-bold"><?php echo $h[0]; ?></div>
                <div class="text-cyan-300 text-sm"><?php echo $h[1]; ?></div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-3">Katakana Dasar</h3>
          <div class="grid grid-cols-5 gap-2 text-center">
            <?php foreach ($katakana as $k): ?>
              <div class="rounded-lg bg-slate-800 p-3">
                <div class="text-2xl font-bold"><?php echo $k[0]; ?></div>
                <div class="text-cyan-300 text-sm"><?php echo $k[1]; ?></div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h3 class="text-xl font-semibold mb-3">Flashcard Cepat</h3>
        <div class="max-w-md rounded-xl border border-slate-700 p-5 bg-slate-950">
          <div id="flash-char" class="text-6xl font-bold text-center mb-2">あ</div>
          <div id="flash-romaji" class="text-center text-cyan-300 mb-4">a</div>
          <div class="flex gap-2 justify-center">
            <button onclick="prevCard()" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">Sebelumnya</button>
            <button onclick="flipCard()" class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500">Balik</button>
            <button onclick="nextCard()" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700">Berikutnya</button>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
      <h2 class="text-xl font-semibold text-amber-200">Tentang AI Auto-Fix Server</h2>
      <p class="text-amber-100 mt-2">
        AI bisa bantu <strong>diagnosis, rekomendasi, dan otomatisasi maintenance terbatas</strong>,
        tapi untuk "otomatis memperbaiki semua error server" tetap perlu guardrail: backup, monitoring,
        approval action, dan batas akses root. Aman jika dibuat bertahap (monitoring → rekomendasi → auto-action terbatas).
      </p>
    </section>
  </main>

  <script>
    const cards = [
      ['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],
      ['ア','a'],['イ','i'],['ウ','u'],['エ','e'],['オ','o']
    ];
    let idx = 0;
    let showRomaji = true;

    function renderCard(){
      document.getElementById('flash-char').textContent = cards[idx][0];
      document.getElementById('flash-romaji').textContent = showRomaji ? cards[idx][1] : '???';
    }
    function nextCard(){ idx = (idx + 1) % cards.length; showRomaji = false; renderCard(); }
    function prevCard(){ idx = (idx - 1 + cards.length) % cards.length; showRomaji = false; renderCard(); }
    function flipCard(){ showRomaji = !showRomaji; renderCard(); }
    renderCard();
  </script>
</body>
</html>
