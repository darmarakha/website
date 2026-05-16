export type N5PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'i-adjective'
  | 'na-adjective'
  | 'adverb'
  | 'particle'
  | 'expression'
  | 'counter'
  | 'question'
  | 'time'
  | 'place';

export interface N5DictionaryEntry {
  id: string;
  japanese: string;
  kana: string;
  romaji: string;
  meaningId: string;
  pos: N5PartOfSpeech;
  topics: string[];
  tags: string[];
  exampleJp: string;
  exampleRo: string;
  exampleId: string;
  kaiwaHint: string;
  choukaiHint: string;
}

export interface N5GrammarPattern {
  id: string;
  pattern: string;
  romaji: string;
  meaningId: string;
  usage: string;
  exampleJp: string;
  exampleRo: string;
  exampleId: string;
  topics: string[];
}

export interface N5ParticleGuide {
  particle: string;
  reading: string;
  meaningId: string;
  note: string;
  exampleJp: string;
  exampleRo: string;
  exampleId: string;
}

export const N5_PARTICLE_GUIDE: N5ParticleGuide[] = [
  { particle: 'は', reading: 'wa', meaningId: 'penanda topik', note: 'Ditulis は tetapi dibaca wa ketika menjadi partikel topik.', exampleJp: '私[わたし]は 学生[がくせい]です。', exampleRo: 'Watashi wa gakusei desu.', exampleId: 'Saya adalah pelajar.' },
  { particle: 'を', reading: 'o', meaningId: 'penanda objek', note: 'Ditulis を dan biasanya dibaca o untuk objek tindakan.', exampleJp: '水[みず]を 飲[の]みます。', exampleRo: 'Mizu o nomimasu.', exampleId: 'Saya minum air.' },
  { particle: 'へ', reading: 'e', meaningId: 'arah/tujuan', note: 'Ditulis へ tetapi dibaca e ketika menjadi partikel arah.', exampleJp: '学校[がっこう]へ 行[い]きます。', exampleRo: 'Gakkou e ikimasu.', exampleId: 'Saya pergi ke sekolah.' },
  { particle: 'に', reading: 'ni', meaningId: 'waktu/tempat tujuan', note: 'Dipakai untuk jam, hari, tempat tujuan, atau keberadaan.', exampleJp: '三時[さんじ]に 会[あ]います。', exampleRo: 'Sanji ni aimasu.', exampleId: 'Bertemu jam tiga.' },
  { particle: 'で', reading: 'de', meaningId: 'tempat aksi/alat', note: 'Dipakai untuk tempat melakukan kegiatan atau alat yang digunakan.', exampleJp: '駅[えき]で 待[ま]ちます。', exampleRo: 'Eki de machimasu.', exampleId: 'Menunggu di stasiun.' },
  { particle: 'も', reading: 'mo', meaningId: 'juga', note: 'Mengganti は/が/を ketika maknanya “juga”.', exampleJp: '私[わたし]も 行[い]きます。', exampleRo: 'Watashi mo ikimasu.', exampleId: 'Saya juga pergi.' },
  { particle: 'の', reading: 'no', meaningId: 'kepunyaan/penjelas', note: 'Menghubungkan dua kata benda.', exampleJp: '日本語[にほんご]の 本[ほん]です。', exampleRo: 'Nihongo no hon desu.', exampleId: 'Ini buku bahasa Jepang.' },
  { particle: 'か', reading: 'ka', meaningId: 'penanda tanya', note: 'Diletakkan di akhir kalimat tanya sopan.', exampleJp: '学生[がくせい]ですか。', exampleRo: 'Gakusei desu ka.', exampleId: 'Apakah kamu pelajar?' },
];

export const N5_GRAMMAR_PATTERNS: N5GrammarPattern[] = [
  { id: 'g-desu', pattern: 'AはBです', romaji: 'A wa B desu', meaningId: 'A adalah B', usage: 'Perkenalan, identitas, profesi, asal.', exampleJp: '私[わたし]は 田中[たなか]です。', exampleRo: 'Watashi wa Tanaka desu.', exampleId: 'Saya Tanaka.', topics: ['perkenalan', 'identitas', 'kaiwa'] },
  { id: 'g-ka', pattern: '〜ですか', romaji: 'desu ka', meaningId: 'apakah ...?', usage: 'Membuat pertanyaan sopan.', exampleJp: '日本人[にほんじん]ですか。', exampleRo: 'Nihonjin desu ka.', exampleId: 'Apakah kamu orang Jepang?', topics: ['pertanyaan', 'kaiwa'] },
  { id: 'g-masenka', pattern: '〜ませんか', romaji: 'masen ka', meaningId: 'maukah ...?', usage: 'Ajakan halus.', exampleJp: '一緒[いっしょ]に 映画[えいが]を 見[み]ませんか。', exampleRo: 'Issho ni eiga o mimasen ka.', exampleId: 'Mau menonton film bersama?', topics: ['ajakan', 'kaiwa'] },
  { id: 'g-mashou', pattern: '〜ましょう', romaji: 'mashou', meaningId: 'ayo/mari ...', usage: 'Mengajak atau memutuskan bersama.', exampleJp: '駅[えき]で 会[あ]いましょう。', exampleRo: 'Eki de aimashou.', exampleId: 'Ayo bertemu di stasiun.', topics: ['ajakan', 'janji'] },
  { id: 'g-kudasai', pattern: '〜をください', romaji: 'o kudasai', meaningId: 'tolong beri ...', usage: 'Memesan atau meminta barang.', exampleJp: 'お茶[ちゃ]を 一[ひと]つ ください。', exampleRo: 'Ocha o hitotsu kudasai.', exampleId: 'Tolong satu teh.', topics: ['belanja', 'restoran'] },
  { id: 'g-arimasu', pattern: 'Nがあります', romaji: 'N ga arimasu', meaningId: 'ada N', usage: 'Keberadaan benda atau acara.', exampleJp: '明日[あした] テストが あります。', exampleRo: 'Ashita tesuto ga arimasu.', exampleId: 'Besok ada tes.', topics: ['jadwal', 'choukai'] },
  { id: 'g-imasu', pattern: 'Nがいます', romaji: 'N ga imasu', meaningId: 'ada N hidup', usage: 'Keberadaan orang/hewan.', exampleJp: '教室[きょうしつ]に 先生[せんせい]が います。', exampleRo: 'Kyoushitsu ni sensei ga imasu.', exampleId: 'Di kelas ada guru.', topics: ['sekolah', 'choukai'] },
  { id: 'g-suki', pattern: 'Nが好きです', romaji: 'N ga suki desu', meaningId: 'suka N', usage: 'Membicarakan kesukaan/hobi.', exampleJp: '音楽[おんがく]が 好[す]きです。', exampleRo: 'Ongaku ga suki desu.', exampleId: 'Saya suka musik.', topics: ['hobi', 'kaiwa'] },
  { id: 'g-tai', pattern: '〜たいです', romaji: 'tai desu', meaningId: 'ingin ...', usage: 'Mengungkapkan keinginan pembicara.', exampleJp: '水[みず]を 飲[の]みたいです。', exampleRo: 'Mizu o nomitai desu.', exampleId: 'Saya ingin minum air.', topics: ['restoran', 'kaiwa'] },
  { id: 'g-te-kudasai', pattern: '〜てください', romaji: 'te kudasai', meaningId: 'tolong ...', usage: 'Instruksi atau permintaan sopan.', exampleJp: '右[みぎ]に 曲[ま]がってください。', exampleRo: 'Migi ni magatte kudasai.', exampleId: 'Tolong belok kanan.', topics: ['arah', 'choukai'] },
];

export const N5_LISTENING_CUES = [
  'Fokus pada kata waktu: 今日[きょう], 明日[あした], 昨日[きのう], 午前[ごぜん], 午後[ごご].',
  'Untuk harga, dengarkan angka sebelum 円[えん]: 百[ひゃく], 二百[にひゃく], 三百[さんびゃく], 五百[ごひゃく].',
  'Untuk arah, dengarkan 右[みぎ], 左[ひだり], まっすぐ, 前[まえ], 後[うし]ろ.',
  'Untuk pilihan jawaban, cari kata kunci yang diulang oleh pembicara kedua.',
  'Partikel へ dibaca e, は dibaca wa, dan を dibaca o saat muncul sebagai partikel.',
];

export const N5_DICTIONARY: N5DictionaryEntry[] = [
  { id: 'v-aisatsu-hajimemashite', japanese: '初めまして', kana: 'はじめまして', romaji: 'hajimemashite', meaningId: 'senang berkenalan', pos: 'expression', topics: ['perkenalan', 'kaiwa'], tags: ['sopan', 'salam'], exampleJp: '初[はじ]めまして。私[わたし]は さくらです。', exampleRo: 'Hajimemashite. Watashi wa Sakura desu.', exampleId: 'Senang berkenalan. Saya Sakura.', kaiwaHint: 'Cocok untuk awal percakapan pertama kali.', choukaiHint: 'Biasanya muncul di dialog perkenalan.' },
  { id: 'v-aisatsu-yoroshiku', japanese: 'よろしくお願いします', kana: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', meaningId: 'mohon bantuannya/salam kenal', pos: 'expression', topics: ['perkenalan', 'kaiwa'], tags: ['sopan'], exampleJp: 'よろしく お願[ねが]いします。', exampleRo: 'Yoroshiku onegaishimasu.', exampleId: 'Mohon bantuannya / salam kenal.', kaiwaHint: 'Dipakai setelah memperkenalkan diri.', choukaiHint: 'Sering jadi penutup perkenalan.' },
  { id: 'v-aisatsu-ohayou', japanese: 'おはようございます', kana: 'おはようございます', romaji: 'ohayou gozaimasu', meaningId: 'selamat pagi', pos: 'expression', topics: ['salam', 'kaiwa'], tags: ['pagi', 'sopan'], exampleJp: 'おはようございます。今日[きょう]は いい 天気[てんき]ですね。', exampleRo: 'Ohayou gozaimasu. Kyou wa ii tenki desu ne.', exampleId: 'Selamat pagi. Hari ini cuacanya bagus ya.', kaiwaHint: 'Gunakan pada pagi hari.', choukaiHint: 'Petunjuk waktu pagi.' },
  { id: 'v-aisatsu-konnichiwa', japanese: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meaningId: 'selamat siang/hai', pos: 'expression', topics: ['salam', 'kaiwa'], tags: ['siang'], exampleJp: 'こんにちは。お元気[げんき]ですか。', exampleRo: 'Konnichiwa. Ogenki desu ka.', exampleId: 'Halo. Apa kabar?', kaiwaHint: 'Salam umum di siang hari.', choukaiHint: 'Membuka dialog santai.' },
  { id: 'v-aisatsu-konbanwa', japanese: 'こんばんは', kana: 'こんばんは', romaji: 'konbanwa', meaningId: 'selamat malam', pos: 'expression', topics: ['salam', 'kaiwa'], tags: ['malam'], exampleJp: 'こんばんは。今日[きょう]は 寒[さむ]いですね。', exampleRo: 'Konbanwa. Kyou wa samui desu ne.', exampleId: 'Selamat malam. Hari ini dingin ya.', kaiwaHint: 'Gunakan pada malam hari.', choukaiHint: 'Petunjuk waktu malam.' },
  { id: 'v-sumimasen', japanese: 'すみません', kana: 'すみません', romaji: 'sumimasen', meaningId: 'permisi/maaf', pos: 'expression', topics: ['arah', 'belanja', 'restoran', 'kaiwa'], tags: ['sopan'], exampleJp: 'すみません。駅[えき]は どこですか。', exampleRo: 'Sumimasen. Eki wa doko desu ka.', exampleId: 'Permisi. Di mana stasiun?', kaiwaHint: 'Pakai untuk memulai pertanyaan sopan.', choukaiHint: 'Biasanya tanda pembicara akan meminta bantuan.' },
  { id: 'v-arigatou', japanese: 'ありがとうございます', kana: 'ありがとうございます', romaji: 'arigatou gozaimasu', meaningId: 'terima kasih', pos: 'expression', topics: ['umum', 'kaiwa'], tags: ['sopan'], exampleJp: 'ありがとう ございます。', exampleRo: 'Arigatou gozaimasu.', exampleId: 'Terima kasih banyak.', kaiwaHint: 'Respons sopan setelah dibantu.', choukaiHint: 'Sering muncul di akhir dialog.' },
  { id: 'v-watashi', japanese: '私', kana: 'わたし', romaji: 'watashi', meaningId: 'saya', pos: 'noun', topics: ['perkenalan', 'kaiwa'], tags: ['pronomina'], exampleJp: '私[わたし]は 学生[がくせい]です。', exampleRo: 'Watashi wa gakusei desu.', exampleId: 'Saya adalah pelajar.', kaiwaHint: 'Aman dan netral untuk menyebut diri sendiri.', choukaiHint: 'Dengarkan setelah 私は untuk identitas pembicara.' },
  { id: 'v-anata', japanese: 'あなた', kana: 'あなた', romaji: 'anata', meaningId: 'kamu/Anda', pos: 'noun', topics: ['kaiwa'], tags: ['pronomina'], exampleJp: 'あなたは 学生[がくせい]ですか。', exampleRo: 'Anata wa gakusei desu ka.', exampleId: 'Apakah kamu pelajar?', kaiwaHint: 'Lebih natural memakai nama + さん daripada terlalu sering あなた.', choukaiHint: 'Dipakai untuk pertanyaan langsung.' },
  { id: 'v-gakusei', japanese: '学生', kana: 'がくせい', romaji: 'gakusei', meaningId: 'pelajar/mahasiswa', pos: 'noun', topics: ['perkenalan', 'sekolah'], tags: ['identitas'], exampleJp: '田中[たなか]さんは 学生[がくせい]です。', exampleRo: 'Tanaka-san wa gakusei desu.', exampleId: 'Tanaka adalah pelajar.', kaiwaHint: 'Cocok untuk perkenalan profesi/status.', choukaiHint: 'Kata kunci identitas dalam dialog kelas.' },
  { id: 'v-sensei', japanese: '先生', kana: 'せんせい', romaji: 'sensei', meaningId: 'guru/dosen', pos: 'noun', topics: ['sekolah'], tags: ['orang'], exampleJp: '先生[せんせい]は 教室[きょうしつ]に います。', exampleRo: 'Sensei wa kyoushitsu ni imasu.', exampleId: 'Guru ada di kelas.', kaiwaHint: 'Gunakan untuk guru, dokter, atau pembimbing.', choukaiHint: 'Bisa menjadi peran pembicara.' },
  { id: 'v-nihongo', japanese: '日本語', kana: 'にほんご', romaji: 'nihongo', meaningId: 'bahasa Jepang', pos: 'noun', topics: ['belajar', 'perkenalan'], tags: ['bahasa'], exampleJp: '日本語[にほんご]を 勉強[べんきょう]します。', exampleRo: 'Nihongo o benkyou shimasu.', exampleId: 'Saya belajar bahasa Jepang.', kaiwaHint: 'Topik aman untuk latihan Kaiwa.', choukaiHint: 'Dengarkan sebagai objek belajar.' },
  { id: 'v-benkyou', japanese: '勉強します', kana: 'べんきょうします', romaji: 'benkyou shimasu', meaningId: 'belajar', pos: 'verb', topics: ['belajar', 'sekolah'], tags: ['aktivitas'], exampleJp: '毎日[まいにち] 日本語[にほんご]を 勉強[べんきょう]します。', exampleRo: 'Mainichi nihongo o benkyou shimasu.', exampleId: 'Saya belajar bahasa Jepang setiap hari.', kaiwaHint: 'Bisa ditanya: 何を勉強しますか.', choukaiHint: 'Menandai aktivitas utama.' },
  { id: 'v-gakkou', japanese: '学校', kana: 'がっこう', romaji: 'gakkou', meaningId: 'sekolah', pos: 'place', topics: ['sekolah', 'arah'], tags: ['tempat'], exampleJp: '学校[がっこう]へ 行[い]きます。', exampleRo: 'Gakkou e ikimasu.', exampleId: 'Saya pergi ke sekolah.', kaiwaHint: 'Untuk membahas rutinitas.', choukaiHint: 'Tempat tujuan.' },
  { id: 'v-eki', japanese: '駅', kana: 'えき', romaji: 'eki', meaningId: 'stasiun', pos: 'place', topics: ['arah', 'transportasi', 'janji'], tags: ['tempat'], exampleJp: '駅[えき]の 前[まえ]で 会[あ]いましょう。', exampleRo: 'Eki no mae de aimashou.', exampleId: 'Ayo bertemu di depan stasiun.', kaiwaHint: 'Cocok untuk janji dan arah.', choukaiHint: 'Kata kunci lokasi pertemuan.' },
  { id: 'v-mae', japanese: '前', kana: 'まえ', romaji: 'mae', meaningId: 'depan/sebelum', pos: 'place', topics: ['arah', 'janji'], tags: ['posisi'], exampleJp: '駅[えき]の 前[まえ]です。', exampleRo: 'Eki no mae desu.', exampleId: 'Di depan stasiun.', kaiwaHint: 'Dipakai dengan の: Nの前.', choukaiHint: 'Penanda lokasi detail.' },
  { id: 'v-migi', japanese: '右', kana: 'みぎ', romaji: 'migi', meaningId: 'kanan', pos: 'place', topics: ['arah'], tags: ['arah'], exampleJp: '右[みぎ]に 曲[ま]がってください。', exampleRo: 'Migi ni magatte kudasai.', exampleId: 'Tolong belok kanan.', kaiwaHint: 'Untuk memberi arah.', choukaiHint: 'Penting untuk soal arah.' },
  { id: 'v-hidari', japanese: '左', kana: 'ひだり', romaji: 'hidari', meaningId: 'kiri', pos: 'place', topics: ['arah'], tags: ['arah'], exampleJp: '左[ひだり]に 曲[ま]がります。', exampleRo: 'Hidari ni magarimasu.', exampleId: 'Belok kiri.', kaiwaHint: 'Pasangan dari 右.', choukaiHint: 'Pembeda jawaban kanan/kiri.' },
  { id: 'v-massugu', japanese: 'まっすぐ', kana: 'まっすぐ', romaji: 'massugu', meaningId: 'lurus', pos: 'adverb', topics: ['arah'], tags: ['arah'], exampleJp: 'まっすぐ 行[い]ってください。', exampleRo: 'Massugu itte kudasai.', exampleId: 'Tolong jalan lurus.', kaiwaHint: 'Instruksi arah paling dasar.', choukaiHint: 'Biasanya muncul sebelum belok kanan/kiri.' },
  { id: 'v-iku', japanese: '行きます', kana: 'いきます', romaji: 'ikimasu', meaningId: 'pergi', pos: 'verb', topics: ['arah', 'rutinitas', 'janji'], tags: ['gerak'], exampleJp: '明日[あした] 学校[がっこう]へ 行[い]きます。', exampleRo: 'Ashita gakkou e ikimasu.', exampleId: 'Besok saya pergi ke sekolah.', kaiwaHint: 'Pakai へ/に untuk tujuan.', choukaiHint: 'Dengarkan tujuan setelah へ/に.' },
  { id: 'v-kuru', japanese: '来ます', kana: 'きます', romaji: 'kimasu', meaningId: 'datang', pos: 'verb', topics: ['janji', 'telepon'], tags: ['gerak'], exampleJp: 'パーティーに 来[き]ますか。', exampleRo: 'Paatii ni kimasu ka.', exampleId: 'Apakah kamu datang ke pesta?', kaiwaHint: 'Untuk undangan.', choukaiHint: 'Menentukan hadir/tidak.' },
  { id: 'v-kaeru', japanese: '帰ります', kana: 'かえります', romaji: 'kaerimasu', meaningId: 'pulang', pos: 'verb', topics: ['rutinitas'], tags: ['gerak'], exampleJp: '六時[ろくじ]に 帰[かえ]ります。', exampleRo: 'Rokuji ni kaerimasu.', exampleId: 'Pulang jam enam.', kaiwaHint: 'Untuk jadwal harian.', choukaiHint: 'Dengarkan jam sebelum/sekitar kalimat.' },
  { id: 'v-nomu', japanese: '飲みます', kana: 'のみます', romaji: 'nomimasu', meaningId: 'minum', pos: 'verb', topics: ['restoran', 'belanja'], tags: ['makanan'], exampleJp: 'お茶[ちゃ]を 飲[の]みます。', exampleRo: 'Ocha o nomimasu.', exampleId: 'Saya minum teh.', kaiwaHint: 'Objeknya memakai を.', choukaiHint: 'Menandai pesanan minuman.' },
  { id: 'v-taberu', japanese: '食べます', kana: 'たべます', romaji: 'tabemasu', meaningId: 'makan', pos: 'verb', topics: ['restoran', 'belanja'], tags: ['makanan'], exampleJp: '寿司[すし]を 食[た]べます。', exampleRo: 'Sushi o tabemasu.', exampleId: 'Saya makan sushi.', kaiwaHint: 'Objek makanan memakai を.', choukaiHint: 'Menandai makanan yang dipilih.' },
  { id: 'v-miru', japanese: '見ます', kana: 'みます', romaji: 'mimasu', meaningId: 'melihat/menonton', pos: 'verb', topics: ['hobi', 'janji'], tags: ['aktivitas'], exampleJp: '映画[えいが]を 見[み]ます。', exampleRo: 'Eiga o mimasu.', exampleId: 'Saya menonton film.', kaiwaHint: 'Untuk hobi film/TV.', choukaiHint: 'Sering muncul dalam ajakan menonton.' },
  { id: 'v-kiku', japanese: '聞きます', kana: 'ききます', romaji: 'kikimasu', meaningId: 'mendengar/bertanya', pos: 'verb', topics: ['hobi', 'choukai'], tags: ['audio'], exampleJp: '音楽[おんがく]を 聞[き]きます。', exampleRo: 'Ongaku o kikimasu.', exampleId: 'Saya mendengarkan musik.', kaiwaHint: 'Bisa berarti dengar atau bertanya, tergantung objek.', choukaiHint: 'Kata penting untuk listening.' },
  { id: 'v-au', japanese: '会います', kana: 'あいます', romaji: 'aimasu', meaningId: 'bertemu', pos: 'verb', topics: ['janji', 'perkenalan'], tags: ['aktivitas'], exampleJp: '三時[さんじ]に 駅[えき]で 会[あ]います。', exampleRo: 'Sanji ni eki de aimasu.', exampleId: 'Bertemu jam tiga di stasiun.', kaiwaHint: 'Untuk membuat janji.', choukaiHint: 'Jawaban sering berupa waktu/tempat bertemu.' },
  { id: 'v-kau', japanese: '買います', kana: 'かいます', romaji: 'kaimasu', meaningId: 'membeli', pos: 'verb', topics: ['belanja'], tags: ['transaksi'], exampleJp: 'コンビニで おにぎりを 買[か]います。', exampleRo: 'Konbini de onigiri o kaimasu.', exampleId: 'Saya membeli onigiri di minimarket.', kaiwaHint: 'Tempat memakai で, barang memakai を.', choukaiHint: 'Menentukan barang yang dibeli.' },
  { id: 'v-ikura', japanese: 'いくら', kana: 'いくら', romaji: 'ikura', meaningId: 'berapa harga', pos: 'question', topics: ['belanja', 'restoran'], tags: ['harga'], exampleJp: 'これは いくらですか。', exampleRo: 'Kore wa ikura desu ka.', exampleId: 'Ini berapa harganya?', kaiwaHint: 'Pertanyaan wajib saat belanja.', choukaiHint: 'Setelah kata ini biasanya muncul harga.' },
  { id: 'v-kudasai', japanese: 'ください', kana: 'ください', romaji: 'kudasai', meaningId: 'tolong beri/tolong lakukan', pos: 'expression', topics: ['belanja', 'restoran', 'arah'], tags: ['permintaan'], exampleJp: 'おにぎりを 三[みっ]つ ください。', exampleRo: 'Onigiri o mittsu kudasai.', exampleId: 'Tolong tiga onigiri.', kaiwaHint: 'Aman untuk meminta barang.', choukaiHint: 'Menandai pesanan/jumlah.' },
  { id: 'v-onigiri', japanese: 'おにぎり', kana: 'おにぎり', romaji: 'onigiri', meaningId: 'nasi kepal Jepang', pos: 'noun', topics: ['belanja', 'makanan'], tags: ['makanan'], exampleJp: 'おにぎりを 一[ひと]つ ください。', exampleRo: 'Onigiri o hitotsu kudasai.', exampleId: 'Tolong satu onigiri.', kaiwaHint: 'Contoh makanan konbini.', choukaiHint: 'Kata benda pesanan.' },
  { id: 'v-ocha', japanese: 'お茶', kana: 'おちゃ', romaji: 'ocha', meaningId: 'teh', pos: 'noun', topics: ['restoran', 'belanja'], tags: ['minuman'], exampleJp: 'お茶[ちゃ]を 飲[の]みます。', exampleRo: 'Ocha o nomimasu.', exampleId: 'Saya minum teh.', kaiwaHint: 'Minuman umum untuk latihan pesanan.', choukaiHint: 'Sering menjadi item tambahan.' },
  { id: 'v-mizu', japanese: '水', kana: 'みず', romaji: 'mizu', meaningId: 'air', pos: 'noun', topics: ['restoran'], tags: ['minuman'], exampleJp: '水[みず]を お願[ねが]いします。', exampleRo: 'Mizu o onegaishimasu.', exampleId: 'Air, tolong.', kaiwaHint: 'Pesanan aman di restoran.', choukaiHint: 'Dengarkan pada bagian minuman.' },
  { id: 'v-resutoran', japanese: 'レストラン', kana: 'レストラン', romaji: 'resutoran', meaningId: 'restoran', pos: 'place', topics: ['restoran'], tags: ['tempat'], exampleJp: 'レストランで 昼[ひる]ご飯[はん]を 食[た]べます。', exampleRo: 'Resutoran de hirugohan o tabemasu.', exampleId: 'Makan siang di restoran.', kaiwaHint: 'Tempat aksi memakai で.', choukaiHint: 'Menjelaskan situasi dialog.' },
  { id: 'v-tenin', japanese: '店員', kana: 'てんいん', romaji: "ten'in", meaningId: 'pegawai toko', pos: 'noun', topics: ['belanja'], tags: ['orang'], exampleJp: '店員[てんいん]さんに 聞[き]きます。', exampleRo: "Ten'in-san ni kikimasu.", exampleId: 'Saya bertanya kepada pegawai toko.', kaiwaHint: 'Peran penting untuk dialog belanja.', choukaiHint: 'Membedakan pegawai dan pelanggan.' },
  { id: 'v-kyaku', japanese: 'お客さん', kana: 'おきゃくさん', romaji: 'okyaku-san', meaningId: 'pelanggan/tamu', pos: 'noun', topics: ['belanja', 'restoran'], tags: ['orang'], exampleJp: 'お客[きゃく]さんは 水[みず]を 頼[たの]みました。', exampleRo: 'Okyaku-san wa mizu o tanomimashita.', exampleId: 'Pelanggan memesan air.', kaiwaHint: 'Peran dialog toko/restoran.', choukaiHint: 'Sering jadi subjek transaksi.' },
  { id: 'v-nanji', japanese: '何時', kana: 'なんじ', romaji: 'nanji', meaningId: 'jam berapa', pos: 'question', topics: ['waktu', 'janji'], tags: ['waktu'], exampleJp: '何時[なんじ]に 会[あ]いますか。', exampleRo: 'Nanji ni aimasu ka.', exampleId: 'Bertemu jam berapa?', kaiwaHint: 'Pertanyaan waktu janji.', choukaiHint: 'Jawaban biasanya jam spesifik.' },
  { id: 'v-kyou', japanese: '今日', kana: 'きょう', romaji: 'kyou', meaningId: 'hari ini', pos: 'time', topics: ['waktu', 'cuaca'], tags: ['waktu'], exampleJp: '今日[きょう]は 暑[あつ]いです。', exampleRo: 'Kyou wa atsui desu.', exampleId: 'Hari ini panas.', kaiwaHint: 'Pembuka obrolan harian.', choukaiHint: 'Petunjuk waktu utama.' },
  { id: 'v-ashita', japanese: '明日', kana: 'あした', romaji: 'ashita', meaningId: 'besok', pos: 'time', topics: ['waktu', 'janji'], tags: ['waktu'], exampleJp: '明日[あした] 映画[えいが]を 見[み]ます。', exampleRo: 'Ashita eiga o mimasu.', exampleId: 'Besok saya menonton film.', kaiwaHint: 'Untuk rencana.', choukaiHint: 'Bedakan dengan 今日/昨日.' },
  { id: 'v-kinou', japanese: '昨日', kana: 'きのう', romaji: 'kinou', meaningId: 'kemarin', pos: 'time', topics: ['waktu', 'cuaca'], tags: ['waktu'], exampleJp: '昨日[きのう]は 雨[あめ]でした。', exampleRo: 'Kinou wa ame deshita.', exampleId: 'Kemarin hujan.', kaiwaHint: 'Pakai bentuk lampau でした.', choukaiHint: 'Soal listening sering menanyakan perbedaan hari.' },
  { id: 'v-doyoubi', japanese: '土曜日', kana: 'どようび', romaji: 'doyoubi', meaningId: 'Sabtu', pos: 'time', topics: ['janji', 'hobi'], tags: ['hari'], exampleJp: '土曜日[どようび]に サッカーを します。', exampleRo: 'Doyoubi ni sakkaa o shimasu.', exampleId: 'Saya bermain sepak bola pada hari Sabtu.', kaiwaHint: 'Hari memakai partikel に.', choukaiHint: 'Petunjuk jadwal.' },
  { id: 'v-gogo', japanese: '午後', kana: 'ごご', romaji: 'gogo', meaningId: 'sore/PM', pos: 'time', topics: ['waktu', 'janji'], tags: ['jam'], exampleJp: '午後[ごご] 三時[さんじ]に 会[あ]います。', exampleRo: 'Gogo sanji ni aimasu.', exampleId: 'Bertemu jam tiga sore.', kaiwaHint: 'Untuk membedakan pagi/sore.', choukaiHint: 'Penting untuk soal waktu.' },
  { id: 'v-gozen', japanese: '午前', kana: 'ごぜん', romaji: 'gozen', meaningId: 'pagi/AM', pos: 'time', topics: ['waktu'], tags: ['jam'], exampleJp: '午前[ごぜん] 八時[はちじ]に 行[い]きます。', exampleRo: 'Gozen hachiji ni ikimasu.', exampleId: 'Pergi jam delapan pagi.', kaiwaHint: 'Untuk jadwal pagi.', choukaiHint: 'Penting membedakan AM/PM.' },
  { id: 'v-tenki', japanese: '天気', kana: 'てんき', romaji: 'tenki', meaningId: 'cuaca', pos: 'noun', topics: ['cuaca'], tags: ['alam'], exampleJp: 'いい 天気[てんき]ですね。', exampleRo: 'Ii tenki desu ne.', exampleId: 'Cuacanya bagus ya.', kaiwaHint: 'Small talk paling natural.', choukaiHint: 'Kata topik dialog cuaca.' },
  { id: 'v-ame', japanese: '雨', kana: 'あめ', romaji: 'ame', meaningId: 'hujan', pos: 'noun', topics: ['cuaca'], tags: ['alam'], exampleJp: '昨日[きのう]は 雨[あめ]でした。', exampleRo: 'Kinou wa ame deshita.', exampleId: 'Kemarin hujan.', kaiwaHint: 'Bisa dikombinasikan dengan かさ.', choukaiHint: 'Jawaban untuk kondisi cuaca.' },
  { id: 'v-hare', japanese: '晴れ', kana: 'はれ', romaji: 'hare', meaningId: 'cerah', pos: 'noun', topics: ['cuaca'], tags: ['alam'], exampleJp: '明日[あした]は 晴[は]れです。', exampleRo: 'Ashita wa hare desu.', exampleId: 'Besok cerah.', kaiwaHint: 'Untuk prediksi cuaca sederhana.', choukaiHint: 'Bandingkan dengan 雨/曇り.' },
  { id: 'v-kasa', japanese: '傘', kana: 'かさ', romaji: 'kasa', meaningId: 'payung', pos: 'noun', topics: ['cuaca'], tags: ['barang'], exampleJp: '傘[かさ]を 持[も]ちます。', exampleRo: 'Kasa o mochimasu.', exampleId: 'Membawa payung.', kaiwaHint: 'Respons natural saat hujan.', choukaiHint: 'Petunjuk bahwa pembicara khawatir hujan.' },
  { id: 'v-suki', japanese: '好き', kana: 'すき', romaji: 'suki', meaningId: 'suka', pos: 'na-adjective', topics: ['hobi', 'makanan'], tags: ['perasaan'], exampleJp: '音楽[おんがく]が 好[す]きです。', exampleRo: 'Ongaku ga suki desu.', exampleId: 'Saya suka musik.', kaiwaHint: 'Pola: Nが好きです.', choukaiHint: 'Menandai pilihan/kesukaan.' },
  { id: 'v-kirai', japanese: '嫌い', kana: 'きらい', romaji: 'kirai', meaningId: 'tidak suka', pos: 'na-adjective', topics: ['hobi', 'makanan'], tags: ['perasaan'], exampleJp: '辛[から]い 食[た]べ物[もの]が 嫌[きら]いです。', exampleRo: 'Karai tabemono ga kirai desu.', exampleId: 'Saya tidak suka makanan pedas.', kaiwaHint: 'Pola sama dengan 好き.', choukaiHint: 'Pembeda jawaban suka/tidak.' },
  { id: 'v-shumi', japanese: '趣味', kana: 'しゅみ', romaji: 'shumi', meaningId: 'hobi', pos: 'noun', topics: ['hobi', 'kaiwa'], tags: ['aktivitas'], exampleJp: '趣味[しゅみ]は 何[なん]ですか。', exampleRo: 'Shumi wa nan desu ka.', exampleId: 'Hobimu apa?', kaiwaHint: 'Pertanyaan pembuka yang natural.', choukaiHint: 'Kata kunci dialog hobi.' },
  { id: 'v-ongaku', japanese: '音楽', kana: 'おんがく', romaji: 'ongaku', meaningId: 'musik', pos: 'noun', topics: ['hobi'], tags: ['aktivitas'], exampleJp: '音楽[おんがく]を 聞[き]きます。', exampleRo: 'Ongaku o kikimasu.', exampleId: 'Saya mendengarkan musik.', kaiwaHint: 'Jawaban mudah untuk hobi.', choukaiHint: 'Sering muncul dengan 聞きます.' },
  { id: 'v-eiga', japanese: '映画', kana: 'えいが', romaji: 'eiga', meaningId: 'film', pos: 'noun', topics: ['hobi', 'janji'], tags: ['aktivitas'], exampleJp: '一緒[いっしょ]に 映画[えいが]を 見[み]ませんか。', exampleRo: 'Issho ni eiga o mimasen ka.', exampleId: 'Mau menonton film bersama?', kaiwaHint: 'Cocok untuk ajakan.', choukaiHint: 'Sering menjadi tujuan janjian.' },
  { id: 'v-sakkaa', japanese: 'サッカー', kana: 'サッカー', romaji: 'sakkaa', meaningId: 'sepak bola', pos: 'noun', topics: ['hobi'], tags: ['olahraga'], exampleJp: '土曜日[どようび]に サッカーを します。', exampleRo: 'Doyoubi ni sakkaa o shimasu.', exampleId: 'Saya bermain sepak bola pada hari Sabtu.', kaiwaHint: 'Olahraga umum untuk hobi.', choukaiHint: 'Muncul dengan します.' },
  { id: 'v-issho', japanese: '一緒に', kana: 'いっしょに', romaji: 'issho ni', meaningId: 'bersama-sama', pos: 'adverb', topics: ['janji', 'hobi'], tags: ['ajakan'], exampleJp: '一緒[いっしょ]に 行[い]きましょう。', exampleRo: 'Issho ni ikimashou.', exampleId: 'Ayo pergi bersama.', kaiwaHint: 'Membuat ajakan terdengar natural.', choukaiHint: 'Tanda pembicara mengajak.' },
  { id: 'v-hima', japanese: '暇', kana: 'ひま', romaji: 'hima', meaningId: 'luang/senggang', pos: 'na-adjective', topics: ['janji'], tags: ['waktu'], exampleJp: '土曜日[どようび]は 暇[ひま]ですか。', exampleRo: 'Doyoubi wa hima desu ka.', exampleId: 'Apakah Sabtu kamu luang?', kaiwaHint: 'Awal natural untuk membuat janji.', choukaiHint: 'Jika jawab はい, biasanya ajakan diterima.' },
  { id: 'v-daijoubu', japanese: '大丈夫', kana: 'だいじょうぶ', romaji: 'daijoubu', meaningId: 'tidak apa-apa/baik-baik saja/bisa', pos: 'na-adjective', topics: ['janji', 'kaiwa'], tags: ['respons'], exampleJp: '三時[さんじ]で 大丈夫[だいじょうぶ]です。', exampleRo: 'Sanji de daijoubu desu.', exampleId: 'Jam tiga tidak masalah.', kaiwaHint: 'Respons fleksibel untuk waktu/janji.', choukaiHint: 'Menandai persetujuan.' },
  { id: 'v-wakarimashita', japanese: '分かりました', kana: 'わかりました', romaji: 'wakarimashita', meaningId: 'saya mengerti/baik', pos: 'expression', topics: ['arah', 'janji', 'kaiwa'], tags: ['respons'], exampleJp: '分[わ]かりました。ありがとう ございます。', exampleRo: 'Wakarimashita. Arigatou gozaimasu.', exampleId: 'Saya mengerti. Terima kasih.', kaiwaHint: 'Respons sopan setelah instruksi.', choukaiHint: 'Menutup instruksi arah/janji.' },
  { id: 'v-doko', japanese: 'どこ', kana: 'どこ', romaji: 'doko', meaningId: 'di mana', pos: 'question', topics: ['arah', 'tempat'], tags: ['tanya'], exampleJp: 'トイレは どこですか。', exampleRo: 'Toire wa doko desu ka.', exampleId: 'Toilet ada di mana?', kaiwaHint: 'Pola penting: Nはどこですか.', choukaiHint: 'Jawaban biasanya tempat/arah.' },
  { id: 'v-nani', japanese: '何', kana: 'なに/なん', romaji: 'nani/nan', meaningId: 'apa', pos: 'question', topics: ['kaiwa'], tags: ['tanya'], exampleJp: 'これは 何[なん]ですか。', exampleRo: 'Kore wa nan desu ka.', exampleId: 'Ini apa?', kaiwaHint: 'Baca なん sebelum です/の, なに dalam banyak konteks lain.', choukaiHint: 'Perhatikan bentuk nan/nani.' },
  { id: 'v-dare', japanese: '誰', kana: 'だれ', romaji: 'dare', meaningId: 'siapa', pos: 'question', topics: ['perkenalan'], tags: ['tanya'], exampleJp: 'あの 人[ひと]は 誰[だれ]ですか。', exampleRo: 'Ano hito wa dare desu ka.', exampleId: 'Orang itu siapa?', kaiwaHint: 'Versi sopan: どなた.', choukaiHint: 'Menanyakan identitas.' },
  { id: 'v-kore', japanese: 'これ', kana: 'これ', romaji: 'kore', meaningId: 'ini', pos: 'noun', topics: ['belanja', 'umum'], tags: ['penunjuk'], exampleJp: 'これは いくらですか。', exampleRo: 'Kore wa ikura desu ka.', exampleId: 'Ini berapa harganya?', kaiwaHint: 'Dekat pembicara.', choukaiHint: 'Sering muncul saat belanja.' },
  { id: 'v-sore', japanese: 'それ', kana: 'それ', romaji: 'sore', meaningId: 'itu dekat lawan bicara', pos: 'noun', topics: ['belanja', 'umum'], tags: ['penunjuk'], exampleJp: 'それを ください。', exampleRo: 'Sore o kudasai.', exampleId: 'Tolong yang itu.', kaiwaHint: 'Dekat lawan bicara.', choukaiHint: 'Menandai barang yang dipilih.' },
  { id: 'v-are', japanese: 'あれ', kana: 'あれ', romaji: 'are', meaningId: 'itu jauh', pos: 'noun', topics: ['umum'], tags: ['penunjuk'], exampleJp: 'あれは 図書館[としょかん]です。', exampleRo: 'Are wa toshokan desu.', exampleId: 'Itu adalah perpustakaan.', kaiwaHint: 'Jauh dari pembicara dan lawan bicara.', choukaiHint: 'Membedakan lokasi/objek.' },
  { id: 'v-hitotsu', japanese: '一つ', kana: 'ひとつ', romaji: 'hitotsu', meaningId: 'satu buah', pos: 'counter', topics: ['belanja', 'restoran'], tags: ['jumlah'], exampleJp: 'お茶[ちゃ]を 一[ひと]つ ください。', exampleRo: 'Ocha o hitotsu kudasai.', exampleId: 'Tolong satu teh.', kaiwaHint: 'Counter umum untuk benda.', choukaiHint: 'Jumlah pesanan.' },
  { id: 'v-futatsu', japanese: '二つ', kana: 'ふたつ', romaji: 'futatsu', meaningId: 'dua buah', pos: 'counter', topics: ['belanja', 'restoran'], tags: ['jumlah'], exampleJp: 'パンを 二[ふた]つ ください。', exampleRo: 'Pan o futatsu kudasai.', exampleId: 'Tolong dua roti.', kaiwaHint: 'Counter umum untuk dua benda.', choukaiHint: 'Jumlah pesanan.' },
  { id: 'v-mittsu', japanese: '三つ', kana: 'みっつ', romaji: 'mittsu', meaningId: 'tiga buah', pos: 'counter', topics: ['belanja', 'restoran'], tags: ['jumlah'], exampleJp: 'おにぎりを 三[みっ]つ ください。', exampleRo: 'Onigiri o mittsu kudasai.', exampleId: 'Tolong tiga onigiri.', kaiwaHint: 'Perhatikan bunyi kecil っ.', choukaiHint: 'Jumlah pesanan bisa jadi jawaban hitungan.' },
  { id: 'v-hyaku', japanese: '百', kana: 'ひゃく', romaji: 'hyaku', meaningId: 'seratus', pos: 'counter', topics: ['belanja'], tags: ['angka'], exampleJp: '百円[ひゃくえん]です。', exampleRo: 'Hyaku en desu.', exampleId: 'Harganya 100 yen.', kaiwaHint: 'Untuk harga dasar.', choukaiHint: 'Angka penting untuk soal total harga.' },
  { id: 'v-sanbyaku', japanese: '三百', kana: 'さんびゃく', romaji: 'sanbyaku', meaningId: 'tiga ratus', pos: 'counter', topics: ['belanja'], tags: ['angka'], exampleJp: '全部[ぜんぶ]で 三百円[さんびゃくえん]です。', exampleRo: 'Zenbu de sanbyaku en desu.', exampleId: 'Totalnya 300 yen.', kaiwaHint: 'Perubahan bunyi: hyaku menjadi byaku.', choukaiHint: 'Wajib hati-hati untuk harga.' },
  { id: 'v-gojuu', japanese: '五十', kana: 'ごじゅう', romaji: 'gojuu', meaningId: 'lima puluh', pos: 'counter', topics: ['belanja'], tags: ['angka'], exampleJp: '百五十円[ひゃくごじゅうえん]です。', exampleRo: 'Hyaku gojuu en desu.', exampleId: 'Harganya 150 yen.', kaiwaHint: 'Gabungan angka harga.', choukaiHint: 'Dengarkan setelah 百 untuk 150.' },
  { id: 'v-zenbu', japanese: '全部', kana: 'ぜんぶ', romaji: 'zenbu', meaningId: 'semua/total', pos: 'noun', topics: ['belanja'], tags: ['jumlah'], exampleJp: '全部[ぜんぶ]で 三百五十円[さんびゃくごじゅうえん]です。', exampleRo: 'Zenbu de sanbyaku gojuu en desu.', exampleId: 'Total semuanya 350 yen.', kaiwaHint: 'Dipakai kasir saat menyebut total.', choukaiHint: 'Setelah 全部で biasanya jawaban total harga.' },
];

function normalizeDictionaryText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\[\]。、！？,.!?()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreEntry(entry: N5DictionaryEntry, query: string, mode: 'kaiwa' | 'choukai' | 'general'): number {
  const q = normalizeDictionaryText(query);
  const haystack = normalizeDictionaryText([
    entry.japanese,
    entry.kana,
    entry.romaji,
    entry.meaningId,
    entry.pos,
    ...entry.topics,
    ...entry.tags,
    entry.exampleJp,
    entry.exampleRo,
    entry.exampleId,
  ].join(' '));

  if (!q) {
    let base = 1;
    if (mode === 'kaiwa' && entry.topics.includes('kaiwa')) base += 2;
    if (mode === 'choukai' && ['waktu', 'arah', 'belanja', 'restoran'].some(t => entry.topics.includes(t))) base += 2;
    return base;
  }

  let score = 0;
  for (const token of q.split(' ')) {
    if (token.length < 2) continue;
    if (haystack.includes(token)) score += 3;
    if (entry.topics.some(t => normalizeDictionaryText(t).includes(token))) score += 2;
    if (entry.tags.some(t => normalizeDictionaryText(t).includes(token))) score += 1;
  }
  if (mode === 'kaiwa' && entry.topics.includes('kaiwa')) score += 1;
  if (mode === 'choukai' && entry.choukaiHint) score += 1;
  return score;
}

export function getN5DictionaryMatches(query = '', mode: 'kaiwa' | 'choukai' | 'general' = 'general', limit = 18): N5DictionaryEntry[] {
  return N5_DICTIONARY
    .map(entry => ({ entry, score: scoreEntry(entry, query, mode) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, Math.max(1, limit))
    .map(item => item.entry);
}

export function getN5GrammarMatches(topic = '', limit = 8): N5GrammarPattern[] {
  const q = normalizeDictionaryText(topic);
  return N5_GRAMMAR_PATTERNS
    .map(pattern => {
      const haystack = normalizeDictionaryText([pattern.pattern, pattern.romaji, pattern.meaningId, pattern.usage, ...pattern.topics].join(' '));
      const score = q ? q.split(' ').reduce((sum, token) => sum + (haystack.includes(token) ? 2 : 0), 0) : 1;
      return { pattern, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit))
    .map(item => item.pattern);
}

export function buildN5DictionaryPrompt(topic = '', mode: 'kaiwa' | 'choukai' | 'general' = 'general'): string {
  const entries = getN5DictionaryMatches(topic, mode, mode === 'choukai' ? 22 : 18);
  const grammar = getN5GrammarMatches(topic, 8);
  const vocabLines = entries.map((entry, index) => `${index + 1}. ${entry.japanese}[${entry.kana}] / ${entry.romaji} = ${entry.meaningId}. Contoh: ${entry.exampleJp} | ${entry.exampleRo} | ${entry.exampleId}`);
  const grammarLines = grammar.map((item, index) => `${index + 1}. ${item.pattern} (${item.romaji}) = ${item.meaningId}. ${item.usage}. Contoh: ${item.exampleJp} | ${item.exampleRo} | ${item.exampleId}`);
  const particleLines = N5_PARTICLE_GUIDE.map((item) => `- ${item.particle} dibaca ${item.reading}: ${item.meaningId}. Catatan: ${item.note}`);
  const cueLines = N5_LISTENING_CUES.map((cue) => `- ${cue}`);

  return [
    '=== KAMUS KONTROL JLPT N5 GEMUYOKAI ===',
    'Gunakan kosakata ini sebagai referensi utama agar jawaban Kaiwa/Choukai lebih stabil, natural, dan sesuai level N5.',
    'Aturan penting: semua Kanji wajib diberi furigana format Kanji[hiragana]. Jangan memakai kosakata terlalu sulit kalau ada padanan N5.',
    '',
    'KOSAKATA RELEVAN:',
    ...vocabLines,
    '',
    'POLA TATA BAHASA N5 RELEVAN:',
    ...grammarLines,
    '',
    'PARTIKEL YANG SERING SALAH DIBACA:',
    ...particleLines,
    '',
    mode === 'choukai' ? 'PETUNJUK KHUSUS CHOUKAI:' : 'PETUNJUK KHUSUS KAIWA:',
    ...(mode === 'choukai'
      ? cueLines
      : [
          '- Jaga respons tetap 1 sampai 3 kalimat Jepang agar mudah ditirukan siswa.',
          '- Setelah menjawab, beri pertanyaan balik sederhana memakai pola N5.',
          '- Jika siswa salah partikel, koreksi singkat dalam bahasa Indonesia lalu beri contoh benar.',
        ]),
  ].join('\n');
}

export function lookupN5Dictionary(query: string, mode: 'kaiwa' | 'choukai' | 'general' = 'general', limit = 20) {
  return {
    query,
    mode,
    entries: getN5DictionaryMatches(query, mode, limit),
    grammar: getN5GrammarMatches(query, 8),
    particles: N5_PARTICLE_GUIDE,
    listeningCues: mode === 'choukai' ? N5_LISTENING_CUES : [],
  };
}
