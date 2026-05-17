const fs = require('fs');

const additionals = {
  '見': [
    "{ word: '見せる', reading: 'miseru', meaning: 'Memperlihatkan' }",
    "{ word: '見学', reading: 'kengaku', meaning: 'Kunjungan belajar' }",
    "{ word: '意見', reading: 'iken', meaning: 'Pendapat' }"
  ],
  '行': [
    "{ word: '行く', reading: 'iku', meaning: 'Pergi' }",
    "{ word: '飛行機', reading: 'hikouki', meaning: 'Pesawat terbang' }",
    "{ word: '急行', reading: 'kyuukou', meaning: 'Kereta ekspres' }"
  ],
  '来': [
    "{ word: '来る', reading: 'kuru', meaning: 'Datang' }",
    "{ word: '将来', reading: 'shourai', meaning: 'Masa depan' }",
    "{ word: '来月', reading: 'raigetsu', meaning: 'Bulan depan' }"
  ],
  '四': [
    "{ word: '四人', reading: 'yonin', meaning: 'Empat orang' }",
    "{ word: '四月', reading: 'shigatsu', meaning: 'April' }",
    "{ word: '四季', reading: 'shiki', meaning: 'Empat musim' }"
  ],
  '五': [
    "{ word: '五人', reading: 'gonin', meaning: 'Lima orang' }",
    "{ word: '五月', reading: 'gogatsu', meaning: 'Mei' }",
    "{ word: '五十', reading: 'gojuu', meaning: 'Lima puluh' }"
  ],
  '六': [
    "{ word: '六人', reading: 'rokunin', meaning: 'Enam orang' }",
    "{ word: '六月', reading: 'rokugatsu', meaning: 'Juni' }",
    "{ word: '十六', reading: 'juuroku', meaning: 'Enam belas' }"
  ],
  '七': [
    "{ word: '七人', reading: 'shichinin', meaning: 'Tujuh orang' }",
    "{ word: '七月', reading: 'shichigatsu', meaning: 'Juli' }",
    "{ word: '七百', reading: 'nanahyaku', meaning: 'Tujuh ratus' }"
  ],
  '八': [
    "{ word: '八人', reading: 'hachinin', meaning: 'Delapan orang' }",
    "{ word: '八月', reading: 'hachigatsu', meaning: 'Agustus' }",
    "{ word: '八百屋', reading: 'yaoya', meaning: 'Toko sayur' }"
  ],
  '九': [
    "{ word: '九人', reading: 'kyuunin', meaning: 'Sembilan orang' }",
    "{ word: '九月', reading: 'kugatsu', meaning: 'September' }",
    "{ word: '九州', reading: 'kyuushuu', meaning: 'Kyushu' }"
  ],
  '十': [
    "{ word: '十人', reading: 'juunin', meaning: 'Sepuluh orang' }",
    "{ word: '十月', reading: 'juugatsu', meaning: 'Oktober' }",
    "{ word: '二十', reading: 'nijuu', meaning: 'Dua puluh' }"
  ],
  '百': [
    "{ word: '百科事典', reading: 'hyakkajiten', meaning: 'Ensiklopedia' }",
    "{ word: '八百屋', reading: 'yaoya', meaning: 'Toko sayur' }",
    "{ word: '数百', reading: 'suuhyaku', meaning: 'Ratusan' }"
  ],
  '千': [
    "{ word: '千円', reading: 'sen-en', meaning: 'Seribu Yen' }",
    "{ word: '数千', reading: 'suusen', meaning: 'Ribuan' }",
    "{ word: '千代紙', reading: 'chiyogami', meaning: 'Kertas kado Jepang' }"
  ],
  '万': [
    "{ word: '万年筆', reading: 'mannenhitsu', meaning: 'Pena' }",
    "{ word: '百万', reading: 'hyakuman', meaning: 'Satu juta' }",
    "{ word: '万一', reading: 'man-ichi', meaning: 'Seandainya' }"
  ],
  '円': [
    "{ word: '千円', reading: 'sen-en', meaning: 'Seribu yen' }",
    "{ word: '円満', reading: 'enman', meaning: 'Harmonis' }",
    "{ word: '百円', reading: 'hyaku-en', meaning: 'Seratus yen' }"
  ],
  '上': [
    "{ word: '上がる', reading: 'agaru', meaning: 'Naik' }",
    "{ word: '上司', reading: 'joushi', meaning: 'Atasan' }",
    "{ word: '上着', reading: 'uwagi', meaning: 'Jaket' }"
  ],
  '下': [
    "{ word: '下がる', reading: 'sagaru', meaning: 'Turun' }",
    "{ word: '地下', reading: 'chika', meaning: 'Bawah tanah' }",
    "{ word: '靴下', reading: 'kutsushita', meaning: 'Kaos kaki' }"
  ],
  '左': [
    "{ word: '左側', reading: 'hidarigawa', meaning: 'Sisi kiri' }",
    "{ word: '左折', reading: 'sasetsu', meaning: 'Belok kiri' }",
    "{ word: '左利き', reading: 'hidarikiki', meaning: 'Kidal' }"
  ],
  '右': [
    "{ word: '右側', reading: 'migigawa', meaning: 'Sisi kanan' }",
    "{ word: '右折', reading: 'usetsu', meaning: 'Belok kanan' }",
    "{ word: '右利き', reading: 'migikiki', meaning: 'Tidak kidal' }"
  ],
  '東': [
    "{ word: '東側', reading: 'higashigawa', meaning: 'Sisi timur' }",
    "{ word: '中東', reading: 'chuutou', meaning: 'Timur Tengah' }",
    "{ word: '関東', reading: 'kantou', meaning: 'Kanto (Daerah)' }"
  ],
  '西': [
    "{ word: '西側', reading: 'nishigawa', meaning: 'Sisi barat' }",
    "{ word: '関西', reading: 'kansai', meaning: 'Kansai (Daerah)' }",
    "{ word: '大西洋', reading: 'taiseiyou', meaning: 'Samudra Atlantik' }"
  ],
  '南': [
    "{ word: '南側', reading: 'minamigawa', meaning: 'Sisi selatan' }",
    "{ word: '南極', reading: 'nankyoku', meaning: 'Kutub selatan' }",
    "{ word: '東南', reading: 'tounan', meaning: 'Tenggara' }"
  ],
  '北': [
    "{ word: '北側', reading: 'kitagawa', meaning: 'Sisi utara' }",
    "{ word: '東北', reading: 'touhoku', meaning: 'Tohoku (Daerah)' }",
    "{ word: '北極', reading: 'hokkyoku', meaning: 'Kutub utara' }"
  ],
  '山': [
    "{ word: '火山', reading: 'kazan', meaning: 'Gunung berapi' }",
    "{ word: '登山', reading: 'tozan', meaning: 'Mendaki gunung' }",
    "{ word: '山林', reading: 'sanrin', meaning: 'Hutan gunung' }"
  ],
  '川': [
    "{ word: '川辺', reading: 'kawabe', meaning: 'Tepi sungai' }",
    "{ word: '河川', reading: 'kasen', meaning: 'Sungai-sungai' }",
    "{ word: '天の川', reading: 'amanogawa', meaning: 'Bima Sakti' }"
  ],
  '田': [
    "{ word: '水田', reading: 'suiden', meaning: 'Sawah berair' }",
    "{ word: '田んぼ', reading: 'tanbo', meaning: 'Sawah' }",
    "{ word: '山田', reading: 'yamada', meaning: 'Yamada (Nama orang)' }"
  ],
  '天': [
    "{ word: '天の川', reading: 'amanogawa', meaning: 'Bima sakti' }",
    "{ word: '天国', reading: 'tengoku', meaning: 'Surga' }",
    "{ word: '天使', reading: 'tenshi', meaning: 'Malaikat' }"
  ],
  '気': [
    "{ word: '人気', reading: 'ninki', meaning: 'Populer' }",
    "{ word: '気分', reading: 'kibun', meaning: 'Perasaan / Mood' }",
    "{ word: '病気', reading: 'byouki', meaning: 'Sakit' }"
  ],
  '雨': [
    "{ word: '小雨', reading: 'kosame', meaning: 'Gerimis' }",
    "{ word: '雨水', reading: 'amamizu', meaning: 'Air hujan' }",
    "{ word: '梅雨', reading: 'tsuyu', meaning: 'Musim hujan' }"
  ],
  '空': [
    "{ word: '空手', reading: 'karate', meaning: 'Karate' }",
    "{ word: '青空', reading: 'aozora', meaning: 'Langit biru' }",
    "{ word: '空く', reading: 'aku', meaning: 'Menjadi kosong' }"
  ],
  '男': [
    "{ word: '男性', reading: 'dansei', meaning: 'Pria' }",
    "{ word: '男子', reading: 'danshi', meaning: 'Anak laki-laki' }",
    "{ word: '男女', reading: 'danjo', meaning: 'Pria & Wanita' }"
  ],
  '女': [
    "{ word: '女性', reading: 'josei', meaning: 'Wanita' }",
    "{ word: '女子', reading: 'joshi', meaning: 'Anak perempuan' }",
    "{ word: '長女', reading: 'choujo', meaning: 'Putri sulung' }"
  ],
  '子': [
    "{ word: '女子', reading: 'joshi', meaning: 'Anak perempuan' }",
    "{ word: '男子', reading: 'danshi', meaning: 'Anak laki-laki' }",
    "{ word: '電子', reading: 'denshi', meaning: 'Elektronik' }"
  ],
  '父': [
    "{ word: '祖父', reading: 'sofu', meaning: 'Kakek' }",
    "{ word: '父親', reading: 'chichioya', meaning: 'Ayah' }",
    "{ word: '義父', reading: 'gifu', meaning: 'Ayah mertua' }"
  ],
  '母': [
    "{ word: '祖母', reading: 'sobo', meaning: 'Nenek' }",
    "{ word: '母親', reading: 'hahaoya', meaning: 'Ibu' }",
    "{ word: '母語', reading: 'bogo', meaning: 'Bahasa ibu' }"
  ],
  '時': [
    "{ word: '時間', reading: 'jikan', meaning: 'Waktu' }",
    "{ word: '時々', reading: 'tokidoki', meaning: 'Kadang-kadang' }",
    "{ word: '時代', reading: 'jidai', meaning: 'Zaman' }"
  ],
  '年': [
    "{ word: '去年', reading: 'kyonen', meaning: 'Tahun lalu' }",
    "{ word: '年末', reading: 'nenmatsu', meaning: 'Akhir tahun' }",
    "{ word: '年上', reading: 'toshiue', meaning: 'Lebih tua' }"
  ],
  '名': [
    "{ word: '有名', reading: 'yuumei', meaning: 'Terkenal' }",
    "{ word: '名物', reading: 'meibutsu', meaning: 'Sesuatu yang terkenal (lokal)' }",
    "{ word: '名刺', reading: 'meishi', meaning: 'Kartu nama' }"
  ],
  '前': [
    "{ word: '午前', reading: 'gozen', meaning: 'Pagi (A.M.)' }",
    "{ word: '前半', reading: 'zenhan', meaning: 'Babak pertama' }",
    "{ word: '駅前', reading: 'ekimae', meaning: 'Depan stasiun' }"
  ],
  '後': [
    "{ word: '後ろ', reading: 'ushiro', meaning: 'Belakang' }",
    "{ word: 'その後', reading: 'sonogo', meaning: 'Setelah itu' }",
    "{ word: '後半', reading: 'kouhan', meaning: 'Babak kedua' }"
  ],
  '長': [
    "{ word: '長い', reading: 'nagai', meaning: 'Panjang' }",
    "{ word: '身長', reading: 'shinchou', meaning: 'Tinggi badan' }",
    "{ word: '長男', reading: 'chounan', meaning: 'Putra sulung' }"
  ],
  '白': [
    "{ word: '白黒', reading: 'shirokuro', meaning: 'Hitam putih' }",
    "{ word: '明白', reading: 'meihaku', meaning: 'Jelas' }",
    "{ word: '白紙', reading: 'hakushi', meaning: 'Kertas kosong' }"
  ],
  '何': [
    "{ word: '何人', reading: 'nannin', meaning: 'Berapa orang' }",
    "{ word: '何か', reading: 'nanika', meaning: 'Sesuatu' }",
    "{ word: '何回', reading: 'nankai', meaning: 'Berapa kali' }"
  ],
  '大': [
    "{ word: '大きい', reading: 'ookii', meaning: 'Besar' }",
    "{ word: '大切', reading: 'taisetsu', meaning: 'Penting' }",
    "{ word: '大変', reading: 'taihen', meaning: 'Luar biasa/Sulit' }"
  ],
  '小': [
    "{ word: '小さい', reading: 'chiisai', meaning: 'Kecil' }",
    "{ word: '小説', reading: 'shousetsu', meaning: 'Novel' }",
    "{ word: '小包', reading: 'kozutsumi', meaning: 'Paket kecil' }"
  ],
  '分': [
    "{ word: '分かる', reading: 'wakaru', meaning: 'Mengerti' }",
    "{ word: '半分', reading: 'hanbun', meaning: 'Setengah' }",
    "{ word: '自分', reading: 'jibun', meaning: 'Diri sendiri' }"
  ]
};

let content = fs.readFileSync('src/constants.ts', 'utf8');

// match each kanji block
let re = /character:\s*'([^']+)'[\s\S]*?examples:\s*\[([\s\S]*?)\]/g;
let finalContent = content;
let replacements = [];

let match;
while(match = re.exec(content)) {
    let char = match[1];
    let examplesText = match[2];
    let exMatches = examplesText.match(/{[^}]+}/g) || [];
    
    if (additionals[char] && exMatches.length < 5) {
        let newContent = examplesText;
        if (!newContent.endsWith('\n')) {
             newContent += '\n';
        }
        for (let newEx of additionals[char]) {
            newContent += '      ' + newEx + ',\n';
        }
        replacements.push({
            old: `examples: [\n${examplesText}\n    ]`,
            new: `examples: [\n${examplesText.replace(/\s+$/, '')}\n${additionals[char].map(e => '      ' + e + ',').join('\n')}\n    ]` // approximate replace logic
        });
        
        let oldBlock = `examples: [${examplesText}]`;
        let newBlock = oldBlock.replace(examplesText, examplesText.replace(/\s+$/, '') + '\n' + additionals[char].map(e => '      ' + e + ',').join('\n') + '\n    ');
        finalContent = finalContent.replace(oldBlock, newBlock);
    }
}

// Ensure "北" duplicate array elements can be handled since it appears twice in the regex
fs.writeFileSync('src/constants.ts', finalContent);
console.log('Added missing examples.');
