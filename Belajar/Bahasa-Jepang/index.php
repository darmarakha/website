<?php
$hiraganaRows = [
    [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']],
    [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']],
    [['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']],
    [['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to']],
    [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']],
    [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho']],
    [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']],
    [['や', 'ya'], ['', ''], ['ゆ', 'yu'], ['', ''], ['よ', 'yo']],
    [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']],
    [['わ', 'wa'], ['', ''], ['', ''], ['', ''], ['を', 'wo']],
    [['ん', 'n'], ['', ''], ['', ''], ['', ''], ['', '']],
];

$dakuon = [
    ['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go'],
    ['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo'],
    ['だ', 'da'], ['ぢ', 'ji/di'], ['づ', 'zu/du'], ['で', 'de'], ['ど', 'do'],
    ['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo'],
    ['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po'],
];

$kombinasi = [
    ['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'],
    ['しゃ', 'sha'], ['しゅ', 'shu'], ['しょ', 'sho'],
    ['ちゃ', 'cha'], ['ちゅ', 'chu'], ['ちょ', 'cho'],
    ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo'],
    ['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'],
    ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo'],
    ['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'],
    ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo'],
    ['じゃ', 'ja'], ['じゅ', 'ju'], ['じょ', 'jo'],
    ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'],
    ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
];

$kataLatihan = [
    ['さくら', 'sakura', 'bunga sakura'],
    ['ひこうき', 'hikouki', 'pesawat'],
    ['にほん', 'nihon', 'Jepang'],
    ['がっこう', 'gakkou', 'sekolah'],
    ['ともだち', 'tomodachi', 'teman'],
    ['おちゃ', 'ocha', 'teh'],
    ['きょう', 'kyou', 'hari ini'],
];

$flashcards = [];
foreach ($hiraganaRows as $row) {
    foreach ($row as $cell) {
        if (!empty($cell[0])) {
            $flashcards[] = $cell;
        }
    }
}
foreach ($dakuon as $item) {
    $flashcards[] = $item;
}
foreach ($kombinasi as $item) {
    $flashcards[] = $item;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Belajar Hiragana Seru</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
    <section class="rounded-3xl p-8 bg-gradient-to-r from-fuchsia-600/40 via-cyan-500/30 to-emerald-500/30 border border-cyan-300/30 shadow-2xl">
      <p class="uppercase text-xs tracking-[0.2em] text-cyan-100">Belajar / Bahasa Jepang</p>
      <h1 class="text-3xl md:text-5xl font-black mt-2">Hiragana Full Set</h1>
      <p class="mt-3 text-slate-100 max-w-3xl">Materi fokus Hiragana lengkap: huruf dasar, dakuten/handakuten, kombinasi, cara penulisan yang benar, flashcard acak, dan latihan menulis + membaca.</p>
      <p class="mt-4 inline-block px-4 py-2 rounded-full bg-black/30 border border-white/20 text-sm">Credit: <strong>By Darma</strong></p>
    </section>

    <section class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
      <h2 class="text-2xl font-bold mb-4">1) Tabel Hiragana Dasar (Gojuon)</h2>
      <div class="grid gap-2">
        <?php foreach ($hiraganaRows as $row): ?>
          <div class="grid grid-cols-5 gap-2">
            <?php foreach ($row as $cell): ?>
              <div class="rounded-xl p-3 text-center <?php echo empty($cell[0]) ? 'bg-slate-800/40' : 'bg-slate-800 border border-slate-700'; ?>">
                <div class="text-3xl font-bold"><?php echo htmlspecialchars($cell[0]); ?></div>
                <div class="text-cyan-300 text-sm"><?php echo htmlspecialchars($cell[1]); ?></div>
              </div>
            <?php endforeach; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="grid md:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-5">
        <h3 class="text-xl font-semibold">2) Dakuten & Handakuten</h3>
        <div class="grid grid-cols-5 gap-2 mt-3">
          <?php foreach ($dakuon as $d): ?>
            <div class="bg-slate-900 rounded-lg p-2 text-center">
              <div class="text-2xl font-bold"><?php echo $d[0]; ?></div>
              <div class="text-xs text-indigo-200"><?php echo $d[1]; ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
      <div class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
        <h3 class="text-xl font-semibold">3) Kombinasi Kecil (ゃゅょ)</h3>
        <div class="grid grid-cols-3 gap-2 mt-3">
          <?php foreach ($kombinasi as $k): ?>
            <div class="bg-slate-900 rounded-lg p-2 text-center">
              <div class="text-2xl font-bold"><?php echo $k[0]; ?></div>
              <div class="text-xs text-emerald-200"><?php echo $k[1]; ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
      <h2 class="text-2xl font-bold">4) Cara Penulisan Hiragana yang Benar</h2>
      <ol class="list-decimal ml-6 mt-3 space-y-2 text-amber-100">
        <li>Tulis dari <strong>atas ke bawah</strong> dan <strong>kiri ke kanan</strong>.</li>
        <li>Ikuti urutan goresan (stroke order): mulai dari garis utama, lalu pelengkap kecil.</li>
        <li>Gunakan kotak latihan: satu huruf satu kotak agar proporsi konsisten.</li>
        <li>Ulang 5–10 kali per huruf: lihat contoh → tiru → tulis tanpa melihat.</li>
        <li>Perhatikan perbedaan bentuk mirip: さ vs き, ぬ vs め, れ vs わ.</li>
      </ol>
    </section>

    <section class="grid lg:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-6">
        <h2 class="text-2xl font-bold">5) Flashcard Acak (Random)</h2>
        <p class="text-sm text-cyan-100">Kartu diacak setiap klik sehingga pola tidak monoton.</p>
        <div class="mt-4 rounded-2xl bg-slate-950 p-6 text-center border border-slate-700">
          <div id="flashKana" class="text-7xl font-black">あ</div>
          <div id="flashRomaji" class="text-lg text-cyan-300 mt-2">a</div>
          <div class="flex gap-2 justify-center mt-5">
            <button onclick="acakKartu()" class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500">Acak Lagi</button>
            <button onclick="balikKartu()" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">Sembunyikan/Tampilkan</button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-6">
        <h2 class="text-2xl font-bold">6) Latihan Membaca & Menulis</h2>
        <ul class="space-y-2 mt-3">
          <?php foreach ($kataLatihan as $k): ?>
            <li class="bg-slate-900/80 rounded-lg p-3 border border-slate-700">
              <div class="text-2xl font-bold"><?php echo $k[0]; ?></div>
              <div class="text-sm text-pink-200">Romaji: <?php echo $k[1]; ?> — Arti: <?php echo $k[2]; ?></div>
            </li>
          <?php endforeach; ?>
        </ul>
        <p class="text-sm mt-4 text-pink-100">Tantangan: tutup romaji, baca hiragana dulu, lalu tulis ulang di buku kotak.</p>
      </div>
    </section>
  </main>

  <script>
    const flashcards = <?php echo json_encode($flashcards, JSON_UNESCAPED_UNICODE); ?>;
    let visible = true;
    let lastIdx = -1;

    function acakKartu() {
      let idx;
      do {
        idx = Math.floor(Math.random() * flashcards.length);
      } while (idx === lastIdx && flashcards.length > 1);

      lastIdx = idx;
      document.getElementById('flashKana').textContent = flashcards[idx][0];
      document.getElementById('flashRomaji').textContent = visible ? flashcards[idx][1] : '???';
    }

    function balikKartu() {
      visible = !visible;
      document.getElementById('flashRomaji').textContent = visible && lastIdx >= 0 ? flashcards[lastIdx][1] : '???';
    }

    acakKartu();
  </script>
</body>
</html>
