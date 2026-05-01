// ====================================================================
// HIRAGANA MODULE: MATERI + QUICK CHALLENGE + STROKE ORDER
// Dipisah dari hiragana.php agar mudah dirawat.
// ====================================================================
        let quickCurrent = null;
        let quickPool = [];
        function shuffleArray(arr) {
            return [...arr].sort(() => Math.random() - 0.5);
        }
        function nextQuickChallenge() {
            if (quickPool.length < 1) quickPool = shuffleArray(allKana.filter(x => x.k && x.r && !x.r.includes(' ')));
            quickCurrent = quickPool.pop() || allKana[0];
            const wrongs = shuffleArray(allKana.filter(x => x.r !== quickCurrent.r && x.k && x.r)).slice(0, 2);
            const choices = shuffleArray([quickCurrent, ...wrongs].map(x => x.r));
            const q = document.getElementById('quick-kana');
            const c = document.getElementById('quick-choices');
            const m = document.getElementById('hir-msg');
            if (q) q.textContent = quickCurrent.k;
            if (c) c.innerHTML = choices.map(ans => `<button onclick="checkQuickAnswer('${ans}')" class="answer-choice flex-1 min-w-[84px] sm:flex-none px-5 py-3 rounded-xl bg-white/[.045] hover:bg-sakura-500/15 border border-white/[.08] hover:border-sakura-400/40 transition-all font-mono font-black text-lg text-white">${ans}</button>`).join('');
            if (m) { m.className='mt-3 text-sm font-medium min-h-6 relative text-neutral-500'; m.innerHTML='Soal selalu diacak otomatis setelah menjawab.'; }
        }
        window.checkQuickAnswer = (ans) => {
            if (!quickCurrent) nextQuickChallenge();
            const ok = (ans === quickCurrent.r);
            const msg = document.getElementById('hir-msg');
            if(ok){ msg.className='mt-3 text-sm font-bold text-emerald-300 min-h-6 relative'; msg.innerHTML=`✅ Benar! ${quickCurrent.k} dibaca <span class="text-white">${quickCurrent.r}</span>. +2 poin.`; sendScore(1,0,2); }
            else{ msg.className='mt-3 text-sm font-bold text-rose-300 min-h-6 relative'; msg.innerHTML=`❌ Belum tepat. ${quickCurrent.k} dibaca <span class="text-white">${quickCurrent.r}</span>. -1 poin.`; sendScore(0,1,-1); }
            setTimeout(nextQuickChallenge, 900);
        };
        function buildGrid(data, cols=5) {
            let h = `<div class="grid grid-cols-3 sm:grid-cols-${cols} gap-2 sm:gap-3 mb-8">`;
            data.forEach(item => {
                if(item.k==='') { h += '<div class="hidden sm:block"></div>'; return; }
                const isDaku = /Dakuon/.test(item.type || '') && !/Handakuon/.test(item.type || '');
                const isHanda = /Handakuon/.test(item.type || '');
                const typeClass = isHanda ? 'kana-cell-handa' : (isDaku ? 'kana-cell-daku' : '');
                const badge = isHanda ? '<span class="absolute left-2 top-2 text-[9px] px-1.5 py-0.5 rounded-md bg-purple-400/10 text-purple-300 border border-purple-400/10">゜</span>' : (isDaku ? '<span class="absolute left-2 top-2 text-[9px] px-1.5 py-0.5 rounded-md bg-orange-400/10 text-orange-300 border border-orange-400/10">゛</span>' : '');
                h += `<div onclick="showStrokeModal('${item.k}','${item.r}','${item.type}',${item.s})"
                    class="kana-cell ${typeClass} glass-card rounded-2xl p-3 sm:p-4 text-center cursor-pointer group border border-white/[.06] hover:border-sakura-400/30 relative soft-glow-pink">
                    ${badge}
                    <div class="kana-char text-3xl sm:text-4xl font-black text-sakura-300 font-jp transition-all">${item.k}</div>
                    <div class="kana-romaji-label text-[11px] sm:text-xs text-orange-400/90 font-mono tracking-widest">${item.r}</div>
                    <button type="button" onclick="playKanaSound('${item.k}','${item.r}',event)" class="kana-audio-btn opacity-90 group-hover:opacity-100" title="Dengarkan suara ${item.r}" aria-label="Dengarkan ${item.r}">🔊</button>
                </div>`;
            });
            h += '</div>';
            return h;
        }
        function getMateriIntroHTML() {
            return `
                    <section class="glass-card rounded-3xl p-5 md:p-7 border border-sakura-400/15 bg-gradient-to-br from-sakura-500/[.08] via-dark-800 to-orange-500/[.06] relative overflow-hidden">
                        <div class="absolute -top-16 -right-16 w-44 h-44 bg-sakura-400/10 rounded-full blur-[70px] pointer-events:none"></div>
                        <h2 class="text-xl sm:text-2xl font-black text-white mb-3 flex items-center gap-3"><span class="w-10 h-10 rounded-2xl bg-sakura-500/15 border border-sakura-400/20 flex items-center justify-center">🌸</span>${tr('materi_intro_title')}</h2>
                        <p class="text-neutral-300 text-sm sm:text-base leading-relaxed mb-5">${tr('materi_intro_body')}</p>
                        
                        <!-- TAMBAHAN PENJELASAN PENGGUNAAN HIRAGANA -->
                        <div class="mb-5 rounded-2xl bg-white/[.04] border border-sakura-400/20 p-5">
                            <h3 class="font-black text-sakura-300 mb-3 text-lg border-b border-sakura-400/20 pb-2">📌 Penggunaan Huruf Hiragana Buat Apa Saja?</h3>
                            <ul class="text-sm text-neutral-300 leading-relaxed space-y-2 list-disc list-inside">
                                <li>Menulis kata-kata asli bahasa Jepang (<em class="text-white">Yamato kotoba</em>) yang tidak memiliki kanji atau kanjinya terlalu sulit/jarang digunakan.</li>
                                <li>Menulis <strong class="text-white">partikel tata bahasa (joshi)</strong> seperti は (wa), を (o), に (ni), で (de).</li>
                                <li>Menulis <strong class="text-white">Okurigana</strong>, yaitu akhiran kata kerja dan kata sifat yang mengikuti kanji (contoh: 食べる - <em>ta</em> dari kanji, <em>beru</em> ditulis dengan hiragana).</li>
                                <li>Menulis <strong class="text-white">Furigana</strong>, yaitu cara baca (huruf hiragana kecil) yang diletakkan di atas atau di samping kanji untuk membantu pembaca mengetahui cara bacanya.</li>
                            </ul>
                        </div>

                        <!-- TAMBAHAN PENJELASAN DAKUTEN, HANDAKUTEN, YOON -->
                        <div class="mb-5 rounded-2xl bg-white/[.04] border border-orange-400/20 p-5">
                            <h3 class="font-black text-orange-300 mb-3 text-lg border-b border-orange-400/20 pb-2">✨ Penggunaan Dakuten, Handakuten, dan Yoon</h3>
                            <ul class="text-sm text-neutral-300 leading-relaxed space-y-4 list-none">
                                <li>
                                    <strong class="text-white text-base">Dakuten (゛) - Tanda Petik Dua</strong><br>
                                    Ditambahkan pada huruf dasar (K, S, T, H) untuk mengubahnya menjadi bunyi bersuara/berat (G, Z, D, B).<br>
                                    <em class="text-orange-200">Kenapa harus pakai?</em> Karena bahasa Jepang memiliki variasi kosa kata yang bergantung pada bunyi bersuara ini. Penggunaan tanda ini mempermudah kita karena tidak perlu menghafal bentuk huruf baru lagi (menghemat jumlah hafalan huruf).
                                </li>
                                <li>
                                    <strong class="text-white text-base">Handakuten (゜) - Tanda Lingkaran Kecil</strong><br>
                                    Khusus ditambahkan pada baris 'H' (ha, hi, fu, he, ho) untuk mengubahnya menjadi bunyi letupan 'P' (pa, pi, pu, pe, po).<br>
                                    <em class="text-orange-200">Kenapa harus pakai?</em> Digunakan untuk merepresentasikan bunyi letupan keras 'p', yang sangat sering muncul dalam kata serapan, onomatope (suara tiruan benda/hewan), atau karena perubahan pelafalan saat dua kata digabung menjadi satu.
                                </li>
                                <li>
                                    <strong class="text-white text-base">Yoon (ゃ, ゅ, ょ) - Huruf Kecil ya, yu, yo</strong><br>
                                    Huruf ya, yu, yo berukuran kecil yang ditempelkan di sebelah kanan huruf berakhiran bunyi 'i' (ki, shi, chi, ni, hi, mi, ri).<br>
                                    <em class="text-orange-200">Kenapa harus pakai?</em> Untuk menciptakan bunyi campuran atau palatal (seperti kya, shu, cho) dalam satu ketukan napas (mora). Ini wajib karena banyak kosakata (terutama serapan dari Tiongkok) memiliki bunyi palatal yang tidak bisa ditulis hanya dengan deretan huruf dasar tunggal biasa.
                                </li>
                            </ul>
                        </div>

                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="rounded-2xl bg-white/[.04] border border-white/[.08] p-4"><h3 class="font-black text-sakura-300 mb-2">${tr('seion_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('seion_body')}</p></div>
                            <div class="rounded-2xl bg-white/[.04] border border-orange-400/15 p-4"><h3 class="font-black text-orange-300 mb-2">${tr('daku_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('daku_body')}</p></div>
                            <div class="rounded-2xl bg-white/[.04] border border-purple-400/15 p-4"><h3 class="font-black text-purple-300 mb-2">${tr('handa_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('handa_body')}</p></div>
                            <div class="rounded-2xl bg-white/[.04] border border-blue-400/15 p-4"><h3 class="font-black text-blue-300 mb-2">${tr('yoon_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('yoon_body')}</p></div>
                        </div>
                        <div class="mt-4 grid lg:grid-cols-2 gap-4">
                            <div class="rounded-2xl bg-emerald-400/[.06] border border-emerald-400/15 p-4"><h3 class="font-black text-emerald-300 mb-2">${tr('usage_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('usage_body')}</p></div>
                            <div class="rounded-2xl bg-amber-400/[.06] border border-amber-400/15 p-4"><h3 class="font-black text-amber-300 mb-2">${tr('memory_title')}</h3><p class="text-sm text-neutral-300 leading-relaxed">${tr('memory_body')}</p></div>
                        </div>
                    </section>`;
        }

        function renderMateri() {
            contentDiv.innerHTML = `
                <div class="tab-content space-y-6">
                    ${getMateriIntroHTML()}
                    <section class="glass-card rounded-3xl p-5 sm:p-6 border border-blue-400/15 relative overflow-hidden bg-gradient-to-br from-blue-500/[.06] via-white/[.02] to-sakura-500/[.05]">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-[60px] pointer-events:none"></div>
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative">
                            <div>
                                <h2 class="text-lg sm:text-xl font-bold flex items-center gap-2 text-blue-300">
                                    <div class="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center"><i data-lucide="zap" class="w-4 h-4 text-blue-400"></i></div> ${tr('quick_title')}
                                </h2>
                                <p class="text-sm text-neutral-400 mt-2">${tr('quick_desc')} <span id="quick-kana" class="text-3xl font-jp font-black text-sakura-300 mx-1">あ</span></p>
                            </div>
                            <button onclick="nextQuickChallenge()" class="px-4 py-2 rounded-xl bg-white/[.05] hover:bg-white/[.10] border border-white/[.08] text-neutral-200 text-sm font-bold">🔀 ${tr('random_question')}</button>
                        </div>
                        <div id="quick-choices" class="mt-4 flex flex-wrap gap-2 sm:gap-3 relative"></div>
                        <p id="hir-msg" class="mt-3 text-sm font-medium min-h-6 relative text-neutral-500"></p>
                    </section>

                    <section class="tip-card glass-card rounded-3xl p-5 sm:p-6 border border-sakura-400/15 relative overflow-hidden">
                        <div class="absolute -right-16 -top-16 w-40 h-40 bg-sakura-400/10 rounded-full blur-[80px]"></div>
                        <h2 class="text-lg font-black text-white mb-4 flex items-center gap-2"><span class="text-2xl">🧠</span> Tips Hafalan Cepat ala Anak Kecil</h2>
                        <div class="grid md:grid-cols-2 gap-3 text-sm">
                            <div class="rounded-2xl bg-dark-900/70 border border-white/[.06] p-4"><b class="text-sakura-300">A I U E O</b><p class="text-neutral-400 mt-1">Ingat seperti nyanyi: <span class="text-white font-bold">a-i-u-e-o</span>. Baris lain tinggal tambah depan: ka-ki-ku-ke-ko, sa-shi-su-se-so.</p></div>
                            <div class="rounded-2xl bg-dark-900/70 border border-white/[.06] p-4"><b class="text-orange-300">Dakuten ゛ = tanda petik kecil</b><p class="text-neutral-400 mt-1">Tempel tanda petik, suara jadi lebih “berat”: <span class="text-white font-bold">ka→ga, sa→za, ta→da, ha→ba</span>. Ingat: <b class="text-orange-300">G Z D B</b>.</p></div>
                            <div class="rounded-2xl bg-dark-900/70 border border-white/[.06] p-4"><b class="text-purple-300">Handakuten ゜ = lingkaran kecil</b><p class="text-neutral-400 mt-1">Khusus baris HA jadi P: <span class="text-white font-bold">ha→pa, hi→pi, fu→pu, he→pe, ho→po</span>. Lingkaran seperti “pop!” jadi P.</p></div>
                            <div class="rounded-2xl bg-dark-900/70 border border-white/[.06] p-4"><b class="text-emerald-300">Yoon kecil ゃゅょ</b><p class="text-neutral-400 mt-1">Huruf kecil menempel: <span class="text-white font-bold">き + ゃ = きゃ kya</span>. Bayangkan huruf kecil itu “nebeng” bunyi depan.</p></div>
                        </div>
                    </section>

                    <div class="glass-card rounded-2xl p-4 border border-sakura-400/10 text-sm flex gap-3 items-center">
                        <span class="text-xl shrink-0">💡</span>
                        <p class="text-neutral-300"><strong class="text-sakura-300">Tips:</strong> Klik huruf Hiragana untuk melihat <strong class="text-white">animasi cara penulisan</strong>. Tombol 🔊 sekarang dipindah supaya tanda dakuten/handakuten tidak ketutup.</p>
                    </div>
                    <section class="glass-card rounded-3xl p-5 md:p-8 relative overflow-hidden">
                        <div class="absolute -top-20 -left-20 w-40 h-40 bg-sakura-400/5 rounded-full blur-[80px] pointer-events:none"></div>
                        <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                            <span class="w-8 h-8 rounded-lg bg-sakura-400/10 text-sakura-400 text-xs font-black flex items-center justify-center border border-sakura-400/15">01</span>
                            <span class="text-white">Huruf Dasar</span>
                            <span class="text-xs font-jp text-sakura-400/40">五十音</span>
                        </h2>
                        ${buildGrid(dataGojuuon,5)}
                    </section>
                    <section class="grid lg:grid-cols-2 gap-5">
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-orange-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-orange-400/5 rounded-full blur-[60px] pointer-events:none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-orange-400/10 text-orange-400 text-xs font-black flex items-center justify-center border border-orange-400/15">02</span>
                                <span class="text-white">Dakuon & Handakuon</span>
                            </h2>
                            ${buildGrid(dataDakuon,5)}
                        </div>
                        <div class="glass-card rounded-3xl p-5 md:p-6 relative overflow-hidden border border-purple-400/10">
                            <div class="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-400/5 rounded-full blur-[60px] pointer-events:none"></div>
                            <h2 class="text-lg font-bold mb-5 flex items-center gap-3 relative">
                                <span class="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 text-xs font-black flex items-center justify-center border border-purple-400/15">03</span>
                                <span class="text-white">Bunyi Campuran</span>
                                <span class="text-xs text-purple-400/40">拗音</span>
                            </h2>
                            ${buildGrid(dataYoon,3)}
                        </div>
                    </section>
                </div>`;
            lucide.createIcons();
            nextQuickChallenge();
        }

        // ==========================================
        // 5b. HIRAGANA STROKE ORDER DARI WIKIMEDIA
        // Animasi resmi GIF + latihan tulis canvas + scoring pixel
        // ==========================================
        window.currentStrokeKana = '';
        window.currentStrokeRomaji = '';
        window.currentStrokeType = '';
        window.currentStrokeCount = 0;
        window.isPracticeMode = false;
        window.practiceDrawing = false;
        window.practiceCtx = null;
        window.lastScore = 0;

        const wikimediaKanaMap = {
            'あ':'あ','い':'い','う':'う','え':'え','お':'お',
            'か':'か','き':'き','く':'く','け':'け','こ':'こ',
            'さ':'さ','し':'し','す':'す','せ':'せ','そ':'そ',
            'た':'た','ち':'ち','つ':'つ','て':'て','と':'と',
            'な':'な','に':'に','ぬ':'ぬ','ね':'ね','の':'の',
            'は':'は','ひ':'ひ','ふ':'ふ','へ':'へ','ほ':'ほ',
            'ま':'ま','み':'み','む':'む','め':'め','も':'も',
            'や':'や','ゆ':'ゆ','よ':'よ',
            'ら':'ら','り':'り','る':'る','れ':'れ','ろ':'ろ',
            'わ':'わ','を':'を','ん':'ん',
            'ゐ':'ゐ','ゑ':'ゑ'
        };

        const dakutenBaseMap = {
            'が':'か','ぎ':'き','ぐ':'く','げ':'け','ご':'こ',
            'ざ':'さ','じ':'し','ず':'す','ぜ':'せ','ぞ':'そ',
            'だ':'た','ぢ':'ち','づ':'つ','で':'て','ど':'と',
            'ば':'は','び':'ひ','ぶ':'ふ','べ':'へ','ぼ':'ほ',
            'ぱ':'は','ぴ':'ひ','ぷ':'ふ','ぺ':'へ','ぽ':'ほ',
            'ゃ':'や','ゅ':'ゆ','ょ':'よ',
            'ぁ':'あ','ぃ':'い','ぅ':'う','ぇ':'え','ぉ':'お','っ':'つ'
        };

        function setStrokeLabel(text, className) {
            const label = document.getElementById('stroke-label');
            if (!label) return;
            label.innerText = text;
            label.className = className || 'text-center text-xs text-neutral-400 mb-5 h-4 font-medium';
        }

        function setStrokeMode(activeMode) {
            const autoBtn = document.getElementById('mode-auto');
            const practiceBtn = document.getElementById('mode-practice');
            if (!autoBtn || !practiceBtn) return;

            const activeClass = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-sakura-500/20 text-sakura-300 border border-sakura-400/20 shadow-inner';
            const inactiveClass = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all bg-white/[.04] text-neutral-400 border border-white/[.08] hover:bg-white/[.08]';

            autoBtn.className = activeMode === 'auto' ? activeClass : inactiveClass;
            practiceBtn.className = activeMode === 'practice' ? activeClass : inactiveClass;
        }

        function getBaseKanaForAnimation(char) {
            if (wikimediaKanaMap[char]) return char;
            if (dakutenBaseMap[char]) return dakutenBaseMap[char];
            return char;
        }

        function getWikimediaGifUrl(char) {
            const baseKana = getBaseKanaForAnimation(char);
            const filename = `Hiragana ${baseKana} stroke order animation.gif`;
            return `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;
        }

        function clearPracticeCanvas() {
            const canvas = document.getElementById('practice-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function clearTargetCanvas() {
            const canvas = document.getElementById('target-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function hideGif() {
            const img = document.getElementById('stroke-gif-image');
            if (!img) return;
            img.style.display = 'none';
            img.removeAttribute('src');
        }

        function showGifForKana(k) {
            const img = document.getElementById('stroke-gif-image');
            if (!img) return;

            const chars = Array.from(k);
            const firstChar = chars[0];
            const src = getWikimediaGifUrl(firstChar);

            img.style.display = 'block';
            img.removeAttribute('src');

            setTimeout(() => {
                img.src = src;
            }, 60);

            img.onerror = () => {
                hideGif();
                drawTargetKana(k, 0.25);
                setStrokeLabel(
                    '⚠️ GIF animasi tidak bisa dimuat. Mode latihan tetap bisa digunakan.',
                    'text-center text-xs text-amber-400 mb-5 h-4 font-bold'
                );
            };

            img.onload = () => {
                if (chars.length > 1) {
                    setStrokeLabel(
                        `Animasi memakai huruf dasar "${getBaseKanaForAnimation(firstChar)}". Latihan tetap memakai bentuk lengkap "${k}".`,
                        'text-center text-xs text-amber-300 mb-5 h-4 font-bold'
                    );
                } else if (dakutenBaseMap[firstChar]) {
                    setStrokeLabel(
                        `Animasi memakai huruf dasar "${getBaseKanaForAnimation(firstChar)}". Tambahkan tanda dakuten/handakuten saat latihan.`,
                        'text-center text-xs text-amber-300 mb-5 h-4 font-bold'
                    );
                } else {
                    setStrokeLabel(
                        '✅ Animasi stroke order dimuat.',
                        'text-center text-xs text-emerald-400 mb-5 h-4 font-bold tracking-widest'
                    );
                }
            };
        }

        function getCanvasPosition(e, canvas) {
            const rect = canvas.getBoundingClientRect();
            let clientX;
            let clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        }

        function setupPracticeCanvas() {
            const canvas = document.getElementById('practice-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            window.practiceCtx = ctx;
            ctx.lineWidth = 4.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#FDBA74';
            ctx.shadowBlur = 0;

            canvas.onpointerdown = null;
            canvas.onpointermove = null;
            canvas.onpointerup = null;
            canvas.onpointerleave = null;
            canvas.ontouchstart = null;
            canvas.ontouchmove = null;
            canvas.ontouchend = null;
            canvas.onmousedown = null;
            canvas.onmousemove = null;
            canvas.onmouseup = null;
            canvas.onmouseleave = null;

            function startDraw(e) {
                if (!window.isPracticeMode) return;
                e.preventDefault();
                window.practiceDrawing = true;

                if (canvas.setPointerCapture && e.pointerId !== undefined) {
                    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
                }

                const pos = getCanvasPosition(e, canvas);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
            }

            function draw(e) {
                if (!window.isPracticeMode || !window.practiceDrawing) return;
                e.preventDefault();
                const pos = getCanvasPosition(e, canvas);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }

            function stopDraw(e) {
                if (!window.isPracticeMode) return;
                if (e) e.preventDefault();
                window.practiceDrawing = false;
                ctx.beginPath();
            }

            if (window.PointerEvent) {
                canvas.addEventListener('pointerdown', startDraw);
                canvas.addEventListener('pointermove', draw);
                canvas.addEventListener('pointerup', stopDraw);
                canvas.addEventListener('pointerleave', stopDraw);
                canvas.addEventListener('pointercancel', stopDraw);
            } else {
                canvas.addEventListener('mousedown', startDraw);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', stopDraw);
                canvas.addEventListener('mouseleave', stopDraw);
                canvas.addEventListener('touchstart', startDraw, { passive: false });
                canvas.addEventListener('touchmove', draw, { passive: false });
                canvas.addEventListener('touchend', stopDraw, { passive: false });
                canvas.addEventListener('touchcancel', stopDraw, { passive: false });
            }
        }

        function drawTargetKana(k, opacity = 0.20) {
            const canvas = document.getElementById('target-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#F472B6';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const fontSize = Array.from(k).length > 1 ? 92 : 135;
            ctx.font = `900 ${fontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
            ctx.fillText(k, canvas.width / 2, canvas.height / 2 + 8);
            ctx.restore();
        }

        function buildTargetCanvas(k, options = {}) {
            const canvas = document.createElement('canvas');
            canvas.width = 280;
            canvas.height = 220;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const fontSize = Array.from(k).length > 1 ? 92 : 135;
            ctx.font = `900 ${fontSize}px "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif`;
            ctx.fillText(k, canvas.width / 2, canvas.height / 2 + 8);

            return canvas;
        }

        function getImageMaskFromCanvas(canvas, alphaThreshold = 18) {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const mask = new Uint8Array(canvas.width * canvas.height);
            const pixels = [];

            for (let i = 3, p = 0; i < data.length; i += 4, p++) {
                if (data[i] > alphaThreshold) {
                    mask[p] = 1;
                    pixels.push(p);
                }
            }

            return { mask, pixels, width: canvas.width, height: canvas.height };
        }

        function getTargetMask(k) {
            return getImageMaskFromCanvas(buildTargetCanvas(k), 18);
        }

        function getUserMask() {
            const canvas = document.getElementById('practice-canvas');
            if (!canvas) return null;
            return getImageMaskFromCanvas(canvas, 18);
        }

        function getMaskBounds(pixels, width, height) {
            if (!pixels || pixels.length === 0) return null;

            let minX = width, minY = height, maxX = 0, maxY = 0;
            for (const p of pixels) {
                const x = p % width;
                const y = Math.floor(p / width);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }

            return {
                minX, minY, maxX, maxY,
                w: maxX - minX + 1,
                h: maxY - minY + 1,
                cx: (minX + maxX) / 2,
                cy: (minY + maxY) / 2,
                area: (maxX - minX + 1) * (maxY - minY + 1)
            };
        }

        function hasNeighbor(mask, width, height, x, y, radius) {
            const r2 = radius * radius;
            const yStart = Math.max(0, y - radius);
            const yEnd = Math.min(height - 1, y + radius);
            const xStart = Math.max(0, x - radius);
            const xEnd = Math.min(width - 1, x + radius);

            for (let yy = yStart; yy <= yEnd; yy++) {
                const dy = yy - y;
                for (let xx = xStart; xx <= xEnd; xx++) {
                    const dx = xx - x;
                    if ((dx * dx + dy * dy) <= r2 && mask[yy * width + xx]) {
                        return true;
                    }
                }
            }
            return false;
        }

        function countPixelsNearMask(sourcePixels, targetMask, width, height, radius) {
            if (!sourcePixels || sourcePixels.length === 0) return 0;
            let count = 0;

            for (const p of sourcePixels) {
                const x = p % width;
                const y = Math.floor(p / width);
                if (hasNeighbor(targetMask, width, height, x, y, radius)) count++;
            }

            return count;
        }

        function bboxSimilarity(userBounds, targetBounds) {
            if (!userBounds || !targetBounds) return 0;

            const centerDistance = Math.hypot(userBounds.cx - targetBounds.cx, userBounds.cy - targetBounds.cy);
            const centerScore = Math.max(0, 1 - centerDistance / 90);

            const widthRatio = Math.min(userBounds.w, targetBounds.w) / Math.max(userBounds.w, targetBounds.w);
            const heightRatio = Math.min(userBounds.h, targetBounds.h) / Math.max(userBounds.h, targetBounds.h);

            const xOverlap = Math.max(0, Math.min(userBounds.maxX, targetBounds.maxX) - Math.max(userBounds.minX, targetBounds.minX));
            const yOverlap = Math.max(0, Math.min(userBounds.maxY, targetBounds.maxY) - Math.max(userBounds.minY, targetBounds.minY));
            const overlapArea = xOverlap * yOverlap;
            const unionArea = userBounds.area + targetBounds.area - overlapArea;
            const iou = unionArea > 0 ? overlapArea / unionArea : 0;

            return Math.max(0, Math.min(1, (centerScore * 0.35) + (widthRatio * 0.2) + (heightRatio * 0.2) + (iou * 0.25)));
        }

        function calculateWritingScore(k) {
            const target = getTargetMask(k);
            const user = getUserMask();
            if (!target || !user || target.pixels.length === 0 || user.pixels.length === 0) return 0;

            const width = target.width;
            const height = target.height;
            const targetCount = target.pixels.length;
            const userCount = user.pixels.length;

            // Toleransi dibuat seperti koreksi guru: tulisan masih benar kalau dekat dengan bentuk huruf,
            // tetapi coretan jauh dari bentuk huruf tetap dihukum.
            const userInsideTarget = countPixelsNearMask(user.pixels, target.mask, width, height, 5);
            const targetTouchedByUser = countPixelsNearMask(target.pixels, user.mask, width, height, 10);

            const precisionScore = userInsideTarget / userCount;

            // Karena tulisan tangan berupa garis tipis, tidak mungkin menutup seluruh huruf font yang tebal.
            // Maka coverage dinormalisasi: 42% target tersentuh sudah dianggap sangat baik.
            const rawCoverage = targetTouchedByUser / targetCount;
            const coverageScore = Math.max(0, Math.min(1, rawCoverage / 0.42));

            const targetBounds = getMaskBounds(target.pixels, width, height);
            const userBounds = getMaskBounds(user.pixels, width, height);
            const shapeScore = bboxSimilarity(userBounds, targetBounds);

            // Jumlah tinta juga dicek. Terlalu sedikit = belum menulis, terlalu banyak = coretan berlebihan.
            const inkRatio = userCount / targetCount;
            let inkScore = 1;
            if (inkRatio < 0.06) inkScore = inkRatio / 0.06;
            else if (inkRatio > 0.55) inkScore = Math.max(0, 1 - ((inkRatio - 0.55) / 0.55));

            const outsideRatio = 1 - precisionScore;
            const outsidePenalty = Math.min(0.22, outsideRatio * 0.28);

            let score = (
                precisionScore * 0.34 +
                coverageScore * 0.30 +
                shapeScore * 0.24 +
                inkScore * 0.12 -
                outsidePenalty
            ) * 100;

            // Penalti ekstra agar coretan kecil di tengah tidak langsung tinggi.
            if (coverageScore < 0.30) score *= 0.72;
            if (shapeScore < 0.35) score *= 0.78;
            if (precisionScore < 0.45) score *= 0.72;

            return Math.max(0, Math.min(100, Math.round(score)));
        }

        function showScore(score) {
            window.lastScore = score;
            const scoreBox = document.getElementById('scoreBox');
            const scoreText = document.getElementById('scoreText');
            const scoreBar = document.getElementById('scoreBar');
            const scoreNote = document.getElementById('scoreNote');

            if (!scoreBox || !scoreText || !scoreBar || !scoreNote) {
                setStrokeLabel(`Skor tulisan: ${score}%`, 'text-center text-xs text-emerald-400 mb-5 h-4 font-bold');
                return;
            }

            scoreBox.classList.remove('hidden');
            scoreText.innerText = `${score}%`;
            scoreBar.style.width = `${score}%`;

            if (score >= 88) {
                scoreNote.innerText = 'Sangat bagus. Posisi, ukuran, dan bentuk tulisan sudah mendekati bayangan huruf.';
            } else if (score >= 72) {
                scoreNote.innerText = 'Bagus. Sedikit rapikan bagian yang keluar dari bentuk huruf.';
            } else if (score >= 50) {
                scoreNote.innerText = 'Sudah mulai mirip. Ikuti ukuran dan lengkungan bayangan lebih pelan.';
            } else {
                scoreNote.innerText = 'Belum mirip. Tekan Ulang lalu tulis mengikuti bayangan dari awal.';
            }

            setStrokeLabel(
                `Skor tulisan: ${score}%`,
                score >= 70 ? 'text-center text-xs text-emerald-400 mb-5 h-4 font-bold' : 'text-center text-xs text-amber-400 mb-5 h-4 font-bold'
            );

            // Supaya feedback terlihat, tetapi tombol silang tetap sticky di atas modal.
            setTimeout(() => {
                scoreBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 80);
        }

        window.resetWriting = () => {
            clearPracticeCanvas();
            const scoreBox = document.getElementById('scoreBox');
            const scoreText = document.getElementById('scoreText');
            const scoreBar = document.getElementById('scoreBar');
            const scoreNote = document.getElementById('scoreNote');
            if (scoreBox) scoreBox.classList.add('hidden');
            if (scoreText) scoreText.innerText = '0%';
            if (scoreBar) scoreBar.style.width = '0%';
            if (scoreNote) scoreNote.innerText = 'Tulis huruf terlebih dahulu, lalu klik Nilai Tulisan.';

            if (window.isPracticeMode) {
                setStrokeLabel('✏️ Tulis mengikuti bayangan huruf.', 'text-center text-xs text-neutral-300 mb-5 h-4 font-bold');
            }
        };

        window.checkWritingScore = () => {
            if (!window.isPracticeMode) {
                hwPractice();
                setStrokeLabel('✏️ Mode latihan diaktifkan. Tulis dulu, lalu klik Nilai Tulisan.', 'text-center text-xs text-amber-300 mb-5 h-4 font-bold');
                return;
            }

            const k = window.currentStrokeKana;
            const score = calculateWritingScore(k);
            showScore(score);

            if (score >= 70 && typeof sendScore === 'function') {
                sendScore(1, 0, 2);
            }
        };

        window.showStrokeModal = (k, r, type, strokes) => {
            window.currentStrokeKana = k;
            window.currentStrokeRomaji = r;
            window.currentStrokeType = type;
            window.currentStrokeCount = strokes;
            window.isPracticeMode = false;
            window.practiceDrawing = false;

            document.getElementById('modal-romaji').innerText = r;
            document.getElementById('modal-type').innerText = type;
            document.getElementById('modal-strokes').innerText = strokes;
            document.getElementById('strokeModal').classList.remove('hidden');

            setupPracticeCanvas();
            clearPracticeCanvas();
            clearTargetCanvas();
            const scoreBox = document.getElementById('scoreBox');
            if (scoreBox) scoreBox.classList.add('hidden');

            setTimeout(() => hwAnimate(), 150);
        };

        window.hwAnimate = () => {
            window.isPracticeMode = false;
            window.practiceDrawing = false;
            setStrokeMode('auto');
            clearPracticeCanvas();
            clearTargetCanvas();
            const scoreBox = document.getElementById('scoreBox');
            if (scoreBox) scoreBox.classList.add('hidden');

            setStrokeLabel('Memuat animasi stroke order...', 'text-center text-xs text-sakura-400 mb-5 h-4 animate-pulse');
            showGifForKana(window.currentStrokeKana);
        };

        window.hwPractice = () => {
            window.isPracticeMode = true;
            window.practiceDrawing = false;
            setStrokeMode('practice');
            hideGif();
            clearPracticeCanvas();
            clearTargetCanvas();
            drawTargetKana(window.currentStrokeKana, 0.20);
            setupPracticeCanvas();

            const scoreBox = document.getElementById('scoreBox');
            if (scoreBox) scoreBox.classList.add('hidden');

            setStrokeLabel('✏️ Tulis mengikuti bayangan huruf. Mouse dan touch aktif.', 'text-center text-xs text-neutral-300 mb-5 h-4 font-bold');
        };

        window.hideStrokeModal = () => {
            window.isPracticeMode = false;
            window.practiceDrawing = false;
            hideGif();
            clearPracticeCanvas();
            clearTargetCanvas();
            const modal = document.getElementById('strokeModal');
            if (modal) modal.classList.add('hidden');
        };

