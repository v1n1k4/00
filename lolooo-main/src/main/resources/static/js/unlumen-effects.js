/**
 * CLAEX v10 MOTOR — INTERACTIVE CONTROLLERS & OKLCH THEME STUDIO
 * Based on wilwaldon/Claude-Code-Frontend-Design-Toolkit:
 * - Single --brand-hue OKLCH Theme Studio (5 named presets + live 0°-360° hue slider)
 * - Automatic Topbar & WCAG Skip-Link Injection across all pages
 * - Interactive Pop-up Modal for School Profiles (Direção, Professores, Alunos)
 * - Central Ampulheta CLAEX Circuit Hub Inspector
 * - Schedule Conflict Simulator & RBAC Switcher
 */

(function () {
    'use strict';

    const PRESETS = {
        blue:    { label: 'Safira OLED',       hue: 255, color: 'oklch(0.62 0.20 255)' },
        violet:  { label: 'Violeta Opticore',  hue: 285, color: 'oklch(0.62 0.22 285)' },
        amber:   { label: 'Âmbar Telemetria',  hue: 38,  color: 'oklch(0.68 0.20 38)'  },
        emerald: { label: 'Esmeralda Solar',   hue: 155, color: 'oklch(0.65 0.19 155)' },
        crimson: { label: 'Rubi Editorial',    hue: 15,  color: 'oklch(0.62 0.21 15)'  }
    };

    // 0. ENSURE SKIP-TO-CONTENT & UNIFIED TOPBAR ON EVERY PAGE
    function ensureUnifiedShell() {
        const mainEl = document.querySelector('main') || document.querySelector('.page');
        if (mainEl && !mainEl.id) {
            mainEl.id = 'main-content';
        }
        if (!document.querySelector('.skip-to-content')) {
            const skip = document.createElement('a');
            skip.href = '#main-content';
            skip.className = 'skip-to-content';
            skip.textContent = 'Pular para o conteúdo principal';
            document.body.prepend(skip);
        }

        if (!document.querySelector('.edge-topbar')) {
            const topbar = document.createElement('div');
            topbar.className = 'edge-topbar';
            topbar.innerHTML = `
                <div class="edge-topbar-inner">
                    <a href="listar_sala.html" class="edge-topbar-promo">
                        <span class="pulse-dot"></span>
                        <span>Motor CLAEX v10 · Otimizador Memético NSGA-II + Multi-Modelo IA (Gemini 2.5 Pro · Claude Sonnet 4 · o3-mini) →</span>
                    </a>
                    <div class="edge-topbar-links">
                        <button type="button" class="accent-switch-btn" id="accentSwitchBtn" title="Abrir Estúdio de Tema OKLCH">
                            <span class="swatch"></span>
                            <span id="accentLabel">Tema: Safira OLED</span>
                        </button>
                        <a href="painel_professor.html">Área do Professor</a>
                        <a href="form_login.html">Log in</a>
                        <span style="color:var(--text-muted)">OKLCH · v10</span>
                    </div>
                </div>
            `;
            document.body.prepend(topbar);
        }
    }

    // 1. OKLCH SINGLE-HUE & PRESET STUDIO CONTROLLER
    function initSingleAccentController() {
        ensureUnifiedShell();

        const savedAccent = localStorage.getItem('claex_single_accent') || 'blue';
        const savedCustomHue = localStorage.getItem('claex_custom_hue');

        // Inject Theme Studio Popover
        let popover = document.getElementById('claex-theme-studio');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'claex-theme-studio';
            popover.className = 'theme-studio-popover';
            popover.setAttribute('role', 'dialog');
            popover.setAttribute('aria-label', 'Estúdio de Tema OKLCH');
            popover.innerHTML = `
                <div class="theme-studio-header">
                    <span class="theme-studio-title">✦ OKLCH Design Tokens</span>
                    <button type="button" id="themeStudioClose" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:0.85rem;">✕</button>
                </div>
                <div class="theme-preset-grid">
                    ${Object.entries(PRESETS).map(([key, cfg]) => `
                        <button type="button" class="theme-preset-chip" data-preset-key="${key}">
                            <span class="theme-preset-dot" style="background:${cfg.color};box-shadow:0 0 8px ${cfg.color}"></span>
                            <span>${cfg.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="theme-hue-slider-wrap">
                    <div class="theme-hue-label">
                        <span>MATIZ OKLCH (--brand-hue)</span>
                        <strong id="themeHueValue" style="color:#FFF">255°</strong>
                    </div>
                    <input type="range" id="themeHueSlider" class="theme-hue-input" min="0" max="360" value="255" aria-label="Ajustar matiz OKLCH">
                </div>
            `;
            document.body.appendChild(popover);
        }

        const hueSlider = document.getElementById('themeHueSlider');
        const hueValLabel = document.getElementById('themeHueValue');
        const accentLabel = document.getElementById('accentLabel');

        const applyHueAndPreset = (presetKey, customHue) => {
            const preset = PRESETS[presetKey] || PRESETS.blue;
            const hue = customHue !== null && customHue !== undefined ? Number(customHue) : preset.hue;

            document.documentElement.setAttribute('data-accent', presetKey);
            document.body.setAttribute('data-accent', presetKey);
            document.documentElement.style.setProperty('--brand-hue', String(hue));
            document.body.style.setProperty('--brand-hue', String(hue));

            if (hueSlider) hueSlider.value = String(hue);
            if (hueValLabel) hueValLabel.textContent = `${hue}°`;
            if (accentLabel) {
                accentLabel.textContent = customHue != null
                    ? `OKLCH: ${hue}°`
                    : `Tema: ${preset.label}`;
            }

            popover.querySelectorAll('.theme-preset-chip').forEach(chip => {
                chip.classList.toggle('active', chip.getAttribute('data-preset-key') === presetKey && customHue == null);
            });
        };

        applyHueAndPreset(savedAccent, savedCustomHue ? Number(savedCustomHue) : null);

        const btn = document.getElementById('accentSwitchBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.classList.toggle('open');
            });
        }

        const closeBtn = document.getElementById('themeStudioClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => popover.classList.remove('open'));
        }

        popover.querySelectorAll('.theme-preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const key = chip.getAttribute('data-preset-key');
                localStorage.setItem('claex_single_accent', key);
                localStorage.removeItem('claex_custom_hue');
                applyHueAndPreset(key, null);
            });
        });

        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => {
                const h = Number(e.target.value);
                localStorage.setItem('claex_custom_hue', String(h));
                applyHueAndPreset(localStorage.getItem('claex_single_accent') || 'blue', h);
            });
        }

        document.addEventListener('click', (e) => {
            if (popover.classList.contains('open') && !popover.contains(e.target) && e.target !== btn) {
                popover.classList.remove('open');
            }
        });
    }

    // 2. POP-UP MODAL INTERATIVO ("DESENVOLVIDO PARA ESCOLAS E PROFESSORES")
    function initProfilePopupModal() {
        const overlay = document.getElementById('claex-profile-popup');
        const closeBtn = document.getElementById('claex-popup-close');
        const cancelBtn = document.getElementById('claex-popup-cancel');
        const triggers = document.querySelectorAll('[data-popup-role]');

        if (!overlay || !triggers.length) return;

        const profileData = {
            direcao: {
                icon: '🏫',
                tag: 'Gestão Institucional',
                title: 'Direção & Coordenação',
                desc: 'Controle todas as salas, durações de aula, intervalos e gere grades completas com o Otimizador Memético NSGA-II + Simulated Annealing e múltiplos modelos de IA.',
                items: [
                    'Gestão completa de salas, laboratórios e turmas',
                    'Otimização Meta-Heurística (NSGA-II + Simulated Annealing + Kempe-Chain)',
                    'Orquestração Multi-Modelo (Gemini 2.5 Pro, Claude Sonnet 4, OpenAI o3-mini)',
                    'Auditoria de Equilíbrio Cognitivo e Compactação de Janelas Docentes'
                ],
                ctaText: 'Abrir Painel de Salas →',
                ctaHref: 'listar_sala.html'
            },
            professor: {
                icon: '👩‍🏫',
                tag: 'Autonomia Docente',
                title: 'Corpo Docente',
                desc: 'Autonomia para registrar horários disponíveis e matérias que leciona, garantindo uma grade justa, compacta e sem sobrecarga.',
                items: [
                    'Cadastro próprio de dias e horários disponíveis',
                    'Proteção Motor CLAEX: nunca passa de 2 aulas seguidas',
                    'Minimização automática de janelas ociosas entre aulas',
                    'Sincronização entre diferentes escolas onde leciona'
                ],
                ctaText: 'Acessar Área do Professor →',
                ctaHref: 'painel_professor.html'
            },
            aluno: {
                icon: '🎓',
                tag: 'Portal Estudantil',
                title: 'Estudantes & Turmas',
                desc: 'Acesso rápido, limpo e somente-leitura à matriz oficial de horários da sua sala, com alternância cognitiva equilibrada.',
                items: [
                    'Consulta em tempo real da grade oficial da turma',
                    'Equilíbrio cognitivo entre Exatas, Humanidades e Linguagens',
                    'Visualização protegida (somente leitura) com Design System OKLCH',
                    'Acesso imediato pelo computador ou celular'
                ],
                ctaText: 'Consultar Grades →',
                ctaHref: 'listar_sala.html'
            }
        };

        const openModal = (roleKey) => {
            const data = profileData[roleKey];
            if (!data) return;

            document.getElementById('popup-modal-icon').textContent = data.icon;
            document.getElementById('popup-modal-tag').textContent = data.tag;
            document.getElementById('popup-modal-title').textContent = data.title;
            document.getElementById('popup-modal-desc').textContent = data.desc;

            const listEl = document.getElementById('popup-modal-list');
            listEl.innerHTML = data.items
                .map(item => `<li><span class="check">✓</span> <span>${item}</span></li>`)
                .join('');

            const ctaEl = document.getElementById('popup-modal-cta');
            if (ctaEl) {
                ctaEl.textContent = data.ctaText;
                ctaEl.setAttribute('href', data.ctaHref);
            }

            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
        };

        const closeModal = () => {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
        };

        triggers.forEach(card => {
            card.addEventListener('click', () => {
                openModal(card.getAttribute('data-popup-role'));
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(card.getAttribute('data-popup-role'));
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // 3. INTERACTIVE AMPULHETA CLAEX CIRCUIT HUB INSPECTOR
    function initAiHubDiagram() {
        const stage = document.getElementById('ai-hub-diagram');
        const inspectorText = document.getElementById('hub-inspector-text');
        if (!stage || !inspectorText) return;

        const nodes = stage.querySelectorAll('[data-hub-info]');
        nodes.forEach(node => {
            const updateInfo = () => {
                stage.querySelectorAll('.hub-sat-node').forEach(n => n.classList.remove('active'));
                if (node.classList.contains('hub-sat-node')) {
                    node.classList.add('active');
                }
                const info = node.getAttribute('data-hub-info');
                if (info) {
                    inspectorText.innerHTML = info;
                }
            };
            node.addEventListener('mouseenter', updateInfo);
            node.addEventListener('click', updateInfo);
        });
    }

    // 4. PROXIMITY SPOTLIGHT & 3D TILT CARDS
    function initSpotlightAndTiltCards() {
        const cards = document.querySelectorAll('.spotlight-card');
        if (!cards.length) return;

        window.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        }, { passive: true });

        const tiltCards = document.querySelectorAll('[data-tilt]');
        if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            tiltCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -2.8;
                    const rotateY = ((x - centerX) / centerX) * 2.8;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
                });
            });
        }
    }

    // 5. INTERACTIVE RBAC PREVIEW SWITCHER
    function initRbacPreview() {
        const tabs = document.querySelectorAll('.rbac-tab');
        const output = document.getElementById('rbac-live-output');
        if (!tabs.length || !output) return;

        const messages = {
            admin: '[DIREÇÃO / ADMIN] Acesso total: cadastra salas, seleciona o modelo de IA (Gemini 2.5 Pro / Claude Sonnet 4 / o3-mini) e executa o otimizador Memético NSGA-II.',
            prof: '[PROFESSOR] Cadastra seus próprios dias/horários disponíveis e disciplinas no Painel do Professor com minimização automática de janelas.',
            aluno: '[ALUNO] Consulta rápida, limpa e somente-leitura da grade horária oficial da turma com indicadores de equilíbrio cognitivo.'
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const role = tab.getAttribute('data-rbac-role');
                if (messages[role]) {
                    output.style.opacity = '0.4';
                    setTimeout(() => {
                        output.textContent = messages[role];
                        output.style.opacity = '1';
                    }, 100);
                }
            });
        });
    }

    // 6. SCHEDULE SIMULATOR WIDGET (MOTOR CLAEX)
    function initScheduleSimulator() {
        const container = document.getElementById('claex-interactive-simulator');
        if (!container) return;

        const slots = container.querySelectorAll('.sim-slot');
        const telemetryStatus = container.querySelector('#sim-telemetry-status');
        const telemetryLog = container.querySelector('#sim-telemetry-log');
        const solveBtn = container.querySelector('#sim-solve-btn');

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                const isConflict = slot.classList.contains('conflict');
                if (isConflict) {
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject} <small style="display:block;font-size:.65rem;color:var(--text-secondary)">Equilibrado</small>`;
                    if (telemetryStatus) {
                        telemetryStatus.textContent = 'GRADE EQUILIBRADA (NSGA-II + SIMULATED ANNEALING)';
                    }
                    if (telemetryLog) {
                        telemetryLog.textContent = `[RESOLVIDO] Aula de ${slot.dataset.subject} (${slot.dataset.day} ${slot.dataset.time}) ajustada por permutação Kempe-Chain.`;
                    }
                } else if (slot.classList.contains('resolved')) {
                    slot.classList.remove('resolved');
                    slot.innerHTML = `<span class="slot-badge">LIVRE</span> ${slot.dataset.subject} <small style="display:block;font-size:.65rem;color:var(--text-muted)">Disponível</small>`;
                } else {
                    slot.classList.add('conflict');
                    slot.innerHTML = `<span class="slot-badge">CHOQUE</span> ${slot.dataset.subject} <small style="display:block;font-size:.65rem;color:#fca5a5">>2 Seguidas</small>`;
                    if (telemetryStatus) {
                        telemetryStatus.textContent = 'ALERTA: RESTRIÇÃO DETECTADA';
                    }
                    if (telemetryLog) {
                        telemetryLog.textContent = `[BLOQUEIO MOTOR CLAEX] Docente excederia o limite de 2 aulas seguidas ou teria choque entre unidades.`;
                    }
                }
            });
        });

        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                const conflicts = container.querySelectorAll('.sim-slot.conflict');
                conflicts.forEach(slot => {
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject} <small style="display:block;font-size:.65rem;color:var(--text-secondary)">Confirmado</small>`;
                });
                if (telemetryStatus) {
                    telemetryStatus.textContent = 'GRADE 100% OTIMIZADA (FITNESS: 1000 PTS · 0 CONFLITOS)';
                }
                if (telemetryLog) {
                    telemetryLog.textContent = '[SINCRONIZADO] Solver Memético NSGA-II + Gemini 2.5 Pro convergiu com 98% de Equilíbrio Cognitivo.';
                }
            });
        }
    }

    // 7. GLOBAL NAVIGATION DRAWER
    function initNavigation() {
        const bars = document.querySelectorAll('.bars, .menu-icon, #menuToggle');
        const sideMenu = document.querySelector('#side-menu');
        const overlay = document.querySelector('.menu-overlay');

        function toggleMenu() {
            if (sideMenu) {
                sideMenu.classList.toggle('open');
                if (overlay) overlay.classList.toggle('open');
            }
        }

        bars.forEach(bar => bar.addEventListener('click', toggleMenu));

        if (overlay) {
            overlay.addEventListener('click', () => {
                if (sideMenu) sideMenu.classList.remove('open');
                overlay.classList.remove('open');
            });
        }

        const closeMenu = document.querySelector('.close-menu');
        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                if (sideMenu) sideMenu.classList.remove('open');
                if (overlay) overlay.classList.remove('open');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSingleAccentController();
        initProfilePopupModal();
        initAiHubDiagram();
        initSpotlightAndTiltCards();
        initRbacPreview();
        initScheduleSimulator();
        initNavigation();
    });
})();
