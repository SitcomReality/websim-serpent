import { Game } from './game/Game.js';
import { MainMenuScreen } from './ui/MainMenuScreen.js';
import { GameScreen } from './ui/GameScreen.js';
import { GameOverScreen } from './ui/GameOverScreen.js';

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
        this.gameScreen = new GameScreen();
        this.gameOverScreen = new GameOverScreen(() => this.showMainMenu());

        this.mainMenuScreen.mount(this.uiContainer);
        this.gameScreen.mount(this.uiContainer);
        this.gameOverScreen.mount(this.uiContainer);
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
        this.game = new Game(this.canvas, (score) => this.handleGameOver(score));
        this.game.init();
        this.showScreen(this.gameScreen);
    }

    handleGameOver(score) {
        this.gameOverScreen.setScore(score);
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

