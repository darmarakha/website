export interface ChoukaiSpeaker {
  id: string;       // 'A' or 'B'
  name: string;     // Character name (Japanese)
  nameRo: string;   // Name in romaji
  gender: 'wanita' | 'pria';
  role: string;     // Role in scenario (Indonesian)
  emoji: string;    // Character avatar
  colorClass: string; // Tailwind color classes for UI
}

export interface ChoukaiDialogue {
  speaker: string;
  text: string;
  ro: string;
  id: string;
}

export interface ChoukaiQuiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ChoukaiMaterial {
  id: string;
  title: string;
  scenario: string;
  emoji: string;
  difficulty: 'easy' | 'medium';
  topic: string;
  speakers: ChoukaiSpeaker[];
  dialogue: ChoukaiDialogue[];
  quiz: ChoukaiQuiz;
  context: string;  // Context/situation explanation shown before dialog
}

export const N5_CHOUKAI_MATERIALS: ChoukaiMaterial[] = [
  {
    id: 'n5-ch01',
    title: 'Perkenalan di Kelas',
    scenario: 'Hari pertama di kelas bahasa Jepang. Hayato dan Sakura baru saja bertemu. Mereka saling memperkenalkan diri dengan sopan.',
    emoji: '🏫',
    difficulty: 'easy',
    topic: 'Jikoshoukai (自己紹介)',
    context: 'Hayato dan Sakura adalah mahasiswa baru di kelas bahasa Jepang. Hari ini adalah pertama kalinya mereka bertemu. Mereka sedang saling memperkenalkan diri.',
    speakers: [
      { id: 'A', name: 'はやと', nameRo: 'Hayato', gender: 'pria', role: 'Mahasiswa baru (laki-laki)', emoji: '👨', colorClass: 'blue' },
      { id: 'B', name: 'さくら', nameRo: 'Sakura', gender: 'wanita', role: 'Mahasiswa baru (perempuan)', emoji: '👩', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'はじめまして。私[わたし]は たなか はやとです。', ro: 'Hajimemashite. Watashi wa Tanaka Hayato desu.', id: 'Senang berkenalan. Saya Tanaka Hayato.' },
      { speaker: 'B', text: 'はじめまして。私[わたし]は さくら です。', ro: 'Hajimemashite. Watashi wa Sakura desu.', id: 'Senang berkenalan. Saya Sakura.' },
      { speaker: 'A', text: 'さくらさんは がくせいですか。', ro: 'Sakura-san wa gakusei desu ka.', id: 'Sakura-san, apakah kamu mahasiswa?' },
      { speaker: 'B', text: 'はい、がくせいです。たなかさんは？', ro: 'Hai, gakusei desu. Tanaka-san wa?', id: 'Ya, saya mahasiswa. Bagaimana dengan Tanaka-san?' },
      { speaker: 'A', text: '私[わたし]も がくせいです。にほんご[ご]の がくせいです。', ro: 'Watashi mo gakusei desu. Nihongo no gakusei desu.', id: 'Saya juga mahasiswa. Mahasiswa bahasa Jepang.' },
      { speaker: 'B', text: 'そうですか。どこの がっこうですか。', ro: 'Sou desu ka. Doko no gakkou desu ka.', id: 'Begitu ya. Dari universitas mana?' },
      { speaker: 'A', text: 'とうきょうだいがくです。', ro: 'Toukyou daigaku desu.', id: 'Universitas Tokyo.' },
      { speaker: 'B', text: 'あ、そうですか。よろしく おねがいします。', ro: 'A, sou desu ka. Yoroshiku onegaishimasu.', id: 'Oh begitu ya. Senang berkenalan denganmu!' },
    ],
    quiz: {
      question: 'Tanaka-san adalah mahasiswa dari universitas mana?',
      options: ['Kyoto Daigaku', 'Toukyou Daigaku', 'Osaka Daigaku', 'Hokkaidou Daigaku'],
      answer: 1,
      explanation: 'Hayato (Tanaka) berkata 「とうきょうだいがくです」 yang berarti "Universitas Tokyo".'
    }
  },
  {
    id: 'n5-ch02',
    title: 'Belanja di Konbini',
    scenario: 'Sore hari di minimarket (konbini). Riku ingin membeli makanan dan minuman.',
    emoji: '🏪',
    difficulty: 'easy',
    topic: 'Kaimono (買い物)',
    context: 'Riku pergi ke minimarket (konbini) untuk membeli onigiri dan teh. Pegawai toko menyambutnya dan membantu transaksi.',
    speakers: [
      { id: 'A', name: 'てんいん', nameRo: 'Ten\'in', gender: 'wanita', role: 'Pegawai toko', emoji: '👩‍💼', colorClass: 'rose' },
      { id: 'B', name: 'りく', nameRo: 'Riku', gender: 'pria', role: 'Pelanggan', emoji: '🧑', colorClass: 'blue' },
    ],
    dialogue: [
      { speaker: 'A', text: 'いらっしゃいませ。', ro: 'Irasshaimase.', id: 'Selamat datang! (Sapaan toko)' },
      { speaker: 'B', text: 'すみません。おにぎりは いくらですか。', ro: 'Sumimasen. Onigiri wa ikura desu ka.', id: 'Permisi. Berapa harga onigiri?' },
      { speaker: 'A', text: 'おにぎりは ひゃくえんです。', ro: 'Onigiri wa hyaku en desu.', id: 'Onigiri harganya 100 yen.' },
      { speaker: 'B', text: 'じゃあ、おにぎりを みっつ ください。', ro: 'Jaa, onigiri o mittsu kudasai.', id: 'Kalau begitu, saya mau tiga onigiri.' },
      { speaker: 'A', text: 'はい。ほかに なにか。', ro: 'Hai. Hoka ni nanika.', id: 'Baik. Ada yang lain?' },
      { speaker: 'B', text: 'おちゃを ひとつ ください。', ro: 'Ocha o hitotsu kudasai.', id: 'Saya mau satu teh.' },
      { speaker: 'A', text: 'おちゃは ひゃくごじゅうえんです。ぜんぶで さんびゃくごじゅうえんです。', ro: 'Ocha wa hyaku gojuu en desu. Zenbu de sanbyaku gojuu en desu.', id: 'Tehnya 150 yen. Semuanya jadi 350 yen.' },
      { speaker: 'B', text: 'はい。さんびゃくごじゅうえんで おねがいします。', ro: 'Hai. Sanbyaku gojuu en de onegaishimasu.', id: 'Baik, bayar 350 yen ya.' },
    ],
    quiz: {
      question: 'Berapa total harga belanjaan Riku?',
      options: ['200 yen', '250 yen', '350 yen', '450 yen'],
      answer: 2,
      explanation: 'Onigiri 100 yen x 3 = 300 yen, ditambah teh 150 yen. Totalnya 350 yen (さんびゃくごじゅうえん).'
    }
  },
  {
    id: 'n5-ch03',
    title: 'Menanyakan Arah',
    scenario: 'Yuki tersesat di jalan. Ia bertanya arah kepada seseorang yang kebetulan lewat.',
    emoji: '🗺️',
    difficulty: 'easy',
    topic: 'Michi o kiku (道を聞く)',
    context: 'Yuki sedang mencari stasiun tetapi tersesat. Ia bertanya arah kepada orang yang sedang berjalan di jalan.',
    speakers: [
      { id: 'A', name: 'ゆき', nameRo: 'Yuki', gender: 'pria', role: 'Orang yang bertanya arah', emoji: '🧑', colorClass: 'blue' },
      { id: 'B', name: 'せんせい', nameRo: 'Sensei', gender: 'wanita', role: 'Orang yang ditanya', emoji: '👩', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'すみません。えきは どこですか。', ro: 'Sumimasen. Eki wa doko desu ka.', id: 'Permisi. Di mana stasiunnya?' },
      { speaker: 'B', text: 'えきですね。まっすぐ いって、みぎに まがってください。', ro: 'Eki desu ne. Massugu itte, migi ni magatte kudasai.', id: 'Stasiun ya. Jalan lurus terus, lalu belok kanan.' },
      { speaker: 'A', text: 'まっすぐ ですか。', ro: 'Massugu desu ka.', id: 'Lurus terus?' },
      { speaker: 'B', text: 'はい。ふんつきくらい ですよ。', ro: 'Hai. Funtuki kurai desu yo.', id: 'Ya. Kira-kira 2 menit jalan kaki.' },
      { speaker: 'A', text: 'わかりました。ありがとう ございます。', ro: 'Wakarimashita. Arigatou gozaimasu.', id: 'Mengerti. Terima kasih banyak.' },
      { speaker: 'B', text: 'どういたしまして。', ro: 'Dou itashimashite.', id: 'Sama-sama.' },
    ],
    quiz: {
      question: 'Setelah jalan lurus, ke arah mana Yuki harus belok?',
      options: ['Hidari (kiri)', 'Migi (kanan)', 'Mae (depan)', 'Ushiro (belakang)'],
      answer: 1,
      explanation: 'Sensei berkata 「みぎに まがってください」 yang berarti "tolong belok kanan" (migi = kanan).'
    }
  },
  {
    id: 'n5-ch04',
    title: 'Di Restoran',
    scenario: 'Makan siang di restoran Jepang. Mei dan Haru sedang memesan makanan.',
    emoji: '🍽️',
    difficulty: 'easy',
    topic: 'Resutoran (レストラン)',
    context: 'Mei dan Haru pergi makan siang ke restoran Jepang. Pelayan restoran menyambut mereka dan membantu memesan.',
    speakers: [
      { id: 'A', name: 'うえさん', nameRo: 'Uesan', gender: 'wanita', role: 'Pelayan restoran', emoji: '👩‍🍳', colorClass: 'rose' },
      { id: 'B', name: 'めい', nameRo: 'Mei', gender: 'pria', role: 'Pelanggan', emoji: '🧑', colorClass: 'blue' },
    ],
    dialogue: [
      { speaker: 'A', text: 'いらっしゃいませ。なんめいさまですか。', ro: 'Irasshaimase. Nanmeisama desu ka.', id: 'Selamat datang. Berapa orang?' },
      { speaker: 'B', text: 'ふたりです。', ro: 'Futari desu.', id: 'Dua orang.' },
      { speaker: 'A', text: 'こちらへ どうぞ。', ro: 'Kochira e douzo.', id: 'Ke sini, silakan.' },
      { speaker: 'A', text: 'ごちゅうもんは おきまりですか。', ro: 'Gochuumon wa okimari desu ka.', id: 'Sudah siap memesan?' },
      { speaker: 'B', text: 'ていしょくを ふたつ おねがいします。', ro: 'Teishoku o futatsu onegaishimasu.', id: 'Kami mau dua set menu, tolong.' },
      { speaker: 'A', text: 'かしこまりました。おのみものは？', ro: 'Kashikomarimashita. O-nomimono wa?', id: 'Baik. Minumannya?' },
      { speaker: 'B', text: 'みずを おねがいします。', ro: 'Mizu o onegaishimasu.', id: 'Air mineral, tolong.' },
    ],
    quiz: {
      question: 'Berapa orang yang makan di restoran tersebut?',
      options: ['Hitori (satu orang)', 'Futari (dua orang)', 'Sannin (tiga orang)', 'Yonin (empat orang)'],
      answer: 1,
      explanation: 'Mei berkata 「ふたりです」 yang berarti "dua orang" (futari = dua orang).'
    }
  },
  {
    id: 'n5-ch05',
    title: 'Bicara tentang Hobi',
    scenario: 'Di taman kampus. Kenji dan Aoi sedang mengobrol tentang hobi mereka di waktu luang.',
    emoji: '⚽',
    difficulty: 'easy',
    topic: 'Shumi (趣味)',
    context: 'Kenji bertemu Aoi di taman kampus. Mereka mulai mengobrol tentang hobi masing-masing.',
    speakers: [
      { id: 'A', name: 'けんじ', nameRo: 'Kenji', gender: 'pria', role: 'Mahasiswa yang suka olahraga', emoji: '👦', colorClass: 'blue' },
      { id: 'B', name: 'あおい', nameRo: 'Aoi', gender: 'wanita', role: 'Mahasiswa yang suka musik', emoji: '👧', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'Aoiさん、しゅみは 何[なん]ですか。', ro: 'Aoi-san, shumi wa nan desu ka.', id: 'Aoi-san, hobi kamu apa?' },
      { speaker: 'B', text: '私[わたし]の しゅみは おんがくです。ケータイで おんがくを よく 聞[き]きます。', ro: 'Watashi no shumi wa ongaku desu. Keetai de ongaku o yoku kikimasu.', id: 'Hobi saya musik. Saya sering dengar musik lewat HP.' },
      { speaker: 'A', text: 'そうですか。どんな おんがくが 好[す]きですか。', ro: 'Sou desu ka. Donna ongaku ga suki desu ka.', id: 'Begitu ya. Musik jenis apa yang kamu suka?' },
      { speaker: 'B', text: 'J-POPが 好[す]きです。Kenjiさんは？', ro: 'J-POP ga suki desu. Kenji-san wa?', id: 'Saya suka J-POP. Bagaimana dengan Kenji-san?' },
      { speaker: 'A', text: '私[わたし]は スポーツが 好[す]きです。とくに サッカーです。', ro: 'Watashi wa supootsu ga suki desu. Tokuni sakkaa desu.', id: 'Saya suka olahraga. Terutama sepak bola.' },
      { speaker: 'B', text: 'へえ、すごいですね。いつも サッカーを しますか。', ro: 'Hee, sugoi desu ne. Itsumo sakkaa o shimasu ka.', id: 'Heh, keren ya. Apakah kamu selalu main bola?' },
      { speaker: 'A', text: 'ええ、どようびに よく します。', ro: 'Ee, doyoubi ni yoku shimasu.', id: 'Ya, saya sering main di hari Sabtu.' },
    ],
    quiz: {
      question: 'Hobi Aoi adalah apa?',
      options: ['Sakkaa (Sepak bola)', 'Eiga (Film)', 'Ongaku (Musik)', 'Ryouri (Memasak)'],
      answer: 2,
      explanation: 'Aoi berkata 「私のしゅみはおんがくです」 yang berarti "Hobi saya musik" (ongaku = musik).'
    }
  },
  {
    id: 'n5-ch06',
    title: 'Ngobrol tentang Cuaca',
    scenario: 'Pagi hari di halte bus. Sato dan Kitamura sedang menunggu bus sambil ngobrol.',
    emoji: '☀️',
    difficulty: 'easy',
    topic: 'Tenki (天気)',
    context: 'Sato dan Kitamura sedang menunggu bus di halte pada pagi hari. Mereka mengobrol tentang cuaca hari ini.',
    speakers: [
      { id: 'A', name: 'さとう', nameRo: 'Satou', gender: 'wanita', role: 'Penumpang halte bus', emoji: '👩', colorClass: 'rose' },
      { id: 'B', name: 'きたむら', nameRo: 'Kitamura', gender: 'pria', role: 'Penumpang halte bus', emoji: '👨', colorClass: 'blue' },
    ],
    dialogue: [
      { speaker: 'A', text: 'きょうは いい てんきですね。', ro: 'Kyou wa ii tenki desu ne.', id: 'Hari ini cuacanya bagus ya.' },
      { speaker: 'B', text: 'はい、とても あたたかいです。', ro: 'Hai, totemo atatakai desu.', id: 'Ya, sangat hangat.' },
      { speaker: 'A', text: 'あしたも いい てんきですか。', ro: 'Ashita mo ii tenki desu ka.', id: 'Besok cuacanya bagus juga?' },
      { speaker: 'B', text: 'さあ、わかりません。でも、きのうは あめでしたよ。', ro: 'Saa, wakarimasen. Demo, kinou wa ame deshita yo.', id: 'Hmm, tidak tahu. Tapi kemarin hujan loh.' },
      { speaker: 'A', text: 'そうですか。じゃあ、かさを もちましょう。', ro: 'Sou desu ka. Jaa, kasa o mochimashou.', id: 'Begitu ya. Kalau begitu, bawa payung ya.' },
      { speaker: 'B', text: 'いい かんがえですね。', ro: 'Ii kangae desu ne.', id: 'Ide bagus.' },
    ],
    quiz: {
      question: 'Bagaimana cuaca kemarin menurut Kitamura?',
      options: ['Hare (Cerah)', 'Ame (Hujan)', 'Yuki (Salju)', 'Kumori (Berawan)'],
      answer: 1,
      explanation: 'Kitamura berkata 「きのうはあめでしたよ」 yang berarti "kemarin hujan" (ame = hujan).'
    }
  },
  {
    id: 'n5-ch07',
    title: 'Janjian Teman',
    scenario: 'Rina dan Daiki sedang mengatur janjian untuk pergi nonton film bersama di akhir pekan.',
    emoji: '📱',
    difficulty: 'medium',
    topic: 'Yakusoku (約束)',
    context: 'Rina ingin mengajak Daiki nonton film bareng di akhir pekan. Mereka sedang mengatur waktu dan tempat pertemuan.',
    speakers: [
      { id: 'A', name: 'りな', nameRo: 'Rina', gender: 'wanita', role: 'Mengajak nonton film', emoji: '👩', colorClass: 'rose' },
      { id: 'B', name: 'だいき', nameRo: 'Daiki', gender: 'pria', role: 'Diajak nonton film', emoji: '👨', colorClass: 'blue' },
    ],
    dialogue: [
      { speaker: 'A', text: 'Daikiくん、どようびの ごご、ひまですか。', ro: 'Daiki-kun, doyoubi no gogo, hima desu ka.', id: 'Daiki-kun, Sabtu sore, kamu luang?' },
      { speaker: 'B', text: 'どようびの ごごですね。はい、ひまです。', ro: 'Doyoubi no gogo desu ne. Hai, hima desu.', id: 'Sabtu sore ya. Ya, saya luang.' },
      { speaker: 'A', text: 'いっしょに えいがを みませんか。', ro: 'Issho ni eiga o mimasen ka.', id: 'Mau nonton film bareng?' },
      { speaker: 'B', text: 'いいですね！なんじに あいますか。', ro: 'Ii desu ne! Nanji ni aimasu ka.', id: 'Bagus! Jam berapa ketemuan?' },
      { speaker: 'A', text: 'さんじに えきの まえで あいましょう。', ro: 'Sanji ni eki no mae de aimashou.', id: 'Ketemuan jam 3 di depan stasiun ya.' },
      { speaker: 'B', text: 'わかりました。さんじに えきの まえですね。', ro: 'Wakarimashita. Sanji ni eki no mae desu ne.', id: 'Mengerti. Jam 3 di depan stasiun ya.' },
      { speaker: 'A', text: 'はい。じゃあ、どようびに！', ro: 'Hai. Jaa, doyoubi ni!', id: 'Ya. Sampai ketemu Sabtu!' },
    ],
    quiz: {
      question: 'Di mana mereka akan bertemu?',
      options: ['Kooban (Kantor pos)', 'Eki no mae (Depan stasiun)', 'Gakkou (Sekolah)', 'Byouin (Rumah sakit)'],
      answer: 1,
      explanation: 'Rina berkata 「えきのまえであいましょう」 yang berarti "ketemuan di depan stasiun" (eki no mae = depan stasiun).'
    }
  },
  {
    id: 'n5-ch08',
    title: 'Menelepon Teman',
    scenario: 'Takashi menelepon temannya Haruka untuk mengabarkan tentang pesta ulang tahun.',
    emoji: '📞',
    difficulty: 'medium',
    topic: 'Denwa (電話)',
    context: 'Takashi menelepon Haruka untuk mengundangnya ke pesta ulang tahun besok sore. Mereka sedang membicarakan detail acara.',
    speakers: [
      { id: 'A', name: 'たかし', nameRo: 'Takashi', gender: 'pria', role: 'Yang berulang tahun', emoji: '👦', colorClass: 'blue' },
      { id: 'B', name: 'はるか', nameRo: 'Haruka', gender: 'wanita', role: 'Teman yang diundang', emoji: '👧', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'もしもし、Harukaさんですか。', ro: 'Moshi moshi, Haruka-san desu ka.', id: 'Halo, apakah ini Haruka-san?' },
      { speaker: 'B', text: 'はい、Harukaです。どちらさまですか。', ro: 'Hai, Haruka desu. Dochira sama desu ka.', id: 'Ya, saya Haruka. Siapa ini?' },
      { speaker: 'A', text: 'Takashiです。こんばんは。', ro: 'Takashi desu. Konbanwa.', id: 'Saya Takashi. Selamat malam.' },
      { speaker: 'B', text: 'あ、Takashiさん！こんばんは。', ro: 'A, Takashi-san! Konbanwa.', id: 'Oh Takashi-san! Selamat malam.' },
      { speaker: 'A', text: 'あしたの ごご、わたしの たんじょうびの パーティーを します。', ro: 'Ashita no gogo, watashi no tanjoubi no paatii o shimasu.', id: 'Besok sore, saya ada pesta ulang tahun.' },
      { speaker: 'B', text: 'おめでとうございます！なんじからですか。', ro: 'Omedetou gozaimasu! Nanji kara desu ka.', id: 'Selamat ulang tahun! Dari jam berapa?' },
      { speaker: 'A', text: 'ごご よじから です。こられますか。', ro: 'Gogo yoji kara desu. Koremasu ka.', id: 'Dari jam 4 sore. Bisa datang?' },
      { speaker: 'B', text: 'はい、ぜひ いきます！ありがとう。', ro: 'Hai, zehi ikimasu! Arigatou.', id: 'Ya, tentu saya datang! Terima kasih!' },
    ],
    quiz: {
      question: 'Pesta ulang tahun Takashi dimulai dari jam berapa?',
      options: ['Goji (jam 5)', 'Yoji (jam 4)', 'Saji (jam 3)', 'Roji (jam 6)'],
      answer: 1,
      explanation: 'Takashi berkata 「ごごよじからです」 yang berarti "dari jam 4 sore" (yoji = jam 4).'
    }
  },
  {
    id: 'n5-ch09',
    title: 'Di Perpustakaan',
    scenario: 'Hana pergi ke perpustakaan untuk meminjam buku bahasa Jepang.',
    emoji: '📚',
    difficulty: 'easy',
    topic: 'Toshokan (図書館)',
    context: 'Hana pergi ke perpustakaan kota untuk mencari buku pelajaran bahasa Jepang. Pustakawan membantunya.',
    speakers: [
      { id: 'A', name: 'はな', nameRo: 'Hana', gender: 'wanita', role: 'Pengunjung perpustakaan', emoji: '👩', colorClass: 'rose' },
      { id: 'B', name: 'しかん', nameRo: 'Shikan', gender: 'pria', role: 'Pustakawan', emoji: '👨‍💼', colorClass: 'blue' },
    ],
    dialogue: [
      { speaker: 'A', text: 'すみません。にほんご[ご]の ほんは どこですか。', ro: 'Sumimasen. Nihongo no hon wa doko desu ka.', id: 'Permisi. Buku bahasa Jepang di mana ya?' },
      { speaker: 'B', text: 'にほんご[ご]の ほんですね。にかいです。', ro: 'Nihongo no hon desu ne. Nikai desu.', id: 'Buku bahasa Jepang ya. Di lantai dua.' },
      { speaker: 'A', text: 'にかいですね。ありがとう ございます。', ro: 'Nikai desu ne. Arigatou gozaimasu.', id: 'Lantai dua ya. Terima kasih banyak.' },
      { speaker: 'B', text: 'この ほんは いくらですか。', ro: 'Kono hon wa ikura desu ka.', id: 'Buku ini berapa?' },
      { speaker: 'A', text: 'えっ、ちがいます。これは ほんです。', ro: 'Eh, chigaimasu. Kore wa hon desu.', id: 'Eh, salah. Ini buku.' },
      { speaker: 'B', text: 'あ、すみません。これは ほんを かりる かどうか ですか。', ro: 'A, sumimasen. Kore wa hon o kariru ka dou ka desu ka.', id: 'Ah, maaf. Anda mau meminjam buku?' },
      { speaker: 'A', text: 'はい、かりたいです。', ro: 'Hai, karitai desu.', id: 'Ya, saya mau meminjam.' },
      { speaker: 'B', text: 'じゃあ、この カードを ください。にしゅうかん かりられます。', ro: 'Jaa, kono kaado o kudasai. Nishuukan kariremasu.', id: 'Kalau begitu, tolong isi kartu ini. Bisa dipinjam 2 minggu.' },
    ],
    quiz: {
      question: 'Berapa lama Hana bisa meminjam buku?',
      options: ['Isshuukan (1 minggu)', 'Nishuukan (2 minggu)', 'Sanshuukan (3 minggu)', 'Ikkagetsu (1 bulan)'],
      answer: 1,
      explanation: 'Pustakawan berkata 「にしゅうかんかりられます」 yang berarti "bisa dipinjam 2 minggu" (nishuukan = 2 minggu).'
    }
  },
  {
    id: 'n5-ch10',
    title: 'Di Kantor Pos',
    scenario: 'Kenta pergi ke kantor pos untuk mengirim paket ke Jepang.',
    emoji: '📮',
    difficulty: 'medium',
    topic: 'Yuubinkyoku (郵便局)',
    context: 'Kenta ingin mengirim paket ke Osaka. Ia pergi ke kantor pos dan bertanya tentang ongkos kirim.',
    speakers: [
      { id: 'A', name: 'けんた', nameRo: 'Kenta', gender: 'pria', role: 'Pengirim paket', emoji: '🧑', colorClass: 'blue' },
      { id: 'B', name: 'ちゅういん', nameRo: 'Chuuin', gender: 'wanita', role: 'Petugas kantor pos', emoji: '👩‍💼', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'すみません。この にもつを おおさかに おくりたいです。', ro: 'Sumimasen. Kono nimotsu o Oosaka ni okuritai desu.', id: 'Permisi. Saya mau mengirim paket ini ke Osaka.' },
      { speaker: 'B', text: 'おおさかですね。ふつうで いいですか。', ro: 'Oosaka desu ne. Futsuu de ii desu ka.', id: 'Ke Osaka ya. Pakai reguler biasa saja?' },
      { speaker: 'A', text: 'はい、ふつうで おねがいします。いくらですか。', ro: 'Hai, futsuu de onegaishimasu. Ikura desu ka.', id: 'Ya, reguler saja tolong. Berapa harganya?' },
      { speaker: 'B', text: 'ごひゃくえんです。', ro: 'Gohyaku en desu.', id: '500 yen.' },
      { speaker: 'A', text: 'いつ つきますか。', ro: 'Itsu tsukimasu ka.', id: 'Kapan sampai?' },
      { speaker: 'B', text: 'みっかくらいで つきます。', ro: 'Mikka kurai de tsukimasu.', id: 'Kira-kira 3 hari sampai.' },
      { speaker: 'A', text: 'そうですか。じゃあ、これ おねがいします。', ro: 'Sou desu ka. Jaa, kore onegaishimasu.', id: 'Begitu ya. Kalau begitu, tolong kirim ini.' },
    ],
    quiz: {
      question: 'Berapa lama paket sampai ke Osaka?',
      options: ['Ichinichi (1 hari)', 'Futuka (2 hari)', 'Mikka (3 hari)', 'Yokka (4 hari)'],
      answer: 2,
      explanation: 'Petugas berkata 「みっかくらいでつきます」 yang berarti "kira-kira 3 hari sampai" (mikka = 3 hari).'
    }
  },
  {
    id: 'n5-ch11',
    title: 'Menanyakan Waktu',
    scenario: 'Naoki bertanya waktu kepada orang yang lewat di stasiun.',
    emoji: '⏰',
    difficulty: 'easy',
    topic: 'Jikan o kiku (時間を聞く)',
    context: 'Naoki sedang menunggu kereta di stasiun. Jam tangannya rusak, jadi ia bertanya waktu kepada orang di sebelahnya.',
    speakers: [
      { id: 'A', name: 'なおき', nameRo: 'Naoki', gender: 'pria', role: 'Yang bertanya waktu', emoji: '👦', colorClass: 'blue' },
      { id: 'B', name: 'やすこ', nameRo: 'Yasuko', gender: 'wanita', role: 'Yang ditanya waktu', emoji: '👩', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'すみません。いま なんじですか。', ro: 'Sumimasen. Ima nanji desu ka.', id: 'Permisi. Jam berapa sekarang?' },
      { speaker: 'B', text: 'いま、くじ はん です。', ro: 'Ima, kuji han desu.', id: 'Sekarang jam setengah sepuluh.' },
      { speaker: 'A', text: 'あっ、もう くじですか。ありがとうございます。', ro: 'A, mou kuji desu ka. Arigatou gozaimasu.', id: 'Wah, sudah jam sepuluh ya. Terima kasih.' },
      { speaker: 'B', text: 'なおきさんは どこへ いきますか。', ro: 'Naoki-san wa doko e ikimasu ka.', id: 'Naoki-san mau ke mana?' },
      { speaker: 'A', text: 'がっこうへ いきます。ちょっと おくれています。', ro: 'Gakkou e ikimasu. Chotto okurete imasu.', id: 'Ke sekolah. Saya sedikit terlambat.' },
      { speaker: 'B', text: 'だいじょうぶですよ。がんばってください。', ro: 'Daijoubu desu yo. Ganbatte kudasai.', id: 'Tidak apa-apa kok. Semangat ya!' },
    ],
    quiz: {
      question: 'Jam berapa ketika Naoki bertanya?',
      options: ['Hachiji (jam 8)', 'Kuji (jam 9)', 'Juuji (jam 10)', 'Kuji han (jam 9:30)'],
      answer: 3,
      explanation: 'Yasuko berkata 「いまくじはんです」 yang berarti "sekarang jam setengah sepuluh" (kuji han = 9:30).'
    }
  },
  {
    id: 'n5-ch12',
    title: 'Ngobrol tentang Makanan',
    scenario: 'Yuto dan Miku sedang makan bersama di kantin kampus.',
    emoji: '🍱',
    difficulty: 'easy',
    topic: 'Tabemono (食べ物)',
    context: 'Yuto dan Miku makan siang di kantin kampus. Mereka mengobrol tentang makanan favorit masing-masing.',
    speakers: [
      { id: 'A', name: 'ゆうと', nameRo: 'Yuto', gender: 'pria', role: 'Suka ramen', emoji: '👦', colorClass: 'blue' },
      { id: 'B', name: 'みく', nameRo: 'Miku', gender: 'wanita', role: 'Suka sushi', emoji: '👧', colorClass: 'rose' },
    ],
    dialogue: [
      { speaker: 'A', text: 'Mikuさん、なにが すきなたべものですか。', ro: 'Miku-san, nani ga suki na tabemono desu ka.', id: 'Miku-san, makanan favorit kamu apa?' },
      { speaker: 'B', text: 'すしと てんぷらが すきです。Yutoさんは？', ro: 'Sushi to tenpura ga suki desu. Yuto-san wa?', id: 'Saya suka sushi dan tempura. Bagaimana dengan Yuto-san?' },
      { speaker: 'A', text: 'わたしは らーめんが いちばん すきです。', ro: 'Watashi wa raamen ga ichiban suki desu.', id: 'Saya paling suka ramen.' },
      { speaker: 'B', text: 'へえ、らーめんが すきですか。よく たべますか。', ro: 'Hee, raamen ga suki desu ka. Yoku tabemasu ka.', id: 'Oh kamu suka ramen. Sering makan?' },
      { speaker: 'A', text: 'ええ、しゅうに にど くらい たべます。', ro: 'Ee, shuuni ni do kurai tabemasu.', id: 'Ya, sekitar dua kali seminggu.' },
      { speaker: 'B', text: 'すごいですね。つぎは いっしょに いきましょう！', ro: 'Sugoi desu ne. Tsugi wa issho ni ikimashou!', id: 'Keren ya. Lain kali pergi bareng!' },
    ],
    quiz: {
      question: 'Makanan favorit Yuto adalah apa?',
      options: ['Sushi', 'Tenpura', 'Raamen', 'Sashimi'],
      answer: 2,
      explanation: 'Yuto berkata 「わたしはらーめんがいちばんすきです」 yang berarti "saya paling suka ramen" (raamen = ramen).'
    }
  },
];

export const getChoukaiById = (id: string): ChoukaiMaterial | undefined => {
  return N5_CHOUKAI_MATERIALS.find(m => m.id === id);
};

export const getRandomChoukai = (): ChoukaiMaterial => {
  return N5_CHOUKAI_MATERIALS[Math.floor(Math.random() * N5_CHOUKAI_MATERIALS.length)];
};
