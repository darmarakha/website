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
// Menggunakan kredensial dari cPanel Jagoan Hosting Anda
$host = 'localhost';
$db   = 'httpgemu_website';
$user = 'httpgemu_darma';
$pass = 'macanputih123'; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    // Atur mode error ke Exception agar mudah proses debugging
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi database gagal: " . $e->getMessage());
}

/* * INSTRUKSI PENTING UNTUK TABEL:
 * Pastikan tabel `users` Anda memiliki struktur ini agar leaderboard berfungsi:
 * id INT AUTO_INCREMENT PRIMARY KEY,
 * nama_lengkap VARCHAR(100) NOT NULL,
 * email VARCHAR(100) UNIQUE NOT NULL,
 * password VARCHAR(255) NOT NULL,
 * role VARCHAR(20) DEFAULT 'member',
 * correct INT DEFAULT 0,
 * wrong INT DEFAULT 0,
 * points INT DEFAULT 0
 */

// ==========================================
// 2. LOGIKA LOGOUT
// ==========================================
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: Index.php');
    exit;
}

// ==========================================
// 3. LOGIKA LOGIN & REGISTER SQL
// ==========================================
$auth_message = '';
$auth_status = ''; // 'success' atau 'error'

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === 'register') {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            $auth_message = 'Semua kolom wajib diisi.';
            $auth_status = 'error';
        } else {
            // Cek apakah email sudah terdaftar
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $auth_message = 'Email sudah terdaftar, silakan login.';
                $auth_status = 'error';
            } else {
                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                // Insert dengan nilai default 0 untuk correct, wrong, points agar leaderboard aman
                $stmt = $pdo->prepare("INSERT INTO users (nama_lengkap, email, password, role, correct, wrong, points) VALUES (?, ?, ?, 'member', 0, 0, 0)");
                if ($stmt->execute([$name, $email, $hashedPassword])) {
                    $auth_message = 'Akun berhasil dibuat! Silakan login.';
                    $auth_status = 'success';
                } else {
                    $auth_message = 'Gagal mendaftarkan akun.';
                    $auth_status = 'error';
                }
            }
        }
    } elseif ($action === 'login') {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            $auth_message = 'Email dan kata sandi wajib diisi.';
            $auth_status = 'error';
        } else {
            // Cari user berdasarkan email
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user_data = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verifikasi password
            if ($user_data && password_verify($password, $user_data['password'])) {
                $_SESSION['user_id'] = $user_data['id'];
                $_SESSION['user_role'] = $user_data['role'];
                $_SESSION['user_name'] = $user_data['nama_lengkap'];
                
                header('Location: Index.php');
                exit;
            } else {
                $auth_message = 'Email atau kata sandi Anda salah.';
                $auth_status = 'error';
            }
        }
    }
}

// ==========================================
// 4. AMBIL DATA LEADERBOARD DARI SQL
// ==========================================
$leaderboard = [];
try {
    // Sesuaikan select dengan kolom 'nama_lengkap' sesuai skema Anda
    $stmt = $pdo->query("SELECT nama_lengkap as name, correct, wrong, points FROM users ORDER BY points DESC LIMIT 10");
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Abaikan jika tabel belum dibuat/diperbarui
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

    <!-- KOTAK LOGIN / REGISTER -->
    <section class="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6 shadow-lg">
      <h2 class="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <i data-lucide="user" class="w-5 h-5 text-emerald-400"></i> Autentikasi Sistem
      </h2>
      
      <?php if ($auth_message): ?>
          <div class="mb-4 p-3 rounded-lg border <?php echo $auth_status === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-rose-500/20 border-rose-500/50 text-rose-300'; ?> text-sm font-medium">
              <?php echo htmlspecialchars($auth_message); ?>
          </div>
      <?php endif; ?>

      <?php if (empty($_SESSION['user_name'])): ?>
        
        <!-- FORM LOGIN -->
        <form id="form-login" method="post" class="flex flex-col md:flex-row gap-3">
          <input type="hidden" name="action" value="login">
          <input type="email" name="email" required placeholder="Email Anda" class="w-full md:w-1/3 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
          <input type="password" name="password" required placeholder="Kata Sandi" class="w-full md:w-1/3 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
              <i data-lucide="log-in" class="w-4 h-4"></i> Masuk
          </button>
          <button type="button" onclick="toggleAuth()" class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors whitespace-nowrap">
              Daftar Baru
          </button>
        </form>

        <!-- FORM REGISTER (Tersembunyi by default) -->
        <form id="form-register" method="post" class="hidden flex-col md:flex-row gap-3">
          <input type="hidden" name="action" value="register">
          <input type="text" name="name" required placeholder="Nama Lengkap" class="w-full md:w-1/4 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
          <input type="email" name="email" required placeholder="Email Anda" class="w-full md:w-1/4 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
          <input type="password" name="password" required placeholder="Kata Sandi" class="w-full md:w-1/4 rounded-xl px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Buat Akun
          </button>
          <button type="button" onclick="toggleAuth()" class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors whitespace-nowrap">
              Batal
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

    // Fungsi Toggle antara Form Login dan Register
    function toggleAuth() {
        const loginForm = document.getElementById('form-login');
        const registerForm = document.getElementById('form-register');
        
        if (loginForm.classList.contains('hidden')) {
            loginForm.classList.remove('hidden');
            loginForm.classList.add('flex');
            registerForm.classList.add('hidden');
            registerForm.classList.remove('flex');
        } else {
            loginForm.classList.add('hidden');
            loginForm.classList.remove('flex');
            registerForm.classList.remove('hidden');
            registerForm.classList.add('flex');
        }
    }
  </script>
</body>
</html>
