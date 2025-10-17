import { Vector2D } from '../utils/Vector2D.js';
import { EyeballHighlights } from './EyeballHighlights.js';

export class RenderSnake {
    constructor(snake) {
        this.snake = snake;
        // load head sprite once
        this.headImg = new Image();
        this.headImg.src = '/head.png';
        
        // Visual adjustment factor for longitudinal stretch beyond 150/125 ratio to make the head look less 'short and fat'
        this.longitudinalStretchFactor = 1.25; 
        
        // Initialize eyeball highlights system
        this.eyeballHighlights = new EyeballHighlights();
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
        // displayHeadRadius is 25% larger than the base headRadius for rendering only
        const displayHeadRadius = headRadius * 1.25;
        // draw sprite if loaded, otherwise fallback to circle
        if (this.headImg && this.headImg.complete && this.headImg.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(head.pos.x, head.pos.y);
            
            const dir = this.snake.direction || { x: 1, y: 0 };
            const forwardAngle = Math.atan2(dir.y, dir.x); // F (Direction of travel)
            
            // sprite faces down (Y+); rotation angle R = F - PI/2
            const rotationAngle = forwardAngle - Math.PI / 2;
            ctx.rotate(rotationAngle);
            
            // Calculate draw dimensions based on 125W x 150H aspect ratio 
            // 125px is transverse width; 150px is longitudinal length
            const intendedWidth = 125;
            const intendedHeight = 150;
            const targetTransverseSize = displayHeadRadius * 2; // Target diameter for 125px dimension
            const renderScale = targetTransverseSize / intendedWidth;
            const imgW = intendedHeight * renderScale * this.longitudinalStretchFactor; // longitudinal length, visually stretched
            const imgH = targetTransverseSize;         // transverse width
            
            ctx.drawImage(this.headImg, -imgW / 2, -imgH / 2, imgW, imgH);
            ctx.restore();
            
            // Render eyeball highlights after drawing the head
            // The scale factor based on 125px width
            
            // Wobble highlight alpha for specular
            const wobbleHighlightAlpha = Math.abs(this.snake.wobble) / this.snake.wobbleAmplitude;
            
            // Update and render eyeball highlights
            this.eyeballHighlights.update(timeMs);
            this.eyeballHighlights.render(
                ctx,
                head.pos,
                forwardAngle, // Pass F (the actual direction of travel)
                renderScale,
                wobbleSign,
                wobbleHighlightAlpha,
                timeMs
            );
        } else {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4ecdc4';
            ctx.fillStyle = '#4ecdc4';
            ctx.beginPath();
            ctx.arc(head.pos.x, head.pos.y, displayHeadRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Method to trigger spark highlights when sparks are emitted
    triggerSparkHighlights(timeMs) {
        const head = this.snake.getHead();
        this.eyeballHighlights.triggerSparkEffect(head.pos, timeMs);
    }
}