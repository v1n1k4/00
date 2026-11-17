/**
 * CLAEX v10 MOTOR — LANDO NORRIS (LN04 F1 TELEMETRY) × CLAUDE CODE CONTROLLERS
 * References:
 * - https://landonorris.com/ (Awwwards Site of the Year 2025 — OFF+BRAND)
 * - https://github.com/anthropics/claude-code
 * - https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit
 * Features:
 * - LN4 Helmet Livery Studio (Default: LN4 Acid Lime #D2FF00 + 4 F1 Liveries + 0°–360° OKLCH Slider)
 * - "The Cursor as Narrator" (F1 Telemetry Reticle + Contextual Action Pill)
 * - ON TRACK / OFF TRACK Interactive Mode Switcher (landonorris.com signature)
 * - Interactive Claude Code Agentic Terminal Widget
 * - Central Ampulheta CLAEX Circuit Hub Inspector & Schedule Simulator
 */

(function () {
    'use strict';

    const LIVERIES = {
        lime:   { label: 'LN4 Acid Lime',     hue: 112, lightness: 0.91, chroma: 0.23, textOn: '#0B0C0E', color: '#D2FF00' },
        amber:  { label: 'McLaren Papaya',    hue: 52,  lightness: 0.75, chroma: 0.21, textOn: '#0B0C0E', color: '#FF8000' },
        cyan:   { label: 'Silverstone Aero',  hue: 198, lightness: 0.84, chroma: 0.19, textOn: '#0B0C0E', color: '#00F0FF' },
        violet: { label: 'Dark Glitter GP',   hue: 288, lightness: 0.68, chroma: 0.22, textOn: '#FFFFFF', color: '#A855F7' },
        blue:   { label: 'Monaco Porcelain',  hue: 255, lightness: 0.65, chroma: 0.20, textOn: '#FFFFFF', color: '#3B82F6' }
    };

    // 0. ENSURE SKIP-TO-CONTENT & UNIFIED LN04 TOPBAR ON EVERY PAGE
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
                    <a href="grade.html?id=1" class="edge-topbar-promo" data-cursor-label="TELEMETRIA">
                        <span class="pulse-dot"></span>
                        <span>LN04 TELEMETRY SPEC · MOTOR CLAEX NSGA-II + CLAUDE CODE &amp; GEMINI 2.5 PRO →</span>
                    </a>
                    <div class="edge-topbar-links">
                        <button type="button" class="accent-switch-btn" id="accentSwitchBtn" data-cursor-label="LIVERY" title="Trocar Pintura F1 (Helmets Hall of Fame)">
                            <span class="swatch"></span>
                            <span id="accentLabel">Livery: LN4 Acid Lime</span>
                        </button>
                        <a href="painel_professor.html">Área do Professor</a>
                        <a href="form_login.html">Log in</a>
                        <span style="color:var(--neon-lime);font-family:var(--font-mono);font-weight:700;">LN04 // v10</span>
                    </div>
                </div>
            `;
            document.body.prepend(topbar);
        }
    }

    // 1. LN04 HELMET LIVERY & OKLCH STUDIO CONTROLLER
    function initSingleAccentController() {
        ensureUnifiedShell();

        const storedKey = localStorage.getItem('claex_livery_key');
        const savedAccent = (storedKey && LIVERIES[storedKey]) ? storedKey : 'lime';
        const savedCustomHue = localStorage.getItem('claex_custom_hue');

        let popover = document.getElementById('claex-theme-studio');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'claex-theme-studio';
            popover.className = 'theme-studio-popover';
            popover.setAttribute('role', 'dialog');
            popover.setAttribute('aria-label', 'Estúdio de Pintura LN04 OKLCH');
            popover.innerHTML = `
                <div class="theme-studio-header">
                    <span class="theme-studio-title">🏎️ LN04 HELMET LIVERIES · OKLCH</span>
                    <button type="button" id="themeStudioClose" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:0.85rem;" aria-label="Fechar">✕</button>
                </div>
                <div class="theme-preset-grid">
                    ${Object.entries(LIVERIES).map(([key, cfg]) => `
                        <button type="button" class="theme-preset-chip" data-preset-key="${key}">
                            <span class="theme-preset-dot" style="background:${cfg.color};box-shadow:0 0 8px ${cfg.color}"></span>
                            <span>${cfg.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="theme-hue-slider-wrap">
                    <div class="theme-hue-label">
                        <span>MATIZ TELEMETRIA (--brand-hue)</span>
                        <strong id="themeHueValue" style="color:var(--neon-lime)">112°</strong>
                    </div>
                    <input type="range" id="themeHueSlider" class="theme-hue-input" min="0" max="360" value="112" aria-label="Ajustar matiz OKLCH">
                </div>
            `;
            document.body.appendChild(popover);
        }

        const hueSlider = document.getElementById('themeHueSlider');
        const hueValLabel = document.getElementById('themeHueValue');
        const accentLabel = document.getElementById('accentLabel');

        const applyLivery = (presetKey, customHue) => {
            const preset = LIVERIES[presetKey] || LIVERIES.lime;
            const hue = customHue !== null && customHue !== undefined ? Number(customHue) : preset.hue;
            const isHighLum = (hue >= 45 && hue <= 205);
            const lightness = customHue != null ? (isHighLum ? 0.88 : 0.68) : preset.lightness;
            const chroma = customHue != null ? 0.22 : preset.chroma;
            const textOn = customHue != null ? (isHighLum ? '#0B0C0E' : '#FFFFFF') : preset.textOn;

            document.documentElement.setAttribute('data-accent', presetKey);
            document.body.setAttribute('data-accent', presetKey);
            document.documentElement.style.setProperty('--brand-hue', String(hue));
            document.documentElement.style.setProperty('--brand-lightness', String(lightness));
            document.documentElement.style.setProperty('--brand-chroma', String(chroma));
            document.documentElement.style.setProperty('--text-on-accent', textOn);

            if (hueSlider) hueSlider.value = String(hue);
            if (hueValLabel) hueValLabel.textContent = `${hue}°`;
            if (accentLabel) {
                accentLabel.textContent = customHue != null
                    ? `Livery OKLCH · ${hue}°`
                    : `Livery: ${preset.label}`;
            }

            popover.querySelectorAll('.theme-preset-chip').forEach(chip => {
                chip.classList.toggle('active', chip.getAttribute('data-preset-key') === presetKey && customHue == null);
            });

            document.querySelectorAll('[data-livery-pill]').forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('data-livery-pill') === presetKey && customHue == null);
            });
        };

        window.CLAEXThemeStudio = {
            setLivery: (key) => {
                if (!LIVERIES[key]) return;
                localStorage.setItem('claex_livery_key', key);
                localStorage.removeItem('claex_custom_hue');
                applyLivery(key, null);
            },
            setHue: (h) => {
                localStorage.setItem('claex_custom_hue', String(h));
                applyLivery(localStorage.getItem('claex_livery_key') || 'lime', h);
            }
        };

        applyLivery(savedAccent, savedCustomHue ? Number(savedCustomHue) : null);

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
                window.CLAEXThemeStudio.setLivery(key);
            });
        });

        document.querySelectorAll('[data-livery-pill]').forEach(pill => {
            pill.addEventListener('click', () => {
                const key = pill.getAttribute('data-livery-pill');
                window.CLAEXThemeStudio.setLivery(key);
            });
        });

        if (hueSlider) {
            hueSlider.addEventListener('input', (e) => {
                window.CLAEXThemeStudio.setHue(Number(e.target.value));
            });
        }

        document.addEventListener('click', (e) => {
            if (popover.classList.contains('open') && !popover.contains(e.target) && e.target !== btn) {
                popover.classList.remove('open');
            }
        });
    }

    // 2. THE CURSOR AS NARRATOR (LANDO NORRIS SOTY 2025 RETICLE + PILL)
    function initNarratorCursor() {
        if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        let dot = document.querySelector('.telemetry-cursor-dot');
        let ring = document.querySelector('.telemetry-cursor-ring');
        let pill = document.querySelector('.ln4-cursor-pill');

        if (!dot) {
            dot = document.createElement('div');
            dot.className = 'telemetry-cursor-dot';
            document.body.appendChild(dot);
        }
        if (!ring) {
            ring = document.createElement('div');
            ring.className = 'telemetry-cursor-ring';
            document.body.appendChild(ring);
        }
        if (!pill) {
            pill = document.createElement('div');
            pill.className = 'ln4-cursor-pill';
            pill.textContent = 'EXPLORAR';
            document.body.appendChild(pill);
        }

        let mouseX = -100, mouseY = -100;
        let ringX = -100, ringY = -100;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            pill.style.transform = `translate3d(${mouseX + 18}px, ${mouseY - 18}px, 0) scale(${pill.classList.contains('visible') ? 1 : 0.75})`;
        }, { passive: true });

        function renderLoop() {
            ringX += (mouseX - ringX) * 0.22;
            ringY += (mouseY - ringY) * 0.22;
            ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-cursor-label], .lando-showcase-card, .sim-slot, .btn-opticore, .btn-neon, .caixa_sala, .claude-cmd-chip');
            if (target) {
                ring.classList.add('active');
                let label = target.getAttribute('data-cursor-label');
                if (!label) {
                    if (target.classList.contains('lando-showcase-card')) label = 'INSPECIONAR';
                    else if (target.classList.contains('sim-slot')) label = 'SIMULAR SLOT';
                    else if (target.classList.contains('caixa_sala')) label = 'ABRIR GRADE';
                    else if (target.classList.contains('claude-cmd-chip')) label = 'EXECUTAR CLI';
                    else label = 'ACIONAR';
                }
                pill.textContent = `[${label}]`;
                pill.classList.add('visible');
            } else if (e.target.closest('a, button, select, input')) {
                ring.classList.add('active');
                pill.classList.remove('visible');
            } else {
                ring.classList.remove('active');
                pill.classList.remove('visible');
            }
        }, { passive: true });
    }

    // 3. ON TRACK / OFF TRACK SWITCHER (LANDONORRIS.COM SIGNATURE TOGGLE)
    function initOnOffTrackSwitcher() {
        const modeBtns = document.querySelectorAll('[data-ln4-mode]');
        if (!modeBtns.length) return;

        const onTrackSections = document.querySelectorAll('[data-track-group="on-track"]');
        const offTrackSections = document.querySelectorAll('[data-track-group="off-track"]');
        const sectorStatus = document.getElementById('ln4-hud-mode-val');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const mode = btn.getAttribute('data-ln4-mode');

                if (mode === 'on-track') {
                    onTrackSections.forEach(el => { el.style.display = ''; });
                    offTrackSections.forEach(el => { el.style.display = 'none'; });
                    if (sectorStatus) sectorStatus.innerHTML = 'ON TRACK <span class="purple-sector">RACE PACE</span>';
                } else if (mode === 'off-track') {
                    onTrackSections.forEach(el => { el.style.display = 'none'; });
                    offTrackSections.forEach(el => { el.style.display = ''; });
                    if (sectorStatus) sectorStatus.innerHTML = 'OFF TRACK <span class="purple-sector">PADDOCK</span>';
                } else {
                    onTrackSections.forEach(el => { el.style.display = ''; });
                    offTrackSections.forEach(el => { el.style.display = ''; });
                    if (sectorStatus) sectorStatus.innerHTML = 'FULL TELEMETRY <span class="purple-sector">DRS ON</span>';
                }

                if (window.ScrollTrigger) {
                    setTimeout(() => window.ScrollTrigger.refresh(), 60);
                }
            });
        });
    }

    // 4. CLAUDE CODE AGENTIC CLI INTERACTIVE WIDGET (anthropics/claude-code)
    function initClaudeCodeTerminal() {
        const outputEl = document.getElementById('claude-cli-output');
        const chips = document.querySelectorAll('[data-claude-cmd]');
        if (!outputEl || !chips.length) return;

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const cmd = chip.getAttribute('data-claude-cmd');
                if (cmd === 'optimize') {
                    const solveBtn = document.getElementById('sim-solve-btn');
                    if (solveBtn) solveBtn.click();
                    outputEl.innerHTML = `<span style="color:var(--neon-lime)">❯ claude "otimizar grade com NSGA-II + Simulated Annealing"</span><br/>✓ [Memetic NSGA-II] 48 indivíduos × 72 gerações convergiram em 38ms · <strong>Fitness: 1060 pts (0 conflitos)</strong>.`;
                } else if (cmd === 'livery-lime') {
                    if (window.CLAEXThemeStudio) window.CLAEXThemeStudio.setLivery('lime');
                    outputEl.innerHTML = `<span style="color:var(--neon-lime)">❯ claude "/livery --set ln4-acid-lime"</span><br/>✓ Design Tokens OKLCH sincronizados em <strong>--brand-hue: 112° (#D2FF00)</strong> sobre Carbon Asphalt (#111112).`;
                } else if (cmd === 'livery-papaya') {
                    if (window.CLAEXThemeStudio) window.CLAEXThemeStudio.setLivery('amber');
                    outputEl.innerHTML = `<span style="color:var(--neon-lime)">❯ claude "/livery --set mclaren-papaya"</span><br/>✓ Design Tokens OKLCH sincronizados em <strong>--brand-hue: 52° (#FF8000 McLaren Papaya)</strong>.`;
                } else if (cmd === 'audit') {
                    outputEl.innerHTML = `<span style="color:var(--neon-lime)">❯ claude "auditar equilíbrio cognitivo e janelas docentes"</span><br/>✓ [Claude Sonnet 4 + Gemini 2.5 Pro] 98% Equilíbrio Cognitivo · 0 janelas ociosas · Regra ≤2 aulas seguidas 100% blindada.`;
                }
            });
        });
    }

    // 5. POP-UP MODAL INTERATIVO ("DESENVOLVIDO PARA ESCOLAS E PROFESSORES")
    function initProfilePopupModal() {
        const overlay = document.getElementById('claex-profile-popup');
        const closeBtn = document.getElementById('claex-popup-close');
        const cancelBtn = document.getElementById('claex-popup-cancel');
        const triggers = document.querySelectorAll('[data-popup-role]');

        if (!overlay || !triggers.length) return;

        const profileData = {
            direcao: {
                icon: '🏫',
                tag: 'LN01 // PIT-WALL GESTÃO',
                title: 'Direção & Coordenação',
                desc: 'Controle todas as salas, durações de aula, intervalos e gere grades completas com o Otimizador Memético NSGA-II + Simulated Annealing e múltiplos modelos de IA.',
                items: [
                    'Gestão completa de salas, laboratórios e turmas em tempo real',
                    'Otimização Meta-Heurística (NSGA-II + Simulated Annealing + Kempe-Chain)',
                    'Orquestração Multi-Modelo (Gemini 2.5 Pro, Claude Sonnet 4, OpenAI o3-mini)',
                    'Auditoria de Equilíbrio Cognitivo e Compactação de Janelas Docentes'
                ],
                ctaText: 'Abrir Painel de Salas →',
                ctaHref: 'listar_sala.html'
            },
            professor: {
                icon: '👩‍🏫',
                tag: 'LN02 // TELEMETRIA DOCENTE',
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
                tag: 'LN03 // GRID ESTUDANTIL',
                title: 'Estudantes & Turmas',
                desc: 'Acesso rápido, limpo e somente-leitura à matriz oficial de horários da sua sala, com alternância cognitiva equilibrada.',
                items: [
                    'Consulta em tempo real da grade oficial da turma',
                    'Equilíbrio cognitivo entre Exatas, Humanidades e Linguagens',
                    'Visualização protegida (somente leitura) com Design System LN04 OKLCH',
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

    // 6. INTERACTIVE AMPULHETA CLAEX CIRCUIT HUB INSPECTOR
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

    // 7. PROXIMITY SPOTLIGHT & 3D TILT CARDS
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

    // 8. INTERACTIVE RBAC PREVIEW SWITCHER
    function initRbacPreview() {
        const tabs = document.querySelectorAll('.rbac-tab');
        const output = document.getElementById('rbac-live-output');
        if (!tabs.length || !output) return;

        const messages = {
            admin: '[DIREÇÃO / PIT-WALL] Acesso total: cadastra salas, seleciona o modelo de IA (Gemini 2.5 Pro / Claude Sonnet 4 / o3-mini) e executa o otimizador Memético NSGA-II.',
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

    // 9. SCHEDULE SIMULATOR WIDGET (MOTOR CLAEX)
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
                    telemetryStatus.textContent = 'GRADE 100% OTIMIZADA (FITNESS: 1060 PTS · 0 CONFLITOS)';
                }
                if (telemetryLog) {
                    telemetryLog.textContent = '[SINCRONIZADO] Solver Memético NSGA-II + Gemini 2.5 Pro convergiu com 98% de Equilíbrio Cognitivo.';
                }
            });
        }
    }

    // 10. GLOBAL NAVIGATION DRAWER
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
        initNarratorCursor();
        initOnOffTrackSwitcher();
        initClaudeCodeTerminal();
        initProfilePopupModal();
        initAiHubDiagram();
        initSpotlightAndTiltCards();
        initRbacPreview();
        initScheduleSimulator();
        initNavigation();
    });
})();
