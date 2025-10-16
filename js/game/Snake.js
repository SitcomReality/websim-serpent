import { VerletNode } from '../physics/VerletNode.js';
import { VerletChain } from '../physics/VerletChain.js';
import { Vector2D } from '../utils/Vector2D.js';

export class Snake {
    constructor(x, y, initialLength = 5) {
        this.segmentLength = 15;
        this.speed = 3;
        this.direction = new Vector2D(1, 0);
        this.headingAngle = 0;
        this.turnSpeed = Math.PI; // radians per second
        this.turnLeft = false;
        this.turnRight = false;
        this.wobbleAmplitude = 0.6;
        this.wobbleFrequency = 0.6;
        this._time = 0;
        this.baseWobbleAmplitude = this.wobbleAmplitude;
        this.currentWobbleAmp = 0;
        this.score = 0;
        this.wobble = 0; // To store current wobble value for rendering
        
        // Bulge effect properties
        this.eatTime = -1000; // Time of last meal ingestion, in MS relative to _time=0
        this.bulgeDurationPerNode = 100; // ms per node for bulge travel
        this.bulgeMagnitude = 1.6; // Max scale factor for width/radius
        this.baseBulgeMagnitude = this.bulgeMagnitude; // store original to revert after boost
        this._bulgeBoostUntil = -1;
        
        // Create initial nodes
        const nodes = [];
        for (let i = 0; i < initialLength; i++) {
            const node = new VerletNode(x - i * this.segmentLength, y, i === 0);
            nodes.push(node);
        }
        
        this.chain = new VerletChain(nodes, this.segmentLength);
    }

    setDirection(dir) {
        // Prevent 180-degree turns
        if (this.direction.x === -dir.x && this.direction.y === -dir.y) return;
        this.inputDirection = dir;
    }

    setTurning(left, right) {
        this.turnLeft = left;
        this.turnRight = right;
    }

    update(dt, width, height) {
        const dtSec = dt / 1000;
        this._time += dtSec;
        if (this.turnLeft) this.headingAngle -= this.turnSpeed * dtSec;
        if (this.turnRight) this.headingAngle += this.turnSpeed * dtSec;
        
        this.wobble = this.currentWobbleAmp * Math.sin(this._time * Math.PI * 2 * this.wobbleFrequency);
        const angle = this.headingAngle + this.wobble;

        this.direction.x = Math.cos(angle);
        this.direction.y = Math.sin(angle);
        
        // Move head
        const head = this.chain.nodes[0];
        head.oldPos = head.pos.copy();
        head.pos.add(this.direction.copy().mult(this.speed));

        // Update all nodes
        this.chain.nodes.forEach(node => {
            node.update(dt);
            node.constrain(width, height);
        });

        // Apply chain constraints
        this.chain.update(5);
    }

    grow() {
        this.chain.addNode(0, 0);
        this.eatTime = this._time * 1000; // Record current time in MS
        // Double bulge magnitude temporarily for the passing pulse
        this.bulgeMagnitude = this.baseBulgeMagnitude * 2;
        const estimatedDuration = (this.chain.nodes.length + 2) * this.bulgeDurationPerNode;
        this._bulgeBoostUntil = this.eatTime + estimatedDuration;
    }

    getHead() {
        return this.chain.nodes[0];
    }
    
    getBulgeFactor(i, timeMs) {
        if (this.eatTime < 0) return 1.0;
        
        // If the temporary bulge boost duration passed, revert to base magnitude
        if (this._bulgeBoostUntil > 0 && timeMs > this._bulgeBoostUntil) {
            this.bulgeMagnitude = this.baseBulgeMagnitude;
            this._bulgeBoostUntil = -1;
        }
        
        const elapsed = timeMs - this.eatTime;
        
        // Define the target index of the bulge center at this elapsed time
        // Node 0 peaks at elapsed = 0
        const pulseCenterIndex = elapsed / this.bulgeDurationPerNode;
        
        const nodesLength = this.chain.nodes.length;
        
        // If pulse is far past the tail, stop calculating and return 1.0
        // We use nodesLength + 2 as a threshold to ensure the effect completes on the last node (nodesLength - 1)
        if (pulseCenterIndex > nodesLength + 2) {
             this.eatTime = -1000; // Reset state
             return 1.0;
        }

        const distance = Math.abs(i - pulseCenterIndex);
        const radiusOfInfluence = 1.5;
        
        if (distance > radiusOfInfluence) {
            return 1.0;
        }
        
        // Calculate influence: 1 at center, 0 at edge
        const influence = 1 - distance / radiusOfInfluence;
        
        // Squared influence for a sharp peak
        const influenceSquared = influence * influence;
        
        const bulgeAmount = influenceSquared * (this.bulgeMagnitude - 1.0);
        return 1.0 + bulgeAmount;
    }

    checkSelfCollision() {
        const head = this.getHead();
        for (let i = 4; i < this.chain.nodes.length; i++) {
            const node = this.chain.nodes[i];
            if (head.pos.dist(node.pos) < this.segmentLength * 0.8) {
                return true;
            }
        }
        return false;
    }

    render(ctx) {
        const nodes = this.chain.nodes;
        const timeMs = this._time * 1000; // Get current time in milliseconds
        
        // --- Wobble Highlight ---
        const wobbleSign = Math.sign(this.wobble);
        if (wobbleSign !== 0) {
            const highlightAlpha = Math.abs(this.wobble) / this.wobbleAmplitude;
            if (highlightAlpha > 0.01) {
                // use a single unified highlight color for both sides
                const baseColor = `255,159,243`;
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${baseColor}, ${highlightAlpha * 0.7})`;
                
                // Draw each segment separately with alpha fading toward the tail
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

        // Draw body segments with gradient
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 0; i < nodes.length - 1; i++) {
            const p1 = nodes[i].pos;
            const p2 = nodes[i + 1].pos;

            // Calculate bulge factor for nodes i and i+1
            const bulgeFactor1 = this.getBulgeFactor(i, timeMs);
            const bulgeFactor2 = this.getBulgeFactor(i + 1, timeMs);
            
            // We use the maximum bulge factor for visual emphasis on the segment thickness
            const segmentBulgeFactor = Math.max(bulgeFactor1, bulgeFactor2);

            const gradient = ctx.createLinearGradient(
                nodes[i].pos.x, nodes[i].pos.y,
                nodes[i + 1].pos.x, nodes[i + 1].pos.y
            );
            
            const hue = (i / nodes.length) * 60 + 180;
            gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${hue + 20}, 70%, 50%)`);
            
            ctx.strokeStyle = gradient;
            
            // Apply bulge factor to base width
            const baseWidth = 16 - (i / nodes.length) * 8;
            ctx.lineWidth = baseWidth * segmentBulgeFactor;
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].pos.x, nodes[i].pos.y);
            ctx.lineTo(nodes[i + 1].pos.x, nodes[i + 1].pos.y);
            ctx.stroke();
        }

        // Draw head with glow
        const head = this.getHead();
        const headBulge = this.getBulgeFactor(0, timeMs);
        const headRadius = 10 * headBulge;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#4ecdc4';
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(head.pos.x, head.pos.y, headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    setScore(score) {
        const s = Math.max(0, score);
        if (s <= 15) {
            this.currentWobbleAmp = this.baseWobbleAmplitude * (s / 15);
        } else {
            this.currentWobbleAmp = this.baseWobbleAmplitude * (1 + 0.02 * (s - 15));
        }
        const t = Math.min(1, s / 15);
        const damping = 0.92 + 0.06 * t;          // 0.92 -> 0.98 by score 15
        const stiffness = 1.3 - 0.3 * t;          // 1.3 -> 1.0 by score 15
        this.chain.stiffness = stiffness;
        for (let i = 1; i < this.chain.nodes.length; i++) {
            this.chain.nodes[i].damping = damping;
        }
    }
}