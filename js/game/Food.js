import { Vector2D } from '../utils/Vector2D.js';

export class Food {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.radius = 16;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.ageMs = 0; this.lifeMs = 15000;
        this.hueOffset = Math.floor(Math.random() * 360); // randomize initial hue
    }

    update(dt) {
        this.pulsePhase += dt * 0.003;
        this.ageMs += dt;
    }

    render(ctx) {
        const t = Math.min(1, this.ageMs / this.lifeMs);
        const pulse = Math.sin(this.pulsePhase) * 0.15 + 1;
        const shrink = t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1;
        const radius = this.radius * pulse * Math.max(0, shrink);
        // Hue cycles over time while saturation fades with age (preserve previous saturation/lightness behavior)
        const hue = Math.floor((this.hueOffset + this.ageMs * 0.02) % 360); // start at randomized hue and sweep
        const s = 90 * (1 - t), l = 60 - 10 * t;
        ctx.shadowBlur = 15; ctx.shadowColor = `hsl(${hue}, ${s}%, ${l}%)`;
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`;
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    static spawn(width, height, margin = 50) {
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        return new Food(x, y);
    }
    
    isExpired() { return this.ageMs >= this.lifeMs; }
}