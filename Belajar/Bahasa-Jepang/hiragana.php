<?php
session_start();
$gojuon = [
[['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']],
[['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']],
[['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']],
[['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']],
[['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']],
[['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']],
[['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']],
[['や','ya'],['',''],['ゆ','yu'],['',''],['よ','yo']],
[['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']],
[['わ','wa'],['',''],['',''],['',''],['を','wo']],
[['ん','n'],['',''],['',''],['',''],['','']]
];
$dakuon=[['が','ga'],['ぎ','gi'],['ぐ','gu'],['げ','ge'],['ご','go'],['ざ','za'],['じ','ji'],['ず','zu'],['ぜ','ze'],['ぞ','zo'],['だ','da'],['ぢ','ji'],['づ','zu'],['で','de'],['ど','do'],['ば','ba'],['び','bi'],['ぶ','bu'],['べ','be'],['ぼ','bo'],['ぱ','pa'],['ぴ','pi'],['ぷ','pu'],['ぺ','pe'],['ぽ','po']];
$yoon=[['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],['しゃ','sha'],['しゅ','shu'],['しょ','sho'],['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],['みゃ','mya'],['みゅ','myu'],['みょ','myo'],['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo'],['じゃ','ja'],['じゅ','ju'],['じょ','jo'],['びゃ','bya'],['びゅ','byu'],['びょ','byo'],['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo']];
$cards = array_merge(array_values(array_filter(array_merge(...$gojuon),fn($x)=>!empty($x[0]))),$dakuon,$yoon);
?>
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Materi Hiragana Lengkap</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-slate-950 text-slate-100"><main class="max-w-6xl mx-auto px-3 py-5 md:py-8 space-y-4">
<header class="rounded-2xl border border-slate-700 bg-slate-900 p-4 flex flex-col md:flex-row md:justify-between gap-2"><div><h1 class="text-2xl md:text-4xl font-black">Hiragana Lengkap + Latihan</h1><p class="text-slate-300 text-sm">Gojuon, dakuten, handakuten, yoon + latihan auto-check.</p></div><div class="flex gap-2"><a href="/Belajar/Index.php" class="px-3 py-2 rounded bg-slate-700">Back Belajar</a><a href="/index.php" class="px-3 py-2 rounded bg-cyan-600">Home Utama</a></div></header>
<section class="rounded-2xl border border-slate-700 bg-slate-900 p-4"><h2 class="font-bold text-xl mb-3">Tabel Hiragana Dasar (Gojuon)</h2><?php foreach($gojuon as $r): ?><div class="grid grid-cols-5 gap-2 mb-2"><?php foreach($r as $c): ?><div class="rounded-lg p-2 text-center <?php echo empty($c[0])?'bg-slate-800/40':'bg-slate-800 border border-slate-700';?>"><div class="text-2xl font-bold"><?php echo $c[0];?></div><div class="text-xs text-cyan-300"><?php echo $c[1];?></div></div><?php endforeach;?></div><?php endforeach;?></section>
<section class="grid md:grid-cols-2 gap-3"><div class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4"><h3 class="font-bold mb-2">Dakuten & Handakuten</h3><div class="grid grid-cols-5 gap-2"><?php foreach($dakuon as $d): ?><div class="bg-slate-900 rounded p-2 text-center"><div class="text-xl font-bold"><?php echo $d[0];?></div><div class="text-xs text-indigo-200"><?php echo $d[1];?></div></div><?php endforeach;?></div></div><div class="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4"><h3 class="font-bold mb-2">Kombinasi Yoon (ゃゅょ)</h3><div class="grid grid-cols-3 gap-2"><?php foreach($yoon as $y): ?><div class="bg-slate-900 rounded p-2 text-center"><div class="text-xl font-bold"><?php echo $y[0];?></div><div class="text-xs text-emerald-200"><?php echo $y[1];?></div></div><?php endforeach;?></div></div></section>
<section class="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4"><h2 class="font-bold text-xl">Flashcard Otomatis (Paling Lengkap)</h2><p class="text-sm">Tanpa tombol cek: ketik jawaban langsung dinilai, lalu lanjut otomatis.</p><div class="mt-3 bg-slate-950 rounded-xl p-4 border border-slate-700"><div id="kana" class="text-7xl font-black text-center">あ</div><input id="ans" class="mt-3 w-full rounded px-3 py-2 bg-slate-900 border border-slate-600" placeholder="Ketik romaji (contoh: shi, kya, po)"/><div id="msg" class="mt-2 text-sm min-h-6"></div><div class="text-xs text-slate-400 mt-2">Status: <span id="stat"></span></div></div></section>
<section class="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4"><h2 class="font-bold text-xl">Latihan Menulis & Membaca</h2><ol class="list-decimal ml-6 mt-2 text-sm space-y-1"><li>Baca huruf: きゃ, じゅ, ぽ, ぬ, れ.</li><li>Tulis ulang 5x tiap huruf sambil sebutkan romaji.</li><li>Latihan kata: がっこう, きょう, しゅくだい, びょういん, りょこう.</li><li>Ucapkan lalu cek ejaan romaji di flashcard.</li></ol></section>
<p class="text-center text-sm">Credit: <strong>By Darma</strong></p>
</main><script>
const cards=<?php echo json_encode($cards,JSON_UNESCAPED_UNICODE);?>;let idx=-1,correct=0,wrong=0,lock=false;
const kana=document.getElementById('kana'),ans=document.getElementById('ans'),msg=document.getElementById('msg'),stat=document.getElementById('stat');
function next(){let n;do{n=Math.floor(Math.random()*cards.length)}while(n===idx&&cards.length>1);idx=n;kana.textContent=cards[idx][0];ans.value='';msg.textContent='';lock=false;updateStat();}
function updateStat(){const t=correct+wrong;const wr=t?Math.round((correct/t)*100):0;stat.textContent=`Benar ${correct} | Salah ${wrong} | Win rate ${wr}% | Poin ${correct*10-wrong*3}`}
ans.addEventListener('input',()=>{if(lock)return;const v=ans.value.toLowerCase().trim();if(!v)return;const ok=cards[idx][1].split('/').includes(v);if(ok){correct++;lock=true;msg.className='mt-2 text-sm text-emerald-300';msg.textContent='✅ Benar';save();setTimeout(next,900);}else if(v.length>=cards[idx][1].length){wrong++;lock=true;msg.className='mt-2 text-sm text-rose-300';msg.textContent='❌ Salah. Benar: '+cards[idx][1];save();setTimeout(next,1300);}});
function save(){fetch('save_score.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correct,wrong,points:correct*10-wrong*3,material:'hiragana'})});updateStat();}
next();
</script></body></html>
