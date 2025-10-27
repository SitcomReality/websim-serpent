export class Validation {
    constructor() {
        this.reset();
    }

    reset() {
        this.spawnedFood = 0;
        this.eatenFood = 0;
        this.despawnedFood = 0;
    }

    foodSpawned() {
        this.spawnedFood++;
    }

    foodEaten() {
        this.eatenFood++;
    }

    foodDespawned() {
        this.despawnedFood++;
    }

    validateScore(score) {
        const scoreMatchesEaten = score === this.eatenFood;
        const eatenIsPossible = this.eatenFood <= this.spawnedFood - this.despawnedFood;
        
        if (!scoreMatchesEaten) {
            console.warn(`Cheat detected: Score (${score}) does not match eaten food count (${this.eatenFood}).`);
        }
        if (!eatenIsPossible) {
            console.warn(`Cheat detected: Eaten food (${this.eatenFood}) exceeds possible count (Spawned: ${this.spawnedFood}, Despawned: ${this.despawnedFood}).`);
        }
        
        return scoreMatchesEaten && eatenIsPossible;
    }
}

