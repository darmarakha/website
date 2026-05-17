<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Exercises - GemuYokai</title>
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
            <h1 class="text-3xl font-bold text-emerald-400">English Exercises</h1>
            <a href="index.php" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">Back</a>
        </div>
        <p class="mb-8 text-slate-300">Choose the correct answer to complete the sentence.</p>

        <div id="quiz-container" class="space-y-6">
            <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 class="text-xl font-bold text-white mb-4">1. She _____ to the store yesterday.</h3>
                <div class="space-y-3">
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="false">A) goes</button>
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="true">B) went</button>
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="false">C) gone</button>
                </div>
            </div>

            <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 class="text-xl font-bold text-white mb-4">2. I have lived here _____ 2010.</h3>
                <div class="space-y-3">
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="false">A) for</button>
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="true">B) since</button>
                    <button class="w-full text-left px-4 py-3 rounded bg-slate-700 hover:bg-slate-600 transition option-btn" data-correct="false">C) in</button>
                </div>
            </div>
        </div>

        <button id="submitBtn" class="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/30 hidden">
            Submit Results (+15% Progress)
        </button>
        <p id="msg" class="text-emerald-400 text-center mt-4 hidden font-bold">Progress Saved!</p>
    </div>

    <script>
        let answered = 0;
        const total = 2;
        let score = 0;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.parentElement;
                if (parent.dataset.answered === 'true') return;

                parent.dataset.answered = 'true';
                answered++;

                if (this.dataset.correct === 'true') {
                    this.classList.remove('bg-slate-700', 'hover:bg-slate-600');
                    this.classList.add('bg-green-600');
                    score++;
                } else {
                    this.classList.remove('bg-slate-700', 'hover:bg-slate-600');
                    this.classList.add('bg-red-600');
                    // show correct
                    parent.querySelector('[data-correct="true"]').classList.remove('bg-slate-700');
                    parent.querySelector('[data-correct="true"]').classList.add('bg-green-600');
                }

                if (answered === total) {
                    document.getElementById('submitBtn').classList.remove('hidden');
                }
            });
        });

        document.getElementById('submitBtn').addEventListener('click', async () => {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitBtn').innerText = "Saving...";

            try {
                // Beri 15 point jika semua benar
                const progressScore = Math.round((score / total) * 15);
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'latihan', score: progressScore })
                });
                const data = await res.json();
                if(data.success) {
                    document.getElementById('submitBtn').classList.add('hidden');
                    document.getElementById('msg').innerText = `Progress Saved! You got ${score}/${total} correct.`;
                    document.getElementById('msg').classList.remove('hidden');
                } else {
                    alert("Error: " + data.message);
                    document.getElementById('submitBtn').disabled = false;
                    document.getElementById('submitBtn').innerText = "Try Again";
                }
            } catch(e) {
                console.error(e);
            }
        });
    </script>
</body>
</html>
