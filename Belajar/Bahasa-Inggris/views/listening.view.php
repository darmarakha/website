<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Listening - GemuYokai</title>
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
            <h1 class="text-3xl font-bold text-rose-400">Listening Comprehension</h1>
            <a href="index.php" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">Back</a>
        </div>
        <p class="mb-8 text-slate-300">Listen to the audio and answer the questions. (Audio is simulated for this demo)</p>

        <div class="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 flex flex-col items-center">
            <div class="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-4 cursor-pointer hover:bg-slate-600 transition" onclick="alert('Audio playing...')">
                <i class="fas fa-play text-3xl text-rose-400 ml-2"></i>
            </div>
            <p class="text-slate-400 text-sm">Track 1: Airport Announcement</p>
        </div>

        <div class="space-y-6">
            <div class="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 class="text-xl font-bold text-white mb-4">1. What gate should passengers proceed to?</h3>
                <input type="text" id="ans1" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition" placeholder="Type your answer...">
            </div>
        </div>

        <button id="submitBtn" class="mt-8 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-rose-500/30">
            Submit Answers (+15% Progress)
        </button>
        <p id="msg" class="text-emerald-400 text-center mt-4 hidden font-bold">Progress Saved!</p>
    </div>

    <script>
        document.getElementById('submitBtn').addEventListener('click', async () => {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitBtn').innerText = "Saving...";

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'listening', score: 15 })
                });
                const data = await res.json();
                if(data.success) {
                    document.getElementById('submitBtn').classList.add('hidden');
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
