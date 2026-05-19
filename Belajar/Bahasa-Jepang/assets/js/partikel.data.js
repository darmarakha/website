// =====================================
// KAMUS LOKAL N5 AMAN
// =====================================
const dictionary = {
    orang: [
        { kana: 'わたし', id: 'Saya', icon: 'user' },
        { kana: 'ともだち', id: 'Teman', icon: 'users' },
        { kana: 'せんせい', id: 'Guru', icon: 'graduation-cap' }
    ],
    bendaMakan: [
        { kana: 'みず', id: 'Air', icon: 'droplet', verb: {kana: 'のみます', id: 'minum'} },
        { kana: 'りんご', id: 'Apel', icon: 'apple', verb: {kana: 'たべます', id: 'makan'} },
        { kana: 'パン', id: 'Roti', icon: 'croissant', verb: {kana: 'たべます', id: 'makan'} }
    ],
    bendaTulis: [
        { kana: 'てがみ', id: 'Surat', icon: 'mail', verb: {kana: 'かきます', id: 'menulis'} },
        { kana: 'ほん', id: 'Buku', icon: 'book', verb: {kana: 'よみます', id: 'membaca'} }
    ],
    tempatAksi: [
        { kana: 'がっこう', id: 'Sekolah', icon: 'school' },
        { kana: 'としょかん', id: 'Perpustakaan', icon: 'library' },
        { kana: 'へや', id: 'Kamar', icon: 'door-closed' }
    ],
    tempatGerak: [
        { kana: 'にほん', id: 'Jepang', icon: 'map-pin' },
        { kana: 'えき', id: 'Stasiun', icon: 'train-front' },
        { kana: 'いえ', id: 'Rumah', icon: 'home' }
    ],
    makhlukHidup: [
        { kana: 'ねこ', id: 'Kucing', icon: 'cat' },
        { kana: 'いぬ', id: 'Anjing', icon: 'dog' }
    ],
    waktu: [
        { kana: 'あした', id: 'Besok', icon: 'calendar-days' },
        { kana: 'きょう', id: 'Hari ini', icon: 'calendar' }
    ],
    alat: [
        { kana: 'くるま', id: 'Mobil', icon: 'car' },
        { kana: 'でんしゃ', id: 'Kereta', icon: 'train' }
    ]
};

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestions(amount) {
    let generated = [];
    const patterns = [
        // を Object Template
        () => {
            let orang = getRandomItem(dictionary.orang);
            let bendaObj = Math.random() > 0.5 ? getRandomItem(dictionary.bendaMakan) : getRandomItem(dictionary.bendaTulis);
            return {
                type: "mcq", icon: bendaObj.icon,
                soal: `${orang.kana} は ${bendaObj.kana} ___ ${bendaObj.verb.kana}。`,
                terjemahan: `${orang.id} ${bendaObj.verb.id} ${bendaObj.id.toLowerCase()}.`,
                options: ["を", "に", "で", "へ"], jawaban: 0,
                penjelasan: `を digunakan karena ${bendaObj.kana} adalah objek langsung dari aksi ${bendaObj.verb.kana}.`,
                hint: `Menandai objek langsung dari sebuah aksi.`
            };
        },
        // に Location Existence Template
        () => {
            let tempat = getRandomItem(dictionary.tempatAksi);
            let subjek = getRandomItem(dictionary.makhlukHidup);
            return {
                type: "mcq", icon: subjek.icon,
                soal: `${tempat.kana} ___ ${subjek.kana} が います。`,
                terjemahan: `Di ${tempat.id.toLowerCase()} ada ${subjek.id.toLowerCase()}.`,
                options: ["で", "に", "を", "へ"], jawaban: 1,
                penjelasan: `に menandai lokasi keberadaan statis. Selalu berpasangan dengan kata kerja います/あります.`,
                hint: `Menandai lokasi tempat sesuatu berada secara statis.`
            };
        },
        // で Action Place Template
        () => {
            let tempat = getRandomItem(dictionary.tempatAksi);
            return {
                type: "mcq", icon: tempat.icon,
                soal: `${tempat.kana} ___ べんきょうします。`,
                terjemahan: `Belajar di ${tempat.id.toLowerCase()}.`,
                options: ["に", "で", "は", "も"], jawaban: 1,
                penjelasan: `で menandai tempat terjadinya suatu aktivitas/aksi yang dinamis.`,
                hint: `Menandai tempat dilakukannya sebuah aksi.`
            };
        },
        // へ Direction Template
        () => {
            let waktu = getRandomItem(dictionary.waktu);
            let tempat = getRandomItem(dictionary.tempatGerak);
            return {
                type: "mcq", icon: tempat.icon,
                soal: `${waktu.kana}、${tempat.kana} ___ いきます。`,
                terjemahan: `${waktu.id} pergi ke ${tempat.id}.`,
                options: ["へ", "を", "で", "は"], jawaban: 0,
                penjelasan: `へ menandai arah tujuan pergerakan.`,
                hint: `Menandai arah pergerakan menuju suatu tempat.`
            };
        },
        // が Subject Emphasis / Existence Template
        () => {
            let orang = getRandomItem(dictionary.orang);
            return {
                type: "essay", icon: orang.icon,
                soal: `だれ ___ きますか。`,
                terjemahan: `Siapa yang datang?`, jawaban: "が",
                penjelasan: `Kata tanya yang berfungsi sebagai subjek (だれ, なに) harus diikuti oleh partikel が, tidak boleh は.`,
                hint: `Partikel yang selalu mengikuti kata tanya subjek (だれ, なに).`
            };
        }
    ];

    for (let i = 0; i < amount; i++) {
        let patternFunc = getRandomItem(patterns);
        let q = patternFunc();
        if (q.type === 'mcq') {
            let correctOpt = q.options[q.jawaban];
            let rawOptions = [...q.options];
            for (let j = rawOptions.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [rawOptions[j], rawOptions[k]] = [rawOptions[k], rawOptions[j]];
            }
            q.options = rawOptions.map((o, idx) => `${String.fromCharCode(65 + idx)}. ${o}`);
            q.jawaban = q.options.findIndex(o => o.substring(3) === correctOpt);
        }
        generated.push(q);
    }
    return generated;
}

const partikelData = [
    {
        id: 'wa', char: 'は', romaji: 'wa', fungsi: 'Topik kalimat',
        rumus: '[Subjek/Topik] + は + [Keterangan/Predikat]',
        contoh: [{ jp: 'わたし は 学生 です。', id: 'Saya adalah pelajar.' }],
        perbandingan: '<b>は vs が?</b> Gunakan <b>は</b> saat membicarakan topik umum.',
        catatan: 'Dibaca "wa".', salah: 'Jangan gunakan は untuk subjek kata tanya.',
        miniPractice: { soal: 'わたし ___ アリです。 (Saya adalah Ali)', jawaban: 'は', options: ['が', 'は', 'を'] }
    },
    {
        id: 'ga', char: 'が', romaji: 'ga', fungsi: 'Subjek spesifik / Informasi baru',
        rumus: '[Subjek Spesifik] + が + [Kata Kerja Intransitif / Keberadaan]',
        contoh: [{ jp: '雨 が 降ります。', id: 'Hujan turun.' }],
        perbandingan: '<b>が vs は?</b> Gunakan <b>が</b> untuk subjek baru atau kata tanya.',
        catatan: 'Berpasangan dengan あります / います.', salah: 'Jangan pakai は jika fokus pada SIAPA.',
        miniPractice: { soal: 'あそこ に いぬ ___ います。 (Di sana ada anjing)', jawaban: 'が', options: ['は', 'を', 'が'] }
    },
    {
        id: 'wo', char: 'を', romaji: 'o', fungsi: 'Objek Langsung',
        rumus: '[Kata Benda] + を + [Kata Kerja Transitif]',
        contoh: [{ jp: '水 を 飲みます。', id: 'Minum air.' }],
        perbandingan: 'を vs に: を dipakai untuk benda yang dikenai tindakan.',
        catatan: 'Dibaca "o".', salah: 'Jangan pakai を untuk kata kerja intransitif.',
        miniPractice: { soal: 'りんご ___ たべます。(Makan apel)', jawaban: 'を', options: ['が', 'を', 'で'] }
    },
    {
        id: 'ni', char: 'に', romaji: 'ni', fungsi: 'Waktu / Titik Tujuan / Titik Keberadaan',
        rumus: '[Waktu/Tempat/Objek] + に + [Kata Kerja]',
        contoh: [{ jp: '学校 に います。', id: 'Ada di sekolah.' }],
        perbandingan: '<b>に vs で</b> に dipakai untuk lokasi statis.',
        catatan: 'Menandai titik point spesifik.', salah: 'Jangan gunakan に dengan waktu relatif (besok).',
        miniPractice: { soal: 'がっこう ___ います。(Berada di sekolah)', jawaban: 'に', options: ['へ', 'で', 'に'] }
    },
    {
        id: 'de', char: 'で', romaji: 'de', fungsi: 'Tempat Aksi / Alat / Metode',
        rumus: '[Tempat / Alat] + で + [Kata Kerja]',
        contoh: [{ jp: '学校 で 勉強します。', id: 'Belajar di sekolah.' }],
        perbandingan: '<b>で vs に</b> Gunakan で jika kamu melakukan aksi.',
        catatan: 'Diterjemahkan "Di..." atau "Dengan...".', salah: 'Jangan gunakan で dengan kata kerja keberadaan.',
        miniPractice: { soal: 'えんぴつ ___ かきます。(Menulis dengan pensil)', jawaban: 'で', options: ['に', 'で', 'を'] }
    }
];
