import { VerletNode } from '../physics/VerletNode.js';
import { VerletChain } from '../physics/VerletChain.js';
import { Vector2D } from '../utils/Vector2D.js';
import { BulgeManager } from './BulgeManager.js';
import { DeathAnimation } from './DeathAnimation.js';
import { RenderSnake } from './RenderSnake.js';

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
        this.isDead = false;
        this.deathTimer = 0;
        
        // Bulge effect properties
        this.bulgeDurationPerNode = 50; // ms per node for bulge travel
        this.bulgeMagnitude = 3; // Max scale factor for width/radius (starts at 2x)
        this.eatEvents = []; // Stores timestamps of eat events for multiple bulges
        
        // Create initial nodes
        const nodes = [];
        for (let i = 0; i < initialLength; i++) {
            const node = new VerletNode(x - i * this.segmentLength, y, i === 0);
            nodes.push(node);
        }
        
        this.chain = new VerletChain(nodes, this.segmentLength);

        // Delegates
        this.bulgeManager = new BulgeManager(this);
        this.deathAnimation = new DeathAnimation(this);
        this.renderer = new RenderSnake(this);
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
        if (this.isDead) {
            this.deathAnimation.updateDeathAnimation(dt, width, height);
            return;
        }

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
        this.bulgeManager.update(this._time * 1000);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.deathAnimation.die();
    }

    grow() {
        if (this.isDead) return;
        this.chain.addNode(0, 0);
        this.bulgeManager.recordEat(this._time * 1000);
        
        // Trigger eyeball spark highlights
        this.renderer.triggerSparkHighlights(this._time * 1000);
    }

    getHead() {
        return this.chain.nodes[0];
    }
    
    getBulgeFactor(i, timeMs) {
        // Delegate to BulgeManager which owns eat event state and timing
        return this.bulgeManager.getBulgeFactor(i, timeMs);
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

    // new: return true when head is touching screen edges (uses node radius)
    checkWallCollision(width, height) {
        const head = this.getHead();
        if (!head) return false;
        if (head.pos.x - head.radius <= 0) return true;
        if (head.pos.x + head.radius >= width) return true;
        if (head.pos.y - head.radius <= 0) return true;
        if (head.pos.y + head.radius >= height) return true;
        return false;
    }

    render(ctx) {
        if (this.isDead) {
            this.deathAnimation.renderDeathAnimation(ctx);
            return;
        }

        this.bulgeManager.cleanup(this._time * 1000);
        this.renderer.render(ctx);
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