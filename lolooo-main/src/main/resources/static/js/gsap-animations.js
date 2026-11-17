/**
 * CLAEX v9 — SCROLL-CONNECTED AMPULHETA & OPTICORE MOTION ENGINE
 * - Giant CLAEX Logo in Hero: as user scrolls down, 'C L A E' collapses/fades
 *   leaving ONLY the Ampulheta ('X'), which descends and docks into the Central Circuit Hub!
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
                    const top = target.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    // ── 1. ANIMAÇÃO DE ENTRADA DO HERO ────────────────────────────────────────
    function initHeroAnimation() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        tl.fromTo('.opticore-pretitle',
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4 }
        )
        .fromTo('#hero-logo-stage',
            { opacity: 0 },
            { opacity: 1, duration: 0.55 },
            '-=0.2'
        )
        .fromTo('.edge-hero-title, .edge-hero-subtitle, .edge-hero-ctas',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.45 },
            '-=0.35'
        )
        .fromTo('.edge-hub-stage',
            { opacity: 0 },
            { opacity: 1, duration: 0.55 },
            '-=0.3'
        );
    }

    // ── 2. ANIMAÇÃO DE SCROLL: LOGO CLAEX -> AMPULHETA DESCE E ENCAIXA NO CENTRO DO CIRCUITO ─
    function initClaexAmpulhetaScroll() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const claeEl = document.getElementById('logo-clae');
        const flyingAmpulheta = document.getElementById('logo-ampulheta');
        const hubTarget = document.getElementById('hub-center-target');
        const hubIcon = document.getElementById('hub-ampulheta-icon');

        if (!claeEl || !flyingAmpulheta || !hubTarget || !hubIcon) return;

        // Mede a distância exata em pixels entre a Ampulheta no título CLAEX
        // e o centro do nó #hub-center-target no diagrama de circuitos
        function getDockingMetrics() {
            const prevTransform = flyingAmpulheta.style.transform;
            flyingAmpulheta.style.transform = 'none';

            const startRect = flyingAmpulheta.getBoundingClientRect();
            const endRect = hubIcon.getBoundingClientRect();

            flyingAmpulheta.style.transform = prevTransform;

            const startCx = startRect.left + startRect.width / 2;
            const startCy = startRect.top + startRect.height / 2;
            const endCx = endRect.left + endRect.width / 2;
            const endCy = endRect.top + endRect.height / 2;

            return {
                dx: endCx - startCx,
                dy: endCy - startCy,
                scale: endRect.width / (startRect.width || 1)
            };
        }

        // Enquanto está no topo da página, o ícone fixo dentro do hub fica oculto
        // esperando a Ampulheta do título CLAEX descer e conectar no centro
        gsap.set(hubIcon, { opacity: 0 });

        function syncHubState(self) {
            const p = self.progress;

            if (p >= 0.96) {
                hubTarget.classList.add('connected');
                hubIcon.style.opacity = '1';
                flyingAmpulheta.style.opacity = '0';
            } else {
                hubTarget.classList.remove('connected');
                hubIcon.style.opacity = '0';
                flyingAmpulheta.style.opacity = '1';
            }
        }

        const scrollTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#capa_index',
                start: 'top top',
                end: '+=460',
                scrub: 1.35,
                invalidateOnRefresh: true,
                onUpdate: syncHubState,
                onRefresh: syncHubState
            }
        });

        // 1) As letras "C L A E" recolhem e somem de forma gradual conforme o scroll desce
        scrollTl.to(claeEl, {
            opacity: 0,
            x: 42,
            scale: 0.85,
            duration: 0.7,
            ease: 'power1.inOut'
        }, 0);

        // 2) A Ampulheta ('X') do título CLAEX desce mais devagar e suave (mantendo a cor branca) até o centro do Hub
        scrollTl.to(flyingAmpulheta, {
            x: () => getDockingMetrics().dx,
            y: () => getDockingMetrics().dy,
            scale: () => getDockingMetrics().scale,
            duration: 1,
            ease: 'power1.inOut'
        }, 0);

        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
        });
    }

    // ── 3. BARRA DE TELEMETRIA DE SCROLL NO TOPO (ESTILO LANDO NORRIS) ────────
    function initScrollProgressBar() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        const bar = document.getElementById('lando-scroll-progress');
        if (!bar) return;

        gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.15
            }
        });
    }

    // ── 4. VITRINE LANDO NORRIS: PARALLAX DE COLUNAS DESLOCADAS + OBJETO 3D ───
    function initLandoShowcase() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Entrada em cascata dos cards estilo Lando Norris
        const showcaseCards = gsap.utils.toArray('.lando-showcase-card');
        if (showcaseCards.length) {
            gsap.fromTo(showcaseCards,
                { y: 55, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.75,
                    stagger: 0.12,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: '.lando-showcase-grid',
                        start: 'top 86%',
                        once: true
                    }
                }
            );

            // Parallax diferencial entre colunas ímpares e a coluna central (efeito capacetes Lando Norris)
            const oddCols = document.querySelectorAll('.lando-showcase-card[data-lando-col="odd"]');
            const evenCol = document.querySelectorAll('.lando-showcase-card[data-lando-col="even"]');

            if (oddCols.length) {
                gsap.fromTo(oddCols,
                    { yPercent: 4 },
                    {
                        yPercent: -6,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#para-quem',
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.5
                        }
                    }
                );
            }

            if (evenCol.length) {
                gsap.fromTo(evenCol,
                    { yPercent: -5 },
                    {
                        yPercent: 7,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#para-quem',
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 0.5
                        }
                    }
                );
            }
        }

        // Interação 3D da peça flutuante dentro de cada card (segue o mouse como os capacetes do Lando)
        showcaseCards.forEach(card => {
            const obj = card.querySelector('.lando-3d-object');
            const glow = card.querySelector('.lando-3d-glow');
            if (!obj) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width - 0.5;
                const relY = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(obj, {
                    x: relX * 22,
                    y: relY * 16 - 4,
                    rotationY: relX * 24,
                    rotationX: -relY * 18,
                    scale: 1.09,
                    duration: 0.35,
                    ease: 'power2.out'
                });

                if (glow) {
                    gsap.to(glow, {
                        x: relX * 34,
                        y: relY * 24,
                        scale: 1.22,
                        opacity: 0.9,
                        duration: 0.35,
                        ease: 'power2.out'
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(obj, {
                    x: 0,
                    y: 0,
                    rotationY: 0,
                    rotationX: 0,
                    scale: 1,
                    duration: 0.65,
                    ease: 'elastic.out(1, 0.5)'
                });

                if (glow) {
                    gsap.to(glow, {
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 0.45,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }

    // ── 5. REVELAÇÃO CINÉTICA DO SITE INTEIRO (ESTILO LANDO NORRIS) ───────────
    function initScrollReveal() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // Marcas d'água gigantes deslizam horizontalmente com o scroll (scrub)
        gsap.utils.toArray('.opticore-watermark').forEach((wm, idx) => {
            const dir = idx % 2 === 0 ? 1 : -1;
            gsap.fromTo(wm,
                { xPercent: -8 * dir },
                {
                    xPercent: 8 * dir,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wm.parentElement || wm,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.6
                    }
                }
            );
        });

        // Títulos de seção com revelação de cortina (clip-path + subida rápida)
        gsap.utils.toArray('.section-header').forEach(header => {
            const tag = header.querySelector('.telemetry-tag');
            const title = header.querySelector('.section-title');
            const sub = header.querySelector('.section-subtitle');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 86%',
                    once: true
                }
            });

            if (tag) {
                tl.fromTo(tag,
                    { x: -24, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
                );
            }
            if (title) {
                tl.fromTo(title,
                    { y: 36, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
                    { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.65, ease: 'power4.out' },
                    '-=0.25'
                );
            }
            if (sub) {
                tl.fromTo(sub,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
                    '-=0.4'
                );
            }
        });

        // Cards do Bento Grid e Equipe em cascata (stagger)
        const bentoCards = gsap.utils.toArray('#simulador-grade .spotlight-card');
        if (bentoCards.length) {
            gsap.fromTo(bentoCards,
                { y: 44, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: 0.14,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: '#simulador-grade',
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        }

        const teamCards = gsap.utils.toArray('.team-dossier');
        if (teamCards.length) {
            gsap.fromTo(teamCards,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.75,
                    stagger: 0.14,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: '.team-grid',
                        start: 'top 86%',
                        once: true
                    }
                }
            );
        }

        // CTA Final com revelação estilo Lando
        const ctaInner = document.querySelector('.cta-inner');
        if (ctaInner) {
            gsap.fromTo(ctaInner,
                { y: 36, opacity: 0, scale: 0.97 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.7,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: '.cta-section',
                        start: 'top 85%',
                        once: true
                    }
                }
            );
        }
    }

    // ── 6. BOTÕES MAGNÉTICOS COM MOLA ELÁSTICA (MICRO-INTERAÇÃO LANDO NORRIS) ─
    function initMagneticButtons() {
        if (typeof gsap === 'undefined') return;

        document.querySelectorAll('.btn-opticore, .btn-neon, .btn-ghost').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const dx = e.clientX - rect.left - rect.width / 2;
                const dy = e.clientY - rect.top - rect.height / 2;

                gsap.to(btn, {
                    x: dx * 0.22,
                    y: dy * 0.22,
                    duration: 0.28,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.55,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    function init() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        initSmoothAnchors();
        initHeroAnimation();
        initClaexAmpulhetaScroll();
        initScrollProgressBar();
        initLandoShowcase();
        initScrollReveal();
        initMagneticButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
