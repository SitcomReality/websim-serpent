import { Vector2D } from '../utils/Vector2D.js';

export class SmokeParticle {
    constructor(x, y, velocity, color, size = 1) {
        this.pos = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        // shorter lives for fewer on-screen particles and faster fade
        this.maxLife = 0.7 + Math.random() * 0.6; // 0.7 - 1.3s
        this.life = this.maxLife;
        // faster decay to reduce overlap
        this.decay = 0.9 + Math.random() * 1.4; // multiplier per second
    }

    update(dt) {
        // dt is ms; convert to seconds
        const dtSec = dt / 1000;
        this.pos.add(this.velocity.copy().mult(dtSec));
        // simple damping
        this.velocity.mult(0.97);
        this.life -= this.decay * dtSec;
        this.size *= 1 + 0.02 * dtSec;
        return this.life > 0;
    }

    render(ctx) {
        // Cheap circle-based render (no gradients/shadow) for performance
        const alpha = Math.max(0, Math.min(1, this.life / this.maxLife));
        ctx.globalAlpha = alpha * 0.55;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, Math.max(1, this.size * 8), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}