export function snakeButtonSVG(gradientId = 'snakeGradient') {
    return `
    <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
            <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8e44ad;stop-opacity:1" />
            </linearGradient>
        </defs>
        <!-- Snake body and tail as one continuous path -->
        <path class="snake-body" d="M 190, 30 Q 175, 10, 150, 10 L 50, 10 Q 25, 10, 25, 30 Q 25, 50, 50, 50 L 150, 50 Q 175, 50, 190, 30 Z" fill="url(#${gradientId})" />
        <!-- Forked tongue: stem (horizontal) then two angled prongs -->
        <path class="snake-tongue" d="M 30,30 L 14,30 L 8,24 M 14,30 L 8,36" stroke="#ff7675" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </svg>
    `;
}