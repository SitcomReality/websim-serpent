import { Game } from './game/Game.js';
import { MainMenuScreen } from './ui/MainMenuScreen.js';
import { GameScreen } from './ui/GameScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { PauseMenuScreen } from './ui/PauseMenuScreen.js';

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
        this.mainMenuScreen = new MainMenuScreen(() => this.startGame());
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
            this.gameScreen.show();
        } else {
            this.game.pause();
            this.pauseMenuScreen.show();
        }
    }

    handleGameOver(result) {
        this.gameOverScreen.setScore(result.score, result.highScore, result.isNewHigh, result.prevHighScore);
        this.showScreen(this.gameOverScreen);
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