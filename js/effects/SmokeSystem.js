import { SmokeParticle } from './SmokeParticle.js';
import { Vector2D } from '../utils/Vector2D.js';
import { SparkParticle } from './SparkParticle.js';

export class SmokeSystem {
    constructor() {
        this.particles = [];
        this.sparks = [];
        this.maxParticles = 120; // cap total smoke particles
        this.maxSparks = 80;     // cap sparks
    }

    emitWisp(x, y, velocity) {
        // emit sparsely for movement trails to save CPU
        if (this.particles.length > this.maxParticles) return;
        if (Math.random() > 0.6) return; // throttle occasional wisps
        const spread = 0.45;
        const vel = new Vector2D(
            velocity.x * 0.25 + (Math.random() - 0.5) * spread,
            velocity.y * 0.25 + (Math.random() - 0.5) * spread
        );
        const color = `rgba(200,200,255,0.28)`;
        this.particles.push(new SmokeParticle(x, y, vel, color, 0.45));
    }

    emitSplash(x, y, count = 12) {
        // fewer splash particles by default to avoid spikes
        const colors = [
            'rgba(255, 107, 107, 0.8)',
            'rgba(78, 205, 196, 0.8)',
            'rgba(69, 183, 209, 0.8)',
            'rgba(247, 215, 148, 0.8)',
            'rgba(255, 159, 243, 0.8)'
        ];
        const reduced = Math.max(6, Math.floor(count * 0.6));
        for (let i = 0; i < reduced; i++) {
            if (this.particles.length > this.maxParticles) break;
            const angle = (i / reduced) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const speed = 1.5 + Math.random() * 2;
            const vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new SmokeParticle(x, y, vel, color, 0.9 + Math.random() * 0.6));
        }
        this.emitSparks(x, y, Math.max(6, Math.floor(12 * 0.6)));
    }

    emitPoof(x, y, count = 14) {
        const colors = ['rgba(200,200,200,0.72)'];
        const reduced = Math.max(6, Math.floor(count * 0.5));
        for (let i = 0; i < reduced; i++) {
            if (this.particles.length > this.maxParticles) break;
            const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 1.6;
            const vel = new Vector2D(Math.cos(a) * s, Math.sin(a) * s);
            this.particles.push(new SmokeParticle(x, y, vel, colors[0], 0.7 + Math.random() * 0.4));
        }
    }

    emitSparks(x, y, count = 8) {
        const colors = [
            '#ff6b6b', '#ffd166', '#6bf2ff', '#9b8cff', '#4ecdc4', '#ff99c8'
        ];
        const reduced = Math.max(4, Math.floor(count * 0.6));
        for (let i = 0; i < reduced; i++) {
            if (this.sparks.length > this.maxSparks) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.2 + Math.random() * 2.6;
            const vel = new Vector2D(Math.cos(angle) * speed, Math.sin(angle) * speed);
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.sparks.push(new SparkParticle(x, y, vel, color, 0.18 + Math.random() * 0.18));
        }
    }

    update(dt) {
        // lightweight filtering and update
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update(dt)) this.particles.splice(i, 1);
        }
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            if (!this.sparks[i].update(dt)) this.sparks.splice(i, 1);
        }
    }

    render(ctx) {
        // render particles first, then sparks
        for (let i = 0; i < this.particles.length; i++) this.particles[i].render(ctx);
        for (let i = 0; i < this.sparks.length; i++) this.sparks[i].render(ctx);
    }

    clear() {
        this.particles = [];
        this.sparks = [];
    }
}