import { Game } from './game/Game.js';
import { MainMenuScreen } from './ui/MainMenuScreen.js';
import { GameScreen } from './ui/GameScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { PauseMenuScreen } from './ui/PauseMenuScreen.js';
import { HighScoresScreen } from './ui/HighScoresScreen.js';
import { room } from './utils/Database.js'; // initialize connection
import { HighScores } from './utils/HighScores.js';

class App {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.uiContainer = document.getElementById('ui-container');
        
        this.game = null;
        this.currentScreen = null;
        
        this.initScreens();
        this.showMainMenu();
        this.startGameLoop();
    }

    initScreens() {
        this.mainMenuScreen = new MainMenuScreen(
            () => this.startGame(),
            () => this.showHighScores()
        );
        this.gameScreen = new GameScreen(() => this.togglePause());
        this.gameOverScreen = new GameOverScreen(() => this.showMainMenu());
        this.pauseMenuScreen = new PauseMenuScreen(
            () => this.togglePause(), // onResume
            () => this.showMainMenu()  // onQuit
        );

        this.mainMenuScreen.mount(this.uiContainer);
        this.gameScreen.mount(this.uiContainer);
        this.gameOverScreen.mount(this.uiContainer);
        this.pauseMenuScreen.mount(this.uiContainer);

        this.highScoresScreen = new HighScoresScreen(() => this.showMainMenu());
        this.highScoresScreen.mount(this.uiContainer);

        // Subscribe screens to high score updates
        HighScores.subscribe(scores => {
            this.gameOverScreen.updateHighScores(scores);
            this.highScoresScreen.updateHighScores(scores);
        });
    }

    showScreen(screen) {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = screen;
        this.currentScreen.show();
    }

    showMainMenu() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
        this.showScreen(this.mainMenuScreen);
    }

    startGame() {
        this.game = new Game(this.canvas, 
            (result) => this.handleGameOver(result),
            () => this.togglePause() // onPause callback
        );
        this.game.init();
        this.showScreen(this.gameScreen);
    }

    togglePause() {
        if (!this.game || this.game.gameOverState) return;
        
        if (this.game.isPaused()) {
            this.game.resume();
            this.pauseMenuScreen.hide();
            // this.gameScreen.show(); // showScreen will handle this
            this.showScreen(this.gameScreen);
        } else {
            this.game.pause();
            // make pause screen the active screen so it will be hidden when switching to main menu
            this.showScreen(this.pauseMenuScreen);
        }
    }

    handleGameOver(result) {
        this.gameOverScreen.setScore(result.score, result.highScore, result.isNewHigh, result.prevHighScore);
        this.showScreen(this.gameOverScreen);
    }

    showHighScores() {
        this.showScreen(this.highScoresScreen);
    }

    startGameLoop() {
        const loop = (currentTime) => {
            const dt = currentTime - (this.lastTime || currentTime);
            this.lastTime = currentTime;

            if (this.game && this.game.running) {
                this.game.update(dt);
                this.game.render();
                this.gameScreen.updateScore(this.game.getScore());
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

new App();