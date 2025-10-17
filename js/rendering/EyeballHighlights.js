import { EyeSpecularHighlight } from './EyeSpecularHighlight.js';
import { Vector2D } from '../utils/Vector2D.js';

// Define base eye geometry relative to the center of a 125x50 sprite.
// Based on TL corners (25, 17) and (100, 17) for eye centers, and radius 15.
// Center of 125x50 sprite is (62.5, 25).
const EYE_RADIUS_FRAC = 15 / 50;    // radius as fraction of sprite height
const LEFT_EYE_FX = 25 / 125;       // fractional X within sprite width
const RIGHT_EYE_FX = 100 / 125;
const EYE_FY = 17 / 50;             // fractional Y within sprite height

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
        this.sparkPositions = []; // Stores local, de-rotated spark positions
        this.sparkColors = [];
    }

    /**
     * Set the current eye geometry based on the dynamically rendered head size.
     * @param {number} displayHeadRadius - Half of the rendered sprite height (H'/2).
     */
    setGeometryByDrawnSize(imgW, imgH) {
        // centers relative to the current drawn image size, origin at center (0,0)
        const cxL = (LEFT_EYE_FX - 0.5) * imgW, cy = (EYE_FY - 0.5) * imgH;
        const cxR = (RIGHT_EYE_FX - 0.5) * imgW;
        this.leftEyeCenter.x = cxL; this.leftEyeCenter.y = cy;
        this.rightEyeCenter.x = cxR; this.rightEyeCenter.y = cy;
        this.eyeRadius = EYE_RADIUS_FRAC * imgH;
        this.leftEyeHighlight.eyeRadius = this.eyeRadius;
        this.rightEyeHighlight.eyeRadius = this.eyeRadius;
    }

    /**
     * Update highlights based on spark particles.
     * @param {Array} sparks - Array of spark particles with pos and color properties
     * @param {Vector2D} headPos - Position of the snake head in world space
     * @param {number} headAngle - Rotation angle of the head sprite (in radians)
     */
    updateFromSparks(sparks, headPos, headAngle) {
        this.sparkPositions = [];
        this.sparkColors = [];

        // Calculate rotation inverse (negative angle) for transforming world vectors to local head space
        const inverseAngle = -headAngle;
        const cosA = Math.cos(inverseAngle);
        const sinA = Math.sin(inverseAngle);

        // Collect nearby sparks
        sparks.forEach(spark => {
            // P_rel_world = spark.pos - headPos
            const P_rel_world = spark.pos.copy().sub(headPos);
            const dist = P_rel_world.mag();
            
            if (dist < 150) { // Only consider sparks within influence range
                // De-rotate P_rel_world to get P_local (in local head sprite space)
                // This converts the spark position into the coordinate system of the head sprite (0 rotation, center at 0,0)
                const P_local_x = P_rel_world.x * cosA - P_rel_world.y * sinA;
                const P_local_y = P_rel_world.x * sinA + P_rel_world.y * cosA;

                this.sparkPositions.push(new Vector2D(P_local_x, P_local_y));
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

        this.sparkPositions.forEach((sparkLocalPos, i) => {
            // eyeCenter is local, sparkLocalPos is local. Calculate vector from eye center to spark.
            const eyeToSpark = sparkLocalPos.copy().sub(eyeCenter);
            const distance = eyeToSpark.mag();

            // Influence decreases with distance from the specific eye center
            const localInfluenceRange = this.eyeRadius * 5; 
            const influence = Math.max(0, 1 - distance / localInfluenceRange);
            if (influence < 0.01) return;

            // Calculate azimuth (angle on eyeball surface towards spark)
            // Azimuth = atan2(Vx, Vy) because (dx, dy) = (sin(A), cos(A)) in EyeSpecularHighlight.js
            const azimuth = Math.atan2(eyeToSpark.x, eyeToSpark.y);

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