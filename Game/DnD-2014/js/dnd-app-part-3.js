      ideal: form.ideal?.value.trim() || "",
      bond: form.bond?.value.trim() || "",
      flaw: form.flaw?.value.trim() || "",
      appearance,
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

    section("Attacks & Spellcasting", 230);
    const atkY = 244;
    doc.setDrawColor(80, 80, 80);
    doc.roundedRect(margin, atkY, pageW - margin * 2, 80, 4, 4);
    doc.setFont("helvetica", "bold"); doc.setFontSize(7);
    doc.text("NAME", margin + 10, atkY + 12);
    doc.text("ATK BONUS", margin + 140, atkY + 12);
    doc.text("DAMAGE/TYPE", margin + 240, atkY + 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    (character.attacks || []).slice(0, 4).forEach((atk, i) => {
      const rowY = atkY + 28 + (i * 12);
      doc.text(String(atk.name), margin + 10, rowY);
      doc.text(String(atk.bonus), margin + 140, rowY);
      doc.text(String(atk.damage), margin + 240, rowY);
    });
    if (!(character.attacks || []).length) doc.text("Belum ada serangan diinput.", margin + 10, atkY + 28);

    section("Skills & Saving Throws", 340);
    let y = 358;
    DATA.skills.forEach((skill, i) => {
      const col = i < 9 ? margin : margin + 260;
      const rowY = i < 9 ? y + i * 15 : y + (i - 9) * 15;
      const checked = character.skills.includes(skill.id) ? "[x]" : "[ ]";
      doc.setFont("helvetica", character.skills.includes(skill.id) ? "bold" : "normal");
      doc.setFontSize(8);
      doc.text(`${checked} ${signed(skillBonus(character, skill.id))} ${skill.label}`, col, rowY);
    });
    doc.setFont("helvetica", "normal");
    DATA.abilities.forEach((a, i) => {
      const save = mod(character.abilities[a.id]) + (klass.saves.includes(a.id) ? prof : 0);
      doc.text(`${klass.saves.includes(a.id) ? "[x]" : "[ ]"} ${a.label} Save ${signed(save)}`, margin + 400, 358 + i * 15);
    });

    section("Story", 510);
    box(margin, 524, 255, 44, "Personality Trait 1", character.personalityTraits?.[0] || "");
    box(margin + 270, 524, 255, 44, "Personality Trait 2", character.personalityTraits?.[1] || "");
    box(margin, 576, 165, 44, "Ideal", character.ideal || "");
    box(margin + 180, 576, 165, 44, "Bond", character.bond || "");
    box(margin + 360, 576, 165, 44, "Flaw", character.flaw || "");

    section("Features, Traits, Languages", 648);
    const featuresText = [
      `Race Traits: ${raceTraits.join(", ") || "-"}`,
      `Class Features: ${(klass.features || []).join(", ") || "-"}`,
      `Languages: ${languages || "Common"}`,
      `Starting Package: ${character.startingChoice?.name || "-"}`
    ].join("\n");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(featuresText, pageW - margin * 2), margin, 665);

    section("Equipment", 750);
    const eqText = [`Gold: ${character.gold || 0} gp`, ...(character.inventory || [])].join("; ");
    doc.text(doc.splitTextToSize(eqText || "-", pageW - margin * 2), margin, 768);

    addFooter();

    const writePair = (title, text, x, yPos, width) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text(String(title), x, yPos);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      const lines = doc.splitTextToSize(String(text || "-"), width);
      doc.text(lines, x, yPos + 12);
      return yPos + 16 + lines.length * 10;
    };
    const nextDetailPage = (title) => { doc.addPage(); section(title, 42); return 64; };
    let detailY = nextDetailPage("Features & Traits Detail");
    const featureRows = [
      ...raceTraits.map((trait) => ["Race Trait - " + trait, traitGuideText(trait)]),
      ...(klass.features || []).map((feature) => ["Class Feature - " + feature, pdfClassFeatureGuideText(feature)]),
      ["Languages", languages || "Common"],
      ["Starting Package", `${character.startingChoice?.name || "-"}; Gold ${Number(character.gold || 0)} gp; ${(character.inventory || []).join(", ") || "inventory belum ada"}`]
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

  function skillBonus(character, skillId) {
    const skill = skillById(skillId);
    if (!skill) return 0;
    return mod(character.abilities[skill.ability]) + (character.skills.includes(skillId) ? proficiencyBonus(character.level) : 0);
  }

  function skillGuideText(skillId) {
    const skill = skillById(skillId);
    if (skill?.use) return skill.use;
    return "Membantu pengecekan kemampuan saat situasinya sesuai.";
  }


  function traitGuideText(traitName) {
    const clean = String(traitName || "").replace(/:.*/, "").trim().toLowerCase();
    const guide = DATA.traitDetails || {};
    return guide[clean] || "Trait ini adalah fitur bawaan ras/subrace. Cek kondisi pemakaiannya saat adegan atau combat berlangsung.";
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
    return !!(state.ui.abilityRollLog && !userIsOwner(currentUser()));
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
