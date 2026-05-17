<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Dialog Tutor - GemuYokai</title>
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
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
        }

        .chat-container {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
        }

        .chat-bubble-ai {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15));
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 1rem 1rem 1rem 0;
        }

        .chat-bubble-user {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 1rem 1rem 0 1rem;
        }

        .typing-indicator span {
            animation: blink 1.4s infinite both;
            height: 6px; width: 6px; background: #94a3b8; border-radius: 50%; display: inline-block; margin: 0 1px;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
            0%, 100% { opacity: .2; transform: scale(0.8); }
            20% { opacity: 1; transform: scale(1.2); }
        }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-6 md:p-8 flex flex-col h-[85vh] relative overflow-hidden">

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                    <i class="fas fa-user-graduate text-2xl"></i>
                </div>
                <div>
                    <h1 class="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Advanced AI Tutor</h1>
                    <p class="text-slate-400 text-sm">Grammar evaluation & fluency practice</p>
                </div>
            </div>
            <a href="index.php" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl transition">
                <i class="fas fa-times"></i> End Session
            </a>
        </div>

        <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4 text-sm text-blue-200">
            <i class="fas fa-info-circle mr-2"></i> The AI will strictly evaluate your grammar and vocabulary. Try to write complex sentences to earn a higher score.
        </div>

        <div class="flex-grow chat-container p-4 md:p-6 mb-4 overflow-y-auto flex flex-col gap-6" id="chat-box">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <i class="fas fa-robot text-white"></i>
                </div>
                <div class="chat-bubble-ai p-4 text-slate-200 max-w-[85%]">
                    <p>Welcome! I am your advanced English tutor. To earn your progress points today, let's discuss a complex topic. <strong>What do you think is the biggest challenge facing the world today, and how should we solve it?</strong> Please provide a detailed response.</p>
                </div>
            </div>
        </div>

        <div class="mt-auto">
            <div class="flex gap-3 mb-4">
                <input type="text" id="user-input" class="flex-grow bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500" placeholder="Type your detailed answer here...">
                <button id="send-btn" class="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-2xl transition">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>

            <div class="border-t border-slate-700/50 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div class="text-sm">
                    <span class="text-slate-400">Messages sent: <span id="msg-count" class="font-bold text-amber-400">0</span>/3 required</span>
                </div>
                <button id="completeBtn" class="bg-slate-800 border border-slate-600 text-slate-400 py-2.5 px-6 rounded-xl transition" disabled>
                    <i class="fas fa-lock mr-2"></i> Finish & Save (Need 3 msgs)
                </button>
            </div>
            <div id="successMsg" class="hidden mt-4 text-center text-emerald-400 font-bold">Progress Saved!</div>
        </div>
    </div>

    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        let messageCount = 0;
        const requiredMessages = 3;

        function addMessage(msg, isUser) {
            const div = document.createElement('div');
            div.className = `flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`;

            const avatar = document.createElement('div');
            avatar.className = `w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-amber-500' : 'bg-indigo-500'}`;
            avatar.innerHTML = `<i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-white"></i>`;

            const bubble = document.createElement('div');
            bubble.className = `${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} p-4 text-slate-200 max-w-[85%]`;
            bubble.innerHTML = `<p>${msg}</p>`;

            div.appendChild(avatar);
            div.appendChild(bubble);
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function showTypingIndicator() {
            const div = document.createElement('div');
            div.className = `flex items-start gap-4`;
            div.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><i class="fas fa-robot text-white"></i></div>
                <div class="chat-bubble-ai p-4 flex items-center"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
            `;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
            return div;
        }

        sendBtn.addEventListener('click', async () => {
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, true);
            userInput.value = '';

            messageCount++;
            document.getElementById('msg-count').innerText = messageCount;

            if (messageCount >= requiredMessages) {
                const completeBtn = document.getElementById('completeBtn');
                completeBtn.disabled = false;
                completeBtn.className = "bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-6 rounded-xl transition animate-pulse";
                completeBtn.innerHTML = '<i class="fas fa-flag-checkered mr-2"></i> Save Progress (+20%)';
            }

            const indicator = showTypingIndicator();

            try {
                const res = await fetch('api/chat_ai.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                indicator.remove();
                addMessage(data.reply, false);
            } catch(e) {
                indicator.remove();
                addMessage("I'm experiencing a network issue. Please check your connection.", false);
            }
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });

        document.getElementById('completeBtn').addEventListener('click', async () => {
            const btn = document.getElementById('completeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            // Basic scoring based on message count (more sophisticated analysis can be done backend)
            let finalScore = Math.min(20, 5 + (messageCount * 5));

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'dialog', score: finalScore })
                });
                const data = await res.json();
                if(data.success) {
                    btn.classList.add('hidden');
                    document.getElementById('successMsg').classList.remove('hidden');
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = 'Try Again';
                }
            } catch(e) {
                alert("Network error.");
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
