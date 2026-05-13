(function(){
  if(document.getElementById('gemu-guide-btn')) return;
  const btn=document.createElement('button');
  btn.id='gemu-guide-btn'; btn.className='gemu-guide-btn'; btn.type='button'; btn.innerHTML='💬'; btn.setAttribute('aria-label','Buka GEMU guide');
  const panel=document.createElement('section');
  panel.className='gemu-guide-panel';
  panel.innerHTML=`
    <div class="gemu-guide-head"><div><b>GEMU Guide 😄</b><span>Tanya website Darma. Internet dipakai kalau kamu minta jelas.</span></div><button class="gemu-guide-close" type="button">×</button></div>
    <div class="gemu-guide-log" id="gemu-guide-log"></div>
    <div class="gemu-guide-tools">
      <button class="gemu-guide-chip" data-q="Siapa Darma?">Siapa Darma?</button>
      <button class="gemu-guide-chip" data-q="Lihat proyek Darma">Proyek</button>
      <button class="gemu-guide-chip" data-q="Kenapa data analysis penting?">Kenapa?</button>
      <button class="gemu-guide-chip" data-q="Cari di internet portfolio fisika data analysis">Cari internet</button>
    </div>
    <form class="gemu-guide-form"><input id="gemu-guide-input" autocomplete="off" placeholder="Tanya GEMU..."><button type="submit">Kirim</button></form>`;
  document.body.appendChild(btn); document.body.appendChild(panel);
  const log=panel.querySelector('#gemu-guide-log'); const form=panel.querySelector('form'); const input=panel.querySelector('#gemu-guide-input');
  function esc(s){return String(s ?? '').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));}
  function add(text,who='bot'){
    const d=document.createElement('div');
    d.className='gemu-guide-msg '+who;
    d.innerHTML=esc(text).replace(/\n/g,'<br>');
    log.appendChild(d); log.scrollTop=log.scrollHeight;
    return d;
  }
  async function ask(q){
    add(q,'me'); input.value='';
    const wait=add('Aku cek dan jawab singkat dulu ya... 🔎','bot');
    try{
      const res=await fetch('/AI/api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'public_chat',message:q})});
      const json=await res.json(); wait.remove();
      if(!json.ok) throw new Error(json.message||'Gagal');
      add(json.message||'Siap 😄','bot');
      if(json.url) window.open(json.url,'_blank','noopener');
    }catch(e){ wait.remove(); add('Maaf, GEMU Guide belum bisa terhubung. Coba refresh halaman ya 🙏','bot'); }
  }
  btn.addEventListener('click',()=>{
    panel.classList.toggle('active');
    if(panel.classList.contains('active')&&log.children.length===0){
      add('Halo 👋 Aku GEMU Guide. Tanyakan apa saja tentang website Darma. Aku jawab singkat dulu dari isi website ini, lalu internet hanya kupakai kalau kamu minta jelas.');
      setTimeout(()=>input?.focus(),120);
    }
  });
  panel.querySelector('.gemu-guide-close').addEventListener('click',()=>panel.classList.remove('active'));
  form.addEventListener('submit',e=>{e.preventDefault(); const q=input.value.trim(); if(q) ask(q);});
  panel.querySelectorAll('.gemu-guide-chip').forEach(c=>c.addEventListener('click',()=>ask(c.dataset.q)));
})();
