<?php
// Wajib di baris pertama untuk mengambil sesi dari login utama
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// Logika Logout opsional jika user menekan tombol logout dari halaman ini
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: ../Index.php'); // Arahkan kembali ke halaman utama setelah logout
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bahasa Jepang - Pusat Belajar</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">
  <main class="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
    
    <!-- HEADER & STATUS LOGIN -->
    <header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between shadow-lg">
      <div>
        <h1 class="text-2xl md:text-4xl font-black text-white">Bahasa Jepang</h1>
        <p class="text-slate-400 mt-1">Pilih materi per halaman agar rapi.</p>
      </div>
      
      <div class="flex flex-col md:items-end gap-3">
        <!-- DETEKSI SESSION LOGIN -->
        <?php if (!empty($_SESSION['user_name'])): ?>
            <div class="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                <div class="text-right">
                    <p class="text-xs text-slate-400">Masuk sebagai:</p>
                    <p class="text-base text-white font-bold tracking-wide"><?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
                </div>
                <!-- Tombol Logout -->
                <a href="?logout=1" class="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors" title="Keluar">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                </a>
            </div>
        <?php else: ?>
            <div class="flex items-center gap-2 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 text-amber-300 text-sm font-medium">
                <i data-lucide="alert-circle" class="w-4 h-4"></i> Anda belum login (Guest)
            </div>
        <?php endif; ?>

        <div class="flex gap-2 w-full md:w-auto">
          <a href="../Index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors flex items-center gap-2">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back
          </a>
          <a href="/index.php" class="flex-1 md:flex-none justify-center px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center gap-2">
              <i data-lucide="home" class="w-4 h-4"></i> Home
          </a>
        </div>
      </div>
    </header>

    <!-- PILIHAN MATERI -->
    <section class="grid sm:grid-cols-3 gap-4">
      <a href="hiragana.php" class="rounded-xl p-5 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all group shadow-lg">
          <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-cyan-300 group-hover:text-cyan-200 text-lg">Hiragana</h3>
              <span class="text-cyan-400/50 group-hover:text-cyan-400"><i data-lucide="book-open" class="w-5 h-5"></i></span>
          </div>
          <p class="text-xs text-slate-400">Belajar huruf dasar asli Jepang.</p>
      </a>
      <a href="katakana.php" class="rounded-xl p-5 border border-fuchsia-500/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-all group shadow-lg">
          <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-fuchsia-300 group-hover:text-fuchsia-200 text-lg">Katakana</h3>
              <span class="text-fuchsia-400/50 group-hover:text-fuchsia-400"><i data-lucide="pen-tool" class="w-5 h-5"></i></span>
          </div>
          <p class="text-xs text-slate-400">Belajar huruf serapan bahasa asing.</p>
      </a>
      <a href="kaiwa.php" class="rounded-xl p-5 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all group shadow-lg">
          <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-emerald-300 group-hover:text-emerald-200 text-lg">Kaiwa</h3>
              <span class="text-emerald-400/50 group-hover:text-emerald-400"><i data-lucide="message-circle" class="w-5 h-5"></i></span>
          </div>
          <p class="text-xs text-slate-400">Latihan percakapan intensif 2 hari.</p>
      </a>
    </section>

    <!-- MAINTENANCE -->
    <section class="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent p-5 shadow-lg">
      <h2 class="font-bold text-amber-400 flex items-center gap-2 mb-2">
          <i data-lucide="settings" class="w-5 h-5 animate-spin-slow"></i> AI Maintenance Check
      </h2>
      <p id="maint" class="text-sm text-amber-200/80">Checking...</p>
    </section>

    <p class="text-center text-sm text-slate-500 pt-4">Credit: <strong class="text-slate-400">By Darma</strong></p>
  </main>

  <style>
      .animate-spin-slow { animation: spin 3s linear infinite; }
  </style>

  <script>
    // Inisialisasi Icon Lucide
    lucide.createIcons();

    // Simulasi pengecekan AI maintenance
    setTimeout(() => {
        document.getElementById('maint').innerHTML = '<span class="text-emerald-400 flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> Sistem normal, sinkronisasi sesi aktif. Tidak ada error terdeteksi.</span>';
        lucide.createIcons(); // Re-init icon di dalam innerHTML
    }, 800);
  </script>
</body>
</html>
