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
    },
    {
        id: 'to',
        char: 'と',
        romaji: 'to',
        fungsi: 'Dan / Bersama dengan',
        rumus: 'A と B (Daftar lengkap) atau A と Kata Kerja',
        contoh: 'パン と ぎゅうにゅう を かいます。',
        terjemahan: 'Membeli roti dan susu.',
        catatan: 'Menyebutkan semua hal dalam daftar secara spesifik.',
        salah: 'Jangan pakai と untuk menyambung kalimat, hanya untuk kata benda.'
    },
    {
        id: 'ya',
        char: 'や',
        romaji: 'ya',
        fungsi: 'Dan (Daftar tidak lengkap)',
        rumus: 'A や B',
        contoh: 'パン や ぎゅうにゅう を かいます。',
        terjemahan: 'Membeli (hal seperti) roti dan susu.',
        catatan: 'Mengisyaratkan ada hal lain selain yang disebutkan.',
        salah: 'Jangan pakai や jika kamu sudah menyebutkan semua barangnya.'
    },
    {
        id: 'kara',
        char: 'から',
        romaji: 'kara',
        fungsi: 'Dari / Karena',
        rumus: 'Tempat/Waktu から',
        contoh: 'うち から きました。',
        terjemahan: 'Saya datang dari rumah.',
        catatan: 'Menunjukkan titik awal dari sebuah lokasi atau waktu.',
        salah: 'Jangan tertukar dengan まで (sampai).'
    },
    {
        id: 'made',
        char: 'まで',
        romaji: 'made',
        fungsi: 'Sampai',
        rumus: 'Tempat/Waktu まで',
        contoh: 'がっこう まで いきます。',
        terjemahan: 'Pergi sampai sekolah.',
        catatan: 'Menunjukkan titik akhir atau batas.',
        salah: 'Bisa digabung dengan から (contoh: 9-ji kara 5-ji made).'
    },
    {
        id: 'ka',
        char: 'か',
        romaji: 'ka',
        fungsi: 'Penanda Pertanyaan / Atau',
        rumus: 'Kalimat + か / A か B',
        contoh: 'これは なんですか。',
        terjemahan: 'Ini apa?',
        catatan: 'Diletakkan di akhir kalimat untuk menjadikannya pertanyaan, atau di antara kata benda untuk arti "atau".',
        salah: 'Dalam bahasa Jepang formal, jarang memakai tanda tanya (?) bila sudah ada か.'
    },
    {
        id: 'yo',
        char: 'よ',
        romaji: 'yo',
        fungsi: 'Penekanan / Memberi tahu info baru',
        rumus: 'Kalimat + よ',
        contoh: 'おいしい です よ。',
        terjemahan: 'Enak lho.',
        catatan: 'Digunakan saat pembicara tahu sesuatu yang pendengar belum tahu.',
        salah: 'Jangan terlalu sering dipakai agar tidak terdengar menggurui.'
    },
    {
        id: 'ne',
        char: 'ね',
        romaji: 'ne',
        fungsi: 'Meminta persetujuan / Konfirmasi',
        rumus: 'Kalimat + ね',
        contoh: 'おいしい です ね。',
        terjemahan: 'Enak ya (kan).',
        catatan: 'Digunakan saat pembicara mengharapkan pendengar setuju dengannya.',
        salah: 'Berbeda dengan よ, ね berasumsi pendengar juga sepaham.'
    }
];



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
    let totalItems = 15 /* dasar */ + 2 /* kontras */ + 1 /* quiz */;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    localStorage.setItem('gy_jp_particle_progress', percentage);
    updateUIProgress();
}

// Update UI based on progress
function updateUIProgress() {
    let totalItems = 15 + 2 + 1;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    document.getElementById('totalProgressText').innerText = percentage + '%';
    document.getElementById('totalProgressBar').style.width = percentage + '%';

    document.getElementById('progDasar').innerText = userProgress.partikelSelesai.length + '/15';
    document.getElementById('progKontras').innerText = userProgress.kontrasSelesai.length + '/2';

    let progQuiz = document.getElementById('progQuiz');
    if (progQuiz) {
        progQuiz.innerText = userProgress.quizSelesai ? '1/1' : '0/1';
    }

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
        card.className = `partikel-card glass-card bg-gradient-to-br from-dark-900/80 to-dark-900/40 border ${isCompleted ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-white/5'} rounded-2xl p-5 ${isCompleted ? 'completed' : ''} transition-all duration-300 hover:border-purple-500/50 group`;
        card.id = 'card_' + p.id;
        card.onclick = () => openPartikelModal(p.id);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="card-icon w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-jp text-3xl font-bold transition-all duration-300 group-hover:bg-purple-500/20 group-hover:text-purple-400 border border-white/5 group-hover:border-purple-500/30 ${isCompleted ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}">
                    ${p.char}
                </div>
                <div class="status-check ${isCompleted ? '' : 'hidden'}">
                    <i data-lucide="check-circle" class="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"></i>
                </div>
            </div>
            <h3 class="text-xl font-bold mb-1 group-hover:text-purple-300 transition-colors">${p.char} (${p.romaji})</h3>
            <p class="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">${p.fungsi}</p>
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

// Helper to shuffle array
function shuffleArray(array) {
    let curId = array.length;
    while (0 !== curId) {
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

// Quiz Logic
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

// Data Ujian JLPT
const ujianBank = [
    {
        "soal": "わたし ___ みず ___ のみます。",
        "options": [
            "A. は・を",
            "B. が・に",
            "C. で・を",
            "D. の・が"
        ],
        "jawaban": 0,
        "penjelasan": "は menandai topik 'saya'. を menandai objek 'air' yang diminum.",
        "type": "mcq"
    },
    {
        "soal": "がっこう ___ べんきょうします。",
        "options": [
            "A. に",
            "B. で",
            "C. へ",
            "D. を"
        ],
        "jawaban": 1,
        "penjelasan": "で dipakai karena 'belajar' adalah sebuah aksi yang dilakukan di suatu tempat.",
        "type": "mcq"
    },
    {
        "soal": "へや ___ ねこ ___ います。",
        "options": [
            "A. で・は",
            "B. に・が",
            "C. に・を",
            "D. へ・が"
        ],
        "jawaban": 1,
        "penjelasan": "に menandai lokasi keberadaan benda bernyawa. が menandai subjek (kucing).",
        "type": "mcq"
    },
    {
        "soal": "Ini adalah buku saya. -> わたし ___ ほん です。",
        "options": [
            "A. が",
            "B. は",
            "C. の",
            "D. も"
        ],
        "jawaban": 2,
        "penjelasan": "の digunakan untuk menunjukkan kepemilikan.",
        "type": "mcq"
    },
    {
        "soal": "あした、にほん ___ いきます。",
        "options": [
            "A. で",
            "B. を",
            "C. が",
            "D. へ"
        ],
        "jawaban": 3,
        "penjelasan": "へ digunakan untuk menunjukkan tujuan arah perpindahan (pergi ke Jepang).",
        "type": "mcq"
    },
    {
        "soal": "きのう、ともだち ___ えいが ___ みました。",
        "options": [
            "A. と・を",
            "B. や・に",
            "C. も・が",
            "D. に・へ"
        ],
        "jawaban": 0,
        "penjelasan": "と berarti 'bersama dengan', を menandai 'film' sebagai objek.",
        "type": "mcq"
    },
    {
        "soal": "あさ 7じ ___ おきます。",
        "options": [
            "A. で",
            "B. へ",
            "C. に",
            "D. は"
        ],
        "jawaban": 2,
        "penjelasan": "に digunakan untuk menandai titik waktu yang spesifik (jam 7).",
        "type": "mcq"
    },
    {
        "soal": "ここは だれ ___ くるま ですか。",
        "options": [
            "A. を",
            "B. の",
            "C. が",
            "D. や"
        ],
        "jawaban": 1,
        "penjelasan": "の menghubungkan 'siapa' (だれ) dan 'mobil' (くるま) untuk menanyakan kepemilikan (mobil siapa).",
        "type": "mcq"
    },
    {
        "soal": "わたし ___ りんご ___ すきです。",
        "options": [
            "A. は・が",
            "B. が・を",
            "C. は・を",
            "D. に・が"
        ],
        "jawaban": 0,
        "penjelasan": "Dalam pola kalimat kesukaan (すきです), objek yang disukai ditandai dengan が.",
        "type": "mcq"
    },
    {
        "soal": "スーパー ___ パン ___ ぎゅうにゅう ___ かいました。",
        "options": [
            "A. に・と・を",
            "B. で・と・を",
            "C. で・も・が",
            "D. へ・や・に"
        ],
        "jawaban": 1,
        "penjelasan": "で = tempat aksi (supermarket). と = dan (daftar lengkap). を = objek langsung yang dibeli.",
        "type": "mcq"
    },
    {
        "soal": "A: さくらさんは にほんじん ですか。 B: はい、そうです。キムさん ___ にほんじん です。",
        "options": [
            "A. は",
            "B. が",
            "C. も",
            "D. と"
        ],
        "jawaban": 2,
        "penjelasan": "も berarti 'juga' (Kim juga orang Jepang).",
        "type": "mcq"
    },
    {
        "soal": "これは コーヒー です ___ 、こうちゃ です ___ 。",
        "options": [
            "A. ね・ね",
            "B. か・か",
            "C. よ・よ",
            "D. は・が"
        ],
        "jawaban": 1,
        "penjelasan": "AかBか digunakan untuk menanyakan pilihan 'A atau B'.",
        "type": "mcq"
    },
    {
        "soal": "うち ___ がっこう ___ バスで いきます。",
        "options": [
            "A. から・まで",
            "B. で・に",
            "C. へ・と",
            "D. は・が"
        ],
        "jawaban": 0,
        "penjelasan": "から = dari, まで = sampai.",
        "type": "mcq"
    },
    {
        "soal": "つくえの うえに ほん ___ ぺん など が あります。",
        "options": [
            "A. と",
            "B. や",
            "C. も",
            "D. の"
        ],
        "jawaban": 1,
        "penjelasan": "や digunakan untuk mendaftar barang yang tidak lengkap (buku, pulpen, dan lain-lain).",
        "type": "mcq"
    },
    {
        "soal": "にちようび ___ どこ ___ いきません でした。",
        "options": [
            "A. は・も",
            "B. が・へ",
            "C. に・を",
            "D. は・で"
        ],
        "jawaban": 0,
        "penjelasan": "どこも + kata kerja negatif berarti 'tidak pergi ke mana-mana'.",
        "type": "mcq"
    },
    {
        "soal": "にほんご ___ じょうず です ___ 。",
        "options": [
            "A. が・ね",
            "B. を・よ",
            "C. は・か",
            "D. の・ね"
        ],
        "jawaban": 0,
        "penjelasan": "Kata sifat seperti 'pintar/mahir' mengambil partikel が. ね untuk meminta persetujuan 'pintar ya'.",
        "type": "mcq"
    },
    {
        "soal": "この ケーキ ___ おいしい です ___ 。たべて みて ください。",
        "options": [
            "A. は・ね",
            "B. が・か",
            "C. は・よ",
            "D. を・よ"
        ],
        "jawaban": 2,
        "penjelasan": "は sebagai topik. よ untuk memberikan informasi baru yang pendengar belum tahu 'Kue ini enak lho, cobalah'.",
        "type": "mcq"
    },
    {
        "soal": "えんぴつ ___ かきます。",
        "options": [
            "A. を",
            "B. で",
            "C. に",
            "D. が"
        ],
        "jawaban": 1,
        "penjelasan": "で digunakan untuk menandai 'alat' atau 'cara' melakukan aksi (menulis DENGAN pensil).",
        "type": "mcq"
    },
    {
        "soal": "あした は あめ ___ ふります。",
        "options": [
            "A. を",
            "B. で",
            "C. に",
            "D. が"
        ],
        "jawaban": 3,
        "penjelasan": "Fenomena alam seperti hujan turun menggunakan が (あめ が ふります).",
        "type": "mcq"
    },
    {
        "soal": "わたしは まいあさ 6じ ___ から 7じ ___ うんどう します。",
        "options": [
            "A. から・まで",
            "B. に・に",
            "C. で・で",
            "D. は・が"
        ],
        "jawaban": 0,
        "penjelasan": "から = dari jam 6, まで = sampai jam 7.",
        "type": "mcq"
    },
    {
        "type": "mcq",
        "soal": "えき ___ でんしゃ ___ のります。",
        "options": [
            "A. に・を",
            "B. で・に",
            "C. は・へ",
            "D. で・が"
        ],
        "jawaban": 1,
        "penjelasan": "で = tempat (di stasiun). に = target aksi untuk naik kendaraan (naik ke kereta)."
    },
    {
        "type": "essay",
        "soal": "きのう、どこ ___ 行きませんでした。(Tidak pergi ke mana-mana)",
        "jawaban": "も",
        "penjelasan": "どこも + kalimat negatif = tidak ke mana-mana."
    },
    {
        "type": "mcq",
        "soal": "わたし ___ りんご ___ すきです。",
        "options": [
            "A. は・が",
            "B. が・を",
            "C. は・を",
            "D. に・が"
        ],
        "jawaban": 0,
        "penjelasan": "Dalam pola kesukaan (suki), objek yang disukai ditandai dengan が."
    },
    {
        "type": "essay",
        "soal": "くるま ___ きました。(Datang dengan mobil)",
        "jawaban": "で",
        "penjelasan": "で menandai alat atau sarana yang digunakan."
    },
    {
        "type": "mcq",
        "soal": "A: きょうは いい てんき です ___ 。 B: そうですね。",
        "options": [
            "A. か",
            "B. よ",
            "C. ね",
            "D. が"
        ],
        "jawaban": 2,
        "penjelasan": "ね digunakan untuk mengharapkan persetujuan lawan bicara."
    },
    {
        "type": "essay",
        "soal": "ともだち ___ あいます。(Bertemu teman)",
        "jawaban": "に",
        "penjelasan": "あいます (bertemu) selalu membutuhkan target pertemuan dengan partikel に."
    },
    {
        "type": "mcq",
        "soal": "ここは だれ ___ くるま ですか。",
        "options": [
            "A. を",
            "B. の",
            "C. が",
            "D. や"
        ],
        "jawaban": 1,
        "penjelasan": "の digunakan untuk menghubungkan dua kata benda menjadi satu kesatuan (mobil milik siapa)."
    },
    {
        "type": "essay",
        "soal": "月曜日 ___ 金曜日 ___ はたらきます。(Bekerja dari senin sampai jumat)",
        "jawaban": [
            "から",
            "まで"
        ],
        "penjelasan": "A から B まで = Dari A sampai B."
    }
];

let currentUjianIndex = 0;
let ujianScore = 0;
let ujianData = [];
let ujianMaxScore = 0;

// Initialize Ujian
document.addEventListener('DOMContentLoaded', () => {
    const btnStartUjian = document.getElementById('btnStartUjian');
    if(btnStartUjian) {
        btnStartUjian.addEventListener('click', startUjian);
    }
});

function startUjian() {
    currentUjianIndex = 0;
    ujianScore = 0;
    ujianMaxScore = 0;

    // Ambil 8 soal acak dari bank ujian
    ujianData = shuffleArray([...ujianBank]);

    renderUjian();
}

function renderUjian() {
    if (currentUjianIndex >= ujianData.length) {
        showUjianResult();
        return;
    }

    const q = ujianData[currentUjianIndex];
    const container = document.getElementById('ujianContainer');

    let contentHtml = '';
    if (q.type === 'mcq') {
        let optionsHtml = '';
        q.options.forEach((opt, idx) => {
            optionsHtml += `<button class="ujian-option w-full text-left p-4 rounded-xl border border-white/10 bg-dark-900 hover:bg-white/5 font-medium mb-3" onclick="answerUjianMcq(${idx})">${opt}</button>`;
        });
        contentHtml = `
            <div class="options-container" id="ujianOptions">
                ${optionsHtml}
            </div>
        `;
    } else if (q.type === 'essay') {
        let inputHtml = '';
        if (Array.isArray(q.jawaban)) {
            // Multiple inputs
            q.jawaban.forEach((_, idx) => {
                 inputHtml += `<input type="text" id="ujianEssayInput_${idx}" class="ujian-essay-input w-24 bg-dark-900 border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="partikel">`;
            });
        } else {
             inputHtml = `<input type="text" id="ujianEssayInput" class="ujian-essay-input w-32 bg-dark-900 border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-auto block focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" placeholder="ketik romaji...">`;
        }

        contentHtml = `
            <div class="py-6 text-center">
                <div class="flex items-center justify-center flex-wrap mb-6">
                    ${inputHtml}
                </div>
                <button class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20" onclick="answerUjianEssay()">Kirim Jawaban</button>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-neutral-400 font-bold uppercase tracking-wider">
            <span class="text-orange-400">Soal Ujian ${currentUjianIndex + 1} / ${ujianData.length}</span>
            <span>Tipe: ${q.type === 'mcq' ? 'Pilihan Ganda' : 'Essai (Wanakana)'}</span>
        </div>
        <div class="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
            <h3 class="text-2xl font-bold font-jp leading-relaxed">${q.soal}</h3>
        </div>
        ${contentHtml}
        <div id="ujianFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border"></div>
        <button id="btnNextUjian" class="hidden mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="nextUjian()">Soal Selanjutnya</button>
    `;

    // Bind Wanakana for essay inputs
    setTimeout(() => {
        const inputs = document.querySelectorAll('.ujian-essay-input');
        inputs.forEach(input => {
            if (typeof wanakana !== 'undefined') {
                wanakana.bind(input);
            }
        });
        if(inputs.length > 0) {
            inputs[0].focus();
        }
    }, 100);
}

function answerUjianMcq(selectedIdx) {
    const q = ujianData[currentUjianIndex];
    const opts = document.querySelectorAll('.ujian-option');
    const feedback = document.getElementById('ujianFeedback');
    const btnNext = document.getElementById('btnNextUjian');

    opts.forEach(opt => opt.disabled = true);
    ujianMaxScore += 10;

    if (selectedIdx === q.jawaban) {
        opts[selectedIdx].classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        ujianScore += 10;
        showUjianFeedback(true, q.penjelasan);
    } else {
        opts[selectedIdx].classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
        opts[q.jawaban].classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        showUjianFeedback(false, q.penjelasan);
    }
}

function answerUjianEssay() {
    const q = ujianData[currentUjianIndex];
    const feedback = document.getElementById('ujianFeedback');
    let isCorrect = true;
    ujianMaxScore += 10;

    if (Array.isArray(q.jawaban)) {
        q.jawaban.forEach((ans, idx) => {
            const input = document.getElementById('ujianEssayInput_' + idx);
            if (!input || input.value.trim() !== ans) {
                isCorrect = false;
                if(input) input.classList.add('border-rose-500', 'text-rose-400');
            } else {
                if(input) input.classList.add('border-emerald-500', 'text-emerald-400');
            }
            if(input) input.disabled = true;
        });
    } else {
        const input = document.getElementById('ujianEssayInput');
        if (!input || input.value.trim() !== q.jawaban) {
            isCorrect = false;
            if(input) input.classList.add('border-rose-500', 'text-rose-400');
        } else {
            if(input) input.classList.add('border-emerald-500', 'text-emerald-400');
        }
        if(input) input.disabled = true;
    }

    const btnSubmit = document.querySelector('.ujian-essay-input').parentElement.nextElementSibling;
    if (btnSubmit) btnSubmit.classList.add('hidden');

    if (isCorrect) {
        ujianScore += 10;
        showUjianFeedback(true, q.penjelasan);
    } else {
        showUjianFeedback(false, `Jawaban yang tepat adalah: <strong>${Array.isArray(q.jawaban) ? q.jawaban.join(' dan ') : q.jawaban}</strong>. <br>` + q.penjelasan);
    }
}

function showUjianFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('ujianFeedback');
    const btnNext = document.getElementById('btnNextUjian');

    if (isCorrect) {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 block";
        feedback.innerHTML = `<strong>Benar!</strong> ${explanation}`;
    } else {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-200 block";
        feedback.innerHTML = `<strong>Salah.</strong> ${explanation}`;
    }

    btnNext.classList.remove('hidden');
    if (currentUjianIndex === ujianData.length - 1) {
        btnNext.innerText = "Selesaikan Ujian";
    }
}

function nextUjian() {
    currentUjianIndex++;
    renderUjian();
}

function showUjianResult() {
    const container = document.getElementById('ujianContainer');
    let percentage = Math.round((ujianScore / ujianMaxScore) * 100);

    // Save completion to localstorage like the old quiz
    if (!userProgress.quizSelesai && percentage >= 80) {
        userProgress.quizSelesai = true;
        userProgress.score = percentage;
        saveProgress();
    }

    let msg = percentage >= 80 ? 'Luar Biasa! Anda sudah setara dengan N5 untuk partikel.' : 'Terus berlatih! Partikel memang membingungkan pada awalnya.';
    let color = percentage >= 80 ? 'text-emerald-400' : 'text-orange-400';
    let borderColor = percentage >= 80 ? 'border-emerald-500' : 'border-orange-500';
    let bgColor = percentage >= 80 ? 'bg-emerald-500/20' : 'bg-orange-500/20';

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-32 h-32 rounded-full ${bgColor} flex items-center justify-center border-4 ${borderColor} mx-auto mb-6">
                <span class="text-4xl font-bold ${color}">${percentage}</span>
            </div>
            <h3 class="text-3xl font-bold mb-2">Sertifikasi Selesai</h3>
            <p class="text-neutral-400 mb-8">${msg}</p>
            <button class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="startUjian()">Ulangi Ujian JLPT</button>
        </div>
    `;

    showToast('JLPT Selesai', `Skor akhir: ${percentage}`);
}
