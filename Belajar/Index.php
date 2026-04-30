<?php
session_start();

$leaderboardFile = __DIR__ . '/leaderboard.json';
if (!file_exists($leaderboardFile)) {
    file_put_contents($leaderboardFile, json_encode([], JSON_PRETTY_PRINT));
}
$leaderboard = json_decode(file_get_contents($leaderboardFile), true) ?: [];
usort($leaderboard, fn($a, $b) => ($b['points'] ?? 0) <=> ($a['points'] ?? 0));

if (isset($_GET['logout'])) {
    unset($_SESSION['belajar_user']);
    header('Location: Index.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'])) {
    $_SESSION['belajar_user'] = trim($_POST['username']);
    header('Location: Index.php');
    exit;
}
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
  <main class="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
    <header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl md:text-4xl font-black">Pusat Belajar</h1>
        <p class="text-slate-300">Belajar bertahap + leaderboard rajin belajar.</p>
      </div>
      <a href="/index.php" class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-center">Home Utama</a>
    </header>

    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6">
      <h2 class="text-xl font-bold mb-3">Login Belajar</h2>
      <?php if (empty($_SESSION['belajar_user'])): ?>
        <form method="post" class="flex flex-col md:flex-row gap-2">
          <input name="username" required placeholder="Masukkan nama" class="w-full rounded-lg px-3 py-2 bg-slate-950 border border-slate-700" />
          <button class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Login</button>
        </form>
      <?php else: ?>
        <div class="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>Login sebagai <strong><?php echo htmlspecialchars($_SESSION['belajar_user']); ?></strong></p>
          <a href="?logout=1" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-center">Logout</a>
        </div>
      <?php endif; ?>
    </section>

    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6">
      <h2 class="text-xl font-bold mb-3">Kategori</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <a href="Bahasa-Jepang/index.php" class="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">Bahasa Jepang</a>
        <a href="Bahasa-Inggris/" class="rounded-xl border border-slate-600 bg-slate-800 p-4">Bahasa Inggris</a>
        <a href="Matematika/" class="rounded-xl border border-slate-600 bg-slate-800 p-4">Matematika</a>
        <a href="Pengetahuan-Umum/" class="rounded-xl border border-slate-600 bg-slate-800 p-4">Pengetahuan Umum</a>
      </div>
    </section>

    <section class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 md:p-6">
      <h2 class="text-xl font-bold mb-3">Peringkat Rajin Belajar</h2>
      <p class="text-sm text-amber-100 mb-3">Stat berdasarkan benar/salah dan poin dari materi latihan.</p>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-amber-200">
              <th class="py-2 pr-4">Nama</th><th class="py-2 pr-4">Benar</th><th class="py-2 pr-4">Salah</th><th class="py-2 pr-4">Win Rate</th><th class="py-2 pr-4">Poin</th>
            </tr>
          </thead>
          <tbody>
          <?php if (empty($leaderboard)): ?>
            <tr><td colspan="5" class="py-3 text-slate-300">Belum ada data.</td></tr>
          <?php else: foreach (array_slice($leaderboard,0,10) as $row):
              $total = max(1, ($row['correct'] ?? 0) + ($row['wrong'] ?? 0));
              $wr = round((($row['correct'] ?? 0) / $total) * 100, 1);
          ?>
            <tr class="border-t border-slate-700">
              <td class="py-2 pr-4"><?php echo htmlspecialchars($row['name'] ?? '-'); ?></td>
              <td class="py-2 pr-4"><?php echo (int)($row['correct'] ?? 0); ?></td>
              <td class="py-2 pr-4"><?php echo (int)($row['wrong'] ?? 0); ?></td>
              <td class="py-2 pr-4"><?php echo $wr; ?>%</td>
              <td class="py-2 pr-4 font-bold text-cyan-300"><?php echo (int)($row['points'] ?? 0); ?></td>
            </tr>
          <?php endforeach; endif; ?>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</body>
</html>
