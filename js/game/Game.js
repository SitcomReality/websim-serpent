import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { SmokeSystem } from '../effects/SmokeSystem.js';
import { Vector2D } from '../utils/Vector2D.js';

export class Game {
    constructor(canvas, onGameOver) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onGameOver = onGameOver;
        this.running = false;
        this.score = 0;
        
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
        this.food = Food.spawn(this.width, this.height);
        this.smokeSystem = new SmokeSystem();
        this.running = true;
        this.lastTime = performance.now();
        this.smokeTimer = 0;
        
        this.setupInput();
    }

    setupInput() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'ArrowUp' || e.key === 'w') this.snake.setDirection(new Vector2D(0, -1));
            if (e.key === 'ArrowDown' || e.key === 's') this.snake.setDirection(new Vector2D(0, 1));
            if (e.key === 'ArrowLeft' || e.key === 'a') this.snake.setDirection(new Vector2D(-1, 0));
            if (e.key === 'ArrowRight' || e.key === 'd') this.snake.setDirection(new Vector2D(1, 0));
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update(dt) {
        if (!this.running) return;

        this.snake.update(dt, this.width, this.height);
        this.food.update(dt);
        this.smokeSystem.update(dt);

        // Emit trail smoke periodically
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

        // Check food collision
        const head = this.snake.getHead();
        if (head.pos.dist(this.food.pos) < head.radius + this.food.radius) {
            this.score++;
            this.snake.grow();
            this.smokeSystem.emitSplash(this.food.pos.x, this.food.pos.y);
            this.food = Food.spawn(this.width, this.height);
        }

        // Check self collision
        if (this.snake.checkSelfCollision()) {
            this.gameOver();
        }
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.smokeSystem.render(this.ctx);
        this.food.render(this.ctx);
        this.snake.render(this.ctx);
    }

    gameOver() {
        this.running = false;
        this.onGameOver(this.score);
    }

    getScore() {
        return this.score;
    }

    destroy() {
        this.running = false;
    }
}

