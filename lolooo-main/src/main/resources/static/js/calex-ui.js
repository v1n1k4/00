/* Projeto Calex — subtle UI motion & tabs (front-end only).
   Uses IntersectionObserver + CSS transitions; Motion (window.Motion) optional for the calendar stagger. */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Accessible tabs (roles) */
    var tablist = document.querySelector('.cx-tabs');
    if (tablist) {
        var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
        var select = function (tab, focus) {
            tabs.forEach(function (t) {
                var on = t === tab;
                t.setAttribute('aria-selected', on);
                t.tabIndex = on ? 0 : -1;
                var panel = document.getElementById(t.getAttribute('aria-controls'));
                if (!panel) return;
                panel.hidden = !on;
                if (on) {
                    if (!reduce && panel.animate) panel.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
                    animateBars(panel);
                }
            });
            if (focus) tab.focus();
        };
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function () { select(t); });
            t.addEventListener('keydown', function (e) {
                var n = null;
                if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
                if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
                if (n) { e.preventDefault(); select(n, true); }
            });
        });
    }

    function animateBars(root) {
        if (reduce) return;
        root.querySelectorAll('.cx-bar i').forEach(function (b) {
            var w = b.style.width || getComputedStyle(b).width; b.style.width = '0';
            requestAnimationFrame(function () { requestAnimationFrame(function () { b.style.width = w; }); });
        });
    }

    /* Scroll reveals */
    var targets = document.querySelectorAll('.cx-feature, .cx-step, .cx-tabpanel, .cx-person, .cx-section h2, .cx-final h2, .glass-card, .stat-card, .kpi-card, .room-card, .sala-card');
    targets.forEach(function (el, i) { el.classList.add('cx-reveal'); el.style.setProperty('--d', ((i % 3) * 0.08) + 's'); });
    if (!('IntersectionObserver' in window) || reduce) { targets.forEach(function (el) { el.classList.add('is-in'); }); }
    else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(function (el) { io.observe(el); });
    }

    /* Hero calendar: staggered entrance + animated metric */
    var cal = document.querySelector('.cx-hero .cx-grid');
    if (cal && !reduce) {
        cal.querySelectorAll('.cx-ev, .cx-slot').forEach(function (el, i) { el.style.setProperty('--i', i); el.classList.add('cx-pop'); });
        animateBars(document.querySelector('.cx-side') || document);
        var m = document.querySelector('.cx-hero .cx-metric');
        if (m) {
            var t0 = performance.now(), to = parseInt(m.textContent, 10) || 0;
            (function tick(t) { var p = Math.min(1, (t - t0) / 1100); m.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + '%'; if (p < 1) requestAnimationFrame(tick); })(t0);
        }
    }
})();
