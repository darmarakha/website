<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Listening - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            background-image:
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            background-attachment: fixed;
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .audio-player-container {
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
            border: 1px solid rgba(244, 63, 94, 0.2);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .pulse-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid rgba(244, 63, 94, 0.5);
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            opacity: 0;
            z-index: 0;
        }

        .playing .pulse-ring {
            opacity: 1;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
        }

        .gradient-text {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .wave-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            gap: 3px;
        }

        .wave-bar {
            width: 4px;
            height: 8px;
            background-color: #f43f5e;
            border-radius: 2px;
            transition: height 0.1s ease;
        }

        .playing .wave-bar {
            animation: soundWave 1.2s ease-in-out infinite alternate;
        }

        .playing .wave-bar:nth-child(1) { animation-delay: 0.0s; }
        .playing .wave-bar:nth-child(2) { animation-delay: 0.2s; }
        .playing .wave-bar:nth-child(3) { animation-delay: 0.4s; }
        .playing .wave-bar:nth-child(4) { animation-delay: 0.6s; }
        .playing .wave-bar:nth-child(5) { animation-delay: 0.8s; }
        .playing .wave-bar:nth-child(6) { animation-delay: 0.5s; }
        .playing .wave-bar:nth-child(7) { animation-delay: 0.3s; }
        .playing .wave-bar:nth-child(8) { animation-delay: 0.1s; }
        .playing .wave-bar:nth-child(9) { animation-delay: 0.7s; }
        .playing .wave-bar:nth-child(10) { animation-delay: 0.9s; }

        @keyframes soundWave {
            0% { height: 8px; }
            100% { height: 32px; background-color: #fb7185; }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-6 md:p-10 relative overflow-hidden">
        <!-- Background decorative elements -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold mb-2"><span class="bg-gradient-to-r from-rose-400 to-pink-400 gradient-text">Listening Comprehension</span></h1>
                    <p class="text-slate-400">Train your ear to understand native English speakers.</p>
                </div>
                <a href="index.php" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 rounded-xl transition shadow-lg shrink-0">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <!-- Audio Player UI -->
            <div class="audio-player-container rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                <div class="absolute right-0 top-0 opacity-5 pointer-events-none">
                    <i class="fas fa-headphones text-9xl -mt-4 -mr-4"></i>
                </div>

                <div class="relative w-24 h-24 shrink-0 flex items-center justify-center cursor-pointer group/btn" id="playBtn" onclick="toggleAudio()">
                    <div class="pulse-ring"></div>
                    <div class="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] z-10 transition-transform group-hover/btn:scale-110">
                        <i class="fas fa-play text-2xl text-white ml-1" id="playIcon"></i>
                    </div>
                </div>

                <div class="flex-grow w-full z-10">
                    <div class="flex justify-between items-end mb-2">
                        <div>
                            <h3 class="text-xl font-bold text-white mb-1">Track 1: Airport Announcement</h3>
                            <p class="text-rose-300 text-sm flex items-center gap-2">
                                <i class="fas fa-microphone-alt"></i> Native Speaker &nbsp;&bull;&nbsp; <i class="fas fa-signal"></i> Intermediate
                            </p>
                        </div>
                        <span class="text-slate-400 text-sm font-mono" id="timeDisplay">0:00 / 0:45</span>
                    </div>

                    <!-- Fake Audio visualizer -->
                    <div class="bg-slate-900/80 rounded-xl p-3 border border-slate-700/50 mt-3" id="audioVisualizer">
                        <div class="wave-container">
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
                            <div class="wave-bar"></div><div class="wave-bar"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Section -->
            <div class="space-y-6">
                <div class="bg-slate-800/60 p-6 md:p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
                    <div class="flex items-start gap-3 mb-4">
                        <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <h3 class="text-lg md:text-xl font-bold text-white pt-0.5">What gate should passengers for flight BA123 proceed to immediately?</h3>
                    </div>
                    <div class="pl-11">
                        <input type="text" id="ans1" class="w-full bg-slate-900 border border-slate-600 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition placeholder-slate-500" placeholder="Type your answer here (e.g., Gate 42)..." oninput="checkInput()">
                        <p class="text-xs text-slate-400 mt-2"><i class="fas fa-lightbulb text-amber-400 mr-1"></i> Hint: Listen for the number after "proceed to gate".</p>
                    </div>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-700/50" id="submitArea">
                <button id="submitBtn" disabled class="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold py-4 md:py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(225,29,72,0.3)] opacity-50 cursor-not-allowed flex justify-center items-center gap-3 text-lg">
                    <i class="fas fa-paper-plane"></i> Submit Answer (+15% Progress)
                </button>

                <div id="successMsg" class="hidden mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center transform transition-all">
                    <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-3xl text-emerald-400"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-emerald-400 mb-2">Well Done!</h3>
                    <p class="text-emerald-200/70" id="finalMsgText">Your listening comprehension score has been recorded.</p>
                    <a href="index.php" class="inline-block mt-4 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-4 transition">Return to Dashboard <i class="fas fa-arrow-right ml-1"></i></a>
                </div>
            </div>
        </div>
    </div>

    <script>
        let isPlaying = false;
        let timer;
        let seconds = 0;

        function toggleAudio() {
            const visualizer = document.getElementById('audioVisualizer');
            const playBtn = document.getElementById('playBtn');
            const icon = document.getElementById('playIcon');
            const timeDisplay = document.getElementById('timeDisplay');

            if (!isPlaying) {
                // Play
                visualizer.classList.add('playing');
                playBtn.classList.add('playing');
                icon.className = 'fas fa-pause text-2xl text-white';
                isPlaying = true;

                // Simulate audio playing
                timer = setInterval(() => {
                    seconds++;
                    if(seconds > 45) {
                        toggleAudio(); // Auto stop at 45s
                        seconds = 0;
                        timeDisplay.innerText = "0:00 / 0:45";
                        return;
                    }
                    timeDisplay.innerText = `0:${seconds < 10 ? '0'+seconds : seconds} / 0:45`;
                }, 1000);

            } else {
                // Pause
                visualizer.classList.remove('playing');
                playBtn.classList.remove('playing');
                icon.className = 'fas fa-play text-2xl text-white ml-1';
                isPlaying = false;
                clearInterval(timer);
            }
        }

        function checkInput() {
            const val = document.getElementById('ans1').value.trim();
            const btn = document.getElementById('submitBtn');
            if (val.length > 0) {
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
                btn.classList.add('hover:from-rose-500', 'hover:to-pink-500', 'hover:-translate-y-1', 'hover:shadow-[0_0_30px_rgba(225,29,72,0.5)]');
            } else {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                btn.classList.remove('hover:from-rose-500', 'hover:to-pink-500', 'hover:-translate-y-1', 'hover:shadow-[0_0_30px_rgba(225,29,72,0.5)]');
            }
        }

        document.getElementById('submitBtn').addEventListener('click', async () => {
            const btn = document.getElementById('submitBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            btn.classList.add('opacity-80', 'cursor-not-allowed');
            btn.classList.remove('hover:-translate-y-1');

            // Stop audio if playing
            if(isPlaying) toggleAudio();

            try {
                // Determine score (dummy logic - normally you'd check answer against backend)
                const answer = document.getElementById('ans1').value.toLowerCase();
                let scoreEarned = 5; // Base score for trying
                if(answer.includes('42') || answer.includes('forty two') || answer.includes('forty-two')) {
                    scoreEarned = 15; // Full score
                }

                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'listening', score: scoreEarned })
                });

                const data = await res.json();

                if(data.success) {
                    btn.classList.add('hidden');
                    const msgDiv = document.getElementById('successMsg');
                    const msgText = document.getElementById('finalMsgText');

                    if(scoreEarned === 15) {
                        msgText.innerText = "Perfect! The correct answer is Gate 42. You earned 15% progress.";
                    } else {
                        msgText.innerText = "Good try! The correct answer was Gate 42. You earned partial progress.";
                    }

                    msgDiv.classList.remove('hidden');
                    msgDiv.style.animation = 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    document.getElementById('ans1').disabled = true;
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Try Again';
                    btn.classList.remove('opacity-80', 'cursor-not-allowed');
                }
            } catch(e) {
                console.error(e);
                alert("Network error occurred.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Try Again';
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        });

        const style = document.createElement('style');
        style.textContent += `
            @keyframes scaleIn {
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
