/**
 * CLAEX ARCHITECTURAL TOPOGRAPHIC CANVAS (ZERO-NEON EDITION)
 * Minimalist CAD wireframe contour curves and precision crosshairs
 * adapting cleanly between Editorial Light (#F5F5F0) and Carbon Dark (#111112).
 */
(function () {
    'use strict';

    class LandoTopographicCanvas {
        constructor() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'webgl-kinetic-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.inset = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '0';
            document.body.prepend(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.isRunning = true;
            this.time = 0;
            this.mouseX = 0.5;
            this.scrollBoost = 0;
            this.lastScrollY = window.scrollY;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize(), { passive: true });
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX / Math.max(1, this.width);
            }, { passive: true });

            window.addEventListener('scroll', () => {
                const dy = Math.abs(window.scrollY - this.lastScrollY);
                this.lastScrollY = window.scrollY;
                this.scrollBoost = Math.min(2.2, this.scrollBoost + dy * 0.01);
            }, { passive: true });

            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
                if (this.isRunning) this.animate();
            });

            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }

        animate() {
            if (!this.isRunning) return;
            this.time += 0.005 + this.scrollBoost * 0.002;
            this.scrollBoost *= 0.92;

            const isCarbon = document.documentElement.getAttribute('data-surface') === 'carbon';
            const lineStroke = isCarbon ? 'rgba(245, 245, 240, 0.055)' : 'rgba(17, 17, 18, 0.055)';
            const crosshairStroke = isCarbon ? 'rgba(245, 245, 240, 0.11)' : 'rgba(17, 17, 18, 0.10)';

            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = lineStroke;

            const waveCount = 4;
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                const baseY = (this.height / (waveCount + 1)) * (w + 1);
                for (let x = 0; x <= this.width; x += 36) {
                    const nx = x * 0.0018;
                    const offset =
                        Math.sin(nx + this.time * 0.8 + w * 1.3) * 32 +
                        Math.cos(nx * 1.5 - this.time * 0.5 + this.mouseX * 1.6) * 20;
                    const y = baseY + offset;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Crisp architectural drafting crosshairs (+)
            ctx.strokeStyle = crosshairStroke;
            const stepX = Math.max(280, Math.floor(this.width / 5));
            const stepY = Math.max(240, Math.floor(this.height / 4));
            for (let gx = stepX; gx < this.width; gx += stepX) {
                for (let gy = stepY; gy < this.height; gy += stepY) {
                    ctx.beginPath();
                    ctx.moveTo(gx - 4, gy);
                    ctx.lineTo(gx + 4, gy);
                    ctx.moveTo(gx, gy - 4);
                    ctx.lineTo(gx, gy + 4);
                    ctx.stroke();
                }
            }

            ctx.restore();
            requestAnimationFrame(() => this.animate());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new LandoTopographicCanvas());
    } else {
        new LandoTopographicCanvas();
    }
})();
