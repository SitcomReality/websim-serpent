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
            velocity.x * 0.3 + (Math.random() - 0.5) * spread,
            velocity.y * 0.3 + (Math.random() - 0.5) * spread
        );
        
        const color = `rgba(200, 200, 255, 0.3)`;
        this.particles.push(new SmokeParticle(x, y, vel, color, 0.5));
    }

    emitSplash(x, y, count = 12) {
        const colors = [
            'rgba(255, 107, 107, 0.8)',
            'rgba(78, 205, 196, 0.8)',
            'rgba(69, 183, 209, 0.8)',
            'rgba(247, 215, 148, 0.8)',
            'rgba(255, 159, 243, 0.8)'
        ];
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            const vel = new Vector2D(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new SmokeParticle(x, y, vel, color, 1 + Math.random()));
        }

        this.emitSparks(x, y, 12);
    }

    emitPoof(x, y, count = 14) {
        const colors = ['rgba(200,200,200,0.7)'];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2;
            const vel = new Vector2D(Math.cos(a) * s, Math.sin(a) * s);
            this.particles.push(new SmokeParticle(x, y, vel, colors[0], 0.8 + Math.random() * 0.5));
        }
    }

    emitSparks(x, y, count = 8) {
        const colors = [
            '#ff6b6b', '#ffd166', '#6bf2ff', '#9b8cff', '#4ecdc4', '#ff99c8'
        ];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            const vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
            const color = colors[Math.floor(Math.random() * colors.length)];
            // spark sizes adjusted to range from 0.2 to 0.4
            this.sparks.push(new SparkParticle(x, y, vel, color, 0.2 + Math.random() * 0.2));
        }
    }

    update(dt) {
        this.particles = this.particles.filter(particle => particle.update(dt));
        this.sparks = this.sparks.filter(spark => spark.update(dt));
    }

    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
        this.sparks.forEach(spark => spark.render(ctx));
    }

    clear() {
        this.particles = [];
        this.sparks = [];
    }
}