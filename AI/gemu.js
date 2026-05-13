const shell = document.querySelector('.gemu-shell');
const token = shell?.dataset.token || '';
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const statusBox = document.getElementById('status-box');
const memoryBox = document.getElementById('memory-box');
const agentBoard = document.getElementById('agent-board');
const activityBox = document.getElementById('activity-box');
const fileBox = document.getElementById('file-box');
const autonomyBox = document.getElementById('autonomy-box');
const draftDock = document.getElementById('draft-reaction-dock');
const terminalBox = document.getElementById('terminal-box');
const voiceBtn = document.getElementById('voice-btn');
const speakToggle = document.getElementById('speak-toggle');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const clearChatBtn = document.getElementById('clear-chat-btn');
const digestBtn = document.getElementById('digest-btn');
const settingsBtn = document.getElementById('settings-btn');
const securityBtn = document.getElementById('security-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsPrompt = document.getElementById('settings-prompt');
const settingsStyle = document.getElementById('settings-style');
const settingsLocalFirst = document.getElementById('settings-local-first');
const settingsBlockStack = document.getElementById('settings-block-stack');
const settingsSecurityLevel = document.getElementById('settings-security-level');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const mobileNavBtn = document.getElementById('mobile-nav-btn');
const quickActions = document.getElementById('quick-actions');
const settingsCloseBtn = document.getElementById('settings-close-btn');
let speakOn = true;
let gemuEditBusy = false;
let isLoadingHistory = false;
let gemuCurrentBrain = {};

function escapeHtml(str){return String(str ?? '').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[m]));}
function nl2br(text){return escapeHtml(text).replace(/\n/g,'<br>');}

function autoResizeInput(){
  if(!chatInput) return;
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight || 46, 160) + 'px';
}
if(chatInput){
  chatInput.addEventListener('input', autoResizeInput);
  chatInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      chatForm?.requestSubmit();
    }
  });
  autoResizeInput();
}
if(mobileNavBtn){
  mobileNavBtn.addEventListener('click', ()=> document.body.classList.toggle('actions-open'));
}
if(quickActions){
  quickActions.addEventListener('click', (e)=>{
    if(e.target.closest('.action-card')) document.body.classList.remove('actions-open');
  });
}
function relativeTime(ts){
  const d=new Date(String(ts||'').replace(' ','T'));
  if(Number.isNaN(d.getTime())) return ts || '-';
  const diff=Math.max(0,Math.floor((Date.now()-d.getTime())/1000));
  if(diff<60) return diff+' dtk lalu';
  if(diff<3600) return Math.floor(diff/60)+' mnt lalu';
  return Math.floor(diff/3600)+' jam lalu';
}
function timeAgoSeconds(ts){
  const d=new Date(String(ts||'').replace(' ','T'));
  if(Number.isNaN(d.getTime())) return 999999;
  return Math.max(0,Math.floor((Date.now()-d.getTime())/1000));
}
function addHtmlMsg(html, who='gemu', extra=''){
  const div=document.createElement('div');
  div.className=`msg ${who} ${extra}`.trim();
  div.innerHTML=html;
  chatLog.appendChild(div);
  chatLog.scrollTop=chatLog.scrollHeight;
  return div;
}
function buildAgentReviewHtml(review){
  if(!review || !review.system) return '';
  const score = Number(review.score || 0);
  const decision = review.system.decision_text || review.decision_text || '-';
  const hardBlocks = Array.isArray(review.hard_blocks) ? review.hard_blocks : [];
  const evidence = review.evidence || {};
  const comps = review.components || review.system.components || {};
  const maxMap = {
    'Pemahaman intent':20,
    'Keamanan perubahan':25,
    'Kesesuaian file target':15,
    'Risiko bug kecil':15,
    'Test dasar lolos':15,
    'UX/tampilan tidak rusak':10
  };
  const compHtml = Object.entries(comps).map(([k,v])=>{
    const max = maxMap[k] || 100;
    const pct = Math.max(3, Math.min(100, Number(v || 0) / max * 100));
    return `<div class="v19-score-row">
      <span>${escapeHtml(k)}</span>
      <div class="v19-score-bar"><i style="width:${pct}%"></i></div>
      <b>${escapeHtml(v)}/${max}</b>
    </div>`;
  }).join('');

  const roles = [review.frontline, review.backend, review.system].filter(Boolean).map(role=>{
    const rating = Number(role.rating || 0);
    const notes = (role.notes || []).slice(0,3).map(n=>`<li>${escapeHtml(n)}</li>`).join('');
    return `<article class="v19-role-card">
      <div class="v19-role-head"><b>${escapeHtml(role.role || '-')}</b><span>${rating}%</span></div>
      <div class="v19-mini-bar"><i style="width:${Math.max(3,Math.min(100,rating))}%"></i></div>
      <p>${escapeHtml(role.summary || role.focus || '-')}</p>
      ${notes ? `<ul>${notes}</ul>` : ''}
    </article>`;
  }).join('');

  const evidenceItems = (evidence.items || []).slice(0,8).map(it=>{
    const hits = (it.hits || []).slice(0,3).map(h=>`${h.term}${h.line?`@${h.line}`:''}`).join(', ');
    return `<div class="v19-evidence-row">
      <b>${escapeHtml(it.file || '-')}</b>
      <span>${it.exists ? 'dibaca' : 'tidak ada'}${hits ? ' • '+escapeHtml(hits) : ''}</span>
    </div>`;
  }).join('');

  const dialogue = (review.dialogue || []).slice(0,18).map(d=>{
    const roleClass = String(d.role || '').toLowerCase().includes('backend') ? 'backend' : (String(d.role || '').toLowerCase().includes('front') ? 'frontline' : 'sistem');
    return `<div class="v19-dialogue-line ${roleClass}">
      <small>${escapeHtml(d.round || '-')} • ${escapeHtml(d.time || '')}</small>
      <b>${escapeHtml(d.role || '-')}</b>
      <p>${escapeHtml(d.text || '')}</p>
    </div>`;
  }).join('');

  const blocks = hardBlocks.length ? `<div class="v19-hardblock"><b>Hard-block</b>${hardBlocks.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>` : `<div class="v19-okblock">Gate utama lolos. Tetap menunggu approve owner untuk edit website.</div>`;

  return `<section class="agent-review v19-agent-review">
    <div class="v19-hero">
      <div>
        <h3>Ruang Diskusi 3 GEMU</h3>
        <p>${escapeHtml(review.final_summary || decision)}</p>
      </div>
      <div class="v19-score-badge ${score>=80?'ok':(score>=60?'warn':'bad')}"><b>${score}%</b><span>${escapeHtml(decision)}</span></div>
    </div>
    ${blocks}
    <div class="v19-grid">
      <div class="v19-panel"><h4>Skor Evidence-Based</h4>${compHtml}</div>
      <div class="v19-panel"><h4>Bukti File</h4>
        <p class="muted">File dibaca: ${escapeHtml(evidence.files_read || 0)} • hit file: ${escapeHtml(evidence.hit_files || 0)} • certainty: ${escapeHtml(evidence.target_certainty || 0)}%</p>
        ${evidenceItems || '<p class="muted">Belum ada bukti file kuat.</p>'}
      </div>
    </div>
    <div class="v19-roles">${roles}</div>
    <details class="v19-dialogue" open>
      <summary>Obrolan agent (${escapeHtml(review.rounds || 0)} ronde)</summary>
      ${dialogue || '<p class="muted">Belum ada dialog agent.</p>'}
    </details>
  </section>`;
}


function buildSmartSummaryHtml(data, label='Ringkasan GEMU'){
  const intent=data.intent||data.task?.intent||{};
  const agent=data.agent_review || data.task?.agent_review || null;
  const confidence=Math.round(((intent.confidence ?? 0)*100));
  const edits=data.staged_edits || (data.staged_edit ? [data.staged_edit] : []);
  const issues=data.issues||[];
  const files=(data.task?.files || agent?.backend?.target_files || []).slice(0,4);
  const badges=(intent.keywords||[]).slice(0,4).map(k=>`<span class="ai-badge">${escapeHtml(k)}</span>`).join('');
  return `<div class="ai-summary">
    <div class="summary-top">
      <div><b>${escapeHtml(label)}</b><div class="muted">Intent: ${escapeHtml(intent.intent||'-')}</div></div>
      <div class="summary-badges">${badges || `<span class="ai-badge">Owner mode</span>`}</div>
    </div>
    ${buildAgentReviewHtml(agent)}
    <div class="ai-progress"><span>Tingkat keyakinan Frontline: <b>${confidence||0}%</b></span><div class="track"><div class="bar" style="width:${Math.max(8,Math.min(confidence||0,100))}%"></div></div></div>
    <div class="ai-grid">
      <div class="ai-card"><b>Draft dibuat</b><span>${edits.length} draft dari respons ini</span></div>
      <div class="ai-card"><b>Temuan terkait</b><span>${issues.length} temuan dari scan area ini</span></div>
      <div class="ai-card"><b>Area fokus</b><span>${files.length?escapeHtml(files.join(', ')):'AI memilih file kandidat otomatis'}</span></div>
    </div>
    ${edits.length?`<div class="ai-card"><b>Status aksi</b><span>Reaksi Draft di bawah chat adalah status terbaru. Kalau sudah diterapkan/ditolak, dock akan kosong.</span></div>`:''}
    <div class="ai-card"><b>Cara pakai</b><span>Skor 80+ baru boleh masuk draft. Gunakan tombol ✓ atau × di bawah chat; website belum berubah sebelum Darma setujui.</span></div>
  </div>`;
}
function buildDigestSummaryHtml(data){
  const staged=data.staged_edit ? [data.staged_edit] : [];
  const count=staged.length;
  return `<div class="ai-summary">
    <div class="summary-top"><div><b>Laporan saran GEMU</b><div class="muted">Ringkas, tidak spam, dan siap direaksi</div></div><div class="summary-badges"><span class="ai-badge">Saran</span><span class="ai-badge">Draft ${count}</span></div></div>
    <div class="ai-grid">
      <div class="ai-card"><b>Status</b><span>${escapeHtml(data.message || 'Laporan saran siap.')}</span></div>
      <div class="ai-card"><b>Draft</b><span>${count?escapeHtml(staged[0].path||'-'):'Belum ada draft baru'}</span></div>
      <div class="ai-card"><b>Aksi</b><span>Lihat reaksi ✓/× tepat di bawah chat.</span></div>
    </div>
  </div>`;
}
function formatAiMessage(text){
  const raw=String(text ?? '').trim();
  if(!raw) return '';
  const lines=raw.split(/\n/);
  let html='<div class="ai-answer">';
  let inList=false;
  const closeList=()=>{ if(inList){ html+='</ol>'; inList=false; } };
  for(const original of lines){
    const line=String(original||'').trim();
    if(!line){ closeList(); continue; }
    const numbered=line.match(/^(\d+)[.)]\s+(.+)$/);
    const bulleted=line.match(/^[-•]\s+(.+)$/);
    if(numbered || bulleted){
      if(!inList){ html+='<ol class="ai-list">'; inList=true; }
      html+=`<li>${escapeHtml(numbered ? numbered[2] : bulleted[1])}</li>`;
      continue;
    }
    closeList();
    if(/^[A-Za-zÀ-ÿ0-9 _&/().,:✓×-]{3,78}:$/.test(line)){
      html+=`<h4>${escapeHtml(line.replace(/:$/,''))}</h4>`;
    }else if(/^(HTTP|Detail test|Mode mandiri gagal|Audit storage gagal|Smart edit gagal)/i.test(line)){
      html+=`<p class="ai-alert">${escapeHtml(line)}</p>`;
    }else{
      html+=`<p>${escapeHtml(line)}</p>`;
    }
  }
  closeList();
  html+='</div>';
  return html;
}
function friendlyError(err){
  const msg=err?.message || String(err || 'GEMU error');
  const status=err?.status ? `HTTP ${err.status}: ` : '';
  const q=err?.payload?.quality;
  if(q?.errors?.length) return `${status}${msg}
Detail test: ${q.errors.slice(0,3).join(' | ')}`;
  if(status) return status+msg;
  if(/Failed to fetch|NetworkError/i.test(msg)) return 'Koneksi ke api.php gagal. Cek internet, cPanel, atau HTTPS.';
  if(/bukan JSON/i.test(msg)) return msg+' Biasanya ada PHP fatal/warning sebelum JSON.';
  if(/token/i.test(msg)) return msg+' Coba refresh halaman owner lalu login ulang.';
  return msg;
}

function setEditBusy(on, label=''){
  gemuEditBusy=!!on;
  document.querySelectorAll('.apply-edit,.reject-edit,.action-card[data-action="smart"],.action-card[data-action="digest"],.action-card[data-action="autonomy"],.action-card[data-action="security"]').forEach(el=>{ el.disabled=gemuEditBusy; el.classList.toggle('is-busy', gemuEditBusy); });
  if(on && label) addActivityHint(label);
}
function addActivityHint(label){
  if(!terminalBox) return;
  const time=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  terminalBox.dataset.lastHint=label;
}
function processCard(title, steps=[], status='info'){
  const items=steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('');
  return `<div class="process-card ${escapeHtml(status)}"><b>${escapeHtml(title)}</b><ol>${items}</ol></div>`;
}
function buildSecuritySummaryHtml(data){
  const s=data.summary||{}; const c=s.counts||{}; const score=Math.max(0, Math.min(100, Number(s.score||0)));
  const top=(data.issues||[]).slice(0,6).map(i=>`<div class="security-row ${escapeHtml(i.severity||'low')}"><b>${escapeHtml((i.severity||'').toUpperCase())} • ${escapeHtml(i.category||'-')}</b><span>${escapeHtml(i.file||'-')}:${escapeHtml(i.line||'-')}</span><small>${escapeHtml(i.advice||'')}</small></div>`).join('');
  return `<div class="ai-summary security-summary"><div class="summary-top"><div><b>Security Audit GEMU</b><div class="muted">Scan statis lokal untuk SQL, XSS, upload, header, dan fungsi berisiko.</div></div><div class="security-score">${score}/100</div></div><div class="ai-progress"><span>Skor keamanan</span><div class="track"><div class="bar" style="width:${score}%"></div></div></div><div class="ai-grid"><div class="ai-card"><b>Kritis</b><span>${c.critical||0}</span></div><div class="ai-card"><b>High</b><span>${c.high||0}</span></div><div class="ai-card"><b>Medium/Low</b><span>${(c.medium||0)+(c.low||0)}</span></div></div>${top || '<div class="ai-card"><b>Aman</b><span>Belum ada pola risiko besar dari scan statis.</span></div>'}<div class="ai-card"><b>Catatan</b><span>GEMU belum mengubah website. Patch keamanan tetap harus jadi draft dan menunggu ✓ Darma.</span></div></div>`;
}

function saveChat(who,text){
  if(!token || isLoadingHistory || !text || String(text).length < 1) return;
  fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'owner_chat_add',token,who,text})}).catch(()=>{});
}
function addMsg(text, who='gemu', extra='', persist=true){
  const div=document.createElement('div');
  div.className=`msg ${who} ${extra}`.trim();
  const pretty = who==='gemu' && !String(extra||'').includes('thinking');
  div.innerHTML=pretty ? formatAiMessage(text) : nl2br(text);
  chatLog.appendChild(div);
  chatLog.scrollTop=chatLog.scrollHeight;
  if(persist && !extra.includes('thinking') && (who==='gemu' || who==='owner')) saveChat(who,text);
  if(who==='gemu' && speakOn && !extra.includes('thinking')) speak(text);
  return div;
}
function speak(text){
  if(!('speechSynthesis' in window)) return;
  const clean=String(text).replace(/[✅🔎🔐😄😁😊✨📁🏅🔬📩🎙️🧠🛡️🧩📝💾🧹📦]/g,'').slice(0,420);
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(clean);
  u.lang='id-ID'; u.rate=1; u.pitch=1;
  speechSynthesis.speak(u);
}
async function api(action, data={}){
  let res;
  try{ res=await fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token,...data})}); }
  catch(e){ e.message='Koneksi ke api.php gagal. '+(e.message||''); throw e; }
  let json; try{ json=await res.json(); }catch(e){ const err=new Error(`Respons server bukan JSON. Status ${res.status}. Cek error PHP/hosting.`); err.status=res.status; throw err; }
  if(!json.ok){ const err=new Error(json.message || 'GEMU gagal memproses perintah.'); err.status=res.status; err.payload=json; throw err; }
  return json;
}
async function apiUpload(files){
  const fd=new FormData(); fd.append('action','upload_files'); fd.append('token',token);
  [...files].forEach(f=>fd.append('files[]',f));
  let res;
  try{ res=await fetch('api.php',{method:'POST',body:fd}); }
  catch(e){ e.message='Koneksi upload ke api.php gagal. '+(e.message||''); throw e; }
  let json; try{ json=await res.json(); }catch(e){ const err=new Error(`Respons upload bukan JSON. Status ${res.status}. Cek batas upload PHP/cPanel.`); err.status=res.status; throw err; }
  if(!json.ok){ const err=new Error(json.message || 'Upload gagal.'); err.status=res.status; err.payload=json; throw err; }
  return json;
}
function thinking(label='Aku analisis dulu ya, Darma... 🔎'){
  return addMsg(label,'gemu','thinking',false);
}
function renderScan(data){
  const s=data.summary||{}; const issues=data.issues||[]; const backup=s.backup||{};
  statusBox.innerHTML = `<b>Terakhir scan:</b> ${escapeHtml(s.time||'-')}<br><b>Backup:</b> ${escapeHtml(backup.path||'-')} (${backup.files||0} file)<br><b>File dicek:</b> ${s.checked_files||0}<br><b>Temuan:</b> ${s.issues_total||0} (${s.danger_total||0} bahaya)<br><small>${escapeHtml(s.note||'')}</small>` +
    issues.slice(0,36).map(i=>`<div class="issue ${escapeHtml(i.level)}"><b>${escapeHtml(i.level)}</b> — ${escapeHtml(i.file)}<br>${escapeHtml(i.message)}</div>`).join('');
}
function renderActivity(logs=[], idle=[], feed=[]){
  if(!activityBox) return;
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeIdle = Array.isArray(idle) ? idle : [];
  const safeFeed = Array.isArray(feed) ? feed : [];
  if(!safeLogs.length && !safeIdle.length && !safeFeed.length){
    activityBox.innerHTML='<span class="muted">Belum ada log. Terminal Aktif menunggu aktivitas GEMU...</span>';
    renderTerminal([], [], []);
    return;
  }
  const stats=[
    {label:'Log 1 jam', value:safeLogs.length},
    {label:'Feed agent', value:safeFeed.length},
    {label:'5 menit', value:[...safeLogs,...safeFeed].filter(l=>timeAgoSeconds(l.time)<=300).length},
    {label:'Idle rounds', value:safeIdle.length},
  ];
  const statHtml = stats.map(x=>`<div class="activity-stat"><b>${escapeHtml(x.value)}</b><span>${escapeHtml(x.label)}</span></div>`).join('');
  const roles = ['GEMU Sistem','GEMU Frontline','GEMU Backend','Watcher Agent'];
  const roleHtml = roles.map(role=>{
    const rows = safeFeed.filter(l=>(l.role||'')===role).slice(0,4).map(l=>`
      <div class="activity-row"><b>${escapeHtml(l.type||'FEED')}</b><span>${escapeHtml(l.message||'-')}</span><em>${escapeHtml(relativeTime(l.time))}</em></div>`).join('');
    return `<div class="activity-col"><h3>${escapeHtml(role)}</h3>${rows || '<span class="muted">Belum ada feed.</span>'}</div>`;
  }).join('');
  const latestLogs = safeLogs.slice(0,8).map(l=>`<div class="activity-row compact"><b>${escapeHtml(l.type||'LOG')}</b><span>${escapeHtml(l.message||'-')}</span><em>${escapeHtml(relativeTime(l.time))}</em></div>`).join('');
  activityBox.innerHTML = `<div class="activity-stats">${statHtml}</div><div class="activity-columns">${roleHtml}<div class="activity-col"><h3>Log Sistem</h3>${latestLogs || '<span class="muted">Kosong.</span>'}</div></div>`;
}
function renderTerminal(logs=[], idle=[], feed=[]){
  if(!terminalBox) return;
  const freshFeed = (Array.isArray(feed)?feed:[]).filter(l=>timeAgoSeconds(l.time)<=300).slice(0,18);
  const fresh = (Array.isArray(logs)?logs:[]).filter(l=>timeAgoSeconds(l.time)<=300).slice(0,10);
  const idleFresh = (Array.isArray(idle)?idle:[]).slice(0,2);
  const rows = [];
  freshFeed.forEach(l=>rows.push(`<div class="terminal-line feed"><span>${escapeHtml(relativeTime(l.time))}</span><b>${escapeHtml(l.role||'AGENT')} • ${escapeHtml((l.type||'').toUpperCase())}</b><em>${escapeHtml(l.message||'-')}</em></div>`));
  fresh.forEach(l=>rows.push(`<div class="terminal-line"><span>${escapeHtml(relativeTime(l.time))}</span><b>${escapeHtml((l.type||'LOG').toUpperCase())}</b><em>${escapeHtml(l.message||'-')}</em></div>`));
  if(!rows.length){
    idleFresh.forEach(r=>{
      (r.dialogue||[]).slice(0,3).forEach(d=>rows.push(`<div class="terminal-line idle"><span>${escapeHtml(relativeTime(r.time))}</span><b>${escapeHtml(d.role||'AGENT')}</b><em>${escapeHtml(d.text||'-')}</em></div>`));
    });
  }
  terminalBox.innerHTML = `<div class="terminal-head"><span><span class="pulse"></span> Terminal Aktif</span><small>refresh otomatis 5 detik • tampil 5 menit</small></div><div class="terminal-scroll">${rows.join('') || '<span class="muted">Belum ada event 5 menit terakhir.</span>'}</div>`;
}



function renderFiles(files=[], storage={}){
  if(!fileBox) return;
  const used=storage.human_used || '0 B'; const limit=storage.human_limit || '1 GB';
  fileBox.innerHTML = `<b>File brain:</b> ${files.length} file<br><b>Storage:</b> ${escapeHtml(used)} / ${escapeHtml(limit)}<hr>` +
    files.slice(0,6).map(f=>`<div class="file-item"><b>${escapeHtml(f.name||'-')}</b><span>${escapeHtml(f.human_size||'')}</span><p>${escapeHtml(f.summary||'')}</p></div>`).join('');
}

function renderDraftDock(pending=[], decisions=gemuAgentDecisions){
  if(!draftDock) return;
  const decisionPending=(decisions?.pending||[]).map(d=>({...d, _kind:'decision'}));
  const editPending=(pending||[]).map(e=>({...e, _kind:'edit'}));
  const combined=[...editPending, ...decisionPending];
  if(!combined.length){ draftDock.classList.add('empty'); draftDock.innerHTML='<div class="draft-dock-head"><b>Reaksi Draft</b><span class="muted">Belum ada draft/keputusan pending. Saat GEMU menyiapkan saran/draft, tombol ✓ dan × akan muncul di sini.</span></div>'; return; }
  draftDock.classList.remove('empty');
  draftDock.innerHTML=`<div class="draft-dock-head"><b>Reaksi Draft • ${combined.length} pending</b><span class="muted">Klik ✓ untuk setuju atau × untuk tolak. Edit file tetap test + backup dulu.</span></div><div class="draft-chip-row">${combined.slice(0,8).map(e=>{
    const isDecision=e._kind==='decision';
    const title=isDecision ? (e.title||'Keputusan Agent') : (e.path||'-');
    const status=isDecision ? (e.quality?.status || 'review_ready') : (e.quality?.status || 'tested');
    const detail=isDecision ? (e.detail||'Menunggu keputusan owner.') : (e.reason || 'Menunggu keputusan owner.');
    const applyClass=isDecision?'approve-decision':'apply-edit';
    const rejectClass=isDecision?'reject-decision':'reject-edit';
    return `<div class="draft-chip ${isDecision?'decision-chip':''}" data-id="${escapeHtml(e.id||'')}"><b>${escapeHtml(title)}</b><small>${escapeHtml(relativeTime(e.time||''))} • ${escapeHtml(status)} • ${isDecision?'agent decision':'staged edit'}</small><small>${escapeHtml(detail)}</small><div class="dock-actions"><button type="button" class="mini-btn ${applyClass} approve" data-id="${escapeHtml(e.id||'')}">✓ Setuju</button><button type="button" class="mini-btn ${rejectClass} reject" data-id="${escapeHtml(e.id||'')}">× Tolak</button></div></div>`;
  }).join('')}</div>`;
}


function renderAutonomy(autonomy={}, stagedEdits={}){
  if(!autonomyBox) return;
  const pending=(stagedEdits.pending||[]);
  const applied=(stagedEdits.applied||[]);
  const goals=(autonomy.goals||[]).slice(0,4).map(g=>`<li>${escapeHtml(g)}</li>`).join('');
  const pendingHtml = pending.length ? pending.slice(0,6).map(e=>{
    const diff=e.diff||{};
    return `<div class="draft-edit" data-id="${escapeHtml(e.id||'')}">
      <b>${escapeHtml(e.path||'-')}</b>
      <span>${escapeHtml(e.time||'')} • ${escapeHtml(e.status||'waiting')}</span>
      <p>${escapeHtml(e.reason||'Draft edit menunggu keputusan owner.')}</p>
      <small>Δ baris: ${escapeHtml(diff.line_delta ?? 0)} • Δ byte: ${escapeHtml(diff.byte_delta ?? 0)}</small>
      ${e.quality ? `<small>Test otomatis: ${escapeHtml(e.quality.status || 'tested')}</small>` : ''}
      <div class="draft-actions">
        <button type="button" class="mini-btn apply-edit approve" data-id="${escapeHtml(e.id||'')}" title="Setujui dan terapkan">✓ Setujui & Terapkan</button>
        <button type="button" class="mini-btn reject-edit reject" data-id="${escapeHtml(e.id||'')}" title="Tolak draft">× Tolak</button>
      </div>
    </div>`;
  }).join('') : '<span class="muted">Belum ada draft edit yang menunggu keputusan.</span>';
  renderDraftDock(pending, gemuAgentDecisions);
  autonomyBox.innerHTML = `<b>${escapeHtml(autonomy.mode_name||'Mode Mandiri Aman')}</b><br>
    Status: ${autonomy.enabled?'aktif':'nonaktif'}<br>
    Siklus: ${autonomy.cycle_count||0}<br>
    Terakhir jalan: ${escapeHtml(autonomy.last_cycle_time||'-')}<br>
    Terakhir scan: ${escapeHtml(autonomy.last_scan_time||'-')}<br>
    <p>${escapeHtml(autonomy.last_summary||'Belum ada aktivitas mandiri.')}</p>
    <ul>${goals}</ul>
    <hr><b>Draft edit pending:</b> ${pending.length}<br>
    ${pendingHtml}
    <hr><small>Riwayat diterapkan: ${applied.length}. GEMU tidak menulis file tanpa tombol ✓ owner Darma.</small>`;
}


function renderAgentPanel(session={}, memories={}, thoughts={}){
  if(!agentBoard) return;
  const ratings=session.role_ratings||{};
  const score=Number(session.last_score||0);
  const comps=session.components||{};
  const rows=Object.entries(comps).slice(0,6).map(([k,v])=>`<div class="mini-score-row"><span>${escapeHtml(k)}</span><b>${escapeHtml(v)}</b></div>`).join('');
  const last=(session.dialogue||[]).slice(-3).map(d=>`<li><b>${escapeHtml(d.from||'-')}:</b> ${escapeHtml(d.text||'')}</li>`).join('');
  const memCount=(k)=>Array.isArray(memories[k])?memories[k].length:0;
  const thought = (role)=> thoughts?.[role]?.message || 'Standby. Menunggu perintah atau hasil scan baru.';
  const thoughtType = (role)=> thoughts?.[role]?.type || 'standby';
  agentBoard.innerHTML = `<div class="agent-live-head">
      <div><b>3 Role Agent GEMU v20</b><small>${session.active?'Terakhir diskusi: '+escapeHtml(session.last_time||'-'):'Agent siap; Watcher bisa berjalan dari cron.'}</small></div>
      <div class="agent-live-score">${score}/100</div>
    </div>
    <div class="agent-card v20-agent"><b>🧭 GEMU Sistem <em>${escapeHtml(ratings.system ?? 0)}%</em></b><span>Keputusan: ${escapeHtml(session.last_decision||'Belum ada keputusan.')} Memori: ${memCount('sistem')}</span><i>${escapeHtml(thought('GEMU Sistem'))}</i><small>${escapeHtml(thoughtType('GEMU Sistem'))}</small></div>
    <div class="agent-card v20-agent"><b>💬 GEMU Frontline <em>${escapeHtml(ratings.frontline ?? 0)}%</em></b><span>Komunikasi natural, UI/UX, ringkas, mode tamu. Memori: ${memCount('frontline')}</span><i>${escapeHtml(thought('GEMU Frontline'))}</i><small>${escapeHtml(thoughtType('GEMU Frontline'))}</small></div>
    <div class="agent-card v20-agent"><b>🛠️ GEMU Backend <em>${escapeHtml(ratings.backend ?? 0)}%</em></b><span>File, PHP/JS, security, backup, rollback, test. Memori: ${memCount('backend')}</span><i>${escapeHtml(thought('GEMU Backend'))}</i><small>${escapeHtml(thoughtType('GEMU Backend'))}</small></div>
    <div class="agent-card v20-agent"><b>👁️ Watcher Agent <em>proaktif</em></b><span>Scan berkala, backup cleanup, report cleanup, dan anomali file.</span><i>${escapeHtml(thought('Watcher Agent'))}</i><small>${escapeHtml(thoughtType('Watcher Agent'))}</small></div>
    ${rows?`<div class="agent-mini-scores">${rows}</div>`:''}
    ${last?`<div class="agent-last-talk"><b>Cuplikan obrolan terakhir</b><ol>${last}</ol></div>`:''}`;
}

function renderMemory(data){
  gemuCurrentBrain = data || {};
  const memory=data.memory||[]; const brain=data.brain||{}; const tasks=data.tasks||[]; const scans=data.scan_history||[]; const files=data.files||[]; const staged=data.staged_edits||{}; const autonomy=data.autonomy||{}; gemuAgentDecisions=data.agent_decisions||gemuAgentDecisions;
  if(scans.length && statusBox) renderScan({summary:scans[0].summary||{}, issues:scans[0].issues||[]});
  const stats=brain.stats||{}; const suggestions=data.suggestions||{}; const pending=suggestions.pending||[];
  memoryBox.innerHTML = `<b>Memori owner:</b> ${memory.length} catatan<br><b>Ilmu internet:</b> ${stats.web_count||0}<br><b>Pembelajaran tamu:</b> ${stats.public_count||0}<br><b>Analisis tersimpan:</b> ${stats.analysis_count||0}<br><b>Tugas update:</b> ${tasks.length}<br><b>Saran tertunda:</b> ${pending.length}<br><b>Draft edit pending:</b> ${(staged.pending||[]).length}<br><b>Keputusan agent pending:</b> ${(gemuAgentDecisions.pending||[]).length}<br><b>Mode mandiri:</b> ${autonomy.enabled?'aktif':'nonaktif'}<br><b>Riwayat scan:</b> ${scans.length}<hr>` +
    (brain.summaries||[]).slice(0,2).map(m=>`<div class="issue summary"><b>Ringkasan otak • ${escapeHtml(m.time||'')}</b><br>${escapeHtml(m.text||'')}</div>`).join('') +
    memory.slice(0,4).map(m=>`<div class="issue"><b>${escapeHtml(m.time||'')}</b><br>${escapeHtml(m.text||'')}</div>`).join('') +
    pending.slice(0,4).map(t=>`<div class="task"><b>Saran tertunda</b> • ${escapeHtml(t.time||'')}<br>${escapeHtml(t.title||'')}<br>${escapeHtml(t.detail||'')}</div>`).join('') +
    tasks.slice(0,4).map(t=>`<div class="task"><b>${escapeHtml(t.status||'draft')}</b> • ${escapeHtml(t.time||'')}<br>${escapeHtml(t.task||'')}<br>${(t.files||[]).slice(0,3).map(f=>`<code>${escapeHtml(f)}</code>`).join(' ')}</div>`).join('');
  renderAgentPanel(data.agent_session||{}, data.agent_memories||{}, data.agent_thoughts||{});
  renderActivity(data.activity_logs||[], [], data.agent_feed||[]);
  renderTerminal(data.activity_logs||[], [], data.agent_feed||[]);
  if(data.settings && memoryBox){ memoryBox.insertAdjacentHTML('beforeend', `<div class="task"><b>Setting GEMU</b> • ${escapeHtml(data.settings.answer_style||'-')}<br>${escapeHtml((data.settings.custom_prompt||'').slice(0,220))}</div>`); }
  renderFiles(files, data.file_storage || {});
  renderAutonomy(autonomy, staged);
  renderDraftDock(staged.pending||[], gemuAgentDecisions);
}

async function loadBrain(){
  try{ const data=await api('brain'); renderMemory(data); }catch(e){ memoryBox.textContent=friendlyError(e); }
}
async function loadActivity(){
  try{
    const data = await api('activity_logs');
    renderActivity(data.logs || [], data.idle_dialogue || [], data.agent_feed || []);
    renderTerminal(data.logs || [], data.idle_dialogue || [], data.agent_feed || []);
    if(data.agent_thoughts) renderAgentPanel(gemuCurrentBrain?.agent_session || {}, gemuCurrentBrain?.agent_memories || {}, data.agent_thoughts);
  }catch(e){}
}


async function loadHistory(){
  try{
    const data=await api('chat_history'); const chat=data.chat||[];
    isLoadingHistory=true; chatLog.innerHTML='';
    chat.slice(-160).forEach(m=>{
      const who=m.who==='owner'?'owner':'gemu';
      addMsg(m.text||'',who,'',false);
      if(who==='gemu' && m.meta?.agent_review) addHtmlMsg(buildAgentReviewHtml(m.meta.agent_review),'gemu','',false);
    });
    isLoadingHistory=false;
    if(!chat.length) addMsg('Halo Darma 😄 Aku GEMU. Aku bisa paham prompt sederhana, membuat analisis, menyiapkan draft program, belajar, scan, dan memberi saran. Website baru berubah setelah Darma klik ✓ approve.', 'gemu', '', false);
  }catch(e){ addMsg('Riwayat chat belum bisa dimuat: '+friendlyError(e),'gemu','',false); }
}

async function openSettings(){
  const t=thinking('Aku buka setting/prompt khusus GEMU... ⚙️');
  try{
    const data=await api('settings_get');
    t.remove();
    const s=data.settings||{};
    if(settingsPrompt) settingsPrompt.value=s.custom_prompt||'';
    if(settingsStyle) settingsStyle.value=s.answer_style||'ringkas_rapi';
    if(settingsLocalFirst) settingsLocalFirst.checked=!!s.local_first;
    if(settingsBlockStack) settingsBlockStack.checked=!!s.block_edit_stacking;
    if(settingsSecurityLevel) settingsSecurityLevel.value=s.security_audit_level||'complex';
    settingsModal?.removeAttribute('hidden');
  }catch(e){ t.remove(); addMsg('Setting gagal dibuka: '+friendlyError(e)); }
}
async function saveSettings(){
  const settings={
    custom_prompt:settingsPrompt?.value||'',
    answer_style:settingsStyle?.value||'ringkas_rapi',
    local_first:!!settingsLocalFirst?.checked,
    block_edit_stacking:!!settingsBlockStack?.checked,
    security_audit_level:settingsSecurityLevel?.value||'complex',
    owner_approval_required:true
  };
  const t=thinking('Aku simpan setting khusus GEMU... 💾');
  try{
    const data=await api('settings_save',{settings});
    t.remove(); settingsModal?.setAttribute('hidden',''); await loadBrain(); addMsg(data.message||'Setting GEMU tersimpan ✅');
  }catch(e){ t.remove(); addMsg('Setting gagal disimpan: '+friendlyError(e)); }
}
async function runSecurityAudit(){
  if(gemuEditBusy){ addMsg('Tunggu proses edit/approve yang sedang berjalan selesai dulu ya, Darma. Biar tidak numpuk.'); return; }
  setEditBusy(true,'SECURITY-AUDIT GEMU memeriksa celah SQL, XSS, upload, header, dan command berisiko.');
  const t=thinking('Aku audit keamanan kompleks secara lokal: SQL injection, XSS, upload, header, secret, dan fungsi server berisiko... 🛡️');
  try{
    const data=await api('security_audit');
    t.remove(); await loadBrain();
    addHtmlMsg(buildSecuritySummaryHtml(data));
  }catch(e){ t.remove(); addMsg('Security audit gagal: '+friendlyError(e)); }
  finally{ setEditBusy(false); }
}

async function runScan(){
  const t=thinking('Siap, aku scan website + backup otomatis dulu ya, Darma 🛡️🔎');
  try{
    const data=await api('scan');
    t.remove(); renderScan(data); await loadBrain();
    const b=data.summary?.backup || {};
    addMsg(`Scan selesai ✅\nBackup otomatis: ${b.path || '-'} (${b.files || 0} file)\nFile dicek: ${data.summary.checked_files}\nTotal temuan: ${data.summary.issues_total}\nBahaya: ${data.summary.danger_total}\nLog aktivitas tersimpan 1 jam.`);
  }catch(e){ t.remove(); addMsg('Scan gagal: '+friendlyError(e)); }
}
async function runAgentDialogue(text){
  if(gemuEditBusy){ addMsg('Tunggu proses edit/apply yang sedang berjalan selesai dulu, Darma. Diskusi agent aku tahan supaya tidak numpuk.'); return; }
  setEditBusy(true,'MULTI-AGENT GEMU Sistem, Frontline, dan Backend berdiskusi lalu memberi skor.');
  const t=thinking('Aku mulai diskusi 3 role: Frontline pahami bahasa, Backend cek teknis, Sistem hitung skor dan keputusan... 🧭💬🛠️');
  try{
    const data=await api('agent_dialogue',{question:text});
    t.remove();
    await loadBrain();
    addHtmlMsg(buildSmartSummaryHtml(data,'Diskusi 3 Role Agent'));
    if(data.message) addMsg(data.message);
  }catch(e){ t.remove(); addMsg('Diskusi agent gagal: '+friendlyError(e)); }
  finally{ setEditBusy(false); }
}

async function runDeepAnalysis(text){
  const t=thinking('Aku analisis aman: backup, scan, cocokkan file, simpan rencana, dan kalau perlu siapkan draft edit tanpa menulis file dulu... 🧠🛡️');
  try{
    const data=await api('analyze',{question:text});
    t.remove();
    if(data.summary) renderScan({summary:data.summary, issues:data.issues||[]});
    await loadBrain();
    addHtmlMsg(buildSmartSummaryHtml(data,'Ringkasan Analisis'));
    if(data.message && !data.staged_edits?.length) addMsg(data.message || 'Analisis selesai ✅');
  }catch(e){ t.remove(); addMsg('Analisis gagal: '+friendlyError(e)); }
}

async function runSmartEdit(text){
  if(gemuEditBusy){ addMsg('Tunggu proses edit yang sedang berjalan selesai dulu ya, Darma. Aku kunci sementara supaya draft tidak numpuk.'); return; }
  setEditBusy(true,'SMART-EDIT GEMU membaca prompt, memilih file, test otomatis, lalu menunggu ✓/× owner.');
  const t=thinking('Aku pahami prompt sederhana ini, lalu aku tentukan file, analisis risiko, dan buat draft program bila aman... 🧠🧩');
  try{
    const data=await api('smart_edit',{question:text});
    t.remove();
    if(data.summary) renderScan({summary:data.summary, issues:data.issues||[]});
    await loadBrain();
    addHtmlMsg(buildSmartSummaryHtml(data,'Ringkasan Smart Edit'));
    if(data.blocked_by_pending){ addMsg('Aku belum membuat draft baru karena masih ada draft pending. Selesaikan dengan tombol ✓ atau × di bawah chat dulu.'); await runStagedEdits(); return; }
    const score=Number(data.agent_review?.score || data.task?.agent_review?.score || 0);
    const decision=data.agent_review?.system?.decision_text || data.task?.agent_review?.system?.decision_text || '';
    if(!data.staged_edits?.length && !data.blocked_by_pending){
      addMsg(score<80 ? `Diskusi agent selesai. Skor akhir ${score}/100, jadi belum aku jadikan draft edit. Keputusan: ${decision || 'analisis dulu'}.` : 'Diskusi agent selesai. Belum ada patch teknis yang perlu dibuat, jadi aku simpan sebagai laporan/saran.');
    }
    if(data.staged_edits?.length) addHtmlMsg(processCard('Proses Smart Edit', ['Prompt sederhana dibaca dan diklasifikasi Frontline.', 'Backend memilih file target dan membuat patch/draft.', 'Sistem memberi skor 0–100 dan menahan jika <80.', 'Test otomatis dijalankan sebelum draft muncul.', 'Website belum berubah sebelum Darma klik ✓.'], 'ok'));
  }catch(e){
    t.remove();
    addMsg('Smart edit gagal: '+friendlyError(e));
  }finally{ setEditBusy(false); }
}
function isAgentDialogueCommand(text){
  return /\b(3\s*role|tiga\s*role|agent|agen|frontline|backend|sistem|diskusi|ngobrol|rating|skor|score)\b/i.test(text)
    && /\b(gemu|ai|role|agent|frontline|backend|sistem|diskusi|ngobrol)\b/i.test(text);
}
function isSmartEditCommand(text){
  return /(gemu\s+tolong|tolong|buatkan|buat|tambahkan|tambah|edit|ubah|perbaiki|fix|fitur|halaman|website|aktivitas\s*harian|lebih\s+menarik|rapihkan|rapikan|modern|cantik|aesthetic)/i.test(text);
}
function isDeepAnalysisOnlyCommand(text){
  if(isAgentDialogueCommand(text)) return false;
  return /(analisis|cek|diagnosa|diagnose|scan detail|bedah)/i.test(text);
}
async function uploadSelectedFiles(files){
  if(!files || !files.length) return;
  const total=[...files].reduce((n,f)=>n+f.size,0);
  const t=thinking(`Aku upload ${files.length} file (${(total/1024/1024).toFixed(2)} MB) ke file brain GEMU... 📦`);
  try{
    const data=await apiUpload(files);
    t.remove(); await loadBrain();
    const ok=(data.files||[]).filter(f=>f.ok).length;
    const failed=(data.files||[]).filter(f=>!f.ok).length;
    addMsg(`Upload selesai ✅\nBerhasil: ${ok}\nGagal: ${failed}\nStorage: ${((data.total_storage||0)/1024/1024).toFixed(2)} MB / 1GB\nFile yang berhasil sudah masuk memori tanpa perlu konfirmasi tambahan.`);
  }catch(e){ t.remove(); addMsg('Upload gagal: '+friendlyError(e)); }
}
async function runInternetLearn(query){
  const t=thinking('Aku tanya “kenapa”, cari jawaban internet, lalu simpan intinya ke otak GEMU... 🔎🧠');
  try{
    const data=await api('internet_learn',{query});
    t.remove(); await loadBrain();
    addMsg(`${data.message}${data.url?'\n\nSumber/pencarian: '+data.url:''}`);
    if(data.url) window.open(data.url,'_blank','noopener');
  }catch(e){ t.remove(); addMsg('Belajar internet gagal: '+friendlyError(e)); }
}
async function runDigest(force=false){
  const t=thinking('Aku kumpulkan saran, lalu kalau belum ada draft aku buatkan draft laporan agar tombol ✓/× langsung muncul... 📝');
  try{
    const data=await api('suggestions_digest',{force});
    t.remove(); await loadBrain();
    if(data.due===false){
      const min=Math.ceil((data.next_in_seconds||0)/60);
      addMsg(`Belum waktunya laporan otomatis. Saran berikutnya sekitar ${min} menit lagi.`);
    }else{
      let msg=data.message || 'Belum ada saran baru.';
      if(data.staged_edit){
        msg += `

Draft saran siap:
- ID ${data.staged_edit.id || '-'}
- Path ${data.staged_edit.path || '-'}

Tombol ✓ Setujui dan × Tolak sudah muncul di bawah chat pada Reaksi Draft bagian Mode Mandiri & Draft Edit.`;
      }
      addHtmlMsg(buildDigestSummaryHtml(data));
      if(data.staged_edit) await runStagedEdits();
    }
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
}

async function runAutonomy(force=true){
  const t=thinking('Mode mandiri GEMU berjalan: cek website, kumpulkan saran, dan tetap tidak menulis file tanpa Darma... 🧠⚙️');
  try{
    const data=await api('autonomous_cycle',{force});
    t.remove(); await loadBrain();
    addMsg(`${data.ran?'Mode mandiri selesai ✅':'Mode mandiri tidak dijalankan'}\n${data.message || ''}`);
  }catch(e){ t.remove(); addMsg('Mode mandiri gagal: '+friendlyError(e)); }
}
async function runStagedEdits(){
  const t=thinking('Aku buka draft edit yang menunggu keputusan Darma... 🧩');
  try{
    const data=await api('staged_edits');
    t.remove();
    renderAutonomy(data.autonomy||{}, data.staged_edits||{});
    const pending=(data.staged_edits?.pending||[]);
    addMsg(pending.length ? `Ada ${pending.length} draft edit menunggu keputusan. Tombol ✓ dan × tersedia tepat di bawah chat, dan juga tetap ada di bawah chat pada Reaksi Draft.` : 'Belum ada draft edit pending.');
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
}

async function runFolderOpen(query){
  const t=thinking('Aku cari dan buka folder lokal yang cocok. Ini bukan internet dan bukan Smart Edit... 📁');
  try{
    const data=await api('folder_open',{query});
    t.remove(); await loadBrain();
    addMsg(data.message || 'Folder selesai dicek.');
  }catch(e){ t.remove(); addMsg('Buka folder gagal: '+friendlyError(e)); }
}
async function runStorageAudit(query='audit storage'){
  const t=thinking('Aku audit file lokal, storage, dan backup. Ini bukan pencarian Wikipedia... 📦🔎');
  try{
    const data=await api('storage_audit',{query});
    t.remove(); await loadBrain();
    addMsg(data.message || 'Audit storage selesai.');
  }catch(e){ t.remove(); addMsg('Audit storage gagal: '+friendlyError(e)); }
}
async function stageEditFromChat(path, content, reason='Draft edit dari chat owner'){
  if(gemuEditBusy){ addMsg('Tunggu proses edit yang sedang berjalan selesai dulu, Darma.'); return; }
  setEditBusy(true,'STAGED-EDIT GEMU menyimpan draft manual tanpa menulis website.');
  const t=thinking(`Aku simpan perubahan ${path} sebagai draft edit dulu. File website belum disentuh... 🧩`);
  try{
    const data=await api('stage_edit',{path,content,reason});
    t.remove(); await loadBrain();
    const e=data.staged_edit||{};
    addMsg(`${data.message}\nID draft: ${e.id || '-'}\nPath: ${e.path || path}\nTest otomatis: ${e.quality?.status || 'tested'}\nUntuk menerapkan: klik tombol ✓ Setujui di bawah chat pada Reaksi Draft. Untuk menolak: klik × Tolak.`);
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
  finally{ setEditBusy(false); }
}
async function applyStagedEdit(id){
  if(gemuEditBusy){ addMsg('Tunggu proses apply yang sedang berjalan selesai dulu ya, Darma.'); return; }
  setEditBusy(true,'APPLY GEMU memvalidasi token, test ulang, backup, lalu menulis file.');
  const t=thinking(`✓ Owner Darma menyetujui draft ${id}. Aku test ulang, backup, lalu apply... 🛡️`);
  try{
    const data=await api('apply_staged_edit',{id,approved:true});
    t.remove(); await loadBrain();
    const steps=data.staged_edit?.process || ['Token owner valid.', 'Test otomatis ulang selesai.', 'Backup dibuat.', 'File diterapkan.'];
    addHtmlMsg(processCard('Draft berhasil diterapkan', steps, 'ok'));
    addMsg(`${data.message}
Path: ${data.staged_edit?.path || '-'} ✅`);
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
  finally{ setEditBusy(false); }
}
async function rejectStagedEdit(id){
  if(gemuEditBusy){ addMsg('Tunggu proses lain selesai dulu ya, Darma.'); return; }
  setEditBusy(true,'REJECT GEMU membuang draft tanpa mengubah website.');
  const t=thinking(`× Owner Darma menolak draft ${id}. Aku pindahkan ke riwayat rejected...`);
  try{
    const data=await api('reject_staged_edit',{id,reason:'Ditolak lewat tombol × owner.'});
    t.remove(); await loadBrain();
    addHtmlMsg(processCard('Draft ditolak', ['Website tidak diubah.', 'Draft dipindahkan ke riwayat rejected.', 'GEMU boleh membuat draft baru setelah ini.'], 'warn'));
    addMsg(`${data.message}
ID: ${id}`);
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
  finally{ setEditBusy(false); }
}


async function approveAgentDecision(id){
  if(gemuEditBusy){ addMsg('Tunggu proses lain selesai dulu ya, Darma.'); return; }
  setEditBusy(true,'APPROVE AGENT GEMU menyimpan keputusan owner dan membuka langkah berikutnya.');
  const t=thinking(`✓ Owner Darma menyetujui keputusan agent ${id}. Aku simpan dan sinkronkan panel...`);
  try{
    const data=await api('approve_agent_decision',{id});
    t.remove(); await loadBrain();
    addHtmlMsg(processCard('Keputusan agent disetujui', ['Arahan disimpan ke memori analisis.', 'Website belum diubah otomatis.', 'Jika nanti ada patch file, GEMU tetap membuat staged edit baru dan menunggu ✓ owner.'], 'ok'));
    addMsg(data.message || 'Keputusan agent disetujui.');
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
  finally{ setEditBusy(false); }
}
async function rejectAgentDecision(id){
  if(gemuEditBusy){ addMsg('Tunggu proses lain selesai dulu ya, Darma.'); return; }
  setEditBusy(true,'REJECT AGENT GEMU membatalkan rencana tanpa mengubah website.');
  const t=thinking(`× Owner Darma menolak keputusan agent ${id}. Aku batalkan tanpa mengubah website...`);
  try{
    const data=await api('reject_agent_decision',{id,reason:'Ditolak lewat tombol × owner.'});
    t.remove(); await loadBrain();
    addHtmlMsg(processCard('Keputusan agent ditolak', ['Rencana dibatalkan.', 'Website tidak diubah.', 'GEMU boleh diskusi ulang jika Darma memberi arahan baru.'], 'warn'));
    addMsg(data.message || 'Keputusan agent ditolak.');
  }catch(e){ t.remove(); addMsg(friendlyError(e)); }
  finally{ setEditBusy(false); }
}

async function handleCommand(text){
  addMsg(text,'owner');
  const lower=text.toLowerCase().trim();

  if(/^(home|kembali|beranda)$/i.test(lower)){ window.location.href='../'; return; }

  // PRIORITAS TERTINGGI: jika owner menulis "ingat ...", GEMU wajib menyimpan memori, bukan audit, bukan search, bukan smart edit.
  if(/\bingat(?:an)?\b/i.test(text)){
    const note=text.replace(/^\s*(gemu|tolong|please)?\s*(ingat(?:an|kan)?|simpan\s+ingatan|buat\s+ingatan|tambahkan\s+ingatan)\s*[:,-]?\s*/i,'').trim() || text.trim();
    if(!note){ addMsg('Tulis isi ingatan setelah kata “ingat”, Darma.'); return; }
    const t=thinking('Aku simpan ini sebagai memori GEMU, bukan audit/storage... 🧠');
    try{ await api('memory_add',{note}); t.remove(); await loadBrain(); addMsg('Siap, Darma. Ini sudah masuk memori GEMU tanpa konfirmasi tambahan ✅'); }catch(e){t.remove();addMsg(friendlyError(e))}
    return;
  }

  if(/^(scan|cek bug|scan website|cek website)$/i.test(lower)) return runScan();
  if(/^(hapus chat|bersihkan chat|clear chat)$/i.test(lower)) return clearOwnerChat();
  if(/^(log|logs|aktivitas)$/i.test(lower)){ await loadActivity(); addMsg('Log aktivitas sudah aku tampilkan. Log ini otomatis hanya menyimpan aktivitas 1 jam terakhir.'); return; }
  if(/^(laporan saran|saran|digest)$/i.test(lower)) return runDigest(true);
  if(/^(mode mandiri|mandiri|aktif mandiri|autonomous)$/i.test(lower)) return runAutonomy(true);
  if(/^(draft edit|staged edit|edit pending)$/i.test(lower)) return runStagedEdits();
  if(/\b(folder|direktori)\b/i.test(lower) && /\b(buka|lihat|cek|cari|daftar|list)\b/i.test(lower)) return runFolderOpen(text);
  if(/(keamanan|security|celah|hacker|sql injection|xss|csrf|audit aman|audit keamanan)/i.test(lower)) return runSecurityAudit();
  if(/(file|berkas|storage|penyimpanan|disk|kapasitas|ukuran|size|backup|cadangan).*(besar|paling|mana|berapa|penuh|audit|cek|lihat)|^(audit storage|cek storage|file terbesar|backup terbesar)$/i.test(lower)) return runStorageAudit(text);
  if(/^(otak|memori|brain|memory)$/i.test(lower)){
    const t=thinking('Aku buka memori, file brain, log, dan daftar tugas... 🧠');
    try{ const data=await api('brain'); t.remove(); renderMemory(data); addMsg(`Otak GEMU aktif ✅\nMemori owner: ${(data.memory||[]).length}\nIlmu internet: ${(data.brain?.stats?.web_count)||0}\nFile brain: ${(data.files||[]).length}\nSaran tertunda: ${(data.suggestions?.pending||[]).length}`); }catch(e){t.remove();addMsg(friendlyError(e))}
    return;
  }

  if(/^belajar internet\s+/i.test(text) || /^cari\s+(di\s+)?internet\s+/i.test(text) || /^cari\s+online\s+/i.test(text) || /^google\s+/i.test(text) || /^search\s+web\s+/i.test(text)){
    const query=text.replace(/^(belajar internet|cari\s+(di\s+)?internet|cari\s+online|google|search\s+web)\s+/i,'').trim();
    return runInternetLearn(query || text);
  }

  if(/^rencana\s+update\s+/i.test(text) || /^tugas\s+/i.test(text)){
    const task=text.replace(/^rencana\s+update\s+/i,'').replace(/^tugas\s+/i,'').trim();
    const t=thinking('Aku jadikan ini draft tugas update dan gabungkan ke laporan saran 2 jam... 📝');
    try{ const data=await api('task_add',{task}); t.remove(); await loadBrain(); addMsg(data.message || 'Tugas update tersimpan.'); }catch(e){t.remove();addMsg(friendlyError(e))}
    return;
  }

  const readMatch=text.match(/^baca\s+file\s+(.+)$/i);
  if(readMatch){
    const path=readMatch[1].trim();
    const t=thinking(`Aku baca file ${path} dulu... 📄`);
    try{ const data=await api('file_read',{path}); t.remove(); addMsg(`Isi file ${data.path} (${data.size} bytes):\n\n${data.content.slice(0,6500)}${data.content.length>6500?'\n\n...dipotong supaya browser tidak berat.':''}`); await loadBrain(); }catch(e){t.remove();addMsg(friendlyError(e))}
    return;
  }


  const applyMatch=text.match(/^terapkan\s+edit\s+([a-f0-9]+)$/i);
  if(applyMatch){ addMsg('Sekarang approve memakai tombol ✓ Setujui di bawah chat pada Reaksi Draft. Tidak perlu ketik konfirmasi manual lagi.'); return runStagedEdits(); }

  const rejectMatch=text.match(/^(tolak|hapus|buang)\s+edit\s+([a-f0-9]+)$/i);
  if(rejectMatch) return rejectStagedEdit(rejectMatch[2]);

  const writeMatch=text.match(/^tulis\s+file\s+([^:]+)\s*:::\s*([\s\S]+?)\s*:::?\s*$/i);
  if(writeMatch){
    const path=writeMatch[1].trim(); const content=writeMatch[2];
    return stageEditFromChat(path, content, 'Draft edit dari perintah tulis file owner. Menunggu tombol ✓ Darma sebelum diterapkan.');
  }

  if(isAgentDialogueCommand(text)) return runAgentDialogue(text);
  if(isDeepAnalysisOnlyCommand(text)) return runDeepAnalysis(text);
  if(isSmartEditCommand(text)) return runSmartEdit(text);

  const t=thinking('Aku jawab singkat pakai otak GEMU... 🧠');
  try{ const data=await api('owner_reply',{message:text}); t.remove(); await loadBrain(); addMsg(data.message || 'Siap.'); if(data.url) window.open(data.url,'_blank','noopener'); }catch(e){t.remove();addMsg(friendlyError(e))}
}
async function clearOwnerChat(){
  const ok=confirm('Bersihkan chat owner? Otak, memori, file, dan ringkasan tidak akan dihapus.');
  if(!ok) return;
  try{ const data=await api('chat_clear'); chatLog.innerHTML=''; addMsg(data.message,'gemu','',false); }catch(e){ addMsg(friendlyError(e)); }
}

chatForm?.addEventListener('submit', e=>{e.preventDefault(); const text=chatInput.value.trim(); if(!text)return; chatInput.value=''; autoResizeInput(); handleCommand(text);});
document.querySelectorAll('.action-card').forEach(btn=>btn.addEventListener('click',()=>{
  const a=btn.dataset.action;
  if(a==='scan') runScan();
  if(a==='brain') handleCommand('otak');
  if(a==='memory') { chatInput.value='ingat '; chatInput.focus(); }
  if(a==='voice') voiceBtn?.click();
  if(a==='home') window.location.href='../';
  if(a==='upload') fileInput?.click();
  if(a==='digest') runDigest(true);
  if(a==='autonomy') runAutonomy(true);
  if(a==='smart') { chatInput.value='Gemu perbaiki navbar dan buat menu burger lebih aman'; chatInput.focus(); }
  if(a==='settings') openSettings();
  if(a==='security') runSecurityAudit();
  if(a==='staged') runStagedEdits();
  if(a==='clear') clearOwnerChat();
}));
speakToggle?.addEventListener('click',()=>{speakOn=!speakOn; speakToggle.textContent=speakOn?'🔊 Suara: ON':'🔇 Suara: OFF'; if(!speakOn && 'speechSynthesis' in window) speechSynthesis.cancel();});
uploadBtn?.addEventListener('click',()=>fileInput?.click());
fileInput?.addEventListener('change',()=>{uploadSelectedFiles(fileInput.files); fileInput.value='';});
clearChatBtn?.addEventListener('click',clearOwnerChat);
digestBtn?.addEventListener('click',()=>runDigest(true));
settingsBtn?.addEventListener('click',openSettings);
securityBtn?.addEventListener('click',runSecurityAudit);
settingsCloseBtn?.addEventListener('click',()=>settingsModal?.setAttribute('hidden',''));
settingsSaveBtn?.addEventListener('click',saveSettings);
settingsModal?.addEventListener('click',e=>{ if(e.target===settingsModal) settingsModal.setAttribute('hidden',''); });

voiceBtn?.addEventListener('click',()=>{
  const Rec=window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!Rec){ addMsg('Browser ini belum mendukung voice command. Coba pakai Chrome desktop/mobile ya 🎙️'); return; }
  const rec=new Rec(); rec.lang='id-ID'; rec.interimResults=false; rec.maxAlternatives=1;
  addMsg('Aku dengarkan perintah suara sekarang... 🎙️');
  rec.onresult=e=>{ chatInput.value=e.results[0][0].transcript; chatForm.requestSubmit(); };
  rec.onerror=e=>addMsg('Voice command gagal: '+(e.error||'unknown'));
  rec.start();
});


function handleDraftActionClick(e){
  const apply=e.target.closest('.apply-edit');
  const reject=e.target.closest('.reject-edit');
  const approveDecision=e.target.closest('.approve-decision');
  const rejectDecision=e.target.closest('.reject-decision');
  if(apply?.dataset.id) applyStagedEdit(apply.dataset.id);
  if(reject?.dataset.id) rejectStagedEdit(reject.dataset.id);
  if(approveDecision?.dataset.id) approveAgentDecision(approveDecision.dataset.id);
  if(rejectDecision?.dataset.id) rejectAgentDecision(rejectDecision.dataset.id);
}
autonomyBox?.addEventListener('click', handleDraftActionClick);
draftDock?.addEventListener('click', handleDraftActionClick);

(async function boot(){
  await loadHistory();
  await loadBrain();
  await loadActivity();
  setInterval(loadActivity, 5000);
})();
