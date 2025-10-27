import { Screen } from './Screen.js';
import { snakeButtonSVG } from './SnakeButtonSVG.js';

export class GameOverScreen extends Screen {
    constructor(onReturnToMenu) {
        super('game-over');
        this.onReturnToMenu = onReturnToMenu;
        this.score = 0;
        this.highScores = [];
        this.render();
    }

    setScore(score, highScore, isNewHigh = false, prevHighScore = 0) {
        this.score = score;
        this.element.querySelector('#final-score').textContent = score;
        const hs = this.element.querySelector('#high-score-value');
        const badge = this.element.querySelector('#new-high');
        const prevWrap = this.element.querySelector('#prev-high-wrap');
        hs.textContent = highScore;
        badge.style.display = isNewHigh ? 'inline-flex' : 'none';
        prevWrap.style.display = isNewHigh ? 'block' : 'none';
        if (isNewHigh) this.element.querySelector('#prev-high').textContent = prevHighScore;
    }

    updateHighScores(scores) {
        this.highScores = scores.slice(0, 10); // only top 10
        this.renderHighScores();
    }

    render() {
        this.element.innerHTML = `
            <div class="screen-content game-over-content-outer">
                <h1 class="title" style="text-align:center; margin-bottom:1.5rem;">Game Over</h1>
                <div class="game-over-content">
                    <div class="game-over-left">
                        <div class="score-display">Score: <span id="final-score">0</span></div>
                        <div class="high-score">
                            Personal Best: <span id="high-score-value">0</span>
                            <span id="new-high" class="new-high-badge" style="display:none;">New!</span>
                        </div>
                        <div id="prev-high-wrap" class="prev-high" style="display:none;">
                            Previous: <span id="prev-high">0</span>
                        </div>
                        <button class="btn" id="menu-btn">
                            ${snakeButtonSVG('snakeGradient_gameover')}
                            <span>Main Menu</span>
                        </button>
                    </div>
                    <div class="game-over-right">
                        <h2 class="subtitle">Top 10 Global</h2>
                        <div id="game-over-scores-list" class="high-scores-list">
                            Loading...
                        </div>
                    </div>
                </div>
                <div class="splash-footer" style="margin-top:2rem; justify-content:center;">
                    <img src="/sitcomreality.png" alt="sitcomreality" class="sr-logo" width="250" height="70" />
                </div>
            </div>
        `;
        
        this.scoreListElement = this.element.querySelector('#game-over-scores-list');
        this.element.querySelector('#menu-btn').addEventListener('click', () => {
            this.onReturnToMenu();
        });

        this.renderHighScores();
    }

    renderHighScores() {
        if (!this.scoreListElement) return;
        if (this.highScores.length === 0) {
            this.scoreListElement.innerHTML = `<p>No scores yet.</p>`;
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