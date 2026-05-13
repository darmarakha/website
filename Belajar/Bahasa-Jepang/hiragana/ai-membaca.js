// ====================================================================
// HIRAGANA MODULE: AI MEMBACA
// Dipisah dari hiragana.php agar mudah dirawat.
// ====================================================================
        // ==========================================
        // 7. AI MEMBACA MENGGUNAKAN FUZZY LOGIC & NLP
        // ==========================================

        function getParticleHint(text) {
            const hints = [];
            if (/は/.test(text)) hints.push('Partikel は dibaca <b class="text-orange-300">wa</b>, bukan ha. Contoh: わたしは = watashi wa.');
            if (/へ/.test(text)) hints.push('Partikel へ untuk arah dibaca <b class="text-orange-300">e</b>, bukan he. Contoh: がっこうへ = gakkou e.');
            if (/を/.test(text)) hints.push('Partikel を biasanya dibaca <b class="text-orange-300">o</b>, bukan wo. Contoh: りんごを = ringo o.');
            if (/っ/.test(text)) hints.push('Huruf kecil っ berarti tahan/gandakan konsonan berikutnya. Contoh: がっこう = gakkou.');
            return hints.length ? `<div class="mt-5 rounded-2xl bg-amber-400/[.07] border border-amber-400/15 p-4 text-left"><h4 class="font-black text-amber-300 mb-2">💡 ${tr('particle_title')}</h4><ul class="space-y-1 text-sm text-neutral-300">${hints.map(h=>`<li>• ${h}</li>`).join('')}</ul></div>` : '';
        }

        function normalizeRomaji(s){ return s.toLowerCase().replace(/[^a-z]/g,'').replace(/wo/g,'o').replace(/si/g,'shi').replace(/ti/g,'chi').replace(/tu/g,'tsu').replace(/hu/g,'fu').replace(/zi/g,'ji'); }

        function initAIReading(){
            aiCurrentStory = pickAdaptiveReadingStory(aiUserLevel);
            aiTimerStarted = false; 
            aiFinished = false; 
            aiTimeElapsed = 0;
            aiCurrentFeedback = '';
            aiLastUserInput = '';
            aiLastEvaluation = null;
            
            // Set dynamic limit based on length & level
            aiTimeLimit = Math.floor(aiCurrentStory.romaji.replace(/[^a-z]/g,'').length * (aiUserLevel==='mahir'? 2.5 : 1.2));
            aiTimeRemaining = aiTimeLimit;
            
            clearInterval(aiTimerInterval); 
            renderAIReading();
        }

        window.startAITimerIfNeeded = () => {
            if(!aiTimerStarted && !aiFinished){
                aiTimerStarted=true;
                aiTimerInterval = setInterval(() => {
                    aiTimeElapsed++;
                    if(aiUserLevel !== 'pemula') {
                        aiTimeRemaining--;
                        if(aiTimeRemaining <= 0) handleAITimeout();
                    }
                    updateTimerUI();
                }, 1000);
                updateTimerUI();
            }
        };

        function updateTimerUI(){
            const t = document.getElementById('ai-timer-display'); if(!t) return;
            if(aiUserLevel==='pemula'){
                t.innerText=`⏱️ Waktu: ${aiTimeElapsed} detik`;
                t.className='text-lg font-mono font-bold text-orange-400';
            } else {
                t.innerText=`⏳ Tersisa: ${aiTimeRemaining} detik`;
                t.className=aiTimeRemaining<=5 ? 'text-lg font-mono font-bold timer-urgent' : 'text-lg font-mono font-bold text-sakura-400';
            }
        }

        function handleAITimeout(){
            clearInterval(aiTimerInterval); aiFinished = { status: 'timeout' };
            aiCurrentFeedback = 'Waktu Anda Habis. AI akan memberikan penyesuaian level jika perlu.';
            sendScore(0,1,-5);
            if(aiUserLevel==='pro') saveAILevel('mahir'); else if(aiUserLevel==='mahir') saveAILevel('pemula');
            renderAIReading(); if(window.MathJax) MathJax.typesetPromise();
        }

        window.submitAIAnswer = () => {
            if(aiFinished) return;
            const inp = document.getElementById('ai-read-input'), msg = document.getElementById('ai-msg');
            const val = inp.value;
            aiLastUserInput = val;
            
            if(val.trim()===''){ msg.innerText='⚠️ Anda belum mengetik apapun.'; return; }
            
            clearInterval(aiTimerInterval);
            let nu = normalizeRomaji(val), nt = normalizeRomaji(aiCurrentStory.romaji);
            let timeTaken = (aiUserLevel === 'pemula') ? aiTimeElapsed : (aiTimeLimit - aiTimeRemaining);
            if(timeTaken <= 0) timeTaken = 1;

            // Trigger AI Decision Tree & NLP
            let aiEvaluation = evaluateAIResponse(nu, nt, timeTaken, aiUserLevel);
            aiLastEvaluation = aiEvaluation;
            
            aiFinished = { status: aiEvaluation.status };
            aiCurrentFeedback = aiEvaluation.feedback;
            
            sendScore(aiEvaluation.status === 'success' ? 1 : 0, aiEvaluation.status === 'fail' ? 1 : 0, aiEvaluation.points);
            saveAILevel(aiEvaluation.nextLevel);
            
            renderAIReading(); if(window.MathJax) MathJax.typesetPromise();
        };

        function getRomajiDiffHTML(userInput, targetInput) {
            const user = normalizeRomaji(userInput || '');
            const target = normalizeRomaji(targetInput || '');
            const max = Math.max(user.length, target.length);
            let rows = '';
            for (let i = 0; i < max; i++) {
                const u = user[i] || '∅';
                const t = target[i] || '∅';
                const ok = u === t;
                rows += `<div class="grid grid-cols-[34px_1fr_1fr] gap-2 text-xs items-center py-1 border-b border-white/[.04]"><span class="text-neutral-500">${i+1}</span><span class="${ok?'text-emerald-300':'text-rose-300'} font-mono">${u}</span><span class="text-white font-mono">${t}</span></div>`;
            }
            return `<div class="mt-4 rounded-2xl bg-white/[.035] border border-white/[.06] p-3 text-left max-h-52 overflow-y-auto">
                <div class="grid grid-cols-[34px_1fr_1fr] gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1"><span>No</span><span>Jawaban</span><span>Target</span></div>${rows}</div>`;
        }

        function getAIReadingTipsHTML() {
            if (!aiCurrentStory || !aiLastEvaluation) return '';
            const target = normalizeRomaji(aiCurrentStory.romaji);
            const user = normalizeRomaji(aiLastUserInput);
            const dist = aiLastEvaluation.distance ?? getLevenshteinDistance(user, target);
            const acc = aiLastEvaluation.accuracy || 0;
            const tips = [];
            if (acc < 90) tips.push(`Ada sekitar <b class="text-orange-300">${dist}</b> perbedaan huruf setelah dinormalisasi. Cek tabel perbandingan di bawah.`);
            if (/は/.test(aiCurrentStory.hiragana)) tips.push('Ingat: partikel <b class="text-sakura-300">は</b> biasanya diketik/dibaca <b class="text-orange-300">wa</b>.');
            if (/へ/.test(aiCurrentStory.hiragana)) tips.push('Ingat: partikel <b class="text-sakura-300">へ</b> untuk arah dibaca <b class="text-orange-300">e</b>.');
            if (/を/.test(aiCurrentStory.hiragana)) tips.push('Ingat: partikel <b class="text-sakura-300">を</b> di kalimat biasanya dibaca <b class="text-orange-300">o</b>.');
            if (/っ/.test(aiCurrentStory.hiragana)) tips.push('Huruf kecil <b class="text-sakura-300">っ</b> menggandakan konsonan berikutnya, contoh gakkou, kitte, matte.');
            if (aiLastEvaluation.cps < 1 && aiLastEvaluation.status === 'success') tips.push('Akurasi sudah bagus. Tahap berikutnya: naikkan kecepatan sedikit demi sedikit.');
            if (!tips.length) tips.push('Akurasi dan pola bacaan sudah baik. Lanjut ke soal berikutnya agar AI mendapat variasi data latihan.');
            return `<div class="mt-4 rounded-2xl bg-sakura-400/[.06] border border-sakura-400/15 p-4 text-left"><h4 class="font-black text-sakura-300 mb-2">🧠 Catatan AI</h4><ul class="space-y-1 text-sm text-neutral-300">${tips.map(t=>`<li>• ${t}</li>`).join('')}</ul>${getRomajiDiffHTML(aiLastUserInput, aiCurrentStory.romaji)}</div>`;
        }

        function getDetailedAIExplanationHTML() {
            if (!aiCurrentStory) return '';
            const cleanTarget = normalizeRomaji(aiCurrentStory.romaji);
            const syllableCount = Array.from(aiCurrentStory.hiragana.replace(/\s/g,'')).length;
            const acc = aiLastEvaluation ? `${aiLastEvaluation.accuracy.toFixed(1)}%` : '-';
            const cps = aiLastEvaluation ? `${aiLastEvaluation.cps.toFixed(2)} c/s` : '-';
            return `
                <div class="mt-5 rounded-2xl bg-blue-400/[.06] border border-blue-400/15 p-4 text-left">
                    <h4 class="font-black text-blue-300 mb-2 flex items-center gap-2"><i data-lucide="sparkles" class="w-4 h-4"></i> ${tr('ai_detail_title')}</h4>
                    <p class="text-sm text-neutral-300 leading-relaxed mb-3">${tr('ai_detail_body')}</p>
                    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        <div class="rounded-xl bg-white/[.04] p-3 border border-white/[.06] min-w-0"><b class="text-sakura-300">Target</b><br><span class="font-mono text-neutral-200 break-all">${cleanTarget}</span></div>
                        <div class="rounded-xl bg-white/[.04] p-3 border border-white/[.06]"><b class="text-orange-300">Kana</b><br><span class="text-neutral-200">${syllableCount} karakter</span></div>
                        <div class="rounded-xl bg-white/[.04] p-3 border border-white/[.06]"><b class="text-emerald-300">Akurasi</b><br><span class="text-neutral-200">${acc}</span></div>
                        <div class="rounded-xl bg-white/[.04] p-3 border border-white/[.06]"><b class="text-blue-300">Kecepatan</b><br><span class="text-neutral-200">${cps}</span></div>
                    </div>
                </div>`;
        }

        function renderAIReading(){
            let fb='', inp='';
            if(!aiFinished){
                let tl = aiUserLevel==='pemula' ? '⏱️ Ketik huruf pertama untuk memulai waktu...' : `⏳ Waktu Target: ${aiTimeRemaining}s`;
                inp=`
                    <div class="mt-6 flex flex-col items-center w-full">
                        <div id="ai-timer-display" class="text-lg font-mono font-bold text-neutral-500 mb-3">${tl}</div>
                        <div class="flex flex-col sm:flex-row w-full max-w-2xl gap-3">
                            <textarea id="ai-read-input" rows="2" class="flex-1 w-full bg-dark-800 border-2 border-white/[.08] rounded-2xl p-4 text-xl sm:text-2xl text-white focus:outline-none focus:border-orange-400/60 transition placeholder-neutral-600 font-bold resize-none" placeholder="Ketik romaji di sini..." autocomplete="off" autocapitalize="none" spellcheck="false" oninput="startAITimerIfNeeded();document.getElementById('ai-msg').innerHTML=''" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitAIAnswer();}"></textarea>
                            <button onclick="submitAIAnswer()" class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-6 py-4 rounded-2xl transition flex items-center justify-center shadow-lg shadow-orange-500/20 sm:w-auto w-full font-bold gap-2"><i data-lucide="send" class="w-5 h-5"></i> Kirim</button>
                        </div>
                        <p id="ai-msg" class="h-6 mt-2 text-sm font-bold text-rose-400"></p>
                        <p class="text-xs text-neutral-600 mt-2 text-center">*Abaikan spasi/tanda baca. Tekan <strong class="text-neutral-400">Enter</strong> untuk mengirim.</p>
                    </div>`;
            }else{
                let iconClass = aiFinished.status==='success' ? 'text-emerald-400' : (aiFinished.status==='partial' ? 'text-amber-400' : 'text-rose-400');
                let sh = `<h3 class="text-2xl sm:text-3xl font-black ${iconClass} mb-2 flex items-center gap-2 justify-center"><i data-lucide="brain-circuit" class="w-8 h-8"></i> Hasil Evaluasi AI</h3>`;
                fb=`
                    <div class="mt-8 glass-card rounded-3xl p-5 sm:p-8 shadow-xl tab-content w-full border border-white/[.08] ai-mobile-card">
                        ${sh}
                        <p class="text-center text-white text-lg font-bold mb-1">${aiCurrentFeedback}</p>
                        <div class="feedback-mobile-safe text-center mb-8"><p class="text-neutral-400 text-sm">${tr('meaning')}: <strong class="text-orange-300">"${aiCurrentStory.indo}"</strong></p><p class="text-neutral-300 text-sm mt-2">${tr('answer_latin')}: <strong class="text-white font-mono">${aiCurrentStory.romaji}</strong></p><p class="text-neutral-500 text-xs mt-1">${tr('kana_text')}: <span class="font-jp text-sakura-200">${aiCurrentStory.hiragana}</span></p>${getParticleHint(aiCurrentStory.hiragana)}${getDetailedAIExplanationHTML()}${getAIReadingTipsHTML()}</div>
                        <div class="ai-safe-grid">
                            <div class="ai-panel-safe">
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="book-a" class="w-4 h-4 text-sakura-400"></i> Bedah 漢字</h4>
                                <ul class="list-none space-y-3 bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full">${aiCurrentStory.kanjiInfo}</ul>
                            </div>
                            <div class="ai-panel-safe">
                                <h4 class="text-base font-bold text-white mb-3 pb-2 border-b border-white/[.06] flex items-center gap-2"><i data-lucide="graduation-cap" class="w-4 h-4 text-orange-400"></i> Analisis 文法</h4>
                                <div class="math-scroll text-sm sm:text-base text-neutral-300 leading-relaxed bg-dark-900 p-4 rounded-2xl border border-white/[.05] h-full flex flex-col justify-center text-center">${aiCurrentStory.bunpouInfo}</div>
                            </div>
                        </div>
                        <div class="mt-8 flex justify-center">
                            <button onclick="initAIReading()" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-sakura-500 hover:from-orange-400 hover:to-sakura-400 transition font-black tracking-wide text-white shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2">Tantangan AI Selanjutnya <i data-lucide="arrow-right-circle" class="w-5 h-5"></i></button>
                        </div>
                    </div>`;
            }
            let bc=aiUserLevel==='pemula'?'bg-sakura-400/10 border-sakura-400/20 text-sakura-300':aiUserLevel==='mahir'?'bg-blue-400/10 border-blue-400/20 text-blue-300':'bg-rose-400/10 border-rose-400/20 text-rose-300';
            contentDiv.innerHTML=`
                <div class="max-w-4xl mx-auto py-4 tab-content px-2 sm:px-0 flex flex-col items-center w-full">
                    <div class="mb-6 flex justify-between items-center glass-card p-4 rounded-2xl w-full border border-white/[.06]">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center border border-orange-400/15"><i data-lucide="brain-circuit" class="w-5 h-5 text-orange-400"></i></div>
                            <div><h2 class="text-white font-bold text-sm sm:text-base">AI Membaca Tingkat Cerdas</h2><p class="text-xs text-neutral-500">Mendeteksi kecepatan, typo, akurasi, plus hint partikel.</p></div>
                        </div>
                        <span class="inline-flex items-center gap-1.5 border font-bold px-4 py-2 rounded-full text-xs sm:text-sm uppercase tracking-widest ${bc}">${aiUserLevel}</span>
                    </div>
                    <div class="glass-card rounded-3xl p-6 sm:p-10 mb-2 relative overflow-hidden text-center w-full border border-white/[.06]">
                        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sakura-400/20 to-transparent"></div>
                        <h2 class="text-neutral-500 text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 flex items-center justify-center gap-2"><i data-lucide="glasses" class="w-4 h-4"></i> Baca Huruf di Bawah Ini</h2>
                        <div class="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-relaxed sm:leading-loose font-jp break-keep">${aiCurrentStory.hiragana}</div>
                    </div>
                    ${inp}${fb}
                </div>`;
            lucide.createIcons();
            if(!aiFinished&&window.innerWidth>640)setTimeout(()=>{const e=document.getElementById('ai-read-input');if(e)e.focus();},100);
        }

