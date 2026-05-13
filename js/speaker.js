// speaker.js

const Speaker = {
    synth: window.speechSynthesis,
    voice: null,

    init() {
        // Wait for voices to be loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.setVoice();
        }
        this.setVoice();
    },

    setVoice() {
        const voices = this.synth.getVoices();
        if (voices.length === 0) return;

        // Try to find a good US English voice
        // Prefer Google US English if available (Chrome)
        let selectedVoice = voices.find(v => v.name === 'Google US English');
        
        // Fallbacks
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang === 'en-US' && v.localService);
        }
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en'));
        }
        
        this.voice = selectedVoice || voices[0];
    },

    speak(text, slow = false) {
        if (this.synth.speaking) {
            console.error('speechSynthesis.speaking');
            this.synth.cancel();
        }

        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.onend = function (event) {
                // Done speaking
            };
            utterThis.onerror = function (event) {
                console.error('SpeechSynthesisUtterance.onerror');
            };

            if (this.voice) {
                utterThis.voice = this.voice;
            }
            
            // Adjust rate for slower spelling if requested
            utterThis.rate = slow ? 0.6 : 0.9;
            utterThis.pitch = 1.1; // Slightly higher pitch for kids
            
            this.synth.speak(utterThis);
        }
    }
};
