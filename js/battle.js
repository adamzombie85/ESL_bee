// battle.js

const BattleCenter = {
    selectedPokemon: null,
    isBattling: false,

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

        await this.writeLog(`\n[對戰開始] 你派出了寶可夢夥伴！`, logContainer);
        await this.writeLog(`[對戰開始] 火箭隊派出了 瓦斯彈 (Koffing)！`, logContainer);
        await new Promise(r => setTimeout(r, 500));

        const myMoves = [
            { name: "十萬伏特", msg: "強大的電流貫穿了全場！" },
            { name: "撞擊", msg: "發揮了驚人的速度正面衝撞！" },
            { name: "電光一閃", msg: "化作一道白光在敵人間穿梭！" },
            { name: "鋼鐵尾巴", msg: "堅硬的尾巴重重地擊中了對手！" },
            { name: "打雷", msg: "召喚了烏雲降下致命的雷擊！" },
            { name: "影子分身", msg: "幻化出無數殘影干擾對手！" }
        ];
        const enemyMoves = [
            { name: "污泥攻擊", msg: "噴射出惡臭的毒泥！" },
            { name: "瞪眼", msg: "發出銳利的目光降低了防禦！" },
            { name: "咬咬", msg: "用鋒利的牙齒狠狠咬住！" },
            { name: "毒針", msg: "發射出帶毒的細針！" },
            { name: "煙幕", msg: "噴出濃煙遮蔽了視線！" },
            { name: "黑霧", msg: "散發出不詳的氣息抵消了能力變化！" }
        ];

        // 3-5 rounds of combat
        const rounds = 4 + Math.floor(Math.random() * 3); // 4-6 rounds for more length
        for (let i = 1; i <= rounds; i++) {
            await this.writeLog(`\n--- 第 ${i} 回合 ---`, logContainer);
            const myMove = myMoves[Math.floor(Math.random() * myMoves.length)];
            await this.writeLog(`> 你的寶可夢使用了「${myMove.name}」！`, logContainer);
            await this.writeLog(`  ${myMove.msg}`, logContainer);
            await new Promise(r => setTimeout(r, 800));

            const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
            await this.writeLog(`> 火箭隊的瓦斯彈使用了「${enemyMove.name}」！`, logContainer);
            await this.writeLog(`  ${enemyMove.msg}`, logContainer);
            await new Promise(r => setTimeout(r, 1000));
        }

        await this.writeLog(`\n>>> 雙方體力都接近極限...`, logContainer);
        await new Promise(r => setTimeout(r, 1500));

        // 50% Win Rate
        const won = Math.random() < 0.5;
        
        if (won) {
            const reward = Math.floor(bet * 1.5);
            await this.writeLog(`\n[勝利] 你的寶可夢使出了最後一擊！`, logContainer);
            await this.writeLog(`[勝利] 火箭隊狼狽地逃走了！`, logContainer);
            await this.writeLog(`>>> 獲得獎金：${reward} Bee Coins！`, logContainer, 'text-yellow-400 font-bold');
            Auth.currentUser.stats.bee_coins += reward;
        } else {
            await this.writeLog(`\n[失敗] 火箭隊的戰術太過狡猾...`, logContainer);
            await this.writeLog(`[失敗] 你的寶可夢倒下了。`, logContainer);
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
