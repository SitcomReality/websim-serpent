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
                    <!-- snake SVG removed so only the hamburger icon is shown -->
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