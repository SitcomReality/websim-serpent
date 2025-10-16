import { Vector2D } from '../utils/Vector2D.js';

export class VerletChain {
    constructor(nodes, segmentLength) {
        this.nodes = nodes;
        this.segmentLength = segmentLength;
    }

    update(iterations = 3) {
        // Apply constraints multiple times for stability
        for (let i = 0; i < iterations; i++) {
            this.applyConstraints();
        }
    }

    applyConstraints() {
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const nodeA = this.nodes[i];
            const nodeB = this.nodes[i + 1];

            const delta = Vector2D.sub(nodeB.pos, nodeA.pos);
            const distance = delta.mag();
            const diff = this.segmentLength - distance;
            const offset = delta.normalize().mult(diff * 0.5);

            if (!nodeA.locked) nodeA.pos.sub(offset);
            if (!nodeB.locked) nodeB.pos.add(offset);
        }
    }

    addNode(x, y) {
        const lastNode = this.nodes[this.nodes.length - 1];
        const direction = Vector2D.sub(lastNode.pos, lastNode.oldPos).normalize();
        const offset = direction.mult(-this.segmentLength);
        
        const newNode = new (this.nodes[0].constructor)(
            lastNode.pos.x + offset.x,
            lastNode.pos.y + offset.y
        );
        
        this.nodes.push(newNode);
    }

    getVelocityAt(index) {
        const node = this.nodes[index];
        return Vector2D.sub(node.pos, node.oldPos);
    }
}

