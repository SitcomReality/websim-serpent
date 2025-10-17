import { EyeSpecularHighlight } from './EyeSpecularHighlight.js';
import { Vector2D } from '../utils/Vector2D.js';

// Define base eye geometry relative to the center of a 125x50 sprite.
// Based on TL corners (25, 17) and (100, 17) for eye centers, and radius 15.
// Center of 125x50 sprite is (62.5, 25).
const BASE_EYE_RADIUS = 15;
const BASE_LEFT_EYE_CENTER_X = 25 - 62.5; // -37.5
const BASE_RIGHT_EYE_CENTER_X = 100 - 62.5; // 37.5
const BASE_EYE_CENTER_Y = 17 - 25;       // -8.0
const BASE_HEAD_HEIGHT = 50; // Reference height of the original sprite (in pixels)

/**
 * Manages specular highlights for both eyeballs.
 * Calculates highlight positions and colors based on particle effects and wobble.
 */
export class EyeballHighlights {
    constructor() {
        // Initialize vector objects which will be continuously updated
        this.leftEyeCenter = new Vector2D(0, 0);
        this.rightEyeCenter = new Vector2D(0, 0);
        this.eyeRadius = 0; // Will be set dynamically

        // Highlights are instantiated once, referencing the dynamic centers and radius
        this.leftEyeHighlight = new EyeSpecularHighlight(this.leftEyeCenter, this.eyeRadius);
        this.rightEyeHighlight = new EyeSpecularHighlight(this.rightEyeCenter, this.eyeRadius);

        // Spark particle tracking
        this.sparkPositions = [];
        this.sparkColors = [];
    }

    /**
     * Set the current eye geometry based on the dynamically rendered head size.
     * @param {number} displayHeadRadius - Half of the rendered sprite height (H'/2).
     */
    setGeometry(displayHeadRadius) {
        // Calculate scale factor relative to the sprite's native height (50px)
        // Rendered Height H' = 2 * displayHeadRadius
        const scaleFactor = (2 * displayHeadRadius) / BASE_HEAD_HEIGHT; 
        
        this.eyeRadius = BASE_EYE_RADIUS * scaleFactor;
        
        // Update center positions in local space
        this.leftEyeCenter.x = BASE_LEFT_EYE_CENTER_X * scaleFactor;
        this.leftEyeCenter.y = BASE_EYE_CENTER_Y * scaleFactor;
        
        this.rightEyeCenter.x = BASE_RIGHT_EYE_CENTER_X * scaleFactor;
        this.rightEyeCenter.y = BASE_EYE_CENTER_Y * scaleFactor;

        // Update radius reference in highlight objects (since radius is a primitive)
        this.leftEyeHighlight.eyeRadius = this.eyeRadius;
        this.rightEyeHighlight.eyeRadius = this.eyeRadius;
    }

    /**
     * Update highlights based on spark particles.
     * @param {Array} sparks - Array of spark particles with pos and color properties
     * @param {Vector2D} headPos - Position of the snake head in world space
     */
    updateFromSparks(sparks, headPos) {
        this.sparkPositions = [];
        this.sparkColors = [];

        // Collect nearby sparks
        sparks.forEach(spark => {
            const dist = headPos.copy().sub(spark.pos).mag();
            if (dist < 150) { // Only consider sparks within influence range
                this.sparkPositions.push(spark.pos.copy());
                this.sparkColors.push(spark.color);
            }
        });
    }

    /**
     * Calculate the spark reflection effect on an eyeball.
     * Creates a cute "firefly reflection" effect.
     */
    getSparkReflection(eyeCenter) {
        if (this.sparkPositions.length === 0) {
            return { azimuth: 0, distance: 0, color: 'rgba(255,255,255,0)', size: 0 };
        }

        // Mix multiple spark influences together
        let totalAzimuth = 0;
        let totalDistance = 0;
        let totalColor = { r: 0, g: 0, b: 0, a: 0 };
        let weightSum = 0;

        this.sparkPositions.forEach((sparkPos, i) => {
            const toEye = eyeCenter.copy().sub(sparkPos);
            const distance = toEye.mag();
            if (distance < 0.1) return; // Too close, skip

            // Influence decreases with distance
            const influence = Math.max(0, 1 - distance / 200);
            if (influence < 0.01) return;

            // Calculate azimuth (angle on eyeball surface towards spark)
            // With front = 0, back = PI
            const azimuth = Math.atan2(toEye.x, toEye.y);

            // Distance from center of eye (bias towards front)
            let surfaceDistance = 0.3 + Math.max(0, Math.cos(azimuth)) * 0.5;
            surfaceDistance = Math.max(0.1, Math.min(0.8, surfaceDistance));

            totalAzimuth += azimuth * influence;
            totalDistance += surfaceDistance * influence;

            // Parse color
            const color = this.parseColor(this.sparkColors[i]);
            totalColor.r += color.r * influence;
            totalColor.g += color.g * influence;
            totalColor.b += color.b * influence;
            totalColor.a += color.a * influence;

            weightSum += influence;
        });

        if (weightSum < 0.01) {
            return { azimuth: 0, distance: 0, color: 'rgba(255,255,255,0)', size: 0 };
        }

        totalAzimuth /= weightSum;
        totalDistance /= weightSum;
        totalColor.r /= weightSum;
        totalColor.g /= weightSum;
        totalColor.b /= weightSum;
        totalColor.a /= weightSum;

        const colorStr = `rgba(${Math.round(totalColor.r)},${Math.round(totalColor.g)},${Math.round(totalColor.b)},${totalColor.a})`;

        return {
            azimuth: totalAzimuth,
            distance: totalDistance,
            color: colorStr,
            size: Math.min(0.5, weightSum * 0.3)
        };
    }

    /**
     * Get wobble reflection effect (from the side highlight).
     * @param {number} wobbleValue - Current wobble amount (-1 to 1 roughly)
     * @param {number} wobbleAmplitude - Max wobble amplitude for scaling
     */
    getWobbleReflection(wobbleValue, wobbleAmplitude) {
        if (Math.abs(wobbleValue) < 0.05) {
            return { azimuth: 0, distance: 0, color: 'rgba(255,255,255,0)', size: 0 };
        }

        // Wobble creates a reflection on the back side
        // Positive wobble = right side highlight, negative = left side highlight
        const wobbleIntensity = Math.abs(wobbleValue) / Math.max(0.1, wobbleAmplitude);
        const azimuth = wobbleValue > 0 ? Math.PI * 0.7 : Math.PI * 0.3;

        // Place it somewhat forward on the edge
        const distance = 0.5 + wobbleIntensity * 0.3;

        // Pink wobble highlight color (from the game)
        const alpha = wobbleIntensity * 0.6;
        const color = `rgba(255, 159, 243, ${alpha})`;

        return {
            azimuth,
            distance,
            color,
            size: 0.25 + wobbleIntensity * 0.15
        };
    }

    /**
     * Parse a color string and return RGBA components.
     */
    parseColor(colorStr) {
        // Handle hex colors and rgba strings
        const defaultColor = { r: 255, g: 255, b: 255, a: 1 };

        if (!colorStr) return defaultColor;

        if (colorStr.startsWith('rgba')) {
            const match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+),?\\s*([\\d.]+)?\\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: match[4] ? parseFloat(match[4]) : 1
                };
            }
        } else if (colorStr.startsWith('#')) {
            const hex = colorStr.slice(1);
            const num = parseInt(hex, 16);
            return {
                r: (num >> 16) & 255,
                g: (num >> 8) & 255,
                b: num & 255,
                a: 1
            };
        }

        return defaultColor;
    }

    /**
     * Update and render highlights.
     */
    render(ctx, wobbleValue, wobbleAmplitude) {
        const sparkLeft = this.getSparkReflection(this.leftEyeCenter);
        const sparkRight = this.getSparkReflection(this.rightEyeCenter);
        const wobbleLeft = this.getWobbleReflection(wobbleValue, wobbleAmplitude);
        const wobbleRight = this.getWobbleReflection(wobbleValue, wobbleAmplitude);

        // Left eye: spark + wobble
        if (sparkLeft.size > 0.01) {
            this.leftEyeHighlight.setPosition(sparkLeft.azimuth, sparkLeft.distance, sparkLeft.color, sparkLeft.size);
            this.leftEyeHighlight.render(ctx);
        }
        if (wobbleLeft.size > 0.01) {
            this.leftEyeHighlight.setPosition(wobbleLeft.azimuth, wobbleLeft.distance, wobbleLeft.color, wobbleLeft.size);
            this.leftEyeHighlight.render(ctx);
        }

        // Right eye: spark + wobble
        if (sparkRight.size > 0.01) {
            this.rightEyeHighlight.setPosition(sparkRight.azimuth, sparkRight.distance, sparkRight.color, sparkRight.size);
            this.rightEyeHighlight.render(ctx);
        }
        if (wobbleRight.size > 0.01) {
            this.rightEyeHighlight.setPosition(wobbleRight.azimuth, wobbleRight.distance, wobbleRight.color, wobbleRight.size);
            this.rightEyeHighlight.render(ctx);
        }
    }
}