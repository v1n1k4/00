/**
 * CLAEX SMOOTH ANCHORS & MOTION COMPATIBILITY LAYER
 * Motion physics are orchestrated by js/motion-ui.js (Motion 11 + Motion UI).
 */
(function () {
    'use strict';

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 84;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmoothAnchors);
    } else {
        initSmoothAnchors();
    }
})();
