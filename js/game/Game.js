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
        this.smokeSystem = new SmokeSystem();
        this.running = true;
        this.lastTime = performance.now();
        this.smokeTimer = 0;
        this.elapsedMs = 0;
        this.foods = [];
        this.ensureFoodCount(1);
        
        this.setupInput();
    }

    setupInput() {
        this.keys = {};
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            // remove absolute direction controls
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update(dt) {
        if (!this.running) return;

        this.elapsedMs += dt;
        const target = this.elapsedMs >= 10000 ? 3 : (this.elapsedMs >= 5000 ? 2 : 1);

        // set turning based on keys
        const left = this.keys['arrowleft'] || this.keys['a'];
        const right = this.keys['arrowright'] || this.keys['d'];
        this.snake.setTurning(!!left, !!right);
        this.snake.setScore(this.score);

        this.snake.update(dt, this.width, this.height);
        this.foods.forEach(f => f.update(dt));
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
    }

    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.smokeSystem.render(this.ctx);
        this.foods.forEach(f => f.render(this.ctx));
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

    ensureFoodCount(target) {
        while (this.foods.length < target) this.foods.push(Food.spawn(this.width, this.height));
    }
}