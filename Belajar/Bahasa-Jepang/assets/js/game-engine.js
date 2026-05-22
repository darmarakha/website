// ==========================================
// GAME ENGINE — Shared RPG Engine for All Modules
// Usage: const game = GameEngine.createRPG(config);
// ==========================================
const GameEngine = (function() {

function loadState(key, defaultState) {
    try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return JSON.parse(JSON.stringify(defaultState));
}

function renderHpBar(hp, maxHp) {
    let pct = Math.max(0, Math.round((hp / maxHp) * 100));
    let color = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-amber-500' : 'bg-rose-500';
    return { pct, color };
}

function shuffleArray(arr) {
    let a = [...arr], i = a.length, j;
    while (i) { j = Math.floor(Math.random() * i); i--; [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

function checkLevelUp(player, onLevelUp) {
    let leveled = false;
    while (player.xp >= player.level * 100) {
        player.xp -= player.level * 100;
        player.level++;
        player.maxHp += 10;
        player.hp = Math.min(player.maxHp, player.hp + 30);
        leveled = true;
    }
    if (leveled && typeof onLevelUp === 'function') onLevelUp(player);
}

function createRPG(config) {
    const C = Object.assign({
        containerId: 'rpgGameContainer',
        stateKey: 'gy_jp_rpg_state',
        title: 'RPG Quest',
        subtitle: 'Petualangan belajar!',
        lobbyTitle: 'Pilih Dungeon',
        xpPerQuestion: 15,
        bossXp: 30,
        bossXpBonus: 50,
        healAmount: 30,
        damagePerWrong: 10,
        bossDamage: 20,
        stagesCount: 6,
        bossStagesCount: 5,
        resetConfirmMessage: 'Yakin reset semua progress game?',
        renderQuestion: function(stage) {
            return `<p class="text-[#f4efe7] text-xl md:text-2xl text-center font-jp font-medium leading-relaxed">${stage.soal}</p>
                ${stage.terjemahan ? `<p class="text-[#777] text-xs text-center mt-2">${stage.terjemahan}</p>` : ''}`;
        },
        getEnemy: function(idx) {
            const icons = ['👹','👾','🤖','👻','🦴','🐉','🦇','🧟'];
            const names = ['Grammar Slime','Partikel Goblin','Joshi Ghost','Tata-Bot','Kanji Skeleton','Bunpou Dragon','Huruf Bat','N5 Zombie'];
            return { icon: icons[idx % icons.length], name: names[idx % names.length] };
        },
        getBossName: function() { return '🐉 BOSS'; },
        victoryTitle: function() { return 'Boss Dikalahkan!'; },
        victoryMessage: function() { return 'Dungeon berhasil ditaklukkan!'; },
        isFinalBoss: function() { return false; },
        onBossVictory: function() {}
    }, config);

    let state = null;
    let game = {};

    function save() {
        if (state) localStorage.setItem(C.stateKey, JSON.stringify(state));
    }

    function init() {
        const def = {
            player: { hp: 100, maxHp: 100, xp: 0, level: 1, hints: 3, maxHints: 3 },
            dungeons: C.dungeons.map(d => ({ ...d, completed: false, bossDefeated: false, bestScore: 0 })),
            currentDungeonIdx: -1, currentStage: 0, dungeonStages: [], bossMode: false,
            lastResult: null, unlockedDungeons: 1, defeatedBosses: []
        };
        state = loadState(C.stateKey, def);
        if (!state.dungeons || state.dungeons.length === 0) {
            state = JSON.parse(JSON.stringify(def));
        }
        save();
    }

    function getContainer() {
        return document.getElementById(C.containerId);
    }

    function enterDungeon(idx) {
        if (!state || idx >= state.unlockedDungeons) return;
        state.dungeonStages = C.questionGenerator(C.dungeons[idx].id, C.stagesCount);
        if (!state.dungeonStages || state.dungeonStages.length === 0) {
            showToast('Tidak ada soal tersedia untuk dungeon ini.', 'error');
            return;
        }
        state.currentDungeonIdx = idx;
        state.currentStage = 0;
        state.bossMode = false;
        state.lastResult = null;
        save();
        render();
    }

    function leaveDungeon() {
        if (!state) return;
        state.currentDungeonIdx = -1;
        state.currentStage = 0;
        state.bossMode = false;
        state.lastResult = null;
        save();
        render();
    }

    function healPlayer() {
        if (!state) return;
        state.player.hp = state.player.maxHp;
        state.player.hints = state.player.maxHints;
        state.currentDungeonIdx = -1;
        state.currentStage = 0;
        state.bossMode = false;
        state.lastResult = null;
        save();
    }

    function useHint() {
        if (!state || state.player.hints <= 0) return;
        state.player.hints--;
        save();
        const hintBox = document.getElementById('rpgHintBox');
        if (hintBox) hintBox.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function answerStage(selectedIdx, btn) {
        if (state.lastResult) return;
        if (state.player.hp <= 0) return;
        const stage = state.dungeonStages[state.currentStage];
        if (!stage) return;
        const isCorrect = selectedIdx === stage.jawaban;
        const feedback = document.getElementById('rpgFeedback');
        const nextBtn = document.getElementById('rpgNextBtn');
        const options = document.querySelectorAll('.rpg-option');
        options.forEach(o => o.disabled = true);

        if (isCorrect) {
            btn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
            let xp = C.xpPerQuestion + (stage.tingkat === 'N4' ? 5 : 0) + (stage.tingkat === 'N3' ? 10 : 0);
            state.player.xp += xp;
            feedback.className = "mt-4 p-3 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
            feedback.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i> <strong>Tepat!</strong> +${xp} XP. ${stage.penjelasan || ''}`;
        } else {
            btn.classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
            let correctOpt = options[stage.jawaban];
            if (correctOpt) correctOpt.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
            state.player.hp = Math.max(0, state.player.hp - C.damagePerWrong);
            feedback.className = "mt-4 p-3 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block";
            feedback.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 inline mr-1"></i> <strong>Kurang tepat.</strong> -${C.damagePerWrong} HP. Jawaban: ${stage.particleChar || stage.jawabanText || ''}.`;
        }

        state.lastResult = { correct: isCorrect };
        checkLevelUp(state.player, () => {
            if (typeof showToast === 'function') showToast('Level Up!', `Level ${state.player.level}!`);
        });
        save();

        if (state.player.hp <= 0) {
            setTimeout(() => renderGameOver(), 1200);
            return;
        }
        nextBtn.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function nextStage() {
        state.currentStage++;
        state.lastResult = null;
        save();
        render();
    }

    function startBossBattle() {
        if (!state) return;
        state.bossMode = true;
        state.currentStage = 0;
        state.lastResult = null;
        const dungeon = state.dungeons[state.currentDungeonIdx];
        state.dungeonStages = C.questionGenerator(dungeon.id, C.bossStagesCount);
        save();
        render();
    }

    function answerBoss(selectedIdx, btn) {
        if (state.lastResult) return;
        if (state.player.hp <= 0) return;
        const stage = state.dungeonStages[state.currentStage];
        if (!stage) return;
        const isCorrect = selectedIdx === stage.jawaban;
        const feedback = document.getElementById('rpgBossFeedback');
        const options = document.querySelectorAll('.rpg-option');
        options.forEach(o => o.disabled = true);

        if (isCorrect) {
            btn.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
            state.player.xp += C.bossXp;
            feedback.className = "mt-4 p-3 rounded-xl text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 block";
            feedback.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 inline mr-1"></i> <strong>Serangan tepat!</strong> +${C.bossXp} XP`;
        } else {
            btn.classList.add('bg-rose-500/20', 'border-rose-500/50', 'text-rose-400');
            let correctOpt = options[stage.jawaban];
            if (correctOpt) correctOpt.classList.add('bg-emerald-500/20', 'border-emerald-500/50', 'text-emerald-400');
            state.player.hp = Math.max(0, state.player.hp - C.bossDamage);
            feedback.className = "mt-4 p-3 rounded-xl text-sm border border-rose-500/30 bg-rose-500/10 text-rose-400 block";
            feedback.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4 inline mr-1"></i> <strong>Kena serangan balik!</strong> -${C.bossDamage} HP. Jawaban: ${stage.particleChar || stage.jawabanText || ''}.`;
        }

        state.lastResult = { correct: isCorrect };
        checkLevelUp(state.player, () => {
            if (typeof showToast === 'function') showToast('Level Up!', `Level ${state.player.level}!`);
        });
        save();

        if (state.player.hp <= 0) {
            setTimeout(() => renderGameOver(), 1200);
            return;
        }

        setTimeout(() => {
            state.currentStage++;
            state.lastResult = null;
            save();
            render();
        }, 1500);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function resetProgress() {
        if (!confirm(C.resetConfirmMessage)) return;
        localStorage.removeItem(C.stateKey);
        init();
        render();
    }

    // ---- RENDER ----

    function render() {
        const container = getContainer();
        if (!container) return;
        if (!state || state.currentDungeonIdx < 0) { renderLobby(container); return; }
        const dungeon = state.dungeons[state.currentDungeonIdx];
        const stages = state.dungeonStages;
        const stage = stages[state.currentStage];

        if (state.bossMode) {
            if (!stage || state.currentStage >= stages.length) renderBossVictory(container);
            else renderBossBattle(container);
        } else {
            if (!stage || state.currentStage >= stages.length) renderBossIntro(container);
            else renderBattle(container);
        }
    }

    function renderLobby(container) {
        const p = state.player;
        const xpNeeded = p.level * 100;
        const xpBar = Math.min(100, Math.round((p.xp / xpNeeded) * 100));

        let dungeonsHtml = state.dungeons.map((d, idx) => {
            let locked = idx >= state.unlockedDungeons;
            let completed = d.completed && d.bossDefeated;
            let inProgress = state.currentDungeonIdx === idx;
            let statusIcon = completed
                ? '<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>'
                : locked ? '<i data-lucide="lock" class="w-5 h-5 text-[#555]"></i>'
                : inProgress ? '<i data-lucide="play-circle" class="w-5 h-5 text-[#b89cff]"></i>'
                : '<i data-lucide="chevron-right" class="w-5 h-5 text-[#777]"></i>';
            let clickHandler = locked ? '' : `onclick="game.enterDungeon(${idx})"`;
            return `<div class="rounded-xl border ${locked ? 'border-white/5 opacity-40' : completed ? 'border-emerald-500/30' : inProgress ? 'border-[#b89cff]/50' : 'border-white/10 hover:border-[#b89cff]/40'} bg-[#161b22] p-4 transition-all cursor-pointer" ${clickHandler}>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2"><i data-lucide="${d.icon}" class="w-4 h-4 ${locked ? 'text-[#555]' : 'text-[#b89cff]'}"></i><h4 class="font-bold text-sm text-[#f4efe7]">${d.name}</h4></div>
                    ${statusIcon}
                </div>
                <p class="text-xs text-[#777]">${d.desc}</p>
                ${d.bestScore > 0 ? `<p class="text-xs text-[#b89cff] mt-1">Best: ${d.bestScore} pts</p>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="text-center mb-6">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold mb-4">
                    <i data-lucide="swords" class="w-4 h-4"></i> ${C.title}
                </div>
                <h2 class="text-3xl font-bold mb-2">${C.lobbyTitle}</h2>
                <p class="text-neutral-400 text-sm">${C.subtitle}</p>
            </div>
            <div class="bg-[#161b22] rounded-2xl border border-white/10 p-4 mb-6">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#b89cff] to-emerald-400 flex items-center justify-center text-[#12161d] font-bold text-sm">${p.level}</div>
                        <div><p class="text-sm font-bold text-[#f4efe7]">Level ${p.level} Master</p><p class="text-xs text-[#777]">${p.xp}/${xpNeeded} XP</p></div>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-[#777]">
                        <span><i data-lucide="heart" class="w-3 h-3 inline text-rose-400"></i> ${p.hp}/${p.maxHp}</span>
                        <span><i data-lucide="lightbulb" class="w-3 h-3 inline text-amber-400"></i> ${p.hints}x</span>
                    </div>
                </div>
                <div class="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden border border-white/5">
                    <div class="h-full bg-gradient-to-r from-[#b89cff] to-emerald-400 rounded-full transition-all duration-500" style="width:${xpBar}%"></div>
                </div>
            </div>
            <div class="grid gap-3">${dungeonsHtml}</div>
            <div class="mt-6 text-center">
                <button class="text-xs text-[#777] hover:text-white transition underline" onclick="game.resetProgress()">Reset Progress Game</button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderBattle(container) {
        const p = state.player;
        const dungeon = state.dungeons[state.currentDungeonIdx];
        const stage = state.dungeonStages[state.currentStage];
        let totalStages = state.dungeonStages.length;
        let progress = Math.round((state.currentStage / totalStages) * 100);
        let enemy = C.getEnemy(state.currentStage);
        let hp = renderHpBar(p.hp, p.maxHp);

        let optionsHtml = stage.options.map((opt, idx) =>
            `<button class="rpg-option w-full text-left p-3 rounded-xl border border-white/10 bg-[#0d1117] hover:bg-[#1c2333] hover:border-[#b89cff]/40 transition-all text-[#f4efe7] font-jp font-medium text-base" onclick="game.answerStage(${idx}, this)">${opt}</button>`
        ).join('');

        container.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <button class="text-xs text-[#777] hover:text-white transition flex items-center gap-1" onclick="game.leaveDungeon()"><i data-lucide="arrow-left" class="w-3 h-3"></i> Mundur</button>
                    <span class="text-xs text-[#b89cff] font-bold">${dungeon.name} · Stage ${state.currentStage + 1}/${totalStages}</span>
                    <span class="text-xs text-[#777]">${stage.tingkat || ''}</span>
                </div>
                <div class="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden mb-6 border border-white/5">
                    <div class="h-full bg-gradient-to-r from-[#b89cff] to-emerald-400 rounded-full transition-all duration-500" style="width:${progress}%"></div>
                </div>
                <div class="flex items-center justify-between mb-4 text-xs">
                    <div class="flex items-center gap-2">
                        <i data-lucide="heart" class="w-4 h-4 text-rose-400"></i>
                        <div class="w-24 h-2 bg-[#0d1117] rounded-full overflow-hidden border border-white/5"><div class="h-full ${hp.color} rounded-full transition-all duration-500" style="width:${hp.pct}%"></div></div>
                        <span class="text-[#777]">${p.hp}/${p.maxHp}</span>
                    </div>
                    <button class="text-amber-400 hover:text-amber-300 transition text-xs flex items-center gap-1" onclick="game.useHint()">
                        <i data-lucide="lightbulb" class="w-3 h-3"></i> Hint (${p.hints}x)
                    </button>
                </div>
                <div class="text-center mb-6">
                    <div class="text-6xl mb-2">${enemy.icon}</div>
                    <p class="text-xs text-[#777] font-bold uppercase tracking-wider">${enemy.name}</p>
                </div>
                <div class="bg-[#161b22] rounded-2xl border border-white/10 p-5 mb-4">
                    <p class="text-[#a9a29a] text-xs mb-2 text-center">Pilih jawaban yang tepat:</p>
                    ${C.renderQuestion(stage)}
                </div>
                <div id="rpgHintBox" class="hidden mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs">
                    <i data-lucide="info" class="w-3 h-3 inline mr-1"></i> Petunjuk: ${stage.penjelasan || ''}
                </div>
                <div class="space-y-2">${optionsHtml}</div>
                <div id="rpgFeedback" class="hidden mt-4 p-3 rounded-xl text-sm border"></div>
                <button id="rpgNextBtn" class="hidden mt-4 w-full py-3 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition text-sm" onclick="game.nextStage()">Stage Selanjutnya <i data-lucide="arrow-right" class="w-4 h-4 inline"></i></button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderBossIntro(container) {
        const p = state.player;
        const dungeon = state.dungeons[state.currentDungeonIdx];
        if (state.bossMode) { renderBossBattle(container); return; }
        let hp = renderHpBar(p.hp, p.maxHp);
        let isFinal = C.isFinalBoss(dungeon);

        container.innerHTML = `
            <div class="max-w-md mx-auto text-center">
                <div class="flex items-center justify-between mb-6">
                    <button class="text-xs text-[#777] hover:text-white transition flex items-center gap-1" onclick="game.leaveDungeon()"><i data-lucide="arrow-left" class="w-3 h-3"></i> Mundur</button>
                    <span class="text-xs text-[#b89cff] font-bold">${dungeon.name} · Selesai!</span>
                </div>
                <div class="text-7xl mb-4">${isFinal ? '🏆' : '🐉'}</div>
                <h3 class="text-2xl font-bold text-[#f4efe7] mb-2">${isFinal ? 'Boss Terakhir!' : 'Boss Muncul!'}</h3>
                <p class="text-[#a9a29a] text-sm mb-4">Kamu berhasil melewati semua stage! Sekarang saatnya ${isFinal ? 'pertempuran terakhir' : 'menghadapi BOSS'}!</p>
                <div class="flex items-center justify-center gap-4 mb-6 text-xs">
                    <div class="flex items-center gap-2">
                        <i data-lucide="heart" class="w-4 h-4 text-rose-400"></i>
                        <div class="w-20 h-2 bg-[#0d1117] rounded-full overflow-hidden border border-white/5"><div class="h-full ${hp.color} rounded-full transition-all" style="width:${hp.pct}%"></div></div>
                        <span class="text-[#777]">${p.hp}/${p.maxHp}</span>
                    </div>
                </div>
                <button class="px-8 py-3 bg-gradient-to-r from-rose-500 to-[#b89cff] hover:from-rose-400 hover:to-[#b89cff] text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 text-lg" onclick="game.startBossBattle()">⚔️ Lawan Boss!</button>
                <button class="block mx-auto mt-3 text-xs text-[#777] hover:text-white transition underline" onclick="game.leaveDungeon()">Mundur dulu...</button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderBossBattle(container) {
        const p = state.player;
        const dungeon = state.dungeons[state.currentDungeonIdx];
        const stage = state.dungeonStages[state.currentStage];
        let totalStages = state.dungeonStages.length;
        let progress = Math.round((state.currentStage / totalStages) * 100);
        let bossName = C.getBossName(dungeon);
        let hp = renderHpBar(p.hp, p.maxHp);

        let optionsHtml = stage.options.map((opt, idx) =>
            `<button class="rpg-option w-full text-left p-3 rounded-xl border border-white/10 bg-[#0d1117] hover:bg-[#1c2333] hover:border-rose-500/40 transition-all text-[#f4efe7] font-jp font-medium text-base" onclick="game.answerBoss(${idx}, this)">${opt}</button>`
        ).join('');

        container.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs text-rose-400 font-bold">⚔️ BOSS BATTLE · ${dungeon.name}</span>
                    <span class="text-xs text-[#777]">${state.currentStage + 1}/${totalStages}</span>
                </div>
                <div class="w-full h-2 bg-[#0d1117] rounded-full overflow-hidden mb-4 border border-rose-500/20">
                    <div class="h-full bg-gradient-to-r from-rose-500 to-[#b89cff] rounded-full transition-all duration-500" style="width:${progress}%"></div>
                </div>
                <div class="flex items-center justify-between mb-4 text-xs">
                    <div class="flex items-center gap-2">
                        <i data-lucide="heart" class="w-4 h-4 text-rose-400"></i>
                        <div class="w-24 h-2 bg-[#0d1117] rounded-full overflow-hidden border border-white/5"><div class="h-full ${hp.color} rounded-full transition-all" style="width:${hp.pct}%"></div></div>
                        <span class="text-[#777]">${p.hp}/${p.maxHp}</span>
                    </div>
                </div>
                <div class="text-center mb-4">
                    <div class="text-7xl mb-2">${bossName.split(' ')[0]}</div>
                    <p class="text-xs text-rose-400 font-bold uppercase tracking-wider">${bossName} menantangmu!</p>
                </div>
                <div class="bg-[#1a0d0d] border border-rose-500/30 rounded-2xl p-5 mb-4">
                    ${C.renderQuestion(stage)}
                </div>
                <div class="space-y-2">${optionsHtml}</div>
                <div id="rpgBossFeedback" class="hidden mt-4 p-3 rounded-xl text-sm border"></div>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderBossVictory(container) {
        const dungeon = state.dungeons[state.currentDungeonIdx];
        dungeon.bossDefeated = true;
        dungeon.completed = true;
        let score = Math.max(0, 100 - (state.player.maxHp - state.player.hp));
        if (score > dungeon.bestScore) dungeon.bestScore = score;
        state.player.xp += C.bossXpBonus;
        if (state.currentDungeonIdx + 1 < state.dungeons.length) {
            state.unlockedDungeons = Math.max(state.unlockedDungeons, state.currentDungeonIdx + 2);
        }
        checkLevelUp(state.player);
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + C.healAmount);
        C.onBossVictory(dungeon, state);
        save();

        let isFinal = C.isFinalBoss(dungeon);
        container.innerHTML = `
            <div class="max-w-md mx-auto text-center">
                <div class="text-7xl mb-4">${isFinal ? '👑🏆' : '🎉'}</div>
                <h3 class="text-2xl font-bold text-emerald-400 mb-2">${C.victoryTitle(dungeon)}</h3>
                <p class="text-[#a9a29a] text-sm mb-6">${C.victoryMessage(dungeon)}</p>
                <div class="bg-[#161b22] rounded-2xl border border-emerald-500/30 p-4 mb-6">
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div><p class="text-2xl font-bold text-emerald-400">+${C.bossXpBonus}</p><p class="text-xs text-[#777]">XP Bonus</p></div>
                        <div><p class="text-2xl font-bold text-emerald-400">+${C.healAmount}</p><p class="text-xs text-[#777]">HP Pulih</p></div>
                        <div><p class="text-2xl font-bold text-[#f4efe7]">${score}</p><p class="text-xs text-[#777]">Skor</p></div>
                        <div><p class="text-2xl font-bold text-[#b89cff]">${state.player.level}</p><p class="text-xs text-[#777]">Level</p></div>
                    </div>
                </div>
                <button class="px-8 py-3 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition" onclick="game.leaveDungeon()">Kembali ke Lobby</button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function renderGameOver() {
        const container = getContainer();
        if (!container) return;
        state.player.hp = Math.max(0, state.player.hp);
        save();
        container.innerHTML = `
            <div class="max-w-md mx-auto text-center">
                <div class="text-7xl mb-4">💀</div>
                <h3 class="text-2xl font-bold text-rose-400 mb-2">Game Over</h3>
                <p class="text-[#a9a29a] text-sm mb-6">HP-mu habis! Istirahat dulu, lalu coba lagi.</p>
                <div class="bg-[#161b22] rounded-2xl border border-rose-500/30 p-4 mb-6">
                    <p class="text-xs text-[#777]">Level saat ini: <span class="text-[#f4efe7] font-bold">${state.player.level}</span></p>
                    <p class="text-xs text-[#777]">XP: <span class="text-[#f4efe7] font-bold">${state.player.xp}</span></p>
                </div>
                <button class="px-8 py-3 bg-[#b89cff] hover:bg-[#a68af2] text-[#12161d] font-bold rounded-xl transition" onclick="game.healPlayer();">
                    Pulihkan HP & Kembali
                </button>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // ---- Game object ----
    game = {
        get state() { return state; }, config: C,
        init, save, render,
        enterDungeon, leaveDungeon, healPlayer,
        useHint, answerStage, nextStage,
        startBossBattle, answerBoss,
        resetProgress,
        // expose for engine internals
        renderLobby, renderBattle, renderBossIntro,
        renderBossBattle, renderBossVictory, renderGameOver
    };

    return game;
}

return { createRPG };
})();
