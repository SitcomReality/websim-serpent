import { Screen } from './Screen.js';
import { snakeButtonSVG } from './SnakeButtonSVG.js';
import { SFX } from '../audio/SFX.js';

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
                    <button class="btn" id="mute-sfx-btn">
                        ${snakeButtonSVG('snakeGradient_mute_sfx')}
                        <span>Mute SFX</span>
                    </button>
                    <button class="btn" id="mute-music-btn">
                        ${snakeButtonSVG('snakeGradient_mute_music')}
                        <span>Mute Music</span>
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
        const sfxBtn = this.element.querySelector('#mute-sfx-btn');
        sfxBtn.addEventListener('click', () => {
            SFX.toggleMute();
            sfxBtn.querySelector('span').textContent = SFX.isMuted() ? 'Unmute SFX' : 'Mute SFX';
        });
        this.element.querySelector('#mute-music-btn').addEventListener('click', () => {});
    }
}