import { Vector2D } from '../utils/Vector2D.js';

export class EyeballHighlights {
    constructor() {
        // Eye positions in the original 125x50 image space (assuming y=0 is top)
        // Correcting the user's coordinates - assuming they meant:
        // Left eye: center at (25, 25), radius 25
        // Right eye: center at (100, 25), radius 25
        this.leftEyeImageSpace = { x: 25, y: 25, radius: 25 };
        this.rightEyeImageSpace = { x: 100, y: 25, radius: 25 };

        // Original image dimensions
        this.imageWidth = 125;
        this.imageHeight = 50;

        // Spark highlight animation state
        this.sparkHighlights = {
            left: [],
            right: []
        };
        this.sparkEffectDuration = 800; // ms
    }

    // Transform eye position from image space to world space
    transformEyeToWorld(eyeImageSpace, headPos, rotation, scale) {
        // Image space: origin at top-left, y increases downward
        // Our eye coords are relative to image center
        const imgCenterX = this.imageWidth / 2;
        const imgCenterY = this.imageHeight / 2;

        // Position relative to image center
        const relX = eyeImageSpace.x - imgCenterX;
        const relY = eyeImageSpace.y - imgCenterY;

        // Scale to match rendered size
        const scaledX = relX * scale;
        const scaledY = relY * scale;

        // Rotate around head center
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const rotatedX = scaledX * cos - scaledY * sin;
        const rotatedY = scaledX * sin + scaledY * cos;

        // Translate to world position
        return {
            x: headPos.x + rotatedX,
            y: headPos.y + rotatedY,
            radius: eyeImageSpace.radius * scale
        };
    }

    // Add spark effect when sparks are emitted near the head
    triggerSparkEffect(headPos, timeMs) {
        // Create multiple highlight points that will animate across the eyeballs
        const count = 3 + Math.floor(Math.random() * 3);
        const colors = ['#ff6b6b', '#ffd166', '#6bf2ff', '#9b8cff', '#4ecdc4', '#ff99c8'];

        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startAngle = Math.random() * Math.PI * 2;
            const highlight = {
                color,
                startTime: timeMs,
                startAngle,
                duration: this.sparkEffectDuration
            };
            this.sparkHighlights.left.push({ ...highlight });
            this.sparkHighlights.right.push({ ...highlight });
        }
    }

    // Clean up expired spark highlights
    update(timeMs) {
        this.sparkHighlights.left = this.sparkHighlights.left.filter(
            h => timeMs - h.startTime < h.duration
        );
        this.sparkHighlights.right = this.sparkHighlights.right.filter(
            h => timeMs - h.startTime < h.duration
        );
    }

    // Render highlights for both eyes
    render(ctx, headPos, rotation, scale, wobbleSign, wobbleAlpha, timeMs) {
        const leftEye = this.transformEyeToWorld(this.leftEyeImageSpace, headPos, rotation, scale);
        const rightEye = this.transformEyeToWorld(this.rightEyeImageSpace, headPos, rotation, scale);

        this.renderEyeHighlights(ctx, leftEye, rotation, wobbleSign, wobbleAlpha, this.sparkHighlights.left, timeMs);
        this.renderEyeHighlights(ctx, rightEye, rotation, wobbleSign, wobbleAlpha, this.sparkHighlights.right, timeMs);
    }

    renderEyeHighlights(ctx, eye, rotation, wobbleSign, wobbleAlpha, sparkHighlights, timeMs) {
        // Render wobble highlights
        if (wobbleAlpha > 0.05) {
            this.renderWobbleHighlight(ctx, eye, rotation, wobbleSign, wobbleAlpha);
        }

        // Render spark highlights
        for (const highlight of sparkHighlights) {
            this.renderSparkHighlight(ctx, eye, rotation, highlight, timeMs);
        }
    }

    renderWobbleHighlight(ctx, eye, rotation, wobbleSign, wobbleAlpha) {
        // Wobble highlight color (pink from the wobble effect)
        const baseColor = '255,159,243';

        // Position highlight on the back side, offset by wobble direction
        // In natural orientation (mouth down), back is top (negative y in image space)
        // After rotation, we need to find what "back" means in world space
        const backAngle = rotation - Math.PI / 2; // Back of head

        // Offset to the side based on wobble sign
        const sideOffset = wobbleSign * Math.PI * 0.3;
        const highlightAngle = backAngle + sideOffset;

        // Position on the edge of the eye (70% from center)
        const distance = eye.radius * 0.7;
        const hx = eye.x + Math.cos(highlightAngle) * distance;
        const hy = eye.y + Math.sin(highlightAngle) * distance;

        // Draw subtle highlight
        const alpha = wobbleAlpha * 0.6;
        const size = eye.radius * 0.3;

        const gradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, size);
        gradient.addColorStop(0, `rgba(${baseColor}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${baseColor}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hx, hy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderSparkHighlight(ctx, eye, rotation, highlight, timeMs) {
        const elapsed = timeMs - highlight.startTime;
        const progress = elapsed / highlight.duration;

        if (progress >= 1) return;

        // Fade out over time
        const alpha = (1 - progress) * 0.8;

        // Animate from front to back with 3D-like motion
        // Front of head in natural orientation is bottom (positive y in image space)
        const frontAngle = rotation + Math.PI / 2;

        // Use easing to simulate 3D motion around the sphere
        // Start near front, sweep around to back
        // Map progress 0->1 to angle sweep, using sine for 3D effect
        const angleOffset = highlight.startAngle;
        const sweepAmount = Math.PI * 1.5; // More than 180 degrees to show motion

        // Sine easing gives impression of moving faster at sides, slower at center
        const easedProgress = Math.sin(progress * Math.PI / 2); // Ease out sine
        const currentAngle = frontAngle + angleOffset + (easedProgress * sweepAmount);

        // Distance from center varies to simulate 3D (closer to center = "above" the eye)
        // Start at edge, move toward center, then back to edge
        const depthFactor = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
        const distance = eye.radius * (0.65 + depthFactor * 0.2);

        const hx = eye.x + Math.cos(currentAngle) * distance;
        const hy = eye.y + Math.sin(currentAngle) * distance;

        // Size varies with depth
        const size = eye.radius * (0.25 + depthFactor * 0.1);

        // Parse color and add alpha
        const colorMatch = highlight.color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        let colorRgba = highlight.color;
        if (colorMatch) {
            const r = parseInt(colorMatch[1], 16);
            const g = parseInt(colorMatch[2], 16);
            const b = parseInt(colorMatch[3], 16);
            colorRgba = `${r},${g},${b}`;
        } else {
            colorRgba = '255,255,255';
        }

        const gradient = ctx.createRadialGradient(hx, hy, 0, hx, hy, size);
        gradient.addColorStop(0, `rgba(${colorRgba}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${colorRgba}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hx, hy, size, 0, Math.PI * 2);
        ctx.fill();
    }
}