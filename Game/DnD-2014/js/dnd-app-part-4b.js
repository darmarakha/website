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

