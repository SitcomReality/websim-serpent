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
                    <button class="btn" id="resume-btn">Return to Game</button>
                    <button class="btn btn-secondary" id="quit-btn">Quit</button>
                </div>
            </div>
        `;

        this.element.querySelector('#resume-btn').addEventListener('click', this.onResume);
        this.element.querySelector('#quit-btn').addEventListener('click', this.onQuit);
    }
}

