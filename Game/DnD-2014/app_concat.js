/* GemuYokai DnD app bundle: skill proficiency render fix v30 */
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
    return sessionRole === "owner" || sessionRole === "admin" || sessionRole === "gm";
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
                log.meta.debugTiming.map(t => `└─ ${esc(t.step)}: ${esc(t.ms)}ms`).join('<br>') +
                `</div>`;
          }
          return `<div class="dnd-boot-console__row">
            <span class="dnd-boot-console__time">[${esc(log.elapsed)}s]</span>
            <span class="dnd-boot-console__type">${esc(String(log.type).padEnd(10, ' '))}</span>
            <span class="dnd-boot-console__message">${esc(log.message)}</span>
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

  let isBootLoading = false;

  async function syncLoadFromSql() {
    if (isBootLoading) return;
    if (!apiUrl || !syncToken || !hasWebsiteSession()) {
        const loadingOverlay = document.getElementById("dnd-loading-overlay");
        if (loadingOverlay) loadingOverlay.style.display = "none";
        return;
    }
    isBootLoading = true;

    if (loadAbortController) {
        loadAbortController.abort();
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
    } finally {
      isBootLoading = false;
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

      if (loadAbortController) {
          loadAbortController.abort();
      }

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
      let savedAnything = false;

      if (state.dirtyCharacter && state.activeCharacterId) {
        const char = state.characterDetails[state.activeCharacterId] || state.characters.find(c => c.id === state.activeCharacterId);
        if (char) {
            await dndApi("save_character", { character: char });
            savedAnything = true;
            state.dirtyCharacter = false;
        }
      }

      if (state.dirtyCampaign) {
          await dndApi("save_campaign", { campaign: state.campaign });
          savedAnything = true;
          state.dirtyCampaign = false;
      }

      if (!savedAnything) {
        const data = await dndApi("save", { state: sanitizeStateForSql(state), snapshot_name: "Autosave DND 2014" });
        if (show) toast(data.message || "DND tersimpan ke SQL.");
        state.dirtyCharacter = false;
        state.dirtyCampaign = false;
      }
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

    // Untuk akun lain di database, periksa role
    const role = (user.role || "").toLowerCase();
    return role === "owner" || role === "admin" || role === "gm";
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

    const user = currentUser();
    if (!user) return !room.hasPassword;
    return !room.hasPassword || (room.playerIds || []).includes(user.id) || (room.playerNames || []).includes(user.name);
  }

  function roomCharacters(roomId = state.activeRoomId) {
    const all = Array.isArray(state.characters) ? state.characters : [];
    if (!roomId) return all.filter((item) => !item.roomId);
    return all.filter((item) => !item.roomId || item.roomId === roomId);
  }

  function roomMaps(roomId = state.activeRoomId) {
    const all = Array.isArray(state.maps) ? state.maps : [];
    if (!roomId) return all.filter((item) => !item.roomId);
    return all.filter((item) => !item.roomId || item.roomId === roomId);
  }

  function roomNpcs(roomId = state.activeRoomId) {
    const all = Array.isArray(state.npcs) ? state.npcs : [];
    if (!roomId) return all.filter((item) => !item.roomId);
    return all.filter((item) => !item.roomId || item.roomId === roomId);
  }

  function createRoomFromForm() {
    if (!canManageRooms()) return toast("Hanya GM yang bisa membuat room.");
    const user = currentUser();
    const name = qs("#roomName")?.value.trim() || state.campaign.name || "Campaign Room";
    const password = qs("#roomPassword")?.value || "";
    const maxPlayers = clamp(qs("#roomMaxPlayers")?.value || 5, 1, 12);
    const maxGMs = clamp(qs("#roomMaxGMs")?.value || 1, 1, 4);
    const levelStart = clamp(qs("#roomLevelStart")?.value || state.campaign.partyLevel || 1, 1, 20);
    const levelEnd = clamp(qs("#roomLevelEnd")?.value || levelStart, levelStart, 20);
    const room = {
      id: uid("room"),
      name,
      description: qs("#roomDescription")?.value.trim() || "",
      gmId: user?.id || "php-session-user",
      gmName: user?.name || sessionName || "GM",
      hasPassword: password.length > 0,
      password,
      playerIds: user?.id ? [user.id] : [],
      playerNames: user?.name ? [user.name] : [],
      maxPlayers,
      maxGMs,
      partyLevelStart: levelStart,
      partyLevelEnd: levelEnd,
      playMode: qs("#roomPlayMode")?.value || state.campaign.playMode || "offline",
      sessionType: qs("#roomSessionType")?.value || "Campaign",
      roomStatus: qs("#roomStatus")?.value || "Open",
      scheduleNote: qs("#roomSchedule")?.value.trim() || "",
      safetyNote: qs("#roomNote")?.value.trim() || "",
      roomCode: (qs("#roomCode")?.value.trim() || `${name.slice(0, 3)}-${Math.random().toString(36).slice(2, 6)}`).toUpperCase(),
      activeMapId: "",
      turn: { round: 1, activeCharacterId: "", updatedAt: "", updatedBy: "" },
      createdAt: nowIso(),
      lastActiveAt: nowIso()
    };
    state.rooms.unshift(room);
    state.activeRoomId = room.id;
    state.ui.lobbyInsideRoom = true;
    document.body.classList.add('gemu-dnd-room-active');
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    state.campaign.partyLevel = levelStart;
    state.campaign.playMode = room.playMode;
    saveState(true, 'campaign');
    render();
    toast("Room campaign dibuat.");
  }

  function enterRoom(roomId) {
    normalizeRooms();
    const room = state.rooms.find((item) => item.id === roomId);
    if (!room) return toast("Room tidak ditemukan.");
    const user = currentUser();
    const alreadyJoined = !!(user && (room.playerIds || []).includes(user.id));
    if (room.hasPassword && !canManageRooms() && !alreadyJoined) {
      const pass = qs("#roomPass-" + room.id)?.value || "";
      if (pass !== room.password) return toast("Password room salah.");
    }
    if (!canManageRooms() && !alreadyJoined && (room.playerIds || []).length >= Number(room.maxPlayers || 5)) {
      return toast("Room sudah penuh. Minta GM menaikkan maksimal player atau tunggu slot kosong.");
    }
    if (user) {
      room.playerIds = Array.from(new Set([...(room.playerIds || []), user.id]));
      room.playerNames = Array.from(new Set([...(room.playerNames || []), user.name || "Player"]));
    }
    room.lastActiveAt = nowIso();
    state.activeRoomId = room.id;
    state.ui.lobbyInsideRoom = true;
    document.body.classList.add('gemu-dnd-room-active');
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    saveState(true, 'campaign');
    render();
    toast("Room aktif.");
  }

  function leaveRoom(roomId) {
    const user = currentUser();
    const room = (state.rooms || []).find((item) => item.id === roomId);
    if (!user || !room || canManageRooms()) return;
    room.playerIds = (room.playerIds || []).filter((id) => id !== user.id);
    room.playerNames = (room.playerNames || []).filter((name) => name !== user.name);
    if (state.activeRoomId === roomId) {
      state.activeRoomId = "";
      state.ui.lobbyInsideRoom = false;
    document.body.classList.remove('gemu-dnd-room-active');
    }
    saveState(true, 'campaign');
    render();
    toast("Keluar dari room.");
  }

  function deleteRoom(roomId) {
    if (!canManageRooms()) return toast("Hanya GM yang bisa menghapus room.");
    const room = (state.rooms || []).find((item) => item.id === roomId);
    if (!room) return;
    if (!confirm("Hapus room " + room.name + "?")) return;
    state.rooms = state.rooms.filter((item) => item.id !== roomId);
    state.maps = (state.maps || []).filter((item) => item.roomId !== roomId);
    state.npcs = (state.npcs || []).filter((item) => item.roomId !== roomId);
    state.characters = (state.characters || []).map((item) => item.roomId === roomId ? { ...item, roomId: "" } : item);
    if (state.activeRoomId === roomId) {
      state.activeRoomId = state.rooms[0]?.id || "";
      state.ui.lobbyInsideRoom = false;
    document.body.classList.remove('gemu-dnd-room-active');
    }
    saveState(true, 'campaign');
    render();
    toast("Room dihapus.");
  }

  function ensureGmRoomForMap(showToast = false) {
    normalizeRooms();
    if (state.activeRoomId && currentRoom()) return true;
    if (!canManageRooms()) return false;

    const user = currentUser();
    const room = {
      id: uid("room"),
      name: state.campaign.name || "GM Quick Map Room",
      description: "Room cepat untuk map dadakan GM.",
      gmId: user?.id || "php-session-user",
      gmName: user?.name || sessionName || "GM",
      hasPassword: false,
      password: "",
      playerIds: user?.id ? [user.id] : [],
      playerNames: user?.name ? [user.name] : [],
      activeMapId: "",
      turn: { round: 1, activeCharacterId: "", updatedAt: "", updatedBy: "" },
      createdAt: nowIso(),
      lastActiveAt: nowIso()
    };
    state.rooms.unshift(room);
    state.activeRoomId = room.id;
    state.ui.lobbyInsideRoom = true;
    document.body.classList.add('gemu-dnd-room-active');
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    saveState(false, 'campaign');
    if (showToast) toast("Room cepat GM siap untuk map.");
    return true;
  }

  function gmQuickMap() {
    if (!canManageRooms()) {
      switchTab("map");
      return;
    }
    ensureGmRoomForMap(true);
    state.ui.tab = "map";
    saveState(false);
    render();
  }

  function ownedCharacters() {
    const user = currentUser();
    if (!user) return [];
    const scoped = roomCharacters(state.activeRoomId);
    return canManageRooms() ? scoped : scoped.filter((c) => c.ownerId === user.id || c.ownerName === user.name);
  }

  function activeCharacter() {
    if (state.activeCharacterId === "__new_character__") return null;
    if (state.activeCharacterId && state.characterDetails && state.characterDetails[state.activeCharacterId]) {
        return state.characterDetails[state.activeCharacterId];
    }
    const owned = ownedCharacters();
    return owned.find((c) => c.id === state.activeCharacterId) || owned[0] || null;
  }

  function combinedItems() {
    return [...DATA.items, ...state.customItems];
  }

  function parseItemList(value) {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function appearanceIsComplete(appearance) {
    return ["hair", "eyes", "skin", "style"].every((key) => String(appearance?.[key] || "").trim().length > 0);
  }

  function characterIsReady(character) {
    return !!character
      && !!character.startingChoice
      && !!character.race
      && !!character.className
      && Number(character.level || 0) >= 1
      && Array.isArray(character.skills)
      && character.skills.length > 0
      && appearanceIsComplete(character.appearance);
  }

  function enforcePlayerStartLocation() {
    const user = currentUser();
    if (user && !isGm() && !ownedCharacters().some(characterIsReady) && ["map", "dice"].includes(state.ui.tab)) {
      state.ui.tab = "lobby";
    }
  }

  function startingPackagesForClass(classId) {
    if (!classId) return [];
    const mode = state.campaign.startingMode || "standard";
    if (mode === "gold") {
      const base = DATA.startingPackages.find((pkg) => pkg.id === "starting-gold");
      return [{ ...base, gold: clamp(state.campaign.startingGold || base.gold || 10, 0, 9999), items: [] }];
    }
    if (mode === "custom") {
      const base = DATA.startingPackages.find((pkg) => pkg.id === "gm-custom");
      return [{
        ...base,
        name: state.campaign.startingCustomName || base.name,
        gold: clamp(state.campaign.startingGold || base.gold || 0, 0, 9999),
        items: parseItemList(state.campaign.startingCustomItems || base.items.join(", ")),
        requiresApproval: false
      }];
    }
    const packages = DATA.startingPackages.filter((pkg) => {
      if (pkg.mode !== "standard") return false;
      return pkg.classIds.includes("*") || pkg.classIds.includes(classId);
    });
    return packages.length ? packages : DATA.startingPackages.filter((pkg) => pkg.id === "standard-adventurer");
  }

  function resolveStartingPackage(packageId, classId) {
    const packages = startingPackagesForClass(classId);
    return packages.find((pkg) => pkg.id === packageId) || packages[0] || DATA.startingPackages[0];
  }


  function defaultEquipmentChoices(pkg) {
    const result = {};
    (pkg?.choices || []).forEach((choice) => {
      result[choice.id] = choice.options?.[0]?.id || "";
    });
    return result;
  }

  function normalizeEquipmentChoices(pkg, rawChoices) {
    const result = {};
    (pkg?.choices || []).forEach((choice) => {
      const allowed = new Set((choice.options || []).map((option) => option.id));
      const requested = rawChoices?.[choice.id];
      if (requested && allowed.has(requested)) result[choice.id] = requested;
    });
    return result;
  }

  function selectedEquipmentOption(choice, selections) {
    const selectedId = selections?.[choice.id] || choice.options?.[0]?.id || "";
    return (choice.options || []).find((option) => option.id === selectedId) || choice.options?.[0] || null;
  }

  function resolveStartingItems(pkg, selections) {
    const chosen = normalizeEquipmentChoices(pkg, selections);
    const fixed = Array.isArray(pkg?.fixedItems) ? pkg.fixedItems : (Array.isArray(pkg?.items) ? pkg.items : []);
    const optionItems = (pkg?.choices || []).flatMap((choice) => selectedEquipmentOption(choice, chosen)?.items || []);
    return [...fixed, ...optionItems].filter(Boolean);
  }

  function cleanEquipmentText(value, fallback = "Tidak ada") {
    return String(value || fallback)
      .replace(/Tentukan bersama GM/gi, "Tidak ada syarat khusus")
      .replace(/Sesuai keputusan GM/gi, "sesuai aksi karakter")
      .replace(/sesuai keputusan GM/gi, "sesuai aksi karakter")
      .replace(/pilihan GM/gi, "pilihan base");
  }

  function normalizedItemLookupName(name) {
    const raw = String(name || "").trim();
    return raw
      .replace(/\s+x\d+$/i, "")
      .replace(/^Two\s+/i, "")
      .replace(/^Five\s+/i, "")
      .replace(/\s+\+\s+.*$/i, "")
      .trim();
  }

  function describeItemForUi(name) {
    const lookup = normalizedItemLookupName(name);
    let meta = itemByName(name) || itemByName(lookup);

    // Penjelasan detail isi pack standar DnD 2014
    const packDetails = {
      "dungeoneer's pack": "Backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50ft hempen rope.",
      "explorer's pack": "Backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50ft hempen rope.",
      "priest's pack": "Backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks of incense, censer, vestments, 2 days rations, waterskin.",
      "scholar's pack": "Backpack, book of lore, ink pen, 10 sheets of parchment, little bag of sand, small knife.",
      "burglar's pack": "Backpack, bag of 1000 ball bearings, 10ft string, bell, 5 candles, crowbar, hammer, 10 pitons, hooded lantern, 2 flasks of oil, 5 days rations, tinderbox, waterskin, 50ft hempen rope.",
      "diplomat's pack": "Chest, 2 cases for maps/scrolls, fine clothes, ink bottle, ink pen, lamp, 2 flasks of oil, 5 sheets of paper, vial of perfume, sealing wax, soap.",
      "entertainer's pack": "Backpack, bedroll, 2 costumes, 5 candles, 5 days rations, waterskin, disguise kit."
    };

    const packKey = lookup.toLowerCase();
    if (packDetails[packKey]) {
      meta = {
        ...(meta || {}),
        notes: (meta?.notes ? meta.notes + " " : "") + "Isi: " + packDetails[packKey]
      };
    }

    if (!meta) {
      meta = { type: "Item", abilityRequirement: "Tidak ada syarat khusus", abilityUse: "Tidak mengubah ability score", affects: "Dicatat di inventory karakter", skillSupport: "Tidak memberi skill bawaan" };
    }
    return { name, meta };
  }

  function startingPackageOptionLabel(pkg) {
    const itemInfo = Array.isArray(pkg.items) && pkg.items.length ? `${pkg.items.length} item` : "Gold";
    const goldInfo = pkg.gold ? ` + ${pkg.gold} gp` : "";
    return `${pkg.name} - ${itemInfo}${goldInfo}`;
  }

  function renderItemExplanationCards(items) {
    const list = Array.from(new Set((items || []).filter(Boolean)));
    if (!list.length) return `<p class="dnd-muted">Paket ini memakai gold/custom tanpa item tetap.</p>`;
    return `<div class="equipment-item-grid">
      ${list.map((name) => {
        const { meta } = describeItemForUi(name);
        return `<article class="equipment-item-card">
          <header><strong>${esc(name)}</strong><span>${esc(meta.type || "Item")}</span></header>
          <p><b>Butuh ability:</b> ${esc(cleanEquipmentText(meta.abilityRequirement, "Tidak ada"))}</p>
          <p><b>Ability yang dipakai:</b> ${esc(cleanEquipmentText(meta.abilityUse, "Tidak mengubah ability score"))}</p>
          <p><b>Menambah ability score:</b> Tidak. Starting equipment 2014 memengaruhi sheet/inventory, bukan STR/DEX/CON/INT/WIS/CHA.</p>
          <p><b>Efek sheet:</b> ${esc(cleanEquipmentText(meta.affects || meta.notes, "Dicatat di inventory"))}</p>
          <p><b>Skill terkait:</b> ${esc(cleanEquipmentText(meta.skillSupport, "Tidak memberi skill bawaan"))}</p>
        </article>`;
      }).join("")}
    </div>`;
  }

  function renderEquipmentChoiceControls(pkg, selections = {}, disabled = false) {
    if (!pkg) return `<div class="starting-equipment-choice-area"></div>`;
    const chosen = normalizeEquipmentChoices(pkg, selections);
    const selectedItems = resolveStartingItems(pkg, chosen);
    const controls = (pkg.choices || []).map((choice) => `<div class="dnd-field equipment-choice-field">
      <label>${esc(choice.label || "Pilihan equipment")}</label>
      <select name="equipmentChoice-${esc(choice.id)}" ${disabled ? "disabled" : ""}>
        <option value="" ${!chosen[choice.id] ? "selected" : ""}>None — pilih item</option>${(choice.options || []).map((option) => `<option value="${esc(option.id)}" ${chosen[choice.id] === option.id ? "selected" : ""}>${esc(option.label)}</option>`).join("")}
      </select>
    </div>`).join("");
    return `<div class="starting-equipment-choice-area span-12">
      ${controls ? `<div class="equipment-choice-grid">${controls}</div>` : ""}
      <div class="equipment-selected-preview">
        <strong>Item yang masuk ke inventory</strong>
        <small>${esc(selectedItems.join(", ") || `${pkg.gold || 0} gp`)}</small>
      </div>
      ${renderItemExplanationCards(selectedItems)}
    </div>`;
  }

  function renderStartingPackageDetails(packages, selectedId, selections = {}) {
    if (!Array.isArray(packages) || !packages.length) return "";
    return `<div class="starting-package-help" aria-label="Daftar isi starting package">
      ${packages.map((pkg) => {
        const chosen = normalizeEquipmentChoices(pkg, selections[pkg.id] || selections || {});
        const items = resolveStartingItems(pkg, chosen);
        const itemList = items.length
          ? items.map((item) => `<li>${esc(item)}</li>`).join("")
          : `<li>${esc(pkg.gold || 0)} gp</li>`;
        return `<details class="starting-package-detail" ${pkg.id === selectedId ? "open" : ""}>
          <summary>${esc(pkg.name)} <small>${esc(pkg.gold ? `+ ${pkg.gold} gp` : "")}</small></summary>
          <p>${esc(pkg.notes || "Isi paket awal karakter.")}</p>
          <ul>${itemList}</ul>
        </details>`;
      }).join("")}
    </div>`;
  }

  function handleAction(action, trigger) {
    const actions = {
      tab: () => switchTab(trigger.dataset.tab),
      "auth-open": () => openAuth(trigger.dataset.mode || "login"),
      "auth-close": closeAuth,
      "auth-submit": submitAuth,
      "website-login": openWebsiteLogin,
      "website-register": openWebsiteRegister,
      "website-logout": websiteLogout,
      "quick-login": () => quickLogin(trigger.dataset.role || "player"),
      logout,
      "create-room": createRoomFromForm,
      "enter-room": () => enterRoom(trigger.dataset.roomId),
      "room-back-lobby": backToLobbyRoomList,
      "room-turn-set": setRoomTurnFromControl,
      "room-turn-next": nextRoomTurn,
      "room-turn-clear": clearRoomTurn,
      "leave-room": () => leaveRoom(trigger.dataset.roomId),
      "delete-room": () => deleteRoom(trigger.dataset.roomId),
      "gm-quick-map": gmQuickMap,
      "campaign-save": saveCampaignSettings,
      "save-campaign": saveCampaignSettings,
      "owner-entry-mode": () => changeOwnerEntryMode(trigger.dataset.mode),
      "edit-announcement": editAnnouncement,
      "owner-db-apply-role": () => ownerDatabaseApplyRole(trigger),
      "owner-db-edit-character": () => ownerDatabaseEditCharacter(trigger.dataset.characterId || trigger.dataset.id),
      "owner-db-delete-character": () => ownerDatabaseDeleteCharacter(trigger.dataset.characterId || trigger.dataset.id),
      "owner-db-refresh": ownerDatabaseRefresh,
      "send-room-chat": sendRoomChat,
      "add-room-event": addRoomEventFromLobby,
      "lobby-ai-ask": answerLobbyAiQuestion,
      "save-character": saveCharacterFromForm,
      "character-step": () => setCharacterStep(trigger.dataset.step),
      "character-step-next": () => moveCharacterStep(1),
      "character-step-prev": () => moveCharacterStep(-1),
      "ability-roll-array": () => rollAbilityArray(trigger.dataset.mode || "4d6"),
      "delete-character": () => deleteCharacter(trigger.dataset.characterId || trigger.dataset.id),
      "new-character": newCharacterDraft,
      "clone-character": cloneCharacterDraft,
      "download-pdf": openPdfChoiceModal,
      "pdf-close": closePdfChoiceModal,
      "pdf-download-selected": downloadSelectedCharacterPdf,
      "export-save": exportSave,
      "import-save": importSavePrompt,
      "import-save-apply": importSaveApply,
      "import-close": closeImportModal,
      "reset-local": resetLocal,
      "roll-dice": () => rollDice(Number(trigger.dataset.sides || 20), trigger.dataset.label || "d20"),
      "roll-skill": rollSkill,
      "generate-map": generateMapFromForm,
      "generate-map-image": generateMapImageFromForm,
      "delete-map": deleteActiveMap,
      "save-map-note": saveMapNote,
      "use-uploaded-map": useUploadedMap,
      "add-npc": addNpcFromForm,
      "remove-npc": () => removeNpc(trigger.dataset.id),
      "add-session-log": addSessionLog,
      "grant-item": () => grantItem(trigger.dataset.characterId),
      "gm-adjust": () => gmAdjustCharacter(trigger.dataset.characterId),
      "approve-level": () => gmApproveLevel(trigger.dataset.characterId),
      "add-custom-item": addCustomItem,
      "ai-ask": answerAiQuestion,
      "ai-audit": runAiAudit,
      "ai-learn": addAiNote,
      "bug-report": createBugReport,
      "gm-voice-narration": toggleVoiceNarration,
      "gm-send-narration": sendGmNarration,
      "grant-reward": openRewardModal,
      "reward-close": closeRewardModal,
      "submit-reward": applyReward
    };
    if (!actions[action]) return;
    try {
      actions[action]();
    } catch (error) {
      console.error("DND action error:", action, error);
      toast("Tombol belum berhasil diproses: " + action + ". Coba ulang atau cek koneksi.");
    }
  }

  function backToLobbyRoomList() {
    state.ui.lobbyInsideRoom = false;
    document.body.classList.remove('gemu-dnd-room-active');
    state.ui.tab = "lobby";
    saveState(false);
    render();
    toast("Keluar game. Kembali ke tampilan utama lobby.");
  }

  function changeOwnerEntryMode(mode) {
    const user = currentUser();
    if (!userIsOwner(user)) return;
    setOwnerEntryMode(mode === "gm" ? "gm" : "player");
    render();
    toast(mode === "gm" ? "Mode masuk GM aktif di layar ini." : "Mode masuk Player aktif di layar ini.");
  }

  function editAnnouncement() {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa mengubah announcement.");
    const current = state.campaign.announcementText || "";
    const next = prompt("Isi announcement berjalan untuk player:", current);
    if (next === null) return;
    state.campaign.announcementText = String(next).trim() || "Selamat bermain. Tidak ada announcement khusus dari owner.";
    saveState(true, 'campaign');
    render();
    toast("Announcement owner diperbarui.");
  }

  function ownerDatabaseRefresh() {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa membuka database panel.");
    saveState(true, 'campaign');
    render();
    toast("Database panel disinkronkan ke MySQL.");
  }

  function ownerDatabaseApplyRole(trigger) {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa mengubah role DND.");
    const row = trigger?.closest?.("[data-owner-account-row]");
    const accountId = trigger?.dataset?.accountId || row?.dataset?.ownerAccountRow || "";
    const account = state.accounts.find((item) => item.id === accountId);
    if (!account) return toast("Akun tidak ditemukan di state DND.");
    if (userIsOwner(account) && account.id !== currentUser()?.id) return toast("Role Owner tidak diubah dari panel ini.");
    const role = row?.querySelector("[data-owner-role]")?.value || "player";
    const daysRaw = Number(row?.querySelector("[data-owner-gm-days]")?.value || 0);
    const days = Number.isFinite(daysRaw) ? Math.max(0, Math.min(3650, Math.floor(daysRaw))) : 0;
    if (role === "gm") {
      account.role = "gm";
      account.visibleRole = "gm";
      account.dndRoles = ["player", "gm"];
      account.gmExpiresAt = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : "";
      account.gmGrantedAt = nowIso();
      account.gmGrantedBy = currentUser()?.id || "owner";
    } else {
      account.role = "player";
      account.visibleRole = "player";
      account.dndRoles = ["player"];
      account.gmExpiresAt = "";
      account.gmGrantedAt = "";
      account.gmGrantedBy = "";
    }
    account.updatedAt = nowIso();
    saveState(true, 'campaign');
    render();
    toast(role === "gm" ? `Role GM aktif${days ? " selama " + days + " hari" : " tanpa timer"}.` : "Role akun dikembalikan menjadi Player.");
  }

  function ownerDatabaseEditCharacter(characterId) {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa edit karakter dari database panel.");
    const character = state.characters.find((item) => item.id === characterId);
    if (!character) return toast("Karakter tidak ditemukan.");
    state.activeCharacterId = character.id;
    state.ui.tab = "character";
    state.ui.characterStep = "race";
    state.ui.characterDraft = JSON.parse(JSON.stringify(character));
    state.ui.abilityRollLog = null;
    state.ui.abilityPickAssignments = {};
    saveState(false);
    render();
    toast("Mode edit Owner dibuka. Detail karakter bisa dikoreksi manual.");
  }

  function ownerDatabaseDeleteCharacter(characterId) {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa hapus karakter dari database panel.");
    const character = state.characters.find((item) => item.id === characterId);
    if (!character) return toast("Karakter tidak ditemukan.");
    if (!confirm(`Hapus karakter ${character.name || "tanpa nama"} dari campaign?`)) return;
    state.characters = state.characters.filter((item) => item.id !== character.id);
    state.maps.forEach((map) => {
      map.npcs = (map.npcs || []).filter((token) => token.characterId !== character.id);
    });
    if (state.activeCharacterId === character.id) state.activeCharacterId = state.characters[0]?.id || "";
    saveState(true, 'campaign');
    render();
    toast("Karakter dihapus dari state dan akan diarsipkan di MySQL saat autosave.");
  }

  function sendRoomChat() {
    const user = currentUser();
    if (!user) {
      openAuth("login");
      toast("Login dulu untuk mengirim chat room.");
      return;
    }
    const room = currentRoom();
    if (!room) return toast("Pilih room dulu sebelum chat.");
    const text = qs("#room-chat-text")?.value.trim() || "";
    if (!text) return toast("Isi chat dulu.");
    if (!isGm() && !canTakeGameAction("chat")) return;
    if (!Array.isArray(state.chatLog)) state.chatLog = [];
    state.chatLog.unshift({
      id: uid("chat"),
      roomId: room.id,
      userId: user.id,
      userName: user.name || "Player",
      role: displayGameRole(user).toLowerCase(),
      text,
      createdAt: nowIso()
    });
    state.chatLog = state.chatLog.slice(0, 160);
    saveState(true, 'campaign');
    render();
  }

  function addRoomEventFromLobby() {
    if (!canManageRooms()) return toast("Hanya GM yang bisa menambah event room.");
    const room = currentRoom();
    if (!room) return toast("Pilih atau buat room dulu.");
    const text = qs("#room-event-text")?.value.trim() || "";
    const kind = qs("#room-event-kind")?.value || "Event";
    if (!text) return toast("Isi catatan event dulu.");
    if (!Array.isArray(state.roomEvents)) state.roomEvents = [];
    state.roomEvents.unshift({
      id: uid("event"),
      roomId: room.id,
      kind,
      text,
      createdBy: currentUser()?.name || "GM",
      createdAt: nowIso()
    });
    state.roomEvents = state.roomEvents.slice(0, 160);
    saveState(true, 'campaign');
    render();
  }

  function answerLobbyAiQuestion() {
    const question = qs("#lobby-ai-question")?.value.trim() || "";
    if (!question) return toast("Tulis pertanyaan AI dulu.");
    const room = currentRoom();
    const context = room ? `Room aktif: ${room.name}. ` : "";
    state.ui.aiAnswer = context + localAiAnswer(question);
    saveState();
    render();
  }

  function openWebsiteLogin() {
    openAuth("login");
  }

  function openWebsiteRegister() {
    openAuth("register");
  }

  async function postWebsiteAuth(action, payload) {
    if (!websiteAuthApiUrl) throw new Error("Koneksi login website belum tersedia.");
    const body = new FormData();
    body.append("action", action);
    Object.entries(payload || {}).forEach(([key, value]) => body.append(key, value == null ? "" : String(value)));
    const response = await fetch(websiteAuthApiUrl, {
      method: "POST",
      credentials: "same-origin",
      body
    });
    const data = await response.json().catch(() => ({}));
    const ok = response.ok && (data.status === "success" || data.ok === true);
    if (!ok) throw new Error(data.message || "Auth website gagal diproses.");
    return data;
  }

  async function websiteLogout() {
    purgeLegacyBrowserSave();
    state.currentUserId = "";
    state.ui.tab = "lobby";
    if (!authApiUrl) {
      window.location.reload();
      return;
    }
    try {
      const response = await fetch(authApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "logout", token: syncToken })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.message || "Logout gagal.");
      toast(data.message || "Logout berhasil.");
      setTimeout(() => window.location.reload(), 350);
    } catch (error) {
      console.error("DND website logout failed:", error);
      toast(error.message || "Logout website gagal. Refresh halaman lalu coba lagi.");
    }
  }

  function switchTab(tab) {
    if (!tab) return;
    const user = currentUser();
    if (tab === "database" && !userIsOwner(user)) {
      state.ui.tab = "lobby";
      toast("Database panel hanya untuk Owner.");
    } else if ((tab === "map" || tab === "dice") && user && !isGm() && !ownedCharacters().some(characterIsReady)) {
      state.ui.tab = "character";
      toast("Player wajib membuat karakter lengkap dulu sebelum masuk meja permainan.");
    } else {
      state.ui.tab = tab;
    }
    saveState();
    render();
  }

  function openAuth(mode) {
    state.ui.authMode = mode === "register" ? "register" : "login";
    state.ui.showAuth = true;
    render();
  }

  function closeAuth() {
    state.ui.showAuth = false;
    render();
  }

  async function submitAuth() {
    const isRegister = state.ui.authMode === "register";
    const name = qs("#auth-name")?.value.trim() || "";
    const email = qs("#auth-email")?.value.trim() || "";
    const password = qs("#auth-password")?.value || "";
    if (!email || !password || (isRegister && !name)) {
      toast("Nama, email, dan password wajib diisi.");
      return;
    }
    if (isRegister && password.length < 8) {
      toast("Password minimal 8 karakter agar cocok dengan sistem website.");
      return;
    }
    const button = qs('[data-action="auth-submit"]');
    if (button) button.disabled = true;
    try {
      if (isRegister) {
        await postWebsiteAuth("register", { name, email, password });
        await postWebsiteAuth("login", { email, password });
        toast("Akun website berhasil dibuat dan login. Data DND akan tersimpan ke MySQL.");
      } else {
        await postWebsiteAuth("login", { email, password });
        toast("Login website berhasil. Data DND tersambung ke MySQL.");
      }
      setTimeout(() => window.location.reload(), 450);
    } catch (error) {
      console.error("DND website auth failed:", error);
      toast(error.message || "Login/daftar website gagal.");
      if (button) button.disabled = false;
    }
  }

  function quickLogin(role) {
    toast("Akun lokal dan demo dimatikan. Silakan login/daftar akun website dulu.");
    openWebsiteLogin();
  }

  function logout() {
    websiteLogout();
  }

  function saveCampaignSettings() {
    if (!canManageRooms()) return;
    state.campaign.name = qs("#campaign-name")?.value.trim() || state.campaign.name;
    state.campaign.partyLevel = clamp(qs("#campaign-party-level")?.value || 1, 1, 20);
    state.campaign.safety = qs("#campaign-safety")?.value.trim() || "Rule helper aktif";
    state.campaign.playMode = qs("#campaign-play-mode")?.value || "offline";
    state.campaign.voiceExternal = (qs("#campaign-voice-external")?.value || "no") === "yes";
    state.campaign.voicePlatform = qs("#campaign-voice-platform")?.value.trim() || "";
    state.campaign.startingMode = qs("#campaign-starting-mode")?.value || "standard";
    state.campaign.startingGold = clamp(qs("#campaign-starting-gold")?.value || 10, 0, 9999);
    state.campaign.startingCustomName = qs("#campaign-starting-name")?.value.trim() || "GM Custom Choice";
    state.campaign.startingCustomItems = qs("#campaign-starting-items")?.value.trim() || "Healing Potion";
    const room = currentRoom();
    if (room) { room.name = state.campaign.name; room.lastActiveAt = nowIso(); }
    saveState(true, 'campaign');
    render();
  }

  function newCharacterDraft() {
    state.activeCharacterId = "__new_character__";
    state.ui.tab = "character";
    state.ui.characterStep = "race";
    state.ui.characterDraft = createBlankCharacterDraft();
    state.ui.abilityRollLog = null;
    state.ui.abilityPickAssignments = {};
    state.characterPortraitDraft = "";
    state.characterPortraitDraftName = "";
    saveState();
    render();
  }

  function cloneCharacterDraft() {
    const c = activeCharacter();
    if (!c) return toast("Tidak ada karakter aktif untuk diclone.");
    state.activeCharacterId = "__new_character__";
    state.ui.tab = "character";
    state.ui.characterStep = "race";
    const clone = JSON.parse(JSON.stringify(c));
    delete clone.id;
    delete clone.localId;
    clone.name = clone.name ? clone.name + " (Clone)" : "Clone Character";
    state.ui.characterDraft = clone;
    state.ui.abilityRollLog = null;
    state.ui.abilityPickAssignments = {};
    state.characterPortraitDraft = clone.portrait || "";
    state.characterPortraitDraftName = clone.portraitName || "";
    saveState();
    render();
    toast("Karakter berhasil diduplikat! Jangan lupa klik Simpan Karakter.");
  }

  function deleteCharacter(id) {
    if (!isGm()) return toast("Hanya GM yang bisa menghapus karakter dari lobby.");
    const character = state.characters.find((c) => c.id === id);
    if (!character) return;
    if (!confirm("Hapus karakter " + character.name + "?")) return;
    state.characters = state.characters.filter((c) => c.id !== id);
    if (state.activeCharacterId === id) state.activeCharacterId = state.characters[0]?.id || "";
    state.maps.forEach((map) => {
      map.npcs = (map.npcs || []).filter((token) => token.characterId !== id);
    });
    saveState(true);
    render();
  }


  function focusCharacterField(selector) {
    window.setTimeout(() => {
      const field = selector ? qs(selector) : null;
      if (!field) return;
      field.classList.add("is-invalid");
      field.closest(".dnd-field")?.classList.add("field-invalid");
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      try { field.focus({ preventScroll: true }); } catch (error) { field.focus(); }
    }, 80);
  }

  function failCharacterValidation(message, stepId, selector) {
    state.ui.characterStep = stepId || "race";
    toast(message);
    render();
    focusCharacterField(selector);
    return false;
  }

  function saveCharacterFromForm() {
    const user = currentUser();
    if (!user) {
      openAuth("login");
      toast("Login dulu sebelum membuat karakter.");
      return;
    }
    const form = qs("#character-form");
    if (!form) return;
    state.ui.characterDraft = characterDraftFromForm(form);
    const existing = activeCharacter();
    const isExisting = existing && form.dataset.characterId === existing.id;
    const name = form.characterName?.value.trim() || "";
    const raceId = form.race?.value || "";
    const subraceId = form.subrace?.value || "";
    const classId = form.classNameField?.value || "";
    const klass = DATA.classes.find((k) => k.id === classId) || null;
    const level = clamp(form.level?.value || 1, 1, 20);
    const backgroundId = form.background?.value || "";
    const alignment = form.alignment?.value || "";

    if (!name) return failCharacterValidation("Nama karakter masih kosong. Isi bagian Nama Karakter dulu.", "race", "#character-form [name='characterName']");
    if (!raceId) return failCharacterValidation("Race belum dipilih. Arahkan ke Step 1 — Pilih Ras.", "race", "#character-form [name='race']");
    if (subracesForRace(raceId).length && !subraceById(raceId, subraceId)) {
      return failCharacterValidation("Subrace belum dipilih. Pilih subrace sesuai race D&D 2014.", "race", "#character-form [name='subrace']");
    }
    const abilityChoices = qsa("select[name='abilityChoices']", form).map((el) => el.value).filter(Boolean);
    const raceExt = raceExtension(raceId);
    const requiredAbilityChoices = Number(raceExt.abilityChoiceCount || 0);
    const uniqueAbilityChoices = new Set(abilityChoices);
    if (requiredAbilityChoices && (abilityChoices.length < requiredAbilityChoices || uniqueAbilityChoices.size < requiredAbilityChoices)) {
      return failCharacterValidation("Bonus ability pilihan race belum lengkap atau masih dobel. Lengkapi pilihan ability fleksibel dulu.", "race", "#character-form select[name='abilityChoices']");
    }
    if (!classId || !klass) return failCharacterValidation("Class belum dipilih. Arahkan ke Step 2 — Pilih Kelas.", "class", "#character-form [name='classNameField']");

    const baseAbilityScores = {};
    DATA.abilities.forEach((a) => {
      const input = form.querySelector("[name='ability-" + a.id + "']");
      baseAbilityScores[a.id] = normalizeAbilityBaseValue(input?.value ?? 0, userIsOwner(user));
      if (input && String(input.value) !== String(baseAbilityScores[a.id])) input.value = String(baseAbilityScores[a.id]);
    });
    const abilityMethodError = validateNonOwnerAbilityMethod(form, baseAbilityScores, !!isExisting, existing);
    if (abilityMethodError) {
      return failCharacterValidation(abilityMethodError.message, "abilities", abilityMethodError.selector);
    }
    const emptyAbility = DATA.abilities.find((a) => Number(baseAbilityScores[a.id] || 0) <= 0);
    if (emptyAbility) {
      return failCharacterValidation("Isi skor " + emptyAbility.label + " dulu di Step 3. Nilai 0 hanya placeholder awal karakter baru.", "abilities", "#character-form [name='ability-" + emptyAbility.id + "']");
    }

    if (!backgroundId) return failCharacterValidation("Background belum dipilih. Arahkan ke Step 4 — Deskripsikan Karakter.", "describe", "#character-form [name='background']");
    if (!alignment) return failCharacterValidation("Alignment belum dipilih. Arahkan ke Step 4 — Deskripsikan Karakter.", "describe", "#character-form [name='alignment']");

    const skillDraftForValidation = characterDraftFromForm(form);
    const skillBreakdown = skillSelectionBreakdown(skillDraftForValidation.skills || [], skillDraftForValidation);
    const skillLimit = Number(klass.skillPick || 0);
    if (skillBreakdown.classSelected.length < skillLimit) {
      return failCharacterValidation("Skill proficiency class belum lengkap. " + klass.name + " harus memilih " + skillLimit + " skill dari daftar class.", "describe", "#character-form input[name='skills'][data-skill-source='class']");
    }
    if (skillBreakdown.classSelected.length > skillLimit && !isGm()) {
      return failCharacterValidation("Skill proficiency class terlalu banyak. Batas " + klass.name + ": " + skillLimit + ".", "describe", "#character-form input[name='skills'][data-skill-source='class']");
    }
    if (skillBreakdown.raceSelected.length < skillBreakdown.raceLimit) {
      return failCharacterValidation("Bonus skill ras belum lengkap. " + effectiveRaceName(skillDraftForValidation) + " harus memilih " + skillBreakdown.raceLimit + " skill bonus dari ras.", "describe", "#character-form input[name='skills'][data-skill-source='race']");
    }
    if (skillBreakdown.raceSelected.length > skillBreakdown.raceLimit && !isGm()) {
      return failCharacterValidation("Bonus skill ras terlalu banyak. Batas ras saat ini: " + skillBreakdown.raceLimit + ".", "describe", "#character-form input[name='skills'][data-skill-source='race']");
    }

    const appearance = {
      hair: form.hair.value.trim(),
      eyes: form.eyes.value.trim(),
      skin: form.skin.value.trim(),
      style: form.style.value.trim(),
      notes: form.appearanceNotes.value.trim()
    };
    const missingAppearance = [
      ["hair", "rambut", "#character-form [name='hair']"],
      ["eyes", "mata", "#character-form [name='eyes']"],
      ["skin", "kulit", "#character-form [name='skin']"],
      ["style", "style", "#character-form [name='style']"]
    ].find(([key]) => !appearance[key]);
    if (!isGm() && missingAppearance) {
      return failCharacterValidation("Bagian tampilan " + missingAppearance[1] + " belum diisi. Lengkapi Step 4 dulu sebelum masuk meja.", "describe", missingAppearance[2]);
    }

    const ownsExisting = !!(isExisting && existing?.ownerId === user.id);
    const canChangeStarting = !isExisting || isGm() || ownsExisting;
    const selectedStartingId = form.startingPackage?.value || "";
    const selectedStartingPackage = selectedStartingId ? resolveStartingPackage(selectedStartingId, classId) : null;
    if (!selectedStartingPackage) {
      return failCharacterValidation("Starting package belum dipilih. Arahkan ke Step 5 — Pilih Perlengkapan.", "equipment", "#character-form [name='startingPackage']");
    }
    const equipmentChoices = {};
    qsa("[name^='equipmentChoice-']", form).forEach((el) => {
      const key = el.name.replace("equipmentChoice-", "");
      if (key) equipmentChoices[key] = el.value;
    });
    const missingEquipmentChoice = (selectedStartingPackage.choices || []).find((choice) => !equipmentChoices[choice.id]);
    if (missingEquipmentChoice) {
      return failCharacterValidation("Pilihan equipment belum lengkap: " + (missingEquipmentChoice.label || "equipment") + ".", "equipment", "#character-form [name='equipmentChoice-" + missingEquipmentChoice.id + "']");
    }

    const languageSelection = normalizeLanguageSelection(raceId, subraceId, qsa("select[name='languageChoices']", form).map((el) => el.value));
    const abilityContext = { race: raceId, subrace: subraceId, abilityChoices };
    const abilityScores = finalAbilityScores(baseAbilityScores, abilityContext);
    const abilityBonuses = effectiveAbilityBonuses(abilityContext);
    const selectedStartingItems = resolveStartingItems(selectedStartingPackage, equipmentChoices);
    const base = isExisting ? { ...existing } : {
      id: uid("char"),
      ownerId: user.id,
      roomId: state.activeRoomId || "",
      createdAt: nowIso(),
      inventory: [...selectedStartingItems],
      gold: selectedStartingPackage.gold,
      xp: 0,
      conditions: [],
      gmNotes: "",
      approvedLevel: level
    };
    const startingChoice = canChangeStarting ? {
      packageId: selectedStartingPackage.id,
      name: selectedStartingPackage.name,
      mode: selectedStartingPackage.mode,
      gold: selectedStartingPackage.gold,
      items: [...selectedStartingItems],
      choices: equipmentChoices,
      approved: true,
      chosenAt: nowIso()
    } : (existing.startingChoice || {
      packageId: selectedStartingPackage.id,
      name: selectedStartingPackage.name,
      mode: selectedStartingPackage.mode,
      gold: selectedStartingPackage.gold,
      items: [...selectedStartingItems],
      choices: equipmentChoices,
      approved: true,
      chosenAt: nowIso()
    });
    const inventory = canChangeStarting ? [...startingChoice.items] : (base.inventory || []);
    const hpMax = computeMaxHp(klass, abilityScores, level);
    const requestedLevel = isExisting && !isGm() && Number(existing.approvedLevel || existing.level) !== level ? level : "";
    const character = {
      ...base,
      name,
      race: raceId,
      subrace: subraceId,
      languages: languageSelection.all,
      languageChoices: languageSelection.extras,
      abilityChoices,
      abilityBonuses,
      baseAbilities: baseAbilityScores,
      raceTraits: effectiveRaceTraits({ race: raceId, subrace: subraceId }),
      className: classId,
      level,
      requestedLevel,
      background: backgroundId,
      alignment,
      personalityTraits: [form.personalityTrait1?.value.trim() || "", form.personalityTrait2?.value.trim() || ""],

      ideal: form.ideal?.value.trim() || "",
      bond: form.bond?.value.trim() || "",
      flaw: form.flaw?.value.trim() || "",
      appearance,
      portrait: state.characterPortraitDraft || (isExisting ? existing.portrait : ""),
      portraitName: state.characterPortraitDraftName || (isExisting ? existing.portraitName : ""),
      abilities: abilityScores,
      skills: skillBreakdown.all,
      startingChoice,
      gold: canChangeStarting ? startingChoice.gold : Number(base.gold || 0),
      inventory,
      hpMax,
      hpCurrent: isExisting ? clamp(existing.hpCurrent || hpMax, 0, hpMax) : hpMax,
      ac: computeAc(inventory, abilityScores),
      speed: effectiveRaceSpeed({ race: raceId, subrace: subraceId }),
      roomId: state.activeRoomId || base.roomId || "",
      updatedAt: nowIso()
    };
    const index = state.characters.findIndex((c) => c.id === character.id);
    if (index >= 0) state.characters[index] = character;
    else state.characters.push(character);
    state.activeCharacterId = character.id;
    state.ui.characterDraft = null;
    state.ui.characterStep = "race";
    saveState(true);
    toast(isExisting ? "Character sheet diperbarui." : "Karakter dibuat dan disimpan.");
    render();
  }

  function computeMaxHp(klass, abilities, level) {
    const con = mod(abilities.con || 10);
    const first = klass.hitDie + con;
    const later = Math.max(1, Math.ceil((klass.hitDie + 1) / 2) + con);
    return Math.max(1, first + Math.max(0, level - 1) * later);
  }

  function computeAc(inventory, abilities) {
    const dex = mod(abilities.dex || 10);
    const names = new Set((inventory || []).map((item) => String(item).toLowerCase()));
    let ac = 10 + dex;
    if (names.has("leather armor")) ac = 11 + dex;
    if (names.has("scale mail")) ac = 14 + Math.min(2, dex);
    if (names.has("chain mail")) ac = 16;
    if (names.has("shield") || names.has("wooden shield")) ac += 2;
    return ac;
  }

  function openPdfChoiceModal() {
    if (!state.characters.length) {
      toast("Belum ada karakter untuk diunduh.");
      return;
    }
    state.ui.showPdfChoice = true;
    render();
  }

  function closePdfChoiceModal() {
    state.ui.showPdfChoice = false;
    render();
  }

  function downloadSelectedCharacterPdf() {
    const characterId = qs("#pdf-character-select")?.value || state.activeCharacterId;
    const character = state.characters.find((c) => c.id === characterId) || activeCharacter();
    state.ui.showPdfChoice = false;
    render();
    downloadCharacterPdfFromTemplate(character);
  }

  async function downloadCharacterPdfFromTemplate(character) {
    if (!character) {
      toast("Pilih karakter dulu sebelum download PDF.");
      return;
    }
    // Gunakan generator sendiri agar hasil tidak kosong dan tetap rapih untuk print/offline.
    downloadCharacterSummaryPdf(character);
  }

  async function downloadOfficialTemplatePdf(character) {
    const { PDFDocument, StandardFonts } = window.PDFLib;
    const response = await fetch("assets/5E_CharacterSheet_Fillable.pdf", { cache: "no-store" });
    if (!response.ok) throw new Error("Template PDF tidak ditemukan.");
    const templateBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const race = raceById(character.race);
    const klass = classById(character.className);
    const raceName = effectiveRaceName(character);
    const raceTraits = effectiveRaceTraits(character);
    const languages = languageNames(character.languages || normalizeLanguageSelection(character.race, character.subrace, character.languageChoices || []).all);
    const prof = proficiencyBonus(character.level);
    const bgName = DATA.backgrounds.find((b) => b.id === character.background)?.name || character.background;
    const owner = state.accounts.find((a) => a.id === character.ownerId) || currentUser();
    const cleanPdfText = (value) => String(value ?? "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/…/g, "...");
    const setText = (name, value, fontSize = 8) => {
      try {
        const field = form.getTextField(name);
        if (typeof field.setFontSize === "function") field.setFontSize(fontSize);
        if (String(value ?? "").includes("\n") && typeof field.enableMultiline === "function") field.enableMultiline();
        field.setText(cleanPdfText(value));
      } catch (error) {
        // Field names in the official sheet vary slightly; missing optional fields are skipped safely.
      }
    };
    const abilityField = { str: ["STR", "STRmod"], dex: ["DEX", "DEXmod "], con: ["CON", "CONmod"], int: ["INT", "INTmod"], wis: ["WIS", "WISmod"], cha: ["CHA", "CHamod"] };
    const skillField = {
      acrobatics: "Acrobatics",
      animalHandling: "Animal",
      arcana: "Arcana",
      athletics: "Athletics",
      deception: "Deception ",
      history: "History ",
      insight: "Insight",
      intimidation: "Intimidation",
      investigation: "Investigation ",
      medicine: "Medicine",
      nature: "Nature",
      perception: "Perception ",
      performance: "Performance",
      persuasion: "Persuasion",
      religion: "Religion",
      sleightOfHand: "SleightofHand",
      stealth: "Stealth ",
      survival: "Survival"
    };
    const features = [
      `Race Traits: ${raceTraits.join(", ")}`,
      `Class Features: ${klass.features.join(", ")}`,
      `Starting Package: ${character.startingChoice?.name || "Belum dipilih"}`
    ].join("\n");
    const equipment = [
      ...(character.inventory || []),
      character.gold ? `${character.gold} gp` : ""
    ].filter(Boolean).join(", ");
    const profLang = [
      `Armor: ${klass.armor}`,
      `Gears: ${klass.weapons}`,
      `Languages: ${languages || "Common"}`
    ].join("\n");
    const attacks = (character.inventory || [])
      .filter((item) => /dagger|sword|bow|staff|crossbow/i.test(item))
      .slice(0, 3);

    setText("CharacterName", character.name, 10);
    setText("CharacterName 2", character.name, 10);
    setText("ClassLevel", `${klass.name} ${character.level}`, 7);
    setText("Background", bgName, 7);
    setText("PlayerName", owner?.name || "", 7);
    setText("Race ", raceName, 7);
    setText("Alignment", character.alignment, 7);
    setText("PersonalityTraits ", (character.personalityTraits || []).filter(Boolean).join("\n"), 6.5);
    setText("Ideals", character.ideal || "", 6.5);
    setText("Bonds", character.bond || "", 6.5);
    setText("Flaws", character.flaw || "", 6.5);
    setText("XP", Number(character.xp || 0));
    setText("ProfBonus", `+${prof}`);
    setText("AC", character.ac);
    setText("Initiative", signed(mod(character.abilities.dex)));
    setText("Speed", character.speed);
    setText("HPMax", character.hpMax);
    setText("HPCurrent", character.hpCurrent);
    setText("HDTotal", `${character.level}d${klass.hitDie}`);
    setText("HD", `d${klass.hitDie}`);
    setText("Passive", String(10 + skillBonus(character, "perception")));
    setText("GP", Number(character.gold || 0));
    setText("Equipment", equipment, 5.5);
    setText("Features and Traits", features, 5.5);
    setText("Feat+Traits", features, 5.5);
    setText("ProficienciesLang", profLang, 5.5);
    setText("AttacksSpellcasting", attacks.length ? attacks.map((item) => `${item}: ${signed(prof)} + ability`).join("\n") : "", 6);
    setText("Eyes", character.appearance?.eyes || "");
    setText("Skin", character.appearance?.skin || "");
    setText("Hair", character.appearance?.hair || "");
    setText("Backstory", character.appearance?.notes || "", 6);
    setText("Treasure", character.gold ? `${character.gold} gp` : "");

    DATA.abilities.forEach((ability) => {
      const [scoreName, modName] = abilityField[ability.id] || [];
      if (scoreName) setText(scoreName, character.abilities[ability.id]);
      if (modName) setText(modName, signed(mod(character.abilities[ability.id])));
      setText(`ST ${ability.label}`, signed(mod(character.abilities[ability.id]) + (klass.saves.includes(ability.id) ? prof : 0)));
    });
    DATA.skills.forEach((skill) => {
      if (skillField[skill.id]) setText(skillField[skill.id], signed(skillBonus(character, skill.id)));
    });
    try {
      form.updateFieldAppearances(font);
    } catch (error) {
      console.warn("PDF appearance update skipped", error);
    }
    try {
      form.flatten();
    } catch (error) {
      console.warn("PDF flatten skipped", error);
    }
    const bytes = await pdfDoc.save();
    downloadBytes(bytes, `${safeFileName(character.name)}_5E_CharacterSheet.pdf`, "application/pdf");
    toast("PDF karakter berhasil dibuat dari template.");
  }

  function downloadBytes(bytes, filename, type) {
    const blob = new Blob([bytes], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function safeFileName(name) {
    return String(name || "Character").trim().replace(/[^a-z0-9_-]+/gi, "_").replace(/^_+|_+$/g, "") || "Character";
  }

  function downloadCharacterSummaryPdf(character) {
    if (!character) {
      toast("Belum ada karakter untuk diunduh.");
      return;
    }
    const jsPdf = window.jspdf?.jsPDF;
    if (!jsPdf) {
      toast("PDF generator belum dimuat.");
      return;
    }
    const doc = new jsPdf({ unit: "pt", format: "a4" });
    const klass = classById(character.className);
    const raceName = effectiveRaceName(character);
    const raceTraits = effectiveRaceTraits(character);
    const languages = languageNames(character.languages || normalizeLanguageSelection(character.race, character.subrace, character.languageChoices || []).all);
    const prof = proficiencyBonus(character.level);
    const bgName = DATA.backgrounds.find((b) => b.id === character.background)?.name || character.background;
    const margin = 32;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const line = (x1, y1, x2, y2) => doc.line(x1, y1, x2, y2);
    const box = (x, y, w, h, title, value = "") => {
      doc.setDrawColor(80, 80, 80);
      doc.roundedRect(x, y, w, h, 4, 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(String(title).toUpperCase(), x + 6, y + 11);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      if (value) doc.text(doc.splitTextToSize(String(value), w - 12), x + 6, y + 25);
    };
    const section = (title, y) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(title.toUpperCase(), margin, y);
      line(margin, y + 4, pageW - margin, y + 4);
    };
    const addFooter = () => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("GemuYokai DnD 2014 printable sheet - bisa dipakai online atau dicetak untuk isi manual.", margin, pageH - 18);
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(character.name || "Character", margin, 42);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${raceName} ${klass.name} Lv ${character.level} | ${bgName} | ${character.alignment}`, margin, 59);

    const statY = 78;
    const statW = 76;
    DATA.abilities.forEach((a, i) => {
      const x = margin + i * (statW + 8);
      const val = character.abilities[a.id];
      box(x, statY, statW, 58, a.label, `${val}  (${signed(mod(val))})`);
    });

    section("Combat", 160);
    box(margin, 174, 50, 42, "HP", `${character.hpCurrent}/${character.hpMax}`);
    box(margin + 58, 174, 50, 42, "AC", character.ac);
    box(margin + 116, 174, 50, 42, "Speed", `${character.speed} ft`);
    box(margin + 174, 174, 60, 42, "Prof", `+${prof}`);
    box(margin + 242, 174, 60, 42, "Init", signed(mod(character.abilities.dex)));
    box(margin + 310, 174, 60, 42, "Pass Wis", 10 + skillBonus(character, "perception"));
    box(margin + 378, 174, 70, 42, "Inspiration", character.inspiration ? "YES" : "NO");
    box(margin + 456, 174, 68, 42, "Hit Dice", `${character.hitDiceRemaining}/d${klass.hitDie}`);

    const drawPillText = (text, x, y, w, h) => {
      doc.setFillColor(235, 235, 235);
      doc.roundedRect(x, y - h + 3, w, h, 3, 3, 'F');
      doc.text(String(text), x + 4, y);
    };

    section("Attacks & Spellcasting", 230);
    const atkY = 244;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1.2);
    doc.roundedRect(margin, atkY, pageW - margin * 2, 105, 4, 4);
    doc.setLineWidth(1);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("NAME", margin + 10, atkY + 14);
    doc.text("ATK", margin + 150, atkY + 14);
    doc.text("DAMAGE/TYPE", margin + 210, atkY + 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);

    const atkData = character._computedAttacks || character.attacks || [];
    for (let i = 0; i < 6; i++) {
      const rowY = atkY + 28 + (i * 12);
      const atk = atkData[i] || { name: "", bonus: "", damage: "" };
      drawPillText(atk.name, margin + 10, rowY, 130, 10);
      drawPillText(atk.bonus, margin + 150, rowY, 50, 10);
      drawPillText(atk.damage, margin + 210, rowY, 130, 10);
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    doc.text("ATTACKS & SPELLCASTING", margin + (pageW - margin * 2)/2, atkY + 98, { align: "center" });

    section("Skills & Saving Throws", 360);
    let y = 378;
    DATA.skills.forEach((skill, i) => {
      const col = i < 9 ? margin : margin + 260;
      const rowY = i < 9 ? y + i * 15 : y + (i - 9) * 15;
      const hasExp = (character.expertise || []).includes("skill:" + skill.id);
      const checked = hasExp ? "[E]" : (character.skills.includes(skill.id) ? "[x]" : "[ ]");
      doc.setFont("helvetica", character.skills.includes(skill.id) ? "bold" : "normal");
      doc.setFontSize(8);
      doc.text(`${checked} ${signed(skillBonus(character, skill.id))} ${skill.label}`, col, rowY);
    });
    doc.setFont("helvetica", "normal");
    DATA.abilities.forEach((a, i) => {
      const save = mod(character.abilities[a.id]) + (klass.saves.includes(a.id) ? prof : 0);
      doc.text(`${klass.saves.includes(a.id) ? "[x]" : "[ ]"} ${a.label} Save ${signed(save)}`, margin + 400, 378 + i * 15);
    });

    section("Story", 525);
    box(margin, 539, 255, 44, "Personality Trait 1", character.personalityTraits?.[0] || "");
    box(margin + 270, 539, 255, 44, "Personality Trait 2", character.personalityTraits?.[1] || "");
    box(margin, 591, 165, 44, "Ideal", character.ideal || "");
    box(margin + 180, 591, 165, 44, "Bond", character.bond || "");
    box(margin + 360, 591, 165, 44, "Flaw", character.flaw || "");

    const profY = 645;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(1.2);

    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const toolTxt = "TOOL: " + ((character.inventory || []).filter(i => /tool|kit|set/i.test(i)).join(", ") || "None");
    const langTxt = "LANGUAGE: " + (languages || "Common");
    const armTxt = "ARMOR: " + (klass.armor || "None");
    const wepTxt = "WEAPON: " + (klass.weapons || "Simple weapons");

    const toolLines = doc.splitTextToSize(toolTxt, pageW - margin*2 - 20);
    const langLines = doc.splitTextToSize(langTxt, pageW - margin*2 - 20);
    const armLines = doc.splitTextToSize(armTxt, pageW - margin*2 - 20);
    const wepLines = doc.splitTextToSize(wepTxt, pageW - margin*2 - 20);

    let currentY = profY + 12;
    doc.text(toolLines, margin + 10, currentY);
    currentY += toolLines.length * 10;
    line(margin + 5, currentY - 4, pageW - margin - 5, currentY - 4);

    currentY += 10;
    doc.text(langLines, margin + 10, currentY);
    currentY += langLines.length * 10;
    line(margin + 5, currentY - 4, pageW - margin - 5, currentY - 4);

    currentY += 10;
    doc.text(armLines, margin + 10, currentY);
    currentY += armLines.length * 10;
    line(margin + 5, currentY - 4, pageW - margin - 5, currentY - 4);

    currentY += 10;
    doc.text(wepLines, margin + 10, currentY);
    currentY += wepLines.length * 10;

    const boxHeight = currentY - profY + 8;
    doc.roundedRect(margin, profY, pageW - margin * 2, boxHeight, 4, 4);
    doc.setLineWidth(1);

    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    doc.text("OTHER PROFICIENCIES & LANGUAGES", margin + (pageW - margin * 2)/2, profY + boxHeight - 6, { align: "center" });

    const equipY = profY + boxHeight + 15;
    section("Equipment", equipY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const eqItems = [`Gold: ${character.gold || 0} gp`, ...(character.inventory || [])];
    let eqY = equipY + 16;
    eqItems.slice(0, 5).forEach(item => {
      const lines = doc.splitTextToSize("• " + item, pageW - margin * 2);
      doc.text(lines, margin + 5, eqY);
      eqY += 10 * lines.length;
    });
    if (eqItems.length > 5) {
      doc.setFont("helvetica", "italic");
      doc.text("... (lihat detail inventory di halaman berikutnya)", margin + 5, eqY);
    }

    addFooter();

    const writePair = (title, text, x, yPos, width) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text(String(title), x, yPos);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      const lines = doc.splitTextToSize(String(text || "-"), width);
      doc.text(lines, x, yPos + 12);
      return yPos + 16 + lines.length * 10;
    };
    const nextDetailPage = (title) => { doc.addPage(); section(title, 42); return 64; };

    let detailY = nextDetailPage("Inventory & Equipment Detail");
    const inventoryRows = [
      ["Gold", `${Number(character.gold || 0)} gp`],
      ["Starting Package", character.startingChoice?.name || "None"],
      ["All Items", (character.inventory || []).map(i => "• " + i).join("\n") || "Kosong"]
    ];
    inventoryRows.forEach(([title, text]) => {
      if (detailY > pageH - 86) { addFooter(); detailY = nextDetailPage("Inventory & Equipment Detail"); }
      detailY = writePair(title, text, margin, detailY, pageW - margin * 2) + 5;
    });
    addFooter();

    detailY = nextDetailPage("Features & Traits Detail");
    const featureRows = [
      ...raceTraits.map((trait) => ["Race Trait - " + trait, traitGuideText(trait)]),
      ...(klass.features || []).map((feature) => ["Class Feature - " + feature, pdfClassFeatureGuideText(feature)]),
      ["Languages", languages || "Common"]
    ];
    featureRows.forEach(([title, text]) => {
      if (detailY > pageH - 86) { addFooter(); detailY = nextDetailPage("Features & Traits Detail"); }
      detailY = writePair(title, text, margin, detailY, pageW - margin * 2) + 5;
    });
    addFooter();

    detailY = nextDetailPage("Spellcasting & Spells Detail");
    const spellAbilityId = pdfSpellcastingAbilityId(klass);
    const spellAbilityScore = Number(character.abilities?.[spellAbilityId] || 10);
    const spellAbilityName = abilityLabel(spellAbilityId);
    const spellAbilityMod = mod(spellAbilityScore);
    const spellSaveDc = 8 + prof + spellAbilityMod;
    const spellAttackBonus = prof + spellAbilityMod;
    box(margin, detailY, 128, 46, "Spellcasting Class", klass.name);
    box(margin + 136, detailY, 118, 46, "Spellcasting Ability", `${spellAbilityName} ${signed(spellAbilityMod)}`);
    box(margin + 262, detailY, 96, 46, "Spell Save DC", spellSaveDc);
    box(margin + 366, detailY, 130, 46, "Spell Attack Bonus", signed(spellAttackBonus));
    detailY += 66;
    detailY = writePair("Spell Slots / Level", pdfSpellSlotsSummary(klass, Number(character.level || 1)), margin, detailY, pageW - margin * 2) + 8;
    const exportSpells = pdfSpellsForCharacter(character, klass);
    if (!exportSpells.length) {
      detailY = writePair("Spells", "Class ini belum memiliki spell pada data karakter. Tambahkan daftar spell di data karakter jika ingin muncul sebagai spell yang dimiliki.", margin, detailY, pageW - margin * 2);
    }
    exportSpells.forEach((spell) => {
      const d = pdfSpellDetail(spell);
      const title = `${spell.name} (${Number(spell.level) === 0 ? "Cantrip" : "Level " + spell.level}) - ${spell.school || "Spell"}`;
      const text = [`Casting Time: ${d.castingTime}`, `Range: ${d.range}`, `Target: ${d.target}`, `Components: ${d.components}`, `Duration: ${d.duration}`, `Description: ${d.description}`, `At Higher Levels: ${d.higher}`].join("\n");
      if (detailY > pageH - 150) { addFooter(); detailY = nextDetailPage("Spells Detail Continued"); }
      detailY = writePair(title, text, margin, detailY, pageW - margin * 2) + 9;
    });
    addFooter();

    doc.addPage();
    section("Printable Manual Area", 42);
    box(margin, 58, 255, 70, "Backstory / Catatan Karakter", character.appearance?.notes || "");
    box(margin + 270, 58, 255, 70, "Appearance", `Hair: ${character.appearance?.hair || "-"}; Eyes: ${character.appearance?.eyes || "-"}; Skin: ${character.appearance?.skin || "-"}; Style: ${character.appearance?.style || "-"}`);
    section("Inventory Tambahan", 160);
    for (let i = 0; i < 14; i++) line(margin, 182 + i * 22, pageW - margin, 182 + i * 22);
    section("Spell / Ability / Attack Notes", 510);
    for (let i = 0; i < 10; i++) line(margin, 532 + i * 22, pageW - margin, 532 + i * 22);
    addFooter();

    doc.save(`${safeFileName(character.name)}_Printable_Sheet.pdf`);
    toast("PDF karakter rapih berhasil dibuat.");
  }

  function characterPdfLines(c) {
    const race = raceById(c.race);
    const klass = classById(c.className);
    const prof = proficiencyBonus(c.level);
    const raceName = effectiveRaceName(c);
    const raceTraits = effectiveRaceTraits(c);
    const languages = languageNames(c.languages || normalizeLanguageSelection(c.race, c.subrace, c.languageChoices || []).all);
    const spellList = DATA.spells.filter((spell) => String(spell.classes).toLowerCase().includes(klass.name.toLowerCase())).slice(0, 12);
    const attacks = (c.inventory || []).filter((item) => /dagger|sword|bow|staff|crossbow/i.test(item));
    const warnings = auditRules().filter((warning) => warning.text.includes(c.name)).map((warning) => `${warning.level.toUpperCase()}: ${warning.text}`);
    return [
      c.name,
      `${raceName} ${klass.name} level ${c.level} | Background: ${c.background} | Alignment: ${c.alignment}`,
      `HP ${c.hpCurrent}/${c.hpMax} | AC ${c.ac} | Speed ${c.speed} | Proficiency +${prof}`,
      `Passive Perception ${10 + skillBonus(c, "perception")} | XP ${Number(c.xp || 0)} | Conditions ${(c.conditions || []).join(", ") || "None"}`,
      "",
      "Abilities",
      ...DATA.abilities.map((a) => `${a.label}: ${c.abilities[a.id]} (${signed(mod(c.abilities[a.id]))})`),
      "",
      "Saving Throws",
      ...DATA.abilities.map((a) => `${a.label}: ${signed(mod(c.abilities[a.id]) + (klass.saves.includes(a.id) ? prof : 0))}${klass.saves.includes(a.id) ? " proficient" : ""}`),
      "",
      "Skills",
      ...DATA.skills.map((s) => {
        const value = mod(c.abilities[s.ability]) + (c.skills.includes(s.id) ? prof : 0);
        return `${s.label}: ${signed(value)}${c.skills.includes(s.id) ? " proficient" : ""}`;
      }),
      "",
      "Other Proficiencies & Languages",
      `Armor: ${klass.armor}`,
      `Gears: ${klass.weapons}`,
      `Languages: ${languages || "Common"}`,
      "",
      "Attacks & Spellcasting",
      ...(attacks.length ? attacks.map((item) => `${item}: use relevant ability + proficiency if proficient`) : ["No weapon listed yet"]),
      ...(spellList.length ? spellList.map((spell) => `${spell.name}: ${spell.level === 0 ? "Cantrip" : "Level " + spell.level} | ${spell.school} | ${spell.notes}`) : ["No SRD spell suggestions for this class yet"]),
      "",
      "Race Traits: " + raceTraits.join(", "),
      "Class Features: " + klass.features.join(", "),
      "Starting Package: " + (c.startingChoice?.name || "Not selected") + " | Gold: " + Number(c.gold || 0),
      "Inventory: " + (c.inventory || []).join(", "),
      "Appearance: " + [c.appearance?.hair, c.appearance?.eyes, c.appearance?.skin, c.appearance?.style, c.appearance?.notes].filter(Boolean).join("; "),
      "",
      "Rule AI Watch",
      ...(warnings.length ? warnings : ["No character-specific warning at export time."]),
      "",
      "Source note: SRD 5.1 baseline, paraphrased/structured for this app."
    ];
  }

  function exportSave() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gemuyokai-dnd2014-save.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importSavePrompt() {
    state.ui.showImport = true;
    render();
  }

  function closeImportModal() {
    state.ui.showImport = false;
    render();
  }

  function importSaveApply() {
    const raw = qs("#import-save-text")?.value.trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      state = mergeState(defaultState(), parsed);
      state.ui.showImport = false;
      saveState();
      toast("Save berhasil dimuat.");
      render();
    } catch (error) {
      toast("Format save tidak valid.");
    }
  }

  function resetLocal() {
    if (!confirm("Hapus sisa cache DND lama di browser ini? Data MySQL tidak ikut dihapus.")) return;
    purgeLegacyBrowserSave();
    toast("Cache lokal DND lama sudah dibersihkan. Data utama tetap dari MySQL.");
  }

  function rollDice(sides, label) {
    if (!canTakeGameAction("roll dice")) return;
    if (sides === 100) {
      rollPercentileDice();
      return;
    }
    const result = Math.floor(Math.random() * sides) + 1;
    state.ui.diceResult = result;
    state.ui.diceLabel = label;
    state.ui.diceDetail = "single die";
    state.rollLog.unshift({
      id: uid("roll"),
      label,
      total: result,
      detail: "1" + label,
      user: currentUser()?.name || "Guest",
      createdAt: nowIso()
    });
    state.rollLog = state.rollLog.slice(0, 80);
    saveState();
    animateDice(result, label);
  }

  function rollPercentileDice() {
    const tens = Math.floor(Math.random() * 10) * 10;
    const ones = Math.floor(Math.random() * 10);
    const total = tens === 0 && ones === 0 ? 100 : tens + ones;
    const tensLabel = tens === 0 ? "00" : String(tens);
    state.ui.diceResult = total;
    state.ui.diceLabel = "d100 percentile";
    state.ui.diceDetail = `Tens die ${tensLabel} + ones die ${ones}`;
    state.rollLog.unshift({
      id: uid("roll"),
      label: "d100",
      total,
      detail: `percentile ${tensLabel} + ${ones} = ${total}`,
      user: currentUser()?.name || "Guest",
      createdAt: nowIso()
    });
    state.rollLog = state.rollLog.slice(0, 80);
    saveState();
    animateDice(total, "d100 percentile");
  }

  function rollSkill() {
    if (!canTakeGameAction("roll skill")) return;
    const character = state.characters.find((c) => c.id === qs("#skill-character")?.value) || activeCharacter();
    const skill = skillById(qs("#skill-select")?.value);
    if (!character || !skill) {
      toast("Pilih karakter dan skill dulu.");
      return;
    }
    const d20 = Math.floor(Math.random() * 20) + 1;
    const bonus = skillBonus(character, skill.id);
    const total = d20 + bonus;
    state.ui.diceResult = total;
    state.ui.diceLabel = skill.label;
    state.ui.diceDetail = `d20 ${d20} ${signed(bonus)}`;
    state.rollLog.unshift({
      id: uid("roll"),
      label: skill.label,
      total,
      detail: `d20 ${d20} ${signed(bonus)} (${character.name})`,
      user: currentUser()?.name || "Guest",
      createdAt: nowIso()
    });
    state.rollLog = state.rollLog.slice(0, 80);
    saveState();
    animateDice(total, skill.label);
  }

  function rollExpression(expression, label, charName) {
    if (!canTakeGameAction("roll dice")) return;
    const str = String(expression || "").replace(/\s+/g, "").toLowerCase();
    let diceCount = 1;
    let diceSides = 20;
    let modifier = 0;
    let match;

    if (/^[+-]\d+$/.test(str)) {
      modifier = parseInt(str, 10);
    } else if ((match = str.match(/^(\d*)d(\d+)([+-]\d+)?$/))) {
      diceCount = parseInt(match[1] || 1, 10);
      diceSides = parseInt(match[2], 10);
      modifier = match[3] ? parseInt(match[3], 10) : 0;
    } else {
      toast("Format dadu tidak valid: " + expression);
      return;
    }

    let total = 0;
    let rolls = [];
    for (let i = 0; i < diceCount; i++) {
      const r = Math.floor(Math.random() * diceSides) + 1;
      rolls.push(r);
      total += r;
    }
    total += modifier;

    state.ui.diceResult = total;
    state.ui.diceLabel = label;
    state.ui.diceDetail = `${diceCount}d${diceSides}${modifier ? signed(modifier) : ""} [${rolls.join(", ")}]`;
    state.rollLog.unshift({
      id: uid("roll"),
      label: label,
      total,
      detail: `${diceCount}d${diceSides}${modifier ? signed(modifier) : ""} = ${total} (${charName || "Karakter"})`,
      user: currentUser()?.name || "Guest",
      createdAt: nowIso()
    });
    state.rollLog = state.rollLog.slice(0, 80);
    saveState();
    animateDice(total, label);
  }

  function toggleInspiration(charId) {
    const c = state.characters.find(x => x.id === charId);
    if (!c) return;
    c.inspiration = c.inspiration ? 0 : 1;
    saveState();
    render();
  }

  function skillBonus(character, skillId) {
    const skill = skillById(skillId);
    if (!skill) return 0;
    let prof = 0;
    if (character.skills.includes(skillId)) prof = proficiencyBonus(character.level);
    if ((character.expertise || []).includes("skill:" + skillId)) prof *= 2;
    return mod(character.abilities[skill.ability]) + prof;
  }

  function skillGuideText(skillId) {
    const skill = skillById(skillId);
    if (skill?.use) return skill.use;
    return "Membantu pengecekan kemampuan saat situasinya sesuai.";
  }




  function alignmentGuideText(alignmentName) {
    const guide = DATA.alignmentDetails || {};
    return guide[String(alignmentName || "").toLowerCase()] || "Alignment menggambarkan arah moral dan cara karakter mengambil keputusan. Ini bukan borgol mutlak, tapi pegangan roleplay.";
  }

  function renderSelectedLanguageGuide(draft) {
    const normalized = normalizeLanguageSelection(draft.race, draft.subrace, draft.languageChoices || draft.languages || []);
    const selected = normalized.all.map(languageById).filter(Boolean);
    if (!selected.length) return `<p class="dnd-muted">Belum ada bahasa terpilih.</p>`;
    return `<div class="language-guide-grid language-guide-selected">
      ${selected.map((lang) => `<div><strong>${esc(lang.name)}</strong><small>${esc(lang.type)} • Aksara: ${esc(lang.script)}</small><p>${esc(lang.use)}</p></div>`).join("")}
    </div>`;
  }

  function renderTraitGuideList(draft) {
    const traits = effectiveRaceTraits(draft);
    if (!traits.length) return `<p class="dnd-muted">Belum ada trait aktif.</p>`;
    return `<div class="trait-guide-list">
      ${traits.map((trait) => `<div><strong>${esc(trait)}</strong><p>${esc(traitGuideText(trait))}</p></div>`).join("")}
    </div>`;
  }

  function abilityRollLockedForPlayer() {
    return !!(state.ui.abilityRollLog?.mode === "4d6" && !userIsOwner(currentUser()));
  }

  function rollAbilityArray(mode = "4d6") {
    const form = qs("#character-form");
    if (!form) return;
    if (abilityRollLockedForPlayer()) {
      toast("Player hanya bisa menentukan skor kemampuan sekali. Owner tetap bisa roll ulang jika memang perlu koreksi.");
      return;
    }
    state.ui.characterDraft = characterDraftFromForm(form);
    const standard = [15, 14, 13, 12, 10, 8];
    let values = [...standard];
    let details = "Standard array: 15, 14, 13, 12, 10, 8. Pilih angka dari dropdown di tiap ability; bebas ditempatkan ke STR/DEX/CON/INT/WIS/CHA.";
    let rolls = [];
    if (mode !== "standard") {
      rolls = DATA.abilities.map(() => {
        const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
        return { dice, total: dice.slice(0, 3).reduce((sum, value) => sum + value, 0) };
      });
      values = rolls.map((roll) => roll.total).sort((a, b) => b - a);
      details = rolls.map((roll, index) => `Roll ${index + 1}: [${roll.dice.join(", ")}] ambil ${roll.dice.slice(0, 3).join("+")} = ${roll.total}`).join(" • ");
    }
    state.ui.abilityRollLog = { mode, values, rolls, details, createdAt: nowIso() };
    state.ui.abilityPickAssignments = {};
    updateCharacterBuilderGuide();
    saveState(false);
    render();
    toast(mode === "standard" ? "Standard array muncul. Pilih angka untuk tiap stat." : "Hasil dice muncul. Pilih angka untuk STR/DEX/CON/INT/WIS/CHA secara bebas.");
  }

  function currentAbilityRollValues() {
    return Array.isArray(state.ui.abilityRollLog?.values) ? state.ui.abilityRollLog.values : [];
  }

  function normalizeAbilityBaseValue(value, ownerCanManual = false) {
    const max = ownerCanManual ? 30 : 20;
    return clamp(value, 0, max);
  }

  function validateNonOwnerAbilityMethod(form, baseAbilityScores, isExisting, existing) {
    if (userIsOwner(currentUser())) return null;
    const changed = DATA.abilities.some((ability) => {
      const before = Number(existing?.baseAbilities?.[ability.id] ?? existing?.abilities?.[ability.id] ?? 0);
      const after = Number(baseAbilityScores?.[ability.id] ?? 0);
      return before !== after;
    });
    if (isExisting && !changed) return null;
    const values = currentAbilityRollValues();
    const log = state.ui.abilityRollLog || null;
    if (!log || values.length < DATA.abilities.length) {
      return {
        message: "Player/GM wajib memilih metode di Step 3 dulu: Roll 4d6 atau Standard Array. Input manual hanya untuk Owner.",
        selector: "#character-form .ability-roll-tools"
      };
    }
    const assignments = state.ui.abilityPickAssignments || {};
    const used = new Set();
    for (const ability of DATA.abilities) {
      const rawIndex = assignments[ability.id];
      if (rawIndex === undefined || rawIndex === null || rawIndex === "") {
        return { message: `Pilih hasil ${ability.label} dari dropdown Step 3. Player/GM tidak bisa mengetik skor manual.`, selector: `#character-form select[data-ability-pick='${ability.id}']` };
      }
      const index = Number(rawIndex);
      if (!Number.isInteger(index) || index < 0 || index >= values.length || used.has(index)) {
        return { message: `Pilihan skor ${ability.label} tidak valid atau sudah dipakai ability lain.`, selector: `#character-form select[data-ability-pick='${ability.id}']` };
      }
      used.add(index);
      const expected = Number(values[index]);
      const actual = Number(baseAbilityScores[ability.id] || 0);
      if (actual !== expected) {
        return {
          message: `Skor ${ability.label} harus sama dengan hasil dropdown (${expected}). Manual edit hanya untuk Owner.`,
          selector: `#character-form [name='ability-${ability.id}']`
        };
      }
    }
    return null;
  }

  function usedAbilityRollIndexes(exceptAbilityId = "") {
    const assignments = state.ui.abilityPickAssignments || {};
    return Object.entries(assignments)
      .filter(([abilityId, value]) => abilityId !== exceptAbilityId && value !== "" && value !== undefined && value !== null)
      .map(([, value]) => Number(value));
  }

  function renderAbilityRollPool() {
    const log = state.ui.abilityRollLog;
    const values = currentAbilityRollValues();
    if (!log || !values.length) {
      return `<div class="ability-roll-pool empty"><strong>Belum ada hasil dice</strong><small>Klik Roll 4d6 atau tampilkan standard array. Setelah angka muncul, pilih angka itu untuk stat mana pun.</small></div>`;
    }
    const used = new Set(usedAbilityRollIndexes());
    return `<div class="ability-roll-pool">
      <strong>Hasil yang boleh dipasang bebas</strong>
      <div class="ability-roll-values">
        ${values.map((value, index) => `<span class="ability-roll-chip ${used.has(index) ? "used" : ""}">${esc(value)}${used.has(index) ? " ✓" : ""}</span>`).join("")}
      </div>
      <small>${esc(log.details || "Pilih angka dari dropdown pada masing-masing ability.")}</small>
    </div>`;
  }

  function renderAbilityValuePicker(abilityId, canUsePicker) {
    const values = currentAbilityRollValues();
    if (!values.length || !canUsePicker) return "";
    const assignments = state.ui.abilityPickAssignments || {};
    const selectedIndex = assignments[abilityId];
    const used = new Set(usedAbilityRollIndexes(abilityId));
    const options = values.map((value, index) => {
      const disabled = used.has(index) ? "disabled" : "";
      const selected = Number(selectedIndex) === index ? "selected" : "";
      return `<option value="${index}" ${selected} ${disabled}>${esc(value)}${disabled ? " — sudah dipakai" : ""}</option>`;
    }).join("");
    return `<select class="ability-pick-select" data-ability-pick="${esc(abilityId)}"><option value="">Pilih hasil dice...</option>${options}</select>`;
  }

  function applyAbilityRollPick(select) {
    const abilityId = select?.dataset?.abilityPick || "";
    const values = currentAbilityRollValues();
    if (!abilityId || !values.length) return;
    const index = select.value === "" ? "" : Number(select.value);
    state.ui.abilityPickAssignments = { ...(state.ui.abilityPickAssignments || {}) };
    if (index === "" || Number.isNaN(index)) {
      delete state.ui.abilityPickAssignments[abilityId];
    } else {
      state.ui.abilityPickAssignments[abilityId] = index;
      const input = qs(`[name="ability-${abilityId}"]`, select.closest("#character-form") || document);
      if (input) input.value = String(values[index] || 10);
    }
    updateAbilityPickAvailability(select.closest("#character-form"));
    updateCharacterBuilderGuide();
  }

  function updateAbilityPickAvailability(form) {
    if (!form) return;
    const values = currentAbilityRollValues();
    const assignments = state.ui.abilityPickAssignments || {};
    qsa("select[data-ability-pick]", form).forEach((select) => {
      const abilityId = select.dataset.abilityPick || "";
      const selectedIndex = assignments[abilityId];
      const used = new Set(usedAbilityRollIndexes(abilityId));
      qsa("option", select).forEach((option) => {
        if (option.value === "") return;
        const optionIndex = Number(option.value);
        option.disabled = used.has(optionIndex);
        option.selected = Number(selectedIndex) === optionIndex;
        const value = values[optionIndex];
        option.textContent = `${value}${option.disabled ? " — sudah dipakai" : ""}`;
      });
    });
  }

  function enforceSkillCheckboxLimit(changedInput) {
    const form = changedInput?.closest("#character-form");
    if (!form || !changedInput.checked) return true;
    const source = changedInput.dataset.skillSource || "class";
    const max = Number(changedInput.dataset.skillMax || 0);
    if (!max) return true;
    const checked = qsa(`input[name='skills'][data-skill-source='${source}']:checked`, form);
    if (checked.length <= max) return true;
    changedInput.checked = false;
    const label = source === "race" ? "bonus skill ras" : "skill class";
    toast(`Batas ${label} hanya ${max}. Hapus pilihan lain dulu kalau mau mengganti.`);
    return false;
  }

  function renderClassSkillGrid(draft, canEditStats) {
    if (!draft.className) {
      return `<div class="dnd-check-grid class-skill-grid"><div class="skill-class-note span-12">Belum ada skill yang dipilih. Pilih class dulu agar daftar skill proficiency mengikuti aturan class D&amp;D 2014.</div></div>`;
    }
    const klass = classById(draft.className);
    const options = classSkillOptions(draft.className);
    const breakdown = skillSelectionBreakdown(draft.skills || [], draft);
    const raceChoices = raceSkillChoiceOptions(draft);
    const classCount = breakdown.classSelected.length;
    const raceCount = breakdown.raceSelected.length;
    const classSelectedSet = new Set(breakdown.classSelected);
    const autoRaceSet = new Set(breakdown.automaticRace);
    return `<div class="class-skill-wrap">
      <div class="skill-limit-banner">
        <strong>Skill proficiency class</strong>
        <span>${esc(klass.name)} wajib pilih ${esc(breakdown.classLimit)} skill dari daftar class. Rogue = 4; class lain mengikuti angka class masing-masing.</span>
        <em>${esc(classCount)}/${esc(breakdown.classLimit)} dipilih</em>
      </div>
      <div class="dnd-check-grid class-skill-grid" data-skill-group="class">
        ${options.map((s) => renderSkillProficiencyOption(s, draft, canEditStats, "class", breakdown.classLimit)).join("")}
      </div>
      ${breakdown.automaticRace.length ? `<div class="race-skill-auto"><strong>Skill dari ras</strong>${breakdown.automaticRace.map((id) => `<span>${esc(skillById(id)?.label || id)}</span>`).join("")}<small>Skill ini berasal dari trait ras D&D 2014, jadi tidak perlu dipilih dobel di skill class.</small></div>` : ""}
      ${raceChoices.length ? `<div class="skill-limit-banner race-skill-banner">
        <strong>Bonus skill ras</strong>
        <span>${esc(effectiveRaceName(draft))} memilih ${esc(breakdown.raceLimit)} skill bebas dari ras. Skill yang sudah dipilih dari class tidak bisa dipilih dobel.</span>
        <em>${esc(raceCount)}/${esc(breakdown.raceLimit)} dipilih</em>
      </div>
      <div class="dnd-check-grid class-skill-grid race-skill-grid" data-skill-group="race">
        ${raceChoices.map((s) => renderSkillProficiencyOption(s, draft, canEditStats && !classSelectedSet.has(s.id) && !autoRaceSet.has(s.id), "race", breakdown.raceLimit, classSelectedSet.has(s.id) ? "Sudah dipakai di skill class" : "")).join("")}
      </div>` : ""}
      <div class="skill-class-note">Total aktif sekarang: ${esc(breakdown.all.map((id) => skillById(id)?.label || id).join(", ") || "belum ada")}</div>
    </div>`;
  }

  function renderSkillProficiencyOption(skill, draft, canEditStats, source = "class", maxPick = 0, lockedReason = "") {
    const breakdown = skillSelectionBreakdown(draft.skills || [], draft);
    const selected = source === "race" ? breakdown.raceSelected.includes(skill.id) : breakdown.classSelected.includes(skill.id);
    const abilityName = abilityLabel(skill.ability);
    const abilityMod = mod(draft.abilities?.[skill.ability]);
    const prof = proficiencyBonus(draft.level);
    const totalIfPicked = abilityMod + prof;
    const disabled = canEditStats ? "" : "disabled";
    return `<label class="dnd-check skill-check-card ${selected ? "skill-selected" : ""} ${lockedReason ? "skill-locked" : ""}">
      <input type="checkbox" name="skills" value="${esc(skill.id)}" data-skill-source="${esc(source)}" data-skill-max="${esc(maxPick)}" ${selected ? "checked" : ""} ${disabled}>
      <span class="dnd-check-body">
        <strong>${esc(skill.label)}${skill.localName ? ` <small>(${esc(skill.localName)})</small>` : ""}</strong>
        <small class="skill-source">Ability tambahan: ${esc(skill.abilityText || abilityName)}</small>
        <small class="skill-rule skill-unchecked">Jika dipilih: ${esc(abilityName)} ${signed(abilityMod)} + Proficiency ${signed(prof)} = ${signed(totalIfPicked)}</small>
        <small class="skill-rule skill-checked">Aktif: total cek ${signed(totalIfPicked)} (${esc(abilityName)} ${signed(abilityMod)} + Proficiency ${signed(prof)})</small>
        <em>${lockedReason ? esc(lockedReason) : esc(skillGuideText(skill.id))}</em>
      </span>
    </label>`;
  }

  function animateDice(result, label) {
    const face = qs("#dice-face");
    const labelEl = qs("#dice-label");
    const detailEl = qs("#dice-detail");
    if (!face) {
      render();
      return;
    }
    face.classList.add("rolling");
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks += 1;
      face.textContent = String(Math.floor(Math.random() * Math.max(20, result)) + 1);
      if (ticks > 9) {
        window.clearInterval(timer);
        face.textContent = String(result);
        if (labelEl) labelEl.textContent = label;
        if (detailEl) detailEl.textContent = state.ui.diceDetail || "";
        face.classList.remove("rolling");
        render();
      }
    }, 70);
  }

  function generateMapFromForm() {
    if (!isGm()) {
      toast("Hanya GM yang bisa generate map.");
      return;
    }
    if (!state.activeRoomId && !ensureGmRoomForMap(true)) {
      toast("Pilih atau buat room dulu sebelum generate map.");
      return;
    }
    const type = qs("#map-type")?.value || "town";
    const size = clamp(qs("#map-size")?.value || 28, 16, 48);
    const detail = qs("#map-detail")?.value || "balanced";
    const name = qs("#map-name")?.value.trim() || DATA.mapTypes.find((m) => m.id === type)?.name || "Map";
    const seed = qs("#map-seed")?.value.trim() || Math.random().toString(36).slice(2, 8);
    const map = createProceduralMap({ type, size, detail, name, seed });
    map.roomId = state.activeRoomId || "";
    map.visualStyleId = qs("#mapVisualStyle")?.value || "";
    map.imageAspectRatio = qs("#map-aspect")?.value || "3:4";
    map.notes = qs("#map-notes")?.value.trim() || "";
    state.maps.unshift(map);
    state.activeMapId = map.id;
    if (currentRoom()) currentRoom().activeMapId = map.id;
    saveState(true);
    toast("Map detail dibuat dan disimpan.");
    render();
  }

  function mapImagePromptFromForm() {
    const type = qs("#map-type")?.value || "town";
    const detail = qs("#map-detail")?.value || "high";
    const size = clamp(Number(qs("#map-size")?.value || 32), 16, 48);
    const styleId = qs("#mapVisualStyle")?.value || (DATA.mapVisualStyles || [])[0]?.id || "town-square";
    const style = (DATA.mapVisualStyles || []).find((item) => item.id === styleId) || (DATA.mapVisualStyles || [])[0] || {};
    const seed = qs("#map-seed")?.value.trim() || "market, bridge, fountain, central plaza";
    const notes = qs("#map-notes")?.value.trim() || "large readable buildings, clear roads, cover, doors, chokepoints, landmark points";
    const aspect = qs("#map-aspect")?.value || "3:4";
    const director = window.DND2014_MAP_AI;
    if (director && typeof director.buildPrompt === "function") {
      return director.buildPrompt({ type, detail, size, style, seed, notes, aspect });
    }
    return [
      "Generate one top-down orthographic fantasy Dungeons & Dragons 2014 battle map image",
      "readable tabletop scale, not tiny, not a city satellite view",
      "large clear rooms/buildings/roads, big landmark zones, visible paths, cover, entrances, and chokepoints",
      "gridless base art, NO grid lines, NO square marks; the app will add a precise VTT grid overlay",
      style.prompt || "hand-drawn parchment fantasy battlemap style",
      `map type: ${type}`,
      `scene focus: ${seed}`,
      `gm notes: ${notes}`,
      `aspect ratio: ${aspect}`,
      `target grid around ${size} by ${size} squares`
    ].filter(Boolean).join(". ");
  }

  async function generateMapImageFromForm() {
    if (!isGm()) {
      toast("Hanya GM yang bisa generate gambar map.");
      return;
    }
    if (!state.activeRoomId && !ensureGmRoomForMap(true)) {
      toast("Pilih atau buat room dulu sebelum generate map.");
      return;
    }
    if (!imageApiUrl) {
      toast("Fitur gambar AI belum siap.");
      return;
    }

    const name = qs("#map-name")?.value.trim() || DATA.mapTypes.find((m) => m.id === (qs("#map-type")?.value || "town"))?.name || "AI Map";
    const prompt = mapImagePromptFromForm();
    toast("Meminta gambar map ke Gemini...");

    try {
      const response = await fetch(imageApiUrl, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio: qs("#map-aspect")?.value || "3:4"
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !data.image) {
        throw new Error(data.error || data.detail || "Generate gambar map gagal.");
      }
      const type = qs("#map-type")?.value || "town";
      const size = clamp(Number(qs("#map-size")?.value || 32), 16, 48);
      const seed = qs("#map-seed")?.value.trim() || "ai";
      const detail = qs("#map-detail")?.value || "high";
      const logicLayer = createProceduralMap({ type, size, detail: detail === "cinematic" ? "balanced" : detail, name, seed });
      const map = {
        id: uid("map"),

        roomId: state.activeRoomId,
        name,
        type,
        size,
        seed,
        detail,
        image: data.image,
        tiles: logicLayer.tiles || [],
        features: logicLayer.features || [],
        npcs: [],
        notes: qs("#map-notes")?.value.trim() || "Map AI gridless dengan VTT grid presisi. Collision layer dibuat dari Map Director agar token tidak ditempatkan di area blokir.",
        imagePrompt: prompt,
        imageAspectRatio: qs("#map-aspect")?.value || "3:4",
        visualStyleId: qs("#mapVisualStyle")?.value || "",
        imageModel: data.model || "",
        collisionSource: "map-director-procedural-layer",
        createdAt: nowIso()
      };
      state.maps.unshift(map);
      state.activeMapId = map.id;
      if (currentRoom()) currentRoom().activeMapId = map.id;
      saveState(true);
      toast("Gambar map AI berhasil dibuat.");
      render();
    } catch (error) {
      console.error("DND image map error:", error);
      toast("Generate gambar AI gagal: " + (error?.message || "coba ulang."));
    }
  }

  function hashSeed(seed) {
    let h = 2166136261;
    String(seed).split("").forEach((ch) => {
      h ^= ch.charCodeAt(0);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    });
    return Math.abs(h >>> 0);
  }

  function noise(x, y, seed) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 0.017) * 43758.5453123;
    return n - Math.floor(n);
  }

  function handleCharacterPortraitFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || "")) {
      toast("Foto karakter harus PNG, JPG, JPEG, atau WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Foto karakter maksimal 2 MB agar penyimpanan tetap ringan.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.characterPortraitDraft = String(reader.result || "");
      state.characterPortraitDraftName = file.name || "character-portrait";
      render();
      toast("Preview foto karakter siap. Simpan karakter untuk memakai foto ini.");
    };
    reader.onerror = () => toast("Foto karakter gagal dibaca.");
    reader.readAsDataURL(file);
  }

  function handleMapImageFile(file) {
    if (!file) return;
    if (!isGm()) {
      toast("Hanya GM yang bisa upload map.");
      return;
    }
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type || "")) {
      toast("Map harus berupa PNG, JPG, JPEG, atau WEBP.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast("Ukuran map maksimal 6 MB agar halaman tetap ringan di mobile.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.mapUploadDraft = String(reader.result || "");
      state.mapUploadDraftName = file.name || "uploaded-map";
      render();
      toast("Preview map siap. Klik Pakai Map Ini untuk memasang ke room aktif.");
    };
    reader.onerror = () => toast("File map gagal dibaca.");
    reader.readAsDataURL(file);
  }

  function useUploadedMap() {
    if (!isGm()) return toast("Hanya GM yang bisa memakai upload map.");
    if (!state.mapUploadDraft) return toast("Pilih file map dulu.");
    if (!state.activeRoomId && !ensureGmRoomForMap(true)) {
      toast("Pilih atau buat room dulu sebelum upload map.");
      return;
    }
    const map = {
      id: uid("map"),
      name: qs("#map-name")?.value.trim() || state.mapUploadDraftName || "Uploaded Map",
      type: "uploaded",
      size: 32,
      seed: "upload",
      detail: "uploaded",
      roomId: state.activeRoomId || "",
      tiles: Array.from({ length: 32 }, () => Array.from({ length: 32 }, () => "floor")),
      features: [],
      npcs: [],
      collisionSource: "upload-open-layer",
      image: state.mapUploadDraft,
      imageName: state.mapUploadDraftName || "uploaded-map",
      notes: qs("#map-notes")?.value.trim() || "Map upload GM.",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    state.maps.unshift(map);
    state.activeMapId = map.id;
    if (currentRoom()) currentRoom().activeMapId = map.id;
    state.mapUploadDraft = "";
    state.mapUploadDraftName = "";
    saveState(true);
    render();
    toast("Map upload berhasil dipasang.");
  }

  function createProceduralMap(options) {
    const seedNumber = hashSeed(options.seed);
    const size = Number(options.size);
    const tiles = [];
    for (let y = 0; y < size; y += 1) {
      const row = [];
      for (let x = 0; x < size; x += 1) {
        row.push(tileFor(options.type, x, y, size, seedNumber));
      }
      tiles.push(row);
    }
    carveRiversAndRoads(tiles, options.type, seedNumber);
    addStructures(tiles, options.type, seedNumber, options.detail);
    const features = createMapFeatures(tiles, options.type, seedNumber, options.detail, options.seed);
    return {
      id: uid("map"),
      name: options.name,
      type: options.type,
      size,
      seed: options.seed,
      detail: options.detail,
      tiles,
      features,
      npcs: [],
      notes: buildMapBrief(options.type, features),
      createdAt: nowIso()
    };
  }

  function tileFor(type, x, y, size, seed) {
    const nx = x / size - 0.5;
    const ny = y / size - 0.5;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const n = (noise(x, y, seed) + noise(x / 2, y / 2, seed + 33) + noise(x / 5, y / 5, seed + 71)) / 3;
    if (type === "dungeon") return (x === 0 || y === 0 || x === size - 1 || y === size - 1 || n > 0.82) ? "wall" : n < 0.08 ? "stone" : "floor";
    if (type === "city") return n > 0.74 ? "house" : n < 0.16 ? "road" : n < 0.22 ? "well" : "floor";
    if (type === "kingdom") return dist < 0.13 ? "castle" : n > 0.78 ? "forest" : n < 0.18 ? "field" : n < 0.23 ? "road" : "grass";
    if (type === "cave") return (dist > 0.47 || n > 0.72) ? "stone" : n < 0.14 ? "water" : "floor";
    if (type === "coast") return x < size * 0.28 ? (n < 0.3 ? "deepWater" : "water") : x < size * 0.36 ? "sand" : n > 0.72 ? "forest" : "grass";
    if (type === "swamp") return n < 0.25 ? "water" : n < 0.55 ? "swamp" : "forest";
    if (type === "desert") return n > 0.82 ? "ruins" : n < 0.12 ? "water" : "sand";
    if (type === "mountain") return n > 0.62 ? "mountain" : n > 0.42 ? "hill" : n < 0.12 ? "snow" : "grass";
    if (type === "ruins") return n > 0.72 ? "ruins" : n < 0.18 ? "road" : n < 0.28 ? "stone" : "grass";
    if (type === "forest") return n > 0.68 ? "deepForest" : n > 0.33 ? "forest" : "grass";
    return n < 0.12 ? "water" : n > 0.68 ? "forest" : n > 0.55 ? "hill" : "grass";
  }


  function carveRiversAndRoads(tiles, type, seed) {
    const size = tiles.length;
    if (!["dungeon", "cave", "city"].includes(type)) {
      let riverX = Math.floor(size * (0.28 + noise(1, 1, seed) * 0.44));
      for (let y = 0; y < size; y += 1) {
        riverX += noise(y, riverX, seed) > 0.55 ? 1 : -1;
        riverX = clamp(riverX, 1, size - 2);
        tiles[y][riverX] = "water";
        if (noise(y, riverX, seed + 14) > 0.62) tiles[y][clamp(riverX + 1, 0, size - 1)] = "water";
      }
    }
    if (type === "city") {
      const mainX = Math.floor(size * (0.38 + noise(11, 5, seed) * 0.24));
      const mainY = Math.floor(size * (0.38 + noise(5, 11, seed) * 0.24));
      for (let i = 0; i < size; i += 1) {
        tiles[mainY][i] = "road";
        tiles[i][mainX] = "road";
        if (i % 6 === 0) {
          for (let j = 2; j < size - 2; j += 1) {
            if (noise(i, j, seed) > 0.42) tiles[j][i] = "road";
            if (noise(j, i, seed + 9) > 0.46) tiles[i][j] = "road";
          }
        }
      }
    }
    if (!["dungeon", "cave", "coast", "swamp"].includes(type)) {
      const roadY = Math.floor(size * (0.36 + noise(3, 2, seed) * 0.28));
      for (let x = 0; x < size; x += 1) {
        const y = clamp(roadY + Math.round(Math.sin(x / 3 + seed) * 2), 1, size - 2);
        tiles[y][x] = tiles[y][x] === "water" ? "bridge" : "road";
      }
    }
  }

  function addStructures(tiles, type, seed, detail) {
    const size = tiles.length;
    const amount = detail === "cinematic" ? 34 : detail === "dense" ? 24 : detail === "open" ? 8 : 15;
    for (let i = 0; i < amount; i += 1) {
      const x = clamp(Math.floor(noise(i, 7, seed) * size), 2, size - 3);
      const y = clamp(Math.floor(noise(8, i, seed) * size), 2, size - 3);
      const tile = type === "dungeon" || type === "cave" ? "wall" : type === "city" || type === "kingdom" ? "house" : "ruins";
      if (tiles[y][x] !== "water" && tiles[y][x] !== "deepWater") tiles[y][x] = tile;
      if (detail === "dense" && tiles[y + 1] && tiles[y + 1][x] !== "water") tiles[y + 1][x] = tile;
    }
  }

  function createMapFeatures(tiles, type, seed, detail, seedText) {
    const pool = featurePoolForMap(type, seedText);
    const features = [];
    const amount = detail === "cinematic" ? 28 : detail === "dense" ? 22 : detail === "open" ? 10 : 16;
    const add = (def, index) => {
      const spot = findFeatureSpot(tiles, seed, index, def.tiles || []);
      if (!spot) return;
      if (features.some((f) => Math.abs(f.x - spot.x) <= 1 && Math.abs(f.y - spot.y) <= 1)) return;
      features.push({ ...def, id: uid("feature"), x: spot.x, y: spot.y });
    };
    pool.anchors.forEach((def, index) => add(def, index + 3));
    for (let i = 0; i < amount; i += 1) {
      const def = pool.fillers[Math.floor(noise(i, 17, seed) * pool.fillers.length)] || pool.fillers[0];
      add(def, i + 41);
    }
    return features;
  }

  function featurePoolForMap(type, seedText) {
    const request = String(seedText || "").toLowerCase();
    const wantedDanger = request.includes("danger") || request.includes("bahaya") || request.includes("gelap");
    const commonNature = [
      { kind: "tree", label: "Pohon tua", symbol: "T", tiles: ["grass", "forest", "deepForest"] },
      { kind: "boulder", label: "Batu cover", symbol: "B", tiles: ["grass", "hill", "mountain", "forest"] },
      { kind: "camp", label: "Perkemahan", symbol: "C", tiles: ["grass", "forest", "road"] }
    ];
    if (type === "forest") {
      return {
        anchors: [
          { kind: "ancientTree", label: "Pohon jantung hutan", symbol: "AT", tiles: ["deepForest", "forest"] },
          { kind: "shrine", label: "Shrine lumut", symbol: "S", tiles: ["forest", "grass"] },
          { kind: "boulder", label: "Batu rune", symbol: "R", tiles: ["forest", "hill"] },
          { kind: wantedDanger ? "trap" : "camp", label: wantedDanger ? "Jebakan akar" : "Kamp pemburu", symbol: wantedDanger ? "!" : "C", tiles: ["forest", "grass"] }
        ],
        fillers: commonNature
      };
    }
    if (type === "city") {
      return {
        anchors: [
          { kind: "inn", label: "Penginapan", symbol: "IN", tiles: ["floor", "house", "road"] },
          { kind: "blacksmith", label: "Pandai besi", symbol: "SM", tiles: ["floor", "house", "road"] },
          { kind: "market", label: "Pasar", symbol: "MK", tiles: ["floor", "road"] },
          { kind: "temple", label: "Kuil", symbol: "TP", tiles: ["floor", "house"] },
          { kind: "stable", label: "Kandang kuda", symbol: "ST", tiles: ["floor", "road"] },
          { kind: "well", label: "Sumur kota", symbol: "W", tiles: ["floor", "road", "well"] }
        ],
        fillers: [
          { kind: "house", label: "Rumah warga", symbol: "H", tiles: ["floor", "house"] },
          { kind: "tower", label: "Menara jaga", symbol: "TW", tiles: ["floor", "house"] },
          { kind: "gate", label: "Gerbang", symbol: "G", tiles: ["road", "floor"] }
        ]
      };
    }
    if (type === "kingdom") {
      return {
        anchors: [
          { kind: "castle", label: "Benteng kerajaan", symbol: "K", tiles: ["castle", "grass"] },
          { kind: "market", label: "Alun-alun pasar", symbol: "MK", tiles: ["field", "road", "grass"] },
          { kind: "temple", label: "Katedral kecil", symbol: "TP", tiles: ["field", "grass"] },
          { kind: "blacksmith", label: "Forge barak", symbol: "SM", tiles: ["road", "field"] }
        ],
        fillers: [
          { kind: "house", label: "Desa", symbol: "V", tiles: ["field", "grass", "road"] },
          { kind: "tree", label: "Kebun", symbol: "T", tiles: ["field", "grass"] },
          { kind: "tower", label: "Pos jaga", symbol: "TW", tiles: ["road", "grass"] }
        ]
      };
    }
    if (type === "dungeon" || type === "cave") {
      return {
        anchors: [
          { kind: "chest", label: "Peti loot", symbol: "$", tiles: ["floor", "stone"] },
          { kind: "trap", label: "Trap tersembunyi", symbol: "!", tiles: ["floor", "stone"] },
          { kind: "altar", label: "Altar gelap", symbol: "A", tiles: ["floor", "stone"] },
          { kind: "boulder", label: "Reruntuhan cover", symbol: "B", tiles: ["floor", "stone"] }
        ],
        fillers: [
          { kind: "boulder", label: "Pilar/batu", symbol: "B", tiles: ["floor", "stone"] },
          { kind: "trap", label: "Bahaya lantai", symbol: "!", tiles: ["floor"] }
        ]
      };
    }
    if (type === "desert") {
      return {
        anchors: [
          { kind: "ruins", label: "Reruntuhan pasir", symbol: "R", tiles: ["sand", "ruins"] },
          { kind: "well", label: "Oasis/sumur", symbol: "W", tiles: ["sand", "water"] },
          { kind: "camp", label: "Kemah karavan", symbol: "C", tiles: ["sand", "road"] }
        ],
        fillers: [
          { kind: "boulder", label: "Batu pasir", symbol: "B", tiles: ["sand", "ruins"] },
          { kind: "shrine", label: "Obelisk", symbol: "O", tiles: ["sand", "ruins"] }
        ]
      };
    }
    return {
      anchors: [
        { kind: "camp", label: "Kamp petualang", symbol: "C", tiles: ["grass", "road", "field"] },
        { kind: "shrine", label: "Shrine tua", symbol: "S", tiles: ["grass", "ruins", "forest"] },
        { kind: "boulder", label: "Batu besar cover", symbol: "B", tiles: ["grass", "hill", "stone"] }
      ],
      fillers: commonNature
    };
  }

  function findFeatureSpot(tiles, seed, index, preferredTiles) {
    const size = tiles.length;
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const x = clamp(Math.floor(noise(index, attempt + 13, seed) * size), 1, size - 2);
      const y = clamp(Math.floor(noise(attempt + 29, index, seed) * size), 1, size - 2);
      const tile = tiles[y][x];
      if (["water", "deepWater", "wall", "lava"].includes(tile)) continue;
      if (preferredTiles.length && !preferredTiles.includes(tile) && attempt < 50) continue;
      return { x, y };
    }
    return null;
  }

  function buildMapBrief(type, features) {
    const featureText = features.slice(0, 9).map((feature) => `${feature.label} (${feature.x},${feature.y})`).join("; ");
    const focus = type === "city"
      ? "Kota punya jalan utama, penginapan, pandai besi, pasar, kuil, sumur, dan titik jaga."
      : type === "forest"
        ? "Hutan punya pohon tua, batu cover, shrine, kamp, jalur, dan sungai untuk cover/terrain."
        : type === "dungeon" || type === "cave"
          ? "Area bawah tanah punya lorong, pilar/batu, trap, peti, altar, dan titik bahaya."
          : "Map punya landmark fantasi, jalur, cover, hazard, dan titik interaksi.";
    return `${focus} Landmark: ${featureText || "belum ada"}.`;
  }

  function deleteActiveMap() {
    if (!isGm()) return toast("Hanya GM yang bisa hapus map.");
    const map = activeMap();
    if (!map) return;
    if (!confirm("Hapus map " + map.name + "?")) return;
    state.maps = state.maps.filter((m) => m.id !== map.id);
    state.activeMapId = roomMaps(state.activeRoomId)[0]?.id || "";
    if (currentRoom()) currentRoom().activeMapId = state.activeMapId;
    saveState(true);
    render();
  }

  function saveMapNote() {
    const map = activeMap();
    if (!map) return;
    map.notes = qs("#map-notes")?.value.trim() || "";
    saveState(true);
  }

  function addSessionLog() {
    const user = currentUser();
    if (!user) {
      openAuth("login");
      toast("Login dulu untuk mengisi dialog online.");
      return;
    }
    const mode = state.campaign.playMode || "offline";
    const voiceOn = !!state.campaign.voiceExternal;
    const text = qs("#session-dialogue-text")?.value.trim() || "";
    const speaker = qs("#session-speaker")?.value.trim() || (isGm() ? "GM / NPC" : activeCharacter()?.name || user.name);
    if (!isGm() && !canTakeGameAction("dialog")) return;
    if (mode === "offline") {
      toast("Mode offline tidak wajib input dialog. Ubah ke online kalau ingin log narasi.");
      return;
    }
    if (!voiceOn && !text) {
      toast("Mode online text wajib isi dialog/narasi supaya alur bisa dipantau AI.");
      return;
    }
    state.sessionLog.unshift({
      id: uid("dialog"),
      mode,
      voiceExternal: voiceOn,
      platform: state.campaign.voicePlatform || "",
      speaker,
      role: isGm() ? "gm" : "player",
      text: text || `[Voice external aktif via ${state.campaign.voicePlatform || "platform luar"}]`,
      characterId: !isGm() ? activeCharacter()?.id || "" : "",
      createdAt: nowIso()
    });
    state.sessionLog = state.sessionLog.slice(0, 120);
    saveState(true);
    render();
  }

  function addNpcFromForm() {
    if (!isGm()) return toast("Hanya GM yang bisa menambah NPC.");
    const template = DATA.npcTemplates.find((n) => n.name === qs("#npc-template")?.value) || DATA.npcTemplates[0];
    const npc = {
      id: uid("npc"),
      roomId: state.activeRoomId,
      name: qs("#npc-name")?.value.trim() || template.name,
      type: qs("#npc-type")?.value.trim() || template.type,
      cr: qs("#npc-cr")?.value.trim() || template.cr,
      hp: clamp(qs("#npc-hp")?.value || template.hp, 1, 999),
      ac: clamp(qs("#npc-ac")?.value || template.ac, 1, 40),
      attitude: qs("#npc-attitude")?.value.trim() || template.attitude,
      notes: qs("#npc-notes")?.value.trim() || template.notes,
      createdAt: nowIso()
    };
    state.npcs.push(npc);
    state.ui.selectedNpcId = npc.id;
    saveState(true);
    render();
  }

  function removeNpc(id) {
    if (!isGm()) return;
    state.npcs = state.npcs.filter((n) => n.id !== id);
    state.maps.forEach((m) => {
      m.npcs = (m.npcs || []).filter((p) => p.npcId !== id);
    });
    if (state.ui.selectedNpcId === id) state.ui.selectedNpcId = "";
    saveState(true);
    render();
  }

  function placeNpcOnMap(tileX, tileY) {
    if (!isGm()) return;
    const map = activeMap();
    const npc = state.npcs.find((n) => n.id === state.ui.selectedNpcId);
    if (!map || !npc) {
      toast("Pilih NPC dulu sebelum klik map.");
      return;
    }
    if (mapCellBlocked(map, Number(tileX), Number(tileY))) {
      toast("Tile ini tertutup collision layer (tembok/batu/air/pohon besar). Pilih tile kosong agar token tidak menembus objek.");
      return;
    }
    map.npcs = map.npcs || [];
    map.npcs.push({ id: uid("pos"), npcId: npc.id, x: tileX, y: tileY });
    saveState(true);
    render();
  }



  function placeOwnCharacterOnMap(tileX, tileY) {
    if (isGm()) return false;
    if (!canTakeGameAction("move token")) return false;
    const map = activeMap();
    const character = activeCharacter();
    if (!map || !character) {
      toast("Pilih karakter aktif dulu sebelum menggerakkan token.");
      return false;
    }
    if (!characterBelongsToUser(character)) {
      toast("Player hanya boleh menggerakkan karakter miliknya sendiri.");
      return false;
    }
    if (mapCellBlocked(map, Number(tileX), Number(tileY))) {
      toast("Tile ini terhalang collision layer. Pilih area kosong.");
      return false;
    }
    map.characters = Array.isArray(map.characters) ? map.characters : [];
    const existing = map.characters.find((token) => token.characterId === character.id);
    if (existing) {
      existing.x = Number(tileX);
      existing.y = Number(tileY);
      existing.updatedAt = nowIso();
    } else {
      map.characters.push({ id: uid("charpos"), characterId: character.id, x: Number(tileX), y: Number(tileY), updatedAt: nowIso() });
    }
    saveState(true);
    render();
    toast("Token karakter dipindahkan.");
    return true;
  }

  function gmAdjustCharacter(characterId) {
    if (!isGm()) return toast("Panel ini hanya untuk GM.");
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return;
    const hp = Number(qs("#gm-hp-" + characterId)?.value || 0);
    const xp = Number(qs("#gm-xp-" + characterId)?.value || 0);
    const condition = qs("#gm-condition-" + characterId)?.value.trim();
    character.hpCurrent = clamp((character.hpCurrent || character.hpMax) + hp, 0, character.hpMax);
    character.xp = Math.max(0, Number(character.xp || 0) + xp);
    if (condition) {
      character.conditions = Array.from(new Set([...(character.conditions || []), condition]));
    }
    character.updatedAt = nowIso();
    state.rollLog.unshift({ id: uid("gm"), label: "GM Adjust", total: character.hpCurrent, detail: `${character.name}: HP ${signed(hp)}, XP ${signed(xp)}`, user: currentUser().name, createdAt: nowIso() });
    saveState(true);
    render();
  }

  function gmApproveLevel(characterId) {
    if (!isGm()) return;
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return;
    character.approvedLevel = character.level;
    character.requestedLevel = "";
    character.hpMax = computeMaxHp(classById(character.className), character.abilities, character.level);
    character.hpCurrent = clamp(character.hpCurrent, 1, character.hpMax);
    saveState(true);
    render();
  }

  function grantItem(characterId) {
    if (!isGm()) return toast("Hanya GM yang bisa grant item.");
    const character = state.characters.find((c) => c.id === characterId);
    const itemName = qs("#grant-item-" + characterId)?.value;
    if (!character || !itemName) return;
    character.inventory = character.inventory || [];
    character.inventory.push(itemName);
    character.ac = computeAc(character.inventory, character.abilities);
    saveState(true);
    render();
  }

  function addCustomItem() {
    if (!isGm()) return toast("Hanya GM yang bisa membuat item.");
    const item = {
      name: qs("#custom-item-name")?.value.trim(),
      type: qs("#custom-item-type")?.value.trim() || "Custom",
      rarity: qs("#custom-item-rarity")?.value.trim() || "Common",
      weight: Number(qs("#custom-item-weight")?.value || 0),
      notes: qs("#custom-item-notes")?.value.trim() || "Custom item GM."
    };
    if (!item.name) return toast("Nama item wajib diisi.");
    state.customItems.push(item);
    saveState(true);
    render();
  }

  function addAiNote() {
    const note = qs("#ai-note")?.value.trim();
    if (!note) return;
    state.aiNotes.unshift({ id: uid("note"), text: note, createdAt: nowIso(), user: currentUser()?.name || "Guest" });
    state.aiNotes = state.aiNotes.slice(0, 40);
    saveState(true);
    render();
  }

  function answerAiQuestion() {
    const question = (qs("#ai-question")?.value || "").trim();
    if (!question) return;
    state.ui.aiAnswer = localAiAnswer(question);
    saveState();
    render();
  }

  function runAiAudit() {
    state.ui.aiAnswer = auditRules().map((w) => `${w.level.toUpperCase()}: ${w.text}`).join("\n\n") || "Tidak ada pelanggaran besar yang terdeteksi. Tetap gunakan keputusan GM untuk konteks cerita.";
    saveState();
    render();
  }

  function createBugReport() {
    const report = {
      createdAt: nowIso(),
      browser: navigator.userAgent,
      tab: state.ui.tab,
      user: currentUser(),
      counts: {
        accounts: state.accounts.length,
        characters: state.characters.length,
        maps: state.maps.length,
        npcs: state.npcs.length,
        rolls: state.rollLog.length,
        sessionLog: state.sessionLog.length
      },
      warnings: auditRules()
    };
    state.ui.aiAnswer = "Catatan bug siap dikirim ke pengembang:\n\n" + JSON.stringify(report, null, 2);
    saveState();
    render();
  }

  function localAiAnswer(question) {
    const q = question.toLowerCase();
    const notes = state.aiNotes.map((n) => "- " + n.text).join("\n");
    if (q.includes("d100") || q.includes("percentile") || q.includes("persen")) {
      return "d100 di DnD 2014 bukan satu dadu angka 1-100 biasa. Pakai dua d10: satu die puluhan bertanda 00, 10, 20 sampai 90, dan satu die satuan 0-9. 00 + 0 berarti 100. Dice tab sekarang menampilkan detail tens die + ones die di roll log.";
    }
    if (q.includes("starting") || q.includes("gold") || q.includes("item awal") || q.includes("barang awal") || q.includes("awal")) {
      return "Flow awal karakter mengikuti setting GM di Lobby: Standard Items, Starting Gold, atau GM Custom Choice. Player wajib memilih paket yang tersedia sebelum sheet dianggap lengkap; backend SQL nanti harus menyimpan pilihan itu dan hanya GM/backend yang boleh approve perubahan gold atau item.";
    }
    if (q.includes("level") || q.includes("proficiency")) {
      return "Di DnD 2014, proficiency bonus naik bertahap berdasarkan level: +2 level 1-4, +3 level 5-8, +4 level 9-12, +5 level 13-16, +6 level 17-20. Di meja ini, level player boleh diedit di sheet, tetapi kenaikan yang mencurigakan akan ditandai untuk GM.";
    }
    if (q.includes("skill")) {
      return "Skill memakai ability modifier + proficiency bonus jika karakter proficient. Rule checker akan menegur jika player memilih skill proficiency melebihi batas class + background.";
    }
    if (q.includes("room") || q.includes("lobby") || q.includes("password")) {
      return "Lobby berbasis room: hanya GM yang membuat room, player masuk ke room yang tersedia, password bersifat opsional, dan room yang tidak aktif selama 30 hari akan dibersihkan.";
    }
    if (q.includes("race") || q.includes("subrace") || q.includes("ras")) {
      return "Race menentukan bonus ability, size, speed, bahasa, dan trait biologis. Subrace memberi bonus tambahan dan trait khusus. Pilih race dulu agar ability score, language, trait, dan guide kanan bisa menyesuaikan.";
    }
    if (q.includes("language") || q.includes("bahasa")) {
      return "Bahasa dipakai untuk roleplay, negosiasi, membaca petunjuk, dan memahami NPC atau dokumen. Penjelasan bahasa sengaja muncul saat dipilih agar panel kanan tidak menjadi list panjang.";
    }
    if (q.includes("alignment") || q.includes("keselarasan")) {
      return "Alignment adalah arah moral dan cara karakter memandang aturan: lawful/chaotic menunjukkan sikap pada struktur, good/evil menunjukkan prioritas etika, dan neutral berada di tengah sesuai konteks.";
    }
    if (q.includes("npc")) {
      return "NPC sebaiknya punya fungsi cerita: pemberi quest, saksi, penjaga, pedagang, rival, atau penyimpan rahasia. Catat motivasi, informasi yang diketahui, dan hubungan NPC dengan room campaign.";
    }
    if (q.includes("map") || q.includes("gambar")) {
      return "Map bisa dibuat dari grid, upload gambar GM, atau gambar AI. Pastikan layout punya grid jelas, area masuk, penghalang, titik interaksi, dan catatan GM.";
    }
    if (q.includes("combat") || q.includes("serang") || q.includes("attack") || q.includes("inisiatif") || q.includes("initiative")) {
      return "Combat SRD 5.1: round sekitar 6 detik, giliran berisi movement, action, bonus action jika tersedia, reaction jika trigger muncul, dan interaksi ringan. Attack roll adalah d20 + modifier + proficiency jika proficient; kena jika total mencapai AC target.";
    }
    if (q.includes("condition") || q.includes("kondisi") || q.includes("poison") || q.includes("prone")) {
      return "Condition seperti blinded, charmed, frightened, grappled, prone, restrained, stunned, unconscious, dan poisoned sudah ada di compendium. GM perlu mencatat sumber, durasi, dan efeknya karena condition bisa mengubah movement, action, attack, save, dan check.";
    }
    if (q.includes("rest") || q.includes("istirahat") || q.includes("short rest") || q.includes("long rest")) {
      return "Short rest biasanya memakai hit dice untuk memulihkan HP, sedangkan long rest memulihkan lebih besar sesuai aturan campaign. Rule helper akan menegur kalau HP current melewati HP max tanpa fitur khusus.";
    }
    if (q.includes("map") || q.includes("kota") || q.includes("kerajaan")) {
      return "GM bisa memilih type map dan detail Cinematic. Forest sekarang menandai pohon tua, shrine, batu cover, kamp, sungai, dan jalan. City menandai penginapan, pandai besi, pasar, kuil, stable, gerbang, sumur, dan menara. Gunakan notes map untuk tujuan encounter dan klik map untuk taruh NPC.";
    }
    if (q.includes("online") || q.includes("offline") || q.includes("voice") || q.includes("dialog") || q.includes("narasi")) {
      return "Mode offline tidak wajib input dialog. Mode online tanpa Discord/telepon wajib memakai dialog log: GM menulis dialog NPC/narasi, player menulis dialog karakter. Jika voice external aktif, log text menjadi opsional karena percakapan terjadi di luar app.";
    }
    if (q.includes("npc") || q.includes("orc")) {
      return "NPC bisa dibuat bebas oleh GM, lalu ditempatkan dengan memilih NPC dan klik tile map. Untuk orc naik level atau dapat item, catat di NPC notes atau ubah HP/AC/CR sesuai keputusan GM.";
    }
    if (q.includes("srd") || q.includes("source") || q.includes("lisensi") || q.includes("aturan lengkap")) {
      return "Baseline legal app ini adalah SRD 5.1, yang sesuai kerangka DnD 2014/5e dan tersedia dengan lisensi Creative Commons BY 4.0. Konten compendium ditulis sebagai data terstruktur/paraphrase, bukan salinan panjang PHB.";
    }
    if (q.includes("bug") || q.includes("fix")) {
      return "Saya bisa membuat laporan bug dari state lokal, route aktif, dan audit rules. Klik 'Buat bug report' agar hasilnya bisa dipakai saat menyambungkan backend atau memperbaiki kode.";
    }
    return "Rule helper lokal siap membantu. Saya menemukan konteks campaign ini:\n" + (notes || "- Belum ada catatan AI.") + "\n\nPertanyaanmu: " + question + "\n\nSaran singkat: pastikan GM menyetujui perubahan stat, level, item, dan posisi NPC agar player tidak bisa curang saat backend SQL aktif.";
  }

  function auditRules() {
    const warnings = [];
    const user = currentUser();
    if (!user) warnings.push({ level: "warn", text: "Belum login website. Save MySQL membutuhkan akun agar ownership karakter jelas." });
    if (state.campaign.playMode === "online" && !state.campaign.voiceExternal) {
      const gmLog = state.sessionLog.some((entry) => entry.role === "gm");
      const playerLog = state.sessionLog.some((entry) => entry.role === "player");
      if (!gmLog) warnings.push({ level: "warn", text: "Mode online text aktif: GM perlu mencatat dialog NPC atau narasi." });
      if (!playerLog && state.characters.length) warnings.push({ level: "warn", text: "Mode online text aktif: player perlu mencatat dialog karakter agar alur bisa dipantau." });
    }
    state.characters.forEach((c) => {
      const klass = classById(c.className);
      const skillInfo = skillSelectionBreakdown(c.skills || [], c);
      if (c.level < 1 || c.level > 20) warnings.push({ level: "bad", text: `${c.name}: level harus 1 sampai 20.` });
      if (!c.startingChoice) warnings.push({ level: "bad", text: `${c.name}: belum memilih starting package dari GM.` });
      if (!appearanceIsComplete(c.appearance)) warnings.push({ level: "warn", text: `${c.name}: appearance belum lengkap. Player harus isi rambut, mata, kulit, dan style sebelum masuk Map/Dice.` });
      const validSkillSet = new Set(skillInfo.all);
      const invalidSkills = (c.skills || []).filter((skillId) => !validSkillSet.has(skillId));
      if (invalidSkills.length) warnings.push({ level: "bad", text: `${c.name}: ada skill di luar pilihan class/ras (${invalidSkills.join(", ")}).` });
      if (skillInfo.classSelected.length > skillInfo.classLimit) warnings.push({ level: "bad", text: `${c.name}: skill proficiency class ${skillInfo.classSelected.length}, melebihi batas ${skillInfo.classLimit}.` });
      if (skillInfo.raceSelected.length > skillInfo.raceLimit) warnings.push({ level: "bad", text: `${c.name}: bonus skill ras ${skillInfo.raceSelected.length}, melebihi batas ${skillInfo.raceLimit}.` });
      const totalAbility = DATA.abilities.reduce((sum, a) => sum + Number(c.abilities[a.id] || 0), 0);
      if (totalAbility > 86 && !isGm()) warnings.push({ level: "warn", text: `${c.name}: total ability score tinggi (${totalAbility}). GM perlu validasi metode roll/point buy.` });
      if (c.requestedLevel) warnings.push({ level: "warn", text: `${c.name}: player meminta level ${c.requestedLevel}. GM perlu approve sebelum dianggap sah.` });
      if (c.hpCurrent > c.hpMax) warnings.push({ level: "bad", text: `${c.name}: HP current lebih besar dari HP max.` });
      if (Number(c.gold || 0) < 0) warnings.push({ level: "bad", text: `${c.name}: gold tidak boleh negatif.` });
      if (Number(c.gold || 0) > 5000 && !isGm()) warnings.push({ level: "warn", text: `${c.name}: gold sangat tinggi. GM perlu validasi sumber gold.` });
    });
    const partyLevel = Number(state.campaign.partyLevel || 1);
    state.npcs.forEach((npc) => {
      const crNumber = parseCr(npc.cr);
      if (crNumber >= partyLevel + 4) warnings.push({ level: "warn", text: `${npc.name}: CR ${npc.cr} jauh di atas party level ${partyLevel}. Risiko encounter terlalu berat.` });
    });
    return warnings;
  }

  function parseCr(cr) {
    if (String(cr).includes("/")) {
      const [a, b] = String(cr).split("/").map(Number);
      return b ? a / b : 0;
    }
    return Number(cr) || 0;
  }

  function render() {
    if (bootingFromSql) {
        app.innerHTML = `
            <div class="dnd-panel glass-card p-6" style="margin: 40px auto; max-width: 800px; text-align: center;">
                <h2 style="margin-bottom: 20px;">Memuat data karakter...</h2>
                <div class="loading-skeleton" style="height: 120px; border-radius: 8px; margin-bottom: 16px;"></div>
                <div class="loading-skeleton" style="height: 80px; border-radius: 8px; margin-bottom: 16px;"></div>
                <div class="loading-skeleton" style="height: 200px; border-radius: 8px;"></div>
            </div>
        `;
        return;
    }

    enforcePlayerStartLocation();
    const user = currentUser();
    const char = activeCharacter();
    const insideGame = !!(state.ui.lobbyInsideRoom && currentRoom());
    const tabs = [
      ["lobby", "Lobby"],
      ["character", "Character"],
      ["map", "Map"],
      ["dice", "Dice"],
      ["gm", "GM Screen"],
      ...(userIsOwner(user) ? [["database", "Database"]] : []),
      ["compendium", "Compendium"],
      ["ai", "Rule AI"]
    ];
    app.innerHTML = `
      <section class="dnd-hero">
        <p class="eyebrow">DnD 2014 campaign table</p>
        <h1>Fantasy Table untuk GM dan Player</h1>
        <p>Character builder, sheet editable, percentile d100/d20 dice animation, cinematic map landmarks, NPC placement, online/offline dialogue flow, GM screen, SRD 5.1 compendium, autosave, PDF export, dan rule helper lokal.</p>
      </section>

      <section class="dnd-app-grid">
        <div class="dnd-appbar ${insideGame ? "is-in-game" : ""}">
          <div>
            <strong>${esc(insideGame ? (currentRoom()?.name || state.campaign.name) : state.campaign.name)}</strong>
            <small>${user ? esc(user.name) + " sebagai " + esc(displayGameRole(user)) : "Belum login"} | Last save: ${state.campaign.lastSaved ? new Date(state.campaign.lastSaved).toLocaleString("id-ID") : "baru"}</small>
          </div>
          <div class="dnd-actions">
            ${insideGame ? `<button class="dnd-btn danger" data-action="room-back-lobby">Keluar Game</button>` : ""}
            ${user ? `<button class="dnd-btn" data-action="website-logout">Logout website</button>` : `<button class="dnd-btn primary" data-action="website-login">Login Website</button><button class="dnd-btn" data-action="website-register">Daftar</button>`}
            ${!user ? `` : `<span class="dnd-pill ${displayGameRole(user) === "GM" ? "good" : "warn"}">${esc(displayGameRole(user))} aktif</span>`}
            ${!insideGame && userIsOwner(user) ? `<button class="dnd-btn owner-db-btn" data-action="tab" data-tab="database">Database</button>` : ""}
            ${!insideGame ? `<button class="dnd-btn" data-action="export-save">Export save</button><button class="dnd-btn" data-action="import-save">Import</button>` : ""}
          </div>
        </div>

        ${renderAnnouncementBar(user)}

        ${insideGame ? `<div class="in-game-nav-hidden-note"><span>Mode permainan aktif</span><small>Menu utama disembunyikan. Gunakan Keluar Game untuk kembali ke tampilan utama.</small></div>` : `<nav class="dnd-tabs" aria-label="DnD table tabs">
          ${tabs.map(([id, label]) => {
            const disabled = user && !isGm() && (id === "map" || id === "dice") && !characterIsReady(char);
            return `<button class="dnd-tab ${state.ui.tab === id ? "is-active" : ""}" ${disabled ? "disabled" : ""} data-action="tab" data-tab="${id}">${label}</button>`;
          }).join("")}
        </nav>`}

        <section class="dnd-panel">
          ${renderTab()}
        </section>
      </section>
      ${state.ui.showAuth ? renderAuthModal() : ""}
      ${state.ui.showImport ? renderImportModal() : ""}
      ${state.ui.showReward ? renderRewardModal() : ""}
      ${state.ui.showPdfChoice ? renderPdfChoiceModal() : ""}
    `;
    afterRender();
  }

  function renderAnnouncementBar(user) {
    const text = String(state.campaign.announcementText || "Selamat bermain. Owner bisa menulis info bug, jadwal, atau maintenance di sini.").trim();
    return `<div class="dnd-announcement-strip" aria-label="Announcement owner">
      <span class="announcement-label">Announcement</span>
      <div class="announcement-viewport"><div class="announcement-track"><span>${esc(text)}</span><span>${esc(text)}</span></div></div>
      ${userIsOwner(user) ? `<button class="dnd-btn mini" data-action="edit-announcement">Edit Owner</button>` : ""}
    </div>`;
  }

  function renderTab() {
    const tab = state.ui.tab || "lobby";
    if (tab === "character") return renderCharacterTab();
    if (tab === "map") return renderMapTab();
    if (tab === "dice") return renderDiceTab();
    if (tab === "gm") return renderGmTab();
    if (tab === "database") return renderOwnerDatabaseTab();
    if (tab === "compendium") return renderCompendiumTab();
    if (tab === "ai") return renderAiTab();
    return renderLobbyTab();
  }

  function renderOwnerDatabaseTab() {
    const user = currentUser();
    if (!userIsOwner(user)) {
      return `<div class="map-empty"><div><h2>Database Owner</h2><p>Panel ini hanya bisa dibuka Owner.</p></div></div>`;
    }
    const accounts = (state.accounts || []).filter((account) => account?.source === "website");
    const characters = state.characters || [];
    const accountCards = accounts.length ? accounts.map((account) => {
      const owned = characters.filter((character) => character.ownerId === account.id || String(character.websiteUserId || "") === String(account.websiteUserId || ""));
      const activeGm = userHasGmPower(account) && !userIsOwner(account);
      const selectedRole = userIsOwner(account) ? "owner" : (activeGm ? "gm" : "player");
      return `<article class="owner-db-row" data-owner-account-row="${esc(account.id)}">
        <div class="owner-db-main">
          <strong>${esc(account.name || "Akun")}</strong>
          <small>${esc(account.email || "-")} • ID website: ${esc(account.websiteUserId || "-")} • Karakter: ${esc(owned.length)}</small>
          <span class="dnd-pill ${activeGm || userIsOwner(account) ? "good" : ""}">${esc(userIsOwner(account) ? "Owner" : selectedRole.toUpperCase())}${selectedRole === "gm" ? " • sampai " + esc(gmTimerLabel(account.gmExpiresAt || "")) : ""}</span>
        </div>
        <div class="owner-db-controls">
          <label>Role</label>
          <select data-owner-role ${userIsOwner(account) ? "disabled" : ""}>
            <option value="player" ${selectedRole === "player" ? "selected" : ""}>Player</option>
            <option value="gm" ${selectedRole === "gm" ? "selected" : ""}>GM</option>
          </select>
          <label>Timer GM / hari</label>
          <input type="number" min="0" max="3650" value="0" data-owner-gm-days placeholder="0 = tanpa timer" ${userIsOwner(account) ? "disabled" : ""}>
          <button class="dnd-btn primary" data-action="owner-db-apply-role" data-account-id="${esc(account.id)}" ${userIsOwner(account) ? "disabled" : ""}>Simpan Role</button>
        </div>
      </article>`;
    }).join("") : `<p class="dnd-muted">Belum ada akun website tersinkron di campaign ini.</p>`;

    const characterCards = characters.length ? characters.map((character) => {
      const owner = accounts.find((account) => account.id === character.ownerId || String(account.websiteUserId || "") === String(character.websiteUserId || ""));
      return `<article class="owner-db-character">
        <div>
          <strong>${esc(character.name || "Tanpa nama")}</strong>
          <small>${esc(effectiveRaceName(character))} • ${esc(classById(character.className).name)} Lv ${esc(character.level || 1)} • Owner: ${esc(owner?.name || character.ownerId || "Unknown")}</small>
          <span>HP ${esc(character.hpCurrent || 0)}/${esc(character.hpMax || 0)} • AC ${esc(character.ac || 10)} • Skill: ${esc((character.skills || []).length)}</span>
        </div>
        <div class="owner-db-character-actions">
          <button class="dnd-btn primary" data-action="owner-db-edit-character" data-character-id="${esc(character.id)}">Edit Detail</button>
          <button class="dnd-btn danger" data-action="owner-db-delete-character" data-character-id="${esc(character.id)}">Hapus</button>
        </div>
      </article>`;
    }).join("") : `<p class="dnd-muted">Belum ada karakter tersimpan.</p>`;

    return `<div class="dnd-section-title owner-db-title">
      <div><h2>Database Owner</h2><p>Lihat akun player, karakter milik mereka, edit/hapus karakter, dan ubah role Player ↔ GM dengan timer opsional.</p></div>
      <div class="dnd-actions"><button class="dnd-btn" data-action="owner-db-refresh">Sync Database</button></div>
    </div>
    <div class="owner-db-grid">
      <section class="dnd-card owner-db-card"><h3>Akun Player / GM</h3>${accountCards}</section>
      <section class="dnd-card owner-db-card"><h3>Karakter Campaign</h3>${characterCards}</section>
    </div>`;
  }

  function roomScopedEntries(listName) {
    const roomId = state.activeRoomId || "";
    const list = Array.isArray(state[listName]) ? state[listName] : [];
    return list.filter((entry) => !entry.roomId || entry.roomId === roomId);
  }

  function characterSummaryCards(characters) {
    if (!characters.length) return `<p class="dnd-muted">Belum ada karakter di room ini.</p>`;
    return characters.slice(0, 6).map((char) => {
      const skills = Array.isArray(char.skills) ? char.skills.slice(0, 5).join(", ") : "Belum ada skill";
      const items = Array.isArray(char.inventory) ? char.inventory.slice(0, 5).join(", ") : "Belum ada item";
      return `<article class="lobby-character-card ${char.id === state.activeCharacterId ? "is-active" : ""}">
        <div class="char-avatar">${esc(initials(char.name))}</div>
        <div>
          <strong>${esc(char.name || "Karakter")}</strong>
          <small>${esc(effectiveRaceName(char))} • ${esc(classById(char.className).name)} Lv ${esc(char.level || 1)}</small>
          <span>HP ${esc(char.hpCurrent || 0)}/${esc(char.hpMax || 0)} • AC ${esc(char.ac || 10)} • ${esc(skills)}</span>
          <span>Item: ${esc(items)}</span>
        </div>
      </article>`;
    }).join("");
  }

  function renderRoomFeed(list, emptyText) {
    if (!list.length) return `<p class="dnd-muted">${esc(emptyText)}</p>`;
    return list.slice(0, 8).map((entry) => `<div class="room-feed-row">
      <strong>${esc(entry.kind || entry.userName || entry.speaker || "Log")}</strong>
      <span>${esc(entry.text || entry.detail || "")}</span>
      <small>${esc(new Date(entry.createdAt || nowIso()).toLocaleString("id-ID"))}</small>
    </div>`).join("");
  }

  function renderLobbyAiBox(label) {
    return `<section class="dnd-card lobby-ai-box">
      <h3>${esc(label)}</h3>
      <p>Tanya aturan, ringkasan room, ide encounter, atau cek alur tanpa membuka tab lain.</p>
      <textarea id="lobby-ai-question" rows="3" placeholder="Contoh: party level 1 cocok melawan monster apa di kota pelabuhan?"></textarea>
      <button class="dnd-btn primary" data-action="lobby-ai-ask">Tanya AI</button>
      ${state.ui.aiAnswer ? `<div class="lobby-ai-answer">${esc(state.ui.aiAnswer)}</div>` : ""}
    </section>`;
  }

  function renderRoomChatPanel() {
    return `<section class="dnd-card lobby-chat-box">
      <h3>Chat Room</h3>
      <div class="room-feed compact">${renderRoomFeed(roomScopedEntries("chatLog"), "Belum ada chat di room ini.")}</div>
      <div class="chat-input-row">
        <input id="room-chat-text" placeholder="Tulis chat singkat untuk room...">
        <button class="dnd-btn primary" data-action="send-room-chat">Kirim</button>
      </div>
    </section>`;
  }

  function renderEventLogPanel(canWrite) {
    return `<section class="dnd-card lobby-log-box">
      <h3>Log Alur & Event</h3>
      <div class="room-feed">${renderRoomFeed(roomScopedEntries("roomEvents"), "Belum ada event dari GM di room ini.")}</div>
      ${canWrite ? `<div class="event-input-grid">
        <select id="room-event-kind">
          <option>Event</option>
          <option>Quest</option>
          <option>Combat</option>
          <option>Reward</option>
          <option>NPC</option>
          <option>Map</option>
        </select>
        <textarea id="room-event-text" rows="3" placeholder="Catat alur, event, clue, reward, atau perubahan penting..."></textarea>
        <button class="dnd-btn primary" data-action="add-room-event">Tambah Log</button>
      </div>` : ""}
    </section>`;
  }

  function renderPlayerRoomDashboard() {
    const user = currentUser();
    const chars = ownedCharacters();
    const char = activeCharacter();
    const skills = char?.skills?.length ? char.skills.map((id) => skillById(id)?.name || id).join(", ") : "Belum memilih skill.";
    const inventory = char?.inventory?.length ? char.inventory.join(", ") : "Belum ada item tersimpan.";
    const abilities = char ? DATA.abilities.map((ab) => `<div><b>${esc(ab.label)}</b><span>${esc(char.abilities?.[ab.id] || 0)}</span></div>`).join("") : "";
    return `<div class="lobby-dashboard player-view">
      <section class="dnd-card dashboard-main-card">
        <div class="dashboard-title-row">
          <div><span class="lobby-kicker">Player View</span><h3>Meja Karakter</h3></div>
          <span class="dnd-pill warn">Sheet read-only saat di dalam game</span>
        </div>
        ${char ? `<div class="player-sheet-preview">
          <div class="char-avatar big">${esc(initials(char.name))}</div>
          <div>
            <h2>${esc(char.name || user?.name || "Karakter")}</h2>
            <p>${esc(effectiveRaceName(char))} • ${esc(classById(char.className).name)} Level ${esc(char.level || 1)}</p>
            <div class="mini-stat-grid">
              <span>HP <b>${esc(char.hpCurrent || 0)}/${esc(char.hpMax || 0)}</b></span>
              <span>AC <b>${esc(char.ac || 10)}</b></span>
              <span>Gold <b>${esc(char.gold || 0)} gp</b></span>
            </div>
          </div>
        </div>
        <div class="ability-strip small">${abilities}</div>
        <div class="dashboard-two-col">
          <div><h4>Skill</h4><p>${esc(skills)}</p></div>
          <div><h4>Item Dipakai</h4><p>${esc(inventory)}</p></div>
        </div>` : `<div class="dnd-empty">Belum ada karakter aktif. Buat karakter dulu agar sheet, item, skill, dan update session muncul di sini.</div>`}
      </section>
      ${renderLobbyAiBox("AI Info Player")}
      ${renderEventLogPanel(false)}
      ${renderRoomChatPanel()}
    </div>`;
  }

  function activeRoomMap(room = currentRoom()) {
    const maps = roomMaps(room?.id || state.activeRoomId);
    const preferredId = room?.activeMapId || state.activeMapId || "";
    const map = maps.find((item) => item.id === preferredId) || maps[0] || null;
    if (map) {
      state.activeMapId = map.id;
      if (room) room.activeMapId = map.id;
    }
    return map;
  }

  function setRoomActiveMap(mapId) {
    const room = currentRoom();
    const map = roomMaps(room?.id || state.activeRoomId).find((item) => item.id === mapId);
    if (!map) return toast("Map tidak ditemukan di room ini.");
    if (!isGm()) return toast("Hanya GM yang memilih map aktif untuk semua player.");
    state.activeMapId = map.id;
    if (room) {
      room.activeMapId = map.id;
      room.lastActiveAt = nowIso();
    }
    saveState(true);
    render();
    toast("Map aktif room diperbarui untuk GM dan Player.");
  }

  function activeMap() {
    return activeRoomMap(currentRoom());
  }

  function currentTurnCharacter(room = currentRoom()) {
    if (!room?.turn?.activeCharacterId) return null;
    return roomCharacters(room.id).find((character) => character.id === room.turn.activeCharacterId) || null;
  }

  function characterBelongsToUser(character, user = currentUser()) {
    if (!character || !user) return false;
    return character.ownerId === user.id
      || character.ownerName === user.name
      || String(character.websiteUserId || "") === String(user.websiteUserId || "");
  }

  function playerHasCurrentTurn() {
    if (isGm()) return true;
    const room = currentRoom();
    const active = currentTurnCharacter(room);
    return !!active && characterBelongsToUser(active);
  }

  function canTakeGameAction(label = "aksi") {
    if (isGm()) return true;
    const room = currentRoom();
    if (!room) {
      toast("Masuk room dulu sebelum melakukan aksi permainan.");
      return false;
    }
    const active = currentTurnCharacter(room);
    if (!active) {
      toast("Belum ada giliran aktif. Tunggu GM menentukan giliran terlebih dahulu.");
      return false;
    }
    if (!characterBelongsToUser(active)) {
      toast(`Belum giliranmu. Giliran aktif: ${active.name || "karakter lain"}.`);
      return false;
    }
    return true;
  }

  function setRoomTurnFromControl() {
    if (!isGm()) return toast("Hanya GM yang mengatur giliran.");
    const room = currentRoom();
    if (!room) return toast("Pilih room dulu.");
    const characterId = qs("#room-turn-character")?.value || "";
    if (!room.turn) room.turn = { round: 1, activeCharacterId: "" };
    room.turn.activeCharacterId = characterId;
    room.turn.updatedAt = nowIso();
    room.turn.updatedBy = currentUser()?.name || "GM";
    room.lastActiveAt = nowIso();
    saveState(true);
    render();
    toast(characterId ? "Giliran aktif diperbarui." : "Giliran dikosongkan. Player tidak bisa melakukan aksi.");
  }

  function nextRoomTurn() {
    if (!isGm()) return toast("Hanya GM yang mengatur giliran.");
    const room = currentRoom();
    if (!room) return toast("Pilih room dulu.");
    const chars = roomCharacters(room.id).filter(characterIsReady);
    if (!chars.length) return toast("Belum ada karakter siap di room ini.");
    if (!room.turn) room.turn = { round: 1, activeCharacterId: "" };
    const index = chars.findIndex((item) => item.id === room.turn.activeCharacterId);
    const nextIndex = index >= 0 ? (index + 1) % chars.length : 0;
    if (index >= 0 && nextIndex === 0) room.turn.round = clamp((room.turn.round || 1) + 1, 1, 999);
    room.turn.activeCharacterId = chars[nextIndex].id;
    room.turn.updatedAt = nowIso();
    room.turn.updatedBy = currentUser()?.name || "GM";
    room.lastActiveAt = nowIso();
    saveState(true);
    render();
    toast(`Giliran: ${chars[nextIndex].name}.`);
  }

  function clearRoomTurn() {
    if (!isGm()) return toast("Hanya GM yang mengatur giliran.");
    const room = currentRoom();
    if (!room) return toast("Pilih room dulu.");
    room.turn = { round: room.turn?.round || 1, activeCharacterId: "", updatedAt: nowIso(), updatedBy: currentUser()?.name || "GM" };
    room.lastActiveAt = nowIso();
    saveState(true);
    render();
    toast("Giliran dikunci. Player hanya bisa melihat sheet/stat/item.");
  }




  function renderInGameActionLockBanner() {
    if (isGm()) return "";
    const room = currentRoom();
    const active = currentTurnCharacter(room);
    const ownTurn = playerHasCurrentTurn();
    const message = !active
      ? "Menunggu GM menentukan giliran. Player hanya bisa melihat sheet, stat, item, map, dan log."
      : ownTurn
        ? `Giliranmu aktif: ${active.name}. Kamu boleh roll dice, skill, dialog aksi, dan menggerakkan token sendiri.`
        : `Bukan giliranmu. Giliran aktif: ${active.name}. Kamu hanya bisa melihat data karakter, item, map, dan log.`;
    return `<section class="turn-lock-banner ${ownTurn ? "can-act" : "is-locked"}"><strong>${ownTurn ? "Giliranmu" : "Action terkunci"}</strong><span>${esc(message)}</span></section>`;
  }

  function renderRoomTurnPanel(gmView) {
    const room = currentRoom();
    if (!room) return "";
    const chars = roomCharacters(room.id).filter(characterIsReady);
    const active = currentTurnCharacter(room);
    const round = room.turn?.round || 1;
    const options = chars.map((character) => `<option value="${esc(character.id)}" ${active?.id === character.id ? "selected" : ""}>${esc(character.name)} — ${esc(character.ownerName || "Player")}</option>`).join("");
    if (gmView) {
      return `<section class="dnd-card turn-panel gm-turn-panel">
        <div class="dnd-section-title compact-title"><div><h3>Turn Controller 5e</h3><p>GM menentukan siapa yang boleh action. Player lain otomatis terkunci.</p></div><span class="dnd-pill good">Round ${esc(round)}</span></div>
        <div class="turn-control-grid">
          <label>Giliran aktif<select id="room-turn-character"><option value="">-- Kunci semua player --</option>${options}</select></label>
          <button class="dnd-btn primary" data-action="room-turn-set">Set Giliran</button>
          <button class="dnd-btn good" data-action="room-turn-next">Next Turn</button>
          <button class="dnd-btn danger" data-action="room-turn-clear">Kunci Action</button>
        </div>
        <p class="dnd-muted">Sesuai alur D&amp;D 2014/5e: saat combat, tiap karakter hanya beraksi pada gilirannya. Di luar giliran, player tetap boleh melihat sheet/stat/item.</p>
      </section>`;
    }
    return `<section class="dnd-card turn-panel player-turn-panel">
      <div class="dnd-section-title compact-title"><div><h3>Giliran Saat Ini</h3><p>${active ? esc(active.name) : "GM belum memilih giliran."}</p></div><span class="dnd-pill ${playerHasCurrentTurn() ? "good" : "warn"}">${playerHasCurrentTurn() ? "Boleh action" : "Read-only"}</span></div>
      <p class="dnd-muted">${active ? `Round ${esc(round)} • dikontrol GM.` : "Saat belum ada giliran aktif, semua aksi player dikunci."}</p>
    </section>`;
  }

  function renderRoomMapPanel(gmView) {
    const room = currentRoom();
    if (!room) return "";
    const maps = roomMaps(room.id);
    const map = activeRoomMap(room);
    const mapBody = map?.image
      ? renderImageMapBody(map)
      : map
        ? `<canvas id="dnd-map-canvas" width="960" height="960" aria-label="DnD room map canvas"></canvas><div class="map-help">${gmView ? "GM bisa menaruh NPC. Player hanya bisa memindahkan token miliknya saat giliran aktif." : "Map pilihan GM. Token player hanya bisa bergerak saat giliran aktif."}</div>`
        : `<div class="map-empty"><div><h3>Belum ada map aktif</h3><p>GM perlu generate/upload map, lalu pilih sebagai map aktif room.</p></div></div>`;
    const selector = gmView ? `<select id="room-active-map-select" class="dnd-btn">${maps.map((m) => `<option value="${esc(m.id)}" ${map?.id === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select>` : `<span class="dnd-pill warn">Map GM: ${esc(map?.name || "belum dipilih")}</span>`;
    return `<section class="dnd-card in-game-map-card">
      <div class="dnd-section-title compact-title"><div><h3>Map Aktif Room</h3><p>${gmView ? "GM memilih satu map; pilihan ini tampil di semua layar player dan GM." : "Map mengikuti pilihan GM dan sinkron ke semua player."}</p></div><div class="dnd-actions">${selector}</div></div>
      <div class="map-frame in-room-map-frame">${mapBody}</div>
      ${gmView ? `<details class="compact-details in-game-map-tools"><summary>Generate / Upload / NPC Map</summary>${renderMapControls(map)}</details>` : ""}
    </section>`;
  }

  function renderRoomDicePanel(gmView) {
    const dice = [2, 3, 4, 6, 8, 10, 12, 20, 100];
    const charOptions = ownedCharacters().map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    const locked = !gmView && !playerHasCurrentTurn();
    return `<section class="dnd-card in-game-dice-card ${locked ? "is-locked" : ""}">
      <div class="dnd-section-title compact-title"><div><h3>Dadu Lengkap</h3><p>d2, d3, d4, d6, d8, d10, d12, d20, dan d100 percentile.</p></div><span class="dnd-pill ${locked ? "warn" : "good"}">${locked ? "Terkunci" : "Siap roll"}</span></div>
      <div class="dice-stage compact-dice"><div><div id="dice-face" class="dice-face">${esc(state.ui.diceResult || 20)}</div><p id="dice-label" class="dnd-muted" style="text-align:center;margin:.75rem 0 0">${esc(state.ui.diceLabel || "d20")}</p><p id="dice-detail" class="dice-detail">${esc(state.ui.diceDetail || "single die")}</p></div></div>
      <div class="dnd-actions dice-all-buttons">${dice.map((sides) => `<button class="dnd-btn primary" data-action="roll-dice" data-sides="${sides}" data-label="d${sides}" ${locked ? "disabled" : ""}>d${sides}</button>`).join("")}</div>
      <div class="dnd-form-grid in-game-skill-roll">
        <div class="dnd-field"><label>Character</label><select id="skill-character" ${locked ? "disabled" : ""}>${charOptions}</select></div>
        <div class="dnd-field"><label>Skill</label><select id="skill-select" ${locked ? "disabled" : ""}>${DATA.skills.map((skill) => `<option value="${esc(skill.id)}">${esc(skill.label)}</option>`).join("")}</select></div>
      </div>
      <button class="dnd-btn good" data-action="roll-skill" ${locked ? "disabled" : ""}>Roll skill</button>
      <div class="roll-log in-game-roll-log">${state.rollLog.slice(0, 6).map((r) => `<div class="log-row"><span><strong>${esc(r.label)}</strong><small>${esc(r.detail)} | ${esc(r.user)}</small></span><span class="dnd-pill good">${esc(r.total)}</span></div>`).join("") || `<p class="dnd-muted">Belum ada roll.</p>`}</div>
    </section>`;
  }

  function renderGmRoomDashboard() {
    const maps = roomMaps(state.activeRoomId);
    const npcs = roomNpcs(state.activeRoomId);
    const chars = roomCharacters(state.activeRoomId);
    const items = combinedItems();
    return `<div class="lobby-dashboard gm-view">
      <section class="dnd-card dashboard-main-card">
        <div class="dashboard-title-row">
          <div><span class="lobby-kicker">GM View</span><h3>Control Room</h3></div>
          <div class="dashboard-actions">
            <span class="dnd-pill good">GM bebas mengatur room</span>
          </div>
        </div>
        <div class="gm-control-grid">
          <div class="gm-control-card"><b>Map Room</b><span>${esc(maps.length)} map aktif/tersimpan</span></div>
          <div class="gm-control-card"><b>NPC & Monster</b><span>${esc(npcs.length)} token/NPC room</span></div>
          <div class="gm-control-card"><b>Setting Item</b><span>${esc(items.length)} item dasar + custom</span></div>
          <div class="gm-control-card"><b>Dice & Check</b><span>Dadu lengkap + skill check</span></div>
        </div>
      </section>
      ${renderRoomTurnPanel(true)}
      ${renderRoomMapPanel(true)}
      ${renderRoomDicePanel(true)}
      <section class="dnd-card"><h3>Karakter di Room</h3>${characterSummaryCards(chars)}</section>
      ${renderEventLogPanel(true)}
      ${renderLobbyAiBox("AI Asisten GM")}
      ${renderRoomChatPanel()}
    </div>`;
  }

  function renderOwnerEntrySwitcher(activeMode) {
    const user = currentUser();
    const active = currentRoom();
    if (!userIsOwner(user) || !active) return "";
    return `<section class="owner-entry-switcher">
      <div><span class="lobby-kicker">Owner Entry</span><strong>Pilih mode untuk room ${esc(active.name)}</strong><small>Mode hanya berlaku di tampilan kamu. Player lain tetap melihat role normal.</small></div>
      <div class="owner-entry-buttons">
        <button class="dnd-btn ${activeMode === "player" ? "primary" : ""}" data-action="owner-entry-mode" data-mode="player">Masuk Player</button>
        <button class="dnd-btn ${activeMode === "gm" ? "primary" : ""}" data-action="owner-entry-mode" data-mode="gm">Masuk GM</button>
      </div>
    </section>`;
  }


  function renderRoomInsideTab(room, viewMode, user) {
    const gmView = viewMode === "gm";
    const charCount = roomCharacters(room.id).length;
    const mapCount = roomMaps(room.id).length;
    const npcCount = roomNpcs(room.id).length;
    const playerNames = (room.playerNames || []).slice(0, 10);
    const roomDashboard = gmView ? renderGmRoomDashboard() : renderPlayerRoomDashboard();
    return `<section class="dnd-panel dungeon-room-inside-shell ${gmView ? "is-gm-room" : "is-player-room"}">
      <div class="room-inside-head">
        <button class="dnd-btn" data-action="room-back-lobby">← Kembali ke List Lobby</button>
        <span class="dnd-pill ${gmView ? "good" : "warn"}">${esc(gmView ? "Tampilan GM" : "Tampilan Player")}</span>
      </div>
      ${renderOwnerEntrySwitcher(viewMode)}
      ${renderInGameActionLockBanner()}
      <section class="room-inside-hero">
        <div>
          <span class="lobby-kicker">Di Dalam Room</span>
          <h2>${esc(room.name || "Campaign Room")}</h2>
          <p>${esc(room.description || "Room campaign DnD 2014. Tampilan di dalam room dipisahkan dari daftar lobby supaya player dan GM tidak tercampur.")}</p>
          <div class="room-inside-actions">
            <button class="dnd-btn danger" data-action="room-back-lobby">Keluar Game</button>
            <span class="dnd-pill ${gmView ? "good" : "warn"}">${gmView ? "GM mengatur sesi" : "Player mengikuti giliran"}</span>
          </div>
        </div>
        <div class="room-inside-stat-grid">
          <div><strong>${esc((room.playerNames || []).length)}/${esc(room.maxPlayers || 5)}</strong><span>Player</span></div>
          <div><strong>${esc(charCount)}</strong><span>Karakter</span></div>
          <div><strong>${esc(mapCount)}</strong><span>Map</span></div>
          <div><strong>${esc(npcCount)}</strong><span>NPC</span></div>
        </div>
      </section>
      <section class="dnd-card room-inside-info">
        <div><b>GM</b><span>${esc(room.gmName || "GM")}</span></div>
        <div><b>Mode</b><span>${esc(room.playMode || "offline")}</span></div>
        <div><b>Level</b><span>${esc(room.partyLevelStart || 1)}-${esc(room.partyLevelEnd || room.partyLevelStart || 1)}</span></div>
        <div><b>Kode</b><span>${esc(room.roomCode || "ROOM")}</span></div>
        <div class="span-all"><b>Player masuk</b><span>${playerNames.length ? esc(playerNames.join(", ")) : "Belum ada player"}</span></div>
        ${room.scheduleNote ? `<div class="span-all"><b>Jadwal</b><span>${esc(room.scheduleNote)}</span></div>` : ""}
        ${room.safetyNote ? `<div class="span-all"><b>Catatan GM</b><span>${esc(room.safetyNote)}</span></div>` : ""}
      </section>
      ${roomDashboard}
      ${gmView ? "" : `${renderRoomTurnPanel(false)}${renderRoomMapPanel(false)}${renderRoomDicePanel(false)}`}
    </section>`;
  }

  function renderLobbyTab() {
    normalizeRooms();
    const gm = canManageRooms();
    const active = currentRoom();
    const viewMode = visibleTableMode();
    const user = currentUser();
    if (state.ui.lobbyInsideRoom && active) return renderRoomInsideTab(active, viewMode, user);
    if (state.ui.lobbyInsideRoom && !active) { state.ui.lobbyInsideRoom = false; document.body.classList.remove('gemu-dnd-room-active'); }
    const roomsHtml = state.rooms.length
      ? state.rooms.map((room) => {
          const joined = roomAccessAllowed(room);
          const selected = room.id === state.activeRoomId;
          const charCount = roomCharacters(room.id).length;
          const mapCount = roomMaps(room.id).length;
          const names = (room.playerNames || []).slice(0, 6).join(", ") || "Belum ada player";
          const playerTotal = (room.playerNames || []).length;
          const maxPlayers = Number(room.maxPlayers || 5);
          const fillPercent = Math.min(100, Math.round((playerTotal / Math.max(maxPlayers, 1)) * 100));
          return `
            <article class="dnd-room-card dungeon-room-card ${selected ? "active" : ""}">
              <div class="room-main">
                <div class="room-card-topline">
                  <span class="room-badge ${room.hasPassword ? "private" : "open"}">${room.hasPassword ? "Private" : "Open"}</span>
                  <span class="room-code">${esc(room.roomCode || "ROOM")}</span>
                </div>
                <h4>${esc(room.name)}</h4>
                <p>${esc(room.description || "Room campaign DnD 2014.")}</p>
                <div class="room-meta-grid">
                  <span><b>GM</b>${esc(room.gmName)}</span>
                  <span><b>Mode</b>${esc(room.playMode || "offline")}</span>
                  <span><b>Level</b>${esc(room.partyLevelStart || 1)}-${esc(room.partyLevelEnd || room.partyLevelStart || 1)}</span>
                  <span><b>Player</b>${playerTotal}/${esc(maxPlayers)}</span>
                  <span><b>GM Max</b>${esc(room.maxGMs || 1)}</span>
                  <span><b>Map</b>${esc(mapCount)}</span>
                </div>
                <div class="room-capacity-bar"><i style="width:${fillPercent}%"></i></div>
                <small>Karakter: ${charCount} · Player: ${esc(names)}</small>
                ${room.scheduleNote ? `<small>Jadwal: ${esc(room.scheduleNote)}</small>` : ""}
                <small>Terakhir aktif: ${new Date(room.lastActiveAt).toLocaleString("id-ID")}</small>
              </div>
              <div class="room-actions">
                ${room.hasPassword && !joined ? `<input id="roomPass-${room.id}" type="password" placeholder="Password room">` : ""}
                <button class="dnd-btn primary room-play-btn" data-action="enter-room" data-room-id="${room.id}">▶ ${joined ? "Masuk / Enter / Play" : "Join & Play"}</button>
                ${joined && !gm ? `<button class="dnd-btn" data-action="leave-room" data-room-id="${room.id}">Keluar</button>` : ""}
                ${gm ? `<button class="dnd-btn danger" data-action="delete-room" data-room-id="${room.id}">Hapus</button>` : ""}
              </div>
            </article>`;
        }).join("")
      : `<div class="dnd-empty dungeon-empty">Belum ada room. GM perlu membuat room dulu agar player bisa masuk.</div>`;

    const createPanel = gm ? `
      <section class="dnd-card dnd-room-create dungeon-create-card enhanced-create-room">
        <div class="create-room-head">
          <div>
            <span class="lobby-kicker">Buat Pintu Campaign</span>
            <h3>Buat Room Campaign</h3>
            <p>Atur kapasitas, akses, level party, dan catatan awal sebelum player masuk.</p>
          </div>
          <span class="room-door-icon" aria-hidden="true"></span>
        </div>
        <div class="room-form-section">
          <h4>Identitas Room</h4>
          <div class="form-grid two room-form-grid">
            <label>Nama room<input id="roomName" value="${esc(state.campaign.name || "Gemuyokai Frontier")}"></label>
            <label>Kode room<input id="roomCode" placeholder="Contoh: RAVEN-01"></label>
          </div>
          <label>Deskripsi campaign<textarea id="roomDescription" rows="4" placeholder="Contoh: Kota Raven Gate, sesi level 1, fokus investigasi, dungeon ringan, roleplay sedang."></textarea></label>
        </div>
        <div class="room-form-section">
          <h4>Akses & Kapasitas</h4>
          <div class="form-grid two room-form-grid">
            <label>Password<input id="roomPassword" type="password" placeholder="Kosongkan jika room open"></label>
            <label>Status room<select id="roomStatus"><option>Open</option><option>Private</option><option>Draft</option><option>Paused</option></select></label>
            <label>Maksimal player<input id="roomMaxPlayers" type="number" min="1" max="12" value="5"></label>
            <label>Maksimal GM<input id="roomMaxGMs" type="number" min="1" max="4" value="1"></label>
          </div>
        </div>
        <div class="room-form-section">
          <h4>Aturan Sesi</h4>
          <div class="form-grid two room-form-grid">
            <label>Mode main<select id="roomPlayMode"><option value="offline">Offline table</option><option value="online">Online text</option><option value="online-voice">Online voice</option></select></label>
            <label>Tipe sesi<select id="roomSessionType"><option>Campaign</option><option>One Shot</option><option>Dungeon Crawl</option><option>Roleplay Heavy</option><option>Combat Heavy</option></select></label>
            <label>Level awal<input id="roomLevelStart" type="number" min="1" max="20" value="1"></label>
            <label>Target level<input id="roomLevelEnd" type="number" min="1" max="20" value="1"></label>
          </div>
          <label>Jadwal / catatan waktu<input id="roomSchedule" placeholder="Contoh: Sabtu malam, 19.30 WIB, fleksibel"></label>
          <label>Catatan GM untuk player<textarea id="roomNote" rows="3" placeholder="Contoh: bawa karakter level 1, no evil party, fokus eksplorasi dan investigasi."></textarea></label>
        </div>
        <button class="dnd-btn primary create-room-submit" data-action="create-room">Buat Room</button>
      </section>` : `
      <section class="dnd-card dnd-room-create dungeon-create-card enhanced-create-room">
        <div class="create-room-head">
          <div><span class="lobby-kicker">Daftar Pintu</span><h3>Masuk Room</h3><p>Pilih room yang dibuat GM. Setelah masuk, dashboard player menampilkan karakter, item, skill, chat, dan log event.</p></div>
          <span class="room-door-icon" aria-hidden="true"></span>
        </div>
      </section>`;

    const totalPlayers = new Set((state.rooms || []).flatMap((room) => room.playerNames || [])).size;
    const lobbyStats = [
      ["Room", state.rooms.length],
      ["Player", totalPlayers],
      ["Karakter", roomCharacters(state.activeRoomId).length],
      ["Map", roomMaps(state.activeRoomId).length]
    ];
    const activeInfo = active ? `
      <div class="dnd-current-room is-live dungeon-current-room">
        <span>Room aktif</span>
        <strong>${esc(active.name)}</strong>
        <small>${esc(active.description || "Tidak ada deskripsi.")}</small>
        <div class="room-mini-actions">
          <button class="dnd-btn primary" data-action="enter-room" data-room-id="${active.id}">Masuk / Enter / Play</button>
          <button class="dnd-btn" data-action="tab" data-tab="character">Karakter</button>
          <button class="dnd-btn" data-action="${gm ? "gm-quick-map" : "tab"}" ${gm ? "" : "data-tab=\"map\""}>Map</button>
        </div>
      </div>` : `<div class="dnd-current-room muted dungeon-current-room"><span>Room aktif</span><strong>Belum memilih room</strong><small>${gm ? "Buat room atau pilih room sebelum membuka pintu campaign." : "Pilih room agar karakter, map, NPC, chat, dan log tersimpan pada campaign yang benar."}</small></div>`;

    const lobbyHero = `
      <section class="dnd-lobby-hero dungeon-gate-hero">
        <div class="lobby-hero-copy">
          <span class="lobby-kicker">Gerbang Dungeon</span>
          <h2>${esc(active?.name || state.campaign.name || "DnD 2014 Table")}</h2>
          <p>${esc(active?.description || "Pilih pintu campaign, masuk sebagai player atau GM, lalu kelola map, karakter, chat, log alur, dan bantuan AI dari lobby.")}</p>
          <div class="lobby-hero-actions">
            ${gm ? `<button class="dnd-btn good" data-action="gm-quick-map">⚡ Map Dadakan GM</button>` : `<button class="dnd-btn primary" data-action="tab" data-tab="character">Buat Karakter</button>`}
            <button class="dnd-btn" data-action="tab" data-tab="${gm ? "gm" : "compendium"}">${gm ? "GM Screen" : "Compendium"}</button>
          </div>
        </div>
        <div class="lobby-dungeon-gate" aria-hidden="true">
          <div class="gate-torch left"></div>
          <div class="gate-door"><span></span></div>
          <div class="gate-torch right"></div>
        </div>
        <div class="lobby-stat-grid">
          ${lobbyStats.map(([label, value]) => `<div class="lobby-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join("")}
        </div>
      </section>`;

    const roomDashboard = active
      ? (viewMode === "gm" ? renderGmRoomDashboard() : renderPlayerRoomDashboard())
      : `<section class="dnd-card dungeon-wait-card"><h3>Belum masuk room</h3><p>${user ? "Pilih room dari daftar, atau buat room baru jika kamu GM." : "Login website dulu agar room, karakter, chat, dan log tersimpan."}</p></section>`;

    return `
      <section class="dnd-panel dungeon-lobby-shell">
        <div class="panel-head dungeon-panel-head">
          <div>
            <h2>Lobby Campaign</h2>
            <p>Lobby dibuat seperti pintu masuk dungeon: pilih room, lalu masuk ke dashboard sesuai peran.</p>
          </div>
          <div class="panel-actions">
            <button class="dnd-btn primary" data-action="tab" data-tab="character">Buat / Edit Karakter</button>
            <button class="dnd-btn" data-action="${gm ? "gm-quick-map" : "tab"}" ${gm ? "" : "data-tab=\"map\""}>Buka Map</button>
          </div>
        </div>
        ${renderOwnerEntrySwitcher(viewMode)}
        ${lobbyHero}
        ${activeInfo}
        <div class="dnd-lobby-grid dungeon-room-grid">
          <section class="dnd-room-list dungeon-room-list-panel">
            <div class="room-list-head">
              <div><span class="lobby-kicker">List Lobby</span><h3>Room Campaign Tersedia</h3></div>
              <span>${esc(state.rooms.length)} room</span>
            </div>
            ${roomsHtml}
          </section>
          ${createPanel}
        </div>
        ${roomDashboard}
      </section>`;
  }
  function renderSessionPanel() {
    const user = currentUser();
    const online = state.campaign.playMode === "online";
    const voice = !!state.campaign.voiceExternal;
    const speakerDefault = isGm() ? "GM / NPC" : activeCharacter()?.name || user?.name || "Player";
    const status = online
      ? (voice ? `Online voice aktif${state.campaign.voicePlatform ? " via " + state.campaign.voicePlatform : ""}. Dialog text tidak wajib.` : "Online text aktif. GM dan player wajib mengisi dialog/narasi agar AI bisa memantau alur.")
      : "Offline table aktif. Dialog/narasi tidak wajib diinput.";
    return `
      <div class="dnd-card" style="margin-top:1rem">
        <div class="dnd-section-title">
          <div>
            <h3>Dialog & Narasi Session</h3>
            <p>${esc(status)}</p>
          </div>
          <span class="dnd-pill ${online && !voice ? "warn" : "good"}">${esc(online ? (voice ? "Online voice" : "Online text wajib") : "Offline optional")}</span>
        </div>
        ${online ? `
          <div class="dnd-form-grid">
            <div class="dnd-field"><label>Speaker</label><input id="session-speaker" value="${esc(speakerDefault)}" placeholder="NPC, GM, nama karakter"></div>
            <div class="dnd-field span-12">
              <label>${isGm() ? "Dialog NPC / narasi GM" : "Dialog karakter player"}</label>
              <textarea id="session-dialogue-text" placeholder="${isGm() ? "Contoh: Penjaga penginapan berkata..." : "Contoh: Aku bertanya ke pandai besi..."}"></textarea>
            </div>
          </div>
          <div class="dnd-actions" style="margin-top:.75rem">
            <button class="dnd-btn primary" data-action="add-session-log">Simpan dialog session</button>
            ${isGm() ? `
              <button id="btn-session-voice-narration" class="dnd-btn ${state.ui.isVoiceNarrationActive ? "danger" : ""}" data-action="gm-voice-narration">
                ${state.ui.isVoiceNarrationActive ? "🔴 Listening..." : "🎙️ Voice to Text"}
              </button>
              <button class="dnd-btn good" data-action="grant-reward">💎 Beri Reward</button>
            ` : ""}
          </div>
        ` : `<p class="dnd-muted">Mode offline tidak memaksa dialog. Kamu masih bisa memakai dice, map, NPC, dan sheet seperti biasa.</p>`}
        <div class="ai-feed" style="margin-top:1rem">
          ${state.sessionLog.length ? state.sessionLog.slice(0, 8).map((entry) => `<div class="compact-row"><span><strong>${esc(entry.speaker)} <small>${esc(entry.role)} | ${esc(new Date(entry.createdAt).toLocaleString())}</small></strong><small>${esc(entry.text)}</small></span></div>`).join("") : `<div class="rule-warning"><strong>Belum ada log</strong><span>${esc(online && !voice ? "Online text mode butuh dialog GM/player." : "Tidak ada kewajiban dialog saat offline atau voice aktif.")}</span></div>`}
        </div>
      </div>
    `;
  }

  function renderCharacterCompact(c) {
    const owner = state.accounts.find((a) => a.id === c.ownerId);
    return `<div class="compact-row">
      <span><strong>${esc(c.name)}</strong><small>${esc(effectiveRaceName(c))} ${esc(classById(c.className).name)} Lv ${esc(c.level)} | ${esc(owner?.name || "Unknown")} | Start: ${esc(c.startingChoice?.name || "belum dipilih")}</small></span>
      <span class="dnd-pill ${c.requestedLevel || !c.startingChoice ? "warn" : "good"}">HP ${esc(c.hpCurrent)}/${esc(c.hpMax)} | ${esc(c.gold || 0)} gp</span>
    </div>`;
  }


  function backgroundById(id) {
    return DATA.backgrounds.find((b) => b.id === id) || DATA.backgrounds[0];
  }

  function selectedStartingPackageFromList(packages, selectedId) {
    if (!selectedId) return null;
    return packages.find((pkg) => pkg.id === selectedId) || null;
  }

  function renderMiniList(items, emptyText = "Belum ada data.") {
    const list = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!list.length) return `<p class="dnd-muted">${esc(emptyText)}</p>`;
    return `<ul>${list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
  }

  function characterDraftFromForm(form) {
    const existing = activeCharacter();
    const draft = existing ? JSON.parse(JSON.stringify(existing)) : createBlankCharacterDraft();
    draft.name = form.characterName?.value ?? draft.name ?? "";
    draft.race = form.race?.value ?? draft.race ?? "";
    const availableSubraces = subracesForRace(draft.race);
    const requestedSubrace = form.subrace?.value ?? draft.subrace ?? "";
    draft.subrace = availableSubraces.length && subraceById(draft.race, requestedSubrace) ? requestedSubrace : "";
    const selectedLanguageIds = qsa("select[name='languageChoices']", form).map((el) => el.value).filter(Boolean);
    const normalizedLanguages = normalizeLanguageSelection(draft.race, draft.subrace, selectedLanguageIds.length ? selectedLanguageIds : (draft.languageChoices || draft.languages || []));
    draft.languageChoices = normalizedLanguages.extras;
    draft.languages = normalizedLanguages.all;
    draft.className = form.classNameField?.value ?? draft.className ?? "";
    draft.level = clamp(form.level?.value || draft.level || 1, 1, 20);
    draft.background = form.background?.value ?? draft.background ?? "";
    draft.alignment = form.alignment?.value ?? draft.alignment ?? "";
    draft.personalityTraits = [form.personalityTrait1?.value ?? draft.personalityTraits?.[0] ?? "", form.personalityTrait2?.value ?? draft.personalityTraits?.[1] ?? ""];
    draft.ideal = form.ideal?.value ?? draft.ideal ?? "";
    draft.bond = form.bond?.value ?? draft.bond ?? "";
    draft.flaw = form.flaw?.value ?? draft.flaw ?? "";
    draft.baseAbilities = { ...emptyAbilityScores(), ...(draft.baseAbilities || draft.abilities || {}) };
    DATA.abilities.forEach((a) => {
      const input = form.querySelector(`[name="ability-${a.id}"]`);
      const fallback = abilityScoreValue(draft.baseAbilities, a.id, 0);
      draft.baseAbilities[a.id] = normalizeAbilityBaseValue(input?.value ?? fallback, userIsOwner(currentUser()));
    });
    draft.abilityChoices = qsa("select[name='abilityChoices']", form).map((el) => el.value).filter(Boolean);
    draft.abilityBonuses = effectiveAbilityBonuses(draft);
    draft.abilities = finalAbilityScores(draft.baseAbilities, draft);
    draft.skills = collectSkillSelectionsFromForm(form, draft);
    draft.inspiration = Number(form.inspiration?.value || draft.inspiration || 0);
    draft.hitDiceRemaining = Number(form.hitDiceRemaining?.value || draft.hitDiceRemaining || 1);

    // Parse expertise
    const expertise = [];
    qsa("select[name^='expertise-']", form).forEach((el) => {
      if (el.value) expertise.push(el.value);
    });
    draft.expertise = expertise;

    // Parse attacks
    const attacks = [];
    const attackRows = qsa(".attack-row", form);
    attackRows.forEach(row => {
      const name = row.querySelector("[name='attack-name']")?.value.trim();
      if (name) {
        attacks.push({
          name,
          bonus: row.querySelector("[name='attack-bonus']")?.value || "+0",
          damage: row.querySelector("[name='attack-damage']")?.value || "1d4"
        });
      }
    });
    draft.attacks = attacks.length ? attacks : (draft.attacks || []);

    draft.appearance = {
      hair: form.hair?.value || "",
      eyes: form.eyes?.value || "",
      skin: form.skin?.value || "",
      style: form.style?.value || "",
      notes: form.appearanceNotes?.value || ""
    };
    draft.portrait = state.characterPortraitDraft || draft.portrait || "";
    draft.portraitName = state.characterPortraitDraftName || draft.portraitName || "";
    const packages = startingPackagesForClass(draft.className);
    const selectedStartingId = form.startingPackage?.value || draft.startingChoice?.packageId || "";
    const selectedPackage = selectedStartingPackageFromList(packages, selectedStartingId);
    draft.raceTraits = effectiveRaceTraits(draft);
    if (selectedPackage) {
      const equipmentChoices = {};
      qsa("[name^='equipmentChoice-']", form).forEach((el) => {
        const key = el.name.replace("equipmentChoice-", "");
        if (key) equipmentChoices[key] = el.value;
      });
      const normalizedChoices = normalizeEquipmentChoices(selectedPackage, equipmentChoices);
      const selectedItems = resolveStartingItems(selectedPackage, normalizedChoices);
      draft.startingChoice = {
        packageId: selectedPackage.id,
        name: selectedPackage.name,
        mode: selectedPackage.mode,
        gold: selectedPackage.gold,
        items: selectedItems,
        choices: normalizedChoices,
        approved: true
      };
      draft.inventory = selectedItems;
      draft.gold = Number(selectedPackage.gold || 0);
    } else {
      draft.startingChoice = null;
      draft.inventory = [];
      draft.gold = 0;
    }
    return draft;
  }

  function syncStartingPackageOptions(form) {
    const select = form?.startingPackage;
    if (!select) return [];
    const classId = form.classNameField?.value || "";
    const packages = startingPackagesForClass(classId);
    const current = select.value;
    const nextValue = packages.some((pkg) => pkg.id === current) ? current : "";
    const html = `<option value="">None — pilih package</option>` + packages.map((pkg) => `<option value="${pkg.id}" ${nextValue === pkg.id ? "selected" : ""}>${esc(startingPackageOptionLabel(pkg))}</option>`).join("");
    if (select.dataset.packageHtml !== html) {
      select.innerHTML = html;
      select.dataset.packageHtml = html;
    }
    select.value = nextValue;
    return packages;
  }

  function renderSubraceOptions(raceId, selectedId) {
    if (!raceId) return `<option value="">None — pilih race dulu</option>`;
    const subraces = subracesForRace(raceId);
    if (!subraces.length) return `<option value="">None — race ini tidak punya subrace</option>`;
    const value = subraceById(raceId, selectedId)?.id || "";
    return `<option value="" ${!value ? "selected" : ""}>None — pilih subrace</option>` + subraces.map((subrace) => `<option value="${esc(subrace.id)}" ${value === subrace.id ? "selected" : ""}>${esc(subrace.name)} — ${esc(subrace.abilityText)}</option>`).join("");
  }

  function languageOptionsHtml(baseIds, current) {
    return (DATA.languages || [])
      .filter((lang) => !baseIds.includes(lang.id))
      .map((lang) => `<option value="${esc(lang.id)}" ${current === lang.id ? "selected" : ""}>${esc(lang.name)} (${esc(lang.type)})</option>`)
      .join("");
  }

  function renderLanguageChoiceFields(draft) {
    const raceId = draft.race || "";
    const subraceId = draft.subrace || "";
    if (!raceId) {
      return `<div class="language-auto-box span-12"><strong>Bahasa bawaan</strong><span>Belum ada</span><small>Pilih race dulu. Bahasa bawaan mengikuti aturan D&D 2014 dari race/subrace yang dipilih.</small></div>`;
    }
    const normalized = normalizeLanguageSelection(raceId, subraceId, draft.languageChoices || draft.languages || []);
    const slots = extraLanguageSlots(raceId, subraceId);
    const selects = Array.from({ length: slots }, (_, index) => {
      const current = normalized.extras[index] || "";
      return `<div class="dnd-field"><label>Bahasa tambahan ${index + 1}</label><select name="languageChoices" data-language-slot="${index}"><option value="">None — pilih bahasa</option>${languageOptionsHtml(normalized.baseIds, current)}</select></div>`;
    }).join("");
    const note = raceExtension(raceId).languageNote || "Bahasa membantu komunikasi, membaca teks, negosiasi, dan memahami budaya tertentu.";
    return `
      <div class="language-auto-box span-12">
        <strong>Bahasa bawaan</strong>
        <span>${esc(languageNames(normalized.baseIds) || "Belum ada")}</span>
        <small>${esc(note)}</small>
      </div>
      ${slots ? selects : `<p class="dnd-muted span-12">Ras/subrace ini tidak mendapat pilihan bahasa ekstra dari langkah ras. Bahasa tambahan tetap bisa datang dari Background atau keputusan GM.</p>`}
    `;
  }

  function renderAbilityChoiceFields(draft) {
    const raceId = draft.race || "";
    if (!raceId) return `<div class="race-ability-choice-fields span-12"></div>`;
    const ext = raceExtension(raceId);
    const count = Number(ext.abilityChoiceCount || 0);
    if (!count) return `<div class="race-ability-choice-fields span-12"></div>`;
    const exclude = new Set(ext.abilityChoiceExclude || []);
    const currentChoices = Array.isArray(draft.abilityChoices) ? draft.abilityChoices : [];
    const options = DATA.abilities
      .filter((ability) => !exclude.has(ability.id))
      .map((ability) => `<option value="${esc(ability.id)}">${esc(ability.label)} +${esc(ext.abilityChoiceValue || 1)}</option>`)
      .join("");
    const fields = Array.from({ length: count }, (_, index) => {
      const value = currentChoices[index] || "";
      return `<div class="dnd-field"><label>Bonus ability pilihan ${index + 1}</label><select name="abilityChoices" data-ability-choice-slot="${index}"><option value="">None — pilih ability</option>${options.replace(`value="${value}"`, `value="${value}" selected`)}</select></div>`;
    }).join("");
    return `<div class="race-ability-choice-fields span-12 dnd-form-grid">
      <div class="language-auto-box span-12"><strong>Bonus ability fleksibel</strong><span>${esc(ext.abilityText || "Pilih ability bonus.")}</span><small>Setiap pilihan dihitung ke skor final. Hindari memilih ability yang sama dua kali.</small></div>
      ${fields}
    </div>`;
  }

  function syncRaceDependentFields(form, draft) {
    const subraceSelect = form?.subrace;
    if (subraceSelect) {
      const html = renderSubraceOptions(draft.race, draft.subrace);
      if (subraceSelect.dataset.subraceHtml !== html) {
        subraceSelect.innerHTML = html;
        subraceSelect.dataset.subraceHtml = html;
      }
      subraceSelect.value = draft.subrace || "";
    }
    const languageWrap = qs(".race-language-fields", form);
    if (languageWrap) {
      const html = renderLanguageChoiceFields(draft);
      if (languageWrap.dataset.languageHtml !== html) {
        languageWrap.innerHTML = html;
        languageWrap.dataset.languageHtml = html;
      }
    }
    const abilityChoiceHtml = renderAbilityChoiceFields(draft);
    const abilityChoiceWrap = qs(".race-ability-choice-fields", form);
    if (abilityChoiceWrap) {
      if (abilityChoiceWrap.outerHTML !== abilityChoiceHtml) abilityChoiceWrap.outerHTML = abilityChoiceHtml;
    } else if (abilityChoiceHtml) {
      const languageBlock = qs(".race-language-fields", form);
      if (languageBlock) languageBlock.insertAdjacentHTML("afterend", abilityChoiceHtml);
    }
  }


  function currentCharacterStep() {
    return CHARACTER_STEP_IDS.includes(state.ui.characterStep) ? state.ui.characterStep : "race";
  }

  function preserveCharacterDraftFromForm() {
    const form = qs("#character-form");
    if (!form) return;

    state.ui.characterDraft = characterDraftFromForm(form);
  }

  function setCharacterStep(step) {
    if (!CHARACTER_STEP_IDS.includes(step)) return;
    preserveCharacterDraftFromForm();
    state.ui.characterStep = step;
    saveState(false);
    render();
  }

  function moveCharacterStep(offset) {
    const index = CHARACTER_STEP_IDS.indexOf(currentCharacterStep());
    const next = CHARACTER_STEPS[clamp(index + offset, 0, CHARACTER_STEPS.length - 1)]?.id || "race";
    setCharacterStep(next);
  }

  function renderCharacterStepNav(activeStep) {
    return `<div class="character-step-nav" aria-label="Langkah membuat karakter">
      ${CHARACTER_STEPS.map((step, index) => `<button type="button" class="character-step-pill ${step.id === activeStep ? "active" : ""}" data-action="character-step" data-step="${step.id}"><small>Step ${index + 1}</small><span>${esc(step.title)}</span></button>`).join("")}
    </div>`;
  }

  function renderCharacterStepPanel(stepId, activeStep, title, text, innerHtml) {
    const stepInfo = CHARACTER_STEPS.find((step) => step.id === stepId) || { label: stepId };
    const [stepNumber, ...stepWords] = String(stepInfo.label || stepId).split(" ");
    const stepName = stepWords.join(" ") || stepId;
    return `<section class="character-step-panel ${stepId === activeStep ? "active" : ""}" data-step-panel="${stepId}">
      <div class="character-step-heading"><span class="character-step-badge"><strong>${esc(stepNumber)}</strong><em>${esc(stepName)}</em></span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div></div>
      ${innerHtml}
    </section>`;
  }

  function renderCharacterStepActions(activeStep) {
    const index = CHARACTER_STEP_IDS.indexOf(activeStep);
    const isFirst = index <= 0;
    const isLast = index >= CHARACTER_STEPS.length - 1;
    return `<div class="character-step-actions">
      <button type="button" class="dnd-btn" data-action="character-step-prev" ${isFirst ? "disabled" : ""}>← Sebelumnya</button>
      ${isLast ? `<button type="button" class="dnd-btn primary" data-action="save-character">Simpan character</button>` : `<button type="button" class="dnd-btn primary" data-action="character-step-next">Lanjut →</button>`}
    </div>`;
  }

  function abilityShortText(id) {
    const text = {
      str: "kekuatan fisik, athletics, dorong/angkat, dan serangan berbasis STR di sheet",
      dex: "kelincahan, inisiatif, AC ringan, stealth, akrobatik, dan serangan berbasis DEX di sheet",
      con: "daya tahan, HP, dan Constitution saving throw",
      int: "pengetahuan, arcana, history, investigation, nature, dan religion",
      wis: "perception, insight, survival, medicine, dan kewaspadaan karakter",
      cha: "persuasion, deception, intimidation, performance, dan kekuatan sosial/magic tertentu"
    };
    return text[id] || "ability check dan saving throw sesuai situasi karakter";
  }

  function renderAbilitySummary(draft) {
    const bonuses = effectiveAbilityBonuses(draft);
    return `<div class="guide-summary-grid ability-summary-grid">
      ${DATA.abilities.map((ability) => {
        const baseValue = abilityScoreValue(draft.baseAbilities, ability.id, abilityScoreValue(draft.abilities, ability.id, 0));
        const bonus = Number(bonuses[ability.id] || 0);
        const value = previewAbilityScore(baseValue, bonus);
        return `<span><strong>${esc(ability.label.slice(0, 3).toUpperCase())}</strong><small>${esc(abilityLiveDetailText(baseValue, bonus, "bonus"))}</small></span>`;
      }).join("")}
    </div>`;
  }

  function renderAbilitySnapshotPanel(draft) {
    const bonuses = effectiveAbilityBonuses(draft);
    return `<section class="ability-snapshot-panel" aria-label="Ringkasan skor ability saat ini">
      <div class="ability-snapshot-head">
        <div><strong>Ability aktif karakter</strong><small>Ringkasan skor dari race, subrace, dan bonus pilihan. Input di Step 3 tetap skor dasar, bukan skor final.</small></div>
        <span class="dnd-pill good">D&D 2014</span>
      </div>
      <div class="ability-snapshot-grid">
        ${DATA.abilities.map((ability) => {
          const baseValue = abilityScoreValue(draft.baseAbilities, ability.id, abilityScoreValue(draft.abilities, ability.id, 0));
          const bonus = Number(bonuses[ability.id] || 0);
          const finalValue = previewAbilityScore(baseValue, bonus);
          return `<article class="ability-snapshot-card">
            <strong>${esc(ability.label.slice(0, 3).toUpperCase())}</strong>
            <span>${esc(finalValue)}</span>
            <small>${esc(abilityLiveDetailText(baseValue, bonus))}</small>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }


  function renderStoryGuide(draft) {
    const story = characterStorySummary(draft || {});
    const traitList = Array.isArray(story.traits) ? story.traits.filter(Boolean) : [];
    const blocks = [
      { label: "Personality Traits", value: traitList.length ? traitList.join(" • ") : "Belum dipilih" },
      { label: "Ideal", value: story.ideal || "Belum dipilih" },
      { label: "Bond", value: story.bond || "Belum dipilih" },
      { label: "Flaw", value: story.flaw || "Belum dipilih" }
    ];
    return `<div class="story-guide-grid">
      ${blocks.map((item) => `<div><strong>${esc(item.label)}</strong><small>${esc(item.value)}</small></div>`).join("")}
    </div>`;
  }

  function renderCharacterBuilderGuide(draft, startPackages, selectedStartId, activeStep = currentCharacterStep()) {
    const race = DATA.races.find((r) => r.id === draft.race) || null;
    const subrace = effectiveSubrace(draft);
    const klass = DATA.classes.find((k) => k.id === draft.className) || { name: "Belum dipilih", hitDie: 0, skillPick: 0, saves: [], features: [], description: "Pilih class dulu agar fitur, hit die, saving throws, dan skill proficiency muncul sesuai aturan D&D 2014.", role: "-", primary: "-", armor: "-", weapons: "-" };
    const bg = DATA.backgrounds.find((b) => b.id === draft.background) || { name: "Belum dipilih", description: "Pilih background dulu agar cerita, skill dari background, dan detail roleplay dapat diarahkan." };
    const selectedPackage = selectedStartingPackageFromList(startPackages, selectedStartId);
    const selectedEquipmentItems = selectedPackage ? resolveStartingItems(selectedPackage, draft.startingChoice?.choices || {}) : [];
    const prof = proficiencyBonus(draft.level);
    const hpPreview = draft.className ? computeMaxHp(klass, draft.abilities, draft.level) : 0;
    const skillInfo = skillSelectionBreakdown(draft.skills || [], draft);
    const selectedSkills = DATA.skills.filter((skill) => skillInfo.all.includes(skill.id));
    const skillLimit = (klass.skillPick || 0);
    const stepTitle = CHARACTER_STEPS.find((step) => step.id === activeStep)?.title || "Panduan karakter";

    const raceGuide = `<article class="guide-card guide-card-featured">
      <h4>Step 1 — Pilih Ras: ${esc(effectiveRaceName(draft))}</h4>
      <p>Ras menentukan asal-usul biologis karakter. Dampaknya langsung terasa pada bonus ability, speed, bahasa, indra khusus, trait unik, dan jika tersedia: subrace.</p>
      <p>${esc(race?.description || "Belum ada race yang dipilih.")}</p>
      ${!draft.race ? `<p><strong>Subrace:</strong> Pilih race dulu.</p>` : subrace ? `<p><strong>Subrace:</strong> ${esc(subrace.note || subrace.name)}</p>` : `<p><strong>Subrace:</strong> Belum dipilih atau race ini tidak memakai pilihan subrace.</p>`}
      <div class="guide-two-cols">
        <div><strong>Bonus ability</strong><small>${esc(abilityBonusSummary(draft))}</small></div>
        <div><strong>Skill dari ras</strong><small>${esc((raceExtension(draft.race).automaticSkills || []).map((id) => skillById(id)?.label || id).join(", ") || (raceSkillChoiceCount(draft) ? raceSkillChoiceCount(draft) + " skill bebas" : "0 skill"))}</small></div>
        <div><strong>Speed</strong><small>${esc(effectiveRaceSpeed(draft))} ft</small></div>
        <div><strong>Bahasa karakter</strong><small>${esc(languageNames(draft.languages || []))}</small></div>
        <div><strong>Pilihan bahasa ekstra</strong><small>${esc(extraLanguageSlots(draft.race, draft.subrace))}</small></div>
        <div><strong>Alignment saat ini</strong><small>${esc(draft.alignment || "True Neutral")}</small></div>
      </div>
      <strong>Traits aktif dan fungsinya</strong>
      ${renderTraitGuideList(draft)}
      <p><strong>Kelebihan:</strong> ${esc(race?.pros || "-")}</p>
      <p><strong>Catatan:</strong> ${esc(race?.cons || "-")}</p>
      <strong>Bahasa karakter yang sedang dipilih</strong>
      <p class="dnd-muted">Penjelasan bahasa hanya menampilkan bahasa aktif agar panel kanan tidak jadi daftar panjang.</p>
      ${renderSelectedLanguageGuide(draft)}
    </article>`;

    const classGuide = `<article class="guide-card guide-card-featured">
      <h4>Step 2 — Pilih Kelas: ${esc(klass.name)}</h4>
      <p>Kelas menentukan profesi taktis karakter: cara bertarung, Hit Dice, armor, gear tempur, saving throw, dan fitur utama.</p>
      <p>${esc(klass.description || "Belum ada deskripsi class.")}</p>
      <div class="guide-two-cols">
        <div><strong>Role</strong><small>${esc(klass.role || "-")}</small></div>
        <div><strong>Hit Die</strong><small>d${esc(klass.hitDie)}</small></div>
        <div><strong>Primary</strong><small>${esc(klass.primary || "-")}</small></div>
        <div><strong>Saving Throws</strong><small>${esc((klass.saves || []).map(abilityLabel).join(", ") || "-")}</small></div>
        <div><strong>Armor</strong><small>${esc(klass.armor || "-")}</small></div>
        <div><strong>Gear</strong><small>${esc(klass.weapons || "-")}</small></div>
      </div>
      <strong>Fitur awal</strong>
      ${renderMiniList(klass.features, "Belum ada fitur.")}
    </article>`;

    const abilityGuide = `<article class="guide-card guide-card-featured">
      <h4>Step 3 — Tentukan Skor Kemampuan</h4>
      <p>Enam ability score adalah dasar semua bonus karakter: STR, DEX, CON, INT, WIS, CHA. Karakter baru mulai dari 0; isi skor dasar di kiri, lalu bonus race/subrace dihitung ke skor final.</p>
      ${renderAbilitySummary(draft)}
      <div class="guide-ability-notes">
        ${DATA.abilities.map((ability) => `<p><strong>${esc(ability.label.slice(0, 3).toUpperCase())}</strong> ${esc(abilityShortText(ability.id))}</p>`).join("")}
      </div>
      <div class="guide-two-cols">
        <div><strong>Proficiency Bonus</strong><small>+${esc(prof)}</small></div>
        <div><strong>HP Preview</strong><small>${esc(hpPreview)}</small></div>
        <div><strong>AC Preview</strong><small>${esc(computeAc(draft.inventory || [], draft.abilities || {}))}</small></div>
        <div><strong>Speed</strong><small>${esc(effectiveRaceSpeed(draft))} ft</small></div>
      </div>
      <p><strong>Metode D&D 5E:</strong> player/GM memilih Standard Array atau Roll 4d6 drop lowest, lalu memasang hasilnya lewat dropdown. Input manual dikunci untuk player/GM; hanya Owner yang bisa koreksi manual.</p>
      <p><strong>Catatan:</strong> angka input adalah skor dasar. Bonus ras/subrace dihitung ke skor final, jadi jangan masukkan bonus dua kali.</p>
    </article>`;

    const describeGuide = `<article class="guide-card guide-card-featured">
      <h4>Step 4 — Deskripsikan Karakter</h4>
      <p>Bagian ini membangun identitas naratif: background, alignment, tampilan, dan skill proficiency.</p>
      <div class="guide-two-cols">
        <div><strong>Background</strong><small>${esc(bg.name)}</small></div>
        <div><strong>Alignment</strong><small>${esc(draft.alignment || "-")}</small></div>
        <div><strong>Batas skill class</strong><small>${esc(skillLimit)} skill</small></div>
        <div><strong>Bonus skill ras</strong><small>${esc(skillInfo.raceLimit ? skillInfo.raceLimit + " skill" : "tidak ada")}</small></div>
        <div><strong>Skill aktif</strong><small>${esc(selectedSkills.length)} aktif</small></div>
      </div>
      <p>${esc(bg.description || "Background memberi cerita asal, koneksi sosial, dan biasanya menambah 2 skill proficiency.")}</p>
      ${bg.features ? `<p><strong>Feature:</strong> ${esc(bg.features)}</p>` : ""}
      ${renderStoryGuide(draft)}
      <strong>Alignment yang dipilih</strong>
      <p>${esc(alignmentGuideText(draft.alignment))}</p>
      <strong>Skill yang dipilih</strong>
      ${selectedSkills.length ? `<div class="guide-skill-list">${selectedSkills.map((skill) => {
        const abilityName = abilityLabel(skill.ability);
        const abilityMod = mod(draft.abilities?.[skill.ability]);
        const total = abilityMod + prof;
        return `<div><strong>${esc(skill.label)}</strong><small>${esc(abilityName)} ${signed(abilityMod)} + Prof ${signed(prof)} = ${signed(total)}</small><p>${esc(skillGuideText(skill.id))}</p></div>`;
      }).join("")}</div>` : `<p class="dnd-muted">Belum ada skill dipilih.</p>`}
    </article>`;

    const equipmentGuide = `<article class="guide-card guide-card-featured">
      <h4>Step 5 — Pilih Perlengkapan: ${esc(selectedPackage?.name || "-")}</h4>
      <p>Equipment menentukan aset awal karakter: gear tempur, armor, barang petualangan, uang, dan perlengkapan roleplay.</p>
      <p>${esc(selectedPackage?.notes || "Paket awal menentukan barang pertama karakter.")}</p>
      <div class="guide-two-cols">
        <div><strong>Gold</strong><small>${esc(selectedPackage?.gold || 0)} gp</small></div>
        <div><strong>Jumlah item</strong><small>${esc(selectedEquipmentItems.length)} item</small></div>
        <div><strong>AC setelah item</strong><small>${esc(computeAc(selectedEquipmentItems, draft.abilities || {}))}</small></div>
        <div><strong>Siap simpan</strong><small>${esc((draft.name || "").trim() ? "Ya" : "Nama belum diisi")}</small></div>
      </div>
      <strong>Isi package</strong>
      ${renderMiniList(selectedEquipmentItems.length ? selectedEquipmentItems : [`${selectedPackage?.gold || 0} gp`], "Belum ada item.")}
    </article>`;

    const guideByStep = { race: raceGuide, class: classGuide, abilities: abilityGuide, describe: describeGuide, equipment: equipmentGuide };

    return `
      <div class="guide-sticky-inner">
        <p class="eyebrow">Panduan step aktif</p>
        <h3>${esc(stepTitle)}</h3>
        <p class="dnd-muted">Kiri untuk mengisi, kanan untuk memahami efek pilihan. Ikuti urutan step supaya karakter tidak membingungkan.</p>
        <div class="guide-summary-grid">
          <span><strong>Race</strong><small>${esc(effectiveRaceName(draft))}</small></span>
          <span><strong>Class</strong><small>${esc(klass.name)}</small></span>
          <span><strong>Level</strong><small>${esc(draft.level)}</small></span>
          <span><strong>Alignment</strong><small>${esc(draft.alignment || "True Neutral")}</small></span>
          <span><strong>HP</strong><small>${esc(hpPreview)}</small></span>
        </div>
        <strong class="guide-inline-title">Ability final saat ini</strong>
        ${renderAbilitySummary(draft)}
        ${guideByStep[activeStep] || raceGuide}
      </div>
    `;
  }

  function updateCharacterBuilderGuide() {
    const form = qs("#character-form");
    const panel = qs("#character-builder-guide");
    if (!form || !panel) return;
    const packages = syncStartingPackageOptions(form);
    const selectedStartId = form.startingPackage?.value || "";
    const packageHelp = form.querySelector(".starting-package-help");
    if (packageHelp) packageHelp.outerHTML = renderStartingPackageDetails(packages, selectedStartId, characterDraftFromForm(form).startingChoice?.choices || {});
    const draft = characterDraftFromForm(form);
    syncRaceDependentFields(form, draft);
    const canEditStats = form.dataset.canEditStats !== "0";
    const skillWrap = qs(".class-skill-wrap", form) || qs(".class-skill-grid", form);
    if (skillWrap) skillWrap.outerHTML = renderClassSkillGrid(draft, canEditStats);
    const selectedPackage = selectedStartingPackageFromList(packages, selectedStartId);
    const choiceArea = qs(".starting-equipment-choice-area", form);
    if (choiceArea) choiceArea.outerHTML = renderEquipmentChoiceControls(selectedPackage, draft.startingChoice?.choices || {}, !!form.startingPackage?.disabled);
    state.ui.characterDraft = draft;
    refreshAbilityLiveDisplays(form, draft);
    const snapshot = qs(".ability-snapshot-panel");
    if (snapshot) snapshot.outerHTML = renderAbilitySnapshotPanel(draft);
    panel.innerHTML = renderCharacterBuilderGuide(draft, packages, selectedStartId, currentCharacterStep());
  }

  function refreshAbilityLiveDisplays(form, draft) {
    if (!form || !draft) return;
    const bonuses = effectiveAbilityBonuses(draft);
    DATA.abilities.forEach((ability) => {
      const input = form.querySelector(`[name="ability-${ability.id}"]`);
      const field = input?.closest(".ability-assign-field");
      const hint = field?.querySelector(".ability-final-hint");
      if (!input || !hint) return;
      const baseValue = abilityScoreValue({ [ability.id]: input.value }, ability.id, 0);
      const bonus = Number(bonuses[ability.id] || 0);
      hint.textContent = abilityLiveDetailText(baseValue, bonus);
    });
  }



  function normalizeBackgroundId(backgroundId) {
    const raw = String(backgroundId || "").trim();
    if (!raw) return DATA.backgrounds?.[0]?.id || "acolyte";
    const direct = DATA.backgrounds?.find((b) => b.id === raw);
    if (direct) return direct.id;
    const byName = DATA.backgrounds?.find((b) => String(b.name || "").toLowerCase() === raw.toLowerCase());
    if (byName) return byName.id;
    const slug = raw.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const bySlug = DATA.backgrounds?.find((b) => b.id === slug);
    return bySlug?.id || DATA.backgrounds?.[0]?.id || "acolyte";
  }

  function backgroundStoryTemplate(backgroundId) {
    if (!backgroundId) return { traits: [], ideals: [], bonds: [], flaws: [] };
    const id = normalizeBackgroundId(backgroundId);
    const template = DATA.backgroundStoryTemplates?.[id] || {};
    return {
      traits: Array.isArray(template.traits) ? template.traits : [],
      ideals: Array.isArray(template.ideals) ? template.ideals : [],
      bonds: Array.isArray(template.bonds) ? template.bonds : [],
      flaws: Array.isArray(template.flaws) ? template.flaws : []
    };
  }

  function characterStorySummary(draft) {
    const template = backgroundStoryTemplate(draft?.background);
    const traits = Array.isArray(draft?.personalityTraits) ? draft.personalityTraits : [];
    return {
      traits: [
        traits[0] || template.traits[0] || "",
        traits[1] || template.traits[1] || ""
      ],
      ideal: draft?.ideal || template.ideals[0] || "",
      bond: draft?.bond || template.bonds[0] || "",
      flaw: draft?.flaw || template.flaws[0] || ""
    };
  }

  function renderDatalist(id, values) {
    const list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!id || !list.length) return "";
    return `<datalist id="${esc(id)}">${list.map((value) => `<option value="${esc(value)}"></option>`).join("")}</datalist>`;
  }

  function renderCharacterTab() {
    const user = currentUser();
    if (!user) {
      return `<div class="dnd-section-title"><div><h2>Character Builder</h2><p>Login dulu agar karakter punya owner dan tersimpan di MySQL.</p></div></div>
      <div class="dnd-actions"><button class="dnd-btn primary" data-action="website-login">Login Website</button><button class="dnd-btn" data-action="website-register">Daftar</button></div>`;
    }
    const c = activeCharacter();
    const baseDraft = c || createBlankCharacterDraft();
    const draft = state.ui.characterDraft && (!c || state.ui.characterDraft.id === c.id || !state.ui.characterDraft.id)
      ? { ...baseDraft, ...state.ui.characterDraft, abilities: { ...(baseDraft.abilities || {}), ...(state.ui.characterDraft.abilities || {}) }, appearance: { ...(baseDraft.appearance || {}), ...(state.ui.characterDraft.appearance || {}) }, personalityTraits: [state.ui.characterDraft.personalityTraits?.[0] ?? baseDraft.personalityTraits?.[0] ?? "", state.ui.characterDraft.personalityTraits?.[1] ?? baseDraft.personalityTraits?.[1] ?? ""] }
      : baseDraft;
    const canEditStats = !c || isGm();
    const canManualAbilityInput = userIsOwner(user);
    const canUseAbilityPicker = !c || c?.ownerId === user.id || isGm() || canManualAbilityInput;
    const canEditStarting = !c || isGm() || c?.ownerId === user.id;
    const activeStep = currentCharacterStep();
    const startPackages = startingPackagesForClass(draft.className);
    const selectedStartId = draft.startingChoice?.packageId || "";
    const bgTemplate = backgroundStoryTemplate(draft.background);
    const story = characterStorySummary(draft);
    return `
      <div class="dnd-section-title">
        <div>
          <h2>Character Builder Step-by-Step</h2>
          <p>Buat karakter berurutan: Ras → Kelas → Ability Score → Deskripsi → Equipment. Panel kanan menjelaskan efek pilihan aktif.</p>
        </div>
        <div class="dnd-actions">
          ${c ? `<button class="dnd-btn" data-action="clone-character">Clone Karakter</button>` : ""}
          <button class="dnd-btn" data-action="new-character">Karakter baru</button>
          <button class="dnd-btn primary" data-action="download-pdf">Download PDF</button>
        </div>
      </div>
      ${renderCharacterStepNav(activeStep)}
      ${renderAbilitySnapshotPanel(draft)}
      <div class="character-builder-layout step-builder-layout">
        <div class="dnd-card character-builder-form">
          <form id="character-form" data-character-id="${esc(draft.id || "")}" data-can-edit-stats="${canEditStats ? "1" : "0"}">
            ${renderCharacterStepPanel("race", activeStep, "Pilih Ras", "Ras menentukan asal-usul biologis, bonus ability, speed, bahasa, indra khusus, dan trait unik.", `
              <div class="dnd-form-grid">
                <div class="dnd-field"><label>Nama Karakter</label><input name="characterName" value="${esc(draft.name)}" placeholder="Nama karakter"></div>
                <div class="dnd-field"><label>Race</label><select name="race"><option value="" ${!draft.race ? "selected" : ""}>None — pilih race</option>${DATA.races.map((r) => `<option value="${r.id}" ${draft.race === r.id ? "selected" : ""}>${esc(r.name)}</option>`).join("")}</select></div>
                <div class="dnd-field"><label>Subrace</label><select name="subrace">${renderSubraceOptions(draft.race, draft.subrace)}</select></div>
                <div class="race-language-fields span-12 dnd-form-grid">${renderLanguageChoiceFields(draft)}</div>
                ${renderAbilityChoiceFields(draft)}
              </div>
            `)}

            ${renderCharacterStepPanel("class", activeStep, "Pilih Kelas", "Kelas menentukan profesi taktis, Hit Dice, armor, gear tempur, saving throws, dan fitur bertarung utama.", `
              <div class="dnd-form-grid">
                <div class="dnd-field"><label>Class</label><select name="classNameField"><option value="" ${!draft.className ? "selected" : ""}>None — pilih class</option>${DATA.classes.map((k) => `<option value="${k.id}" ${draft.className === k.id ? "selected" : ""}>${k.name}</option>`).join("")}</select></div>
                <div class="dnd-field"><label>Level</label><input name="level" type="number" min="1" max="20" value="${esc(draft.level)}"></div>

              </div>
            `)}

            ${renderCharacterStepPanel("abilities", activeStep, "Tentukan Skor Kemampuan", "Isi STR, DEX, CON, INT, WIS, dan CHA. Karakter baru mulai dari 0 sampai player memilih metode.", `
              <p class="dnd-muted step-helper-text">Karakter baru dimulai dari 0. Player/GM wajib memilih Standard Array atau Roll 4d6, lalu memasang skor lewat dropdown. Kotak angka dikunci agar tidak ada input manual; Owner tetap bebas koreksi manual.</p>
              <div class="ability-roll-tools ${abilityRollLockedForPlayer() ? "is-locked" : ""}">
                <button type="button" class="dnd-btn primary" data-action="ability-roll-array" data-mode="4d6" ${abilityRollLockedForPlayer() ? "disabled" : ""}>Roll 4d6 drop lowest</button>
                <button type="button" class="dnd-btn" data-action="ability-roll-array" data-mode="standard" ${abilityRollLockedForPlayer() ? "disabled" : ""}>Tampilkan standard array</button>
                ${abilityRollLockedForPlayer() ? `<small class="ability-roll-lock-note">Skor kemampuan sudah ditentukan. Player tidak bisa roll ulang; Owner tetap bisa melakukan koreksi dari akun Owner.</small>` : ""}
                ${renderAbilityRollPool()}
              </div>
              <div class="stat-grid ability-assign-grid">
                ${DATA.abilities.map((a) => {
                  const baseValue = abilityScoreValue(draft.baseAbilities, a.id, abilityScoreValue(draft.abilities, a.id, 0));
                  const bonus = Number(effectiveAbilityBonuses(draft)[a.id] || 0);
                  const finalValue = previewAbilityScore(baseValue, bonus);
                  const maxScore = canManualAbilityInput ? 30 : 20;
                  const manualAttr = canManualAbilityInput ? "" : "readonly data-ability-locked='1'";
                  return `<div class="dnd-field ability-assign-field"><label>${esc(a.label)} <span>skor dasar</span></label><input name="ability-${a.id}" type="number" min="0" max="${maxScore}" inputmode="numeric" value="${esc(baseValue)}" ${manualAttr}>${renderAbilityValuePicker(a.id, canUseAbilityPicker)}<small class="ability-final-hint">${esc(abilityLiveDetailText(baseValue, bonus))}</small><small class="ability-purpose">${esc(abilityShortText(a.id))}</small></div>`;
                }).join("")}
              </div>
            `)}

            ${renderCharacterStepPanel("describe", activeStep, "Deskripsikan Karakter", "Bangun identitas naratif: background, alignment, tampilan, dan skill proficiency.", `
              <div class="dnd-form-grid">
                <div class="dnd-field"><label>Background</label><select name="background"><option value="" ${!draft.background ? "selected" : ""}>None — pilih background</option>${DATA.backgrounds.map((b) => `<option value="${b.id}" ${draft.background === b.id ? "selected" : ""}>${esc(b.name)}</option>`).join("")}</select></div>
                <div class="dnd-field"><label>Alignment</label><select name="alignment"><option value="" ${!draft.alignment ? "selected" : ""}>None — pilih alignment</option>${DATA.alignments.map((a) => `<option value="${a}" ${draft.alignment === a ? "selected" : ""}>${a}</option>`).join("")}</select></div>
                <div class="dnd-field"><label>Inspiration</label><select name="inspiration"><option value="0" ${!draft.inspiration ? "selected" : ""}>No</option><option value="1" ${draft.inspiration ? "selected" : ""}>Yes</option></select></div>
                <div class="dnd-field"><label>Hit Dice Sisa</label><input type="number" name="hitDiceRemaining" value="${esc(draft.hitDiceRemaining || 1)}" min="0" max="${esc(draft.level || 1)}"></div>
                <div class="dnd-field span-12 character-photo-field">
                  <label>Foto karakter <span class="dnd-small-muted">JPG/PNG/JPEG · player max 5 MB · owner bebas sesuai limit server</span></label>
                  <div class="character-photo-row">
                    <div class="character-photo-preview">${(state.characterPortraitDraft || draft.portrait) ? `<img src="${state.characterPortraitDraft || draft.portrait}" alt="Foto karakter">` : `<span>${initials(draft.name || "DR")}</span>`}</div>
                    <input id="characterPortraitInput" type="file" accept="image/png,image/jpeg">
                  </div>
                </div>
              </div>
              <h3 style="margin:1rem 0 .6rem">Personality & Story</h3>
              <p class="dnd-muted step-helper-text">Isi dari kiri, lalu panel kanan hanya menjelaskan pilihan yang aktif. Personality traits dibuat dua kolom sesuai format character sheet.</p>
              <div class="dnd-form-grid story-field-grid">
                <div class="dnd-field"><label>Personality trait 1</label><input name="personalityTrait1" list="story-traits-options" value="${esc(story.traits[0] || "")}" placeholder="Contoh trait dari background"></div>
                <div class="dnd-field"><label>Personality trait 2</label><input name="personalityTrait2" list="story-traits-options" value="${esc(story.traits[1] || "")}" placeholder="Trait kedua"></div>
                <div class="dnd-field"><label>Ideal</label><input name="ideal" list="story-ideals-options" value="${esc(story.ideal)}" placeholder="Prinsip yang dipegang karakter"></div>
                <div class="dnd-field"><label>Bond</label><input name="bond" list="story-bonds-options" value="${esc(story.bond)}" placeholder="Ikatan, janji, tempat, atau orang penting"></div>
                <div class="dnd-field span-12"><label>Flaw</label><input name="flaw" list="story-flaws-options" value="${esc(story.flaw)}" placeholder="Kelemahan karakter yang membuatnya manusiawi"></div>
              </div>
              ${renderDatalist("story-traits-options", bgTemplate.traits)}
              ${renderDatalist("story-ideals-options", bgTemplate.ideals)}
              ${renderDatalist("story-bonds-options", bgTemplate.bonds)}
              ${renderDatalist("story-flaws-options", bgTemplate.flaws)}
              <h3 style="margin:1rem 0 .6rem">Appearance</h3>
              <div class="dnd-form-grid">
                <div class="dnd-field"><label>Rambut</label><input name="hair" value="${esc(draft.appearance?.hair || "")}" placeholder="Hitam, pendek..."></div>
                <div class="dnd-field"><label>Mata</label><input name="eyes" value="${esc(draft.appearance?.eyes || "")}" placeholder="Coklat, tajam..."></div>
                <div class="dnd-field"><label>Kulit</label><input name="skin" value="${esc(draft.appearance?.skin || "")}" placeholder="Sawo matang..."></div>
                <div class="dnd-field"><label>Style</label><input name="style" value="${esc(draft.appearance?.style || "")}" placeholder="Cloak, armor..."></div>
                <div class="dnd-field span-12"><label>Catatan tampilan</label><textarea name="appearanceNotes">${esc(draft.appearance?.notes || "")}</textarea></div>
              </div>
              <h3 style="margin:1rem 0 .35rem">Skill Proficiency</h3>
              <p class="dnd-muted skill-proficiency-note">Pilih skill yang benar-benar dikuasai karakter. Saat dipilih, skill memakai ability modifier + Proficiency Bonus level karakter, dan bonus proficiency hanya dihitung satu kali.</p>
              ${renderClassSkillGrid(draft, canEditStats)}

              ${(() => {
                const klass = DATA.classes.find(k => k.id === draft.className) || {};
                const expertiseCount = Number(klass.expertiseCount || 0);
                if (!expertiseCount) return "";
                const skillInfo = skillSelectionBreakdown(draft.skills || [], draft);
                const selectedSkills = DATA.skills.filter(s => skillInfo.all.includes(s.id));
                const hasTool = klass.tools && klass.tools !== "None";
                const expertiseOptions = [
                  ...selectedSkills.map(s => `<option value="skill:${esc(s.id)}" ${(draft.expertise||[]).includes("skill:"+s.id)?"selected":""}>${esc(s.label)}</option>`),
                  ...(hasTool ? [`<option value="tool:thieves_tools" ${(draft.expertise||[]).includes("tool:thieves_tools")?"selected":""}>Thieves' Tools</option>`] : [])
                ].join("");
                return `<h3 style="margin:1rem 0 .35rem">Expertise</h3>
                <p class="dnd-muted">Pilih ${expertiseCount} skill atau tool untuk mendapat Expertise (double proficiency bonus). Hanya bisa memilih dari 4 skill yang sudah dipilih di atas.</p>
                <div class="dnd-form-grid">
                  ${Array.from({length: expertiseCount}, (_, i) => `<div class="dnd-field"><label>Expertise ${i+1}</label><select name="expertise-${i}">
                    <option value="">— Pilih skill/tool —</option>
                    ${expertiseOptions}
                  </select></div>`).join("")}
                </div>`;
              })()}
            `)}

            ${renderCharacterStepPanel("equipment", activeStep, "Pilih Perlengkapan", "Pilih starting package untuk menentukan barang awal, gold awal, dan ringkasan equipment karakter.", `
              <div class="dnd-form-grid">
                <div class="dnd-field span-12"><label>Starting package</label><select name="startingPackage" ${canEditStarting ? "" : "disabled"}><option value="" ${!selectedStartId ? "selected" : ""}>None — pilih starting package</option>${startPackages.map((pkg) => `<option value="${pkg.id}" ${selectedStartId === pkg.id ? "selected" : ""}>${esc(startingPackageOptionLabel(pkg))}</option>`).join("")}</select>${renderStartingPackageDetails(startPackages, selectedStartId, draft.startingChoice?.choices || {})}</div>
                ${renderEquipmentChoiceControls(selectedStartingPackageFromList(startPackages, selectedStartId), draft.startingChoice?.choices || {}, !canEditStarting)}
              </div>
            `)}
            ${renderCharacterStepActions(activeStep)}


          </form>
        </div>
        <aside class="dnd-card character-builder-guide" id="character-builder-guide">
          ${renderCharacterBuilderGuide(draft, startPackages, selectedStartId, activeStep)}
        </aside>
      </div>
      <div class="dnd-card character-sheet-preview">
        ${c ? renderCharacterSheet(c) : `<div class="map-empty"><div><h3>Preview kosong</h3><p>Buat karakter dulu. Setelah tersimpan, character sheet lengkap tampil di sini dan bisa diunduh PDF.</p></div></div>`}
      </div>
    `;
  }

  function renderCharacterSheet(c) {
    const race = raceById(c.race);
    const klass = classById(c.className);
    const prof = proficiencyBonus(c.level);
    const languages = languageNames(c.languages || normalizeLanguageSelection(c.race, c.subrace, c.languageChoices || []).all);
    return `
      <div class="sheet-header">
        <div class="avatar-medallion">${esc(initials(c.name))}</div>
        <div>
          <h2>${esc(c.name)}</h2>
          <p class="dnd-muted">${esc(effectiveRaceName(c))} ${esc(klass.name)} level ${esc(c.level)} | ${esc(DATA.backgrounds.find(b => b.id === c.background)?.name || c.background)} | ${esc(c.alignment)}</p>
      <div class="dnd-pill-row" style="margin-top:.65rem">
            <span class="dnd-pill good">HP ${esc(c.hpCurrent)}/${esc(c.hpMax)}</span>
            <span class="dnd-pill ${c.inspiration ? "active-inspiration" : ""}" style="cursor:pointer" onclick="toggleInspiration('${c.id}')" title="Klik untuk toggle">Inspiration: ${c.inspiration ? "YES" : "NO"}</span>
            <span class="dnd-pill" style="cursor:pointer" onclick="rollExpression('1d${klass.hitDie}', 'Hit Dice', '${esc(c.name).replace(/'/g, "\\'")}')" title="Klik untuk roll Hit Dice">Hit Dice: ${esc(c.hitDiceRemaining)}/d${esc(klass.hitDie)}</span>
            <span class="dnd-pill">AC ${esc(c.ac)}</span>
            <span class="dnd-pill">Speed ${esc(c.speed)}</span>
            <span class="dnd-pill">Prof +${prof}</span>
            <span class="dnd-pill">Bahasa: ${esc(languages || "Common")}</span>
            <span class="dnd-pill ${c.startingChoice ? "good" : "warn"}">Start: ${esc(c.startingChoice?.name || "belum dipilih")}</span>
            <span class="dnd-pill">${esc(c.gold || 0)} gp</span>
            ${c.requestedLevel ? `<span class="dnd-pill warn">Pending GM approve: level ${esc(c.requestedLevel)}</span>` : ""}
          </div>
        </div>
      </div>
      <h3 style="margin:1rem 0 .55rem">Abilities</h3>
      <div class="stat-grid">
        ${DATA.abilities.map((a) => `<div class="stat-box"><small>${a.label.slice(0, 3)}</small><strong>${esc(c.abilities[a.id])}</strong><span>${signed(mod(c.abilities[a.id]))}</span></div>`).join("")}
      </div>
      <h3 style="margin:1rem 0 .55rem">Skills</h3>
      <div class="dnd-check-grid">
        ${DATA.skills.map((s) => `<div class="compact-row" style="cursor:pointer" onclick="rollExpression('${signed(skillBonus(c, s.id))}', '${s.label} Check', '${esc(c.name).replace(/'/g, "\\'")}')" title="Klik untuk roll skill"><span><strong>${s.label}</strong><small>${abilityLabel(s.ability)}</small></span><span class="dnd-pill ${c.skills.includes(s.id) ? "good" : ""}">${signed(skillBonus(c, s.id))}</span></div>`).join("")}
      </div>
      <div class="dnd-card is-soft attacks-box" style="padding: 1rem; border: 2px solid var(--dnd-border, #ccc); border-radius: 8px;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 8px; text-align: center;">
          <div style="font-size: 0.75rem; font-weight: bold; opacity: 0.8;">NAME</div>
          <div style="font-size: 0.75rem; font-weight: bold; opacity: 0.8;">ATK</div>
          <div style="font-size: 0.75rem; font-weight: bold; opacity: 0.8;">DAMAGE/TYPE</div>
          ${(function() {
            const DND_WEAPONS = {
              "dagger": { dice: "1d4", type: "piercing", finesse: true, thrown: true, category: "simple" },
              "longsword": { dice: "1d8", type: "slashing", versatile: "1d10", category: "martial" },
              "shortsword": { dice: "1d6", type: "piercing", finesse: true, category: "martial" },
              "rapier": { dice: "1d8", type: "piercing", finesse: true, category: "martial" },
              "shortbow": { dice: "1d6", type: "piercing", ranged: true, category: "simple" },
              "longbow": { dice: "1d8", type: "piercing", ranged: true, category: "martial" },
              "hand crossbow": { dice: "1d6", type: "piercing", ranged: true, category: "martial" },
              "light crossbow": { dice: "1d8", type: "piercing", ranged: true, category: "simple" },
              "heavy crossbow": { dice: "1d10", type: "piercing", ranged: true, category: "martial" },
              "mace": { dice: "1d6", type: "bludgeoning", category: "simple" },
              "warhammer": { dice: "1d8", type: "bludgeoning", versatile: "1d10", category: "martial" },
              "greatsword": { dice: "2d6", type: "slashing", category: "martial" },
              "greataxe": { dice: "1d12", type: "slashing", category: "martial" },
              "handaxe": { dice: "1d6", type: "slashing", light: true, thrown: true, category: "simple" },
              "javelin": { dice: "1d6", type: "piercing", thrown: true, category: "simple" },
              "spear": { dice: "1d6", type: "piercing", thrown: true, versatile: "1d8", category: "simple" },
              "quarterstaff": { dice: "1d6", type: "bludgeoning", versatile: "1d8", category: "simple" },
              "scimitar": { dice: "1d6", type: "slashing", finesse: true, light: true, category: "martial" }
            };
            const attacks = [...(c.attacks || [])];
            const existingNames = new Set(attacks.map(a => a.name.toLowerCase()));
            const prof = proficiencyBonus(c.level);
            const strMod = mod(c.abilities.str);
            const dexMod = mod(c.abilities.dex);
            const wStr = (klass.weapons || "").toLowerCase();
            const isProficient = (cat, name) => wStr.includes("all weapons") || wStr.includes("martial weapons") || (wStr.includes("simple weapons") && cat === "simple") || wStr.includes(cat) || wStr.includes(name);

            (c.inventory || []).forEach(item => {
              const name = item.replace(/x\d+$/, "").trim().toLowerCase();
              const wpn = DND_WEAPONS[name];
              if (wpn && !existingNames.has(name)) {
                let useDex = wpn.ranged || (wpn.finesse && dexMod > strMod);
                let statMod = useDex ? dexMod : strMod;
                let atkBonus = statMod + (isProficient(wpn.category, name) ? prof : 0);
                attacks.push({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  bonus: signed(atkBonus),
                  damage: wpn.dice + (statMod !== 0 ? signed(statMod) : "") + " " + wpn.type
                });
                existingNames.add(name);
              }
            });
            c._computedAttacks = attacks; // Simpan sementara untuk dipakai di PDF generator nantinya jika perlu, atau PDF generator panggil ulang logika ini.
            return attacks;
          })().map(atk => `
            <div style="background: rgba(255,255,255,0.08); padding: 6px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; box-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${esc(atk.name)}</div>
            <div style="background: rgba(255,255,255,0.08); padding: 6px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; box-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${esc(atk.bonus)}</div>
            <div style="background: rgba(255,255,255,0.08); padding: 6px; border-radius: 4px; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; box-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${esc(atk.damage)}</div>
          `).join("")}
          ${!(c._computedAttacks || c.attacks || []).length ? `<div style="grid-column: span 3; font-size: 0.85rem; opacity: 0.6; padding: 10px;">Belum ada serangan diinput atau terdeteksi.</div>` : ""}
        </div>
        <div style="text-align: center; margin-top: 12px; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px; color: var(--dnd-highlight, #e6c27a);">ATTACKS & SPELLCASTING</div>
      </div>
      <div class="dnd-grid" style="margin-top:1rem">
        <div class="span-6 dnd-card is-soft">
          <h3>Traits & Features</h3>
          <div class="traits-container" style="font-size:0.8rem; margin-top:0.5rem">
            ${effectiveRaceTraits(c).map(t => `<div class="trait-item"><strong>${esc(t)}:</strong> <span class="dnd-muted">${esc(traitGuideText(t))}</span></div>`).join("")}
            ${klass.features.map(f => `<div class="trait-item"><strong>${esc(f)}:</strong> <span class="dnd-muted">${esc(pdfClassFeatureGuideText(f))}</span></div>`).join("")}
          </div>
        </div>
        <div class="span-6 dnd-card is-soft">
          <h3>Inventory</h3>
          <div class="inventory-container" style="font-size:0.8rem; margin-top:0.5rem">
            <p class="dnd-muted">${esc((c.inventory || []).join(", ") || "Kosong")}</p>
            <p class="dnd-muted" style="margin-top:0.5rem; font-weight:bold">Starting: ${esc(c.startingChoice?.name || "Belum dipilih")} | Gold: ${esc(c.gold || 0)} gp</p>
          </div>
        </div>
        <div class="span-12" style="border: 2px solid var(--dnd-border, #555); border-radius: 8px; padding: 12px; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">
          <div style="border-bottom: 1px solid var(--dnd-border, #555); padding: 6px 0; font-size: 0.85rem; cursor: pointer;" onclick="rollExpression('+${prof}', 'Tool Check', '${esc(c.name).replace(/'/g, "\\'")}')" title="Klik untuk Tool check"><strong>TOOL:</strong> ${esc((c.inventory || []).filter(i => /tool|kit|set/i.test(i)).join(", ") || "-")}</div>
          <div style="border-bottom: 1px solid var(--dnd-border, #555); padding: 6px 0; font-size: 0.85rem;"><strong>LANGUAGE:</strong> ${esc(languages || "Common")}</div>
          <div style="border-bottom: 1px solid var(--dnd-border, #555); padding: 6px 0; font-size: 0.85rem;"><strong>ARMOR PROFICIENCIES:</strong> ${esc(klass.armor || "None")}</div>
          <div style="border-bottom: 1px solid var(--dnd-border, #555); padding: 6px 0; font-size: 0.85rem;"><strong>WEAPON PROFICIENCIES:</strong> ${esc(klass.weapons || "Simple weapons")}</div>
          <div style="padding: 6px 0; font-size: 0.85rem;"><strong>TOOL PROFICIENCIES:</strong> ${esc(klass.tools || "None")}</div>
          <div style="text-align: center; margin-top: 12px; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px; color: var(--dnd-highlight, #e6c27a);">OTHER PROFICIENCIES & LANGUAGES</div>
        </div>
        <div class="span-12 dnd-card is-soft"><h3>Personality & Story</h3><p class="dnd-muted"><strong>Traits:</strong> ${esc((c.personalityTraits || []).filter(Boolean).join(" | ") || "Belum diisi")}</p><p class="dnd-muted"><strong>Ideal:</strong> ${esc(c.ideal || "Belum diisi")}</p><p class="dnd-muted"><strong>Bond:</strong> ${esc(c.bond || "Belum diisi")}</p><p class="dnd-muted"><strong>Flaw:</strong> ${esc(c.flaw || "Belum diisi")}</p></div>
        <div class="span-12 dnd-card is-soft"><h3>Appearance</h3><p class="dnd-muted">${esc([c.appearance?.hair, c.appearance?.eyes, c.appearance?.skin, c.appearance?.style, c.appearance?.notes].filter(Boolean).join("; ") || "Belum diisi")}</p></div>
      </div>
    `;
  }



  function pdfSpellcastingAbilityId(klass) {
    const id = String(klass?.id || "").toLowerCase();
    if (["bard","paladin","sorcerer","warlock"].includes(id)) return "cha";
    if (["cleric","druid","ranger"].includes(id)) return "wis";
    if (id === "wizard") return "int";
    return (klass?.primary || "").toLowerCase().includes("charisma") ? "cha" : (klass?.primary || "").toLowerCase().includes("wisdom") ? "wis" : "int";
  }

  function pdfSpellSlotsSummary(klass, level) {
    const id = String(klass?.id || "").toLowerCase();
    const full = {1:[2],2:[3],3:[4,2],4:[4,3],5:[4,3,2],6:[4,3,3],7:[4,3,3,1],8:[4,3,3,2],9:[4,3,3,3,1],10:[4,3,3,3,2],11:[4,3,3,3,2,1],12:[4,3,3,3,2,1],13:[4,3,3,3,2,1,1],14:[4,3,3,3,2,1,1],15:[4,3,3,3,2,1,1,1],16:[4,3,3,3,2,1,1,1],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,3,1,1,1,1],19:[4,3,3,3,3,2,1,1,1],20:[4,3,3,3,3,2,2,1,1]};
    const half = {2:[2],3:[3],4:[3],5:[4,2],6:[4,2],7:[4,3],8:[4,3],9:[4,3,2],10:[4,3,2],11:[4,3,3],12:[4,3,3],13:[4,3,3,1],14:[4,3,3,1],15:[4,3,3,2],16:[4,3,3,2],17:[4,3,3,3,1],18:[4,3,3,3,1],19:[4,3,3,3,2],20:[4,3,3,3,2]};
    const pact = {1:[1,1],2:[2,1],3:[2,2],4:[2,2],5:[2,3],6:[2,3],7:[2,4],8:[2,4],9:[2,5],10:[2,5],11:[3,5],12:[3,5],13:[3,5],14:[3,5],15:[3,5],16:[3,5],17:[4,5],18:[4,5],19:[4,5],20:[4,5]};
    let slots = [];
    if (id === "warlock") return pact[level] ? `Pact Slots: ${pact[level][0]} slot level ${pact[level][1]} (pulih sesuai pact magic)` : "Tidak ada pact slot level ini.";
    if (["paladin","ranger"].includes(id)) slots = half[level] || [];
    else if ((klass?.features || []).some((f) => /spellcasting/i.test(f))) slots = full[level] || [];
    return slots.length ? slots.map((n, i) => `Lv ${i + 1}: ${n}`).join(" | ") : "Tidak ada slot spell dari class utama pada level ini.";
  }

  function pdfSpellDetail(spell) {
    const key = String(spell?.name || "").toLowerCase();
    const base = { castingTime:"Action", range:"Self/varies", target:"Lihat deskripsi spell", components:"V/S/M sesuai spell", duration:"Instantaneous/varies", description: spell?.notes || "Spell tercatat di daftar class.", higher:"Gunakan slot lebih tinggi hanya jika spell menuliskan efek tambahan." };
    const map = {
      "fire bolt":{castingTime:"1 action",range:"120 feet",target:"1 creature or object",components:"V, S",duration:"Instantaneous",description:"Ranged spell attack yang memberi fire damage pada target yang kena.",higher:"Damage naik pada level karakter tertentu."},
      "mage hand":{castingTime:"1 action",range:"30 feet",target:"Point within range",components:"V, S",duration:"1 minute",description:"Membuat tangan spektral untuk memanipulasi objek ringan dari jarak aman.",higher:"Tidak ada scaling slot."},
      "cure wounds":{castingTime:"1 action",range:"Touch",target:"1 creature touched",components:"V, S",duration:"Instantaneous",description:"Memulihkan HP target berdasarkan die spell dan spellcasting ability.",higher:"Tambah die healing untuk tiap slot di atas level 1."},
      "magic missile":{castingTime:"1 action",range:"120 feet",target:"One or more creatures",components:"V, S",duration:"Instantaneous",description:"Membuat dart force yang otomatis mengenai target sesuai pembagian dart.",higher:"Tambah satu dart untuk tiap slot di atas level 1."},
      "shield":{castingTime:"1 reaction",range:"Self",target:"Self",components:"V, S",duration:"1 round",description:"Menaikkan AC sementara sampai awal giliran berikutnya dan menahan magic missile.",higher:"Tidak ada scaling slot."},
      "bless":{castingTime:"1 action",range:"30 feet",target:"Up to 3 creatures",components:"V, S, M",duration:"Concentration, up to 1 minute",description:"Target menambah d4 ke attack roll dan saving throw selama efek aktif.",higher:"Tambah target untuk tiap slot di atas level 1."},
      "hunter's mark":{castingTime:"1 bonus action",range:"90 feet",target:"1 creature",components:"V",duration:"Concentration, up to 1 hour",description:"Menandai target untuk damage tambahan dan membantu pelacakan target.",higher:"Durasi meningkat pada slot tertentu."},
      "eldritch blast":{castingTime:"1 action",range:"120 feet",target:"1 creature",components:"V, S",duration:"Instantaneous",description:"Ranged spell attack force; jumlah beam naik bersama level karakter.",higher:"Scaling mengikuti level karakter, bukan slot."},
      "fireball":{castingTime:"1 action",range:"150 feet",target:"Point within range",components:"V, S, M",duration:"Instantaneous",description:"Ledakan area; target biasanya melakukan Dexterity save untuk mengurangi fire damage.",higher:"Damage bertambah saat memakai slot lebih tinggi."},
      "counterspell":{castingTime:"1 reaction",range:"60 feet",target:"Creature casting a spell",components:"S",duration:"Instantaneous",description:"Mencoba menghentikan spell yang sedang dirapalkan; spell level tinggi dapat butuh ability check.",higher:"Slot lebih tinggi otomatis menghentikan spell sampai level slot tersebut."}
    };
    return { ...base, ...(map[key] || {}) };
  }

  function pdfSpellsForCharacter(character, klass) {
    const own = Array.isArray(character?.spells) ? character.spells : [];
    const byOwn = own.map((name) => DATA.spells.find((s) => String(s.name).toLowerCase() === String(name).toLowerCase()) || { name, level:"?", school:"Custom", classes:klass?.name || "", notes:"Spell custom dari karakter." });
    if (byOwn.length) return byOwn;
    return DATA.spells.filter((spell) => String(spell.classes || "").toLowerCase().includes(String(klass?.name || "").toLowerCase())).slice(0, 16);
  }

  function mapBlockedTileTypes() {
    return new Set(["wall", "house", "castle", "ruins", "mountain", "deepWater", "water", "tree", "ancientTree", "boulder", "altar", "trap"]);
  }

  function mapCellBlocked(map, x, y) {
    const size = Number(map?.size || 32);
    if (!map || x < 0 || y < 0 || x >= size || y >= size) return true;
    const tile = map.tiles?.[y]?.[x];
    if (mapBlockedTileTypes().has(tile)) return true;
    return (map.features || []).some((feature) => Number(feature.x) === x && Number(feature.y) === y && mapBlockedTileTypes().has(feature.kind));
  }

  function renderMapTokenLayer(map) {
    const size = Number(map?.size || 32);
    const npcTokens = (map?.npcs || []).map((pos) => {
      const npc = state.npcs.find((n) => n.id === pos.npcId) || roomNpcs(state.activeRoomId).find((n) => n.id === pos.npcId);
      const left = ((Number(pos.x || 0) + .5) / size) * 100;
      const top = ((Number(pos.y || 0) + .5) / size) * 100;
      return `<span class="map-image-token npc-token" style="left:${left}%;top:${top}%" title="${esc(npc?.name || "NPC")}">${esc((npc?.name || "N").slice(0, 2).toUpperCase())}</span>`;
    });
    const charTokens = (map?.characters || []).map((pos) => {
      const character = state.characters.find((c) => c.id === pos.characterId);
      if (!character) return "";
      const left = ((Number(pos.x || 0) + .5) / size) * 100;
      const top = ((Number(pos.y || 0) + .5) / size) * 100;
      const mine = characterBelongsToUser(character);
      return `<span class="map-image-token character-token ${mine ? "is-mine" : ""}" style="left:${left}%;top:${top}%" title="${esc(character.name || "Character")}">${esc((character.name || "C").slice(0, 2).toUpperCase())}</span>`;
    });
    return npcTokens.concat(charTokens).join("");
  }

  function renderMapCollisionCells(map) {
    if (!isGm() || !Array.isArray(map?.tiles) || !map.tiles.length) return "";
    const size = Number(map.size || 32);
    const cells = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (mapCellBlocked(map, x, y)) cells.push(`<span class="map-collision-cell" style="left:${(x / size) * 100}%;top:${(y / size) * 100}%;width:${100 / size}%;height:${100 / size}%"></span>`);
      }
    }
    return cells.slice(0, 900).join("");
  }

  function renderImageMapBody(map) {
    const size = Number(map?.size || 32);
    const collisionInfo = map?.collisionSource ? `Collision: ${map.collisionSource}` : "Collision: layer terbuka";
    return `<div class="uploaded-map-wrap ai-grid-map" style="--map-size:${esc(size)}">
      <div class="uploaded-map-stage">
        <img src="${map.image}" alt="${esc(map.name)}">
        <div class="map-vtt-grid" aria-hidden="true"></div>
        <div class="map-collision-layer" aria-hidden="true">${renderMapCollisionCells(map)}</div>
        <div class="map-token-layer" aria-hidden="true">${renderMapTokenLayer(map)}</div>
        <button type="button" id="dnd-image-map-hitbox" class="map-image-hitbox" aria-label="Klik map untuk token room"></button>
      </div>
      <div class="map-help">${isGm() ? "Grid digambar oleh aplikasi, bukan oleh AI. GM klik tile untuk NPC; player klik hanya token miliknya saat giliran aktif." : "Player bisa memindahkan token sendiri hanya saat giliran aktif dari GM."} <small>${esc(collisionInfo)}</small></div>
    </div>`;
  }

  function renderMapTab() {
    const user = currentUser();
    if (!state.activeRoomId && canManageRooms()) {
      ensureGmRoomForMap(false);
    }
    const maps = roomMaps(state.activeRoomId);
    if (!state.activeRoomId) {
      return `<div class="map-empty"><div><h2>Pilih room dulu</h2><p>Map disimpan per room campaign agar lobby tidak tercampur.</p><button class="dnd-btn primary" data-action="tab" data-tab="lobby">Buka Lobby</button></div></div>`;
    }
    if (user && !canManageRooms() && !ownedCharacters().some(characterIsReady)) {
      return `<div class="map-empty"><div><h2>Player wajib buat karakter lengkap dulu</h2><p>Map dikunci sampai karakter disimpan lengkap.</p><button class="dnd-btn primary" data-action="tab" data-tab="character">Buat karakter</button></div></div>`;
    }
    const map = activeMap();
    const mapBody = map?.image
      ? renderImageMapBody(map)
      : map
        ? `<canvas id="dnd-map-canvas" width="960" height="960" aria-label="DnD map canvas"></canvas><div class="map-help">${isGm() ? "Pilih NPC lalu klik tile untuk menaruh token." : "Mode player: map read-only."}</div>`
        : `<div class="map-empty"><div><h3>Belum ada map</h3><p>GM perlu generate atau upload map dulu.</p></div></div>`;
    return `
      <div class="dnd-section-title">
        <div>
          <h2>Battle Map</h2>
          <p>Generate map siap pakai token, upload gambar sendiri, dan kelola NPC/monster dalam panel ringkas.</p>
        </div>
        <div class="dnd-actions">
          <select id="active-map-select" class="dnd-btn">${maps.map((m) => `<option value="${m.id}" ${map?.id === m.id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select>
          ${isGm() ? `<button class="dnd-btn danger" data-action="delete-map">Hapus map</button>` : ""}
        </div>
      </div>
      <div class="map-layout">
        <div class="map-frame">${mapBody}</div>
        <aside class="dnd-card">${renderMapControls(map)}</aside>
      </div>
    `;
  }

  function renderMapControls(map) {
    const selectedStyle = map?.visualStyleId || qs("#mapVisualStyle")?.value || (DATA.mapVisualStyles || [])[0]?.id || "town-square";
    const styleOptions = (DATA.mapVisualStyles || []).map((style) => `<option value="${style.id}" ${selectedStyle === style.id ? "selected" : ""}>${esc(style.name)}</option>`).join("");
    const npcOptions = (DATA.npcTemplates || []).map((npc) => `<option value="${npc.name}">${esc(npc.name)} — ${esc(npc.role || "NPC")}</option>`).join("");
    const roleGuide = (DATA.npcGuideRoles || []).slice(0, 8).map((row) => `<li><strong>${esc(row.role)}</strong><span>${esc(row.use)}</span></li>`).join("");
    const monsterList = (DATA.monsters || []).slice(0, 14).map((monster) => `<li><strong>${esc(monster.name)}</strong><span>${esc(monster.type)} · CR ${esc(monster.cr)} · ${esc(monster.habitat)}</span></li>`).join("");
    const roomNpcList = roomNpcs(state.activeRoomId).map((npc) => `<div class="npc-row"><strong>${esc(npc.name)}</strong><small>${esc(npc.role || "NPC")} · ${esc(npc.note || "Catatan belum diisi")}</small></div>`).join("") || `<p class="dnd-muted">Belum ada NPC di room ini.</p>`;
    const prompt = mapImagePromptFromForm();
    const currentType = map?.type || "town";
    const currentDetail = map?.detail || "high";
    const currentSize = clamp(Number(map?.size || 32), 16, 48);
    const currentAspect = map?.imageAspectRatio || "3:4";
    const currentStyle = (DATA.mapVisualStyles || []).find((item) => item.id === selectedStyle) || (DATA.mapVisualStyles || [])[0] || {};
    const director = window.DND2014_MAP_AI?.preview?.({
      type: currentType,
      detail: currentDetail,
      size: currentSize,
      aspect: currentAspect,
      style: currentStyle,
      seed: map?.seed || "",
      notes: map?.notes || ""
    }) || { score: 85, chips: ["top-down", "gridless base", "VTT grid", "collision-ready"], warning: "Prompt diarahkan agar map lebih besar, gridless, dan jelas.", zones: [], landmarks: [] };

    return `
      ${isGm() ? `
      <div class="map-control-group featured map-generator-card">
        <div class="map-tool-head">
          <div>
            <span class="lobby-kicker">Map Director</span>
            <h3>Generate / Upload Map</h3>
          </div>
          <span class="map-score">${esc(director.score)}%</span>
        </div>
        <div class="map-ai-director">
          <div class="map-ai-chips">${(director.chips || []).map((chip) => `<span>${esc(chip)}</span>`).join("")}</div>
          <p>${esc(director.warning || "Prompt map siap dipakai.")}</p>
        </div>
        <label>Nama map<input id="map-name" value="${esc(map?.name || "Town Square")}" placeholder="Contoh: Raven Gate Plaza"></label>
        <div class="form-grid two compact-map-grid">
          <label>Tipe<select id="map-type"><option value="town" ${currentType === "town" ? "selected" : ""}>Town</option><option value="forest" ${currentType === "forest" ? "selected" : ""}>Forest</option><option value="dungeon" ${currentType === "dungeon" ? "selected" : ""}>Dungeon</option><option value="river" ${currentType === "river" ? "selected" : ""}>River</option><option value="tavern" ${currentType === "tavern" ? "selected" : ""}>Tavern</option></select></label>
          <label>Style AI<select id="mapVisualStyle">${styleOptions}</select></label>
        </div>
        <div class="form-grid three compact-map-grid">
          <label>Detail<select id="map-detail"><option value="balanced" ${currentDetail === "balanced" ? "selected" : ""}>Balanced</option><option value="high" ${currentDetail === "high" ? "selected" : ""}>High</option><option value="cinematic" ${currentDetail === "cinematic" ? "selected" : ""}>Cinematic</option><option value="low" ${currentDetail === "low" ? "selected" : ""}>Low</option></select></label>
          <label>Grid<select id="map-size">${[24,28,32,36,40].map((n) => `<option value="${n}" ${currentSize === n ? "selected" : ""}>${n} x ${n}</option>`).join("")}</select></label>
          <label>Rasio<select id="map-aspect"><option value="1:1" ${currentAspect === "1:1" ? "selected" : ""}>1:1</option><option value="3:4" ${currentAspect === "3:4" ? "selected" : ""}>3:4</option><option value="4:3" ${currentAspect === "4:3" ? "selected" : ""}>4:3</option><option value="9:16" ${currentAspect === "9:16" ? "selected" : ""}>9:16</option><option value="16:9" ${currentAspect === "16:9" ? "selected" : ""}>16:9</option></select></label>
        </div>
        <label>Fokus scene<input id="map-seed" value="${esc(map?.seed || "")}" placeholder="market, bridge, fountain, night"></label>
        <label>Catatan taktis<textarea id="map-notes" rows="3" placeholder="Pintu, cover, choke point, jalur aman, landmark penting.">${esc(map?.notes || "")}</textarea></label>
        <div class="dnd-actions wrap map-action-row">
          <button class="dnd-btn primary" data-action="generate-map">Generate Grid</button>
          <button class="dnd-btn" data-action="generate-map-image">Generate Gambar AI</button>
        </div>
        <label class="upload-box compact-upload">Upload map GM<input id="mapImageUpload" type="file" accept="image/png,image/jpeg,image/webp"></label>
        ${state.mapUploadDraft ? `<div class="upload-preview"><img src="${state.mapUploadDraft}" alt="Preview map"><button class="dnd-btn primary" data-action="use-uploaded-map">Pakai Map Ini</button></div>` : ""}
        <details class="ai-prompt-preview compact-details"><summary>Prompt AI lengkap</summary><p>${esc(prompt)}</p></details>
      </div>
      <div class="map-control-group compact-panel">
        <div class="map-tool-head"><h3>NPC Room</h3><span>${esc(roomNpcs(state.activeRoomId).length)} NPC</span></div>
        <label>Template<select id="npc-template">${npcOptions}</select></label>
        <div class="form-grid two compact-map-grid">
          <label>Nama<input id="npc-name" placeholder="Nama NPC"></label>
          <label>Role<input id="npc-role" placeholder="Guard, Merchant..."></label>
        </div>
        <label>Catatan<textarea id="npc-note" rows="2" placeholder="Motivasi, rahasia, hubungan ke quest."></textarea></label>
        <button class="dnd-btn primary" data-action="add-npc">Tambah NPC</button>
        <details class="compact-details"><summary>Panduan role NPC</summary><ul class="guide-list small">${roleGuide}</ul></details>
      </div>` : ""}
      <div class="map-control-group compact-panel">
        <div class="map-tool-head"><h3>NPC Aktif</h3></div>
        ${roomNpcList}
      </div>
      <details class="map-control-group compact-details monster-compact">
        <summary>Monster List 5E ringkas</summary>
        <ul class="guide-list monster-list">${monsterList}</ul>
      </details>
    `;
  }

  function renderDiceTab() {
    const charOptions = ownedCharacters().map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
    return `
      <div class="dnd-section-title"><div><h2>Dice & Skill Roller</h2><p>Roll animatif untuk d100, d20, dan skill check karakter.</p></div></div>
      <div class="dnd-grid">
        <div class="dnd-card span-5">
          <h3>Dice</h3>
          <div class="dice-stage"><div><div id="dice-face" class="dice-face">${esc(state.ui.diceResult || 20)}</div><p id="dice-label" class="dnd-muted" style="text-align:center;margin:.75rem 0 0">${esc(state.ui.diceLabel || "d20")}</p><p id="dice-detail" class="dice-detail">${esc(state.ui.diceDetail || "single die")}</p></div></div>
          <div class="dnd-actions">${[2,3,4,6,8,10,12,20,100].map((s) => `<button class="dnd-btn primary" data-action="roll-dice" data-sides="${s}" data-label="d${s}">d${s}</button>`).join("")}</div>
          <p class="dnd-muted" style="margin:.75rem 0 0">Dadu lengkap: d2, d3, d4, d6, d8, d10, d12, d20, dan d100 percentile. d100 memakai die puluhan 00,10,20...90 + die satuan 0-9. 00 + 0 = 100.</p>
          <h3 style="margin-top:1rem">Skill Roll</h3>
          <div class="dnd-form-grid">
            <div class="dnd-field"><label>Character</label><select id="skill-character">${charOptions}</select></div>
            <div class="dnd-field"><label>Skill</label><select id="skill-select">${DATA.skills.map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}</select></div>
          </div>
          <button class="dnd-btn good" style="width:100%;margin-top:.75rem" data-action="roll-skill">Roll skill</button>
        </div>
        <div class="dnd-card span-7">
          <h3>Roll Log</h3>
          <div class="roll-log" style="margin-top:.8rem">${state.rollLog.map((r) => `<div class="log-row"><span><strong>${esc(r.label)}</strong><small>${esc(r.detail)} | ${esc(r.user)}</small></span><span class="dnd-pill good">${esc(r.total)}</span></div>`).join("") || `<p class="dnd-muted">Belum ada roll.</p>`}</div>
        </div>
      </div>
    `;
  }

  function renderGmTab() {
    if (!isGm()) {
      return `<div class="map-empty"><div><h2>GM Screen terkunci</h2><p>Login sebagai akun website Owner/Admin untuk menambah stat, approve level, grant item, dan mengatur encounter.</p><button class="dnd-btn primary" data-action="website-login">Login Owner/Admin</button></div></div>`;
    }
    return `
      <div class="dnd-section-title"><div><h2>GM Screen</h2><p>Hanya GM yang bisa mengubah HP, XP, item, kondisi, dan approve level.</p></div></div>

      <div class="dnd-card" style="margin-bottom: 1.5rem">
        <h3>Narasi & Dialog NPC</h3>
        <p class="dnd-muted">Gunakan Voice-to-Text untuk mendikte cerita atau dialog NPC dengan cepat.</p>
        <div class="dnd-field" style="margin-top: 1rem">
          <textarea id="gm-narration-input" placeholder="Tulis atau dikte narasi cerita di sini..."></textarea>
        </div>
        <div class="dnd-actions" style="margin-top: 0.75rem">
          <button id="btn-voice-narration" class="dnd-btn" data-action="gm-voice-narration">🎙️ Voice to Text</button>
          <button class="dnd-btn primary" data-action="gm-send-narration">Kirim ke Log</button>
        </div>
      </div>

      <div class="dnd-grid">
        ${state.characters.map((c) => `
          <div class="dnd-card span-6">
            <h3>${esc(c.name)}</h3>
            <p class="dnd-muted">${esc(effectiveRaceName(c))} ${esc(classById(c.className).name)} Lv ${esc(c.level)} | HP ${esc(c.hpCurrent)}/${esc(c.hpMax)} | XP ${esc(c.xp || 0)}</p>
            <div class="dnd-form-grid" style="margin-top:.8rem">
              <div class="dnd-field"><label>HP delta</label><input id="gm-hp-${c.id}" type="number" value="0"></div>
              <div class="dnd-field"><label>XP delta</label><input id="gm-xp-${c.id}" type="number" value="0"></div>
              <div class="dnd-field"><label>Kondisi</label><input id="gm-condition-${c.id}" placeholder="poisoned, blessed..."></div>
              <div class="dnd-field"><label>Grant item</label><select id="grant-item-${c.id}">${combinedItems().map((item) => `<option>${esc(item.name)}</option>`).join("")}</select></div>
            </div>
            <div class="dnd-actions" style="margin-top:.75rem">
              <button class="dnd-btn primary" data-action="gm-adjust" data-character-id="${c.id}">Apply GM adjust</button>
              <button class="dnd-btn good" data-action="grant-item" data-character-id="${c.id}">Grant item</button>
              ${c.requestedLevel ? `<button class="dnd-btn" data-action="approve-level" data-character-id="${c.id}">Approve level ${esc(c.requestedLevel)}</button>` : ""}
            </div>
          </div>
        `).join("") || `<div class="dnd-card span-12"><p class="dnd-muted">Belum ada karakter player.</p></div>`}
      </div>
    `;
  }

  function renderCompendiumTab() {
    const items = combinedItems();
    return `
      <div class="dnd-section-title"><div><h2>Compendium SRD 5.1</h2><p>Ringkasan rules DnD 2014 berbasis SRD 5.1 CC-BY-4.0, ditulis ulang agar aman untuk website.</p></div></div>
      <div class="dnd-grid">
        <div class="dnd-card span-3">
          <h3>Items</h3>
          <div class="item-list" style="margin-top:.8rem">${items.map((item) => `<div class="compact-row"><span><strong>${esc(item.name)}</strong><small>${esc(item.type)} | ${esc(item.rarity)} | ${esc(item.notes)}</small></span></div>`).join("")}</div>
        </div>
        <div class="dnd-card span-3">
          <h3>Spells</h3>
          <div class="item-list" style="margin-top:.8rem">${DATA.spells.map((spell) => `<div class="compact-row"><span><strong>${esc(spell.name)} ${spell.level === 0 ? "Cantrip" : "Lv " + spell.level}</strong><small>${esc(spell.school)} | ${esc(spell.classes)} | ${esc(spell.notes)}</small></span></div>`).join("")}</div>
        </div>
        <div class="dnd-card span-3">
          <h3>Rules</h3>
          <div class="item-list" style="margin-top:.8rem">${DATA.ruleSections.map((rule) => `<div class="compact-row"><span><strong>${esc(rule.title)}</strong><small>${esc(rule.category)} | ${esc(rule.summary)}</small></span></div>`).join("")}</div>
        </div>
        <div class="dnd-card span-3">
          <h3>Conditions</h3>
          <div class="item-list" style="margin-top:.8rem">${DATA.conditions.map((condition) => `<div class="compact-row"><span><strong>${esc(condition.name)}</strong><small>${esc(condition.summary)}</small></span></div>`).join("")}</div>
        </div>
        <div class="dnd-card span-6">
          <h3>Race & Class</h3>
          <div class="item-list" style="margin-top:.8rem">
            ${DATA.races.map((r) => `<div class="compact-row"><span><strong>${esc(r.name)}</strong><small>${esc(r.ability)} | ${esc(r.traits.join(", "))}</small></span></div>`).join("")}
            ${DATA.classes.map((k) => `<div class="compact-row"><span><strong>${esc(k.name)}</strong><small>Hit die d${esc(k.hitDie)} | Saves ${esc(k.saves.join(", "))} | Skills ${esc(k.skillPick)} | ${esc(k.features.join(", "))}</small></span></div>`).join("")}
          </div>
        </div>
        <div class="dnd-card span-3">
          <h3>NPC / Monsters</h3>
          <div class="item-list" style="margin-top:.8rem">${DATA.npcTemplates.map((npc) => `<div class="compact-row"><span><strong>${esc(npc.name)}</strong><small>${esc(npc.type)} CR ${esc(npc.cr)} | HP ${esc(npc.hp)} AC ${esc(npc.ac)} | ${esc(npc.notes)}</small></span></div>`).join("")}</div>
        </div>
        <div class="dnd-card span-3">
          <h3>Custom Item GM</h3>
          ${isGm() ? `
            <div class="dnd-form-grid" style="margin-top:.8rem">
              <div class="dnd-field"><label>Nama</label><input id="custom-item-name"></div>
              <div class="dnd-field"><label>Type</label><input id="custom-item-type"></div>
              <div class="dnd-field"><label>Rarity</label><input id="custom-item-rarity" value="Common"></div>
              <div class="dnd-field"><label>Weight</label><input id="custom-item-weight" type="number" value="0"></div>
              <div class="dnd-field span-12"><label>Notes</label><textarea id="custom-item-notes"></textarea></div>
            </div>
            <button class="dnd-btn primary" style="width:100%;margin-top:.75rem" data-action="add-custom-item">Tambah item</button>
          ` : `<p class="dnd-muted">Custom item hanya bisa dibuat GM.</p>`}
          <h3 style="margin-top:1rem">Source</h3>
          <div class="item-list">${DATA.ruleSources.map((src) => `<div class="compact-row"><span><strong>${esc(src.name)} ${esc(src.version)}</strong><small>${esc(src.license)} | ${esc(src.url)}</small></span></div>`).join("")}</div>
        </div>
      </div>
    `;
  }

  function renderAiTab() {
    const warnings = auditRules();
    return `
      <div class="dnd-section-title"><div><h2>Rule AI Keeper</h2><p>Helper lokal untuk belajar sistem, menegur GM/player saat ada potensi salah rules, dan membuat bug report.</p></div></div>
      <div class="dnd-grid">
        <div class="dnd-card span-6">
          <h3>Tanya AI rules</h3>
          <div class="dnd-field" style="margin-top:.8rem"><label>Pertanyaan</label><textarea id="ai-question" placeholder="Contoh: kalau orc naik level dan dapat item bagaimana?"></textarea></div>
          <div class="dnd-actions" style="margin-top:.75rem">
            <button class="dnd-btn primary" data-action="ai-ask">Tanya</button>
            <button class="dnd-btn" data-action="ai-audit">Audit rules sekarang</button>
            <button class="dnd-btn" data-action="bug-report">Buat bug report</button>
          </div>
          <pre class="dnd-card is-soft" style="white-space:pre-wrap;margin-top:1rem">${esc(state.ui.aiAnswer || "Belum ada jawaban. AI lokal ini tidak memakai layanan eksternal dan siap disambungkan ke backend kamu nanti.")}</pre>
        </div>
        <div class="dnd-card span-6">
          <h3>Memory & Warnings</h3>
          <div class="dnd-field" style="margin-top:.8rem"><label>Ajari AI tentang campaign</label><textarea id="ai-note" placeholder="Contoh: Kerajaan Asterfall melarang necromancy."></textarea></div>
          <button class="dnd-btn good" style="margin-top:.75rem" data-action="ai-learn">Simpan memory</button>
          <div class="ai-feed" style="margin-top:1rem">${warnings.map(renderWarning).join("") || `<div class="rule-warning"><strong>Tidak ada warning</strong><span>Rule helper tidak melihat masalah besar.</span></div>`}</div>
          <div class="ai-feed" style="margin-top:1rem">${state.aiNotes.map((n) => `<div class="compact-row"><span><strong>${esc(n.user)}</strong><small>${esc(n.text)}</small></span></div>`).join("")}</div>
        </div>
      </div>
    `;
  }

  function renderWarning(w) {
    return `<div class="rule-warning ${w.level === "bad" ? "bad" : ""}"><strong>${w.level === "bad" ? "Pelanggaran" : "Perhatian"}</strong><span>${esc(w.text)}</span></div>`;
  }

  function renderAuthModal() {
    const isRegister = state.ui.authMode === "register";
    return `<div class="modal-backdrop">
      <form class="dnd-modal-card dnd-auth-card" onsubmit="return false">
        <div class="dnd-section-title">
          <div>
            <h2>${isRegister ? "Buat Akun Website" : "Login Website"}</h2>
            <p>Akun dibuat memakai akun website utama. Setelah login, karakter dan save DND tersimpan untuk akun tersebut.</p>
          </div>
          <button class="dnd-btn" type="button" data-action="auth-close">Tutup</button>
        </div>
        <div class="dnd-form-grid">
          ${isRegister ? `<div class="dnd-field span-2"><label>Nama lengkap</label><input id="auth-name" autocomplete="name" placeholder="Nama player" required></div>` : ""}
          <div class="dnd-field"><label>Email website</label><input id="auth-email" type="email" autocomplete="email" placeholder="email@contoh.com" required></div>
          <div class="dnd-field"><label>Password</label><input id="auth-password" type="password" autocomplete="${isRegister ? "new-password" : "current-password"}" placeholder="Minimal 8 karakter" required></div>
        </div>
        <div class="dnd-auth-note">Tidak ada akun terpisah untuk DND. Tombol ini memakai akun website utama, lalu karakter DND tersimpan untuk akun tersebut.</div>
        <button class="dnd-btn primary" style="width:100%;margin-top:1rem" data-action="auth-submit" type="submit">${isRegister ? "Buat akun & login" : "Login website"}</button>
        <button class="dnd-btn" style="width:100%;margin-top:.5rem" data-action="auth-open" data-mode="${isRegister ? "login" : "register"}" type="button">${isRegister ? "Sudah punya akun" : "Belum punya akun? Buat akun"}</button>
      </form>
    </div>`;
  }

  function renderImportModal() {
    return `<div class="modal-backdrop">
      <div class="dnd-modal-card">
        <div class="dnd-section-title"><div><h2>Import save</h2><p>Paste file save yang pernah diexport.</p></div><button class="dnd-btn" data-action="import-close">Tutup</button></div>
        <div class="dnd-field"><label>Data save</label><textarea id="import-save-text" style="min-height:18rem"></textarea></div>
        <button class="dnd-btn primary" style="width:100%;margin-top:1rem" data-action="import-save-apply">Import save</button>
      </div>
    </div>`;
  }

  function renderPdfChoiceModal() {
    const selectedId = state.activeCharacterId || state.characters[0]?.id || "";
    return `<div class="modal-backdrop">
      <div class="dnd-modal-card">
        <div class="dnd-section-title">
          <div><h2>Pilih karakter untuk PDF</h2><p>PDF memakai template ringkas buatan sistem agar tidak kosong, kecil, dan siap print offline.</p></div>
          <button class="dnd-btn" data-action="pdf-close">Tutup</button>
        </div>
        <div class="dnd-field">
          <label>Karakter</label>
          <select id="pdf-character-select">
            ${state.characters.map((c) => `<option value="${esc(c.id)}" ${selectedId === c.id ? "selected" : ""}>${esc(c.name || "Tanpa nama")} - ${esc(effectiveRaceName(c))} ${esc(classById(c.className).name)} Lv ${esc(c.level)}</option>`).join("")}
          </select>
        </div>
        <button class="dnd-btn primary" style="width:100%;margin-top:1rem" data-action="pdf-download-selected">Download PDF karakter ini</button>
      </div>
    </div>`;
  }

  function afterRender() {
    drawMapCanvas();
    bindImageMapPlacement();
    updateCharacterBuilderGuide();
  }

  function bindImageMapPlacement() {
    const hitbox = qs("#dnd-image-map-hitbox");
    const map = activeMap();
    if (!hitbox || !map) return;
    const playerCanClick = !isGm() && !!activeCharacter();
    hitbox.disabled = !(isGm() || playerCanClick);
    hitbox.onclick = function (event) {
      const rect = hitbox.getBoundingClientRect();
      const size = Number(map.size || 32);
      const x = Math.floor((event.clientX - rect.left) / Math.max(1, rect.width) * size);
      const y = Math.floor((event.clientY - rect.top) / Math.max(1, rect.height) * size);
      if (isGm()) placeNpcOnMap(x, y);
      else placeOwnCharacterOnMap(x, y);
    };
  }

  function drawMapCanvas() {
    const canvas = qs("#dnd-map-canvas");
    const map = activeMap();
    if (!canvas || !map) return;
    const ctx = canvas.getContext("2d");
    const size = map.size;
    const tile = canvas.width / size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const type = map.tiles[y][x];
        ctx.fillStyle = DATA.tileColors[type] || "#555";
        ctx.fillRect(x * tile, y * tile, tile + 0.5, tile + 0.5);
        paintTileDetail(ctx, type, x, y, tile, map.seed);
      }
    }
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(canvas.width, i * tile); ctx.stroke();
    }
    (map.features || []).forEach((feature) => paintMapFeature(ctx, feature, tile));
    (map.npcs || []).forEach((pos) => {
      const npc = state.npcs.find((n) => n.id === pos.npcId);
      if (!npc) return;
      const cx = pos.x * tile + tile / 2;
      const cy = pos.y * tile + tile / 2;
      ctx.beginPath();
      ctx.fillStyle = "#8f2e2e";
      ctx.strokeStyle = "#fff1bd";
      ctx.lineWidth = 2;
      ctx.arc(cx, cy, tile * 0.36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff7df";
      ctx.font = `bold ${Math.max(10, tile * 0.28)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials(npc.name), cx, cy);
    });
    (map.characters || []).forEach((pos) => {
      const character = state.characters.find((c) => c.id === pos.characterId);
      if (!character) return;
      const cx = Number(pos.x || 0) * tile + tile / 2;
      const cy = Number(pos.y || 0) * tile + tile / 2;
      ctx.beginPath();
      ctx.fillStyle = characterBelongsToUser(character) ? "#1c7c54" : "#1f4d7a";
      ctx.strokeStyle = "#fff1bd";
      ctx.lineWidth = 2;
      ctx.arc(cx, cy, tile * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff7df";
      ctx.font = `bold ${Math.max(10, tile * 0.25)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials(character.name), cx, cy);
    });
    if (isGm() || activeCharacter()) {
      canvas.onclick = function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / rect.width * size);
        const y = Math.floor((event.clientY - rect.top) / rect.height * size);
        if (isGm()) placeNpcOnMap(x, y);
        else placeOwnCharacterOnMap(x, y);
      };
    }
  }

  function paintTileDetail(ctx, type, x, y, tile, seed) {
    const n = noise(x, y, hashSeed(seed));
    const px = x * tile;
    const py = y * tile;
    ctx.save();
    ctx.globalAlpha = 0.32;
    if (type === "forest" || type === "deepForest") {
      ctx.fillStyle = type === "deepForest" ? "#0d2d1f" : "#194d2e";
      ctx.beginPath();
      ctx.arc(px + tile * (0.35 + n * 0.3), py + tile * 0.42, tile * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(20,80,40,0.7)";
      ctx.beginPath();
      ctx.arc(px + tile * 0.68, py + tile * 0.62, tile * 0.13, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "house" || type === "castle" || type === "ruins") {
      ctx.fillStyle = "rgba(255,245,211,0.28)";
      ctx.fillRect(px + tile * 0.2, py + tile * 0.22, tile * 0.58, tile * 0.5);
      ctx.strokeStyle = "rgba(52,34,23,0.65)";
      ctx.strokeRect(px + tile * 0.24, py + tile * 0.26, tile * 0.5, tile * 0.42);
    } else if (type === "water" || type === "deepWater") {
      ctx.strokeStyle = "rgba(226,244,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(px + tile * 0.15, py + tile * (0.3 + n * 0.3));
      ctx.lineTo(px + tile * 0.85, py + tile * (0.4 + n * 0.3));
      ctx.stroke();
    } else if (type === "road" || type === "bridge") {
      ctx.strokeStyle = type === "bridge" ? "rgba(52,30,17,0.65)" : "rgba(255,224,168,0.22)";
      ctx.lineWidth = Math.max(1, tile * 0.08);
      ctx.beginPath();
      ctx.moveTo(px + tile * 0.08, py + tile * 0.5);
      ctx.lineTo(px + tile * 0.92, py + tile * 0.5);
      ctx.stroke();
    } else if (type === "floor" || type === "stone") {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.strokeRect(px + tile * 0.18, py + tile * 0.18, tile * 0.64, tile * 0.64);
    } else if (type === "mountain" || type === "hill") {
      ctx.fillStyle = "rgba(255,255,255,0.20)";
      ctx.beginPath();
      ctx.moveTo(px + tile * 0.2, py + tile * 0.75);
      ctx.lineTo(px + tile * 0.5, py + tile * 0.22);
      ctx.lineTo(px + tile * 0.8, py + tile * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function paintMapFeature(ctx, feature, tile) {
    const cx = feature.x * tile + tile / 2;
    const cy = feature.y * tile + tile / 2;
    const radius = Math.max(5, tile * 0.33);
    const colorMap = {
      tree: "#0f6a39",
      ancientTree: "#0b3b25",
      boulder: "#9b968c",
      camp: "#c76a32",
      shrine: "#d8bf68",
      inn: "#d78745",
      blacksmith: "#3e3937",
      market: "#d2a24c",
      temple: "#d8d0bd",
      stable: "#8a5d2e",
      gate: "#514239",
      tower: "#7f7c84",
      well: "#5a8ba1",
      trap: "#b74831",
      chest: "#a97632",
      altar: "#80628c",
      ruins: "#8b7a68",
      house: "#a56841",
      castle: "#8d8990"
    };
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = colorMap[feature.kind] || "#f1ca72";
    if (["tree", "ancientTree"].includes(feature.kind)) {
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.16, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a321f";
      ctx.fillRect(cx - radius * 0.16, cy + radius * 0.18, radius * 0.32, radius * 0.7);
    } else if (feature.kind === "boulder") {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.05, radius * 0.72, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (["inn", "blacksmith", "market", "temple", "stable", "house", "castle", "tower", "gate"].includes(feature.kind)) {
      ctx.beginPath();
      ctx.rect(cx - radius, cy - radius * 0.62, radius * 2, radius * 1.25);
      ctx.fill();
      ctx.fillStyle = "rgba(255,245,211,0.42)";
      ctx.fillRect(cx - radius * 0.38, cy - radius * 0.2, radius * 0.76, radius * 0.84);
    } else if (feature.kind === "trap") {
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx + radius, cy + radius);

      ctx.lineTo(cx - radius, cy + radius);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,247,223,0.86)";
    ctx.lineWidth = Math.max(1.2, tile * 0.05);
    ctx.stroke();
    if (tile >= 18) {
      ctx.fillStyle = "#1b120c";
      ctx.font = `bold ${Math.max(8, tile * 0.22)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(feature.symbol || "?"), cx, cy);
    }
    if (tile >= 26) {
      ctx.fillStyle = "rgba(18,12,8,0.78)";
      const label = String(feature.label || "").slice(0, 18);
      const width = Math.min(tile * 4.2, Math.max(tile * 1.6, label.length * tile * 0.22));
      ctx.fillRect(cx - width / 2, cy + radius + 3, width, tile * 0.38);
      ctx.fillStyle = "#fff7df";
      ctx.font = `${Math.max(8, tile * 0.18)}px sans-serif`;
      ctx.fillText(label, cx, cy + radius + tile * 0.2);
    }
    ctx.restore();
  }
  function openRewardModal() {
    if (!isGm()) return toast("Hanya GM yang bisa memberikan reward.");
    if (!state.characters.length) return toast("Belum ada karakter untuk diberi reward.");
    state.ui.showReward = true;
    render();
  }

  function closeRewardModal() {
    state.ui.showReward = false;
    render();
  }

  function applyReward() {
    if (!isGm()) return toast("Hanya GM yang bisa memberikan reward.");
    const characterId = qs("#reward-character")?.value || "";
    const character = state.characters.find((c) => c.id === characterId);
    if (!character) return toast("Pilih karakter dulu.");
    const gold = clamp(qs("#reward-gold")?.value || 0, 0, 999999);
    const item = (qs("#reward-item")?.value || "").trim();
    character.gold = Math.max(0, Number(character.gold || 0) + gold);
    character.inventory = Array.isArray(character.inventory) ? character.inventory : [];
    if (item) character.inventory.push(item);
    character.ac = computeAc(character.inventory, character.abilities || {});
    character.updatedAt = nowIso();
    state.rollLog.unshift({
      id: uid("reward"),
      label: "GM Reward",
      total: gold,
      detail: `${character.name}: +${gold} gp${item ? ", item " + item : ""}`,
      user: currentUser()?.name || "GM",
      createdAt: nowIso()
    });
    state.ui.showReward = false;
    saveState(true);
    render();
    toast("Reward berhasil diberikan.");
  }

  function renderRewardModal() {
    return `
      <div class="modal-backdrop">
        <div class="dnd-modal-card">
          <h2>Grant Reward (GM Only)</h2>
          <p class="dnd-muted" style="margin-bottom:1rem">Pilih karakter dan tentukan reward yang ingin diberikan.</p>
          <div class="dnd-form-grid">
            <div class="dnd-field">
              <label>Pilih Karakter</label>
              <select id="reward-character">
                <option value="">Pilih Karakter</option>
                ${state.characters.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}
              </select>
            </div>
            <div class="dnd-field">
              <label>Gold Reward</label>
              <input id="reward-gold" type="number" value="10" min="0">
            </div>
            <div class="dnd-field span-12">
              <label>Item Reward (Opsional)</label>
              <input id="reward-item" placeholder="Healing Potion, Ring of Protection, Explorer Kit...">
            </div>
          </div>
          <div class="dnd-actions" style="margin-top:1.5rem">
            <button class="dnd-btn primary" data-action="submit-reward">Berikan Reward</button>
            <button class="dnd-btn" data-action="reward-close">Batal</button>
          </div>
        </div>
      </div>
    `;
  }
  function sendGmNarration() {
    const field = qs("#gm-narration-input") || qs("#session-dialogue-text");
    const val = field?.value.trim();
    if (!val) return;

    state.sessionLog.unshift({
      id: uid("log"),
      mode: state.campaign.playMode || "offline",
      voiceExternal: !!state.campaign.voiceExternal,
      platform: state.campaign.voicePlatform || "",
      speaker: "GM / NPC",
      role: "gm",
      text: val,
      characterId: "",
      createdAt: nowIso()
    });

    field.value = "";
    saveState();
    render();
    toast("Narasi dikirim ke log.");
  }
  let recognition = null;
  function toggleVoiceNarration() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast("Browser Anda tidak mendukung Voice-to-Text.");
      return;
    }

    const field = qs("#gm-narration-input") || qs("#session-dialogue-text");
    if (!field) {
      toast("Kolom narasi tidak ditemukan di tab ini.");
      return;
    }

    if (recognition) {
      recognition.stop();
      recognition = null;
      state.ui.isVoiceNarrationActive = false;
      qs("#btn-voice-narration")?.classList.remove("danger");
      toast("Voice-to-Text dimatikan.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        field.value += (field.value ? ' ' : '') + finalTranscript;
      }
    };

    recognition.onstart = () => {
      state.ui.isVoiceNarrationActive = true;
      qs("#btn-voice-narration")?.classList.add("danger");
      toast("Mendengarkan... Silakan bicara.");
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error", event);
      toast("Error suara: " + event.error);
      recognition.stop();
      recognition = null;
      state.ui.isVoiceNarrationActive = false;
      qs("#btn-voice-narration")?.classList.remove("danger");
    };

    recognition.onend = () => {
      recognition = null;
      state.ui.isVoiceNarrationActive = false;
      qs("#btn-voice-narration")?.classList.remove("danger");
    };

    recognition.start();
  }
})();

