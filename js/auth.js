// auth.js

const Auth = {
    currentUser: null,

    init() {
        this.checkLogin();
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    },

    checkLogin() {
        const savedUser = localStorage.getItem('bee_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            // We should ideally re-fetch from Firebase here to get latest
            this.fetchLatestProgress();
            UI.showView('dashboard');
            UI.updateDashboard();
        } else {
            UI.showView('auth');
        }
    },

    async fetchLatestProgress() {
        if (!this.currentUser) return;
        try {
            const snapshot = await db.ref('users/' + this.currentUser.username).get();
            if (snapshot.exists()) {
                this.currentUser = snapshot.val();
                this.saveSession();
                UI.updateDashboard();
            }
        } catch (error) {
            console.error("Firebase fetch error:", error);
        }
    },

    async login() {
        const usernameInput = document.getElementById('auth-username').value.trim().replace(/[.#$[\]]/g, "_"); // Firebase keys safety
        const passwordInput = document.getElementById('auth-password').value.trim();
        const errorEl = document.getElementById('auth-error');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            const snapshot = await db.ref('users/' + usernameInput).get();
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                if (userData.password === passwordInput) {
                    this.currentUser = userData;
                    this.saveSession();
                    UI.showView('dashboard');
                    UI.updateDashboard();
                } else {
                    errorEl.textContent = '密碼錯誤！';
                    errorEl.classList.remove('hidden');
                }
            } else {
                // New user registration in Cloud
                const newUser = {
                    username: usernameInput,
                    password: passwordInput,
                    stats: {
                        bee_coins: 0,
                        inventory: [],
                        pokemon_inventory: {},
                        unlocked_levels: { G3: [3], G5: [5] },
                        g3_progress: {},
                        g5_progress: {},
                        word_mastery: {}
                    }
                };
                await db.ref('users/' + usernameInput).set(newUser);
                this.currentUser = newUser;
                this.saveSession();
                UI.showView('dashboard');
                UI.updateDashboard();
            }
        } catch (error) {
            console.error("Firebase login error:", error);
            errorEl.textContent = '資料庫連線失敗，請檢查網路或 Firebase 設定。';
            errorEl.classList.remove('hidden');
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('bee_current_user');
        document.getElementById('auth-username').value = '';
        document.getElementById('auth-password').value = '';
        UI.showView('auth');
    },

    saveSession() {
        localStorage.setItem('bee_current_user', JSON.stringify(this.currentUser));
    },

    async saveProgress() {
        if (!this.currentUser) return;
        this.saveSession();
        try {
            // Upload to Cloud
            await db.ref('users/' + this.currentUser.username).set(this.currentUser);
        } catch (error) {
            console.error("Firebase save error:", error);
        }
    }
};
