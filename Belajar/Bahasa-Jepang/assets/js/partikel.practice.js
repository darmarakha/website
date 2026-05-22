// LATIHAN MODE / QUICK REVIEW
// =====================================
let currentLatihanIndex = 0;
let latihanScore = 0;
let latihanData = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnStartLatihan = document.getElementById('btnStartLatihan');
    if(btnStartLatihan) {
        btnStartLatihan.addEventListener('click', startLatihan);
    }
    const btnStartUjian = document.getElementById('btnStartUjian');
    if(btnStartUjian) {
        btnStartUjian.addEventListener('click', startUjianJLPT);
    }
});

function startUjianJLPT() {
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    const soalList = generateUjianSoal(20);
    localStorage.setItem('gy_jp_ujian_soal', JSON.stringify(soalList));
    localStorage.setItem('gy_jp_ujian_idx', '0');
    localStorage.setItem('gy_jp_ujian_score', '0');
    renderUjianSoal(0);
}

function generateUjianSoal(count) {
    let pool = [];
    if (typeof partikelData === 'undefined') return [];
    partikelData.forEach(p => {
        if (p.jlptQuestions && p.jlptQuestions.length > 0) {
            p.jlptQuestions.forEach(q => {
                pool.push({ ...q, partikelId: p.id, partikelChar: p.char });
            });
        }
    });
    if (pool.length === 0) return [];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

function renderUjianSoal(idx) {
    const saved = localStorage.getItem('gy_jp_ujian_soal');
    const soalList = saved ? JSON.parse(saved) : [];
    if (!soalList || idx >= soalList.length) {
        renderUjianHasil();
        return;
    }
    const q = soalList[idx];
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    const isEssay = !q.opsi || q.opsi.length === 0;
    let opsiHtml = '';
    if (q.opsi && q.opsi.length > 0) {
        opsiHtml = q.opsi.map((opt, i) =>
            `<button class="ujian-option w-full text-left p-4 rounded-xl border border-white/10 bg-[#0d1117] hover:bg-white/5 font-medium mb-3 transition" onclick="jawabUjian(${i}, ${idx})">${opt}</button>`
        ).join('');
    }
    container.innerHTML = `
        <div class="text-center py-6">
            <div class="text-sm text-neutral-500 mb-4">Soal ${idx + 1} dari ${soalList.length}</div>
            <p class="text-xl font-jp mb-6">${q.soal}</p>
            ${q.partikelChar ? `<div class="inline-block px-3 py-1 rounded-full bg-white/5 text-sm text-neutral-400 mb-4">Partikel: ${q.partikelChar}</div>` : ''}
            ${opsiHtml ? `<div class="max-w-md mx-auto">${opsiHtml}</div>` : `
                <div class="max-w-md mx-auto">
                    <input type="text" id="ujianEssayInput" class="w-full p-4 rounded-xl bg-[#0d1117] border border-white/10 text-center text-xl font-jp" placeholder="Ketik partikel..." autofocus>
                    <button class="mt-4 px-8 py-3 bg-[#b89cff] hover:bg-[#a88aee] text-black font-bold rounded-xl transition" onclick="jawabUjianEssay(${idx})">Jawab</button>
                </div>
            `}
        </div>
    `;
    if (typeof wanakana !== 'undefined' && document.getElementById('ujianEssayInput')) {
        wanakana.bind(document.getElementById('ujianEssayInput'));
    }
}

function jawabUjian(selected, idx) {
    const saved = localStorage.getItem('gy_jp_ujian_soal');
    const soalList = saved ? JSON.parse(saved) : [];
    const q = soalList[idx];
    if (!q) return;
    const benar = selected === q.jawaban;
    if (benar) {
        let score = parseInt(localStorage.getItem('gy_jp_ujian_score') || '0');
        localStorage.setItem('gy_jp_ujian_score', String(score + 1));
    }
    const feedback = document.createElement('div');
    feedback.className = `mt-4 p-3 rounded-xl text-center font-bold ${benar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`;
    feedback.textContent = benar ? 'Benar! ' + (q.penjelasan || '') : 'Salah. Jawaban: ' + (q.opsi ? q.opsi[q.jawaban] : '?');
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    const btns = container.querySelectorAll('.ujian-option');
    btns.forEach((b, i) => {
        b.style.borderColor = i === q.jawaban ? '#34d399' : (i === selected ? '#ef4444' : '');
        b.disabled = true;
    });
    container.querySelector('.text-center')?.appendChild(feedback);
    localStorage.setItem('gy_jp_ujian_idx', String(idx + 1));
    setTimeout(() => renderUjianSoal(idx + 1), 1500);
}

function jawabUjianEssay(idx) {
    const input = document.getElementById('ujianEssayInput');
    if (!input) return;
    const saved = localStorage.getItem('gy_jp_ujian_soal');
    const soalList = saved ? JSON.parse(saved) : [];
    const q = soalList[idx];
    if (!q) return;
    const jawab = input.value.trim();
    const benar = jawab === q.opsi?.[q.jawaban] || jawab === q.opsi?.[0];
    if (benar) {
        let score = parseInt(localStorage.getItem('gy_jp_ujian_score') || '0');
        localStorage.setItem('gy_jp_ujian_score', String(score + 1));
    }
    const feedback = document.createElement('div');
    feedback.className = `mt-4 p-3 rounded-xl text-center font-bold ${benar ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`;
    feedback.textContent = benar ? 'Benar! ' + (q.penjelasan || '') : 'Salah. Jawaban: ' + (q.opsi ? q.opsi[q.jawaban] : '?');
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    container.querySelector('.text-center')?.appendChild(feedback);
    input.disabled = true;
    localStorage.setItem('gy_jp_ujian_idx', String(idx + 1));
    setTimeout(() => renderUjianSoal(idx + 1), 1500);
}

function renderUjianHasil() {
    const score = parseInt(localStorage.getItem('gy_jp_ujian_score') || '0');
    const saved = localStorage.getItem('gy_jp_ujian_soal');
    const total = saved ? JSON.parse(saved).length : 0;
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    userProgress.quizSelesai = true;
    saveProgress();
    container.innerHTML = `
        <div class="text-center py-10">
            <i data-lucide="award" class="w-16 h-16 text-orange-400 mx-auto mb-4"></i>
            <h3 class="text-2xl font-bold mb-2">Ujian Selesai!</h3>
            <p class="text-4xl font-bold text-[#b89cff] my-4">${score}/${total}</p>
            <p class="text-neutral-400 mb-2">${pct >= 80 ? 'Luar biasa! 🎉' : pct >= 60 ? 'Bagus, terus belajar!' : 'Ayo coba lagi!'}</p>
            <button class="mt-6 px-8 py-3 bg-[#b89cff] hover:bg-[#a88aee] text-black font-bold rounded-xl transition" onclick="renderUjianStartMenu()">Coba Lagi</button>
        </div>
    `;
    lucide.createIcons();
}

function renderUjianStartMenu() {
    const container = document.getElementById('ujianStartMenu');
    if (!container) return;
    container.innerHTML = `
        <i data-lucide="graduation-cap" class="w-16 h-16 text-orange-400 mx-auto mb-4"></i>
        <h3 class="text-2xl font-bold mb-2">Simulasi JLPT N5 Partikel</h3>
        <p class="text-neutral-400 mb-6">Ujian komprehensif. Keyboard akan otomatis mengubah huruf Romaji menjadi Hiragana pada sesi essai.</p>
        <button id="btnStartUjian" class="px-8 py-3 bg-gradient-to-r from-orange-500 to-sakura-500 hover:from-orange-600 hover:to-sakura-600 text-white font-bold rounded-xl shadow-lg transition">Mulai Ujian JLPT</button>
    `;
    document.getElementById('btnStartUjian')?.addEventListener('click', startUjianJLPT);
    lucide.createIcons();
}

function startLatihan() {
    currentLatihanIndex = 0;
    latihanScore = 0;
    latihanData = generateQuestions(5);
    renderLatihan();
}

function renderLatihan() {
    if (currentLatihanIndex >= latihanData.length) {
        showLatihanResult();
        return;
    }

    const q = latihanData[currentLatihanIndex];
    const container = document.getElementById('latihanContainer');

    let contentHtml = '';
    if (q.type === 'mcq') {
        let optionsHtml = '';
        q.options.forEach((opt, idx) => {
            optionsHtml += `<button class="latihan-option w-full text-left p-4 rounded-xl border border-white/10 bg-[#0d1117] hover:bg-white/5 font-medium mb-3 transition focus:outline-none focus:ring-2 focus:ring-[#b89cff]/50" aria-label="Pilih opsi ${opt}" onclick="answerLatihanMcq(${idx})">${opt}</button>`;
        });
        contentHtml = `
            <div class="options-container" id="latihanOptions" role="group" aria-label="Pilihan jawaban">
                ${optionsHtml}
            </div>
        `;
    } else if (q.type === 'essay') {
        let inputHtml = '';
        if (Array.isArray(q.jawaban)) {
            q.jawaban.forEach((_, idx) => {
                 inputHtml += `<input type="text" id="latihanEssayInput_${idx}" class="latihan-essay-input w-24 bg-[#0d1117] border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-2 focus:border-[#b89cff] focus:outline-none focus:ring-2 focus:ring-[#b89cff]/50" placeholder="partikel" aria-label="Input partikel ke ${idx+1}">`;
            });
        } else {
             inputHtml = `<input type="text" id="latihanEssayInput" class="latihan-essay-input w-32 bg-[#0d1117] border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-auto block focus:border-[#b89cff] focus:outline-none focus:ring-2 focus:ring-[#b89cff]/50" placeholder="ketik romaji..." aria-label="Input partikel">`;
        }

        contentHtml = `
            <div class="py-6 text-center">
                <div class="flex items-center justify-center flex-wrap mb-6">
                    ${inputHtml}
                </div>
                <button class="px-6 py-3 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition shadow-lg shadow-[#b89cff]/20 focus:outline-none focus:ring-4 focus:ring-[#b89cff]/50" onclick="answerLatihanEssay()" aria-label="Kirim Jawaban">Kirim Jawaban</button>
            </div>
        `;
    }

    let emojiDisplayHtml = '';
    if (q.icon) {
        emojiDisplayHtml = `<div class="text-center text-4xl mb-4 flex justify-center text-[#b89cff]" aria-hidden="true"><i data-lucide="${q.icon}" class="w-12 h-12"></i></div>`;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-[#a9a29a] font-bold uppercase tracking-wider">
            <span class="text-[#b89cff]">Soal ${currentLatihanIndex + 1} / ${latihanData.length}</span>
            <button onclick="toggleHint()" class="text-[#b89cff] hover:text-[#e89dbd] bg-[#b89cff]/10 hover:bg-[#b89cff]/20 px-3 py-1 rounded flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-[#b89cff]" aria-label="Buka petunjuk">
                <i data-lucide="lightbulb" class="w-4 h-4"></i> Hint
            </button>
        </div>

        <div id="latihanHint" class="hidden mb-4 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200/90 text-sm" role="region" aria-live="polite">
            <i data-lucide="info" class="w-4 h-4 inline mr-1"></i> ${q.hint || 'Tidak ada petunjuk spesifik.'}
        </div>

        <div class="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 relative">
            ${emojiDisplayHtml}
            <h3 class="text-2xl font-bold font-jp leading-relaxed text-center text-[#f4efe7]">${q.soal}</h3>
            <p class="text-sm text-[#a9a29a] mt-4 text-center"><i data-lucide="languages" class="w-4 h-4 inline mr-1"></i> ${q.terjemahan || 'Arti kalimat di atas.'}</p>
        </div>
        ${contentHtml}
        <div id="latihanFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border" role="alert" aria-live="assertive"></div>
        <button id="btnNextLatihan" class="hidden mt-6 w-full py-3 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition focus:outline-none focus:ring-4 focus:ring-[#b89cff]/50" onclick="nextLatihan()">Soal Selanjutnya</button>
    `;

    setTimeout(() => {
        const inputs = document.querySelectorAll('.latihan-essay-input');
        inputs.forEach(input => {
            if (typeof wanakana !== 'undefined') {
                wanakana.bind(input);
            }
        });
        if(inputs.length > 0) inputs[0].focus();
    }, 100);

    lucide.createIcons();
}

function toggleHint() {
    const el = document.getElementById('latihanHint');
    if(el) el.classList.toggle('hidden');
}

function answerLatihanMcq(selectedIdx) {
    const q = latihanData[currentLatihanIndex];
    const opts = document.querySelectorAll('.latihan-option');
    opts.forEach(opt => opt.disabled = true);

    let isCorrect = (selectedIdx === q.jawaban);
    if (isCorrect) {
        opts[selectedIdx].classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        latihanScore += 20;
        showLatihanFeedback(true, q.penjelasan);
    } else {
        opts[selectedIdx].classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400', 'animate-wrong-shake');
        opts[q.jawaban].classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        showLatihanFeedback(false, q.penjelasan);
    }
}

function answerLatihanEssay() {
    const q = latihanData[currentLatihanIndex];
    let isCorrect = true;

    if (Array.isArray(q.jawaban)) {
        q.jawaban.forEach((ans, idx) => {
            const input = document.getElementById('latihanEssayInput_' + idx);
            if (!input) return;
            let val = input.value.trim();
            if (val !== ans) {
                isCorrect = false;
                input.classList.add('border-rose-500', 'text-rose-400', 'animate-wrong-shake');
            } else {
                input.classList.add('border-emerald-500', 'text-emerald-400');
            }
            input.disabled = true;
        });
    } else {
        const input = document.getElementById('latihanEssayInput');
        if (input) {
            let val = input.value.trim();
            if (val !== q.jawaban) {
                isCorrect = false;
                input.classList.add('border-rose-500', 'text-rose-400', 'animate-wrong-shake');
            } else {
                input.classList.add('border-emerald-500', 'text-emerald-400');
            }
            input.disabled = true;
        }
    }

    const inputEl = document.getElementById('latihanEssayInput') || document.querySelector('.latihan-essay-input');
    const btnSubmit = inputEl?.parentElement?.nextElementSibling;
    if (btnSubmit) btnSubmit.classList.add('hidden');

    if (isCorrect) {
        latihanScore += 20;
        showLatihanFeedback(true, q.penjelasan);
    } else {
        let correctAnswerText = Array.isArray(q.jawaban) ? q.jawaban.join(' dan ') : q.jawaban;
        showLatihanFeedback(false, `Jawaban benar: <strong class="text-rose-300 font-jp text-lg">${correctAnswerText}</strong>. <br>${escapeHtml(q.penjelasan)}`);
    }
}

function showLatihanFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('latihanFeedback');
    const btnNext = document.getElementById('btnNextLatihan');

    if (isCorrect) {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
        feedback.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 inline mr-1 -mt-0.5"></i> <strong>Benar!</strong> ${escapeHtml(explanation)}`;
    } else {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block";
        feedback.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 inline mr-1 -mt-0.5"></i> <strong>Salah.</strong> ${escapeHtml(explanation)}`;
    }

    lucide.createIcons();
    btnNext.classList.remove('hidden');
    btnNext.focus();
    if (currentLatihanIndex === latihanData.length - 1) {
        btnNext.innerText = "Lihat Hasil Review";
    }
}

function nextLatihan() {
    currentLatihanIndex++;
    renderLatihan();
}

function showLatihanResult() {
    const container = document.getElementById('latihanContainer');

    if (!userProgress.latihanSelesai && latihanScore >= 80) {
        userProgress.latihanSelesai = true;
        saveProgress();
    }

    if(latihanScore > userProgress.quickReviewBestScore) {
        userProgress.quickReviewBestScore = latihanScore;
        saveProgress();
    }

    let msg = latihanScore >= 80 ? 'Bagus! Reflek partikelmu sangat baik.' : 'Tetap semangat! Coba perhatikan hint lebih sering.';

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-[#b89cff]/20 flex items-center justify-center border-4 border-[#b89cff] mx-auto mb-6">
                <span class="text-3xl font-bold text-[#f4efe7]">${latihanScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-[#f4efe7]">Quick Review Selesai!</h3>
            <p class="text-[#a9a29a] mb-2">${msg}</p>
            <p class="text-xs text-[#b89cff] mb-8">Skor Terbaik: ${userProgress.quickReviewBestScore}</p>
            <button class="px-8 py-3 bg-[#161b22] hover:bg-white/10 border border-white/10 text-[#f4efe7] font-bold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-white/20" aria-label="Ulangi Quick Review" onclick="startLatihan()">Review Lagi</button>
        </div>
    `;

    if(typeof showToast === 'function') showToast('Review Selesai', `Skormu: ${latihanScore}/100.`);
}
// =====================================
// SENTENCE BUILDER MODE
// =====================================
const builderData = [
    { target: ['わたし', 'は', 'みず', 'を', 'のみます'], translate: 'Saya minum air.' },
    { target: ['あした', 'にほん', 'へ', 'いきます'], translate: 'Besok pergi ke Jepang.' },
    { target: ['へや', 'に', 'ねこ', 'が', 'います'], translate: 'Di kamar ada kucing.' },
    { target: ['がっこう', 'で', 'べんきょうします'], translate: 'Belajar di sekolah.' },
    { target: ['ともだち', 'と', 'えいが', 'を', 'みます'], translate: 'Menonton film bersama teman.' }
];

let currentBuilderIndex = 0;
let builderScore = 0;
let builderAnswer = [];
let builderAvailable = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnStartBuilder = document.getElementById('btnStartBuilder');
    if(btnStartBuilder) {
        btnStartBuilder.addEventListener('click', startBuilder);
    }
});

function startBuilder() {
    currentBuilderIndex = 0;
    builderScore = 0;
    renderBuilder();
}

function renderBuilder() {
    if (currentBuilderIndex >= builderData.length) {
        showBuilderResult();
        return;
    }

    const data = builderData[currentBuilderIndex];
    builderAnswer = [];
    builderAvailable = [...data.target];
    for (let i = builderAvailable.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [builderAvailable[i], builderAvailable[j]] = [builderAvailable[j], builderAvailable[i]];
    }

    updateBuilderUI();
}

function updateBuilderUI() {
    const data = builderData[currentBuilderIndex];
    const container = document.getElementById('builderContainer');

    let answerHtml = builderAnswer.map((word, idx) => `
        <button class="bg-[#161b22] border border-[#d9b56f]/50 text-[#d9b56f] px-3 py-2 md:px-4 md:py-3 rounded-lg font-jp font-medium text-lg md:text-xl m-1 transition-all hover:bg-[#d9b56f]/10" onclick="builderRemoveWord(${idx})">
            ${word}
        </button>
    `).join('');

    let emptySlots = data.target.length - builderAnswer.length;
    for(let i=0; i<emptySlots; i++) {
        answerHtml += `<div class="bg-[#0a0d12] border border-white/10 border-dashed px-4 py-3 w-16 md:w-20 rounded-lg m-1 inline-block"></div>`;
    }

    let availableHtml = builderAvailable.map((word, idx) => `
        <button class="bg-[#f4efe7] text-[#0d1117] px-3 py-2 md:px-4 md:py-3 rounded-lg font-jp font-bold text-lg md:text-xl shadow-md m-1 transition-transform hover:-translate-y-1" onclick="builderAddWord(${idx})">
            ${word}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-[#a9a29a] font-bold uppercase tracking-wider">
            <span class="text-[#d9b56f]">Soal ${currentBuilderIndex + 1} / ${builderData.length}</span>
        </div>

        <p class="text-center text-[#f4efe7] text-lg font-medium mb-4">"${data.translate}"</p>

        <div class="bg-[#0d1117] min-h-[100px] p-4 rounded-2xl border border-white/10 mb-6 flex flex-wrap items-center justify-center content-start">
            ${answerHtml}
        </div>

        <div class="flex flex-wrap items-center justify-center mb-6">
            ${availableHtml}
        </div>

        <div id="builderFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border"></div>
        <div class="flex justify-center gap-4 mt-4">
            <button id="btnCheckBuilder" class="px-8 py-3 bg-[#d9b56f] hover:bg-[#c9a35e] text-[#0d1117] font-bold rounded-xl transition ${emptySlots === 0 ? '' : 'opacity-50 cursor-not-allowed'}" onclick="checkBuilder()" ${emptySlots === 0 ? '' : 'disabled'}>Periksa Jawaban</button>
            <button id="btnNextBuilder" class="hidden px-8 py-3 bg-white/10 hover:bg-white/20 text-[#f4efe7] font-bold rounded-xl transition" onclick="nextBuilder()">Lanjut</button>
        </div>
    `;
    lucide.createIcons();
}

function builderAddWord(idx) {
    let word = builderAvailable[idx];
    builderAnswer.push(word);
    builderAvailable.splice(idx, 1);
    updateBuilderUI();
}

function builderRemoveWord(idx) {
    let word = builderAnswer[idx];
    builderAvailable.push(word);
    builderAnswer.splice(idx, 1);
    updateBuilderUI();
}

function checkBuilder() {
    const data = builderData[currentBuilderIndex];
    const feedback = document.getElementById('builderFeedback');
    const btnCheck = document.getElementById('btnCheckBuilder');
    const btnNext = document.getElementById('btnNextBuilder');

    let userAnswer = builderAnswer.join('');
    let targetAnswer = data.target.join('');

    btnCheck.classList.add('hidden');

    if (userAnswer === targetAnswer) {
        builderScore += 20;
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
        feedback.innerHTML = `<strong>Tepat sekali!</strong> Kalimat yang sempurna.`;
    } else {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block animate-wrong-shake";
        feedback.innerHTML = `<strong>Susunan kurang tepat.</strong><br>Jawaban benar: <span class="font-jp text-lg ml-2">${targetAnswer}</span>`;
    }

    btnNext.classList.remove('hidden');
    const container = document.getElementById('builderContainer');
    container.querySelectorAll('button').forEach(b => {
        if(b.id !== 'btnNextBuilder') b.disabled = true;
    });
}

function nextBuilder() {
    currentBuilderIndex++;
    renderBuilder();
}

function showBuilderResult() {
    const container = document.getElementById('builderContainer');

    if(!userProgress.builderSelesai && builderScore >= 80) {
        userProgress.builderSelesai = true;
        saveProgress();
    }

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-[#d9b56f]/20 flex items-center justify-center border-4 border-[#d9b56f] mx-auto mb-6">
                <span class="text-3xl font-bold text-[#f4efe7]">${builderScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-[#f4efe7]">Latihan Selesai!</h3>
            <p class="text-[#a9a29a] mb-8">Pola struktur kalimatmu semakin baik.</p>
            <button class="px-8 py-3 bg-[#161b22] hover:bg-white/10 border border-white/10 text-[#f4efe7] font-bold rounded-xl transition" onclick="startBuilder()">Main Lagi</button>
        </div>
    `;
}

// =====================================
// HIGHLIGHTER MODE
// =====================================
const highlighterData = [
    { jp: ['わたし', 'は', 'がくせい', 'です', '。'], ansIndex: 1, explanation: 'は adalah partikel penanda subjek/topik.' },
    { jp: ['りんご', 'を', 'たべます', '。'], ansIndex: 1, explanation: 'を adalah partikel penanda objek langsung.' },
    { jp: ['がっこう', 'に', 'います', '。'], ansIndex: 1, explanation: 'に menandakan tempat keberadaan statis.' },
    { jp: ['えき', 'で', 'ともだち', 'に', 'あいます', '。'], ansIndex: 3, explanation: 'Dalam konteks ini, に menandakan target orang (bertemu dengan teman). (で juga partikel tempat aksi, tapi kita cari に untuk latihan ini)', isMultiple: true, validIndices: [1,3] },
    { jp: ['にほん', 'へ', 'いきます', '。'], ansIndex: 1, explanation: 'へ menandakan arah pergerakan.' }
];

let currentHighlighterIndex = 0;
let highlighterScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    const btnStartHighlighter = document.getElementById('btnStartHighlighter');
    if(btnStartHighlighter) {
        btnStartHighlighter.addEventListener('click', startHighlighter);
    }
});

function startHighlighter() {
    currentHighlighterIndex = 0;
    highlighterScore = 0;
    renderHighlighter();
}

function renderHighlighter() {
    if (currentHighlighterIndex >= highlighterData.length) {
        showHighlighterResult();
        return;
    }

    const data = highlighterData[currentHighlighterIndex];
    const container = document.getElementById('highlighterContainer');

    let wordsHtml = data.jp.map((word, index) => {
        if(word === '。' || word === '、') {
             return `<span class="text-3xl text-[#f4efe7] font-jp mx-1 py-2">${word}</span>`;
        }
        return `<button class="highlighter-word text-3xl font-jp mx-1 px-2 py-2 rounded-lg bg-[#0d1117] hover:bg-white/10 border border-transparent transition-colors text-[#f4efe7]" onclick="checkHighlighter(this, ${index})">${word}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-[#a9a29a] font-bold uppercase tracking-wider">
            <span class="text-[#f2a6c6]">Soal ${currentHighlighterIndex + 1} / ${highlighterData.length}</span>
        </div>
        <div class="bg-[#0a0d12] p-8 rounded-2xl border border-white/5 mb-6 text-center shadow-inner flex flex-wrap justify-center items-center leading-[3rem]">
            ${wordsHtml}
        </div>
        <div id="highlighterFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border"></div>
        <button id="btnNextHighlighter" class="hidden mt-6 w-full py-3 bg-[#f2a6c6] hover:bg-[#e89dbd] text-[#0d1117] font-bold rounded-xl transition" onclick="nextHighlighter()">Lanjut</button>
    `;
    lucide.createIcons();
}

function checkHighlighter(btn, clickedIndex) {
    const data = highlighterData[currentHighlighterIndex];
    const container = document.getElementById('highlighterContainer');
    const feedback = document.getElementById('highlighterFeedback');
    const btnNext = document.getElementById('btnNextHighlighter');
    const allBtns = container.querySelectorAll('.highlighter-word');

    allBtns.forEach(b => b.disabled = true);

    let isCorrect = data.isMultiple ? data.validIndices.includes(clickedIndex) : clickedIndex === data.ansIndex;

    if(isCorrect) {
        highlighterScore += 20;
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-400');
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
        feedback.innerHTML = `<strong>Tepat sekali!</strong> ${data.explanation}`;
    } else {
        btn.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-400');
        let correctWords = data.isMultiple ? data.validIndices.map(i => data.jp[i]).join(' atau ') : data.jp[data.ansIndex];

        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block animate-wrong-shake";
        feedback.innerHTML = `<strong>Kurang tepat.</strong> Partikelnya adalah <strong>${correctWords}</strong>. <br>${data.explanation}`;
    }

    btnNext.classList.remove('hidden');
}

function nextHighlighter() {
    currentHighlighterIndex++;
    renderHighlighter();
}

function showHighlighterResult() {
    const container = document.getElementById('highlighterContainer');

    if(!userProgress.highlighterSelesai && highlighterScore >= 80) {
        userProgress.highlighterSelesai = true;
        saveProgress();
    }

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-[#f2a6c6]/20 flex items-center justify-center border-4 border-[#f2a6c6] mx-auto mb-6">
                <span class="text-3xl font-bold text-[#f4efe7]">${highlighterScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-[#f4efe7]">Latihan Selesai!</h3>
            <p class="text-[#a9a29a] mb-8">Kerja bagus melatih mata mendeteksi partikel.</p>
            <button class="px-8 py-3 bg-[#161b22] hover:bg-white/10 border border-white/10 text-[#f4efe7] font-bold rounded-xl transition" onclick="startHighlighter()">Coba Lagi</button>
        </div>
    `;
}

// =====================================
// SLOT TRAINER MODE
// =====================================
const puzzleBank = [
    {
        bg: "from-blue-500/20 to-purple-500/20",
        icon: "plane",
        kalimat: ["わたし", "は", "にほん", "SLOT", "いきます。"],
        pilihan: ["へ", "を", "が", "で"],
        jawaban: "へ",
        terjemahan: "Saya pergi ke Jepang."
    },
    {
        bg: "from-emerald-500/20 to-teal-500/20",
        icon: "train",
        kalimat: ["えき", "SLOT", "でんしゃ に のります。"],
        pilihan: ["に", "で", "を", "は"],
        jawaban: "で",
        terjemahan: "Naik kereta di stasiun."
    },
    {
        bg: "from-cyan-500/20 to-blue-500/20",
        icon: "cloud-rain",
        kalimat: ["あめ", "SLOT", "ふります。"],
        pilihan: ["が", "を", "で", "に"],
        jawaban: "が",
        terjemahan: "Hujan turun."
    },
    {
        bg: "from-orange-500/20 to-red-500/20",
        icon: "film",
        kalimat: ["ともだち", "SLOT", "えいが を みます。"],
        pilihan: ["と", "や", "も", "へ"],
        jawaban: "と",
        terjemahan: "Menonton film bersama teman."
    },
    {
        bg: "from-yellow-500/20 to-orange-500/20",
        icon: "utensils",
        kalimat: ["ラーメン", "SLOT", "たべます。"],
        pilihan: ["を", "が", "で", "は"],
        jawaban: "を",
        terjemahan: "Makan ramen."
    }
];

let currentPuzzleIndex = 0;
let puzzleScore = 0;
let activePuzzleData = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnStartPuzzle = document.getElementById('btnStartPuzzle');
    if(btnStartPuzzle) {
        btnStartPuzzle.addEventListener('click', startPuzzle);
    }
});

function startPuzzle() {
    currentPuzzleIndex = 0;
    puzzleScore = 0;
    activePuzzleData = shuffleArray([...puzzleBank]).slice(0, 5);
    renderPuzzle();
}

function renderPuzzle() {
    if (currentPuzzleIndex >= activePuzzleData.length) {
        showPuzzleResult();
        return;
    }

    const pz = activePuzzleData[currentPuzzleIndex];
    const container = document.getElementById('puzzleContainer');

    let kalimatHtml = '';
    pz.kalimat.forEach(part => {
        if (part === "SLOT") {
            kalimatHtml += `<div class="puzzle-slot w-16 h-14 bg-[#0d1117] border-2 border-dashed border-[#8fbc8f]/50 rounded-xl flex items-center justify-center mx-2 text-2xl font-bold font-jp text-[#8fbc8f] transition-all duration-300" id="puzzleTarget">?</div>`;
        } else {
            kalimatHtml += `<span class="text-2xl font-jp text-[#f4efe7] font-medium leading-loose">${part}</span>`;
        }
    });

    let optionsHtml = '';
    let shuffledOptions = shuffleArray([...pz.pilihan]);
    shuffledOptions.forEach(opt => {
        optionsHtml += `<button class="puzzle-piece w-16 h-14 bg-[#161b22] border border-white/10 rounded-xl shadow-lg hover:border-[#8fbc8f] hover:bg-[#8fbc8f]/10 text-2xl font-bold font-jp text-[#f4efe7] transition-all transform hover:-translate-y-1" onclick="selectPuzzlePiece('${opt}', this)">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-[#a9a29a] font-bold uppercase tracking-wider">
            <span class="text-[#8fbc8f]">Slot Trainer ${currentPuzzleIndex + 1} / ${activePuzzleData.length}</span>
        </div>

        <div class="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-8 border border-white/10 group bg-gradient-to-br ${pz.bg} flex flex-col items-center justify-center transition-all duration-500">
            <div class="text-[#f4efe7] mb-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                <i data-lucide="${pz.icon}" class="w-16 h-16 opacity-80"></i>
            </div>
            <div class="absolute bottom-0 left-0 w-full text-center px-4 pb-4 pt-8 bg-gradient-to-t from-[#0a0d12] to-transparent">
                <p class="text-[#f4efe7] text-lg font-medium drop-shadow-md">${pz.terjemahan}</p>
            </div>
        </div>

        <div class="flex items-center justify-center flex-wrap mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
            ${kalimatHtml}
        </div>

        <p class="text-center text-sm text-[#a9a29a] uppercase tracking-wider mb-4">Pilih partikel yang tepat:</p>
        <div class="flex items-center justify-center gap-4 flex-wrap" id="puzzlePiecesContainer">
            ${optionsHtml}
        </div>

        <div id="puzzleFeedback" class="hidden mt-8 p-4 rounded-xl text-center text-lg font-bold border"></div>
    `;

    lucide.createIcons();
}

function selectPuzzlePiece(selectedAnswer, btnElement) {
    const pz = activePuzzleData[currentPuzzleIndex];
    const target = document.getElementById('puzzleTarget');
    const piecesContainer = document.getElementById('puzzlePiecesContainer');
    const feedback = document.getElementById('puzzleFeedback');

    const allPieces = piecesContainer.querySelectorAll('.puzzle-piece');
    allPieces.forEach(btn => btn.disabled = true);

    target.innerHTML = selectedAnswer;
    target.classList.remove('border-dashed', 'border-[#8fbc8f]/50');
    target.classList.add('border-solid', 'bg-[#8fbc8f]/20');

    btnElement.style.opacity = '0';
    btnElement.style.transform = 'scale(0.5)';

    let isCorrect = (selectedAnswer === pz.jawaban);

    setTimeout(() => {
        if (isCorrect) {
            target.classList.add('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/20');
            target.classList.remove('text-[#8fbc8f]', 'border-[#8fbc8f]/50', 'bg-[#8fbc8f]/20');
            puzzleScore += 20;
            feedback.className = "mt-8 p-4 rounded-xl text-center text-lg font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
            feedback.innerHTML = `<i data-lucide="check-circle" class="w-6 h-6 inline mr-2 -mt-1"></i>Tepat Sekali!`;
        } else {
            target.classList.add('border-rose-500', 'text-rose-400', 'bg-rose-500/20');
            target.classList.remove('text-[#8fbc8f]', 'border-[#8fbc8f]/50', 'bg-[#8fbc8f]/20');
            feedback.className = "mt-8 p-4 rounded-xl text-center text-lg font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 block animate-wrong-shake";
            feedback.innerHTML = `<i data-lucide="x-circle" class="w-6 h-6 inline mr-2 -mt-1"></i>Kurang Tepat. Jawaban: ${pz.jawaban}`;
        }
        lucide.createIcons();

        setTimeout(() => {
            currentPuzzleIndex++;
            renderPuzzle();
        }, 1800);
    }, 400);
}

function showPuzzleResult() {
    const container = document.getElementById('puzzleContainer');

    if (!userProgress.slotTrainerSelesai && puzzleScore >= 80) {
        userProgress.slotTrainerSelesai = true;
        saveProgress();
    }

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-[#8fbc8f]/20 flex items-center justify-center border-4 border-[#8fbc8f] mx-auto mb-6">
                <span class="text-3xl font-bold text-[#f4efe7]">${puzzleScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-[#f4efe7]">Latihan Selesai!</h3>
            <p class="text-[#a9a29a] mb-8">Pemahamanmu soal mengisi partikel yang kosong sudah sangat baik.</p>
            <button class="px-8 py-3 bg-[#161b22] hover:bg-white/10 border border-white/10 text-[#f4efe7] font-bold rounded-xl transition" onclick="startPuzzle()">Latih Lagi</button>
        </div>
    `;
}

// =====================================
// CONTRAST TRAINER MODE
// =====================================
const contrastData = [
    {
        id: 'wa_ga',
        title: 'は vs が',
        desc: 'Topik vs Penekanan Subjek',
        s1: 'わたし <span class="text-[#f2a6c6] font-bold">は</span> ダルマです。',
        s2: 'わたし <span class="text-[#d9b56f] font-bold">が</span> ダルマです。',
        q: 'Kalimat mana yang digunakan untuk menjawab pertanyaan "Siapa yang bernama Darma?"',
        ans: 2,
        explanation: 'が memberi penekanan pada kata sebelumnya (わたし). Ini menegaskan bahwa "Sayalah Darma (bukan orang lain)". Sedangkan は hanya menjadikan "Saya" sebagai topik umum.'
    },
    {
        id: 'ni_de',
        title: 'に vs で',
        desc: 'Tempat Statis vs Tempat Aksi',
        s1: 'がっこう <span class="text-cyan-400 font-bold">に</span> います。',
        s2: 'がっこう <span class="text-[#b89cff] font-bold">で</span> べんきょうします。',
        q: 'Kalimat mana yang menunjukkan sebuah aksi sedang dilakukan di suatu tempat?',
        ans: 2,
        explanation: 'で menandai tempat terjadinya aksi aktif (belajar). に hanya menandai lokasi keberadaan statis (berada).'
    },
    {
        id: 'ni_he',
        title: 'に vs へ',
        desc: 'Titik Tujuan vs Arah Tujuan',
        s1: 'にほん <span class="text-cyan-400 font-bold">に</span> いきます。',
        s2: 'にほん <span class="text-[#8fbc8f] font-bold">へ</span> いきます。',
        q: 'Mana partikel yang secara harfiah berarti "Menuju ke arah"?',
        ans: 2,
        explanation: 'へ menekankan pada "arah perjalanannya", sedangkan に lebih menekankan pada "titik akhir tujuan". Keduanya sering bisa ditukar penggunaannya.'
    }
];

function renderContrastTrainer() {
    const container = document.getElementById('contrastContainer');
    if(!container) return;

    let html = '';
    contrastData.forEach((c, idx) => {
        let isCompleted = userProgress.kontrasSelesai && userProgress.kontrasSelesai.includes(c.id);

        html += `
        <div class="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-2xl mb-8 group transition-all duration-300 ${isCompleted ? 'border-emerald-500/30' : ''}" id="contrast_${c.id}">
            <div class="bg-[#161b22] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div class="text-xs text-[#a9a29a] font-mono tracking-wider flex items-center gap-2">
                   <i data-lucide="git-compare" class="w-4 h-4 text-[#b89cff]"></i> ${c.title}
                </div>
                <div>${isCompleted ? '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>' : ''}</div>
            </div>

            <div class="p-6 md:p-8">
                <p class="text-[#f4efe7] font-medium text-lg mb-6 text-center">"${c.q}"</p>
                <div class="grid md:grid-cols-2 gap-4 font-jp text-lg md:text-xl">
                    <button class="bg-[#161b22] border border-white/10 hover:border-[#b89cff]/50 rounded-xl p-6 transition-all transform hover:-translate-y-1 text-center" onclick="checkContrast('${c.id}', 1, ${c.ans}, this)">
                        ${c.s1}
                    </button>
                    <button class="bg-[#161b22] border border-white/10 hover:border-[#b89cff]/50 rounded-xl p-6 transition-all transform hover:-translate-y-1 text-center" onclick="checkContrast('${c.id}', 2, ${c.ans}, this)">
                        ${c.s2}
                    </button>
                </div>
                <div class="contrast-feedback-${c.id} hidden mt-6 p-4 rounded-xl text-sm border"></div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
    lucide.createIcons();
}

function checkContrast(id, selected, correct, btn) {
    const parent = document.getElementById(`contrast_${id}`);
    const feedback = parent.querySelector(`.contrast-feedback-${id}`);
    const buttons = parent.querySelectorAll('button');

    buttons.forEach(b => b.disabled = true);
    feedback.classList.remove('hidden');

    const data = contrastData.find(x => x.id === id);

    if (selected === correct) {
        btn.classList.add('bg-emerald-500/10', 'border-emerald-500/50');
        feedback.className = `contrast-feedback-${id} mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block`;
        feedback.innerHTML = `<strong>Tepat!</strong> ${data.explanation}`;

        if (!userProgress.kontrasSelesai) userProgress.kontrasSelesai = [];
        if (!userProgress.kontrasSelesai.includes(id)) {
            userProgress.kontrasSelesai.push(id);
            saveProgress();
        }

        const headerRight = parent.querySelector('.bg-\\[\\#161b22\\] > div:last-child');
        if(headerRight) headerRight.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>';
        parent.classList.add('border-emerald-500/30');

    } else {
        btn.classList.add('bg-rose-500/10', 'border-rose-500/50');
        buttons[correct - 1].classList.add('border-emerald-500/50');

        feedback.className = `contrast-feedback-${id} mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block animate-wrong-shake`;
        feedback.innerHTML = `<strong>Kurang tepat.</strong><br>${data.explanation}`;
        feedback.innerHTML += `<button class="mt-3 px-4 py-1.5 bg-[#161b22] border border-rose-500/50 rounded-lg text-xs hover:bg-rose-500/20 transition-colors block" onclick="resetContrast('${id}')">Coba Lagi</button>`;
    }
    lucide.createIcons();
}

function resetContrast(id) {
    const parent = document.getElementById(`contrast_${id}`);
    const feedback = parent.querySelector(`.contrast-feedback-${id}`);
    const buttons = parent.querySelectorAll('button');

    buttons.forEach(b => {
        b.disabled = false;
        b.className = "bg-[#161b22] border border-white/10 hover:border-[#b89cff]/50 rounded-xl p-6 transition-all transform hover:-translate-y-1 text-center";
    });
    feedback.classList.add('hidden');
}

// renderContrastTrainer dipanggil dari partikel.js setelah loadProgress()
