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
                <button class="btn" id="start-btn">
                    <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <!-- Snake body and tail as one continuous path -->
                        <path class="snake-body" d="M 20,30 Q 30,10 50,10 L 150,10 Q 170,10 170,30 Q 170,50 150,50 L 50,50 Q 30,50 20,30 Z" />
                        <!-- Forked tongue -->
                        <path class="snake-tongue" d="M 15,28 L 5,20 M 15,32 L 5,40" stroke="#ff7675" stroke-width="2" stroke-linecap="round" fill="none" />
                    </svg>
                    <span>Start Game</span>
                </button>
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