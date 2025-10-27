import { Vector2D } from '../utils/Vector2D.js';

export class SmokeParticle {
    constructor(x, y, velocity, color, size = 1, type = 'puff') {
        this.pos = new Vector2D(x, y);
        this.velocity = velocity;
        this.color = color;
        this.size = size;
        this.type = type; // 'puff' (full radial gradient) or 'wisp' (cheap)
        this.life = type === 'wisp' ? (0.6 + Math.random() * 0.6) : 1.0;
        this.maxLife = this.life;
        this.decay = type === 'wisp' ? 0.008 + Math.random() * 0.01 : 0.01 + Math.random() * 0.02;
    }

    update(dt) {
        // Move and damp velocity
        this.pos.add(this.velocity);
        this.velocity.mult(this.type === 'wisp' ? 0.92 : 0.95);
        this.life -= this.decay;
        if (this.type === 'puff') {
            this.size *= 1.02;
        } else {
            // wisps spread slower and shrink subtly
            this.size *= 0.995;
        }
        return this.life > 0;
    }

    render(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);

        if (this.type === 'wisp') {
            // Cheap render for trail wisps: single soft circle, no radial gradient
            ctx.globalAlpha = alpha * 0.45;
            ctx.fillStyle = this.color;
            const r = Math.max(1, this.size * 6);
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            return;
        }

        // Full-quality puff rendering (radial gradient) for splashes/poofs
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

