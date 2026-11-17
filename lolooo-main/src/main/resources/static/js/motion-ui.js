/**
 * CLAEX MOTION UI & MOTION PRIMITIVES ENGINE
 * Powered by:
 * - Motion (https://github.com/motiondivision/motion — window.Motion)
 * - Motion UI Theme Physics (https://motion.dev/magazine/introducing-motion-ui)
 * - Motion Primitives Patterns (https://github.com/ibelick/motion-primitives)
 *   - MotionTheme presets: snap, ui, gentle, lively + reducedMotion: 'calm'
 *   - TextReveal, TextScramble, SlidingNumber, InView, Magnetic, ScrollProgress
 */
(function () {
    'use strict';

    const prefersReducedMotion = () =>
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getM = () => (typeof window.Motion !== 'undefined' ? window.Motion : null);

    // Motion UI Physics Tokens (calibrated from motion.dev/magazine/introducing-motion-ui)
    const MotionTheme = {
        snap:   { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
        ui:     { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        gentle: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
        lively: { duration: 0.50, ease: [0.34, 1.45, 0.64, 1] },
        reducedMotion: 'calm'
    };

    function safeAnimate(target, keyframes, opts) {
        if (!target) return null;
        if (prefersReducedMotion()) {
            const els = target instanceof Element ? [target] : Array.from(target || []);
            els.forEach(el => {
                if (keyframes.opacity !== undefined) el.style.opacity = String(Array.isArray(keyframes.opacity) ? keyframes.opacity[keyframes.opacity.length - 1] : keyframes.opacity);
                el.style.transform = 'none';
            });
            return null;
        }
        const M = getM();
        if (M && typeof M.animate === 'function') {
            return M.animate(target, keyframes, opts || MotionTheme.ui);
        }
        const els = target instanceof Element ? [target] : Array.from(target || []);
        els.forEach(el => {
            if (keyframes.opacity !== undefined) el.style.opacity = String(Array.isArray(keyframes.opacity) ? keyframes.opacity[keyframes.opacity.length - 1] : keyframes.opacity);
        });
        return null;
    }

    // 1. motion-primitives: TextScramble
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-_';
    function textScramble(el, targetText, durationMs = 420) {
        if (!el) return;
        const finalStr = targetText != null ? String(targetText) : (el.dataset.scrambleText || el.textContent);
        if (prefersReducedMotion()) {
            el.textContent = finalStr;
            return;
        }
        const start = performance.now();
        const len = finalStr.length;

        function tick(now) {
            const p = Math.min(1, (now - start) / durationMs);
            const revealed = Math.floor(p * len);
            let out = '';
            for (let i = 0; i < len; i++) {
                const ch = finalStr[i];
                if (i < revealed || ch === ' ') {
                    out += ch;
                } else {
                    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
            }
            el.textContent = out;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = finalStr;
        }
        requestAnimationFrame(tick);
    }

    // 2. motion-primitives: SlidingNumber (smooth numerical roll)
    function slidingNumber(el, targetNum, suffix = '', durationMs = 680) {
        if (!el) return;
        const end = Number(targetNum) || 0;
        const startVal = parseFloat(String(el.dataset.currentVal || el.textContent).replace(/[^\d.-]/g, '')) || 0;
        el.dataset.currentVal = String(end);

        if (prefersReducedMotion()) {
            el.textContent = `${end}${suffix}`;
            return;
        }
        const t0 = performance.now();
        function tick(now) {
            const p = Math.min(1, (now - t0) / durationMs);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = Math.round(startVal + (end - startVal) * eased);
            el.textContent = `${val}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = `${end}${suffix}`;
        }
        requestAnimationFrame(tick);
    }

    // 3. motion-primitives: TextReveal & Staggered Hero
    function initHeroMotion() {
        const heroEls = document.querySelectorAll('.edge-hero-section .opticore-pretitle, .edge-hero-section .edge-hero-title, .edge-hero-section .edge-hero-subtitle, .edge-hero-section .edge-hero-ctas, .ln4-hero-rail');
        if (!heroEls.length) return;

        const M = getM();
        if (M && typeof M.animate === 'function' && typeof M.stagger === 'function' && !prefersReducedMotion()) {
            M.animate(heroEls, { opacity: [0, 1], y: [18, 0] }, {
                duration: MotionTheme.gentle.duration,
                ease: MotionTheme.gentle.ease,
                delay: M.stagger(0.06)
            });
        }

        document.querySelectorAll('[data-motion-scramble]').forEach(el => {
            el.dataset.scrambleText = el.textContent;
            el.addEventListener('mouseenter', () => textScramble(el, el.dataset.scrambleText, 320));
        });
    }

    // 4. motion-primitives: InView Reveal for Gallery, Simulator, Team, Subpage Cards
    function initInViewReveals() {
        const selectors = [
            '.lando-showcase-card',
            '.team-dossier',
            '.ln4-quote-section',
            '#simulador-grade .spotlight-card',
            '.claex-telemetry-kpi-card',
            '.caixa_sala',
            '.cta-inner'
        ];
        const items = document.querySelectorAll(selectors.join(', '));
        if (!items.length || prefersReducedMotion()) return;

        const M = getM();
        if (M && typeof M.inView === 'function') {
            items.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                const alreadyNearViewport = rect.top < window.innerHeight * 1.15;
                if (alreadyNearViewport) {
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                    return;
                }
                el.style.opacity = '0.08';
                el.style.transform = 'translateY(14px)';
                M.inView(el, (entry) => {
                    const node = (entry && entry.target) ? entry.target : el;
                    safeAnimate(node, { opacity: [0.08, 1], y: [14, 0] }, {
                        duration: MotionTheme.gentle.duration,
                        ease: MotionTheme.gentle.ease,
                        delay: (idx % 3) * 0.05
                    });
                }, { amount: 0.05 });
            });
        }
    }

    // 5. Scroll-Connected Progress Bar + CLAEX Ampulheta Docking via Motion.scroll
    function initScrollMechanics() {
        const M = getM();
        const bar = document.getElementById('lando-scroll-progress');

        const updateProgressFallback = () => {
            if (!bar) return;
            const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const p = Math.min(1, Math.max(0, window.scrollY / max));
            bar.style.transform = `scaleX(${p})`;
        };

        if (M && typeof M.scroll === 'function' && bar && !prefersReducedMotion()) {
            M.scroll((progress, _info) => {
                bar.style.transform = `scaleX(${progress})`;
            });
        } else {
            window.addEventListener('scroll', updateProgressFallback, { passive: true });
        }

        // CLAEX Ampulheta Scroll Docking (#logo-ampulheta -> #hub-ampulheta-icon)
        const heroTrigger = document.getElementById('capa_index');
        const claeEl = document.getElementById('logo-clae');
        const flying = document.getElementById('logo-ampulheta');
        const hubTarget = document.getElementById('hub-center-target');
        const hubIcon = document.getElementById('hub-ampulheta-icon');
        const hubGhost = document.getElementById('hub-socket-ghost');

        if (!heroTrigger || !claeEl || !flying || !hubTarget || !hubIcon || prefersReducedMotion()) return;

        let metrics = null;
        function computeMetrics() {
            const prevT = flying.style.transform;
            flying.style.transform = 'none';
            const startRect = flying.getBoundingClientRect();
            const endRect = hubIcon.getBoundingClientRect();
            flying.style.transform = prevT;

            if (!startRect.width || !endRect.width) return null;
            return {
                dx: (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2),
                dy: (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2),
                scale: endRect.width / startRect.width
            };
        }

        hubIcon.style.opacity = '0';
        if (hubGhost) hubGhost.style.opacity = '1';

        function applyDockProgress(p) {
            if (!metrics) metrics = computeMetrics();
            if (!metrics) return;

            const clamped = Math.min(1, Math.max(0, p));
            const fadeP = Math.min(1, clamped * 1.45);
            claeEl.style.opacity = String(Math.max(0.22, 1 - fadeP * 0.78));
            claeEl.style.transform = `translate3d(${fadeP * 8}px, 0, 0)`;

            const ease = clamped * (2 - clamped);
            const curX = metrics.dx * ease;
            const curY = metrics.dy * ease;
            const curS = 1 + (metrics.scale - 1) * ease;

            flying.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0) scale(${curS.toFixed(3)})`;

            if (clamped >= 0.94) {
                hubTarget.classList.add('connected');
                hubIcon.style.opacity = '1';
                if (hubGhost) hubGhost.style.opacity = '0';
                flying.style.opacity = '0';
            } else {
                hubTarget.classList.remove('connected');
                hubIcon.style.opacity = '0';
                if (hubGhost) hubGhost.style.opacity = '1';
                flying.style.opacity = '1';
            }
        }

        window.addEventListener('resize', () => { metrics = null; }, { passive: true });

        if (M && typeof M.scroll === 'function') {
            M.scroll((progress, _info) => {
                applyDockProgress(progress);
            }, {
                target: heroTrigger,
                offset: ['start start', 'center start']
            });
        } else {
            window.addEventListener('scroll', () => {
                const p = Math.min(1, Math.max(0, window.scrollY / 340));
                applyDockProgress(p);
            }, { passive: true });
        }
    }

    // 6. Restrained Magnetic Tactile Buttons (MotionTheme.snap)
    function initMagneticButtons() {
        if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;
        const buttons = document.querySelectorAll('.btn-neon, .btn-ghost');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const dx = (e.clientX - rect.left - rect.width / 2) * 0.14;
                const dy = (e.clientY - rect.top - rect.height / 2) * 0.14;
                safeAnimate(btn, { x: dx, y: dy }, { duration: 0.2, ease: [0.16, 1, 0.3, 1] });
            });
            btn.addEventListener('mouseleave', () => {
                safeAnimate(btn, { x: 0, y: 0 }, MotionTheme.snap);
            });
        });
    }

    // 7. Restrained Interactive Tilt on Hall of Fame 3D Object SVGs
    function initGalleryInteractiveObjects() {
        if (!window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;
        document.querySelectorAll('.lando-showcase-card').forEach(card => {
            const obj = card.querySelector('.lando-3d-object');
            if (!obj) return;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const rx = (e.clientX - rect.left) / rect.width - 0.5;
                const ry = (e.clientY - rect.top) / rect.height - 0.5;
                safeAnimate(obj, { x: rx * 14, y: ry * 10, rotate: rx * 4, scale: 1.04 }, MotionTheme.snap);
            });
            card.addEventListener('mouseleave', () => {
                safeAnimate(obj, { x: 0, y: 0, rotate: 0, scale: 1 }, MotionTheme.lively);
            });
        });
    }

    function init() {
        initHeroMotion();
        initInViewReveals();
        initScrollMechanics();
        initMagneticButtons();
        initGalleryInteractiveObjects();
    }

    window.MotionUI = {
        theme: MotionTheme,
        animate: safeAnimate,
        textScramble,
        slidingNumber,
        refreshInView: initInViewReveals
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
