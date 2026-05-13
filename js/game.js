// game.js

const Game = {
    currentBank: null,
    currentLevel: null,
    levelWords: [],
    sessionWords: [],
    sessionErrors: [], // words failed during this session
    practiceQueue: [], // words to practice in practice phase
    isPracticePhase: false,
    currentWord: '',
    currentIndex: 0,
    startTime: 0,
    selectedPokemon: null,
    stats: {
        correctInLevel: 0,
        totalInLevel: 0
    },

    startBank(bankName) {
        this.currentBank = bankName;
        const bankData = WORD_BANKS[bankName];
        if (!bankData) return;
        
        const lengths = Object.keys(bankData).map(Number).sort((a,b)=>a-b);
        let unlockedLevel = lengths[0];
        
        const progress = Auth.currentUser.stats[`${bankName.toLowerCase()}_progress`] || {};
        for (let i = 0; i < lengths.length; i++) {
            const l = lengths[i];
            if (progress[l] && progress[l].unlocked) {
                unlockedLevel = lengths[i+1] || lengths[i];
            } else {
                break;
            }
        }
        
        this.currentLevel = unlockedLevel;
        
        // Show Pokemon Selection first
        UI.showPokemonSelect();
    },

    startSession(pokemonId) {
        this.selectedPokemon = pokemonId;
        const words = WORD_BANKS[this.currentBank][this.currentLevel];
        
        if (!words) {
            alert('恭喜你完成了所有關卡！');
            UI.showView('dashboard');
            return;
        }

        // Sort all words in level
        this.levelWords = this.sortWordsByMastery(words);
        
        // Pick top 10 words for this session (always 10, or max available if less than 10)
        this.sessionWords = this.levelWords.slice(0, 10);
        
        // If there are less than 10 unmastered words, we could technically fill the rest with already mastered words 
        // to always have exactly 10, but typically it's fine to just give them the remaining ones.
        // However, user said "每次都抽10題". If unmastered < 10, fill the gap with random mastered words.
        if (this.sessionWords.length < 10 && words.length >= 10) {
            const masteredWords = words.filter(w => !this.sessionWords.includes(w)).sort(() => Math.random() - 0.5);
            const needed = 10 - this.sessionWords.length;
            this.sessionWords = this.sessionWords.concat(masteredWords.slice(0, needed));
        }

        this.sessionErrors = [];
        this.isPracticePhase = false;
        
        this.stats.correctInLevel = 0;
        this.stats.totalInLevel = this.sessionWords.length;
        this.currentIndex = 0;
        
        UI.showView('game');
        document.getElementById('practice-indicator').classList.add('hidden');
        this.nextWord();
    },

    sortWordsByMastery(words) {
        const mastery = Auth.currentUser.stats.word_mastery || {};
        
        // Filter out mastered words (streak >= 3)
        const unmastered = words.filter(w => {
            const m = mastery[w] || { streak: 0 };
            return m.streak < 3;
        });

        // If all mastered in this level, just pull random 10
        if (unmastered.length === 0) {
            return [...words].sort(() => Math.random() - 0.5);
        }

        return unmastered.sort((a, b) => {
            const statA = mastery[a] || { streak: 0, errors: 0 };
            const statB = mastery[b] || { streak: 0, errors: 0 };
            
            const isNewA = statA.streak === 0 && statA.errors === 0;
            const isNewB = statB.streak === 0 && statB.errors === 0;
            
            // 1. 完全沒練過的優先 (Unpracticed first)
            if (isNewA && !isNewB) return -1;
            if (!isNewA && isNewB) return 1;
            
            // 2. 錯誤次數高的優先 (High errors next)
            if (statA.errors !== statB.errors) {
                return statB.errors - statA.errors; 
            }
            
            // 3. 隨機排序 (Random for the rest)
            return Math.random() - 0.5;
        });
    },

    nextWord() {
        let queue = this.isPracticePhase ? this.practiceQueue : this.sessionWords;

        if (this.currentIndex >= queue.length) {
            if (!this.isPracticePhase && this.sessionErrors.length > 0) {
                // Enter Practice Phase
                this.isPracticePhase = true;
                this.practiceQueue = [...this.sessionErrors];
                this.currentIndex = 0;
                document.getElementById('practice-indicator').classList.remove('hidden');
                alert("進入錯題練習階段！把剛剛錯的字都答對才能拿到寶可夢碎片喔！");
                this.nextWord();
                return;
            } else if (this.isPracticePhase && this.practiceQueue.length > 0) {
                // Still have errors in practice queue (they got it wrong AGAIN during practice)
                this.currentIndex = 0;
                this.nextWord();
                return;
            } else {
                // Completely finished session
                this.finishSession();
                return;
            }
        }
        
        this.currentWord = queue[this.currentIndex];
        this.startTime = Date.now();
        UI.setupWordInput(this.currentWord);
        Speaker.speak(this.currentWord);
        UI.updateLevelStats();
    },

    checkWord(inputWord) {
        const isCorrect = inputWord.toLowerCase() === this.currentWord.toLowerCase();
        const timeTaken = (Date.now() - this.startTime) / 1000;
        
        let mastery = Auth.currentUser.stats.word_mastery[this.currentWord] || { streak: 0, errors: 0 };
        
        if (isCorrect) {
            if (!this.isPracticePhase) {
                mastery.streak += 1;
                this.stats.correctInLevel++;
            } else {
                // Remove from practice queue
                this.practiceQueue.splice(this.currentIndex, 1);
                this.currentIndex--; // Adjust index since we removed item
            }
            
            let coins = Math.max(5, (this.currentWord.length * 10) - Math.floor(timeTaken / 2));
            if (this.isPracticePhase) coins = 2; // small reward for practice
            Auth.currentUser.stats.bee_coins += coins;
            
            UI.showFeedback(true, coins);
            document.getElementById('sfx-correct').play();
        } else {
            if (!this.isPracticePhase) {
                mastery.streak = 0;
                mastery.errors += 1;
                if (!this.sessionErrors.includes(this.currentWord)) {
                    this.sessionErrors.push(this.currentWord);
                }
            }
            UI.showFeedback(false, 0, this.currentWord);
            document.getElementById('sfx-wrong').play();
        }
        
        Auth.currentUser.stats.word_mastery[this.currentWord] = mastery;
        Auth.saveProgress();
        UI.updateDashboard(); 
        UI.updateLevelStats();
        
        setTimeout(() => {
            UI.hideFeedback();
            this.currentIndex++;
            this.nextWord();
        }, 2000);
    },

    skipWord() {
        let mastery = Auth.currentUser.stats.word_mastery[this.currentWord] || { streak: 0, errors: 0 };
        if (!this.isPracticePhase) {
            mastery.streak = 0;
            mastery.errors += 1;
            if (!this.sessionErrors.includes(this.currentWord)) {
                this.sessionErrors.push(this.currentWord);
            }
        }
        Auth.currentUser.stats.word_mastery[this.currentWord] = mastery;
        Auth.saveProgress();
        
        UI.showFeedback(false, 0, this.currentWord);
        document.getElementById('sfx-wrong').play();
        
        setTimeout(() => {
            UI.hideFeedback();
            this.currentIndex++;
            this.nextWord();
        }, 2000);
    },

    finishSession() {
        const accuracy = this.stats.correctInLevel / this.stats.totalInLevel;
        
        let progress = Auth.currentUser.stats[`${this.currentBank.toLowerCase()}_progress`] || {};
        if (!progress[this.currentLevel]) {
            progress[this.currentLevel] = { unlocked: false, bestAccuracy: 0, totalPracticed: 0 };
        }
        
        progress[this.currentLevel].bestAccuracy = Math.max(progress[this.currentLevel].bestAccuracy, accuracy);
        progress[this.currentLevel].totalPracticed += this.sessionWords.length;
        
        // Give Pokemon Reward
        if (!Auth.currentUser.stats.pokemon_inventory) {
            Auth.currentUser.stats.pokemon_inventory = {};
        }
        let pieces = Auth.currentUser.stats.pokemon_inventory[this.selectedPokemon] || 0;
        if (pieces < 4) {
            pieces += 1;
            Auth.currentUser.stats.pokemon_inventory[this.selectedPokemon] = pieces;
            document.getElementById('sfx-unlock').play();
            alert(`恭喜通關！獲得了一塊寶可夢碎片！`);
        }

        // Check if unlocked next level (need 90% accuracy in a session AND enough practice? Actually 90% is fine)
        if (accuracy >= 0.9 && !progress[this.currentLevel].unlocked) {
            // Need at least 20 words practiced in total to unlock next, or just the 90%
            if (progress[this.currentLevel].totalPracticed >= 20) {
                progress[this.currentLevel].unlocked = true;
                alert(`太棒了！你在 ${this.currentLevel} 字母挑戰達到精熟標準，解鎖下一關！`);
            }
        }
        
        Auth.currentUser.stats[`${this.currentBank.toLowerCase()}_progress`] = progress;
        Auth.saveProgress();
        UI.showView('dashboard');
        UI.updateDashboard();
        UI.openArtShop(); // Show the gallery so they can see their new piece!
    }
};
