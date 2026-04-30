<?php session_start(); $file=__DIR__.'/../leaderboard.json'; $cards=[['あ','a'],['い','i'],['う','u'],['え','e'],['お','o'],['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po'],['きゃ','kya'],['しゅ','shu'],['ちょ','cho']]; ?>
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Materi Hiragana</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-slate-950 text-slate-100"><main class="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-5"><header class="flex flex-col md:flex-row md:justify-between gap-2"><h1 class="text-2xl md:text-4xl font-black">Materi Hiragana</h1><div class="flex gap-2"><a href="index.php" class="px-4 py-2 rounded bg-slate-700">Back</a><a href="/index.php" class="px-4 py-2 rounded bg-cyan-600">Home</a></div></header>
<div class="rounded-2xl border border-slate-700 bg-slate-900 p-5"><div id="kana" class="text-7xl font-black text-center">あ</div><input id="ans" class="mt-4 w-full rounded px-3 py-2 bg-slate-950 border border-slate-700" placeholder="Ketik romaji..."/><p id="msg" class="mt-2 text-sm min-h-6"></p></div>
<div class="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4"><h2 class="font-bold">AI Cek Jawaban</h2><p class="text-sm">Auto-check aktif saat mengetik. Lalu pindah soal otomatis.</p></div>
<p class="text-center text-sm">Credit: <strong>By Darma</strong></p></main>
<script>
const cards=<?php echo json_encode($cards,JSON_UNESCAPED_UNICODE);?>;let idx=0,correct=0,wrong=0,lock=false;
function next(){idx=Math.floor(Math.random()*cards.length);kana.textContent=cards[idx][0];ans.value='';msg.textContent='';lock=false;}
const kana=document.getElementById('kana'),ans=document.getElementById('ans'),msg=document.getElementById('msg');
ans.addEventListener('input',()=>{if(lock)return;const v=ans.value.toLowerCase().trim();if(!v)return;const ok=cards[idx][1].split('/').includes(v);if(ok){correct++;msg.className='mt-2 text-sm text-emerald-300';msg.textContent='✅ Benar, lanjut...';lock=true;save();setTimeout(next,1200);}else if(v.length>=cards[idx][1].length){wrong++;msg.className='mt-2 text-sm text-rose-300';msg.textContent='❌ Salah: '+cards[idx][1];lock=true;save();setTimeout(next,1600);} });
function save(){fetch('save_score.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correct,wrong,points:correct*10-wrong*3,material:'hiragana'})});}
next();
</script></body></html>
