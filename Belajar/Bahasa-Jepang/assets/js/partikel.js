// Progress State Tracking
let userProgress = {
    partikelSelesai: [],
    kontrasSelesai: [],
    latihanSelesai: false,
    puzzleSelesai: false,
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
    if (typeof renderContrastTrainer === 'function') renderContrastTrainer();
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

function getJumlahPartikel() {
    return typeof partikelData !== 'undefined' ? partikelData.length : 40;
}

function getJumlahKontras() {
    if (typeof contrastLabData !== 'undefined') return contrastLabData.length;
    if (typeof partikelData === 'undefined') return 12;
    return 12;
}

function updateUIProgress() {
    let totalPartikel = getJumlahPartikel();
    let totalKontras = getJumlahKontras();
    let totalItems = totalPartikel + totalKontras + 5;
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
    if(progDasar) progDasar.innerText = userProgress.partikelSelesai.length + '/' + totalPartikel;

    let progKontras = document.getElementById('progKontras');
    if(progKontras) progKontras.innerText = userProgress.kontrasSelesai.length + '/' + totalKontras;

    let progQuiz = document.getElementById('progQuiz');
    if (progQuiz) {
        let qCount = (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0) + (userProgress.highlighterSelesai ? 1 : 0) + (userProgress.builderSelesai ? 1 : 0) + (userProgress.slotTrainerSelesai ? 1 : 0);
        progQuiz.innerText = qCount + '/6';
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

let partikelFilterKategori = 'semua';

function setFilterKategori(kategori) {
    partikelFilterKategori = kategori;
    renderPartikelGrid();
}

function renderPartikelGrid() {
    const grid = document.getElementById('partikelGrid');
    const filterBar = document.getElementById('partikelFilterBar');
    if(!grid) return;

    if (typeof partikelData === 'undefined') return;

    let dataToShow = partikelData;
    if (partikelFilterKategori !== 'semua') {
        dataToShow = partikelData.filter(p => p.kategori && p.kategori.includes(partikelFilterKategori));
    }

    if (filterBar) {
        let kategoris = [...new Set(partikelData.flatMap(p => p.kategori || []))];
        let filterHtml = `<button class="px-3 py-1.5 rounded-full text-xs font-bold transition ${partikelFilterKategori === 'semua' ? 'bg-[#b89cff] text-[#12161d]' : 'bg-white/5 text-[#a9a29a] hover:bg-white/10'}" onclick="setFilterKategori('semua')">Semua</button>`;
        kategoris.forEach(k => {
            let label = k.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            let safe = k.replace(/'/g, "\\'");
            filterHtml += `<button class="px-3 py-1.5 rounded-full text-xs font-bold transition ${partikelFilterKategori === k ? 'bg-[#b89cff] text-[#12161d]' : 'bg-white/5 text-[#a9a29a] hover:bg-white/10'}" onclick="setFilterKategori('${safe}')">${label}</button>`;
        });
        filterBar.innerHTML = filterHtml;
    }

    grid.innerHTML = '';

    dataToShow.forEach(p => {
        const isCompleted = userProgress.partikelSelesai.includes(p.id);
        const card = document.createElement('div');
        card.className = `partikel-card glass-card bg-gradient-to-br from-[#161b22] to-[#161b22]/40 border ${isCompleted ? 'border-[#b89cff]/50 shadow-lg shadow-[#b89cff]/10' : 'border-white/5'} rounded-2xl p-5 ${isCompleted ? 'completed' : ''} transition-all duration-300 hover:border-[#b89cff]/50 group`;
        card.id = 'card_' + p.id;
        card.onclick = () => openPartikelModal(p.id);

        let charClass = p.char.length > 1 ? 'text-xl' : 'text-3xl';

        let tingkatBadge = p.tingkat ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full ${p.tingkat === 'N5' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} font-bold">${p.tingkat}</span>` : '';

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="card-icon w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-jp ${charClass} font-bold transition-all duration-300 group-hover:bg-[#b89cff]/20 group-hover:text-[#b89cff] border border-white/5 group-hover:border-[#b89cff]/30 ${isCompleted ? 'bg-[#b89cff]/20 text-[#b89cff] border-[#b89cff]/30' : ''}">
                    ${p.char}
                </div>
                <div class="flex items-center gap-2">
                    ${tingkatBadge}
                    ${isCompleted ? '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>' : ''}
                </div>
            </div>
            <h3 class="text-xl font-bold text-[#f4efe7] font-jp mb-1">${p.romaji.toUpperCase()}</h3>
            <p class="text-[#a9a29a] text-sm">${p.fungsi}</p>
            ${p.penjelasanSingkat ? `<p class="text-[#777] text-xs mt-2 line-clamp-2">${p.penjelasanSingkat}</p>` : ''}
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

    let ceritaHtml = '';
    if (p.cerita) {
        ceritaHtml = `
            <div class="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-sm">
                <p class="font-bold mb-1 flex items-center gap-1 text-amber-300"><i data-lucide="sparkles" class="w-4 h-4"></i> Cerita Pembantu Ingatan</p>
                <p class="text-amber-200/80 leading-relaxed">${p.cerita}</p>
            </div>
        `;
    }

    let semuaFungsiHtml = '';
    if (p.semuaFungsi && p.semuaFungsi.length > 0) {
        let fungsiItems = p.semuaFungsi.map((f, fi) => `
            <div class="bg-[#0a0d12] border border-white/5 p-3 rounded-xl mb-2">
                <p class="text-[#b89cff] font-bold text-sm mb-1 flex items-center gap-1"><i data-lucide="list" class="w-3 h-3"></i> ${f.judul}</p>
                <p class="text-[#c0c0c0] text-xs leading-relaxed mb-2">${f.penjelasan}</p>
                ${f.contoh ? f.contoh.map(ct => `<div class="text-xs text-[#f4efe7] font-jp bg-white/5 p-1.5 rounded mb-1">${ct}</div>`).join('') : ''}
            </div>
        `).join('');
        semuaFungsiHtml = `
            <div class="bg-[#161b22] p-4 rounded-xl border border-white/5">
                <h4 class="text-[#b89cff] font-bold mb-3 flex items-center gap-2 text-sm"><i data-lucide="layers" class="w-4 h-4"></i> Semua Fungsi</h4>
                ${fungsiItems}
            </div>
        `;
    }

    let jlptHtml = '';
    if (p.jlptQuestions && p.jlptQuestions.length > 0) {
        let qItems = p.jlptQuestions.map((q, qi) => {
            let opts = q.opsi.map((o, oi) => `
                <button class="px-2 py-1 text-xs rounded bg-[#161b22] border border-white/10 hover:bg-white/10 text-[#f4efe7] transition-all" onclick="checkJlptSample(this, ${qi}, ${oi})">${o}</button>
            `).join('');
            return `
                <div class="bg-[#0a0d12] border border-white/5 p-3 rounded-xl mb-2" data-jlpt="${qi}">
                    <p class="text-[#f4efe7] text-sm font-jp mb-2">${q.soal}</p>
                    <div class="flex flex-wrap gap-1.5">${opts}</div>
                    <div class="jlpt-feedback-${qi} mt-1 text-xs hidden"></div>
                </div>
            `;
        }).join('');
        jlptHtml = `
            <div class="bg-[#161b22] p-4 rounded-xl border border-white/5">
                <h4 class="text-[#b89cff] font-bold mb-3 flex items-center gap-2 text-sm"><i data-lucide="graduation-cap" class="w-4 h-4"></i> Latihan Gaya JLPT</h4>
                ${qItems}
            </div>
        `;
    }

    let tingkatBadge = p.tingkat ? `<span class="text-xs px-2 py-0.5 rounded-full ${p.tingkat === 'N5' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} font-bold ml-2">${p.tingkat}</span>` : '';
    let kategoriLabel = '';
    if (p.kategori && p.kategori.length > 0) {
        kategoriLabel = `<span class="text-xs text-[#777] ml-2">${p.kategori[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>`;
    }

    let miniPracticeHtml = '';
    if (p.miniPractice) {
        let optionsHtml = p.miniPractice.options.map(opt =>
            `<button onclick="checkMiniPractice(this, '${opt.replace(/'/g, "\\'")}', '${String(p.miniPractice.jawaban).replace(/'/g, "\\'")}')" class="px-3 py-1 rounded bg-[#161b22] border border-white/10 hover:bg-white/10 text-[#f4efe7] transition-colors">${opt}</button>`
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
                    <h3 class="text-xl md:text-2xl font-bold text-[#f4efe7] flex items-center gap-2 flex-wrap">
                        Partikel ${p.romaji.toUpperCase()}
                        ${tingkatBadge}
                        ${isCompleted ? '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>' : ''}
                    </h3>
                    <p class="text-[#a9a29a] font-medium mt-1 text-sm">${p.fungsi} ${kategoriLabel}</p>
                </div>
            </div>

            <div class="overflow-y-auto custom-scrollbar pr-2 pb-2">
                <div class="space-y-4">
                    <div class="bg-[#161b22] p-4 rounded-xl border border-white/5 font-mono text-sm">
                        <p class="text-[#b89cff] font-bold mb-1"><i data-lucide="braces" class="w-4 h-4 inline mr-1"></i>Rumus:</p>
                        <p class="text-[#f4efe7]">${p.rumus}</p>
                    </div>

                    ${ceritaHtml}

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

                    ${semuaFungsiHtml}

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

                    ${jlptHtml}
                </div>
            </div>

            <div class="pt-4 mt-4 border-t border-white/10 shrink-0">
                <button class="w-full py-3 ${isCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#b89cff] hover:bg-[#a68af2]'} text-[#12161d] font-bold rounded-xl transition flex items-center justify-center gap-2" onclick="markCompleted('${p.id}')" id="btnMarkComplete">
                    ${isCompleted ? '<i data-lucide="check" class="w-5 h-5"></i> Sudah Dikuasai' : '<i data-lucide="check-circle" class="w-5 h-5"></i> Tandai Selesai'}
                </button>
            </div>
        </div>
    `;

    modal.setAttribute('data-particle-id', id);
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

function checkJlptSample(btn, qIdx, selectedIdx) {
    const container = btn.closest('[data-jlpt]');
    if (!container) return;
    const allBtns = container.querySelectorAll('button');
    allBtns.forEach(b => b.disabled = true);

    // Find the particle via data attribute
    const modal = document.getElementById('partikelModal');
    let p = null;
    if (modal && typeof partikelData !== 'undefined') {
        const pid = modal.getAttribute('data-particle-id');
        p = partikelData.find(x => x.id === pid);
    }
    if (!p || !p.jlptQuestions || !p.jlptQuestions[qIdx]) return;

    const q = p.jlptQuestions[qIdx];
    const feedback = container.querySelector(`.jlpt-feedback-${qIdx}`);
    if (!feedback) return;

    feedback.classList.remove('hidden');

    if (selectedIdx === q.jawaban) {
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        feedback.className = `jlpt-feedback-${qIdx} mt-2 text-xs text-emerald-400 block`;
        feedback.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i> Benar! ' + (q.penjelasan || '');
    } else {
        btn.classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
        let correctBtn = container.querySelectorAll('button')[q.jawaban];
        if (correctBtn) correctBtn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        feedback.className = `jlpt-feedback-${qIdx} mt-2 text-xs text-rose-400 block`;
        feedback.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3 inline mr-1"></i> Kurang tepat. ' + (q.penjelasan || '');
    }
    lucide.createIcons();
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
