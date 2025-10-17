import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { SmokeSystem } from '../effects/SmokeSystem.js';
import { Vector2D } from '../utils/Vector2D.js';
import { Storage } from '../utils/Storage.js';

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
        this.gameOverState = false;
        this.paused = false;
        
        this.setupInput();
    }

    setupInput() {
        this.keys = {};
        
        this.handleKeyDown = (e) => {
            this.keys[e.key.toLowerCase()] = true;

            if (e.key === 'Escape') {
                this.onPause();
            }

            const plusPressed = e.key === '+' || e.code === 'NumpadAdd' || (e.key === '=' && e.shiftKey) || e.key === 'Add';
            if (!this.gameOverState && plusPressed) {
                this.score++;
                this.snake.grow();
                const head = this.snake.getHead();
                this.smokeSystem.emitSplash(head.pos.x, head.pos.y);
                this.smokeSystem.emitSparks(head.pos.x, head.pos.y, 20);
            }
        };

        this.handleKeyUp = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    update(dt) {
        if (!this.running) return;

        if (this.snake.isDead) {
            this.snake.update(dt, this.width, this.height);
        }
        
        this.smokeSystem.update(dt);
        
        if (this.paused) return;

        if (!this.snake.isDead) {
            this.snake.update(dt, this.width, this.height);
        }

        if (this.gameOverState) return;

        this.elapsedMs += dt;
        const target = this.elapsedMs >= 10000 ? 3 : (this.elapsedMs >= 5000 ? 2 : 1);

        const left = this.keys['arrowleft'] || this.keys['a'];
        const right = this.keys['arrowright'] || this.keys['d'];
        this.snake.setTurning(!!left, !!right);
        this.snake.setScore(this.score);

        this.foods.forEach(f => f.update(dt));
        
        this.smokeTimer += dt;
        if (this.smokeTimer > 50) {
            this.smokeTimer = 0;
            for (let i = 1; i < this.snake.chain.nodes.length; i += 2) {
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
                return false;
            }
            if (head.pos.dist(f.pos) < head.radius + f.radius) {
                this.score++;
                this.snake.grow();
                this.smokeSystem.emitSplash(f.pos.x, f.pos.y);
                this.smokeSystem.emitSparks(f.pos.x, f.pos.y, 20);
                return false;
            }
            return true;
        });
        this.ensureFoodCount(target);

        if (this.snake.checkSelfCollision()) {
            this.gameOver();
        }

        if (this.snake.checkWallCollision(this.width, this.height)) {
            this.gameOver();
        }
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.smokeSystem.render(this.ctx);
        this.foods.forEach(f => f.render(this.ctx));
        this.snake.render(this.ctx, this.smokeSystem.sparks);
    }

    gameOver() {
        if (this.gameOverState) return;
        this.gameOverState = true;
        this.snake.die();

        setTimeout(() => this.showGameOverScreen(), 2000);
    }

    showGameOverScreen() {
        this.running = false;
        const prevHigh = Storage.getHighScore();
        const isNew = this.score > prevHigh;
        if (isNew) Storage.setHighScore(this.score);
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
        while (this.foods.length < target) this.foods.push(Food.spawn(this.width, this.height));
    }
}