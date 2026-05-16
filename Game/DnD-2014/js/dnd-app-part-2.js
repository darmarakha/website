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
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    state.campaign.partyLevel = levelStart;
    state.campaign.playMode = room.playMode;
    saveState(true);
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
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    saveState(true);
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
    }
    saveState(true);
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
    }
    saveState(true);
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
    state.ui.tab = "lobby";
    state.campaign.name = room.name;
    saveState(false);
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
    saveState(true);
    render();
    toast("Announcement owner diperbarui.");
  }

  function ownerDatabaseRefresh() {
    if (!userIsOwner(currentUser())) return toast("Hanya Owner yang bisa membuka database panel.");
    saveState(true);
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
    saveState(true);
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
    saveState(true);
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
    saveState(true);
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
    saveState(true);
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
    saveState(true);
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
