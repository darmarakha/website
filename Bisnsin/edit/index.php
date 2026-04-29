<?php
session_start();

// Proteksi Halaman: Hanya Owner yang boleh masuk
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'owner') {
    header("Location: ../index.php");
    exit();
}

$dataFile = 'produk.json';
$uploadDir = 'uploads/';

// Buat folder uploads jika belum ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Baca data produk yang ada
$products = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
$uploadResults = [];

// Logika Simpan Produk Baru
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_product'])) {
    $newProduct = [
        'id' => time(),
        'title' => htmlspecialchars($_POST['title']),
        'title_en' => htmlspecialchars($_POST['title_en'] ?? ''),
        'price' => htmlspecialchars($_POST['price']),
        'shortDesc' => htmlspecialchars($_POST['shortDesc']),
        'shortDesc_en' => htmlspecialchars($_POST['shortDesc_en'] ?? ''),
        'fullDesc' => $_POST['fullDesc'], // Bisa berisi HTML
        'fullDesc_en' => $_POST['fullDesc_en'] ?? '',
        'images' => []
    ];

    // Proses Unggah File (Banyak file sekaligus)
    if (!empty($_FILES['files']['name'][0])) {
        foreach ($_FILES['files']['tmp_name'] as $key => $tmp_name) {
            $fileName = time() . '_' . basename($_FILES['files']['name'][$key]);
            $targetPath = $uploadDir . $fileName;
            $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));

            // Validasi format: jpg, jpeg, pdf
            if (in_array($fileType, ['jpg', 'jpeg', 'pdf', 'png'])) {
                if (move_uploaded_file($tmp_name, $targetPath)) {
                    $newProduct['images'][] = $targetPath;
                    $uploadResults[] = ['file' => $_FILES['files']['name'][$key], 'ok' => true];
                } else {
                    $uploadResults[] = ['file' => $_FILES['files']['name'][$key], 'ok' => false];
                }
            }
        }
    }

    $products[] = $newProduct;
    file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT));
    $_SESSION['upload_results'] = $uploadResults;
    header("Location: index.php?status=success");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rename_file'])) {
    $oldName = basename($_POST['old_name'] ?? '');
    $newNameRaw = trim($_POST['new_name'] ?? '');
    $newName = preg_replace('/[^A-Za-z0-9._-]/', '_', $newNameRaw);
    $oldPath = $uploadDir . $oldName;
    $newPath = $uploadDir . $newName;
    $oldExt = strtolower(pathinfo($oldName, PATHINFO_EXTENSION));
    $newExt = strtolower(pathinfo($newName, PATHINFO_EXTENSION));

    if ($oldName && $newName && file_exists($oldPath) && $oldExt === $newExt && !file_exists($newPath) && rename($oldPath, $newPath)) {
        foreach ($products as &$p) {
            foreach ($p['images'] as &$imgPath) {
                if ($imgPath === $oldPath) $imgPath = $newPath;
            }
        }
        unset($p, $imgPath);
        file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT));
        header("Location: index.php?status=renamed");
        exit();
    }
    header("Location: index.php?status=rename_failed");
    exit();
}

// Logika Hapus Produk
if (isset($_GET['delete'])) {
    $idToDelete = $_GET['delete'];
    foreach ($products as $key => $p) {
        if ($p['id'] == $idToDelete) {
            // Hapus file fisik juga
            foreach ($p['images'] as $img) {
                if (file_exists($img)) unlink($img);
            }
            unset($products[$key]);
        }
    }
    file_put_contents($dataFile, json_encode(array_values($products), JSON_PRETTY_PRINT));
    header("Location: index.php?status=deleted");
    exit();
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editor Katalog Bisnis — Darma Rakhaa</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif;}</style>
</head>
<body class="bg-slate-50 text-slate-900">

    <nav class="bg-white border-b sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">EB</div>
                <span class="font-bold">Editor Bisnis</span>
            </div>
            <a href="../index.php" class="text-sm font-medium text-slate-600 hover:text-red-600 flex items-center gap-1">
                <i data-lucide="external-link" class="w-4 h-4"></i> Lihat Katalog
            </a>
        </div>
    </nav>

    <main class="max-w-5xl mx-auto px-4 py-8">
        <?php $existingFiles = array_values(array_filter(scandir($uploadDir), fn($f) => $f !== '.' && $f !== '..')); ?>
        <?php $lastUploads = $_SESSION['upload_results'] ?? []; unset($_SESSION['upload_results']); ?>
        <div class="grid lg:grid-cols-3 gap-8">
            
            <div class="lg:col-span-1">
                <div class="bg-white p-6 rounded-2xl shadow-sm border sticky top-24">
                    <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <i data-lucide="plus-circle" class="text-red-600"></i> Tambah Produk
                    </h2>
                    <form action="" method="POST" enctype="multipart/form-data" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Produk / Jasa</label>
                            <input type="text" name="title" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Product / Service Name (EN)</label>
                            <input type="text" name="title_en" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Harga (Teks)</label>
                            <input type="text" name="price" placeholder="Contoh: Rp 500.000" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi Singkat</label>
                            <textarea name="shortDesc" rows="2" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Short Description (EN)</label>
                            <textarea name="shortDesc_en" rows="2" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Deskripsi Lengkap (HTML)</label>
                            <textarea name="fullDesc" rows="4" class="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Full Description (EN HTML)</label>
                            <textarea name="fullDesc_en" rows="4" class="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-red-500/20 outline-none transition-all"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Upload File (JPG, JPEG, PNG, PDF)</label>
                            <div class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-red-500 transition-colors relative">
                                <input type="file" name="files[]" multiple accept=".jpg,.jpeg,.pdf,.png" class="absolute inset-0 opacity-0 cursor-pointer">
                                <i data-lucide="upload-cloud" class="w-8 h-8 mx-auto text-slate-400 mb-2"></i>
                                <p class="text-xs text-slate-500">Klik atau seret file ke sini</p>
                                <p class="text-[10px] text-slate-400 mt-1">Cover otomatis pakai file gambar pertama (JPG/JPEG/PNG). Jika semua file PDF, kartu akan tampil sebagai dokumen PDF.</p>
                            </div>
                        </div>
                        <button type="submit" name="save_product" class="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                            Simpan Produk
                        </button>
                    </form>
                    <?php if (!empty($lastUploads)): ?>
                        <div class="mt-5 border-t pt-4">
                            <p class="text-xs font-bold uppercase text-slate-500 mb-2">Status Upload Terakhir</p>
                            <div class="space-y-1">
                                <?php foreach ($lastUploads as $item): ?>
                                    <div class="text-xs <?php echo $item['ok'] ? 'text-green-600' : 'text-red-600'; ?>">
                                        <?php echo $item['ok'] ? '✓' : '✗'; ?> <?php echo htmlspecialchars($item['file']); ?>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <div class="lg:col-span-2">
                <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                    <i data-lucide="package" class="text-slate-400"></i> Produk Anda (<?php echo count($products); ?>)
                </h2>

                <?php if (empty($products)): ?>
                    <div class="bg-white border p-12 rounded-2xl text-center">
                        <p class="text-slate-400">Belum ada produk. Silakan tambah di samping.</p>
                    </div>
                <?php endif; ?>

                <div class="space-y-4">
                    <?php foreach ($products as $p): ?>
                        <div class="bg-white p-4 rounded-2xl border flex gap-4 items-start shadow-sm">
                            <div class="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                <?php if (!empty($p['images'])): ?>
                                    <?php 
                                        $coverPath = $p['images'][0];
                                        foreach ($p['images'] as $filePath) {
                                            $candidateExt = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                                            if (in_array($candidateExt, ['jpg', 'jpeg', 'png'])) { $coverPath = $filePath; break; }
                                        }
                                        $ext = strtolower(pathinfo($coverPath, PATHINFO_EXTENSION));
                                        if ($ext === 'pdf'):
                                    ?>
                                        <div class="w-full h-full flex flex-col items-center justify-center text-red-500">
                                            <i data-lucide="file-text" class="w-8 h-8"></i>
                                            <span class="text-[10px] font-bold">PDF</span>
                                        </div>
                                    <?php else: ?>
                                        <img src="<?php echo $coverPath; ?>" class="w-full h-full object-cover">
                                    <?php endif; ?>
                                <?php endif; ?>
                            </div>
                            <div class="flex-1">
                                <h3 class="font-bold text-slate-900"><?php echo $p['title']; ?></h3>
                                <p class="text-sm font-bold text-red-600 mb-1"><?php echo $p['price']; ?></p>
                                <p class="text-xs text-slate-500 line-clamp-2"><?php echo $p['shortDesc']; ?></p>
                                <div class="mt-3 flex gap-2">
                                    <span class="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">
                                        <?php echo count($p['images']); ?> File
                                    </span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <a href="?delete=<?php echo $p['id']; ?>" onclick="return confirm('Hapus produk ini?')" class="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="mt-8 bg-white border rounded-2xl p-4">
                    <h3 class="font-bold mb-3">File di Folder Upload (<?php echo count($existingFiles); ?>)</h3>
                    <?php if (empty($existingFiles)): ?>
                        <p class="text-sm text-slate-500">Belum ada file.</p>
                    <?php else: ?>
                        <div class="space-y-2">
                            <?php foreach ($existingFiles as $file): ?>
                                <form method="POST" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                                    <input type="hidden" name="old_name" value="<?php echo htmlspecialchars($file); ?>">
                                    <input type="text" name="new_name" value="<?php echo htmlspecialchars($file); ?>" class="flex-1 px-2 py-1.5 border rounded text-sm">
                                    <button type="submit" name="rename_file" class="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded">Rename</button>
                                </form>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>
    </main>

    <script>lucide.createIcons();</script>
</body>
</html>
