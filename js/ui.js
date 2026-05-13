// ui.js

const POKEMON_IMAGES = [
    "1086bb30451998c2911e948c5be7148b57c38d15.png",
    "1583b45023aabc829f405629e4b0d7259f80a2c0.png",
    "163c4755d05b84456e75c3f7ff14a5d80559a96d.png",
    "2050f1fd1283f473d7d048f8631712e7e003f802.png",
    "60a46a9d79191bbcc037a369c61faa5eed1a8827.png",
    "8708c18964fa2bf675990c90863e5d40164e22a3.png",
    "ad7ffb53f984a6623c53f01cfbc06fc8565ecbd4.png",
    "b57f557201bb4eb545e82c509137036f9e5751ee.png",
    "c65cff51b864d3b37e24832af94c320824e2021d.png",
    "e12ce48ab99b2df6fbbc1e97038c4f6e192d09d7.png",
    "eda09f7ae6a3f5c71eeb1613b2da7b769cf12ae6.png"
];

const UI = {
    chartInstance: null,
    selectedPokemonForSession: null,

    init() {
        document.querySelectorAll('.bank-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bank = e.currentTarget.dataset.bank;
                Game.startBank(bank);
            });
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
            this.showView('dashboard');
        });
        document.getElementById('start-session-btn').addEventListener('click', () => {
            if (this.selectedPokemonForSession) {
                Game.startSession(this.selectedPokemonForSession);
            }
        });

        // Art Shop / Gallery
        document.getElementById('open-gallery-btn').addEventListener('click', () => {
            this.openArtShop();
        });
        document.getElementById('close-shop-btn').addEventListener('click', () => {
            document.getElementById('art-shop-modal').classList.add('hidden', 'opacity-0');
        });

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('view-game').classList.contains('hidden')) return;
            if (e.key === 'Enter') {
                this.submitWord();
            }
        });
    },

    showView(viewId) {
        const targetId = viewId.startsWith('view-') ? viewId : `view-${viewId}`;
        ['view-auth', 'view-dashboard', 'view-game', 'view-pokemon-select'].forEach(id => {
            const el = document.getElementById(id);
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
                const lengths = Object.keys(data).length;
                const progress = Auth.currentUser.stats[`${bank}_progress`] || {};
                const unlocked = Object.values(progress).filter(p => p.unlocked).length;
                const pct = lengths > 0 ? Math.round((unlocked / lengths) * 100) : 0;
                document.getElementById(`${bank}-progress`).textContent = pct;
            }
        });

        this.updateChart();
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
                if (i < pieces || isFull) { // show pieces they have
                    piece.style.backgroundImage = `url('pokemons/${img}')`;
                    piece.style.backgroundSize = '200% 200%';
                    // Position mapping for 2x2 grid
                    const pos = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
                    piece.style.backgroundPosition = pos[i];
                } else {
                    piece.className = 'bg-gray-400 flex items-center justify-center text-xs opacity-50';
                    piece.textContent = '?';
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

    updateChart() {
        const mastery = Auth.currentUser.stats.word_mastery;
        const words = Object.keys(mastery);
        if (words.length === 0) return;

        const errorCounts = words.map(w => ({ word: w, errors: mastery[w].errors }))
                                 .filter(w => w.errors > 0)
                                 .sort((a, b) => b.errors - a.errors)
                                 .slice(0, 10);

        const labels = errorCounts.map(w => w.word);
        const data = errorCounts.map(w => w.errors);

        const ctx = document.getElementById('accuracyChart').getContext('2d');
        
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
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
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    },

    // --- Pokemon Gallery ---
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
                    thumb.style.filter = 'grayscale(80%) blur(1px)';
                }
            } else {
                thumb.textContent = '?';
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
        document.getElementById('current-art-title').textContent = '目標寶可夢';
        document.getElementById('collection-status-text').textContent = `收集進度: ${unlockedPieces} / 4`;
        
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
            div.className = `w-full h-full relative ${i < unlockedPieces ? '' : 'locked'}`;
            
            if (i < unlockedPieces) {
                div.style.backgroundImage = `url('pokemons/${imgFilename}')`;
                div.style.backgroundSize = '200% 200%';
                div.style.backgroundPosition = pos[i];
            }
            
            canvas.appendChild(div);
        }
    }
};
