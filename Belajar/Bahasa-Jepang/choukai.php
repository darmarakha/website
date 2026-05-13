<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
$isLoggedIn = !empty($_SESSION['user_name']);
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Choukai Lab (Listening)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: { extend: { fontFamily: { sans:['Inter','sans-serif'], jp:['Noto Sans JP','sans-serif'] } } }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen" data-logged-in="<?php echo $isLoggedIn ? 'true' : 'false'; ?>">
  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-3xl font-black tracking-tight">🎧 Choukai Lab</h1>
        <p class="text-sm text-slate-400 mt-1">Latihan listening JLPT N5. Suara memakai Web Speech API (tanpa file audio).</p>
      </div>
      <div class="flex gap-2">
        <a href="index.php" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10">Back</a>
        <a href="/index.php" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500">Home</a>
      </div>
    </div>

    <section class="mt-6 grid lg:grid-cols-12 gap-5">
      <aside class="lg:col-span-4 xl:col-span-3 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-extrabold">Materi</h2>
          <span class="text-[11px] text-slate-400">N5</span>
        </div>
        <div id="choukai-list" class="space-y-3"></div>
      </aside>

      <div class="lg:col-span-8 xl:col-span-9 space-y-5">
        <section class="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 id="choukai-title" class="text-xl font-black">Memuat…</h2>
              <p class="text-[12px] text-slate-400 mt-1">Tips: klik 🔊 per baris, atau putar semuanya sekaligus.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button id="btn-playall" type="button" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold">▶️ Putar Semua</button>
              <button id="btn-stop" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 font-semibold" disabled>⏹ Stop</button>
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10">
                <span class="text-xs text-slate-300">Speed</span>
                <input id="speed" type="range" min="0.7" max="1.1" step="0.01" value="0.90" class="w-28">
                <span id="speed-label" class="text-xs text-slate-200 font-mono">0.90x</span>
              </div>
            </div>
          </div>
          <div id="choukai-meta" class="mt-4"></div>
        </section>

        <section class="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 class="font-extrabold mb-4">Dialog</h3>
          <div id="choukai-dialog" class="space-y-3"></div>
        </section>

        <section id="choukai-quiz" class="space-y-3"></section>
      </div>
    </section>
  </main>

  <script src="assets/js/speech-utils.js"></script>
  <script src="assets/js/furigana-utils.js"></script>
  <script src="assets/js/choukai.js"></script>
</body>
</html>

