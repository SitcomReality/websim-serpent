import { Screen } from './Screen.js';
import { snakeButtonSVG } from './SnakeButtonSVG.js';

export class HighScoresScreen extends Screen {
    constructor(onBack) {
        super('high-scores');
        this.onBack = onBack;
        this.highScores = [];
        this.render();
    }

    updateHighScores(scores) {
        this.highScores = scores;
        this.renderScores();
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-overlay"></div>
            <div class="screen-content">
                <h1 class="title">Global High Scores</h1>
                <div id="high-scores-list" class="high-scores-list">
                    <p>Loading scores...</p>
                </div>
                <button class="btn" id="back-to-menu-btn">
                    ${snakeButtonSVG('snakeGradient_back')}
                    <span>Back</span>
                </button>
            </div>
        `;

        this.element.querySelector('#back-to-menu-btn').addEventListener('click', this.onBack);
        this.scoreListElement = this.element.querySelector('#high-scores-list');
        this.renderScores();
    }

    renderScores() {
        if (!this.scoreListElement) return;

        if (this.highScores.length === 0) {
            this.scoreListElement.innerHTML = `<p>No scores yet. Be the first!</p>`;
            return;
        }

        const listHtml = this.highScores.map((entry, index) => `
            <div class="high-score-entry">
                <span class="rank">${index + 1}.</span>
                <span class="username">${entry.username}</span>
                <span class="score">${entry.score}</span>
            </div>
        `).join('');

        this.scoreListElement.innerHTML = listHtml;
    }
}

