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
