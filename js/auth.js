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
            this.fetchLatestProgress();
            UI.showView('dashboard');
            UI.updateDashboard();
        } else {
            UI.showView('auth');
        }
    },

    fetchLatestProgress() {
        if (!this.currentUser) return;
        // Use .once('value') for better compatibility
        db.ref('users/' + this.currentUser.username).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    this.currentUser = snapshot.val();
                    this.saveSession();
                    UI.updateDashboard();
                }
            })
            .catch(error => {
                console.error("Firebase fetch error:", error);
            });
    },

    login() {
        const usernameInput = document.getElementById('auth-username').value.trim().replace(/[.#$[\]]/g, "_");
        const passwordInput = document.getElementById('auth-password').value.trim();
        const errorEl = document.getElementById('auth-error');
        const loginBtn = document.querySelector('#auth-form button');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.textContent = '正在連線資料庫...';
        errorEl.classList.add('hidden');

        db.ref('users/' + usernameInput).once('value')
            .then(snapshot => {
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
                    // New user registration
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
                    return db.ref('users/' + usernameInput).set(newUser).then(() => {
                        this.currentUser = newUser;
                        this.saveSession();
                        UI.showView('dashboard');
                        UI.updateDashboard();
                    });
                }
            })
            .catch(error => {
                console.error("Firebase login error:", error);
                errorEl.textContent = '連線失敗：' + error.message + ' (請確認資料庫規則已開啟)';
                errorEl.classList.remove('hidden');
            })
            .finally(() => {
                loginBtn.disabled = false;
                loginBtn.textContent = '進入蜂巢 🍯';
            });
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

    saveProgress() {
        if (!this.currentUser) return;
        this.saveSession();
        // Use non-blocking save
        db.ref('users/' + this.currentUser.username).set(this.currentUser)
            .catch(error => {
                console.error("Firebase save error:", error);
            });
    }
};
