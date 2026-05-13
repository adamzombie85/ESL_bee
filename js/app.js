// app.js

const App = {
    init() {
        Auth.init();
        Speaker.init();
        UI.init();
        
        // Expose function for user to import google sheet in console if needed, 
        // or we could add a button in dashboard later.
        window.importGoogleSheet = this.importGoogleSheet.bind(this);
    },

    async importGoogleSheet(csvUrl) {
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            
            // Simple CSV parser
            const lines = text.split('\n');
            const headers = lines[0].toLowerCase().split(',');
            
            let newBank = { G3: {}, G5: {} };
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(',');
                // Assuming columns: Word, Bank (e.g. apple, G3)
                let word = cols[0] ? cols[0].trim().toLowerCase() : '';
                let bank = cols[1] ? cols[1].trim().toUpperCase() : 'G3';
                
                if (word && (bank === 'G3' || bank === 'G5')) {
                    const length = word.length;
                    if (!newBank[bank][length]) newBank[bank][length] = [];
                    newBank[bank][length].push(word);
                }
            }
            
            // Override WORD_BANKS
            Object.assign(WORD_BANKS, newBank);
            alert('成功載入 Google Sheet 題庫！');
            UI.updateDashboard();
        } catch (e) {
            console.error(e);
            alert('載入 Google Sheet 失敗，請確認網址與 CSV 格式。');
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
