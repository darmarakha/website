(() => {
  'use strict';

  const cfg = window.GY_LEARNING_MODULE || {};
  const storageKey = `gyLearning:${cfg.moduleId || 'module'}:${cfg.userId || 'guest'}`;
  const levels = Array.isArray(cfg.levels) ? cfg.levels : [];
  const questions = Array.isArray(cfg.questions) ? cfg.questions : [];

  const state = loadState();
  let currentLevel = chooseInitialLevel();
  let currentQuestion = null;
  let answered = false;

  const el = {
    levelList: document.querySelector('[data-level-list]'),
    topicGrid: document.querySelector('[data-topic-grid]'),
    roadmap: document.querySelector('[data-roadmap]'),
    aiLevel: document.querySelector('[data-ai-level]'),
    aiReason: document.querySelector('[data-ai-reason]'),
    progressBar: document.querySelector('[data-progress-bar]'),
    statAnswered: document.querySelector('[data-stat-answered]'),
    statAccuracy: document.querySelector('[data-stat-accuracy]'),
    statMastery: document.querySelector('[data-stat-mastery]'),
    questionMeta: document.querySelector('[data-question-meta]'),
    questionText: document.querySelector('[data-question-text]'),
    options: document.querySelector('[data-options]'),
    feedback: document.querySelector('[data-feedback]'),
    nextBtn: document.querySelector('[data-next-question]'),
    resetBtn: document.querySelector('[data-reset-progress]'),
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return normalizeState(parsed);
      }
    } catch (_) {}
    return normalizeState({ answered: 0, correct: 0, levelStats: {}, seen: [] });
  }

  function normalizeState(value) {
    return {
      answered: Number(value.answered || 0),
      correct: Number(value.correct || 0),
      levelStats: value.levelStats && typeof value.levelStats === 'object' ? value.levelStats : {},
      seen: Array.isArray(value.seen) ? value.seen : [],
    };
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function getLevelStat(levelId) {
    if (!state.levelStats[levelId]) state.levelStats[levelId] = { answered: 0, correct: 0 };
    return state.levelStats[levelId];
  }

  function accuracy(totalCorrect = state.correct, totalAnswered = state.answered) {
    if (!totalAnswered) return 0;
    return Math.round((totalCorrect / totalAnswered) * 100);
  }

  function levelAccuracy(levelId) {
    const stat = getLevelStat(levelId);
    return accuracy(stat.correct, stat.answered);
  }

  function chooseInitialLevel() {
    if (!levels.length) return '';
    const weak = levels.find(level => {
      const stat = getLevelStat(level.id);
      return stat.answered > 0 && stat.answered < 5;
    });
    if (weak) return weak.id;

    const ready = levels.find(level => {
      const prevIndex = levels.findIndex(item => item.id === level.id) - 1;
      if (prevIndex < 0) return false;
      const prev = levels[prevIndex];
      const prevStat = getLevelStat(prev.id);
      return prevStat.answered >= 5 && levelAccuracy(prev.id) >= 80 && getLevelStat(level.id).answered < 5;
    });
    return (ready || levels[0]).id;
  }

  function recommendation() {
    const totalAcc = accuracy();
    const level = levels.find(item => item.id === currentLevel) || levels[0];
    const stat = level ? getLevelStat(level.id) : { answered: 0, correct: 0 };
    const localAcc = accuracy(stat.correct, stat.answered);

    if (!state.answered) {
      return {
        label: level?.name || 'Pemula',
        mastery: 0,
        reason: 'AI belajar belum punya data jawaban. Mulai dari level dasar agar sistem bisa membaca kekuatan awal user.',
      };
    }

    if (stat.answered < 5) {
      return {
        label: level?.name || 'Pemula',
        mastery: Math.min(35, state.answered * 7),
        reason: `AI masih mengumpulkan data pada ${level?.name || 'level ini'}. Jawab minimal 5 soal agar rekomendasi lebih stabil. Akurasi umum saat ini ${totalAcc}%.`,
      };
    }

    if (localAcc >= 85) {
      const nextIndex = Math.min(levels.length - 1, levels.findIndex(item => item.id === level.id) + 1);
      const next = levels[nextIndex];
      return {
        label: next?.name || level?.name || 'Lanjutan',
        mastery: Math.min(100, 70 + Math.floor(localAcc / 4)),
        reason: `Akurasi pada ${level?.name || 'level ini'} sudah ${localAcc}%. User cocok naik atau mencoba materi ${next?.name || 'lanjutan'}.`,
      };
    }

    if (localAcc < 60) {
      return {
        label: level?.name || 'Penguatan Dasar',
        mastery: Math.max(15, localAcc),
        reason: `Akurasi level ini masih ${localAcc}%. AI menyarankan penguatan konsep inti sebelum naik tingkat.`,
      };
    }

    return {
      label: level?.name || 'Menengah',
      mastery: Math.min(75, localAcc),
      reason: `Akurasi ${localAcc}% berarti user sudah memahami sebagian materi, tetapi masih perlu latihan campuran agar stabil.`,
    };
  }

  function renderLevels() {
    if (!el.levelList) return;
    el.levelList.innerHTML = levels.map(level => {
      const stat = getLevelStat(level.id);
      const acc = accuracy(stat.correct, stat.answered);
      const active = level.id === currentLevel ? ' active' : '';
      return `<button type="button" class="gy-level-btn${active}" data-level="${escapeHtml(level.id)}">
        <strong>${escapeHtml(level.name)} <span>${acc}%</span></strong>
        <small>${escapeHtml(level.description)} · ${stat.answered} soal dijawab</small>
      </button>`;
    }).join('');
    el.levelList.querySelectorAll('[data-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLevel = btn.getAttribute('data-level');
        answered = false;
        renderAll();
        pickQuestion();
      });
    });
  }

  function renderTopics() {
    if (!el.topicGrid) return;
    const level = levels.find(item => item.id === currentLevel) || levels[0];
    const topics = Array.isArray(level?.topics) ? level.topics : [];
    el.topicGrid.innerHTML = topics.map(topic => `<article class="gy-topic">
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.body)}</p>
      ${Array.isArray(topic.points) ? `<ul>${topic.points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}</ul>` : ''}
      ${topic.example ? `<div class="gy-example">${escapeHtml(topic.example)}</div>` : ''}
    </article>`).join('') || '<div class="gy-empty">Materi level ini belum tersedia.</div>';
  }

  function renderRoadmap() {
    if (!el.roadmap) return;
    el.roadmap.innerHTML = levels.map(level => `<div class="gy-road-step">
      <b>${escapeHtml(level.name)}</b>
      <span>${escapeHtml(level.goal || level.description || '')}</span>
    </div>`).join('');
  }

  function renderAi() {
    const rec = recommendation();
    if (el.aiLevel) el.aiLevel.textContent = rec.label;
    if (el.aiReason) el.aiReason.textContent = rec.reason;
    if (el.progressBar) el.progressBar.style.width = `${Math.max(0, Math.min(100, rec.mastery))}%`;
    if (el.statAnswered) el.statAnswered.textContent = state.answered;
    if (el.statAccuracy) el.statAccuracy.textContent = `${accuracy()}%`;
    if (el.statMastery) el.statMastery.textContent = `${Math.max(0, Math.min(100, rec.mastery))}%`;
  }

  function questionPool() {
    const pool = questions.filter(q => q.level === currentLevel);
    return pool.length ? pool : questions;
  }

  function pickQuestion() {
    const pool = questionPool();
    if (!pool.length || !el.questionText || !el.options) return;
    let available = pool.filter(q => !state.seen.includes(q.id));
    if (!available.length) {
      state.seen = state.seen.filter(id => !pool.some(q => q.id === id));
      available = pool;
    }
    currentQuestion = available[Math.floor(Math.random() * available.length)];
    answered = false;
    if (!state.seen.includes(currentQuestion.id)) state.seen.push(currentQuestion.id);
    if (state.seen.length > 60) state.seen = state.seen.slice(-60);
    saveState();
    renderQuestion();
  }

  function renderQuestion() {
    if (!currentQuestion) return;
    const level = levels.find(item => item.id === currentLevel);
    if (el.questionMeta) el.questionMeta.textContent = `${level?.name || 'Latihan'} · ${currentQuestion.skill || 'Konsep'}`;
    if (el.questionText) el.questionText.textContent = currentQuestion.question;
    if (el.feedback) {
      el.feedback.classList.remove('show');
      el.feedback.innerHTML = '';
    }
    if (el.options) {
      el.options.innerHTML = currentQuestion.options.map((option, index) => `<button type="button" class="gy-option" data-answer="${index}">${escapeHtml(option)}</button>`).join('');
      el.options.querySelectorAll('[data-answer]').forEach(btn => {
        btn.addEventListener('click', () => answerQuestion(Number(btn.getAttribute('data-answer')), btn));
      });
    }
  }

  function answerQuestion(choice, button) {
    if (!currentQuestion || answered) return;
    answered = true;
    const isCorrect = choice === currentQuestion.answer;
    state.answered += 1;
    if (isCorrect) state.correct += 1;
    const stat = getLevelStat(currentLevel);
    stat.answered += 1;
    if (isCorrect) stat.correct += 1;
    saveState();

    if (el.options) {
      el.options.querySelectorAll('.gy-option').forEach((btn, index) => {
        btn.disabled = true;
        if (index === currentQuestion.answer) btn.classList.add('correct');
      });
    }
    if (!isCorrect && button) button.classList.add('wrong');
    if (el.feedback) {
      el.feedback.classList.add('show');
      el.feedback.innerHTML = `<b>${isCorrect ? 'Benar.' : 'Belum tepat.'}</b> ${escapeHtml(currentQuestion.explain || '')}`;
    }
    renderAi();
    renderLevels();
  }

  function renderAll() {
    renderLevels();
    renderTopics();
    renderRoadmap();
    renderAi();
  }

  function resetProgress() {
    if (!confirm('Reset progres modul ini untuk user sekarang?')) return;
    localStorage.removeItem(storageKey);
    location.reload();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
  }

  if (el.nextBtn) el.nextBtn.addEventListener('click', pickQuestion);
  if (el.resetBtn) el.resetBtn.addEventListener('click', resetProgress);

  renderAll();
  pickQuestion();
})();
