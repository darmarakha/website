<?php
session_start();

// Proteksi Halaman: Hanya Owner yang boleh masuk
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'owner') {
    header("Location: ../index.php");
    exit();
}

require_once __DIR__ . '/../../config/csrf.php';

$dataFile = 'produk.json';
$uploadDir = 'uploads/';

// Buat folder uploads jika belum ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Baca data produk yang ada
$products = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
$uploadResults = [];

// Logika Update Produk
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_product'])) {
    if (!csrf_verify($_POST['_csrf_token'] ?? '')) {
        header("Location: index.php?status=csrf_failed");
        exit();
    }

    $idToUpdate = (int)$_POST['edit_id'];
    $existingIndex = -1;
    foreach ($products as $key => $p) {
        if ($p['id'] == $idToUpdate) {
            $existingIndex = $key;
            break;
        }
    }

    if ($existingIndex !== -1) {
        // Backup before update
        if (file_exists($dataFile)) {
            copy($dataFile, 'produk.backup.' . date('Ymd-His') . '.json');
        }

        $existingProduct = $products[$existingIndex];

        // Handle files removal
        $remainingImages = [];
        if (isset($_POST['existing_images']) && is_array($_POST['existing_images'])) {
            $remainingImages = $_POST['existing_images'];
        }

        // Process new uploads
        $newUploadedFiles = [];
        if (!empty($_FILES['edit_files']['name'][0])) {
            foreach ($_FILES['edit_files']['tmp_name'] as $key => $tmp_name) {
                $fileName = time() . '_' . basename($_FILES['edit_files']['name'][$key]);
                $targetPath = $uploadDir . $fileName;
                $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));

                if (in_array($fileType, ['jpg', 'jpeg', 'png', 'webp', 'pdf'])) {
                    if (move_uploaded_file($tmp_name, $targetPath)) {
                        $newUploadedFiles[] = $targetPath;
                    }
                }
            }
        }

        $finalImages = array_merge($remainingImages, $newUploadedFiles);
        $cover = $_POST['edit_cover'] ?? '';
        if (empty($cover) && !empty($finalImages)) {
            $cover = basename($finalImages[0]);
        }

        $products[$existingIndex] = [
            'id' => $existingProduct['id'],
            'title' => htmlspecialchars($_POST['title']),
            'title_en' => htmlspecialchars($_POST['title_en'] ?? ''),
            'price' => htmlspecialchars($_POST['price']),
            'price_number' => (int)($_POST['price_number'] ?? 0),
            'category' => htmlspecialchars($_POST['category'] ?? 'General'),
            'type' => htmlspecialchars($_POST['type'] ?? 'service'),
            'status' => htmlspecialchars($_POST['status'] ?? 'published'),
            'featured' => isset($_POST['featured']) && $_POST['featured'] == '1',
            'shortDesc' => htmlspecialchars($_POST['shortDesc']),
            'shortDesc_en' => htmlspecialchars($_POST['shortDesc_en'] ?? ''),
            'fullDesc' => $_POST['fullDesc'],
            'fullDesc_en' => $_POST['fullDesc_en'] ?? '',
            'images' => $finalImages,
            'cover' => $cover
        ];

        file_put_contents($dataFile, json_encode($products, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        header("Location: index.php?status=updated");
        exit();
    }
}

// Logika Simpan Produk Baru
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_product'])) {
    if (!csrf_verify($_POST['_csrf_token'] ?? '')) {
        header("Location: index.php?status=csrf_failed");
        exit();
    }

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
    if (file_exists($dataFile)) copy($dataFile, 'produk.backup.' . date('Ymd-His') . '.json'); file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    $_SESSION['upload_results'] = $uploadResults;
    header("Location: index.php?status=success");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rename_file'])) {
    if (!csrf_verify($_POST['_csrf_token'] ?? '')) {
        header("Location: index.php?status=csrf_failed");
        exit();
    }

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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_product'])) {
    if (!csrf_verify($_POST['_csrf_token'] ?? '')) {
        header("Location: index.php?status=csrf_failed");
        exit();
    }

    $idToDelete = $_POST['delete_id'];
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
                        <?php echo csrf_field(); ?>
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
                                                                    <button type="button" onclick="editProduct(<?php echo $p['id']; ?>)" class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Edit Produk">
                                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                                    </button>
                                    <form method="POST" action="" class="inline" onsubmit="return confirm('Hapus produk ini?')">
                                    <?php echo csrf_field(); ?>
                                    <input type="hidden" name="delete_id" value="<?php echo $p['id']; ?>">
                                    <button type="submit" name="delete_product" class="p-2 text-slate-400 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer">
                                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                                    </button>
                                </form>
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
                                    <?php echo csrf_field(); ?>
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

        <script>
        lucide.createIcons();
        const products = <?php echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;

        function resetForm() {
            document.getElementById('productForm').reset();
            document.getElementById('edit_id').value = '';
            document.getElementById('edit_cover').value = '';
            document.getElementById('edit_media_container').classList.add('hidden');
            document.getElementById('edit_media_container').innerHTML = '';

            document.getElementById('formTitle').innerHTML = '<i data-lucide="plus-circle" class="w-6 h-6 text-red-500"></i> Tambah Produk / Jasa';
            document.getElementById('btnSubmit').name = 'save_product';
            document.getElementById('btnSubmitText').textContent = 'Simpan Produk Baru';
            document.getElementById('btnCancelEdit').classList.add('hidden');
            document.getElementById('fileLabel').textContent = 'Upload File Baru (JPG, PNG, WEBP, PDF)';

            lucide.createIcons();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function editProduct(id) {
            const p = products.find(x => x.id == id);
            if (!p) return;

            document.getElementById('edit_id').value = p.id;
            document.getElementById('form_title').value = p.title || '';
            document.getElementById('form_title_en').value = p.title_en || '';
            document.getElementById('form_price').value = p.price || '';
            document.getElementById('form_price_number').value = p.price_number || '';
            document.getElementById('form_status').value = p.status || 'published';
            document.getElementById('form_category').value = p.category || '';
            document.getElementById('form_type').value = p.type || 'service';
            document.getElementById('form_shortDesc').value = p.shortDesc || '';
            document.getElementById('form_shortDesc_en').value = p.shortDesc_en || '';
            document.getElementById('form_fullDesc').value = p.fullDesc || '';
            document.getElementById('form_fullDesc_en').value = p.fullDesc_en || '';
            document.getElementById('form_featured').checked = p.featured ? true : false;
            document.getElementById('edit_cover').value = p.cover || '';

            const mediaContainer = document.getElementById('edit_media_container');
            if (p.images && p.images.length > 0) {
                mediaContainer.classList.remove('hidden');
                let html = '<div class="col-span-full text-sm font-bold text-slate-700 mb-2">Media Saat Ini:</div>';
                p.images.forEach(img => {
                    const fname = img.split('/').pop();
                    const isCover = p.cover === fname || p.cover === img;
                    html += `
                        <div class="relative bg-white rounded border p-1 group">
                            <input type="hidden" name="existing_images[]" value="${img}">
                            <img src="uploads/${fname}" class="w-full h-16 object-cover rounded opacity-80 group-hover:opacity-100 transition-opacity" onerror="this.src='https://placehold.co/100x100?text=File'">
                            ${isCover ? '<div class="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1 rounded shadow-sm font-bold">COVER</div>' : ''}
                            <button type="button" onclick="setCover('${fname}')" class="absolute bottom-1 right-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Jadikan Cover</button>
                            <button type="button" onclick="this.parentElement.remove()" class="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="x" class="w-3 h-3"></i></button>
                        </div>
                    `;
                });
                mediaContainer.innerHTML = html;
            } else {
                mediaContainer.classList.add('hidden');
                mediaContainer.innerHTML = '';
            }

            document.getElementById('formTitle').innerHTML = '<i data-lucide="edit-3" class="w-6 h-6 text-blue-500"></i> Edit Produk: ' + p.title;
            document.getElementById('btnSubmit').name = 'update_product';
            document.getElementById('btnSubmitText').textContent = 'Update Produk';
            document.getElementById('btnCancelEdit').classList.remove('hidden');
            document.getElementById('fileLabel').textContent = 'Tambahkan File (Opsional)';

            // Adjust the file input name to differentiate during update
            document.getElementById('file_input').name = 'edit_files[]';

            lucide.createIcons();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function setCover(fname) {
            document.getElementById('edit_cover').value = fname;
            alert('Cover diatur ke ' + fname + '. Silahkan Simpan untuk mengaplikasikan.');
            // Re-render visually
            const id = document.getElementById('edit_id').value;
            if(id) {
                const p = products.find(x => x.id == id);
                if (p) {
                   p.cover = fname;
                   editProduct(p.id);
                }
            }
        }
    </script>
</body>
</html>