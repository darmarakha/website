const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.request(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 3000
    }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 'error' })).on('timeout', () => resolve({ url, status: 'timeout' })).end();
  });
}

async function run() {
  const chars = ['万', '円'];
  for (const c of chars) {
    const code5 = c.charCodeAt(0).toString(16).padStart(5, '0');
    const code4 = c.charCodeAt(0).toString(16);
    console.log(`Checking ${c} (code: ${code4} / ${code5})...`);
    const urls = [
      `https://raw.githubusercontent.com/jcsilva/anim-kanji/master/kanji-gifs/${code4}.gif`,
      `https://raw.githubusercontent.com/mistval/kanji_images/master/gifs/${code4}.gif`,
      `https://media.kanjialive.com/kanji_strokes/${c}_2.svg`
    ];
    for (const u of urls) {
       const r = await check(u);
       console.log(r.status, u);
    }
  }
}
run();
