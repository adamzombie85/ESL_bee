// app.js

const App = {
    init() {
        Auth.init();
        Speaker.init();
        UI.init();
        
        // Auto-load from the Google Sheet provided by the user
        const SHEET_ID = '1ENYtgSVLmHFoT6fOK6xoauSeCkvJ7NhwnGtX4cHwkgQ';
        const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
        
        this.importGoogleSheet(CSV_URL);
        
        window.importGoogleSheet = this.importGoogleSheet.bind(this);
    },

    async importGoogleSheet(csvUrl) {
        try {
            const response = await fetch(csvUrl);
            const text = await response.text();
            
            // Simple CSV parser
            const lines = text.split('\n');
            if (lines.length <= 1) return; // If empty or just headers, don't override
            
            let newBank = { G3: {}, G5: {} };
            
            // Assume format: Word, Bank (e.g. apple, G3)
            // Or Word, Level, Bank etc.
            // If the user's sheet just has Word and Bank:
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const cols = lines[i].split(',');
                let word = cols[0] ? cols[0].trim().toLowerCase() : '';
                let bank = cols[1] ? cols[1].trim().toUpperCase() : 'G3';
                
                // Remove quotes if present
                word = word.replace(/(^"|"$)/g, '');
                bank = bank.replace(/(^"|"$)/g, '');
                
                if (word && (bank === 'G3' || bank === 'G5')) {
                    const length = word.length;
                    if (!newBank[bank][length]) newBank[bank][length] = [];
                    newBank[bank][length].push(word);
                }
            }
            
            // Only override if we actually parsed some words
            if (Object.keys(newBank.G3).length > 0 || Object.keys(newBank.G5).length > 0) {
                Object.assign(WORD_BANKS, newBank);
                console.log('成功載入 Google Sheet 題庫！');
            }
        } catch (e) {
            console.error('載入 Google Sheet 失敗，將使用本地預設題庫。', e);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
