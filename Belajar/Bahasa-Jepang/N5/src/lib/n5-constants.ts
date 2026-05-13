/**
 * Gemu Nihongo - JLPT N5 Constants
 * Data source: Original N5 app constants
 */

export interface Character {
  ja: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  category?: 'basic' | 'dakuon' | 'handakuon' | 'yoon' | 'sokuon';
  strokes?: string;
}

export interface Vocabulary {
  word: string;
  reading: string;
  meaning: string;
  category: string;
  explanation?: string;
  formula?: string;
}

export interface Kanji {
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes?: number;
  examples: { word: string; reading: string; meaning: string }[];
}

export interface GrammarPoint {
  title: string;
  structure: string;
  explanation: string;
  examples: { ja: string; en: string }[];
}

export const HIRAGANA: Character[] = [
  // Basic
  { ja: 'あ', romaji: 'a', type: 'hiragana', category: 'basic' }, { ja: 'い', romaji: 'i', type: 'hiragana', category: 'basic' },
  { ja: 'う', romaji: 'u', type: 'hiragana', category: 'basic' }, { ja: 'え', romaji: 'e', type: 'hiragana', category: 'basic' },
  { ja: 'お', romaji: 'o', type: 'hiragana', category: 'basic' }, { ja: 'か', romaji: 'ka', type: 'hiragana', category: 'basic' },
  { ja: 'き', romaji: 'ki', type: 'hiragana', category: 'basic' }, { ja: 'く', romaji: 'ku', type: 'hiragana', category: 'basic' },
  { ja: 'け', romaji: 'ke', type: 'hiragana', category: 'basic' }, { ja: 'こ', romaji: 'ko', type: 'hiragana', category: 'basic' },
  { ja: 'さ', romaji: 'sa', type: 'hiragana', category: 'basic' }, { ja: 'し', romaji: 'shi', type: 'hiragana', category: 'basic' },
  { ja: 'す', romaji: 'su', type: 'hiragana', category: 'basic' }, { ja: 'せ', romaji: 'se', type: 'hiragana', category: 'basic' },
  { ja: 'そ', romaji: 'so', type: 'hiragana', category: 'basic' }, { ja: 'た', romaji: 'ta', type: 'hiragana', category: 'basic' },
  { ja: 'ち', romaji: 'chi', type: 'hiragana', category: 'basic' }, { ja: 'つ', romaji: 'tsu', type: 'hiragana', category: 'basic' },
  { ja: 'て', romaji: 'te', type: 'hiragana', category: 'basic' }, { ja: 'と', romaji: 'to', type: 'hiragana', category: 'basic' },
  { ja: 'な', romaji: 'na', type: 'hiragana', category: 'basic' }, { ja: 'に', romaji: 'ni', type: 'hiragana', category: 'basic' },
  { ja: 'ぬ', romaji: 'nu', type: 'hiragana', category: 'basic' }, { ja: 'ね', romaji: 'ne', type: 'hiragana', category: 'basic' },
  { ja: 'の', romaji: 'no', type: 'hiragana', category: 'basic' }, { ja: 'は', romaji: 'ha', type: 'hiragana', category: 'basic' },
  { ja: 'ひ', romaji: 'hi', type: 'hiragana', category: 'basic' }, { ja: 'ふ', romaji: 'fu', type: 'hiragana', category: 'basic' },
  { ja: 'へ', romaji: 'he', type: 'hiragana', category: 'basic' }, { ja: 'ほ', romaji: 'ho', type: 'hiragana', category: 'basic' },
  { ja: 'ま', romaji: 'ma', type: 'hiragana', category: 'basic' }, { ja: 'み', romaji: 'mi', type: 'hiragana', category: 'basic' },
  { ja: 'む', romaji: 'mu', type: 'hiragana', category: 'basic' }, { ja: 'め', romaji: 'me', type: 'hiragana', category: 'basic' },
  { ja: 'も', romaji: 'mo', type: 'hiragana', category: 'basic' }, { ja: 'や', romaji: 'ya', type: 'hiragana', category: 'basic' },
  { ja: 'ゆ', romaji: 'yu', type: 'hiragana', category: 'basic' }, { ja: 'よ', romaji: 'yo', type: 'hiragana', category: 'basic' },
  { ja: 'ら', romaji: 'ra', type: 'hiragana', category: 'basic' }, { ja: 'り', romaji: 'ri', type: 'hiragana', category: 'basic' },
  { ja: 'る', romaji: 'ru', type: 'hiragana', category: 'basic' }, { ja: 'れ', romaji: 're', type: 'hiragana', category: 'basic' },
  { ja: 'ろ', romaji: 'ro', type: 'hiragana', category: 'basic' }, { ja: 'わ', romaji: 'wa', type: 'hiragana', category: 'basic' },
  { ja: 'を', romaji: 'wo', type: 'hiragana', category: 'basic' }, { ja: 'ん', romaji: 'n', type: 'hiragana', category: 'basic' },
  // Dakuon
  { ja: 'が', romaji: 'ga', type: 'hiragana', category: 'dakuon' }, { ja: 'ぎ', romaji: 'gi', type: 'hiragana', category: 'dakuon' },
  { ja: 'ぐ', romaji: 'gu', type: 'hiragana', category: 'dakuon' }, { ja: 'げ', romaji: 'ge', type: 'hiragana', category: 'dakuon' },
  { ja: 'ご', romaji: 'go', type: 'hiragana', category: 'dakuon' }, { ja: 'ざ', romaji: 'za', type: 'hiragana', category: 'dakuon' },
  { ja: 'じ', romaji: 'ji', type: 'hiragana', category: 'dakuon' }, { ja: 'ず', romaji: 'zu', type: 'hiragana', category: 'dakuon' },
  { ja: 'ぜ', romaji: 'ze', type: 'hiragana', category: 'dakuon' }, { ja: 'ぞ', romaji: 'zo', type: 'hiragana', category: 'dakuon' },
  { ja: 'だ', romaji: 'da', type: 'hiragana', category: 'dakuon' }, { ja: 'ぢ', romaji: 'ji', type: 'hiragana', category: 'dakuon' },
  { ja: 'づ', romaji: 'zu', type: 'hiragana', category: 'dakuon' }, { ja: 'で', romaji: 'de', type: 'hiragana', category: 'dakuon' },
  { ja: 'ど', romaji: 'do', type: 'hiragana', category: 'dakuon' }, { ja: 'ば', romaji: 'ba', type: 'hiragana', category: 'dakuon' },
  { ja: 'び', romaji: 'bi', type: 'hiragana', category: 'dakuon' }, { ja: 'ぶ', romaji: 'bu', type: 'hiragana', category: 'dakuon' },
  { ja: 'べ', romaji: 'be', type: 'hiragana', category: 'dakuon' }, { ja: 'ぼ', romaji: 'bo', type: 'hiragana', category: 'dakuon' },
  // Handakuon
  { ja: 'ぱ', romaji: 'pa', type: 'hiragana', category: 'handakuon' }, { ja: 'ぴ', romaji: 'pi', type: 'hiragana', category: 'handakuon' },
  { ja: 'ぷ', romaji: 'pu', type: 'hiragana', category: 'handakuon' }, { ja: 'ぺ', romaji: 'pe', type: 'hiragana', category: 'handakuon' },
  { ja: 'ぽ', romaji: 'po', type: 'hiragana', category: 'handakuon' },
  // Yoon
  { ja: 'きゃ', romaji: 'kya', type: 'hiragana', category: 'yoon' }, { ja: 'きゅ', romaji: 'kyu', type: 'hiragana', category: 'yoon' },
  { ja: 'きょ', romaji: 'kyo', type: 'hiragana', category: 'yoon' }, { ja: 'しゃ', romaji: 'sha', type: 'hiragana', category: 'yoon' },
  { ja: 'しゅ', romaji: 'shu', type: 'hiragana', category: 'yoon' }, { ja: 'しょ', romaji: 'sho', type: 'hiragana', category: 'yoon' },
  { ja: 'ちゃ', romaji: 'cha', type: 'hiragana', category: 'yoon' }, { ja: 'ちゅ', romaji: 'chu', type: 'hiragana', category: 'yoon' },
  { ja: 'ちょ', romaji: 'cho', type: 'hiragana', category: 'yoon' }, { ja: 'にゃ', romaji: 'nya', type: 'hiragana', category: 'yoon' },
  { ja: 'にゅ', romaji: 'nyu', type: 'hiragana', category: 'yoon' }, { ja: 'にょ', romaji: 'nyo', type: 'hiragana', category: 'yoon' },
  { ja: 'ひゃ', romaji: 'hya', type: 'hiragana', category: 'yoon' }, { ja: 'ひゅ', romaji: 'hyu', type: 'hiragana', category: 'yoon' },
  { ja: 'ひょ', romaji: 'hyo', type: 'hiragana', category: 'yoon' }, { ja: 'みゃ', romaji: 'mya', type: 'hiragana', category: 'yoon' },
  { ja: 'みゅ', romaji: 'myu', type: 'hiragana', category: 'yoon' }, { ja: 'みょ', romaji: 'myo', type: 'hiragana', category: 'yoon' },
  { ja: 'りゃ', romaji: 'rya', type: 'hiragana', category: 'yoon' }, { ja: 'りゅ', romaji: 'ryu', type: 'hiragana', category: 'yoon' },
  { ja: 'りょ', romaji: 'ryo', type: 'hiragana', category: 'yoon' },
  // Sokuon
  { ja: 'っ', romaji: 'tsu (sokuon)', type: 'hiragana', category: 'sokuon' },
];

export const KATAKANA: Character[] = [
  // Basic
  { ja: 'ア', romaji: 'a', type: 'katakana', category: 'basic' }, { ja: 'イ', romaji: 'i', type: 'katakana', category: 'basic' },
  { ja: 'ウ', romaji: 'u', type: 'katakana', category: 'basic' }, { ja: 'エ', romaji: 'e', type: 'katakana', category: 'basic' },
  { ja: 'オ', romaji: 'o', type: 'katakana', category: 'basic' }, { ja: 'カ', romaji: 'ka', type: 'katakana', category: 'basic' },
  { ja: 'キ', romaji: 'ki', type: 'katakana', category: 'basic' }, { ja: 'ク', romaji: 'ku', type: 'katakana', category: 'basic' },
  { ja: 'ケ', romaji: 'ke', type: 'katakana', category: 'basic' }, { ja: 'コ', romaji: 'ko', type: 'katakana', category: 'basic' },
  { ja: 'サ', romaji: 'sa', type: 'katakana', category: 'basic' }, { ja: 'シ', romaji: 'shi', type: 'katakana', category: 'basic' },
  { ja: 'ス', romaji: 'su', type: 'katakana', category: 'basic' }, { ja: 'セ', romaji: 'se', type: 'katakana', category: 'basic' },
  { ja: 'ソ', romaji: 'so', type: 'katakana', category: 'basic' }, { ja: 'タ', romaji: 'ta', type: 'katakana', category: 'basic' },
  { ja: 'チ', romaji: 'chi', type: 'katakana', category: 'basic' }, { ja: 'ツ', romaji: 'tsu', type: 'katakana', category: 'basic' },
  { ja: 'テ', romaji: 'te', type: 'katakana', category: 'basic' }, { ja: 'ト', romaji: 'to', type: 'katakana', category: 'basic' },
  { ja: 'ナ', romaji: 'na', type: 'katakana', category: 'basic' }, { ja: 'ニ', romaji: 'ni', type: 'katakana', category: 'basic' },
  { ja: 'ヌ', romaji: 'nu', type: 'katakana', category: 'basic' }, { ja: 'ネ', romaji: 'ne', type: 'katakana', category: 'basic' },
  { ja: 'ノ', romaji: 'no', type: 'katakana', category: 'basic' }, { ja: 'ハ', romaji: 'ha', type: 'katakana', category: 'basic' },
  { ja: 'ヒ', romaji: 'hi', type: 'katakana', category: 'basic' }, { ja: 'フ', romaji: 'fu', type: 'katakana', category: 'basic' },
  { ja: 'ヘ', romaji: 'he', type: 'katakana', category: 'basic' }, { ja: 'ホ', romaji: 'ho', type: 'katakana', category: 'basic' },
  { ja: 'マ', romaji: 'ma', type: 'katakana', category: 'basic' }, { ja: 'ミ', romaji: 'mi', type: 'katakana', category: 'basic' },
  { ja: 'ム', romaji: 'mu', type: 'katakana', category: 'basic' }, { ja: 'メ', romaji: 'me', type: 'katakana', category: 'basic' },
  { ja: 'モ', romaji: 'mo', type: 'katakana', category: 'basic' }, { ja: 'ヤ', romaji: 'ya', type: 'katakana', category: 'basic' },
  { ja: 'ユ', romaji: 'yu', type: 'katakana', category: 'basic' }, { ja: 'ヨ', romaji: 'yo', type: 'katakana', category: 'basic' },
  { ja: 'ラ', romaji: 'ra', type: 'katakana', category: 'basic' }, { ja: 'リ', romaji: 'ri', type: 'katakana', category: 'basic' },
  { ja: 'ル', romaji: 'ru', type: 'katakana', category: 'basic' }, { ja: 'レ', romaji: 're', type: 'katakana', category: 'basic' },
  { ja: 'ロ', romaji: 'ro', type: 'katakana', category: 'basic' }, { ja: 'ワ', romaji: 'wa', type: 'katakana', category: 'basic' },
  { ja: 'ヲ', romaji: 'wo', type: 'katakana', category: 'basic' }, { ja: 'ン', romaji: 'n', type: 'katakana', category: 'basic' },
  // Dakuon
  { ja: 'ガ', romaji: 'ga', type: 'katakana', category: 'dakuon' }, { ja: 'ギ', romaji: 'gi', type: 'katakana', category: 'dakuon' },
  { ja: 'グ', romaji: 'gu', type: 'katakana', category: 'dakuon' }, { ja: 'ゲ', romaji: 'ge', type: 'katakana', category: 'dakuon' },
  { ja: 'ゴ', romaji: 'go', type: 'katakana', category: 'dakuon' }, { ja: 'ザ', romaji: 'za', type: 'katakana', category: 'dakuon' },
  { ja: 'ジ', romaji: 'ji', type: 'katakana', category: 'dakuon' }, { ja: 'ズ', romaji: 'zu', type: 'katakana', category: 'dakuon' },
  { ja: 'ゼ', romaji: 'ze', type: 'katakana', category: 'dakuon' }, { ja: 'ゾ', romaji: 'zo', type: 'katakana', category: 'dakuon' },
  { ja: 'ダ', romaji: 'da', type: 'katakana', category: 'dakuon' }, { ja: 'ヂ', romaji: 'ji', type: 'katakana', category: 'dakuon' },
  { ja: 'ヅ', romaji: 'zu', type: 'katakana', category: 'dakuon' }, { ja: 'デ', romaji: 'de', type: 'katakana', category: 'dakuon' },
  { ja: 'ド', romaji: 'do', type: 'katakana', category: 'dakuon' }, { ja: 'バ', romaji: 'ba', type: 'katakana', category: 'dakuon' },
  { ja: 'ビ', romaji: 'bi', type: 'katakana', category: 'dakuon' }, { ja: 'ブ', romaji: 'bu', type: 'katakana', category: 'dakuon' },
  { ja: 'ベ', romaji: 'be', type: 'katakana', category: 'dakuon' }, { ja: 'ボ', romaji: 'bo', type: 'katakana', category: 'dakuon' },
  // Handakuon
  { ja: 'パ', romaji: 'pa', type: 'katakana', category: 'handakuon' }, { ja: 'ピ', romaji: 'pi', type: 'katakana', category: 'handakuon' },
  { ja: 'プ', romaji: 'pu', type: 'katakana', category: 'handakuon' }, { ja: 'ペ', romaji: 'pe', type: 'katakana', category: 'handakuon' },
  { ja: 'ポ', romaji: 'po', type: 'katakana', category: 'handakuon' },
  // Yoon
  { ja: 'キャ', romaji: 'kya', type: 'katakana', category: 'yoon' }, { ja: 'キュ', romaji: 'kyu', type: 'katakana', category: 'yoon' },
  { ja: 'キョ', romaji: 'kyo', type: 'katakana', category: 'yoon' }, { ja: 'シャ', romaji: 'sha', type: 'katakana', category: 'yoon' },
  { ja: 'シュ', romaji: 'shu', type: 'katakana', category: 'yoon' }, { ja: 'ショ', romaji: 'sho', type: 'katakana', category: 'yoon' },
  { ja: 'チャ', romaji: 'cha', type: 'katakana', category: 'yoon' }, { ja: 'チュ', romaji: 'chu', type: 'katakana', category: 'yoon' },
  { ja: 'チョ', romaji: 'cho', type: 'katakana', category: 'yoon' }, { ja: 'ニャ', romaji: 'nya', type: 'katakana', category: 'yoon' },
  { ja: 'ニュ', romaji: 'nyu', type: 'katakana', category: 'yoon' }, { ja: 'ニョ', romaji: 'nyo', type: 'katakana', category: 'yoon' },
  { ja: 'ヒャ', romaji: 'hya', type: 'katakana', category: 'yoon' }, { ja: 'ヒュ', romaji: 'hyu', type: 'katakana', category: 'yoon' },
  { ja: 'ヒョ', romaji: 'hyo', type: 'katakana', category: 'yoon' }, { ja: 'ミャ', romaji: 'mya', type: 'katakana', category: 'yoon' },
  { ja: 'ミュ', romaji: 'myu', type: 'katakana', category: 'yoon' }, { ja: 'ミョ', romaji: 'myo', type: 'katakana', category: 'yoon' },
  { ja: 'リャ', romaji: 'rya', type: 'katakana', category: 'yoon' }, { ja: 'リュ', romaji: 'ryu', type: 'katakana', category: 'yoon' },
  { ja: 'リョ', romaji: 'ryo', type: 'katakana', category: 'yoon' },
  // Sokuon
  { ja: 'ッ', romaji: 'tsu (sokuon)', type: 'katakana', category: 'sokuon' },
];

export const VOCABULARY: Vocabulary[] = [
  { word: 'わたし', reading: 'watashi', meaning: 'Saya', category: 'Orang', explanation: 'Kata ganti orang pertama paling umum. Pria sering menggunakan "Boku" (kasual) atau "Ore" (sangat kasual), tapi "Watashi" aman untuk semua.', formula: 'Subjek + は (wa) + [Nama/Profesi] + です' },
  { word: 'たべる', reading: 'taberu', meaning: 'Makan', category: 'Kata Kerja', explanation: 'Kata kerja golongan 2 (Ichidan). Sering digunakan untuk mengajak makan.', formula: 'Bentuk Masu: たべます (Tabemasu)' },
  { word: 'のむ', reading: 'nomu', meaning: 'Minum', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Digunakan juga untuk meminum obat.', formula: 'Bentuk Masu: のみます (Nomimasu)' },
  { word: 'がくせい', reading: 'gakusei', meaning: 'Mahasiswa / Pelajar', category: 'Pekerjaan', explanation: 'Secara harfiah berarti "orang yang belajar".', formula: 'Sekolah + の (no) + がくせい' },
  { word: 'せんせい', reading: 'sensei', meaning: 'Guru / Master', category: 'Pekerjaan', explanation: 'Gelar kehormatan untuk guru, dokter, politisi, atau orang yang ahli di bidangnya.', formula: '[Nama] + せんせい' },
  { word: 'がっこう', reading: 'gakkou', meaning: 'Sekolah', category: 'Tempat', explanation: 'Tempat untuk belajar secara formal.', formula: '[Nama Tempat] + がっこう' },
  { word: 'いく', reading: 'iku', meaning: 'Pergi', category: 'Kata Kerja', explanation: 'Kata kerja perpindahan paling umum.', formula: '[Tempat] + へ/に + いきます' },
  { word: 'くる', reading: 'kuru', meaning: 'Datang', category: 'Kata Kerja', explanation: 'Kata kerja golongan 3 (Irregular).', formula: 'Bentuk Masu: きます (Kimasu)' },
  // === Angka ===
  { word: 'いち', reading: 'ichi', meaning: 'Satu (1)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang. Digunakan dalam berbagai konteks seperti nomor telepon, alamat, dan harga.' },
  { word: 'に', reading: 'ni', meaning: 'Dua (2)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang.' },
  { word: 'さん', reading: 'san', meaning: 'Tiga (3)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang.' },
  { word: 'よん', reading: 'yon', meaning: 'Empat (4)', category: 'Angka', explanation: 'Bentuk umum untuk angka 4. "Shi" juga digunakan tapi kurang umum karena mirip kata "kematian".' },
  { word: 'ご', reading: 'go', meaning: 'Lima (5)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang.' },
  { word: 'ろく', reading: 'roku', meaning: 'Enam (6)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang.' },
  { word: 'なな', reading: 'nana', meaning: 'Tujuh (7)', category: 'Angka', explanation: 'Bentuk umum untuk angka 7. "Shichi" juga digunakan dalam beberapa konteks.' },
  { word: 'はち', reading: 'hachi', meaning: 'Delapan (8)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang.' },
  { word: 'きゅう', reading: 'kyuu', meaning: 'Sembilan (9)', category: 'Angka', explanation: 'Bentuk umum untuk angka 9. "Ku" juga digunakan dalam beberapa konteks.' },
  { word: 'じゅう', reading: 'juu', meaning: 'Sepuluh (10)', category: 'Angka', explanation: 'Angka dasar bahasa Jepang. Dasar untuk angka 11-19 (じゅういち, じゅうに, dll).' },
  { word: 'ひゃく', reading: 'hyaku', meaning: 'Seratus (100)', category: 'Angka', explanation: 'Bentuk khusus: 300=さんびゃく, 600=ろっぴゃく, 800=はっぴゃく.' },
  { word: 'せん', reading: 'sen', meaning: 'Seribu (1.000)', category: 'Angka', explanation: 'Angka dasar untuk ribuan.' },
  // === Hitungan (Counters) ===
  { word: 'ひとつ', reading: 'hitotsu', meaning: 'Satu buah', category: 'Hitungan', explanation: 'Cara menghitung umum untuk benda-benda. Hanya sampai とお (sepuluh).', formula: 'ひとつ, ふたつ, みっつ, よっつ, いつつ, むっつ, ななつ, やっつ, ここのつ, とお' },
  { word: 'ふたつ', reading: 'futatsu', meaning: 'Dua buah', category: 'Hitungan', explanation: 'Bentuk hitungan umum untuk benda.' },
  { word: 'なん', reading: 'nan', meaning: 'Berapa', category: 'Hitungan', explanation: 'Pertanyaan untuk meminta angka. Contoh: なんじ (jam berapa), なんにん (berapa orang).', formula: 'なん + [classifier] → なんばん (nomor berapa), なんさい (umur berapa)' },
  // === Waktu ===
  { word: 'いま', reading: 'ima', meaning: 'Sekarang', category: 'Waktu', explanation: 'Digunakan untuk menyatakan waktu saat ini. Contoh: いまなんじですか (Jam berapa sekarang?)' },
  { word: 'きょう', reading: 'kyou', meaning: 'Hari ini', category: 'Waktu', explanation: 'Digunakan untuk menyatakan hari ini. Akhiran ょう dibaca "you".' },
  { word: 'きのう', reading: 'kinou', meaning: 'Kemarin', category: 'Waktu', explanation: 'Digunakan untuk menyatakan hari sebelumnya.' },
  { word: 'あした', reading: 'ashita', meaning: 'Besok', category: 'Waktu', explanation: 'Digunakan untuk menyatakan hari berikutnya. Juga bisa ditulis 明日.' },
  { word: 'あさ', reading: 'asa', meaning: 'Pagi', category: 'Waktu', explanation: 'Waktu pagi hari. Dalam bahasa Jepang, ada 4 waktu utama: 朝 (pagi), 昼 (siang), 夕方 (sore), 夜 (malam).' },
  { word: 'ひる', reading: 'hiru', meaning: 'Siang', category: 'Waktu', explanation: 'Waktu siang hari, sekitar pukul 12.00.' },
  { word: 'よる', reading: 'yoru', meaning: 'Malam', category: 'Waktu', explanation: 'Waktu malam hari.' },
  { word: 'らいしゅう', reading: 'raishuu', meaning: 'Minggu depan', category: 'Waktu', explanation: 'Kombinasi 来 (datang/mendatang) + 週 (minggu). Sama pola dengan らいげつ (bulan depan), らいねん (tahun depan).' },
  // === Kata Kerja Tambahan ===
  { word: 'みる', reading: 'miru', meaning: 'Melihat / Menonton', category: 'Kata Kerja', explanation: 'Kata kerja golongan 2 (Ichidan). Juga berarti "mencoba" jika diikuti ~てみる.', formula: 'Bentuk Masu: みます (Mimasu)' },
  { word: 'かく', reading: 'kaku', meaning: 'Menulis', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Digunakan untuk menulis huruf, kalimat, atau gambar.', formula: 'Bentuk Masu: かきます (Kakimasu)' },
  { word: 'よむ', reading: 'yomu', meaning: 'Membaca', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan).', formula: 'Bentuk Masu: よみます (Yomimasu)' },
  { word: 'きく', reading: 'kiku', meaning: 'Mendengarkan / Bertanya', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Memiliki dua arti: mendengarkan (音楽をきく) dan bertanya (先生にきく).', formula: 'Bentuk Masu: ききます (Kikimasu)' },
  { word: 'はなす', reading: 'hanasu', meaning: 'Berbicara', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Memiliki dua arti: berbicara (日本語をはなす) dan memisahkan (友達とはなす).', formula: 'Bentuk Masu: はなします (Hanashimasu)' },
  { word: 'かう', reading: 'kau', meaning: 'Membeli', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Digunakan dalam situasi belanja.', formula: 'Bentuk Masu: かいます (Kaimasu)' },
  { word: 'つかう', reading: 'tsukau', meaning: 'Menggunakan', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan).', formula: 'Bentuk Masu: つかいます (Tsukaimasu)' },
  { word: 'のる', reading: 'noru', meaning: 'Naik (kendaraan)', category: 'Kata Kerja', explanation: 'Kata kerja golongan 1 (Godan). Digunakan dengan partikel に untuk menaiki kendaraan.', formula: 'Bentuk Masu: のります (Norimasu)' },
  { word: 'おきる', reading: 'okiru', meaning: 'Bangun tidur', category: 'Kata Kerja', explanation: 'Kata kerja golongan 2 (Ichidan). Frasa umum: 7じにおきる (bangun jam 7).', formula: 'Bentuk Masu: おきます (Okimasu)' },
  // === Kata Sifat (I-Adj & Na-Adj) ===
  { word: 'おおきい', reading: 'ookii', meaning: 'Besar', category: 'Kata Sifat', explanation: 'Kata sifat-i (I-adjective). Berakhiran い. Negatif: おおきくない. Masa lalu: おおきかった.', formula: 'おおきい → おおきくない → おおきかった' },
  { word: 'ちいさい', reading: 'chiisai', meaning: 'Kecil', category: 'Kata Sifat', explanation: 'Kata sifat-i (I-adjective).', formula: 'ちいさい → ちいさくない → ちいさかった' },
  { word: 'たかい', reading: 'takai', meaning: 'Mahal / Tinggi', category: 'Kata Sifat', explanation: 'Kata sifat-i (I-adjective). Dua arti: harga mahal dan fisik tinggi.', formula: 'たかい → たかくない → たかかった' },
  { word: 'やすい', reading: 'yasui', meaning: 'Murah', category: 'Kata Sifat', explanation: 'Kata sifat-i (I-adjective). Lawan kata dari たかい (mahal).', formula: 'やすい → やすくない → やすかった' },
  { word: 'あつい', reading: 'atsui', meaning: 'Panas (udara/suhu)', category: 'Kata Sifat', explanation: 'Kata sifat-i. Untuk benda panas (sentuhan) gunakan あつい juga, tapi dalam konteks berbeda.', formula: 'あつい → あつくない → あつかった' },
  { word: 'さむい', reading: 'samui', meaning: 'Dingin (cuaca)', category: 'Kata Sifat', explanation: 'Kata sifat-i. Digunakan khusus untuk cuaca dingin.', formula: 'さむい → さむくない → さむかった' },
  { word: 'いそがしい', reading: 'isogashii', meaning: 'Sibuk', category: 'Kata Sifat', explanation: 'Kata sifat-i. Untuk mengatakan tidak sibuk: ひま (hima).', formula: 'いそがしい → いそがしくない → いそがしかった' },
  { word: 'げんき', reading: 'genki', meaning: 'Sehat / Bersemangat', category: 'Kata Sifat', explanation: 'Kata sifat-na (Na-adjective). Salam umum: お元気ですか (Apa kabar?).', formula: 'げんきなひと → げんきじゃない → げんきだった' },
  // === Tempat ===
  { word: 'いえ', reading: 'ie', meaning: 'Rumah', category: 'Tempat', explanation: 'Rumah tinggal. Juga dibaca "uchi" dalam percakapan sehari-hari (うち).' },
  { word: 'へや', reading: 'heya', meaning: 'Kamar', category: 'Tempat', explanation: 'Ruangan dalam rumah. Contoh: 台所 (dapur), お風呂 (kamar mandi), トイレ (toilet).' },
  { word: 'としょかん', reading: 'toshokan', meaning: 'Perpustakaan', category: 'Tempat', explanation: 'Tempat membaca dan meminjam buku. Gabungan 図書 (buku) + 館 (gedung).' },
  { word: 'えき', reading: 'eki', meaning: 'Stasiun (kereta)', category: 'Tempat', explanation: 'Stasiun kereta api. Contoh: 東京駅 (Stasiun Tokyo).' },
  { word: 'レストラン', reading: 'resutoran', meaning: 'Restoran', category: 'Tempat', explanation: 'Kata serapan dari bahasa Inggris. Ditulis dalam katakana.' },
  // === Barang Sehari-hari ===
  { word: 'でんわ', reading: 'denwa', meaning: 'Telepon', category: 'Barang', explanation: 'Telepon. Gabungan 電 (listrik) + 話 (bicara). Smartphone = スマホ (sumaho).' },
  { word: 'くるま', reading: 'kuruma', meaning: 'Mobil', category: 'Barang', explanation: 'Mobil/Kendaraan roda empat. Umum ditulis dalam hiragana atau kanji 車.' },
  { word: 'てがみ', reading: 'tegami', meaning: 'Surat', category: 'Barang', explanation: 'Surat (bukan email). Gabungan 手 (tangan) + 紙 (kertas). Email = メール (meeru).' },
  { word: 'ほん', reading: 'hon', meaning: 'Buku', category: 'Barang', explanation: 'Buku. Contoh: 雑誌 (majalah), 新聞 (koran), 辞書 (kamus).' },
  { word: 'かさ', reading: 'kasa', meaning: 'Payung', category: 'Barang', explanation: 'Payung untuk hujan atau matahari. Umum ditulis hiragana.' },
  // === Keluarga (Family) ===
  { word: 'ちち', reading: 'chichi', meaning: 'Ayah (saya)', category: 'Keluarga', explanation: 'Cara menyebut ayah sendiri. Untuk ayah orang lain gunakan "おとうさん".', formula: 'ちち (milik sendiri) vs おとうさん (orang lain)' },
  { word: 'はは', reading: 'haha', meaning: 'Ibu (saya)', category: 'Keluarga', explanation: 'Cara menyebut ibu sendiri. Untuk ibu orang lain gunakan "おかあさん".', formula: 'はは (milik sendiri) vs おかあさん (orang lain)' },
  { word: 'あに', reading: 'ani', meaning: 'Kakak laki-laki (saya)', category: 'Keluarga', explanation: 'Kakak laki-laki sendiri. Untuk kakak laki-laki orang lain gunakan "おにいさん" (Oniisan).', formula: 'あに (sendiri) vs おにいさん (orang lain)' },
  { word: 'あね', reading: 'ane', meaning: 'Kakak perempuan (saya)', category: 'Keluarga', explanation: 'Kakak perempuan sendiri. Untuk kakak perempuan orang lain gunakan "おねえさん" (Oneesan).', formula: 'あね (sendiri) vs おねえさん (orang lain)' },
  { word: 'おとうさん', reading: 'otousan', meaning: 'Ayah (formal)', category: 'Keluarga', explanation: 'Cara sopan menyebut ayah orang lain atau ayah dalam situasi formal.', formula: 'お + とう + さん (honorifik)' },
  { word: 'おかあさん', reading: 'okaasan', meaning: 'Ibu (formal)', category: 'Keluarga', explanation: 'Cara sopan menyebut ibu orang lain atau ibu dalam situasi formal.', formula: 'お + かあ + さん (honorifik)' },
  { word: 'いもうと', reading: 'imouto', meaning: 'Adik perempuan', category: 'Keluarga', explanation: 'Adik perempuan. Versi sopan: "いもうとさん" (imoutosan).' },
  { word: 'おとうと', reading: 'otouto', meaning: 'Adik laki-laki', category: 'Keluarga', explanation: 'Adik laki-laki. Versi sopan: "おとうとさん" (otoutosan).' },
  { word: 'かぞく', reading: 'kazoku', meaning: 'Keluarga', category: 'Keluarga', explanation: 'Keluarga secara umum. Gabungan 家 (rumah/keluarga) + 族 (kelompok).' },
  { word: 'むすめ', reading: 'musume', meaning: 'Anak perempuan', category: 'Keluarga', explanation: 'Anak perempuan. Versi sopan: "おじょうさん" (ojousan).' },
  { word: 'むすこ', reading: 'musuko', meaning: 'Anak laki-laki', category: 'Keluarga', explanation: 'Anak laki-laki. Versi sopan: "ぼっちゃん" (botchan) untuk anak kecil.' },
  // === Makanan & Minuman (Food & Drink) ===
  { word: 'みず', reading: 'mizu', meaning: 'Air', category: 'Makanan & Minuman', explanation: 'Air mineral/air putih. Umum ditulis hiragana atau kanji 水.' },
  { word: 'おちゃ', reading: 'ocha', meaning: 'Teh', category: 'Makanan & Minuman', explanation: 'Teh hijau. Gabungan お (hormat) + 茶 (teh). Ocha adalah minuman sehari-hari.' },
  { word: 'ぎゅうにゅう', reading: 'gyuunyuu', meaning: 'Susu', category: 'Makanan & Minuman', explanation: 'Susu. Gabungan 牛 (sapi) + 乳 (susu).' },
  { word: 'パン', reading: 'pan', meaning: 'Roti', category: 'Makanan & Minuman', explanation: 'Roti. Kata serapan dari bahasa Portugis "pão".' },
  { word: 'たまご', reading: 'tamago', meaning: 'Telur', category: 'Makanan & Minuman', explanation: 'Telur ayam. Gabungan 卵/玉 (bola/telur).' },
  { word: 'にく', reading: 'niku', meaning: 'Daging', category: 'Makanan & Minuman', explanation: 'Daging secara umum. Untuk daging sapi: びふ (bifu), daging babi: ぶたにく (butaniku).' },
  { word: 'やさい', reading: 'yasai', meaning: 'Sayur', category: 'Makanan & Minuman', explanation: 'Sayuran secara umum. Gabungan 野 (ladang) + 菜 (sayur).' },
  { word: 'くだもの', reading: 'kudamono', meaning: 'Buah', category: 'Makanan & Minuman', explanation: 'Buah-buahan secara umum. Gabungan 果 (buah) + 物 (benda).' },
  { word: 'ケーキ', reading: 'keeki', meaning: 'Kue', category: 'Makanan & Minuman', explanation: 'Kue (cake). Kata serapan dari bahasa Inggris, ditulis dalam katakana.' },
  { word: 'ビール', reading: 'biiru', meaning: 'Bir', category: 'Makanan & Minuman', explanation: 'Bir. Kata serapan dari bahasa Belanda/Jerman "bier". Hanya untuk dewasa (20+).' },
  { word: 'さかな', reading: 'sakana', meaning: 'Ikan', category: 'Makanan & Minuman', explanation: 'Ikan (sebagai makanan). Untuk ikan hidup gunakan うお (uo) atau 魚.' },
  { word: 'ごはん', reading: 'gohan', meaning: 'Nasi', category: 'Makanan & Minuman', explanation: 'Nasi putih. Juga berarti "makanan" secara umum. Gabungan ご (hormat) + 飯 (nasi).' },
  // === Tubuh (Body) ===
  { word: 'あたま', reading: 'atama', meaning: 'Kepala', category: 'Tubuh', explanation: 'Kepala. Juga berarti "otak" atau "pikiran". Contoh: あたまがいい (pintar).' },
  { word: 'め', reading: 'me', meaning: 'Mata', category: 'Tubuh', explanation: 'Mata. Kanji: 目. Jamak tetap "め". Contoh: めがおおきい (mata besar).' },
  { word: 'みみ', reading: 'mimi', meaning: 'Telinga', category: 'Tubuh', explanation: 'Telinga. Kanji: 耳. Contoh: みみがきこえない (tidak bisa mendengar).' },
  { word: 'くち', reading: 'kuchi', meaning: 'Mulut', category: 'Tubuh', explanation: 'Mulut. Kanji: 口. Juga digunakan sebagai penghitung orang (ににんくち = dua orang).' },
  { word: 'て', reading: 'te', meaning: 'Tangan', category: 'Tubuh', explanation: 'Tangan/lengan. Kanji: 手. Contoh: てをあらう (cuci tangan).' },
  { word: 'あし', reading: 'ashi', meaning: 'Kaki', category: 'Tubuh', explanation: 'Kaki/tungkai. Kanji: 足. Juga berarti "langkah" dalam berjalan.' },
  { word: 'は', reading: 'ha', meaning: 'Gigi', category: 'Tubuh', explanation: 'Gigi. Kanji: 歯. Dibaca "ha" bukan "wa" meskipun hurufnya sama. Contoh: はをみがく (sikat gigi).' },
  { word: 'はな', reading: 'hana', meaning: 'Hidung', category: 'Tubuh', explanation: 'Hidung. Kanji: 鼻. Sering tertukar dengan はな (bunga) karena dibaca sama.' },
  { word: 'おなか', reading: 'onaka', meaning: 'Perut', category: 'Tubuh', explanation: 'Perut. Kata sopan. Frasa umum: おなかがすいた (lapar), おなかがいっぱい (kenyang).' },
  // === Alam (Nature) ===
  { word: 'そら', reading: 'sora', meaning: 'Langit', category: 'Alam', explanation: 'Langit. Umum ditulis hiragana. Contoh: そらがきれい (langit cerah).' },
  { word: 'うみ', reading: 'umi', meaning: 'Laut', category: 'Alam', explanation: 'Laut/lautan. Kanji: 海. Contoh: うみでおよぐ (berenang di laut).' },
  { word: 'やま', reading: 'yama', meaning: 'Gunung', category: 'Alam', explanation: 'Gunung. Kanji: 山. Contoh: やまにのぼる (mendaki gunung).' },
  { word: 'かわ', reading: 'kawa', meaning: 'Sungai', category: 'Alam', explanation: 'Sungai. Kanji: 川. Contoh: かわでさかなをつる (memancing di sungai).' },
  { word: 'き', reading: 'ki', meaning: 'Pohon', category: 'Alam', explanation: 'Pohon. Kanji: 木. Juga berarti "kayu" sebagai bahan.' },
  { word: 'はな', reading: 'hana', meaning: 'Bunga', category: 'Alam', explanation: 'Bunga. Kanji: 花. Sering tertukar dengan はな (hidung) karena dibaca sama.' },
  { word: 'つき', reading: 'tsuki', meaning: 'Bulan', category: 'Alam', explanation: 'Bulan (satelit). Kanji: 月. Juga berarti "bulan (waktu)" dalam konteks tertentu.' },
  { word: 'ほし', reading: 'hoshi', meaning: 'Bintang', category: 'Alam', explanation: 'Bintang. Kanji: 星. Contoh: ほしがきれい (bintang cantik).' },
  { word: 'あめ', reading: 'ame', meaning: 'Hujan', category: 'Alam', explanation: 'Hujan. Kanji: 雨. Contoh: あめがふっている (sedang hujan). Jangan tertukar dengan あめ (permen).' },
  { word: 'かぜ', reading: 'kaze', meaning: 'Angin', category: 'Alam', explanation: 'Angin. Kanji: 風. Contoh: かぜがつよい (angin kencang). Jangan tertukar dengan かぜ (pilek).' },
  // === Kata Keterangan (Adverbs) ===
  { word: 'とても', reading: 'totemo', meaning: 'Sangat', category: 'Kata Keterangan', explanation: 'Kata keterangan tingkat. Digunakan dengan kata sifat. Contoh: とてもたかい (sangat mahal).' },
  { word: 'すこし', reading: 'sukoshi', meaning: 'Sedikit', category: 'Kata Keterangan', explanation: 'Sedikit, agak. Versi santai: ちょっと. Contoh: すこしつかれた (sedikit lelah).' },
  { word: 'たくさん', reading: 'takusan', meaning: 'Banyak', category: 'Kata Keterangan', explanation: 'Banyak. Digunakan dengan kata benda yang bisa dihitung. Contoh: たくさんある (ada banyak).' },
  { word: 'いつも', reading: 'itsumo', meaning: 'Selalu', category: 'Kata Keterangan', explanation: 'Selalu, setiap saat. Contoh: いつもがっこうにいく (selalu pergi ke sekolah).' },
  { word: 'ときどき', reading: 'tokidoki', meaning: 'Kadang-kadang', category: 'Kata Keterangan', explanation: 'Sekali-kali, kadang-kadang. Kanji: 時々. Contoh: ときどきえいがをみる (kadang nonton film).' },
  { word: 'まだ', reading: 'mada', meaning: 'Belum', category: 'Kata Keterangan', explanation: 'Belum (untuk kalimat negatif) atau "masih" (untuk kalimat afirmatif). Contoh: まだいない (belum ada).' },
  { word: 'もう', reading: 'mou', meaning: 'Sudah', category: 'Kata Keterangan', explanation: 'Sudah. Contoh: もうたべた (sudah makan). Juga berarti "lagi" (もういちど = sekali lagi).' },
  { word: 'よく', reading: 'yoku', meaning: 'Sering', category: 'Kata Keterangan', explanation: 'Sering, rajin. Juga berarti "baik" dalam konteks tertentu. Contoh: よくべんきょうする (rajin belajar).' },
  { word: 'ぜんぜん', reading: 'zenzen', meaning: 'Sama sekali tidak', category: 'Kata Keterangan', explanation: 'Selalu diikuti kalimat negatif di N5. Contoh: ぜんぜんわからない (sama sekali tidak mengerti).' },
  { word: 'ちょっと', reading: 'chotto', meaning: 'Sedikit / Sebentar', category: 'Kata Keterangan', explanation: 'Versi kasual dari すこし. Bisa berarti "sedikit" atau "sebentar". Contoh: ちょっとまって (tunggu sebentar).' },
  // === Kata Kerja Lokasi (Location Words) ===
  { word: 'うえ', reading: 'ue', meaning: 'Atas', category: 'Lokasi', explanation: 'Atas, di atas. Digunakan dengan partikel の atau に. Kanji: 上.' },
  { word: 'した', reading: 'shita', meaning: 'Bawah', category: 'Lokasi', explanation: 'Bawah, di bawah. Kanji: 下. Contoh: つくえのした (di bawah meja).' },
  { word: 'なか', reading: 'naka', meaning: 'Di dalam', category: 'Lokasi', explanation: 'Di dalam, tengah. Kanji: 中. Contoh: へやのなか (di dalam kamar).' },
  { word: 'そと', reading: 'soto', meaning: 'Luar', category: 'Lokasi', explanation: 'Luar, di luar. Kanji: 外. Contoh: そとであそぶ (bermain di luar).' },
  { word: 'まえ', reading: 'mae', meaning: 'Depan', category: 'Lokasi', explanation: 'Depan, di depan. Kanji: 前. Juga berarti "sebelum" (waktu).' },
  { word: 'うしろ', reading: 'ushiro', meaning: 'Belakang', category: 'Lokasi', explanation: 'Belakang, di belakang. Kanji: 後ろ. Contoh: いえのうしろ (di belakang rumah).' },
  { word: 'となり', reading: 'tonari', meaning: 'Sebelah', category: 'Lokasi', explanation: 'Di sebelah (berdampingan). Kanji: 隣. Contoh: となりのひと (orang sebelah).' },
  { word: 'ちかく', reading: 'chikaku', meaning: 'Dekat', category: 'Lokasi', explanation: 'Dekat. Kanji: 近く. Digunakan dengan partikel に. Contoh: えきのちかく (dekat stasiun).' },
  { word: 'とおく', reading: 'tooku', meaning: 'Jauh', category: 'Lokasi', explanation: 'Jauh. Kanji: 遠く. Contoh: とおくにある (ada di tempat jauh).' },
  // === Ungkapan Sehari-hari (Daily Expressions) ===
  { word: 'おはよう', reading: 'ohayou', meaning: 'Selamat pagi', category: 'Ungkapan', explanation: 'Sapaan pagi (informal). Versi formal: おはようございます. Digunakan sekitar jam 5-11 pagi.' },
  { word: 'こんばんは', reading: 'konbanwa', meaning: 'Selamat malam', category: 'Ungkapan', explanation: 'Sapaan malam hari. Digunakan saat bertemu di malam hari (sekitar jam 6 sore ke atas).' },
  { word: 'さようなら', reading: 'sayounara', meaning: 'Selamat tinggal', category: 'Ungkapan', explanation: 'Perpisahan. Umum digunakan saat berpisah untuk waktu lama. Untuk singkat: じゃあね (jaane).' },
  { word: 'すみません', reading: 'sumimasen', meaning: 'Permisi / Maaf', category: 'Ungkapan', explanation: 'Multi-fungsi: meminta perhatian ("permisi"), meminta maaf, atau mengucapkan terima kasih. Sangat sering digunakan.' },
  { word: 'ありがとうございます', reading: 'arigatou gozaimasu', meaning: 'Terima kasih (formal)', category: 'Ungkapan', explanation: 'Ucapan terima kasih formal. Versi kasual: ありがとう. Sangat formal: ありがとうございました.' },
  { word: 'どういたしまして', reading: 'dou itashimashite', meaning: 'Sama-sama', category: 'Ungkapan', explanation: 'Balasan terima kasih formal. Versi kasual: いいえ (iie) atau どういたしまして. Di N5 level, gunakan bentuk formal ini.' },
  { word: 'いただきます', reading: 'itadakimasu', meaning: 'Mohon saya makan', category: 'Ungkapan', explanation: 'Dikatakan SEBELUM makan. Menghargai makanan dan orang yang menyiapkannya.' },
  { word: 'ごちそうさまでした', reading: 'gochisousama deshita', meaning: 'Terima kasih atas makanannya', category: 'Ungkapan', explanation: 'Dikatakan SESUDAH makan. Versi singkat: ごちそうさま. Menghargai hidangan yang disajikan.' },
  { word: 'しつれいします', reading: 'shitsurei shimasu', meaning: 'Permisi (masuk/keluar)', category: 'Ungkapan', explanation: 'Dikatakan saat masuk/keluar kantor, kelas, atau rumah orang lain. Gabungan 失礼 (tidak sopan) + します (melakukan).' },
  { word: 'おやすみなさい', reading: 'oyasuminasai', meaning: 'Selamat tidur', category: 'Ungkapan', explanation: 'Dikatakan sebelum tidur. Versi kasual: おやすみ (oyasumi).' },
];

export const KANJI: Kanji[] = [
  { character: '一', strokes: 1, meaning: 'Satu', onyomi: 'イチ (ichi)', kunyomi: 'ひと-つ (hito-tsu)', examples: [{ word: '一人', reading: 'hitori', meaning: 'Satu orang' }, { word: '一日', reading: 'tsuitachi', meaning: 'Tanggal satu' }, { word: '一番', reading: 'ichiban', meaning: 'Nomor satu / Paling' }, { word: '一月', reading: 'ichigatsu', meaning: 'Januari' }, { word: '一つ', reading: 'hitotsu', meaning: 'Satu buah' }] },
  { character: '二', strokes: 2, meaning: 'Dua', onyomi: 'ニ (ni)', kunyomi: 'ふた-つ (futa-tsu)', examples: [{ word: '二日', reading: 'futsuka', meaning: 'Tanggal dua' }, { word: '二人', reading: 'futari', meaning: 'Dua orang' }, { word: '二年生', reading: 'ninensei', meaning: 'Siswa kelas 2' }, { word: '二月', reading: 'nigatsu', meaning: 'Februari' }, { word: '二つ', reading: 'futatsu', meaning: 'Dua buah' }] },
  { character: '三', strokes: 3, meaning: 'Tiga', onyomi: 'サン (san)', kunyomi: 'みっ-つ (mittsu)', examples: [{ word: '三日', reading: 'mikka', meaning: 'Tanggal tiga' }, { word: '三月', reading: 'sangatsu', meaning: 'Maret' }, { word: '三歳', reading: 'sansai', meaning: 'Tiga tahun (umur)' }, { word: '三人', reading: 'sannin', meaning: 'Tiga orang' }, { word: '三つ', reading: 'mittsu', meaning: 'Tiga buah' }] },
  { character: '日', strokes: 4, meaning: 'Hari / Matahari', onyomi: 'ニチ (nichi), ジツ (jitsu)', kunyomi: 'ひ (hi), か (ka)', examples: [{ word: '日本', reading: 'nihon', meaning: 'Jepang' }, { word: '日曜日', reading: 'nichiyoubi', meaning: 'Hari Minggu' }, { word: '毎日', reading: 'mainichi', meaning: 'Setiap hari' }, { word: '日記', reading: 'nikki', meaning: 'Buku harian' }, { word: '日光', reading: 'nikkou', meaning: 'Sinar matahari' }] },
  { character: '月', strokes: 4, meaning: 'Bulan', onyomi: 'ゲツ (getsu), ガツ (gatsu)', kunyomi: 'つき (tsuki)', examples: [{ word: '一月', reading: 'ichigatsu', meaning: 'Januari' }, { word: '月曜日', reading: 'getsuyoubi', meaning: 'Hari Senin' }, { word: '今月', reading: 'kongetsu', meaning: 'Bulan ini' }, { word: '来月', reading: 'raigetsu', meaning: 'Bulan depan' }, { word: '三日月', reading: 'mikazuki', meaning: 'Bulan sabit' }] },
  { character: '火', strokes: 4, meaning: 'Api', onyomi: 'カ (ka)', kunyomi: 'ひ (hi)', examples: [{ word: '火曜日', reading: 'kayoubi', meaning: 'Hari Selasa' }, { word: '火山', reading: 'kazan', meaning: 'Gunung berapi' }, { word: '火花', reading: 'hibana', meaning: 'Percikan api' }, { word: '火事', reading: 'kaji', meaning: 'Kebakaran' }, { word: '消火器', reading: 'shoukaki', meaning: 'Alat pemadam api' }] },
  { character: '水', strokes: 4, meaning: 'Air', onyomi: 'スイ (sui)', kunyomi: 'みず (mizu)', examples: [{ word: '水曜日', reading: 'suiyoubi', meaning: 'Hari Rabu' }, { word: '水道', reading: 'suidou', meaning: 'Saluran air' }, { word: '水泳', reading: 'suiei', meaning: 'Berenang' }, { word: '水着', reading: 'mizugi', meaning: 'Baju renang' }, { word: '水滴', reading: 'suiteki', meaning: 'Tetesan air' }] },
  { character: '木', strokes: 4, meaning: 'Pohon', onyomi: 'モク (moku)', kunyomi: 'き (ki)', examples: [{ word: '木曜日', reading: 'mokuyoubi', meaning: 'Hari Kamis' }, { word: '大木', reading: 'taiboku', meaning: 'Pohon besar' }, { word: '木刀', reading: 'bokutou', meaning: 'Pedang kayu' }, { word: '木材', reading: 'mokuzai', meaning: 'Kayu/Material' }, { word: '木陰', reading: 'kokage', meaning: 'Bayangan pohon' }] },
  { character: '金', strokes: 8, meaning: 'Emas / Uang', onyomi: 'キン (kin)', kunyomi: 'かね (kane)', examples: [{ word: '金曜日', reading: 'kinyoubi', meaning: 'Hari Jumat' }, { word: 'お金', reading: 'okane', meaning: 'Uang' }, { word: '金持ち', reading: 'kanemochi', meaning: 'Orang kaya' }, { word: '貯金', reading: 'chokin', meaning: 'Tabungan' }, { word: '金物', reading: 'kanamono', meaning: 'Perangkat keras' }] },
  { character: '土', strokes: 3, meaning: 'Tanah', onyomi: 'ド (do)', kunyomi: 'つち (tsuchi)', examples: [{ word: '土曜日', reading: 'doyoubi', meaning: 'Hari Sabtu' }, { word: '土地', reading: 'tochi', meaning: 'Lahan' }, { word: '土木', reading: 'doboku', meaning: 'Teknik sipil' }, { word: 'お土産', reading: 'omiyage', meaning: 'Oleh-oleh' }, { word: '粘土', reading: 'nendo', meaning: 'Tanah liat' }] },
  { character: '本', strokes: 5, meaning: 'Buku / Asal', onyomi: 'ホン (hon)', kunyomi: 'もと (moto)', examples: [{ word: '日本', reading: 'nihon', meaning: 'Jepang' }, { word: '山本', reading: 'yamamoto', meaning: 'Yamamoto (Nama orang)' }, { word: '本屋', reading: 'hon-ya', meaning: 'Toko buku' }, { word: '基本', reading: 'kihon', meaning: 'Dasar' }, { word: '本名', reading: 'honmyou', meaning: 'Nama asli' }] },
  { character: '人', strokes: 2, meaning: 'Orang', onyomi: 'ジン, ニン', kunyomi: 'ひと', examples: [{ word: '日本人', reading: 'nihonjin', meaning: 'Orang Jepang' }, { word: '三人', reading: 'sannin', meaning: 'Tiga orang' }, { word: '大人', reading: 'otona', meaning: 'Orang dewasa' }, { word: '主人', reading: 'shujin', meaning: 'Suami' }, { word: '人気', reading: 'ninki', meaning: 'Populer' }] },
  { character: '山', strokes: 3, meaning: 'Gunung', onyomi: 'サン', kunyomi: 'やま', examples: [{ word: '富士山', reading: 'fujisan', meaning: 'Gunung Fuji' }, { word: '山道', reading: 'yamamichi', meaning: 'Jalan gunung' }, { word: '火山', reading: 'kazan', meaning: 'Gunung berapi' }, { word: '登山', reading: 'tozan', meaning: 'Mendaki gunung' }, { word: '山林', reading: 'sanrin', meaning: 'Hutan gunung' }] },
  { character: '川', strokes: 3, meaning: 'Sungai', onyomi: 'セン', kunyomi: 'かわ', examples: [{ word: '小川', reading: 'ogawa', meaning: 'Sungai kecil' }, { word: '四川', reading: 'shisen', meaning: 'Sichuan' }, { word: '川辺', reading: 'kawabe', meaning: 'Tepi sungai' }, { word: '河川', reading: 'kasen', meaning: 'Sungai-sungai' }, { word: '天の川', reading: 'amanogawa', meaning: 'Bima Sakti' }] },
  { character: '国', strokes: 8, meaning: 'Negara', onyomi: 'コク', kunyomi: 'くに', examples: [{ word: '外国', reading: 'gaikoku', meaning: 'Luar negeri' }, { word: '中国', reading: 'chuugoku', meaning: 'Cina' }, { word: '韓国', reading: 'kankoku', meaning: 'Korea' }, { word: '国歌', reading: 'kokka', meaning: 'Lagu kebangsaan' }, { word: '国内', reading: 'kokunai', meaning: 'Dalam negeri' }] },
  { character: '見', strokes: 7, meaning: 'Melihat', onyomi: 'ケン', kunyomi: 'み.る', examples: [{ word: '見物', reading: 'kenbutsu', meaning: 'Tamasya' }, { word: '花見', reading: 'hanami', meaning: 'Melihat bunga' }, { word: '見せる', reading: 'miseru', meaning: 'Memperlihatkan' }, { word: '見学', reading: 'kengaku', meaning: 'Kunjungan belajar' }, { word: '意見', reading: 'iken', meaning: 'Pendapat' }] },
  { character: '行', strokes: 6, meaning: 'Pergi', onyomi: 'コウ, ギョウ', kunyomi: 'い.く', examples: [{ word: '銀行', reading: 'ginkou', meaning: 'Bank' }, { word: '旅行', reading: 'ryokou', meaning: 'Piknik/Travel' }, { word: '行く', reading: 'iku', meaning: 'Pergi' }, { word: '飛行機', reading: 'hikouki', meaning: 'Pesawat terbang' }, { word: '急行', reading: 'kyuukou', meaning: 'Kereta ekspres' }] },
  { character: '時', strokes: 10, meaning: 'Waktu / Jam', onyomi: 'ジ', kunyomi: 'とき', examples: [{ word: '一時', reading: 'ichiji', meaning: 'Jam satu' }, { word: '時計', reading: 'tokei', meaning: 'Jam dinding/tangan' }, { word: '時間', reading: 'jikan', meaning: 'Waktu' }, { word: '時々', reading: 'tokidoki', meaning: 'Kadang-kadang' }, { word: '時代', reading: 'jidai', meaning: 'Zaman' }] },
  { character: '年', strokes: 6, meaning: 'Tahun', onyomi: 'ネン', kunyomi: 'とし', examples: [{ word: '今年', reading: 'kotoshi', meaning: 'Tahun ini' }, { word: '来年', reading: 'rainen', meaning: 'Tahun depan' }, { word: '去年', reading: 'kyonen', meaning: 'Tahun lalu' }, { word: '年末', reading: 'nenmatsu', meaning: 'Akhir tahun' }, { word: '年上', reading: 'toshiue', meaning: 'Lebih tua' }] },
  { character: '話', strokes: 13, meaning: 'Berbicara', onyomi: 'ワ', kunyomi: 'はな.す, はなし', examples: [{ word: '話す', reading: 'hanasu', meaning: 'Berbicara' }, { word: '電話', reading: 'denwa', meaning: 'Telepon' }, { word: '会話', reading: 'kaiwa', meaning: 'Percakapan' }, { word: 'お話', reading: 'ohanashi', meaning: 'Cerita/Dongeng' }, { word: '世話', reading: 'sewa', meaning: 'Bantuan/Asuhan' }] },
  { character: '大', strokes: 3, meaning: 'Besar', onyomi: 'ダイ, タイ', kunyomi: 'おお.きい', examples: [{ word: '大きい', reading: 'ookii', meaning: 'Besar' }, { word: '大学', reading: 'daigaku', meaning: 'Universitas' }, { word: '大切', reading: 'taisetsu', meaning: 'Penting/Berharga' }, { word: '大好き', reading: 'daisuki', meaning: 'Sangat suka' }, { word: '大人', reading: 'otona', meaning: 'Orang dewasa' }] },
  { character: '小', strokes: 3, meaning: 'Kecil', onyomi: 'ショウ', kunyomi: 'ちい.さい, こ-, お-', examples: [{ word: '小さい', reading: 'chiisai', meaning: 'Kecil' }, { word: '小学校', reading: 'shougakkou', meaning: 'Sekolah dasar' }, { word: '小説', reading: 'shousetsu', meaning: 'Novel/Cerita pendek' }, { word: '小川', reading: 'ogawa', meaning: 'Sungai kecil' }, { word: '小屋', reading: 'koya', meaning: 'Gubuk kecil' }] },
  { character: '上', strokes: 3, meaning: 'Atas / Di atas', onyomi: 'ジョウ', kunyomi: 'うえ, あ.がる, のぼ.る', examples: [{ word: '上', reading: 'ue', meaning: 'Atas' }, { word: '上手', reading: 'jouzu', meaning: 'Pandai/Terampil' }, { word: '上がる', reading: 'agaru', meaning: 'Naik' }, { word: '東京', reading: 'toukyou', meaning: 'Tokyo' }, { word: '上着', reading: 'uwagi', meaning: 'Jaket/Baju luar' }] },
  { character: '下', strokes: 3, meaning: 'Bawah / Di bawah', onyomi: 'カ, ゲ', kunyomi: 'した, さ.がる, お.りる', examples: [{ word: '下', reading: 'shita', meaning: 'Bawah' }, { word: '下手', reading: 'heta', meaning: 'Tidak pandai' }, { word: '下がる', reading: 'sagaru', meaning: 'Turun' }, { word: '地下', reading: 'chika', meaning: 'Bawah tanah' }, { word: '下半身', reading: 'kahanshin', meaning: 'Bagian bawah tubuh' }] },
  { character: '中', strokes: 4, meaning: 'Tengah / Di dalam', onyomi: 'チュウ', kunyomi: 'なか', examples: [{ word: '中', reading: 'naka', meaning: 'Tengah/Di dalam' }, { word: '中国', reading: 'chuugoku', meaning: 'Cina' }, { word: '学校中', reading: 'gakkounaka', meaning: 'Di seluruh sekolah' }, { word: '中学校', reading: 'chuugakkou', meaning: 'Sekolah menengah' }, { word: '途中', reading: 'tochu', meaning: 'Di tengah jalan' }] },
  { character: '前', strokes: 9, meaning: 'Depan / Sebelum', onyomi: 'ゼン', kunyomi: 'まえ', examples: [{ word: '前', reading: 'mae', meaning: 'Depan' }, { word: '名前', reading: 'namae', meaning: 'Nama' }, { word: '午前', reading: 'gozen', meaning: 'Pagi (AM)' }, { word: '前に', reading: 'mae ni', meaning: 'Sebelum/Lebih dulu' }, { word: '先生', reading: 'sensei', meaning: 'Guru/Dokter' }] },
  { character: '後', strokes: 9, meaning: 'Belakang / Sesudah', onyomi: 'ゴ, コウ', kunyomi: 'あと, うし.ろ', examples: [{ word: '後', reading: 'ato', meaning: 'Setelah/Nanti' }, { word: '後ろ', reading: 'ushiro', meaning: 'Belakang' }, { word: '午後', reading: 'gogo', meaning: 'Siang/Sore (PM)' }, { word: '最後', reading: 'saigo', meaning: 'Terakhir' }, { word: '後で', reading: 'ato de', meaning: 'Nanti/Kemudian' }] },
  { character: '女', strokes: 3, meaning: 'Wanita / Perempuan', onyomi: 'ジョ, ニョ', kunyomi: 'おんな, め', examples: [{ word: '女', reading: 'onna', meaning: 'Wanita' }, { word: '女の人', reading: 'onna no hito', meaning: 'Wanita/Perempuan' }, { word: '女の子', reading: 'onna no ko', meaning: 'Gadis/Anak perempuan' }, { word: '女性', reading: 'josei', meaning: 'Perempuan (formal)' }, { word: '長女', reading: 'choujo', meaning: 'Anak perempuan tertua' }] },
  { character: '男', strokes: 7, meaning: 'Pria / Laki-laki', onyomi: 'ダン, ナン', kunyomi: 'おとこ', examples: [{ word: '男', reading: 'otoko', meaning: 'Pria' }, { word: '男の人', reading: 'otoko no hito', meaning: 'Pria/Laki-laki' }, { word: '男の子', reading: 'otoko no ko', meaning: 'Anak laki-laki' }, { word: '男性', reading: 'dansei', meaning: 'Laki-laki (formal)' }, { word: '長男', reading: 'chounan', meaning: 'Anak laki-laki tertua' }] },
  { character: '学', strokes: 8, meaning: 'Belajar', onyomi: 'ガク', kunyomi: 'まな.ぶ', examples: [{ word: '学生', reading: 'gakusei', meaning: 'Mahasiswa' }, { word: '学校', reading: 'gakkou', meaning: 'Sekolah' }, { word: '大学', reading: 'daigaku', meaning: 'Universitas' }, { word: '学ぶ', reading: 'manabu', meaning: 'Belajar' }, { word: '科学', reading: 'kagaku', meaning: 'Sains/Ilmu' }] },
  { character: '語', strokes: 14, meaning: 'Bahasa / Kata', onyomi: 'ゴ', kunyomi: 'かた.る', examples: [{ word: '日本語', reading: 'nihongo', meaning: 'Bahasa Jepang' }, { word: '英語', reading: 'eigo', meaning: 'Bahasa Inggris' }, { word: '語る', reading: 'katarru', meaning: 'Menceritakan' }, { word: '物語', reading: 'monogatari', meaning: 'Cerita/Kisah' }, { word: '単語', reading: 'tango', meaning: 'Kosakata' }] },
  // === New Kanji - Nature/Weather ===
  { character: '天', strokes: 4, meaning: 'Langit / Surga', onyomi: 'テン', kunyomi: 'あまつ, そら', examples: [{ word: '天気', reading: 'tenki', meaning: 'Cuaca' }, { word: '天国', reading: 'tengoku', meaning: 'Surga' }, { word: '天神', reading: 'tenjin', meaning: 'Dewa/Surga' }, { word: '天の川', reading: 'amanogawa', meaning: 'Bima Sakti' }, { word: '天然', reading: 'tennen', meaning: 'Alami' }] },
  { character: '雨', strokes: 8, meaning: 'Hujan', onyomi: 'ウ', kunyomi: 'あめ, あま-', examples: [{ word: '雨', reading: 'ame', meaning: 'Hujan' }, { word: '大雨', reading: 'ooame', meaning: 'Hujan deras' }, { word: '雨天', reading: 'uten', meaning: 'Hari hujan' }, { word: '雨傘', reading: 'amagasa', meaning: 'Payung hujan' }, { word: '梅雨', reading: 'tsuyu', meaning: 'Musim hujan' }] },
  { character: '花', strokes: 7, meaning: 'Bunga', onyomi: 'カ', kunyomi: 'はな', examples: [{ word: '花', reading: 'hana', meaning: 'Bunga' }, { word: '花見', reading: 'hanami', meaning: 'Melihat bunga sakura' }, { word: '花火', reading: 'hanabi', meaning: 'Kembang api' }, { word: '花屋', reading: 'hanaya', meaning: 'Toko bunga' }, { word: '白花', reading: 'shirahana', meaning: 'Bunga putih' }] },
  // === New Kanji - Body Parts ===
  { character: '口', strokes: 3, meaning: 'Mulut', onyomi: 'コウ, ク', kunyomi: 'くち', examples: [{ word: '口', reading: 'kuchi', meaning: 'Mulut' }, { word: '人口', reading: 'jinkou', meaning: 'Jumlah penduduk' }, { word: '出口', reading: 'deguchi', meaning: 'Pintu keluar' }, { word: '入口', reading: 'iriguchi', meaning: 'Pintu masuk' }, { word: '河口', reading: 'kawaguchi', meaning: 'Muara sungai' }] },
  { character: '目', strokes: 5, meaning: 'Mata', onyomi: 'モク', kunyomi: 'め, ま-', examples: [{ word: '目', reading: 'me', meaning: 'Mata' }, { word: '目覚まし', reading: 'mezamashi', meaning: 'Alarm bangun' }, { word: '目標', reading: 'mokuhyou', meaning: 'Target/Sasaran' }, { word: '注目', reading: 'chuumoku', meaning: 'Perhatian' }, { word: '目的地', reading: 'mokutekichi', meaning: 'Tujuan' }] },
  { character: '耳', strokes: 6, meaning: 'Telinga', onyomi: 'ジ', kunyomi: 'みみ', examples: [{ word: '耳', reading: 'mimi', meaning: 'Telinga' }, { word: '耳鼻科', reading: 'jibika', meaning: 'Dokter THT' }, { word: '右耳', reading: 'mimimi', meaning: 'Telinga kanan' }, { word: '耳鳴り', reading: 'miminari', meaning: 'Telinga berdenging' }, { word: '初耳', reading: 'hatsumimi', meaning: 'Baru pertama kali dengar' }] },
  { character: '手', strokes: 4, meaning: 'Tangan', onyomi: 'シュ, ズ', kunyomi: 'て', examples: [{ word: '手紙', reading: 'tegami', meaning: 'Surat' }, { word: '握手', reading: 'akushu', meaning: 'Jabat tangan' }, { word: '手洗い', reading: 'tearai', meaning: 'Cuci tangan' }, { word: '歌手', reading: 'kashu', meaning: 'Penyanyi' }, { word: '上手', reading: 'jouzu', meaning: 'Pandai' }] },
  { character: '足', strokes: 7, meaning: 'Kaki', onyomi: 'ソク', kunyomi: 'あし, た-', examples: [{ word: '足', reading: 'ashi', meaning: 'Kaki' }, { word: '足元', reading: 'ashimoto', meaning: 'Di bawah kaki' }, { word: '不足', reading: 'fusoku', meaning: 'Kekurangan' }, { word: '両足', reading: 'ryouashi', meaning: 'Kedua kaki' }, { word: '一足', reading: 'issoku', meaning: 'Satu langkah' }] },
  { character: '力', strokes: 2, meaning: 'Kekuatan / Daya', onyomi: 'リキ, リョク', kunyomi: 'ちから', examples: [{ word: '力', reading: 'chikara', meaning: 'Kekuatan' }, { word: '努力', reading: 'doryoku', meaning: 'Usaha keras' }, { word: '力士', reading: 'rikishi', meaning: 'Pesumo' }, { word: '電力', reading: 'denryoku', meaning: 'Tenaga listrik' }, { word: '有力', reading: 'yuuryoku', meaning: 'Berpengaruh' }] },
  // === New Kanji - People/Animals ===
  { character: '子', strokes: 3, meaning: 'Anak', onyomi: 'シ, ス', kunyomi: 'こ', examples: [{ word: '子供', reading: 'kodomo', meaning: 'Anak' }, { word: '女子', reading: 'joshi', meaning: 'Wanita/Gadis' }, { word: '男子', reading: 'danshi', meaning: 'Pria/Laki-laki' }, { word: '果子', reading: 'kashi', meaning: 'Kue/makanan manis' }, { word: '電子', reading: 'denshi', meaning: 'Elektron' }] },
  { character: '犬', strokes: 4, meaning: 'Anjing', onyomi: 'ケン', kunyomi: 'いぬ', examples: [{ word: '犬', reading: 'inu', meaning: 'Anjing' }, { word: '子犬', reading: 'koinu', meaning: 'Anak anjing' }, { word: '番犬', reading: 'banken', meaning: 'Anjing penjaga' }, { word: '野犬', reading: 'yaken', meaning: 'Anjing liar' }, { word: '盲導犬', reading: 'moudouken', meaning: 'Anjing pemandu' }] },
  { character: '猫', strokes: 11, meaning: 'Kucing', onyomi: 'ビョウ', kunyomi: 'ねこ', examples: [{ word: '猫', reading: 'neko', meaning: 'Kucing' }, { word: '子猫', reading: 'koneko', meaning: 'Anak kucing' }, { word: '野猫', reading: 'naneko', meaning: 'Kucing liar' }, { word: '三毛猫', reading: 'mikeneko', meaning: 'Kucing tricolor' }, { word: '招き猫', reading: 'manekineko', meaning: 'Kucing pembawa keberuntungan' }] },
  { character: '魚', strokes: 11, meaning: 'Ikan', onyomi: 'ギョ', kunyomi: 'うお, さかな', examples: [{ word: '魚', reading: 'sakana', meaning: 'Ikan' }, { word: '金魚', reading: 'kingyo', meaning: 'Ikan mas' }, { word: '熱帯魚', reading: 'nettai-gyo', meaning: 'Ikan tropis' }, { word: '魚市場', reading: 'uoichiba', meaning: 'Pasar ikan' }, { word: '魚釣り', reading: 'sakatsuri', meaning: 'Memancing' }] },
  { character: '鳥', strokes: 11, meaning: 'Burung', onyomi: 'チョウ', kunyomi: 'とり', examples: [{ word: '鳥', reading: 'tori', meaning: 'Burung' }, { word: '小鳥', reading: 'kotori', meaning: 'Burung kecil' }, { word: '白鳥', reading: 'haku-chou', meaning: 'Angsa' }, { word: '鳥肉', reading: 'toriniku', meaning: 'Daging ayam' }, { word: '渡り鳥', reading: 'watari-dori', meaning: 'Burung migrasi' }] },
  // === New Kanji - Common Objects ===
  { character: '車', strokes: 7, meaning: 'Mobil / Kendaraan', onyomi: 'シャ', kunyomi: 'くるま', examples: [{ word: '車', reading: 'kuruma', meaning: 'Mobil' }, { word: '電車', reading: 'densha', meaning: 'Kereta listrik' }, { word: '自転車', reading: 'jitensha', meaning: 'Sepeda' }, { word: '車庫', reading: 'shako', meaning: 'Garasi' }, { word: '乗車', reading: 'jousha', meaning: 'Naik kendaraan' }] },
  { character: '電', strokes: 13, meaning: 'Listrik', onyomi: 'デン', kunyomi: '-', examples: [{ word: '電話', reading: 'denwa', meaning: 'Telepon' }, { word: '電車', reading: 'densha', meaning: 'Kereta listrik' }, { word: '電気', reading: 'denki', meaning: 'Listrik' }, { word: '電池', reading: 'denchi', meaning: 'Baterai' }, { word: '電子', reading: 'denshi', meaning: 'Elektron' }] },
  { character: '門', strokes: 8, meaning: 'Pintu gerbang', onyomi: 'モン', kunyomi: 'かど', examples: [{ word: '門', reading: 'mon', meaning: 'Pintu gerbang' }, { word: '専門', reading: 'senmon', meaning: 'Spesialisasi' }, { word: '学門', reading: 'gakumon', meaning: 'Ilmu pengetahuan' }, { word: '門前', reading: 'monzen', meaning: 'Di depan gerbang' }, { word: '権門', reading: 'kenmon', meaning: 'Golongan berkuasa' }] },
  { character: '窓', strokes: 11, meaning: 'Jendela', onyomi: 'ソウ', kunyomi: 'まど', examples: [{ word: '窓', reading: 'mado', meaning: 'Jendela' }, { word: '窓口', reading: 'madoguchi', meaning: 'Loket' }, { word: '同窓', reading: 'dousou', meaning: 'Sekolah yang sama' }, { word: '窓辺', reading: 'madobe', meaning: 'Di dekat jendela' }, { word: '天窓', reading: 'tenmado', meaning: 'Jendela atap' }] },
  { character: '紙', strokes: 10, meaning: 'Kertas', onyomi: 'シ', kunyomi: 'かみ', examples: [{ word: '紙', reading: 'kami', meaning: 'Kertas' }, { word: '新聞', reading: 'shinbun', meaning: 'Koran' }, { word: '手紙', reading: 'tegami', meaning: 'Surat' }, { word: '画用紙', reading: 'gayoushi', meaning: 'Kertas gambar' }, { word: '折り紙', reading: 'origami', meaning: 'Seni melipat kertas' }] },
  // === New Kanji - Adjectives/Kanji ===
  { character: '多', strokes: 6, meaning: 'Banyak', onyomi: 'タ', kunyomi: 'おお.い', examples: [{ word: '多い', reading: 'ooi', meaning: 'Banyak' }, { word: '多分', reading: 'tabun', meaning: 'Mungkin' }, { word: '多数', reading: 'tasuu', meaning: 'Mayoritas' }, { word: '多国籍', reading: 'takokuseki', meaning: 'Multi-nasional' }, { word: '多年', reading: 'tanen', meaning: 'Bertahun-tahun' }] },
  { character: '少', strokes: 4, meaning: 'Sedikit', onyomi: 'ショウ', kunyomi: 'すく.ない, すこ.し', examples: [{ word: '少ない', reading: 'sukunai', meaning: 'Sedikit' }, { word: '少し', reading: 'sukoshi', meaning: 'Sedikit' }, { word: '少女', reading: 'shoujo', meaning: 'Gadis' }, { word: '少年', reading: 'shounen', meaning: 'Anak laki-laki' }, { word: '少数', reading: 'shousuu', meaning: 'Minoritas' }] },
  { character: '長', strokes: 8, meaning: 'Panjang', onyomi: 'チョウ', kunyomi: 'なが.い', examples: [{ word: '長い', reading: 'nagai', meaning: 'Panjang' }, { word: '長男', reading: 'chounan', meaning: 'Anak laki-laki tertua' }, { word: '長女', reading: 'choujo', meaning: 'Anak perempuan tertua' }, { word: '校長', reading: 'kouchou', meaning: 'Kepala sekolah' }, { word: '長所', reading: 'chousho', meaning: 'Kelebihan' }] },
  { character: '短', strokes: 12, meaning: 'Pendek', onyomi: 'タン', kunyomi: 'みじか.い', examples: [{ word: '短い', reading: 'mijikai', meaning: 'Pendek' }, { word: '短大', reading: 'tandai', meaning: 'Akademi (2 tahun)' }, { word: '短所', reading: 'tansho', meaning: 'Kekurangan' }, { word: '短気', reading: 'tanki', meaning: 'Cepat marah' }, { word: '短文', reading: 'tanbun', meaning: 'Kalimat pendek' }] },
  { character: '安', strokes: 6, meaning: 'Murah / Aman', onyomi: 'アン', kunyomi: 'やす.い', examples: [{ word: '安い', reading: 'yasui', meaning: 'Murah' }, { word: '安全', reading: 'anzen', meaning: 'Keamanan/Aman' }, { word: '不安', reading: 'fuan', meaning: 'Cemas/Tidak tenang' }, { word: '安物', reading: 'yasumono', meaning: 'Barang murahan' }, { word: '安売り', reading: 'yasuuri', meaning: 'Obral/Diskon' }] },
  { character: '新', strokes: 13, meaning: 'Baru', onyomi: 'シン', kunyomi: 'あたら.しい', examples: [{ word: '新しい', reading: 'atarashii', meaning: 'Baru' }, { word: '新聞', reading: 'shinbun', meaning: 'Koran' }, { word: '新人', reading: 'shinjin', meaning: 'Orang baru' }, { word: '新幹線', reading: 'shinkansen', meaning: 'Kereta cepat Shinkansen' }, { word: '新学期', reading: 'shingakki', meaning: 'Semester baru' }] },
  { character: '古', strokes: 5, meaning: 'Lama / Tua', onyomi: 'コ', kunyomi: 'ふる.い', examples: [{ word: '古い', reading: 'furui', meaning: 'Lama' }, { word: '古代', reading: 'kodai', meaning: 'Zaman kuno' }, { word: '古本', reading: 'furuhon', meaning: 'Buku bekas' }, { word: '中古', reading: 'chuuko', meaning: 'Bekas (second hand)' }, { word: '古人', reading: 'kojin', meaning: 'Orang zaman dahulu' }] },
  { character: '白', strokes: 5, meaning: 'Putih', onyomi: 'ハク', kunyomi: 'しろ, しろ.い', examples: [{ word: '白い', reading: 'shiroi', meaning: 'Putih' }, { word: '白鳥', reading: 'haku-chou', meaning: 'Angsa' }, { word: '白紙', reading: 'hakushi', meaning: 'Kertas kosong' }, { word: '白黒', reading: 'shirokuro', meaning: 'Hitam putih' }, { word: '白色', reading: 'hakushoku', meaning: 'Warna putih' }] },
  { character: '黒', strokes: 11, meaning: 'Hitam', onyomi: 'コク', kunyomi: 'くろ, くろ.い', examples: [{ word: '黒い', reading: 'kuroi', meaning: 'Hitam' }, { word: '黒板', reading: 'kokuban', meaning: 'Papan tulis' }, { word: '白黒', reading: 'shirokuro', meaning: 'Hitam putih' }, { word: '黒猫', reading: 'kuro-neko', meaning: 'Kucing hitam' }, { word: '黒字', reading: 'kuroji', meaning: 'Untung/Saldo plus' }] },
  { character: '赤', strokes: 7, meaning: 'Merah', onyomi: 'セキ', kunyomi: 'あか, あか.い', examples: [{ word: '赤い', reading: 'akai', meaning: 'Merah' }, { word: '赤ちゃん', reading: 'akachan', meaning: 'Bayi' }, { word: '赤色', reading: 'akairo', meaning: 'Warna merah' }, { word: '赤字', reading: 'akaji', meaning: 'Rugi/Saldo minus' }, { word: '赤道', reading: 'sekidou', meaning: 'Garis khatulistiwa' }] },
  { character: '青', strokes: 8, meaning: 'Biru', onyomi: 'セイ', kunyomi: 'あお, あお.い', examples: [{ word: '青い', reading: 'aoi', meaning: 'Biru' }, { word: '青空', reading: 'aozora', meaning: 'Langit biru' }, { word: '青森', reading: 'aomori', meaning: 'Aomori (nama kota)' }, { word: '青年', reading: 'seinen', meaning: 'Pemuda' }, { word: '青花', reading: 'seika', meaning: 'Biru/Nilam' }] },
  // === New Kanji - Numbers/Money ===
  { character: '百', strokes: 6, meaning: 'Seratus', onyomi: 'ヒャク', kunyomi: '-', examples: [{ word: '百', reading: 'hyaku', meaning: 'Seratus' }, { word: '百万', reading: 'hyaku-man', meaning: 'Satu juta' }, { word: '百科', reading: 'hyakka', meaning: 'Ensiklopedia' }, { word: '百円', reading: 'hyaku-en', meaning: 'Seratus yen' }, { word: '百人', reading: 'hyaku-nin', meaning: 'Seratus orang' }] },
  { character: '千', strokes: 3, meaning: 'Seribu', onyomi: 'セン', kunyomi: 'ち', examples: [{ word: '千', reading: 'sen', meaning: 'Seribu' }, { word: '千円', reading: 'sen-en', meaning: 'Seribu yen' }, { word: '千代', reading: 'chiyo', meaning: 'Seribu generasi' }, { word: '千枚', reading: 'senmai', meaning: 'Seribu lembar' }, { word: '千人', reading: 'sennin', meaning: 'Seribu orang' }] },
  { character: '万', strokes: 3, meaning: 'Sepuluh ribu', onyomi: 'マン', kunyomi: '-', examples: [{ word: '一万', reading: 'ichi-man', meaning: 'Sepuluh ribu' }, { word: '万年筆', reading: 'mannen-hitsu', meaning: 'Pulpen' }, { word: '万国', reading: 'bankoku', meaning: 'Seluruh dunia' }, { word: '万歳', reading: 'banzai', meaning: 'Hidup!' }, { word: '万一', reading: 'man-ichi', meaning: 'Kalau-kalau' }] },
  { character: '円', strokes: 4, meaning: 'Yen / Lingkaran', onyomi: 'エン', kunyomi: 'まる.い', examples: [{ word: '百円', reading: 'hyaku-en', meaning: 'Seratus yen' }, { word: '日本円', reading: 'nihon-en', meaning: 'Yen Jepang' }, { word: '円形', reading: 'enkei', meaning: 'Bentuk lingkaran' }, { word: '千円', reading: 'sen-en', meaning: 'Seribu yen' }, { word: '半円', reading: 'han-en', meaning: 'Setengah yen' }] },
  // === New Kanji - Direction/Position ===
  { character: '右', strokes: 5, meaning: 'Kanan', onyomi: 'ウ, ユウ', kunyomi: 'みぎ', examples: [{ word: '右', reading: 'migi', meaning: 'Kanan' }, { word: '右側', reading: 'migigawa', meaning: 'Sisi kanan' }, { word: '右折', reading: 'usetsu', meaning: 'Belok kanan' }, { word: '右手', reading: 'migite', meaning: 'Tangan kanan' }, { word: '右足', reading: 'migiashi', meaning: 'Kaki kanan' }] },
  { character: '左', strokes: 5, meaning: 'Kiri', onyomi: 'サ', kunyomi: 'ひだり', examples: [{ word: '左', reading: 'hidari', meaning: 'Kiri' }, { word: '左側', reading: 'hidarigawa', meaning: 'Sisi kiri' }, { word: '左折', reading: 'sasetsu', meaning: 'Belok kiri' }, { word: '左手', reading: 'hidarite', meaning: 'Tangan kiri' }, { word: '左利き', reading: 'hidarikiki', meaning: 'Kidal' }] },
  // === New Kanji - Others ===
  { character: '友', strokes: 4, meaning: 'Teman', onyomi: 'ユウ', kunyomi: 'とも', examples: [{ word: '友達', reading: 'tomodachi', meaning: 'Teman' }, { word: '親友', reading: 'shinyuu', meaning: 'Sahabat' }, { word: '友人', reading: 'yuujin', meaning: 'Teman (formal)' }, { word: '友情', reading: 'yuujou', meaning: 'Persahabatan' }, { word: '友', reading: 'tomo', meaning: 'Teman' }] },
  { character: '気', strokes: 6, meaning: 'Semangat / Hati', onyomi: 'キ, ケ', kunyomi: '-', examples: [{ word: '元気', reading: 'genki', meaning: 'Sehat/Bersemangat' }, { word: '天気', reading: 'tenki', meaning: 'Cuaca' }, { word: '気持ち', reading: 'kimochi', meaning: 'Perasaan' }, { word: '気持ちいい', reading: 'kimochii-i', meaning: 'Nyaman' }, { word: '人気', reading: 'ninki', meaning: 'Populer' }] },
  { character: '食', strokes: 9, meaning: 'Makan', onyomi: 'ショク, ジキ', kunyomi: 'た.べる', examples: [{ word: '食事', reading: 'shokuji', meaning: 'Makan (waktu makan)' }, { word: '食べる', reading: 'taberu', meaning: 'Makan' }, { word: '食器', reading: 'shokki', meaning: 'Piring/Peralatan makan' }, { word: '和食', reading: 'washoku', meaning: 'Makanan Jepang' }, { word: '食堂', reading: 'shokudou', meaning: 'Kantin' }] },
];

export const GRAMMAR: GrammarPoint[] = [
  { title: 'Partikel は (Wa)', structure: '[Subjek] は [Predikat] です。', explanation: 'Menandai topik kalimat. "Wa" ditulis dengan hiragana HA (は) tetapi dibaca WA.', examples: [{ ja: 'わたしはがくせいです。', en: 'Saya adalah mahasiswa.' }, { ja: 'たなかさんはにほんじんです。', en: 'Sdr. Tanaka orang Jepang.' }, { ja: 'これはほんです。', en: 'Ini adalah buku.' }, { ja: 'きょうはいいてんきですね。', en: 'Hari ini cuacanya bagus ya.' }] },
  { title: 'Partikel が (Ga) - Keberadaan', structure: '[Benda/Orang] が あります/います。', explanation: 'ARIMASU untuk benda mati, IMASU untuk makhluk hidup.', examples: [{ ja: 'つくえがあります。', en: 'Ada meja.' }, { ja: 'ねこがいます。', en: 'Ada kucing.' }, { ja: 'あそこにいぬがいます。', en: 'Ada anjing di sana.' }, { ja: 'へやにテレビがあります。', en: 'Ada televisi di kamar.' }] },
  { title: 'Kata Kerja Bentuk ~Tai (Ingin)', structure: 'V-Masu Stem + たいです。', explanation: 'Digunakan untuk menyatakan keinginan pembicara.', examples: [{ ja: 'すしをたべたいです。', en: 'Ingin makan sushi.' }, { ja: 'にほんへいきたいです。', en: 'Ingin pergi ke Jepang.' }, { ja: 'みずをのみたいです。', en: 'Saya ingin minum air.' }, { ja: 'えいがをみたいです。', en: 'Saya ingin menonton film.' }] },
  { title: 'Partikel も (Mo)', structure: '[A] も [B] です。', explanation: 'Partikel mo berarti "juga". Digunakan ketika menyatakan sesuatu yang sama dengan sebelumnya.', examples: [{ ja: 'わたしもがくせいです。', en: 'Saya juga mahasiswa.' }, { ja: 'これもりんごです。', en: 'Ini juga apel.' }, { ja: 'あれもわたしのほんです。', en: 'Itu juga buku saya.' }, { ja: 'たなかさんもがくせいです。', en: 'Tanaka juga seorang mahasiswa.' }] },
  { title: 'Partikel の (No)', structure: '[A] の [B]', explanation: 'Partikel no digunakan untuk menyatakan kepemilikan atau modifikasi kata benda.', examples: [{ ja: 'わたしのほんです。', en: 'Ini buku saya.' }, { ja: 'にほんごのせんせい。', en: 'Guru bahasa Jepang.' }, { ja: 'これはわたしのペンです。', en: 'Ini adalah pulpen saya.' }, { ja: 'にほんのくるまはいいです。', en: 'Mobil buatan Jepang bagus.' }] },
  { title: 'Partikel を (Wo/O)', structure: '[Objek] を [Kata Kerja Transitif]', explanation: 'Menandai objek langsung dari sebuah kata kerja.', examples: [{ ja: 'ごはんをたべます。', en: 'Makan nasi.' }, { ja: 'おちゃをのみます。', en: 'Minum teh.' }, { ja: 'りんごをたべます。', en: 'Makan apel.' }, { ja: 'てがみをかきます。', en: 'Menulis surat.' }] },
  { title: 'Partikel に (Ni) - Tujuan/Waktu', structure: '[Tempat/Waktu] に [Kata Kerja]', explanation: 'Menandai tujuan pergerakan atau titik waktu yang spesifik.', examples: [{ ja: 'がっこうにいきます。', en: 'Pergi ke sekolah.' }, { ja: '７じにおきます。', en: 'Bangun pada jam 7.' }, { ja: 'じゅうじにねます。', en: 'Saya tidur jam 10.' }, { ja: 'としょかんにいます。', en: 'Saya ada di perpustakaan.' }] },
  { title: 'Partikel へ (He/E)', structure: '[Tempat] へ いきます/きます/かえります', explanation: 'Mirip dengan "Ni", tapi lebih menekankan pada arah tujuan.', examples: [{ ja: 'にほんへいきます。', en: 'Pergi ke Jepang.' }, { ja: 'うちへかえります。', en: 'Pulang ke rumah.' }, { ja: 'がっこうへいきます。', en: 'Saya pergi ke sekolah.' }, { ja: 'くにへかえります。', en: 'Saya pulang ke negara/kampung halaman.' }] },
  { title: 'Struktur ~Mashou (Ayo)', structure: 'V-Masu Stem + ましょう', explanation: 'Digunakan untuk mengajak atau menawarkan diri melakukan sesuatu.', examples: [{ ja: 'たべましょう。', en: 'Ayo makan.' }, { ja: 'いきましょう。', en: 'Ayo pergi.' }, { ja: 'ごはんをたべましょう。', en: 'Ayo makan nasi.' }, { ja: 'いっしょにいきましょう。', en: 'Ayo pergi bersama-sama.' }] },
  { title: 'Bentuk ~Te kudasai (Tolong)', structure: 'V-Te + ください', explanation: 'Digunakan untuk meminta tolong secara sopan.', examples: [{ ja: 'きいてください。', en: 'Tolong dengarkan.' }, { ja: 'まってください。', en: 'Tolong tunggu.' }, { ja: 'ドアをあけてください。', en: 'Tolong buka pintunya.' }, { ja: 'ちょっとまってください。', en: 'Tolong tunggu sebentar.' }] },
  { title: 'Kata Kerja ~Nai Form (Negasi)', structure: 'V-Nai (Bentuk negatif)', explanation: 'Bentuk negatif sederhana untuk menyatakan "tidak melakukan" sesuatu. Untuk Godan: ubah akhiran -u menjadi -anai. Untuk Ichidan: lepas -ru, tambah -nai. Untuk Irregular: する→しない, くる→こない.', examples: [{ ja: 'たべない。', en: 'Tidak makan.' }, { ja: 'いかない。', en: 'Tidak pergi.' }, { ja: 'のまない。', en: 'Tidak minum.' }, { ja: 'よまない。', en: 'Tidak membaca.' }] },
  { title: 'Kata Kerja ~Ta Form (Masa Lalu)', structure: 'V-Ta (Bentuk masa lalu)', explanation: 'Bentuk masa lalu untuk menyatakan sesuatu yang sudah dilakukan. Untuk Godan: -te form diikuti た. Untuk Ichidan: lepas -ru, tambah -ta. Untuk Irregular: した, きた.', examples: [{ ja: 'たべました。', en: 'Sudah makan.' }, { ja: 'いきました。', en: 'Sudah pergi.' }, { ja: 'よみました。', en: 'Sudah membaca.' }, { ja: 'きました。', en: 'Sudah datang.' }] },
  { title: 'Hitungan + Classifier (Penghitung)', structure: '[Angka] + [Classifier]', explanation: 'Bahasa Jepang menggunakan classifier berbeda sesuai jenis benda. 人 (nin) untuk orang, ほん (bon) untuk benda panjang tipis, まい (mai) untuk benda tipis datar, だい (dai) untuk mesin.', examples: [{ ja: 'さんにんいます。', en: 'Ada tiga orang.' }, { ja: 'にはんでんわしました。', en: 'Menelepon dua kali.' }, { ja: 'いっまいかいました。', en: 'Membeli satu lembar.' }, { ja: 'よんだいあります。', en: 'Ada empat unit.' }] },
  { title: 'Kata Sifat-i (I-Adjective) Perubahan', structure: '[Kata Sifat-i] + です / くない / かった', explanation: 'Kata sifat-i berakhiran い. Bentuk afirmatif: ~いです. Negatif: hapus い, tambah くない. Masa lalu: hapus い, tambah かった.', examples: [{ ja: 'たかいです。', en: 'Mahal.' }, { ja: 'たかくないです。', en: 'Tidak mahal.' }, { ja: 'たかかったです。', en: 'Dulu mahal.' }, { ja: 'おおきいです。', en: 'Besar.' }] },
  { title: 'Kata Sifat-na (Na-Adjective) Perubahan', structure: '[Kata Sifat-na] + です / じゃない / だった', explanation: 'Kata sifat-na TIDAK berakhiran い. Bentuk afirmatif: ~な + kata benda / ~です. Negatif: ~じゃないです. Masa lalu: ~だったです.', examples: [{ ja: 'げんきです。', en: 'Sehat/Bersemangat.' }, { ja: 'げんきじゃないです。', en: 'Tidak sehat.' }, { ja: 'げんきだったです。', en: 'Dulu sehat.' }, { ja: 'きれいなところです。', en: 'Tempat yang indah.' }] },
  { title: 'Kalimat Tanya (Pertanyaan)', structure: '[Kalimat] + か (ka)', explanation: 'Partikel か di akhir kalimat mengubah kalimat menjadi pertanyaan. Tidak menggunakan tanda tanya di bahasa formal. Pertanyaan dengan kata tanya: なに (apa), だれ (siapa), どこ (di mana), いつ (kapan), なぜ (mengapa), どう (bagaimana).', examples: [{ ja: 'これはなんですか。', en: 'Ini apa?' }, { ja: 'たなかさんはどこですか。', en: 'Tanaka ada di mana?' }, { ja: 'いついきますか。', en: 'Kapan pergi?' }, { ja: 'にほんごがわかりますか。', en: 'Paham bahasa Jepang?' }] },
  // === New Grammar Points ===
  { title: 'Partikel ～から (Kara) - Karena', structure: '[Kalimat sebab] から、[Kalimat akibat]', explanation: 'Digunakan untuk menyatakan alasan atau sebab. Kalimat sebab ditulis sebelum から, dan kalimat akibat setelahnya. Sama dengan "karena" dalam bahasa Indonesia.', examples: [{ ja: 'あついから、まどをあけます。', en: 'Karena panas, saya membuka jendela.' }, { ja: 'しごとがあるから、いきません。', en: 'Karena ada kerja, saya tidak pergi.' }, { ja: 'すきだから、よくたべます。', en: 'Karena suka, saya sering makan.' }, { ja: 'びょうきだから、がっこうをやすみました。', en: 'Karena sakit, saya tidak masuk sekolah.' }] },
  { title: 'Partikel ～けど (Kedo) - Tapi', structure: '[Kalimat A] けど、[Kalimat B]', explanation: 'Digunakan untuk menghubungkan dua kalimat yang berlawanan makna, seperti "tapi" atau "namun". Versi formal: が (ga). けど lebih santai.', examples: [{ ja: 'たかいけど、かいました。', en: 'Mahal tapi saya beli.' }, { ja: 'にほんごはむずかしいけど、おもしろいです。', en: 'Bahasa Jepang sulit tapi menarik.' }, { ja: 'あめがふっているけど、でかけます。', en: 'Hujan turun tapi saya tetap pergi.' }, { ja: 'すきだけど、あまりたべません。', en: 'Suka tapi tidak terlalu sering makan.' }] },
  { title: '～かもしれません (Kamoshiremasen) - Mungkin', structure: '[Kata Sifat-i/Nomina] + かもしれません / [Kata Sifat-na stem] + かもしれません', explanation: 'Digunakan untuk menyatakan kemungkinan atau dugaan ("mungkin"). Tingkat kemungkinan sekitar 50%. Untuk kata kerja: V-dic_form + かもしれません.', examples: [{ ja: 'あしたはあめかもしれません。', en: 'Besok mungkin hujan.' }, { ja: 'たなかさんはにほんじんかもしれません。', en: 'Tanaka mungkin orang Jepang.' }, { ja: 'このレストランはおいしいかもしれません。', en: 'Restoran ini mungkin enak.' }, { ja: 'かれはいま、いえにいるかもしれません。', en: 'Dia mungkin sekarang ada di rumah.' }] },
  { title: '～ましょうか (Mashouka) - Shall I...?', structure: 'V-Masu Stem + ましょうか', explanation: 'Digunakan untuk menawarkan bantuan atau menanyakan apakah lawan bicara ingin melakukan sesuatu bersama. Mirip ~Mashou tapi lebih menekankan tawaran.', examples: [{ ja: 'まどをあけましょうか。', en: 'Mau saya buka jendelanya?' }, { ja: 'みちをしょうかいしましょうか。', en: 'Mau saya tunjukkan jalannya?' }, { ja: 'いっしょにいきましょうか。', en: 'Mau pergi bersama?' }, { ja: 'おにもつをもちましょうか。', en: 'Mau saya bantu bawa barangnya?' }] },
  { title: '～ています (Te Imasu) - Sedang / Keadaan', structure: 'V-Te + います', explanation: 'Memiliki dua makna: (1) Menyatakan aksi yang sedang berlangsung, atau (2) Menyatakan hasil/keadaan yang berlanjut hingga sekarang.', examples: [{ ja: 'いま、べんきょうしています。', en: 'Saya sedang belajar sekarang.' }, { ja: 'あめがふっています。', en: 'Hujan sedang turun.' }, { ja: 'けっこんしています。', en: 'Saya sudah menikah.' }, { ja: 'ともだちはにほんにすんでいます。', en: 'Teman saya tinggal di Jepang.' }] },
  { title: '～たことがあります (Ta Koto ga Arimasu) - Pernah', structure: 'V-Ta Form + ことがあります', explanation: 'Digunakan untuk menyatakan pengalaman yang pernah dilakukan setidaknya satu kali. Negatif: ことがありません. Tanya: ことがありますか.', examples: [{ ja: 'にほんにいったことがあります。', en: 'Saya pernah ke Jepang.' }, { ja: 'すしをたべたことがあります。', en: 'Saya pernah makan sushi.' }, { ja: 'うみでおよいだことがありません。', en: 'Saya belum pernah berenang di laut.' }, { ja: 'ふじさんにのぼったことがありますか。', en: 'Kamu pernah mendaki Gunung Fuji?' }] },
  { title: '～なければなりません (Nakereba Narimasen) - Harus', structure: 'V-Nai (tanpa ない) + ければなりません', explanation: 'Digunakan untuk menyatakan kewajiban atau sesuatu yang "harus" dilakukan. Bentuk awal dari ~nakereba narimasen adalah ~nai, lalu ubah menjadi ~nakereba. Versi santai: ~なきゃ.', examples: [{ ja: 'しごとにいかなければなりません。', en: 'Saya harus pergi kerja.' }, { ja: 'ほんをよまなければなりません。', en: 'Saya harus membaca buku.' }, { ja: 'きょう、しけんがあるから、べんきょうしなければなりません。', en: 'Karena ada ujian hari ini, saya harus belajar.' }, { ja: 'パスポートをとらなければなりません。', en: 'Saya harus membuat paspor.' }] },
  { title: '～ことができます (Koto ga Dekimasu) - Bisa', structure: 'V-Dictionary Form + ことができます', explanation: 'Digunakan untuk menyatakan kemampuan atau kemungkinan. Negatif: ことができません. Tanya: ことができますか. Alternatif dari bentuk potensial V-(r)emasu.', examples: [{ ja: 'にほんごをはなすことができます。', en: 'Saya bisa berbicara bahasa Jepang.' }, { ja: 'うんてんすることができますか。', en: 'Apakah kamu bisa mengemudi?' }, { ja: 'このレストランでは、りょうりすることができます。', en: 'Di restoran ini, kamu bisa memasak.' }, { ja: 'すいえいすることができません。', en: 'Saya tidak bisa berenang.' }] },
  { title: '～ながら (Nagara) - Sambil', structure: 'V-Masu Stem + ながら', explanation: 'Digunakan untuk menyatakan dua aksi yang dilakukan secara bersamaan oleh orang yang sama. Aksi utama ditempatkan di akhir kalimat.', examples: [{ ja: 'おんがくをききながら、べんきょうします。', en: 'Sambil mendengarkan musik, saya belajar.' }, { ja: 'テレビをみながら、ごはんをたべます。', en: 'Sambil menonton TV, saya makan nasi.' }, { ja: 'あるきながら、でんわをします。', en: 'Sambil berjalan, saya menelepon.' }, { ja: 'おちゃをのみながら、はなしましょう。', en: 'Sambil minum teh, mari mengobrol.' }] },
  { title: '～すぎます (Sugimasu) - Terlalu', structure: 'V-Masu Stem + すぎます / Kata Sifat-i (hapus い) + すぎます', explanation: 'Digunakan untuk menyatakan sesuatu yang berlebihan. Dapat ditempelkan pada kata kerja dan kata sifat. Untuk kata sifat-na: kata_sifat + すぎます.', examples: [{ ja: 'たべすぎます。', en: 'Terlalu banyak makan.' }, { ja: 'このスープはあつすぎます。', en: 'Sup ini terlalu panas.' }, { ja: 'にくがおおすぎます。', en: 'Dagingnya terlalu banyak.' }, { ja: 'のみすぎないでください。', en: 'Jangan minum terlalu banyak.' }] },
];

// Helper: speak Japanese using Web Speech API
export function speakJapanese(text: string) {
  if (typeof window === 'undefined') return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
