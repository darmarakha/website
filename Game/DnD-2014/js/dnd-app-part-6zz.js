
(function () {
  "use strict";

  const app = document.getElementById("dnd-app");
  const DATA = window.DND2014_DATA;
  const STORAGE_KEY = "gemuyokai_dnd2014_state_v1";
  if (!app || !DATA) return;

  const abilityIds = ["str", "dex", "con", "int", "wis", "cha"];
  const abilityLabelMap = {
    STR: "Strength",
    DEX: "Dexterity",
    CON: "Constitution",
    INT: "Intelligence",
    WIS: "Wisdom",
    CHA: "Charisma"
  };

  function htmlEscape(value) {
    return String(value ?? "").replace(/[&<>\"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char];
    });
  }

  function signed(value) {
    const number = Number(value || 0);
    return (number >= 0 ? "+" : "") + number;
  }

  function abilityMod(score) {
    return Math.floor((Number(score || 10) - 10) / 2);
  }

  function skillLabel(skillId) {
    return (DATA.skills || []).find(function (skill) { return skill.id === skillId; })?.label || skillId;
  }

  function readStateFromLocalStorage() {
    const keys = [STORAGE_KEY];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && /dnd|gemuyokai/i.test(key) && !keys.includes(key)) keys.push(key);
      }
    } catch (error) {
      return null;
    }

    for (const key of keys) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "null");
        if (data && Array.isArray(data.characters)) return { key, data };
      } catch (error) {
        // skip broken/old browser save
      }
    }
    return null;
  }

  function writeStateToLocalStorage(key, data) {
    if (!key || !data) return;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) {}
  }

  function currentSheetName() {
    return document.querySelector(".character-sheet-preview .sheet-header h2")?.textContent?.trim() || "";
  }

  function findCharacterBySheetName() {
    const found = readStateFromLocalStorage();
    if (!found) return null;
    const name = currentSheetName().toLowerCase();
    const activeId = found.data.activeCharacterId || "";
    const character = (found.data.characters || []).find(function (item) {
      return item.id === activeId && item.name;
    }) || (found.data.characters || []).find(function (item) {
      return String(item.name || "").toLowerCase() === name;
    });
    return character ? { storage: found, character } : null;
  }

  function injectStyle() {
    if (document.getElementById("gy-dnd-sheet-hotfix-style")) return;
    const style = document.createElement("style");
    style.id = "gy-dnd-sheet-hotfix-style";
    style.textContent = `
      .avatar-medallion.has-character-image{overflow:hidden;padding:0;background:#140b07;border:2px solid rgba(255,214,139,.75)}
      .avatar-medallion.has-character-image img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
      .character-sheet-preview .stat-box.gy-rollable-ability{cursor:pointer;position:relative;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
      .character-sheet-preview .stat-box.gy-rollable-ability:hover{transform:translateY(-2px);border-color:rgba(255,214,139,.75);box-shadow:0 0 0 1px rgba(255,214,139,.25),0 10px 22px rgba(0,0,0,.25)}
      .character-sheet-preview .stat-box.gy-rollable-ability::after{content:'roll d20';position:absolute;right:.55rem;bottom:.45rem;font-size:.62rem;opacity:.55;letter-spacing:.04em;text-transform:uppercase}
      .gy-dnd-roll-pop{position:fixed;right:1rem;bottom:1rem;z-index:99999;min-width:220px;max-width:min(360px,calc(100vw - 2rem));padding:.85rem 1rem;border:1px solid rgba(255,214,139,.5);border-radius:16px;background:rgba(20,11,7,.96);color:#fff7df;box-shadow:0 18px 44px rgba(0,0,0,.38);font-family:inherit;transform:translateY(16px);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}
      .gy-dnd-roll-pop.is-show{opacity:1;transform:translateY(0)}
      .gy-dnd-roll-pop strong{display:block;font-size:1rem;color:#ffe0a0}.gy-dnd-roll-pop span{display:block;margin-top:.25rem;font-size:.86rem;color:#cdbfae}.gy-dnd-roll-pop b{color:#b8ffae}
    `;
    document.head.appendChild(style);
  }

  function patchCharacterPortrait() {
    const medal = document.querySelector(".character-sheet-preview .sheet-header .avatar-medallion");
    if (!medal) return;
    const match = findCharacterBySheetName();
    const portrait = match?.character?.portrait || match?.character?.avatar || "";
    if (!portrait || medal.querySelector("img")?.getAttribute("src") === portrait) return;
    medal.classList.add("has-character-image");
    medal.innerHTML = `<img src="${htmlEscape(portrait)}" alt="Foto karakter ${htmlEscape(match.character.name || "")}">`;
  }

  function patchCharacterPortraitFromFile(input) {
    const file = input?.files?.[0];
    if (!file || !/^image\/(png|jpe?g|webp)$/i.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = function () {
      const medal = document.querySelector(".character-sheet-preview .sheet-header .avatar-medallion");
      if (!medal || !reader.result) return;
      medal.classList.add("has-character-image");
      medal.innerHTML = `<img src="${htmlEscape(reader.result)}" alt="Preview foto karakter">`;
    };
    reader.readAsDataURL(file);
  }

  function optionHtml(value, label, selected) {
    return `<option value="${htmlEscape(value)}" ${selected ? "selected" : ""}>${htmlEscape(label)}</option>`;
  }

  function checkedSkillIds(form) {
    return Array.from(form.querySelectorAll("input[name='skills']:checked"))
      .map(function (input) { return String(input.value || "").trim(); })
      .filter(Boolean)
      .filter(function (value, index, list) { return list.indexOf(value) === index; });
  }

  function formHasThievesTools(form) {
    const classId = String(form.querySelector("select[name='classNameField']")?.value || "").trim();
    if (classId === "rogue") return true;
    const text = [
      form.querySelector("select[name='startingPackage'] option:checked")?.textContent || "",
      form.textContent || ""
    ].join(" ");
    return /thieves' tools/i.test(text);
  }

  function patchExpertiseHeading(form) {
    const selects = form ? Array.from(form.querySelectorAll("select[name^='expertise-']")) : [];
    if (!selects.length) return;
    const field = selects[0].closest(".dnd-field");
    const grid = field?.closest(".dnd-form-grid");
    let node = grid?.previousElementSibling;
    while (node) {
      if (node.tagName === "H3" && /expertise/i.test(node.textContent || "")) {
        node.textContent = "Expertise dari Skill Proficiency";
        break;
      }
      if (node.tagName === "H3") break;
      node = node.previousElementSibling;
    }
  }

  function syncExpertiseFromSkillProficiency(form) {
    if (!form || form.id !== "character-form") return;
    const selects = Array.from(form.querySelectorAll("select[name^='expertise-']"));
    if (!selects.length) return;

    patchExpertiseHeading(form);

    const skills = checkedSkillIds(form);
    const allowed = new Set(skills.map(function (id) { return "skill:" + id; }));
    if (formHasThievesTools(form)) allowed.add("tool:thieves_tools");

    const previous = selects.map(function (select) { return String(select.value || "").trim(); })
      .filter(function (value) { return allowed.has(value); });
    const used = new Set();

    selects.forEach(function (select, index) {
      const oldValue = allowed.has(select.value) && !used.has(select.value) ? select.value : (previous[index] || "");
      let html = optionHtml("", skills.length ? "— Pilih skill/tool —" : "— Pilih Skill Proficiency dulu —", !oldValue);

      skills.forEach(function (skillId) {
        const value = "skill:" + skillId;
        const selected = oldValue === value && !used.has(value);
        html += optionHtml(value, skillLabel(skillId), selected);
      });

      if (allowed.has("tool:thieves_tools")) {
        const value = "tool:thieves_tools";
        const selected = oldValue === value && !used.has(value);
        html += optionHtml(value, "Thieves' Tools", selected);
      }

      select.innerHTML = html;
      select.disabled = !allowed.size;
      if (select.value) used.add(select.value);
    });
  }

  function scheduleExpertiseSync() {
    const form = document.getElementById("character-form");
    if (!form) return;
    window.requestAnimationFrame(function () {
      syncExpertiseFromSkillProficiency(form);
      window.requestAnimationFrame(function () { syncExpertiseFromSkillProficiency(form); });
    });
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function parseDiceExpression(expression) {
    const raw = String(expression || "").replace(/\s+/g, "");
    const normalized = /^[+-]?\d+$/.test(raw) ? "1d20" + raw : raw;
    const terms = normalized.match(/[+-]?[^+-]+/g) || [];
    const rolls = [];
    let total = 0;

    terms.forEach(function (term) {
      const sign = term.startsWith("-") ? -1 : 1;
      const clean = term.replace(/^[+-]/, "");
      const dice = clean.match(/^(\d*)d(\d+)$/i);
      if (dice) {
        const count = Math.max(1, Math.min(100, Number(dice[1] || 1)));
        const sides = Math.max(2, Math.min(1000, Number(dice[2] || 20)));
        const values = Array.from({ length: count }, function () { return randomInt(1, sides); });
        const subtotal = values.reduce(function (sum, value) { return sum + value; }, 0) * sign;
        rolls.push((sign < 0 ? "-" : "") + count + "d" + sides + " [" + values.join(", ") + "]");
        total += subtotal;
      } else if (/^\d+$/.test(clean)) {
        const value = Number(clean) * sign;
        rolls.push((value >= 0 ? "+" : "") + value);
        total += value;
      }
    });

    return { total, detail: rolls.join(" + ").replace(/\+ -/g, "- "), expression: normalized || "1d20" };
  }

  function showRollPopup(label, total, detail, user) {
    let popup = document.getElementById("gy-dnd-roll-pop");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "gy-dnd-roll-pop";
      popup.className = "gy-dnd-roll-pop";
      document.body.appendChild(popup);
    }
    popup.innerHTML = `<strong>${htmlEscape(label)}: <b>${htmlEscape(total)}</b></strong><span>${htmlEscape(detail)}${user ? " · " + htmlEscape(user) : ""}</span>`;
    popup.classList.add("is-show");
    window.clearTimeout(showRollPopup.timer);
    showRollPopup.timer = window.setTimeout(function () { popup.classList.remove("is-show"); }, 3200);

    const toast = document.getElementById("dnd-toast");
    if (toast) {
      toast.textContent = label + ": " + total;
      toast.classList.add("show");
      window.clearTimeout(showRollPopup.toastTimer);
      showRollPopup.toastTimer = window.setTimeout(function () { toast.classList.remove("show"); }, 2200);
    }
  }

  function prependRollLog(label, total, detail, user) {
    const diceFace = document.getElementById("dice-face");
    const diceLabel = document.getElementById("dice-label");
    const diceDetail = document.getElementById("dice-detail");
    if (diceFace) diceFace.textContent = String(total);
    if (diceLabel) diceLabel.textContent = label;
    if (diceDetail) diceDetail.textContent = detail;

    const log = document.querySelector(".roll-log");
    if (log) {
      const row = document.createElement("div");
      row.className = "log-row";
      row.innerHTML = `<span><strong>${htmlEscape(label)}</strong><small>${htmlEscape(detail)} | ${htmlEscape(user || "Player")}</small></span><span class="dnd-pill good">${htmlEscape(total)}</span>`;
      log.prepend(row);
    }

    const found = readStateFromLocalStorage();
    if (found) {
      found.data.rollLog = Array.isArray(found.data.rollLog) ? found.data.rollLog : [];
      found.data.rollLog.unshift({
        id: "roll_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5),
        label,
        total,
        detail,
        user: user || "Player",
        createdAt: new Date().toISOString()
      });
      found.data.rollLog = found.data.rollLog.slice(0, 120);
      writeStateToLocalStorage(found.key, found.data);
    }
  }

  window.rollExpression = function (expression, label, user) {
    const result = parseDiceExpression(expression);
    prependRollLog(label || result.expression, result.total, result.detail, user || currentSheetName() || "Player");
    showRollPopup(label || result.expression, result.total, result.detail, user || currentSheetName() || "Player");
    return result.total;
  };

  if (typeof window.toggleInspiration !== "function") {
    window.toggleInspiration = function (characterId) {
      const found = readStateFromLocalStorage();
      if (!found) return;
      const character = (found.data.characters || []).find(function (item) { return item.id === characterId; });
      if (!character) return;
      character.inspiration = !character.inspiration;
      character.updatedAt = new Date().toISOString();
      writeStateToLocalStorage(found.key, found.data);
      const pill = Array.from(document.querySelectorAll(".character-sheet-preview .dnd-pill")).find(function (node) {
        return /Inspiration:/i.test(node.textContent || "");
      });
      if (pill) {
        pill.textContent = "Inspiration: " + (character.inspiration ? "YES" : "NO");
        pill.classList.toggle("active-inspiration", !!character.inspiration);
      }
    };
  }

  function abilityFromStatBox(box) {
    const shortLabel = String(box.querySelector("small")?.textContent || "").trim().slice(0, 3).toUpperCase();
    const fullLabel = abilityLabelMap[shortLabel] || shortLabel;
    const score = Number(box.querySelector("strong")?.textContent || 10);
    const displayedMod = String(box.querySelector("span")?.textContent || "").trim();
    const modifier = /^[-+]?\d+$/.test(displayedMod) ? Number(displayedMod) : abilityMod(score);
    return { shortLabel, fullLabel, score, modifier };
  }

  function patchAbilityBoxes() {
    document.querySelectorAll(".character-sheet-preview .stat-grid .stat-box").forEach(function (box) {
      if (box.closest(".ability-assign-grid")) return;
      if (box.dataset.gyAbilityRollBound === "1") return;
      const ability = abilityFromStatBox(box);
      if (!abilityIds.map(function (id) { return id.toUpperCase(); }).includes(ability.shortLabel)) return;
      box.dataset.gyAbilityRollBound = "1";
      box.classList.add("gy-rollable-ability");
      box.setAttribute("role", "button");
      box.setAttribute("tabindex", "0");
      box.title = "Klik untuk roll d20 + modifier " + ability.fullLabel + " sesuai D&D 2014 5e";
    });
  }

  function handleAbilityBoxRoll(box) {
    const ability = abilityFromStatBox(box);
    if (!abilityIds.map(function (id) { return id.toUpperCase(); }).includes(ability.shortLabel)) return;
    window.rollExpression(signed(ability.modifier), ability.fullLabel + " Ability Check", currentSheetName() || "Character");
  }

  document.addEventListener("click", function (event) {
    const abilityBox = event.target?.closest?.(".character-sheet-preview .stat-grid .stat-box.gy-rollable-ability");
    if (abilityBox) {
      handleAbilityBoxRoll(abilityBox);
      return;
    }
    if (event.target?.matches?.("input[name='skills'], select[name='race'], select[name='subrace'], select[name='classNameField'], select[name^='expertise-'], select[name='startingPackage']")) {
      scheduleExpertiseSync();
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const abilityBox = event.target?.closest?.(".character-sheet-preview .stat-grid .stat-box.gy-rollable-ability");
    if (!abilityBox) return;
    event.preventDefault();
    handleAbilityBoxRoll(abilityBox);
  }, true);

  document.addEventListener("change", function (event) {
    if (event.target?.id === "characterPortraitInput") patchCharacterPortraitFromFile(event.target);
    if (event.target?.closest?.("#character-form")) scheduleExpertiseSync();
  }, true);

  const observer = new MutationObserver(function () {
    injectStyle();
    patchCharacterPortrait();
    patchAbilityBoxes();
    scheduleExpertiseSync();
  });
  observer.observe(app, { childList: true, subtree: true });

  window.addEventListener("load", function () {
    injectStyle();
    patchCharacterPortrait();
    patchAbilityBoxes();
    scheduleExpertiseSync();
  });

  injectStyle();
  patchCharacterPortrait();
  patchAbilityBoxes();
  scheduleExpertiseSync();
})();
