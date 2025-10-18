export const SFX = {
    muted: false,
    sounds: {
        bubbleup: '/sfx/bubbleup.wav',
        bubbledown: '/sfx/bubbledown.wav',
        omnom: '/sfx/omnom.wav',
        nom: '/sfx/nom.wav',
        plorble: '/sfx/plorble.wav'
    },
    play(name) {
        if (this.muted) return;
        const src = this.sounds[name];
        if (!src) return;
        // profile the creation/trigger cost if profiler exists
        if (typeof window !== 'undefined' && window.Profiler) window.Profiler.markStart(`SFX:${name}`);
        const a = new Audio(src);
        a.volume = 1;
        a.play().catch(() => {});
        if (typeof window !== 'undefined' && window.Profiler) window.Profiler.markEnd(`SFX:${name}`);
    },
    toggleMute() { this.muted = !this.muted; },
    isMuted() { return this.muted; }
};