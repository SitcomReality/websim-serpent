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
                <img src="/serpent-title.jpg" alt="Serpent" class="splash-title" width="1012" height="300" />
                <p class="subtitle">A Physics-Enhanced Snake Experience</p>
                <button class="btn" id="start-btn">Start Game</button>
                <div class="splash-footer">
                    <img src="/sitcomreality.png" alt="sitcomreality" class="sr-logo" width="250" height="70" />
                </div>
            </div>
        `;

        this.element.querySelector('#start-btn').addEventListener('click', () => {
            this.onStartGame();
        });
    }
}