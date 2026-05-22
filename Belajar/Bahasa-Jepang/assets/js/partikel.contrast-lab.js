// ==========================================
// CONTRAST LAB — 12 Pasang Perbandingan Partikel
// Side-by-side comparison dengan visual + mnemonik
// ==========================================

const contrastLabData = [
    {
        id: 'wa_vs_ga',
        title: 'は vs が',
        subtitle: 'Topik vs Subjek Spesifik',
        difficulty: 'N5',
        icon: 'git-compare',
        left: {
            particle: 'は',
            label: 'Topik Umum',
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            examples: [
                { jp: 'わたしは学生です。', id: 'Saya (topik) adalah pelajar.' },
                { jp: '今日は暑いです。', id: 'Hari ini (topik) panas.' },
                { jp: '日本は便利です。', id: ' Jepang (topik) itu nyaman.' }
            ],
            keyPoint: 'Fokus pada informasi SETELAH は',
            tip: 'Bayangkan は seperti lampu sorot yang menerangi informasi setelahnya.'
        },
        right: {
            particle: 'が',
            label: 'Subjek Spesifik',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            examples: [
                { jp: 'わたしが学生です。', id: 'SAYA (bukan org lain) pelajar.' },
                { jp: '雨が降っています。', id: 'Hujan (subjek) turun.' },
                { jp: 'だれが来ますか。', id: 'Siapa (subjek) yang datang?' }
            ],
            keyPoint: 'Fokus pada kata SEBELUM が',
            tip: 'Bayangkan が seperti jari telunjuk yang menunjuk pelaku.'
        },
        rule: '◉ は: Topik sudah diketahui / umum. Informasi baru ada setelahnya.\n◉ が: Subjek adalah informasi baru / spesifik. Sering untuk identifikasi.',
        mnemonic: '🧠 Ingat: は = "Kalau tentang...", が = "(X)-lah yang..."',
        commonMistake: '❌ Jangan pakai は untuk subjek kata tanya (だれが, なにが — pakai が).\n❌ Jangan pakai が untuk topik umum dalam perkenalan (pakai は).',
        usageFlow: 'Kalimat tanya "Siapa?" → jawab pakai が. Perkenalan diri → pakai は.',
        linkParticle: 'wa'
    },
    {
        id: 'ni_vs_de',
        title: 'に vs で',
        subtitle: 'Lokasi Statis vs Tempat Aksi',
        difficulty: 'N5',
        icon: 'map-pin',
        left: {
            particle: 'に',
            label: 'Lokasi Keberadaan',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            examples: [
                { jp: '学校にいます。', id: 'Ada di sekolah.' },
                { jp: '部屋に机があります。', id: 'Di kamar ada meja.' }
            ],
            keyPoint: 'Keberadaan statis — pasangan いる/ある',
            tip: 'Titik diam: "di sinilah aku berada."'
        },
        right: {
            particle: 'で',
            label: 'Tempat Aksi Aktif',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            examples: [
                { jp: '学校で勉強します。', id: 'Belajar di sekolah.' },
                { jp: '部屋で本を読みます。', id: 'Membaca buku di kamar.' }
            ],
            keyPoint: 'Aksi aktif dilakukan — pasangan KK aksi',
            tip: 'Ruang gerak: "di sinilah aku melakukan sesuatu."'
        },
        rule: '◉ に: Lokasi STATIS. Hanya "berada", tidak melakukan apa-apa. Pasangan: いる/ある.\n◉ で: Tempat AKSI. Melakukan aktivitas. Pasangan: semua KK aksi.',
        mnemonic: '🧠 に = pin peta 📍 (titik diam). で = workshop 🔧 (tempat kerja).',
        commonMistake: '❌ "Saya belajar di sekolah" → 学校で勉強します (bukan に).\n❌ "Ada kucing di kamar" → 部屋に猫がいます (bukan で).',
        usageFlow: 'Tanya diri: Apakah saya melakukan aksi? Ya → で. Hanya berada? → に.',
        linkParticle: 'ni_ichi'
    },
    {
        id: 'ni_vs_e',
        title: 'に vs へ',
        subtitle: 'Titik Tujuan vs Arah',
        difficulty: 'N5',
        icon: 'navigation',
        left: {
            particle: 'に',
            label: 'Titik Tujuan Akhir',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            examples: [
                { jp: '日本に行きます。', id: 'Pergi ke Jepang (tujuan akhir).' },
                { jp: '駅に着きました。', id: 'Tiba di stasiun.' }
            ],
            keyPoint: 'Fokus pada "sampai di tujuan"',
            tip: 'Bayangkan pin 📍 — "aku sudah sampai sini."'
        },
        right: {
            particle: 'へ',
            label: 'Arah Pergerakan',
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            examples: [
                { jp: '日本へ向かっています。', id: 'Menuju ke arah Jepang.' },
                { jp: '駅へ走っています。', id: 'Berlari ke arah stasiun.' }
            ],
            keyPoint: 'Fokus pada "arah perjalanan"',
            tip: 'Bayangkan anak panah 🏹 — "menuju ke sana."'
        },
        rule: '◉ に: Menekankan TITIK AKHIR. "Sampai di mana?"\n◉ へ: Menekankan ARAH. "Menuju ke mana?"\nKeduanya sering bisa dipertukarkan, tapi へ lebih puitis/formal.',
        mnemonic: '🧠 に = 📍 "sampai di". へ = 🏹 "menuju ke arah".',
        commonMistake: '❌ へ tidak bisa dipakai dengan kata kerja 着く (tiba) — pakai に.\n❌ に terdengar lebih natural untuk日程 (jadwal harian).',
        usageFlow: 'Pakai に untuk "sampai di tujuan". Pakai へ untuk "menuju ke arah" (lebih puitis).',
        linkParticle: 'e'
    },
    {
        id: 'wo_vs_ni',
        title: 'を vs に',
        subtitle: 'Objek Langsung vs Target',
        difficulty: 'N5',
        icon: 'crosshair',
        left: {
            particle: 'を',
            label: 'Objek Langsung',
            color: 'text-sakura-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            examples: [
                { jp: 'りんごを食べる。', id: 'Makan apel (apel adalah objek).' },
                { jp: '本を読む。', id: 'Membaca buku.' }
            ],
            keyPoint: 'Benda yang dikenai tindakan',
            tip: 'Objek "kena" aksi secara langsung.'
        },
        right: {
            particle: 'に',
            label: 'Target Tidak Langsung',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            examples: [
                { jp: '友だちに会う。', id: 'Bertemu dengan teman.' },
                { jp: '先生に電話する。', id: 'Menelepon guru.' }
            ],
            keyPoint: 'Target tujuan dari aksi',
            tip: 'Bukan objek, tapi "arah/tujuan" dari aksi.'
        },
        rule: '◉ を: Kata kerja TRANSITIF — objek langsung dikenai aksi (makan, baca, tulis).\n◉ に: Target untuk KK tertentu — 会う, 電話する, 乗る, 入る.',
        mnemonic: '🧠 を = 🎯 sasaran tembak. に = 📍 arah tujuan.',
        commonMistake: '❌ バスを乗る ✗ → バスに乗る ✓ (naik KEPADA bus).\n❌ 友だちを会う ✗ → 友だちに会う ✓ (bertemu DENGAN teman).',
        usageFlow: 'Cek kata kerja: kalau KK transitif (食べる, 読む) → を. Kalau KK target (会う, 乗る) → に.',
        linkParticle: 'wo'
    },
    {
        id: 'to_vs_ya',
        title: 'と vs や',
        subtitle: 'Daftar Lengkap vs Parsial',
        difficulty: 'N5',
        icon: 'list',
        left: {
            particle: 'と',
            label: 'Daftar Lengkap',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            examples: [
                { jp: '猫と犬がいます。', id: 'Ada kucing DAN anjing (hanya itu).' },
                { jp: 'りんごとバナナを買う。', id: 'Beli apel DAN pisang.' }
            ],
            keyPoint: 'SEMUA item disebutkan — tidak ada yang lain',
            tip: 'Kotak tertutup: "ini saja, titik."'
        },
        right: {
            particle: 'や',
            label: 'Daftar Parsial',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            examples: [
                { jp: '猫や犬がいます。', id: 'Ada kucing, anjing, dll.' },
                { jp: 'りんごやバナナなどを買う。', id: 'Beli apel, pisang, dsb.' }
            ],
            keyPoint: 'Hanya CONTOH — masih ada yang lain',
            tip: 'Kotak terbuka: "ini contoh, masih ada."'
        },
        rule: '◉ と: Semua item. "A dan B = hanya A dan B."\n◉ や: Contoh item. "A, B, dan lain-lain."\nや sering dipasangkan dengan など di akhir.',
        mnemonic: '🧠 と = 🔒 daftar tertutup. や = 🔓 daftar terbuka.',
        commonMistake: '❌ Mana yang lebih natural? Untuk 2 item → と. Untuk 3+ item → や atau とか.',
        usageFlow: 'Hanya 2 item dan itu saja? → と. Contoh dari banyak? → や.',
        linkParticle: 'to_list'
    },
    {
        id: 'wa_vs_mo',
        title: 'は vs も',
        subtitle: 'Topik vs "Juga"',
        difficulty: 'N5',
        icon: 'plus-circle',
        left: {
            particle: 'は',
            label: 'Topik / Fokus',
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            examples: [
                { jp: '私はコーヒーが好きです。', id: 'Saya suka kopi.' },
                { jp: 'これは本です。', id: 'Ini buku.' }
            ],
            keyPoint: 'Hanya satu topik / fokus',
            tip: 'Bias, tidak ada tambahan.'
        },
        right: {
            particle: 'も',
            label: '"Juga" / "Bahkan"',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            examples: [
                { jp: '私もコーヒーが好きです。', id: 'Saya JUGA suka kopi.' },
                { jp: 'これもください。', id: 'Ini JUGA tolong beri.' }
            ],
            keyPoint: 'Menambahkan — "juga", "bahkan", "maupun"',
            tip: 'Pengganti は/が/を untuk "juga".'
        },
        rule: '◉ は: Topik tunggal. "Kalau tentang X..."\n◉ も: Menggantikan は/が/を. "Juga, bahkan, pun."\nPola: [A]も[B]も = "A maupun B (sama-sama)."',
        mnemonic: '🧠 は = satu. も = plus ➕ (tambah).',
        commonMistake: '❌ Jangan gabung は dengan も (私 は も ✗).\n❌ も menggantikan は/が/를 — tidak perlu partikel lain.',
        usageFlow: 'Sudah disebut topik sama sebelumnya? → も (juga). Topik baru? → は.',
        linkParticle: 'wa'
    },
    {
        id: 'dake_vs_shika',
        title: 'だけ vs しか',
        subtitle: '"Hanya Netral" vs "Hanya Kurang"',
        difficulty: 'N5',
        icon: 'filter',
        left: {
            particle: 'だけ',
            label: 'Hanya (netral)',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            examples: [
                { jp: '百円だけある。', id: 'Ada 100 yen saja (netral).' },
                { jp: 'これだけください。', id: 'Ini saja tolong (cukup).' }
            ],
            keyPoint: 'Sekadar batasan — cukup/tidak kurang',
            tip: 'Pernyataan netral tanpa emosi.'
        },
        right: {
            particle: 'しか',
            label: 'Hanya (negatif/kurang)',
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
            borderColor: 'border-rose-500/30',
            examples: [
                { jp: '百円しかない。', id: 'Cuma 100 yen (kurang).' },
                { jp: '十分しかない。', id: 'Cuma 10 menit (mepet).' }
            ],
            keyPoint: 'WAJIB predikat NEGATIF — rasa kurang',
            tip: 'Selalu pakai bentuk negatif (ない/ません).'
        },
        rule: '◉ だけ: "Hanya." Positif/netral. KB + だけ + KK positif.\n◉ しか~ない: "Hanya (dgn rasa kurang)." KB + しか + KK NEGATIF.\nしか TIDAK BISA dipakai dengan kalimat positif.',
        mnemonic: '🧠 だけ = ¯\\_(ツ)_/¯ "ya hanya ini." しか~ない = 😟 "cuma segini?!"',
        commonMistake: '❌ しかある ✗ → しかない ✓ (wajib negatif).\n❌ Untuk "hanya" dengan rasa cukup → pakai だけ.',
        usageFlow: 'Cukup/syukur? → だけ. Kurang/kecewa? → しか~ない.',
        linkParticle: 'dake'
    },
    {
        id: 'kara_vs_node',
        title: 'から vs ので',
        subtitle: 'Alasan Subjektif vs Objektif',
        difficulty: 'N4',
        icon: 'arrow-right-circle',
        left: {
            particle: 'から',
            label: 'Karena (subjektif)',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            examples: [
                { jp: '安いから買った。', id: 'Karena murah, (saya) beli.' },
                { jp: '疲れたから休む。', id: 'Karena capek, istirahat.' }
            ],
            keyPoint: 'Alasan pribadi / subjektif',
            tip: 'Lebih informal. Bisa untuk ajakan.'
        },
        right: {
            particle: 'ので',
            label: 'Karena (objektif/sopan)',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            examples: [
                { jp: '雨なので中止です。', id: 'Karena hujan, dibatalkan.' },
                { jp: '体調が悪いので休みます。', id: 'Karena tdk enak badan, istirahat.' }
            ],
            keyPoint: 'Alasan faktual / objektif',
            tip: 'Lebih sopan. Untuk alasan formal.'
        },
        rule: '◉ から: Alasan pribadi. Bisa untuk ajakan/perintah. "Karena saya mau..."\n◉ ので: Alasan objektif/fakta. Lebih sopan. "Karena faktanya..."\nDi kantor / formal → ので lebih aman.',
        mnemonic: '🧠 から = "Karena gue..." (personal). ので = "Dikarenakan..." (formal).',
        commonMistake: '❌ Di surel formal → pakai ので, jangan から.\n❌ Ajakan (makan yuk!) → pakai から, bukan ので.',
        usageFlow: 'Bicara sama teman? → から. Surat/atasan? → ので.',
        linkParticle: 'kara_from'
    },
    {
        id: 'ka_vs_yo_vs_ne',
        title: 'か vs よ vs ね',
        subtitle: 'Tanya vs Info Baru vs Konfirmasi',
        difficulty: 'N5',
        icon: 'message-circle',
        left: {
            particle: 'か',
            label: 'Pertanyaan',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            examples: [
                { jp: '学生ですか。', id: 'Apakah pelajar?' },
                { jp: 'これですか。', id: 'Inikah?' }
            ],
            keyPoint: 'Mengubah kalimat jadi tanya',
            tip: 'Formal. Dalam kasual cukup intonasi naik.'
        },
        center: {
            particle: 'ね',
            label: 'Konfirmasi',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            examples: [
                { jp: 'いい天気ですね。', id: 'Cuaca bagus ya.' },
                { jp: 'そうですよね。', id: 'Betul juga ya.' }
            ],
            keyPoint: 'Cari persetujuan / softener',
            tip: 'Membuat kalimat lebih ramah.'
        },
        right: {
            particle: 'よ',
            label: 'Info Baru',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            examples: [
                { jp: 'もうすぐ着きますよ。', id: 'Sebentar lagi sampai, lho.' },
                { jp: '大丈夫ですよ。', id: 'Tidak apa-apa kok.' }
            ],
            keyPoint: 'Info baru / penegasan',
            tip: 'Agak kurang sopan ke atasan.'
        },
        rule: '◉ か: ❓ Pertanyaan.\n◉ ね: 🤔 "Ya kan?" — konfirmasi.\n◉ よ: 💡 "Lho..." — info baru.\nGabung: よね = よ + ね = info baru + konfirmasi.',
        mnemonic: '🧠 か = ❓. ね = 🤝. よ = 👋.',
        commonMistake: '❌ よ ke atasan → kurang sopan.\n❌ ね terlalu sering → terdengar ragu-ragu.',
        usageFlow: 'Tanya? → か. Setuju? → ね. Kasih tahu? → よ.',
        linkParticle: 'ka_q'
    },
    {
        id: 'ga_vs_wo',
        title: 'が vs を',
        subtitle: 'Subjek Intransitif vs Objek Transitif',
        difficulty: 'N5',
        icon: 'shuffle',
        left: {
            particle: 'が',
            label: 'Subjek / Objek Intransitif',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            examples: [
                { jp: '雨が降る。', id: 'Hujan turun.' },
                { jp: '猫がいる。', id: 'Ada kucing.' },
                { jp: '車が止まる。', id: 'Mobil berhenti.' }
            ],
            keyPoint: 'KK intransitif — subjek pakai が',
            tip: 'KK otomatis (turun, ada, berhenti) — が.'
        },
        right: {
            particle: 'を',
            label: 'Objek Langsung Transitif',
            color: 'text-sakura-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            examples: [
                { jp: '雨を止める。', id: 'Menghentikan hujan (dgn alat).' },
                { jp: '猫を飼う。', id: 'Memelihara kucing.' },
                { jp: '車を止める。', id: 'Menghentikan mobil.' }
            ],
            keyPoint: 'KK transitif — objek pakai を',
            tip: 'KK butuh objek (meng-X) — を.'
        },
        rule: '◉ が: Subjek untuk KK INTANSITIF (otomatis/alami): 降る, いる, ある, 止まる.\n◉ を: Objek untuk KK TRANSITIF (butuh objek): 止める, 飼う, 食べる.\nBandingkan: ドアが開く (pintu terbuka) vs ドアを開ける (membuka pintu).',
        mnemonic: '🧠 が = otomatis (hujan turun sendiri). を = disengaja (saya yang menghentikan).',
        commonMistake: '❌ テレビが見える (terlihat) vs テレビを見る (menonton) — beda makna dengan beda partikel.',
        usageFlow: 'Cek kata kerja: berpasangan (他動詞/transitif)? → を. Sendiri (自動詞/intransitif)? → が.',
        linkParticle: 'ga'
    },
    {
        id: 'kara_vs_made',
        title: 'から vs まで',
        subtitle: 'Titik Awal vs Batas Akhir',
        difficulty: 'N5',
        icon: 'move-horizontal',
        left: {
            particle: 'から',
            label: 'Titik Awal (Start)',
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            examples: [
                { jp: '九時から働く。', id: 'Bekerja dari jam 9.' },
                { jp: '駅から歩く。', id: 'Jalan dari stasiun.' }
            ],
            keyPoint: '🏁 START — titik awal',
            tip: 'Dari mana/siapa/waktu apa mulainya.'
        },
        right: {
            particle: 'まで',
            label: 'Batas Akhir (Finish)',
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            examples: [
                { jp: '五時まで働く。', id: 'Bekerja sampai jam 5.' },
                { jp: '駅まで歩く。', id: 'Jalan sampai stasiun.' }
            ],
            keyPoint: '🏁 FINISH — batas akhir',
            tip: 'Sampai kapan/di mana batasnya.'
        },
        rule: '◉ から: Titik AWAL: ruang, waktu, atau urutan.\n◉ まで: Titik AKHIR: batas ruang/waktu.\nBerpasangan: [A] から [B] まで = "dari A sampai B."\nまでに = "paling lambat" (dengan batas waktu).',
        mnemonic: '🧠 から = 🏃 start. まで = 🏁 finish.',
        commonMistake: '❌ までに = "paling lambat" (deadline). まで = "terus sampai".\nBeda: 五時まで待つ (tunggu sampai jam 5) vs 五時までに提出 (kumpul paling lambat jam 5).',
        usageFlow: 'Awal? → から. Sampai? → まで. Deadline? → までに.',
        linkParticle: 'kara_from'
    },
    {
        id: 'ni_vs_wo_place',
        title: 'に vs を (Pergerakan)',
        subtitle: 'Titik Tujuan vs Tempat Dilalui',
        difficulty: 'N4',
        icon: 'map',
        left: {
            particle: 'に',
            label: 'Tujuan Pergerakan',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/30',
            examples: [
                { jp: '駅に行く。', id: 'Pergi ke stasiun (tujuan).' },
                { jp: '家に帰る。', id: 'Pulang ke rumah.' }
            ],
            keyPoint: 'TITIK TUJUAN akhir',
            tip: 'Berhenti / sampai di sana.'
        },
        right: {
            particle: 'を',
            label: 'Tempat/Rute Dilalui',
            color: 'text-sakura-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            examples: [
                { jp: '道を歩く。', id: 'Berjalan DI jalan.' },
                { jp: '公園を散歩する。', id: 'Berjalan-jalan DI taman.' },
                { jp: '橋を渡る。', id: 'Menyeberangi jembatan.' }
            ],
            keyPoint: 'RUANG/RUTE yang dilalui',
            tip: 'Melewati / bergerak di dalam area.'
        },
        rule: '◉ に: TITIK AKHIR → "sampai/berada di sana."\n◉ を: RUANG LALUAN → "bergerak di dalam / melewati."\nBandingkan: 公園に行く (pergi ke taman) vs 公園を散歩する (berjalan di taman).',
        mnemonic: '🧠 に = 📍 titik stop. を = 🚶‍♂️ ruang gerak.',
        commonMistake: '❌ 道に行く ✗ (jalan bukan tujuan) → 道を歩く ✓.\n❌ 公園に散歩する ✗ → 公園を散歩する ✓.',
        usageFlow: 'Akhir/sampai? → に. Bergerak di dalam/melewati? → を.',
        linkParticle: 'ni_ichi'
    }
];

let contrastLabProgress = [];

function loadContrastLabProgress() {
    try {
        const saved = localStorage.getItem('gy_jp_contrast_progress');
        if (saved) contrastLabProgress = JSON.parse(saved);
    } catch(e) { contrastLabProgress = []; }
}

function saveContrastLabProgress() {
    localStorage.setItem('gy_jp_contrast_progress', JSON.stringify(contrastLabProgress));
}

function renderContrastLab() {
    const container = document.getElementById('contrastLabContainer');
    if (!container) return;

    let html = '';
    contrastLabData.forEach((c, idx) => {
        let isCompleted = contrastLabProgress.includes(c.id);
        let compIcon = isCompleted
            ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>'
            : `<button onclick="markContrastDone('${c.id}')" class="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#a9a29a] hover:text-white transition" title="Tandai sudah dipahami"><i data-lucide="check" class="w-3 h-3 inline mr-1"></i> Paham</button>`;

        let leftKeysHtml = '';
        if (c.left) {
            leftKeysHtml = `
                <div class="p-4 rounded-xl ${c.left.bgColor || 'bg-white/5'} border ${c.left.borderColor || 'border-white/10'}">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl font-jp font-bold ${c.left.color || 'text-white'}">${c.left.particle}</span>
                        <span class="text-xs font-bold ${c.left.color || 'text-white'}">${c.left.label || ''}</span>
                    </div>
                    ${(c.left.examples || []).map(ex => `
                        <div class="mb-2 bg-[#0a0d12] p-2 rounded-lg border border-white/5">
                            <p class="text-[#f4efe7] font-jp text-sm">${ex.jp}</p>
                            <p class="text-[#999] text-xs mt-0.5">${ex.id}</p>
                        </div>
                    `).join('')}
                    <div class="mt-2 flex items-start gap-1.5 text-xs ${c.left.color || 'text-[#aaa]'}">
                        <i data-lucide="lightbulb" class="w-3 h-3 shrink-0 mt-0.5"></i>
                        <span>${c.left.keyPoint || ''}</span>
                    </div>
                    ${c.left.tip ? `<div class="mt-1 text-xs text-[#777] italic">💡 ${c.left.tip}</div>` : ''}
                </div>
            `;
        }

        let centerHtml = '';
        if (c.center) {
            centerHtml = `
                <div class="p-4 rounded-xl ${c.center.bgColor || 'bg-white/5'} border ${c.center.borderColor || 'border-white/10'}">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl font-jp font-bold ${c.center.color || 'text-white'}">${c.center.particle}</span>
                        <span class="text-xs font-bold ${c.center.color || 'text-white'}">${c.center.label || ''}</span>
                    </div>
                    ${(c.center.examples || []).map(ex => `
                        <div class="mb-2 bg-[#0a0d12] p-2 rounded-lg border border-white/5">
                            <p class="text-[#f4efe7] font-jp text-sm">${ex.jp}</p>
                            <p class="text-[#999] text-xs mt-0.5">${ex.id}</p>
                        </div>
                    `).join('')}
                    <div class="mt-2 flex items-start gap-1.5 text-xs ${c.center.color || 'text-[#aaa]'}">
                        <i data-lucide="lightbulb" class="w-3 h-3 shrink-0 mt-0.5"></i>
                        <span>${c.center.keyPoint || ''}</span>
                    </div>
                    ${c.center.tip ? `<div class="mt-1 text-xs text-[#777] italic">💡 ${c.center.tip}</div>` : ''}
                </div>
            `;
        }

        let rightHtml = '';
        if (c.right) {
            rightHtml = `
                <div class="p-4 rounded-xl ${c.right.bgColor || 'bg-white/5'} border ${c.right.borderColor || 'border-white/10'}">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl font-jp font-bold ${c.right.color || 'text-white'}">${c.right.particle}</span>
                        <span class="text-xs font-bold ${c.right.color || 'text-white'}">${c.right.label || ''}</span>
                    </div>
                    ${(c.right.examples || []).map(ex => `
                        <div class="mb-2 bg-[#0a0d12] p-2 rounded-lg border border-white/5">
                            <p class="text-[#f4efe7] font-jp text-sm">${ex.jp}</p>
                            <p class="text-[#999] text-xs mt-0.5">${ex.id}</p>
                        </div>
                    `).join('')}
                    <div class="mt-2 flex items-start gap-1.5 text-xs ${c.right.color || 'text-[#aaa]'}">
                        <i data-lucide="lightbulb" class="w-3 h-3 shrink-0 mt-0.5"></i>
                        <span>${c.right.keyPoint || ''}</span>
                    </div>
                    ${c.right.tip ? `<div class="mt-1 text-xs text-[#777] italic">💡 ${c.right.tip}</div>` : ''}
                </div>
            `;
        }

        let columnCount = c.center ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

        html += `
            <div class="rounded-2xl overflow-hidden border ${isCompleted ? 'border-emerald-500/30' : 'border-white/10'} bg-[#0d1117] transition-all duration-300 ${isCompleted ? 'shadow-lg shadow-emerald-500/5' : ''}">
                <div class="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
                    <div class="flex items-center gap-2">
                        <div class="flex gap-1.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                        <span class="text-xs text-[#a9a29a] font-mono ml-3">${c.title}</span>
                        ${c.difficulty ? `<span class="text-[10px] px-1.5 py-0.5 rounded-full ${c.difficulty === 'N5' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} font-bold">${c.difficulty}</span>` : ''}
                    </div>
                    ${compIcon}
                </div>
                <div class="p-4 md:p-5">
                    <div class="grid ${columnCount} gap-3 mb-4">
                        ${leftKeysHtml}
                        ${centerHtml}
                        ${rightHtml}
                    </div>
                    ${c.rule ? `
                    <div class="p-3 rounded-xl bg-white/5 border border-white/10 mb-3">
                        <p class="text-xs font-bold text-[#b89cff] mb-1"><i data-lucide="book-open" class="w-3 h-3 inline mr-1"></i> Aturan</p>
                        <p class="text-xs text-[#c0c0c0] whitespace-pre-line leading-relaxed">${c.rule}</p>
                    </div>` : ''}
                    ${c.mnemonic ? `
                    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
                        <p class="text-xs font-bold text-amber-300 mb-1">🧠 Mnemonik</p>
                        <p class="text-xs text-amber-200/80">${c.mnemonic}</p>
                    </div>` : ''}
                    ${c.commonMistake ? `
                    <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-3">
                        <p class="text-xs font-bold text-rose-300 mb-1">⚠️ Kesalahan Umum</p>
                        <p class="text-xs text-rose-200/80 whitespace-pre-line">${c.commonMistake}</p>
                    </div>` : ''}
                    ${c.usageFlow ? `
                    <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <p class="text-xs font-bold text-blue-300 mb-1"><i data-lucide="git-branch" class="w-3 h-3 inline mr-1"></i> Cara Memilih</p>
                        <p class="text-xs text-blue-200/80">${c.usageFlow}</p>
                    </div>` : ''}
                </div>
            </div>
        `;
    });

    let progress = contrastLabProgress.length;
    let total = contrastLabData.length;
    let pct = Math.round((progress / total) * 100);

    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <p class="text-sm text-[#a9a29a]">Progress: <span class="text-[#b89cff] font-bold">${progress}/${total}</span> partikel dipahami</p>
            <div class="flex items-center gap-2">
                <div class="w-32 h-2 bg-[#161b22] rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-gradient-to-r from-[#b89cff] to-emerald-400 rounded-full transition-all duration-500" style="width:${pct}%"></div>
                </div>
                <span class="text-xs text-[#777]">${pct}%</span>
            </div>
        </div>
        <div class="space-y-6">
            ${html}
        </div>
    `;
    lucide.createIcons();
}

function markContrastDone(id) {
    if (!contrastLabProgress.includes(id)) {
        contrastLabProgress.push(id);
        saveContrastLabProgress();
        renderContrastLab();
        if (typeof showToast === 'function') {
            showToast('Paham!', 'Perbandingan partikel ditandai.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadContrastLabProgress();
    const clContainer = document.getElementById('contrastLabContainer');
    if (clContainer) {
        renderContrastLab();
    }
});
