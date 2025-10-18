export class Profiler {
    constructor(maxSamples = 120) {
        this.maxSamples = maxSamples;
        this.samples = {};
        this.frameStart = 0;
        this.lastFrameTime = 0;
        this.ui = null;
        this.visible = true;
        this._createUI();
    }

    _createUI() {
        this.ui = document.createElement('div');
        this.ui.style.position = 'fixed';
        this.ui.style.right = '8px';
        this.ui.style.top = '8px';
        this.ui.style.padding = '8px 10px';
        this.ui.style.background = 'rgba(0,0,0,0.6)';
        this.ui.style.color = '#fff';
        this.ui.style.fontFamily = 'monospace';
        this.ui.style.fontSize = '12px';
        this.ui.style.lineHeight = '1.3';
        this.ui.style.borderRadius = '6px';
        this.ui.style.zIndex = '9999';
        this.ui.style.pointerEvents = 'none';
        this.ui.innerHTML = 'Profiler initializing...';
        document.body.appendChild(this.ui);

        this.ui.addEventListener('click', (e) => {
            e.stopPropagation();
            this.visible = !this.visible;
            this.ui.style.display = this.visible ? 'block' : 'none';
        });
    }

    startFrame() {
        this.frameStart = performance.now();
    }

    endFrame() {
        const now = performance.now();
        const frameMs = now - this.frameStart;
        this.lastFrameTime = frameMs;
        this._renderUI();
        // clear per-frame buckets for next frame
        for (const k in this.samples) {
            if (this.samples[k].length > this.maxSamples) {
                this.samples[k] = this.samples[k].slice(-this.maxSamples);
            }
        }
    }

    markStart(key) {
        if (!this.samples[key]) this.samples[key] = { stack: [], times: [] };
        this.samples[key].stack.push(performance.now());
    }

    markEnd(key) {
        const now = performance.now();
        const bucket = this.samples[key];
        if (!bucket || bucket.stack.length === 0) return;
        const start = bucket.stack.pop();
        const delta = now - start;
        bucket.times.push(delta);
        if (bucket.times.length > this.maxSamples) bucket.times.shift();
    }

    // convenience: measure async or sync function
    measureSync(key, fn) {
        this.markStart(key);
        try { return fn(); } finally { this.markEnd(key); }
    }

    _avg(times) {
        if (!times || times.length === 0) return 0;
        const sum = times.reduce((a,b)=>a+b,0);
        return sum / times.length;
    }

    _renderUI() {
        if (!this.ui) return;
        const entries = Object.keys(this.samples).map(k => {
            const avg = this._avg(this.samples[k].times);
            const last = this.samples[k].times.length ? this.samples[k].times[this.samples[k].times.length-1] : 0;
            return { k, avg, last };
        }).sort((a,b)=>b.avg - a.avg);

        let html = `<div><strong>Frame:</strong> ${this.lastFrameTime.toFixed(2)} ms</div>`;
        html += `<div style=\"margin-top:6px\">`;
        for (let i = 0; i < Math.min(entries.length, 10); i++) {
            const e = entries[i];
            html += `<div>${e.k}: avg ${e.avg.toFixed(2)} ms / last ${e.last.toFixed(2)} ms</div>`;
        }
        if (entries.length === 0) html += '<div>No samples yet</div>';
        html += `</div><div style=\"opacity:0.7;margin-top:6px;font-size:11px\">Click to toggle</div>`;
        this.ui.innerHTML = html;
    }
}