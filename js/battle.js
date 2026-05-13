// battle.js

const POKEMON_MOVES_MAP = {
    // We will generate unique moves based on the pokemon image filename
    // Standard movesets
    "electric": [
        { name: "十萬伏特", msg: "強大的電流貫穿了全場！" },
        { name: "打雷", msg: "召喚了烏雲降下致命的雷擊！" },
        { name: "電光一閃", msg: "化作一道白光在敵人間穿梭！" },
        { name: "影子分身", msg: "幻化出無數殘影干擾對手！" }
    ],
    "fire": [
        { name: "噴射火焰", msg: "熾熱的火焰席捲了對手！" },
        { name: "大字爆炎", msg: "爆發出大字型的烈焰衝擊！" },
        { name: "火焰輪", msg: "全身包裹火焰衝向對手！" },
        { name: "煙幕", msg: "噴出濃煙遮蔽了視線！" }
    ],
    "water": [
        { name: "水炮", msg: "噴射出高壓水流重擊對手！" },
        { name: "泡沫光線", msg: "發射出無數繽紛的泡沫！" },
        { name: "衝浪", msg: "召喚巨大的海浪淹沒戰場！" },
        { name: "縮入殼中", msg: "縮進殼裡大幅提升了防禦！" }
    ],
    "grass": [
        { name: "飛葉快刀", msg: "發射出如刀刃般鋒利的葉片！" },
        { name: "陽光烈焰", msg: "吸收陽光後發射強大的光束！" },
        { name: "藤鞭", msg: "揮動細長的藤蔓抽打對手！" },
        { name: "寄生種子", msg: "在對手身上種下吸取體力的種子！" }
    ],
    "psychic": [
        { name: "精神強念", msg: "釋放出強大的念力波！" },
        { name: "幻象光線", msg: "發射出奇幻的光線干擾意識！" },
        { name: "瞬間移動", msg: "瞬間消失並出現在對手身後！" },
        { name: "冥想", msg: "靜下心來提升了特攻與特防！" }
    ]
};

const BattleCenter = {
    selectedPokemon: null,
    isBattling: false,

    getMovesForPokemon(img) {
        // Deterministically pick a moveset based on filename hash
        const types = Object.keys(POKEMON_MOVES_MAP);
        let hash = 0;
        for (let i = 0; i < img.length; i++) {
            hash = img.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % types.length;
        return POKEMON_MOVES_MAP[types[index]];
    },

    init() {
        document.getElementById('open-battle-center-btn').addEventListener('click', () => {
            this.open();
        });

        document.getElementById('close-battle-modal-btn').addEventListener('click', () => {
            this.close();
        });

        document.getElementById('close-console-btn').addEventListener('click', () => {
            this.close();
        });

        document.getElementById('start-battle-action-btn').addEventListener('click', () => {
            this.start();
        });
    },

    open() {
        if (!Auth.currentUser) return;
        
        // 1. Check requirements (Completed Pokemon)
        const inventory = Auth.currentUser.stats.pokemon_inventory || {};
        const completedPokemons = Object.keys(inventory).filter(img => inventory[img] >= 4);

        if (completedPokemons.length === 0) {
            alert('你需要至少一隻完整的寶可夢（拼圖 4/4）才能進入對戰中心！');
            return;
        }

        // 2. Check Hourly Limit
        if (this.isLimitReached()) {
            alert('寶可夢玩家累了要休息了');
            return;
        }

        // 3. Show Modal and Populate List
        this.selectedPokemon = null;
        document.getElementById('start-battle-action-btn').disabled = true;
        this.populatePokemonList(completedPokemons);
        this.updateLimitUI();

        const modal = document.getElementById('battle-center-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
        
        document.getElementById('battle-setup-view').classList.remove('hidden');
        document.getElementById('battle-console-view').classList.add('hidden');
    },

    close() {
        if (this.isBattling) return;
        const modal = document.getElementById('battle-center-modal');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    },

    isLimitReached() {
        const stats = Auth.currentUser.stats.battle_stats || { count: 0, window_start: 0 };
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;

        if (!stats.window_start || now - stats.window_start > ONE_HOUR) {
            // Reset for new hour window
            stats.count = 0;
            stats.window_start = now;
            Auth.currentUser.stats.battle_stats = stats;
            Auth.saveProgress();
        }
        return stats.count >= 3;
    },

    updateLimitUI() {
        const stats = Auth.currentUser.stats.battle_stats || { count: 0 };
        document.getElementById('battle-limit-text').textContent = `每小時剩餘次數: ${3 - stats.count} / 3`;
    },

    populatePokemonList(list) {
        const container = document.getElementById('battle-pokemon-list');
        container.innerHTML = '';
        
        list.forEach(img => {
            const div = document.createElement('div');
            div.className = "flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-red-500 transition p-1 bg-white/5";
            div.innerHTML = `<img src="pokemons/${img}" class="w-full h-full object-contain">`;
            
            div.addEventListener('click', () => {
                Array.from(container.children).forEach(c => c.classList.remove('border-red-500', 'bg-red-500/20'));
                div.classList.add('border-red-500', 'bg-red-500/20');
                this.selectedPokemon = img;
                document.getElementById('start-battle-action-btn').disabled = false;
            });
            container.appendChild(div);
        });
    },

    async start() {
        const bet = parseInt(document.getElementById('battle-bet-amount').value);
        if (isNaN(bet) || bet < 100) {
            alert('最低下注金額為 100 Bee Coins！');
            return;
        }

        if (Auth.currentUser.stats.bee_coins < bet) {
            alert('你的 Bee Coins 不夠喔！');
            return;
        }

        // Deduct bet
        Auth.currentUser.stats.bee_coins -= bet;
        Auth.saveProgress();
        UI.updateDashboard();

        // Start battle music
        const battleMusic = document.getElementById('battle-bg-music');
        if (battleMusic) {
            battleMusic.currentTime = 0;
            battleMusic.play().catch(e => console.warn("Battle music blocked:", e));
        }

        this.isBattling = true;
        document.getElementById('battle-setup-view').classList.add('hidden');
        document.getElementById('battle-console-view').classList.remove('hidden');
        document.getElementById('close-console-btn').classList.add('hidden');
        
        const logContainer = document.getElementById('battle-log-container');
        logContainer.innerHTML = '';

        // Run simulation
        await this.runBattleSimulation(bet);
    },

    async runBattleSimulation(bet) {
        const logContainer = document.getElementById('battle-log-container');
        const timerEl = document.getElementById('battle-timer');
        
        // Start timer animation
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${h}:${m}:${s}`;
        }, 1000);

        await this.writeLog('>>> 正在連線至對戰衛星...', logContainer);
        await this.writeLog('>>> 連線成功。加密通道已開啟。', logContainer);
        await this.writeLog('>>> 警告：偵測到火箭隊特務接近！', logContainer);
        await new Promise(r => setTimeout(r, 800));

        // Random Enemy
        const enemies = [
            { name: "瓦斯彈 (Koffing)", moves: ["污泥攻擊", "煙幕", "毒針", "自爆"] },
            { name: "阿柏蛇 (Ekans)", moves: ["咬咬", "大蛇瞪眼", "毒針", "捆綁"] },
            { name: "喵喵 (Meowth)", moves: ["聚寶功", "亂抓", "咬住", "擊掌奇襲"] },
            { name: "雙彈瓦斯 (Weezing)", moves: ["污泥炸彈", "黑霧", "毒瓦斯", "撞擊"] },
            { name: "阿柏怪 (Arbok)", moves: ["劇毒牙", "咬碎", "毒液衝擊", "瞪眼"] }
        ];
        const enemy = enemies[Math.floor(Math.random() * enemies.length)];
        const myMoves = this.getMovesForPokemon(this.selectedPokemon);
        const myName = POKEMON_NAMES[this.selectedPokemon] || '你的寶可夢';

        await this.writeLog(`\n[對戰開始] 你派出了 ${myName}！`, logContainer);
        await this.writeLog(`[對戰開始] 火箭隊派出了 ${enemy.name}！`, logContainer);
        await new Promise(r => setTimeout(r, 500));

        let myHP = 100;
        let enemyHP = 100;

        const renderHP = (hp, label) => {
            const barSize = 10;
            const filled = Math.ceil((hp / 100) * barSize);
            const bar = '[' + '#'.repeat(Math.max(0, filled)) + '-'.repeat(Math.max(0, barSize - filled)) + ']';
            return `${label} HP: ${bar} ${hp}/100`;
        };

        // 4-6 rounds of combat
        const rounds = 4 + Math.floor(Math.random() * 3);
        const winProbability = 0.5;
        const willWin = Math.random() < winProbability;

        for (let i = 1; i <= rounds; i++) {
            await this.writeLog(`\n--- 第 ${i} 回合 ---`, logContainer);
            await this.writeLog(renderHP(myHP, "你  "), logContainer, 'text-blue-400');
            await this.writeLog(renderHP(enemyHP, "敵人"), logContainer, 'text-red-400');
            await new Promise(r => setTimeout(r, 500));

            // My Turn
            const myMove = myMoves[Math.floor(Math.random() * myMoves.length)];
            await this.writeLog(`> ${myName} 使用了「${myMove.name}」！`, logContainer);
            
            // Calculate damage to keep flow
            let damageToEnemy = 0;
            if (i === rounds && willWin) {
                damageToEnemy = enemyHP; // Finishing blow
            } else {
                damageToEnemy = 10 + Math.floor(Math.random() * 15);
                if (enemyHP - damageToEnemy < 10 && !willWin) damageToEnemy = 0; // Don't kill if going to lose
            }
            enemyHP = Math.max(0, enemyHP - damageToEnemy);
            await this.writeLog(`  ${myMove.msg} (造成了 ${damageToEnemy} 點傷害)`, logContainer);
            
            if (enemyHP <= 0) break;

            await new Promise(r => setTimeout(r, 800));

            // Enemy Turn
            const enemyMoveName = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
            await this.writeLog(`> 火箭隊的 ${enemy.name} 使用了「${enemyMoveName}」！`, logContainer);
            
            let damageToMe = 0;
            if (i === rounds && !willWin) {
                damageToMe = myHP; // Finishing blow
            } else {
                damageToMe = 10 + Math.floor(Math.random() * 15);
                if (myHP - damageToMe < 10 && willWin) damageToMe = 0; // Don't kill if going to win
            }
            myHP = Math.max(0, myHP - damageToMe);
            await this.writeLog(`  攻擊非常凌厲！ (受到了 ${damageToMe} 點傷害)`, logContainer);

            if (myHP <= 0) break;
            
            await new Promise(r => setTimeout(r, 1000));
        }

        await this.writeLog(`\n>>> 戰鬥進入尾聲...`, logContainer);
        await new Promise(r => setTimeout(r, 1000));

        if (enemyHP <= 0) {
            const reward = Math.floor(bet * 1.5);
            await this.writeLog(`\n[勝利] 火箭隊的 ${enemy.name} 體力耗盡倒下了！`, logContainer, 'text-yellow-400 font-bold');
            await this.writeLog(`[勝利] ${myName} 獲得了壓倒性的勝利！`, logContainer, 'text-yellow-400');
            await this.writeLog(`>>> 獲得獎金：${reward} Bee Coins！`, logContainer, 'text-yellow-400 font-bold');
            Auth.currentUser.stats.bee_coins += reward;
        } else {
            await this.writeLog(`\n[失敗] ${myName} 已經精疲力竭...`, logContainer, 'text-red-400 font-bold');
            await this.writeLog(`[失敗] 火箭隊發出了得意的笑聲！`, logContainer, 'text-red-400');
            await this.writeLog(`>>> 失去了下注的 ${bet} Bee Coins。`, logContainer, 'text-red-400');
        }

        // Update stats
        Auth.currentUser.stats.battle_stats.count += 1;
        Auth.saveProgress();
        UI.updateDashboard();

        // Stop battle music
        const battleMusic = document.getElementById('battle-bg-music');
        if (battleMusic) {
            battleMusic.pause();
        }

        clearInterval(timerInterval);
        this.isBattling = false;
        document.getElementById('battle-status-msg').textContent = '對戰結束。';
        document.getElementById('close-console-btn').classList.remove('hidden');
        this.updateLimitUI();
    },

    async writeLog(text, container, className = '') {
        const p = document.createElement('p');
        if (className) p.className = className;
        container.appendChild(p);
        
        for (let char of text) {
            p.textContent += char;
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        // Auto scroll
        container.scrollTop = container.scrollHeight;
    }
};
