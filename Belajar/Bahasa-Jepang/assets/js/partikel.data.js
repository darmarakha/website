// ============================================
// KAMUS KATA untuk GENERATE SOAL
// ============================================
const dictionary = {
    orang: [
        { kana: 'わたし', id: 'Saya', icon: 'user' },
        { kana: 'あなた', id: 'Kamu', icon: 'user' },
        { kana: 'ともだち', id: 'Teman', icon: 'users' },
        { kana: 'せんせい', id: 'Guru', icon: 'graduation-cap' },
        { kana: 'かのじょ', id: 'Dia (pr)', icon: 'user' },
        { kana: 'かれ', id: 'Dia (lk)', icon: 'user' }
    ],
    bendaMakan: [
        { kana: 'みず', id: 'Air', icon: 'droplet', verb: { kana: 'のみます', id: 'minum' } },
        { kana: 'りんご', id: 'Apel', icon: 'apple', verb: { kana: 'たべます', id: 'makan' } },
        { kana: 'パン', id: 'Roti', icon: 'croissant', verb: { kana: 'たべます', id: 'makan' } },
        { kana: 'すし', id: 'Sushi', icon: 'fish-symbol', verb: { kana: 'たべます', id: 'makan' } },
        { kana: 'おちゃ', id: 'Teh', icon: 'cup-soda', verb: { kana: 'のみます', id: 'minum' } }
    ],
    bendaTulis: [
        { kana: 'てがみ', id: 'Surat', icon: 'mail', verb: { kana: 'かきます', id: 'menulis' } },
        { kana: 'ほん', id: 'Buku', icon: 'book', verb: { kana: 'よみます', id: 'membaca' } },
        { kana: 'にっき', id: 'Buku harian', icon: 'book-open', verb: { kana: 'かきます', id: 'menulis' } }
    ],
    tempatAksi: [
        { kana: 'がっこう', id: 'Sekolah', icon: 'school' },
        { kana: 'としょかん', id: 'Perpustakaan', icon: 'library' },
        { kana: 'へや', id: 'Kamar', icon: 'door-closed' },
        { kana: 'きょうしつ', id: 'Kelas', icon: 'presentation' }
    ],
    tempatGerak: [
        { kana: 'にほん', id: 'Jepang', icon: 'map-pin' },
        { kana: 'えき', id: 'Stasiun', icon: 'train-front' },
        { kana: 'いえ', id: 'Rumah', icon: 'home' },
        { kana: 'こうえん', id: 'Taman', icon: 'tree-deciduous' }
    ],
    makhlukHidup: [
        { kana: 'ねこ', id: 'Kucing', icon: 'cat' },
        { kana: 'いぬ', id: 'Anjing', icon: 'dog' },
        { kana: 'とり', id: 'Burung', icon: 'bird' }
    ],
    waktu: [
        { kana: 'あした', id: 'Besok', icon: 'calendar-days' },
        { kana: 'きょう', id: 'Hari ini', icon: 'calendar' },
        { kana: 'まいあさ', id: 'Setiap pagi', icon: 'sunrise' },
        { kana: 'まいばん', id: 'Setiap malam', icon: 'moon' }
    ],
    alat: [
        { kana: 'くるま', id: 'Mobil', icon: 'car' },
        { kana: 'でんしゃ', id: 'Kereta', icon: 'train' },
        { kana: 'じてんしゃ', id: 'Sepeda', icon: 'bike' },
        { kana: 'えんぴつ', id: 'Pensil', icon: 'pencil' }
    ],
    kegiatan: [
        { kana: 'べんきょう', id: 'belajar', icon: 'book', verb: 'します' },
        { kana: 'しごと', id: 'bekerja', icon: 'briefcase', verb: 'します' },
        { kana: 'かいもの', id: 'belanja', icon: 'shopping-bag', verb: 'します' },
        { kana: 'さんぽ', id: 'jalan-jalan', icon: 'walk', verb: 'します' }
    ],
    hewan: [
        { kana: 'ねこ', id: 'Kucing', icon: 'cat' },
        { kana: 'いぬ', id: 'Anjing', icon: 'dog' },
        { kana: 'うさぎ', id: 'Kelinci', icon: 'rabbit' }
    ]
};

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
    let a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateQuestions(amount) {
    let generated = [];
    const patterns = [
        () => {
            let orang = getRandomItem(dictionary.orang);
            let bendaObj = Math.random() > 0.5 ? getRandomItem(dictionary.bendaMakan) : getRandomItem(dictionary.bendaTulis);
            return {
                type: "mcq", icon: bendaObj.icon,
                soal: `${orang.kana} は ${bendaObj.kana} ___ ${bendaObj.verb.kana}。`,
                terjemahan: `${orang.id} ${bendaObj.verb.id} ${bendaObj.id.toLowerCase()}.`,
                options: ["を", "に", "で", "へ"], jawaban: 0,
                penjelasan: `「を」menandai objek langsung. ${bendaObj.kana} adalah benda yang ${bendaObj.verb.id}.`,
                hint: `Menandai objek langsung dari kata kerja transitif.`
            };
        },
        () => {
            let tempat = getRandomItem(dictionary.tempatAksi);
            let subjek = getRandomItem(dictionary.makhlukHidup);
            return {
                type: "mcq", icon: subjek.icon,
                soal: `${tempat.kana} ___ ${subjek.kana} が います。`,
                terjemahan: `Di ${tempat.id.toLowerCase()} ada ${subjek.id.toLowerCase()}.`,
                options: ["で", "に", "を", "へ"], jawaban: 1,
                penjelasan: `「に」menandai lokasi keberadaan statis. Selalu berpasangan dengan います/あります.`,
                hint: `Menandai lokasi tempat sesuatu berada secara statis.`
            };
        },
        () => {
            let tempat = getRandomItem(dictionary.tempatAksi);
            let kegiatan = getRandomItem(dictionary.kegiatan);
            return {
                type: "mcq", icon: tempat.icon,
                soal: `${tempat.kana} ___ ${kegiatan.kana}${kegiatan.verb}。`,
                terjemahan: `${kegiatan.id} di ${tempat.id.toLowerCase()}.`,
                options: ["に", "で", "は", "も"], jawaban: 1,
                penjelasan: `「で」menandai tempat terjadinya aktivitas/aksi dinamis.`,
                hint: `Menandai tempat dilakukannya sebuah aksi aktif.`
            };
        },
        () => {
            let waktu = getRandomItem(dictionary.waktu);
            let tempat = getRandomItem(dictionary.tempatGerak);
            return {
                type: "mcq", icon: tempat.icon,
                soal: `${waktu.kana}、${tempat.kana} ___ いきます。`,
                terjemahan: `${waktu.id} pergi ke ${tempat.id}.`,
                options: ["へ", "を", "で", "は"], jawaban: 0,
                penjelasan: `「へ」menandai arah pergerakan menuju suatu tempat.`,
                hint: `Menandai arah pergerakan.`
            };
        },
        () => {
            let orang = getRandomItem(dictionary.orang);
            return {
                type: "essay", icon: orang.icon,
                soal: `だれ ___ きますか。`,
                terjemahan: `Siapa yang datang?`, jawaban: "が",
                penjelasan: `Kata tanya subjek (だれ, なに) harus diikuti が, tidak boleh は.`,
                hint: `Partikel untuk kata tanya subjek.`
            };
        },
        () => {
            let alat = getRandomItem(dictionary.alat);
            return {
                type: "mcq", icon: alat.icon,
                soal: `${alat.kana} ___ がっこう へ いきます。`,
                terjemahan: `Pergi ke sekolah dengan ${alat.id}.`,
                options: ["で", "に", "を", "へ"], jawaban: 0,
                penjelasan: `「で」menandai alat/sarana yang digunakan untuk melakukan aksi.`,
                hint: `Menandai alat atau cara melakukan sesuatu.`
            };
        },
        () => {
            let orang = getRandomItem(dictionary.orang);
            let tempat = getRandomItem(dictionary.tempatGerak);
            return {
                type: "mcq", icon: orang.icon,
                soal: `${orang.kana} は ${tempat.kana} ___ きました。`,
                terjemahan: `${orang.id} datang dari ${tempat.id}.`,
                options: ["から", "まで", "で", "に"], jawaban: 0,
                penjelasan: `「から」menandai titik awal (asal) pergerakan.`,
                hint: `Menandai asal / titik awal.`
            };
        },
        () => {
            let benda = getRandomItem(dictionary.bendaMakan);
            return {
                type: "mcq", icon: benda.icon,
                soal: `${benda.kana} ___ ${benda.verb.kana}。`,
                terjemahan: `${benda.verb.id} ${benda.id}.`,
                options: ["を", "が", "に", "で"], jawaban: 0,
                penjelasan: `「を」menandai objek yang dikenai tindakan ${benda.verb.id}.`,
                hint: `Partikel objek langsung.`
            };
        }
    ];

    for (let i = 0; i < amount; i++) {
        let patternFunc = getRandomItem(patterns);
        let q = patternFunc();
        if (q.type === 'mcq') {
            let correctOpt = q.options[q.jawaban];
            let rawOptions = [...q.options];
            q.options = shuffleArray(rawOptions).map((o, idx) => `${String.fromCharCode(65 + idx)}. ${o}`);
            q.jawaban = q.options.findIndex(o => o.substring(3) === correctOpt);
        }
        generated.push(q);
    }
    return generated;
}

// ============================================
// DATA 45+ PARTIKEL BAHASA JEPANG
// ============================================
// Setiap entry memiliki:
//   id, char, romaji, tingkat, kategori[], fungsi, rumus,
//   contoh[], perbandingan, catatan, salah, miniPractice,
//   penjelasanSingkat, semuaFungsi[], cerita, jlptQuestions[]

const partikelData = [
    // ========================================
    // KATEGORI 1: PENANDA FUNGSI UTAMA
    // ========================================
    {
        id: 'wa', char: 'は', romaji: 'wa', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama', 'fokus-penekanan'],
        fungsi: 'Penanda topik / kontras',
        rumus: '[Topik/Kata] + は + [Predikat/Keterangan]',
        contoh: [
            { jp: 'わたしは学生です。', id: '(Kalau tentang) saya, adalah pelajar.' },
            { jp: '今日は天気がいいです。', id: '(Kalau) hari ini, cuacanya bagus.' },
            { jp: '日本は食べ物がおいしいです。', id: '(Kalau) Jepang, makanannya enak.' },
            { jp: 'これは本です。', id: '(Kalau) ini, adalah buku.' },
            { jp: 'あしたはテストがあります。', id: '(Kalau) besok, ada ujian.' },
            { jp: '寿司は好きですが、刺身は好きじゃありません。', id: '(Kalau) sushi suka, tapi (kalau) sashimi tidak suka (KONTRAS).' }
        ],
        perbandingan: 'Gunakan は untuk topik umum. Gunakan が untuk subjek spesifik. は tidak bisa dipakai untuk kata tanya.',
        catatan: 'Dibaca "wa" meski ditulis dengan huruf は (ha). Ini adalah satu-satunya partikel yang cara bacanya berubah total dari penulisan aslinya.',
        salah: 'Jangan gunakan は untuk menandai subjek kata tanya (だれ, なに, どこ). Juga jangan gunakan は di dalam klausa relatif.',
        miniPractice: {
            soal: 'わたし ___ アリです。(Saya adalah Ali)',
            jawaban: 'は', options: ['が', 'は', 'を']
        },
        subkategori: 'topik',
        label: 'Partikel Topik',
        penjelasanSingkat: 'Menunjukkan topik yang sedang dibicarakan. Bisa diterjemahkan sebagai "Kalau tentang...", "Mengenai..."',
        semuaFungsi: [
            {
                judul: 'Penanda Topik',
                penjelasan: 'Memperkenalkan topik pembicaraan. Kata sebelum は adalah "yang sedang dibicarakan", sesudahnya adalah informasi tentang topik tersebut.',
                rumus: '[Topik] + は + [Informasi tentang topik]',
                contoh: ['わたしは学生です。→ Saya (sebagai topik) adalah pelajar.', 'きょうはあついです。→ Hari ini (sebagai topik) panas.']
            },
            {
                judul: 'Penanda Kontras',
                penjelasan: 'Membandingkan dua hal. は bisa menggantikan を, が, に untuk menunjukkan kontras.',
                rumus: '[A] + は + [Predikat] + が/けれども + [B] + は + [Predikat]',
                contoh: ['日本酒は飲みますが、ビールは飲みません。→ Sake (saya) minum, tapi bir (saya) tidak minum.', 'この店は安いですが、あの店は高いです。→ Toko ini murah, tapi toko itu mahal.']
            }
        ],
        cerita: 'Bayangkan は seperti lampu sorot di atas panggung. Kata di depan ハ adalah panggung yang disorot — "Kalau tentang X ini..." — dan informasi setelahnya adalah pertunjukannya. Berbeda dengan が yang seperti jari menunjuk — "X! (bukan yang lain)"',
        diagram: { tipe: 'perbandingan', label: 'は vs が' },
        jlptQuestions: [
            { soal: 'わたし ___ 田中です。', opsi: ['を', 'が', 'は', 'に'], jawaban: 2, penjelasan: 'Perkenalan diri menggunakan は karena "saya" adalah topik.' },
            { soal: 'どなた ___ 田中さんですか。', opsi: ['は', 'が', 'を', 'に'], jawaban: 1, penjelasan: 'Kata tanya どなた sebagai subjek harus pakai が, bukan は.' }
        ]
    },
    {
        id: 'ga', char: 'が', romaji: 'ga', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama'],
        fungsi: 'Penanda subjek / identifikasi',
        rumus: '[Subjek] + が + [Predikat]',
        contoh: [
            { jp: '猫がいます。', id: '(Di sana) ada kucing.' },
            { jp: '雨が降っています。', id: 'Hujan (yang) turun.' },
            { jp: 'だれが来ましたか。', id: 'Siapa (yang) datang?' },
            { jp: '私が田中です。', id: 'Saya-lah Tanaka (bukan orang lain).' },
            { jp: '花がきれいです。', id: 'Bunga (itu) cantik.' },
            { jp: '彼が一番です。', id: 'Dia-lah yang terbaik.' }
        ],
        perbandingan: 'が untuk subjek spesifik/baru. は untuk topik umum. Dalam kalimat "Siapa yang melakukan?", jawab pakai が.',
        catatan: 'Berpasangan dengan います/あります untuk menunjukkan keberadaan. Juga dipakai untuk kata tanya subjek.',
        salah: 'Jangan pakai が untuk objek langsung (pakai を). Jangan pakai が untuk topik umum (pakai は).',
        miniPractice: {
            soal: 'あそこにいぬ ___ います。(Di sana ada anjing)',
            jawaban: 'が', options: ['は', 'を', 'が']
        },
        subkategori: 'subjek',
        label: 'Partikel Subjek / Identifikasi',
        penjelasanSingkap: 'Menandai subjek kalimat, terutama untuk informasi baru atau identifikasi.',
        semuaFungsi: [
            {
                judul: 'Penanda Subjek Informasi Baru',
                penjelasan: 'Saat memperkenalkan subjek baru dalam percakapan, gunakan が. Subjek dengan が adalah informasi yang sebelumnya belum diketahui lawan bicara.',
                rumus: '[Subjek baru] + が + [Predikat]',
                contoh: ['昔々、おじいさんがいました。→ Alkisah, ada seorang kakek.', 'あの人が先生です。→ Orang itu (adalah) guru.']
            },
            {
                judul: 'Penanda Subjek Kata Tanya',
                penjelasan: 'Kata tanya yang berfungsi sebagai subjek (だれ, なに, どちら, どこ) selalu diikuti が, tidak boleh は.',
                rumus: '[Kata Tanya] + が + [Predikat]?',
                contoh: ['だれが来ますか。→ Siapa yang datang?', 'どちらが田中さんですか。→ Yang mana Tanaka?']
            },
            {
                judul: 'Penanda Objek Kata Sifat',
                penjelasan: 'Kata sifat (na-adjective, i-adjective) sering menggunakan が untuk menandai objek dari perasaan/kemampuan.',
                rumus: '[Subjek] + は + [Objek] + が + [Kata Sifat]',
                contoh: ['私は猫が好きです。→ Saya suka kucing.', '彼は日本語が上手です。→ Dia pintar bahasa Jepang.']
            }
        ],
        cerita: 'Kalau は adalah lampu sorot yang menerangi panggung, が adalah jari telunjuk yang menunjuk sesuatu. "Lihat! Ini lho!" — makanya が dipakai saat mengenalkan sesuatu yang baru, atau saat MENEGASKAN siapa pelakunya.',
        diagram: { tipe: 'perbandingan', label: 'は vs が' },
        jlptQuestions: [
            { soal: 'あの人はだれ ___ わかっていますか。', opsi: ['は', 'が', 'を', 'に'], jawaban: 1, penjelasan: 'だれ sebagai subjek klausa harus pakai が.' },
            { soal: 'わたしはピアノ ___ できます。', opsi: ['が', 'を', 'は', 'で'], jawaban: 0, penjelasan: 'Kata kerja kemampuan (できる) pakai が untuk objeknya.' }
        ]
    },
    {
        id: 'wo', char: 'を', romaji: 'o', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama'],
        fungsi: 'Penanda objek langsung',
        rumus: '[Objek] + を + [Kata Kerja Transitif]',
        contoh: [
            { jp: '水を飲みます。', id: 'Minum air.' },
            { jp: 'りんごを食べます。', id: 'Makan apel.' },
            { jp: '本を読みます。', id: 'Membaca buku.' },
            { jp: '映画を見ます。', id: 'Menonton film.' },
            { jp: '手紙を書きます。', id: 'Menulis surat.' },
            { jp: '日本語を勉強します。', id: 'Belajar bahasa Jepang.' }
        ],
        perbandingan: 'を untuk objek yang dikenai aksi. に untuk target/arah. Bandingkan: 「バスをおりる」turun dari bus (titik lepas), 「バスにのる」naik ke bus (titik tujuan).',
        catatan: 'Dibaca "o" bukan "wo". Hanya dipakai dengan kata kerja transitif (yang membutuhkan objek).',
        salah: 'Jangan pakai を untuk kata kerja intransitif (いる, ある, 行く, 来る). Kata kerja pergerakan memang pakai を untuk tempat yang DILALUI, bukan sebagai objek.',
        miniPractice: {
            soal: 'りんご ___ たべます。(Makan apel)',
            jawaban: 'を', options: ['が', 'を', 'で']
        },
        subkategori: 'objek',
        label: 'Partikel Objek Langsung',
        penjelasanSingkat: 'Menandai benda atau orang yang dikenai langsung oleh suatu tindakan.',
        semuaFungsi: [
            {
                judul: 'Objek Langsung',
                penjelasan: 'Benda/orang yang langsung dikenai tindakan oleh kata kerja transitif.',
                rumus: '[Objek] + を + [KK Transitif]',
                contoh: ['コーヒーを飲みます。→ Minum kopi.', '宿題をします。→ Mengerjakan PR.']
            },
            {
                judul: 'Tempat yang Dilalui',
                penjelasan: 'Dengan kata kerja pergerakan (歩く, 走る, 渡る, 飛ぶ), を menandai tempat/rute yang dilalui, bukan objek.',
                rumus: '[Tempat/Rute] + を + [KK Pergerakan]',
                contoh: ['道を歩きます。→ Berjalan di jalan.', '橋を渡ります。→ Menyeberangi jembatan.', '公園を散歩します。→ Berjalan-jalan di taman.']
            }
        ],
        cerita: 'Bayangkan を seperti panah yang menunjuk ke target. Kata di depan panah adalah sasaran, kata kerja adalah aksi memanahnya. "Air を minum" — air adalah sasaran dari tindakan minum.',
        diagram: { tipe: 'ilustrasi', label: 'を sebagai panah ke objek' },
        jlptQuestions: [
            { soal: '毎朝、新聞 ___ 読みます。', opsi: ['を', 'が', 'に', 'で'], jawaban: 0, penjelasan: 'Membaca (読む) adalah transitif, koran adalah objek.' },
            { soal: 'このバスは駅前 ___ 通ります。', opsi: 'を/が/に/で', jawaban: 0, penjelasan: '通る (melewati) adalah kata kerja pergerakan, を untuk rute.' }
        ]
    },
    {
        id: 'ni_ichi', char: 'に', romaji: 'ni', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama'],
        fungsi: 'Penanda waktu, lokasi statis, tujuan, target',
        rumus: '[Waktu/Tempat/Target] + に + [Kata kerja]',
        label: 'Partikel Serbaguna (Waktu, Lokasi, Target)',
        subkategori: 'target',
        penjelasanSingkat: 'Partikel paling serbaguna. Menandai titik waktu, lokasi keberadaan, tujuan pergerakan, dan target tidak langsung.',
        contoh: [
            { jp: '三時に起きます。', id: 'Bangun jam 3.' },
            { jp: '学校にいます。', id: 'Ada di sekolah.' },
            { jp: '日本に行きます。', id: 'Pergi ke Jepang.' },
            { jp: '友だちに会います。', id: 'Bertemu dengan teman.' },
            { jp: '先生に本をあげます。', id: 'Memberi buku kepada guru.' },
            { jp: '毎日電車に乗ります。', id: 'Naik kereta setiap hari.' }
        ],
        perbandingan: 'に vs で: に untuk lokasi STATIS (いる/ある), で untuk tempat AKSI (する). に vs へ: に untuk TITIK TUJUAN, へ untuk ARAH.',
        catatan: 'Waktu relatif (きょう, あした, まいあさ) TIDAK pakai に. Hanya waktu spesifik (jam, hari, tanggal) yang pakai に.',
        salah: 'Jangan pakai に untuk waktu relatif (besok, kemarin). Jangan pakai に untuk tempat aksi dinamis (pakai で).',
        miniPractice: {
            soal: 'がっこう ___ います。(Berada di sekolah)',
            jawaban: 'に', options: ['へ', 'で', 'に']
        },
        semuaFungsi: [
            {
                judul: 'Waktu Spesifik',
                penjelasan: 'Menandai titik waktu spesifik (jam, hari, bulan, tahun). Tidak dipakai untuk waktu relatif.',
                rumus: '[Waktu Spesifik] + に + [KK]',
                contoh: ['六時に起きます。→ Bangun jam 6.', '日曜日に休みます。→ Istirahat hari Minggu.']
            },
            {
                judul: 'Lokasi Keberadaan Statis',
                penjelasan: 'Menandai tempat di mana sesuatu/seseorang berada. Berpasangan dengan いる/ある.',
                rumus: '[Tempat] + に + [Subjek] + が + いる/ある',
                contoh: ['部屋に猫がいます。→ Di kamar ada kucing.', '机の上に本があります。→ Di atas meja ada buku.']
            },
            {
                judul: 'Tujuan Pergerakan',
                penjelasan: 'Menandai titik akhir/tujuan dari suatu pergerakan.',
                rumus: '[Tempat] + に + [KK Pergerakan: 行く/来る/帰る]',
                contoh: ['駅に行きます。→ Pergi ke stasiun.', 'うちに帰ります。→ Pulang ke rumah.']
            },
            {
                judul: 'Target Tidak Langsung',
                penjelasan: 'Menandai penerima (orang) dari suatu tindakan memberi, atau target dari suatu aksi.',
                rumus: '[Orang] + に + [Objek] + を + [KK: あげる/もらう/くれる]',
                contoh: ['友だちにプレゼントをあげます。→ Memberi hadiah kepada teman.', '先生に電話します。→ Menelepon guru.']
            }
        ],
        cerita: 'に adalah partikel GPS — dia menandai TITIK dalam ruang dan waktu. Bayangkan pin peta: 三時に (pin di jam 3), 学校に (pin di sekolah), 日本に (pin di Jepang). Semua tentang koordinat spesifik.',
        diagram: { tipe: 'ikon', label: '📍 Pin peta — titik spesifik' },
        jlptQuestions: [
            { soal: '毎朝、七時 ___ 起きます。', opsi: ['が', 'に', 'で', '× (tanpa partikel)'], jawaban: 1, penjelasan: 'Jam spesifik pakai に.' },
            { soal: 'あした ___ どこへ行きますか。', opsi: ['に', 'が', '× (tanpa partikel)', 'で'], jawaban: 2, penjelasan: 'あした adalah waktu relatif, TIDAK pakai に.' },
            { soal: '先生 ___ しつもんがあります。', opsi: ['に', 'を', 'が', 'で'], jawaban: 0, penjelasan: 'に untuk target — "ada pertanyaan KEPADA guru".' }
        ]
    },
    {
        id: 'de', char: 'で', romaji: 'de', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama'],
        fungsi: 'Penanda tempat aksi, alat, metode, sebab',
        rumus: '[Tempat/Alat/Sebab] + で + [Kata Kerja Aksi]',
        label: 'Partikel Tempat Aksi & Alat',
        subkategori: 'tempat-aksi',
        penjelasanSingkat: 'Menandai tempat terjadinya aksi, alat yang digunakan, atau penyebab suatu kejadian.',
        contoh: [
            { jp: '学校で勉強します。', id: 'Belajar di sekolah.' },
            { jp: 'バスで行きます。', id: 'Pergi dengan bus.' },
            { jp: '鉛筆で書きます。', id: 'Menulis dengan pensil.' },
            { jp: '地震で家が壊れました。', id: 'Rumah rusak karena gempa.' },
            { jp: '日本語で話しましょう。', id: 'Mari bicara dalam bahasa Jepang.' },
            { jp: 'レストランで食べます。', id: 'Makan di restoran.' }
        ],
        perbandingan: 'で vs に: で untuk tempat AKSI DINAMIS (belajar, makan, main). に untuk tempat STATIS (berada, ada).',
        catatan: 'Bisa berarti "di" (tempat), "dengan" (alat), "karena" (sebab), atau "dalam" (bahasa/media).',
        salah: 'Jangan gunakan で dengan kata kerja keberadaan (いる/あります). Jangan gunakan で untuk tujuan pergerakan (pakai に/へ).',
        miniPractice: {
            soal: 'えんぴつ ___ かきます。(Menulis dengan pensil)',
            jawaban: 'で', options: ['に', 'で', 'を']
        },
        semuaFungsi: [
            {
                judul: 'Tempat Aksi',
                penjelasan: 'Menandai tempat dilakukannya suatu aktivitas atau aksi.',
                rumus: '[Tempat] + で + [KK Aksi]',
                contoh: ['図書館で本を読みます。→ Membaca buku di perpustakaan.', '公園で遊びます。→ Bermain di taman.']
            },
            {
                judul: 'Alat / Sarana',
                penjelasan: 'Menandai alat atau sarana yang digunakan untuk melakukan sesuatu.',
                rumus: '[Alat] + で + [KK]',
                contoh: ['はしで食べます。→ Makan dengan sumpit.', '電車で会社へ行きます。→ Pergi ke kantor dengan kereta.']
            },
            {
                judul: 'Sebab / Penyebab',
                penjelasan: 'Menandai penyebab suatu kejadian (biasanya hal negatif).',
                rumus: '[Penyebab] + で + [Kejadian]',
                contoh: ['病気で学校を休みました。→ Tidak masuk sekolah karena sakit.', '雨で試合が中止になりました。→ Pertandingan dibatalkan karena hujan.']
            },
            {
                judul: 'Media / Bahasa',
                penjelasan: 'Menandai media atau bahasa yang digunakan.',
                rumus: '[Media/Bahasa] + で + [KK]',
                contoh: ['日本語で話しましょう。→ Mari bicara dalam bahasa Jepang.', 'テレビでニュースを見ます。→ Menonton berita di TV.']
            }
        ],
        cerita: 'Bayangkan で seperti "WORKSHOP" — di dalamnya ada aktivitas, alat, dan hasil. Kalau に adalah pin peta "saya DI SINI", で adalah "saya BEKERJA DI SINI". に = titik diam, で = ruang gerak.',
        diagram: { tipe: 'perbandingan', label: 'に vs で' },
        jlptQuestions: [
            { soal: '食堂 ___ 昼ごはんを食べます。', opsi: ['に', 'で', 'を', 'へ'], jawaban: 1, penjelasan: 'Makan (aktivitas) dilakukan di kantin, pakai で.' },
            { soal: 'ここ ___ 名前を書いてください。', opsi: ['に', 'を', 'で', 'が'], jawaban: 0, penjelasan: 'に untuk titik spesifik "di sini" tempat menulis.' }
        ]
    },
    {
        id: 'e', char: 'へ', romaji: 'e', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama'],
        fungsi: 'Penanda arah pergerakan',
        rumus: '[Tempat] + へ + [KK Pergerakan]',
        label: 'Partikel Arah',
        subkategori: 'arah',
        penjelasanSingkat: 'Menandai arah pergerakan menuju suatu tempat. Lebih fokus pada "arah" daripada "titik tujuan".',
        contoh: [
            { jp: '日本へ行きます。', id: 'Pergi ke (arah) Jepang.' },
            { jp: '駅へ向かっています。', id: 'Menuju ke (arah) stasiun.' },
            { jp: '友だちの家へ行きます。', id: 'Pergi ke rumah teman.' },
            { jp: 'こちらへどうぞ。', id: 'Silakan ke sini (arah).' },
            { jp: '海へ旅に出ます。', id: 'Berangkat bepergian ke arah laut.' }
        ],
        perbandingan: 'へ vs に: へ fokus pada ARAH perjalanan, に fokus pada TITIK TUJUAN. Dalam banyak kasus bisa dipertukarkan, tapi へ terdengar lebih puitis/formal.',
        catatan: 'Dibaca "e", bukan "he". Ini adalah partikel yang cara bacanya berbeda dari penulisan (seperti は).',
        salah: 'Jangan gunakan へ dengan kata kerja keberadaan (いる/ある). Juga jangan pakai へ untuk waktu — waktu pakai に atau tanpa partikel.',
        miniPractice: {
            soal: 'あしたにほん ___ いきます。(Besok pergi ke Jepang)',
            jawaban: 'へ', options: ['を', 'で', 'へ']
        },
        semuaFungsi: [
            {
                judul: 'Arah Pergerakan',
                penjelasan: 'Menekankan arah, bukan titik akhir. Kata kerja yang sering dipakai: 行く, 来る, 帰る, 向かう, 出発する.',
                rumus: '[Tempat] + へ + [KK Pergerakan]',
                contoh: ['京都へ旅行します。→ Bepergian ke (arah) Kyoto.', '大学へ通っています。→ Pergi pulang ke universitas.']
            }
        ],
        cerita: 'へ adalah "anak panah arah" 🏹 — dia menunjuk ke arah mana kamu pergi, bukan di mana kamu berhenti. Bedanya dengan に: に adalah "sampai di tujuan", へ adalah "menuju ke sana" — perjalanannya sendiri yang ditekankan.',
        diagram: { tipe: 'ilustrasi', label: '🏹 Arah (へ) vs 📍 Titik (に)' },
        jlptQuestions: [
            { soal: '来年、日本 ___ 留学します。', opsi: ['を', 'へ', 'で', 'が'], jawaban: 1, penjelasan: '留学 (belajar di luar negeri) adalah pergerakan ke arah Jepang.' }
        ]
    },
    {
        id: 'no', char: 'の', romaji: 'no', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama', 'akhir-kalimat'],
        fungsi: 'Penanda kepemilikan / penerang / nominalisasi',
        rumus: '[Pemilik] + の + [Benda]',
        label: 'Partikel Kepemilikan & Penerang',
        subkategori: 'kepemilikan',
        penjelasanSingkat: 'Partikel yang menghubungkan dua kata benda — yang pertama menerangkan yang kedua.',
        contoh: [
            { jp: '私の本です。', id: 'Buku saya (buku milik saya).' },
            { jp: '日本の食べ物', id: 'Makanan Jepang (makanan dari/di Jepang).' },
            { jp: '大学の先生', id: 'Guru universitas.' },
            { jp: '数学の本', id: 'Buku matematika (buku tentang matematika).' },
            { jp: '昨日のニュース', id: 'Berita kemarin (berita tentang kemarin).' },
            { jp: 'あの青いの', id: 'Yang biru itu (の sebagai pengganti kata benda).' }
        ],
        perbandingan: 'の bisa berarti milik, asal, topik, atau material. Artinya tergantung konteks.',
        catatan: 'Dalam percakapan informal, の bisa dipakai di akhir kalimat untuk penjelasan atau pertanyaan.',
        salah: 'Jangan menggunakan の sebagai ganti partikel lain dalam kalimat kompleks. Jangan gabung の dengan が dalam klausa relatif standar (kecuali bahasa lama).',
        miniPractice: {
            soal: 'これ ___ ほんです。(Ini buku punya saya) - Jawab dengan kepemilikan',
            jawaban: 'わたしの', options: ['わたしの', 'わたしは', 'わたしが']
        },
        semuaFungsi: [
            {
                judul: 'Kepemilikan / Atribusi',
                penjelasan: 'Menunjukkan hubungan milik atau atribut antara dua kata benda.',
                rumus: '[A] + の + [B] → B milik/berhubungan dengan A',
                contoh: ['私の車 → Mobil saya', '先生の意見 → Pendapat guru']
            },
            {
                judul: 'Penerang (Appositif)',
                penjelasan: 'Kata benda pertama menerangkan kata benda kedua — bisa berarti asal, bahan, topik.',
                rumus: '[Penerang] + の + [Benda]',
                contoh: ['日本の文化 → Budaya Jepang', '木の机 → Meja kayu', '友だちの山田さん → Teman saya, Yamada']
            },
            {
                judul: 'Nominalisasi (Pengganti Benda)',
                penjelasan: 'の bisa menggantikan kata benda yang sudah jelas konteksnya, atau mengubah kata sifat/kata kerja menjadi kata benda.',
                rumus: '[KS/KK] + の → "Yang ~"',
                contoh: ['あかいのはどれですか。→ Yang merah yang mana?', '本を読むのが好きです。→ Saya suka membaca buku.']
            }
        ],
        cerita: 'の adalah "lem" penghubung antar benda. Dia seperti tanda hubung (-) dalam bahasa Indonesia: "buku-saya", "makanan-Jepang", "guru-sekolah". Semakin banyak の, semakin panjang rantai penjelasannya: 学校の先生の家の猫 → kucing di rumah guru sekolah.',
        diagram: { tipe: 'rantai', label: 'A の B の C ...' },
        jlptQuestions: [
            { soal: 'これは私 ___ 本です。', opsi: ['は', 'が', 'の', 'を'], jawaban: 2, penjelasan: 'の untuk kepemilikan — buku milik saya.' }
        ]
    },
    {
        id: 'to_with', char: 'と', romaji: 'to', tingkat: 'N5',
        kategori: ['penanda-fungsi-utama', 'daftar-pilihan'],
        fungsi: 'Penanda kebersamaan / kutipan / daftar lengkap',
        rumus: '[Orang] + と + [KK] / [Kutipan] + と + 言う',
        label: 'Partikel Kebersamaan & Kutipan',
        subkategori: 'kebersamaan',
        penjelasanSingkat: 'Menandai "bersama dengan" seseorang, atau mengutip ucapan/pikiran.',
        contoh: [
            { jp: '友だちと映画を見ます。', id: 'Menonton film dengan teman.' },
            { jp: '彼と話しました。', id: 'Berbicara dengan dia.' },
            { jp: '「はい」と言いました。', id: 'Berkata "ya".' },
            { jp: 'これとそれ', id: 'Ini dan itu (daftar lengkap).' },
            { jp: '家族と住んでいます。', id: 'Tinggal bersama keluarga.' },
            { jp: '明日は雨だと思います。', id: 'Saya pikir besok akan hujan.' }
        ],
        perbandingan: 'と vs や: と untuk daftar LENGKAP (A dan B), や untuk daftar PARSIAL (A, B, dll).',
        catatan: 'と sebagai kutipan dipakai dengan kata kerja seperti 言う, 思う, 聞く.',
        salah: 'Jangan pakai と untuk daftar lebih dari 2-3 item (terlalu kaku). Jangan pakai と untuk "dan" dalam daftar panjang — lebih natural pakai や atau koma.',
        miniPractice: {
            soal: 'ともだち ___ えいがをみます。(Menonton film dengan teman)',
            jawaban: 'と', options: ['と', 'に', 'で']
        },
        semuaFungsi: [
            {
                judul: 'Kebersamaan',
                penjelasan: 'Menandai orang yang bersama-sama melakukan aksi.',
                rumus: '[Orang] + と + [KK Bersama]',
                contoh: ['友だちと旅行します。→ Bepergian dengan teman.', '彼女と結婚します。→ Menikah dengan dia.']
            },
            {
                judul: 'Kutipan (Langsung & Tidak Langsung)',
                penjelasan: 'Mengutip apa yang seseorang katakan, pikirkan, atau dengar.',
                rumus: '[Kutipan] + と + [KK: 言う/思う/聞く]',
                contoh: ['「おはよう」と言いました。→ Berkata "selamat pagi".', '明日は休みだと思います。→ Saya pikir besok libur.']
            }
        ],
        cerita: 'と adalah "teman setia". Dia selalu bersama kata di depannya — "dengan teman", "dengan ini dan itu". Saat mengutip, と seperti tanda petik yang membungkus ucapan seseorang.',
        diagram: { tipe: 'ilustrasi', label: '🤝 Bersama / 💬 Kutipan' },
        jlptQuestions: [
            { soal: '先生 ___ 話しています。', opsi: ['と', 'に', 'を', 'で'], jawaban: 0, penjelasan: '話す (berbicara) dengan seseorang pakai と.' }
        ]
    },

    // ========================================
    // KATEGORI 2: PERBANDINGAN & BATASAN
    // ========================================
    {
        id: 'kara_from', char: 'から', romaji: 'kara', tingkat: 'N5',
        kategori: ['perbandingan-batasan', 'penghubung'],
        fungsi: 'Penanda titik awal (tempat/waktu) / alasan',
        rumus: '[Titik Awal] + から + [Akhir]',
        label: 'Partikel "Dari"',
        subkategori: 'titik-awal',
        penjelasanSingkat: 'Menandai titik awal dalam ruang, waktu, atau urutan. Juga berarti "karena".',
        contoh: [
            { jp: '学校から来ました。', id: 'Datang dari sekolah.' },
            { jp: '九時から仕事です。', id: 'Bekerja dari jam 9.' },
            { jp: '東京から大阪まで新幹線で行きます。', id: 'Pergi dari Tokyo ke Osaka dengan shinkansen.' },
            { jp: '安いから買いました。', id: 'Karena murah, (saya) membelinya.' },
            { jp: '最初からやり直します。', id: 'Mulai dari awal lagi.' }
        ],
        perbandingan: 'から (titik awal) vs まで (batas akhir). Sering dipakai berpasangan: から...まで.',
        catatan: 'から sebagai "karena" dipakai untuk alasan subjektif. Untuk alasan objektif pakai ので.',
        salah: 'Jangan pakai から untuk "dari" dalam arti bahan/material (pakai で atau の). Jangan gabung から dengan から dalam satu kalimat.',
        miniPractice: {
            soal: 'がっこう ___ うちにかえります。(Pulang dari sekolah ke rumah)',
            jawaban: 'から', options: ['から', 'まで', 'に']
        },
        semuaFungsi: [
            {
                judul: 'Titik Awal (Tempat/Waktu)',
                penjelasan: 'Menandai titik awal dalam ruang, waktu, atau urutan.',
                rumus: '[Titik Awal] + から + [KK] / [Titik Awal] + から + [Titik Akhir] + まで',
                contoh: ['会議は十時からです。→ Rapat dari jam 10.', '駅から歩いて五分です。→ 5 menit jalan kaki dari stasiun.']
            },
            {
                judul: 'Alasan / Sebab (Subjektif)',
                penjelasan: 'Menjelaskan alasan atau penyebab. Lebih subjektif dan informal daripada ので.',
                rumus: '[Alasan] + から + [Akibat]',
                contoh: ['おなかがすいたから、食べましょう。→ Karena lapar, ayo makan.', '安いから買った。→ Karena murah, (saya) beli.']
            }
        ],
        cerita: 'Bayangkan から seperti GARIS START dalam lomba. 「駅から歩く」— mulai berjalan DARI stasiun. 「九時から」— mulai DARI jam 9. Sedangkan から sebagai "karena" adalah pintu masuk ke alasan.',
        diagram: { tipe: 'garis', label: '🏁 Start (から) → Finish (まで)' },
        jlptQuestions: [
            { soal: '田中さんは日本 ___ 来ました。', opsi: ['から', 'まで', 'で', 'に'], jawaban: 0, penjelasan: 'Datang DARI Jepang.' }
        ]
    },
    {
        id: 'made', char: 'まで', romaji: 'made', tingkat: 'N5',
        kategori: ['perbandingan-batasan', 'fokus-penekanan'],
        fungsi: 'Penanda batas akhir / "sampai" / "bahkan"',
        rumus: '[Batas] + まで + [KK]',
        label: 'Partikel "Sampai / Bahkan"',
        subkategori: 'batas',
        penjelasanSingkat: 'Menandai batas akhir dalam ruang, waktu, atau tingkatan. Juga berarti "bahkan" untuk kasus ekstrem.',
        contoh: [
            { jp: '五時まで働きます。', id: 'Bekerja sampai jam 5.' },
            { jp: '駅まで歩きます。', id: 'Berjalan kaki sampai stasiun.' },
            { jp: '東京から大阪まで三時間です。', id: 'Dari Tokyo sampai Osaka 3 jam.' },
            { jp: '子供まで知っています。', id: 'Bahkan anak kecil pun tahu.' },
            { jp: 'あしたまでにレポートを出します。', id: 'Akan mengumpulkan laporan sampai besok (batas waktu).' }
        ],
        perbandingan: 'まで (batas) vs から (awal). Sering berpasangan. までに = "paling lambat" (batas waktu dengan tenggat).',
        catatan: 'までに (dengan に) berarti "paling lambat" — batas waktu yang harus dipenuhi. 「五時までに帰ります」= pulang paling lambat jam 5.',
        salah: 'Jangan tertukar まで (sampai) dengan までに (paling lambat). Jangan pakai まで untuk "hanya" (pakai だけ/しか).',
        miniPractice: {
            soal: 'くじ ___ べんきょうします。(Belajar sampai jam 9)',
            jawaban: 'まで', options: ['から', 'まで', 'に']
        },
        semuaFungsi: [
            {
                judul: 'Batas Akhir',
                penjelasan: 'Menandai batas akhir ruang/waktu dari suatu tindakan.',
                rumus: '[Batas] + まで + [KK]',
                contoh: ['五時まで待ちます。→ Menunggu sampai jam 5.', '駅まで送ります。→ Mengantar sampai stasiun.']
            },
            {
                judul: 'Bahkan (kasus ekstrem)',
                penjelasan: 'Menunjukkan bahwa sesuatu melampaui batas normal.',
                rumus: '[Subjek] + まで + [Predikat]',
                contoh: ['先生まで間違えました。→ Bahkan guru pun salah.', '親まで反対しています。→ Bahkan orang tua pun menentang.']
            }
        ],
        cerita: 'まで adalah GARIS FINISH. 「駅まで」— sampai garis finish di stasiun. 「五時まで」— sampai jam 5 (garis waktu). Dan sebagai "bahkan", まで seperti mengatakan "sampai-sampai...!" — melampaui batas kewajaran.',
        diagram: { tipe: 'garis', label: 'Start (から) → 🏁 Finish (まで)' },
        jlptQuestions: [
            { soal: '銀行は五時 ___ です。', opsi: ['から', 'まで', 'に', 'で'], jawaban: 1, penjelasan: 'Bank buka SAMPAI jam 5.' }
        ]
    },
    {
        id: 'dake', char: 'だけ', romaji: 'dake', tingkat: 'N5',
        kategori: ['perbandingan-batasan', 'fokus-penekanan'],
        fungsi: 'Penanda "hanya" / "saja"',
        rumus: '[Kata] + だけ + [Predikat]',
        label: 'Partikel "Hanya"',
        subkategori: 'batasan',
        penjelasanSingkat: 'Menandai bahwa sesuatu terbatas pada yang disebutkan — tidak lebih.',
        contoh: [
            { jp: 'これだけください。', id: 'Tolong beri saya ini saja.' },
            { jp: '一人だけ来ました。', id: 'Hanya satu orang yang datang.' },
            { jp: '少しだけ食べました。', id: 'Makan hanya sedikit.' },
            { jp: '今日だけ特別です。', id: 'Khusus hari ini saja.' },
            { jp: '見るだけなら無料です。', id: 'Kalau hanya melihat, gratis.' }
        ],
        perbandingan: 'だけ vs しか: だけ untuk "hanya" (netral/positif), しか untuk "hanya" (dengan nuansa negatif/kurang). 「百円だけある」= ada 100 yen saja. 「百円しかない」= cuma ada 100 yen (kurang).',
        catatan: 'だけ bisa digabung dengan partikel lain: だけは, だけで, だけの.',
        salah: 'Jangan pakai だけ dengan kalimat negatif untuk arti "hanya" — pakai しか~ない.',
        miniPractice: {
            soal: 'これ ___ たべます。(Hanya makan ini)',
            jawaban: 'だけ', options: ['だけ', 'しか', 'も']
        },
        semuaFungsi: [
            {
                judul: 'Batasan / Limitasi',
                penjelasan: 'Membatasi ruang lingkup — hanya yang disebutkan, tidak lebih.',
                rumus: '[Yang dibatasi] + だけ + [KK/KS]',
                contoh: ['これだけ買います。→ Hanya beli ini.', '二人だけで行きます。→ Pergi hanya berdua.']
            }
        ],
        cerita: 'だけ adalah "pagar pembatas" — "sampai sini saja, tidak lebih". Kalau も bilang "juga", だけ bilang "hanya ini, sisanya tidak".',
        diagram: { tipe: 'lingkaran', label: '⭕ Hanya di dalam lingkaran ini' },
        jlptQuestions: [
            { soal: '少し ___ 食べます。', opsi: ['だけ', 'しか', 'も', 'が'], jawaban: 0, penjelasan: 'Hanya sedikit — batasan jumlah.' }
        ]
    },
    {
        id: 'shika', char: 'しか', romaji: 'shika', tingkat: 'N5',
        kategori: ['perbandingan-batasan', 'fokus-penekanan'],
        fungsi: 'Penanda "hanya" (dengan negatif)',
        rumus: '[Kata] + しか + [Predikat Negatif]',
        label: 'Partikel "Hanya" (Keterbatasan)',
        subkategori: 'batasan',
        penjelasanSingkat: 'Berarti "hanya" tetapi selalu diikuti predikat NEGATIF. Menekankan bahwa jumlahnya kurang dari yang diharapkan.',
        contoh: [
            { jp: '百円しかありません。', id: 'Hanya ada 100 yen (padahal butuh lebih).' },
            { jp: '一人しか来ませんでした。', id: 'Hanya satu orang yang datang (padahal diharapkan lebih).' },
            { jp: 'これしかできません。', id: 'Hanya ini yang bisa saya lakukan.' },
            { jp: '三時間しか寝ませんでした。', id: 'Hanya tidur 3 jam (kurang dari yang diinginkan).' }
        ],
        perbandingan: 'しか vs だけ: しか (negatif) menyiratkan "kurang dari harapan", だけ (netral/positif) sekadar menyatakan batasan.',
        catatan: 'WAJIB diikuti predikat negatif. Ini adalah aturan mutlak — tidak bisa dipakai dengan kalimat positif.',
        salah: 'Jangan pakai しか dengan predikat positif. Jangan pakai だけ dengan nuansa "kurang" (pakai しか~ない).',
        miniPractice: {
            soal: 'これ ___ ありません。(Hanya ini yang ada — dengan rasa kurang)',
            jawaban: 'しか', options: ['だけ', 'しか', 'も']
        },
        semuaFungsi: [
            {
                judul: 'Keterbatasan (dengan rasa kurang)',
                penjelasan: 'しか~ない menyatakan "hanya" dengan implikasi bahwa jumlahnya tidak memadai.',
                rumus: '[Yang terbatas] + しか + [KK Negatif]',
                contoh: ['お金が千円しかない。→ Uangnya cuma 1000 yen (kurang).', '時間が十分しかない。→ Waktunya cuma 10 menit (mepet).']
            }
        ],
        cerita: 'しか adalah "pengeluh halus". Dia selalu negatif karena selalu merasa KURANG. 「百円しかない」— cuma 100 yen (nggak cukup). だけ bilang "hanya ini" dengan netral, しか bilang "hanya ini" dengan nada kecewa.',
        diagram: { tipe: 'perbandingan', label: 'だけ (netral) vs しか~ない (kurang)' },
        jlptQuestions: [
            { soal: 'かばんに本が一冊 ___ 入っていない。', opsi: ['だけ', 'しか', 'も', 'が'], jawaban: 1, penjelasan: 'しか + negatif — "hanya" satu buku (dan dirasa kurang).' }
        ]
    },
    {
        id: 'bakari', char: 'ばかり', romaji: 'bakari', tingkat: 'N4',
        kategori: ['perbandingan-batasan'],
        fungsi: 'Penanda "hanya" / "terus-menerus" / "baru saja"',
        rumus: '[KK Bentuk Ta] + ばかり + です (baru saja) / [Kata Benda] + ばかり (hanya)',
        label: 'Partikel "Hanya / Baru Saja"',
        subkategori: 'batasan',
        penjelasanSingkat: 'Bisa berarti "hanya" (hanya itu yang dilakukan), "terus-menerus", atau "baru saja dilakukan".',
        contoh: [
            { jp: '漫画ばかり読んでいます。', id: 'Hanya baca komik terus.' },
            { jp: '食べたばかりです。', id: 'Baru saja makan.' },
            { jp: '彼ばかり得をしている。', id: 'Hanya dia yang untung.' },
            { jp: '遊んでばかりいる。', id: 'Terus-menerus bermain.' },
            { jp: '来たばかりのところです。', id: 'Baru saja sampai.' }
        ],
        perbandingan: 'ばかり vs だけ: だけ untuk batasan sederhana, ばかり untuk "hanya itu terus" (berulang). 「チョコレートだけ食べた」= hanya makan cokelat (sekali). 「チョコレートばかり食べている」= cokelat melulu yang dimakan (kebiasaan).',
        catatan: '「KK-ta + ばかり」= barusaja. 「KK-te + ばかり」= terus-menerus. 「KB + ばかり」= hanya (produk).',
        salah: 'Jangan tertukar ばかり (baru saja) dengan ところ (baru saja — lebih presisi).',
        miniPractice: {
            soal: 'きた ___ です。(Baru saja datang)',
            jawaban: 'ばかり', options: ['だけ', 'ばかり', 'ぐらい']
        },
        semuaFungsi: [],
        cerita: 'ばかり seperti "record yang macet" — memutar hal yang sama terus-menerus. Baik itu "hanya itu terus yang dimakan", "baru saja dilakukan" (masih hangat), atau "hanya dia" yang diuntungkan.',
        diagram: { tipe: 'ilustrasi', label: '🔄 Putar ulang terus' },
        jlptQuestions: [
            { soal: '着いた ___ です。', opsi: ['だけ', 'ばかり', 'ぐらい', 'しか'], jawaban: 1, penjelasan: '着いたばかり = baru saja tiba.' }
        ]
    },
    {
        id: 'kurai', char: 'くらい', romaji: 'kurai', tingkat: 'N5',
        kategori: ['perbandingan-batasan'],
        fungsi: 'Penanda perkiraan / tingkat / "setidaknya"',
        rumus: '[Jumlah] + くらい + [KK/KS]',
        label: 'Partikel "Kira-kira / Setidaknya"',
        subkategori: 'perkiraan',
        penjelasanSingkat: 'Menunjukkan perkiraan jumlah, tingkatan, atau "setidaknya" (minimal). Varian: ぐらい lebih informal.',
        contoh: [
            { jp: '十分くらいかかります。', id: 'Memakan waktu sekitar 10 menit.' },
            { jp: 'これくらいでいいです。', id: 'Sekian ini sudah cukup.' },
            { jp: '千円くらいです。', id: 'Sekitar 1000 yen.' },
            { jp: '挨拶くらいできるでしょう。', id: 'Setidaknya salam seharusnya bisa.' },
            { jp: '猫くらいの大きさです。', id: 'Seukuran kucing.' }
        ],
        perbandingan: 'くらい vs ほど: くらい untuk perkiraan (bisa lebih/bisa kurang), ほど untuk tingkatan yang pasti.',
        catatan: 'Bisa ditulis ぐらい (lebih informal/percakapan). Keduanya sama artinya.',
        salah: 'Jangan pakai くらい untuk perbandingan negatif (pakai ほど~ない).',
        miniPractice: {
            soal: 'じゅっぷん ___ かかります。(Memakan waktu sekitar 10 menit)',
            jawaban: 'くらい', options: ['くらい', 'ほど', 'だけ']
        },
        semuaFungsi: [],
        cerita: 'くらい adalah "pita ukur" — "kira-kira segini". Tidak presisi, hanya perkiraan. 「十分くらい」— sekitar 10 menit (bisa 9, bisa 11). Juga "setidaknya" — batas minimal yang diharapkan.',
        diagram: { tipe: 'garis', label: '📏 Perkiraan ±' },
        jlptQuestions: [
            { soal: '毎日一時間 ___ 勉強します。', opsi: ['くらい', 'しか', 'だけ', 'も'], jawaban: 0, penjelasan: 'Sekitar 1 jam — perkiraan waktu.' }
        ]
    },
    {
        id: 'hodo', char: 'ほど', romaji: 'hodo', tingkat: 'N4',
        kategori: ['perbandingan-batasan'],
        fungsi: 'Penanda tingkatan / "se..." / "semakin"',
        rumus: '[KB] + ほど + [KK/KS Negatif] = setingkat... / [KK] + ほど + [KK] = semakin...',
        label: 'Partikel "Se... / Semakin"',
        subkategori: 'tingkat',
        penjelasanSingkat: 'Menunjukkan tingkatan atau derajat. Dipakai dalam perbandingan negatif (setingkat...) atau perubahan progresif (semakin...).',
        contoh: [
            { jp: '日本ほどきれいな国はない。', id: 'Tidak ada negara seindah Jepang.' },
            { jp: '見れば見るほど好きになる。', id: 'Semakin lihat, semakin suka.' },
            { jp: '猫ほど可愛い動物はいない。', id: 'Tidak ada hewan semenggemaskan kucing.' },
            { jp: '練習すればするほど上手になります。', id: 'Semakin berlatih, semakin pintar.' },
            { jp: '金持ちほど幸せとは限らない。', id: 'Belum tentu semakin kaya semakin bahagia.' }
        ],
        perbandingan: 'ほど vs くらい: ほど lebih formal dan lebih pasti. Dalam pola ほど~ない, ほど tak bisa diganti くらい.',
        catatan: 'Pola 「KKば + KK + ほど」= semakin... semakin... 「見れば見るほど」= semakin dilihat.',
        salah: 'Jangan pakai ほど untuk perkiraan sederhana (pakai くらい). Jangan pakai ほど dengan kalimat positif untuk "se..." (pakai くらい).',
        miniPractice: {
            soal: 'みればみる ___ すきになる。(Semakin lihat semakin suka)',
            jawaban: 'ほど', options: ['ほど', 'くらい', 'だけ']
        },
        semuaFungsi: [],
        cerita: 'ほど adalah "tangga" — menunjukkan skala/tingkatan. 「見れば見るほど」— naik satu anak tangga setiap kali melihat. 「猫ほど可愛い」— kucing ada di puncak skala kegemasan, tidak ada yang mengalahkan.',
        diagram: { tipe: 'tangga', label: '📈 Tangga skala' },
        jlptQuestions: [
            { soal: 'これはあれ ___ 高くない。', opsi: ['ほど', 'くらい', 'だけ', 'より'], jawaban: 0, penjelasan: 'Ini tidak semahal itu — perbandingan negatif dengan ほど.' }
        ]
    },
    {
        id: 'yori', char: 'より', romaji: 'yori', tingkat: 'N5',
        kategori: ['perbandingan-batasan'],
        fungsi: 'Penanda perbandingan / "daripada"',
        rumus: '[A] + は + [B] + より + [KS/KK]',
        label: 'Partikel "Daripada"',
        subkategori: 'perbandingan',
        penjelasanSingkat: 'Menandai yang menjadi dasar perbandingan — "A lebih ... daripada B".',
        contoh: [
            { jp: '日本よりインドネシアのほうが広いです。', id: 'Indonesia lebih luas daripada Jepang.' },
            { jp: '昨日より今日のほうが暑いです。', id: 'Hari ini lebih panas daripada kemarin.' },
            { jp: 'バスより電車のほうが速いです。', id: 'Kereta lebih cepat daripada bus.' },
            { jp: '思ったより難しかったです。', id: 'Lebih sulit daripada yang saya kira.' },
            { jp: 'どちらより?', id: 'Dibanding yang mana?' }
        ],
        perbandingan: 'より untuk perbandingan. Dalam pola 「A + より + B + のほうが + KS」 — "B lebih KS daripada A".',
        catatan: 'Bisa berdiri sendiri: 「思ったより」= daripada yang dikira. Juga bisa artinya "dari" (asal) dalam bahasa formal.',
        salah: 'Jangan tertukar posisi — kata SEBELUM より adalah yang "kurang", sesudahnya (dengan のほうが) adalah yang "lebih".',
        miniPractice: {
            soal: 'くるま ___ でんしゃのはうがはやい。(Kereta lbh cepat drpd mobil)',
            jawaban: 'より', options: ['より', 'ほど', 'から']
        },
        semuaFungsi: [],
        cerita: 'より adalah "timbangan" — membandingkan dua hal. 「A より B のほうが」— A di satu sisi, B di sisi lain, timbangan condong ke B. Sederhana: yang sebelum より adalah "kalah", yang setelahnya (のほうが) adalah "menang".',
        diagram: { tipe: 'timbangan', label: '⚖️ A より B のほうが' },
        jlptQuestions: [
            { soal: '日本語は英語 ___ 難しいですか。', opsi: ['より', 'ほど', 'から', 'まで'], jawaban: 0, penjelasan: 'Apakah bahasa Jepang lebih sulit DARIPADA bahasa Inggris?' }
        ]
    },
    {
        id: 'nado', char: 'など', romaji: 'nado', tingkat: 'N4',
        kategori: ['perbandingan-batasan', 'daftar-pilihan'],
        fungsi: 'Penanda "dan sebagainya" / "seperti"',
        rumus: '[Contoh] + など + [KK]',
        label: 'Partikel "Dll / Seperti"',
        subkategori: 'contoh',
        penjelasanSingkat: 'Menunjukkan bahwa yang disebutkan hanyalah contoh, masih ada yang lain. Varian informal: なんか.',
        contoh: [
            { jp: '日本語など勉強しています。', id: 'Belajar bahasa Jepang dan sebagainya.' },
            { jp: 'コーヒーなどいかがですか。', id: 'Bagaimana dengan kopi atau semacamnya?' },
            { jp: '彼の話はうそなどではない。', id: 'Ceritanya bukan bohong atau semacamnya.' },
            { jp: '猫などが好きです。', id: 'Suka kucing dan sejenisnya.' }
        ],
        perbandingan: 'など vs や: や untuk daftar parsial benda (AやB), など untuk "dan lain-lain" di akhir daftar.',
        catatan: 'Dalam percakapan, なんか atau とか lebih sering dipakai daripada など yang lebih formal.',
        salah: 'Jangan terlalu sering pakai など dalam percakapan sehari-hari — terdengar terlalu kaku.',
        miniPractice: {
            soal: 'にほんご ___ べんきょうしています。(Belajar b.Jepang dll)',
            jawaban: 'など', options: ['など', 'だけ', 'より']
        },
        semuaFungsi: [],
        cerita: 'など adalah "dan seterusnya" — seperti "etc." dalam bahasa Inggris. Dia bilang "ini contoh saja, masih banyak yang lain".',
        diagram: { tipe: 'daftar', label: '📋 ...dan lain-lain' },
        jlptQuestions: []
    },

    // ========================================
    // KATEGORI 3: DAFTAR & PILIHAN
    // ========================================
    {
        id: 'to_list', char: 'と', romaji: 'to', tingkat: 'N5',
        kategori: ['daftar-pilihan'],
        fungsi: 'Penanda daftar lengkap: "dan"',
        rumus: '[A] + と + [B] + [KK]',
        label: 'Partikel Daftar Lengkap "dan"',
        subkategori: 'daftar',
        penjelasanSingkat: 'Menghubungkan dua atau lebih benda dalam daftar yang LENGKAP — semua yang disebutkan adalah keseluruhan.',
        contoh: [
            { jp: '猫と犬がいます。', id: 'Ada kucing dan anjing (hanya itu).' },
            { jp: 'りんごとバナナを買いました。', id: 'Membeli apel dan pisang (hanya itu).' },
            { jp: 'これとそれとあれをください。', id: 'Tolong beri ini, itu, dan itu (semuanya).' }
        ],
        perbandingan: 'と vs や: と untuk daftar LENGKAP (A dan B — hanya itu). や untuk daftar PARSIAL (A, B, dll — masih ada yang lain).',
        catatan: 'Untuk daftar 3+ item, と bisa dipakai di antara setiap item atau hanya di akhir.',
        salah: 'Jangan pakai と jika yang dimaksud hanya contoh (pakai や atau とか).',
        miniPractice: {
            soal: 'ねこ ___ いぬ。(Kucing dan anjing — lengkap)',
            jawaban: 'と', options: ['と', 'や', 'も']
        },
        semuaFungsi: [],
        cerita: 'と sebagai "dan" adalah kotak tertutup — "A dan B, titik. Tidak ada yang lain." Kalau や adalah kotak terbuka — "A, B... masih ada yang lain".',
        diagram: { tipe: 'lingkaran', label: '🔒 Daftar tertutup' },
        jlptQuestions: [
            { soal: '日本 ___ 中国へ行きました。', opsi: ['と', 'や', 'も', 'に'], jawaban: 0, penjelasan: 'Pergi ke Jepang DAN China (keduanya).' }
        ]
    },
    {
        id: 'ya', char: 'や', romaji: 'ya', tingkat: 'N5',
        kategori: ['daftar-pilihan'],
        fungsi: 'Penanda daftar parsial: "dan... dll"',
        rumus: '[A] + や + [B] + など + [KK]',
        label: 'Partikel Daftar Parsial "dan... dsb"',
        subkategori: 'daftar',
        penjelasanSingkat: 'Menghubungkan beberapa benda sebagai contoh — masih ada yang lain yang tidak disebutkan.',
        contoh: [
            { jp: '猫や犬がいます。', id: 'Ada kucing, anjing, dan lain-lain.' },
            { jp: 'りんごやバナナを買いました。', id: 'Membeli apel, pisang, dan sebagainya.' },
            { jp: '本やペンなどをください。', id: 'Tolong beri buku, pulpen, dan lain-lain.' }
        ],
        perbandingan: 'や vs と: や untuk daftar TIDAK LENGKAP (hanya contoh), と untuk daftar LENGKAP.',
        catatan: 'Sering dipasangkan dengan など di akhir: 「AやBなど」.',
        salah: 'Jangan pakai や jika daftarnya lengkap (pakai と).',
        miniPractice: {
            soal: 'ねこ ___ いぬなど。(Kucing, anjing, dll — parsial)',
            jawaban: 'や', options: ['と', 'や', 'も']
        },
        semuaFungsi: [],
        cerita: 'や adalah "etalase toko" — kamu lihat beberapa contoh barang di etalase, tapi masih banyak barang lain di dalam toko.',
        diagram: { tipe: 'lingkaran', label: '🔓 Daftar terbuka (masih ada lain)' },
        jlptQuestions: [
            { soal: 'スーパーで野菜 ___ 果物などを買いました。', opsi: ['と', 'や', 'も', 'に'], jawaban: 1, penjelasan: 'や untuk daftar parsial — sayur, buah, dan sebagainya.' }
        ]
    },
    {
        id: 'ka_choice', char: 'か', romaji: 'ka', tingkat: 'N5',
        kategori: ['daftar-pilihan', 'akhir-kalimat'],
        fungsi: 'Penanda pilihan: "atau" / pertanyaan',
        rumus: '[A] + か + [B] / [Kalimat] + か',
        label: 'Partikel "Atau" / Tanya',
        subkategori: 'pilihan',
        penjelasanSingkat: 'Menghubungkan dua pilihan. Juga partikel tanya di akhir kalimat.',
        contoh: [
            { jp: 'コーヒーか紅茶をください。', id: 'Tolong kopi atau teh.' },
            { jp: '行くかどうか決めていません。', id: 'Belum memutuskan akan pergi atau tidak.' },
            { jp: 'これかそれかどちらか選んでください。', id: 'Pilih ini atau itu.' },
            { jp: '学生ですか。', id: 'Apakah (kamu) pelajar?' },
            { jp: 'どこかへ行きましょう。', id: 'Ayo pergi ke suatu tempat.' }
        ],
        perbandingan: 'か (pilihan) menyajikan opsi. か (tanya) mengubah kalimat jadi pertanyaan.',
        catatan: '「どこか」= suatu tempat, 「誰か」= seseorang. か + どうか = "apakah ~ atau tidak".',
        salah: 'Jangan pakai か sebagai "atau" dalam kalimat tanya yang sudah pakai か di akhir.',
        miniPractice: {
            soal: 'コーヒー ___ こうちゃ。(Kopi atau teh)',
            jawaban: 'か', options: ['か', 'と', 'や']
        },
        semuaFungsi: [],
        cerita: 'か adalah "cabang jalan" — kiri atau kanan? Kopi atau teh? Pergi atau tidak? Dia selalu tentang pilihan, entah sebagai pertanyaan atau sebagai opsi.',
        diagram: { tipe: 'cabang', label: '🔀 Pilihan bercabang' },
        jlptQuestions: []
    },
    {
        id: 'toka', char: 'とか', romaji: 'toka', tingkat: 'N4',
        kategori: ['daftar-pilihan'],
        fungsi: 'Penanda contoh: "seperti... dan..."',
        rumus: '[A] + とか + [B] + とか + [KK]',
        label: 'Partikel "Seperti... dan..."',
        subkategori: 'contoh',
        penjelasanSingkat: 'Memberikan contoh-contoh, sering dipakai dalam percakapan informal. Lebih santai daripada や.',
        contoh: [
            { jp: 'マンガとかアニメとかが好きです。', id: 'Suka manga, anime, dan semacamnya.' },
            { jp: '休みには映画とか見ます。', id: 'Saat libur, saya menonton film atau sesuatu.' },
            { jp: '彼は来ないとか言ってたよ。', id: 'Dia bilang tidak akan datang atau gimana gitu.' }
        ],
        perbandingan: 'とか vs や: とか lebih informal dan bisa dipakai untuk kutipan tidak langsung.',
        catatan: 'Bisa dipakai untuk mengutip informasi yang tidak pasti.',
        salah: 'Jangan pakai とか dalam tulisan formal.',
        semuaFungsi: [],
        cerita: 'とか adalah "atau apa gitu" — santai, tidak formal, dan tidak presisi. Seperti etalase toko yang berantakan — "ada ini, ada itu... ya gitu deh."',
        diagram: { tipe: 'daftar', label: '📋 ...atau gimana gitu' },
        jlptQuestions: []
    },

    // ========================================
    // KATEGORI 4: FOKUS & PENEKANAN
    // ========================================
    {
        id: 'mo', char: 'も', romaji: 'mo', tingkat: 'N5',
        kategori: ['fokus-penekanan'],
        fungsi: 'Penanda "juga" / "bahkan"',
        rumus: '[Kata] + も + [Predikat]',
        label: 'Partikel "Juga / Bahkan"',
        subkategori: 'fokus',
        penjelasanSingkat: 'Menggantikan は/が/を untuk menambahkan makna "juga", "baik... maupun...", atau "bahkan".',
        contoh: [
            { jp: '私も学生です。', id: 'Saya juga pelajar.' },
            { jp: '猫も犬も好きです。', id: 'Suka kucing maupun anjing.' },
            { jp: 'それもください。', id: 'Yang itu juga tolong beri.' },
            { jp: '子供もできる簡単な料理', id: 'Masakan mudah yang bahkan anak kecil pun bisa.' },
            { jp: '一人もいません。', id: 'Tidak ada satu orang pun.' }
        ],
        perbandingan: 'も menggantikan は/が/を. 「私も」= saya juga. 「猫も犬も」= baik kucing maupun anjing.',
        catatan: 'も + 否定 = "tidak ada satu pun". 「一人もいない」= tidak ada seorang pun.',
        salah: 'Jangan gabung も dengan は/が/を (も menggantikan mereka). 「私はも」× — salah.',
        miniPractice: {
            soal: 'わたし ___ がくせいです。(Saya juga pelajar)',
            jawaban: 'も', options: ['も', 'は', 'が']
        },
        semuaFungsi: [
            {
                judul: '"Juga" — pengganti は/が/を',
                penjelasan: 'も menggantikan partikel は/が/を untuk menambahkan makna "juga".',
                rumus: '[Kata] + も + [Predikat]',
                contoh: ['兄も学生です。→ Kakak laki-laki juga pelajar.', 'これもください。→ Ini juga tolong beri.']
            },
            {
                judul: '"Baik... maupun..." — も...も',
                penjelasan: 'Dua も berpasangan untuk "A maupun B" (positif) atau "A maupun B tidak" (negatif).',
                rumus: '[A] + も + [B] + も + [Predikat]',
                contoh: ['肉も魚も好きです。→ Suka daging maupun ikan.', '土曜も日曜も働きます。→ Bekerja Sabtu maupun Minggu.']
            }
        ],
        cerita: 'も adalah "teman nongkrong" — kalau ada yang melakukan sesuatu, も ikut-ikutan. "Saya MAKAN" → "Saya juga MAKAN". Dia juga bisa memperluas hingga ke ekstrem — "Bahkan anak kecil pun bisa."',
        diagram: { tipe: 'ilustrasi', label: '➕ Juga / Bahkan' },
        jlptQuestions: [
            { soal: '私 ___ コーヒーが好きです。', opsi: ['は', 'も', 'が', 'を'], jawaban: 1, penjelasan: '"Saya juga suka kopi" — も untuk "juga".' }
        ]
    },
    {
        id: 'koso', char: 'こそ', romaji: 'koso', tingkat: 'N3',
        kategori: ['fokus-penekanan'],
        fungsi: 'Penanda penekanan kuat: "justru" / "persis"',
        rumus: '[Kata] + こそ + [Predikat]',
        label: 'Partikel "Justru / Persis"',
        subkategori: 'fokus',
        penjelasanSingkat: 'Menekankan bahwa yang disebutkan adalah yang paling penting, tepat, atau satu-satunya.',
        contoh: [
            { jp: '今日こそ勉強します。', id: 'Hari ini benar-benar (pasti) akan belajar.' },
            { jp: 'これこそ本物です。', id: 'Ini-lah yang asli (bukan yang lain).' },
            { jp: '練習こそ成功の鍵です。', id: 'Latihan-lah kunci kesuksesan.' },
            { jp: 'こちらこそよろしくお願いします。', id: 'Saya juga (justru saya yang) mohon bantuannya.' }
        ],
        perbandingan: 'こそ vs は: こそ lebih kuat dari は. 「これが本物」= ini yang asli. 「これこそ本物」= INI-lah yang asli (penekanan maksimal).',
        catatan: 'Sering dipakai dalam salam: 「こちらこそ」= saya juga (justru saya).',
        salah: 'Jangan terlalu sering pakai こそ — terdengar dramatis.',
        miniPractice: {
            soal: 'これ ___ ほんものだ。(INILAH yang asli)',
            jawaban: 'こそ', options: ['こそ', 'は', 'が']
        },
        semuaFungsi: [],
        cerita: 'こそ adalah "stempel emas" yang dicapkan dengan keras: "INILAH DIA! Yang ini! Bukan yang lain!" Kalau は adalah lampu sorot, こそ adalah lampu sorot laser super terang yang bikin silau.',
        diagram: { tipe: 'ilustrasi', label: '⭐ Penekanan maksimal' },
        jlptQuestions: []
    },
    {
        id: 'sae', char: 'さえ', romaji: 'sae', tingkat: 'N3',
        kategori: ['fokus-penekanan'],
        fungsi: 'Penanda "bahkan" (kasus ekstrem)',
        rumus: '[Kata] + さえ + [Predikat]',
        label: 'Partikel "Bahkan (ekstrem)"',
        subkategori: 'fokus',
        penjelasanSingkat: 'Menunjukkan bahwa sesuatu melampaui batas normal — "bahkan X pun..."',
        contoh: [
            { jp: '子供さえ知っています。', id: 'Bahkan anak kecil pun tahu.' },
            { jp: '水さえ飲めませんでした。', id: 'Bahkan air pun tidak bisa minum.' },
            { jp: '名前さえ書けなかった。', id: 'Bahkan namanya saja tidak bisa menulis.' },
            { jp: '親にさえ言っていません。', id: 'Bahkan pada orang tua pun tidak bilang.' }
        ],
        perbandingan: 'さえ vs も: も untuk "juga/bahkan" biasa, さえ untuk "bahkan" yang lebih kuat (kasus di luar dugaan).',
        catatan: 'Pola 「さえ~ば」= "jika saja... maka..." 「お金さえあれば」= jika saja ada uang.',
        salah: 'Jangan pakai さえ untuk "juga" biasa — terlalu kuat.',
        miniPractice: {
            soal: 'こども ___ しっている。(Bahkan anak kecil pun tahu)',
            jawaban: 'さえ', options: ['さえ', 'も', 'こそ']
        },
        semuaFungsi: [],
        cerita: 'さえ adalah "batas keterkejutan" — ketika sesuatu terjadi hingga level yang tidak terduga. 「子供さえ知っている」— sampai anak kecil pun tahu, masa kamu tidak?',
        diagram: { tipe: 'skala', label: '📊 Lebih ekstrem dari も' },
        jlptQuestions: []
    },
    {
        id: 'demo_even', char: 'でも', romaji: 'demo', tingkat: 'N5',
        kategori: ['fokus-penekanan'],
        fungsi: 'Penanda "bahkan / atau sesuatu"',
        rumus: '[Kata] + でも + [Predikat]',
        label: 'Partikel "Bahkan / Atau sesuatu"',
        subkategori: 'fokus',
        penjelasanSingkat: 'Bisa berarti "bahkan" (contoh ekstrem) atau "atau sesuatu" (saran santai).',
        contoh: [
            { jp: '子どもでもわかります。', id: 'Bahkan anak kecil pun mengerti.' },
            { jp: 'コーヒーでも飲みませんか。', id: 'Mau minum kopi atau sesuatu?' },
            { jp: '先生でも間違えます。', id: 'Bahkan guru pun salah.' },
            { jp: '日曜日でも開いています。', id: 'Bahkan hari Minggu pun buka.' }
        ],
        perbandingan: 'でも vs さえ: でも lebih ringan, さえ lebih kuat. 「子どもでもわかる」= anak kecil juga ngerti. 「子どもさえわかる」= BAHKAN anak kecil ngerti (sampai segitunya).',
        catatan: 'でも untuk saran santai: 「映画でも見ない？」= nonton film atau gimana?',
        salah: 'Jangan tertukar でも (partikel) dengan でも (konjungsi = tapi).',
        miniPractice: {
            soal: 'こども ___ わかる。(Bahkan anak kecil pun mengerti)',
            jawaban: 'でも', options: ['でも', 'さえ', 'も']
        },
        semuaFungsi: [],
        cerita: 'でも seperti "a gun a" — ringan dan santai. 「コーヒーでも」= "kopi atau apa gitu..." lembut. Tapi 「子供でもわかる」= "sampai anak kecil ngerti" — masih lebih ringan dari さえ.',
        diagram: { tipe: 'skala', label: '😊 Santai vs ekstrem' },
        jlptQuestions: []
    },

    // ========================================
    // KATEGORI 5: PARTIKEL AKHIR KALIMAT
    // ========================================
    {
        id: 'ka_q', char: 'か', romaji: 'ka', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Partikel tanya',
        rumus: '[Kalimat] + か + ？ / [KB] + か + [KB] (atau)',
        label: 'Partikel Tanya',
        subkategori: 'tanya',
        penjelasanSingkat: 'Mengubah kalimat menjadi pertanyaan. Cukup tambahkan か di akhir kalimat.',
        contoh: [
            { jp: '学生ですか。', id: 'Apakah (kamu) pelajar?' },
            { jp: 'これですか。', id: 'Apakah ini?' },
            { jp: 'どこですか。', id: 'Di mana?' },
            { jp: 'コーヒーか紅茶か', id: 'Kopi atau teh?' }
        ],
        perbandingan: 'Dalam percakapan informal, か sering dihilangkan dan diganti intonasi naik.',
        catatan: 'Dalam bahasa formal tulis, か tetap dipakai meski dalam kalimat tanya.',
        salah: 'Dalam percakapan santai, jangan terlalu kaku pakai か — cukup dengan intonasi naik.',
        miniPractice: {
            soal: 'がくせいです ___ 。(Apakah pelajar?)',
            jawaban: 'か', options: ['か', 'ね', 'よ']
        },
        semuaFungsi: [],
        cerita: 'か adalah "tanda tanya dalam bentuk partikel". Dalam bahasa Jepang, kamu tidak perlu mengubah urutan kata — cukup tempel か di akhir.',
        diagram: { tipe: 'ikon', label: '❓ Tanda tanya' },
        jlptQuestions: []
    },
    {
        id: 'ne', char: 'ね', romaji: 'ne', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Partikel konfirmasi / softener',
        rumus: '[Kalimat] + ね',
        label: 'Partikel "Ya kan? / Ya?"',
        subkategori: 'konfirmasi',
        penjelasanSingkat: 'Mencari persetujuan atau memastikan lawan bicara setuju. Juga berfungsi sebagai "softener" agar tidak terdengar terlalu tegas.',
        contoh: [
            { jp: 'いい天気ですね。', id: 'Cuaca bagus ya.' },
            { jp: 'そうですよね。', id: 'Betul juga ya.' },
            { jp: '難しいですね。', id: 'Sulit ya.' },
            { jp: '明日は休みですね。', id: 'Besok libur kan?' },
            { jp: 'おいしいね。', id: 'Enak ya (casual).' }
        ],
        perbandingan: 'ね vs よ: ね untuk konfirmasi/softener, よ untuk info baru/penekanan.',
        catatan: 'ね adalah partikel paling sering dipakai dalam percakapan. Membuat kalimat terdengar lebih ramah.',
        salah: 'Jangan pakai ね dalam tulisan formal atau laporan.',
        miniPractice: {
            soal: 'いいてんきです ___ 。(Cuaca bagus ya)',
            jawaban: 'ね', options: ['ね', 'よ', 'か']
        },
        semuaFungsi: [],
        cerita: 'ね adalah "anggguk kecil" dalam bentuk partikel. Dia bilang "Kamu setuju kan?" atau sekadar membuat kalimat lebih lembut. Dalam budaya Jepang yang harmoni, ね menjaga agar percakapan tetap halus.',
        diagram: { tipe: 'ilustrasi', label: '🤝 Mencari persetujuan' },
        jlptQuestions: []
    },
    {
        id: 'yo', char: 'よ', romaji: 'yo', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Partikel penekanan / info baru',
        rumus: '[Kalimat] + よ',
        label: 'Partikel "Lho / Kok"',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Memberitahu lawan bicara informasi yang mereka belum tahu, atau menekankan pendapat sendiri. Tidak sopan dipakai ke atasan.',
        contoh: [
            { jp: 'もうすぐ着きますよ。', id: 'Sebentar lagi sampai, lho.' },
            { jp: 'これ、おいしいですよ。', id: 'Ini enak, lho.' },
            { jp: '知っていますよ。', id: 'Saya tahu kok.' },
            { jp: '大丈夫ですよ。', id: 'Tidak apa-apa kok.' },
            { jp: '明日は休みですよ。', id: 'Besok libur, lho.' }
        ],
        perbandingan: 'よ vs ね: よ untuk memberi info baru, ね untuk konfirmasi. Gabung jadi よね = "iya kan?" + "lho".',
        catatan: 'よ bisa dianggap kurang sopan jika dipakai ke orang yang lebih tua — karena terkesan "saya tahu, kamu tidak tahu".',
        salah: 'Jangan pakai よ ke atasan atau orang yang tidak akrab.',
        miniPractice: {
            soal: 'おいしいです ___ 。(Enak, lho)',
            jawaban: 'よ', options: ['よ', 'ね', 'か']
        },
        semuaFungsi: [],
        cerita: 'よ adalah "sikut kecil" — "Hei, dengar! Ini penting!" atau "Kamu belum tahu kan? Ini lho..." Dia bersemangat, tapi kadang kurang sopan.',
        diagram: { tipe: 'ilustrasi', label: '💡 Info baru!' },
        jlptQuestions: []
    },
    {
        id: 'yone', char: 'よね', romaji: 'yone', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Gabungan konfirmasi + penekanan',
        rumus: '[Kalimat] + よね',
        label: 'Partikel "Iya kan?"',
        subkategori: 'konfirmasi',
        penjelasanSingkat: 'Gabungan よ + ね. Memberi informasi baru sambil mencari persetujuan. "Ini lho... iya kan?"',
        contoh: [
            { jp: '明日はテストですよね。', id: 'Besok ujian kan?' },
            { jp: 'ここは静かですよね。', id: 'Di sini sepi ya (dan kamu setuju kan?)' },
            { jp: '大丈夫ですよね。', id: 'Tidak apa-apa kan?' },
            { jp: 'そうですよね。', id: 'Betul juga ya (sambil mengkonfirmasi).' }
        ],
        perbandingan: 'よね adalah よ + ね — kekuatan よ (info baru) + kelembutan ね (konfirmasi).',
        catatan: 'Sering dipakai untuk memastikan sesuatu yang kamu pikir sudah benar.',
        salah: 'Jangan gunakan よね untuk hal yang 100% pasti.',
        semuaFungsi: [],
        cerita: 'よね adalah "tangan di dagu sambil mikir" — kamu punya informasi, tapi ingin dikonfirmasi. "Besok ujian kan? (saya hampir yakin, tapi tolong pastikan)"',
        diagram: { tipe: 'ilustrasi', label: '🤔 Konfirmasi + info' },
        jlptQuestions: []
    },
    {
        id: 'na', char: 'な', romaji: 'na', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Partikel larangan / eksklamasi (tergantung konteks)',
        rumus: '[KK Bentuk Kamus] + な (larangan) / [KS] + な (eksklamasi)',
        label: 'Partikel Larangan / Eksklamasi',
        subkategori: 'larangan',
        penjelasanSingkat: 'Bisa berarti larangan keras ("jangan!") atau perasaan kagum/heran ("ya ampun").',
        contoh: [
            { jp: '行くな！', id: 'Jangan pergi!' },
            { jp: '食べるな！', id: 'Jangan makan!' },
            { jp: 'きれいだなあ。', id: 'Cantiknya...' },
            { jp: 'いいなあ。', id: 'Enak ya... (iri)' },
            { jp: '危ないな。', id: 'Bahaya nih.' }
        ],
        perbandingan: 'な sebagai larangan: kasual tapi tegas. な sebagai eksklamasi: perasaan pribadi (seperti bergumam sendiri).',
        catatan: 'Larangan dengan な adalah bentuk kasar. Jangan dipakai ke atasan. Eksklamasi dengan な lebih sering dipakai pria.',
        salah: 'Jangan pakai な larangan ke orang yang lebih tua — sangat kasar.',
        miniPractice: {
            soal: 'いく ___ ！(Jangan pergi!)',
            jawaban: 'な', options: ['な', 'よ', 'か']
        },
        semuaFungsi: [],
        cerita: 'な adalah partikel "dua wajah". Wajah pertama: TEGAS — "Jangan!" (larangan, nada keras). Wajah kedua: LEMBUT — "Wah... indahnya..." (bergumam sendiri, nada puitis).',
        diagram: { tipe: 'dua', label: '⛔ Larangan / 😌 Eksklamasi' },
        jlptQuestions: []
    },
    {
        id: 'zo', char: 'ぞ', romaji: 'zo', tingkat: 'N4',
        kategori: ['akhir-kalimat'],
        fungsi: 'Penekanan kuat (maskulin)',
        rumus: '[Kalimat] + ぞ',
        label: 'Partikel "Lho!" (Maskulin, tegas)',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Penekanan kuat yang dipakai terutama oleh pria. Menunjukkan keyakinan, peringatan, atau tekad.',
        contoh: [
            { jp: '行くぞ！', id: 'Ayo (kita) pergi!' },
            { jp: '危ないぞ！', id: 'Bahaya, lho!' },
            { jp: '遅れるぞ！', id: 'Nanti telat, lho!' },
            { jp: '絶対勝つぞ！', id: 'Pasti menang!' }
        ],
        perbandingan: 'ぞ vs よ: ぞ lebih kuat dan maskulin. よ lebih netral. ぞ seperti "teriak semangat", よ seperti "nasehat".',
        catatan: 'Terkesan maskulin dan kasar. Pria sering memakainya, wanita biasanya tidak.',
        salah: 'Jangan dipakai dalam situasi formal atau oleh wanita (kecuali ingin terdengar tomboi).',
        miniPractice: {
            soal: 'いく ___ ！(Ayo pergi! — maskulin)',
            jawaban: 'ぞ', options: ['ぞ', 'よ', 'な']
        },
        semuaFungsi: [],
        cerita: 'ぞ adalah "teriakan semangat" — seperti Kamehameha dalam Dragon Ball. "行くぞ!" = "Ayo (kita) gas!" Maskulin, penuh energi, kadang mengintimidasi.',
        diagram: { tipe: 'ilustrasi', label: '💪 Maskulin, tegas' },
        jlptQuestions: []
    },
    {
        id: 'ze', char: 'ぜ', romaji: 'ze', tingkat: 'N4',
        kategori: ['akhir-kalimat'],
        fungsi: 'Ajakan / penekanan ringan (maskulin, kasual)',
        rumus: '[Kalimat] + ぜ',
        label: 'Partikel "Yuk!" (Maskulin, kasual)',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Lebih ringan dari ぞ. Sering dipakai untuk ajakan santai antar teman pria.',
        contoh: [
            { jp: '行こうぜ！', id: 'Yuk, pergi!' },
            { jp: 'やるぜ！', id: 'Ayo lakukan!' },
            { jp: 'これはすごいぜ。', id: 'Ini keren, bro.' }
        ],
        perbandingan: 'ぜ vs ぞ: ぜ lebih ringan seperti ajakan, ぞ lebih keras seperti perintah/peringatan.',
        catatan: 'Sangat kasual. Hanya untuk teman akrab.',
        salah: 'Jangan dipakai dalam situasi formal atau ke orang yang baru dikenal.',
        semuaFungsi: [],
        cerita: 'ぜ adalah "tepuk bahu" — "Yuk, bro! Gas!" Dia tidak sekeras ぞ, lebih kayak ajakan santai.',
        diagram: { tipe: 'ilustrasi', label: '🤙 Santai, maskulin' },
        jlptQuestions: []
    },
    {
        id: 'wa_f', char: 'わ', romaji: 'wa', tingkat: 'N4',
        kategori: ['akhir-kalimat'],
        fungsi: 'Penekanan ringan (feminin)',
        rumus: '[Kalimat] + わ',
        label: 'Partikel "Lho..." (Feminin)',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Penekanan ringan yang dipakai terutama oleh wanita. Terdengar lembut dan feminin.',
        contoh: [
            { jp: 'そうかしら、わからないわ。', id: 'Ya ampun, tidak tahu deh.' },
            { jp: 'きれいだわ。', id: 'Cantiknya...' },
            { jp: 'いいわよ。', id: 'Baiklah (dengan penekanan feminin).' }
        ],
        perbandingan: 'わ vs よ: わ lebih lembut dan feminin, よ lebih netral.',
        catatan: 'Pria juga kadang pakai わ di daerah Kansai, tapi dengan intonasi berbeda.',
        salah: 'Pria non-Kansai yang pakai わ akan terdengar aneh atau terlalu feminin.',
        semuaFungsi: [],
        cerita: 'わ adalah "sentuhan lembut" — seperti よ tapi lebih halus dan feminin. Di Kansai, わ dipakai juga oleh pria dengan intonasi datar.',
        diagram: { tipe: 'ilustrasi', label: '🌸 Lembut, feminin' },
        jlptQuestions: []
    },
    {
        id: 'kana', char: 'かな', romaji: 'kana', tingkat: 'N5',
        kategori: ['akhir-kalimat'],
        fungsi: 'Partikel "ya... / I wonder"',
        rumus: '[Kalimat] + かな',
        label: 'Partikel "Ya... / Barangkali"',
        subkategori: 'keraguan',
        penjelasanSingkat: 'Mengekspresikan keraguan, pertanyaan pada diri sendiri, atau "saya bertanya-tanya".',
        contoh: [
            { jp: '明日は晴れるかな。', id: 'Ya, besok cerah tidak ya...' },
            { jp: '彼は来るかなあ。', id: 'Dia datang tidak ya...' },
            { jp: 'これでいいかな。', id: 'Apa begini sudah benar ya?' },
            { jp: 'どうかな。', id: 'Bagaimana ya... (ragu)' }
        ],
        perbandingan: 'かな vs か: かな lebih untuk diri sendiri (bergumam), か untuk bertanya ke orang lain.',
        catatan: 'Bisa untuk pertanyaan halus ke lawan bicara dengan intonasi naik.',
        salah: 'Jangan pakai かな untuk pertanyaan yang membutuhkan jawaban pasti.',
        miniPractice: {
            soal: 'あしたははれる ___ 。(Besok cerah tidak ya...)',
            jawaban: 'かな', options: ['かな', 'か', 'よ']
        },
        semuaFungsi: [],
        cerita: 'かな adalah "gumaman kecil" — bertanya pada diri sendiri. "Besok hujan nggak ya..." atau "Gimana ya..." — tidak mengharapkan jawaban dari orang lain.',
        diagram: { tipe: 'ilustrasi', label: '🤔 Bergumam' },
        jlptQuestions: []
    },

    // ========================================
    // KATEGORI 6: PARTIKEL PENGHUBUNG
    // ========================================
    {
        id: 'ga_but', char: 'が', romaji: 'ga', tingkat: 'N5',
        kategori: ['penghubung'],
        fungsi: 'Penghubung kontras: "tetapi"',
        rumus: '[Klausa 1] + が + [Klausa 2]',
        label: 'Partikel "Tetapi"',
        subkategori: 'kontras',
        penjelasanSingkat: 'Menghubungkan dua klausa dengan hubungan kontras — "tetapi", "namun". Juga sebagai soft opener.',
        contoh: [
            { jp: '日本語は難しいですが、おもしろいです。', id: 'Bahasa Jepang sulit, tapi menarik.' },
            { jp: '毎日勉強していますが、なかなか上手になりません。', id: 'Belajar setiap hari, tapi tidak kunjung pintar.' },
            { jp: 'すみませんが、駅はどこですか。', id: 'Maaf, (tapi) stasiun di mana?' }
        ],
        perbandingan: 'が vs けど: が lebih formal, けど lebih informal.',
        catatan: 'Juga dipakai sebagai pembuka halus (tanpa arti "tetapi").',
        salah: 'Jangan pakai が untuk alasan (pakai から/ので).',
        miniPractice: {
            soal: 'にほんごはむずかしいです ___ 、おもしろいです。(...tapi...)',
            jawaban: 'が', options: ['が', 'から', 'ので']
        },
        semuaFungsi: [],
        cerita: 'が penghubung adalah "tapi yang sopan" — seperti menepuk bahu lalu bilang "tapi...". Dia juga bisa jadi pembuka basa-basi — "Maaf, tapi..." tanpa benar-benar kontras.',
        diagram: { tipe: 'ilustrasi', label: '↔️ Kontras formal' },
        jlptQuestions: []
    },
    {
        id: 'kedo', char: 'けど', romaji: 'kedo', tingkat: 'N5',
        kategori: ['penghubung'],
        fungsi: 'Penghubung kontras informal: "tapi"',
        rumus: '[Klausa 1] + けど + [Klausa 2]',
        label: 'Partikel "Tapi" (Informal)',
        subkategori: 'kontras',
        penjelasanSingkat: 'Sama seperti が tetapi lebih informal. Sangat sering dipakai dalam percakapan sehari-hari.',
        contoh: [
            { jp: '高いけど、買います。', id: 'Mahal tapi beli.' },
            { jp: '行きたいけど、時間がない。', id: 'Mau pergi tapi tidak ada waktu.' },
            { jp: 'ちょっと聞きたいんですけど。', id: 'Mau tanya sedikit, tapi...' }
        ],
        perbandingan: 'けど vs が: けど lebih santai dan lebih pendek. Bisa juga けれども (lebih formal).',
        catatan: 'Sering dipakai di akhir kalimat tanpa klausa kedua (kalimat menggantung).',
        salah: 'Jangan pakai けど dalam tulisan formal atau dokumen resmi.',
        semuaFungsi: [],
        cerita: 'けど adalah が versi "santai" — seperti "tapi" dalam chat. Lebih pendek, lebih enak diucapkan, dan kadang kalimatnya menggantung.',
        diagram: { tipe: 'ilustrasi', label: '↔️ Kontras kasual' },
        jlptQuestions: []
    },
    {
        id: 'kara_cause', char: 'から', romaji: 'kara', tingkat: 'N5',
        kategori: ['penghubung'],
        fungsi: 'Penghubung alasan: "karena" (subjektif)',
        rumus: '[Alasan] + から + [Akibat]',
        label: 'Partikel "Karena" (Subjektif)',
        subkategori: 'alasan',
        penjelasanSingkat: 'Menjelaskan alasan subjektif. Lebih informal dan personal daripada ので.',
        contoh: [
            { jp: '安いから買いました。', id: 'Karena murah, saya beli.' },
            { jp: '天気がいいから散歩しましょう。', id: 'Karena cuaca bagus, ayo jalan-jalan.' },
            { jp: 'おなかがすいたから、食べよう。', id: 'Karena lapar, ayo makan.' }
        ],
        perbandingan: 'から vs ので: から untuk alasan subjektif/personal, ので untuk alasan objektif/faktual.',
        catatan: 'Dalam kalimat sopan, ので lebih direkomendasikan daripada から.',
        salah: 'Jangan pakai から untuk alasan objektif dalam tulisan formal.',
        semuaFungsi: [],
        cerita: 'から sebagai "karena" adalah "karena versi saya" — alasan pribadi. "Karena saya lapar", "Karena saya mau" — subjektif. Kalau ingin lebih sopan, pakai ので.',
        diagram: { tipe: 'ilustrasi', label: '🧑 Alasan personal' },
        jlptQuestions: []
    },
    {
        id: 'node', char: 'ので', romaji: 'node', tingkat: 'N4',
        kategori: ['penghubung'],
        fungsi: 'Penghubung alasan: "karena" (objektif, sopan)',
        rumus: '[Alasan] + ので + [Akibat]',
        label: 'Partikel "Karena" (Objektif)',
        subkategori: 'alasan',
        penjelasanSingkat: 'Menjelaskan alasan objektif atau faktual. Lebih sopan dan formal daripada から.',
        contoh: [
            { jp: '雨が降りましたので、試合は中止です。', id: 'Karena hujan turun, pertandingan dibatalkan.' },
            { jp: '体調がよくないので、休みます。', id: 'Karena kondisi badan tidak baik, saya istirahat.' },
            { jp: 'お待たせしましたので、申し訳ありません。', id: 'Karena telah membuat Anda menunggu, maaf.' }
        ],
        perbandingan: 'ので vs から: ので untuk fakta/situasi objektif ("karena hujan"), から untuk alasan personal/subjektif ("karena saya mau").',
        catatan: 'ので lebih sopan. Dalam surat dan pembicaraan formal, ので lebih baik daripada から.',
        salah: 'Jangan gunakan ので untuk ajakan/perintah langsung — pakai から.',
        semuaFungsi: [],
        cerita: 'ので adalah "karena versi formal" — seperti saksi di pengadilan yang menyampaikan fakta. "Hujan turun, oleh karena itu pertandingan dibatalkan." Tidak ada perasaan pribadi, hanya fakta.',
        diagram: { tipe: 'ilustrasi', label: '📋 Alasan faktual' },
        jlptQuestions: []
    },
    {
        id: 'noni', char: 'のに', romaji: 'noni', tingkat: 'N4',
        kategori: ['penghubung'],
        fungsi: 'Penghubung kontras: "meskipun / padahal"',
        rumus: '[Klausa 1] + のに + [Klausa 2]',
        label: 'Partikel "Meskipun / Padahal"',
        subkategori: 'kontras',
        penjelasanSingkat: 'Menunjukkan kontras yang tidak terduga — "meskipun X, ternyata Y" dengan nuansa kecewa.',
        contoh: [
            { jp: '勉強したのに、テストに合格できませんでした。', id: 'Padahal sudah belajar, tapi tidak lulus ujian.' },
            { jp: '雨なのに、出かけました。', id: 'Meskipun hujan, (dia) pergi.' },
            { jp: '安いのに、美味しいです。', id: 'Meskipun murah, enak.' },
            { jp: '待っているのに、来ない。', id: 'Padahal sudah menunggu, (dia) tidak datang.' }
        ],
        perbandingan: 'のに vs が: のに menunjukkan "harapan yang tidak terpenuhi" — ada rasa kecewa. が hanya kontras netral.',
        catatan: 'のに sering mengandung rasa kecewa, sesal, atau tidak puas.',
        salah: 'Jangan pakai のに jika tidak ada nuansa "harapan yang tidak terpenuhi".',
        miniPractice: {
            soal: 'べんきょうした ___ 、しけんにごうかくできなかった。(Padahal belajar, tdk lulus)',
            jawaban: 'のに', options: ['のに', 'けど', 'が']
        },
        semuaFungsi: [],
        cerita: 'のに adalah "padahal" dengan hati kecewa — "Padahal aku sudah belajar... kenapa tidak lulus?" Ada ekspektasi (belajar → lulus) yang patah. Bedanya dengan が (kontras netral), のに selalu ada emosi.',
        diagram: { tipe: 'ilustrasi', label: '😔 Ekspektasi vs realita' },
        jlptQuestions: []
    },
    {
        id: 'nagara', char: 'ながら', romaji: 'nagara', tingkat: 'N4',
        kategori: ['penghubung'],
        fungsi: 'Penghubung "sambil"',
        rumus: '[KK Bentuk Masu] + ながら + [KK Utama]',
        label: 'Partikel "Sambil"',
        subkategori: 'bersamaan',
        penjelasanSingkat: 'Menunjukkan dua aksi yang dilakukan bersamaan oleh subjek yang sama.',
        contoh: [
            { jp: '音楽を聞きながら勉強します。', id: 'Belajar sambil mendengar musik.' },
            { jp: 'テレビを見ながらご飯を食べます。', id: 'Makan sambil menonton TV.' },
            { jp: '歩きながら話しましょう。', id: 'Mari bicara sambil berjalan.' }
        ],
        perbandingan: 'ながら vs 間(あいだ)に: ながら untuk dua aksi simultan oleh satu subjek. 間に untuk "selama" oleh subjek berbeda.',
        catatan: 'KK bentuk masu tanpa ます + ながら.',
        salah: 'Jangan pakai ながら untuk subjek yang berbeda. "Saya menyanyi sambil dia mandi" × tidak bisa.',
        miniPractice: {
            soal: 'おんがくをきき ___ べんきょうします。(Sambil dengar musik, belajar)',
            jawaban: 'ながら', options: ['ながら', 'から', 'ので']
        },
        semuaFungsi: [],
        cerita: 'ながら adalah "multitasking" dalam bentuk grammar. Satu orang melakukan dua hal sekaligus. 「聞きながら勉強」= sambil dengar, belajar.',
        diagram: { tipe: 'ilustrasi', label: '🎧 Sambil...' },
        jlptQuestions: []
    },
    {
        id: 'tari', char: 'たり', romaji: 'tari', tingkat: 'N5',
        kategori: ['penghubung'],
        fungsi: 'Penanda "kadang... kadang... / melakukan hal seperti"',
        rumus: '[KK Bentuk Ta] + り + [KK Bentuk Ta] + り + する',
        label: 'Partikel "Melakukan hal seperti..."',
        subkategori: 'contoh',
        penjelasanSingkat: 'Memberikan contoh aktivitas dengan implikasi ada aktivitas lain yang tidak disebutkan.',
        contoh: [
            { jp: '本を読んだり、音楽を聞いたりします。', id: 'Kadang baca buku, kadang dengar musik, dan sebagainya.' },
            { jp: '日曜日は掃除したり洗濯したりします。', id: 'Hari Minggu bersih-bersih, cuci pakaian, dan lain-lain.' },
            { jp: '行ったり来たりしています。', id: 'Pergi pulang terus (bolak-balik).' }
        ],
        perbandingan: 'たり vs や: たり untuk aktivitas, や untuk benda. 「本を読んだり」= baca buku (aktivitas). 「本やペン」= buku dan pulpen (benda).',
        catatan: 'Bisa cukup dengan satu たり (contoh tunggal). KK bentuk ta + り.',
        salah: 'Jangan pakai たり untuk daftar yang lengkap.',
        semuaFungsi: [],
        cerita: 'たり adalah "dan lain-lain versi aktivitas". 「読んだり、書いたり」— membaca dan menulis, dan melakukan hal-hal lain juga.',
        diagram: { tipe: 'daftar', label: '📋 A, B, dll (aktivitas)' },
        jlptQuestions: []
    },
    {
        id: 'shi', char: 'し', romaji: 'shi', tingkat: 'N5',
        kategori: ['penghubung'],
        fungsi: 'Penghubung daftar alasan: "lagi pula / dan juga"',
        rumus: '[Alasan 1] + し + [Alasan 2] + し + [Kesimpulan]',
        label: 'Partikel "Lagi pula / Dan juga"',
        subkategori: 'alasan',
        penjelasanSingkat: 'Menyebutkan beberapa alasan secara paralel. Implikasi: "dan masih ada alasan lain."',
        contoh: [
            { jp: '安いし、美味しいし、この店が好きです。', id: 'Murah, enak, lagi pula saya suka toko ini.' },
            { jp: '彼女はきれいだし、優しいし、人気があります。', id: 'Dia cantik, baik hati, dan populer.' },
            { jp: '雨だし、寒いし、出かけたくない。', id: 'Hujan, dingin lagi, jadi tidak mau keluar.' }
        ],
        perbandingan: 'し vs から: し untuk menyebutkan BEBERAPA alasan (implisit: masih ada lagi). から untuk SATU alasan spesifik.',
        catatan: 'Bisa dengan satu し (mengimplikasikan ada alasan lain yang tidak disebut).',
        salah: 'Jangan pakai し untuk satu alasan saja — pakai から.',
        semuaFungsi: [],
        cerita: 'し adalah "dan masih banyak lagi alasan lainnya". Seperti daftar belanja yang panjang — "murah, enak, dekat, dan alasan lainnya". Satu し saja sudah cukup untuk menyiratkan "dan lain-lain".',
        diagram: { tipe: 'daftar', label: '📋 A, B,... dan masih banyak lagi' },
        jlptQuestions: []
    },

    // ========================================
    // KATEGORI 7: PARTIKEL LAINNYA
    // ========================================
    {
        id: 'tte', char: 'って', romaji: 'tte', tingkat: 'N4',
        kategori: ['lainnya'],
        fungsi: 'Kutipan informal / partikel fokus percakapan',
        rumus: '[Kutipan] + って + [KK] / [KB] + って + [Predikat]',
        label: 'Partikel "Kata..." / "Soal..."',
        subkategori: 'kutipan',
        penjelasanSingkat: 'Versi informal dari と. Juga bisa berarti "berbicara tentang/bicara soal" sebagai pengganti は.',
        contoh: [
            { jp: '明日は休みって言ってたよ。', id: 'Katanya besok libur.' },
            { jp: 'これって何？', id: '(Bicara soal) ini, apa?' },
            { jp: '田中さんって知ってる？', id: 'Tahu (bicara soal) Tanaka?' },
            { jp: '本当って言ったのに。', id: 'Padahal (saya) bilang sungguhan.' }
        ],
        perbandingan: 'って vs と: って informal, tidak bisa dipakai dalam tulisan formal.',
        catatan: 'Salah satu partikel paling sering dipakai dalam percakapan sehari-hari.',
        salah: 'Jangan pakai って dalam tulisan formal atau surat resmi.',
        semuaFungsi: [],
        cerita: 'って adalah "kata versi santai" — "Katanya sih..." "Soal ini, apa?" Ini adalah partikel chat dan ngobrol, bukan partikel surat atau pidato.',
        diagram: { tipe: 'ilustrasi', label: '💬 Bicara soal... (kasual)' },
        jlptQuestions: []
    },
    {
        id: 'tteba', char: 'ってば', romaji: 'tteba', tingkat: 'N3',
        kategori: ['lainnya'],
        fungsi: 'Penekanan dengan ketidaksabaran',
        rumus: '[Kata] + ってば',
        label: 'Partikel "Kukatakan..." (dengan kesal)',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Digunakan saat mengulangi sesuatu dengan kesal atau tidak sabar — "kukatakan...!"',
        contoh: [
            { jp: 'もういいってば！', id: 'Kukatakan sudah cukup!' },
            { jp: '早くしてってば！', id: 'Cepetan, kataku!' },
            { jp: '違うってば！', id: 'Bukan itu, kataku!' }
        ],
        perbandingan: 'ってば vs って: ってば lebih emosional dan tidak sabar.',
        catatan: 'Terdengar kesal. Hanya untuk situasi informal.',
        salah: 'Jangan pakai ke atasan atau orang yang tidak akrab.',
        semuaFungsi: [],
        cerita: 'ってば adalah "versi kesel" dari って. Seperti mengulang dengan nada meninggi — "KU-KATAKAN sudah cukup!!"',
        diagram: { tipe: 'ilustrasi', label: '😤 Kukatakan...!' },
        jlptQuestions: []
    },
    {
        id: 'ttara', char: 'ったら', romaji: 'ttara', tingkat: 'N3',
        kategori: ['lainnya'],
        fungsi: 'Penekanan kejutan / "bicara soal"',
        rumus: '[KB] + ったら',
        label: 'Partikel "Bicara soal... / Wah..."',
        subkategori: 'penekanan',
        penjelasanSingkat: 'Menekankan topik dengan reaksi emosional atau kejutan.',
        contoh: [
            { jp: '彼ったら、もう！', id: 'Duh, si dia!' },
            { jp: 'これったらすごいよ。', id: 'Wah, ini luar biasa.' },
            { jp: 'うちの猫ったら、毎朝起こすのよ。', id: 'Kucingku tuh, bikin bangun setiap pagi.' }
        ],
        perbandingan: 'ったら vs ってば: ったら lebih ringan/terkejut, ってば lebih kesal.',
        catatan: 'Sering dipakai oleh wanita dalam percakapan.',
        salah: 'Jangan dipakai dalam situasi formal.',
        semuaFungsi: [],
        cerita: 'ったら adalah "wah kalau bicara soal..." — biasanya dengan nada gemas atau terkejut. "Anak kecil itu tuh... (gemasnya)."',
        diagram: { tipe: 'ilustrasi', label: '😲 Bicara soal...' },
        jlptQuestions: []
    },
    {
        id: 'yara', char: 'やら', romaji: 'yara', tingkat: 'N3',
        kategori: ['lainnya'],
        fungsi: 'Penanda ketidakpastian / daftar acak',
        rumus: '[A] + やら + [B] + やら + [KK]',
        label: 'Partikel "Entah... entah..."',
        subkategori: 'ketidakpastian',
        penjelasanSingkat: 'Menyebutkan hal-hal yang tidak pasti atau campur aduk. Sering untuk keluhan.',
        contoh: [
            { jp: '行くやら行かないやら。', id: 'Entah pergi entah tidak.' },
            { jp: '雨やら風やらで大変でした。', id: 'Hujan, angin, campur aduk, repot.' },
            { jp: '緊張するやら楽しみやら。', id: 'Campur aduk antara grogi dan senang.' }
        ],
        perbandingan: 'やら vs たり: たり untuk contoh aktivitas biasa. やら untuk suasana campur aduk/tidak beraturan.',
        catatan: 'Sering untuk mengekspresikan ketidakpastian atau kekacauan.',
        salah: 'Jangan pakai やら untuk daftar yang rapi dan teratur.',
        semuaFungsi: [],
        cerita: 'やら adalah "campur aduk" — seperti isi tas yang berantakan. "Entah ini, entah itu, semuanya campur aduk." Biasa dipakai saat mengeluh atau bingung.',
        diagram: { tipe: 'ilustrasi', label: '🎭 Campur aduk' },
        jlptQuestions: []
    }
];

// ================================================================
// PARTIKEL TAMBAHAN (EXTRA) — untuk referensi, tidak masuk grid utama
// ================================================================
// Beberapa partikel ini adalah variasi dari partikel di atas
// atau partikel N3+ yang umum ditemui.
const partikelTambahan = [
    {
        id: 'dano', char: 'だの', romaji: 'dano', tingkat: 'N3',
        kategori: ['lainnya'],
        fungsi: 'Daftar yang tidak teratur / keluhan',
        label: 'Partikel Daftar Keluhan',
        penjelasanSingkat: 'Menyebutkan daftar hal yang tidak teratur, sering untuk keluhan.'
    },
    {
        id: 'demo_connector', char: 'でも', romaji: 'demo', tingkat: 'N5',
        kategori: ['lainnya'],
        fungsi: 'Konjungsi "tetapi" (di awal kalimat)',
        label: 'Konjungsi "Tetapi"',
        penjelasanSingkat: 'Bukan partikel tapi konjungsi. Dipakai di awal kalimat untuk kontras: "tetapi, namun".'
    },
    {
        id: 'ni_ichi_advanced', char: 'に', romaji: 'ni', tingkat: 'N4',
        kategori: ['lainnya'],
        fungsi: 'Pengganti を untuk objek tidak langsung',
        label: 'Partikel Target (lanjutan)',
        penjelasanSingkat: 'Menandai target untuk kata kerja memberi/menerima: にあげる, にもらう, にくれる.'
    }
];

// ================================================================
// FUNGSI PEMBANTU untuk mengakses partikel
// ================================================================
function getPartikelById(id) {
    return partikelData.find(p => p.id === id);
}

function getPartikelByKategori(kategori) {
    return partikelData.filter(p => p.kategori.includes(kategori));
}

function getPartikelByTingkat(tingkat) {
    return partikelData.filter(p => p.tingkat === tingkat);
}

function getPartikelBySubkategori(sub) {
    return partikelData.filter(p => p.subkategori === sub);
}
