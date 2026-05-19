(function () {
  "use strict";

  const DATA = window.DND2014_DATA;
  const STORAGE_KEY = "gemuyokai_dnd2014_state_v1";
  const OWNER_MODE_KEY = "gemuyokai_dnd_owner_entry_mode_v31";
  const app = document.getElementById("dnd-app");
  const toastEl = document.getElementById("dnd-toast");
  if (!app || !DATA) return;
  const apiUrl = (app.dataset.api || "").trim();
  const authApiUrl = (app.dataset.authApi || "").trim();
  const imageApiUrl = (app.dataset.imageApi || "dnd_image_api.php").trim();
  const websiteAuthApiUrl = (app.dataset.websiteAuthApi || "../../auth.php").trim();
  const loginUrl = (app.dataset.loginUrl || "../../index.php").trim();
  const signupUrl = (app.dataset.signupUrl || "../../index.php").trim();
  const syncToken = (app.dataset.syncToken || "").trim();
  let syncTimer = null;
  let syncBusy = false;
  let syncPendingShow = false;
  let syncWarned = false;

  const sessionId = (app.dataset.sessionId || "").trim();
  const sessionName = (app.dataset.sessionName || "").trim();
  const sessionEmail = (app.dataset.sessionEmail || "").trim().toLowerCase();
  const sessionRole = (app.dataset.sessionRole || "").trim().toLowerCase();

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const getValue = (id, root = document) => (qs("#" + id, root)?.value || "").trim();
  const nowIso = () => new Date().toISOString();
  const uid = (prefix) => prefix + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const titleCase = (value) => String(value || "").replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  const abilityLabel = (id) => DATA.abilities.find((a) => a.id === id)?.label || id.toUpperCase();
  const raceById = (id) => DATA.races.find((r) => r.id === id) || DATA.races[0];
  const raceExtension = (id) => DATA.raceExtensions?.[id] || { baseLanguages: ["common"], extraLanguageChoices: 0, subraces: [] };
  const subracesForRace = (raceId) => raceExtension(raceId).subraces || [];
  const subraceById = (raceId, subraceId) => subracesForRace(raceId).find((s) => s.id === subraceId) || null;
  const classById = (id) => DATA.classes.find((c) => c.id === id) || DATA.classes[4];
  const itemByName = (name) => (DATA.items || []).find((item) => String(item.name).toLowerCase() === String(name || "").toLowerCase()) || null;
  function classSkillOptions(classId) {
    if (!classId) return [];
    const klass = classById(classId);
    const options = Array.isArray(klass.skillOptions) ? klass.skillOptions : [];
    if (options.includes("*")) return DATA.skills;
    const allowed = new Set(options);
    return DATA.skills.filter((skill) => allowed.has(skill.id));
  }
  function classSkillIds(classId) {
    return new Set(classSkillOptions(classId).map((skill) => skill.id));
  }
  function raceAutomaticSkillIds(draft = {}) {
    const raceId = draft.race || "";
    if (!raceId) return [];
    const ext = raceExtension(raceId);
    const ids = Array.isArray(ext.automaticSkills) ? [...ext.automaticSkills] : [];
    return [...new Set(ids)].filter((id) => DATA.skills.some((skill) => skill.id === id));
  }
  function raceSkillChoiceCount(draft = {}) {
    if (!draft.race) return 0;
    const ext = raceExtension(draft.race);
    return Number(ext.skillChoiceCount || 0);
  }
  function raceSkillChoiceOptions(draft = {}) {
    if (!raceSkillChoiceCount(draft)) return [];
    const automatic = new Set(raceAutomaticSkillIds(draft));
    return DATA.skills.filter((skill) => !automatic.has(skill.id));
  }
  function uniqueSkillIds(ids) {
    const valid = new Set(DATA.skills.map((skill) => skill.id));
    return [...new Set((ids || []).filter((id) => valid.has(id)))];
  }
  function skillSelectionBreakdown(skills = [], draft = {}) {
    const selected = uniqueSkillIds(skills);
    const classAllowed = classSkillIds(draft.className);
    const klass = draft.className ? classById(draft.className) : null;
    const classLimit = Number(klass?.skillPick || 0);
    const automaticRace = raceAutomaticSkillIds(draft);
    const automaticSet = new Set(automaticRace);
    const classSelected = selected.filter((id) => classAllowed.has(id) && !automaticSet.has(id)).slice(0, classLimit);
    const classSelectedSet = new Set(classSelected);
    const raceLimit = raceSkillChoiceCount(draft);
    const raceAllowed = new Set(raceSkillChoiceOptions(draft).map((skill) => skill.id));
    const raceSelected = selected.filter((id) => raceAllowed.has(id) && !classSelectedSet.has(id) && !automaticSet.has(id)).slice(0, raceLimit);
    const all = uniqueSkillIds([...classSelected, ...raceSelected, ...automaticRace]);
    return { classSelected, raceSelected, automaticRace, all, classLimit, raceLimit };
  }
  function collectSkillSelectionsFromForm(form, draft = {}) {
    if (!form) return skillSelectionBreakdown(draft.skills || [], draft).all;
    const classSelected = qsa("input[name='skills'][data-skill-source='class']:checked", form).map((el) => el.value);
    const raceSelected = qsa("input[name='skills'][data-skill-source='race']:checked", form).map((el) => el.value);
    const combined = [...classSelected, ...raceSelected, ...raceAutomaticSkillIds(draft)];
    return skillSelectionBreakdown(combined, draft).all;
  }
  const skillById = (id) => DATA.skills.find((s) => s.id === id);
  const languageById = (id) => DATA.languages?.find((l) => l.id === id) || null;
  const mod = (score) => Math.floor((Number(score || 10) - 10) / 2);
  const signed = (n) => (n >= 0 ? "+" + n : String(n));
  const proficiencyBonus = (level) => 2 + Math.floor((clamp(level, 1, 20) - 1) / 4);
  const initials = (name) => (String(name || "Hero").match(/\b\w/g) || ["H"]).slice(0, 2).join("").toUpperCase();
  const CHARACTER_STEPS = [
    { id: "race", label: "1. Ras", title: "Pilih Ras" },
    { id: "class", label: "2. Kelas", title: "Pilih Kelas" },
    { id: "abilities", label: "3. Ability", title: "Tentukan Skor Kemampuan" },
    { id: "describe", label: "4. Deskripsi", title: "Deskripsikan Karakter" },
    { id: "equipment", label: "5. Equipment", title: "Pilih Perlengkapan" }
  ];
  const CHARACTER_STEP_IDS = CHARACTER_STEPS.map((step) => step.id);
  const emptyAbilityScores = () => DATA.abilities.reduce((scores, ability) => {
    scores[ability.id] = 0;
    return scores;
  }, {});
  function createBlankCharacterDraft() {
    return {
      id: "",
      name: "",
      race: "",
      subrace: "",
      languages: [],
      languageChoices: [],
      className: "",
      level: 1,
      background: "",
      alignment: "",
      personalityTraits: ["", ""],
      ideal: "",
      bond: "",
      flaw: "",
      baseAbilities: emptyAbilityScores(),
      abilities: emptyAbilityScores(),
      abilityChoices: [],
      abilityBonuses: {},
      skills: [],
      inspiration: 0,
      hitDiceRemaining: 1,
      attacks: [],
      appearance: { hair: "", eyes: "", skin: "", style: "", notes: "" },
      startingChoice: null,
      gold: 0,
      inventory: []
    };
  }


  let state = loadState();
  let bootingFromSql = true;
  normalizeStoredCharacters();
  seedSessionAccount();
  seedSystemAiNotes();
  render();
  syncLoadFromSql().finally(() => {
    bootingFromSql = false;
  });

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action) {
      event.preventDefault();
      handleAction(action, trigger);
    }
  });

  document.addEventListener("change", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "characterPortraitInput") {
      handleCharacterPortraitFile(target.files?.[0]);
      return;
    }
    if (target.id === "mapImageUpload") {
      handleMapImageFile(target.files?.[0]);
      return;
    }
    if (target.closest("#character-form")) {
      if (target.matches("select[data-ability-pick]")) {
        applyAbilityRollPick(target);
        return;
      }
      if (target.matches("input[name='skills']")) {
        enforceSkillCheckboxLimit(target);
        state.ui.characterDraft = characterDraftFromForm(qs("#character-form"));
        render();
        return;
      }
      if (target.matches("select[name='race'], select[name='classNameField']")) {
        state.ui.characterDraft = characterDraftFromForm(qs("#character-form"));
        render();
        return;
      }
      updateCharacterBuilderGuide();
    }
    if (target.id === "active-character-select") {
      state.activeCharacterId = target.value;
      if (state.activeCharacterId && state.activeCharacterId !== "__new_character__") {
          toast("Memuat detail karakter...");
          loadFullCharacter(state.activeCharacterId).then(() => {
              render();
          });
      }
      saveState(false, 'character');
      render();
    }
    if (target.id === "active-map-select") {
      setRoomActiveMap(target.value);
      return;
    }
    if (target.id === "room-active-map-select") {
      setRoomActiveMap(target.value);
      return;
    }
    if (target.id === "selected-npc-select") {
      state.ui.selectedNpcId = target.value;
      saveState();
      render();
    }
  });

  document.addEventListener("input", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("#character-form")) {
      if (target.matches("input[name^='ability-']")) {
        if (!userIsOwner(currentUser())) {
          target.readOnly = true;
          toast("Input manual skor kemampuan hanya untuk Owner. Gunakan dropdown hasil roll/standard.");
          return updateCharacterBuilderGuide();
        }
        const normalized = normalizeAbilityBaseValue(target.value, true);
        if (String(target.value) !== String(normalized)) target.value = String(normalized);
      }
      updateCharacterBuilderGuide();
    }
  });

  function loadState() {
    purgeLegacyBrowserSave();
    return defaultState();
  }

  function purgeLegacyBrowserSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("gemuyokai_dnd2014_auth");
      localStorage.removeItem("gemuyokai_dnd2014_accounts");
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("DND legacy browser save purge skipped", error);
    }
  }

  function mergeState(base, loaded) {
    return {
      ...base,
      ...loaded,
      ui: { ...base.ui, ...(loaded.ui || {}) },
      campaign: { ...base.campaign, ...(loaded.campaign || {}) },
      activeRoomId: loaded.activeRoomId || base.activeRoomId || "",
      rooms: Array.isArray(loaded.rooms) ? loaded.rooms : base.rooms,
      accounts: Array.isArray(loaded.accounts) ? loaded.accounts.filter((account) => account?.source === "website") : base.accounts,
      characters: Array.isArray(loaded.characters) ? loaded.characters : base.characters,
      maps: Array.isArray(loaded.maps) ? loaded.maps : base.maps,
      npcs: Array.isArray(loaded.npcs) ? loaded.npcs : base.npcs,
      customItems: Array.isArray(loaded.customItems) ? loaded.customItems : base.customItems,
      rollLog: Array.isArray(loaded.rollLog) ? loaded.rollLog : base.rollLog,
      sessionLog: Array.isArray(loaded.sessionLog) ? loaded.sessionLog : base.sessionLog,
      roomEvents: Array.isArray(loaded.roomEvents) ? loaded.roomEvents : base.roomEvents,
      chatLog: Array.isArray(loaded.chatLog) ? loaded.chatLog : base.chatLog,
      aiNotes: Array.isArray(loaded.aiNotes) ? loaded.aiNotes : base.aiNotes
    };
  }

  function normalizeSqlOnlyIdentity() {
    state.accounts = (state.accounts || []).filter((account) => account?.source === "website");
    if (state.ui) state.ui.showAuth = false;
    const websiteUser = state.accounts.find((account) => account.id === "php-session-user");
    if (!websiteUser) return;
    const sessionNumericId = Number(sessionId || 0);
    state.characters = (state.characters || []).map((character) => {
      const next = { ...character };
      const storedSqlOwner = Number(next.websiteUserId || next.sqlUserId || next.userId || 0);
      if (!next.ownerId || next.ownerId === "demo-player" || next.ownerId === "demo-gm" || next.ownerId === "local" || next.ownerId === "php-session-user" || (sessionNumericId && storedSqlOwner === sessionNumericId)) {
        next.ownerId = "php-session-user";
      }
      return next;
    });
    if (!state.currentUserId || !state.accounts.some((account) => account.id === state.currentUserId)) {
      state.currentUserId = "php-session-user";
    }
  }

  function defaultSubraceId(raceId) {
    return subracesForRace(raceId)[0]?.id || "";
  }

  function effectiveSubrace(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return null;
    const chosen = characterOrDraft?.subrace || "";
    return subraceById(raceId, chosen) || null;
  }

  function effectiveRaceName(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return "Belum dipilih";
    const race = raceById(raceId);
    const subrace = effectiveSubrace(characterOrDraft);
    return subrace ? `${race.name} (${subrace.name})` : race.name;
  }

  function effectiveRaceSpeed(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return 0;
    const race = raceById(raceId);
    const subrace = effectiveSubrace(characterOrDraft);
    return Number(subrace?.speed || race.speed || 30);
  }

  function effectiveRaceTraits(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return [];
    const race = raceById(raceId);
    const subrace = effectiveSubrace(characterOrDraft);
    return [...(race.traits || []), ...(subrace?.traits || [])];
  }

  function effectiveAbilityText(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return "Belum ada bonus karena race belum dipilih.";
    const base = raceExtension(raceId).abilityText || "Ikuti bonus ras dari SRD.";
    const subrace = effectiveSubrace(characterOrDraft);
    return [base, subrace?.abilityText].filter(Boolean).join(" | ");
  }


  function mergeAbilityBonuses(...sources) {
    const result = {};
    DATA.abilities.forEach((ability) => { result[ability.id] = 0; });
    sources.forEach((source) => {
      Object.entries(source || {}).forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(result, key)) result[key] += Number(value || 0);
      });
    });
    return result;
  }

  function abilityBonusMapFromText(text) {
    const result = {};
    const source = String(text || "");
    if (!source) return result;
    if (/all\s+ability\s+scores?\s*\+\s*1/i.test(source) || /semua\s+ability\s*\+\s*1/i.test(source)) {
      DATA.abilities.forEach((ability) => { result[ability.id] = 1; });
      return result;
    }
    const aliases = {
      strength: "str", dexterity: "dex", constitution: "con", intelligence: "int", wisdom: "wis", charisma: "cha",
      str: "str", dex: "dex", con: "con", int: "int", wis: "wis", cha: "cha"
    };
    const pattern = /\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma|STR|DEX|CON|INT|WIS|CHA)\b\s*\+\s*(\d+)/gi;
    let match;
    while ((match = pattern.exec(source))) {
      const key = aliases[String(match[1]).toLowerCase()];
      if (key) result[key] = Number(result[key] || 0) + Number(match[2] || 0);
    }
    return result;
  }

  function effectiveAbilityBonuses(characterOrDraft) {
    const raceId = characterOrDraft?.race || "";
    if (!raceId) return mergeAbilityBonuses();
    const ext = raceExtension(raceId);
    const race = raceById(raceId);
    const subrace = effectiveSubrace(characterOrDraft);
    const choiceBonus = {};
    const choices = Array.isArray(characterOrDraft?.abilityChoices) ? characterOrDraft.abilityChoices : [];
    if (ext.abilityChoiceCount && ext.abilityChoiceValue) {
      const exclude = new Set(ext.abilityChoiceExclude || []);
      const used = new Set();
      choices.forEach((abilityId) => {
        if (!abilityId || exclude.has(abilityId) || used.has(abilityId)) return;
        if (!DATA.abilities.some((a) => a.id === abilityId)) return;
        choiceBonus[abilityId] = Number(choiceBonus[abilityId] || 0) + Number(ext.abilityChoiceValue || 1);
        used.add(abilityId);
      });
    }
    const raceBonuses = ext.abilityBonuses || race.bonuses || abilityBonusMapFromText(ext.abilityText || race.ability);
    const subraceBonuses = subrace?.abilityBonuses || abilityBonusMapFromText(subrace?.abilityText);
    return mergeAbilityBonuses(raceBonuses, subraceBonuses, choiceBonus);
  }

  function finalAbilityScores(baseScores, characterOrDraft) {
    const bonuses = effectiveAbilityBonuses(characterOrDraft);
    const result = {};
    DATA.abilities.forEach((ability) => {
      const rawBase = Number(baseScores?.[ability.id] ?? 0);
      result[ability.id] = rawBase <= 0 ? 0 : clamp(rawBase + Number(bonuses[ability.id] || 0), 3, 30);
    });
    return result;
  }

  function abilityScoreValue(scores, abilityId, fallback = 0) {
    const raw = scores?.[abilityId];
    if (raw === undefined || raw === null || raw === "") return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  }

  function previewAbilityScore(baseValue, bonusValue) {
    const base = Number(baseValue || 0);
    const bonus = Number(bonusValue || 0);
    if (base <= 0) return bonus > 0 ? clamp(bonus, 0, 30) : 0;
    return clamp(base + bonus, 3, 30);
  }

  function abilityLiveDetailText(baseValue, bonusValue, bonusLabel = "bonus race/subrace") {
    const base = Number(baseValue || 0);
    const bonus = Number(bonusValue || 0);
    const preview = previewAbilityScore(base, bonus);
    if (base <= 0) {
      return bonus
        ? `Base 0 + ${bonusLabel} ${signed(bonus)} → sementara ${preview} · isi skor dasar`
        : "Base 0 · modifier belum aktif";
    }
    return `Base ${base}${bonus ? ` + ${bonusLabel} ${signed(bonus)}` : ""} → skor ${preview} · modifier ${signed(mod(preview))}`;
  }

  function abilityBonusSummary(characterOrDraft) {
    const bonuses = effectiveAbilityBonuses(characterOrDraft);
    const parts = DATA.abilities
      .filter((ability) => Number(bonuses[ability.id] || 0) !== 0)
      .map((ability) => `${ability.label} ${signed(Number(bonuses[ability.id] || 0))}`);
    return parts.join("; ") || "Tidak ada bonus ability bawaan.";
  }

  function extraLanguageSlots(raceId, subraceId) {
    if (!raceId) return 0;
    const ext = raceExtension(raceId);
    const subrace = subraceById(raceId, subraceId || "");
    return Number(ext.extraLanguageChoices || 0) + Number(subrace?.extraLanguageChoices || 0);
  }

  function baseLanguageIds(raceId, subraceId) {
    if (!raceId) return [];
    const ext = raceExtension(raceId);
    const subrace = subraceById(raceId, subraceId || "");
    return Array.from(new Set([...(ext.baseLanguages || ["common"]), ...(subrace?.languages || [])]));
  }

  function languageNames(ids) {
    return (ids || []).map((id) => languageById(id)?.name || titleCase(id)).join(", ");
  }

  function normalizeLanguageSelection(raceId, subraceId, selectedIds) {
    if (!raceId) return { baseIds: [], extras: [], all: [] };
    const baseIds = baseLanguageIds(raceId, subraceId);
    const slots = extraLanguageSlots(raceId, subraceId);
    const cleaned = Array.from(new Set((selectedIds || []).filter(Boolean))).filter((id) => !baseIds.includes(id));
    const extras = cleaned.slice(0, slots);
    return { baseIds, extras, all: Array.from(new Set([...baseIds, ...extras])) };
  }

  function normalizeStoredCharacters() {
    let changed = false;
    state.characters = (state.characters || []).map((character) => {
      const next = { ...character };
      const subraces = subracesForRace(next.race);
      if (subraces.length && !subraceById(next.race, next.subrace)) {
        next.subrace = subraces[0].id;
        changed = true;
      }
      if (!subraces.length && next.subrace) {
        next.subrace = "";
        changed = true;
      }
      if (!Array.isArray(next.personalityTraits)) {
        next.personalityTraits = [next.personalityTrait || "", ""];
        changed = true;
      }
      next.personalityTraits = [next.personalityTraits[0] || "", next.personalityTraits[1] || ""];
      next.ideal = next.ideal || "";
      next.bond = next.bond || "";
      next.flaw = next.flaw || "";
      const selected = Array.isArray(next.languageChoices) ? next.languageChoices : (Array.isArray(next.languages) ? next.languages : []);
      const normalized = normalizeLanguageSelection(next.race, next.subrace, selected);
      if (JSON.stringify(next.languages || []) !== JSON.stringify(normalized.all)) {
        next.languages = normalized.all;
        next.languageChoices = normalized.extras;
        changed = true;
      }
      const speed = effectiveRaceSpeed(next);
      if (Number(next.speed || 0) !== speed) {
        next.speed = speed;
        changed = true;
      }
      return next;
    });
    if (changed && !bootingFromSql) saveState(false);
  }

  function defaultState() {
    return {
      version: 1,
      currentUserId: "",
      activeRoomId: "",
      activeCharacterId: "",
      activeMapId: "",
      rooms: [],
      accounts: [],
      characters: [],
      characterDetails: {},
      dirtyCharacter: false,
      dirtyCampaign: false,
      maps: [],
      npcs: [],
      customItems: [],
      rollLog: [],
      sessionLog: [],
      roomEvents: [],
      chatLog: [],
      aiNotes: [],
      campaign: {
        name: "Gemuyokai Frontier",
        partyLevel: 1,
        safety: "D20 2014 rules helper aktif",
        playMode: "offline",
        voiceExternal: false,
        voicePlatform: "",
        startingMode: "standard",
        startingGold: 10,
        startingCustomName: "GM Custom Choice",
        startingCustomItems: "Healing Potion",
        announcementText: "Selamat bermain. Owner bisa mengubah pengumuman ini untuk info bug, maintenance, atau jadwal session.",
        lastSaved: ""
      },
      ui: {
        tab: "lobby",
        showAuth: false,
        authMode: "login",
        selectedNpcId: "",
        diceResult: 20,
        diceLabel: "d20",
        diceDetail: "single die",
        aiAnswer: "",
        search: "",
        showImport: false,
        showReward: false,
        showPdfChoice: false,
        lobbyInsideRoom: false,
        characterStep: "race",
        characterDraft: null,
        abilityRollLog: null,
        abilityPickAssignments: {},
        isVoiceNarrationActive: false
      }
    };
  }

  function hasWebsiteSession() {
    return !!(sessionId || sessionName || sessionEmail);
  }

  function isSessionOwner() {
    const haystack = `${sessionName} ${sessionEmail}`.toLowerCase();
    // Hanya Darma yang bisa jadi Owner mutlak sesuai permintaan
    return haystack.includes("darma");
  }

  function seedSessionAccount() {
    if (!hasWebsiteSession()) return;
    const owner = isSessionOwner();
    const existing = state.accounts.find((a) => a.id === "php-session-user") || null;
    const existingRoles = Array.isArray(existing?.dndRoles) ? existing.dndRoles : [];
    const existingGmActive = !owner && (existing?.role === "gm" || existingRoles.includes("gm")) && gmTimerIsActive(existing?.gmExpiresAt);
    const role = owner ? "owner" : (existingGmActive ? "gm" : "player");
    const account = {
      ...(existing || {}),
      id: "php-session-user",
      name: sessionName || existing?.name || sessionEmail || "Akun Website",
      email: sessionEmail || existing?.email || "session@gemuyokai.local",
      role,
      visibleRole: role === "gm" ? "gm" : "player",
      dndRoles: owner ? ["owner", "player", "gm"] : (existingGmActive ? ["player", "gm"] : ["player"]),
      hiddenGmPower: owner,
      gmExpiresAt: owner ? "" : (existingGmActive ? (existing?.gmExpiresAt || "") : ""),
      source: "website",
      websiteUserId: sessionId || existing?.websiteUserId || "session",
      createdAt: existing?.createdAt || nowIso(),
      updatedAt: nowIso()
    };
    const index = state.accounts.findIndex((a) => a.id === account.id);
    if (index >= 0) state.accounts[index] = account;
    else state.accounts.push(account);
    state.currentUserId = account.id;
    if (!owner && !existingGmActive && state.ui.tab === "gm") state.ui.tab = "lobby";
    normalizeSqlOnlyIdentity();
    if (!bootingFromSql) saveState(false);
  }

  function seedSystemAiNotes() {
    const notes = [
      {
        id: "system-srd-51-upgrade",
        marker: "SRD 5.1 baseline aktif",
        text: "SRD 5.1 baseline aktif: DnD 2014 table sekarang mendukung d100, GM starting options, layout responsive, rule coverage SRD, dan N5 upload ringan tanpa node_modules."
      },
      {
        id: "system-percentile-map-dialogue-upgrade",
        marker: "Percentile d100 dan cinematic map aktif",
        text: "Percentile d100 dan cinematic map aktif: d100 memakai tens die 00/10/20...90 + ones die 0-9, map generator punya landmark fantasy detail, dan mode online/offline mengatur kewajiban dialog GM/player."
      },
      {
        id: "system-dnd-login-ui-button-fix",
        marker: "DND login logout UI button fix aktif",
        text: "Update meja aktif: akun website terbaca otomatis, logout aman, GM dibatasi untuk Owner/Admin, tombol utama dirapikan, dan layout mobile-PC dibuat lebih stabil."
      },
      {
        id: "system-dnd-srd-subrace-language-v10",
        marker: "DND subrace dan bahasa SRD aktif",
        text: "DND subrace dan bahasa SRD aktif: character builder sekarang punya pilihan subrace untuk Dwarf, Elf, Halfling, dan Gnome; bahasa bawaan/opsional dijelaskan kegunaannya; PDF dan preview karakter ikut menampilkan ras lengkap serta bahasa."
      }
    ];
    let changed = false;
    notes.forEach((entry) => {
      if (state.aiNotes.some((note) => String(note.text || "").includes(entry.marker))) return;
      state.aiNotes.unshift({
        id: entry.id,
        text: entry.text,
        createdAt: nowIso(),
        user: "System"
      });
      changed = true;
    });
    if (!changed || bootingFromSql) return;
    saveState(false);
  }

  function saveState(show = false, type = 'character') {
    if (bootingFromSql) return;
    state.campaign.lastSaved = nowIso();
    normalizeSqlOnlyIdentity();

    if (type === 'character') {
        state.dirtyCharacter = true;
    } else if (type === 'campaign') {
        state.dirtyCampaign = true;
    } else {
        state.dirtyCharacter = true;
        state.dirtyCampaign = true;
    }

    if (hasWebsiteSession()) {
      scheduleSqlSave(show);
      if (show) toast("Menyimpan ke MySQL...");
    } else if (show) {
      toast("Login website dulu agar data DND tersimpan ke MySQL.");
    }
  }

  async function loadFullCharacter(characterId) {
    if (!characterId || characterId === "__new_character__") return;
    if (state.characterDetails && state.characterDetails[characterId]) return; // already loaded

    try {
        const data = await dndApi("load_character", { character_id: characterId });
        if (data && data.character) {
            state.characterDetails = state.characterDetails || {};
            state.characterDetails[characterId] = data.character;

            // Sync summary
            const index = state.characters.findIndex(c => c.id === characterId);
            if (index >= 0) {
                state.characters[index] = { ...state.characters[index], ...data.character };
            }
            render();
        }
    } catch (e) {
        console.warn("Failed to load character details", e);
    }
  }


  const dndBootLog = [];
  let bootStartedAt = performance.now();
  let loadAbortController = null;

  function resetBootLog() {
      dndBootLog.length = 0;
      bootStartedAt = performance.now();
      if (document.getElementById('dnd-boot-console-rows')) {
          document.getElementById('dnd-boot-console-rows').innerHTML = '';
      }
  }

  function addBootLog(type, message, meta = {}) {
      const elapsed = ((performance.now() - bootStartedAt) / 1000).toFixed(3);
      dndBootLog.push({ elapsed, type, message, meta });
      renderBootLog();
  }

  function renderBootLog() {
      const rowsEl = document.getElementById('dnd-boot-console-rows');
      if (!rowsEl) return;
      const html = dndBootLog.map(log => {
          let extra = '';
          if (log.meta && Array.isArray(log.meta.debugTiming)) {
              extra = `<div class="dnd-boot-console__meta" style="margin-left: 7.5rem; font-size: 0.85em; opacity: 0.7;">` +
                log.meta.debugTiming.map(t => `└─ ${t.step}: ${t.ms}ms`).join('<br>') +
                `</div>`;
          }
          return `<div class="dnd-boot-console__row">
            <span class="dnd-boot-console__time">[${log.elapsed}s]</span>
            <span class="dnd-boot-console__type">${String(log.type).padEnd(10, ' ')}</span>
            <span class="dnd-boot-console__message">${log.message}</span>
          </div>${extra}`;
      }).join('');
      rowsEl.innerHTML = html + `<div class="dnd-boot-console__cursor">_</div>`;
      rowsEl.scrollTop = rowsEl.scrollHeight;
  }

  async function dndApi(action, payload = {}, customSignal = null) {
    if (!apiUrl || !syncToken) return { ok: false, message: "SQL sync nonaktif." };
    const fetchOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, token: syncToken, ...payload })
    };
    if (customSignal) fetchOptions.signal = customSignal;

    const res = await fetch(apiUrl, fetchOptions);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (error) {
      throw new Error("Respons SQL DND bukan JSON. Status " + res.status);
    }
    if (!res.ok || data.ok === false) throw new Error(data.message || "SQL DND gagal.");
    return data;
  }

  function sanitizeStateForSql(sourceState) {
    const clone = JSON.parse(JSON.stringify(sourceState || {}));
    clone.accounts = Array.isArray(clone.accounts)
      ? clone.accounts.filter((account) => account?.source === "website").map(({ password, passwordHash, ...account }) => account)
      : [];
    return clone;
  }

  function scheduleSqlSave(show = false) {
    if (!apiUrl || !syncToken || !hasWebsiteSession()) return;
    syncPendingShow = syncPendingShow || !!show;
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => persistStateToSql(syncPendingShow), 2500);
  }

  async function syncLoadFromSql() {
    if (!apiUrl || !syncToken || !hasWebsiteSession()) {
        const loadingOverlay = document.getElementById("dnd-loading-overlay");
        if (loadingOverlay) loadingOverlay.style.display = "none";
        return;
    }

    resetBootLog();
    addBootLog('boot', 'Starting DnD table...');
    addBootLog('session', 'Website session detected: ' + (sessionAccountName || 'Active'));

    // Show loading overlay
    const loadingOverlay = document.getElementById("dnd-loading-overlay");
    if (loadingOverlay) {
        loadingOverlay.style.display = "flex";
        const contentEl = document.getElementById("dnd-loading-content");
        if (contentEl) {
            contentEl.innerHTML = `
              <div class="dnd-loading-spinner"></div>
              <p style="margin-top: 15px; font-weight: 500; color: var(--dnd-color-parchment);">Memuat data karakter...</p>
              <div id="dnd-boot-console" class="dnd-boot-console">
                <div class="dnd-boot-console__header">◆ DnD Sync Console</div>
                <div id="dnd-boot-console-rows" class="dnd-boot-console__rows"></div>
              </div>
              <div id="dnd-loading-actions" style="margin-top: 15px; display: none; text-align: center;">
                 <p style="color: var(--dnd-color-danger); margin-bottom: 10px; font-size: 14px;" id="dnd-loading-error-text"></p>
                 <button class="dnd-btn dnd-btn--primary" onclick="window.dndRetryLoad()">Coba Muat Ulang</button>
                 <button class="dnd-btn" style="margin-top: 5px;" onclick="window.location.reload()">Refresh Halaman</button>
              </div>
            `;
            renderBootLog();
        }
    }

    try {
      addBootLog('api', 'Requesting campaign summary...');
      loadAbortController = new AbortController();
      const timeoutId = setTimeout(() => loadAbortController.abort(), 10000); // 10s timeout

      const data = await dndApi("load", {}, loadAbortController.signal);
      clearTimeout(timeoutId);

      addBootLog('api', 'Campaign found.', { debugTiming: data.debugTiming });

      if (!data.state) {
        scheduleSqlSave(false);
        if (loadingOverlay) loadingOverlay.style.display = "none";
        return;
      }

      state = mergeState(defaultState(), data.state);
      seedSessionAccount();
      seedSystemAiNotes();
      normalizeStoredCharacters();
      normalizeSqlOnlyIdentity();

      addBootLog('sql', `${state.characters ? state.characters.length : 0} character summary loaded.`);

      addBootLog('render', 'Interface ready.');
      render();

      const userIsOwnerOrAdmin = state.accounts && state.accounts.some(acc => acc.id === 'php-session-user' && acc.role === 'owner');

      if (loadingOverlay) {
          if (userIsOwnerOrAdmin || new URLSearchParams(window.location.search).get('debug') === '1') {
              // Collapse it
              loadingOverlay.style.display = "none"; // Instead of hiding overlay, let's keep it clean
              const consoleEl = document.getElementById("dnd-boot-console");
              if (consoleEl) {
                  consoleEl.classList.add('dnd-boot-console--collapsed');
                  document.body.appendChild(consoleEl); // Move to body corner
              }
          } else {
              loadingOverlay.style.display = "none";
          }
      }

      // Load full character in background
      if (state.activeCharacterId && state.activeCharacterId !== "__new_character__") {
          addBootLog('detail', 'Loading active character sheet...');
          // Don't await, let it run in background
          loadFullCharacter(state.activeCharacterId).then(() => {
              addBootLog('detail', 'Active character sheet loaded.');
              // minimal toast
              toast("Sinkronisasi Selesai.");
          }).catch(err => {
              addBootLog('error', 'Failed to load character details.');
          });
      } else {
          toast("Data DND dimuat.");
      }

    } catch (error) {
      if (error.name === 'AbortError') {
          addBootLog('timeout', 'SQL request timed out.');
      } else {
          addBootLog('error', error.message || 'Unknown error');
      }

      if (!syncWarned) console.warn("DND SQL load fallback:", error);
      toast("Gagal memuat karakter.");
      syncWarned = true;

      // Show error state in loading UI
      const actionsEl = document.getElementById("dnd-loading-actions");
      const errorTextEl = document.getElementById("dnd-loading-error-text");
      const spinnerEl = document.querySelector(".dnd-loading-spinner");
      if (actionsEl && errorTextEl) {
          actionsEl.style.display = "block";
          if (error.name === 'AbortError') {
              errorTextEl.textContent = 'Koneksi SQL lambat. Ringkasan karakter belum selesai dimuat.';
          } else {
              errorTextEl.textContent = 'Gagal memuat data: ' + error.message;
          }
          if (spinnerEl) spinnerEl.style.display = "none";
      }
    }
  }

  // Make it global so the onclick works
  window.dndRetryLoad = () => {
      const actionsEl = document.getElementById("dnd-loading-actions");
      const spinnerEl = document.querySelector(".dnd-loading-spinner");
      const errorTextEl = document.getElementById("dnd-loading-error-text");
      if (actionsEl) actionsEl.style.display = "none";
      if (spinnerEl) spinnerEl.style.display = "block";
      if (errorTextEl) errorTextEl.textContent = "";

      addBootLog('retry', 'Retrying load sequence...');
      syncLoadFromSql();
  };

  async function persistStateToSql(show = false) {
    if (!apiUrl || !syncToken || !hasWebsiteSession() || syncBusy) {
      syncPendingShow = syncPendingShow || !!show;
      return;
    }
    syncBusy = true;
    syncPendingShow = false;
    try {
      if (state.dirtyCharacter && state.activeCharacterId) {
        const char = state.characterDetails[state.activeCharacterId] || state.characters.find(c => c.id === state.activeCharacterId);
        if (char) {
            await dndApi("save_character", { character: char });
        }
      } else if (state.dirtyCampaign) {
          await dndApi("save_campaign", { campaign: state.campaign });
      } else {
        const data = await dndApi("save", { state: sanitizeStateForSql(state), snapshot_name: "Autosave DND 2014" });
        if (show) toast(data.message || "DND tersimpan ke SQL.");
      }
      state.dirtyCharacter = false;
      state.dirtyCampaign = false;
      syncWarned = false;
    } catch (error) {
      if (!syncWarned) {
        console.warn("DND SQL save fallback:", error);
        toast("SQL DND belum tersambung. Penyimpanan lokal dimatikan agar data tidak bercabang.");
      }
      syncWarned = true;
    } finally {
      syncBusy = false;
      if (syncPendingShow) {
        const shouldShow = syncPendingShow;
        syncPendingShow = false;
        scheduleSqlSave(shouldShow);
      }
    }
  }

  const toastQueue = [];
  let isToasting = false;

  function processToastQueue() {
      if (toastQueue.length === 0 || isToasting) return;
      isToasting = true;
      const msg = toastQueue.shift();
      if (!toastEl) return;
      toastEl.innerHTML = '<span>' + esc(msg) + '</span>';
      toastEl.classList.add("show");
      window.clearTimeout(toastEl._timer);
      toastEl._timer = window.setTimeout(() => {
          toastEl.classList.remove("show");
          setTimeout(() => {
              isToasting = false;
              processToastQueue();
          }, 300); // Wait for transition
      }, 2600);
  }

  function toast(message) {
      if (!message) return;
      // if same message is already showing, don't spam
      if (toastEl && toastEl.classList.contains("show") && toastEl.textContent === message) return;
      toastQueue.push(message);
      processToastQueue();
  }

  function currentUser() {
    return state.accounts.find((a) => a.id === state.currentUserId) || null;
  }

  function userIsOwner(user = currentUser()) {
    if (!user) return false;
    // Jika user adalah session user, gunakan logika isSessionOwner yang sudah diperketat
    if (user.id === "php-session-user") return isSessionOwner();
    
    // Untuk akun lain di database, pastikan nama atau email mengandung 'darma'
    const haystack = `${user.name} ${user.email}`.toLowerCase();
    return haystack.includes("darma");
  }

  function gmTimerIsActive(expiresAt) {
    if (!expiresAt) return true;
    const time = new Date(expiresAt).getTime();
    return Number.isFinite(time) && time > Date.now();
  }

  function gmTimerLabel(expiresAt) {
    if (!expiresAt) return "permanen/manual";
    const time = new Date(expiresAt).getTime();
    if (!Number.isFinite(time)) return "tanggal tidak valid";
    if (time <= Date.now()) return "expired";
    return new Date(expiresAt).toLocaleString("id-ID");
  }

  function traitGuideText(traitName) {
    const clean = String(traitName || "").replace(/:.*/, "").trim().toLowerCase();
    const guide = DATA.traitDetails || {};
    return guide[clean] || "Trait ini adalah fitur bawaan ras/subrace. Cek kondisi pemakaiannya saat adegan atau combat berlangsung.";
  }

  function pdfClassFeatureGuideText(feature) {
    const map = {
      "Rage":"Bonus damage melee berbasis Strength, advantage Strength checks/saves, dan tahan beberapa tipe damage selama rage aktif.",
      "Unarmored Defense":"AC bisa memakai formula class saat tidak memakai armor tertentu; cocok dicatat agar sheet tidak salah hitung.",
      "Spellcasting":"Class ini memakai spellcasting ability tertentu untuk spell save DC dan spell attack bonus.",
      "Bardic Inspiration":"Memberi die bantuan ke sekutu untuk d20 test tertentu sesuai aturan fitur Bard.",
      "Wild Shape":"Druid bisa berubah bentuk sesuai batas CR dan durasi levelnya.",
      "Second Wind":"Fighter bisa memulihkan HP sendiri sebagai bonus action sesuai batas rest.",
      "Action Surge":"Fighter mendapat action tambahan singkat, biasanya pulih setelah rest sesuai level.",
      "Sneak Attack":"Rogue menambah damage sekali per turn saat syarat advantage atau ally dekat target terpenuhi.",
      "Expertise":"Bonus proficiency digandakan untuk skill/tool pilihan yang memenuhi syarat.",
      "Pact Magic":"Warlock memakai slot pact magic yang pulih lebih cepat dan slot level-nya naik bersama level.",
      "Divine Smite":"Paladin dapat mengubah slot spell menjadi burst radiant damage saat serangan melee kena.",
      "Favored Enemy":"Ranger mendapat keuntungan naratif/eksplorasi terhadap musuh pilihan sesuai aturan table.",
      "Ki":"Monk memakai poin Ki untuk teknik khusus seperti Flurry, Dodge, atau Dash sesuai level.",
      "Sorcerous Origin":"Sumber kekuatan Sorcerer yang membuka fitur tambahan sesuai origin.",
      "Arcane Recovery":"Wizard memulihkan sebagian slot spell saat short rest sesuai batas level."
    };
    return map[feature] || "Fitur class aktif. Baca kondisi penggunaan, durasi, resource, dan kapan pulih agar tidak terpakai dobel.";
  }

  function userHasGmPower(user = currentUser()) {
    if (!user) return false;
    const isOwner = userIsOwner(user);
    const roles = Array.isArray(user.dndRoles) ? user.dndRoles : [];
    const wantsGm = user.role === "gm" || isOwner || roles.includes("gm") || roles.includes("owner") || !!user.hiddenGmPower;
    if (!wantsGm) return false;
    if (isOwner || !!user.hiddenGmPower) return true;
    return gmTimerIsActive(user.gmExpiresAt || "");
  }

  function isGm() {
    const user = currentUser();
    if (!user) return false;
    if (user.source === "website" && !hasWebsiteSession()) return false;
    return userIsOwner(user) || userHasGmPower(user);
  }

  function getOwnerEntryMode() {
    try {
      const value = sessionStorage.getItem(OWNER_MODE_KEY);
      return value === "gm" ? "gm" : "player";
    } catch (error) {
      return "player";
    }
  }

  function setOwnerEntryMode(mode) {
    try {
      sessionStorage.setItem(OWNER_MODE_KEY, mode === "gm" ? "gm" : "player");
    } catch (error) {
      // sessionStorage bisa nonaktif di beberapa browser; mode tetap jatuh ke player.
    }
  }

  function visibleTableMode(user = currentUser()) {
    if (!user) return "guest";
    if (userIsOwner(user)) return getOwnerEntryMode();
    return isGm() ? "gm" : "player";
  }

  function displayGameRole(user = currentUser()) {
    if (!user) return "Belum login";
    const mode = visibleTableMode(user);
    return mode === "gm" ? "GM" : "Player";
  }

  function canManageRooms() {
    return isGm();
  }

  function normalizeRooms() {
    if (!Array.isArray(state.rooms)) state.rooms = [];
    const user = currentUser();
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
    state.rooms = state.rooms
      .filter((room) => room && room.id)
      .filter((room) => {
        const last = Date.parse(room.lastActiveAt || room.createdAt || nowIso());
        return !Number.isFinite(last) || last >= cutoff;
      })
      .map((room) => {
        const maxPlayers = clamp(room.maxPlayers || 5, 1, 12);
        const maxGMs = clamp(room.maxGMs || 1, 1, 4);
        const levelStart = clamp(room.partyLevelStart || room.partyLevel || 1, 1, 20);
        const levelEnd = clamp(room.partyLevelEnd || Math.max(levelStart, Number(room.partyLevelEnd || levelStart)), levelStart, 20);
        return {
          id: room.id,
          name: room.name || "Campaign Room",
          description: room.description || "",
          gmId: room.gmId || "php-session-user",
          gmName: room.gmName || "GM",
          hasPassword: !!room.hasPassword,
          password: room.password || "",
          playerIds: Array.isArray(room.playerIds) ? room.playerIds : [],
          playerNames: Array.isArray(room.playerNames) ? room.playerNames : [],
          maxPlayers,
          maxGMs,
          partyLevelStart: levelStart,
          partyLevelEnd: levelEnd,
          playMode: room.playMode || state.campaign.playMode || "offline",
          sessionType: room.sessionType || "Campaign",
          roomStatus: room.roomStatus || "Open",
          scheduleNote: room.scheduleNote || "",
          safetyNote: room.safetyNote || "",
          roomCode: room.roomCode || String(room.id).replace(/^room-?/, "").slice(-5).toUpperCase() || "ROOM",
          activeMapId: room.activeMapId || "",
          turn: {
            round: clamp(room.turn?.round || 1, 1, 999),
            activeCharacterId: room.turn?.activeCharacterId || "",
            updatedAt: room.turn?.updatedAt || "",
            updatedBy: room.turn?.updatedBy || ""
          },
          createdAt: room.createdAt || nowIso(),
          lastActiveAt: room.lastActiveAt || room.createdAt || nowIso()
        };
      });

    if (state.activeRoomId && !state.rooms.some((room) => room.id === state.activeRoomId)) {
      state.activeRoomId = "";
    }

    if (!state.activeRoomId && state.rooms.length) {
      const allowed = state.rooms.find(roomAccessAllowed) || state.rooms[0];
      state.activeRoomId = allowed.id;
    }

    if (user && state.activeRoomId) {
      const room = currentRoom();
      if (room && !canManageRooms() && !room.playerIds.includes(user.id) && roomAccessAllowed(room)) {
        room.playerIds.push(user.id);
        room.playerNames = Array.from(new Set([...(room.playerNames || []), user.name || "Player"]));
      }
    }
  }

  function currentRoom() {
    if (!Array.isArray(state.rooms)) state.rooms = [];
    return state.rooms.find((room) => room.id === state.activeRoomId) || null;
  }

  function roomAccessAllowed(room) {
    if (!room) return false;
    if (canManageRooms()) return true;
