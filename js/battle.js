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

        // 2. Check Daily Limit
        if (this.isDailyLimitReached()) {
            alert('寶可夢玩家累了要休息了');
            return;
        }

        // 3. Show Modal and Populate List
        this.selectedPokemon = null;
        document.getElementById('start-battle-action-btn').disabled = true;
        this.populatePokemonList(completedPokemons);
        this.updateDailyCountUI();

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

    isDailyLimitReached() {
        const stats = Auth.currentUser.stats.battle_stats || { daily_count: 0, last_date: "" };
        const today = new Date().toDateString();
        if (stats.last_date !== today) {
            // Reset for new day
            stats.daily_count = 0;
            stats.last_date = today;
            Auth.currentUser.stats.battle_stats = stats;
            Auth.saveProgress();
        }
        return stats.daily_count >= 3;
    },

    updateDailyCountUI() {
        const count = Auth.currentUser.stats.battle_stats?.daily_count || 0;
        document.getElementById('battle-daily-limit-text').textContent = `今日剩餘次數: ${3 - count} / 3`;
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

        const myMoves = ["十萬伏特", "撞擊", "電光一閃", "鋼鐵尾巴", "打雷"];
        const enemyMoves = ["污泥攻擊", "瞪眼", "咬咬", "毒針", "煙幕"];

        // 3-5 rounds of combat
        const rounds = 3 + Math.floor(Math.random() * 3);
        for (let i = 1; i <= rounds; i++) {
            await this.writeLog(`\n--- 第 ${i} 回合 ---`, logContainer);
            const myMove = myMoves[Math.floor(Math.random() * myMoves.length)];
            await this.writeLog(`> 你的寶可夢使用了「${myMove}」！`, logContainer);
            await this.writeLog(`  造成的傷害非常顯著。`, logContainer);
            await new Promise(r => setTimeout(r, 800));

            const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
            await this.writeLog(`> 火箭隊的瓦斯彈使用了「${enemyMove}」！`, logContainer);
            await this.writeLog(`  你的寶可夢受到了衝擊。`, logContainer);
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
        Auth.currentUser.stats.battle_stats.daily_count += 1;
        Auth.saveProgress();
        UI.updateDashboard();

        clearInterval(timerInterval);
        this.isBattling = false;
        document.getElementById('battle-status-msg').textContent = '對戰結束。';
        document.getElementById('close-console-btn').classList.remove('hidden');
        this.updateDailyCountUI();
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
