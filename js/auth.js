// auth.js

const Auth = {
    currentUser: null,

    init() {
        this.checkLogin();
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        const regBtn = document.getElementById('register-btn');
        if (regBtn) {
            regBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.register();
            });
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    },

    checkLogin() {
        const savedUser = localStorage.getItem('bee_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            UI.showView('dashboard');
            UI.updateDashboard();
            // Background sync latest from cloud
            this.syncFromCloud();
        } else {
            UI.showView('auth');
        }
    },

    async syncFromCloud() {
        if (!this.currentUser || !GAS_WEB_APP_URL) return;
        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: this.currentUser.username,
                    password: this.currentUser.password
                })
            });
            const result = await response.json();
            if (result.success) {
                this.currentUser.stats = result.data;
                this.saveSession();
                UI.updateDashboard();
            }
        } catch (e) {
            console.warn("Cloud sync failed, staying in local mode.");
        }
    },

    async login() {
        const usernameInput = document.getElementById('auth-username').value.trim();
        const passwordInput = document.getElementById('auth-password').value.trim();
        const bankInput = document.querySelector('input[name="auth-bank"]:checked').value;
        const errorEl = document.getElementById('auth-error');
        const loginBtn = document.getElementById('login-btn');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        loginBtn.disabled = true;
        const originalText = loginBtn.textContent;
        loginBtn.textContent = '連線中...';
        errorEl.classList.add('hidden');

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: usernameInput,
                    password: passwordInput
                })
            });
            const result = await response.json();

            if (result.success) {
                this.currentUser = {
                    username: usernameInput,
                    password: passwordInput,
                    selectedBank: bankInput,
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
            this.handleLocalLogin(usernameInput, passwordInput, bankInput, errorEl);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    },

    async register() {
        const usernameInput = document.getElementById('auth-username').value.trim();
        const passwordInput = document.getElementById('auth-password').value.trim();
        const bankInput = document.querySelector('input[name="auth-bank"]:checked').value;
        const errorEl = document.getElementById('auth-error');
        const regBtn = document.getElementById('register-btn');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        regBtn.disabled = true;
        regBtn.textContent = '註冊中...';
        errorEl.classList.add('hidden');

        // Check if we have local data for THIS user in 'bee_users'
        let localUsers = JSON.parse(localStorage.getItem('bee_users') || '{}');
        let initialStats = {
            bee_coins: 0,
            inventory: [],
            pokemon_inventory: {},
            unlocked_levels: { G3: [3], G5: [5] },
            g3_progress: {},
            g5_progress: {},
            word_mastery: {},
            battle_stats: { daily_count: 0, last_date: "" }
        };

        if (localUsers[usernameInput]) {
            initialStats = localUsers[usernameInput].stats;
            console.log("Found local data for registration migration.");
        }

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                // 使用 text/plain 避免 CORS preflight (OPTIONS) 限制
                mode: 'no-cors', 
                body: JSON.stringify({
                    action: 'login',
                    username: usernameInput,
                    password: passwordInput,
                    data: initialStats
                })
            });

            // 注意：mode: 'no-cors' 會導致 opaque response，無法讀取 body。
            // 我們應該使用標準 fetch，但確保 GAS 伺服器允許 CORS。
            // GAS 網頁應用程式通常透過重定向處理 CORS，所以我們需要標準模式。
            
            // 回復為標準模式並加入偵錯
            const stdResponse = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'login',
                    username: usernameInput,
                    password: passwordInput,
                    data: initialStats
                })
            });

            const text = await stdResponse.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("GAS Response was not JSON:", text);
                throw new Error("伺服器回傳格式錯誤 (Unexpected end of JSON)");
            }

            if (result.success) {
                this.currentUser = {
                    username: usernameInput,
                    password: passwordInput,
                    selectedBank: bankInput,
                    stats: result.data
                };
                this.saveSession();
                UI.showView('dashboard');
                UI.updateDashboard();
                alert("恭喜！註冊成功，本機進度已同步至雲端試算表。");
            } else {
                errorEl.textContent = result.message || '註冊失敗';
                errorEl.classList.remove('hidden');
            }
        } catch (error) {
            console.error("GAS register error:", error);
            errorEl.textContent = '註冊過程發生錯誤：' + error.message;
            errorEl.classList.remove('hidden');
        } finally {
            regBtn.disabled = false;
            regBtn.textContent = '註冊 ✨';
        }
    },

    handleLocalLogin(username, password, bank, errorEl) {
        let users = JSON.parse(localStorage.getItem('bee_users') || '{}');
        if (users[username]) {
            if (users[username].password === password) {
                this.currentUser = users[username];
                this.currentUser.selectedBank = bank; // Apply selection
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
                selectedBank: bank,
                stats: {
                    bee_coins: 0,
                    inventory: [],
                    pokemon_inventory: {},
                    unlocked_levels: { G3: [3], G5: [5] },
                    g3_progress: {},
                    g5_progress: {},
                    word_mastery: {},
                    battle_stats: { daily_count: 0, last_date: "" }
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
