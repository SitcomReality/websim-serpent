export const Storage = {
    key: 'serpent_highscore',
    getHighScore() {
        const v = localStorage.getItem(this.key);
        return v ? parseInt(v, 10) : 0;
    },
    setHighScore(score) {
        localStorage.setItem(this.key, String(score));
    }
};