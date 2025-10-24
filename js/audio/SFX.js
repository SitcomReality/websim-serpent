export const SFX = {
    muted: false,
    sounds: {
        bubbleup: '/sfx/bubbleup.wav',
        bubbledown: '/sfx/bubbledown.wav',
        omnom: '/sfx/omnom.wav',
        plorble: '/sfx/plorble.wav'
    },
    play(name) {
        if (this.muted) return;
        const src = this.sounds[name];
        if (!src) return;
        const a = new Audio(src);
        a.volume = 1;
        a.play().catch(() => {});
    },
    toggleMute() { this.muted = !this.muted; },
    isMuted() { return this.muted; }
};