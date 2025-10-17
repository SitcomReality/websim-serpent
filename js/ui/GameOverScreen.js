import { Screen } from './Screen.js';

export class GameOverScreen extends Screen {
    constructor(onReturnToMenu) {
        super('game-over');
        this.onReturnToMenu = onReturnToMenu;
        this.score = 0;
        this.render();
    }

    setScore(score, highScore, isNewHigh = false, prevHighScore = 0) {
        this.score = score;
        this.element.querySelector('#final-score').textContent = score;
        const hs = this.element.querySelector('#high-score-value');
        const badge = this.element.querySelector('#new-high');
        const prevWrap = this.element.querySelector('#prev-high-wrap');
        hs.textContent = highScore;
        badge.style.display = isNewHigh ? 'inline-flex' : 'none';
        prevWrap.style.display = isNewHigh ? 'block' : 'none';
        if (isNewHigh) this.element.querySelector('#prev-high').textContent = prevHighScore;
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-content">
                <h1 class="title">Game Over</h1>
                <div class="score-display">Score: <span id="final-score">0</span></div>
                <div class="high-score">
                    High Score: <span id="high-score-value">0</span>
                    <span id="new-high" class="new-high-badge" style="display:none;">New High!</span>
                </div>
                <div id="prev-high-wrap" class="prev-high" style="display:none;">
                    Previous: <span id="prev-high">0</span>
                </div>
                <button class="btn" id="menu-btn">Main Menu</button>
            </div>
        `;

        this.element.querySelector('#menu-btn').addEventListener('click', () => {
            this.onReturnToMenu();
        });
    }
}