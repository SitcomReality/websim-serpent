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
                <button class="btn" id="menu-btn">
                    <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path class="snake-body" d="M 190, 30 Q 175, 10, 150, 10 L 50, 10 Q 25, 10, 25, 30 Q 25, 50, 50, 50 L 150, 50 Q 175, 50, 190, 30 Z" />
                        <path class="snake-tongue" d="M 30, 27 L 10, 20 M 30, 33 L 10, 40" stroke="#ff7675" stroke-width="2" stroke-linecap="round" fill="none" />
                    </svg>
                    <span>Main Menu</span>
                </button>
            </div>
        `;

        this.element.querySelector('#menu-btn').addEventListener('click', () => {
            this.onReturnToMenu();
        });
    }
}