window.DND2014_DATA = {
  abilities: [
    { id: "str", label: "Strength" },
    { id: "dex", label: "Dexterity" },
    { id: "con", label: "Constitution" },
    { id: "int", label: "Intelligence" },
    { id: "wis", label: "Wisdom" },
    { id: "cha", label: "Charisma" }
  ],
  skills: [
    { id: "athletics", label: "Athletics", localName: "Atletik", ability: "str", abilityText: "Strength", use: "Memanjat tebing, berenang melawan arus, melompat jauh, Grapple, dan Shove.", note: "Satu-satunya skill berbasis Strength pada aturan dasar 2014." },
    { id: "acrobatics", label: "Acrobatics", localName: "Akrobatik", ability: "dex", abilityText: "Dexterity", use: "Menjaga keseimbangan, salto, bermanuver di ruang sempit, dan melepaskan diri dari Grapple.", note: "Dipakai saat kelincahan tubuh lebih penting daripada kekuatan fisik." },
    { id: "sleightOfHand", label: "Sleight of Hand", localName: "Kecepatan Tangan", ability: "dex", abilityText: "Dexterity", use: "Mencopet barang, menyembunyikan senjata kecil, trik sulap, dan memanipulasi objek kecil dengan halus.", note: "Tidak otomatis membuka kunci kecuali GM mengaitkannya dengan alat tertentu." },
    { id: "stealth", label: "Stealth", localName: "Mengendap-endap", ability: "dex", abilityText: "Dexterity", use: "Bergerak tanpa suara, menyelinap, atau bersembunyi dari musuh agar serangan bisa mendapat Advantage.", note: "Sering dipakai bersama cover, cahaya redup, atau distraksi." },
    { id: "arcana", label: "Arcana", localName: "Pengetahuan Sihir", ability: "int", abilityText: "Intelligence", use: "Mengingat informasi sihir, item magis, simbol mistik, dan dimensi lain atau Planes of Existence.", note: "Bukan untuk merapal spell; ini cek pengetahuan arcane." },
    { id: "history", label: "History", localName: "Sejarah", ability: "int", abilityText: "Intelligence", use: "Mengingat peristiwa bersejarah, kerajaan kuno, perang masa lalu, dan legenda.", note: "Dwarf Stonecunning dapat memberi perlakuan khusus untuk karya batu/bangunan." },
    { id: "investigation", label: "Investigation", localName: "Investigasi", ability: "int", abilityText: "Intelligence", use: "Mencari petunjuk deduktif, tombol rahasia, jebakan tersembunyi, atau menyadari dinding ilusi.", note: "Cocok untuk analisis detail, bukan sekadar melihat sekilas." },
    { id: "nature", label: "Nature", localName: "Ilmu Alam", ability: "int", abilityText: "Intelligence", use: "Mengenali tanaman, hewan, pola cuaca, siklus musim, dan topografi.", note: "Pengetahuan alam berbasis ingatan/teori." },
    { id: "religion", label: "Religion", localName: "Agama & Mitos", ability: "int", abilityText: "Intelligence", use: "Pengetahuan tentang dewa-dewi, sekte, ritual, malaikat, iblis, atau Undead.", note: "Dipakai untuk mengenali tradisi sakral dan simbol keagamaan." },
    { id: "animalHandling", label: "Animal Handling", localName: "Penanganan Hewan", ability: "wis", abilityText: "Wisdom", use: "Menenangkan hewan buas, mengendalikan tunggangan kuda, dan melatih hewan peliharaan.", note: "Mengandalkan intuisi terhadap perilaku hewan." },
    { id: "insight", label: "Insight", localName: "Wawasan / Membaca Orang", ability: "wis", abilityText: "Wisdom", use: "Mendeteksi kebohongan, membaca bahasa tubuh, dan mengetahui niat asli seseorang.", note: "Sering dipakai saat interaksi sosial penting." },
    { id: "medicine", label: "Medicine", localName: "Pengobatan", ability: "wis", abilityText: "Wisdom", use: "Melakukan P3K, menstabilkan rekan pada HP 0, mendiagnosis penyakit, atau mengenali racun.", note: "Berguna walau bukan pengganti healing spell." },
    { id: "perception", label: "Perception", localName: "Persepsi / Kewaspadaan", ability: "wis", abilityText: "Wisdom", use: "Melihat musuh sembunyi, mendengar suara samar, dan menjadi dasar Passive Perception.", note: "Skill yang sangat sering dipakai di meja D&D." },
    { id: "survival", label: "Survival", localName: "Bertahan Hidup", ability: "wis", abilityText: "Wisdom", use: "Melacak jejak kaki, navigasi agar tidak tersesat di alam liar, serta mencari makanan atau air.", note: "Praktis untuk perjalanan dan eksplorasi wilderness." },
    { id: "deception", label: "Deception", localName: "Kebohongan", ability: "cha", abilityText: "Charisma", use: "Berbohong, menipu, menyembunyikan identitas, dan mempertahankan poker face.", note: "Dipakai saat karakter sengaja menyesatkan orang lain." },
    { id: "intimidation", label: "Intimidation", localName: "Intimidasi", ability: "cha", abilityText: "Charisma", use: "Mengancam NPC, interogasi paksa, atau menakut-nakuti lawan.", note: "Half-Orc mendapat skill ini otomatis dari Menacing." },
    { id: "performance", label: "Performance", localName: "Pertunjukan", ability: "cha", abilityText: "Charisma", use: "Bernyanyi, menari, berakting, bermain alat musik, menghibur, atau mengalihkan perhatian.", note: "Cocok untuk karakter panggung dan distraksi sosial." },
    { id: "persuasion", label: "Persuasion", localName: "Persuasi / Bujukan", ability: "cha", abilityText: "Charisma", use: "Membujuk dengan sopan, negosiasi damai, tawar-menawar harga, dan meredakan konflik tanpa kekerasan.", note: "Dipakai saat karakter mencoba meyakinkan tanpa tipu daya/ancaman." }
  ],
  races: [
    { 
      id: "human", 
      name: "Human", 
      speed: 30, 
      ability: "All ability scores +1", 
      traits: ["Versatile", "Extra language"], 
      bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      description: "Ras yang paling ambisius dan beragam di dunia. Mereka memiliki kemauan keras dan kemampuan untuk beradaptasi di lingkungan apapun.",
      pros: "Fleksibel, seimbang di semua stat, memiliki kemauan keras untuk belajar hal baru.",
      cons: "Tidak memiliki kemampuan khusus yang unik seperti ras lain, umur relatif pendek."
    },
    { 
      id: "variant-human", 
      name: "Human (Variant)", 
      speed: 30, 
      ability: "Pilih dua ability berbeda +1; pilih 1 skill bebas; 1 feat", 
      traits: ["Versatile", "Extra language", "Extra Skill", "Feat"], 
      bonuses: {},
      description: "Opsi aturan Human Varian yang populer: lebih fleksibel sejak level 1 karena mendapat pilihan ability, satu skill bebas, dan satu feat.",
      pros: "Sangat fleksibel untuk build tertentu, bisa mengambil skill bebas dan feat sejak level 1.",
      cons: "Menggunakan opsi varian, jadi tetap perlu disetujui GM/table jika campaign membatasi feat level 1."
    },
    { 
      id: "elf", 
      name: "Elf", 
      speed: 30, 
      ability: "Dexterity +2", 
      traits: ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance"], 
      bonuses: { dex: 2 },
      description: "Makhluk gaib yang berumur panjang dan memiliki hubungan erat dengan alam atau sihir murni.",
      pros: "Sangat lincah, penglihatan malam yang tajam, kebal terhadap efek tidur sihir.",
      cons: "Fisik biasanya lebih rapuh dibanding ras petarung, sering dianggap sombong."
    },
    { 
      id: "dwarf", 
      name: "Dwarf", 
      speed: 25, 
      ability: "Constitution +2", 
      traits: ["Darkvision", "Dwarven Resilience", "Stonecunning"], 
      bonuses: { con: 2 },
      description: "Petarung tangguh dan pengrajin ahli yang tinggal di pegunungan atau bawah tanah.",
      pros: "Sangat tahan banting, tahan terhadap racun, ahli dalam bebatuan dan logam.",
      cons: "Langkah kaki lebih lambat (Speed 25), kurang lincah."
    },
    { 
      id: "halfling", 
      name: "Halfling", 
      speed: 25, 
      ability: "Dexterity +2", 
      traits: ["Lucky", "Brave", "Halfling Nimbleness"], 
      bonuses: { dex: 2 },
      description: "Makhluk kecil yang ceria, lincah, dan memiliki keberuntungan luar biasa.",
      pros: "Bisa reroll angka 1 (Lucky), sangat berani, mudah bersembunyi.",
      cons: "Tubuh kecil membatasi penggunaan senjata berat, langkah kaki lambat."
    },
    { 
      id: "dragonborn", 
      name: "Dragonborn", 
      speed: 30, 
      ability: "Strength +2, Charisma +1", 
      traits: ["Draconic ancestry", "Breath weapon", "Damage resistance"], 
      bonuses: { str: 2, cha: 1 },
      description: "Keturunan naga yang memiliki kekuatan fisik hebat dan bisa menyemburkan elemen dari mulutnya.",
      pros: "Kekuatan murni yang masif, memiliki serangan area (Breath), tahan terhadap elemen tertentu.",
      cons: "Penampilan mencolok, sering dicurigai, tidak memiliki penglihatan malam."
    },
    { 
      id: "gnome", 
      name: "Gnome", 
      speed: 25, 
      ability: "Intelligence +2", 
      traits: ["Darkvision", "Gnome Cunning"], 
      bonuses: { int: 2 },
      description: "Penemu jenius atau pengguna sihir kecil yang penuh rasa ingin tahu.",
      pros: "Sangat cerdas, unggul dalam saving throw sihir, pandai dalam investigasi.",
      cons: "Fisik lemah, langkah kaki lambat."
    },
    { 
      id: "half-elf", 
      name: "Half-Elf", 
      speed: 30, 
      ability: "Charisma +2; pilih 2 ability berbeda selain Charisma +1", 
      traits: ["Darkvision", "Fey Ancestry", "Skill Versatility"], 
      bonuses: { cha: 2 },
      description: "Perpaduan keanggunan Elf dan ambisi Human. Sering menjadi diplomat atau pengembara.",
      pros: "Sangat karismatik, ahli dalam banyak skill (bebas pilih), penglihatan malam.",
      cons: "Sering merasa tidak memiliki 'rumah' sejati atau diterima sepenuhnya di kedua ras."
    },
    { 
      id: "half-orc", 
      name: "Half-Orc", 
      speed: 30, 
      ability: "Strength +2, Constitution +1", 
      traits: ["Darkvision", "Relentless Endurance", "Savage Attacks"], 
      bonuses: { str: 2, con: 1 },
      description: "Pejuang yang memiliki semangat tempur tak terpadamkan.",
      pros: "Sulit dijatuhkan (Relentless), damage kritikal sangat besar, fisik luar biasa kuat.",
      cons: "Kurang dalam kemampuan intelektual atau sosial, sering dihakimi karena penampilan."
    },
    { 
      id: "tiefling", 
      name: "Tiefling", 
      speed: 30, 
      ability: "Charisma +2, Intelligence +1", 
      traits: ["Darkvision", "Hellish Resistance", "Infernal Legacy"], 
      bonuses: { cha: 2, int: 1 },
      description: "Manusia dengan garis keturunan neraka, memiliki tanduk dan ekor.",
      pros: "Tahan api (Resistance), memiliki kemampuan sihir bawaan, karisma yang misterius.",
      cons: "Sering mendapatkan stigma negatif dan rasisme in-game."
    }
  ],
  raceExtensions: {
    human: { baseLanguages: ["common"], extraLanguageChoices: 1, abilityText: "Semua 6 ability mendapat +1.", skillChoiceCount: 0, skillRuleNote: "Human biasa tidak mendapat skill proficiency dari ras.", languageNote: "Manusia memakai Common untuk komunikasi umum dan memilih 1 bahasa tambahan sesuai asal daerah, guild, atau cerita karakter.", subraces: [] },
    "variant-human": { baseLanguages: ["common"], extraLanguageChoices: 1, abilityText: "Pilih dua ability yang berbeda, masing-masing +1. Pilih 1 skill bebas dan 1 feat.", abilityChoiceCount: 2, abilityChoiceValue: 1, skillChoiceCount: 1, skillRuleNote: "Variant Human memilih 1 skill bebas dari daftar 18 skill.", languageNote: "Human Varian tetap memakai Common dan memilih 1 bahasa tambahan. Feat dicatat sebagai fitur level 1 sesuai izin GM.", subraces: [] },
    dwarf: { baseLanguages: ["common", "dwarvish"], extraLanguageChoices: 0, skillChoiceCount: 0, skillRuleNote: "Dwarf tidak mendapat skill proficiency dari ras. Stonecunning hanya membantu cek History tentang karya batu/bangunan.", abilityText: "Constitution +2.", languageNote: "Dwarvish sering dipakai untuk urusan klan, tambang, batu, logam, benteng, dan komunikasi antardwarf.", subraces: [
      { id: "hill-dwarf", name: "Hill Dwarf", abilityText: "Wisdom +1", abilityBonuses: { wis: 1 }, speed: 25, traits: ["Dwarven Toughness: HP maksimum bertambah 1 setiap level"], note: "Cocok untuk karakter yang ingin lebih tahan lama dan lebih peka secara Wisdom." },
      { id: "mountain-dwarf", name: "Mountain Dwarf", abilityText: "Strength +2", abilityBonuses: { str: 2 }, speed: 25, traits: ["Dwarven Armor Training: terbiasa dengan light armor dan medium armor"], note: "Cocok untuk karakter dwarf yang ingin terasa lebih prajurit dan kuat secara fisik." }
    ] },
    elf: { baseLanguages: ["common", "elvish"], extraLanguageChoices: 0, automaticSkills: ["perception"], skillChoiceCount: 0, skillRuleNote: "Elf otomatis mahir Perception dari Keen Senses.", abilityText: "Dexterity +2.", languageNote: "Elvish berguna untuk budaya elf, teks kuno, sihir alam, negosiasi dengan elf, dan beberapa lokasi fey/arcane.", subraces: [
      { id: "high-elf", name: "High Elf", abilityText: "Intelligence +1", abilityBonuses: { int: 1 }, speed: 30, extraLanguageChoices: 1, traits: ["Elf Weapon Training", "1 cantrip Wizard", "1 bahasa tambahan"], note: "Cocok untuk karakter elf yang lebih akademis, arcane, atau dekat dengan tradisi sihir." },
      { id: "wood-elf", name: "Wood Elf", abilityText: "Wisdom +1", abilityBonuses: { wis: 1 }, speed: 35, traits: ["Elf Weapon Training", "Fleet of Foot", "Mask of the Wild"], note: "Cocok untuk scout, ranger, druid, atau karakter yang banyak bergerak di alam." },
      { id: "dark-elf", name: "Dark Elf / Drow", abilityText: "Charisma +1", abilityBonuses: { cha: 1 }, speed: 30, traits: ["Superior Darkvision 120 ft", "Sunlight Sensitivity", "Drow Magic", "Drow Weapon Training"], note: "Cocok untuk gaya gelap, intrik, bawah tanah, dan karakter sosial-magis." }
    ] },
    halfling: { baseLanguages: ["common", "halfling"], extraLanguageChoices: 0, skillChoiceCount: 0, skillRuleNote: "Halfling tidak mendapat skill proficiency dari ras; fitur ras utamanya Lucky, Brave, dan Halfling Nimbleness.", abilityText: "Dexterity +2.", languageNote: "Halfling dipakai untuk komunitas halfling, keluarga, pedagang kecil, dan interaksi sosial yang ramah.", subraces: [
      { id: "lightfoot-halfling", name: "Lightfoot Halfling", abilityText: "Charisma +1", abilityBonuses: { cha: 1 }, speed: 25, traits: ["Naturally Stealthy: bisa bersembunyi lebih mudah di balik makhluk yang lebih besar"], note: "Cocok untuk rogue, bard, atau karakter sosial yang lincah." },
      { id: "stout-halfling", name: "Stout Halfling", abilityText: "Constitution +1", abilityBonuses: { con: 1 }, speed: 25, traits: ["Stout Resilience: lebih tahan terhadap racun"], note: "Cocok untuk halfling yang ingin lebih kuat bertahan di garis depan." }
    ] },
    dragonborn: { baseLanguages: ["common", "draconic"], extraLanguageChoices: 0, skillChoiceCount: 0, skillRuleNote: "Dragonborn tidak mendapat skill proficiency dari ras; fitur utamanya Draconic Ancestry, Breath Weapon, dan Damage Resistance.", abilityText: "Strength +2, Charisma +1.", languageNote: "Draconic penting untuk naga, dragonborn, rune kuno, teks arcane tua, dan negosiasi dengan makhluk drakonik.", subraces: [] },
    gnome: { baseLanguages: ["common", "gnomish"], extraLanguageChoices: 0, skillChoiceCount: 0, skillRuleNote: "Gnome tidak mendapat skill proficiency dari ras; Gnome Cunning memberi advantage pada saving throw tertentu melawan sihir.", abilityText: "Intelligence +2.", languageNote: "Gnomish berguna untuk pengetahuan teknis, ilusi, eksperimen, guild inventor, dan komunitas gnome.", subraces: [
      { id: "forest-gnome", name: "Forest Gnome", abilityText: "Dexterity +1", abilityBonuses: { dex: 1 }, speed: 25, traits: ["Natural Illusionist", "Speak with Small Beasts"], note: "Cocok untuk karakter kecil yang licin, ilusionis, dan dekat dengan hutan." },
      { id: "rock-gnome", name: "Rock Gnome", abilityText: "Constitution +1", abilityBonuses: { con: 1 }, speed: 25, traits: ["Artificer's Lore", "Tinker"], note: "Cocok untuk karakter inventor, pembuat alat, dan problem solver teknis." }
    ] },
    "half-elf": { baseLanguages: ["common", "elvish"], extraLanguageChoices: 1, skillChoiceCount: 2, skillRuleNote: "Half-Elf memilih 2 skill bebas dari daftar 18 skill melalui Skill Versatility.", abilityText: "Charisma +2; pilih 2 ability berbeda selain Charisma, masing-masing +1.", abilityChoiceCount: 2, abilityChoiceValue: 1, abilityChoiceExclude: ["cha"], languageNote: "Half-Elf otomatis membawa Common dan Elvish, lalu memilih 1 bahasa tambahan karena hidup di dua budaya.", subraces: [] },
    "half-orc": { baseLanguages: ["common", "orc"], extraLanguageChoices: 0, automaticSkills: ["intimidation"], skillChoiceCount: 0, skillRuleNote: "Half-Orc otomatis mahir Intimidation dari fitur Menacing.", abilityText: "Strength +2, Constitution +1.", languageNote: "Orc berguna untuk negosiasi, intimidasi, perang suku, benteng orc, dan membaca tanda kelompok orc.", subraces: [] },
    tiefling: { baseLanguages: ["common", "infernal"], extraLanguageChoices: 0, skillChoiceCount: 0, skillRuleNote: "Tiefling tidak mendapat skill proficiency dari ras; fitur utamanya Hellish Resistance dan Infernal Legacy.", abilityText: "Charisma +2, Intelligence +1.", languageNote: "Infernal berkaitan dengan kontrak, iblis/devil, ritual gelap, dan teks planar bernuansa hukum/neraka.", subraces: [] }
  },
  languages: [
    { id: "common", name: "Common", type: "Standard", script: "Common", speakers: "manusia, kota besar, pasar, guild, dan kebanyakan NPC", use: "Bahasa paling aman untuk komunikasi harian, jual beli, negosiasi, dan petualangan umum." },
    { id: "dwarvish", name: "Dwarvish", type: "Standard", script: "Dwarvish", speakers: "dwarf, penambang, ahli batu/logam, benteng pegunungan", use: "Berguna untuk reruntuhan dwarf, catatan tambang, senjata, zirah, dan diplomasi klan." },
    { id: "elvish", name: "Elvish", type: "Standard", script: "Elvish", speakers: "elf, half-elf, sarjana kuno, komunitas fey tertentu", use: "Berguna untuk teks kuno, sihir, seni, puisi, dan komunikasi dengan elf atau makhluk fey." },
    { id: "giant", name: "Giant", type: "Standard", script: "Dwarvish", speakers: "giant, ogre, troll, dan makhluk raksasa", use: "Berguna untuk membaca tanda raksasa, intimidasi, atau negosiasi agar tidak langsung jadi menu makan malam." },
    { id: "gnomish", name: "Gnomish", type: "Standard", script: "Dwarvish", speakers: "gnome, inventor, ilusionis, komunitas teknis", use: "Berguna untuk alat rumit, catatan eksperimen, ilusi, teka-teki mesin, dan budaya gnome." },
    { id: "goblin", name: "Goblin", type: "Standard", script: "Dwarvish", speakers: "goblin, hobgoblin, bugbear, kelompok penjarah", use: "Berguna untuk menyadap rencana musuh kecil, membaca peringatan kamp, dan negosiasi cepat." },
    { id: "halfling", name: "Halfling", type: "Standard", script: "Common", speakers: "halfling, pedagang kecil, keluarga pengelana", use: "Berguna untuk komunitas halfling, jaringan rumor ringan, dan hubungan sosial yang ramah." },
    { id: "orc", name: "Orc", type: "Standard", script: "Dwarvish", speakers: "orc dan kelompok perang sejenis", use: "Berguna untuk membaca ancaman, memahami komando perang, dan tawar-menawar dengan suku orc." },
    { id: "abyssal", name: "Abyssal", type: "Exotic", script: "Infernal", speakers: "demon dan makhluk kacau dari jurang", use: "Berguna untuk ritual demonik, kutukan liar, cult, dan ancaman planar yang kacau." },
    { id: "celestial", name: "Celestial", type: "Exotic", script: "Celestial", speakers: "celestial, deva, planetar, solar, dan makhluk suci", use: "Berguna untuk kuil, teks suci, malaikat, sumpah ilahi, dan misi planar baik." },
    { id: "draconic", name: "Draconic", type: "Exotic", script: "Draconic", speakers: "dragon, dragonborn, kobold, sarjana arcane", use: "Berguna untuk naga, rune tua, sihir kuno, ancaman kobold, dan artefak drakonik." },
    { id: "deep-speech", name: "Deep Speech", type: "Exotic", script: "—", speakers: "aberration dan makhluk bawah tanah aneh", use: "Berguna untuk misteri bawah tanah, makhluk psikis/aneh, dan petunjuk horor kosmik." },
    { id: "infernal", name: "Infernal", type: "Exotic", script: "Infernal", speakers: "devil, tiefling, kontrak planar", use: "Berguna untuk kontrak, tipu daya legalistik, ritual neraka, dan negosiasi dengan devil." },
    { id: "primordial", name: "Primordial", type: "Exotic", script: "Dwarvish", speakers: "elemental dan makhluk unsur", use: "Berguna untuk elemen api/air/tanah/udara, reruntuhan elemental, dan fenomena alam ekstrem." },
    { id: "sylvan", name: "Sylvan", type: "Exotic", script: "Elvish", speakers: "fey, dryad, satyr, dan makhluk hutan magis", use: "Berguna untuk hutan mistis, perjanjian fey, teka-teki alam, dan negosiasi dengan makhluk gaib." },
    { id: "undercommon", name: "Undercommon", type: "Exotic", script: "Elvish", speakers: "pedagang dan penghuni dunia bawah", use: "Berguna untuk pasar gelap bawah tanah, drow, duergar, svirfneblin, dan rute bawah permukaan." }
  ],
  classes: [
    { 
      id: "barbarian", 
      name: "Barbarian", 
      hitDie: 12, 
      primary: "Strength", 
      saves: ["str", "con"], 
      skillPick: 2, 
      skillOptions: ["animalHandling", "athletics", "intimidation", "nature", "perception", "survival"], 
      armor: "Light, medium, shields", 
      weapons: "Simple and martial", 
      features: ["Rage", "Unarmored Defense", "Reckless Attack", "Danger Sense"],
      description: "Petarung liar yang mengandalkan kemarahan murni (Rage) untuk menghancurkan musuh dan menahan luka.",
      role: "Tank / Melee DPS"
    },
    { 
      id: "bard", 
      name: "Bard", 
      hitDie: 8, 
      primary: "Charisma", 
      saves: ["dex", "cha"], 
      skillPick: 3, 
      skillOptions: ["*"], 
      armor: "Light", 
      weapons: "Simple, hand crossbow, longsword, rapier, shortsword", 
      features: ["Spellcasting", "Bardic Inspiration", "Jack of All Trades", "Song of Rest"],
      description: "Seniman sihir yang menggunakan musik dan kata-kata untuk menginspirasi kawan atau mengacaukan lawan.",
      role: "Support / Utility / Caster"
    },
    { 
      id: "cleric", 
      name: "Cleric", 
      hitDie: 8, 
      primary: "Wisdom", 
      saves: ["wis", "cha"], 
      skillPick: 2, 
      skillOptions: ["history", "insight", "medicine", "persuasion", "religion"], 
      armor: "Light, medium, shields", 
      weapons: "Simple", 
      features: ["Spellcasting", "Divine Domain", "Channel Divinity", "Destroy Undead"],
      description: "Prajurit suci yang melayani dewa, ahli dalam penyembuhan dan perlindungan.",
      role: "Healer / Support / Tank"
    },
    { 
      id: "druid", 
      name: "Druid", 
      hitDie: 8, 
      primary: "Wisdom", 
      saves: ["int", "wis"], 
      skillPick: 2, 
      skillOptions: ["arcana", "animalHandling", "insight", "medicine", "nature", "perception", "religion", "survival"], 
      armor: "Light, medium, shields", 
      weapons: "Druid weapons", 
      features: ["Spellcasting", "Wild Shape", "Druid Circle"],
      description: "Penjaga alam yang bisa berubah wujud menjadi binatang dan mengendalikan kekuatan elemen.",
      role: "Utility / Caster / Tank (Wild Shape)"
    },
    { 
      id: "fighter", 
      name: "Fighter", 
      hitDie: 10, 
      primary: "Strength or Dexterity", 
      saves: ["str", "con"], 
      skillPick: 2, 
      skillOptions: ["acrobatics", "animalHandling", "athletics", "history", "insight", "intimidation", "perception", "survival"], 
      armor: "All armor, shields", 
      weapons: "Simple and martial", 
      features: ["Fighting Style", "Second Wind", "Action Surge", "Martial Archetype"],
      description: "Ahli senjata dan taktik tempur serba bisa yang mendominasi medan perang.",
      role: "Melee / Ranged DPS / Tank"
    },
    { 
      id: "monk", 
      name: "Monk", 
      hitDie: 8, 
      primary: "Dexterity and Wisdom", 
      saves: ["str", "dex"], 
      skillPick: 2, 
      skillOptions: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"], 
      armor: "None", 
      weapons: "Simple and shortsword", 
      features: ["Unarmored Defense", "Martial Arts", "Ki", "Unarmored Movement"],
      description: "Petarung tangan kosong yang memanfaatkan energi Ki untuk bergerak sangat cepat dan menyerang titik vital.",
      role: "Skirmisher / Melee DPS"
    },
    { 
      id: "paladin", 
      name: "Paladin", 
      hitDie: 10, 
      primary: "Strength and Charisma", 
      saves: ["wis", "cha"], 
      skillPick: 2, 
      skillOptions: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"], 
      armor: "All armor, shields", 
      weapons: "Simple and martial", 
      features: ["Divine Sense", "Lay on Hands", "Divine Smite", "Sacred Oath"],
      description: "Ksatria bersumpah suci yang menggabungkan kekuatan pedang dengan sihir ilahi.",
      role: "Burst DPS / Tank / Support"
    },
    { 
      id: "ranger", 
      name: "Ranger", 
      hitDie: 10, 
      primary: "Dexterity and Wisdom", 
      saves: ["str", "dex"], 
      skillPick: 3, 
      skillOptions: ["animalHandling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"], 
      armor: "Light, medium, shields", 
      weapons: "Simple and martial", 
      features: ["Favored Enemy", "Natural Explorer", "Spellcasting", "Ranger Archetype"],
      description: "Pemburu handal yang ahli dalam bertahan hidup di alam liar dan melacak musuh bebuyutan.",
      role: "Ranged / Melee DPS / Utility"
    },
    { 
      id: "rogue", 
      name: "Rogue", 
      hitDie: 8, 
      primary: "Dexterity", 
      saves: ["dex", "int"], 
      skillPick: 4, 
      skillOptions: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleightOfHand", "stealth"], 
      armor: "Light", 
      weapons: "Simple, hand crossbow, longsword, rapier, shortsword", 
      features: ["Expertise", "Sneak Attack", "Thieves' Cant", "Cunning Action"],
      description: "Ahli menyelinap, membuka kunci, dan memberikan serangan mematikan dari kegelapan.",
      role: "Skill Expert / Burst DPS"
    },
    { 
      id: "sorcerer", 
      name: "Sorcerer", 
      hitDie: 6, 
      primary: "Charisma", 
      saves: ["con", "cha"], 
      skillPick: 2, 
      skillOptions: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"], 
      armor: "None", 
      weapons: "Dagger, dart, sling, quarterstaff, light crossbow", 
      features: ["Spellcasting", "Sorcerous Origin", "Font of Magic", "Metamagic"],
      description: "Pengguna sihir bakat alami yang memiliki kekuatan dari garis keturunan atau kejadian magis.",
      role: "Caster / Burst DPS"
    },
    { 
      id: "warlock", 
      name: "Warlock", 
      hitDie: 8, 
      primary: "Charisma", 
      saves: ["wis", "cha"], 
      skillPick: 2, 
      skillOptions: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"], 
      armor: "Light", 
      weapons: "Simple", 
      features: ["Otherworldly Patron", "Pact Magic", "Eldritch Invocations", "Pact Boon"],
      description: "Pencari kekuatan yang melakukan kontrak dengan makhluk luar angkasa (Patron) untuk mendapatkan sihir.",
      role: "Caster / Utility"
    },
    { 
      id: "wizard", 
      name: "Wizard", 
      hitDie: 6, 
      primary: "Intelligence", 
      saves: ["int", "wis"], 
      skillPick: 2, 
      skillOptions: ["arcana", "history", "insight", "investigation", "medicine", "religion"], 
      armor: "None", 
      weapons: "Dagger, dart, sling, quarterstaff, light crossbow", 
      features: ["Spellcasting", "Arcane Recovery", "Arcane Tradition", "Spell Mastery"],
      description: "Pelajar seni kuno yang menguasai sihir melalui buku mantra dan studi bertahun-tahun.",
      role: "Caster / Crowd Control / Utility"
    }
  ],
  backgrounds: [
    { id: "acolyte", name: "Acolyte", description: "Kamu menghabiskan hidupmu melayani di kuil atau organisasi religius." },
    { id: "charlatan", name: "Charlatan", description: "Kamu adalah penipu ulung yang pandai memanipulasi orang lain." },
    { id: "criminal", name: "Criminal", description: "Kamu memiliki sejarah melanggar hukum dan punya koneksi di dunia hitam." },
    { id: "spy", name: "Spy (Spy Master)", description: "Kamu adalah agen rahasia yang ahli mengumpulkan informasi dan menyamar tanpa terdeteksi.", features: "Criminal Contact / Intelligence Network" },
    { id: "entertainer", name: "Entertainer", description: "Kamu hidup dari tepuk tangan penonton sebagai musisi atau aktor." },
    { id: "folk-hero", name: "Folk Hero", description: "Kamu berasal dari rakyat jelata yang melakukan tindakan heroik di desamu." },
    { id: "guild-artisan", name: "Guild Artisan", description: "Kamu adalah anggota serikat pengrajin yang dihormati." },
    { id: "hermit", name: "Hermit", description: "Kamu hidup mengasingkan diri untuk mencari pencerahan atau menyembunyikan rahasia." },
    { id: "noble", name: "Noble", description: "Kamu berasal dari keluarga kaya dan memiliki pengaruh politik." },
    { id: "outlander", name: "Outlander", description: "Kamu dibesarkan di alam liar dan ahli dalam navigasi medan berat." },
    { id: "sage", name: "Sage", description: "Kamu menghabiskan waktumu belajar di perpustakaan besar atau akademi." },
    { id: "sailor", name: "Sailor", description: "Kamu menghabiskan bertahun-tahun di atas kapal dan memahami rahasia lautan." },
    { id: "soldier", name: "Soldier", description: "Kamu adalah mantan prajurit yang terlatih dalam disiplin militer." },
    { id: "urchin", name: "Urchin", description: "Kamu tumbuh besar di jalanan kota yang keras dan sangat pandai menyelinap." }
  ],
  backgroundStoryTemplates: {
    acolyte: {
      traits: ["Sering memakai perumpamaan ajaran suci saat berbicara.", "Selalu menolong orang yang tampak kehilangan arah.", "Tenang ketika menghadapi hal mistis atau sakral.", "Mudah tersinggung jika keyakinannya diremehkan."],
      ideals: ["Tradisi: aturan lama menjaga masyarakat tetap utuh.", "Kebaikan: menolong sesama lebih penting dari pujian.", "Pengetahuan: kebenaran suci harus dicari dan dipahami."],
      bonds: ["Kuil atau komunitas lama masih menjadi rumah batinmu.", "Kamu menyimpan pesan penting dari gurumu.", "Kamu ingin melindungi orang yang pernah ditolong tempat ibadahmu."],
      flaws: ["Terlalu percaya pada tanda dan ramalan.", "Sulit menerima pandangan yang berbeda.", "Kadang merasa tugas suci membenarkan keputusan keras." ]
    },
    charlatan: {
      traits: ["Cepat membaca kelemahan orang baru.", "Berbicara manis saat butuh jalan keluar.", "Selalu punya cerita cadangan kalau rencana gagal.", "Sulit berhenti memainkan peran."],
      ideals: ["Kebebasan: hidup tidak boleh dikurung aturan orang kuat.", "Kreativitas: akal lebih tajam daripada status.", "Perubahan: setiap identitas bisa dibangun ulang."],
      bonds: ["Ada orang yang pernah kamu tipu dan ingin kamu tebus.", "Kamu menjaga identitas palsu yang sudah menyelamatkanmu.", "Satu rekan lama tahu rahasiamu."],
      flaws: ["Refleks pertama saat terdesak adalah berbohong.", "Terlalu percaya diri dengan rencana sendiri.", "Sulit mempercayai orang lain sepenuhnya." ]
    },
    criminal: {
      traits: ["Berpikir cepat saat melihat celah keamanan.", "Jarang membuka masa lalu kepada orang baru.", "Selalu duduk menghadap pintu keluar.", "Mudah mengenali bahasa isyarat jalanan."],
      ideals: ["Loyalitas: kelompok sendiri harus dilindungi.", "Kebebasan: tidak semua hukum berarti adil.", "Penebusan: masa lalu tidak harus menentukan masa depan."],
      bonds: ["Seseorang di masa lalu masih menunggumu membayar utang budi.", "Kamu menyimpan rahasia jaringan lama.", "Kamu ingin menjauhkan orang tersayang dari hidup lama."],
      flaws: ["Sulit menolak keuntungan cepat.", "Mudah curiga pada otoritas.", "Kadang menyelesaikan masalah tanpa meminta izin party." ]
    },
    spy: {
      traits: ["Tenang saat menyembunyikan informasi.", "Mengamati detail kecil sebelum bicara.", "Punya kebiasaan memakai nama samaran.", "Jarang menjawab langsung jika bisa menguji lawan bicara."],
      ideals: ["Rahasia: informasi yang tepat bisa menyelamatkan banyak orang.", "Keseimbangan: kekuatan besar harus diawasi.", "Tugas: misi lebih penting daripada kenyamanan pribadi."],
      bonds: ["Kamu masih terikat pada jaringan rahasia lama.", "Ada kontak yang keselamatannya bergantung padamu.", "Kamu mencari kebenaran dari laporan yang sengaja ditutup."],
      flaws: ["Terlalu sering merahasiakan hal dari teman sendiri.", "Sulit percaya bahwa orang berkata jujur.", "Kadang menganggap semua hubungan sebagai misi." ]
    },
    entertainer: {
      traits: ["Suka mencairkan suasana dengan humor dan kisah.", "Mengingat wajah penonton lebih baik daripada nama jalan.", "Percaya diri ketika menjadi pusat perhatian.", "Mudah bosan jika perjalanan terlalu sunyi."],
      ideals: ["Keindahan: seni bisa membuat orang bertahan hidup.", "Kebebasan: panggung terbaik adalah jalan terbuka.", "Kegembiraan: tawa adalah hadiah yang berharga."],
      bonds: ["Kamu ingin membuat nama panggungmu dikenal luas.", "Ada rombongan lama yang masih kamu anggap keluarga.", "Satu lagu atau karya menyimpan kenangan penting."],
      flaws: ["Haus pengakuan saat merasa tidak dianggap.", "Kadang mendramatisasi masalah kecil.", "Sulit menolak tantangan yang membuatmu terlihat hebat." ]
    },
    "folk-hero": {
      traits: ["Mudah akrab dengan orang kecil dan pekerja biasa.", "Berani bicara saat melihat ketidakadilan.", "Lebih percaya tindakan nyata daripada gelar.", "Tidak nyaman diperlakukan seperti bangsawan."],
      ideals: ["Keadilan: yang kuat harus melindungi yang lemah.", "Kesederhanaan: asal-usul rendah bukan aib.", "Harapan: satu tindakan baik bisa mengubah desa."],
      bonds: ["Desa asalmu adalah alasan kamu berpetualang.", "Kamu melindungi keluarga yang pernah menyelamatkanmu.", "Kamu ingin membuktikan bahwa rakyat biasa bisa menjadi pahlawan."],
      flaws: ["Terlalu cepat menantang orang berkuasa.", "Sulit meminta bantuan karena ingin terlihat kuat.", "Kadang memikul masalah semua orang sendirian." ]
    },
    "guild-artisan": {
      traits: ["Bangga pada pekerjaan yang rapi dan terukur.", "Menilai orang dari etos kerja dan janji yang ditepati.", "Suka menjelaskan proses pembuatan sesuatu.", "Selalu mencari bahan atau kontak dagang baru."],
      ideals: ["Kualitas: hasil baik membutuhkan kesabaran.", "Komunitas: serikat kuat karena saling menjaga.", "Kemakmuran: kerja ahli layak dihargai."],
      bonds: ["Nama baik serikatmu ikut kamu bawa.", "Kamu punya pelanggan atau mentor yang harus dilindungi.", "Karya terbaikmu belum selesai."],
      flaws: ["Terlalu keras mengkritik pekerjaan buruk.", "Sulit melepas barang buatan sendiri.", "Kadang menilai semua hal dari harga dan manfaat." ]
    },
    hermit: {
      traits: ["Berbicara pelan karena terbiasa sendiri.", "Memperhatikan tanda alam dan perubahan suasana.", "Tidak nyaman di keramaian terlalu lama.", "Sabar menghadapi kesunyian dan perjalanan panjang."],
      ideals: ["Pencerahan: jawaban besar sering muncul dari keheningan.", "Keseimbangan: alam punya ritme yang harus dihormati.", "Rahasia: tidak semua pengetahuan siap dibuka."],
      bonds: ["Kamu membawa penemuan yang belum dimengerti orang lain.", "Tempat pengasinganmu menyimpan rahasia penting.", "Seseorang menunggumu kembali dengan jawaban."],
      flaws: ["Sulit meminta tolong karena terbiasa sendiri.", "Kadang mengabaikan norma sosial.", "Terlalu yakin bahwa firasatmu benar." ]
    },
    noble: {
      traits: ["Terbiasa bicara formal dan percaya diri.", "Menjaga martabat keluarga di depan umum.", "Memperhatikan silsilah, gelar, dan etiket.", "Mudah tersinggung jika diremehkan."],
      ideals: ["Tanggung jawab: status harus dipakai untuk melindungi rakyat.", "Kehormatan: nama keluarga harus dijaga.", "Kekuasaan: pengaruh memberi jalan untuk perubahan."],
      bonds: ["Keluargamu punya musuh politik lama.", "Kamu harus membuktikan diri di luar kenyamanan istana.", "Ada warisan keluarga yang harus kamu pulihkan."],
      flaws: ["Sulit memahami hidup orang biasa.", "Kadang memerintah tanpa mendengar dulu.", "Terlalu takut mempermalukan nama keluarga." ]
    },
    outlander: {
      traits: ["Lebih nyaman tidur di alam terbuka daripada kamar mewah.", "Selalu memperhatikan arah angin dan jejak kecil.", "Berbicara sederhana tetapi langsung.", "Tidak mudah panik saat jauh dari kota."],
      ideals: ["Kebebasan: jalan terbuka lebih jujur daripada tembok kota.", "Alam: tanah dan makhluk hidup harus dihormati.", "Ketahanan: orang kuat bertahan tanpa banyak keluhan."],
      bonds: ["Tanah asalmu memanggilmu kembali.", "Kamu menjaga tradisi suku atau keluarga lama.", "Ada makhluk atau tempat alam yang kamu lindungi."],
      flaws: ["Sulit mengikuti aturan kota.", "Kadang terlalu kasar dalam bicara.", "Mudah meremehkan orang yang hidup nyaman." ]
    },
    sage: {
      traits: ["Suka mengoreksi fakta kecil yang keliru.", "Mencatat hal baru sebelum lupa.", "Lebih antusias pada teka-teki daripada hadiah.", "Kadang tenggelam dalam pikiran sendiri."],
      ideals: ["Pengetahuan: kebenaran harus dicari walau sulit.", "Logika: keputusan baik lahir dari bukti.", "Pengajaran: ilmu menjadi kuat saat dibagikan."],
      bonds: ["Kamu mengejar jawaban dari pertanyaan lama.", "Perpustakaan atau guru lamamu sangat berarti.", "Sebuah buku hilang harus ditemukan."],
      flaws: ["Terlalu penasaran pada hal berbahaya.", "Kadang meremehkan orang yang kurang terpelajar.", "Sulit berhenti meneliti saat situasi mendesak." ]
    },
    sailor: {
      traits: ["Terbiasa bekerja dalam ritme kelompok.", "Membaca cuaca seperti membaca wajah orang.", "Suka cerita perjalanan dan pelabuhan jauh.", "Tidak takut pada perjalanan panjang."],
      ideals: ["Kebebasan: cakrawala selalu menawarkan awal baru.", "Kesetiaan: awak yang baik tidak meninggalkan temannya.", "Keberanian: badai dilewati dengan kepala dingin."],
      bonds: ["Kapal lama atau awak lamamu masih kamu rindukan.", "Kamu punya janji yang dibuat di pelabuhan jauh.", "Laut menyimpan jawaban atas masa lalumu."],
      flaws: ["Susah diam saat merasa dikurung.", "Kadang membawa kebiasaan kasar ke tempat formal.", "Mudah terpancing cerita tantangan perjalanan." ]
    },
    soldier: {
      traits: ["Disiplin saat party butuh rencana jelas.", "Menghormati rantai komando tetapi tetap menilai pemimpin.", "Selalu mengecek posisi kawan sebelum bertindak.", "Sulit santai ketika keadaan tampak terlalu aman."],
      ideals: ["Tugas: janji harus dijalankan sampai selesai.", "Perlindungan: kekuatan ada untuk menjaga yang rentan.", "Kehormatan: kemenangan tanpa prinsip tidak berarti."],
      bonds: ["Kamu masih memegang janji pada rekan lama.", "Nama satu kesatuan lama melekat pada dirimu.", "Kamu ingin memperbaiki kesalahan masa lalu."],
      flaws: ["Kadang terlalu kaku pada perintah.", "Sulit tidur tenang setelah pengalaman buruk.", "Mudah curiga pada strategi yang terlalu nekat." ]
    },
    urchin: {
      traits: ["Cepat membaca suasana jalan dan pasar.", "Tidak suka membuang makanan atau barang berguna.", "Lebih percaya naluri daripada janji manis.", "Mudah menyelinap dalam keramaian tanpa menarik perhatian."],
      ideals: ["Bertahan: hari ini harus dilewati dengan akal sehat.", "Keluarga pilihan: teman seperjuangan lebih berarti dari darah.", "Kesempatan: semua orang pantas mendapat awal baru."],
      bonds: ["Ada anak jalanan atau teman lama yang kamu lindungi.", "Kota tempatmu tumbuh menyimpan banyak kenangan.", "Kamu ingin membuktikan bahwa asal-usulmu bukan batas."],
      flaws: ["Sulit mempercayai bantuan gratis.", "Kadang mengambil keputusan terlalu cepat.", "Mudah menyembunyikan masalah dari teman." ]
    }
  },

  alignments: [
    "Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"
  ],
  alignmentDetails: {
    "lawful good": "Karakter berusaha melakukan hal benar dengan aturan, disiplin, janji, dan struktur sosial. Cocok untuk pelindung, ksatria, hakim, atau healer yang memegang kode moral.",
    "neutral good": "Karakter memprioritaskan kebaikan dan keselamatan orang lain, tetapi tidak selalu terikat aturan resmi. Cocok untuk pahlawan rakyat, penyembuh, atau petualang yang fleksibel.",
    "chaotic good": "Karakter mengejar kebaikan dengan kebebasan pribadi. Ia bisa melanggar aturan yang dianggap menindas demi membantu orang.",
    "lawful neutral": "Karakter percaya pada aturan, tradisi, kontrak, atau hierarki, tanpa otomatis berpihak pada baik atau jahat. Cocok untuk prajurit disiplin, hakim dingin, atau birokrat tegas.",
    "true neutral": "Karakter menjaga keseimbangan atau bertindak pragmatis sesuai situasi. Tidak ekstrem pada aturan, kebebasan, kebaikan, atau kejahatan.",
    "chaotic neutral": "Karakter sangat menghargai kebebasan dan dorongan pribadi. Ia tidak selalu jahat, tetapi sulit ditebak dan tidak suka dikekang aturan.",
    "lawful evil": "Karakter mengejar kepentingan sendiri melalui aturan, kontrak, hierarki, atau kuasa resmi. Cocok untuk penjahat terorganisir atau bangsawan manipulatif.",
    "neutral evil": "Karakter mementingkan keuntungan pribadi tanpa peduli aturan atau kebebasan orang lain. Ia akan mengambil jalan aman yang paling menguntungkan dirinya.",
    "chaotic evil": "Karakter mengikuti hasrat destruktif, kekerasan, atau kekacauan. Biasanya dipakai untuk villain/NPC, bukan pilihan aman untuk party pemula."
  },
  traitDetails: {
    "versatile": "Human fleksibel dan mudah masuk ke hampir semua class. Dalam aplikasi ini ditunjukkan lewat bonus ability merata dan pilihan bahasa tambahan.",
    "extra language": "Karakter mendapat satu bahasa tambahan. Pilih bahasa yang sesuai asal, guild, mentor, musuh utama, atau lokasi campaign.",
    "darkvision": "Bisa melihat di area gelap dalam jarak tertentu seolah cahaya redup. Berguna untuk dungeon, gua, malam hari, dan penyergapan.",
    "keen senses": "Mendapat proficiency Perception. Membantu melihat jebakan, mendengar musuh, dan menyadari bahaya lebih cepat.",
    "fey ancestry": "Mendapat advantage terhadap efek charmed dan tidak bisa ditidurkan oleh magic sleep. Sangat berguna melawan sihir kontrol.",
    "trance": "Elf tidak tidur normal; cukup bermeditasi sekitar 4 jam untuk mendapat manfaat istirahat panjang sesuai aturan meja.",
    "elf weapon training": "Terlatih memakai senjata tradisional elf seperti longsword, shortsword, shortbow, dan longbow sesuai subrace.",
    "1 cantrip wizard": "High Elf mendapat satu cantrip dari daftar Wizard. Ini memberi trik sihir kecil yang bisa dipakai berulang.",
    "1 bahasa tambahan": "High Elf mendapat satu bahasa ekstra karena pendidikan dan budaya yang luas.",
    "fleet of foot": "Wood Elf memiliki speed lebih cepat, biasanya 35 ft, sehingga lebih mudah bergerak, mengejar, atau mundur.",
    "mask of the wild": "Wood Elf dapat mencoba bersembunyi saat hanya tertutup ringan oleh fenomena alam seperti dedaunan, hujan, atau kabut.",
    "superior darkvision 120 ft": "Drow melihat lebih jauh di kegelapan dibanding darkvision biasa. Kuat untuk Underdark dan dungeon gelap.",
    "sunlight sensitivity": "Drow mendapat gangguan pada attack roll dan Perception berbasis sight ketika berada di sinar matahari langsung.",
    "drow magic": "Drow mendapat sihir bawaan bertema kegelapan seiring level, sesuai aturan ras.",
    "drow weapon training": "Drow terlatih dengan pilihan senjata khas seperti rapier, shortsword, dan hand crossbow.",
    "dwarven resilience": "Dwarf mendapat advantage melawan poison dan resistance terhadap damage poison. Sangat bagus untuk dungeon, racun, dan monster berbisa.",
    "stonecunning": "Dwarf lebih ahli mengenali asal-usul batu, struktur, dan pekerjaan masonry. Berguna di gua, benteng, dan reruntuhan.",
    "dwarven toughness": "Hill Dwarf mendapat tambahan HP maksimum setiap level. Ini membuat karakter lebih tebal dan aman untuk pemula.",
    "dwarven armor training": "Mountain Dwarf mendapat kemahiran armor ringan dan sedang. Berguna untuk class yang biasanya tidak kuat armor.",
    "lucky": "Jika d20 menunjukkan angka 1 pada attack roll, ability check, atau saving throw, Halfling dapat me-roll ulang dan memakai hasil baru.",
    "brave": "Halfling mendapat advantage melawan frightened. Berguna melawan naga, undead, monster besar, dan efek takut.",
    "halfling nimbleness": "Halfling bisa bergerak melewati ruang makhluk yang ukurannya lebih besar dari dirinya. Berguna saat medan sempit.",
    "naturally stealthy": "Lightfoot Halfling bisa bersembunyi saat tertutup oleh makhluk yang setidaknya satu ukuran lebih besar.",
    "stout resilience": "Stout Halfling lebih tahan terhadap poison, cocok untuk karakter kecil yang ingin lebih kuat bertahan.",
    "draconic ancestry": "Dragonborn memilih garis keturunan naga. Pilihan ini menentukan elemen breath weapon dan resistance.",
    "breath weapon": "Dragonborn punya serangan nafas elemen area. Cocok untuk membuka combat melawan beberapa musuh sekaligus.",
    "damage resistance": "Dragonborn mendapat resistance terhadap damage elemen dari ancestry-nya, seperti fire, cold, lightning, acid, atau poison.",
    "gnome cunning": "Gnome mendapat advantage pada saving throw Intelligence, Wisdom, dan Charisma melawan magic. Sangat kuat melawan spell kontrol.",
    "natural illusionist": "Forest Gnome mendapat trik ilusi bawaan, berguna untuk distraksi, roleplay, dan kreativitas.",
    "speak with small beasts": "Forest Gnome dapat berkomunikasi sederhana dengan hewan kecil. Berguna untuk scouting dan petunjuk alam.",
    "artificer's lore": "Rock Gnome lebih paham benda sihir, alkimia, dan teknologi kecil. Cocok untuk investigasi item dan lore.",
    "tinker": "Rock Gnome dapat membuat alat mekanis kecil untuk roleplay, distraksi, atau solusi kreatif.",
    "skill versatility": "Half-Elf mendapat tambahan proficiency skill. Ini membuatnya fleksibel untuk party yang butuh banyak utility.",
    "menacing": "Half-Orc mendapat proficiency Intimidation. Cocok untuk tekanan sosial dan negosiasi keras.",
    "relentless endurance": "Saat jatuh ke 0 HP tetapi tidak langsung mati, Half-Orc bisa bertahan di 1 HP sekali per long rest.",
    "savage attacks": "Saat critical hit dengan melee weapon, Half-Orc menambah damage dice. Kuat untuk build melee.",
    "hellish resistance": "Tiefling memiliki resistance terhadap fire damage. Berguna melawan banyak spell dan monster berbasis api.",
    "infernal legacy": "Tiefling mendapat sihir bawaan bertema infernal seiring level, cocok untuk utility dan tekanan sosial."
  },
  startingPackages: [
    {
      id: "class-barbarian-2014",
      name: "Barbarian Starting Equipment 2014",
      mode: "standard",
      classIds: ["barbarian"],
      gold: 0,
      fixedItems: ["Explorer's Pack", "Javelin x4"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "greataxe", label: "Greataxe", items: ["Greataxe"] },
          { id: "martial-melee", label: "1 martial melee item pilihan base", items: ["Martial Melee Item"] }
        ] },
        { id: "backup", label: "Pilihan cadangan", pick: 1, options: [
          { id: "handaxe-pair", label: "Two handaxes", items: ["Handaxe x2"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] }
      ],
      notes: "Paket class Barbarian level 1. Pilihan item mengikuti versi 2014 dan tetap bisa dipilih dari opsi base item generik."
    },
    {
      id: "class-bard-2014",
      name: "Bard Starting Equipment 2014",
      mode: "standard",
      classIds: ["bard"],
      gold: 0,
      fixedItems: ["Leather Armor", "Dagger"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "rapier", label: "Rapier", items: ["Rapier"] },
          { id: "longsword", label: "Longsword", items: ["Longsword"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "diplomat", label: "Diplomat's Pack", items: ["Diplomat's Pack"] },
          { id: "entertainer", label: "Entertainer's Pack", items: ["Entertainer's Pack"] }
        ] },
        { id: "instrument", label: "Instrumen", pick: 1, options: [
          { id: "lute", label: "Lute", items: ["Lute"] },
          { id: "instrument", label: "1 musical instrument pilihan base", items: ["Musical Instrument"] }
        ] }
      ],
      notes: "Paket class Bard level 1: fokus sosial, performa, dan utility."
    },
    {
      id: "class-cleric-2014",
      name: "Cleric Starting Equipment 2014",
      mode: "standard",
      classIds: ["cleric"],
      gold: 0,
      fixedItems: ["Shield", "Holy Symbol"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "mace", label: "Mace", items: ["Mace"] },
          { id: "warhammer", label: "Warhammer jika proficient", items: ["Warhammer"] }
        ] },
        { id: "armor", label: "Armor", pick: 1, options: [
          { id: "scale", label: "Scale Mail", items: ["Scale Mail"] },
          { id: "leather", label: "Leather Armor", items: ["Leather Armor"] },
          { id: "chain", label: "Chain Mail jika proficient", items: ["Chain Mail"] }
        ] },
        { id: "secondary", label: "Pilihan jarak/alternatif", pick: 1, options: [
          { id: "crossbow", label: "Light Crossbow + 20 bolts", items: ["Light Crossbow", "Crossbow Bolts x20"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "priest", label: "Priest's Pack", items: ["Priest's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Cleric level 1: pertahanan, simbol suci, dan perlengkapan ibadah/petualangan."
    },
    {
      id: "class-druid-2014",
      name: "Druid Starting Equipment 2014",
      mode: "standard",
      classIds: ["druid"],
      gold: 0,
      fixedItems: ["Leather Armor", "Explorer's Pack", "Druidic Focus"],
      choices: [
        { id: "defense", label: "Pilihan pertama", pick: 1, options: [
          { id: "wooden-shield", label: "Wooden Shield", items: ["Wooden Shield"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "main", label: "Pilihan kedua", pick: 1, options: [
          { id: "scimitar", label: "Scimitar", items: ["Scimitar"] },
          { id: "simple-melee", label: "1 simple melee item pilihan base", items: ["Simple Melee Item"] }
        ] }
      ],
      notes: "Paket class Druid level 1: alam, fokus druidic, dan perlengkapan eksplorasi."
    },
    {
      id: "class-fighter-2014",
      name: "Fighter Starting Equipment 2014",
      mode: "standard",
      classIds: ["fighter"],
      gold: 0,
      fixedItems: [],
      choices: [
        { id: "armor", label: "Armor awal", pick: 1, options: [
          { id: "chain", label: "Chain Mail", items: ["Chain Mail"] },
          { id: "leather-bow", label: "Leather Armor + Longbow + 20 arrows", items: ["Leather Armor", "Longbow", "Arrows x20"] }
        ] },
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "one-shield", label: "1 martial item + Shield", items: ["Martial Item", "Shield"] },
          { id: "two-martial", label: "2 martial items pilihan base", items: ["Martial Item x2"] }
        ] },
        { id: "secondary", label: "Pilihan cadangan", pick: 1, options: [
          { id: "crossbow", label: "Light Crossbow + 20 bolts", items: ["Light Crossbow", "Crossbow Bolts x20"] },
          { id: "handaxe-pair", label: "Two handaxes", items: ["Handaxe x2"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Fighter level 1: fleksibel untuk garis depan atau jarak jauh sesuai pilihan base."
    },
    {
      id: "class-monk-2014",
      name: "Monk Starting Equipment 2014",
      mode: "standard",
      classIds: ["monk"],
      gold: 0,
      fixedItems: ["Dart x10"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "shortsword", label: "Shortsword", items: ["Shortsword"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Monk level 1: ringan, gesit, dan cocok untuk mobilitas tinggi."
    },
    {
      id: "class-paladin-2014",
      name: "Paladin Starting Equipment 2014",
      mode: "standard",
      classIds: ["paladin"],
      gold: 0,
      fixedItems: ["Chain Mail", "Holy Symbol"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "one-shield", label: "1 martial item + Shield", items: ["Martial Item", "Shield"] },
          { id: "two-martial", label: "2 martial items pilihan base", items: ["Martial Item x2"] }
        ] },
        { id: "secondary", label: "Pilihan cadangan", pick: 1, options: [
          { id: "javelins", label: "Five javelins", items: ["Javelin x5"] },
          { id: "simple-melee", label: "1 simple melee item pilihan base", items: ["Simple Melee Item"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "priest", label: "Priest's Pack", items: ["Priest's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Paladin level 1: pertahanan, sumpah suci, dan perlengkapan ibadah/petualangan."
    },
    {
      id: "class-ranger-2014",
      name: "Ranger Starting Equipment 2014",
      mode: "standard",
      classIds: ["ranger"],
      gold: 0,
      fixedItems: ["Longbow", "Arrows x20"],
      choices: [
        { id: "armor", label: "Armor", pick: 1, options: [
          { id: "scale", label: "Scale Mail", items: ["Scale Mail"] },
          { id: "leather", label: "Leather Armor", items: ["Leather Armor"] }
        ] },
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "shortsword-pair", label: "Two shortswords", items: ["Shortsword x2"] },
          { id: "simple-melee-pair", label: "2 simple melee items pilihan base", items: ["Simple Melee Item x2"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Ranger level 1: tracking, eksplorasi, dan perlengkapan alam liar."
    },
    {
      id: "class-rogue-2014",
      name: "Rogue Starting Equipment 2014",
      mode: "standard",
      classIds: ["rogue"],
      gold: 0,
      fixedItems: ["Leather Armor", "Dagger x2", "Thieves' Tools"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "rapier", label: "Rapier", items: ["Rapier"] },
          { id: "shortsword", label: "Shortsword", items: ["Shortsword"] }
        ] },
        { id: "secondary", label: "Pilihan cadangan", pick: 1, options: [
          { id: "shortbow", label: "Shortbow + 20 arrows", items: ["Shortbow", "Arrows x20"] },
          { id: "shortsword", label: "Shortsword", items: ["Shortsword"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "burglar", label: "Burglar's Pack", items: ["Burglar's Pack"] },
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Rogue level 1: infiltrasi, skill utility, dan perlengkapan ringan."
    },
    {
      id: "class-sorcerer-2014",
      name: "Sorcerer Starting Equipment 2014",
      mode: "standard",
      classIds: ["sorcerer"],
      gold: 0,
      fixedItems: ["Dagger x2"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "crossbow", label: "Light Crossbow + 20 bolts", items: ["Light Crossbow", "Crossbow Bolts x20"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "focus", label: "Fokus sihir", pick: 1, options: [
          { id: "component", label: "Component Pouch", items: ["Component Pouch"] },
          { id: "arcane", label: "Arcane Focus", items: ["Arcane Focus"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Sorcerer level 1: fokus spellcasting dan perlengkapan petualangan."
    },
    {
      id: "class-warlock-2014",
      name: "Warlock Starting Equipment 2014",
      mode: "standard",
      classIds: ["warlock"],
      gold: 0,
      fixedItems: ["Leather Armor", "Simple Item", "Dagger x2"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "crossbow", label: "Light Crossbow + 20 bolts", items: ["Light Crossbow", "Crossbow Bolts x20"] },
          { id: "simple", label: "1 simple item pilihan base", items: ["Simple Item"] }
        ] },
        { id: "focus", label: "Fokus sihir", pick: 1, options: [
          { id: "component", label: "Component Pouch", items: ["Component Pouch"] },
          { id: "arcane", label: "Arcane Focus", items: ["Arcane Focus"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "scholar", label: "Scholar's Pack", items: ["Scholar's Pack"] },
          { id: "dungeon", label: "Dungeoneer's Pack", items: ["Dungeoneer's Pack"] }
        ] }
      ],
      notes: "Paket class Warlock level 1: pact magic, fokus spellcasting, dan perlengkapan ringan."
    },
    {
      id: "class-wizard-2014",
      name: "Wizard Starting Equipment 2014",
      mode: "standard",
      classIds: ["wizard"],
      gold: 0,
      fixedItems: ["Spellbook"],
      choices: [
        { id: "main", label: "Pilihan utama", pick: 1, options: [
          { id: "quarterstaff", label: "Quarterstaff", items: ["Quarterstaff"] },
          { id: "dagger", label: "Dagger", items: ["Dagger"] }
        ] },
        { id: "focus", label: "Fokus sihir", pick: 1, options: [
          { id: "component", label: "Component Pouch", items: ["Component Pouch"] },
          { id: "arcane", label: "Arcane Focus", items: ["Arcane Focus"] }
        ] },
        { id: "pack", label: "Paket perlengkapan", pick: 1, options: [
          { id: "scholar", label: "Scholar's Pack", items: ["Scholar's Pack"] },
          { id: "explorer", label: "Explorer's Pack", items: ["Explorer's Pack"] }
        ] }
      ],
      notes: "Paket class Wizard level 1: spellbook, fokus spellcasting, dan perlengkapan belajar/petualangan."
    },
    { id: "starting-gold", name: "Starting Gold", mode: "gold", classIds: ["*"], gold: 10, fixedItems: [], items: [], choices: [], requiresApproval: false, notes: "Player mulai dengan gold sesuai angka yang ditentukan GM." },
    { id: "gm-custom", name: "GM Custom Choice", mode: "custom", classIds: ["*"], gold: 25, fixedItems: ["Healing Potion"], items: ["Healing Potion"], choices: [], requiresApproval: true, notes: "Paket buatan GM. Backend menyimpan pilihan ini sebagai paket khusus room." }
  ],
  items: [
    { name: "Leather Armor", type: "Armor", rarity: "Common", weight: 10, abilityRequirement: "Tidak ada", abilityUse: "Dexterity modifier ikut AC", affects: "AC 11 + Dex modifier", skillSupport: "Stealth tetap normal" },
    { name: "Scale Mail", type: "Armor", rarity: "Common", weight: 45, abilityRequirement: "Tidak ada", abilityUse: "Dexterity modifier maksimal +2 ikut AC", affects: "AC 14 + Dex modifier maksimal +2", skillSupport: "Stealth disadvantage di aturan 2014" },
    { name: "Chain Mail", type: "Armor", rarity: "Common", weight: 55, abilityRequirement: "Strength 13 untuk menghindari penalty speed", abilityUse: "Tidak memakai Dex modifier", affects: "AC 16", skillSupport: "Stealth disadvantage di aturan 2014" },
    { name: "Shield", type: "Armor", rarity: "Common", weight: 6, abilityRequirement: "Proficiency shield dari class", abilityUse: "Tidak mengubah ability score", affects: "+2 AC saat dipakai di sheet", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Wooden Shield", type: "Armor", rarity: "Common", weight: 6, abilityRequirement: "Proficiency shield dari class", abilityUse: "Tidak mengubah ability score", affects: "+2 AC saat dipakai di sheet", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Arcane Focus", type: "Focus", rarity: "Common", weight: 1, abilityRequirement: "Class spellcaster arcane", abilityUse: "Mengikuti spellcasting ability class", affects: "Fokus komponen spell tertentu", skillSupport: "Arcana/Investigation sesuai aksi karakter" },
    { name: "Component Pouch", type: "Focus", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Mengikuti spellcasting ability class", affects: "Komponen spell umum", skillSupport: "Arcana sesuai aksi karakter" },
    { name: "Holy Symbol", type: "Focus", rarity: "Common", weight: 1, abilityRequirement: "Class divine spellcaster", abilityUse: "Wisdom/Charisma sesuai class", affects: "Fokus spell divine", skillSupport: "Religion sesuai aksi karakter" },
    { name: "Druidic Focus", type: "Focus", rarity: "Common", weight: 1, abilityRequirement: "Druid", abilityUse: "Wisdom untuk spell Druid", affects: "Fokus spell Druid", skillSupport: "Nature/Survival sesuai aksi karakter" },
    { name: "Spellbook", type: "Class Gear", rarity: "Common", weight: 3, abilityRequirement: "Wizard", abilityUse: "Intelligence untuk spell Wizard", affects: "Tempat catatan spell Wizard", skillSupport: "Arcana/History sesuai aksi karakter" },
    { name: "Thieves' Tools", type: "Tool", rarity: "Common", weight: 1, abilityRequirement: "Tool proficiency agar bonus proficiency masuk", abilityUse: "Biasanya Dexterity check dalam permainan", affects: "Tidak mengubah ability score", skillSupport: "Sleight of Hand/Investigation sesuai situasi GM" },
    { name: "Musical Instrument", type: "Tool", rarity: "Common", weight: 2, abilityRequirement: "Instrument proficiency agar bonus proficiency masuk", abilityUse: "Biasanya Charisma/Performance dalam permainan", affects: "Tidak mengubah ability score", skillSupport: "Performance" },
    { name: "Lute", type: "Tool", rarity: "Common", weight: 2, abilityRequirement: "Instrument proficiency agar bonus proficiency masuk", abilityUse: "Biasanya Charisma/Performance dalam permainan", affects: "Tidak mengubah ability score", skillSupport: "Performance" },
    { name: "Explorer's Pack", type: "Pack", rarity: "Common", weight: 59, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan perjalanan", skillSupport: "Survival/Perception sesuai situasi GM" },
    { name: "Dungeoneer's Pack", type: "Pack", rarity: "Common", weight: 61, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan eksplorasi dungeon", skillSupport: "Athletics/Investigation/Survival sesuai situasi GM" },
    { name: "Burglar's Pack", type: "Pack", rarity: "Common", weight: 47.5, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan infiltrasi fiksi permainan", skillSupport: "Stealth/Investigation/Sleight of Hand sesuai situasi GM" },
    { name: "Diplomat's Pack", type: "Pack", rarity: "Common", weight: 39, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan sosial dan dokumen", skillSupport: "Persuasion/Deception/History sesuai situasi GM" },
    { name: "Entertainer's Pack", type: "Pack", rarity: "Common", weight: 38, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan performer", skillSupport: "Performance/Deception sesuai situasi GM" },
    { name: "Priest's Pack", type: "Pack", rarity: "Common", weight: 24, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan ritual fiksi permainan", skillSupport: "Religion/Insight sesuai situasi GM" },
    { name: "Scholar's Pack", type: "Pack", rarity: "Common", weight: 11, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Perlengkapan studi dan catatan", skillSupport: "Arcana/History/Investigation sesuai situasi GM" },
    { name: "Healing Potion", type: "Potion", rarity: "Common", weight: 0.5, abilityRequirement: "Tidak ada", abilityUse: "Tidak mengubah ability score", affects: "Efek pemulihan HP dalam permainan", skillSupport: "Medicine sesuai aksi karakter" },
    { name: "Dagger", type: "Combat Gear", rarity: "Common", weight: 1, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Dagger x2", type: "Combat Gear", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Longsword", type: "Combat Gear", rarity: "Common", weight: 3, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Rapier", type: "Combat Gear", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Shortsword", type: "Combat Gear", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Shortsword x2", type: "Combat Gear", rarity: "Common", weight: 4, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Shortbow", type: "Combat Gear", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
    { name: "Longbow", type: "Combat Gear", rarity: "Common", weight: 2, abilityRequirement: "Tidak ada", abilityUse: "Stat fiksi permainan; ikuti aturan sheet", affects: "Tercatat sebagai gear permainan; tidak berisi instruksi dunia nyata", skillSupport: "Tidak memberi skill otomatis" },
