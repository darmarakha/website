// ====================================================================
// HIRAGANA MODULE: FLASHCARD + AUDIO QUIZ + SRS
// Dipisah dari hiragana.php agar mudah dirawat.
// ====================================================================
        // ====================================================================
        // 6. ML ALGORITHM 3: SPACED REPETITION SYSTEM (SRS) UNTUK FLASHCARD
        // ====================================================================
        let fcWeights = {}, isCardFlipped = false, currentFCItem = null, fcSessionTotal = 0, fcMode = 'romaji', fcAudioChoices = [], fcAudioFeedback = '', fcRecentAudio = [], fcAudioAnswered = false;

        function initFCWeights() {
            if(Object.keys(fcWeights).length === 0) {
                allKana.forEach(k => fcWeights[k.r] = 1.0); // Base probability 100%
            }
        }

        function getNextFlashcard() {
            if (fcMode === 'audio') {
                let pool = allKana.filter(x => x.k && x.r && !fcRecentAudio.includes(x.k) && (!currentFCItem || x.k !== currentFCItem.k));
                if (pool.length < 8) { fcRecentAudio = []; pool = allKana.filter(x => x.k && x.r && (!currentFCItem || x.k !== currentFCItem.k)); }
                // Random adaptif: huruf yang sering salah punya peluang lebih besar, tapi tetap anti-pengulangan.
                const weighted = [];
                pool.forEach(x => {
                    const weight = Math.max(1, Math.round((fcWeights[x.r] || 1) * 2));
                    for (let i = 0; i < weight; i++) weighted.push(x);
                });
                currentFCItem = shuffleArray(weighted)[0] || shuffleArray(pool)[0] || allKana[0];
                fcRecentAudio.push(currentFCItem.k);
                if (fcRecentAudio.length > 18) fcRecentAudio.shift();
                fcAudioChoices = makeAudioChoices(currentFCItem);
                fcAudioAnswered = false;
                fcSessionTotal++;
                return;
            }

            let totalWeight = 0;
            for(let r in fcWeights) totalWeight += fcWeights[r];
            let rand = Math.random() * totalWeight;
            
            // Roulette Wheel Selection (ML Weights)
            for(let i=0; i<allKana.length; i++) {
                rand -= fcWeights[allKana[i].r];
                if(rand <= 0) {
                    currentFCItem = allKana[i];
                    fcSessionTotal++;
                    return;
                }
            }
            currentFCItem = allKana[0];
        }

        function updateFCWeight(romaji, isCorrect) {
            if(isCorrect) {
                fcWeights[romaji] = Math.max(0.1, fcWeights[romaji] * 0.4); // Probabilitas diturunkan drastis jika benar
            } else {
                fcWeights[romaji] = Math.min(10.0, fcWeights[romaji] * 3.0); // Probabilitas dinaikkan 3x lipat jika salah (AI Penalty)
            }
        }


        function setFlashcardMode(mode) {
            fcMode = mode;
            isCardFlipped = false;
            fcAudioFeedback = '';
            fcAudioAnswered = false;
            fcAudioChoices = [];
            getNextFlashcard();
            renderFlashcard();
        }
        function makeAudioChoices(item) {
            const wrongs = shuffleArray(allKana.filter(x => x.r !== item.r && x.k && x.r)).slice(0, 2);
            return shuffleArray([item, ...wrongs]);
        }
        function replayFlashcardAudio(event) {
            if (!currentFCItem) return;
            playKanaSound(currentFCItem.k, currentFCItem.r, event);
        }
        function chooseAudioFlashcard(kana) {
            if (!currentFCItem || fcAudioAnswered) return;
            const ok = kana === currentFCItem.k;
            fcAudioAnswered = true;
            if (ok) {
                fcAudioFeedback = `✅ ${tr('correct_audio')} <b class="text-white">${currentFCItem.k}</b> (${currentFCItem.r}). Soal berikutnya akan diacak. +2 poin.`;
                updateFCWeight(currentFCItem.r, true);
                sendScore(1,0,2);
                renderFlashcard();
                setTimeout(() => nextAudioFlashcard(true), 850);
            } else {
                fcAudioFeedback = `❌ ${tr('wrong_audio')} Jawaban yang benar: <b class="text-white">${currentFCItem.k}</b> (${currentFCItem.r}). AI akan menambah peluang huruf ini muncul nanti, tapi bukan langsung diulang.`;
                updateFCWeight(currentFCItem.r, false);
                sendScore(0,1,-1);
                renderFlashcard();
            }
        }
        function nextAudioFlashcard(autoPlay = false) {
            fcAudioFeedback = '';
            fcAudioAnswered = false;
            getNextFlashcard();
            renderFlashcard();
            if (autoPlay) setTimeout(() => replayFlashcardAudio(), 180);
        }
        function renderFlashcard() {
            const item = currentFCItem;
            const cl = item.k.length;
            const fSize = cl <= 1 ? 'text-[8rem]' : cl === 2 ? 'text-[5.5rem]' : 'text-[4rem]';
            const bSize = item.r.length <= 2 ? 'text-6xl' : item.r.length <= 3 ? 'text-5xl' : 'text-4xl';
            if (fcMode === 'audio') {
                fcAudioChoices = (fcAudioChoices.length && fcAudioChoices.some(x => x.r === item.r)) ? fcAudioChoices : makeAudioChoices(item);
                const audioChoiceButtons = fcAudioChoices.map(ch => `<button onclick="chooseAudioFlashcard('${ch.k}')" ${fcAudioAnswered ? 'disabled' : ''} class="answer-choice rounded-2xl bg-white/[.05] hover:bg-sakura-500/15 border border-white/[.08] hover:border-sakura-400/40 py-4 text-4xl font-jp font-black text-sakura-200 transition disabled:opacity-45 disabled:cursor-not-allowed">${ch.k}</button>`).join('');
                contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 tab-content px-2">
                    <div class="mb-5 text-center w-full max-w-xl">
                        <span class="glass-card px-4 py-1.5 rounded-full text-sm font-semibold text-sakura-300 border border-sakura-400/15">AI Audio Quiz · Sesi ke-${fcSessionTotal}</span>
                        <div class="mt-4 grid grid-cols-2 gap-2 bg-white/[.035] p-2 rounded-2xl border border-white/[.06]">
                            <button onclick="setFlashcardMode('romaji')" class="py-2 rounded-xl text-sm font-bold text-neutral-400 hover:bg-white/[.06]">⌨️ ${tr('romaji_mode')}</button>
                            <button onclick="setFlashcardMode('audio')" class="py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-sakura-500 text-white">🔊 ${tr('audio_mode')}</button>
                        </div>
                    </div>
                    <div class="glass-card rounded-3xl border border-orange-400/20 bg-gradient-to-br from-orange-500/[.10] via-dark-800 to-sakura-500/[.08] p-6 w-full max-w-md text-center soft-glow-pink">
                        <p class="text-neutral-400 text-sm mb-4">${tr('listen_choose')}</p>
                        <button onclick="replayFlashcardAudio(event)" class="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-sakura-500 text-white text-4xl shadow-lg shadow-orange-500/20 hover:scale-105 transition flex items-center justify-center">🔊</button>
                        <p class="text-xs text-neutral-500 mt-4">${tr('replay_audio')}</p>
                        <div class="grid grid-cols-3 gap-2 mt-6">
                            ${audioChoiceButtons}
                        </div>
                        <div id="fc-audio-feedback" class="feedback-mobile-safe mt-4 text-sm font-bold ${fcAudioFeedback.includes('✅') ? 'text-emerald-300' : 'text-amber-300'}">${fcAudioFeedback || tr('feedback_wait')}</div>
                        <button onclick="nextAudioFlashcard(false)" class="mt-5 w-full py-3 rounded-2xl bg-white/[.06] hover:bg-white/[.10] border border-white/[.08] text-white font-bold">${tr('next_question')}</button>
                    </div>
                </div>`;
                lucide.createIcons();
                return;
            }

            contentDiv.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 tab-content px-2">
                    <div class="mb-5 text-center w-full max-w-xl">
                        <span class="glass-card px-4 py-1.5 rounded-full text-sm font-semibold text-sakura-300 border border-sakura-400/15">AI Adaptive Spaced Repetition · Sesi ke-${fcSessionTotal}</span>
                        <p class="text-neutral-500 mt-2 text-sm">Ketik Romaji lalu Kirim atau Enter</p>
                        <div class="mt-4 grid grid-cols-2 gap-2 bg-white/[.035] p-2 rounded-2xl border border-white/[.06]">
                            <button onclick="setFlashcardMode('romaji')" class="py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-sakura-500 to-sakura-600 text-white">⌨️ ${tr('romaji_mode')}</button>
                            <button onclick="setFlashcardMode('audio')" class="py-2 rounded-xl text-sm font-bold text-neutral-400 hover:bg-white/[.06]">🔊 ${tr('audio_mode')}</button>
                        </div>
                    </div>

                    <div class="perspective-1000 w-64 ${cl>=3?'h-72':'h-80'} mb-2 cursor-pointer ${isCardFlipped?'flipped':''}" onclick="toggleFlashcard()">
                        <div class="flip-card-inner relative w-full h-full transform-style-3d shadow-2xl rounded-3xl">
                            <div class="absolute w-full h-full backface-hidden bg-gradient-to-br from-dark-700 to-dark-800 border-2 border-white/[.08] rounded-3xl flex items-center justify-center p-4">
                                <button onclick="playKanaSound('${item.k}','${item.r}',event)" class="absolute right-4 bottom-4 w-10 h-10 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/20 text-orange-300">🔊</button>
                                <span class="${fSize} font-black text-sakura-300 font-jp drop-shadow-lg leading-none">${item.k}</span>
                            </div>
                            <div class="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-orange-600/20 to-dark-800 border-2 border-orange-400/30 rounded-3xl flex flex-col items-center justify-center p-4">
                                <span class="text-2xl mb-2">🎉</span>
                                <span class="text-sm text-orange-200 mb-1 font-bold">Jawaban Anda</span>
                                <span class="${bSize} font-black text-white font-mono uppercase">${item.r}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col items-center w-full max-w-xs mx-auto mb-6 mt-4">
                        <div class="flex w-full gap-2 relative">
                            <input type="text" id="fc-input"
                                class="flex-1 w-full bg-dark-800 border-2 border-white/[.08] rounded-2xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-sakura-400/60 transition placeholder-neutral-600"
                                placeholder="romaji..." autocomplete="off" autocapitalize="none" spellcheck="false"
                                onkeydown="if(event.key==='Enter') submitFCAnswer()">
                            <button onclick="submitFCAnswer()" class="px-5 rounded-2xl bg-sakura-500 hover:bg-sakura-400 text-white font-bold transition shadow-lg shadow-sakura-500/20">Kirim</button>
                        </div>
                        <p id="fc-msg" class="mt-3 h-6 text-sm font-bold"></p>
                    </div>
                    <button onclick="advanceFlashcard()" class="px-6 py-3 rounded-2xl bg-white/[.05] hover:bg-white/[.1] border border-white/[.08] text-neutral-300 transition font-semibold flex items-center gap-2"><i data-lucide="skip-forward" class="w-4 h-4"></i> Lewati / Berikutnya</button>
                </div>`;
            lucide.createIcons();
            setTimeout(()=>{ const i=document.getElementById('fc-input'); if(i) i.focus(); },100);
        }

        window.toggleFlashcard = () => { isCardFlipped = !isCardFlipped; renderFlashcard(); };
        window.submitFCAnswer = () => {
            if(isCardFlipped) return;
            const inp = document.getElementById('fc-input'), msg = document.getElementById('fc-msg');
            const val = inp.value.trim().toLowerCase(), item = currentFCItem;
            
            if(val===''){ msg.innerText='⚠️ Jawaban tidak boleh kosong.'; return; }
            
            const isCorrect = (val === item.r);
            updateFCWeight(item.r, isCorrect); // Train AI SRS

            if(isCorrect){
                msg.className='h-6 mt-2 text-sm font-bold text-emerald-400 text-center';
                msg.innerText='✅ Benar! AI mencatat perkembangan Anda.';
                isCardFlipped=true;
                sendScore(1,0,5);
                renderFlashcard();
                setTimeout(()=>{ if(isCardFlipped) advanceFlashcard(); }, 1200);
            } else {
                msg.className='h-6 mt-2 text-sm font-bold text-rose-400 text-center';
                msg.innerText='❌ Salah, AI akan mengulang huruf ini nanti.';
                sendScore(0,1,-2);
                inp.value=''; inp.focus();
            }
        };
        window.skipFlashcard = () => advanceFlashcard();
        function advanceFlashcard() { isCardFlipped=false; fcAudioFeedback=''; fcAudioChoices=[]; fcAudioAnswered=false; getNextFlashcard(); renderFlashcard(); }

