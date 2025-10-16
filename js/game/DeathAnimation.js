import { Vector2D } from '../utils/Vector2D.js';

export class DeathAnimation {
    constructor(snake) {
        this.snake = snake;
        this.started = false;
        this.deathTimer = 0;
    }

    die() {
        if (this.started) return;
        this.started = true;
        this.snake.chain.stiffness = 0.05;
        this.snake.chain.nodes[0].locked = false;
        const explosionStrength = 15;
        this.snake.chain.nodes.forEach(node => {
            const randomDir = new Vector2D(Math.random() - 0.5, Math.random() - 0.5).normalize();
            const velocity = randomDir.mult(explosionStrength * (0.5 + Math.random()));
            node.oldPos = Vector2D.sub(node.pos, velocity);
        });
    }

    updateDeathAnimation(dt, width, height) {
        this.deathTimer += dt / 1000;
        const gravity = new Vector2D(0, 0.05);
        this.snake.chain.nodes.forEach(node => {
            // Apply gravity/forces
            node.applyForce(gravity);
            
            // Perform Verlet integration (velocity update + damping)
            node.update(dt);
            
            // Constrain
            node.constrain(width, height);
        });
        // Constraints are now broken by omitting this.snake.chain.update(3);
    }

    renderDeathAnimation(ctx) {
        const nodes = this.snake.chain.nodes;
        const fade = Math.max(0, 1 - this.deathTimer / 1.5);
        if (fade <= 0) return;
        ctx.globalAlpha = fade;
        ctx.shadowBlur = 0;
        ctx.lineCap = 'round';
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const p = node.pos;
            const indexRatio = i / (nodes.length - 1);
            let radius, hue;
            if (i === 0) {
                radius = 10;
                hue = 180;
                ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                ctx.shadowBlur = 10 * fade;
                ctx.shadowColor = `rgba(78, 205, 200, ${fade * 0.8})`;
            } else {
                const baseWidth = 16 - indexRatio * 8;
                radius = baseWidth * 0.5;
                hue = indexRatio * 60 + 180;
                ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
                ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}