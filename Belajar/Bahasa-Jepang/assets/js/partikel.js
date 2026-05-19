function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// =====================================
// PROCEDURAL QUESTION GENERATOR
// =====================================
// Kita siapkan kamus lokal fallback (Full Kana) agar aman tanpa kanji.
const dictionary = {
    orang: [
        { kana: 'わたし', id: 'Saya', emoji: '🧑' },
        { kana: 'あなた', id: 'Kamu', emoji: '🫵' },
        { kana: 'ともだち', id: 'Teman', emoji: '🤝' },
        { kana: 'せんせい', id: 'Guru', emoji: '👨‍🏫' },
        { kana: 'がくせい', id: 'Pelajar', emoji: '🎒' },
        { kana: 'ねこ', id: 'Kucing', emoji: '🐱' },
        { kana: 'いぬ', id: 'Anjing', emoji: '🐶' }
    ],
    benda: [
        { kana: 'みず', id: 'Air', emoji: '💧' },
        { kana: 'パン', id: 'Roti', emoji: '🍞' },
        { kana: 'りんご', id: 'Apel', emoji: '🍎' },
        { kana: 'ほん', id: 'Buku', emoji: '📖' },
        { kana: 'てがみ', id: 'Surat', emoji: '✉️' },
        { kana: 'くるま', id: 'Mobil', emoji: '🚗' },
        { kana: 'えんぴつ', id: 'Pensil', emoji: '✏️' }
    ],
    tempat: [
        { kana: 'がっこう', id: 'Sekolah', emoji: '🏫' },
        { kana: 'へや', id: 'Kamar', emoji: '🚪' },
        { kana: 'うち', id: 'Rumah', emoji: '🏠' },
        { kana: 'えき', id: 'Stasiun', emoji: '🚉' },
        { kana: 'こうえん', id: 'Taman', emoji: '🏞️' },
        { kana: 'スーパー', id: 'Supermarket', emoji: '🛒' }
    ],
    waktu: [
        { kana: 'あした', id: 'Besok', emoji: '⏭️' },
        { kana: 'きのう', id: 'Kemarin', emoji: '⏮️' },
        { kana: 'きょう', id: 'Hari ini', emoji: '⏬' },
        { kana: 'あさ', id: 'Pagi', emoji: '🌅' },
        { kana: 'よる', id: 'Malam', emoji: '🌃' }
    ],
    verbTrans: [
        { kana: 'のみます', id: 'minum', particle: 'を', emoji: '🥤' },
        { kana: 'たべます', id: 'makan', particle: 'を', emoji: '🍽️' },
        { kana: 'よみます', id: 'membaca', particle: 'を', emoji: '👀' },
        { kana: 'かいます', id: 'membeli', particle: 'を', emoji: '🛍️' },
        { kana: 'かきます', id: 'menulis', particle: 'を', emoji: '✍️' }
    ],
    verbGerak: [
        { kana: 'いきます', id: 'pergi', particle: 'へ', emoji: '🚶' }, // Atau ni
        { kana: 'きます', id: 'datang', particle: 'へ', emoji: '🏃' },
        { kana: 'かえります', id: 'pulang', particle: 'へ', emoji: '↩️' }
    ],
    verbAda: [
        { kana: 'あります', id: 'ada (benda mati)', particle: 'が', emoji: '📦' },
        { kana: 'います', id: 'ada (hidup)', particle: 'が', emoji: '🧍' }
    ]
};

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestions(amount) {
    let generated = [];
    const patterns = [
        // Pola 1: [Orang] は [Benda] を [KataKerja Transitif]
        () => {
            let orang = getRandomItem(dictionary.orang);
            let benda = getRandomItem(dictionary.benda);
            let verb = getRandomItem(dictionary.verbTrans);
            let p1 = Math.random() > 0.5 ? 'は' : 'が';
            let emojiStr = `${orang.emoji} 💭 ${benda.emoji} ${verb.emoji}`;

            // Randomly blank out one of the particles
            if (Math.random() > 0.5) {
                return {
                    type: "mcq",
                    emoji: emojiStr,
                    soal: `${orang.kana} ___ ${benda.kana} ${verb.particle} ${verb.kana}。`,
                    terjemahan: `${orang.id} ${verb.id} ${benda.id}.`,
                    options: [`A. ${p1}`, `B. に`, `C. で`, `D. へ`],
                    jawaban: 0,
                    penjelasan: `${p1} menandai subjek/topik pelakunya.`,
                    hint: `Petunjuk: Siapa yang melakukan aksi?`
                };
            } else {
                return {
                    type: "essay",
                    emoji: emojiStr,
                    soal: `${orang.kana} ${p1} ${benda.kana} ___ ${verb.kana}。`,
                    terjemahan: `${orang.id} ${verb.id} ${benda.id}.`,
                    jawaban: verb.particle,
                    penjelasan: `${verb.particle} menandai objek langsung yang dikenai pekerjaan.`,
                    hint: `Petunjuk: Partikel objek langsung.`
                };
            }
        },
        // Pola 2: [Tempat] に [Benda/Orang] が あります/います
        () => {
            let tempat = getRandomItem(dictionary.tempat);
            let isHidup = Math.random() > 0.5;
            let subjek = isHidup ? getRandomItem(dictionary.orang) : getRandomItem(dictionary.benda);
            let verb = isHidup ? dictionary.verbAda[1] : dictionary.verbAda[0];
            let emojiStr = `${tempat.emoji} 📍 ${subjek.emoji} ${verb.emoji}`;

            if (Math.random() > 0.5) {
                return {
                    type: "mcq",
                    emoji: emojiStr,
                    soal: `${tempat.kana} ___ ${subjek.kana} が ${verb.kana}。`,
                    terjemahan: `Di ${tempat.id.toLowerCase()} ada ${subjek.id.toLowerCase()}.`,
                    options: ["A. で", "B. に", "C. を", "D. へ"],
                    jawaban: 1,
                    penjelasan: `に menandai lokasi tempat sesuatu berada (statis).`,
                    hint: `Petunjuk: Menandai tempat menetap/berada.`
                };
            } else {
                return {
                    type: "essay",
                    emoji: emojiStr,
                    soal: `${tempat.kana} に ${subjek.kana} ___ ${verb.kana}。`,
                    terjemahan: `Di ${tempat.id.toLowerCase()} ada ${subjek.id.toLowerCase()}.`,
                    jawaban: "が",
                    penjelasan: `が menandai subjek yang ada/berada di tempat tersebut.`,
                    hint: `Petunjuk: Pasangan kata kerja keberadaan.`
                };
            }
        },
        // Pola 3: [Tempat] で [Benda] を [KataKerja]
        () => {
            let tempat = getRandomItem(dictionary.tempat);
            let benda = getRandomItem(dictionary.benda);
            let verb = getRandomItem(dictionary.verbTrans);
            let emojiStr = `${tempat.emoji} 🛠️ ${benda.emoji} ${verb.emoji}`;

            return {
                type: "mcq",
                emoji: emojiStr,
                soal: `${tempat.kana} ___ ${benda.kana} を ${verb.kana}。`,
                terjemahan: `${verb.id.charAt(0).toUpperCase() + verb.id.slice(1)} ${benda.id.toLowerCase()} di ${tempat.id.toLowerCase()}.`,
                options: ["A. に", "B. で", "C. は", "D. も"],
                jawaban: 1,
                penjelasan: `で menandai tempat dimana aktivitas dinamis dilakukan.`,
                hint: `Petunjuk: Menandai tempat dilakukannya sebuah aksi.`
            };
        },
        // Pola 4: [Waktu] に [Tempat] へ [KataKerja Gerak]
        () => {
            let waktu = getRandomItem(dictionary.waktu);
            let tempat = getRandomItem(dictionary.tempat);
            let verb = getRandomItem(dictionary.verbGerak);
            let emojiStr = `${waktu.emoji} ⏳ ${tempat.emoji} ${verb.emoji}`;

            return {
                type: "essay",
                emoji: emojiStr,
                soal: `${waktu.kana}、 ${tempat.kana} ___ ${verb.kana}。`,
                terjemahan: `${waktu.id}, ${verb.id} ke ${tempat.id.toLowerCase()}.`,
                jawaban: verb.particle,
                penjelasan: `${verb.particle} menandai arah atau tujuan perpindahan.`,
                hint: `Petunjuk: Penanda arah tujuan perpindahan.`
            };
        },
        // Pola 5: [Benda] と [Benda]
        () => {
            let b1 = getRandomItem(dictionary.benda);
            let b2 = getRandomItem(dictionary.benda);
            while (b1.kana === b2.kana) b2 = getRandomItem(dictionary.benda);
            let emojiStr = `${b1.emoji} ➕ ${b2.emoji} 🛍️`;

            return {
                type: "mcq",
                emoji: emojiStr,
                soal: `${b1.kana} ___ ${b2.kana} を かいます。`,
                terjemahan: `Membeli ${b1.id.toLowerCase()} dan ${b2.id.toLowerCase()}.`,
                options: ["A. と", "B. や", "C. も", "D. で"],
                jawaban: 0,
                penjelasan: `と digunakan untuk merangkai daftar lengkap benda (dan).`,
                hint: `Petunjuk: Menghubungkan 2 benda (dan).`
            };
        }
    ];

    for (let i = 0; i < amount; i++) {
        let patternFunc = getRandomItem(patterns);
        let q = patternFunc();
        // If it's an MCQ, randomize options
        if (q.type === 'mcq') {
            let correctOpt = q.options[q.jawaban];
            let rawOptions = q.options.map(o => o.substring(3)); // Remove A., B.
            // Shuffle
            for (let j = rawOptions.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [rawOptions[j], rawOptions[k]] = [rawOptions[k], rawOptions[j]];
            }
            // Re-assign A B C D and find new jawban index
            q.options = rawOptions.map((o, idx) => `${String.fromCharCode(65 + idx)}. ${o}`);
            let targetLetter = correctOpt.substring(0,1);
            let targetVal = correctOpt.substring(3);
            q.jawaban = q.options.findIndex(o => o.substring(3) === targetVal);
        }
        generated.push(q);
    }
    return generated;
}

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
        perbandingan: '<b>Kapan pakai は vs が?</b><br>Gunakan <b>は</b> saat membicarakan topik secara umum, atau membandingkan dua hal (misal: Anjing saya suka, tapi Kucing saya tidak suka).', catatan: 'Dibaca "wa", bukan "ha". Menandakan "kalau tentang...". Menunjukkan hal yang sudah diketahui oleh pembicara dan pendengar.',
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
        perbandingan: '<b>Kapan pakai が vs は?</b><br>Gunakan <b>が</b> saat memperkenalkan informasi baru untuk pertama kalinya, menjawab pertanyaan kata tanya (Siapa yang pergi? -> <i>Saya が</i>), atau hal yang melekat otomatis pada suatu benda mati (Hujan <i>が</i> turun).', catatan: 'Menandai siapa/apa yang melakukan aksi. Sangat sering dipakai dengan kata kerja あります (ada benda mati) dan います (ada mahluk hidup).',
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
        perbandingan: '<b>Kapan pakai に vs で?</b><br>Gunakan <b>に</b> jika subjeknya <i>diam/menetap</i> di tempat tersebut (ada, tinggal, bermalam).', catatan: 'Berfungsi seperti paku yang menancap pada satu titik (waktu tertentu, tempat berada yang tidak bergerak).',
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
        perbandingan: '<b>Kapan pakai で vs に?</b><br>Gunakan <b>で</b> jika ada sebuah <i>aktivitas yang dinamis/aksi</i> yang dilakukan di tempat tersebut (makan, belajar, bermain).', catatan: 'Menunjukkan "di mana" sebuah aktivitas dilakukan, atau "dengan cara/alat apa" sebuah aksi dilakukan.',
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
        perbandingan: '<b>Kapan pakai へ vs に?</b><br>Keduanya bisa dipakai untuk tempat tujuan. Namun, <b>へ</b> menekankan <i>arah perjalanannya</i> (menuju ke), sedangkan <b>に</b> menekankan <i>titik akhir pendaratannya</i>.', catatan: 'Dibaca "e". Secara fungsional mirip dengan に untuk tujuan tempat, tapi へ lebih menekankan "arah perjalanannya" daripada "titik tujuannya".',
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
        perbandingan: '<b>Kapan pakai と vs や?</b><br>Gunakan <b>と</b> jika kamu mendaftar <i>semua</i> benda tanpa ada sisa.', catatan: 'Jika digunakan sebagai "dan", itu menyiratkan hanya barang-barang tersebut yang dibicarakan (daftar tertutup).',
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
        perbandingan: '<b>Kapan pakai や vs と?</b><br>Gunakan <b>や</b> jika kamu hanya memberi contoh 1-2 benda, dan mengisyaratkan bahwa <i>masih ada barang lain</i> yang serupa yang tidak disebutkan.', catatan: 'Mengisyaratkan masih ada barang lain yang dibeli selain roti dan susu.',
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
        perbandingan: '<b>Kapan pakai よ vs ね?</b><br>Gunakan <b>よ</b> jika lawan bicaramu <i>tidak tahu</i> informasi tersebut, dan kamu ingin memberitahukannya.', catatan: 'Digunakan saat pembicara tahu sesuatu yang diasumsikan belum diketahui pendengar.',
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
        perbandingan: '<b>Kapan pakai ね vs よ?</b><br>Gunakan <b>ね</b> jika kamu yakin bahwa lawan bicaramu <i>juga memiliki pemikiran yang sama</i> atau mengetahui hal yang sama, sehingga kamu hanya sekedar mengkonfirmasinya.', catatan: 'Digunakan saat pembicara mengharapkan pendengar setuju dengannya, atau sekadar pelembut kalimat.',
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
    let totalItems = 15 /* dasar */ + 2 /* kontras */ + 3 /* latihan, puzzle, ujian */;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    localStorage.setItem('gy_jp_particle_progress', percentage);
    updateUIProgress();
}

// Update UI based on progress
function updateUIProgress() {
    let totalItems = 15 + 2 + 3;
    let completed = userProgress.partikelSelesai.length + userProgress.kontrasSelesai.length + (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0);
    let percentage = Math.round((completed / totalItems) * 100);

    document.getElementById('totalProgressText').innerText = percentage + '%';
    document.getElementById('totalProgressBar').style.width = percentage + '%';

    document.getElementById('progDasar').innerText = userProgress.partikelSelesai.length + '/15';
    document.getElementById('progKontras').innerText = userProgress.kontrasSelesai.length + '/2';

    let progQuiz = document.getElementById('progQuiz');
    if (progQuiz) {
        let qCount = (userProgress.latihanSelesai ? 1 : 0) + (userProgress.puzzleSelesai ? 1 : 0) + (userProgress.quizSelesai ? 1 : 0);
        progQuiz.innerText = qCount + '/3';
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
            btn.classList.add('bg-green-500/20');
            btn.classList.add('text-green-400');
            btn.innerHTML = `> git push origin main <i data-lucide="check" class="w-4 h-4 inline ml-1"></i>`;
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
        <!-- Fake Window/IDE Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div class="text-xs font-mono text-neutral-500">particle_${p.id}.ts</div>
            <div class="w-16"></div> <!-- Spacer for balance -->
        </div>

        <!-- Scrollable Content Area with max height -->
        <div class="overflow-y-auto max-h-[60vh] md:max-h-[65vh] pr-2 custom-scrollbar space-y-6">

            <!-- Section 1: Declaration -->
            <div>
                <p class="text-xs font-mono text-purple-400 mb-2">// 1. Initialize Particle</p>
                <div class="flex items-center gap-5 bg-dark-900/80 p-4 rounded-xl border border-white/5">
                    <div class="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center font-jp text-4xl font-bold text-purple-400 border border-purple-500/30 shrink-0">
                        ${p.char}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white mb-1"><span class="text-purple-400">const</span> <span class="text-yellow-200">partikel</span> = '${p.char}';</h3>
                        <p class="text-sm text-neutral-400 font-mono">readAs: <span class="text-emerald-300">"${p.romaji}"</span></p>
                    </div>
                </div>
            </div>

            <!-- Section 2: Function & Formula -->
            <div>
                <p class="text-xs font-mono text-blue-400 mb-2">// 2. Syntax Definition</p>
                <div class="bg-dark-900/80 p-4 rounded-xl border border-white/5 font-mono text-sm">
                    <p class="text-neutral-400 mb-1">/** ${p.fungsi} */</p>
                    <p class="text-blue-300 leading-relaxed">${p.rumus.replace(/\[(.*?)\]/g, '<span class="text-yellow-200">[$1]</span>')}</p>
                </div>
            </div>

            <!-- Section 3: Execution / Examples -->
            <div>
                <p class="text-xs font-mono text-emerald-400 mb-2">// 3. Execution Examples</p>
                <div class="space-y-3">
                    ${p.contoh.map(c => `
                        <div class="bg-dark-900/80 p-4 rounded-xl border border-white/5">
                            <p class="text-lg font-jp text-white mb-2 leading-relaxed tracking-wide">${c.jp.replace(p.char, `<span class="text-purple-400 font-bold bg-purple-500/10 px-1 rounded">${p.char}</span>`)}</p>
                            <p class="text-xs font-mono text-emerald-400/80 border-t border-white/5 pt-2 mt-2">> ${c.id}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Section 4: Debug & Logs -->
            <div>
                <p class="text-xs font-mono text-orange-400 mb-2">// 4. Logs & Warnings</p>
                <div class="space-y-3">
                    ${p.perbandingan ? `
                    <div class="bg-blue-900/20 border-l-2 border-blue-400 p-4 text-sm font-mono">
                        <p class="text-blue-300 mb-2">[INFO] diff_check()</p>
                        <p class="text-blue-100/80 leading-relaxed">${p.perbandingan.replace(/<b>/g, '<span class="text-blue-300 font-bold">').replace(/<\/b>/g, '</span>').replace(/<i>/g, '<span class="italic">').replace(/<\/i>/g, '</span>')}</p>
                    </div>
                    ` : ''}

                    <div class="bg-orange-900/20 border-l-2 border-orange-400 p-4 text-sm font-mono">
                        <p class="text-orange-300 mb-2">[WARN] common_mistakes()</p>
                        <p class="text-orange-100/80 mb-2 leading-relaxed">${p.catatan}</p>
                        <p class="text-rose-300/80 text-xs mt-2 pt-2 border-t border-rose-500/20">Error: ${p.salah}</p>
                    </div>
                </div>
            </div>

        </div>

        <!-- Sticky Bottom Button -->
        <div class="mt-6 pt-4 border-t border-white/10">
            <button class="w-full py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-mono font-bold rounded-xl transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2" onclick="markPartikelSelesai('${p.id}')">
                <i data-lucide="terminal" class="w-5 h-5"></i> compile_and_mark_done()
            </button>
        </div>
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
    ujianData = generateQuestions(20);

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

    let emojiDisplayHtml = '';
    if (q.emoji) {
        emojiDisplayHtml = `<div class="text-center text-4xl mb-4">${q.emoji}</div>`;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-neutral-400 font-bold uppercase tracking-wider">
            <span class="text-orange-400">Soal Ujian ${currentUjianIndex + 1} / ${ujianData.length}</span>
            <span>Tipe: ${q.type === 'mcq' ? 'Pilihan Ganda' : 'Essai (Wanakana)'}</span>
        </div>
        <div class="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 relative">
            ${emojiDisplayHtml}
            <h3 class="text-2xl font-bold font-jp leading-relaxed text-center">${q.soal}</h3>
            <p class="text-sm text-neutral-400 mt-4 text-center"><i data-lucide="languages" class="w-4 h-4 inline mr-1"></i> ${q.terjemahan || 'Arti kalimat di atas.'}</p>
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
                            <span class="${userAnsClass} font-bold">${escapeHtml(item.jawabanUser)}</span> ${correctAnsHtml}
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

// =====================================
// LATIHAN MODE
// =====================================
let currentLatihanIndex = 0;
let latihanScore = 0;
let latihanData = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnStartLatihan = document.getElementById('btnStartLatihan');
    if(btnStartLatihan) {
        btnStartLatihan.addEventListener('click', startLatihan);
    }
});

function startLatihan() {
    currentLatihanIndex = 0;
    latihanScore = 0;

    // Ambil 5 soal acak dari bank ujian untuk latihan
    latihanData = generateQuestions(10);

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
            optionsHtml += `<button class="latihan-option w-full text-left p-4 rounded-xl border border-white/10 bg-dark-900 hover:bg-white/5 font-medium mb-3 transition" onclick="answerLatihanMcq(${idx})">${opt}</button>`;
        });
        contentHtml = `
            <div class="options-container" id="latihanOptions">
                ${optionsHtml}
            </div>
        `;
    } else if (q.type === 'essay') {
        let inputHtml = '';
        if (Array.isArray(q.jawaban)) {
            q.jawaban.forEach((_, idx) => {
                 inputHtml += `<input type="text" id="latihanEssayInput_${idx}" class="latihan-essay-input w-24 bg-dark-900 border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="partikel">`;
            });
        } else {
             inputHtml = `<input type="text" id="latihanEssayInput" class="latihan-essay-input w-32 bg-dark-900 border border-white/20 rounded-lg p-3 text-center text-xl font-jp mx-auto block focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500" placeholder="ketik romaji...">`;
        }

        contentHtml = `
            <div class="py-6 text-center">
                <div class="flex items-center justify-center flex-wrap mb-6">
                    ${inputHtml}
                </div>
                <button class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition shadow-lg shadow-purple-500/20" onclick="answerLatihanEssay()">Kirim Jawaban</button>
            </div>
        `;
    }

    let emojiDisplayHtml = '';
    if (q.emoji) {
        emojiDisplayHtml = `<div class="text-center text-4xl mb-4">${q.emoji}</div>`;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-neutral-400 font-bold uppercase tracking-wider">
            <span class="text-purple-400">Soal Latihan ${currentLatihanIndex + 1} / ${latihanData.length}</span>
            <button onclick="toggleHint()" class="text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded flex items-center gap-1 transition">
                <i data-lucide="lightbulb" class="w-4 h-4"></i> Hint
            </button>
        </div>

        <div id="latihanHint" class="hidden mb-4 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-200/90 text-sm">
            <i data-lucide="info" class="w-4 h-4 inline mr-1"></i> ${q.hint || 'Tidak ada petunjuk spesifik.'}
        </div>

        <div class="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6 relative">
            ${emojiDisplayHtml}
            <h3 class="text-2xl font-bold font-jp leading-relaxed text-center">${q.soal}</h3>
            <p class="text-sm text-neutral-400 mt-4 text-center"><i data-lucide="languages" class="w-4 h-4 inline mr-1"></i> ${q.terjemahan || 'Arti kalimat di atas.'}</p>
        </div>
        ${contentHtml}
        <div id="latihanFeedback" class="hidden mt-6 p-4 rounded-xl text-sm border"></div>
        <button id="btnNextLatihan" class="hidden mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="nextLatihan()">Soal Selanjutnya</button>
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
        opts[selectedIdx].classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
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
                input.classList.add('border-rose-500', 'text-rose-400');
            } else {
                input.classList.add('border-emerald-500', 'text-emerald-400');
            }
            input.disabled = true;
        });
    } else {
        const input = document.getElementById('latihanEssayInput');
        let val = input ? input.value.trim() : '';
        if (val !== q.jawaban) {
            isCorrect = false;
            if(input) input.classList.add('border-rose-500', 'text-rose-400');
        } else {
            if(input) input.classList.add('border-emerald-500', 'text-emerald-400');
        }
        if(input) input.disabled = true;
    }

    const btnSubmit = document.querySelector('.latihan-essay-input').parentElement.nextElementSibling;
    if (btnSubmit) btnSubmit.classList.add('hidden');

    if (isCorrect) {
        latihanScore += 20;
        showLatihanFeedback(true, q.penjelasan);
    } else {
        let correctAnswerText = Array.isArray(q.jawaban) ? q.jawaban.join(' dan ') : q.jawaban;
        showLatihanFeedback(false, `Jawaban benar: <strong>${correctAnswerText}</strong>. <br>${q.penjelasan}`);
    }
}

function showLatihanFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('latihanFeedback');
    const btnNext = document.getElementById('btnNextLatihan');

    if (isCorrect) {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 block";
        feedback.innerHTML = `<strong>Benar!</strong> ${explanation}`;
    } else {
        feedback.className = "mt-6 p-4 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-200 block";
        feedback.innerHTML = `<strong>Salah.</strong> ${explanation}`;
    }

    btnNext.classList.remove('hidden');
    if (currentLatihanIndex === latihanData.length - 1) {
        btnNext.innerText = "Selesaikan Latihan";
    }
}

function nextLatihan() {
    currentLatihanIndex++;
    renderLatihan();
}

function showLatihanResult() {
    const container = document.getElementById('latihanContainer');

    // Save completion to localstorage (treat it as part of the quiz progress fraction)
    if (!userProgress.latihanSelesai && latihanScore >= 80) {
        userProgress.latihanSelesai = true;
        saveProgress();
    }

    let msg = latihanScore >= 80 ? 'Bagus! Pemanasan yang sangat baik.' : 'Tetap semangat! Gunakan tombol Hint jika masih kesulitan.';

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500 mx-auto mb-6">
                <span class="text-3xl font-bold text-white">${latihanScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Latihan Selesai!</h3>
            <p class="text-neutral-400 mb-8">${msg}</p>
            <button class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="startLatihan()">Ulangi Latihan</button>
        </div>
    `;

    showToast('Latihan Selesai', `Skor pemanasanmu: ${latihanScore}/100.`);
}
// =====================================


// =====================================
// GAME PUZZLE MODE
// =====================================
const puzzleBank = [
    {
        bg: "from-blue-500/20 to-purple-500/20",
        emoji: "✈️ 🇯🇵",
        kalimat: ["にほん", "SLOT", "いきます。"],
        pilihan: ["へ", "を", "が", "で"],
        jawaban: "へ",
        terjemahan: "Saya pergi ke Jepang."
    },
    {
        bg: "from-emerald-500/20 to-teal-500/20",
        emoji: "🚉 🚃",
        kalimat: ["えき", "SLOT", "でんしゃ に のります。"],
        pilihan: ["に", "で", "を", "は"],
        jawaban: "で",
        terjemahan: "Naik kereta di stasiun."
    },
    {
        bg: "from-cyan-500/20 to-blue-500/20",
        emoji: "🌧️ ☔",
        kalimat: ["あめ", "SLOT", "ふります。"],
        pilihan: ["が", "を", "で", "に"],
        jawaban: "が",
        terjemahan: "Hujan turun."
    },
    {
        bg: "from-orange-500/20 to-red-500/20",
        emoji: "🍿 🎬",
        kalimat: ["ともだち", "SLOT", "えいが を みます。"],
        pilihan: ["と", "や", "も", "へ"],
        jawaban: "と",
        terjemahan: "Menonton film bersama teman."
    },
    {
        bg: "from-yellow-500/20 to-orange-500/20",
        emoji: "🍜 🥢",
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
            kalimatHtml += `<div class="puzzle-slot w-16 h-14 bg-dark-900 border-2 border-dashed border-cyan-500/50 rounded-xl flex items-center justify-center mx-2 text-2xl font-bold font-jp text-cyan-300 transition-all duration-300" id="puzzleTarget">?</div>`;
        } else {
            kalimatHtml += `<span class="text-2xl font-jp text-white font-medium">${part}</span>`;
        }
    });

    let optionsHtml = '';
    let shuffledOptions = shuffleArray([...pz.pilihan]);
    shuffledOptions.forEach(opt => {
        optionsHtml += `<button class="puzzle-piece w-16 h-14 bg-dark-800 border border-white/10 rounded-xl shadow-lg hover:border-cyan-400 hover:bg-cyan-500/10 text-2xl font-bold font-jp text-white transition-all transform hover:-translate-y-1" onclick="selectPuzzlePiece('${opt}', this)">${opt}</button>`;
    });

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6 text-sm text-neutral-400 font-bold uppercase tracking-wider">
            <span class="text-cyan-400">Puzzle ${currentPuzzleIndex + 1} / ${activePuzzleData.length}</span>
        </div>

        <div class="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 border border-white/10 group bg-gradient-to-br ${pz.bg} flex flex-col items-center justify-center transition-all duration-500">
            <div class="text-6xl md:text-8xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                ${pz.emoji}
            </div>
            <div class="absolute bottom-0 left-0 w-full text-center px-4 pb-4 pt-8 bg-gradient-to-t from-dark-900 to-transparent">
                <p class="text-white text-lg font-medium drop-shadow-md">${pz.terjemahan}</p>
            </div>
        </div>

        <div class="flex items-center justify-center flex-wrap mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
            ${kalimatHtml}
        </div>

        <p class="text-center text-sm text-neutral-400 uppercase tracking-wider mb-4">Pilih partikel yang tepat:</p>
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
    target.classList.remove('border-dashed', 'border-cyan-500/50');
    target.classList.add('border-solid', 'bg-cyan-500/20');

    btnElement.style.opacity = '0';
    btnElement.style.transform = 'scale(0.5)';

    let isCorrect = (selectedAnswer === pz.jawaban);

    setTimeout(() => {
        if (isCorrect) {
            target.classList.add('border-emerald-500', 'text-emerald-400', 'bg-emerald-500/20');
            target.classList.remove('text-cyan-300', 'border-cyan-500/50', 'bg-cyan-500/20');
            puzzleScore += 20;
            feedback.className = "mt-8 p-4 rounded-xl text-center text-lg font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block animate-pulse-glow";
            feedback.innerHTML = `<i data-lucide="check-circle" class="w-6 h-6 inline mr-2 -mt-1"></i>Tepat Sekali!`;
        } else {
            target.classList.add('border-rose-500', 'text-rose-400', 'bg-rose-500/20');
            target.classList.remove('text-cyan-300', 'border-cyan-500/50', 'bg-cyan-500/20');
            feedback.className = "mt-8 p-4 rounded-xl text-center text-lg font-bold border border-rose-500/30 bg-rose-500/10 text-rose-400 block";
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

    if (!userProgress.puzzleSelesai && puzzleScore >= 80) {
        userProgress.puzzleSelesai = true;
        saveProgress();
    }

    container.innerHTML = `
        <div class="text-center py-10">
            <div class="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center border-4 border-cyan-500 mx-auto mb-6">
                <span class="text-3xl font-bold text-white">${puzzleScore}</span>
            </div>
            <h3 class="text-2xl font-bold mb-2">Puzzle Selesai!</h3>
            <p class="text-neutral-400 mb-8">Berlatih visual membantumu mengingat konteks lebih baik.</p>
            <button class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition" onclick="startPuzzle()">Main Lagi</button>
        </div>
    `;
    showToast('Puzzle Selesai', `Skor game kamu: ${puzzleScore}`);
}
