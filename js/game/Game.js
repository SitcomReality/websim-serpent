import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { SmokeSystem } from '../effects/SmokeSystem.js';
import { Vector2D } from '../utils/Vector2D.js';
import { Storage } from '../utils/Storage.js';
import { SFX } from '../audio/SFX.js';
import { Validation } from './Validation.js';
import { HighScores } from '../utils/HighScores.js';

export class Game {
    constructor(canvas, onGameOver, onPause) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onGameOver = onGameOver;
        this.onPause = onPause;
        this.running = false;
        this.score = 0;
        this.paused = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        this.score = 0;
        this.snake = new Snake(this.width / 2, this.height / 2);
        this.smokeSystem = new SmokeSystem();
        this.running = true;
        this.lastTime = performance.now();
        this.smokeTimer = 0;
        this.elapsedMs = 0;
        this.foods = [];
        this.ensureFoodCount(1);
        this.gameOverState = false; // Add game over state
        this.paused = false;
        this.validation = new Validation();
        
        this.setupInput();
    }

    setupInput() {
        this.keys = {};
        
        this.handleKeyDown = (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === 'Escape') {
                this.onPause();
            }

            // Debug: simulate eating with '+' (main keyboard or numpad)
            const plusPressed = e.key === '+' || e.code === 'NumpadAdd' || (e.key === '=' && e.shiftKey) || e.key === 'Add';
            if (!this.gameOverState && plusPressed) {
                this.score++;
                this.snake.grow();
                const head = this.snake.getHead();
                this.smokeSystem.emitSplash(head.pos.x, head.pos.y);
                this.smokeSystem.emitSparks(head.pos.x, head.pos.y, 10);
            }
            // remove absolute direction controls
        };

        this.handleKeyUp = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    update(dt) {
        if (!this.running) return;

        // Death animation can still play while paused/game over
        if (this.snake.isDead) {
            this.snake.update(dt, this.width, this.height);
        }
        
        this.smokeSystem.update(dt);
        
        if (this.paused) return;

        // If not dead, update snake
        if (!this.snake.isDead) {
            this.snake.update(dt, this.width, this.height);
        }

        // If in game over transition, skip game logic
        if (this.gameOverState) return;

        this.elapsedMs += dt;
        const target = this.elapsedMs >= 10000 ? 3 : (this.elapsedMs >= 5000 ? 2 : 1);

        // set turning based on keys
        const left = this.keys['arrowleft'] || this.keys['a'];
        const right = this.keys['arrowright'] || this.keys['d'];
        this.snake.setTurning(!!left, !!right);
        this.snake.setScore(this.score);

        this.foods.forEach(f => f.update(dt));
        
        // Emit trail smoke periodically
        this.smokeTimer += dt;
        if (this.smokeTimer > 80) {
            this.smokeTimer = 0;
            for (let i = 1; i < this.snake.chain.nodes.length; i += 3) {
                const node = this.snake.chain.nodes[i];
                const velocity = this.snake.chain.getVelocityAt(i);
                if (velocity.mag() > 0.5) {
                    this.smokeSystem.emitWisp(node.pos.x, node.pos.y, velocity);
                }
            }
        }

        const head = this.snake.getHead();
        this.foods = this.foods.filter(f => {
            if (f.isExpired()) { 
                this.smokeSystem.emitPoof(f.pos.x, f.pos.y); 
                SFX.play('bubbledown');
                this.validation.foodDespawned();
                return false;
            }
            if (head.pos.dist(f.pos) < head.radius + f.radius) {
                this.score++;
                this.snake.grow();
                SFX.play('omnom');
                this.smokeSystem.emitSplash(f.pos.x, f.pos.y);
                this.smokeSystem.emitSparks(f.pos.x, f.pos.y, 10);
                this.validation.foodEaten();
                return false;
            }
            return true;
        });
        this.ensureFoodCount(target);

        if (this.snake.checkSelfCollision()) {
            this.gameOver();
        }

        // new: touching screen edges causes immediate game over
        if (this.snake.checkWallCollision(this.width, this.height)) {
            this.gameOver();
        }
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.smokeSystem.render(this.ctx);
        this.foods.forEach(f => f.render(this.ctx));
        this.snake.render(this.ctx);
    }

    gameOver() {
        if (this.gameOverState) return; // Prevent multiple triggers
        this.gameOverState = true;
        this.snake.die();
        // Play death sound
        SFX.play('plorble');
 
        // Delay showing the game over screen to allow for animation
        setTimeout(() => this.showGameOverScreen(), 2000);
    }

    showGameOverScreen() {
        this.running = false;
        const prevHigh = Storage.getHighScore();
        const isNew = this.score > prevHigh;
        if (isNew) Storage.setHighScore(this.score);

        // Validate and submit score to global leaderboard
        if (this.validation.validateScore(this.score)) {
            HighScores.submitScore(this.score).catch(err => {
                console.error("Failed to submit high score:", err);
            });
        }

        this.onGameOver({ 
            score: this.score, 
            highScore: Storage.getHighScore(), 
            prevHighScore: prevHigh, 
            isNewHigh: isNew 
        });
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    isPaused() {
        return this.paused;
    }

    getScore() {
        return this.score;
    }

    destroy() {
        this.running = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    ensureFoodCount(target) {
        while (this.foods.length < target) {
            const f = Food.spawn(this.width, this.height);
            this.foods.push(f);
            this.validation.foodSpawned();
            SFX.play('bubbleup');
        }
    }
}