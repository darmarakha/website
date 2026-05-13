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
  <title>Belajar Bahasa Inggris</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <main class="max-w-3xl mx-auto px-4 py-10">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-3xl font-black">🇬🇧 Bahasa Inggris</h1>
      <a href="../Index.php" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10">Back</a>
    </div>
    <p class="mt-4 text-slate-400">Placeholder modul. Kamu bisa isi materi Grammar & Vocabulary di sini.</p>
  </main>
</body>
</html>

