/**
 * CLAEX EDITORIAL × LANDO NORRIS (LN04) × CLAUDE CODE UI CONTROLLERS
 * - Surface Polarity Switcher: Editorial Light (#F5F5F0) / Carbon Paddock (#111112)
 * - 5 F1 Helmet Liveries + Live 0°–360° OKLCH --brand-hue Studio (Zero Neon)
 * - ON TRACK / OFF TRACK Switcher + Narrator Pill Cursor + MotionUI Terminal CLI
 */
(function () {
    'use strict';

    const LIVERIES = {
        lime:   { label: 'LN4 Acid Lime',    hue: 112, lightness: 0.91, chroma: 0.23, textOn: '#111112', color: '#D2FF00' },
        amber:  { label: 'McLaren Papaya',   hue: 52,  lightness: 0.74, chroma: 0.21, textOn: '#111112', color: '#FF8000' },
        cyan:   { label: 'Silverstone Aero', hue: 196, lightness: 0.82, chroma: 0.18, textOn: '#111112', color: '#00D4E5' },
        violet: { label: 'Night GP Violet',  hue: 285, lightness: 0.62, chroma: 0.20, textOn: '#FFFFFF', color: '#8B5CF6' },
        blue:   { label: 'Monaco Porcelain', hue: 255, lightness: 0.58, chroma: 0.19, textOn: '#FFFFFF', color: '#2563EB' }
    };

    function ensureUnifiedShell() {
        const mainEl = document.querySelector('main') || document.querySelector('.page');
        if (mainEl && !mainEl.id) mainEl.id = 'main-content';

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
                    <a href="grade.html?id=1" class="edge-topbar-promo" data-cursor-label="PIT-WALL">
                        <span class="pulse-dot"></span>
                        <span>MOTOR CLAEX // NSGA-II + SIMULATED ANNEALING &amp; CLAUDE CODE CLI →</span>
                    </a>
                    <div class="edge-topbar-links">
                        <button type="button" class="accent-switch-btn" id="accentSwitchBtn" data-cursor-label="ESTÚDIO" title="Configurar Superfície e Pintura OKLCH">
                            <span class="swatch"></span>
                            <span id="accentLabel">Editorial · LN4 Lime</span>
                        </button>
                        <a href="painel_professor.html">Área do Professor</a>
                        <a href="form_login.html">Log in</a>
                    </div>
                </div>
            `;
            document.body.prepend(topbar);
        }

        if (!document.getElementById('lando-scroll-progress')) {
            const prog = document.createElement('div');
            prog.className = 'lando-scroll-progress';
            prog.id = 'lando-scroll-progress';
            prog.setAttribute('aria-hidden', 'true');
            document.body.prepend(prog);
        }
    }

    function initThemeStudio() {
        ensureUnifiedShell();

        const storedKey = localStorage.getItem('claex_livery_key');
        const savedAccent = (storedKey && LIVERIES[storedKey]) ? storedKey : 'lime';
        const savedHue = localStorage.getItem('claex_custom_hue');
        const savedSurface = localStorage.getItem('claex_surface_mode') || 'editorial';

        let popover = document.getElementById('claex-theme-studio');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'claex-theme-studio';
            popover.className = 'theme-studio-popover';
            popover.setAttribute('role', 'dialog');
            popover.setAttribute('aria-label', 'Theme Studio OKLCH');
            popover.innerHTML = `
                <div class="theme-studio-header">
                    <span class="theme-studio-title">DESIGN STUDIO // OKLCH &amp; SURFACE</span>
                    <button type="button" id="themeStudioClose" style="background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:0.85rem;" aria-label="Fechar">✕</button>
                </div>
                <div class="surface-mode-switch" role="group" aria-label="Modo de Superfície">
                    <button type="button" class="surface-mode-btn" data-surface-set="editorial">Editorial Claro</button>
                    <button type="button" class="surface-mode-btn" data-surface-set="carbon">Carbon Paddock</button>
                </div>
                <div class="theme-preset-grid">
                    ${Object.entries(LIVERIES).map(([key, cfg]) => `
                        <button type="button" class="theme-preset-chip" data-preset-key="${key}">
                            <span class="theme-preset-dot" style="background:${cfg.color}"></span>
                            <span>${cfg.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="theme-hue-slider-wrap">
                    <div class="theme-hue-label">
                        <span>MATIZ OKLCH (--brand-hue)</span>
                        <strong id="themeHueValue">112°</strong>
                    </div>
                    <input type="range" id="themeHueSlider" class="theme-hue-input" min="0" max="360" value="112" aria-label="Matiz OKLCH">
                </div>
            `;
            document.body.appendChild(popover);
        }

        const hueSlider = document.getElementById('themeHueSlider');
        const hueValLabel = document.getElementById('themeHueValue');
        const accentLabel = document.getElementById('accentLabel');

        const applyState = (surfaceMode, presetKey, customHue) => {
            const mode = surfaceMode === 'carbon' ? 'carbon' : 'editorial';
            const preset = LIVERIES[presetKey] || LIVERIES.lime;
            const hue = customHue != null ? Number(customHue) : preset.hue;
            const isHighLum = (hue >= 45 && hue <= 205);
            const lightness = customHue != null ? (isHighLum ? 0.88 : 0.64) : preset.lightness;
            const chroma = customHue != null ? 0.21 : preset.chroma;
            const textOn = customHue != null ? (isHighLum ? '#111112' : '#FFFFFF') : preset.textOn;

            document.documentElement.setAttribute('data-surface', mode);
            document.documentElement.setAttribute('data-accent', presetKey);
            document.body.setAttribute('data-surface', mode);
            document.body.setAttribute('data-accent', presetKey);

            document.documentElement.style.setProperty('--brand-hue', String(hue));
            document.documentElement.style.setProperty('--brand-lightness', String(lightness));
            document.documentElement.style.setProperty('--brand-chroma', String(chroma));
            document.documentElement.style.setProperty('--text-on-accent', textOn);

            if (hueSlider) hueSlider.value = String(hue);
            if (hueValLabel) hueValLabel.textContent = `${hue}°`;
            if (accentLabel) {
                const modeShort = mode === 'carbon' ? 'Carbon' : 'Editorial';
                accentLabel.textContent = customHue != null
                    ? `${modeShort} · OKLCH ${hue}°`
                    : `${modeShort} · ${preset.label}`;
            }

            popover.querySelectorAll('.surface-mode-btn').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-surface-set') === mode);
            });
            popover.querySelectorAll('.theme-preset-chip').forEach(chip => {
                chip.classList.toggle('active', chip.getAttribute('data-preset-key') === presetKey && customHue == null);
            });
            document.querySelectorAll('[data-livery-pill]').forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('data-livery-pill') === presetKey && customHue == null);
            });
        };

        window.CLAEXThemeStudio = {
            setSurface: (mode) => {
                const next = mode === 'carbon' ? 'carbon' : 'editorial';
                localStorage.setItem('claex_surface_mode', next);
                const k = localStorage.getItem('claex_livery_key') || 'lime';
                const ch = localStorage.getItem('claex_custom_hue');
                applyState(next, k, ch ? Number(ch) : null);
            },
            setLivery: (key) => {
                if (!LIVERIES[key]) return;
                localStorage.setItem('claex_livery_key', key);
                localStorage.removeItem('claex_custom_hue');
                const mode = localStorage.getItem('claex_surface_mode') || 'editorial';
                applyState(mode, key, null);
            },
            setHue: (h) => {
                localStorage.setItem('claex_custom_hue', String(h));
                const mode = localStorage.getItem('claex_surface_mode') || 'editorial';
                applyState(mode, localStorage.getItem('claex_livery_key') || 'lime', h);
            }
        };

        applyState(savedSurface, savedAccent, savedHue ? Number(savedHue) : null);

        const btn = document.getElementById('accentSwitchBtn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                popover.classList.toggle('open');
            });
        }
        const closeBtn = document.getElementById('themeStudioClose');
        if (closeBtn) closeBtn.addEventListener('click', () => popover.classList.remove('open'));

        popover.querySelectorAll('[data-surface-set]').forEach(b => {
            b.addEventListener('click', () => window.CLAEXThemeStudio.setSurface(b.getAttribute('data-surface-set')));
        });
        popover.querySelectorAll('[data-preset-key]').forEach(chip => {
            chip.addEventListener('click', () => window.CLAEXThemeStudio.setLivery(chip.getAttribute('data-preset-key')));
        });
        document.querySelectorAll('[data-livery-pill]').forEach(pill => {
            pill.addEventListener('click', () => window.CLAEXThemeStudio.setLivery(pill.getAttribute('data-livery-pill')));
        });
        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => window.CLAEXThemeStudio.setHue(Number(e.target.value)));
        }
        document.addEventListener('click', (e) => {
            if (popover.classList.contains('open') && !popover.contains(e.target) && e.target !== btn) {
                popover.classList.remove('open');
            }
        });
    }

    // Narrator Pill Cursor (zero neon laser dot/ring — editorial telemetry label only)
    function initNarratorCursor() {
        if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let pill = document.querySelector('.ln4-cursor-pill');
        if (!pill) {
            pill = document.createElement('div');
            pill.className = 'ln4-cursor-pill';
            document.body.appendChild(pill);
        }

        window.addEventListener('mousemove', (e) => {
            pill.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY - 16}px, 0) scale(${pill.classList.contains('visible') ? 1 : 0.85})`;
        }, { passive: true });

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-cursor-label], .lando-showcase-card, .sim-slot, .caixa_sala');
            if (target) {
                let label = target.getAttribute('data-cursor-label');
                if (!label) {
                    if (target.classList.contains('lando-showcase-card')) label = 'INSPECIONAR';
                    else if (target.classList.contains('sim-slot')) label = 'ALTERAR SLOT';
                    else if (target.classList.contains('caixa_sala')) label = 'ABRIR GRADE';
                }
                pill.textContent = label;
                pill.classList.add('visible');
            } else {
                pill.classList.remove('visible');
            }
        }, { passive: true });
    }

    function initOnOffTrackSwitcher() {
        const modeBtns = document.querySelectorAll('[data-ln4-mode]');
        if (!modeBtns.length) return;

        const onTrackSections = document.querySelectorAll('[data-track-group="on-track"]');
        const offTrackSections = document.querySelectorAll('[data-track-group="off-track"]');
        const modeVal = document.getElementById('ln4-hud-mode-val');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.getAttribute('data-ln4-mode');

                if (mode === 'on-track') {
                    onTrackSections.forEach(el => { el.style.display = ''; });
                    offTrackSections.forEach(el => { el.style.display = 'none'; });
                    if (modeVal) modeVal.textContent = 'ON TRACK · MOTOR';
                } else if (mode === 'off-track') {
                    onTrackSections.forEach(el => { el.style.display = 'none'; });
                    offTrackSections.forEach(el => { el.style.display = ''; });
                    if (modeVal) modeVal.textContent = 'OFF TRACK · PADDOCK';
                } else {
                    onTrackSections.forEach(el => { el.style.display = ''; });
                    offTrackSections.forEach(el => { el.style.display = ''; });
                    if (modeVal) modeVal.textContent = 'COMPLETO · 2026';
                }
            });
        });
    }

    function initClaudeCodeTerminal() {
        const outputEl = document.getElementById('claude-cli-output');
        const chips = document.querySelectorAll('[data-claude-cmd]');
        if (!outputEl || !chips.length) return;

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const cmd = chip.getAttribute('data-claude-cmd');
                const writeLine = (promptCmd, detailText) => {
                    outputEl.innerHTML = `<span style="color:var(--neon-lime)">❯ claude</span> ${promptCmd}<br/><span class="cli-typed-result"></span>`;
                    const typedEl = outputEl.querySelector('.cli-typed-result');
                    if (window.MotionUI) {
                        window.MotionUI.textScramble(typedEl, detailText, 380);
                    } else {
                        typedEl.textContent = detailText;
                    }
                };

                if (cmd === 'optimize') {
                    const solveBtn = document.getElementById('sim-solve-btn');
                    if (solveBtn) solveBtn.click();
                    writeLine('/optimize --nsga2 --sa', '✓ 48 indivíduos × 72 gerações · 0 conflitos · Fitness 1060 pts.');
                } else if (cmd === 'audit') {
                    writeLine('/audit --model claude-sonnet-4', '✓ Equilíbrio cognitivo 98% · 0 janelas ociosas · máx. 2 seguidas OK.');
                } else if (cmd === 'livery-lime') {
                    if (window.CLAEXThemeStudio) window.CLAEXThemeStudio.setLivery('lime');
                    writeLine('/livery --brand-hue 112', '✓ Livery sincronizada em OKLCH #D2FF00 LN4 Acid Lime.');
                } else if (cmd === 'surface-toggle') {
                    const cur = document.documentElement.getAttribute('data-surface') === 'carbon' ? 'editorial' : 'carbon';
                    if (window.CLAEXThemeStudio) window.CLAEXThemeStudio.setSurface(cur);
                    writeLine('/surface --toggle', `✓ Polaridade alternada para modo ${cur === 'carbon' ? 'Carbon Paddock' : 'Editorial Claro'}.`);
                }
            });
        });
    }

    function initProfilePopupModal() {
        const overlay = document.getElementById('claex-profile-popup');
        const closeBtn = document.getElementById('claex-popup-close');
        const cancelBtn = document.getElementById('claex-popup-cancel');
        const triggers = document.querySelectorAll('[data-popup-role]');
        if (!overlay || !triggers.length) return;

        const profileData = {
            direcao: {
                tag: '#01 // GESTÃO & COORDENAÇÃO',
                title: 'Direção & Coordenação',
                desc: 'Controle salas, intervalos e gere matrizes semanais sem colisões entre turnos com o otimizador NSGA-II + Simulated Annealing.',
                items: [
                    'Gestão centralizada de salas, turmas e carga horária',
                    'Otimização Memética NSGA-II + Kempe-Chain 2-Opt',
                    'Auditoria multi-modelo (Gemini 2.5 Pro · Claude Sonnet 4 · o3-mini)',
                    'Compactação automática de janelas docentes'
                ],
                ctaText: 'Abrir Quadro de Salas →',
                ctaHref: 'listar_sala.html'
            },
            professor: {
                tag: '#02 // AUTONOMIA DOCENTE',
                title: 'Corpo Docente',
                desc: 'Registre seus horários livres entre instituições e proteja sua jornada contra sobrecargas consecutivas.',
                items: [
                    'Cadastro próprio de disponibilidades e modalidades',
                    'Trava rígida de no máximo 2 aulas consecutivas',
                    'Minimização automática de tempos ociosos entre turmas',
                    'Sincronização nativa com múltiplas escolas'
                ],
                ctaText: 'Acessar Área do Professor →',
                ctaHref: 'painel_professor.html'
            },
            aluno: {
                tag: '#03 // QUADRO ESTUDANTIL',
                title: 'Estudantes & Turmas',
                desc: 'Visualização clara, responsiva e somente leitura da grade oficial da turma com alternância cognitiva equilibrada.',
                items: [
                    'Acesso instantâneo à matriz oficial de horários',
                    'Equilíbrio entre ciências analíticas, humanidades e prática',
                    'Interface tipográfica limpa de alto contraste (WCAG AA)',
                    'Disponível para consulta rápida em desktop e mobile'
                ],
                ctaText: 'Ver Grades Publicadas →',
                ctaHref: 'listar_sala.html'
            }
        };

        const openModal = (roleKey) => {
            const data = profileData[roleKey];
            if (!data) return;
            document.getElementById('popup-modal-tag').textContent = data.tag;
            document.getElementById('popup-modal-title').textContent = data.title;
            document.getElementById('popup-modal-desc').textContent = data.desc;
            document.getElementById('popup-modal-list').innerHTML = data.items
                .map(item => `<li><span class="check">✓</span><span>${item}</span></li>`).join('');
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
            card.addEventListener('click', () => openModal(card.getAttribute('data-popup-role')));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(card.getAttribute('data-popup-role'));
                }
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
        });
    }

    function initAiHubDiagram() {
        const stage = document.getElementById('ai-hub-diagram');
        const inspectorText = document.getElementById('hub-inspector-text');
        if (!stage || !inspectorText) return;

        stage.querySelectorAll('[data-hub-info]').forEach(node => {
            const updateInfo = () => {
                stage.querySelectorAll('.hub-sat-node').forEach(n => n.classList.remove('active'));
                if (node.classList.contains('hub-sat-node')) node.classList.add('active');
                const info = node.getAttribute('data-hub-info');
                if (info) inspectorText.innerHTML = info;
            };
            node.addEventListener('mouseenter', updateInfo);
            node.addEventListener('click', updateInfo);
        });
    }

    function initRbacPreview() {
        const tabs = document.querySelectorAll('.rbac-tab');
        const output = document.getElementById('rbac-live-output');
        if (!tabs.length || !output) return;

        const messages = {
            admin: '[DIREÇÃO] Acesso completo: cadastra turmas, define regras de IA e executa o solver Memético NSGA-II + Simulated Annealing.',
            prof:  '[PROFESSOR] Gerencia disponibilidade horária e disciplinas próprias, com consulta em tempo real das turmas vinculadas.',
            aluno: '[ALUNO] Acesso somente leitura ao quadro semanal da sala com horários de aula e intervalos estruturados.'
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const role = tab.getAttribute('data-rbac-role');
                if (messages[role]) output.textContent = messages[role];
            });
        });
    }

    function initScheduleSimulator() {
        const container = document.getElementById('claex-interactive-simulator');
        if (!container) return;

        const slots = container.querySelectorAll('.sim-slot');
        const telemetryStatus = container.querySelector('#sim-telemetry-status');
        const telemetryLog = container.querySelector('#sim-telemetry-log');
        const solveBtn = container.querySelector('#sim-solve-btn');

        slots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (slot.classList.contains('conflict')) {
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject}<small style="display:block;font-size:.66rem;color:var(--text-secondary)">Equilibrado</small>`;
                    if (telemetryStatus) telemetryStatus.textContent = 'SLOT AJUSTADO POR PERMUTAÇÃO KEMPE-CHAIN';
                    if (telemetryLog) telemetryLog.textContent = `[RESOLVIDO] ${slot.dataset.subject} (${slot.dataset.day} ${slot.dataset.time}) realocada sem choques.`;
                } else if (slot.classList.contains('resolved')) {
                    slot.classList.remove('resolved');
                    slot.innerHTML = `<span class="slot-badge">LIVRE</span> ${slot.dataset.subject}<small style="display:block;font-size:.66rem;color:var(--text-muted)">Disponível</small>`;
                } else {
                    slot.classList.add('conflict');
                    slot.innerHTML = `<span class="slot-badge">CHOQUE</span> ${slot.dataset.subject}<small style="display:block;font-size:.66rem;color:#B91C1C">&gt;2 Aulas Seguidas</small>`;
                    if (telemetryStatus) telemetryStatus.textContent = 'ALERTA: COLISÃO DETECTADA';
                    if (telemetryLog) telemetryLog.textContent = '[MOTOR CLAEX] Docente excederia o limite rígido de 2 aulas consecutivas.';
                }
            });
        });

        if (solveBtn) {
            solveBtn.addEventListener('click', () => {
                container.querySelectorAll('.sim-slot.conflict').forEach(slot => {
                    slot.classList.remove('conflict');
                    slot.classList.add('resolved');
                    slot.innerHTML = `<span class="slot-badge">OK</span> ${slot.dataset.subject}<small style="display:block;font-size:.66rem;color:var(--text-secondary)">Confirmado</small>`;
                });
                if (telemetryStatus) telemetryStatus.textContent = 'GRADE OTIMIZADA · FITNESS 1060 PTS · 0 CONFLITOS';
                if (telemetryLog) telemetryLog.textContent = '[SINCRONIZADO] Solver Memético NSGA-II convergiu com 98% de equilíbrio cognitivo.';
                const metricEl = document.getElementById('ln4-fitness-counter');
                if (metricEl && window.MotionUI) window.MotionUI.slidingNumber(metricEl, 1060, ' pts');
            });
        }
    }

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
        if (overlay) overlay.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.remove('open');
            overlay.classList.remove('open');
        });
        const closeMenu = document.querySelector('.close-menu');
        if (closeMenu) closeMenu.addEventListener('click', () => {
            if (sideMenu) sideMenu.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initThemeStudio();
        initNarratorCursor();
        initOnOffTrackSwitcher();
        initClaudeCodeTerminal();
        initProfilePopupModal();
        initAiHubDiagram();
        initRbacPreview();
        initScheduleSimulator();
        initNavigation();
    });
})();
