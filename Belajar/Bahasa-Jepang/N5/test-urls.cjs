const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 'error' })).end();
  });
}

async function run() {
  const chars = ['円', '万', '左', '右'];
  const patterns = [
    c => `https://commons.wikimedia.org/wiki/Special:FilePath/${c}-order.gif`,
    c => `https://commons.wikimedia.org/wiki/Special:FilePath/${c}-stroke_order.gif`,
    c => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(c)}-order.gif`
  ];
  
  for (const c of chars) {
    console.log(`Checking ${c}...`);
    for (const p of patterns) {
       const u = p(c);
       const r = await check(u);
       console.log(r.status, u);
    }
  }
}
run();
