import { Screen } from './Screen.js';

export class PauseMenuScreen extends Screen {
    constructor(onResume, onQuit) {
        super('pause-menu');
        this.onResume = onResume;
        this.onQuit = onQuit;
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-overlay"></div>
            <div class="screen-content">
                <h1 class="title">Paused</h1>
                <div class="pause-menu-buttons">
                    <button class="btn" id="resume-btn">
                        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path class="snake-body" d="M 20,30 Q 30,10 50,10 L 150,10 Q 170,10 170,30 Q 170,50 150,50 L 50,50 Q 30,50 20,30 Z" />
                            <path class="snake-tongue" d="M 15,28 L 5,20 M 15,32 L 5,40" stroke="#ff7675" stroke-width="2" stroke-linecap="round" fill="none" />
                        </svg>
                        <span>Return to Game</span>
                    </button>
                    <button class="btn btn-secondary" id="quit-btn">
                        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="snakeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#8e44ad;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path class="snake-body" d="M 20,30 Q 30,10 50,10 L 150,10 Q 170,10 170,30 Q 170,50 150,50 L 50,50 Q 30,50 20,30 Z" />
                            <path class="snake-tongue" d="M 15,28 L 5,20 M 15,32 L 5,40" stroke="#ff7675" stroke-width="2" stroke-linecap="round" fill="none" />
                        </svg>
                        <span>Quit</span>
                    </button>
                </div>
            </div>
        `;

        this.element.querySelector('#resume-btn').addEventListener('click', this.onResume);
        this.element.querySelector('#quit-btn').addEventListener('click', this.onQuit);
    }
}

