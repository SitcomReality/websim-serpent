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
        this.stiffnessFactor = 0; // Initialize stiffness factor
        
        // Create initial nodes
        const nodes = [];
        for (let i = 0; i < initialLength; i++) {
            const node = new VerletNode(x - i * this.segmentLength, y, i === 0);
            nodes.push(node);
        }
        
        this.chain = new VerletChain(nodes, this.segmentLength);
        this.updateNodeMasses();

        // Ensure initial score-dependent parameters are set correctly after chain initialization
        this.setScore(0);
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

    updateNodeMasses() {
        const score = this.score;
        const totalNodes = this.chain.nodes.length;

        // Bias factor: 1 at score 0, approaches 0 as score approaches 15
        const biasFactor = Math.max(0, 1 - score / 15);
        
        // At score 0, tail is 1/10th weight of head. At score 15+, all are weight 1.
        const minMass = 1 - 0.9 * biasFactor;

        this.chain.nodes.forEach((node, i) => {
            if (i === 0) { // Head node
                node.setMass(1);
            } else {
                const t = (i - 1) / (totalNodes - 2 || 1); // 0 for first tail, 1 for last
                const mass = 1 - (1 - minMass) * t;
                node.setMass(mass);
            }
        });
    }

    update(dt, width, height) {
        const dtSec = dt / 1000;
        this._time += dtSec;
        if (this.turnLeft) this.headingAngle -= this.turnSpeed * dtSec;
        if (this.turnRight) this.headingAngle += this.turnSpeed * dtSec;
        const wobble = this.currentWobbleAmp * Math.sin(this._time * Math.PI * 2 * this.wobbleFrequency);
        const angle = this.headingAngle + wobble;
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
        this.updateNodeMasses();
    }

    getHead() {
        return this.chain.nodes[0];
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
        
        // Draw body segments with gradient
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 0; i < nodes.length - 1; i++) {
            const gradient = ctx.createLinearGradient(
                nodes[i].pos.x, nodes[i].pos.y,
                nodes[i + 1].pos.x, nodes[i + 1].pos.y
            );
            
            const hue = (i / nodes.length) * 60 + 180;
            gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`);
            gradient.addColorStop(1, `hsl(${hue + 20}, 70%, 50%)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 16 - (i / nodes.length) * 8;
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].pos.x, nodes[i].pos.y);
            ctx.lineTo(nodes[i + 1].pos.x, nodes[i + 1].pos.y);
            ctx.stroke();
        }

        // Draw head with glow
        const head = this.getHead();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#4ecdc4';
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(head.pos.x, head.pos.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    setScore(score) {
        const s = Math.max(0, score);
        if (s <= 15) {
            this.currentWobbleAmp = this.baseWobbleAmplitude * (s / 15);
            // Stiffness increases from 0 (rigid) to 1 (current flexibility)
            this.stiffnessFactor = s / 15;
        } else {
            this.currentWobbleAmp = this.baseWobbleAmplitude * (1 + 0.02 * (s - 15));
            this.stiffnessFactor = 1;
        }
        this.score = s;
        this.updateNodeMasses();
        
        // Apply stiffness to the chain
        this.chain.stiffnessFactor = this.stiffnessFactor;
    }
}