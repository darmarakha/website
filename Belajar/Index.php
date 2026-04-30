<?php
// Wajib di baris pertama untuk melacak status login user (Sesuai contoh Anda yang benar)
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

// ==========================================
// 1. KONFIGURASI DATABASE SQL (PDO)
// ==========================================
$host = 'localhost';
$dbname = 'belajar_jepang_db'; // Ganti dengan nama database Anda
$dbuser = 'root';              // Ganti dengan username database Anda
$dbpass = '';                  // Ganti dengan password database Anda

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $dbuser, $dbpass);
    // Atur mode error ke Exception agar mudah proses debugging
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi database gagal. Pastikan database MySQL sudah menyala: " . $e->getMessage());
}

/* * INSTRUKSI UNTUK SQL:
 * Jalankan query ini di phpMyAdmin Anda untuk membuat tabelnya:
 * * CREATE TABLE users (
 * id INT AUTO_INCREMENT PRIMARY KEY,
 * username VARCHAR(50) UNIQUE NOT NULL,
 * password VARCHAR(255) NOT NULL,
 * role VARCHAR(20) DEFAULT 'member',
 * correct INT DEFAULT 0,
 * wrong INT DEFAULT 0,
 * points INT DEFAULT 0
 * );
 */

// ==========================================
// 2. LOGIKA LOGOUT
// ==========================================
if (isset($_GET['logout'])) {
    unset($_SESSION['user_name']);
    unset($_SESSION['user_role']);
    session_destroy();
    header('Location: Index.php');
    exit;
}

// ==========================================
// 3. LOGIKA LOGIN SQL
// ==========================================
$login_error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username']) && isset($_POST['password'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if ($username !== '' && $password !== '') {
        // Cari user di database
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Jika user ada DAN password cocok (Gunakan password_verify untuk keamanan tingkat lanjut)
        // Catatan: Pastikan saat register, password di-hash menggunakan password_hash()
        if ($user && password_verify($password, $user['password'])) {
            // Gunakan penamaan session sesuai contoh "benar" Anda
            $_SESSION['user_name'] = $user['username'];
            $_SESSION['user_role'] = $user['role'];
            header('Location: Index.php');
            exit;
        } else {
            $login_error = 'Username atau kata sandi salah!';
        }
    }
}

// ==========================================
// 4. AMBIL DATA LEADERBOARD DARI SQL
// ==========================================
$leaderboard = [];
try {
    // Ambil 10 user dengan poin tertinggi dari database
    $stmt = $pdo->query("SELECT username as name, correct, wrong, points FROM users ORDER BY points DESC LIMIT 10");
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Abaikan jika tabel belum dibuat (agar halaman tidak crash)
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pusat Belajar</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased">
  <main class="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
    
    <!-- HEADER -->
    <header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between shadow-lg">
      <div>
        <h1 class="text-2xl md:text-4xl font-black text-white">Pusat Belajar</h1>
        <p class="text-slate-400 mt-1">Belajar bertahap + leaderboard terintegrasi SQL.</p>
      </div>
      <a href="/index.php" class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-center font-semibold transition-colors flex items-center justify-center gap-2">
          <i data-lucide="home" class="w-4 h-4"></i> Home Utama
      </a>
    </header>

    <!-- KOTAK LOGIN -->
    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <i data-lucide="user" class="w-5 h-5 text-emerald-400"></i> Autentikasi SQL
      </h2>
      
      <?php if ($login_error): ?>
          <div class="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-300 text-sm font-medium">
              <?php echo $login_error; ?>
          </div>
      <?php endif; ?>

      <?php if (empty($_SESSION['user_name'])): ?>
        <form method="post" class="flex flex-col md:flex-row gap-3">
          <input type="text" name="username" required placeholder="Nama Pengguna" class="w-full md:w-1/3 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
          <input type="password" name="password" required placeholder="Kata Sandi" class="w-full md:w-1/3 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors flex items-center justify-center gap-2">
              <i data-lucide="log-in" class="w-4 h-4"></i> Login
          </button>
        </form>
      <?php else: ?>
        <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
              <p class="text-slate-400 text-sm">Masuk sebagai:</p>
              <p class="text-lg text-white font-bold tracking-wide"><?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
              <p class="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mt-1"><?php echo isset($_SESSION['user_role']) ? htmlspecialchars($_SESSION['user_role']) : 'MEMBER'; ?></p>
          </div>
          <a href="?logout=1" class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-center transition-colors flex items-center justify-center gap-2">
              <i data-lucide="log-out" class="w-4 h-4"></i> Logout
          </a>
        </div>
      <?php endif; ?>
    </section>

    <!-- KATEGORI BELAJAR -->
    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4 text-white">Kategori</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="Bahasa-Jepang/index.php" class="rounded-xl border-2 border-cyan-500/50 bg-cyan-500/10 p-5 hover:bg-cyan-500/20 transition-colors group">
            <h3 class="font-bold text-cyan-300 group-hover:text-cyan-200">Bahasa Jepang</h3>
            <p class="text-xs text-slate-400 mt-2">Katakana, Hiragana, Kanji</p>
        </a>
        <a href="Bahasa-Inggris/" class="rounded-xl border border-slate-700 bg-slate-950 p-5 hover:border-slate-500 transition-colors">
            <h3 class="font-bold text-slate-200">Bahasa Inggris</h3>
            <p class="text-xs text-slate-500 mt-2">Grammar & Vocab</p>
        </a>
        <a href="Matematika/" class="rounded-xl border border-slate-700 bg-slate-950 p-5 hover:border-slate-500 transition-colors">
            <h3 class="font-bold text-slate-200">Matematika</h3>
            <p class="text-xs text-slate-500 mt-2">Logika & Aljabar</p>
        </a>
        <a href="Pengetahuan-Umum/" class="rounded-xl border border-slate-700 bg-slate-950 p-5 hover:border-slate-500 transition-colors">
            <h3 class="font-bold text-slate-200">Pengetahuan Umum</h3>
            <p class="text-xs text-slate-500 mt-2">Sejarah & Geografi</p>
        </a>
      </div>
    </section>

    <!-- LEADERBOARD SQL -->
    <section class="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent p-4 md:p-6 shadow-lg">
      <div class="flex items-center gap-2 mb-2">
          <i data-lucide="trophy" class="w-6 h-6 text-amber-400"></i>
          <h2 class="text-xl font-bold text-amber-400">Peringkat Rajin Belajar (Live SQL)</h2>
      </div>
      <p class="text-sm text-amber-200/60 mb-5">Diambil secara real-time dari database MySQL.</p>
      
      <div class="overflow-x-auto bg-slate-950/50 rounded-xl border border-slate-800">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-amber-200/80 border-b border-slate-800 bg-slate-900/50">
              <th class="py-3 px-4 font-semibold">Rank</th>
              <th class="py-3 px-4 font-semibold">Nama</th>
              <th class="py-3 px-4 font-semibold text-emerald-400">Benar</th>
              <th class="py-3 px-4 font-semibold text-rose-400">Salah</th>
              <th class="py-3 px-4 font-semibold">Win Rate</th>
              <th class="py-3 px-4 font-semibold text-cyan-300">Total Poin</th>
            </tr>
          </thead>
          <tbody>
          <?php if (empty($leaderboard)): ?>
            <tr><td colspan="6" class="py-6 text-center text-slate-500 font-medium">Belum ada data di Database SQL.</td></tr>
          <?php else: 
              $rank = 1;
              foreach ($leaderboard as $row):
              $total = max(1, ($row['correct'] ?? 0) + ($row['wrong'] ?? 0));
              $wr = round((($row['correct'] ?? 0) / $total) * 100, 1);
          ?>
            <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td class="py-3 px-4 font-bold text-slate-500">#<?php echo $rank++; ?></td>
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                  <?php if($rank == 2) echo '👑 '; ?>
                  <?php echo htmlspecialchars($row['name'] ?? '-'); ?>
              </td>
              <td class="py-3 px-4 font-medium text-emerald-400/80"><?php echo (int)($row['correct'] ?? 0); ?></td>
              <td class="py-3 px-4 font-medium text-rose-400/80"><?php echo (int)($row['wrong'] ?? 0); ?></td>
              <td class="py-3 px-4 font-medium text-slate-300">
                  <div class="flex items-center gap-2">
                      <span><?php echo $wr; ?>%</span>
                      <div class="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                          <div class="h-full bg-amber-400" style="width: <?php echo $wr; ?>%"></div>
                      </div>
                  </div>
              </td>
              <td class="py-3 px-4 font-black text-cyan-400 text-base"><?php echo (int)($row['points'] ?? 0); ?></td>
            </tr>
          <?php endforeach; endif; ?>
          </tbody>
        </table>
      </div>
    </section>
  </main>
  
  <script>
    // Inisialisasi ikon Lucide
    lucide.createIcons();
  </script>
</body>
</html>
