import { Screen } from './Screen.js';

export class MainMenuScreen extends Screen {
    constructor(onStartGame) {
        super('main-menu');
        this.onStartGame = onStartGame;
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-content">
                <h1 class="title">FluxSerpent</h1>
                <p class="subtitle">A Physics-Enhanced Snake Experience</p>
                <button class="btn" id="start-btn">Start Game</button>
            </div>
        `;

        this.element.querySelector('#start-btn').addEventListener('click', () => {
            this.onStartGame();
        });
    }
}

