import { SmokeParticle } from './SmokeParticle.js';
import { Vector2D } from '../utils/Vector2D.js';
import { SparkParticle } from './SparkParticle.js';

export class SmokeSystem {
    constructor() {
        this.particles = [];
        this.sparks = [];
        // caps to prevent runaway cost
        this.maxParticles = 80; // reduced from 120
        this.maxSparks = 60;    // reduced from 80
        // accumulator to help throttle wisps if too many present
        this.wispThrottle = 0;
    }

    emitWisp(x, y, velocity) {
        // Reduce wisps for slow movement; scale emission based on velocity magnitude
        const speed = velocity.mag();
        // require noticeably more movement to emit
        if (speed < 0.6) return; // raised threshold from 0.4 -> 0.6

        // throttle based on recent emissions to avoid bursts
        // make throttle accumulate more slowly and require larger threshold
        this.wispThrottle += speed * 0.15; // lowered increment to make bursts rarer
        if (this.wispThrottle < 2) return; // require more accumulated motion
        this.wispThrottle = 0;

        // Random chance to skip emission to further reduce particle churn
        if (Math.random() < 0.5) return;

        // much tighter spread and smaller velocity to create lighter wisps
        const spread = 0.15;
        const vel = new Vector2D(
            velocity.x * 0.15 + (Math.random() - 0.5) * spread,
            velocity.y * 0.15 + (Math.random() - 0.5) * spread
        );

        // use a subtle, slightly desaturated color and smaller size for wisps
        const color = 'rgba(200, 200, 255, 0.18)';
        // produce smaller wisps
        this.particles.push(new SmokeParticle(x, y, vel, color, 0.45, 'wisp'));

        // trim to cap
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    emitSplash(x, y, count = 8) {
        // Keep splashes/puffs but reduce default count to save work
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
            // puff size and type preserved for visual quality
            this.particles.push(new SmokeParticle(x, y, vel, color, 1 + Math.random(), 'puff'));
        }

        this.emitSparks(x, y, Math.max(6, Math.floor(count * 1.0)));

        // trim to cap
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    emitPoof(x, y, count = 10) {
        const colors = ['rgba(200,200,200,0.7)'];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2, s = 1.2 + Math.random() * 1.8;
            const vel = new Vector2D(Math.cos(a) * s, Math.sin(a) * s);
            this.particles.push(new SmokeParticle(x, y, vel, colors[0], 0.8 + Math.random() * 0.5, 'puff'));
        }

        // trim to cap
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
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
            // spark sizes adjusted to range from 0.18 to 0.36
            this.sparks.push(new SparkParticle(x, y, vel, color, 0.18 + Math.random() * 0.18));
        }

        // trim sparks
        if (this.sparks.length > this.maxSparks) {
            this.sparks.splice(0, this.sparks.length - this.maxSparks);
        }
    }

    update(dt) {
        // Update and keep only alive particles
        this.particles = this.particles.filter(particle => particle.update(dt));
        this.sparks = this.sparks.filter(spark => spark.update(dt));

        // Extra safety trimming in case of bursts
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
        if (this.sparks.length > this.maxSparks) {
            this.sparks.splice(0, this.sparks.length - this.maxSparks);
        }
    }

    render(ctx) {
        // Render cheaper wisps first (they are simple filled circles)
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