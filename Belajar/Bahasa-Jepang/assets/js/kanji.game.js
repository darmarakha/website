// ==========================================
// KANJI QUEST RPG — Adventure learning kanji!
// Uses GameEngine
// ==========================================
let kanjiGame = null;

const KANJI_DUNGEONS = [
    { id: 'angka', name: 'Menara Angka', desc: '一 二 三 四 五 六 七 八 九 十 百 千 万', icon: 'hash' },
    { id: 'waktu', name: 'Kuil Waktu', desc: '日 月 年 時 分 半 今 毎 先 後 前 午 間', icon: 'clock' },
    { id: 'arah/tempat', name: 'Hutan Arah', desc: '上 下 中 外 東 西 南 北 右 左', icon: 'compass' },
    { id: 'orang', name: 'Kastil Orang', desc: '人 子 女 男 友 父 母 名 生', icon: 'users' },
    { id: 'kata kerja dasar', name: 'Lembah Aktivitas', desc: '出 行 見 入 来 話 読 書 聞 食 休', icon: 'zap' },
    { id: 'sekolah', name: 'Akademi Kanji', desc: '学 校 語 電 車 本 金 円 百', icon: 'graduation-cap' },
    { id: 'alam', name: 'Gua Alam', desc: '山 川 水 火 木 金 土 天 雨 気', icon: 'mountain' },
    { id: 'mix', name: 'Kuil Terakhir 🏆', desc: 'Campuran semua kanji — ujian terakhir!', icon: 'crown' }
];

function getKanjiQuestions(dungeonId, count) {
    let pool = [];
    if (typeof KANJI === 'undefined') return [];
    if (dungeonId === 'mix') {
        pool = [...KANJI];
    } else {
        pool = KANJI.filter(k => k.filterGroup === dungeonId);
    }
    if (pool.length === 0) pool = [...KANJI];

    let questions = [];
    let shuffled = shuffleArray(pool);

    for (let k of shuffled) {
        if (questions.length >= count) break;
        let type = Math.floor(Math.random() * 3);
        let soal, options, jawaban, jawabanText;

        if (type === 0) {
            // Show kanji, pick meaning
            soal = `<div class="text-5xl font-jp mb-2">${k.k}</div><p class="text-xs text-[#777]">Apa arti kanji ini?</p>`;
            let wrong = pool.filter(x => x.k !== k.k).map(x => x.meaning.split(';')[0].trim());
            wrong = wrong.filter((v,i,a) => a.indexOf(v) === i);
            let pick = shuffleArray(wrong).slice(0, 3);
            let opts = shuffleArray([k.meaning.split(';')[0].trim(), ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            let ansIdx = opts.indexOf(k.meaning.split(';')[0].trim());
            questions.push({
                soal, terjemahan: `Bacaan: ${k.on} / ${k.kun}`,
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${k.k} = ${k.meaning} (${k.group})`,
                tingkat: 'N5',
                particleChar: k.k,
                jawabanText: k.meaning.split(';')[0].trim()
            });
        } else if (type === 1) {
            // Show meaning, pick kanji
            let meaning = k.meaning.split(';')[0].trim();
            soal = `<p class="text-lg mb-2">"${meaning}"</p><p class="text-xs text-[#777]">Kanji apa yang memiliki arti ini?</p>`;
            let wrong = pool.filter(x => x.k !== k.k).map(x => x.k);
            wrong = wrong.filter((v,i,a) => a.indexOf(v) === i);
            let pick = shuffleArray(wrong).slice(0, 3);
            let opts = shuffleArray([k.k, ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            let ansIdx = opts.indexOf(k.k);
            questions.push({
                soal, terjemahan: `Bacaan: ${k.on} / ${k.kun}`,
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${k.k} = ${k.meaning} (${k.group})`,
                tingkat: 'N5',
                particleChar: k.k,
                jawabanText: k.k
            });
        } else {
            // Show kanji, pick onyomi
            let onList = k.on.split(',').map(s => s.trim()).filter(Boolean);
            if (onList.length === 0) continue;
            let correctOn = onList[0];
            soal = `<div class="text-5xl font-jp mb-2">${k.k}</div><p class="text-xs text-[#777]">Pilih onyomi (baca Cina) yang benar!</p>`;
            let wrong = pool.filter(x => x.k !== k.k).flatMap(x => x.on.split(',').map(s => s.trim())).filter(Boolean);
            wrong = wrong.filter((v,i,a) => a.indexOf(v) === i).filter(x => x !== correctOn);
            let pick = shuffleArray(wrong).slice(0, 3);
            let opts = shuffleArray([correctOn, ...pick]).slice(0, 4);
            if (opts.length < 2) continue;
            let ansIdx = opts.indexOf(correctOn);
            questions.push({
                soal, terjemahan: `Kunyomi: ${k.kun} · Arti: ${k.meaning}`,
                options: opts.map((o,i) => `${String.fromCharCode(65+i)}. ${o}`),
                jawaban: ansIdx,
                penjelasan: `${k.k}: onyomi=${k.on}, kunyomi=${k.kun}`,
                tingkat: 'N5',
                particleChar: correctOn,
                jawabanText: correctOn
            });
        }
    }

    return shuffleArray(questions).slice(0, count);
}

function initKanjiRPG() {
    kanjiGame = GameEngine.createRPG({
        containerId: 'kanjiGameContainer',
        stateKey: 'gy_jp_kanji_rpg_state',
        dungeons: KANJI_DUNGEONS,
        questionGenerator: getKanjiQuestions,
        title: 'Kanji Quest RPG',
        subtitle: 'Kalahkan monster dengan ilmu kanji!',
        lobbyTitle: 'Petualangan Kanji',
        stagesCount: 6,
        resetConfirmMessage: 'Yakin reset semua progress kanji game?',
        renderQuestion: function(stage) { return stage.soal; }
    });

    kanjiGame.init();
    window.game = kanjiGame;
    let container = document.getElementById('kanjiGameContainer');
    if (container) kanjiGame.render();
}

document.addEventListener('DOMContentLoaded', initKanjiRPG);
