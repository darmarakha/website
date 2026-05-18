// Data Partikel Dasar
const partikelData = [
    {
        id: 'wa',
        char: 'は',
        romaji: 'wa',
        fungsi: 'Topik kalimat',
        rumus: 'A は B です',
        contoh: 'わたし は がくせい です。',
        terjemahan: 'Saya adalah pelajar.',
        catatan: 'Dibaca "wa", bukan "ha". Menunjukkan "kalau tentang..."',
        salah: 'Jangan gunakan は untuk penanda subjek baru atau fokus aksi.'
    },
    {
        id: 'ga',
        char: 'が',
        romaji: 'ga',
        fungsi: 'Subjek / Informasi baru',
        rumus: 'Kata Benda が Kata Kerja',
        contoh: 'あめ が ふります。',
        terjemahan: 'Hujan turun.',
        catatan: 'Menandai siapa/apa yang melakukan. Sering dipakai untuk keberadaan (ada/berada).',
        salah: 'Jangan tertukar dengan は. が menekankan subjeknya.'
    },
    {
        id: 'wo',
        char: 'を',
        romaji: 'o',
        fungsi: 'Objek langsung',
        rumus: 'Objek を Kata Kerja',
        contoh: 'みず を のみます。',
        terjemahan: 'Saya minum air.',
        catatan: 'Menandai objek yang dikenai pekerjaan. Dibaca "o".',
        salah: 'Jangan pakai を untuk tempat aksi (gunakan で).'
    },
    {
        id: 'ni',
        char: 'に',
        romaji: 'ni',
        fungsi: 'Waktu, Tujuan, Titik Keberadaan',
        rumus: 'Waktu/Tempat に',
        contoh: 'がっこう に います。',
        terjemahan: 'Saya berada di sekolah.',
        catatan: 'Menunjukkan titik lokasi benda/orang berada, atau titik waktu.',
        salah: 'Jangan pakai に untuk tempat aktivitas bergerak/aksi.'
    },
    {
        id: 'de',
        char: 'で',
        romaji: 'de',
        fungsi: 'Tempat aksi, Alat/Cara',
        rumus: 'Tempat/Alat で',
        contoh: 'がっこう で べんきょうします。',
        terjemahan: 'Saya belajar di sekolah.',
        catatan: 'Menunjukkan di mana sebuah aktivitas dilakukan, atau dengan menggunakan apa.',
        salah: 'Jangan tertukar dengan に untuk keberadaan.'
    },
    {
        id: 'e',
        char: 'へ',
        romaji: 'e',
        fungsi: 'Arah tujuan',
        rumus: 'Tempat へ',
        contoh: 'にほん へ いきます。',
        terjemahan: 'Saya pergi menuju Jepang.',
        catatan: 'Dibaca "e". Mirip dengan に tapi lebih menekankan arah perjalanan.',
        salah: 'Jangan baca "he".'
    },
    {
        id: 'no',
        char: 'の',
        romaji: 'no',
        fungsi: 'Kepemilikan / Penjelas',
        rumus: 'A の B',
        contoh: 'わたし の ほん です。',
        terjemahan: 'Ini adalah buku saya.',
        catatan: 'Menghubungkan dua kata benda. A menjelaskan B.',
        salah: 'B tidak selalu barang, bisa juga keterangan (misal: Guru Bahasa Jepang -> Nihongo no Sensei).'
    },
    {
        id: 'mo',
        char: 'も',
        romaji: 'mo',
        fungsi: 'Juga',
        rumus: 'A も B です',
        contoh: 'わたし も がくせい です。',
        terjemahan: 'Saya juga pelajar.',
        catatan: 'Menggantikan は, が, atau を untuk menyatakan "juga".',
        salah: 'Jangan menggabungkan は dan も (contoh salah: わたしはも).'
    }
];

// Data Quiz
const quizData = [
    {
        soal: 'わたし ___ みず ___ のみます。',
        options: ['A. は・を', 'B. が・に', 'C. で・を', 'D. の・が'],
        jawaban: 0,
        penjelasan: 'は menandai topik "saya". を menandai objek "air" yang diminum.'
    },
    {
        soal: 'がっこう ___ べんきょうします。',
        options: ['A. に', 'B. で', 'C. へ', 'D. を'],
        jawaban: 1,
        penjelasan: 'で dipakai karena "belajar" (benkyoushimasu) adalah sebuah aksi yang dilakukan di suatu tempat (sekolah).'
    },
    {
        soal: 'へや ___ ねこ ___ います。',
        options: ['A. で・は', 'B. に・が', 'C. に・を', 'D. へ・が'],
        jawaban: 1,
        penjelasan: 'に menandai lokasi keberadaan benda bernyawa (kucing ada di kamar). が menandai subjek (kucing).'
    },
    {
        soal: 'Ini adalah buku saya. -> わたし ___ ほん です。',
        options: ['A. が', 'B. は', 'C. の', 'D. も'],
        jawaban: 2,
        penjelasan: 'の digunakan untuk menunjukkan kepemilikan. わたし の ほん = buku milik saya.'
    },
    {
        soal: 'あした、にほん ___ いきます。',
        options: ['A. で', 'B. を', 'C. が', 'D. へ (atau に)'],
        jawaban: 3,
        penjelasan: 'へ atau に digunakan untuk menunjukkan tujuan perpindahan (pergi ke Jepang).'
    }
];

let currentQuizIndex = 0;
let quizScore = 0;

// Progress State Tracking
let userProgress = {
    partikelSelesai: [], // array of IDs like 'wa', 'ga'
    kontrasSelesai: [],  // array of IDs
    quizSelesai: false,
    score: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    renderPartikelGrid();
    setupKontrasButtons();
    updateUIProgress();

    document.getElementById('btnStartQuiz').addEventListener('click', startQuiz);
});

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('gy_jp_particle_progress_data');
    if (saved) {
        try {
            userProgress = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse progress data");
        }
    }
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('gy_jp_particle_progress_data', JSON.stringify(userProgress));

    // Calculate total percentage
    let totalItems = 8 /* dasar */ + 2 /* kontras */ + 1 /* quiz */;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    localStorage.setItem('gy_jp_particle_progress', percentage);
    updateUIProgress();
}

// Update UI based on progress
function updateUIProgress() {
    let totalItems = 8 + 2 + 1;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    document.getElementById('totalProgressText').innerText = percentage + '%';
    document.getElementById('totalProgressBar').style.width = percentage + '%';

    document.getElementById('progDasar').innerText = userProgress.partikelSelesai.length + '/8';
    document.getElementById('progKontras').innerText = userProgress.kontrasSelesai.length + '/2';
    document.getElementById('progQuiz').innerText = userProgress.quizSelesai ? '1/1' : '0/1';

    // Update Badge
    const badgeIcon = document.getElementById('badgeIcon');
    if (percentage === 100) {
        badgeIcon.className = "w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center border border-purple-400 shadow-lg shadow-purple-500/50";
        badgeIcon.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-white"></i>`;
    }

    // Update Cards
    partikelData.forEach(p => {
        const el = document.getElementById('card_' + p.id);
        if (el) {
            if (userProgress.partikelSelesai.includes(p.id)) {
                el.classList.add('completed');
                let check = el.querySelector('.status-check');
                if (check) check.classList.remove('hidden');
            }
        }
    });

    // Update Kontras Buttons
    document.querySelectorAll('.btn-mark-contrast').forEach(btn => {
        const id = btn.getAttribute('data-id');
        if (userProgress.kontrasSelesai.includes(id)) {
            btn.classList.add('completed');
            btn.innerHTML = `<i data-lucide="check-double" class="w-4 h-4"></i> Selesai`;
        }
    });

    lucide.createIcons();
}

// Render Partikel Grid
function renderPartikelGrid() {
    const grid = document.getElementById('partikelGrid');
    grid.innerHTML = '';

    partikelData.forEach(p => {
        const isCompleted = userProgress.partikelSelesai.includes(p.id);
        const card = document.createElement('div');
        card.className = `partikel-card glass-card bg-dark-900/50 border border-white/5 rounded-2xl p-5 ${isCompleted ? 'completed' : ''}`;
        card.id = 'card_' + p.id;
        card.onclick = () => openPartikelModal(p.id);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="card-icon w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-jp text-2xl font-bold transition-colors">
                    ${p.char}
                </div>
                <div class="status-check ${isCompleted ? '' : 'hidden'}">
                    <i data-lucide="check-circle" class="w-5 h-5 text-purple-400"></i>
                </div>
            </div>
            <h3 class="text-lg font-bold mb-1">${p.char} (${p.romaji})</h3>
            <p class="text-sm text-neutral-400 truncate">${p.fungsi}</p>
        `;
        grid.appendChild(card);
    });
}

// Modal Logic
function openPartikelModal(id) {
    const p = partikelData.find(x => x.id === id);
    if (!p) return;

    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div class="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div class="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center font-jp text-4xl font-bold text-purple-400 border border-purple-500/30">
                ${p.char}
            </div>
            <div>
                <h3 class="text-2xl font-bold text-white">Partikel ${p.char}</h3>
                <p class="text-neutral-400">Dibaca: <strong class="text-white">${p.romaji}</strong></p>
            </div>
        </div>

        <div class="space-y-4 mb-6">
            <div>
                <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">Fungsi Utama</p>
                <p class="text-white font-medium bg-white/5 p-3 rounded-lg border border-white/10">${p.fungsi}</p>
            </div>
            <div>
                <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">Rumus Dasar</p>
                <p class="text-purple-300 font-mono bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">${p.rumus}</p>
            </div>
            <div>
                <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">Contoh</p>
                <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                    <p class="text-lg font-bold text-white mb-1">${p.contoh.replace(p.char, `<span class="text-purple-400">${p.char}</span>`)}</p>
                    <p class="text-sm text-neutral-400">${p.terjemahan}</p>
                </div>
            </div>
            <div class="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-sm">
                <p class="text-orange-300 font-semibold mb-1 flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4"></i> Catatan & Kesalahan Umum</p>
                <p class="text-orange-200/80 mb-2">${p.catatan}</p>
                <p class="text-orange-200/60 text-xs">${p.salah}</p>
            </div>
        </div>

        <button class="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition" onclick="markPartikelSelesai('${p.id}')">
            Mengerti & Tandai Selesai
        </button>
    `;

    document.getElementById('partikelModal').classList.add('active');
    lucide.createIcons();
}

function closePartikelModal() {
    document.getElementById('partikelModal').classList.remove('active');
}

function markPartikelSelesai(id) {
    if (!userProgress.partikelSelesai.includes(id)) {
        userProgress.partikelSelesai.push(id);
        saveProgress();
        showToast('Berhasil', `Materi partikel dipelajari.`);
    }
    closePartikelModal();
}

// Kontras Buttons
function setupKontrasButtons() {
    document.querySelectorAll('.btn-mark-contrast').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (!userProgress.kontrasSelesai.includes(id)) {
                userProgress.kontrasSelesai.push(id);
                saveProgress();
                showToast('Latihan Selesai', 'Pemahaman kontras partikel ditambahkan.');
            }
        });
    });
}

// Quiz Logic
function startQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    renderQuiz();
}

function renderQuiz() {
    if (currentQuizIndex >= quizData.length) {
        showQuizResult();
        return;
    }

    const q = quizData[currentQuizIndex];
    const container = document.getElementById('quizContainer');

    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
        optionsHtml += `<button class="quiz-option w-full text-left p-4 rounded-xl border border-white/10 bg-dark-900 hover:bg-white/5 font-medium mb-3" onclick="answerQuiz(${idx})">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-neutral-400 font-bold uppercase tracking-wider">
            <span>Soal ${currentQuizIndex + 1} / ${quizData.length}</span>
            <span>Skor: ${quizScore}</span>
        </div>
        <div class="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
            <h3 class="text-xl font-bold">${q.soal}</h3>
        </div>
        <div class="options-container" id="quizOptions">
            ${optionsHtml}
        </div>
        <div id="quizFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border"></div>
        <button id="btnNextQuiz" class="hidden mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="nextQuiz()">Soal Selanjutnya</button>
    `;
}

function answerQuiz(selectedIdx) {
    const q = quizData[currentQuizIndex];
    const opts = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quizFeedback');
    const btnNext = document.getElementById('btnNextQuiz');

    // Disable all options
    opts.forEach(opt => opt.disabled = true);

    if (selectedIdx === q.jawaban) {
        opts[selectedIdx].classList.add('correct');
        quizScore += 20;
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 block";
        feedback.innerHTML = `<strong>Benar!</strong> ${q.penjelasan}`;
    } else {
        opts[selectedIdx].classList.add('wrong');
        opts[q.jawaban].classList.add('correct'); // highlight correct one
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-200 block";
        feedback.innerHTML = `<strong>Kurang tepat.</strong> ${q.penjelasan}`;
    }

    btnNext.classList.remove('hidden');
    if (currentQuizIndex === quizData.length - 1) {
        btnNext.innerText = "Lihat Hasil Akhir";
    }
}

function nextQuiz() {
    currentQuizIndex++;
    renderQuiz();
}

function showQuizResult() {
    const container = document.getElementById('quizContainer');

    // Save quiz completion
    if (!userProgress.quizSelesai) {
        userProgress.quizSelesai = true;
        userProgress.score = quizScore;
        saveProgress();
    }

    let msg = quizScore >= 80 ? 'Hebat! Insting partikelmu sangat tajam.' : 'Tetap semangat! Pelajari lagi konsep dasar partikel.';

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500 mx-auto mb-6">
                <span class="text-3xl font-bold text-white">${quizScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Quiz Selesai!</h3>
            <p class="text-neutral-400 mb-8">${msg}</p>
            <button class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="startQuiz()">Ulangi Quiz</button>
        </div>
    `;

    showToast('Quiz Selesai', `Skormu ${quizScore}/100 disimpan.`);
}

// Toast Helper
function showToast(title, message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastMsg').innerText = message;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
