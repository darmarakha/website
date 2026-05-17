<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Dialog - GemuYokai</title>
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
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .chat-bubble-user {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15));
            border: 1px solid rgba(245, 158, 11, 0.3);
            border-radius: 1rem 1rem 0 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .gradient-text {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .typing-indicator span {
            animation: blink 1.4s infinite both;
            height: 6px;
            width: 6px;
            background: #94a3b8;
            border-radius: 50%;
            display: inline-block;
            margin: 0 1px;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
            0% { opacity: .2; transform: scale(0.8); }
            20% { opacity: 1; transform: scale(1.2); }
            100% { opacity: .2; transform: scale(0.8); }
        }

        /* Custom Scrollbar for chat */
        #chat-box::-webkit-scrollbar { width: 6px; }
        #chat-box::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 10px; }
        #chat-box::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 10px; }
        #chat-box::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.8); }
    </style>
</head>
<body class="min-h-screen flex flex-col p-4 md:p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-6 md:p-8 flex flex-col h-[85vh] relative overflow-hidden">
        <!-- Background decorative elements -->
        <div class="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col h-full">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                        <i class="fas fa-robot text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-extrabold"><span class="bg-gradient-to-r from-amber-400 to-orange-400 gradient-text">AI Conversation</span></h1>
                        <p class="text-slate-400 text-sm flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online and ready to chat
                        </p>
                    </div>
                </div>
                <a href="index.php" class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl transition shadow-lg shrink-0 text-sm">
                    <i class="fas fa-times"></i> Leave
                </a>
            </div>

            <div class="flex-grow chat-container p-4 md:p-6 mb-4 overflow-y-auto flex flex-col gap-6" id="chat-box">
                <!-- Initial AI Message -->
                <div class="flex items-start gap-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg border border-indigo-400/30">
                        <i class="fas fa-robot text-sm text-white"></i>
                    </div>
                    <div class="chat-bubble-ai p-4 max-w-[85%] md:max-w-[75%] text-slate-200">
                        <p>Hello! I am your AI English tutor. I'm here to help you practice your conversation skills. We can talk about anything you'd like. How was your day?</p>
                    </div>
                </div>
            </div>

            <div class="mt-auto">
                <div class="flex gap-3 mb-4">
                    <input type="text" id="user-input" class="flex-grow bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner" placeholder="Type your message in English...">
                    <button id="send-btn" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-6 md:px-8 py-4 rounded-2xl transition shadow-lg shadow-orange-500/30 shrink-0 transform hover:scale-105 active:scale-95">
                        <i class="fas fa-paper-plane text-lg"></i>
                    </button>
                </div>

                <div class="border-t border-slate-700/50 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p class="text-xs text-slate-500"><i class="fas fa-info-circle mr-1"></i> Have a brief conversation to earn your progress points.</p>
                    <button id="completeBtn" class="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold py-2.5 px-6 rounded-xl transition flex items-center justify-center gap-2">
                        <i class="fas fa-flag-checkered"></i> Finish Session (+20%)
                    </button>
                </div>
                <div id="successMsg" class="hidden mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center transition-all">
                    <p class="text-emerald-400 font-bold"><i class="fas fa-check-circle mr-1"></i> Progress Saved! Great conversation.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        let messageCount = 0;

        function addMessage(msg, isUser) {
            const div = document.createElement('div');
            div.className = `flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''} opacity-0 translate-y-4`;
            div.style.animation = 'slideIn 0.3s forwards ease-out';

            const avatar = document.createElement('div');
            avatar.className = `w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg border ${isUser ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-amber-400/30' : 'bg-gradient-to-br from-indigo-500 to-blue-500 border-indigo-400/30'}`;
            avatar.innerHTML = `<i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-sm text-white"></i>`;

            const bubble = document.createElement('div');
            bubble.className = `${isUser ? 'chat-bubble-user text-amber-50' : 'chat-bubble-ai text-slate-200'} p-4 max-w-[85%] md:max-w-[75%]`;
            bubble.innerHTML = `<p class="leading-relaxed">${msg}</p>`;

            div.appendChild(avatar);
            div.appendChild(bubble);
            chatBox.appendChild(div);

            // Smooth scroll to bottom
            chatBox.scrollTo({
                top: chatBox.scrollHeight,
                behavior: 'smooth'
            });
        }

        function showTypingIndicator() {
            const div = document.createElement('div');
            div.id = 'typing-indicator';
            div.className = `flex items-start gap-4 opacity-0`;
            div.style.animation = 'slideIn 0.3s forwards ease-out';

            const avatar = document.createElement('div');
            avatar.className = `w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0 shadow-lg border border-indigo-400/30`;
            avatar.innerHTML = `<i class="fas fa-robot text-sm text-white"></i>`;

            const bubble = document.createElement('div');
            bubble.className = `chat-bubble-ai p-4 text-slate-200 flex items-center h-12`;
            bubble.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;

            div.appendChild(avatar);
            div.appendChild(bubble);
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;

            return div;
        }

        const aiResponses = [
            "That sounds really interesting! Tell me more.",
            "I completely understand. How did that make you feel?",
            "Your English is very clear! Do you practice often?",
            "That's a great point. What else do you think about it?",
            "Wow, I didn't know that. Could you explain it a bit more?",
            "Excellent sentence structure! Keep going.",
            "I see! What are your plans for tomorrow?"
        ];

        sendBtn.addEventListener('click', () => {
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, true);
            userInput.value = '';
            messageCount++;

            const indicator = showTypingIndicator();

            // Simulate AI thinking time (1-2 seconds)
            const thinkTime = Math.random() * 1000 + 1000;

            setTimeout(() => {
                indicator.remove();
                const reply = aiResponses[Math.floor(Math.random() * aiResponses.length)];
                addMessage(reply, false);

                // Encourage user to save if they've chatted a bit
                if(messageCount === 3) {
                    setTimeout(() => {
                        const completeBtn = document.getElementById('completeBtn');
                        completeBtn.classList.add('ring-2', 'ring-emerald-500', 'animate-pulse');
                        setTimeout(() => completeBtn.classList.remove('animate-pulse'), 2000);
                    }, 2000);
                }
            }, thinkTime);
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });

        document.getElementById('completeBtn').addEventListener('click', async () => {
            if(messageCount === 0) {
                alert("Please chat with the AI at least once before finishing the session!");
                return;
            }

            const btn = document.getElementById('completeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.classList.add('opacity-80', 'cursor-not-allowed');
            btn.classList.remove('ring-2', 'ring-emerald-500');

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'dialog', score: 20 })
                });
                const data = await res.json();
                if(data.success) {
                    btn.classList.add('hidden');
                    const msg = document.getElementById('successMsg');
                    msg.classList.remove('hidden');
                    msg.style.animation = 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                } else {
                    alert("Error: " + data.message);
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-flag-checkered"></i> Try Again';
                    btn.classList.remove('opacity-80', 'cursor-not-allowed');
                }
            } catch(e) {
                console.error(e);
                alert("Network error.");
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-flag-checkered"></i> Try Again';
                btn.classList.remove('opacity-80', 'cursor-not-allowed');
            }
        });

        const style = document.createElement('style');
        style.textContent += `
            @keyframes slideIn {
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scaleIn {
                0% { transform: scale(0.95); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
