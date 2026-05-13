/* global window, document, fetch */
(function () {
  'use strict';

  const state = {
    topics: [],
    topic: null,
    turn: 0,
    speakOn: true,
    listening: false,
    recognition: null,
  };

  function addMsg(role, text) {
    const wrap = document.querySelector('#kaiwa-log');
    if (!wrap) return;
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `rounded-2xl border ${isUser ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'} p-4`;
    div.innerHTML = `
      <div class="text-[11px] uppercase tracking-widest ${isUser ? 'text-emerald-300' : 'text-sky-300'} font-bold">${isUser ? 'Kamu' : 'Partner'}</div>
      <div class="mt-2 whitespace-pre-wrap text-sm text-white/90">${window.GemuFurigana.escapeHtml(text)}</div>
    `;
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
  }

  function formatTriple(jp, ro, id) {
    return `JP: ${jp}\nRO: ${ro}\nID: ${id}`;
  }

  function getFlow(topicId) {
    const flows = {
      introduction: [
        formatTriple('はじめまして。わたしは ゆきです。おなまえは？', 'Hajimemashite. Watashi wa Yuki desu. Onamae wa?', 'Senang berkenalan. Aku Yuki. Namamu siapa?'),
        formatTriple('どこから きましたか。', 'Doko kara kimashita ka.', 'Kamu dari mana?'),
        formatTriple('しゅみは なんですか。', 'Shumi wa nan desu ka.', 'Hobimu apa?'),
        formatTriple('よろしく おねがいします。', 'Yoroshiku onegaishimasu.', 'Senang kenal!'),
      ],
      restaurant: [
        formatTriple('いらっしゃいませ。なにを たべますか。', 'Irasshaimase. Nani o tabemasu ka.', 'Selamat datang. Mau makan apa?'),
        formatTriple('のみものは なにが いいですか。', 'Nomimono wa nani ga ii desu ka.', 'Minumnya mau apa?'),
        formatTriple('ぜんぶで いくらですか。', 'Zenbu de ikura desu ka.', 'Totalnya berapa?'),
      ],
      shopping: [
        formatTriple('すみません。これは いくらですか。', 'Sumimasen. Kore wa ikura desu ka.', 'Permisi. Ini berapa harganya?'),
        formatTriple('じゃあ、これを ください。', 'Jaa, kore o kudasai.', 'Kalau begitu, saya mau ini.'),
        formatTriple('カードで はらえますか。', 'Kaado de haraemasu ka.', 'Bisa bayar pakai kartu?'),
      ],
      direction: [
        formatTriple('すみません。えきは どこですか。', 'Sumimasen. Eki wa doko desu ka.', 'Permisi. Stasiun di mana?'),
        formatTriple('まっすぐ いって、みぎに まがって ください。', 'Massugu itte, migi ni magatte kudasai.', 'Jalan lurus, lalu belok kanan.'),
        formatTriple('ありがとう ございます。', 'Arigatou gozaimasu.', 'Terima kasih.'),
      ],
      weather: [
        formatTriple('きょうは いい てんきですね。', 'Kyou wa ii tenki desu ne.', 'Hari ini cuacanya bagus ya.'),
        formatTriple('あしたは あめですか。', 'Ashita wa ame desu ka.', 'Besok hujan tidak?'),
      ],
      hobby: [
        formatTriple('しゅみは なんですか。', 'Shumi wa nan desu ka.', 'Hobimu apa?'),
        formatTriple('わたしは おんがくが すきです。', 'Watashi wa ongaku ga suki desu.', 'Aku suka musik.'),
      ],
      phone: [
        formatTriple('もしもし。いま だいじょうぶですか。', 'Moshi moshi. Ima daijoubu desu ka.', 'Halo, sekarang sempat?'),
        formatTriple('なんじに あいますか。', 'Nanji ni aimasu ka.', 'Jam berapa kita bertemu?'),
      ],
      school: [
        formatTriple('きょうの しゅくだいは なんですか。', 'Kyou no shukudai wa nan desu ka.', 'PR hari ini apa?'),
        formatTriple('つぎの じゅぎょうは なんじですか。', 'Tsugi no jugyou wa nanji desu ka.', 'Pelajaran berikutnya jam berapa?'),
      ],
      travel: [
        formatTriple('どこへ いきたいですか。', 'Doko e ikitai desu ka.', 'Kamu ingin pergi ke mana?'),
        formatTriple('でんしゃで いきましょう。', 'Densha de ikimashou.', 'Ayo naik kereta.'),
      ],
      free: [
        formatTriple('こんにちは！きょうは なにを はなしますか？', 'Konnichiwa! Kyou wa nani o hanashimasu ka?', 'Halo! Hari ini mau ngobrol apa?'),
      ],
    };
    return flows[topicId] || flows.free;
  }

  function parseJP(text) {
    const m = String(text || '').match(/JP:\s*([\s\S]*?)(?=\nRO:|$)/);
    return m?.[1]?.trim() || '';
  }

  async function speakIfOn(text) {
    if (!state.speakOn) return;
    const jp = parseJP(text);
    if (!jp) return;
    await window.GemuSpeech.speak(jp, { rate: 0.95, pitch: 1.0, voicePrefer: 'any' });
  }

  function stopListening() {
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch (_) {}
      state.recognition = null;
    }
    state.listening = false;
    const btn = document.querySelector('#btn-mic');
    if (btn) {
      btn.classList.remove('bg-rose-600');
      btn.classList.add('bg-slate-800');
      btn.setAttribute('data-state', 'off');
    }
    const lab = document.querySelector('#mic-status');
    if (lab) lab.textContent = 'Mic: OFF';
  }

  function startListening() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      alert('Browser tidak mendukung Speech Recognition. Silakan ketik jawabannya.');
      return;
    }
    window.GemuSpeech.cancelSpeak();
    stopListening();
    const r = new Rec();
    state.recognition = r;
    r.lang = 'ja-JP';
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (e) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
      }
      const inp = document.querySelector('#kaiwa-input');
      if (inp) inp.value = txt;
    };
    r.onerror = () => stopListening();
    r.onend = () => stopListening();
    try {
      r.start();
      state.listening = true;
      const btn = document.querySelector('#btn-mic');
      if (btn) {
        btn.classList.add('bg-rose-600');
        btn.classList.remove('bg-slate-800');
        btn.setAttribute('data-state', 'on');
      }
      const lab = document.querySelector('#mic-status');
      if (lab) lab.textContent = 'Mic: ON';
    } catch (_) {
      stopListening();
    }
  }

  function nextAiMessage() {
    const flow = getFlow(state.topic?.id || 'free');
    const idx = Math.min(state.turn, flow.length - 1);
    if (idx >= 0 && flow[idx]) return flow[idx];
    return formatTriple(
      'そうですか。もうすこし はなしてください。',
      'Sou desu ka. Mou sukoshi hanashite kudasai.',
      'Oh begitu ya. Ceritakan sedikit lagi.'
    );
  }

  async function send() {
    const inp = document.querySelector('#kaiwa-input');
    if (!inp) return;
    const userText = String(inp.value || '').trim();
    if (!userText) return;
    inp.value = '';

    stopListening();
    addMsg('user', userText);

    const reply = nextAiMessage();
    state.turn += 1;
    addMsg('model', reply);
    await speakIfOn(reply);
  }

  function renderTopics() {
    const sel = document.querySelector('#topic');
    if (!sel) return;
    sel.innerHTML = state.topics
      .map((t) => `<option value="${t.id}">${window.GemuFurigana.escapeHtml(`${t.emoji || '💬'} ${t.label}`)}</option>`)
      .join('');
    sel.addEventListener('change', () => {
      const id = sel.value;
      state.topic = state.topics.find((t) => t.id === id) || state.topics[0] || null;
      state.turn = 0;
      const log = document.querySelector('#kaiwa-log');
      if (log) log.innerHTML = '';
      const greet = formatTriple(
        'こんにちは！きょうは なにを はなしますか？',
        'Konnichiwa! Kyou wa nani o hanashimasu ka?',
        'Halo! Hari ini mau ngobrol apa?'
      );
      addMsg('model', greet);
      speakIfOn(greet);
    });
    state.topic = state.topics[0] || null;
  }

  async function init() {
    try {
      const res = await fetch('assets/data/kaiwa-topics.json', { cache: 'no-store' });
      const json = await res.json();
      state.topics = Array.isArray(json) ? json : [];
    } catch (_) {
      state.topics = [{ id: 'free', label: 'Bebas', emoji: '🌟', prompt: 'Ayo ngobrol bebas!' }];
    }

    if (!state.topics.length) state.topics = [{ id: 'free', label: 'Bebas', emoji: '🌟', prompt: 'Ayo ngobrol bebas!' }];
    renderTopics();

    document.querySelector('#btn-send')?.addEventListener('click', send);
    document.querySelector('#kaiwa-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      send();
    });
    document.querySelector('#btn-mic')?.addEventListener('click', () => (state.listening ? stopListening() : startListening()));
    document.querySelector('#btn-speak')?.addEventListener('click', () => {
      state.speakOn = !state.speakOn;
      const b = document.querySelector('#btn-speak');
      if (b) b.textContent = state.speakOn ? '🔊 Suara: ON' : '🔇 Suara: OFF';
      if (!state.speakOn) window.GemuSpeech.cancelSpeak();
    });
    document.querySelector('#btn-stop-tts')?.addEventListener('click', () => window.GemuSpeech.cancelSpeak());

    const greet = formatTriple(
      'はじめまして！かんたんに じこしょうかい してください。',
      'Hajimemashite! Kantan ni jikoshoukai shite kudasai.',
      'Senang berkenalan! Coba perkenalan singkat ya.'
    );
    addMsg('model', greet);
    await speakIfOn(greet);

    if (!window.GemuSpeech.supportsRecognition()) {
      const lab = document.querySelector('#mic-status');
      if (lab) lab.textContent = 'Mic: tidak didukung (ketik saja)';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

