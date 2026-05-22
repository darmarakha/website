// ==========================================
// PARTICLE QUEST RPG — Refactored (uses GameEngine)
// ==========================================
let game = null;

const DUNGEONS = [
    { id: 'penanda-fungsi-utama', name: 'Kuil Fungsi Utama', desc: 'Partikel dasar: は, が, を, に, で, へ, の, と', icon: 'key' },
    { id: 'perbandingan-batasan', name: 'Menara Perbandingan', desc: 'Batas & skala: から, まで, だけ, しか, より, ほど', icon: 'arrow-up-down' },
    { id: 'daftar-pilihan', name: 'Gerbang Daftar & Pilihan', desc: 'Daftar & opsi: と, や, か, とか', icon: 'list' },
    { id: 'fokus-penekanan', name: 'Kastil Fokus', desc: 'Penekanan: も, こそ, さえ, でも', icon: 'target' },
    { id: 'akhir-kalimat', name: 'Lembah Akhir Kalimat', desc: 'Partikel akhir: か, ね, よ, よね, な, かな', icon: 'message-square' },
    { id: 'penghubung', name: 'Jembatan Penghubung', desc: 'Penghubung: が, けど, から, ので, のに, ながら, たり, し', icon: 'link-2' },
    { id: 'mix', name: 'Kuil Terakhir 🏆', desc: 'Campuran semua partikel — ujian terakhir!', icon: 'crown' }
];

function getParticleQuestions(dungeonId, count) {
    let pool = (typeof partikelData !== 'undefined')
        ? (dungeonId === 'mix' ? [...partikelData] : partikelData.filter(p => p.kategori && p.kategori.includes(dungeonId)))
        : [];

    if (pool.length === 0 && typeof partikelData !== 'undefined') pool = [...partikelData];
    if (pool.length === 0) return [];

    let questions = [];
    let shuffled = shuffleArray(pool);

    for (let p of shuffled) {
        if (questions.length >= count) break;
        if (!p.contoh || p.contoh.length === 0) continue;
        let contoh = p.contoh[Math.floor(Math.random() * p.contoh.length)];
        let parts = (contoh.jp || '').split(p.char);
        if (parts.length < 2) continue;
        let blanked = parts.join('___');
        let wrongOptions = pool
            .filter(x => x.id !== p.id && x.char && x.char !== p.char)
            .map(x => x.char)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 3);
        let options = shuffleArray([p.char, ...wrongOptions]).slice(0, 4);
        if (options.length < 2) continue;
        questions.push({
            soal: blanked,
            terjemahan: contoh.id || '',
            options: options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`),
            jawaban: options.indexOf(p.char),
            penjelasan: (p.penjelasanSingkat || p.fungsi || 'Partikel ' + p.char),
            tingkat: p.tingkat || 'N5',
            particleChar: p.char,
            jawabanText: `${p.char} (${p.romaji})`
        });
    }

    // Fallback to generateQuestions if needed
    if (questions.length < count && typeof generateQuestions === 'function') {
        let extra = generateQuestions(count - questions.length);
        extra.forEach(eq => {
            if (eq.type === 'mcq') questions.push({
                soal: eq.soal, terjemahan: eq.terjemahan || '',
                options: eq.options, jawaban: eq.jawaban,
                penjelasan: eq.penjelasan || 'Partikel yang tepat.',
                tingkat: 'N5', particleChar: '?', jawabanText: '?'
            });
        });
    }
    return shuffleArray(questions).slice(0, count);
}

function initParticleRPG() {
    game = GameEngine.createRPG({
        containerId: 'rpgGameContainer',
        stateKey: 'gy_jp_rpg_state',
        dungeons: DUNGEONS,
        questionGenerator: getParticleQuestions,
        title: 'Particle Quest RPG',
        subtitle: 'Kalahkan monster grammar dengan memilih partikel yang tepat!',
        lobbyTitle: 'Petualangan Partikel',
        getBossName: function(dungeon) {
            return dungeon.id === 'mix' ? '👑 RAJA GRAMMAR' : '🐉 BOSS';
        },
        victoryTitle: function(dungeon) {
            return dungeon.id === 'mix' ? 'SELAMAT! KAMU MENJADI PARTIKEL MASTER!' : 'Boss Dikalahkan!';
        },
        victoryMessage: function(dungeon) {
            return dungeon.id === 'mix'
                ? 'Kamu telah menguasai semua partikel Jepang!'
                : dungeon.name + ' berhasil ditaklukkan!';
        },
        isFinalBoss: function(dungeon) { return dungeon.id === 'mix'; },
        resetConfirmMessage: 'Yakin reset semua progress game?'
    });

    game.init();
    window.game = game;
    let container = document.getElementById('rpgGameContainer');
    if (container) game.render();
}

document.addEventListener('DOMContentLoaded', initParticleRPG);
