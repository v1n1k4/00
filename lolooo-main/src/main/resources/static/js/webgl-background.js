/**
 * CLAEX MONOCHROMATIC AMBIENT CANVAS
 * Subtle atmospheric particles matching the single active accent tone (zero color mixing).
 */

(function () {
    'use strict';

    class AmbientCanvas {
        constructor() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'webgl-kinetic-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '0';
            this.canvas.style.opacity = '0.45';
            document.body.prepend(this.canvas);

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.particleCount = 36;
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.isRunning = true;

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
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
            this.ctx.scale(this.dpr, this.dpr);
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.25,
                    vy: (Math.random() - 0.5) * 0.25 - 0.08,
                    size: Math.random() * 1.4 + 0.6,
                    alpha: Math.random() * 0.35 + 0.1
                });
            }
        }

        animate() {
            if (!this.isRunning) return;
            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                this.ctx.fill();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new AmbientCanvas());
    } else {
        new AmbientCanvas();
    }
})();
