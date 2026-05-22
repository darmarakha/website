<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bunpou (Tata Bahasa) - N5</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <main class="max-w-4xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-black">Bunpou (Tata Bahasa) N5</h1>
      <div class="flex gap-2">
        <a href="index.php" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10">Kembali</a>
        <a href="/index.php" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500">Home</a>
      </div>
    </div>
    <p class="mt-4 text-slate-400">Daftar pola tata bahasa dasar JLPT N5.</p>

    <div class="mt-8 space-y-4">
      <?php
      $bunpouList = [
        ['pola' => '〜は〜です', 'arti' => 'A adalah B', 'contoh' => 'わたしは学生です。'],
        ['pola' => '〜は〜ではありません', 'arti' => 'A bukan B', 'contoh' => 'これは本ではありません。'],
        ['pola' => '〜は〜でした', 'arti' => 'A adalah B (lampau)', 'contoh' => 'きのうは休みでした。'],
        ['pola' => '〜は〜ではありませんでした', 'arti' => 'A bukan B (lampau)', 'contoh' => 'あれはペンではありませんでした。'],
        ['pola' => '〜がいます / 〜がある', 'arti' => 'Ada (makhluk hidup / benda)', 'contoh' => '猫がいます。本がある。'],
        ['pola' => '〜に〜がある / いる', 'arti' => 'Di ~ ada ~', 'contoh' => '机の上に本がある。'],
        ['pola' => '〜を〜ます', 'arti' => 'KK transitif → objek', 'contoh' => '水を飲みます。'],
        ['pola' => '〜で〜ます', 'arti' => 'Melakukan aksi di ~', 'contoh' => '図書館で勉強します。'],
        ['pola' => '〜へ行きます', 'arti' => 'Pergi ke ~', 'contoh' => '日本へ行きます。'],
        ['pola' => '〜と〜', 'arti' => 'A dan B (daftar lengkap)', 'contoh' => '本とペンを買います。'],
        ['pola' => '〜や〜など', 'arti' => 'A, B, dll (daftar parsial)', 'contoh' => '机の上に本やペンなどがある。'],
        ['pola' => '〜たい', 'arti' => 'Ingin ~', 'contoh' => '日本へ行きたい。'],
        ['pola' => '〜ましょう', 'arti' => 'Mari ~ (ajakan)', 'contoh' => 'いっしょに行きましょう。'],
        ['pola' => '〜てください', 'arti' => 'Tolong ~', 'contoh' => '窓を開けてください。'],
        ['pola' => '〜てもいいです', 'arti' => 'Boleh ~', 'contoh' => 'ここに座ってもいいです。'],
        ['pola' => '〜てはいけません', 'arti' => 'Tidak boleh ~', 'contoh' => 'ここでタバコを吸ってはいけません。'],
        ['pola' => '〜ないでください', 'arti' => 'Tolong jangan ~', 'contoh' => 'ここに書かないでください。'],
        ['pola' => '〜なければなりません', 'arti' => 'Harus ~', 'contoh' => '薬を飲まなければなりません。'],
        ['pola' => '〜が、〜', 'arti' => 'Tetapi / Namun', 'contoh' => '高いですが、買います。'],
        ['pola' => '〜から / 〜ので', 'arti' => 'Karena ~', 'contoh' => '雨が降ったから、行きません。'],
        ['pola' => '〜たことがある', 'arti' => 'Pernah ~', 'contoh' => '富士山に登ったことがある。'],
        ['pola' => '〜たり〜たりする', 'arti' => 'Kadang~ kadang~', 'contoh' => '本を読んだり、音楽を聞いたりします。'],
        ['pola' => '〜ほうがいい', 'arti' => 'Sebaiknya ~', 'contoh' => '早く寝たほうがいい。'],
        ['pola' => '〜かもしれません', 'arti' => 'Mungkin ~', 'contoh' => '明日は雨かもしれません。'],
        ['pola' => '〜くれる / あげる / もらう', 'arti' => 'Memberi / menerima', 'contoh' => '母が本をくれた。'],
      ];
      foreach ($bunpouList as $b):
      ?>
      <div class="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <code class="text-lg font-jp text-sky-300"><?= htmlspecialchars($b['pola']) ?></code>
            <p class="text-slate-400 text-sm mt-1"><?= htmlspecialchars($b['arti']) ?></p>
          </div>
          <div class="text-right">
            <p class="text-sm font-jp text-slate-300"><?= htmlspecialchars($b['contoh']) ?></p>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="mt-10 text-center">
      <p class="text-slate-500 text-sm">Latihan percakapan tersedia di <a class="text-sky-300 underline" href="kaiwa.php">Kaiwa Studio</a>.</p>
    </div>
  </main>
</body>
</html>
