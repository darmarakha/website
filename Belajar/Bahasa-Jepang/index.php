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

$katakanaPreview = [
    ['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o'],
    ['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko'],
];

$kaiwaPreview = [
    ['おはよう', 'ohayou', 'selamat pagi'],
    ['こんにちは', 'konnichiwa', 'halo/selamat siang'],
    ['ありがとう', 'arigatou', 'terima kasih'],
    ['すみません', 'sumimasen', 'permisi/maaf'],
];

$flashcards = [];
foreach ($hiraganaRows as $row) {
    foreach ($row as $cell) {
        if (!empty($cell[0])) {
            $flashcards[] = $cell;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Belajar Bahasa Jepang Interaktif</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
<main class="max-w-6xl mx-auto px-4 py-8 space-y-6">
  <section class="rounded-3xl p-8 bg-gradient-to-r from-fuchsia-600/40 via-cyan-500/30 to-emerald-500/30 border border-cyan-300/30">
    <p class="uppercase text-xs tracking-[0.2em] text-cyan-100">Belajar / Bahasa Jepang</p>
    <h1 class="text-3xl md:text-5xl font-black mt-2">Belajar Bahasa Jepang Interaktif</h1>
    <p class="mt-3 text-slate-100 max-w-3xl">Pilih materi (Hiragana, Katakana, Kaiwa), latihan dengan flashcard input jawaban, lalu dapatkan koreksi AI otomatis.</p>
    <p class="mt-4 inline-block px-4 py-2 rounded-full bg-black/30 border border-white/20 text-sm">Credit: <strong>By Darma</strong></p>
  </section>

  <section class="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
    <h2 class="font-bold text-xl mb-3">Pilih Materi</h2>
    <div class="grid md:grid-cols-3 gap-3">
      <button class="materi-btn rounded-xl p-4 text-left border border-cyan-400 bg-cyan-500/10" data-target="hiragana-panel">
        <div class="text-lg font-bold">Hiragana</div>
        <p class="text-sm text-cyan-200">Huruf dasar, tulisan, dan latihan baca-tulis.</p>
      </button>
      <button class="materi-btn rounded-xl p-4 text-left border border-slate-600 bg-slate-800/50" data-target="katakana-panel">
        <div class="text-lg font-bold">Katakana</div>
        <p class="text-sm text-slate-300">Preview materi serapan & kata asing.</p>
      </button>
      <button class="materi-btn rounded-xl p-4 text-left border border-slate-600 bg-slate-800/50" data-target="kaiwa-panel">
        <div class="text-lg font-bold">Kaiwa</div>
        <p class="text-sm text-slate-300">Preview percakapan sehari-hari.</p>
      </button>
    </div>
  </section>

  <section id="hiragana-panel" class="materi-panel space-y-5">
    <div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
      <h2 class="text-2xl font-bold mb-4">Materi Hiragana Full Set</h2>
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
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
        <h3 class="text-xl font-bold">Cara Penulisan Hiragana</h3>
        <ol class="list-decimal ml-6 mt-3 text-amber-100 space-y-1">
          <li>Dari atas ke bawah, kiri ke kanan.</li>
          <li>Ikuti stroke order (urutan goresan) yang konsisten.</li>
          <li>Latih di kertas kotak: 1 huruf 1 kotak.</li>
          <li>Bandingkan huruf mirip: さ/き, ぬ/め, れ/わ.</li>
        </ol>
      </div>

      <div class="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-5">
        <h3 class="text-xl font-bold">Flashcard + Input Jawaban</h3>
        <p class="text-sm text-cyan-100">Ketik romaji jawabanmu, lalu cek otomatis.</p>
        <div class="mt-3 bg-slate-950 rounded-xl p-5 border border-slate-700 text-center">
          <div id="flashKana" class="text-7xl font-black">あ</div>
          <input id="jawabanFlash" type="text" placeholder="contoh: a" class="mt-4 w-full rounded-lg px-3 py-2 text-slate-100 bg-slate-900 border border-slate-600 focus:outline-none focus:border-cyan-400" />
          <div id="flashResult" class="mt-3 text-sm min-h-6"></div>
          <div class="mt-4 flex flex-wrap gap-2 justify-center">
            <button onclick="cekJawabanFlash()" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Cek Jawaban</button>
            <button onclick="acakKartu()" class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500">Soal Berikutnya</button>
            <button onclick="lihatJawaban()" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">Lihat Jawaban</button>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-5">
      <h3 class="text-xl font-bold">AI Koreksi Jawaban (Simulasi Lokal)</h3>
      <p class="text-sm text-pink-100 mt-1">Masukkan jawaban latihan baca/tulis, AI akan cek kecocokan + beri saran perbaikan cepat.</p>
      <div class="grid md:grid-cols-3 gap-3 mt-4">
        <input id="targetJawaban" type="text" value="konnichiwa" class="rounded-lg px-3 py-2 bg-slate-900 border border-slate-600" />
        <input id="inputUser" type="text" placeholder="jawaban kamu" class="rounded-lg px-3 py-2 bg-slate-900 border border-slate-600" />
        <button onclick="aiKoreksi()" class="rounded-lg px-3 py-2 bg-pink-600 hover:bg-pink-500">Koreksi AI</button>
      </div>
      <div id="aiOutput" class="mt-3 text-sm"></div>
    </div>
  </section>

  <section id="katakana-panel" class="materi-panel hidden rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <h2 class="text-2xl font-bold">Preview Katakana</h2>
    <p class="text-slate-300 mt-1">Nanti lanjut materi lengkap katakana. Sementara ini preview dasar:</p>
    <div class="grid grid-cols-5 md:grid-cols-10 gap-2 mt-4">
      <?php foreach ($katakanaPreview as $k): ?>
        <div class="rounded-lg bg-slate-800 p-2 text-center border border-slate-700">
          <div class="text-2xl font-bold"><?php echo $k[0]; ?></div>
          <div class="text-xs text-cyan-300"><?php echo $k[1]; ?></div>
        </div>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="kaiwa-panel" class="materi-panel hidden rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
    <h2 class="text-2xl font-bold">Preview Kaiwa (Percakapan)</h2>
    <ul class="mt-3 space-y-2">
      <?php foreach ($kaiwaPreview as $k): ?>
        <li class="rounded-lg bg-slate-800 p-3 border border-slate-700">
          <div class="font-bold text-xl"><?php echo $k[0]; ?></div>
          <div class="text-sm text-cyan-300"><?php echo $k[1]; ?> — <?php echo $k[2]; ?></div>
        </li>
      <?php endforeach; ?>
    </ul>
  </section>
</main>

<script>
const flashcards = <?php echo json_encode($flashcards, JSON_UNESCAPED_UNICODE); ?>;
let currentCard = null;

function acakKartu() {
  const idx = Math.floor(Math.random() * flashcards.length);
  currentCard = flashcards[idx];
  document.getElementById('flashKana').textContent = currentCard[0];
  document.getElementById('jawabanFlash').value = '';
  document.getElementById('flashResult').textContent = '';
}

function normalisasiJawaban(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '');
}

function cekJawabanFlash() {
  if (!currentCard) return;
  const jawaban = normalisasiJawaban(document.getElementById('jawabanFlash').value);
  const benar = normalisasiJawaban(currentCard[1]).split('/');
  const hasil = document.getElementById('flashResult');

  if (benar.includes(jawaban)) {
    hasil.className = 'mt-3 text-sm text-emerald-300';
    hasil.textContent = '✅ Benar! Lanjut ke soal berikutnya.';
  } else {
    hasil.className = 'mt-3 text-sm text-rose-300';
    hasil.textContent = `❌ Belum tepat. Jawaban benar: ${currentCard[1]}`;
  }
}

function lihatJawaban() {
  if (!currentCard) return;
  const hasil = document.getElementById('flashResult');
  hasil.className = 'mt-3 text-sm text-cyan-300';
  hasil.textContent = `Jawaban: ${currentCard[1]}`;
}

function aiKoreksi() {
  const target = normalisasiJawaban(document.getElementById('targetJawaban').value);
  const input = normalisasiJawaban(document.getElementById('inputUser').value);
  const out = document.getElementById('aiOutput');

  if (!input) {
    out.className = 'mt-3 text-sm text-amber-300';
    out.textContent = 'Masukkan jawaban dulu ya.';
    return;
  }

  if (input === target) {
    out.className = 'mt-3 text-sm text-emerald-300';
    out.textContent = 'AI: Jawaban kamu tepat 100%. Mantap!';
    return;
  }

  const mirip = target.includes(input) || input.includes(target);
  if (mirip) {
    out.className = 'mt-3 text-sm text-yellow-300';
    out.textContent = `AI: Hampir benar. Coba rapikan ejaan ke: ${target}`;
  } else {
    out.className = 'mt-3 text-sm text-rose-300';
    out.textContent = `AI: Belum tepat. Saran: fokus bunyi suku kata, target benar: ${target}`;
  }
}

const materiButtons = document.querySelectorAll('.materi-btn');
const materiPanels = document.querySelectorAll('.materi-panel');

materiButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    materiPanels.forEach((panel) => panel.classList.add('hidden'));
    document.getElementById(btn.dataset.target).classList.remove('hidden');

    materiButtons.forEach((other) => {
      other.classList.remove('border-cyan-400', 'bg-cyan-500/10');
      other.classList.add('border-slate-600', 'bg-slate-800/50');
    });

    btn.classList.add('border-cyan-400', 'bg-cyan-500/10');
    btn.classList.remove('border-slate-600', 'bg-slate-800/50');
  });
});

acakKartu();
</script>
</body>
</html>
