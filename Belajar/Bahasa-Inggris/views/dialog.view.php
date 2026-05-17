<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Dialog - GemuYokai</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; }
        .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
        .chat-bubble-ai { background-color: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 1rem 1rem 1rem 0; }
        .chat-bubble-user { background-color: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 1rem 1rem 0 1rem; }
    </style>
</head>
<body class="min-h-screen flex flex-col p-8">
    <div class="max-w-4xl mx-auto w-full glass-card p-8 flex flex-col h-[80vh]">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-amber-400">Talk with AI</h1>
            <a href="index.php" class="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">Back</a>
        </div>

        <div class="flex-grow bg-slate-900 rounded-xl border border-slate-700 p-4 mb-4 overflow-y-auto flex flex-col gap-4" id="chat-box">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0"><i class="fas fa-robot text-sm"></i></div>
                <div class="chat-bubble-ai p-3 max-w-[80%]">
                    <p>Hello! I am your AI English tutor. How are you doing today?</p>
                </div>
            </div>
        </div>

        <div class="flex gap-2">
            <input type="text" id="user-input" class="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition" placeholder="Type your message here...">
            <button id="send-btn" class="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/30">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>

        <button id="completeBtn" class="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition">
            Finish Dialog Session (+20% Progress)
        </button>
        <p id="msg" class="text-emerald-400 text-center mt-2 hidden font-bold">Progress Saved!</p>
    </div>

    <script>
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');

        function addMessage(msg, isUser) {
            const div = document.createElement('div');
            div.className = `flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`;

            const avatar = document.createElement('div');
            avatar.className = `w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-emerald-500' : 'bg-blue-500'}`;
            avatar.innerHTML = `<i class="fas ${isUser ? 'fa-user' : 'fa-robot'} text-sm"></i>`;

            const bubble = document.createElement('div');
            bubble.className = `${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'} p-3 max-w-[80%]`;
            bubble.innerHTML = `<p>${msg}</p>`;

            div.appendChild(avatar);
            div.appendChild(bubble);
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        sendBtn.addEventListener('click', () => {
            const text = userInput.value.trim();
            if (!text) return;
            addMessage(text, true);
            userInput.value = '';

            // Dummy AI response
            setTimeout(() => {
                const responses = ["That's interesting!", "Could you tell me more about that?", "Your English is getting better!", "I see what you mean."];
                const reply = responses[Math.floor(Math.random() * responses.length)];
                addMessage(reply, false);
            }, 1000);
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });

        document.getElementById('completeBtn').addEventListener('click', async () => {
            document.getElementById('completeBtn').disabled = true;
            document.getElementById('completeBtn').innerText = "Saving...";

            try {
                const res = await fetch('api/save_progress.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'dialog', score: 20 })
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
