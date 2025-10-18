import { Game } from './game/Game.js';
import { MainMenuScreen } from './ui/MainMenuScreen.js';
import { GameScreen } from './ui/GameScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';
import { PauseMenuScreen } from './ui/PauseMenuScreen.js';
import { Profiler } from './debug/Profiler.js';

class App {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.uiContainer = document.getElementById('ui-container');
        
        // create profiler and expose for quick access
        this.profiler = new Profiler(240);
        window.Profiler = this.profiler;
        
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

    startGameLoop() {
        const loop = (currentTime) => {
            const dt = currentTime - (this.lastTime || currentTime);
            this.lastTime = currentTime;

            // profiler frame start
            this.profiler.startFrame();

            if (this.game && this.game.running) {
                this.game.update(dt);
                this.game.render();
                this.gameScreen.updateScore(this.game.getScore());
            }

            // profiler frame end
            this.profiler.endFrame();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

new App();