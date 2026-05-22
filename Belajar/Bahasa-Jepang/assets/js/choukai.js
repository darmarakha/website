/* global window, document, fetch */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    materials: [],
    current: null,
    activeIdx: null,
    playing: false,
    stopFlag: false,
    rate: 0.9,
  };

  function speakerMeta(material, id) {
    return (material?.speakers || []).find((s) => s.id === id) || null;
  }

  function speakerColorClasses(colorClass) {
    if (colorClass === 'rose') return { pill: 'bg-rose-500/15 text-rose-200 border-rose-500/25', bar: 'bg-rose-400/70' };
    if (colorClass === 'blue') return { pill: 'bg-sky-500/15 text-sky-200 border-sky-500/25', bar: 'bg-sky-400/70' };
    if (colorClass === 'emerald') return { pill: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25', bar: 'bg-emerald-400/70' };
    return { pill: 'bg-white/10 text-white/80 border-white/15', bar: 'bg-white/40' };
  }

  function renderList() {
    const list = $('#choukai-list');
    if (!list) return;
    const items = state.materials;
    list.innerHTML = items
      .map((m) => {
        const active = state.current?.id === m.id;
        return `
          <button type="button" data-id="${m.id}"
            class="w-full text-left rounded-2xl border ${active ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} p-4 transition">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="font-extrabold text-white">${window.GemuFurigana.escapeHtml(m.title || '')}</div>
                <div class="text-xs text-white/60 mt-1">${window.GemuFurigana.escapeHtml(m.topic || '')}</div>
              </div>
              <div class="text-xl">${window.GemuFurigana.escapeHtml(m.emoji || '🎧')}</div>
            </div>
            <div class="text-[11px] text-white/55 mt-3 line-clamp-2">${window.GemuFurigana.escapeHtml(m.scenario || '')}</div>
          </button>
        `;
      })
      .join('');

    $$('#choukai-list button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const m = state.materials.find((x) => x.id === id);
        if (m) setCurrent(m);
      });
    });
  }

  function renderCurrent() {
    const m = state.current;
    const title = $('#choukai-title');
    const meta = $('#choukai-meta');
    const dialog = $('#choukai-dialog');
    const quiz = $('#choukai-quiz');
    if (!m || !title || !meta || !dialog || !quiz) return;

    title.textContent = `${m.emoji || '🎧'} ${m.title || ''}`;
    meta.innerHTML = `
      <p class="text-white/80">${window.GemuFurigana.escapeHtml(m.context || '')}</p>
      <div class="mt-4 grid sm:grid-cols-2 gap-3">
        ${(m.speakers || [])
          .map((s) => {
            const c = speakerColorClasses(s.colorClass);
            return `
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="flex items-center justify-between">
                  <div class="font-bold text-white">${window.GemuFurigana.escapeHtml(`${s.emoji || '👤'} ${s.nameRo || s.id}`)}</div>
                  <span class="px-2 py-1 rounded-full text-[11px] border ${c.pill}">${window.GemuFurigana.escapeHtml(s.gender || '')}</span>
                </div>
                <div class="text-[11px] text-white/65 mt-2">${window.GemuFurigana.escapeHtml(s.role || '')}</div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    dialog.innerHTML = (m.dialogue || [])
      .map((line, i) => {
        const sp = speakerMeta(m, line.speaker);
        const c = speakerColorClasses(sp?.colorClass);
        const active = state.activeIdx === i;
        return `
          <div class="rounded-2xl border ${active ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/5'} p-4 transition" data-line="${i}">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-1 rounded-full text-[11px] border ${c.pill}">${window.GemuFurigana.escapeHtml(`${sp?.emoji || '👤'} ${sp?.nameRo || line.speaker}`)}</span>
                  <div class="h-1.5 w-20 rounded-full ${c.bar} opacity-60"></div>
                </div>
                <div class="mt-3 text-2xl sm:text-3xl font-black text-white leading-snug font-jp" style="font-family: ui-sans-serif, system-ui, 'Noto Sans JP', sans-serif;">
                  <span class="jp">${window.GemuFurigana.parseFuriganaToHtml(line.text || '')}</span>
                </div>
                <div class="text-sm text-white/70 mt-2">${window.GemuFurigana.escapeHtml(line.ro || '')}</div>
                <div class="text-[12px] text-white/65 mt-1">${window.GemuFurigana.escapeHtml(line.id || '')}</div>
              </div>
              <div class="shrink-0 flex flex-col gap-2">
                <button type="button" class="play-line px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm" data-i="${i}">🔊</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    $$('#choukai-dialog .play-line').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const i = Number(btn.getAttribute('data-i'));
        await playLine(i);
      });
    });

    const q = m.quiz || {};
    quiz.innerHTML = `
      <div class="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
        <div class="font-extrabold text-white">📝 Quiz</div>
        <p class="text-sm text-white/80 mt-2">${window.GemuFurigana.escapeHtml(q.question || '')}</p>
        <div class="mt-4 grid gap-2">
          ${(q.options || [])
            .map(
              (opt, idx) =>
                `<button type="button" class="quiz-opt text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition" data-idx="${idx}">${window.GemuFurigana.escapeHtml(opt)}</button>`
            )
            .join('')}
        </div>
        <p id="quiz-result" class="mt-3 text-sm"></p>
        <p class="mt-2 text-[12px] text-white/70">${window.GemuFurigana.escapeHtml(q.explanation || '')}</p>
      </div>
    `;

    $$('#choukai-quiz .quiz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const correct = q.answer !== undefined ? Number(q.answer) : NaN;
        const el = $('#quiz-result');
        if (!el) return;
        if (!isNaN(correct) && idx === correct) {
          el.className = 'mt-3 text-sm text-emerald-300 font-bold';
          el.textContent = '✅ Benar!';
        } else {
          el.className = 'mt-3 text-sm text-rose-300 font-bold';
          el.textContent = '❌ Belum tepat. Coba baca ulang dialognya.';
        }
      });
    });
  }

  function setCurrent(material) {
    if (!material) return;
    state.current = material;
    state.activeIdx = null;
    state.playing = false;
    state.stopFlag = false;
    window.GemuSpeech.cancelSpeak();
    renderList();
    renderCurrent();
  }

  async function playLine(i) {
    const m = state.current;
    if (!m || !m.dialogue || !m.dialogue[i]) return;
    state.stopFlag = false;
    state.activeIdx = i;
    renderCurrent();

    const line = m.dialogue[i];
    const sp = speakerMeta(m, line.speaker);
    const pitch = sp?.gender === 'wanita' ? 1.25 : 0.85;
    await window.GemuSpeech.speak(line.text || '', {
      rate: state.rate,
      pitch,
      voicePrefer: sp?.gender === 'wanita' ? 'female' : 'male',
    });

    if (!state.stopFlag) {
      state.activeIdx = null;
      renderCurrent();
    }
  }

  async function playAll() {
    const m = state.current;
    if (!m || !m.dialogue) return;
    state.stopFlag = false;
    state.playing = true;
    $('#btn-playall')?.setAttribute('disabled', 'disabled');
    $('#btn-stop')?.removeAttribute('disabled');

    for (let i = 0; i < m.dialogue.length; i++) {
      if (state.stopFlag) break;
      // eslint-disable-next-line no-await-in-loop
      await playLine(i);
    }

    state.playing = false;
    state.activeIdx = null;
    $('#btn-playall')?.removeAttribute('disabled');
    $('#btn-stop')?.setAttribute('disabled', 'disabled');
  }

  function stopAll() {
    state.stopFlag = true;
    state.playing = false;
    state.activeIdx = null;
    window.GemuSpeech.cancelSpeak();
    $('#btn-playall')?.removeAttribute('disabled');
    $('#btn-stop')?.setAttribute('disabled', 'disabled');
    renderCurrent();
  }

  async function init() {
    try {
      const res = await fetch('assets/data/n5-choukai.json', { cache: 'no-store' });
      const json = await res.json();
      state.materials = Array.isArray(json) ? json : [];
      if (state.materials.length) setCurrent(state.materials[0]);
      else $('#choukai-title').textContent = '⚠️ Data Choukai kosong';
    } catch (_) {
      state.materials = [];
      $('#choukai-title').textContent = '⚠️ Gagal memuat data Choukai';
    }

    $('#speed')?.addEventListener('input', (e) => {
      state.rate = Number(e.target.value || 0.9);
      $('#speed-label').textContent = `${state.rate.toFixed(2)}x`;
    });
    $('#btn-playall')?.addEventListener('click', playAll);
    $('#btn-stop')?.addEventListener('click', stopAll);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

