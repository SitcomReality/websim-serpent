import { SmokeParticle } from './SmokeParticle.js';
import { Vector2D } from '../utils/Vector2D.js';
import { SparkParticle } from './SparkParticle.js';

export class SmokeSystem {
    constructor() {
        this.particles = [];
        this.sparks = [];
    }

    emitWisp(x, y, velocity) {
        const spread = 0.5;
        const vel = new Vector2D(
            velocity.x * 0.25 + (Math.random() - 0.5) * spread,
            velocity.y * 0.25 + (Math.random() - 0.5) * spread
        );
        
        const color = `rgba(200, 200, 255, 0.28)`;
        // Emit far fewer wisps (previously could add many over time); keep them lighter and smaller
        if (Math.random() < 0.45) { // ~55% chance to skip emission - reduces particle count during fast movement
            this.particles.push(new SmokeParticle(x, y, vel, color, 0.45));
        }
    }

    emitSplash(x, y, count = 12) {
        const colors = [
            'rgba(255, 107, 107, 0.8)',
            'rgba(78, 205, 196, 0.8)',
            'rgba(69, 183, 209, 0.8)',
            'rgba(247, 215, 148, 0.8)',
            'rgba(255, 159, 243, 0.8)'
        ];
        
        // Reduce splash particle count to preserve the impression but cut CPU
        const actualCount = Math.max(6, Math.floor(count * 0.6));
        for (let i = 0; i < actualCount; i++) {
            const angle = (i / actualCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = 1.6 + Math.random() * 2.2; // slightly reduced speeds
            const vel = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            // smaller, fewer particles for splash
            this.particles.push(new SmokeParticle(x, y, vel, color, 0.9 + Math.random() * 0.6));
        }

        // Emit fewer sparks (they're heavier to render)
        this.emitSparks(x, y, Math.max(6, Math.floor(count * 0.5)));
    }

    emitPoof(x, y, count = 14) {
        const colors = ['rgba(200,200,200,0.68)'];
        const actual = Math.max(6, Math.floor(count * 0.5));
        for (let i = 0; i < actual; i++) {
            const a = Math.random() * Math.PI * 2, s = 1.0 + Math.random() * 1.6;
            const vel = new Vector2D(Math.cos(a) * s, Math.sin(a) * s);
            this.particles.push(new SmokeParticle(x, y, vel, colors[0], 0.7 + Math.random() * 0.45));
        }
    }

    emitSparks(x, y, count = 8) {
        const colors = [
            '#ff6b6b', '#ffd166', '#6bf2ff', '#9b8cff', '#4ecdc4', '#ff99c8'
        ];
        const actual = Math.max(4, Math.floor(count * 0.6)); // fewer sparks
        for (let i = 0; i < actual; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3; // slightly reduced speeds
            const vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
            const color = colors[Math.floor(Math.random() * colors.length)];
            // spark sizes adjusted slightly smaller
            this.sparks.push(new SparkParticle(x, y, vel, color, 0.18 + Math.random() * 0.18));
        }
    }

    update(dt) {
        // Update particles; keep filters compact and avoid extra allocations
        this.particles = this.particles.filter(particle => particle.update(dt));
        this.sparks = this.sparks.filter(spark => spark.update(dt));
    }

    render(ctx) {
        // Render particles first (cheaper) then sparks
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].render(ctx);
        }
        for (let i = 0; i < this.sparks.length; i++) {
            this.sparks[i].render(ctx);
        }
    }

    clear() {
        this.particles = [];
        this.sparks = [];
    }
}