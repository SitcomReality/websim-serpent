import { Vector2D } from '../utils/Vector2D.js';

export class BulgeManager {
    constructor(snake) {
        this.snake = snake;
        this.bulgeDurationPerNode = 60;
        this.bulgeMagnitude = 3;
        this.eatEvents = [];
    }

    recordEat(timestampMs) {
        this.eatEvents.push(timestampMs);
    }

    cleanup(currentTimeMs) {
        const nodesLength = this.snake.chain.nodes.length;
        this.eatEvents = this.eatEvents.filter(eatTime => {
            const elapsed = currentTimeMs - eatTime;
            const pulseCenterIndex = elapsed / this.bulgeDurationPerNode;
            return pulseCenterIndex <= nodesLength + 2;
        });
    }

    getBulgeFactor(i, timeMs) {
        if (this.eatEvents.length === 0) return 1.0;
        const nodesLength = this.snake.chain.nodes.length;
        let totalBulgeAmount = 0;
        for (const eatTime of this.eatEvents) {
            const elapsed = timeMs - eatTime;
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

