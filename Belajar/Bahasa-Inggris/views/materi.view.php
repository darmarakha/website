<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Materials - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
    </style>
</head>
<body class="min-h-screen flex flex-col p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-indigo-400">English Grammar & Vocabulary</h1>
            <a href="index.php" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">Back</a>
        </div>
        <p class="mb-8 text-slate-300">Learn the basics of English grammar. Click complete when you have studied the material.</p>

        <div class="space-y-6">
            <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 class="text-xl font-bold text-white mb-2">1. Present Simple Tense</h3>
                <p class="text-slate-400 mb-4">Used for habits, general truths, and fixed arrangements.</p>
                <div class="bg-slate-900 p-4 rounded text-sm text-green-400 font-mono">
                    Subject + V1 (s/es) + Object<br>
                    Ex: She plays tennis every Sunday.
                </div>
            </div>

            <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 class="text-xl font-bold text-white mb-2">2. Past Simple Tense</h3>
                <p class="text-slate-400 mb-4">Used for completed actions in the past.</p>
                <div class="bg-slate-900 p-4 rounded text-sm text-blue-400 font-mono">
                    Subject + V2 + Object<br>
                    Ex: I visited London last year.
                </div>
            </div>
        </div>

        <button id="completeBtn" class="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-500/30">
            I Have Mastered This Material (+10% Progress)
        </button>
        <p id="msg" class="text-emerald-400 text-center mt-4 hidden font-bold">Progress Saved!</p>
    </div>

    <script>
        document.getElementById('completeBtn').addEventListener('click', async () => {
            document.getElementById('completeBtn').disabled = true;
            document.getElementById('completeBtn').innerText = "Saving...";

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'materi', score: 10 })
                });
                const data = await res.json();
                if(data.success) {
                    document.getElementById('completeBtn').classList.add('hidden');
                    document.getElementById('msg').classList.remove('hidden');
                } else {
                    alert("Error: " + data.message);
                    document.getElementById('completeBtn').disabled = false;
                    document.getElementById('completeBtn').innerText = "Try Again";
                }
            } catch(e) {
                console.error(e);
            }
        });
    </script>
</body>
</html>
