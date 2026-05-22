// ==========================================
// KOTOBA DUNGEON — Vocabulary adventure!
// Uses GameEngine
// ==========================================
let kotobaGame = null;
let kotobaVocab = [];

const KOTOBA_DUNGEONS = [
    { id: 'Angka', name: 'Gua Angka', desc: 'Angka & hitungan: いち, に, さん...', icon: 'hash' },
    { id: 'Waktu', name: 'Menara Waktu', desc: 'Waktu & hari: きょう, あした, まいにち...', icon: 'clock' },
    { id: 'Benda', name: 'Gudang Benda', desc: 'Benda sehari-hari: ほん, くるま, いえ...', icon: 'package' },
    { id: 'Kata Kerja', name: 'Halaman Aksi', desc: 'Kata kerja dasar: たべる, いく, みる...', icon: 'zap' },
    { id: 'Kata Sifat', name: 'Kastil Sifat', desc: 'Kata sifat: おおきい, ちいさい, あたらしい...', icon: 'sparkles' },
    { id: 'Tempat', name: 'Lembah Tempat', desc: 'Tempat & arah: がっこう, えき, みせ...', icon: 'map-pin' },
    { id: 'Lain-lain', name: 'Alam Lain', desc: 'Kosakata umum & sapaan: こんにちは, ありがとう...', icon: 'globe' },
    { id: 'mix', name: 'Kuil Terakhir 🏆', desc: 'Campuran semua kosakata — ujian terakhir!', icon: 'crown' }
];

function loadKotobaData() {
    return new Promise((resolve) => {
        if (kotobaVocab.length > 0) { resolve(kotobaVocab); return; }
        fetch('data/kotoba_n5.json')
            .then(r => r.json())
            .then(d => { kotobaVocab = d; resolve(d); })
            .catch(() => resolve([]));
    });
}

function getKotobaQuestions(dungeonId, count) {
    let pool = [];
    if (dungeonId === 'mix') {
        pool = [...kotobaVocab];
    } else {
        pool = kotobaVocab.filter(v => v.cat === dungeonId);
    }
    if (pool.length === 0) pool = [...kotobaVocab];

    let questions = [];
    let shuffled = shuffleArray(pool);

    for (let v of shuffled) {
        if (questions.length >= count) break;
        let type = Math.floor(Math.random() * 3);
        let soal, jawaban, opts, ansIdx;

        if (type === 0) {
            // Show jp word, pick meaning
            soal = `<div class="text-3xl font-jp mb-1">${v.jp}</div>
                <p class="text-xs text-[#777]">Apa arti kata ini?</p>`;
            let wrong = pool.filter(x => x.jp !== v.jp).map(x => x.id.split(';')[0].trim());
            wrong = wrong.filter((w,i,a) => a.indexOf(w) === i);
            let pick = shuffleArray(wrong).slice(0, 3);
            let correct = v.id.split(';')[0].trim();
            opts = shuffleArray([correct, ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            ansIdx = opts.indexOf(correct);
            questions.push({
                soal, terjemahan: v.romaji || '',
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${v.jp} = ${v.id}`,
                tingkat: 'N5', particleChar: v.jp, jawabanText: correct
            });
        } else if (type === 1) {
            // Show meaning, pick jp word
            let correct = v.jp;
            let arti = v.id.split(';')[0].trim();
            soal = `<p class="text-lg mb-1">"${arti}"</p>
                <p class="text-xs text-[#777]">Pilih kata Jepang yang tepat!</p>`;
            let wrong = pool.filter(x => x.jp !== v.jp).map(x => x.jp);
            wrong = wrong.filter((w,i,a) => a.indexOf(w) === i);
            let pick = shuffleArray(wrong).slice(0, 3);
            opts = shuffleArray([correct, ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            ansIdx = opts.indexOf(correct);
            questions.push({
                soal, terjemahan: v.romaji || '',
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${v.jp} = ${v.id} (${v.cat})`,
                tingkat: 'N5', particleChar: correct, jawabanText: correct
            });
        } else {
            // Show romaji, pick kana
            let correct = v.kana || v.jp;
            soal = `<p class="text-xl mb-1" style="font-style:italic;color:#b89cff">${v.romaji || v.jp}</p>
                <p class="text-xs text-[#777]">Tulis dalam hiragana!</p>`;
            let wrong = pool.filter(x => (x.kana || x.jp) !== correct).map(x => x.kana || x.jp);
            wrong = wrong.filter((w,i,a) => a.indexOf(w) === i);
            let pick = shuffleArray(wrong).slice(0, 3);
            opts = shuffleArray([correct, ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            ansIdx = opts.indexOf(correct);
            questions.push({
                soal, terjemahan: v.id,
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${v.romaji} → ${correct} = ${v.id}`,
                tingkat: 'N5', particleChar: correct, jawabanText: correct
            });
        }
    }

    return shuffleArray(questions).slice(0, count);
}

function initKotobaRPG() {
    loadKotobaData().then(() => {
        kotobaGame = GameEngine.createRPG({
            containerId: 'kotobaGameContainer',
            stateKey: 'gy_jp_kotoba_rpg_state',
            dungeons: KOTOBA_DUNGEONS,
            questionGenerator: getKotobaQuestions,
            title: 'Kotoba Dungeon',
            subtitle: 'Kalahkan monster dengan kosakata Jepang!',
            lobbyTitle: 'Petualangan Kosakata',
        stagesCount: 6,
        resetConfirmMessage: 'Yakin reset semua progress kosakata?',
        renderQuestion: function(stage) { return stage.soal; }
    });

        kotobaGame.init();
        window.game = kotobaGame;
        let container = document.getElementById('kotobaGameContainer');
        if (container) kotobaGame.render();
    });
}

document.addEventListener('DOMContentLoaded', initKotobaRPG);
