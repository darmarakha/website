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
  <title>Kaiwa Studio (Percakapan)</title>
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
  <main class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-3xl font-black tracking-tight">💬 Kaiwa Studio</h1>
        <p class="text-sm text-slate-400 mt-1">Latihan percakapan N5 (offline). Mic & suara memakai Web Speech API.</p>
      </div>
      <div class="flex gap-2">
        <a href="index.php" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10">Back</a>
        <a href="/index.php" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500">Home</a>
      </div>
    </div>

    <section class="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <label class="text-sm text-slate-300 font-semibold" for="topic">Topik</label>
          <select id="topic" class="rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-sm"></select>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button id="btn-speak" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 font-semibold">🔊 Suara: ON</button>
          <button id="btn-stop-tts" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 font-semibold">⏹ Stop Suara</button>
          <button id="btn-mic" type="button" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 font-semibold" data-state="off">🎙 Mic</button>
          <span id="mic-status" class="text-xs text-slate-400">Mic: OFF</span>
        </div>
      </div>

      <div id="kaiwa-log" class="mt-5 h-[52vh] overflow-y-auto space-y-3 pr-1"></div>

      <form id="kaiwa-form" class="mt-5 flex flex-col sm:flex-row gap-3">
        <input id="kaiwa-input" class="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 text-sm outline-none focus:border-sky-500" placeholder="Ketik (atau pakai mic)..." autocomplete="off" />
        <button id="btn-send" type="submit" class="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold">Kirim</button>
      </form>

      <p class="mt-4 text-[12px] text-slate-500">Catatan: Speech Recognition tidak selalu tersedia di semua browser.</p>
    </section>
  </main>

  <script src="assets/js/speech-utils.js"></script>
  <script src="assets/js/furigana-utils.js"></script>
  <script src="assets/js/kaiwa-studio.js"></script>
</body>
</html>

