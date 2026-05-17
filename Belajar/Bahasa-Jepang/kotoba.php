<?php
session_start();
$words = [
  ['jp'=>'わたし','romaji'=>'watashi','id'=>'saya','cat'=>'orang'],
  ['jp'=>'あなた','romaji'=>'anata','id'=>'kamu','cat'=>'orang'],
  ['jp'=>'せんせい','romaji'=>'sensei','id'=>'guru','cat'=>'orang'],
  ['jp'=>'がくせい','romaji'=>'gakusei','id'=>'pelajar','cat'=>'orang'],
  ['jp'=>'ともだち','romaji'=>'tomodachi','id'=>'teman','cat'=>'orang'],
  ['jp'=>'いえ','romaji'=>'ie','id'=>'rumah','cat'=>'tempat'],
  ['jp'=>'がっこう','romaji'=>'gakkou','id'=>'sekolah','cat'=>'tempat'],
  ['jp'=>'えき','romaji'=>'eki','id'=>'stasiun','cat'=>'tempat'],
  ['jp'=>'みせ','romaji'=>'mise','id'=>'toko','cat'=>'tempat'],
  ['jp'=>'へや','romaji'=>'heya','id'=>'kamar','cat'=>'tempat'],
  ['jp'=>'みず','romaji'=>'mizu','id'=>'air','cat'=>'benda'],
  ['jp'=>'ほん','romaji'=>'hon','id'=>'buku','cat'=>'benda'],
  ['jp'=>'くるま','romaji'=>'kuruma','id'=>'mobil','cat'=>'benda'],
  ['jp'=>'でんしゃ','romaji'=>'densha','id'=>'kereta listrik','cat'=>'benda'],
  ['jp'=>'でんわ','romaji'=>'denwa','id'=>'telepon','cat'=>'benda'],
  ['jp'=>'たべる','romaji'=>'taberu','id'=>'makan','cat'=>'kata kerja'],
  ['jp'=>'のむ','romaji'=>'nomu','id'=>'minum','cat'=>'kata kerja'],
  ['jp'=>'いく','romaji'=>'iku','id'=>'pergi','cat'=>'kata kerja'],
  ['jp'=>'くる','romaji'=>'kuru','id'=>'datang','cat'=>'kata kerja'],
  ['jp'=>'みる','romaji'=>'miru','id'=>'melihat','cat'=>'kata kerja'],
  ['jp'=>'おおきい','romaji'=>'ookii','id'=>'besar','cat'=>'sifat'],
  ['jp'=>'ちいさい','romaji'=>'chiisai','id'=>'kecil','cat'=>'sifat'],
  ['jp'=>'あたらしい','romaji'=>'atarashii','id'=>'baru','cat'=>'sifat'],
  ['jp'=>'ふるい','romaji'=>'furui','id'=>'lama/tua','cat'=>'sifat'],
  ['jp'=>'たかい','romaji'=>'takai','id'=>'tinggi/mahal','cat'=>'sifat'],
  ['jp'=>'やすい','romaji'=>'yasui','id'=>'murah','cat'=>'sifat'],
  ['jp'=>'きょう','romaji'=>'kyou','id'=>'hari ini','cat'=>'waktu'],
  ['jp'=>'あした','romaji'=>'ashita','id'=>'besok','cat'=>'waktu'],
  ['jp'=>'きのう','romaji'=>'kinou','id'=>'kemarin','cat'=>'waktu'],
  ['jp'=>'まいにち','romaji'=>'mainichi','id'=>'setiap hari','cat'=>'waktu']
];
$cats = array_values(array_unique(array_column($words, 'cat')));
?><!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kotoba N5 - GemuYokai Nihongo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+JP:wght@500;700;900&display=swap" rel="stylesheet">
  <style>
    :root{--bg:#101010;--panel:#181818;--card:#1f1f1f;--line:#303030;--text:#f5f1ea;--muted:#aaa29a;--accent:#d58a3a;--soft:#25211d}*{box-sizing:border-box}body{margin:0;background:linear-gradient(180deg,#0c0c0c,#15120f);color:var(--text);font-family:Inter,system-ui,sans-serif}.jp{font-family:'Noto Sans JP',sans-serif}.wrap{width:min(1120px,calc(100% - 28px));margin:auto}.top{position:sticky;top:0;background:rgba(16,16,16,.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);z-index:10}.nav{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;gap:12px;align-items:center;font-weight:800}.mark{width:44px;height:44px;border-radius:14px;background:#2a2119;border:1px solid #4a3524;color:#f1b66f;display:grid;place-items:center}.btn{border:1px solid #59402c;background:#261d16;color:#f4c58d;border-radius:999px;padding:10px 14px;text-decoration:none;font-weight:800}.hero{padding:62px 0 28px;display:grid;grid-template-columns:1fr .8fr;gap:20px}.panel{background:rgba(31,31,31,.86);border:1px solid var(--line);border-radius:26px;padding:24px}.eyebrow{color:#f1b66f;background:#221a13;border:1px solid #4b3422;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:800;display:inline-block}.hero h1{font-size:clamp(36px,6vw,72px);line-height:1;margin:16px 0 10px;letter-spacing:-.06em}.hero p{color:var(--muted);line-height:1.75}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:24px 0 48px}.word{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px}.word b{font-size:28px}.word small{display:block;color:#f1b66f;font-weight:800;margin-top:6px}.word p{color:var(--muted);margin:10px 0 0}.quiz{display:grid;gap:12px}.q{background:#151515;border:1px solid var(--line);border-radius:18px;padding:16px}.q button{display:block;width:100%;margin-top:8px;text-align:left;border:1px solid var(--line);background:#202020;color:var(--text);border-radius:14px;padding:10px;cursor:pointer}.q button:hover{border-color:#9a6a3b;background:#261d16}@media(max-width:820px){.hero{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.nav{flex-wrap:wrap;padding:10px 0}}
  </style>
</head>
<body>
<header class="top"><div class="wrap nav"><a class="brand" href="index.php" style="color:inherit;text-decoration:none"><span class="mark jp">語</span><span>Kotoba N5<br><small style="color:var(--muted)">Kosakata dan latihan JLPT dasar</small></span></a><a class="btn" href="index.php">← Menu Bahasa Jepang</a></div></header>
<main class="wrap">
  <section class="hero">
    <div class="panel"><span class="eyebrow">Kosakata N5</span><h1>Kotoba untuk fondasi JLPT N5.</h1><p>Kumpulan kata dasar disusun per kategori. Bagian ujian di bawah dibuat ringan dulu supaya halaman langsung berfungsi dan tidak mengganggu menu lain.</p></div>
    <div class="panel"><h2 style="margin-top:0">Kategori</h2><?php foreach($cats as $cat): ?><span class="eyebrow" style="margin:4px"><?= htmlspecialchars($cat) ?></span><?php endforeach; ?></div>
  </section>
  <section class="grid"><?php foreach($words as $w): ?><article class="word"><b class="jp"><?= htmlspecialchars($w['jp']) ?></b><small><?= htmlspecialchars($w['romaji']) ?> · <?= htmlspecialchars($w['cat']) ?></small><p><?= htmlspecialchars($w['id']) ?></p></article><?php endforeach; ?></section>
  <section class="panel" style="margin-bottom:48px"><span class="eyebrow">Latihan JLPT</span><h2>Ujian Kotoba Singkat</h2><div class="quiz" id="quiz"></div></section>
</main>
<script>
const words = <?= json_encode($words, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;
const quiz = document.getElementById('quiz');
const sample = words.slice(0, 10);
quiz.innerHTML = sample.map((w, i) => {
  const opts = [w.id, ...words.filter(x => x.id !== w.id).sort(() => Math.random() - .5).slice(0,3).map(x => x.id)].sort(() => Math.random() - .5);
  return `<div class="q"><strong>${i+1}. Apa arti dari <span class="jp">${w.jp}</span>?</strong>${opts.map(o => `<button onclick="this.style.borderColor='${o===w.id?'#52c27a':'#d75f5f'}';this.style.color='${o===w.id?'#87e3a5':'#ff9c9c'}'">${o}</button>`).join('')}</div>`;
}).join('');
</script>
</body>
</html>