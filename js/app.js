// app.js

const App = {
    init() {
        Auth.init();
        Speaker.init();
        Music.init();
        UI.init();
        console.log('Spelling Bee Collector Initialized.');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
