

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
    if (state.ui.lobbyInsideRoom && !active) state.ui.lobbyInsideRoom = false;
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
