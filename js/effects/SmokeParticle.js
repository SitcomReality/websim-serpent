import { Vector2D } from '../utils/Vector2D.js';

export class SmokeParticle {
    constructor(x, y, velocity, color, size = 1) {
        this.pos = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        // Shorter life and slightly randomized to reduce long-lived buildup
        this.life = 0.6 + Math.random() * 0.6; 
        this.maxLife = this.life;
        // Lower per-particle decay variation for stable counts
        this.decay = 0.6 / this.life;
        // reduce extra work flags
        this.alphaMult = 0.6;
    }

    update(dt) {
        // cheaper physics: integrate position with small friction
        this.pos.add(this.velocity);
        this.velocity.mult(0.94);
        this.life -= dt * 0.0015; // faster decay to reduce accumulation
        // modest growth
        this.size *= 1.01;
        return this.life > 0;
    }

    render(ctx) {
        const alpha = Math.max(0, (this.life / this.maxLife) * this.alphaMult);

        // Simplified rendering: single arc with small shadow instead of expensive radial gradients
        ctx.save();
        // modest, cheaper shadow (low blur)
        ctx.shadowBlur = Math.min(10, 6 * (this.size));
        ctx.shadowColor = this.color;
        ctx.globalAlpha = alpha;

        // Use simple fill circle which is much cheaper than gradients
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}