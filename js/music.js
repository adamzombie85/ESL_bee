// music.js

const Music = {
    audio: null,
    toggleBtn: null,
    volumeSlider: null,
    isPlaying: false,
    hasInteracted: false,

    init() {
        this.audio = document.getElementById('bg-music');
        this.toggleBtn = document.getElementById('music-toggle-btn');
        this.volumeSlider = document.getElementById('music-volume');

        if (!this.audio || !this.toggleBtn || !this.volumeSlider) return;

        // Set initial volume
        this.audio.volume = this.volumeSlider.value;

        // Toggle music
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        // Change volume
        this.volumeSlider.addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Start music on first interaction
        const startOnInteraction = () => {
            if (this.hasInteracted) return;
            this.hasInteracted = true;
            this.play();
            // Remove listeners after first interaction
            ['click', 'keydown', 'touchstart'].forEach(evt => {
                document.removeEventListener(evt, startOnInteraction);
            });
        };

        ['click', 'keydown', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, startOnInteraction);
        });

        console.log('Music Controller Initialized.');
    },

    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.updateUI();
            })
            .catch(err => {
                console.warn('Autoplay prevented or audio error:', err);
                this.isPlaying = false;
                this.updateUI();
            });
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
    },

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    setVolume(value) {
        this.audio.volume = value;
        if (value == 0) {
            this.updateUI(true);
        } else {
            this.updateUI();
        }
    },

    updateUI(isMuted = false) {
        if (this.isPlaying) {
            this.toggleBtn.textContent = this.audio.volume == 0 ? '🔇' : '🎵';
            this.toggleBtn.classList.add('animate-pulse');
        } else {
            this.toggleBtn.textContent = '⏸️';
            this.toggleBtn.classList.remove('animate-pulse');
        }
        
        if (this.audio.volume == 0 || isMuted) {
             this.toggleBtn.textContent = '🔇';
             this.toggleBtn.classList.remove('animate-pulse');
        }
    }
};
