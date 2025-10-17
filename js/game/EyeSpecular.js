export class EyeSpecular {
    // Eye geometry (relative to sprite center after rotation)
    // For a 125x50 head sprite the eyeballs are roughly at (25,17) and (100,17).
    // Converted to sprite-center coordinates (center at 62.5,25) -> (-37.5,-8) and (37.5,-8)
    static LEFT_EYE = { x: -37.5, y: -8 };
    static RIGHT_EYE = { x: 37.5, y: -8 };
    static EYE_RADIUS = 15;

    static getSparkHighlights(sparks, headWorldPos, headWorldAngle) {
        // Calculate faux reflections from spark particles
        if (!sparks || sparks.length === 0) return { left: null, right: null };

        // Find dominant spark colors and directions nearby
        let colorSum = { r: 0, g: 0, b: 0 };
        let posSum = { x: 0, y: 0 };
        let count = 0;

        sparks.forEach(spark => {
            const dx = spark.pos.x - headWorldPos.x;
            const dy = spark.pos.y - headWorldPos.y;
            const distSq = dx * dx + dy * dy;

            // Only consider sparks reasonably close to head
            if (distSq < (150 * 150)) {
                count++;
                const color = this.parseColor(spark.color);
                colorSum.r += color.r;
                colorSum.g += color.g;
                colorSum.b += color.b;
                posSum.x += dx;
                posSum.y += dy;
            }
        });

        if (count === 0) return { left: null, right: null };

        // Average color and direction
        const avgColor = {
            r: Math.round(colorSum.r / count),
            g: Math.round(colorSum.g / count),
            b: Math.round(colorSum.b / count)
        };
        const avgDir = {
            x: posSum.x / count,
            y: posSum.y / count
        };
        const len = Math.sqrt(avgDir.x * avgDir.x + avgDir.y * avgDir.y);
        if (len > 0) {
            avgDir.x /= len;
            avgDir.y /= len;
        }

        const intensity = Math.min(1, count / 8);
        const colorStr = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;

        // Transform direction to eye-local space (accounting for head rotation)
        const cos = Math.cos(-headWorldAngle);
        const sin = Math.sin(-headWorldAngle);
        const localDir = {
            x: avgDir.x * cos - avgDir.y * sin,
            y: avgDir.x * sin + avgDir.y * cos
        };

        // Place highlights with bias towards front of eye (positive Y in sprite space)
        // scale highlight offset relative to the eyeball radius so it follows sprite scaling
        const highlightOffset = this.EYE_RADIUS * 0.8; // distance from eye center
        const frontBias = 5; // slight bias towards front

        const highlight = {
            x: localDir.x * highlightOffset * 0.7,
            y: localDir.y * highlightOffset * 0.7 + frontBias,
            radius: 3 + intensity * 2,
            color: colorStr,
            alpha: intensity * 0.8
        };

        return { left: highlight, right: highlight };
    }

    static getWobbleHighlights(wobbleAmount, wobbleSign, wobbleAmplitude) {
        // Create subtle specular highlights from wobble effect
        if (Math.abs(wobbleAmount) < 0.01) return { left: null, right: null };

        // Normalize wobble to 0-1 range
        const intensity = Math.min(1, Math.abs(wobbleAmount) / wobbleAmplitude) * 0.6;
        const side = Math.sign(wobbleAmount);

        if (Math.abs(side) < 0.1) return { left: null, right: null }; // No highlight when straight

        // Pink wobble color from the rendering code
        const baseColor = `255,159,243`;
        const colorStr = `rgb(${baseColor})`;

        // Place highlight on the side the snake is wobbling towards
        // Towards the back of the eye (negative Y in sprite space)
        const highlight = {
            x: side * 8, // side of eye
            y: -10, // back of eye
            radius: 2 + intensity * 1.5,
            color: colorStr,
            alpha: intensity * 0.6
        };

        return { left: highlight, right: highlight };
    }

    static renderEyeHighlights(ctx, eyeWorldPos, eyeRadius, highlights) {
        if (!highlights) return;

        ctx.globalAlpha = highlights.alpha;
        ctx.fillStyle = highlights.color;
        ctx.beginPath();
        ctx.arc(
            eyeWorldPos.x + highlights.x,
            eyeWorldPos.y + highlights.y,
            highlights.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    static parseColor(colorStr) {
        // Quick color parsing - creates a canvas to extract RGB
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return { r: data[0], g: data[1], b: data[2] };
    }
}