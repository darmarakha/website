<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Materi Kaiwa</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-950 text-slate-100"><main class="max-w-4xl mx-auto px-4 py-8"><div class="flex justify-between"><h1 class="text-3xl font-black">Materi Kaiwa</h1><div class="flex gap-2"><a href="index.php" class="px-4 py-2 rounded bg-slate-700">Back</a><a href="/index.php" class="px-4 py-2 rounded bg-cyan-600">Home</a></div></div><p class="mt-4">Latihan percakapan dengan AI cek jawaban (bertahap).</p><section class="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4"><h2 class="font-bold">Latihan cepat</h2><p class="text-sm mt-2">Balas sapaan: 「Ohayou」</p><input id="reply" class="mt-3 w-full rounded px-3 py-2 bg-slate-900 border border-slate-600" placeholder="Ketik jawaban, contoh: ohayou gozaimasu"/><p id="kaiwa-msg" class="mt-2 text-sm"></p></section><p class="mt-8 text-sm">Credit: <strong>By Darma</strong></p></main><script>
const inp=document.getElementById('reply');
function sendScore(correct, wrong, points){
  return fetch('save_score.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({correct,wrong,points,material:'kaiwa'})});
}
inp.addEventListener('change',()=>{
 const v=inp.value.toLowerCase().trim();
 const ok=['ohayou','ohayou gozaimasu'].includes(v);
 const msg=document.getElementById('kaiwa-msg');
 if(ok){msg.className='mt-2 text-sm text-emerald-300';msg.textContent='✅ Benar, +10 poin';sendScore(1,0,10);} 
 else{msg.className='mt-2 text-sm text-rose-300';msg.textContent='❌ Coba lagi. Contoh: ohayou gozaimasu';sendScore(0,1,-3);} 
});
sendScore(0,0,0);
</script></body></html>
