<?php
session_start();
// Kategori statis karena data di load AJAX
$cats = ['Orang', 'Tempat', 'Benda', 'Kata Kerja', 'Kata Sifat', 'Waktu', 'Angka', 'Lain-lain'];
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kotoba N5 - GemuYokai Nihongo</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+JP:wght@500;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0a;
      --panel: #111111;
      --card: rgba(255, 255, 255, 0.03);
      --line: rgba(255, 255, 255, 0.1);
      --text: #f5f1ea;
      --muted: #a3a3a3;
      --sakura: #F472B6;
      --orange: #F74E09;
      --radius: 24px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: var(--bg); color: var(--text); font-family: Inter, sans-serif;
      overflow-x: hidden;
    }
    .jp { font-family: 'Noto Sans JP', sans-serif; }

    /* Header */
    .top { position: sticky; top: 0; background: rgba(10,10,10,0.85); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); z-index: 50; }
    .nav { width: min(1120px, calc(100% - 32px)); margin: auto; min-height: 72px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; text-decoration: none; color: inherit; }
    .mark { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--sakura), var(--orange)); color: white; display: grid; place-items: center; font-size: 20px; }
    .btn-back { border: 1px solid var(--line); background: rgba(255,255,255,0.05); color: var(--text); border-radius: 99px; padding: 10px 16px; text-decoration: none; font-weight: 600; font-size: 14px; transition: 0.2s; }
    .btn-back:hover { background: rgba(255,255,255,0.1); }

    /* Hero */
    .hero { width: min(1120px, calc(100% - 32px)); margin: 48px auto; text-align: center; }
    .hero h1 { font-size: clamp(36px, 5vw, 64px); line-height: 1.1; margin: 0 0 16px; letter-spacing: -0.04em; }
    .grad-text { background: linear-gradient(135deg, var(--sakura), var(--orange)); -webkit-background-clip: text; color: transparent; }
    .hero p { color: var(--muted); font-size: 18px; max-width: 600px; margin: 0 auto 32px; line-height: 1.6; }

    /* Test Button */
    .test-cta { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, var(--sakura), var(--orange)); color: white; border: none; padding: 14px 28px; border-radius: 99px; font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px rgba(247, 78, 9, 0.2); }
    .test-cta:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(247, 78, 9, 0.3); }

    /* Filters */
    .filters { width: min(1120px, calc(100% - 32px)); margin: 0 auto 32px; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--line); color: var(--muted); padding: 8px 16px; border-radius: 99px; cursor: pointer; font-weight: 600; font-size: 14px; transition: 0.2s; }
    .filter-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }
    .filter-btn.active { background: rgba(244, 114, 182, 0.15); border-color: var(--sakura); color: var(--sakura); }

    /* Loader */
    .loader-container { width: 100%; display: flex; justify-content: center; padding: 48px 0; }
    .loader { border: 4px solid rgba(255,255,255,0.1); border-left-color: var(--sakura); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Grid & Cards */
    .grid { width: min(1120px, calc(100% - 32px)); margin: 0 auto 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px; cursor: pointer; transition: 0.3s; position: relative; overflow: hidden; }
    .card:hover { transform: translateY(-4px); border-color: rgba(244, 114, 182, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .card-cat { position: absolute; top: 16px; right: 16px; font-size: 12px; font-weight: 700; color: var(--orange); background: rgba(247, 78, 9, 0.1); padding: 4px 10px; border-radius: 99px; }
    .card .jp-text { font-size: 36px; font-weight: 900; margin-bottom: 4px; line-height: 1; }
    .card .kana-text { color: var(--sakura); font-size: 14px; font-weight: 700; margin-bottom: 12px; }
    .card .id-text { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
    .card .romaji-text { font-size: 13px; color: var(--muted); }

    /* Card Expanded Content */
    .card-detail { display: none; margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--line); animation: fadeIn 0.3s ease; }
    .card.expanded .card-detail { display: block; }
    .card-detail p { margin: 0 0 12px; font-size: 13px; color: #cbd5e1; line-height: 1.5; }
    .card-detail .ex { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; }
    .card-detail .ex-jp { font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #fff; }
    .card-detail .ex-id { font-size: 13px; color: var(--muted); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    /* Quiz Modal */
    .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: 0.3s; backdrop-filter: blur(10px); }
    .modal.active { opacity: 1; pointer-events: auto; }
    .modal-header { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); }
    .modal-close { background: none; border: none; color: var(--muted); font-size: 32px; cursor: pointer; line-height: 1; }
    .modal-close:hover { color: white; }
    .modal-body { flex: 1; overflow-y: auto; padding: 40px 20px; }
    .quiz-container { max-width: 600px; margin: 0 auto; }

    /* Quiz State */
    .quiz-screen { display: none; animation: fadeIn 0.4s ease; }
    .quiz-screen.active { display: block; }

    .q-progress { font-size: 14px; color: var(--sakura); font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .q-text { font-size: 28px; font-weight: 800; margin-bottom: 32px; line-height: 1.4; }
    .q-text .highlight { color: var(--orange); }

    .options { display: grid; gap: 12px; }
    .option-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--line); padding: 16px 20px; border-radius: 16px; color: white; font-size: 16px; font-weight: 600; text-align: left; cursor: pointer; transition: 0.2s; }
    .option-btn:hover { background: rgba(255,255,255,0.1); border-color: var(--sakura); }
    .option-btn.correct { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #34d399; }
    .option-btn.wrong { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #f87171; }

    /* Essay Input */
    .essay-input { width: 100%; background: rgba(255,255,255,0.05); border: 2px solid var(--line); padding: 16px 20px; border-radius: 16px; color: white; font-size: 24px; font-family: 'Noto Sans JP', sans-serif; text-align: center; margin-bottom: 20px; outline: none; transition: 0.2s; }
    .essay-input:focus { border-color: var(--sakura); background: rgba(0,0,0,0.5); }

    /* Virtual Keyboard */
    .v-keyboard { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: #1a1a1a; padding: 12px; border-radius: 16px; border: 1px solid var(--line); }
    .v-key { background: #2a2a2a; border: 1px solid #333; color: white; padding: 12px 0; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; }
    .v-key:active { background: var(--sakura); }
    .v-key.wide { grid-column: span 2; background: #333; }

    .btn-submit { display: block; width: 100%; background: linear-gradient(135deg, var(--sakura), var(--orange)); color: white; border: none; padding: 16px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 16px; }

    /* Results */
    .result-score { font-size: 72px; font-weight: 900; background: linear-gradient(135deg, var(--sakura), var(--orange)); -webkit-background-clip: text; color: transparent; line-height: 1; margin-bottom: 8px; }
    .result-msg { font-size: 20px; margin-bottom: 32px; color: #e2e8f0; }
    .mistakes { text-align: left; background: rgba(255,255,255,0.02); border-radius: 16px; padding: 20px; border: 1px solid var(--line); margin-bottom: 32px; }
    .mistake-item { border-bottom: 1px solid var(--line); padding-bottom: 12px; margin-bottom: 12px; }
    .mistake-item:last-child { border: none; padding: 0; margin: 0; }
    .mistake-q { font-size: 14px; color: var(--muted); margin-bottom: 4px; }
    .mistake-a { font-size: 16px; font-weight: bold; color: #10b981; }
    .mistake-u { font-size: 14px; color: #ef4444; text-decoration: line-through; margin-left: 8px; }
  </style>
</head>
<body>

<header class="top">
  <div class="nav">
    <a href="index.php" class="brand">
      <div class="mark jp">語</div>
      <div>Kotoba N5<br><small style="color:var(--muted);font-size:12px;font-weight:600;">GemuYokai Nihongo</small></div>
    </a>
    <a href="index.php" class="btn-back">Kembali</a>
  </div>
</header>

<main>
  <section class="hero">
    <h1>Kosakata N5 <span class="grad-text">Lengkap.</span></h1>
    <p>Kosakata dasar esensial untuk persiapan JLPT N5. Pelajari cara baca, arti, dan contoh penggunaannya dalam kalimat.</p>
    <button class="test-cta" id="startTestBtn" style="display:none;">🎯 Mulai Test N5</button>
  </section>

  <div class="filters" id="filters" style="display:none;">
    <button class="filter-btn active" data-cat="all">Semua Kata</button>
    <?php foreach($cats as $cat): ?>
      <button class="filter-btn" data-cat="<?= htmlspecialchars($cat) ?>"><?= htmlspecialchars($cat) ?></button>
    <?php endforeach; ?>
  </div>

  <div class="loader-container" id="loader">
    <div class="loader"></div>
  </div>

  <div class="grid" id="grid">
    <!-- Populated by JS -->
  </div>
</main>

<!-- QUIZ MODAL -->
<div class="modal" id="quizModal">
  <div class="modal-header">
    <div style="font-weight: 800; font-size: 18px;">JLPT N5 Kotoba Test</div>
    <button class="modal-close" id="closeQuizBtn">&times;</button>
  </div>
  <div class="modal-body">
    <div class="quiz-container">

      <!-- Screen 1: Intro -->
      <div class="quiz-screen active" id="screenIntro" style="text-align: center;">
        <h2 style="font-size: 32px; margin-bottom: 16px;">Format Ujian</h2>
        <p style="color: var(--muted); margin-bottom: 32px; line-height: 1.6;">Test terdiri dari 15 soal:<br>10 Pilihan Ganda (Arti & Cara Baca)<br>5 Soal Esai (Mengetik Hiragana)</p>
        <button class="btn-submit" id="beginQuizBtn">Mulai Sekarang</button>
      </div>

      <!-- Screen 2: MCQ -->
      <div class="quiz-screen" id="screenMcq">
        <div class="q-progress" id="mcqProgress">Soal 1 / 10</div>
        <div class="q-text" id="mcqText">Loading...</div>
        <div class="options" id="mcqOptions"></div>
      </div>

      <!-- Screen 3: Essay -->
      <div class="quiz-screen" id="screenEssay">
        <div class="q-progress" id="essayProgress">Soal Esai 1 / 5</div>
        <div class="q-text" id="essayText">Tuliskan romaji berikut dalam Hiragana: <span class="highlight jp" id="essayRomaji"></span></div>
        <input type="text" class="essay-input jp" id="essayInput" placeholder="Ketik disini..." readonly>

        <div class="v-keyboard" id="keyboard">
          <!-- Populated by JS -->
        </div>

        <button class="btn-submit" id="essaySubmitBtn">Jawab</button>
      </div>

      <!-- Screen 4: Results -->
      <div class="quiz-screen" id="screenResult" style="text-align: center;">
        <div style="font-size: 16px; color: var(--sakura); font-weight: 700; margin-bottom: 8px;">HASIL TEST</div>
        <div class="result-score" id="finalScore">0/15</div>
        <div class="result-msg" id="finalMsg"></div>

        <div class="mistakes" id="mistakesList" style="display:none;">
          <div style="font-weight: bold; margin-bottom: 16px; color: white;">Review Kesalahan:</div>
          <div id="mistakesContainer"></div>
        </div>

        <button class="btn-submit" id="retryBtn">Ulangi Test</button>
      </div>

    </div>
  </div>
</div>

<script>
  let words = [];

  // Fetch words via AJAX
  fetch('data/kotoba_n5.json')
    .then(response => response.json())
    .then(data => {
      words = data;
      document.getElementById('loader').style.display = 'none';
      document.getElementById('filters').style.display = 'flex';
      document.getElementById('startTestBtn').style.display = 'inline-flex';
      renderGrid(words);
    })
    .catch(error => {
      console.error('Error fetching words:', error);
      document.getElementById('loader').innerHTML = '<p style="color:var(--orange)">Gagal memuat data kosakata.</p>';
    });

  function escapeHtml(unsafe) {
      return unsafe
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
   }

  function renderGrid(data) {
    const grid = document.getElementById('grid');
    grid.innerHTML = data.map(w => `
      <div class="card" data-cat="${escapeHtml(w.cat)}">
        <div class="card-cat">${escapeHtml(w.cat)}</div>
        <div class="jp-text jp">${escapeHtml(w.jp)}</div>
        <div class="kana-text jp">${escapeHtml(w.kana)}</div>
        <div class="id-text">${escapeHtml(w.id)}</div>
        <div class="romaji-text">${escapeHtml(w.romaji)}</div>

        <div class="card-detail">
          <p><strong>Penggunaan:</strong> ${escapeHtml(w.usage || '-')}</p>
          <div class="ex">
            <div class="ex-jp jp">${escapeHtml(w.ex_jp || '-')}</div>
            <div class="ex-id">${escapeHtml(w.ex_id || '-')}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Add click listeners to newly rendered cards
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('expanded');
      });
    });
  }

  // Filter functionality
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');

      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // QUIZ LOGIC
  const modal = document.getElementById('quizModal');
  const startBtn = document.getElementById('startTestBtn');
  const closeBtn = document.getElementById('closeQuizBtn');
  const screens = {
    intro: document.getElementById('screenIntro'),
    mcq: document.getElementById('screenMcq'),
    essay: document.getElementById('screenEssay'),
    result: document.getElementById('screenResult')
  };

  startBtn.onclick = () => modal.classList.add('active');
  closeBtn.onclick = () => modal.classList.remove('active');

  let mcqQuestions = [];
  let essayQuestions = [];
  let currentMcq = 0;
  let currentEssay = 0;
  let score = 0;
  let mistakes = [];

  function shuffle(array) {
    let cur = array.length, ran;
    while (cur != 0) {
      ran = Math.floor(Math.random() * cur);
      cur--;
      [array[cur], array[ran]] = [array[ran], array[cur]];
    }
    return array;
  }

  document.getElementById('beginQuizBtn').onclick = () => {
    if(words.length === 0) return; // safeguard
    // Generate questions
    const shuffledWords = shuffle([...words]);

    // 10 MCQ
    mcqQuestions = shuffledWords.slice(0, 10).map(w => {
      const type = Math.random();
      let q, a, wrongMap;
      if (type < 0.33) {
        // JP -> ID
        q = `Apa arti dari <span class="highlight jp">${w.jp}</span> ?`;
        a = w.id;
        wrongMap = words.filter(x => x.id !== w.id).map(x => x.id);
      } else if (type < 0.66) {
        // ID -> JP
        q = `Apa bahasa Jepangnya <span class="highlight">${w.id}</span> ?`;
        a = w.jp;
        wrongMap = words.filter(x => x.jp !== w.jp).map(x => x.jp);
      } else {
        // Romaji -> Kana
        q = `Pilih cara baca yang tepat untuk <span class="highlight">${w.romaji}</span>`;
        a = w.kana;
        wrongMap = words.filter(x => x.kana !== w.kana).map(x => x.kana);
      }

      let opts = [a, ...shuffle(wrongMap).slice(0, 3)];
      return { q, a, opts: shuffle(opts), word: w };
    });

    // 5 Essay
    essayQuestions = shuffledWords.slice(10, 15).map(w => {
      return { romaji: w.romaji, kana: w.kana, jp: w.jp, id: w.id };
    });

    currentMcq = 0;
    currentEssay = 0;
    score = 0;
    mistakes = [];

    showScreen('mcq');
    renderMcq();
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function renderMcq() {
    if (currentMcq >= mcqQuestions.length) {
      showScreen('essay');
      renderEssay();
      return;
    }

    const q = mcqQuestions[currentMcq];
    document.getElementById('mcqProgress').textContent = `Soal ${currentMcq + 1} / 10`;
    document.getElementById('mcqText').innerHTML = q.q;

    const optsDiv = document.getElementById('mcqOptions');
    optsDiv.innerHTML = '';

    let answered = false;
    q.opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn jp';
      btn.textContent = opt;
      btn.onclick = () => {
        if(answered) return;
        answered = true;
        if(opt === q.a) {
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('wrong');
          mistakes.push({ q: q.q.replace(/<[^>]*>?/gm, ''), a: q.a, u: opt });
          // Highlight correct
          Array.from(optsDiv.children).forEach(b => {
            if(b.textContent === q.a) b.classList.add('correct');
          });
        }
        setTimeout(() => {
          currentMcq++;
          renderMcq();
        }, 1000);
      };
      optsDiv.appendChild(btn);
    });
  }

  // Basic Hiragana Keyboard
  const hiraganaMap = [
    'あ','い','う','え','お',
    'か','き','く','け','こ',
    'さ','し','す','せ','そ',
    'た','ち','つ','て','と',
    'な','に','ぬ','ね','の',
    'は','ひ','ふ','へ','ほ',
    'ま','み','む','め','も',
    'や','ゆ','よ','わ','ん'
  ];

  function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    hiraganaMap.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'v-key jp';
      btn.textContent = h;
      btn.onclick = () => {
        document.getElementById('essayInput').value += h;
      };
      kb.appendChild(btn);
    });
    const backBtn = document.createElement('button');
    backBtn.className = 'v-key wide';
    backBtn.textContent = 'Hapus';
    backBtn.onclick = () => {
      const inp = document.getElementById('essayInput');
      inp.value = inp.value.slice(0, -1);
    };
    kb.appendChild(backBtn);
  }
  buildKeyboard();

  function renderEssay() {
    if (currentEssay >= essayQuestions.length) {
      finishQuiz();
      return;
    }
    const q = essayQuestions[currentEssay];
    document.getElementById('essayProgress').textContent = `Soal Esai ${currentEssay + 1} / 5`;
    document.getElementById('essayRomaji').textContent = q.romaji;
    document.getElementById('essayInput').value = '';

    // Also allow real keyboard
    document.getElementById('essayInput').onkeyup = (e) => {
        if(e.key === 'Enter') document.getElementById('essaySubmitBtn').click();
    };
  }

  document.getElementById('essaySubmitBtn').onclick = () => {
    const q = essayQuestions[currentEssay];
    const ans = document.getElementById('essayInput').value.trim();
    if(ans === '') return;

    if(ans === q.kana) {
      score++;
    } else {
      mistakes.push({ q: `Ketik hiragana untuk: ${q.romaji} (${q.id})`, a: q.kana, u: ans });
    }
    currentEssay++;
    renderEssay();
  };

  function finishQuiz() {
    showScreen('result');
    document.getElementById('finalScore').textContent = `${score}/15`;

    let msg = "";
    if (score >= 14) msg = "Sempurna! Kosakata N5 Anda sangat kuat. Siap naik ke N4.";
    else if (score >= 12) msg = "Sangat bagus. Sedikit lagi menuju sempurna.";
    else if (score >= 9) msg = "Bagus! Fokus memperkuat kata-kata yang salah.";
    else if (score >= 6) msg = "Cukup baik. Prioritaskan kategori Kata Kerja dan Kata Sifat.";
    else msg = "Terus berlatih! Mulai ulang dari kategori dasar (Benda dan Orang).";

    document.getElementById('finalMsg').textContent = msg;

    const mList = document.getElementById('mistakesList');
    const mCont = document.getElementById('mistakesContainer');
    if(mistakes.length > 0) {
      mList.style.display = 'block';
      mCont.innerHTML = mistakes.map(m => `
        <div class="mistake-item">
          <div class="mistake-q">${m.q}</div>
          <span class="mistake-a">${m.a}</span><span class="mistake-u">${m.u}</span>
        </div>
      `).join('');
    } else {
      mList.style.display = 'none';
    }
  }

  document.getElementById('retryBtn').onclick = () => {
    showScreen('intro');
  };
</script>

</body>
</html>
