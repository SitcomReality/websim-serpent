import { Vector2D } from '../utils/Vector2D.js';

export class Food {
    constructor(x, y) {
        this.pos = new Vector2D(x, y);
        this.radius = 16;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.pulsePhase += dt * 0.003;
    }

    render(ctx) {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 1;
        const radius = this.radius * pulse;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6b6b';
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    static spawn(width, height, margin = 50) {
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        return new Food(x, y);
    }
}