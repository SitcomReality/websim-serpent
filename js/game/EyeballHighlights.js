import { Vector2D } from '../utils/Vector2D.js';

export class EyeballHighlights {
    constructor() {
        // Eyeball positions in original 125x50 image
        // Left eye: center (25, 25), radius ~12
        // Right eye: center (100, 25), radius ~12
        this.leftEyeOriginal = new Vector2D(25, 25);
        this.rightEyeOriginal = new Vector2D(100, 25);
        this.eyeRadiusOriginal = 12;

        // Scaled positions (calculated once per render based on head size)
        this.leftEyeScaled = new Vector2D(0, 0);
        this.rightEyeScaled = new Vector2D(0, 0);
        this.eyeRadiusScaled = 0;
    }

    updateEyeScale(imgWidth, imgHeight) {
        const scaleX = imgWidth / 125;
        const scaleY = imgHeight / 50;

        this.leftEyeScaled.x = this.leftEyeOriginal.x * scaleX;
        this.leftEyeScaled.y = this.leftEyeOriginal.y * scaleY;

        this.rightEyeScaled.x = this.rightEyeOriginal.x * scaleX;
        this.rightEyeScaled.y = this.rightEyeOriginal.y * scaleY;

        this.eyeRadiusScaled = this.eyeRadiusOriginal * Math.min(scaleX, scaleY);
    }

    getSparkReflection(eye, sparks) {
        if (sparks.length === 0) return null;

        const reflections = [];
        const frontBias = 0.7; // bias reflections towards front (bottom in default orientation)

        for (const spark of sparks) {
            const distToEye = eye.dist(spark.pos);
            if (distToEye > 100) continue; // only nearby sparks matter

            // Calculate reflection point on eyeball
            // Direction from eye to spark, but inverted and with front bias
            const toSpark = Vector2D.sub(spark.pos, eye);
            const distMag = toSpark.mag();
            if (distMag < 0.1) continue;

            const direction = toSpark.copy().normalize();

            // Apply front bias (push towards bottom of eyeball in default orientation)
            direction.y += frontBias * 0.3;
            direction.normalize();

            // Place highlight on surface of eyeball, slightly offset towards camera
            const reflectionPoint = direction.copy().mult(this.eyeRadiusScaled * 0.8);

            reflections.push({
                pos: reflectionPoint,
                color: spark.color,
                intensity: Math.max(0, 1 - distToEye / 100)
            });
        }

        if (reflections.length === 0) return null;

        // Blend nearby reflections
        const blended = reflections.reduce((acc, r) => ({
            pos: Vector2D.add(acc.pos, r.pos.copy().mult(r.intensity)),
            intensity: acc.intensity + r.intensity * 0.5
        }));

        blended.intensity = Math.min(1, blended.intensity);
        return blended;
    }

    getWobbleReflection(wobbleValue, wobbleAmplitude) {
        if (Math.abs(wobbleValue) < 0.05) return null;

        const intensity = Math.abs(wobbleValue) / wobbleAmplitude;
        const side = Math.sign(wobbleValue);

        return {
            intensity: intensity * 0.6, // wobble reflections are more subtle
            side: side, // positive = right side, negative = left side
            color: 'rgba(255, 159, 243, 0.7)' // pink from wobble highlight
        };
    }

    renderHighlights(ctx, headPos, eyePositions, sparkReflection, wobbleReflection, displayHeadRadius) {
        ctx.save();

        for (const eyeData of eyePositions) {
            const eyeWorldPos = Vector2D.add(headPos, eyeData.localPos);

            // Render spark reflection
            if (sparkReflection) {
                ctx.globalAlpha = sparkReflection.intensity * 0.8;
                ctx.fillStyle = sparkReflection.color || '#fff';
                const reflectPos = Vector2D.add(eyeWorldPos, sparkReflection.pos);
                const highlightSize = this.eyeRadiusScaled * 0.3;
                ctx.beginPath();
                ctx.arc(reflectPos.x, reflectPos.y, highlightSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Render wobble reflection
            if (wobbleReflection && wobbleReflection.side === eyeData.side) {
                ctx.globalAlpha = wobbleReflection.intensity * 0.6;
                ctx.fillStyle = wobbleReflection.color;

                // Offset towards the wobble direction (left or right side)
                const wobbleDir = wobbleReflection.side;
                const wobbleX = wobbleDir * this.eyeRadiusScaled * 0.5;
                const wobbleY = this.eyeRadiusScaled * -0.3; // slightly back

                const highlightPos = new Vector2D(
                    eyeWorldPos.x + wobbleX,
                    eyeWorldPos.y + wobbleY
                );
                const highlightSize = this.eyeRadiusScaled * 0.25;
                ctx.beginPath();
                ctx.arc(highlightPos.x, highlightPos.y, highlightSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }
}