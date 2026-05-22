// ==========================================
// PARTICLE DECISION TREE
// Flowchart interaktif "Kapan pakai partikel apa?"
// ==========================================

const decisionTree = {
    id: 'root',
    question: 'Apa fungsi kata ini dalam kalimat?',
    icon: 'help-circle',
    options: [
        {
            id: 'topic',
            label: '📌 Topik pembicaraan',
            desc: '"Kalau tentang...", memperkenalkan topik',
            result: {
                particle: 'は (wa)',
                explanation: '「は」digunakan untuk memperkenalkan topik yang sedang dibicarakan. Kata SEBELUM は adalah topik, kata SETELAH は adalah informasi tentang topik tersebut.',
                example: 'わたしは学生です。(Watashi wa gakusei desu) = Saya (sebagai topik) adalah pelajar.',
                contrast: 'Beda dengan が: は untuk topik umum, が untuk subjek spesifik/identifikasi.',
                linkParticle: 'wa'
            }
        },
        {
            id: 'subject',
            label: '🎯 Subjek spesifik / identifikasi',
            desc: '"Siapa/apa yang melakukan?", subjek baru, kata tanya',
            result: {
                particle: 'が (ga)',
                explanation: '「が」menandai subjek spesifik. Dipakai saat mengenalkan subjek baru, menjawab kata tanya (だれが？なにが？), atau menegaskan identitas.',
                example: 'だれが来ますか。(Dare ga kimasu ka) = Siapa yang datang?',
                contrast: 'Beda dengan は: が fokus pada subjek ("Siapa"), は fokus pada informasi setelahnya.',
                linkParticle: 'ga'
            }
        },
        {
            id: 'object',
            label: '🎯 Objek langsung dari aksi',
            desc: 'Benda/orang yang dikenai tindakan',
            result: {
                particle: 'を (o)',
                explanation: '「を」menandai objek langsung yang dikenai oleh kata kerja transitif. Kata kerja seperti 食べる, 飲む, 読む, 書く membutuhkan を.',
                example: 'りんごを食べます。(Ringo o tabemasu) = Makan apel.',
                contrast: 'Beda dengan に: を untuk objek langsung, に untuk target tidak langsung.',
                linkParticle: 'wo'
            }
        },
        {
            id: 'location',
            label: '📍 Lokasi / Tempat',
            desc: 'Mau bilang "di", "ke", "ada di", "aksi di"',
            options: [
                {
                    id: 'loc_static',
                    label: '🏠 Tempat keberadaan (ada/berada)',
                    desc: '"Ada kucing di kamar", "berada di sekolah"',
                    result: {
                        particle: 'に (ni)',
                        explanation: '「に」untuk lokasi keberadaan statis. Berpasangan dengan kata kerja いる (untuk makhluk hidup) atau ある (untuk benda mati).',
                        example: '部屋に猫がいます。(Heya ni neko ga imasu) = Di kamar ada kucing.',
                        contrast: 'Beda dengan で: に untuk titik diam/keberadaan, で untuk tempat melakukan aksi.',
                        linkParticle: 'ni_ichi'
                    }
                },
                {
                    id: 'loc_action',
                    label: '🏢 Tempat melakukan aksi',
                    desc: '"Belajar di sekolah", "makan di restoran"',
                    result: {
                        particle: 'で (de)',
                        explanation: '「で」menandai tempat dilakukannya aksi aktif. Kata kerja aksi seperti 勉強する, 食べる, 遊ぶ, 働く memakai で untuk tempatnya.',
                        example: '図書館で本を読みます。(Toshokan de hon o yomimasu) = Membaca buku di perpustakaan.',
                        contrast: 'Beda dengan に: で untuk tempat aksi, に untuk tempat keberadaan statis.',
                        linkParticle: 'de'
                    }
                },
                {
                    id: 'loc_direction',
                    label: '➡️ Arah / Tujuan pergerakan',
                    desc: '"Pergi ke Jepang", "menuju stasiun"',
                    result: {
                        particle: 'へ (e) atau に (ni)',
                        explanation: '「へ」menekankan ARAH perjalanan. 「に」menekankan TITIK TUJUAN. Sering bisa dipertukarkan, tapi へ lebih fokus pada perjalanan, に lebih pada tujuan akhir.',
                        example: '日本へ行きます。(Nihon e ikimasu) = Pergi ke (arah) Jepang.',
                        contrast: 'へ untuk "menuju ke", に untuk "sampai di". へ lebih puitis/formal.',
                        linkParticle: 'e'
                    }
                }
            ]
        },
        {
            id: 'time',
            label: '⏰ Waktu',
            desc: 'Mau bilang "pada jam...", "hari...", "setiap..."',
            options: [
                {
                    id: 'time_specific',
                    label: '⏱️ Waktu spesifik (jam 3, Senin)',
                    desc: 'Ada angka atau nama hari spesifik',
                    result: {
                        particle: 'に (ni)',
                        explanation: '「に」untuk waktu spesifik. Jam, hari, bulan, tahun yang spesifik pakai に.',
                        example: '三時に起きます。(Sanji ni okimasu) = Bangun jam 3.',
                        contrast: 'Beda dengan waktu relatif: あした, きょう, まいあさ TIDAK pakai に.',
                        linkParticle: 'ni_ichi'
                    }
                },
                {
                    id: 'time_relative',
                    label: '📅 Waktu relatif (besok, kemarin, setiap pagi)',
                    desc: 'Kata waktu seperti あした, きょう, まいあさ',
                    result: {
                        particle: 'TANPA PARTIKEL (×)',
                        explanation: 'Waktu relatif seperti あした (besok), きょう (hari ini), まいあさ (setiap pagi) TIDAK menggunakan partikel に.',
                        example: 'あたし、日本へ行きます。(Ashita, Nihon e ikimasu) = Besok pergi ke Jepang. (tanpa に setelah あした)',
                        contrast: 'Beda: あした (besok) → tanpa partikel. 三時 (jam 3) → pakai に.',
                        linkParticle: null
                    }
                }
            ]
        },
        {
            id: 'possession',
            label: '🔗 Kepemilikan / Penerang',
            desc: '"Buku saya", "makanan Jepang", "guru sekolah"',
            result: {
                particle: 'の (no)',
                explanation: '「の」menghubungkan dua kata benda. Kata benda pertama menerangkan yang kedua: kepemilikan, asal, bahan, atau topik.',
                example: '私の本です。(Watashi no hon desu) = Buku saya.',
                contrast: 'の bisa berarti milik (私の本), asal (日本の文化), atau topik (数学の本).',
                linkParticle: 'no'
            }
        },
        {
            id: 'accompany',
            label: '👥 Kebersamaan',
            desc: '"Bersama teman", "dengan siapa?"',
            result: {
                particle: 'と (to)',
                explanation: '「と」menandai orang yang bersama-sama melakukan aksi. Juga dipakai untuk mengutip ucapan/pikiran.',
                example: '友だちと映画を見ます。(Tomodachi to eiga o mimasu) = Menonton film dengan teman.',
                contrast: 'と untuk kebersamaan. に untuk target (bertemu DENGAN teman → 友だちに会う).',
                linkParticle: 'to_with'
            }
        },
        {
            id: 'means',
            label: '🔧 Alat / Cara / Bahasa',
            desc: '"Dengan pensil", "naik bus", "dalam bahasa Jepang"',
            result: {
                particle: 'で (de)',
                explanation: '「で」menandai alat, sarana, atau media yang digunakan untuk melakukan sesuatu.',
                example: 'バスで行きます。(Basu de ikimasu) = Pergi dengan bus.',
                contrast: 'で untuk alat/cara. を untuk objek. Bandingkan: 鉛筆で書く (menulis dengan pensil) vs 手紙を書く (menulis surat).',
                linkParticle: 'de'
            }
        },
        {
            id: 'from_until',
            label: '🏁 Batas: Dari / Sampai',
            desc: '"Dari Tokyo", "sampai jam 5", "dari... sampai..."',
            result: {
                particle: 'から (kara) / まで (made)',
                explanation: '「から」untuk titik awal (dari).「まで」untuk batas akhir (sampai). Sering berpasangan: から...まで.',
                example: '九時から五時まで働きます。(Kuji kara goji made hatarakimasu) = Bekerja dari jam 9 sampai jam 5.',
                contrast: 'から = start 🏁, まで = finish 🏁.',
                linkParticle: 'kara_from'
            }
        },
        {
            id: 'only',
            label: '🔒 Hanya / Saja',
            desc: '"Hanya ini", "cuma itu"',
            options: [
                {
                    id: 'only_dake',
                    label: '➕ Hanya (netral)',
                    desc: '"Hanya ini yang ada" — pernyataan netral',
                    result: {
                        particle: 'だけ (dake)',
                        explanation: '「だけ」berarti "hanya" dengan nuansa netral. Sekadar menyatakan batasan tanpa perasaan kurang.',
                        example: 'これだけください。(Kore dake kudasai) = Tolong beri saya ini saja.',
                        contrast: 'だけ (netral) vs しか~ない (kurang). 「百円だけある」= ada 100 yen. 「百円しかない」= cuma ada 100 yen (kurang).',
                        linkParticle: 'dake'
                    }
                },
                {
                    id: 'only_shika',
                    label: '➖ Hanya (dengan rasa kurang)',
                    desc: '"Cuma segini" — menyesal/kurang',
                    result: {
                        particle: 'しか (shika) + predikat NEGATIF',
                        explanation: '「しか」berarti "hanya" tetapi WAJIB diikuti predikat negatif. Menyiratkan bahwa jumlahnya kurang dari harapan.',
                        example: '百円しかありません。(Hyaku en shika arimasen) = Hanya ada 100 yen (padahal butuh lebih).',
                        contrast: 'しか~ない (kurang) vs だけ (netral).',
                        linkParticle: 'shika'
                    }
                }
            ]
        },
        {
            id: 'also',
            label: '➕ Juga / Bahkan',
            desc: '"Saya juga", "keduanya", "bahkan"',
            result: {
                particle: 'も (mo)',
                explanation: '「も」berarti "juga" atau "bahkan". Menggantikan は/が/を. 「AもBも」= baik A maupun B.',
                example: '私も学生です。(Watashi mo gakusei desu) = Saya juga pelajar.',
                contrast: 'も untuk "juga". さえ untuk "bahkan" (lebih ekstrem). でも untuk "atau sesuatu" (santai).',
                linkParticle: 'mo'
            }
        },
        {
            id: 'comparison',
            label: '⚖️ Perbandingan',
            desc: '"Lebih... daripada...", "Daripada..."',
            result: {
                particle: 'より (yori)',
                explanation: '「より」menandai pembanding. Pola: [A] + は + [B] + より + [KS]. A lebih KS daripada B.',
                example: '日本よりインドネシアのほうが広いです。(Nihon yori Indonesia no houga hiroi desu) = Indonesia lebih luas daripada Jepang.',
                contrast: 'より untuk perbandingan. ほど untuk "setingkat" dalam kalimat negatif.',
                linkParticle: 'yori'
            }
        },
        {
            id: 'listing',
            label: '📋 Daftar / Pilihan',
            desc: '"A dan B", "A atau B", "A, B, dll"',
            options: [
                {
                    id: 'list_full',
                    label: '✅ Daftar lengkap (A dan B)',
                    desc: 'Hanya A dan B, tidak ada yang lain',
                    result: {
                        particle: 'と (to)',
                        explanation: '「と」untuk daftar LENGKAP. Semua item disebutkan, tidak ada yang lain.',
                        example: '猫と犬がいます。(Neko to inu ga imasu) = Ada kucing dan anjing (hanya itu).',
                        contrast: 'と (lengkap) vs や (parsial).',
                        linkParticle: 'to_list'
                    }
                },
                {
                    id: 'list_partial',
                    label: '🔓 Daftar parsial (A, B, dll)',
                    desc: 'Hanya contoh, masih ada yang lain',
                    result: {
                        particle: 'や (ya)',
                        explanation: '「や」untuk daftar PARSIAL. Item yang disebutkan hanya contoh, masih ada yang lain.',
                        example: '猫や犬がいます。(Neko ya inu ga imasu) = Ada kucing, anjing, dan lain-lain.',
                        contrast: 'や (parsial) vs と (lengkap).',
                        linkParticle: 'ya'
                    }
                },
                {
                    id: 'list_choice',
                    label: '🤷 Pilihan (A atau B)',
                    desc: 'Memilih antara dua opsi',
                    result: {
                        particle: 'か (ka)',
                        explanation: '「か」untuk pilihan "atau". Juga untuk pertanyaan di akhir kalimat.',
                        example: 'コーヒーか紅茶をください。(Koohii ka koocha o kudasai) = Tolong beri kopi atau teh.',
                        contrast: 'か untuk pilihan (atau). と untuk daftar (dan).',
                        linkParticle: 'ka_choice'
                    }
                }
            ]
        },
        {
            id: 'ending',
            label: '💬 Partikel akhir kalimat',
            desc: 'Bertanya, konfirmasi, memberi info baru',
            options: [
                {
                    id: 'end_question',
                    label: '❓ Bertanya',
                    desc: 'Mengubah kalimat jadi pertanyaan',
                    result: {
                        particle: 'か (ka)',
                        explanation: '「か」di akhir kalimat mengubahnya menjadi pertanyaan. Cukup tambahkan か tanpa mengubah urutan kata.',
                        example: '学生ですか。(Gakusei desu ka) = Apakah (kamu) pelajar?',
                        contrast: 'か formal. Dalam percakapan santai, か sering dihilangkan, cukup intonasi naik.',
                        linkParticle: 'ka_q'
                    }
                },
                {
                    id: 'end_confirm',
                    label: '🤔 Mencari persetujuan',
                    desc: '"...ya kan?", "...ya?" — softener',
                    result: {
                        particle: 'ね (ne)',
                        explanation: '「ね」mencari persetujuan atau membuat kalimat lebih lembut. "Ya kan?", "Iya, ya?"',
                        example: 'いい天気ですね。(Ii tenki desu ne) = Cuaca bagus ya.',
                        contrast: 'ね (konfirmasi) vs よ (info baru).',
                        linkParticle: 'ne'
                    }
                },
                {
                    id: 'end_info',
                    label: '💡 Memberi info baru',
                    desc: '"Lho...", "Kok..." — penekanan',
                    result: {
                        particle: 'よ (yo)',
                        explanation: '「よ」memberi tahu lawan bicara informasi yang mereka belum tahu. "Lho...", "Kok..."',
                        example: 'もうすぐ着きますよ。(Mou sugu tsukimasu yo) = Sebentar lagi sampai, lho.',
                        contrast: 'よ (info baru) vs ね (konfirmasi). よ agak kurang sopan untuk atasan.',
                        linkParticle: 'yo'
                    }
                }
            ]
        }
    ]
};

let dtHistory = [];

function resetDecisionTree() {
    dtHistory = [];
    renderDecisionTree(decisionTree);
}

function renderDecisionTree(node) {
    const container = document.getElementById('decisionTreeContainer');
    if (!container) return;

    let pathHtml = dtHistory.map((step, i) => {
        return `<button class="text-xs text-[#b89cff] hover:text-white transition" onclick="dtGoBack(${i + 1})">${step.label}</button>`;
    }).join(' <span class="text-[#555] mx-1">›</span> ');

    let backBtn = '';
    if (dtHistory.length > 0) {
        backBtn = `<button class="text-xs text-[#a9a29a] hover:text-white transition flex items-center gap-1" onclick="dtGoBack(${dtHistory.length})"><i data-lucide="arrow-left" class="w-3 h-3"></i> Kembali</button>`;
    }

    let optionsHtml = '';
    if (node.options) {
        node.options.forEach(opt => {
            let isExpandable = opt.options && opt.options.length > 0;
            let clickHandler = isExpandable
                ? `dtNavigate('${opt.id}')`
                : `dtShowResult('${opt.id}')`;

            optionsHtml += `
                <button class="w-full text-left p-4 rounded-xl border border-white/10 bg-[#161b22] hover:bg-[#1c2333] hover:border-[#b89cff]/40 transition-all group" onclick="${clickHandler}">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-[#f4efe7] font-bold">${opt.label}</span>
                            <p class="text-[#777] text-xs mt-1">${opt.desc}</p>
                        </div>
                        ${isExpandable ? '<i data-lucide="chevron-right" class="w-5 h-5 text-[#555] group-hover:text-[#b89cff] transition-colors"></i>' : '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-500"></i>'}
                    </div>
                </button>
            `;
        });
    }

    let resultHtml = '';
    if (node.result) {
        let linkBtn = '';
        if (node.result.linkParticle) {
            let p = getPartikelById(node.result.linkParticle);
            if (p) {
                linkBtn = `<button class="mt-4 w-full py-2.5 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition text-sm flex items-center justify-center gap-2" onclick="openPartikelModal('${node.result.linkParticle}')"><i data-lucide="book-open" class="w-4 h-4"></i> Pelajari ${p.char} (${p.romaji}) Lebih Detail</button>`;
            }
        }

        resultHtml = `
            <div class="mt-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
                    </div>
                    <div>
                        <p class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Rekomendasi Partikel</p>
                        <p class="text-xl font-bold text-white font-jp">${node.result.particle}</p>
                    </div>
                </div>
                <p class="text-[#c0c0c0] text-sm leading-relaxed mb-3">${node.result.explanation}</p>
                <div class="bg-[#0a0d12] p-3 rounded-xl border border-white/5 mb-3">
                    <p class="text-[#f4efe7] font-jp text-base">${node.result.example}</p>
                </div>
                ${node.result.contrast ? `
                <div class="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <i data-lucide="git-compare" class="w-4 h-4 text-blue-400 shrink-0 mt-0.5"></i>
                    <p class="text-blue-200 text-xs">${node.result.contrast}</p>
                </div>` : ''}
                ${linkBtn}
                <button class="mt-3 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#f4efe7] font-bold rounded-xl transition text-sm" onclick="resetDecisionTree()"><i data-lucide="refresh-cw" class="w-4 h-4 inline mr-1"></i> Coba Lagi</button>
            </div>
        `;

        // Re-enable all question buttons + show only the result
        optionsHtml = '';
    }

    container.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                ${pathHtml ? `<span class="text-xs text-[#555]">${pathHtml}</span>` : ''}
            </div>
            ${backBtn}
        </div>
        <div class="mb-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#b89cff]/20 flex items-center justify-center">
                <i data-lucide="${node.icon || 'help-circle'}" class="w-5 h-5 text-[#b89cff]"></i>
            </div>
            <h3 class="text-lg font-bold text-[#f4efe7]">${node.question}</h3>
        </div>
        <div class="space-y-2">
            ${optionsHtml}
        </div>
        ${resultHtml}
    `;

    lucide.createIcons();
}

function dtNavigate(optionId) {
    let currentNode = decisionTree;
    for (let step of dtHistory) {
        let opt = currentNode.options.find(o => o.id === step.id);
        if (opt && opt.options) currentNode = opt;
        else break;
    }

    let selectedOpt = null;
    let searchNodes = [currentNode];
    while (searchNodes.length > 0) {
        let n = searchNodes.shift();
        if (n.options) {
            let found = n.options.find(o => o.id === optionId);
            if (found) { selectedOpt = found; break; }
            searchNodes.push(...n.options);
        }
    }

    if (selectedOpt) {
        dtHistory.push({ id: selectedOpt.id, label: selectedOpt.label });
        renderDecisionTree(selectedOpt);
    }
}

function dtShowResult(optionId) {
    let currentNode = decisionTree;
    for (let step of dtHistory) {
        let opt = currentNode.options.find(o => o.id === step.id);
        if (opt && opt.options) currentNode = opt;
        else break;
    }

    let searchNodes = [currentNode];
    while (searchNodes.length > 0) {
        let n = searchNodes.shift();
        if (n.options) {
            let found = n.options.find(o => o.id === optionId);
            if (found) { renderDecisionTree(found); return; }
            searchNodes.push(...n.options);
        }
    }
}

function dtGoBack(toIndex) {
    dtHistory = dtHistory.slice(0, toIndex - 1);
    let currentNode = decisionTree;
    for (let step of dtHistory) {
        let opt = currentNode.options.find(o => o.id === step.id);
        if (opt && opt.options) currentNode = opt;
        else break;
    }
    renderDecisionTree(currentNode);
}

document.addEventListener('DOMContentLoaded', () => {
    const dtContainer = document.getElementById('decisionTreeContainer');
    if (dtContainer) {
        resetDecisionTree();
    }
});
