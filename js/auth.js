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
            UI.showView('dashboard');
            UI.updateDashboard();
        } else {
            UI.showView('auth');
        }
    },

    login() {
        const usernameInput = document.getElementById('auth-username').value.trim();
        const passwordInput = document.getElementById('auth-password').value.trim();
        const errorEl = document.getElementById('auth-error');

        if (!usernameInput || !passwordInput) {
            errorEl.textContent = '請輸入代號與密碼！';
            errorEl.classList.remove('hidden');
            return;
        }

        // Fetch from local storage
        let users = JSON.parse(localStorage.getItem('bee_users') || '{}');
        
        if (users[usernameInput]) {
            // Existing user
            if (users[usernameInput].password === passwordInput) {
                this.currentUser = users[usernameInput];
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
                    inventory: [], // Array of unlocked piece IDs e.g. 'mona_lisa_0'
                    g3_progress: {},
                    g5_progress: {},
                    word_mastery: {} // { "apple": { streak: 0, errors: 2 } }
                }
            };
            users[usernameInput] = newUser;
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

    saveProgress() {
        if (!this.currentUser) return;
        let users = JSON.parse(localStorage.getItem('bee_users') || '{}');
        users[this.currentUser.username] = this.currentUser;
        localStorage.setItem('bee_users', JSON.stringify(users));
        this.saveSession();
    }
};
