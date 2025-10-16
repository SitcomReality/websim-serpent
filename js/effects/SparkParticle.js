import { Vector2D } from '../utils/Vector2D.js';

export class SparkParticle {
    constructor(x, y, velocity, color = '#fff', size = 0.25) {
        this.pos = new Vector2D(x, y);
        this.velocity = velocity.copy().mult(1.25);
        this.color = color;
        this.size = size;
        this.life = (0.5 + Math.random() * 0.6) * 0.75; // shorter life (~25% less)
        this.maxLife = this.life;
        this.gravity = 0; // no gravity
        this.friction = 0.96;
    }

    update(dt) {
        // fast movement with simple physics
        // gravity removed
        this.pos.add(this.velocity);
        this.velocity.mult(this.friction);
        this.life -= dt * 0.002; // increased decay to shorten lifetime (~1.333x)
        return this.life > 0;
    }

    render(ctx) {
        const t = 1 - (this.life / this.maxLife);
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;

        // small sharp particle (rect or thin line)
        ctx.beginPath();
        const length = this.size * (6 + t * 6);
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(angle);
        ctx.fillRect(-length * 0.5, -this.size * 1.2, length, this.size * 2.4);
        ctx.restore();

        // small glow
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}