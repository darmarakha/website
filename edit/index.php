<?php
session_start();
// Proteksi ketat: Cek apakah user sudah login dan benar-benar 'Owner'
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'owner') {
    // Jika bukan Owner, kembalikan ke halaman depan!
    header("Location: ../index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Owner Dashboard - Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .code-editor {
            font-family: 'Consolas', 'Courier New', monospace;
            background-color: #161b22;
            color: #c9d1d9;
            tab-size: 4;
            border: 1px solid #30363d;
        }
        .code-editor:focus { outline: none; border-color: #58a6ff; }
        /* Scrollbar kustom untuk editor */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #8b949e; }
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">

    <header class="bg-[#161b22] border-b border-[#30363d] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <i data-lucide="terminal" class="w-5 h-5"></i>
            </div>
            <h1 class="font-semibold text-white tracking-wide">Workspace <span class="text-gray-500 font-normal">| <?php echo htmlspecialchars($_SESSION['user_name']); ?></span></h1>
        </div>
        <div class="flex items-center gap-4">
            <a href="../index.php" class="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <i data-lucide="external-link" class="w-4 h-4"></i> Lihat Web
            </a>
            <button onclick="saveFile()" id="btn-save" class="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> Simpan File
            </button>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        
        <aside class="w-72 bg-[#0d1117] border-r border-[#30363d] flex flex-col flex-shrink-0">
            <div class="p-5 border-b border-[#30363d]">
                <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i data-lucide="folder" class="w-3.5 h-3.5"></i> File Manager
                </h2>
                <select id="file-selector" onchange="loadFile()" class="w-full bg-[#161b22] border border-[#30363d] text-sm rounded-md px-3 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">-- Pilih File --</option>
                    <option value="../data.js">data.js (Teks & Terjemahan)</option>
                    <option value="../index.php">index.php (Kerangka Web)</option>
                    <option value="../app.js">app.js (Logika Animasi)</option>
                </select>
                <p class="text-[10px] text-gray-500 mt-2 leading-relaxed">💡 <b>Tips:</b> Untuk mengubah terjemahan atau menambah proyek, editlah <span class="text-blue-400">data.js</span>.</p>
            </div>

            <div class="p-5">
                <h2 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i data-lucide="image" class="w-3.5 h-3.5"></i> Upload Gambar Baru
                </h2>
                <div class="bg-[#161b22] border border-[#30363d] rounded-md p-4 text-center border-dashed">
                    <input type="file" id="image-upload" accept="image/*" class="hidden" onchange="uploadImage()">
                    <label for="image-upload" class="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                        <span class="text-xs font-medium" id="upload-text">Klik untuk pilih gambar</span>
                    </label>
                </div>
                
                <div id="image-result" class="mt-4 hidden">
                    <p class="text-[10px] text-gray-400 mb-1">URL Gambar (Copy paste ke data.js):</p>
                    <input type="text" id="image-url" readonly class="w-full bg-[#0d1117] border border-[#30363d] text-xs rounded-md px-2 py-1.5 text-blue-400 cursor-copy" onclick="this.select(); document.execCommand('copy'); alert('Link disalin!');">
                </div>
            </div>
        </aside>

        <main class="flex-1 bg-[#0d1117] flex flex-col relative">
            <div id="loading-overlay" class="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm z-10 hidden items-center justify-center">
                <div class="animate-spin text-blue-500"><i data-lucide="loader-2" class="w-8 h-8"></i></div>
            </div>
            <textarea id="editor" spellcheck="false" class="code-editor flex-1 w-full p-6 resize-none text-sm leading-relaxed" placeholder="Pilih file di sebelah kiri untuk mulai mengedit..."></textarea>
        </main>
    </div>

    <script>
        lucide.createIcons();

        async function loadFile() {
            const filename = document.getElementById('file-selector').value;
            const editor = document.getElementById('editor');
            if(!filename) { editor.value = ''; return; }

            document.getElementById('loading-overlay').style.display = 'flex';
            try {
                const fd = new FormData();
                fd.append('action', 'load_file');
                fd.append('filename', filename);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if(data.status === 'success') {
                    editor.value = data.content;
                } else {
                    alert(data.message);
                }
            } catch(e) {
                alert('Gagal memuat file.');
            } finally {
                document.getElementById('loading-overlay').style.display = 'none';
            }
        }

        async function saveFile() {
            const filename = document.getElementById('file-selector').value;
            const content = document.getElementById('editor').value;
            if(!filename) { alert('Pilih file terlebih dahulu!'); return; }

            const btn = document.getElementById('btn-save');
            const origHTML = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyimpan...`;
            btn.disabled = true;
            lucide.createIcons();

            try {
                const fd = new FormData();
                fd.append('action', 'save_file');
                fd.append('filename', filename);
                fd.append('content', content);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                alert(data.message);
            } catch(e) {
                alert('Gagal menyimpan file.');
            } finally {
                btn.innerHTML = origHTML;
                btn.disabled = false;
                lucide.createIcons();
            }
        }

        async function uploadImage() {
            const fileInput = document.getElementById('image-upload');
            const file = fileInput.files[0];
            if(!file) return;

            const text = document.getElementById('upload-text');
            text.textContent = 'Mengupload...';

            try {
                const fd = new FormData();
                fd.append('action', 'upload_image');
                fd.append('image', file);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();

                if(data.status === 'success') {
                    document.getElementById('image-result').classList.remove('hidden');
                    // Tampilkan URL gambar agar bisa dicopy ke data.js
                    document.getElementById('image-url').value = data.url; 
                } else {
                    alert(data.message);
                }
            } catch(e) {
                alert('Gagal upload gambar.');
            } finally {
                text.textContent = 'Klik untuk pilih gambar';
                fileInput.value = ''; // Reset input
            }
        }
    </script>
</body>
</html>