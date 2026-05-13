/* global window */
(function () {
  'use strict';

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>'"]/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;',
    }[m]));
  }

  const re = /([\u3400-\u9FFF\uF900-\uFAFF\u3005]+)\[([\u3041-\u309F\u30A1-\u30FF\u30FC]+)\]/g;

  function parseFuriganaToHtml(text) {
    const t = String(text ?? '');
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(t)) !== null) {
      if (m.index > last) out += escapeHtml(t.slice(last, m.index));
      const kanji = escapeHtml(m[1]);
      const reading = escapeHtml(m[2]);
      out += `<ruby class="[ruby-position:under] mx-0.5">${kanji}<rt class="text-[10px] text-sky-300/90 tracking-tight leading-none">${reading}</rt></ruby>`;
      last = re.lastIndex;
    }
    if (last < t.length) out += escapeHtml(t.slice(last));
    return out || escapeHtml(t);
  }

  window.GemuFurigana = { escapeHtml, parseFuriganaToHtml };
})();
