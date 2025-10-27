import { Screen } from './Screen.js';
import { snakeButtonSVG } from './SnakeButtonSVG.js';

export class MainMenuScreen extends Screen {
    constructor(onStartGame, onShowHighScores) {
        super('main-menu');
        this.onStartGame = onStartGame;
        this.onShowHighScores = onShowHighScores;
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-content">
                <img src="/serpent-title.jpg" alt="Serpent" class="splash-title" width="1012" height="300" />
                <p class="subtitle">A Physics-Enhanced Snake Experience</p>
                <button class="btn" id="start-btn">
                    ${snakeButtonSVG('snakeGradient_main')}
                    <span>Start Game</span>
                </button>
                <button class="btn btn-secondary" id="high-scores-btn">
                    ${snakeButtonSVG('snakeGradient_scores')}
                    <span>High Scores</span>
                </button>
                <div class="splash-footer">
                    <img src="/sitcomreality.png" alt="sitcomreality" class="sr-logo" width="250" height="70" />
                </div>
            </div>
        `;

        this.element.querySelector('#start-btn').addEventListener('click', () => {
            this.onStartGame();
        });
        this.element.querySelector('#high-scores-btn').addEventListener('click', () => {
            this.onShowHighScores();
        });
    }
}