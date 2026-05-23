// ui.js

const POKEMON_IMAGES = [
    "05fd4676fa4a4b58288510a97a5211e066e02464.png",
    "072285cb2f79f560e25fce81cc981a7432fa0123.png",
    "0783062d0d860b8ae7d8e859241a700359c4d981.png",
    "1086bb30451998c2911e948c5be7148b57c38d15.png",
    "1583b45023aabc829f405629e4b0d7259f80a2c0.png",
    "163c4755d05b84456e75c3f7ff14a5d80559a96d.png",
    "2050f1fd1283f473d7d048f8631712e7e003f802.png",
    "266278a59d39e9770b8f34c9a635243133334a28.png",
    "2a2e293a8524ac94136bada7346ddfe57e12e47e.png",
    "33b32e8a93e55cbb39d07fa08f6bf183013572bc.png",
    "3862fc122debc9675749142a7c76f1a64dbbc60d.png",
    "39aa457757bc80212c28bc0b9cc21445756f0359.png",
    "3d1e9d886ba47475ac9df961a040ed2dbe56f217.png",
    "47ae88a63c66e32e957da303ad50b72268e097e4.png",
    "4fb01f5dee192aa16343fdf2d928cd80fea91c2b.png",
    "5da8f512523759232f743f19421d15ae31ada198.png",
    "60a46a9d79191bbcc037a369c61faa5eed1a8827.png",
    "8708c18964fa2bf675990c90863e5d40164e22a3.png",
    "89719dbcbddd11a1e6bc5f4366e00910a04eaf9f.png",
    "98126582af9f41623f2dde46b3b002ac9dbd1943.png",
    "ad7ffb53f984a6623c53f01cfbc06fc8565ecbd4.png",
    "b57f557201bb4eb545e82c509137036f9e5751ee.png",
    "b8bcfb490b9a54a7cfc607ac82f413f4e582cb56.png",
    "c65cff51b864d3b37e24832af94c320824e2021d.png",
    "d00d72f082b7dae546fa8bd5cf09fcfe53ffcae8.png",
    "d1b4b9ec796de5d101e85258987036767c37a34b.png",
    "dacab2be1777c14ed7da12824dd85c2cdbd2ebf9.png",
    "e12ce48ab99b2df6fbbc1e97038c4f6e192d09d7.png",
    "e724713a13271ef531f5410da782e24f729cb6d6.png",
    "eda09f7ae6a3f5c71eeb1613b2da7b769cf12ae6.png",
    "f792fb3e98937419d426f9d8de19b8f1eebc7454.png",
    "fea142043a53539815b5a08756a010348931350a.png",
    "00f9b6fc77b07974b842263e7077e8381edaec55.png",
    "017202e97b6ba5eabc742df1d6c0ff9d4e1d79ca.png",
    "02f7f5bcb17cb72e8b5b9009b1489f750834707f.png",
    "2a31d27aa670d58868f9fc3934623e3115713f00.png",
    "44708bc0531c717525ca3fc2bc92baf00c59de75.png",
    "53b743e93280fd3993d12bc4dbcce5e43e9402e6.png",
    "5903561fb10a3c625a06c2e01d44faff8946d398.png",
    "72bee8e3be7ff19e143a61281b1b753e4b1c6cfb.png",
    "7612d8c931099a7233b4b12b812b381f45a5c936.png",
    "772f49f099aecc8980511f6c1eacb3d2447ae7c6.png",
    "9aaab70c23e037ee7728a43ea1cfabefa65b0c0f.png",
    "a797782c9295522a9642e6682f279cc373921a3d.png",
    "aae700aa7bb29fae4a30b77c495b0b66406d74d6.png",
    "ace94f428f74aaa5381f18a67b875512307685ff.png",
    "c30c65d8d05093a751d4ddbeaf2bf995b1dbffc0.png",
    "c8ca1d916272be90a24dd4da66a27e3ae70d8fd5.png",
    "d30e6f3f6bf49eb279d644ee7aaaaee450f69d9d.png",
    "eea9b5dae0506e7a00642125391b398a5c7471d8.png",
    "f6ae3010972469372d493e3cc4a516c574df3974.png",
    "fc5b91d5ab9164d29ed8e39dc042894dcdb8f557.png"
];

const POKEMON_NAMES = {
    "05fd4676fa4a4b58288510a97a5211e066e02464.png": "鐵甲蛹",
    "072285cb2f79f560e25fce81cc981a7432fa0123.png": "三首惡龍",
    "0783062d0d860b8ae7d8e859241a700359c4d981.png": "可達鴨",
    "1086bb30451998c2911e948c5be7148b57c38d15.png": "巨石丁",
    "1583b45023aabc829f405629e4b0d7259f80a2c0.png": "拉普拉斯",
    "163c4755d05b84456e75c3f7ff14a5d80559a96d.png": "霜奶仙",
    "2050f1fd1283f473d7d048f8631712e7e003f802.png": "噴火龍",
    "266278a59d39e9770b8f34c9a635243133334a28.png": "金魚王",
    "2a2e293a8524ac94136bada7346ddfe57e12e47e.png": "白海獅",
    "33b32e8a93e55cbb39d07fa08f6bf183013572bc.png": "水躍魚",
    "3862fc122debc9675749142a7c76f1a64dbbc60d.png": "呆殼獸(伽勒爾)",
    "39aa457757bc80212c28bc0b9cc21445756f0359.png": "怪顎龍",
    "3d1e9d886ba47475ac9df961a040ed2dbe56f217.png": "仆斬將軍",
    "47ae88a63c66e32e957da303ad50b72268e097e4.png": "喇叭芽",
    "4fb01f5dee192aa16343fdf2d928cd80fea91c2b.png": "多麗米亞",
    "5da8f512523759232f743f19421d15ae31ada198.png": "烈腿蝗",
    "60a46a9d79191bbcc037a369c61faa5eed1a8827.png": "土王",
    "8708c18964fa2bf675990c90863e5d40164e22a3.png": "霜奶仙(超極巨)",
    "89719dbcbddd11a1e6bc5f4366e00910a04eaf9f.png": "六尾(阿羅拉)",
    "98126582af9f41623f2dde46b3b002ac9dbd1943.png": "火爆獸",
    "ad7ffb53f984a6623c53f01cfbc06fc8565ecbd4.png": "超夢",
    "b57f557201bb4eb545e82c509137036f9e5751ee.png": "暴鯉龍",
    "b8bcfb490b9a54a7cfc607ac82f413f4e582cb56.png": "耿鬼",
    "c65cff51b864d3b37e24832af94c320824e2021d.png": "喵喵",
    "d00d72f082b7dae546fa8bd5cf09fcfe53ffcae8.png": "伊布",
    "d1b4b9ec796de5d101e85258987036767c37a34b.png": "快龍",
    "dacab2be1777c14ed7da12824dd85c2cdbd2ebf9.png": "路卡利歐", // Guessed or checked
    "e12ce48ab99b2df6fbbc1e97038c4f6e192d09d7.png": "夢幻",
    "e724713a13271ef531f5410da782e24f729cb6d6.png": "洛奇亞",
    "eda09f7ae6a3f5c71eeb1613b2da7b769cf12ae6.png": "鳳王",
    "f792fb3e98937419d426f9d8de19b8f1eebc7454.png": "急凍鳥(伽勒爾的樣子)",
    "fea142043a53539815b5a08756a010348931350a.png": "美納斯",
    "00f9b6fc77b07974b842263e7077e8381edaec55.png": "鳳王",
    "017202e97b6ba5eabc742df1d6c0ff9d4e1d79ca.png": "超夢",
    "02f7f5bcb17cb72e8b5b9009b1489f750834707f.png": "炎兔兒",
    "2a31d27aa670d58868f9fc3934623e3115713f00.png": "仙子伊布",
    "44708bc0531c717525ca3fc2bc92baf00c59de75.png": "厄月椪",
    "53b743e93280fd3993d12bc4dbcce5e43e9402e6.png": "謎擬Q",
    "5903561fb10a3c625a06c2e01d44faff8946d398.png": "火稚雞",
    "72bee8e3be7ff19e143a61281b1b753e4b1c6cfb.png": "七夕青鳥",
    "7612d8c931099a7233b4b12b812b381f45a5c936.png": "偷兒狐",
    "772f49f099aecc8980511f6c1eacb3d2447ae7c6.png": "多龍梅西亞",
    "9aaab70c23e037ee7728a43ea1cfabefa65b0c0f.png": "冰雪巨龍",
    "a797782c9295522a9642e6682f279cc373921a3d.png": "雷吉艾斯",
    "aae700aa7bb29fae4a30b77c495b0b66406d74d6.png": "利歐路",
    "ace94f428f74aaa5381f18a67b875512307685ff.png": "夢歌仙人掌",
    "c30c65d8d05093a751d4ddbeaf2bf995b1dbffc0.png": "四顎針龍",
    "c8ca1d916272be90a24dd4da66a27e3ae70d8fd5.png": "閃電鳥(伽勒爾的樣子)",
    "d30e6f3f6bf49eb279d644ee7aaaaee450f69d9d.png": "呱頭蛙",
    "eea9b5dae0506e7a00642125391b398a5c7471d8.png": "打擊鬼",
    "f6ae3010972469372d493e3cc4a516c574df3974.png": "哈克龍",
    "fc5b91d5ab9164d29ed8e39dc042894dcdb8f557.png": "狩獵鳳蝶"
};

const UI = {
    chartInstance: null,
    radarChartInstance: null,
    selectedPokemonForSession: null,

    init() {
        document.querySelectorAll('.bank-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bank = e.currentTarget.dataset.bank;
                UI.showLevelSelect(bank);
            });
        });

        document.getElementById('back-to-dash-from-levels').addEventListener('click', () => {
            this.showView('dashboard');
        });

        document.getElementById('play-word-btn').addEventListener('click', () => {
            Speaker.speak(Game.currentWord, true);
        });

        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitWord();
        });

        document.getElementById('skip-btn').addEventListener('click', () => {
            Game.skipWord();
        });

        document.getElementById('back-to-dash-btn').addEventListener('click', () => {
            this.showView('dashboard');
            this.updateDashboard();
        });

        // Pre-game Pokemon Selection
        document.getElementById('cancel-select-btn').addEventListener('click', () => {
            this.showLevelSelect(Game.currentBank);
        });
        document.getElementById('start-session-btn').addEventListener('click', () => {
            if (this.selectedPokemonForSession) {
                Game.startSession(this.selectedPokemonForSession);
            }
        });

        // Art Shop / Gallery (Modal close button, even if we don't use it much now)
        const closeShopBtn = document.getElementById('close-shop-btn');
        if (closeShopBtn) {
            closeShopBtn.addEventListener('click', () => {
                document.getElementById('art-shop-modal').classList.add('hidden', 'opacity-0');
            });
        }

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('view-game').classList.contains('hidden')) return;
            if (e.key === 'Enter') {
                this.submitWord();
            }
        });

        // Voice Controls
        Speaker.onVoicesLoaded = () => this.populateVoices();
        // Fallback if already loaded
        if (Speaker.getEnglishVoices().length > 0) {
            this.populateVoices();
        }
        
        document.getElementById('voice-select').addEventListener('change', (e) => {
            Speaker.setVoiceByName(e.target.value);
            if (Game.currentWord && !document.getElementById('view-game').classList.contains('hidden')) {
                Speaker.speak(Game.currentWord);
            }
        });
        
        document.getElementById('rate-slider').addEventListener('input', (e) => {
            document.getElementById('rate-value').textContent = parseFloat(e.target.value).toFixed(1);
            Speaker.rate = parseFloat(e.target.value);
        });

        // Session Summary Buttons
        document.getElementById('summary-back-btn').addEventListener('click', () => {
            Music.pause();
            this.showView('dashboard');
            this.updateDashboard();
        });
        document.getElementById('summary-continue-btn').addEventListener('click', () => {
            Music.pause();
            this.showLevelSelect(Game.currentBank);
        });

        // Gallery Modal Buttons
        document.getElementById('close-gallery-modal-btn').addEventListener('click', () => {
            this.hideGalleryDetail();
        });
        document.getElementById('modal-close-btn').addEventListener('click', () => {
            this.hideGalleryDetail();
        });

        // Battle Center
        BattleCenter.init();
    },

    populateVoices() {
        const select = document.getElementById('voice-select');
        select.innerHTML = '';
        const voices = Speaker.getEnglishVoices();
        voices.forEach(v => {
            const option = document.createElement('option');
            option.value = v.name;
            // Shorten the name to fit the UI better
            option.textContent = v.name.replace('English', 'EN').replace('Google', 'G').substring(0, 25);
            if (Speaker.voice && Speaker.voice.name === v.name) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    },

    showView(viewId) {
        const targetId = viewId.startsWith('view-') ? viewId : `view-${viewId}`;
        ['view-auth', 'view-dashboard', 'view-game', 'view-pokemon-select', 'view-level-select', 'view-session-summary'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === targetId) {
                el.classList.remove('hidden');
                setTimeout(() => el.classList.remove('opacity-0'), 10);
            } else {
                el.classList.add('hidden');
            }
        });

        if (viewId === 'dashboard' || viewId === 'game') {
            document.getElementById('user-info').classList.remove('hidden');
        } else {
            document.getElementById('user-info').classList.add('hidden');
        }
    },

    updateDashboard() {
        if (!Auth.currentUser) return;
        document.getElementById('current-username').textContent = Auth.currentUser.username;
        document.getElementById('coin-balance').textContent = Auth.currentUser.stats.bee_coins;

        ['g3', 'g5'].forEach(bank => {
            const data = WORD_BANKS[bank.toUpperCase()];
            if (data) {
                const lengths = Object.keys(data);
                const totalGroups = lengths.length;
                let passedGroups = 0;
                
                lengths.forEach(len => {
                    const words = data[len];
                    const isPassed = words.every(w => {
                        const m = Auth.currentUser.stats.word_mastery[w];
                        return m && m.streak >= 3;
                    });
                    if (isPassed) passedGroups++;
                });

                const pct = totalGroups > 0 ? Math.round((passedGroups / totalGroups) * 100) : 0;
                document.getElementById(`${bank}-progress`).textContent = pct;
            }
        });

        this.updateChart();
        this.updateRadarChart();
        this.renderGalleryPreview();
    },

    showLevelSelect(bankName) {
        Game.currentBank = bankName;
        document.getElementById('level-select-title').textContent = `${bankName} Spelling Bee`;
        this.showView('view-level-select');

        const grid = document.getElementById('level-cards-grid');
        grid.innerHTML = '';

        const bankData = WORD_BANKS[bankName];
        const lengths = Object.keys(bankData).map(Number).sort((a, b) => a - b);
        const minLength = lengths[0];

        // Ensure stats exist
        if (!Auth.currentUser.stats.unlocked_levels) Auth.currentUser.stats.unlocked_levels = {};
        if (!Auth.currentUser.stats.unlocked_levels[bankName]) {
            Auth.currentUser.stats.unlocked_levels[bankName] = [minLength];
        }

        lengths.forEach(len => {
            const isUnlocked = Auth.currentUser.stats.unlocked_levels[bankName].includes(len);
            const words = bankData[len];
            const isPassed = words.every(w => {
                const m = Auth.currentUser.stats.word_mastery[w];
                return m && m.streak >= 3;
            });

            const card = document.createElement('div');
            card.className = `glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${isUnlocked ? 'hover:scale-105 cursor-pointer border-2 border-bee-yellow' : 'opacity-60 bg-gray-100 cursor-not-allowed border-2 border-gray-300'}`;

            const icon = document.createElement('div');
            icon.className = 'text-4xl mb-4';
            icon.textContent = isPassed ? '✅' : (isUnlocked ? '🌟' : '🔒');
            card.appendChild(icon);

            const title = document.createElement('h4');
            title.className = 'text-xl font-fredoka mb-2';
            title.textContent = `${len} 字母題組`;
            card.appendChild(title);

            const info = document.createElement('p');
            info.className = 'text-sm text-gray-600 mb-4';
            info.textContent = isPassed ? '已通過精熟！' : (isUnlocked ? '可以開始挑戰' : '尚未解鎖');
            card.appendChild(info);

            if (!isUnlocked) {
                const cost = (len - minLength) * 500;
                const unlockBtn = document.createElement('button');
                unlockBtn.className = 'bg-honey text-white px-4 py-2 rounded-xl font-bold hover:bg-honey-dark transition text-sm flex items-center gap-1 mt-auto pointer-events-auto';
                unlockBtn.innerHTML = `🪙 ${cost} 解鎖`;
                
                unlockBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Auth.currentUser.stats.bee_coins >= cost) {
                        Auth.currentUser.stats.bee_coins -= cost;
                        Auth.currentUser.stats.unlocked_levels[bankName].push(len);
                        Auth.saveProgress();
                        this.updateDashboard();
                        this.showLevelSelect(bankName);
                        document.getElementById('sfx-unlock').play();
                        alert(`成功解鎖 ${len} 字母題組！`);
                    } else {
                        alert('Bee Coins 不足喔！多去練習賺一點金幣吧！');
                    }
                });
                card.appendChild(unlockBtn);
            } else {
                card.addEventListener('click', () => {
                    Game.currentLevel = len;
                    this.showPokemonSelect();
                });
            }

            grid.appendChild(card);
        });
    },

    showPokemonSelect() {
        this.selectedPokemonForSession = null;
        document.getElementById('start-session-btn').disabled = true;
        this.showView('view-pokemon-select');

        const grid = document.getElementById('pokemon-select-grid');
        grid.innerHTML = '';

        const inventory = Auth.currentUser.stats.pokemon_inventory || {};

        POKEMON_IMAGES.forEach((img, idx) => {
            const pieces = inventory[img] || 0;
            const isFull = pieces >= 4;

            const div = document.createElement('div');
            div.className = `glass-panel rounded-2xl p-4 text-center cursor-pointer transition transform hover:scale-105 border-4 border-transparent ${isFull ? 'opacity-50' : ''}`;
            
            // Generate 2x2 preview
            const previewCanvas = document.createElement('div');
            previewCanvas.className = "w-full aspect-square grid grid-cols-2 grid-rows-2 gap-1 bg-gray-200 mb-2 rounded overflow-hidden";
            for(let i=0; i<4; i++) {
                const piece = document.createElement('div');
                piece.style.backgroundImage = `url('pokemons/${img}')`;
                piece.style.backgroundSize = '200% 200%';
                const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
                piece.style.backgroundPosition = pos[i];

                if (i < pieces || isFull) { // show pieces they have
                    piece.className = 'w-full h-full';
                } else {
                    // Light silhouette for missing pieces
                    piece.className = 'w-full h-full opacity-40';
                    piece.style.filter = 'brightness(0) invert(0.7)';
                }
                previewCanvas.appendChild(piece);
            }

            const p = document.createElement('p');
            p.className = 'font-bold text-sm';
            p.textContent = isFull ? '已收集滿！' : `進度: ${pieces}/4`;

            div.appendChild(previewCanvas);
            div.appendChild(p);

            if (!isFull) {
                div.addEventListener('click', () => {
                    // Deselect all
                    Array.from(grid.children).forEach(c => c.classList.remove('border-honey', 'shadow-lg'));
                    // Select this
                    div.classList.add('border-honey', 'shadow-lg');
                    this.selectedPokemonForSession = img;
                    document.getElementById('start-session-btn').disabled = false;
                });
            }

            grid.appendChild(div);
        });
    },

    setupWordInput(word) {
        const container = document.getElementById('word-input-container');
        container.innerHTML = '';
        
        for (let i = 0; i < word.length; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'letter-input';
            input.dataset.index = i;
            
            input.addEventListener('input', (e) => {
                if (e.target.value && i < word.length - 1) {
                    container.children[i + 1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && i > 0) {
                    container.children[i - 1].focus();
                }
            });

            container.appendChild(input);
        }
        
        if (container.children.length > 0) {
            container.children[0].focus();
        }
    },

    submitWord() {
        const container = document.getElementById('word-input-container');
        let word = '';
        Array.from(container.children).forEach(input => {
            word += input.value;
        });
        Game.checkWord(word);
    },

    showFeedback(isCorrect, coins = 0, correctWord = '') {
        const overlay = document.getElementById('feedback-overlay');
        const emoji = document.getElementById('feedback-emoji');
        const text = document.getElementById('feedback-text');
        const coinsEl = document.getElementById('feedback-coins');
        const inputs = document.querySelectorAll('.letter-input');

        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);

        if (isCorrect) {
            emoji.textContent = '🍯';
            text.textContent = '正確！';
            text.className = 'text-5xl font-fredoka text-green-500 mb-2';
            coinsEl.innerHTML = `+ <span class="coin-amount text-3xl">${coins}</span> 🪙`;
            coinsEl.classList.remove('hidden');
            inputs.forEach(i => i.classList.add('correct'));
        } else {
            emoji.textContent = '🥀';
            text.textContent = `錯誤！正解是: ${correctWord}`;
            text.className = 'text-4xl font-fredoka text-red-500 mb-2';
            coinsEl.classList.add('hidden');
            inputs.forEach(i => i.classList.add('wrong'));
        }
    },

    hideFeedback() {
        const overlay = document.getElementById('feedback-overlay');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    },

    showSessionSummary(accuracy, pokemonImg) {
        this.showView('view-session-summary');
        
        const preview = document.getElementById('earned-piece-preview');
        preview.innerHTML = '';
        preview.className = "w-48 h-48 mb-8 grid grid-cols-2 grid-rows-2 gap-1 border-4 border-bee-yellow rounded-2xl overflow-hidden shadow-lg bg-gray-200";

        const inventory = Auth.currentUser.stats.pokemon_inventory || {};
        const pieces = inventory[pokemonImg] || 0;
        
        // Render 2x2 grid
        const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
        for(let i=0; i<4; i++) {
            const div = document.createElement('div');
            div.style.backgroundImage = `url('pokemons/${pokemonImg}')`;
            div.style.backgroundSize = '200% 200%';
            div.style.backgroundPosition = pos[i];
            
            if (i < pieces) {
                div.className = "w-full h-full";
                // Animation for the NEWEST piece
                if (i === pieces - 1) {
                    div.classList.add('animate-bounce');
                    div.style.zIndex = "10";
                }
            } else {
                div.className = "w-full h-full opacity-30 grayscale";
                div.style.filter = 'brightness(0) invert(0.7)';
            }
            preview.appendChild(div);
        }

        const msg = document.getElementById('summary-msg');
        if (pieces === 4) {
            msg.textContent = "太厲害了！你已經完整收集了這隻寶可夢！";
        } else {
            msg.textContent = `挑戰成功！獲得一塊新拼圖！(${pieces}/4)`;
        }

        // Play music on success screen
        Music.play();
    },

    showGalleryDetail(pokemonImg) {
        const modal = document.getElementById('view-gallery-modal');
        const container = document.getElementById('modal-puzzle-container');
        const status = document.getElementById('modal-pokemon-status');
        
        container.innerHTML = '';
        const inventory = Auth.currentUser.stats.pokemon_inventory || {};
        const pieces = inventory[pokemonImg] || 0;

        const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
        for(let i=0; i<4; i++) {
            const div = document.createElement('div');
            div.style.backgroundImage = `url('pokemons/${pokemonImg}')`;
            div.style.backgroundSize = '200% 200%';
            div.style.backgroundPosition = pos[i];
            
            if (i < pieces) {
                div.className = "w-full h-full";
            } else {
                div.className = "w-full h-full opacity-30 grayscale";
                div.style.filter = 'brightness(0) invert(0.7)';
            }
            container.appendChild(div);
        }

        status.textContent = pieces === 4 ? "✨ 已完全收集完成！ ✨" : `目前收集進度: ${pieces} / 4`;
        
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    },

    hideGalleryDetail() {
        const modal = document.getElementById('view-gallery-modal');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    },

    updateLevelStats() {
        // Update Title Indicator
        const indicator = document.getElementById('level-indicator');
        const phaseLabel = Game.isPracticePhase ? '錯題練習' : `第 ${Game.currentIndex + 1}/${Game.sessionWords.length} 題`;
        indicator.textContent = `${Game.currentLevel} 字母挑戰 - ${phaseLabel}`;

        const accuracy = Game.stats.totalInLevel > 0 
            ? Math.round((Game.stats.correctInLevel / Game.stats.totalInLevel) * 100) 
            : 0;
        document.getElementById('level-accuracy').textContent = accuracy;
        document.getElementById('accuracy-bar').style.width = `${accuracy}%`;

        const mastery = Auth.currentUser.stats.word_mastery[Game.currentWord] || { streak: 0 };
        document.getElementById('word-streak').textContent = `${mastery.streak} / 3`;
        
        const dots = document.getElementById('streak-dots').children;
        for (let i = 0; i < 3; i++) {
            if (i < mastery.streak) {
                dots[i].classList.replace('bg-gray-300', 'bg-honey');
            } else {
                dots[i].classList.replace('bg-honey', 'bg-gray-300');
            }
        }
    },

    renderAccuracyChart() {
        if (!Auth.currentUser || !Auth.currentUser.stats.word_mastery) return;
        const mastery = Auth.currentUser.stats.word_mastery;
        const words = Object.keys(mastery);
        if (words.length === 0) return;

        const errorCounts = words.map(w => ({ word: w, errors: mastery[w].errors || 0 }))
                                 .filter(w => w.errors > 0)
                                 .sort((a, b) => b.errors - a.errors)
                                 .slice(0, 10);

        const labels = errorCounts.map(w => w.word);
        const data = errorCounts.map(w => w.errors);

        const canvas = document.getElementById('accuracyChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        if (this.accuracyChartInstance) {
            this.accuracyChartInstance.destroy();
        }

        this.accuracyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '錯誤次數',
                    data: data,
                    backgroundColor: '#FF9800',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { stepSize: 1, precision: 0 }
                    }
                }
            }
        });
    },

    calculateBankProgress(bankName) {
        const bankData = WORD_BANKS[bankName];
        if (!bankData) return 0;
        
        let totalWords = 0;
        let masteredWords = 0;
        
        Object.values(bankData).forEach(words => {
            words.forEach(w => {
                totalWords++;
                const m = Auth.currentUser.stats.word_mastery[w];
                if (m && m.streak >= 6) {
                    masteredWords++;
                }
            });
        });
        
        return totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
    },

    updateDashboard() {
        if (!Auth.currentUser) return;
        
        try {
            const stats = Auth.currentUser.stats || { bee_coins: 0, word_mastery: {}, pokemon_inventory: {} };
            const selectedBank = Auth.currentUser.selectedBank || 'G3';
            
            if (document.getElementById('current-username')) {
                document.getElementById('current-username').textContent = Auth.currentUser.username;
            }
            if (document.getElementById('coin-balance')) {
                document.getElementById('coin-balance').textContent = stats.bee_coins || 0;
            }

            // Update progress percentages
            try {
                const g3Prog = UI.calculateBankProgress('G3');
                const g5Prog = UI.calculateBankProgress('G5');
                if (document.getElementById('g3-progress')) document.getElementById('g3-progress').textContent = g3Prog;
                if (document.getElementById('g5-progress')) document.getElementById('g5-progress').textContent = g5Prog;
            } catch (e) { console.error("Progress calc failed:", e); }

            // Filter bank cards and radar charts based on selection
            ['G3', 'G5'].forEach(bank => {
                const card = document.getElementById(`bank-card-${bank}`);
                const radar = document.getElementById(`radar-container-${bank}`);
                if (bank === selectedBank) {
                    if (card) card.classList.remove('hidden');
                    if (radar) radar.classList.remove('hidden');
                } else {
                    if (card) card.classList.add('hidden');
                    if (radar) radar.classList.add('hidden');
                }
            });

            try { UI.renderGalleryPreview(); } catch (e) { console.error("Gallery render failed:", e); }
            try { UI.renderRadarChart(selectedBank, `radarChart${selectedBank}`); } catch (e) { console.error(`${selectedBank} Radar failed:`, e); }
            try { UI.renderAccuracyChart(); } catch (e) { console.error("Accuracy chart failed:", e); }
            
        } catch (e) {
            console.error("Dashboard update failed:", e);
        }
    },

    renderRadarChart(bankName, canvasId) {
        const bankData = WORD_BANKS[bankName];
        const lengths = {};
        
        Object.keys(bankData).forEach(len => {
            const words = bankData[len];
            if (!lengths[len]) lengths[len] = new Set();
            words.forEach(w => lengths[len].add(w));
        });

        const labels = [];
        const data = [];

        Object.keys(lengths).sort((a,b)=>a-b).forEach(len => {
            const words = Array.from(lengths[len]);
            if (words.length > 0) {
                let totalScore = 0;
                words.forEach(w => {
                    const m = Auth.currentUser.stats.word_mastery[w];
                    if (m && m.streak) {
                        totalScore += Math.min(m.streak, 6);
                    }
                });
                
                const maxPossibleScore = words.length * 6;
                const percentage = Math.round((totalScore / maxPossibleScore) * 100);
                
                labels.push(`${len} 字母`);
                data.push(percentage);
            }
        });

        if (labels.length === 0) return;

        const ctx = document.getElementById(canvasId).getContext('2d');
        const chartKey = `${canvasId}Instance`;
        if (this[chartKey]) {
            this[chartKey].destroy();
        }

        this[chartKey] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: `${bankName} 精熟度 (%)`,
                    data: data,
                    backgroundColor: bankName === 'G3' ? 'rgba(255, 152, 0, 0.4)' : 'rgba(33, 150, 243, 0.4)',
                    borderColor: bankName === 'G3' ? '#FF9800' : '#2196F3',
                    pointBackgroundColor: '#212121',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#212121',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        angleLines: { color: 'rgba(0,0,0,0.1)' },
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        pointLabels: {
                            font: { family: 'Inter', size: 10, weight: 'bold' }
                        },
                        ticks: {
                            stepSize: 25,
                            backdropColor: 'transparent',
                            font: { size: 8 },
                            showLabelBackdrop: false
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    // --- Pokemon Gallery ---
    renderGalleryPreview() {
        const container = document.getElementById('gallery-preview');
        if (!container) return;
        container.innerHTML = '';
        
        const stats = Auth.currentUser?.stats || {};
        const inventory = stats.pokemon_inventory || {};

        if (!POKEMON_IMAGES || POKEMON_IMAGES.length === 0) {
            container.innerHTML = '<p class="text-gray-400">目前沒有寶可夢圖鑑資料</p>';
            return;
        }

        POKEMON_IMAGES.forEach(img => {
            const pieces = inventory[img] || 0;
            const isFull = pieces >= 4;

            const div = document.createElement('div');
            div.className = `glass-panel rounded-xl p-2 text-center flex flex-col items-center justify-center transform transition hover:scale-105`;
            
            // Generate 2x2 preview
            const previewCanvas = document.createElement('div');
            previewCanvas.className = "w-full aspect-square grid grid-cols-2 grid-rows-2 gap-[1px] bg-gray-200 rounded overflow-hidden";
            for(let i=0; i<4; i++) {
                const piece = document.createElement('div');
                piece.style.backgroundImage = `url('pokemons/${img}')`;
                piece.style.backgroundSize = '200% 200%';
                const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
                piece.style.backgroundPosition = pos[i];

                if (i < pieces || isFull) { 
                    piece.className = 'w-full h-full';
                } else {
                    piece.className = 'w-full h-full opacity-40';
                    piece.style.filter = 'brightness(0) invert(0.7)';
                }
                previewCanvas.appendChild(piece);
            }

            div.appendChild(previewCanvas);
            
            const nameP = document.createElement('p');
            nameP.className = 'text-sm font-bold mt-2 text-white';
            nameP.textContent = POKEMON_NAMES[img] || '未知寶可夢';
            div.appendChild(nameP);

            const p = document.createElement('p');
            p.className = 'text-[10px] font-bold text-gray-500';
            p.textContent = isFull ? '完成' : `${pieces}/4`;
            div.appendChild(p);

            div.addEventListener('click', () => {
                UI.showGalleryDetail(img, pieces);
            });

            container.appendChild(div);
        });
    },

    openArtShop() {
        const modal = document.getElementById('art-shop-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
        
        this.renderGalleryList();
    },

    renderGalleryList() {
        const listContainer = document.getElementById('art-list');
        listContainer.innerHTML = '';
        
        const inventory = Auth.currentUser.stats.pokemon_inventory || {};

        POKEMON_IMAGES.forEach((img, index) => {
            const pieces = inventory[img] || 0;
            const thumb = document.createElement('div');
            thumb.className = `art-thumb flex items-center justify-center font-bold text-gray-500 bg-gray-200 ${pieces === 4 ? 'completed' : ''}`;
            
            if (pieces > 0) {
                thumb.style.backgroundImage = `url('pokemons/${img}')`;
                thumb.textContent = '';
                // If not fully unlocked, maybe lower opacity or grayscale
                if (pieces < 4) {
                    thumb.style.filter = 'grayscale(80%) opacity(0.8)';
                }
            } else {
                // Silhouette for 0 pieces
                thumb.style.backgroundImage = `url('pokemons/${img}')`;
                thumb.style.filter = 'brightness(0) invert(0.7)';
                thumb.textContent = '';
            }

            thumb.addEventListener('click', () => {
                // Remove selected class
                Array.from(listContainer.children).forEach(c => c.classList.remove('selected'));
                thumb.classList.add('selected');
                this.renderCanvas(img, pieces);
            });

            listContainer.appendChild(thumb);
            
            // Select first one by default
            if (index === 0) thumb.click();
        });
    },

    renderCanvas(imgFilename, unlockedPieces) {
        document.getElementById('gallery-detail-img').src = `pokemons/${imgFilename}`;
        document.getElementById('gallery-detail-name').textContent = POKEMON_NAMES[imgFilename] || '未知寶可夢';
        document.getElementById('gallery-detail-pieces').textContent = `收集進度: ${unlockedPieces} / 4`;
        
        const canvas = document.getElementById('art-canvas');
        canvas.innerHTML = '';
        
        canvas.style.display = 'grid';
        canvas.style.gridTemplateColumns = 'repeat(2, 1fr)';
        canvas.style.gridTemplateRows = 'repeat(2, 1fr)';
        canvas.style.gap = '2px';
        canvas.style.backgroundColor = '#ddd';

        const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];

        for (let i = 0; i < 4; i++) {
            const div = document.createElement('div');
            div.style.backgroundImage = `url('pokemons/${imgFilename}')`;
            div.style.backgroundSize = '200% 200%';
            div.style.backgroundPosition = pos[i];

            if (i < unlockedPieces) {
                div.className = `w-full h-full relative`;
            } else {
                // Light silhouette
                div.className = `w-full h-full relative locked`;
                div.style.filter = 'brightness(0) invert(0.8) opacity(0.5)';
            }
            
            canvas.appendChild(div);
        }
    }
};
