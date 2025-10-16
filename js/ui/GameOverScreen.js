import { Screen } from './Screen.js';

export class GameOverScreen extends Screen {
    constructor(onReturnToMenu) {
        super('game-over');
        this.onReturnToMenu = onReturnToMenu;
        this.score = 0;
        this.render();
    }

    setScore(score) {
        this.score = score;
        this.element.querySelector('#final-score').textContent = score;
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-content">
                <h1 class="title">Game Over</h1>
                <div class="score-display">Score: <span id="final-score">0</span></div>
                <button class="btn" id="menu-btn">Main Menu</button>
            </div>
        `;

        this.element.querySelector('#menu-btn').addEventListener('click', () => {
            this.onReturnToMenu();
        });
    }
}

