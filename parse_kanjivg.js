const fs = require('fs');
const https = require('https');

const kanjiList = ['日', '一', '国', '人', '年', '大', '十', '二', '本', '中', '長', '出', '三', '時', '行', '見', '月', '分', '後', '前', '生', '五', '間', '上', '東', '四', '今', '金', '九', '入', '学', '高', '円', '子', '外', '八', '六', '下', '来', '気', '小', '七', '山', '話', '女', '北', '午', '百', '書', '先', '名', '川', '千', '水', '半', '男', '西', '電', '校', '語', '土', '木', '聞', '食', '車', '何', '南', '万', '毎', '白', '天', '母', '火', '右', '読', '友', '左', '休', '父', '雨'];

const results = {};

function getUnicode(char) {
  return char.charCodeAt(0).toString(16).padStart(5, '0');
}

async function fetchSvg(char) {
  const unicode = getUnicode(char);
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${unicode}.svg`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const char of kanjiList) {
    const svg = await fetchSvg(char);
    if (svg) {
      // Find the group with id="kvg:StrokePaths_..."
      // and extract all <path d="..." .../>
      const paths = [];
      const regex = /<path[^>]*\bd="([^"]+)"[^>]*>/g;
      let match;
      while ((match = regex.exec(svg)) !== null) {
        paths.push(match[1]);
      }
      results[char] = paths;
    } else {
      console.log(`Failed to fetch SVG for ${char}`);
    }
  }
  fs.writeFileSync('kanji_strokes_n5.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

main();
