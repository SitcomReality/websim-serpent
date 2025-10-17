import { Vector2D } from '../utils/Vector2D.js';

/**
 * Represents a single specular highlight on an eyeball.
 * Handles positioning and rendering of the highlight.
 */
export class EyeSpecularHighlight {
    constructor(eyeCenter, eyeRadius) {
        this.eyeCenter = eyeCenter;
        this.eyeRadius = eyeRadius;
        
        // Position on the eyeball surface: 0 = center, 1 = edge
        this.distance = 0;
        
        // Angle around the eyeball (in radians)
        this.azimuth = 0;
        
        // Color of the highlight
        this.color = 'rgba(255, 255, 255, 0)';
        
        // Size as a fraction of eye radius
        this.sizeRatio = 0;
    }

    /**
     * Position the highlight at a specific point on the eyeball surface.
     * @param {number} azimuth - Angle around the eye (0 = front/bottom, PI = back/top)
     * @param {number} distance - Distance from center (0 = dead center, 1 = edge)
     * @param {string} color - CSS color string
     * @param {number} size - Size ratio relative to eye radius
     */
    setPosition(azimuth, distance, color, size) {
        this.azimuth = azimuth;
        this.distance = Math.max(0, Math.min(1, distance));
        this.color = color;
        this.sizeRatio = size;
    }

    /**
     * Render the highlight on the canvas.
     * Note: assumes canvas context is already in the correct coordinate system (translated and rotated to the head).
     */
    render(ctx) {
        if (this.sizeRatio <= 0.01) return;
        
        // Calculate position on eyeball surface
        // 0 azimuth is at front (positive Y in local head space), PI is at back (negative Y)
        // dx = R * sin(A), dy = R * cos(A)
        const dx = Math.sin(this.azimuth) * this.distance;
        const dy = Math.cos(this.azimuth) * this.distance;
        
        const x = this.eyeCenter.x + dx * this.eyeRadius;
        const y = this.eyeCenter.y + dy * this.eyeRadius;
        
        // Draw highlight
        const highlightRadius = this.eyeRadius * this.sizeRatio * 0.4;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, highlightRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}