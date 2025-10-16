export class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    dist(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m > 0) {
            this.mult(1 / m);
        }
        return this;
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }

    static sub(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }

    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }
}

