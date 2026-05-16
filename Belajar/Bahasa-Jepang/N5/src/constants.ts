/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Vocabulary, Kanji, GrammarPoint } from './types';

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
  { 
    word: 'わたし', 
    reading: 'watashi', 
    meaning: 'Saya', 
    category: 'Orang',
    explanation: 'Kata ganti orang pertama paling umum. Pria sering menggunakan "Boku" (kasual) atau "Ore" (sangat kasual), tapi "Watashi" aman untuk semua.',
    formula: 'Subjek + は (wa) + [Nama/Profesi] + です'
  },
  { 
    word: 'たべる', 
    reading: 'taberu', 
    meaning: 'Makan', 
    category: 'Kata Kerja',
    explanation: 'Kata kerja golongan 2 (Ichidan). Sering digunakan untuk mengajak makan.',
    formula: 'Bentuk Masu: たべます (Tabemasu)'
  },
  { 
    word: 'のむ', 
    reading: 'nomu', 
    meaning: 'Minum', 
    category: 'Kata Kerja',
    explanation: 'Kata kerja golongan 1 (Godan). Digunakan juga untuk meminum obat.',
    formula: 'Bentuk Masu: のみます (Nomimasu)'
  },
  { 
    word: 'がくせい', 
    reading: 'gakusei', 
    meaning: 'Mahasiswa / Pelajar', 
    category: 'Pekerjaan',
    explanation: 'Secara harfiah berarti "orang yang belajar".',
    formula: 'Sekolah + の (no) + がくせい'
  },
  { 
    word: 'せんせい', 
    reading: 'sensei', 
    meaning: 'Guru / Master', 
    category: 'Pekerjaan',
    explanation: 'Gelar kehormatan untuk guru, dokter, politisi, atau orang yang ahli di bidangnya.',
    formula: '[Nama] + せんせい'
  },
  { 
    word: 'がっこう', 
    reading: 'gakkou', 
    meaning: 'Sekolah', 
    category: 'Tempat',
    explanation: 'Tempat untuk belajar secara formal.',
    formula: '[Nama Tempat] + がっこう'
  },
  { 
    word: 'いく', 
    reading: 'iku', 
    meaning: 'Pergi', 
    category: 'Kata Kerja',
    explanation: 'Kata kerja perpindahan paling umum.',
    formula: '[Tempat] + へ/に + いきます'
  },
  { 
    word: 'くる', 
    reading: 'kuru', 
    meaning: 'Datang', 
    category: 'Kata Kerja',
    explanation: 'Kata kerja golongan 3 (Irregular).',
    formula: 'Bentuk Masu: きます (Kimasu)'
  },
];

export const KANJI: Kanji[] = [
  {
    character: '一', strokes: 1,
    meaning: 'Satu',
    onyomi: 'イチ (ichi)',
    kunyomi: 'ひと-つ (hito-tsu)',
    examples: [
      { word: '一人', reading: 'hitori', meaning: 'Satu orang' },
      { word: '一日', reading: 'tsuitachi', meaning: 'Tanggal satu' },
      { word: '一番', reading: 'ichiban', meaning: 'Nomor satu / Paling' },
      { word: '一月', reading: 'ichigatsu', meaning: 'Januari' },
      { word: '一つ', reading: 'hitotsu', meaning: 'Satu buah' },
    ]
  },
  {
    character: '二', strokes: 2,
    meaning: 'Dua',
    onyomi: 'ニ (ni)',
    kunyomi: 'ふた-つ (futa-tsu)',
    examples: [
      { word: '二日', reading: 'futsuka', meaning: 'Tanggal dua' },
      { word: '二人', reading: 'futari', meaning: 'Dua orang' },
      { word: '二年生', reading: 'ninensei', meaning: 'Siswa kelas 2' },
      { word: '二月', reading: 'nigatsu', meaning: 'Februari' },
      { word: '二つ', reading: 'futatsu', meaning: 'Dua buah' },
    ]
  },
  {
    character: '三', strokes: 3,
    meaning: 'Tiga',
    onyomi: 'サン (san)',
    kunyomi: 'みっ-つ (mittsu)',
    examples: [
      { word: '三日', reading: 'mikka', meaning: 'Tanggal tiga' },
      { word: '三月', reading: 'sangatsu', meaning: 'Maret' },
      { word: '三歳', reading: 'sansai', meaning: 'Tiga tahun (umur)' },
      { word: '三人', reading: 'sannin', meaning: 'Tiga orang' },
      { word: '三つ', reading: 'mittsu', meaning: 'Tiga buah' },
    ]
  },
  {
    character: '日', strokes: 4,
    meaning: 'Hari / Matahari',
    onyomi: 'ニチ (nichi), ジツ (jitsu)',
    kunyomi: 'ひ (hi), か (ka)',
    examples: [
      { word: '日本', reading: 'nihon', meaning: 'Jepang' },
      { word: '日曜日', reading: 'nichiyoubi', meaning: 'Hari Minggu' },
      { word: '毎日', reading: 'mainichi', meaning: 'Setiap hari' },
      { word: '日記', reading: 'nikki', meaning: 'Buku harian' },
      { word: '日光', reading: 'nikkou', meaning: 'Sinar matahari' },
    ]
  },
  {
    character: '月', strokes: 4,
    meaning: 'Bulan',
    onyomi: 'ゲツ (getsu), ガツ (gatsu)',
    kunyomi: 'つき (tsuki)',
    examples: [
      { word: '一月', reading: 'ichigatsu', meaning: 'Januari' },
      { word: '月曜日', reading: 'getsuyoubi', meaning: 'Hari Senin' },
      { word: '今月', reading: 'kongetsu', meaning: 'Bulan ini' },
      { word: '来月', reading: 'raigetsu', meaning: 'Bulan depan' },
      { word: '三日月', reading: 'mikazuki', meaning: 'Bulan sabit' },
    ]
  },
  {
    character: '火', strokes: 4,
    meaning: 'Api',
    onyomi: 'カ (ka)',
    kunyomi: 'ひ (hi)',
    examples: [
      { word: '火曜日', reading: 'kayoubi', meaning: 'Hari Selasa' },
      { word: '火山', reading: 'kazan', meaning: 'Gunung berapi' },
      { word: '火花', reading: 'hibana', meaning: 'Percikan api' },
      { word: '火事', reading: 'kaji', meaning: 'Kebakaran' },
      { word: '消火器', reading: 'shoukaki', meaning: 'Alat pemadam api' },
    ]
  },
  {
    character: '水', strokes: 4,
    meaning: 'Air',
    onyomi: 'スイ (sui)',
    kunyomi: 'みず (mizu)',
    examples: [
      { word: '水曜日', reading: 'suiyoubi', meaning: 'Hari Rabu' },
      { word: '水道', reading: 'suidou', meaning: 'Saluran air' },
      { word: '水泳', reading: 'suiei', meaning: 'Berenang' },
      { word: '水着', reading: 'mizugi', meaning: 'Baju renang' },
      { word: '水滴', reading: 'suiteki', meaning: 'Tetesan air' },
    ]
  },
  {
    character: '木', strokes: 4,
    meaning: 'Pohon',
    onyomi: 'モク (moku)',
    kunyomi: 'き (ki)',
    examples: [
      { word: '木曜日', reading: 'mokuyoubi', meaning: 'Hari Kamis' },
      { word: '大木', reading: 'taiboku', meaning: 'Pohon besar' },
      { word: '木刀', reading: 'bokutou', meaning: 'Pedang kayu' },
      { word: '木材', reading: 'mokuzai', meaning: 'Kayu/Material' },
      { word: '木陰', reading: 'kokage', meaning: 'Bayangan pohon' },
    ]
  },
  {
    character: '金', strokes: 8,
    meaning: 'Emas / Uang',
    onyomi: 'キン (kin)',
    kunyomi: 'かね (kane)',
    examples: [
      { word: '金曜日', reading: 'kinyoubi', meaning: 'Hari Jumat' },
      { word: 'お金', reading: 'okane', meaning: 'Uang' },
      { word: '金持ち', reading: 'kanemochi', meaning: 'Orang kaya' },
      { word: '貯金', reading: 'chokin', meaning: 'Tabungan' },
      { word: '金物', reading: 'kanamono', meaning: 'Perangkat keras' },
    ]
  },
  {
    character: '土', strokes: 3,
    meaning: 'Tanah',
    onyomi: 'ド (do)',
    kunyomi: 'つち (tsuchi)',
    examples: [
      { word: '土曜日', reading: 'doyoubi', meaning: 'Hari Sabtu' },
      { word: '土地', reading: 'tochi', meaning: 'Lahan' },
      { word: '土木', reading: 'doboku', meaning: 'Teknik sipil' },
      { word: 'お土産', reading: 'omiyage', meaning: 'Oleh-oleh' },
      { word: '粘土', reading: 'nendo', meaning: 'Tanah liat' },
    ]
  },
  {
    character: '本', strokes: 5,
    meaning: 'Buku / Asal',
    onyomi: 'ホン (hon)',
    kunyomi: 'もと (moto)',
    examples: [
      { word: '日本', reading: 'nihon', meaning: 'Jepang' },
      { word: '山本', reading: 'yamamoto', meaning: 'Yamamoto (Nama orang)' },
      { word: '本屋', reading: 'hon-ya', meaning: 'Toko buku' },
      { word: '基本', reading: 'kihon', meaning: 'Dasar' },
      { word: '本名', reading: 'honmyou', meaning: 'Nama asli' },
    ]
  },
  {
    character: '人', strokes: 2,
    meaning: 'Orang',
    onyomi: 'ジン, ニン',
    kunyomi: 'ひと',
    examples: [
      { word: '日本人', reading: 'nihonjin', meaning: 'Orang Jepang' },
      { word: '三人', reading: 'sannin', meaning: 'Tiga orang' },
      { word: '大人', reading: 'otona', meaning: 'Orang dewasa' },
      { word: '主人', reading: 'shujin', meaning: 'Suami' },
      { word: '人気', reading: 'ninki', meaning: 'Populer' },
    ]
  },
  {
    character: '中', strokes: 4,
    meaning: 'Tengah / Dalam',
    onyomi: 'チュウ',
    kunyomi: 'なか',
    examples: [
      { word: '田中', reading: 'tanaka', meaning: 'Tanaka (nama orang)' },
      { word: '一日中', reading: 'ichinichijuu', meaning: 'Sepanjang hari' },
      { word: '学校の中', reading: 'gakkou no naka', meaning: 'Di dalam sekolah' },
      { word: '中心', reading: 'chuushin', meaning: 'Pusat' },
      { word: '中華', reading: 'chuuka', meaning: 'Masakan Cina' },
    ]
  },
  {
    character: '国', strokes: 8,
    meaning: 'Negara',
    onyomi: 'コク',
    kunyomi: 'くに',
    examples: [
      { word: '外国', reading: 'gaikoku', meaning: 'Luar negeri' },
      { word: '中国', reading: 'chuugoku', meaning: 'Cina' },
      { word: '韓国', reading: 'kankoku', meaning: 'Korea' },
      { word: '国歌', reading: 'kokka', meaning: 'Lagu kebangsaan' },
      { word: '国内', reading: 'kokunai', meaning: 'Dalam negeri' },
    ]
  },
  {
    character: '見', strokes: 7,
    meaning: 'Melihat',
    onyomi: 'ケン',
    kunyomi: 'み.る',
    examples: [
      { word: '見物', reading: 'kenbutsu', meaning: 'Tamasya' },
      { word: '花見', reading: 'hanami', meaning: 'Melihat bunga' },
      { word: '見せる', reading: 'miseru', meaning: 'Memperlihatkan' },
      { word: '見学', reading: 'kengaku', meaning: 'Kunjungan belajar' },
      { word: '意見', reading: 'iken', meaning: 'Pendapat' },
    ]
  },
  {
    character: '行', strokes: 6,
    meaning: 'Pergi',
    onyomi: 'コウ, ギョウ',
    kunyomi: 'い.く',
    examples: [
      { word: '銀行', reading: 'ginkou', meaning: 'Bank' },
      { word: '旅行', reading: 'ryokou', meaning: 'Piknik/Travel' },
      { word: '行く', reading: 'iku', meaning: 'Pergi' },
      { word: '飛行機', reading: 'hikouki', meaning: 'Pesawat terbang' },
      { word: '急行', reading: 'kyuukou', meaning: 'Kereta ekspres' },
    ]
  },
  {
    character: '来', strokes: 7,
    meaning: 'Datang',
    onyomi: 'ライ',
    kunyomi: 'く.る',
    examples: [
      { word: '来年', reading: 'rainen', meaning: 'Tahun depan' },
      { word: '来週', reading: 'raishuu', meaning: 'Minggu depan' },
      { word: '来る', reading: 'kuru', meaning: 'Datang' },
      { word: '将来', reading: 'shourai', meaning: 'Masa depan' },
      { word: '来月', reading: 'raigetsu', meaning: 'Bulan depan' },
    ]
  },
  {
    character: '四', strokes: 5,
    meaning: 'Empat',
    onyomi: 'シ',
    kunyomi: 'よん, よ',
    examples: [
      { word: '四日', reading: 'yokka', meaning: 'Tanggal 4' },
      { word: '四時', reading: 'yoji', meaning: 'Jam 4' },
      { word: '四人', reading: 'yonin', meaning: 'Empat orang' },
      { word: '四月', reading: 'shigatsu', meaning: 'April' },
      { word: '四季', reading: 'shiki', meaning: 'Empat musim' },
    ]
  },
  {
    character: '五', strokes: 4,
    meaning: 'Lima',
    onyomi: 'ゴ',
    kunyomi: 'いつ.つ',
    examples: [
      { word: '五日', reading: 'itsuka', meaning: 'Tanggal 5' },
      { word: '五分', reading: 'gofun', meaning: '5 menit' },
      { word: '五人', reading: 'gonin', meaning: 'Lima orang' },
      { word: '五月', reading: 'gogatsu', meaning: 'Mei' },
      { word: '五十', reading: 'gojuu', meaning: 'Lima puluh' },
    ]
  },
  {
    character: '六', strokes: 4,
    meaning: 'Enam',
    onyomi: 'ロク',
    kunyomi: 'むっ.つ',
    examples: [
      { word: '六日', reading: 'muika', meaning: 'Tanggal 6' },
      { word: '六百', reading: 'roppyaku', meaning: '600' },
      { word: '六人', reading: 'rokunin', meaning: 'Enam orang' },
      { word: '六月', reading: 'rokugatsu', meaning: 'Juni' },
      { word: '十六', reading: 'juuroku', meaning: 'Enam belas' },
    ]
  },
  {
    character: '七', strokes: 2,
    meaning: 'Tujuh',
    onyomi: 'シチ',
    kunyomi: 'なな',
    examples: [
      { word: '七日', reading: 'nanoka', meaning: 'Tanggal 7' },
      { word: '七時', reading: 'shichiji', meaning: 'Jam 7' },
      { word: '七人', reading: 'shichinin', meaning: 'Tujuh orang' },
      { word: '七月', reading: 'shichigatsu', meaning: 'Juli' },
      { word: '七百', reading: 'nanahyaku', meaning: 'Tujuh ratus' },
    ]
  },
  {
    character: '八', strokes: 2,
    meaning: 'Delapan',
    onyomi: 'ハチ',
    kunyomi: 'やっ.つ',
    examples: [
      { word: '八日', reading: 'youka', meaning: 'Tanggal 8' },
      { word: '八百', reading: 'happyaku', meaning: '800' },
      { word: '八人', reading: 'hachinin', meaning: 'Delapan orang' },
      { word: '八月', reading: 'hachigatsu', meaning: 'Agustus' },
      { word: '八百屋', reading: 'yaoya', meaning: 'Toko sayur' },
    ]
  },
  {
    character: '九', strokes: 2,
    meaning: 'Sembilan',
    onyomi: 'キュウ, ク',
    kunyomi: 'ここの.つ',
    examples: [
      { word: '九日', reading: 'kokonoka', meaning: 'Tanggal 9' },
      { word: '九時', reading: 'kuji', meaning: 'Jam 9' },
      { word: '九人', reading: 'kyuunin', meaning: 'Sembilan orang' },
      { word: '九月', reading: 'kugatsu', meaning: 'September' },
      { word: '九州', reading: 'kyuushuu', meaning: 'Kyushu' },
    ]
  },
  {
    character: '十', strokes: 2,
    meaning: 'Sepuluh',
    onyomi: 'ジュウ',
    kunyomi: 'とお',
    examples: [
      { word: '十日', reading: 'touka', meaning: 'Tanggal 10' },
      { word: '十分', reading: 'juppun', meaning: '10 menit' },
      { word: '十人', reading: 'juunin', meaning: 'Sepuluh orang' },
      { word: '十月', reading: 'juugatsu', meaning: 'Oktober' },
      { word: '二十', reading: 'nijuu', meaning: 'Dua puluh' },
    ]
  },
  {
    character: '百', strokes: 6,
    meaning: 'Seratus',
    onyomi: 'ヒャク',
    kunyomi: '-',
    examples: [
      { word: '三百', reading: 'sanbyaku', meaning: '300' },
      { word: '六百', reading: 'roppyaku', meaning: '600' },
      { word: '百科事典', reading: 'hyakkajiten', meaning: 'Ensiklopedia' },
      { word: '八百屋', reading: 'yaoya', meaning: 'Toko sayur' },
      { word: '数百', reading: 'suuhyaku', meaning: 'Ratusan' },
    ]
  },
  {
    character: '千', strokes: 3,
    meaning: 'Ribu',
    onyomi: 'セン',
    kunyomi: 'ち',
    examples: [
      { word: '三千', reading: 'sanzen', meaning: '3000' },
      { word: '千葉', reading: 'chiba', meaning: 'Chiba (Provinsi)' },
      { word: '千円', reading: 'sen-en', meaning: 'Seribu Yen' },
      { word: '数千', reading: 'suusen', meaning: 'Ribuan' },
      { word: '千代紙', reading: 'chiyogami', meaning: 'Kertas kado Jepang' },
    ]
  },
  {
    character: '万', strokes: 3,
    meaning: 'Puluh Ribu',
    onyomi: 'マン',
    kunyomi: '-',
    examples: [
      { word: '一万', reading: 'ichiman', meaning: '10.000' },
      { word: '万歳', reading: 'banzai', meaning: 'Banzai' },
      { word: '万年筆', reading: 'mannenhitsu', meaning: 'Pena' },
      { word: '百万', reading: 'hyakuman', meaning: 'Satu juta' },
      { word: '万一', reading: 'man-ichi', meaning: 'Seandainya' },
    ]
  },
  {
    character: '円', strokes: 4,
    meaning: 'Yen / Lingkaran',
    onyomi: 'エン',
    kunyomi: 'まる',
    examples: [
      { word: '百円', reading: 'hyaku-en', meaning: '100 Yen' },
      { word: '円い', reading: 'marui', meaning: 'Bulat' },
      { word: '千円', reading: 'sen-en', meaning: 'Seribu yen' },
      { word: '円満', reading: 'enman', meaning: 'Harmonis' },
      { word: '百円', reading: 'hyaku-en', meaning: 'Seratus yen' },
    ]
  },
  {
    character: '上', strokes: 3,
    meaning: 'Atas',
    onyomi: 'ジョウ',
    kunyomi: 'うえ',
    examples: [
      { word: '上手', reading: 'jouzu', meaning: 'Mahir' },
      { word: '屋上', reading: 'okujou', meaning: 'Atap gedung' },
      { word: '上がる', reading: 'agaru', meaning: 'Naik' },
      { word: '上司', reading: 'joushi', meaning: 'Atasan' },
      { word: '上着', reading: 'uwagi', meaning: 'Jaket' },
    ]
  },
  {
    character: '下', strokes: 3,
    meaning: 'Bawah',
    onyomi: 'カ, ゲ',
    kunyomi: 'した',
    examples: [
      { word: '下手', reading: 'heta', meaning: 'Tidak mahir' },
      { word: '地下鉄', reading: 'chikatetsu', meaning: 'Kereta bawah tanah' },
      { word: '下がる', reading: 'sagaru', meaning: 'Turun' },
      { word: '地下', reading: 'chika', meaning: 'Bawah tanah' },
      { word: '靴下', reading: 'kutsushita', meaning: 'Kaos kaki' },
    ]
  },
  {
    character: '左', strokes: 5,
    meaning: 'Kiri',
    onyomi: 'サ',
    kunyomi: 'ひだり',
    examples: [
      { word: '左手', reading: 'hidarite', meaning: 'Tangan kiri' },
      { word: '左右', reading: 'sayuu', meaning: 'Kiri kanan' },
      { word: '左側', reading: 'hidarigawa', meaning: 'Sisi kiri' },
      { word: '左折', reading: 'sasetsu', meaning: 'Belok kiri' },
      { word: '左利き', reading: 'hidarikiki', meaning: 'Kidal' },
    ]
  },
  {
    character: '右', strokes: 5,
    meaning: 'Kanan',
    onyomi: 'ウ, ユウ',
    kunyomi: 'みぎ',
    examples: [
      { word: '右手', reading: 'migite', meaning: 'Tangan kanan' },
      { word: '右折', reading: 'usetsu', meaning: 'Belok kanan' },
      { word: '右側', reading: 'migigawa', meaning: 'Sisi kanan' },
      { word: '右折', reading: 'usetsu', meaning: 'Belok kanan' },
      { word: '右利き', reading: 'migikiki', meaning: 'Tidak kidal' },
    ]
  },
  {
    character: '東', strokes: 8,
    meaning: 'Timur',
    onyomi: 'トウ',
    kunyomi: 'ひがし',
    examples: [
      { word: '東京', reading: 'toukyou', meaning: 'Tokyo' },
      { word: '東口', reading: 'higashiguchi', meaning: 'Pintu timur' },
      { word: '東側', reading: 'higashigawa', meaning: 'Sisi timur' },
      { word: '中東', reading: 'chuutou', meaning: 'Timur Tengah' },
      { word: '関東', reading: 'kantou', meaning: 'Kanto (Daerah)' },
    ]
  },
  {
    character: '西', strokes: 6,
    meaning: 'Barat',
    onyomi: 'セイ, サイ',
    kunyomi: 'にし',
    examples: [
      { word: '西洋', reading: 'seiyou', meaning: 'Barat (kultur)' },
      { word: '西口', reading: 'nishiguchi', meaning: 'Pintu barat' },
      { word: '西側', reading: 'nishigawa', meaning: 'Sisi barat' },
      { word: '関西', reading: 'kansai', meaning: 'Kansai (Daerah)' },
      { word: '大西洋', reading: 'taiseiyou', meaning: 'Samudra Atlantik' },
    ]
  },
  {
    character: '南', strokes: 9,
    meaning: 'Selatan',
    onyomi: 'ナン',
    kunyomi: 'みなみ',
    examples: [
      { word: '南口', reading: 'minamiguchi', meaning: 'Pintu selatan' },
      { word: '東南アジア', reading: 'tounan-ajia', meaning: 'Asia Tenggara' },
      { word: '南側', reading: 'minamigawa', meaning: 'Sisi selatan' },
      { word: '南極', reading: 'nankyoku', meaning: 'Kutub selatan' },
      { word: '東南', reading: 'tounan', meaning: 'Tenggara' },
    ]
  },
  {
    character: '北', strokes: 5,
    meaning: 'Utara',
    onyomi: 'ホク',
    kunyomi: 'きた',
    examples: [
      { word: '北口', reading: 'kitaguchi', meaning: 'Pintu utara' },
      { word: '北海道', reading: 'hokkaidou', meaning: 'Hokkaido' },
      { word: '北側', reading: 'kitagawa', meaning: 'Sisi utara' },
      { word: '東北', reading: 'touhoku', meaning: 'Tohoku (Daerah)' },
      { word: '北極', reading: 'hokkyoku', meaning: 'Kutub utara' },
    ]
  },
  {
    character: '北', strokes: 5,
    meaning: 'Utara',
    onyomi: 'ホク',
    kunyomi: 'きた',
    examples: [
      { word: '北口', reading: 'kitaguchi', meaning: 'Pintu utara' },
      { word: '北海道', reading: 'hokkaidou', meaning: 'Hokkaido' },
      { word: '北側', reading: 'kitagawa', meaning: 'Sisi utara' },
      { word: '東北', reading: 'touhoku', meaning: 'Tohoku (Daerah)' },
      { word: '北極', reading: 'hokkyoku', meaning: 'Kutub utara' },
    ]
  },
  {
    character: '山', strokes: 3,
    meaning: 'Gunung',
    onyomi: 'サン',
    kunyomi: 'やま',
    examples: [
      { word: '富士山', reading: 'fujisan', meaning: 'Gunung Fuji' },
      { word: '山道', reading: 'yamamichi', meaning: 'Jalan gunung' },
      { word: '火山', reading: 'kazan', meaning: 'Gunung berapi' },
      { word: '登山', reading: 'tozan', meaning: 'Mendaki gunung' },
      { word: '山林', reading: 'sanrin', meaning: 'Hutan gunung' },
    ]
  },
  {
    character: '川', strokes: 3,
    meaning: 'Sungai',
    onyomi: 'セン',
    kunyomi: 'かわ',
    examples: [
      { word: '小川', reading: 'ogawa', meaning: 'Sungai kecil' },
      { word: '四川', reading: 'shisen', meaning: 'Sichuan' },
      { word: '川辺', reading: 'kawabe', meaning: 'Tepi sungai' },
      { word: '河川', reading: 'kasen', meaning: 'Sungai-sungai' },
      { word: '天の川', reading: 'amanogawa', meaning: 'Bima Sakti' },
    ]
  },
  {
    character: '田', strokes: 5,
    meaning: 'Sawah',
    onyomi: 'デン',
    kunyomi: 'た',
    examples: [
      { word: '田中', reading: 'tanaka', meaning: 'Tanaka (Nama orang)' },
      { word: '成田', reading: 'narita', meaning: 'Narita (Bandara)' },
      { word: '水田', reading: 'suiden', meaning: 'Sawah berair' },
      { word: '田んぼ', reading: 'tanbo', meaning: 'Sawah' },
      { word: '山田', reading: 'yamada', meaning: 'Yamada (Nama orang)' },
    ]
  },
  {
    character: '天', strokes: 4,
    meaning: 'Langit / Surga',
    onyomi: 'テン',
    kunyomi: 'あま',
    examples: [
      { word: '天気', reading: 'tenki', meaning: 'Cuaca' },
      { word: '天才', reading: 'tensai', meaning: 'Jenius' },
      { word: '天の川', reading: 'amanogawa', meaning: 'Bima sakti' },
      { word: '天国', reading: 'tengoku', meaning: 'Surga' },
      { word: '天使', reading: 'tenshi', meaning: 'Malaikat' },
    ]
  },
  {
    character: '気', strokes: 6,
    meaning: 'Energi / Roh',
    onyomi: 'キ',
    kunyomi: '-',
    examples: [
      { word: '元気', reading: 'genki', meaning: 'Sehat' },
      { word: '気持ち', reading: 'kimochi', meaning: 'Perasaan' },
      { word: '人気', reading: 'ninki', meaning: 'Populer' },
      { word: '気分', reading: 'kibun', meaning: 'Perasaan / Mood' },
      { word: '病気', reading: 'byouki', meaning: 'Sakit' },
    ]
  },
  {
    character: '雨', strokes: 8,
    meaning: 'Hujan',
    onyomi: 'ウ',
    kunyomi: 'あめ',
    examples: [
      { word: '大雨', reading: 'ooame', meaning: 'Hujan lebat' },
      { word: '雨天', reading: 'uten', meaning: 'Cuaca hujan' },
      { word: '小雨', reading: 'kosame', meaning: 'Gerimis' },
      { word: '雨水', reading: 'amamizu', meaning: 'Air hujan' },
      { word: '梅雨', reading: 'tsuyu', meaning: 'Musim hujan' },
    ]
  },
  {
    character: '空', strokes: 8,
    meaning: 'Langit / Kosong',
    onyomi: 'クウ',
    kunyomi: 'そら, あ.く',
    examples: [
      { word: '空気', reading: 'kuuki', meaning: 'Udara' },
      { word: '空港', reading: 'kuukou', meaning: 'Bandara' },
      { word: '空手', reading: 'karate', meaning: 'Karate' },
      { word: '青空', reading: 'aozora', meaning: 'Langit biru' },
      { word: '空く', reading: 'aku', meaning: 'Menjadi kosong' },
    ]
  },
  {
    character: '男', strokes: 7,
    meaning: 'Laki-laki',
    onyomi: 'ダン, ナン',
    kunyomi: 'おとこ',
    examples: [
      { word: '男の子', reading: 'otokonoko', meaning: 'Anak laki-laki' },
      { word: '長男', reading: 'chounan', meaning: 'Putra sulung' },
      { word: '男性', reading: 'dansei', meaning: 'Pria' },
      { word: '男子', reading: 'danshi', meaning: 'Anak laki-laki' },
      { word: '男女', reading: 'danjo', meaning: 'Pria & Wanita' },
    ]
  },
  {
    character: '女', strokes: 3,
    meaning: 'Perempuan',
    onyomi: 'ジョ',
    kunyomi: 'おんな',
    examples: [
      { word: '女の子', reading: 'onnanoko', meaning: 'Anak perempuan' },
      { word: '彼女', reading: 'kanojo', meaning: 'Pacar perempuan' },
      { word: '女性', reading: 'josei', meaning: 'Wanita' },
      { word: '女子', reading: 'joshi', meaning: 'Anak perempuan' },
      { word: '長女', reading: 'choujo', meaning: 'Putri sulung' },
    ]
  },
  {
    character: '子', strokes: 3,
    meaning: 'Anak',
    onyomi: 'シ',
    kunyomi: 'こ',
    examples: [
      { word: '子供', reading: 'kodomo', meaning: 'Anak-anak' },
      { word: '様子', reading: 'yousu', meaning: 'Situasi' },
      { word: '女子', reading: 'joshi', meaning: 'Anak perempuan' },
      { word: '男子', reading: 'danshi', meaning: 'Anak laki-laki' },
      { word: '電子', reading: 'denshi', meaning: 'Elektronik' },
    ]
  },
  {
    character: '父', strokes: 4,
    meaning: 'Ayah',
    onyomi: 'フ',
    kunyomi: 'ちち',
    examples: [
      { word: 'お父さん', reading: 'otousan', meaning: 'Ayah (Hormat)' },
      { word: '父母', reading: 'fubo', meaning: 'Ayah Ibu' },
      { word: '祖父', reading: 'sofu', meaning: 'Kakek' },
      { word: '父親', reading: 'chichioya', meaning: 'Ayah' },
      { word: '義父', reading: 'gifu', meaning: 'Ayah mertua' },
    ]
  },
  {
    character: '母', strokes: 5,
    meaning: 'Ibu',
    onyomi: 'ボ',
    kunyomi: 'はは',
    examples: [
      { word: 'お母さん', reading: 'okaasan', meaning: 'Ibu (Hormat)' },
      { word: '母校', reading: 'bokou', meaning: 'Almamater' },
      { word: '祖母', reading: 'sobo', meaning: 'Nenek' },
      { word: '母親', reading: 'hahaoya', meaning: 'Ibu' },
      { word: '母語', reading: 'bogo', meaning: 'Bahasa ibu' },
    ]
  },
  {
    character: '時', strokes: 10,
    meaning: 'Waktu / Jam',
    onyomi: 'ジ',
    kunyomi: 'とき',
    examples: [
      { word: '一時', reading: 'ichiji', meaning: 'Jam satu' },
      { word: '時計', reading: 'tokei', meaning: 'Jam dinding/tangan' },
      { word: '時間', reading: 'jikan', meaning: 'Waktu' },
      { word: '時々', reading: 'tokidoki', meaning: 'Kadang-kadang' },
      { word: '時代', reading: 'jidai', meaning: 'Zaman' },
    ]
  },
  {
    character: '年', strokes: 6,
    meaning: 'Tahun',
    onyomi: 'ネン',
    kunyomi: 'とし',
    examples: [
      { word: '今年', reading: 'kotoshi', meaning: 'Tahun ini' },
      { word: '来年', reading: 'rainen', meaning: 'Tahun depan' },
      { word: '去年', reading: 'kyonen', meaning: 'Tahun lalu' },
      { word: '年末', reading: 'nenmatsu', meaning: 'Akhir tahun' },
      { word: '年上', reading: 'toshiue', meaning: 'Lebih tua' },
    ]
  },
  {
    character: '名', strokes: 6,
    meaning: 'Nama',
    onyomi: 'メイ, ミョウ',
    kunyomi: 'な',
    examples: [
      { word: '名前', reading: 'namae', meaning: 'Nama' },
      { word: '名字', reading: 'myouji', meaning: 'Nama keluarga' },
      { word: '有名', reading: 'yuumei', meaning: 'Terkenal' },
      { word: '名物', reading: 'meibutsu', meaning: 'Sesuatu yang terkenal (lokal)' },
      { word: '名刺', reading: 'meishi', meaning: 'Kartu nama' },
    ]
  },
  {
    character: '前', strokes: 9,
    meaning: 'Depan / Sebelum',
    onyomi: 'ゼン',
    kunyomi: 'まえ',
    examples: [
      { word: '名前', reading: 'namae', meaning: 'Nama' },
      { word: '三日前', reading: 'mikkamae', meaning: 'Tiga hari yang lalu' },
      { word: '午前', reading: 'gozen', meaning: 'Pagi (A.M.)' },
      { word: '前半', reading: 'zenhan', meaning: 'Babak pertama' },
      { word: '駅前', reading: 'ekimae', meaning: 'Depan stasiun' },
    ]
  },
  {
    character: '後', strokes: 9,
    meaning: 'Belakang / Setelah',
    onyomi: 'ゴ, コウ',
    kunyomi: 'うし.ろ, あと',
    examples: [
      { word: '午後', reading: 'gogo', meaning: 'P.M. / Siang' },
      { word: '最後', reading: 'saigo', meaning: 'Terakhir' },
      { word: '後ろ', reading: 'ushiro', meaning: 'Belakang' },
      { word: 'その後', reading: 'sonogo', meaning: 'Setelah itu' },
      { word: '後半', reading: 'kouhan', meaning: 'Babak kedua' },
    ]
  },
  {
    character: '長', strokes: 8,
    meaning: 'Panjang / Ketua',
    onyomi: 'チョウ',
    kunyomi: 'なが.い',
    examples: [
      { word: '社長', reading: 'shachou', meaning: 'Presiden Direktur' },
      { word: '校長', reading: 'kouchou', meaning: 'Kepala sekolah' },
      { word: '長い', reading: 'nagai', meaning: 'Panjang' },
      { word: '身長', reading: 'shinchou', meaning: 'Tinggi badan' },
      { word: '長男', reading: 'chounan', meaning: 'Putra sulung' },
    ]
  },
  {
    character: '白', strokes: 5,
    meaning: 'Putih',
    onyomi: 'ハク',
    kunyomi: 'しろ',
    examples: [
      { word: '白い', reading: 'shiroi', meaning: 'Warna putih' },
      { word: '白鳥', reading: 'hakuchou', meaning: 'Angsa' },
      { word: '白黒', reading: 'shirokuro', meaning: 'Hitam putih' },
      { word: '明白', reading: 'meihaku', meaning: 'Jelas' },
      { word: '白紙', reading: 'hakushi', meaning: 'Kertas kosong' },
    ]
  },
  {
    character: '何', strokes: 7,
    meaning: 'Apa',
    onyomi: 'カ',
    kunyomi: 'なに, なん',
    examples: [
      { word: '何時', reading: 'nanji', meaning: 'Jam berapa' },
      { word: '何か', reading: 'nanika', meaning: 'Sesuatu' },
      { word: '何人', reading: 'nannin', meaning: 'Berapa orang' },
      { word: '何か', reading: 'nanika', meaning: 'Sesuatu' },
      { word: '何回', reading: 'nankai', meaning: 'Berapa kali' },
    ]
  },
  {
    character: '大', strokes: 3,
    meaning: 'Besar',
    onyomi: 'ダイ, タイ',
    kunyomi: 'おお.きい',
    examples: [
      { word: '大学', reading: 'daigaku', meaning: 'Universitas' },
      { word: '大人', reading: 'otona', meaning: 'Orang dewasa' },
      { word: '大きい', reading: 'ookii', meaning: 'Besar' },
      { word: '大切', reading: 'taisetsu', meaning: 'Penting' },
      { word: '大変', reading: 'taihen', meaning: 'Luar biasa/Sulit' },
    ]
  },
  {
    character: '小', strokes: 3,
    meaning: 'Kecil',
    onyomi: 'ショウ',
    kunyomi: 'ちい.さい',
    examples: [
      { word: '小学校', reading: 'shougakkou', meaning: 'SD' },
      { word: '小川', reading: 'ogawa', meaning: 'Sungai kecil' },
      { word: '小さい', reading: 'chiisai', meaning: 'Kecil' },
      { word: '小説', reading: 'shousetsu', meaning: 'Novel' },
      { word: '小包', reading: 'kozutsumi', meaning: 'Paket kecil' },
    ]
  },
  {
    character: '分', strokes: 4,
    meaning: 'Menit / Bagian',
    onyomi: 'フン, ブン',
    kunyomi: 'わ.かる',
    examples: [
      { word: '五分', reading: 'gofun', meaning: '5 menit' },
      { word: '自分', reading: 'jibun', meaning: 'Diri sendiri' },
      { word: '分かる', reading: 'wakaru', meaning: 'Mengerti' },
      { word: '半分', reading: 'hanbun', meaning: 'Setengah' },
      { word: '自分', reading: 'jibun', meaning: 'Diri sendiri' },
    ]
  },
  {
    character: '学', strokes: 8,
    meaning: 'Belajar',
    onyomi: 'ガク',
    kunyomi: 'まな.ぶ',
    examples: [
      { word: '学生', reading: 'gakusei', meaning: 'Siswa' },
      { word: '学校', reading: 'gakkou', meaning: 'Sekolah' },
      { word: '大学', reading: 'daigaku', meaning: 'Universitas' },
      { word: '中学', reading: 'chuugaku', meaning: 'SMP' },
      { word: '学び', reading: 'manabi', meaning: 'Pembelajaran' },
    ]
  },
  {
    character: '先', strokes: 6,
    meaning: 'Dahulu',
    onyomi: 'セン',
    kunyomi: 'さき',
    examples: [
      { word: '先生', reading: 'sensei', meaning: 'Guru' },
      { word: '先週', reading: 'senshuu', meaning: 'Minggu lalu' },
      { word: '先日', reading: 'senjitsu', meaning: 'Beberapa hari lalu' },
      { word: '先月', reading: 'sengetsu', meaning: 'Bulan lalu' },
      { word: 'お先に', reading: 'osakini', meaning: 'Duluan' },
    ]
  },
  {
    character: '生', strokes: 5,
    meaning: 'Lahir / Hidup',
    onyomi: 'セイ, ショウ',
    kunyomi: 'う.まれる, い.きる',
    examples: [
      { word: '誕生日', reading: 'tanjoubi', meaning: 'Hari ulang tahun' },
      { word: '生活', reading: 'seikatsu', meaning: 'Kehidupan' },
      { word: '一生', reading: 'isshou', meaning: 'Seumur hidup' },
      { word: '学問', reading: 'gakumon', meaning: 'Studi/Belajar' },
      { word: '生きる', reading: 'ikiru', meaning: 'Hidup' },
    ]
  },
  {
    character: '校', strokes: 10,
    meaning: 'Sekolah',
    onyomi: 'コウ',
    kunyomi: '-',
    examples: [
      { word: '学校', reading: 'gakkou', meaning: 'Sekolah' },
      { word: '校長', reading: 'kouchou', meaning: 'Kepala sekolah' },
      { word: '高校', reading: 'koukou', meaning: 'SMA' },
      { word: '校舎', reading: 'kousha', meaning: 'Gedung sekolah' },
      { word: '登校', reading: 'toukou', meaning: 'Pergi ke sekolah' },
    ]
  },
  {
    character: '友', strokes: 4,
    meaning: 'Teman',
    onyomi: 'ユウ',
    kunyomi: 'とも',
    examples: [
      { word: '友達', reading: 'tomodachi', meaning: 'Teman' },
      { word: '友人', reading: 'yuujin', meaning: 'Rekan/Teman' },
      { word: '親友', reading: 'shinyuu', meaning: 'Sahabat' },
      { word: '友情', reading: 'yuujou', meaning: 'Persahabatan' },
      { word: '連れ', reading: 'tsure', meaning: 'Teman seperjalanan' },
    ]
  },
  {
    character: '毎', strokes: 6,
    meaning: 'Setiap',
    onyomi: 'マイ',
    kunyomi: '-',
    examples: [
      { word: '毎日', reading: 'mainichi', meaning: 'Setiap hari' },
      { word: '毎週', reading: 'maishuu', meaning: 'Setiap minggu' },
      { word: '毎月', reading: 'maigetsu', meaning: 'Setiap bulan' },
      { word: '毎年', reading: 'mainen', meaning: 'Setiap tahun' },
      { word: '毎朝', reading: 'maiasa', meaning: 'Setiap pagi' },
    ]
  },
  {
    character: '休', strokes: 6,
    meaning: 'Istirahat',
    onyomi: 'キュウ',
    kunyomi: 'やす.む',
    examples: [
      { word: '休み', reading: 'yasumi', meaning: 'Libur/Istirahat' },
      { word: '休日', reading: 'kyuujitsu', meaning: 'Hari libur' },
      { word: '昼休み', reading: 'hiruyasumi', meaning: 'Istirahat siang' },
      { word: '休学', reading: 'kyuugaku', meaning: 'Cuti sekolah' },
      { word: '夏休み', reading: 'natsuyasumi', meaning: 'Libur musim panas' },
    ]
  },
  {
    character: '午', strokes: 4,
    meaning: 'Siang',
    onyomi: 'ゴ',
    kunyomi: '-',
    examples: [
      { word: '午前', reading: 'gozen', meaning: 'A.M. / Pagi' },
      { word: '午後', reading: 'gogo', meaning: 'P.M. / Sore' },
      { word: '正午', reading: 'shougo', meaning: 'Tengah hari' },
      { word: '午睡', reading: 'gosui', meaning: 'Tidur siang' },
      { word: '午餐', reading: 'gosan', meaning: 'Makan siang' },
    ]
  },
  {
    character: '出', strokes: 5,
    meaning: 'Keluar',
    onyomi: 'シュツ',
    kunyomi: 'で.る, だ.す',
    examples: [
      { word: '出口', reading: 'deguchi', meaning: 'Pintu keluar' },
      { word: '出す', reading: 'dasu', meaning: 'Mengeluarkan' },
      { word: '外出', reading: 'gaishutsu', meaning: 'Bepergian' },
      { word: '思い出', reading: 'omoide', meaning: 'Kenangan' },
      { word: '日の出', reading: 'hinode', meaning: 'Matahari terbit' },
    ]
  },
  {
    character: '入', strokes: 2,
    meaning: 'Masuk',
    onyomi: 'ニュウ',
    kunyomi: 'はい.る, い.れる',
    examples: [
      { word: '入口', reading: 'iriguchi', meaning: 'Pintu masuk' },
      { word: '入れる', reading: 'ireru', meaning: 'Memasukkan' },
      { word: '入学', reading: 'nyuugaku', meaning: 'Masuk sekolah' },
      { word: '気に入る', reading: 'kiniiru', meaning: 'Menyukai' },
      { word: '輸入', reading: 'yunyuu', meaning: 'Impor' },
    ]
  },
  {
    character: '間', strokes: 12,
    meaning: 'Antara / Interval',
    onyomi: 'カン',
    kunyomi: 'あいだ, ま',
    examples: [
      { word: '時間', reading: 'jikan', meaning: 'Waktu / Jam' },
      { word: '間に合う', reading: 'maniau', meaning: 'Tepat waktu' },
      { word: '間違い', reading: 'machigai', meaning: 'Kesalahan' },
      { word: '仲間', reading: 'nakama', meaning: 'Teman/Rekan' },
      { word: '人間', reading: 'ningen', meaning: 'Manusia' },
    ]
  },
  {
    character: '話', strokes: 13,
    meaning: 'Berbicara',
    onyomi: 'ワ',
    kunyomi: 'はな.す, はなし',
    examples: [
      { word: '話す', reading: 'hanasu', meaning: 'Berbicara' },
      { word: '電話', reading: 'denwa', meaning: 'Telepon' },
      { word: '会話', reading: 'kaiwa', meaning: 'Percakapan' },
      { word: 'お話', reading: 'ohanashi', meaning: 'Cerita/Dongeng' },
      { word: '世話', reading: 'sewa', meaning: 'Bantuan/Asuhan' },
    ]
  },
  {
    character: '高', strokes: 10,
    meaning: 'Tinggi / Mahal',
    onyomi: 'コウ',
    kunyomi: 'たか.い',
    examples: [
      { word: '高い', reading: 'takai', meaning: 'Tinggi/Mahal' },
      { word: '男の子', reading: 'otokonoko', meaning: 'Anak laki-laki' },
      { word: '高校生', reading: 'koukousei', meaning: 'Siswa SMA' },
      { word: '最高', reading: 'saikou', meaning: 'Terbaik' },
      { word: '高級', reading: 'koukyuu', meaning: 'Mewah' },
    ]
  },
  {
    character: '書', strokes: 10,
    meaning: 'Menulis',
    onyomi: 'ショ',
    kunyomi: 'か.く',
    examples: [
      { word: '書く', reading: 'kaku', meaning: 'Menulis' },
      { word: '教科書', reading: 'kyoukasho', meaning: 'Buku pelajaran' },
      { word: '図書館', reading: 'toshokan', meaning: 'Perpustakaan' },
      { word: '読書', reading: 'dokusho', meaning: 'Membaca buku' },
      { word: '手書き', reading: 'tegaki', meaning: 'Tulisan tangan' },
    ]
  },
  {
    character: '聞', strokes: 14,
    meaning: 'Mendengar',
    onyomi: 'ブン, モン',
    kunyomi: 'き.く',
    examples: [
      { word: '聞く', reading: 'kiku', meaning: 'Mendengar' },
      { word: '新聞', reading: 'shinbun', meaning: 'Koran' },
      { word: '聞き取り', reading: 'kikitori', meaning: 'Mendengarkan' },
      { word: '伝聞', reading: 'denbun', meaning: 'Kabar burung' },
      { word: '聞こえる', reading: 'kikoeru', meaning: 'Terdengar' },
    ]
  },
  {
    character: '食', strokes: 9,
    meaning: 'Makan',
    onyomi: 'ショク',
    kunyomi: 'た.べる, く.う',
    examples: [
      { word: '食べる', reading: 'taberu', meaning: 'Makan' },
      { word: '食事', reading: 'shokuji', meaning: 'Makan (kata benda)' },
      { word: '朝食', reading: 'choushoku', meaning: 'Sarapan' },
      { word: '食べ物', reading: 'tabemono', meaning: 'Makanan' },
      { word: '定食', reading: 'teishoku', meaning: 'Paket makanan' },
    ]
  },
  {
    character: '電', strokes: 13,
    meaning: 'Listrik',
    onyomi: 'デン',
    kunyomi: '-',
    examples: [
      { word: '電気', reading: 'denki', meaning: 'Listrik / Lampu' },
      { word: '電車', reading: 'densha', meaning: 'Kereta listrik' },
      { word: '電話', reading: 'denwa', meaning: 'Telepon' },
      { word: '電池', reading: 'denchi', meaning: 'Baterai' },
      { word: '電卓', reading: 'dentaku', meaning: 'Kalkulator' },
    ]
  },
  {
    character: '車', strokes: 7,
    meaning: 'Kendaraan / Mobil',
    onyomi: 'シャ',
    kunyomi: 'くるま',
    examples: [
      { word: '車', reading: 'kuruma', meaning: 'Mobil' },
      { word: '電車', reading: 'densha', meaning: 'Kereta' },
      { word: '自転車', reading: 'jitensha', meaning: 'Sepeda' },
      { word: '救急車', reading: 'kyuukyuusha', meaning: 'Ambulans' },
      { word: '車いす', reading: 'kurumaisu', meaning: 'Kursi roda' },
    ]
  },
  {
    character: '読', strokes: 14,
    meaning: 'Membaca',
    onyomi: 'ドク',
    kunyomi: 'よ.む',
    examples: [
      { word: '読む', reading: 'yomu', meaning: 'Membaca' },
      { word: '読書', reading: 'dokusho', meaning: 'Membaca buku' },
      { word: '読み方', reading: 'yomikata', meaning: 'Cara baca' },
      { word: '読経', reading: 'dokkyou', meaning: 'Membaca sutra' },
      { word: '句読点', reading: 'kutouten', meaning: 'Tanda baca' },
    ]
  },
  {
    character: '今', strokes: 4,
    meaning: 'Sekarang',
    onyomi: 'コン, キン',
    kunyomi: 'いま',
    examples: [
      { word: '今', reading: 'ima', meaning: 'Sekarang' },
      { word: '今日', reading: 'kyou', meaning: 'Hari ini' },
      { word: '今月', reading: 'kongetsu', meaning: 'Bulan ini' },
      { word: '今年', reading: 'kotoshi', meaning: 'Tahun ini' },
      { word: '今晩', reading: 'konban', meaning: 'Malam ini' },
    ]
  },
  {
    character: '週', strokes: 11,
    meaning: 'Minggu',
    onyomi: 'シュウ',
    kunyomi: '-',
    examples: [
      { word: '一週間', reading: 'isshuukan', meaning: 'Satu minggu' },
      { word: '先週', reading: 'senshuu', meaning: 'Minggu lalu' },
      { word: '来週', reading: 'raishuu', meaning: 'Minggu depan' },
      { word: '毎週', reading: 'maishuu', meaning: 'Setiap minggu' },
      { word: '週末', reading: 'shuumatsu', meaning: 'Akhir pekan' },
    ]
  },
  {
    character: '半', strokes: 5,
    meaning: 'Setengah',
    onyomi: 'ハン',
    kunyomi: 'なか.ば',
    examples: [
      { word: '半分', reading: 'hanbun', meaning: 'Setengah' },
      { word: '三時半', reading: 'sanjihan', meaning: 'Jam setengah empat' },
      { word: '半年', reading: 'hantoshi', meaning: 'Setengah tahun' },
      { word: '半日', reading: 'hanjitsu', meaning: 'Setengah hari' },
      { word: '夜半', reading: 'yahan', meaning: 'Tengah malam' },
    ]
  },
  {
    character: '外', strokes: 5,
    meaning: 'Luar',
    onyomi: 'ガイ, ゲ',
    kunyomi: 'そと, ほか',
    examples: [
      { word: '外国', reading: 'gaikoku', meaning: 'Luar negeri' },
      { word: '外', reading: 'soto', meaning: 'Luar' },
      { word: '外出', reading: 'gaishutsu', meaning: 'Keluar rumah' },
      { word: '海外', reading: 'kaigai', meaning: 'Luar negeri (Seberang laut)' },
      { word: '外食', reading: 'gaishoku', meaning: 'Makan di luar' },
    ]
  },
  {
    character: '内', strokes: 5,
    meaning: 'Dalam',
    onyomi: 'ナイ',
    kunyomi: 'うち',
    examples: [
      { word: '内側', reading: 'uchigawa', meaning: 'Bagian dalam' },
      { word: '国内', reading: 'kokunai', meaning: 'Dalam negeri' },
      { word: '案内', reading: 'annai', meaning: 'Panduan/Informasi' },
      { word: '以内', reading: 'inai', meaning: 'Di dalam (batas)' },
      { word: '内緒', reading: 'naisho', meaning: 'Rahasia' },
    ]
  },
  {
    character: '会', strokes: 6,
    meaning: 'Bertemu / Perkumpulan',
    onyomi: 'カイ, エ',
    kunyomi: 'あ.う',
    examples: [
      { word: '会う', reading: 'au', meaning: 'Bertemu' },
      { word: '会社', reading: 'kaisha', meaning: 'Perusahaan' },
      { word: '会話', reading: 'kaiwa', meaning: 'Percakapan' },
      { word: '教会', reading: 'kyoukai', meaning: 'Gereja' },
      { word: '会議', reading: 'kaigi', meaning: 'Rapat' },
    ]
  },
  {
    character: '社', strokes: 7,
    meaning: 'Perusahaan / Kuil',
    onyomi: 'シャ',
    kunyomi: 'やしろ',
    examples: [
      { word: '会社', reading: 'kaisha', meaning: 'Perusahaan' },
      { word: '社員', reading: 'shain', meaning: 'Karyawan' },
      { word: '社会', reading: 'shakai', meaning: 'Masyarakat' },
      { word: '神社', reading: 'jinja', meaning: 'Kuil Shinto' },
      { word: '社長', reading: 'shachou', meaning: 'Presiden Direktur' },
    ]
  },
  {
    character: '店', strokes: 8,
    meaning: 'Toko',
    onyomi: 'テン',
    kunyomi: 'みせ',
    examples: [
      { word: '店', reading: 'mise', meaning: 'Toko' },
      { word: '店員', reading: 'tenin', meaning: 'Pelayan toko' },
      { word: '喫茶店', reading: 'kissaten', meaning: 'Kafe/Kedai kopi' },
      { word: '書店', reading: 'shoten', meaning: 'Toko buku' },
      { word: '開店', reading: 'kaiten', meaning: 'Pembukaan toko' },
    ]
  },
  {
    character: '言', strokes: 7,
    meaning: 'Berkata',
    onyomi: 'ゲン, ゴン',
    kunyomi: 'い.う, こと',
    examples: [
      { word: '言う', reading: 'iu', meaning: 'Berkata' },
      { word: '言葉', reading: 'kotoba', meaning: 'Kata/Bahasa' },
      { word: '遺言', reading: 'yuigon', meaning: 'Wasiat' },
      { word: '方言', reading: 'hougen', meaning: 'Dialek' },
      { word: '一言', reading: 'hitokoto', meaning: 'Satu kata' },
    ]
  },
  {
    character: '買', strokes: 12,
    meaning: 'Membeli',
    onyomi: 'バイ',
    kunyomi: 'か.う',
    examples: [
      { word: '買う', reading: 'kau', meaning: 'Membeli' },
      { word: '買い物', reading: 'kaimono', meaning: 'Belanja' },
      { word: '売買', reading: 'baibai', meaning: 'Jual beli' },
      { word: '買収', reading: 'baishuu', meaning: 'Akuisisi' },
      { word: '買い手', reading: 'kaite', meaning: 'Pembeli' },
    ]
  },
  {
    character: '売', strokes: 7,
    meaning: 'Menjual',
    onyomi: 'バイ',
    kunyomi: 'う.る',
    examples: [
      { word: '売る', reading: 'uru', meaning: 'Menjual' },
      { word: '売り場', reading: 'uriba', meaning: 'Tempat jualan' },
      { word: '売店', reading: 'baiten', meaning: 'Kios' },
      { word: '自動販売機', reading: 'jidouhanbaiki', meaning: 'Vending machine' },
      { word: '商売', reading: 'shoubai', meaning: 'Bisnis' },
    ]
  },
  {
    character: '走', strokes: 7,
    meaning: 'Berlari',
    onyomi: 'ソウ',
    kunyomi: 'はし.る',
    examples: [
      { word: '走る', reading: 'hashiru', meaning: 'Berlari' },
      { word: '走行', reading: 'soukou', meaning: 'Berjalan (kendaraan)' },
      { word: '競走', reading: 'kyousou', meaning: 'Balapan' },
      { word: '力走', reading: 'rikisou', meaning: 'Lari sekuat tenaga' },
      { word: '脱走', reading: 'dassou', meaning: 'Melarikan diri' },
    ]
  },
  {
    character: '歩', strokes: 8,
    meaning: 'Berjalan',
    onyomi: 'ホ, ブ',
    kunyomi: 'ある.く, あゆ.む',
    examples: [
      { word: '歩く', reading: 'aruku', meaning: 'Berjalan' },
      { word: '散歩', reading: 'sanpo', meaning: 'Jalan-jalan' },
      { word: '歩行者', reading: 'hokousha', meaning: 'Pejalan kaki' },
      { word: '一歩', reading: 'ippo', meaning: 'Satu langkah' },
      { word: '歩道', reading: 'hodou', meaning: 'Trotoar' },
    ]
  },
  {
    character: '立', strokes: 5,
    meaning: 'Berdiri',
    onyomi: 'リツ',
    kunyomi: 'た.つ',
    examples: [
      { word: '立つ', reading: 'tatsu', meaning: 'Berdiri' },
      { word: '国立', reading: 'kokuritsu', meaning: 'Nasional/Negeri' },
      { word: '立場', reading: 'tachiba', meaning: 'Posisi/Sudut pandang' },
      { word: '起立', reading: 'kiritsu', meaning: 'Berdiri (aba-aba)' },
      { word: '設立', reading: 'setsuritsu', meaning: 'Pendirian' },
    ]
  },
  {
    character: '飲', strokes: 12,
    meaning: 'Minum',
    onyomi: 'イン',
    kunyomi: 'の.む',
    examples: [
      { word: '飲む', reading: 'nomu', meaning: 'Minum' },
      { word: '飲み物', reading: 'nomimono', meaning: 'Minuman' },
      { word: '飲食店', reading: 'inshokuten', meaning: 'Restoran' },
      { word: '飲酒', reading: 'inshu', meaning: 'Minum alkohol' },
      { word: '飲み屋', reading: 'nomiya', meaning: 'Bar/Pub' },
    ]
  },
  {
    character: '花', strokes: 7,
    meaning: 'Bunga',
    onyomi: 'カ',
    kunyomi: 'はな',
    examples: [
      { word: '花', reading: 'hana', meaning: 'Bunga' },
      { word: '花火', reading: 'hanabi', meaning: 'Kembang api' },
      { word: '花見', reading: 'hanami', meaning: 'Melihat bunga' },
      { word: '生け花', reading: 'ikebana', meaning: 'Seni merangkai bunga' },
      { word: '花瓶', reading: 'kabin', meaning: 'Vas bunga' },
    ]
  },
  {
    character: '目', strokes: 5,
    meaning: 'Mata',
    onyomi: 'モク',
    kunyomi: 'め',
    examples: [
      { word: '目', reading: 'me', meaning: 'Mata' },
      { word: '目次', reading: 'mokuji', meaning: 'Daftar isi' },
      { word: '目的', reading: 'mokuteki', meaning: 'Tujuan' },
      { word: '一日目', reading: 'ichinichime', meaning: 'Hari pertama' },
      { word: '面目', reading: 'menboku', meaning: 'Kehormatan' },
    ]
  },
  {
    character: '耳', strokes: 6,
    meaning: 'Telinga',
    onyomi: 'ジ',
    kunyomi: 'みみ',
    examples: [
      { word: '耳', reading: 'mimi', meaning: 'Telinga' },
      { word: '耳鼻科', reading: 'jibika', meaning: 'THT' },
      { word: '初耳', reading: 'hatsumimi', meaning: 'Pertama kali dengar' },
      { word: '耳鳴り', reading: 'miminari', meaning: 'Telinga berdenging' },
      { word: '早耳', reading: 'hayamimi', meaning: 'Cepat tahu kabar' },
    ]
  },
  {
    character: '手', strokes: 4,
    meaning: 'Tangan',
    onyomi: 'シュ',
    kunyomi: 'て',
    examples: [
      { word: '手', reading: 'te', meaning: 'Tangan' },
      { word: '上手', reading: 'jouzu', meaning: 'Mahir' },
      { word: '下手', reading: 'heta', meaning: 'Tidak mahir' },
      { word: 'お手洗い', reading: 'otearai', meaning: 'Toilet' },
      { word: '手紙', reading: 'tegami', meaning: 'Surat' },
    ]
  },
  {
    character: '足', strokes: 7,
    meaning: 'Kaki / Cukup',
    onyomi: 'ソク',
    kunyomi: 'あし, た.りる',
    examples: [
      { word: '足', reading: 'ashi', meaning: 'Kaki' },
      { word: '足りる', reading: 'tariru', meaning: 'Cukup' },
      { word: '遠足', reading: 'ensoku', meaning: 'Piknik' },
      { word: '不足', reading: 'fusoku', meaning: 'Kekurangan' },
      { word: '土足', reading: 'dosoku', meaning: 'Memakai alas kaki' },
    ]
  },
  {
    character: '口', strokes: 3,
    meaning: 'Mulut',
    onyomi: 'コウ, ク',
    kunyomi: 'くち',
    examples: [
      { word: '口', reading: 'kuchi', meaning: 'Mulut' },
      { word: '入口', reading: 'iriguchi', meaning: 'Pintu masuk' },
      { word: '出口', reading: 'deguchi', meaning: 'Pintu keluar' },
      { word: '人口', reading: 'jinkou', meaning: 'Populasi' },
      { word: '窓口', reading: 'madoguchi', meaning: 'Loket' },
    ]
  },
  {
    character: '新', strokes: 13,
    meaning: 'Baru',
    onyomi: 'シン',
    kunyomi: 'あたら.しい',
    examples: [
      { word: '新しい', reading: 'atarashii', meaning: 'Baru' },
      { word: '新聞', reading: 'shinbun', meaning: 'Koran' },
      { word: '新年', reading: 'shinnen', meaning: 'Tahun baru' },
      { word: '新幹線', reading: 'shinkansen', meaning: 'Kereta cepat' },
      { word: '新鮮', reading: 'shinsen', meaning: 'Segar' },
    ]
  },
  {
    character: '古', strokes: 5,
    meaning: 'Lama',
    onyomi: 'コ',
    kunyomi: 'ふる.い',
    examples: [
      { word: '古い', reading: 'furui', meaning: 'Lama/Tua' },
      { word: '中古', reading: 'chuuko', meaning: 'Bekas/Second' },
      { word: '古本', reading: 'furuhon', meaning: 'Buku bekas' },
      { word: '古代', reading: 'kodai', meaning: 'Zaman kuno' },
      { word: '古着', reading: 'furugi', meaning: 'Baju bekas' },
    ]
  },
  {
    character: '多', strokes: 6,
    meaning: 'Banyak',
    onyomi: 'タ',
    kunyomi: 'おお.い',
    examples: [
      { word: '多い', reading: 'ooi', meaning: 'Banyak' },
      { word: '多分', reading: 'tabun', meaning: 'Mungkin' },
      { word: '多少', reading: 'tashou', meaning: 'Sedikit banyak' },
      { word: '多数', reading: 'tasuu', meaning: 'Jumlah banyak' },
      { word: '多忙', reading: 'tabou', meaning: 'Sangat sibuk' },
    ]
  },
  {
    character: '少', strokes: 4,
    meaning: 'Sedikit',
    onyomi: 'ショウ',
    kunyomi: 'すく.ない, すこ.し',
    examples: [
      { word: '少ない', reading: 'sukunai', meaning: 'Sedikit' },
      { word: '少し', reading: 'sukoshi', meaning: 'Agak/Sedikit' },
      { word: '少年', reading: 'shounen', meaning: 'Anak laki-laki' },
      { word: '少々', reading: 'shoushou', meaning: 'Sebentar/Sedikit' },
      { word: '少量', reading: 'shouryou', meaning: 'Jumlah sedikit' },
    ]
  },
  {
    character: '安', strokes: 6,
    meaning: 'Murah / Tenang',
    onyomi: 'アン',
    kunyomi: 'やす.い',
    examples: [
      { word: '安い', reading: 'yasui', meaning: 'Murah' },
      { word: '安心', reading: 'anshin', meaning: 'Lega/Tenang' },
      { word: '安全', reading: 'anzen', meaning: 'Aman' },
      { word: '安定', reading: 'antei', meaning: 'Stabil' },
      { word: '不安', reading: 'fuan', meaning: 'Cemas' },
    ]
  },
  {
    character: '道', strokes: 12,
    meaning: 'Jalan',
    onyomi: 'ドウ',
    kunyomi: 'みち',
    examples: [
      { word: '道', reading: 'michi', meaning: 'Jalan' },
      { word: '書道', reading: 'shodou', meaning: 'Kaligrafi' },
      { word: '水道', reading: 'suidou', meaning: 'Saluran air' },
      { word: '柔道', reading: 'juudou', meaning: 'Judo' },
      { word: '北海道', reading: 'hokkaidou', meaning: 'Hokkaido' },
    ]
  },
  {
    character: '駅', strokes: 14,
    meaning: 'Stasiun',
    onyomi: 'エキ',
    kunyomi: '-',
    examples: [
      { word: '駅', reading: 'eki', meaning: 'Stasiun' },
      { word: '駅員', reading: 'ekiin', meaning: 'Petugas stasiun' },
      { word: '駅名', reading: 'ekimei', meaning: 'Nama stasiun' },
      { word: '東京駅', reading: 'toukyou-eki', meaning: 'Stasiun Tokyo' },
      { word: '駅弁', reading: 'ekiben', meaning: 'Bento stasiun' },
    ]
  },
  {
    character: '魚', strokes: 11,
    meaning: 'Ikan',
    onyomi: 'ギョ',
    kunyomi: 'さかな',
    examples: [
      { word: '魚', reading: 'sakana', meaning: 'Ikan' },
      { word: '金魚', reading: 'kingyo', meaning: 'Ikan mas' },
      { word: '人魚', reading: 'ningyo', meaning: 'Putri duyung' },
      { word: '鮮魚', reading: 'sengyo', meaning: 'Ikan segar' },
      { word: '魚屋', reading: 'sakanaya', meaning: 'Toko ikan' },
    ]
  },
  {
    character: '肉', strokes: 6,
    meaning: 'Daging',
    onyomi: 'ニク',
    kunyomi: '-',
    examples: [
      { word: '肉', reading: 'niku', meaning: 'Daging' },
      { word: '牛肉', reading: 'gyuuniku', meaning: 'Daging sapi' },
      { word: '豚肉', reading: 'butaniku', meaning: 'Daging babi' },
      { word: '鳥肉', reading: 'toriniku', meaning: 'Daging ayam' },
      { word: '肉体', reading: 'nikutai', meaning: 'Tubuh fisik' },
    ]
  }
];

export const GRAMMAR: GrammarPoint[] = [
  {
    title: 'Partikel は (Wa)',
    structure: '[Subjek] は [Predikat] です。',
    explanation: 'Menandai topik kalimat. "Wa" ditulis dengan hiragana HA (は) tetapi dibaca WA.',
    examples: [
      { ja: 'わたしはがくせいです。', en: 'Saya adalah mahasiswa.' },
      { ja: 'たなかさんはにほんじんです。', en: 'Sdr. Tanaka orang Jepang.' },
      { ja: 'これはほんです。', en: 'Ini adalah buku.' },
      { ja: 'きょうはいいてんきですね。', en: 'Hari ini cuacanya bagus ya.' },
    ]
  },
  {
    title: 'Partikel が (Ga) - Keberadaan',
    structure: '[Benda/Orang] が あります/います。',
    explanation: 'ARIMASU untuk benda mati, IMASU untuk makhluk hidup.',
    examples: [
      { ja: 'つくえがあります。', en: 'Ada meja.' },
      { ja: 'ねこがいます。', en: 'Ada kucing.' },
      { ja: 'あそこにいぬがいます。', en: 'Ada anjing di sana.' },
      { ja: 'へやにテレビがあります。', en: 'Ada televisi di kamar.' },
    ]
  },
  {
    title: 'Kata Kerja Bentuk ~Tai (Ingin)',
    structure: 'V-Masu Stem + たいです。',
    explanation: 'Digunakan untuk menyatakan keinginan pembicara.',
    examples: [
      { ja: 'すしをたべたいです。', en: 'Ingin makan sushi.' },
      { ja: 'にほんへいきたいです。', en: 'Ingin pergi ke Jepang.' },
      { ja: 'みずをのみたいです。', en: 'Saya ingin minum air.' },
      { ja: 'えいがをみたいです。', en: 'Saya ingin menonton film.' },
    ]
  },
  {
    title: 'Partikel も (Mo)',
    structure: '[A] も [B] です。',
    explanation: 'Partikel mo berarti "juga". Digunakan ketika menyatakan sesuatu yang sama dengan sebelumnya.',
    examples: [
      { ja: 'わたしもがくせいです。', en: 'Saya juga mahasiswa.' },
      { ja: 'これもりんごです。', en: 'Ini juga apel.' },
      { ja: 'あれもわたしのほんです。', en: 'Itu juga buku saya.' },
      { ja: 'たなかさんもがくせいです。', en: 'Tanaka juga seorang mahasiswa.' },
    ]
  },
  {
    title: 'Partikel の (No)',
    structure: '[A] の [B]',
    explanation: 'Partikel no digunakan untuk menyatakan kepemilikan atau modifikasi kata benda.',
    examples: [
      { ja: 'わたしのほんです。', en: 'Ini buku saya.' },
      { ja: 'にほんごのせんせい。', en: 'Guru bahasa Jepang.' },
      { ja: 'これはわたしのペンです。', en: 'Ini adalah pulpen saya.' },
      { ja: 'にほんのくるまはいいです。', en: 'Mobil buatan Jepang bagus.' },
    ]
  },
  {
    title: 'Partikel を (Wo/O)',
    structure: '[Objek] を [Kata Kerja Transitif]',
    explanation: 'Menandai objek langsung dari sebuah kata kerja.',
    examples: [
      { ja: 'ごはんをたべます。', en: 'Makan nasi.' },
      { ja: 'おちゃをのみます。', en: 'Minum teh.' },
      { ja: 'りんごをたべます。', en: 'Makan apel.' },
      { ja: 'てがみをかきます。', en: 'Menulis surat.' },
    ]
  },
  {
    title: 'Partikel に (Ni) - Tujuan/Waktu',
    structure: '[Tempat/Waktu] に [Kata Kerja]',
    explanation: 'Menandai tujuan pergerakan atau titik waktu yang spesifik.',
    examples: [
      { ja: 'がっこうにいきます。', en: 'Pergi ke sekolah.' },
      { ja: '７じにおきます。', en: 'Bangun pada jam 7.' },
      { ja: 'じゅうじにねます。', en: 'Saya tidur jam 10.' },
      { ja: 'としょかんにいます。', en: 'Saya ada di perpustakaan.' },
    ]
  },
  {
    title: 'Partikel へ (He/E)',
    structure: '[Tempat] へ いきます/きます/かえります',
    explanation: 'Mirip dengan "Ni", tapi lebih menekankan pada arah tujuan.',
    examples: [
      { ja: 'にほんへいきます。', en: 'Pergi ke Jepang.' },
      { ja: 'うちへかえります。', en: 'Pulang ke rumah.' },
      { ja: 'がっこうへいきます。', en: 'Saya pergi ke sekolah.' },
      { ja: 'くにへかえります。', en: 'Saya pulang ke negara/kampung halaman.' },
    ]
  },
  {
    title: 'Struktur ~Mashou (Ayo)',
    structure: 'V-Masu Stem + ましょう',
    explanation: 'Digunakan untuk mengajak atau menawarkan diri melakukan sesuatu.',
    examples: [
      { ja: 'たべましょう。', en: 'Ayo makan.' },
      { ja: 'いきましょう。', en: 'Ayo pergi.' },
      { ja: 'ごはんをたべましょう。', en: 'Ayo makan nasi.' },
      { ja: 'いっしょにいきましょう。', en: 'Ayo pergi bersama-sama.' },
    ]
  },
  {
    title: 'Bentuk ~Te kudasai (Tolong)',
    structure: 'V-Te + ください',
    explanation: 'Digunakan untuk meminta tolong secara sopan.',
    examples: [
      { ja: 'きいてください。', en: 'Tolong dengarkan.' },
      { ja: 'まってください。', en: 'Tolong tunggu.' },
      { ja: 'ドアをあけてください。', en: 'Tolong buka pintunya.' },
      { ja: 'ちょっとまってください。', en: 'Tolong tunggu sebentar.' },
    ]
  }
];
