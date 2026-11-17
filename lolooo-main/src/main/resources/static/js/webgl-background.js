/**
 * CLAEX × LANDO NORRIS (LN04) TOPOGRAPHIC TELEMETRY CANVAS
 * Inspired by https://landonorris.com/ (Awwwards SOTY 2025):
 * - Organic morphing topographic contour lines (LN4 helmet blob aesthetic)
 * - Precision F1 telemetry grid crosshairs (+)
 * - Velocity-reactive particles dynamically colored by the active Livery (--neon-lime)
 */

(function () {
    'use strict';

    class LandoTopographicCanvas {
        constructor() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            this.canvas = document.createElement('canvas');
            this.canvas.id = 'webgl-kinetic-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '0';
            this.canvas.style.opacity = '0.58';
            document.body.prepend(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = 34;
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.isRunning = true;
            this.time = 0;
            this.mouseX = 0.5;
            this.mouseY = 0.5;
            this.scrollBoost = 0;
            this.lastScrollY = window.scrollY;

            this.init();
        }

        getAccentColor() {
            const raw = getComputedStyle(document.documentElement).getPropertyValue('--neon-lime').trim();
            return raw || '#D2FF00';
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX / Math.max(1, this.width);
                this.mouseY = e.clientY / Math.max(1, this.height);
            }, { passive: true });

            window.addEventListener('scroll', () => {
                const dy = Math.abs(window.scrollY - this.lastScrollY);
                this.lastScrollY = window.scrollY;
                this.scrollBoost = Math.min(3.5, this.scrollBoost + dy * 0.015);
            }, { passive: true });

            document.addEventListener('visibilitychange', () => {
                this.isRunning = !document.hidden;
                if (this.isRunning) this.animate();
            });

            this.createParticles();
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.32,
                    vy: (Math.random() - 0.5) * 0.32 - 0.12,
                    size: Math.random() * 1.6 + 0.6,
                    alpha: Math.random() * 0.4 + 0.12,
                    isAccent: i % 3 === 0
                });
            }
        }

        drawTopographicWaves(accent) {
            const ctx = this.ctx;
            ctx.save();
            ctx.lineWidth = 1;

            const waveCount = 5;
            for (let w = 0; w < waveCount; w++) {
                ctx.beginPath();
                ctx.strokeStyle = w % 2 === 0 ? accent : 'rgba(244, 244, 240, 0.22)';
                ctx.globalAlpha = w % 2 === 0 ? 0.085 : 0.04;

                const baseY = (this.height / (waveCount + 1)) * (w + 1);
                for (let x = 0; x <= this.width; x += 28) {
                    const nx = x * 0.0022;
                    const offset =
                        Math.sin(nx + this.time * 0.9 + w * 1.1) * 38 +
                        Math.cos(nx * 1.8 - this.time * 0.6 + this.mouseX * 2.0) * 24;
                    const y = baseY + offset;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Precision F1 Pit-Wall Crosshairs (+)
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = accent;
            const stepX = Math.max(240, Math.floor(this.width / 5));
            const stepY = Math.max(220, Math.floor(this.height / 4));
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
        }

        animate() {
            if (!this.isRunning) return;
            this.time += 0.008 + this.scrollBoost * 0.004;
            this.scrollBoost *= 0.92;

            this.ctx.clearRect(0, 0, this.width, this.height);
            const accent = this.getAccentColor();

            this.drawTopographicWaves(accent);

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.vx * (1 + this.scrollBoost * 0.8);
                p.y += p.vy * (1 + this.scrollBoost * 0.8);

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.isAccent ? accent : '#F4F4F0';
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new LandoTopographicCanvas());
    } else {
        new LandoTopographicCanvas();
    }
})();
