import { Screen } from './Screen.js';
import { snakeButtonSVG } from './SnakeButtonSVG.js';

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
                        ${snakeButtonSVG('snakeGradient_resume')}
                        <span>Return to Game</span>
                    </button>
                    <button class="btn btn-secondary" id="quit-btn">
                        ${snakeButtonSVG('snakeGradient_quit')}
                        <span>Quit</span>
                    </button>
                </div>
            </div>
        `;

        this.element.querySelector('#resume-btn').addEventListener('click', this.onResume);
        this.element.querySelector('#quit-btn').addEventListener('click', this.onQuit);
    }
}