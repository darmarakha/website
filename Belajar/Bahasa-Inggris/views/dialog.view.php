<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Dialogue - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        .content-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
        }
    </style>
</head>
<body class="antialiased">
    <?php require __DIR__ . '/../../../partials/navbar.php'; ?>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div class="mb-8 text-center">
            <a href="index.php" class="text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-2 text-sm font-medium mb-4">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Kembali ke Dashboard
            </a>
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">Dialogue Practice</h1>
            <p class="text-slate-400">Praktikkan dialog sehari-hari untuk melatih kemampuan berkomunikasi.</p>
        </div>

        <div class="content-card p-6 md:p-10 text-center">
            <i data-lucide="message-circle" class="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50"></i>
            <h2 class="text-2xl font-bold text-white mb-2">Segera Hadir</h2>
            <p class="text-slate-400 max-w-md mx-auto mb-6">Materi interaktif untuk praktik dialog sedang dalam pengembangan dan akan segera ditambahkan ke dalam database.</p>
            <button onclick="markDoneAndReturn()" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all">Tandai Paham & Kembali</button>
        </div>
    </main>

    <script>
        const PROGRESS_KEY = 'gy_english_progress_v1';
        let progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{"materi":[], "latihan":[], "listening":[], "dialog":[]}');
        if (!progress.dialog) progress.dialog = [];

        async function markDoneAndReturn() {
            if (!progress.dialog.includes('dialog-1')) {
                progress.dialog.push('dialog-1');
                localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
                try {
                    const formData = new FormData();
                    formData.append('type', 'dialog');
                    formData.append('score', 100);
                    await fetch('api/save_progress.php', { method: 'POST', body: formData });
                } catch(e) {}
            }
            window.location.href = 'index.php';
        }
        lucide.createIcons();
    </script>
</body>
</html>