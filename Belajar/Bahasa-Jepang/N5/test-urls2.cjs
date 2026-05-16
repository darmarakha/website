const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.request(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 'error' })).end();
  });
}

async function run() {
  const chars = ['万', '円', '左', '右'];
  
  for (const c of chars) {
    const code = c.charCodeAt(0).toString(16).padStart(5, '0');
    console.log(`Checking ${c} (code: ${code})...`);
    const urls = [
      `https://commons.wikimedia.org/wiki/Special:FilePath/${c}-order.gif`,
      `https://raw.githubusercontent.com/yosida95/kanjivg-gif/master/kanji/${code}.gif`,
      `https://kanji.sljfaq.org/kanjivg/animated/${code}.gif`,
      `https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${code}.gif`,
    ];
    for (const u of urls) {
       const r = await check(u);
       console.log(r.status, u);
    }
  }
}
run();
