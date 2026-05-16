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

              <h3 style="margin:1rem 0 .6rem">Attacks & Spellcasting</h3>
              <p class="dnd-muted">Tambahkan senjata atau spell serangan utama karakter di sini.</p>
              <div id="attacks-input-list">
                ${(draft.attacks || []).map((atk, index) => `
                  <div class="attack-row dnd-form-grid" style="margin-bottom: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.5rem; border-radius: 4px;">
                    <div class="dnd-field"><label>Name</label><input name="attack-name" value="${esc(atk.name)}" placeholder="Longsword"></div>
                    <div class="dnd-field"><label>Atk Bonus</label><input name="attack-bonus" value="${esc(atk.bonus)}" placeholder="+5"></div>
                    <div class="dnd-field"><label>Damage/Type</label><input name="attack-damage" value="${esc(atk.damage)}" placeholder="1d8+3 slashing"></div>
                    <button type="button" class="dnd-btn danger" onclick="this.parentElement.remove()" style="align-self: end; margin-bottom: 0.5rem;">Hapus</button>
                  </div>
                `).join("")}
              </div>
              <button type="button" class="dnd-btn" onclick="const div = document.createElement('div'); div.className='attack-row dnd-form-grid'; div.style='margin-bottom: 0.5rem; background: rgba(0,0,0,0.05); padding: 0.5rem; border-radius: 4px;'; div.innerHTML = \`<div class='dnd-field'><label>Name</label><input name='attack-name' placeholder='Longsword'></div><div class='dnd-field'><label>Atk Bonus</label><input name='attack-bonus' placeholder='+5'></div><div class='dnd-field'><label>Damage/Type</label><input name='attack-damage' placeholder='1d8+3 slashing'></div><button type='button' class='dnd-btn danger' onclick='this.parentElement.remove()' style='align-self: end; margin-bottom: 0.5rem;'>Hapus</button>\`; document.getElementById('attacks-input-list').appendChild(div);">+ Tambah Serangan</button>
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
            <span class="dnd-pill ${c.inspiration ? "active-inspiration" : ""}">Inspiration: ${c.inspiration ? "YES" : "NO"}</span>
            <span class="dnd-pill">Hit Dice: ${esc(c.hitDiceRemaining)}/d${esc(klass.hitDie)}</span>
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
        ${DATA.skills.map((s) => `<div class="compact-row"><span><strong>${s.label}</strong><small>${abilityLabel(s.ability)}</small></span><span class="dnd-pill ${c.skills.includes(s.id) ? "good" : ""}">${signed(skillBonus(c, s.id))}</span></div>`).join("")}
      </div>
      <h3 style="margin:1rem 0 .55rem">Attacks & Spellcasting</h3>
      <div class="dnd-card is-soft attacks-box">
        <table class="attacks-table">
          <thead><tr><th>Name</th><th>Atk Bonus</th><th>Damage/Type</th></tr></thead>
          <tbody>
            ${(c.attacks || []).map(atk => `<tr><td>${esc(atk.name)}</td><td>${esc(atk.bonus)}</td><td>${esc(atk.damage)}</td></tr>`).join("")}
            ${!(c.attacks || []).length ? "<tr><td colspan='3' class='dnd-muted'>Belum ada serangan diinput.</td></tr>" : ""}
          </tbody>
        </table>
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
        <div class="span-12 dnd-card is-soft"><h3>Languages</h3><p class="dnd-muted">${esc(languages || "Common")}</p></div>
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

