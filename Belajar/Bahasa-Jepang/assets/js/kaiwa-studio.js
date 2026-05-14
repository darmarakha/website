/* global window, document, fetch */
(function () {
  'use strict';

  const state = {
    topics: [], topic: null, turn: 0, speakOn: true, listening: false, recognition: null,
    dictionary: { nouns: [], colors: [], adjectives: [], phrases: [] }, history: []
  };

  const esc = (s) => window.GemuFurigana.escapeHtml(String(s || ''));
  const fmt = (jp, ro, id) => `JP: ${jp}\nRO: ${ro}\nID: ${id}`;
  const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  function addMsg(role, text) {
    const wrap = document.querySelector('#kaiwa-log');
    if (!wrap) return;
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `rounded-2xl border ${isUser ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'} p-4`;
    div.innerHTML = `<div class="text-[11px] uppercase tracking-widest ${isUser ? 'text-emerald-300' : 'text-sky-300'} font-bold">${isUser ? 'Kamu' : 'Partner'}</div><div class="mt-2 whitespace-pre-wrap text-sm text-white/90">${esc(text)}</div>`;
    wrap.appendChild(div); wrap.scrollTop = wrap.scrollHeight;
  }

  function parseJP(text) {
    const m = String(text || '').match(/JP:\s*([\s\S]*?)(?=\nRO:|$)/);
    return m?.[1]?.trim() || '';
  }

  async function speakIfOn(text) {
    if (!state.speakOn) return;
    const jp = parseJP(text);
    if (!jp) return;
    await window.GemuSpeech.speak(jp, { rate: 0.92, pitch: 1.0, voicePrefer: 'any' });
  }

  function stopListening() {
    if (state.recognition) { try { state.recognition.stop(); } catch (_) {} state.recognition = null; }
    state.listening = false;
    const btn = document.querySelector('#btn-mic');
    if (btn) { btn.classList.remove('bg-rose-600'); btn.classList.add('bg-slate-800'); btn.setAttribute('data-state', 'off'); }
    const lab = document.querySelector('#mic-status'); if (lab) lab.textContent = 'Mic: OFF';
  }

  function startListening() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { alert('Browser tidak mendukung Speech Recognition. Silakan ketik jawabannya.'); return; }
    window.GemuSpeech.cancelSpeak(); stopListening();
    const r = new Rec(); state.recognition = r; r.lang = 'ja-JP'; r.interimResults = true; r.continuous = false;
    r.onresult = (e) => { let txt = ''; for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript; const inp = document.querySelector('#kaiwa-input'); if (inp) inp.value = txt; };
    r.onerror = () => stopListening(); r.onend = () => stopListening();
    try { r.start(); state.listening = true; const btn = document.querySelector('#btn-mic'); if (btn) { btn.classList.add('bg-rose-600'); btn.classList.remove('bg-slate-800'); btn.setAttribute('data-state', 'on'); } const lab = document.querySelector('#mic-status'); if (lab) lab.textContent = 'Mic: ON'; } catch (_) { stopListening(); }
  }

  function itemTerms(item) {
    return [item.id, item.jp, item.plain, item.ro, item.idn].filter(Boolean).map(norm);
  }

  function findFromList(list, text) {
    const q = norm(text);
    return list.find((item) => itemTerms(item).some((term) => term && q.includes(term))) || null;
  }

  function detectIntent(text) {
    const q = norm(text);
    if (/[?？]$/.test(text) || /ですか|ますか|apakah|apa|is |are |do |does /.test(q)) return 'question';
    if (/こんにちは|こんばんは|おはよう|halo|hai|hello/.test(q)) return 'greeting';
    if (/すき|好き|suka|like/.test(q)) return 'like';
    if (/いくら|berapa|harga/.test(q)) return 'price';
    if (/どこ|doko|where|di mana|kemana|ke mana/.test(q)) return 'place';
    return 'chat';
  }

  function isYesNoQuestion(text) {
    return /[?？]$/.test(text) || /ですか|ますか|apakah|is |are |do |does /.test(norm(text));
  }

  function buildObjectAnswer(noun, color, adjective, userText) {
    if (noun && color && isYesNoQuestion(userText)) {
      const realColor = noun.attrs?.color;
      const correct = !realColor || realColor === color.id;
      if (correct) {
        return fmt(`はい、${noun.jp}は${color.jp}です。おいしそうですね。`, `Hai, ${noun.ro} wa ${color.ro} desu. Oishisou desu ne.`, `Iya, ${noun.idn} itu ${color.idn}. Kelihatan enak ya 🍎`);
      }
      const trueColor = state.dictionary.colors.find((c) => c.id === realColor);
      if (trueColor) return fmt(`いいえ、${noun.jp}は${trueColor.jp}です。${color.jp}ではありません。`, `Iie, ${noun.ro} wa ${trueColor.ro} desu. ${color.ro} dewa arimasen.`, `Bukan, ${noun.idn} itu ${trueColor.idn}, bukan ${color.idn}. Aku sesuaikan dengan kata bendanya ya ✅`);
    }

    if (noun && adjective && isYesNoQuestion(userText)) {
      return fmt(`はい、${noun.jp}は${adjective.jp}です。あなたは${noun.jp}が好[す]きですか？`, `Hai, ${noun.ro} wa ${adjective.ro} desu. Anata wa ${noun.ro} ga suki desu ka?`, `Iya, ${noun.idn} itu ${adjective.idn}. Kamu suka ${noun.idn}?`);
    }

    if (noun) {
      return fmt(`${noun.jp}ですね。いいですね。${noun.jp}は好[す]きですか？`, `${noun.ro} desu ne. Ii desu ne. ${noun.ro} wa suki desu ka?`, `Oh, ${noun.idn} ya. Bagus. Kamu suka ${noun.idn}?`);
    }
    return null;
  }

  function topicReply(intent, userText) {
    const topicId = state.topic?.id || 'free';
    if (intent === 'greeting') return fmt('こんにちは。元気[げんき]ですか？', 'Konnichiwa. Genki desu ka?', 'Halo. Kamu sehat? 👋');
    if (topicId === 'restaurant') return fmt('いいですね。何[なに]を食[た]べますか？', 'Ii desu ne. Nani o tabemasu ka?', 'Oke. Kamu mau makan apa? 🍽️');
    if (topicId === 'shopping') return fmt('そうですね。これはいくらですか？', 'Sou desu ne. Kore wa ikura desu ka?', 'Baik. Ini berapa harganya? 🛒');
    if (topicId === 'direction') return fmt('駅[えき]は近[ちか]いです。まっすぐ行[い]ってください。', 'Eki wa chikai desu. Massugu itte kudasai.', 'Stasiunnya dekat. Jalan lurus ya 🗺️');
    if (topicId === 'school') return fmt('今日[きょう]の授業[じゅぎょう]は何[なん]ですか？', 'Kyou no jugyou wa nan desu ka?', 'Pelajaran hari ini apa? 🏫');
    return fmt('そうですね。もう少[すこ]し話[はな]してください。', 'Sou desu ne. Mou sukoshi hanashite kudasai.', 'Oh begitu. Ceritakan sedikit lagi ya 🌟');
  }

  function nextAiMessage(userText) {
    const noun = findFromList(state.dictionary.nouns, userText);
    const color = findFromList(state.dictionary.colors, userText);
    const adjective = findFromList(state.dictionary.adjectives, userText);
    const objectAnswer = buildObjectAnswer(noun, color, adjective, userText);
    if (objectAnswer) return objectAnswer;
    return topicReply(detectIntent(userText), userText);
  }

  async function send() {
    const inp = document.querySelector('#kaiwa-input'); if (!inp) return;
    const userText = String(inp.value || '').trim(); if (!userText) return;
    inp.value = ''; stopListening(); addMsg('user', userText); state.history.push({ role: 'user', text: userText });
    const reply = nextAiMessage(userText); state.turn += 1; state.history.push({ role: 'model', text: reply });
    addMsg('model', reply); await speakIfOn(reply);
  }

  function renderTopics() {
    const sel = document.querySelector('#topic'); if (!sel) return;
    sel.innerHTML = state.topics.map((t) => `<option value="${esc(t.id)}">${esc(`${t.emoji || '💬'} ${t.label}`)}</option>`).join('');
    sel.addEventListener('change', () => {
      state.topic = state.topics.find((t) => t.id === sel.value) || state.topics[0] || null; state.turn = 0; state.history = [];
      const log = document.querySelector('#kaiwa-log'); if (log) log.innerHTML = '';
      const greet = fmt('こんにちは。今日[きょう]は何[なに]を話[はな]しますか？', 'Konnichiwa. Kyou wa nani o hanashimasu ka?', 'Halo. Hari ini mau ngobrol apa?');
      addMsg('model', greet); speakIfOn(greet);
    });
    state.topic = state.topics[0] || null;
  }

  async function init() {
    try { const res = await fetch('assets/data/kaiwa-topics.json', { cache: 'no-store' }); const json = await res.json(); state.topics = Array.isArray(json) ? json : []; } catch (_) { state.topics = []; }
    try { const res = await fetch('assets/data/kaiwa-dictionary-n5.json', { cache: 'no-store' }); const json = await res.json(); if (json && typeof json === 'object') state.dictionary = { ...state.dictionary, ...json }; } catch (_) {}
    if (!state.topics.length) state.topics = [{ id: 'free', label: 'Bebas', emoji: '🌟', prompt: 'Ayo ngobrol bebas!' }];
    renderTopics();
    document.querySelector('#btn-send')?.addEventListener('click', send);
    document.querySelector('#kaiwa-form')?.addEventListener('submit', (e) => { e.preventDefault(); send(); });
    document.querySelector('#btn-mic')?.addEventListener('click', () => (state.listening ? stopListening() : startListening()));
    document.querySelector('#btn-speak')?.addEventListener('click', () => { state.speakOn = !state.speakOn; const b = document.querySelector('#btn-speak'); if (b) b.textContent = state.speakOn ? '🔊 Suara: ON' : '🔇 Suara: OFF'; if (!state.speakOn) window.GemuSpeech.cancelSpeak(); });
    document.querySelector('#btn-stop-tts')?.addEventListener('click', () => window.GemuSpeech.cancelSpeak());
    const greet = fmt('はじめまして。簡単[かんたん]に自己紹介[じこしょうかい]してください。', 'Hajimemashite. Kantan ni jikoshoukai shite kudasai.', 'Senang berkenalan. Coba perkenalan singkat ya.');
    addMsg('model', greet); await speakIfOn(greet);
    if (!window.GemuSpeech.supportsRecognition()) { const lab = document.querySelector('#mic-status'); if (lab) lab.textContent = 'Mic: tidak didukung (ketik saja)'; }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
