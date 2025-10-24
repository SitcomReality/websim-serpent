export class BulgeManager {
    constructor(snake) {
        this.snake = snake;
        this.bulgeDurationPerNode = 60;
        this.bulgeMagnitude = 3;
        this.eatEvents = [];
    }

    recordEat(timestampMs) {
        this.eatEvents.push({ time: timestampMs, lastStep: -1 });
    }

    update(currentTimeMs) {
        const nodesLength = this.snake.chain.nodes.length;
        for (const e of this.eatEvents) {
            const elapsed = currentTimeMs - e.time;
            const center = elapsed / this.bulgeDurationPerNode;
            const step = Math.floor(center);
            if (step > e.lastStep && step < nodesLength + 2) {
                e.lastStep = step;
            }
        }
        this.cleanup(currentTimeMs);
    }

    cleanup(currentTimeMs) {
        const nodesLength = this.snake.chain.nodes.length;
        this.eatEvents = this.eatEvents.filter(e => {
            const elapsed = currentTimeMs - e.time;
            const center = elapsed / this.bulgeDurationPerNode;
            return center <= nodesLength + 2;
        });
    }

    getBulgeFactor(i, timeMs) {
        if (this.eatEvents.length === 0) return 1.0;
        const nodesLength = this.snake.chain.nodes.length;
        let totalBulgeAmount = 0;
        for (const e of this.eatEvents) {
            const elapsed = timeMs - e.time;
            const pulseCenterIndex = elapsed / this.bulgeDurationPerNode;
            const progress = Math.min(1, pulseCenterIndex / (nodesLength - 1));
            const falloff = 1 - Math.pow(progress, 3);
            const currentBulgeMagnitude = 1.0 + (this.bulgeMagnitude - 1.0) * falloff;
            const distance = Math.abs(i - pulseCenterIndex);
            const radiusOfInfluence = 3;
            if (distance > radiusOfInfluence) continue;
            const influence = 1 - distance / radiusOfInfluence;
            const influenceSquared = influence * influence;
            const bulgeAmount = influenceSquared * (currentBulgeMagnitude - 1.0);
            totalBulgeAmount += bulgeAmount;
        }
        return 1.0 + totalBulgeAmount;
    }
}