import { Vector2D } from '../utils/Vector2D.js';

export class RenderSnake {
    constructor(snake) {
        this.snake = snake;
        // load head sprite once
        this.headImg = new Image();
        this.headImg.src = '/head.png';
    }

    render(ctx) {
        const nodes = this.snake.chain.nodes;
        const timeMs = this.snake._time * 1000;

        // Wobble highlight
        const wobbleSign = Math.sign(this.snake.wobble);
        if (wobbleSign !== 0) {
            const highlightAlpha = Math.abs(this.snake.wobble) / this.snake.wobbleAmplitude;
            if (highlightAlpha > 0.01) {
                const baseColor = `255,159,243`;
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${baseColor}, ${highlightAlpha * 0.7})`;
                for (let i = 0; i < nodes.length - 1; i++) {
                    const p1 = nodes[i].pos;
                    const p2 = nodes[i+1].pos;
                    const dir = Vector2D.sub(p2, p1).normalize();
                    const perp = new Vector2D(dir.y, -dir.x).mult(wobbleSign * 10);
                    const offsetP1 = Vector2D.add(p1, perp);
                    const offsetP2 = Vector2D.add(p2, perp);
                    const segT = i / (nodes.length - 1);
                    const segAlpha = highlightAlpha * (1 - segT);
                    if (segAlpha <= 0.01) continue;
                    ctx.strokeStyle = `rgba(${baseColor}, ${segAlpha * 0.7})`;
                    ctx.lineWidth = 6 - (i / nodes.length) * 4;
                    ctx.beginPath();
                    ctx.moveTo(offsetP1.x, offsetP1.y);
                    ctx.lineTo(offsetP2.x, offsetP2.y);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        // Body segments with bulge
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < nodes.length - 1; i++) {
            const bulgeFactor1 = this.snake.getBulgeFactor(i, timeMs);
            const bulgeFactor2 = this.snake.getBulgeFactor(i + 1, timeMs);
            const segmentBulgeFactor = Math.max(bulgeFactor1, bulgeFactor2);
            const gradient = ctx.createLinearGradient(
                nodes[i].pos.x, nodes[i].pos.y,
                nodes[i + 1].pos.x, nodes[i + 1].pos.y
            );
            const hue = (i / nodes.length) * 60 + 180;
            gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${hue + 20}, 70%, 50%)`);
            ctx.strokeStyle = gradient;
            const baseWidth = 16 - (i / nodes.length) * 8;
            ctx.lineWidth = baseWidth * segmentBulgeFactor;
            ctx.beginPath();
            ctx.moveTo(nodes[i].pos.x, nodes[i].pos.y);
            ctx.lineTo(nodes[i + 1].pos.x, nodes[i + 1].pos.y);
            ctx.stroke();
        }

        // Head
        const head = this.snake.getHead();
        const headBulge = this.snake.getBulgeFactor(0, timeMs);
        const headRadius = 10 * headBulge;
        // draw sprite if loaded, otherwise fallback to circle
        if (this.headImg && this.headImg.complete && this.headImg.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(head.pos.x, head.pos.y);
            // sprite faces down; rotate so that the sprite aligns with snake.direction
            const dir = this.snake.direction || { x: 1, y: 0 };
            const angle = Math.atan2(dir.y, dir.x) - Math.PI / 2;
            ctx.rotate(angle);
            const size = headRadius * 2;
            ctx.drawImage(this.headImg, -size / 2, -size / 2, size, size);
            ctx.restore();
        } else {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4ecdc4';
            ctx.fillStyle = '#4ecdc4';
            ctx.beginPath();
            ctx.arc(head.pos.x, head.pos.y, headRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}