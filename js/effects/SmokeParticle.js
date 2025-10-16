import { Vector2D } from '../utils/Vector2D.js';

export class SmokeParticle {
    constructor(x, y, velocity, color, size = 1) {
        this.pos = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.decay = 0.01 + Math.random() * 0.02;
    }

    update(dt) {
        this.pos.add(this.velocity);
        this.velocity.mult(0.95);
        this.life -= this.decay;
        this.size *= 1.02;
        return this.life > 0;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha * 0.6;
        
        const gradient = ctx.createRadialGradient(
            this.pos.x, this.pos.y, 0,
            this.pos.x, this.pos.y, this.size * 15
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size * 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
}

