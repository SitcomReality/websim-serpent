import { Screen } from './Screen.js';

export class GameScreen extends Screen {
    constructor(onMenuClick) {
        super('game');
        this.onMenuClick = onMenuClick;
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="game-hud">
                <div class="score-container">
                    <span>Score</span>
                    <span id="score">0</span>
                </div>
                <button class="btn btn-icon" id="pause-btn">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
            </div>
        `;

        this.element.querySelector('#pause-btn').addEventListener('click', this.onMenuClick);
    }

    updateScore(score) {
        const scoreElement = this.element.querySelector('#score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
}