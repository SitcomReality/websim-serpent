import { SmokeParticle } from './SmokeParticle.js';
import { Vector2D } from '../utils/Vector2D.js';

export class SmokeSystem {
    constructor() {
        this.particles = [];
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

    emitSplash(x, y, count = 20) {
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
    }

    update(dt) {
        this.particles = this.particles.filter(particle => particle.update(dt));
    }

    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }

    clear() {
        this.particles = [];
    }
}

