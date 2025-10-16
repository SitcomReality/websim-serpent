import { Vector2D } from '../utils/Vector2D.js';

export class VerletNode {
    constructor(x, y, locked = false) {
        this.pos = new Vector2D(x, y);
        this.oldPos = new Vector2D(x, y);
        this.locked = locked;
        this.radius = 8;
        this.damping = 0.98; // new: adjustable per-node damping
    }

    update(dt) {
        if (this.locked) return;

        const velocity = Vector2D.sub(this.pos, this.oldPos);
        this.oldPos = this.pos.copy();
        
        // Apply velocity and damping
        this.pos.add(velocity.mult(this.damping));
    }

    constrain(width, height) {
        if (this.pos.x < this.radius) this.pos.x = this.radius;
        if (this.pos.x > width - this.radius) this.pos.x = width - this.radius;
        if (this.pos.y < this.radius) this.pos.y = this.radius;
        if (this.pos.y > height - this.radius) this.pos.y = height - this.radius;
    }
}