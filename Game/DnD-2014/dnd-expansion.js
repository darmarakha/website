(function () {
  "use strict";
  const DATA = window.DND_DATA = window.DND_DATA || {};

  DATA.storyOptionPools = {
    personalityTraits: [
      "Saya cepat menolong orang yang terlihat kesulitan, meski risikonya belum jelas.",
      "Saya selalu mencatat nama, tempat, dan petunjuk kecil yang orang lain lewatkan.",
      "Saya bicara sopan di depan orang baru, tetapi sangat tegas saat bahaya datang.",
      "Saya sulit menolak tantangan karena ingin membuktikan diri di depan party.",
      "Saya sering memakai humor untuk mencairkan suasana tegang.",
      "Saya lebih percaya tindakan nyata daripada janji manis.",
      "Saya terbiasa mengamati pintu keluar, penjaga, dan jalur aman setiap masuk tempat baru.",
      "Saya punya kebiasaan kecil yang mudah dikenali, seperti mengetuk meja sebelum berpikir.",
      "Saya menjaga barang pribadi dengan rapi karena tiap benda punya cerita.",
      "Saya mudah kagum pada keajaiban, reruntuhan tua, dan makhluk yang belum pernah saya lihat.",
      "Saya lebih suka berbicara empat mata daripada berdebat di depan keramaian.",
      "Saya selalu menanyakan harga, risiko, dan imbalan sebelum menerima pekerjaan."
    ],
    ideals: [
      "Keadilan. Orang lemah berhak mendapat perlindungan dan kesempatan yang sama.",
      "Kebebasan. Tidak ada orang yang boleh dipaksa hidup di bawah ketakutan.",
      "Pengetahuan. Misteri dunia harus dipelajari, bukan ditakuti.",
      "Kesetiaan. Party adalah keluarga kedua yang harus dijaga.",
      "Kehormatan. Kemenangan tidak berarti jika dicapai dengan mengkhianati prinsip.",
      "Perubahan. Tradisi boleh dihormati, tetapi tidak boleh mengikat masa depan.",
      "Keseimbangan. Alam, kota, dan sihir harus berjalan tanpa saling menghancurkan.",
      "Ambisi. Saya ingin menjadi legenda, bukan sekadar catatan kaki sejarah.",
      "Belas kasih. Musuh pun kadang butuh jalan pulang, bukan hanya hukuman.",
      "Kebenaran. Rahasia berbahaya harus dibuka sebelum melukai lebih banyak orang.",
      "Tanggung jawab. Kekuatan selalu datang dengan kewajiban menjaga orang lain.",
      "Kreativitas. Selalu ada solusi cerdik selain jalan yang paling keras."
    ],
    bonds: [
      "Saya mencari anggota keluarga, guru, atau sahabat yang hilang dalam perjalanan lama.",
      "Saya berutang budi kepada seseorang yang pernah menyelamatkan hidup saya.",
      "Saya membawa lambang, surat, atau benda kecil dari rumah yang tidak boleh hilang.",
      "Saya ingin mengembalikan nama baik keluarga, guild, kuil, atau komunitas saya.",
      "Saya melindungi rahasia penting yang jika bocor dapat membahayakan banyak orang.",
      "Saya mengejar peta, relik, atau petunjuk yang terhubung dengan masa lalu saya.",
      "Saya punya janji lama kepada mentor untuk menyelesaikan misi yang belum selesai.",
      "Saya merasa bertanggung jawab atas satu desa, kelompok, atau orang yang pernah saya tinggalkan.",
      "Saya ingin membuktikan bahwa asal-usul saya bukan penentu nilai diri saya.",
      "Saya punya rival lama yang terus mendorong saya menjadi lebih kuat.",
      "Saya menjaga nama party karena reputasi mereka sekarang juga reputasi saya.",
      "Saya berpetualang untuk mengumpulkan biaya, pengetahuan, atau dukungan bagi tujuan pribadi."
    ],
    flaws: [
      "Saya terlalu cepat percaya kepada orang yang memberi pujian atau terlihat tulus.",
      "Saya sulit meminta bantuan meski jelas tidak bisa menyelesaikan masalah sendiri.",
      "Saya mudah terpancing jika kehormatan, keluarga, atau kemampuan saya diremehkan.",
      "Saya menyembunyikan rasa takut dengan sikap terlalu percaya diri.",
      "Saya kadang mengambil risiko besar demi hadiah, rahasia, atau rasa penasaran.",
      "Saya sulit memaafkan pengkhianatan kecil, bahkan setelah orang itu meminta maaf.",
      "Saya sering berbicara sebelum memikirkan akibatnya.",
      "Saya takut kehilangan kendali, sehingga kadang terlalu mengatur keputusan party.",
      "Saya punya kebiasaan buruk menunda keputusan sulit sampai situasi makin rumit.",
      "Saya mudah iri kepada orang yang terlihat lebih dihormati.",
      "Saya menyimpan rahasia yang bisa membuat party meragukan saya jika mereka tahu.",
      "Saya bisa terlalu fokus pada tujuan sampai lupa membaca perasaan orang lain."
    ]
  };

  DATA.monsters = [
    { name: "Goblin", cr: "1/4", type: "Small humanoid", ac: 15, hp: 7, role: "skirmisher", terrain: "cave, ruin, forest", notes: "Cocok untuk encounter awal, penyergap kecil, atau penjaga kamp." },
    { name: "Kobold", cr: "1/8", type: "Small humanoid", ac: 12, hp: 5, role: "trap helper", terrain: "cave, mine, sewer", notes: "Bagus untuk dungeon kecil, teka-teki, dan taktik berkelompok." },
    { name: "Orc", cr: "1/2", type: "Medium humanoid", ac: 13, hp: 15, role: "frontliner", terrain: "wildland, camp, raid route", notes: "Ancaman fisik sederhana untuk party level rendah." },
    { name: "Skeleton", cr: "1/4", type: "Undead", ac: 13, hp: 13, role: "guard", terrain: "crypt, ruin, dungeon", notes: "Penjaga klasik untuk makam, reruntuhan, atau necromancer kecil." },
    { name: "Zombie", cr: "1/4", type: "Undead", ac: 8, hp: 22, role: "slow tank", terrain: "graveyard, swamp, ruin", notes: "Lambat tetapi tahan lama; cocok untuk tekanan horor ringan tanpa detail berlebihan." },
    { name: "Wolf", cr: "1/4", type: "Beast", ac: 13, hp: 11, role: "pack hunter", terrain: "forest, hill, snow", notes: "Encounter alam yang mudah dipahami untuk pemain baru." },
    { name: "Giant Spider", cr: "1", type: "Beast", ac: 14, hp: 26, role: "ambusher", terrain: "cave, forest, ruin", notes: "Cocok untuk sarang, jaring, dan vertical terrain." },
    { name: "Bandit Captain", cr: "2", type: "Humanoid", ac: 15, hp: 65, role: "leader", terrain: "road, city, hideout", notes: "Pemimpin musuh sosial atau kriminal untuk mini-boss awal." },
    { name: "Ogre", cr: "2", type: "Giant", ac: 11, hp: 59, role: "brute", terrain: "hill, cave, bridge", notes: "Monster besar sederhana untuk menekan posisi party." },
    { name: "Ghoul", cr: "1", type: "Undead", ac: 12, hp: 22, role: "disabler", terrain: "crypt, ruin, night road", notes: "Gunakan hati-hati karena efek kondisi bisa membuat pemain baru kaget." },
    { name: "Griffon", cr: "2", type: "Monstrosity", ac: 12, hp: 59, role: "flying threat", terrain: "mountain, cliff, open field", notes: "Bagus untuk perjalanan udara, tebing, dan penyelamatan dramatis." },
    { name: "Young Green Dragon", cr: "8", type: "Dragon", ac: 18, hp: 136, role: "boss", terrain: "forest, ancient ruin", notes: "Untuk party yang sudah kuat; jadikan arc boss, bukan encounter dadakan." }
  ];

  DATA.ruleAiKnowledge = [
    { keys: ["aksi", "action", "bonus", "reaction", "giliran", "turn"], answer: "Action economy 5e: satu turn biasanya berisi movement, satu action, bonus action jika fitur/spell memberi izin, satu reaction per round jika ada trigger, dan interaksi objek ringan. Kalau pemain bingung, minta mereka pilih tujuan dulu: bergerak, membantu, bertahan, memakai fitur, atau berinteraksi." },
    { keys: ["ability", "check", "cek", "dc", "skill"], answer: "Ability check = d20 + ability modifier + proficiency jika karakter memang proficient. DC mudah sekitar 10, sedang 15, sulit 20. Skill bukan tombol wajib; GM memilih ability yang paling masuk akal dari aksi player." },
    { keys: ["save", "saving", "saving throw"], answer: "Saving throw dipakai saat karakter menahan efek berbahaya. Rumusnya d20 + ability modifier + proficiency jika class memberi proficiency save itu. Jangan samakan saving throw dengan skill check karena pemicunya berbeda." },
    { keys: ["alignment", "aligment", "moral"], answer: "Alignment adalah kompas moral, bukan rantai. Lawful cenderung percaya aturan/kode, Chaotic cenderung bebas, Good peduli keselamatan orang lain, Evil mementingkan diri/tujuan gelap. Neutral berada di tengah atau fleksibel sesuai konteks." },
    { keys: ["trait", "personality", "ideal", "bond", "flaw"], answer: "Personality trait menjawab cara karakter terlihat sehari-hari. Ideal menjawab prinsip hidup. Bond menjawab ikatan penting. Flaw menjawab kelemahan yang bisa memicu drama. Pilihan ini naratif, tidak harus menambah angka mekanik." },
    { keys: ["rest", "short", "long", "istirahat"], answer: "Short rest biasanya dipakai untuk memakai Hit Dice dan memulihkan sebagian kemampuan. Long rest memulihkan lebih besar. Pastikan GM mencatat waktu, tempat aman, gangguan, dan resource yang kembali." },
    { keys: ["spell", "concentration", "konsentrasi", "magic"], answer: "Banyak spell butuh concentration. Umumnya karakter hanya bisa mempertahankan satu concentration spell. Jika terkena gangguan besar, GM bisa meminta Constitution saving throw sesuai aturan meja." },
    { keys: ["cover", "terrain", "map", "posisi"], answer: "Map membantu menjelaskan posisi, cover, jalur, pintu, tangga, air, ketinggian, dan titik interaksi. Pakai landmark agar pemain tahu pilihan tanpa perlu membaca peta terlalu lama." },
    { keys: ["monster", "cr", "encounter"], answer: "CR adalah patokan kasar, bukan jaminan seimbang. Perhatikan jumlah musuh, action economy, terrain, kondisi party, resource yang tersisa, dan apakah tujuan encounter adalah bertahan, negosiasi, kabur, atau menang." },
    { keys: ["lobby", "gm", "campaign"], answer: "Lobby/campaign setting sebaiknya hanya diatur GM. Player fokus membuat karakter dan bermain. Owner tetap punya kuasa GM tersembunyi di sistem bila login dari akun website yang benar." }
  ];
})();
