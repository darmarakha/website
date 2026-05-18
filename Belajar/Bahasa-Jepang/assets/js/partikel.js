// Data Partikel Dasar
const partikelData = [
    {
        id: 'wa',
        char: 'は',
        romaji: 'wa',
        fungsi: 'Topik kalimat',
        rumus: '[Subjek/Topik] + は + [Keterangan/Predikat]',
        contoh: [
            { jp: '<ruby>私<rt>わたし</rt></ruby> は <ruby>学生<rt>がくせい</rt></ruby> です。', id: 'Saya adalah pelajar.' },
            { jp: 'この <ruby>本<rt>ほん</rt></ruby> は 面白い です。', id: 'Buku ini menarik.' }
        ],
        catatan: 'Dibaca "wa", bukan "ha". Menandakan "kalau tentang...". Menunjukkan hal yang sudah diketahui oleh pembicara dan pendengar.',
        salah: 'Jangan gunakan は untuk penanda informasi baru.'
    },
    {
        id: 'ga',
        char: 'が',
        romaji: 'ga',
        fungsi: 'Subjek / Informasi baru / Keberadaan',
        rumus: '[Subjek Spesifik] + が + [Kata Kerja Intransitif / Keberadaan]',
        contoh: [
            { jp: '<ruby>雨<rt>あめ</rt></ruby> が <ruby>降<rt>ふ</rt></ruby>ります。', id: 'Hujan turun.' },
            { jp: '<ruby>部屋<rt>へや</rt></ruby> に <ruby>猫<rt>ねこ</rt></ruby> が います。', id: 'Ada kucing di kamar.' }
        ],
        catatan: 'Menandai siapa/apa yang melakukan aksi. Sangat sering dipakai dengan kata kerja あります (ada benda mati) dan います (ada mahluk hidup).',
        salah: 'Jangan tertukar dengan は. が lebih menekankan pada Subjeknya.'
    },
    {
        id: 'wo',
        char: 'を',
        romaji: 'o',
        fungsi: 'Objek langsung aksi',
        rumus: '[Objek Penderita] + を + [Kata Kerja Transitif]',
        contoh: [
            { jp: '<ruby>水<rt>みず</rt></ruby> を <ruby>飲<rt>の</rt></ruby>みます。', id: 'Saya minum air.' },
            { jp: '<ruby>本<rt>ほん</rt></ruby> を <ruby>読<rt>よ</rt></ruby>みます。', id: 'Saya membaca buku.' }
        ],
        catatan: 'Menandai benda yang secara langsung dikenai pekerjaan. Dibaca "o", walau diketik "wo".',
        salah: 'Jangan pakai を untuk menunjukkan lokasi, kecuali pada pengecualian kata kerja gerak (misal: melewati taman -> こうえん を さんぽします).'
    },
    {
        id: 'ni',
        char: 'に',
        romaji: 'ni',
        fungsi: 'Waktu, Tujuan, Titik Keberadaan',
        rumus: '[Waktu/Tempat Spesifik] + に',
        contoh: [
            { jp: '<ruby>学校<rt>がっこう</rt></ruby> に います。', id: 'Saya berada di sekolah. (Keberadaan)' },
            { jp: '<ruby>七時<rt>しちじ</rt></ruby> に <ruby>起<rt>お</rt></ruby>きます。', id: 'Saya bangun pada jam tujuh. (Waktu)' },
            { jp: '<ruby>日本<rt>にほん</rt></ruby> に <ruby>行<rt>い</rt></ruby>きます。', id: 'Saya pergi ke Jepang. (Tujuan)' }
        ],
        catatan: 'Berfungsi seperti paku yang menancap pada satu titik (waktu tertentu, tempat berada yang tidak bergerak).',
        salah: 'Jangan pakai に untuk tempat dimana kamu melakukan aktivitas bergerak (seperti makan, belajar).'
    },
    {
        id: 'de',
        char: 'で',
        romaji: 'de',
        fungsi: 'Tempat aksi, Alat/Cara',
        rumus: '[Tempat Aksi / Alat / Kendaraan] + で + [Kata Kerja]',
        contoh: [
            { jp: '<ruby>学校<rt>がっこう</rt></ruby> で <ruby>勉強<rt>べんきょう</rt></ruby>します。', id: 'Saya belajar di sekolah. (Tempat Aksi)' },
            { jp: '<ruby>鉛筆<rt>えんぴつ</rt></ruby> で <ruby>書<rt>か</rt></ruby>きます。', id: 'Saya menulis dengan pensil. (Alat)' }
        ],
        catatan: 'Menunjukkan "di mana" sebuah aktivitas dilakukan, atau "dengan cara/alat apa" sebuah aksi dilakukan.',
        salah: 'Jangan tertukar dengan に. で butuh aksi dinamis, に statis.'
    },
    {
        id: 'e',
        char: 'へ',
        romaji: 'e',
        fungsi: 'Arah tujuan (Direction)',
        rumus: '[Tempat/Arah] + へ + [Kata Kerja Gerak]',
        contoh: [
            { jp: '<ruby>日本<rt>にほん</rt></ruby> へ <ruby>行<rt>い</rt></ruby>きます。', id: 'Saya pergi menuju Jepang.' },
            { jp: '<ruby>右<rt>みぎ</rt></ruby> へ <ruby>曲<rt>ま</rt></ruby>がります。', id: 'Belok ke arah kanan.' }
        ],
        catatan: 'Dibaca "e". Secara fungsional mirip dengan に untuk tujuan tempat, tapi へ lebih menekankan "arah perjalanannya" daripada "titik tujuannya".',
        salah: 'Jangan baca "he".'
    },
    {
        id: 'no',
        char: 'の',
        romaji: 'no',
        fungsi: 'Kepemilikan / Penjelas Nomina',
        rumus: '[Kata Benda 1] + の + [Kata Benda 2]',
        contoh: [
            { jp: '<ruby>私<rt>わたし</rt></ruby> の <ruby>本<rt>ほん</rt></ruby> です。', id: 'Ini adalah buku milik saya.' },
            { jp: '<ruby>日本語<rt>にほんご</rt></ruby> の <ruby>先生<rt>せんせい</rt></ruby> です。', id: 'Beliau adalah guru (pelajaran) bahasa Jepang.' }
        ],
        catatan: 'Menghubungkan dua kata benda. Benda 1 selalu menjelaskan Benda 2.',
        salah: 'Benda 1 tidak melulu soal "milik", bisa juga kategori/asal.'
    },
    {
        id: 'mo',
        char: 'も',
        romaji: 'mo',
        fungsi: 'Juga (Also/Too)',
        rumus: '[Kata Benda] + も + [Predikat]',
        contoh: [
            { jp: '<ruby>私<rt>わたし</rt></ruby> も <ruby>学生<rt>がくせい</rt></ruby> です。', id: 'Saya juga seorang pelajar.' },
            { jp: '<ruby>昨日<rt>きのう</rt></ruby> も <ruby>働<rt>はたら</rt></ruby>きました。', id: 'Kemarin saya juga bekerja.' }
        ],
        catatan: 'Partikel も selalu menggantikan partikel は, が, atau を. Tapi untuk partikel lain (seperti に/で), も ditambahkan setelahnya (misal: にも, でも).',
        salah: 'Jangan menggabungkan は dan も menjadi はも.'
    },
    {
        id: 'to',
        char: 'と',
        romaji: 'to',
        fungsi: 'Dan / Bersama dengan (Daftar lengkap)',
        rumus: '[Benda 1] + と + [Benda 2] / [Orang] + と + [Aksi]',
        contoh: [
            { jp: 'パン と <ruby>牛乳<rt>ぎゅうにゅう</rt></ruby> を <ruby>買<rt>か</rt></ruby>います。', id: 'Saya membeli roti dan susu. (Daftar)' },
            { jp: '<ruby>友達<rt>ともだち</rt></ruby> と <ruby>映画<rt>えいが</rt></ruby> を <ruby>見<rt>み</rt></ruby>ます。', id: 'Saya menonton film bersama teman.' }
        ],
        catatan: 'Jika digunakan sebagai "dan", itu menyiratkan hanya barang-barang tersebut yang dibicarakan (daftar tertutup).',
        salah: 'Jangan pakai と untuk menyambung klausa/kalimat. と hanya menyambung Kata Benda.'
    },
    {
        id: 'ya',
        char: 'や',
        romaji: 'ya',
        fungsi: 'Dan / Seperti (Daftar tidak lengkap)',
        rumus: '[Benda 1] + や + [Benda 2]',
        contoh: [
            { jp: 'パン や <ruby>牛乳<rt>ぎゅうにゅう</rt></ruby> を <ruby>買<rt>か</rt></ruby>います。', id: 'Saya membeli (hal-hal seperti) roti dan susu.' }
        ],
        catatan: 'Mengisyaratkan masih ada barang lain yang dibeli selain roti dan susu.',
        salah: 'Jangan pakai や jika kamu sudah menyebutkan seluruh barangnya.'
    },
    {
        id: 'kara',
        char: 'から',
        romaji: 'kara',
        fungsi: 'Dari / Karena',
        rumus: '[Titik Awal Waktu/Tempat] + から',
        contoh: [
            { jp: '<ruby>家<rt>いえ</rt></ruby> から <ruby>来<rt>き</rt></ruby>ました。', id: 'Saya datang dari rumah.' },
            { jp: '<ruby>九時<rt>くじ</rt></ruby> から <ruby>始<rt>はじ</rt></ruby>まります。', id: 'Akan dimulai dari jam 9.' }
        ],
        catatan: 'Menunjukkan titik mula dari sebuah lokasi, waktu, atau urutan.',
        salah: 'Jika digunakan sebagai "karena", diletakkan di AKHIR klausa.'
    },
    {
        id: 'made',
        char: 'まで',
        romaji: 'made',
        fungsi: 'Sampai / Hingga',
        rumus: '[Titik Akhir Waktu/Tempat] + まで',
        contoh: [
            { jp: '<ruby>学校<rt>がっこう</rt></ruby> まで <ruby>行<rt>い</rt></ruby>きます。', id: 'Saya pergi sampai sekolah.' },
            { jp: '<ruby>九時<rt>くじ</rt></ruby> から <ruby>五時<rt>ごじ</rt></ruby> まで <ruby>働<rt>はたら</rt></ruby>きます。', id: 'Saya bekerja dari jam 9 sampai jam 5.' }
        ],
        catatan: 'Menunjukkan titik purna atau batas akhir.',
        salah: 'Sering dipakai berpasangan dengan から, namun bisa juga berdiri sendiri.'
    },
    {
        id: 'ka',
        char: 'か',
        romaji: 'ka',
        fungsi: 'Penanda Pertanyaan / Atau',
        rumus: '[Kalimat] + か / [Benda A] か [Benda B]',
        contoh: [
            { jp: 'これは <ruby>何<rt>なん</rt></ruby> です か。', id: 'Ini apa?' },
            { jp: '<ruby>明日<rt>あした</rt></ruby> か <ruby>明後日<rt>あさって</rt></ruby>。', id: 'Besok atau lusa.' }
        ],
        catatan: 'Diletakkan di akhir kalimat untuk menjadikannya pertanyaan (mirip tanda tanya).',
        salah: 'Dalam bahasa Jepang formal tertulis, jarang memakai tanda baca "?" bila sudah ada か.'
    },
    {
        id: 'yo',
        char: 'よ',
        romaji: 'yo',
        fungsi: 'Penekanan / Memberi tahu info baru',
        rumus: '[Kalimat] + よ',
        contoh: [
            { jp: '<ruby>美味<rt>おい</rt></ruby>しい です よ。', id: 'Ini enak lho (saya beri tahu ya).' },
            { jp: 'ここに あります よ。', id: 'Ada di sini lho.' }
        ],
        catatan: 'Digunakan saat pembicara tahu sesuatu yang diasumsikan belum diketahui pendengar.',
        salah: 'Jangan terlalu sering dipakai terus-menerus karena bisa terdengar menggurui atau agresif.'
    },
    {
        id: 'ne',
        char: 'ね',
        romaji: 'ne',
        fungsi: 'Meminta persetujuan / Konfirmasi',
        rumus: '[Kalimat] + ね',
        contoh: [
            { jp: '<ruby>美味<rt>おい</rt></ruby>しい です ね。', id: 'Ini enak ya (kan?).' },
            { jp: '<ruby>明日<rt>あした</rt></ruby> は <ruby>休<rt>やす</rt></ruby>み です ね。', id: 'Besok libur, kan?' }
        ],
        catatan: 'Digunakan saat pembicara mengharapkan pendengar setuju dengannya, atau sekadar pelembut kalimat.',
        salah: 'Berbeda dengan よ, ね berasumsi pendengar memiliki pemahaman/pengalaman yang sama.'
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

        let charClass = p.char.length > 1 ? 'text-xl' : 'text-3xl';
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <div class="card-icon w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center font-jp ${charClass} font-bold transition-all duration-300 group-hover:bg-purple-500/20 group-hover:text-purple-400 border border-white/5 group-hover:border-purple-500/30 ${isCompleted ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}">
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
            <div class="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center font-jp ${p.char.length > 1 ? 'text-2xl' : 'text-4xl'} font-bold text-purple-400 border border-purple-500/30">
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
                <p class="text-xs text-neutral-500 uppercase tracking-wider mb-2">Contoh Kalimat</p>
                <div class="space-y-3">
                    ${p.contoh.map(c => `
                        <div class="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                            <p class="text-xl font-jp text-white mb-2 leading-relaxed tracking-wide">${c.jp.replace(p.char, `<span class="text-purple-400 font-bold">${p.char}</span>`)}</p>
                            <p class="text-sm text-neutral-400">${c.id}</p>
                        </div>
                    `).join('')}
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
let ujianHistory = [];

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
    ujianHistory = [];

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
            <p class="text-sm text-neutral-400 mt-2"><i data-lucide="languages" class="w-4 h-4 inline mr-1"></i> ${q.terjemahan || 'Arti kalimat di atas.'}</p>
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
    opts.forEach(opt => opt.disabled = true);

    ujianMaxScore += 10;
    let isCorrect = (selectedIdx === q.jawaban);

    if (isCorrect) {
        opts[selectedIdx].classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
        ujianScore += 10;
    } else {
        opts[selectedIdx].classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
    }

    let userAnswerText = q.options[selectedIdx].substring(3); // Remove A.
    let correctAnswerText = q.options[q.jawaban].substring(3);

    ujianHistory.push({
        soal: q.soal,
        terjemahan: q.terjemahan,
        jawabanUser: userAnswerText,
        jawabanBenar: correctAnswerText,
        isCorrect: isCorrect,
        penjelasan: q.penjelasan
    });

    setTimeout(nextUjian, 600);
}

function answerUjianEssay() {
    const q = ujianData[currentUjianIndex];
    let isCorrect = true;
    ujianMaxScore += 10;
    let userAnswers = [];

    if (Array.isArray(q.jawaban)) {
        q.jawaban.forEach((ans, idx) => {
            const input = document.getElementById('ujianEssayInput_' + idx);
            if (!input) return;
            let val = input.value.trim();
            userAnswers.push(val || '-');
            if (val !== ans) {
                isCorrect = false;
                input.classList.add('border-rose-500', 'text-rose-400');
            } else {
                input.classList.add('border-emerald-500', 'text-emerald-400');
            }
            input.disabled = true;
        });
    } else {
        const input = document.getElementById('ujianEssayInput');
        let val = input ? input.value.trim() : '';
        userAnswers.push(val || '-');
        if (val !== q.jawaban) {
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
    }

    let correctAnswerText = Array.isArray(q.jawaban) ? q.jawaban.join(' dan ') : q.jawaban;

    ujianHistory.push({
        soal: q.soal,
        terjemahan: q.terjemahan,
        jawabanUser: userAnswers.join(' dan '),
        jawabanBenar: correctAnswerText,
        isCorrect: isCorrect,
        penjelasan: q.penjelasan
    });

    setTimeout(nextUjian, 600);
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

    let reviewHtml = '';
    ujianHistory.forEach((item, idx) => {
        let statusIcon = item.isCorrect
            ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400 mt-1 shrink-0"></i>'
            : '<i data-lucide="x-circle" class="w-5 h-5 text-rose-400 mt-1 shrink-0"></i>';

        let userAnsClass = item.isCorrect ? 'text-emerald-400' : 'text-rose-400 line-through';
        let correctAnsHtml = item.isCorrect ? '' : `<span class="text-emerald-400 ml-2 font-bold">${item.jawabanBenar}</span>`;

        reviewHtml += `
            <div class="bg-dark-900/50 p-5 rounded-2xl border border-white/5 mb-4 text-left">
                <div class="flex gap-3">
                    ${statusIcon}
                    <div class="flex-1">
                        <p class="text-lg font-bold font-jp text-white leading-relaxed mb-1">${idx + 1}. ${item.soal}</p>
                        <p class="text-xs text-neutral-500 mb-3">${item.terjemahan || ''}</p>

                        <div class="bg-white/5 rounded-lg p-3 mb-3 border border-white/5">
                            <span class="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Jawaban Kamu:</span>
                            <span class="${userAnsClass} font-bold">${item.jawabanUser}</span> ${correctAnsHtml}
                        </div>

                        <div class="text-sm text-neutral-300">
                            <strong class="text-white">Penjelasan:</strong> ${item.penjelasan}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-32 h-32 rounded-full ${bgColor} flex items-center justify-center border-4 ${borderColor} mx-auto mb-6">
                <span class="text-4xl font-bold ${color}">${percentage}</span>
            </div>
            <h3 class="text-3xl font-bold mb-2">Sertifikasi Selesai</h3>
            <p class="text-neutral-400 mb-8">${msg}</p>
            <button class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition mb-12" onclick="startUjian()">Ulangi Ujian JLPT</button>

            <div class="border-t border-white/10 pt-8 mt-4">
                <h4 class="text-xl font-bold mb-6 text-left flex items-center gap-2"><i data-lucide="book-open" class="w-5 h-5 text-orange-400"></i> Review Jawaban & Penjelasan Lengkap</h4>
                ${reviewHtml}
            </div>
        </div>
    `;

    lucide.createIcons();
    showToast('JLPT Selesai', `Skor akhir: ${percentage}`);
}
