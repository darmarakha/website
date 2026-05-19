// Progress State Tracking
let userProgress = {
    partikelSelesai: [], // array of IDs like 'wa', 'ga'
    kontrasSelesai: [],  // array of IDs
    quizSelesai: false,
    highlighterSelesai: false,
    builderSelesai: false,
    slotTrainerSelesai: false,
    quickReviewBestScore: 0,
    score: 0
};

document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    renderPartikelGrid();
    updateUIProgress();
});

function loadProgress() {
    const saved = localStorage.getItem('gy_jp_particle_progress_data');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            userProgress = { ...userProgress, ...parsed }; // Merge to preserve new keys if older version saved
        } catch (e) {
            console.error("Failed to parse progress data");
        }
    }
}

function saveProgress() {
    localStorage.setItem('gy_jp_particle_progress_data', JSON.stringify(userProgress));
    updateUIProgress();
}

function updateUIProgress() {
    let totalItems = 5 + 3 + 5; // simplified calculation: 5 dasar, 3 kontras, 5 practice
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0);
    if (userProgress.highlighterSelesai) completed++;
    if (userProgress.builderSelesai) completed++;
    if (userProgress.slotTrainerSelesai) completed++;

    let percentage = Math.round((completed / totalItems) * 100);
    if(percentage > 100) percentage = 100;

    let elPct = document.getElementById('totalProgressText');
    let elBar = document.getElementById('totalProgressBar');
    if(elPct) elPct.innerText = percentage + '%';
    if(elBar) elBar.style.width = percentage + '%';

    let progDasar = document.getElementById('progDasar');
    if(progDasar) progDasar.innerText = userProgress.partikelSelesai.length + '/5';

    let progKontras = document.getElementById('progKontras');
    if(progKontras) progKontras.innerText = userProgress.kontrasSelesai.length + '/3';

    let progQuiz = document.getElementById('progQuiz');
    if (progQuiz) {
        let qCount = (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0) + (userProgress.highlighterSelesai ? 1 : 0) + (userProgress.builderSelesai ? 1 : 0) + (userProgress.slotTrainerSelesai ? 1 : 0);
        progQuiz.innerText = qCount + '/5';
    }

    const badgeIcon = document.getElementById('badgeIcon');
    if (badgeIcon && percentage === 100) {
        badgeIcon.className = "w-8 h-8 rounded-full bg-[#b89cff] flex items-center justify-center border border-[#b89cff] shadow-lg shadow-[#b89cff]/50";
        badgeIcon.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-[#12161d]"></i>`;
    }

    // Update Mastery Map
    const mapContainer = document.getElementById('masteryMapContainer');
    if (mapContainer && typeof partikelData !== 'undefined') {
        let mapHtml = '';
        partikelData.forEach((p, index) => {
            let isComplete = userProgress.partikelSelesai.includes(p.id);
            let colorClass = isComplete ? 'bg-[#b89cff] text-[#12161d] border-[#b89cff]' : 'bg-[#161b22] text-[#a9a29a] border-white/10';
            mapHtml += `
                <div class="flex items-center" role="listitem" aria-label="Partikel ${p.romaji} status: ${isComplete ? 'Selesai' : 'Belum'}">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-jp font-bold text-sm border ${colorClass} transition-colors" title="${p.char} (${p.romaji})">
                        ${p.char}
                    </div>
                    ${index < partikelData.length - 1 ? `<div class="w-2 md:w-4 h-[2px] bg-white/5 mx-0.5"></div>` : ''}
                </div>
            `;
        });
        mapContainer.innerHTML = mapHtml;
    }
}

function renderPartikelGrid() {
    const grid = document.getElementById('partikelGrid');
    if(!grid) return;
    grid.innerHTML = '';

    if (typeof partikelData === 'undefined') return;

    partikelData.forEach(p => {
        const isCompleted = userProgress.partikelSelesai.includes(p.id);
        const card = document.createElement('div');
        card.className = `partikel-card glass-card bg-gradient-to-br from-[#161b22] to-[#161b22]/40 border ${isCompleted ? 'border-[#b89cff]/50 shadow-lg shadow-[#b89cff]/10' : 'border-white/5'} rounded-2xl p-5 ${isCompleted ? 'completed' : ''} transition-all duration-300 hover:border-[#b89cff]/50 group`;
        card.id = 'card_' + p.id;
        card.onclick = () => openPartikelModal(p.id);

        let charClass = p.char.length > 1 ? 'text-xl' : 'text-3xl';

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="card-icon w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-jp ${charClass} font-bold transition-all duration-300 group-hover:bg-[#b89cff]/20 group-hover:text-[#b89cff] border border-white/5 group-hover:border-[#b89cff]/30 ${isCompleted ? 'bg-[#b89cff]/20 text-[#b89cff] border-[#b89cff]/30' : ''}">
                    ${p.char}
                </div>
                ${isCompleted ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>' : ''}
            </div>
            <h3 class="text-xl font-bold text-[#f4efe7] font-jp mb-1">${p.romaji.toUpperCase()}</h3>
            <p class="text-[#a9a29a] text-sm">${p.fungsi}</p>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function openPartikelModal(id) {
    if (typeof partikelData === 'undefined') return;
    const p = partikelData.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('partikelModal');
    const content = document.getElementById('modalContent');
    const isCompleted = userProgress.partikelSelesai.includes(id);

    let examplesHtml = p.contoh.map((c, idx) => `
        <div class="mb-3 bg-[#0a0d12] border border-white/5 p-3 rounded-xl flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-[#161b22] text-[#b89cff] flex items-center justify-center font-bold text-xs shrink-0 border border-white/5 mt-1">${idx + 1}</div>
            <div>
                <p class="text-[#f4efe7] text-lg leading-relaxed font-jp tracking-wide">${c.jp}</p>
                <p class="text-[#a9a29a] text-sm mt-1">${c.id}</p>
            </div>
        </div>
    `).join('');

    let miniPracticeHtml = '';
    if (p.miniPractice) {
        let optionsHtml = p.miniPractice.options.map(opt =>
            `<button onclick="checkMiniPractice(this, '${opt}', '${p.miniPractice.jawaban}')" class="px-3 py-1 rounded bg-[#161b22] border border-white/10 hover:bg-white/10 text-[#f4efe7] transition-colors">${opt}</button>`
        ).join('');
        miniPracticeHtml = `
            <div class="mt-5 p-4 rounded-xl bg-[#0a0d12] border border-white/10">
                <h4 class="text-sm font-bold text-[#b89cff] mb-2 flex items-center gap-1.5"><i data-lucide="dumbbell" class="w-4 h-4"></i> Mini Practice</h4>
                <p class="text-[#f4efe7] font-jp text-lg mb-1">${p.miniPractice.soal}</p>
                <div class="flex gap-2 mt-3">${optionsHtml}</div>
                <div class="mini-practice-feedback mt-2 text-sm hidden"></div>
            </div>
        `;
    }

    content.innerHTML = `
        <div class="flex flex-col h-[70vh] md:h-auto md:max-h-[85vh]">
            <div class="flex items-center gap-5 bg-[#161b22] p-4 rounded-xl border border-white/5 shrink-0 mb-4">
                <div class="w-16 h-16 rounded-xl bg-[#b89cff]/20 flex items-center justify-center font-jp text-4xl font-bold text-[#b89cff] border border-[#b89cff]/30 shrink-0">
                    ${p.char}
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-[#f4efe7] flex items-center gap-2">
                        Partikel ${p.romaji.toUpperCase()}
                        ${isCompleted ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>' : ''}
                    </h3>
                    <p class="text-[#a9a29a] font-medium mt-1">${p.fungsi}</p>
                </div>
            </div>

            <div class="overflow-y-auto custom-scrollbar pr-2 pb-2">
                <div class="space-y-4">
                    <div class="bg-[#161b22] p-4 rounded-xl border border-white/5 font-mono text-sm">
                        <p class="text-[#b89cff] font-bold mb-1"><i data-lucide="braces" class="w-4 h-4 inline mr-1"></i>Rumus:</p>
                        <p class="text-[#f4efe7]">${p.rumus}</p>
                    </div>

                    ${p.perbandingan ? `
                        <div class="bg-[#161b22] p-4 rounded-xl border border-white/5 text-sm">
                            <p class="text-[#b89cff] font-bold mb-1 flex items-center gap-1"><i data-lucide="git-compare" class="w-4 h-4"></i> Perbandingan</p>
                            <p class="text-[#a9a29a] leading-relaxed">${p.perbandingan}</p>
                        </div>
                    ` : ''}

                    <div class="bg-[#161b22] p-4 rounded-xl border border-white/5">
                        <h4 class="text-[#b89cff] font-bold mb-3 flex items-center gap-2 text-sm"><i data-lucide="book-open" class="w-4 h-4"></i> Contoh Kalimat</h4>
                        ${examplesHtml}
                    </div>

                    ${p.salah ? `
                        <div class="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-200 text-sm">
                            <p class="font-bold mb-1 flex items-center gap-1 text-rose-400"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Hati-hati (Kesalahan Umum)</p>
                            <p>${p.salah}</p>
                        </div>
                    ` : ''}

                    ${p.catatan ? `
                        <div class="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
                            <p class="font-bold mb-1 flex items-center gap-1 text-blue-400"><i data-lucide="info" class="w-4 h-4"></i> Catatan</p>
                            <p>${p.catatan}</p>
                        </div>
                    ` : ''}

                    ${miniPracticeHtml}
                </div>
            </div>

            <div class="pt-4 mt-4 border-t border-white/10 shrink-0">
                <button class="w-full py-3 ${isCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#b89cff] hover:bg-[#a68af2]'} text-[#12161d] font-bold rounded-xl transition flex items-center justify-center gap-2" onclick="markCompleted('${p.id}')" id="btnMarkComplete">
                    ${isCompleted ? '<i data-lucide="check" class="w-5 h-5"></i> Sudah Dikuasai' : '<i data-lucide="check-circle" class="w-5 h-5"></i> Tandai Selesai'}
                </button>
            </div>
        </div>
    `;

    lucide.createIcons();
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function checkMiniPractice(btn, selected, correct) {
    const container = btn.closest('.mt-5');
    const feedback = container.querySelector('.mini-practice-feedback');
    const buttons = container.querySelectorAll('button');

    buttons.forEach(b => b.disabled = true);
    feedback.classList.remove('hidden');

    if (selected === correct) {
        btn.classList.replace('bg-[#161b22]', 'bg-emerald-500/20');
        btn.classList.replace('border-white/10', 'border-emerald-500/50');
        btn.classList.add('text-emerald-400');
        feedback.className = 'mini-practice-feedback mt-3 text-sm text-emerald-400 font-bold block';
        feedback.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 inline mr-1 -mt-0.5"></i> Benar!';
    } else {
        btn.classList.replace('bg-[#161b22]', 'bg-rose-500/20');
        btn.classList.replace('border-white/10', 'border-rose-500/50');
        btn.classList.add('text-rose-400');
        feedback.className = 'mini-practice-feedback mt-3 text-sm text-rose-400 font-bold block animate-wrong-shake';
        feedback.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 inline mr-1 -mt-0.5"></i> Salah. Jawaban: ${correct}`;
    }
    lucide.createIcons();
}

function markCompleted(id) {
    if (!userProgress.partikelSelesai.includes(id)) {
        userProgress.partikelSelesai.push(id);
        saveProgress();
    }
    const btn = document.getElementById('btnMarkComplete');
    btn.className = "w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2";
    btn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i> Sudah Dikuasai`;
    lucide.createIcons();

    renderPartikelGrid();
    if(typeof showToast === 'function') showToast('Berhasil', 'Partikel telah ditandai sebagai selesai.');
}

function closePartikelModal() {
    const modal = document.getElementById('partikelModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
}

function showToast(title, msg) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMsg').innerText = msg;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
