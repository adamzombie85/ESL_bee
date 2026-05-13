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
        document.getElementById('sync-cloud-btn').addEventListener('click', async () => {
            const btn = document.getElementById('sync-cloud-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '⌛ 同步中...';
            btn.disabled = true;
            await this.saveProgress(true);
            setTimeout(() => {
                btn.innerHTML = '✅ 已完成';
                btn.disabled = false;
                setTimeout(() => btn.innerHTML = originalText, 2000);
            }, 500);
        });
    },

    checkLogin() {
        const savedUser = localStorage.getItem('bee_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            UI.showView('dashboard');
            UI.updateDashboard();
        } else {
            UI.showView('auth');
        }
    },

    async login() {
        const usernameInput = document.getElementById('auth-username').value.trim();
        const passwordInput = document.getElementById('auth-password').value.trim();
        const errorEl = document.getElementById('auth-error');
        const loginBtn = document.querySelector('#auth-form button');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        if (GAS_WEB_APP_URL === "YOUR_GAS_WEB_APP_URL_HERE") {
            errorEl.textContent = '請先在 gas-config.js 中設定 GAS 網址！';
            errorEl.classList.remove('hidden');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = '正在連線試算表...';
        errorEl.classList.add('hidden');

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: usernameInput,
                    password: passwordInput,
                    data: {
                        bee_coins: 0,
                        inventory: [],
                        pokemon_inventory: {},
                        unlocked_levels: { G3: [3], G5: [5] },
                        g3_progress: {},
                        g5_progress: {},
                        word_mastery: {}
                    }
                })
            });
            const result = await response.json();

            if (result.success) {
                this.currentUser = {
                    username: usernameInput,
                    password: passwordInput,
                    stats: result.data
                };
                this.saveSession();
                UI.showView('dashboard');
                UI.updateDashboard();
            } else {
                errorEl.textContent = result.message || '登入失敗';
                errorEl.classList.remove('hidden');
            }
        } catch (error) {
            console.error("GAS login error:", error);
            // Fallback to local
            this.handleLocalLogin(usernameInput, passwordInput, errorEl);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = '進入蜂巢 🍯';
        }
    },

    handleLocalLogin(username, password, errorEl) {
        let users = JSON.parse(localStorage.getItem('bee_users') || '{}');
        if (users[username]) {
            if (users[username].password === password) {
                this.currentUser = users[username];
                this.saveSession();
                UI.showView('dashboard');
                UI.updateDashboard();
            } else {
                errorEl.textContent = '密碼錯誤！(本機模式)';
                errorEl.classList.remove('hidden');
            }
        } else {
            const newUser = {
                username: username,
                password: password,
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
            users[username] = newUser;
            localStorage.setItem('bee_users', JSON.stringify(users));
            this.currentUser = newUser;
            this.saveSession();
            UI.showView('dashboard');
            UI.updateDashboard();
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

    async saveProgress(isManual = false) {
        if (!this.currentUser) return;
        this.saveSession();
        
        // Save to Local always
        let users = JSON.parse(localStorage.getItem('bee_users') || '{}');
        users[this.currentUser.username] = this.currentUser;
        localStorage.setItem('bee_users', JSON.stringify(users));

        // Save to Google Sheets via GAS
        if (GAS_WEB_APP_URL !== "YOUR_GAS_WEB_APP_URL_HERE") {
            try {
                const response = await fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'save',
                        username: this.currentUser.username,
                        password: this.currentUser.password,
                        data: this.currentUser.stats
                    })
                });
                const result = await response.json();
                if (result.success) {
                    console.log("Progress synced to Google Sheets.");
                } else if (isManual) {
                    alert("同步失敗：" + result.message);
                }
            } catch (error) {
                console.error("GAS save error:", error);
                if (isManual) {
                    alert("連線試算表失敗，請檢查網路。");
                }
            }
        }
    }
};
