// music.js

const Music = {
    audio: null,
    isPlaying: false,

    init() {
        this.audio = document.getElementById('bg-music');

        if (!this.audio) return;

        // Set initial volume to a reasonable level
        this.audio.volume = 0.5;

        console.log('Music Controller Initialized.');
    },

    play() {
        if (!this.audio) return;
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
            })
            .catch(err => {
                console.warn('Autoplay prevented or audio error:', err);
                this.isPlaying = false;
            });
    },

    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
    },

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    setVolume(value) {
        if (!this.audio) return;
        this.audio.volume = value;
    }
};
