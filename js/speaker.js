// speaker.js

const Speaker = {
    synth: window.speechSynthesis,
    voice: null,
    rate: 0.9, // Default rate
    onVoicesLoaded: null,

    init() {
        // Wait for voices to be loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.setVoice();
                if (this.onVoicesLoaded) this.onVoicesLoaded();
            };
        }
        this.setVoice();
    },

    getEnglishVoices() {
        return this.synth.getVoices().filter(v => v.lang.startsWith('en'));
    },

    setVoiceByName(name) {
        const voices = this.getEnglishVoices();
        const selected = voices.find(v => v.name === name);
        if (selected) {
            this.voice = selected;
        }
    },

    setVoice() {
        const voices = this.getEnglishVoices();
        if (voices.length === 0) return;

        // Try to find a good US English voice
        let selectedVoice = voices.find(v => v.name === 'Google US English') ||
                            voices.find(v => v.lang === 'en-US' && v.localService) ||
                            voices[0];
        
        if (!this.voice) {
            this.voice = selectedVoice;
        }
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
            
            // Apply configurable rate
            utterThis.rate = slow ? Math.max(0.3, this.rate - 0.3) : this.rate;
            utterThis.pitch = 1.1; // Slightly higher pitch for kids
            
            this.synth.speak(utterThis);
        }
    }
};
