import { Vector2D } from '../utils/Vector2D.js';

class HighlightParticle {
    constructor(isLeftEye, color, yShiftBias) {
        this.isLeftEye = isLeftEye;
        this.color = color;
        this.life = 0.5 + Math.random() * 0.5; // 0.5 to 1.0 seconds
        this.maxLife = this.life;

        // Position is in UV space of the eye circle. (0,0) is center, radius is 1.
        // Start near the front (bottom of sprite, so positive y)
        const startAngle = Math.PI * (0.25 + Math.random() * 0.5); // Bottom part of circle
        const startRadius = 0.5 + Math.random() * 0.2;
        this.pos = new Vector2D(Math.cos(startAngle) * startRadius, Math.sin(startAngle) * startRadius);
        this.pos.y += yShiftBias; // Shift forward

        // Move towards the back (top of sprite, so negative y)
        const endAngle = Math.PI * (1.25 + Math.random() * 0.5); // Top part of circle
        const endRadius = 0.3 + Math.random() * 0.4;
        this.endPos = new Vector2D(Math.cos(endAngle) * endRadius, Math.sin(endAngle) * endRadius);
        this.endPos.y += yShiftBias; // Shift forward
    }

    update(dt) {
        this.life -= dt / 1000;
        return this.life > 0;
    }

    getPosition() {
        const t = 1 - (this.life / this.maxLife);
        // Linear interpolation from start to end
        return Vector2D.add(this.pos, Vector2D.sub(this.endPos, this.pos).mult(t));
    }
}

export class EyeHighlights {
    constructor(snake) {
        this.snake = snake;
        this.particles = [];
        this.eyePositionsCalculated = false;
        // Eye data in original 125x50 sprite space
        this.eyeData = {
            left:  { center: new Vector2D(25, 25), radius: 25 },
            right: { center: new Vector2D(100, 25), radius: 25 }
        };
        // Bias to shift highlights towards the front (positive Y in sprite space). 
        // 0.3 is roughly centered forward of the eye midpoint.
        this.Y_SHIFT_BIAS = 0.3; 
    }

    triggerSparkleEffect() {
        const colors = ['#ff6b6b', '#ffd166', '#6bf2ff', '#9b8cff', '#4ecdc4', '#ff99c8'];
        for (let i = 0; i < 6; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new HighlightParticle(true, color, this.Y_SHIFT_BIAS)); // Left eye
            this.particles.push(new HighlightParticle(false, color, this.Y_SHIFT_BIAS)); // Right eye
        }
    }

    update(dt) {
        this.particles = this.particles.filter(p => p.update(dt));
    }

    render(ctx) {
        const head = this.snake.getHead();
        const headBulge = this.snake.getBulgeFactor(0, this.snake._time * 1000);
        const displayHeadRadius = (10 * headBulge) * 1.25;

        const headImg = this.snake.renderer.headImg;
        if (!headImg || !headImg.complete || headImg.naturalWidth === 0) return;

        const size = displayHeadRadius * 2;
        const aspect = headImg.naturalWidth / headImg.naturalHeight;
        const imgH = size;
        const imgW = imgH * aspect;

        const scaleX = imgW / headImg.naturalWidth;
        const scaleY = imgH / headImg.naturalHeight;

        ctx.save();
        ctx.translate(head.pos.x, head.pos.y);
        const dir = this.snake.direction || { x: 1, y: 0 };
        const angle = Math.atan2(dir.y, dir.x) - Math.PI / 2;
        ctx.rotate(angle);
        ctx.translate(-imgW / 2, -imgH / 2); // to local image space

        // 1. Wobble highlight
        const wobbleSign = Math.sign(this.snake.wobble);
        if (wobbleSign !== 0) {
            const highlightAlpha = Math.abs(this.snake.wobble) / this.snake.wobbleAmplitude;
            if (highlightAlpha > 0.01) {
                const baseColor = `255,159,243`;
                ctx.fillStyle = `rgba(${baseColor}, ${highlightAlpha * 0.5})`;
                const eye = wobbleSign > 0 ? this.eyeData.left : this.eyeData.right; // right wobble -> left eye highlight
                
                // Shifted Y from -0.5 (back) to Y_SHIFT_BIAS (0.3) for a forward position.
                const highlightPos = new Vector2D(-0.5 * wobbleSign, this.Y_SHIFT_BIAS); 

                const eyeCenterX = eye.center.x * scaleX;
                const eyeCenterY = eye.center.y * scaleY;
                const eyeRadius = eye.radius * scaleX * 0.4;

                const hx = eyeCenterX + highlightPos.x * eye.radius * scaleX;
                const hy = eyeCenterY + highlightPos.y * eye.radius * scaleY;

                ctx.beginPath();
                ctx.arc(hx, hy, eyeRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 2. Sparkle highlights
        this.particles.forEach(p => {
            const eye = p.isLeftEye ? this.eyeData.left : this.eyeData.right;
            const uvPos = p.getPosition();

            const eyeCenterX = eye.center.x * scaleX;
            const eyeCenterY = eye.center.y * scaleY;
            const eyeRadius = eye.radius * scaleX * 0.3; // smaller highlight

            const hx = eyeCenterX + uvPos.x * eye.radius * scaleX;
            const hy = eyeCenterY + uvPos.y * eye.radius * scaleY;

            const alpha = Math.min(1, p.life / p.maxLife * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(hx, hy, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        });

        ctx.restore();
    }
}