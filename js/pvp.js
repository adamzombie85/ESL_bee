// pvp.js

const PVP_MOVES_MAP = {
    // We will generate unique moves based on the pokemon image filename
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

const PvP = {
    ws: null,
    canvasEngine: null,
    roomId: null,
    playerId: "player_" + Math.random().toString(36).substring(2, 9),
    username: "Player",
    timerInterval: null,
    timeRemaining: 15,
    state: {
        isLobby: false,
        isReady: false,
        mainPoke: null,
        subPoke: null,
        opponentId: null,
        round: 0,
        lMin: 0,
        lMax: 0
    },

    init() {
        this.username = Auth?.currentUser?.username || "Player_" + Math.floor(Math.random()*1000);
        
        // Bind UI buttons
        document.getElementById('open-pvp-lobby-btn')?.addEventListener('click', () => this.openLobby());
        document.getElementById('close-lobby-modal-btn')?.addEventListener('click', () => this.closeLobby());
        
        document.getElementById('reject-challenge-btn')?.addEventListener('click', () => {
            document.getElementById('challenge-prompt-modal').classList.add('hidden');
            this.sendLobbyMessage("CHALLENGE_RESPOND", {
                challengerId: this.state.challengerId,
                targetId: this.playerId,
                targetName: this.username,
                accept: false
            });
        });

        document.getElementById('accept-challenge-btn')?.addEventListener('click', () => {
            if (this.state.currentWager && Auth.currentUser.stats.bee_coins < this.state.currentWager) {
                alert(`你的 Bee Coins 不足！需要 ${this.state.currentWager}，但你只有 ${Auth.currentUser.stats.bee_coins}`);
                return;
            }
            document.getElementById('challenge-prompt-modal').classList.add('hidden');
            this.sendLobbyMessage("CHALLENGE_RESPOND", {
                challengerId: this.state.challengerId,
                targetId: this.playerId,
                targetName: this.username,
                accept: true,
                wager: this.state.currentWager || 0
            });
        });

        document.getElementById('cancel-wager-btn')?.addEventListener('click', () => {
            document.getElementById('pvp-wager-modal').classList.add('hidden');
            document.getElementById('pvp-wager-modal').classList.remove('flex');
            this.state.pendingTargetId = null;
            this.state.pendingTargetName = null;
        });

        document.getElementById('confirm-wager-btn')?.addEventListener('click', () => {
            const wagerInput = parseInt(document.getElementById('pvp-wager-input').value);
            if (isNaN(wagerInput) || wagerInput < 100) {
                alert("最低下注金額為 100 Bee Coins！");
                return;
            }
            if (Auth.currentUser.stats.bee_coins < wagerInput) {
                alert(`你的 Bee Coins 不夠喔！(目前餘額：${Auth.currentUser.stats.bee_coins})`);
                return;
            }
            
            document.getElementById('pvp-wager-modal').classList.add('hidden');
            document.getElementById('pvp-wager-modal').classList.remove('flex');
            
            this.sendLobbyMessage("CHALLENGE_SEND", {
                challengerId: this.playerId,
                challengerName: this.username,
                targetId: this.state.pendingTargetId,
                wager: wagerInput
            });
            alert(`已向 ${this.state.pendingTargetName} 發出挑戰（下注 ${wagerInput} 金幣），等待回應...`);
        });

        document.getElementById('pvp-ready-btn')?.addEventListener('click', () => this.submitReady());
        document.getElementById('pvp-submit-btn')?.addEventListener('click', () => this.submitWord());
        document.getElementById('pvp-skip-btn')?.addEventListener('click', () => this.submitWord(true));
        
        document.getElementById('pvp-play-word-btn')?.addEventListener('click', () => {
            if (this.state.currentWord && typeof Speaker !== 'undefined') {
                Speaker.speak(this.state.currentWord);
            }
        });
        
        // Canvas Engine setup
        if(document.getElementById('pvp-canvas')) {
            this.canvasEngine = new PvPBattleCanvas('pvp-canvas');
        }
    },

    connectWebSocket(endpoint, isLobby = false) {
        if (this.ws) {
            this.ws.close();
        }
        
        // Always connect to the production Cloudflare Worker for testing
        const wsUrl = `wss://esl-bee-pvp.adamzombie85.workers.dev${endpoint}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log(`Connected to ${endpoint}`);
            if (isLobby) {
                this.sendLobbyMessage("LOBBY_JOIN", { playerId: this.playerId, username: this.username });
            } else {
                // Join battle room
                const vocabDb = Auth?.currentUser?.selectedBank || 'default';
                this.ws.send(JSON.stringify({
                    type: "JOIN_ROOM",
                    payload: {
                        playerId: this.playerId,
                        username: this.username,
                        mainPoke: this.state.mainPoke,
                        subPoke: this.state.subPoke,
                        vocabDb: vocabDb
                    }
                }));
            }
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            console.log("WebSocket Disconnected");
        };
    },

    sendLobbyMessage(type, payload) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    },

    openLobby() {
        document.getElementById('pvp-lobby-modal').classList.remove('hidden');
        setTimeout(() => document.getElementById('pvp-lobby-modal').classList.remove('opacity-0'), 10);
        this.state.isLobby = true;
        this.connectWebSocket('/lobby', true);
    },

    closeLobby() {
        document.getElementById('pvp-lobby-modal').classList.add('opacity-0');
        setTimeout(() => document.getElementById('pvp-lobby-modal').classList.add('hidden'), 300);
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    },

    handleMessage(msg) {
        const { type, payload } = msg;

        switch(type) {
            case "LOBBY_UPDATE":
                this.updateLobbyList(payload.players);
                break;
            case 'CHALLENGE_RECEIVE':
                this.state.challengerId = payload.challengerId;
                this.state.currentWager = payload.wager || 0;
                document.getElementById('challenger-name').textContent = payload.challengerName;
                document.getElementById('challenge-wager').textContent = this.state.currentWager;
                document.getElementById('challenge-prompt-modal').classList.remove('hidden');
                document.getElementById('challenge-prompt-modal').classList.add('flex');
                break;
            case 'CHALLENGE_DECLINED':
                alert(`${payload.targetName} 拒絕了你的挑戰。`);
                break;
            case 'ROOM_CREATED':
                // Deduct wager when entering the room
                this.state.currentWager = payload.wager || 0;
                if (this.state.currentWager > 0) {
                    Auth.currentUser.stats.bee_coins -= this.state.currentWager;
                    Auth.saveProgress();
                    UI.updateDashboard();
                }
                this.enterPreparationPhase(payload.roomId);
                break;
            case "ROOM_UPDATE":
                this.updateBattleState(payload.players);
                break;
            case "BATTLE_START":
                this.startBattleUI();
                break;
            case "ROUND_START":
                this.startRound(payload);
                break;
            case "ROUND_RESULT":
                this.showRoundResult(payload);
                break;
            case "OPPONENT_DISCONNECTED":
                this.handleOpponentDisconnected(payload);
                break;
            case "ERROR":
                alert("伺服器錯誤: " + payload);
                break;
        }
    },

    getMovesForPokemon(img) {
        if (!img) return PVP_MOVES_MAP["electric"];
        const types = Object.keys(PVP_MOVES_MAP);
        let hash = 0;
        for (let i = 0; i < img.length; i++) {
            hash = img.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % types.length;
        return PVP_MOVES_MAP[types[index]];
    },

    handleOpponentDisconnected(payload) {
        const oppId = payload.playerId;
        this.addLog("系統", `對手斷線了，等待重新連線...`);
        document.getElementById('pvp-feedback-text').textContent = "連線中斷";
        
        const subTextEl = document.getElementById('pvp-feedback-sub');
        let timeLeft = payload.timeout || 30;
        subTextEl.textContent = `對手斷線了，等待重新連線... (${timeLeft}s)`;
        
        document.getElementById('pvp-feedback').classList.remove('hidden');
        document.getElementById('pvp-feedback').classList.add('flex');
        
        // Start local countdown for visual feedback
        if (this.disconnectTimer) clearInterval(this.disconnectTimer);
        this.disconnectTimer = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(this.disconnectTimer);
                subTextEl.textContent = `對手斷線過久，判定放棄比賽`;
            } else {
                subTextEl.textContent = `對手斷線了，等待重新連線... (${timeLeft}s)`;
            }
        }, 1000);
    },

    logToConsole(message, type = 'normal') {
        const logBox = document.getElementById('pvp-console-logs');
        if (!logBox) return;

        const p = document.createElement('div');
        p.className = 'font-mono text-sm md:text-base leading-relaxed tracking-wider break-words';

        // Styling based on type
        switch (type) {
            case 'damage': p.classList.add('text-red-400', 'font-bold'); break;
            case 'heal': p.classList.add('text-green-400', 'font-bold'); break;
            case 'crit': p.classList.add('text-yellow-400', 'font-black', 'text-lg', 'animate-bounce'); break;
            case 'faint': p.classList.add('text-gray-500', 'italic', 'line-through'); break;
            case 'switch': p.classList.add('text-blue-300', 'font-bold'); break;
            case 'system': p.classList.add('text-gray-400', 'italic'); break;
            case 'turn': p.classList.add('text-white', 'font-bold', 'border-b', 'border-gray-700', 'pb-1'); break;
            default: p.classList.add('text-gray-300');
        }

        p.textContent = message;
        logBox.appendChild(p);

        // Auto scroll to bottom
        logBox.scrollTop = logBox.scrollHeight;
    },

    updateLobbyList(players) {
        const listEl = document.getElementById('lobby-player-list');
        const countEl = document.getElementById('lobby-online-count');
        
        listEl.innerHTML = '';
        let count = 0;
        
        players.forEach(p => {
            if(p.id === this.playerId) return; // Skip self
            count++;
            const div = document.createElement('div');
            div.className = "flex justify-between items-center bg-blue-900/50 p-3 rounded-xl border border-blue-500/20";
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-white font-bold">${p.username}</span>
                </div>
                <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded-lg text-sm font-bold shadow transition" onclick="PvP.challengePlayer('${p.id}', '${p.username}')">挑戰</button>
            `;
            listEl.appendChild(div);
        });

        countEl.textContent = count;
        if(count === 0) {
            listEl.innerHTML = `<div class="text-center text-blue-300/50 py-8 italic">目前沒有其他玩家在線</div>`;
        }
    },

    challengePlayer(targetId, targetName) {
        this.state.pendingTargetId = targetId;
        this.state.pendingTargetName = targetName;
        document.getElementById('pvp-wager-modal').classList.remove('hidden');
        document.getElementById('pvp-wager-modal').classList.add('flex');
    },

    enterPreparationPhase(roomId) {
        this.roomId = roomId;
        this.closeLobby();
        
        // Show prep modal
        const prepModal = document.getElementById('pvp-prep-modal');
        prepModal.classList.remove('hidden');
        prepModal.classList.add('flex');
        setTimeout(() => prepModal.classList.remove('opacity-0'), 10);
    },

    openPokemonSelector(slot) {
        const inventory = Auth?.currentUser?.stats?.pokemon_inventory || {};
        const completedPokemons = Object.keys(inventory).filter(img => inventory[img] >= 4);
        
        if (completedPokemons.length === 0) {
            alert('你需要至少一隻完整的寶可夢（拼圖 4/4）才能派出作戰！請先在單機模式獲得寶可夢。');
            return;
        }

        const modal = document.getElementById('pvp-pokemon-selector-modal');
        const container = document.getElementById('pvp-pokemon-list');
        container.innerHTML = '';

        completedPokemons.forEach(imgFile => {
            const div = document.createElement('div');
            div.className = "flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white/20 overflow-hidden cursor-pointer hover:border-indigo-500 transition p-1 bg-white/5";
            div.innerHTML = `<img src="pokemons/${imgFile}" class="w-full h-full object-contain">`;
            
            div.addEventListener('click', () => {
                this.state[slot + 'Poke'] = `pokemons/${imgFile}`;
                document.getElementById(`prep-${slot}-img`).innerHTML = `<img src="pokemons/${imgFile}" class="w-full h-full object-contain" />`;
                
                let name = "Pokemon";
                if (typeof POKEMON_NAMES !== 'undefined' && POKEMON_NAMES[imgFile]) {
                    name = POKEMON_NAMES[imgFile];
                }
                document.getElementById(`prep-${slot}-name`).textContent = name;
                
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                this.checkReadyStatus();
            });
            container.appendChild(div);
        });

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    },

    checkReadyStatus() {
        const btn = document.getElementById('pvp-ready-btn');
        let readyCount = 0;
        if (this.state.mainPoke) readyCount++;
        if (this.state.subPoke) readyCount++;
        
        btn.textContent = `準備就緒 (${readyCount}/2)`;
        if (readyCount === 2) {
            btn.disabled = false;
        }
    },

    submitReady() {
        const prepModal = document.getElementById('pvp-prep-modal');
        prepModal.classList.add('opacity-0');
        setTimeout(() => {
            prepModal.classList.remove('flex');
            prepModal.classList.add('hidden');
        }, 300);

        // Connect to battle room
        this.connectWebSocket(`/room/${this.roomId}`, false);
    },

    updateBattleState(players) {
        let me, opp;
        players.forEach(p => {
            if (p.id === this.playerId) me = p;
            else opp = p;
        });

        if (me) {
            this.canvasEngine.p1 = {
                isLocal: true,
                pokeImg: me.active === 'main' ? me.mainPoke : me.subPoke,
                hp: me.active === 'main' ? me.hpMain : me.hpSupport,
                maxHp: 100,
                rage: me.rage,
                name: me.username,
                active: me.active,
                hpMain: me.hpMain,
                hpSupport: me.hpSupport,
                mainPoke: me.mainPoke,
                subPoke: me.subPoke
            };
        }
        if (opp) {
            this.canvasEngine.p2 = {
                isLocal: false,
                pokeImg: opp.active === 'main' ? opp.mainPoke : opp.subPoke,
                hp: opp.active === 'main' ? opp.hpMain : opp.hpSupport,
                maxHp: 100,
                rage: opp.rage,
                name: opp.username,
                active: opp.active,
                hpMain: opp.hpMain,
                hpSupport: opp.hpSupport,
                mainPoke: opp.mainPoke,
                subPoke: opp.subPoke
            };
        }
        
        // Ensure canvas engine loads images and prepares rendering
        this.canvasEngine.updateState(this.canvasEngine.p1, this.canvasEngine.p2);
        
        // Hide disconnect feedback if both are connected
        if (me && opp && opp.connected !== false) {
            if (document.getElementById('pvp-feedback-text').textContent === "連線中斷") {
                document.getElementById('pvp-feedback').classList.add('hidden');
                document.getElementById('pvp-feedback').classList.remove('flex');
                if (this.disconnectTimer) {
                    clearInterval(this.disconnectTimer);
                    this.disconnectTimer = null;
                }
            }
        }
    },

    startBattleUI() {
        document.getElementById('pvp-battle-view').classList.remove('hidden');
        document.getElementById('pvp-battle-view').classList.add('flex');
        
        // Disable main UI background scroll
        document.body.style.overflow = 'hidden';
        
        // Fix Canvas 0x0 bug: Resize after view is flex
        this.canvasEngine.resize();
        this.canvasEngine.start();
        
        this.showFeedback("對戰即將開始！", "準備迎接第一回合");
    },

    startRound(payload) {
        this.state.round = payload.round;
        this.state.lMin = payload.lMin;
        this.state.lMax = payload.lMax;
        
        document.getElementById('pvp-round-num').textContent = payload.round;
        document.getElementById('pvp-feedback').classList.add('hidden');
        document.getElementById('pvp-feedback').classList.remove('flex');
        
        const isMyTurn = payload.currentTurn === this.playerId;
        const turnName = isMyTurn ? "你" : "對手";
        
        this.logToConsole(`\n--- 第 ${payload.round} 回合開始 ---`, 'system');
        this.logToConsole(`目前輪到 ${turnName} 的回合！`, 'turn');

        if (isMyTurn) {
            // My Turn
            document.getElementById('pvp-word-input-container').style.display = 'flex';
            document.getElementById('pvp-skip-btn').style.display = 'block';
            document.getElementById('pvp-submit-btn').style.display = 'block';
            document.getElementById('pvp-play-word-btn').style.display = 'flex';
            document.getElementById('pvp-word-meaning').textContent = "（請聽音拼寫）";

            this.generateRoundWord();
            this.createInputBoxes();
            
            // Auto play audio
            if (this.state.currentWord && typeof Speaker !== 'undefined') {
                setTimeout(() => {
                    Speaker.speak(this.state.currentWord);
                }, 500);
            }
        } else {
            // Opponent Turn
            document.getElementById('pvp-word-input-container').style.display = 'none';
            document.getElementById('pvp-skip-btn').style.display = 'none';
            document.getElementById('pvp-submit-btn').style.display = 'none';
            document.getElementById('pvp-play-word-btn').style.display = 'none';
            document.getElementById('pvp-word-meaning').textContent = "（對手回合，你現在無法答題）";
            
            this.showFeedback("對手回合", "等待對方拼寫中...");
        }
        
        // Start Timer
        this.startTimer(payload.timeLimit);
    },
    
    generateRoundWord() {
        const validWords = [];
        const db = typeof WORD_BANKS !== 'undefined' ? WORD_BANKS : {};
        
        const selectedBank = Auth?.currentUser?.selectedBank || "G3";
        const levelData = db[selectedBank] || {};
        
        Object.keys(levelData).forEach(lenStr => {
            const length = parseInt(lenStr, 10);
            if (length >= this.state.lMin && length <= this.state.lMax) {
                levelData[lenStr].forEach(w => validWords.push(w));
            }
        });
        
        if (validWords.length > 0) {
            const pick = validWords[Math.floor(Math.random() * validWords.length)];
            this.state.currentWord = pick;
            document.getElementById('pvp-word-meaning').textContent = "（請聽音拼寫）";
        } else {
            this.state.currentWord = "apple";
            document.getElementById('pvp-word-meaning').textContent = "蘋果 (Fallback)";
        }
        
        console.log(`PvP Target Word: ${this.state.currentWord} (Bank: ${selectedBank}, Length: ${this.state.currentWord.length})`);
    },

    createInputBoxes() {
        const container = document.getElementById('pvp-word-input-container');
        container.innerHTML = '';
        
        const len = this.state.currentWord.length;
        for (let i = 0; i < len; i++) {
            const input = document.createElement('input');
            input.type = "text";
            input.maxLength = 1;
            input.className = "w-12 h-14 md:w-14 md:h-16 text-center text-2xl md:text-3xl font-black rounded-lg border-b-4 border-gray-600 bg-gray-800 text-white uppercase focus:border-yellow-400 focus:outline-none transition";
            input.dataset.index = i;
            
            input.addEventListener('input', (e) => {
                input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase();
                if (input.value && i < len - 1) {
                    container.children[i + 1].focus();
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && i > 0) {
                    container.children[i - 1].focus();
                    container.children[i - 1].value = '';
                } else if (e.key === 'Enter') {
                    this.submitWord();
                }
            });
            
            container.appendChild(input);
        }
        
        // Focus first box
        setTimeout(() => container.children[0]?.focus(), 100);
    },

    startTimer(seconds) {
        clearInterval(this.timerInterval);
        this.timeRemaining = seconds;
        
        const updateDisplay = () => {
            document.getElementById('pvp-timer').textContent = this.timeRemaining.toFixed(1);
        };
        
        updateDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining -= 0.1;
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                clearInterval(this.timerInterval);
                this.submitWord(true); // auto-skip/fail
            }
            updateDisplay();
        }, 100);
    },

    submitWord(isSkip = false) {
        clearInterval(this.timerInterval);
        
        let answer = '';
        if (!isSkip) {
            const container = document.getElementById('pvp-word-input-container');
            Array.from(container.children).forEach(input => {
                answer += input.value.toLowerCase();
            });
        }
        
        let isCorrect = (answer === this.state.currentWord.toLowerCase());
        
        if (isCorrect) {
            document.getElementById('sfx-correct')?.play();
        } else {
            document.getElementById('sfx-wrong')?.play();
        }

        // Send to server
        this.sendLobbyMessage("SPELL_SUBMIT", {
            playerId: this.playerId,
            word: isCorrect ? answer : "",
            timeTaken: 15 - this.timeRemaining
        });
        
        this.showFeedback("已送出答案", "等待對手完成...");
    },

    showFeedback(mainText, subText) {
        document.getElementById('pvp-feedback-text').textContent = mainText;
        document.getElementById('pvp-feedback-sub').textContent = subText;
        document.getElementById('pvp-feedback').classList.remove('hidden');
        document.getElementById('pvp-feedback').classList.add('flex');
    },

    showRoundResult(payload) {
        document.getElementById('pvp-feedback').classList.add('hidden');
        document.getElementById('pvp-feedback').classList.remove('flex');

        if (payload.gameOver) {
            this.showFeedback("遊戲結束", payload.winner === this.playerId ? "你贏了！🎉" : (payload.winner === 'draw' ? "平手！" : "你輸了..."));
            this.logToConsole(`\n【戰鬥結束】`, 'system');
            this.logToConsole(payload.winner === this.playerId ? "恭喜你獲得了勝利！🎉" : "很可惜，你戰敗了...", 'crit');
            setTimeout(() => {
                window.location.reload(); // Simple reset for now
            }, 5000);
            return;
        }

        // Update states and trigger animations
        const myResult = payload.player1.id === this.playerId ? payload.player1 : payload.player2;
        const oppResult = payload.player1.id !== this.playerId ? payload.player1 : payload.player2;
        
        const activePlayerResult = payload.activePlayerId === payload.player1.id ? payload.player1 : payload.player2;
        const isMyTurn = payload.activePlayerId === this.playerId;
        const activeName = isMyTurn ? this.username : "對手";

        if (activePlayerResult.isCorrect) {
            const isCrit = activePlayerResult.isCrit;
            
            this.logToConsole(`${activeName} 拼字正確！`, 'heal');
            
            // Get move name
            const moves = this.getMovesForPokemon(isMyTurn ? this.state.mainPoke : this.state.subPoke);
            const move = moves[Math.floor(Math.random() * moves.length)];
            
            if (isCrit) {
                this.logToConsole(`【爆擊】 ${move.name}！${move.msg}`, 'crit');
            } else {
                this.logToConsole(`使用了 ${move.name}！${move.msg}`, 'normal');
            }
            
            this.logToConsole(`${isMyTurn ? '對手' : '你'} 受到了 ${activePlayerResult.damageDealt} 點傷害！`, 'damage');
            
            this.canvasEngine.triggerAttack(isMyTurn, isCrit);
        } else {
            this.logToConsole(`${activeName} 拼錯了單字... 或超時未答題。`, 'faint');
            this.logToConsole(`攻擊失敗！`, 'normal');
        }

        // 檢查是否發生接力
        const checkRelay = (enginePlayer, newResult, isMe) => {
            if (enginePlayer.active === 'main' && newResult.active === 'support') {
                setTimeout(() => {
                    this.logToConsole(`【戰鬥】${isMe ? '你' : '對手'} 的主戰寶可夢倒下了！`, 'faint');
                    this.logToConsole(`【接力】去吧！第二隻寶可夢！`, 'system');
                    enginePlayer.pokeImg = enginePlayer.subPoke;
                    this.canvasEngine.loadImage(enginePlayer.pokeImg);
                }, 1500); // 延遲顯示接力，讓攻擊動畫先播完
            }
        };

        checkRelay(this.canvasEngine.p1, myResult, true);
        checkRelay(this.canvasEngine.p2, oppResult, false);

        // Sync HP after animation (simplified: sync immediately in state)
        this.canvasEngine.p1.hp = myResult.activePokemonHp;
        this.canvasEngine.p1.rage = myResult.rage;
        this.canvasEngine.p1.active = myResult.active;
        this.canvasEngine.p1.hpMain = myResult.hpMain;
        this.canvasEngine.p1.hpSupport = myResult.hpSupport;

        this.canvasEngine.p2.hp = oppResult.activePokemonHp;
        this.canvasEngine.p2.rage = oppResult.rage;
        this.canvasEngine.p2.active = oppResult.active;
        this.canvasEngine.p2.hpMain = oppResult.hpMain;
        this.canvasEngine.p2.hpSupport = oppResult.hpSupport;

        setTimeout(() => {
            this.logToConsole(`【狀態】你的HP: ${myResult.activePokemonHp} | 對手HP: ${oppResult.activePokemonHp}`, 'system');
        }, 1000);
    }
};

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.PvP = PvP;
    PvP.init();
});
