import { Screen } from './Screen.js';

export class GameScreen extends Screen {
    constructor() {
        super('game');
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="game-hud">
                <div>Score: <span id="score">0</span></div>
            </div>
        `;
    }

    updateScore(score) {
        const scoreElement = this.element.querySelector('#score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
}