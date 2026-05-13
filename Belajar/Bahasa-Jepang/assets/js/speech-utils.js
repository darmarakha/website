/* global window, document */
(function () {
  'use strict';

  const supportsSpeech = () =>
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function';

  const supportsRecognition = () =>
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  let cachedVoices = [];
  let voicesPromise = null;
  let speechUnlocked = false;
  let keepAliveTimer = null;

  function loadVoices() {
    if (!supportsSpeech()) return [];
    cachedVoices = window.speechSynthesis.getVoices() || [];
    return cachedVoices;
  }

  function waitForVoices(timeoutMs = 2500) {
    if (!supportsSpeech()) return Promise.resolve([]);
    loadVoices();
    if (cachedVoices.length) return Promise.resolve(cachedVoices);
    if (voicesPromise) return voicesPromise;

    voicesPromise = new Promise((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        loadVoices();
        resolve(cachedVoices);
        voicesPromise = null;
      };

      const onChanged = () => finish();
      const tick = window.setInterval(() => {
        loadVoices();
        if (cachedVoices.length) finish();
      }, 150);
      const to = window.setTimeout(finish, timeoutMs);

      const cleanup = () => {
        try {
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
        } catch (_) {}
        window.clearInterval(tick);
        window.clearTimeout(to);
      };

      try {
        window.speechSynthesis.addEventListener('voiceschanged', onChanged);
      } catch (_) {
        // Older engines: polling will handle it.
      }
    });

    return voicesPromise;
  }

  function startChromeKeepAlive() {
    if (!supportsSpeech()) return;
    stopChromeKeepAlive();
    keepAliveTimer = window.setInterval(() => {
      try {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch (_) {}
    }, 10000);
  }

  function stopChromeKeepAlive() {
    if (keepAliveTimer) {
      window.clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }

  function cancelSpeak() {
    if (!supportsSpeech()) return;
    try {
      stopChromeKeepAlive();
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  function stripEmoji(text) {
    const s = String(text || '');
    return s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u200D\uFE0F]/gu, '');
  }

  function furiganaToReading(text) {
    return String(text || '').replace(
      /([\u3400-\u9FFF\uF900-\uFAFF\u3005]+)\[([\u3041-\u309F\u30A1-\u30FF\u30FC]+)\]/g,
      '$2'
    );
  }

  function cleanForSpeech(text) {
    let cleaned = stripEmoji(String(text || ''));
    cleaned = furiganaToReading(cleaned);
    cleaned = cleaned.replace(/\[.*?\]/g, '');
    cleaned = cleaned.replace(/[*#]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  function splitForSpeech(text, maxLen = 140) {
    const s = String(text || '').trim();
    if (!s) return [];

    const parts = s
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .flatMap((p) => p.split(/(?<=[。．.!?？])\s+/));

    const out = [];
    for (const part of parts) {
      if (part.length <= maxLen) {
        out.push(part);
        continue;
      }
      for (let i = 0; i < part.length; i += maxLen) {
        out.push(part.slice(i, i + maxLen));
      }
    }
    return out.filter(Boolean);
  }

  function pickJapaneseVoice(prefer = 'any') {
    loadVoices();
    const voices = cachedVoices;
    const ja = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('ja'));
    if (!ja.length) return null;

    if (prefer === 'female') {
      return (
        ja.find((v) => /haruka|ayumi|nanami|kyoko|female|woman|女/i.test(v.name)) ||
        ja[0]
      );
    }
    if (prefer === 'male') {
      return ja.find((v) => /ichiro|show|takumi|male|man|男/i.test(v.name)) || ja[0];
    }
    return ja[0];
  }

  function unlockSpeechOnce() {
    if (speechUnlocked || !supportsSpeech()) return;
    speechUnlocked = true;
    try {
      const u = new window.SpeechSynthesisUtterance('あ');
      u.lang = 'ja-JP';
      u.volume = 0.01;
      u.rate = 1.0;
      const v = pickJapaneseVoice('any');
      if (v) u.voice = v;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      window.setTimeout(() => {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }, 80);
    } catch (_) {}
  }

  function installAutoUnlock() {
    if (typeof window === 'undefined') return;
    window.addEventListener('pointerdown', unlockSpeechOnce, { once: true, passive: true });
    window.addEventListener('touchstart', unlockSpeechOnce, { once: true, passive: true });
  }

  async function speak(text, opts = {}) {
    if (!supportsSpeech()) return false;
    const clean = cleanForSpeech(text);
    if (!clean) return false;

    await waitForVoices(2500);

    const chunks = splitForSpeech(clean, opts.maxLen || 140);
    if (!chunks.length) return false;

    cancelSpeak();
    startChromeKeepAlive();

    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        const u = new window.SpeechSynthesisUtterance(chunk);
        u.lang = 'ja-JP';
        u.rate = typeof opts.rate === 'number' ? opts.rate : 0.9;
        u.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1.0;
        u.volume = typeof opts.volume === 'number' ? opts.volume : 1.0;
        const v = opts.voice || pickJapaneseVoice(opts.voicePrefer || 'any');
        if (v) u.voice = v;

        // Some voices/browsers intermittently never fire `onend` (esp. non-English voices).
        // Watchdog ensures we don't hang the UI.
        const estMs = Math.max(1400, Math.min(12000, Math.round((chunk.length * 85) / Math.max(0.3, u.rate)) + 1200));
        const watchdog = window.setTimeout(() => resolve(), estMs);

        const finish = () => {
          window.clearTimeout(watchdog);
          resolve();
        };

        u.onend = finish;
        u.onerror = finish;

        try {
          window.speechSynthesis.speak(u);
        } catch (_) {
          finish();
        }
      });
    }

    stopChromeKeepAlive();
    return true;
  }

  window.GemuSpeech = {
    supportsSpeech,
    supportsRecognition,
    waitForVoices,
    pickJapaneseVoice,
    cleanForSpeech,
    cancelSpeak,
    speak,
    installAutoUnlock,
  };

  installAutoUnlock();
})();
