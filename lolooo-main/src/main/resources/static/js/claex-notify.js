/**
 * CLAEX NOTIFY — Notificações e Pop-ups no estilo visual do site
 * ---------------------------------------------------------------
 * - Substitui o alert() nativo do navegador ("localhost:8081 diz...")
 *   por notificações escuras com a Ampulheta CLAEX, barra de progresso e destaque azul.
 * - CLAEX.confirm(msg) => Promise<boolean> com pop-up modal no mesmo estilo do site.
 * - Notificações sobrevivem a redirecionamentos (ex.: "Sala criada" -> listar_sala.html).
 *
 * Uso:
 *   CLAEX.notify("Mensagem", { type: "success" | "error" | "warning" | "info", title, duration })
 *   CLAEX.success("..."); CLAEX.error("..."); CLAEX.warning("..."); CLAEX.info("...");
 *   if (await CLAEX.confirm("Deseja excluir?", { danger: true })) { ... }
 */
(function () {
    'use strict';

    if (window.CLAEX && window.CLAEX.__notifyReady) return;

    const STORAGE_KEY = 'claex_pending_notifications';
    const nativeAlert = window.alert ? window.alert.bind(window) : null;

    const AMPULHETA_SVG =
        '<svg viewBox="0 0 160 160" aria-hidden="true">' +
        '<path d="M 10,8 L 75,8 L 75,152 L 10,152 L 54,80 L 22,26 L 32,23 Z"/>' +
        '<path d="M 85,8 L 150,8 L 106,80 L 150,152 L 85,152 Z"/>' +
        '</svg>';

    const TYPES = {
        success: { tag: 'MOTOR CLAEX // SUCESSO', title: 'Operação concluída', icon: '✓' },
        error:   { tag: 'MOTOR CLAEX // ERRO',    title: 'Algo deu errado',     icon: '✕' },
        warning: { tag: 'MOTOR CLAEX // AVISO',   title: 'Atenção',             icon: '!' },
        info:    { tag: 'MOTOR CLAEX // INFO',    title: 'Notificação',         icon: 'i' }
    };

    // ── ESTILOS (injetados uma única vez, funcionam em qualquer página) ─────────
    const CSS = `
    .claex-toast-stack {
        position: fixed; top: 86px; right: 22px; z-index: 100000;
        display: flex; flex-direction: column; gap: 12px;
        width: min(400px, calc(100vw - 32px)); pointer-events: none;
    }
    .claex-toast {
        --claex-accent: var(--neon-bright, #3B82F6);
        position: relative; pointer-events: auto; overflow: hidden;
        display: grid; grid-template-columns: 44px 1fr 26px; gap: 14px; align-items: start;
        padding: 16px 16px 18px;
        background: linear-gradient(180deg, rgba(23, 26, 36, 0.97) 0%, rgba(10, 12, 18, 0.98) 100%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        box-shadow: 0 22px 50px rgba(0, 0, 0, 0.75), 0 0 34px rgba(59, 130, 246, 0.10),
                    inset 0 1px 0 rgba(255, 255, 255, 0.10);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        font-family: 'Plus Jakarta Sans', 'Space Grotesk', system-ui, sans-serif;
        color: #E5E7EB;
        transform: translateX(calc(100% + 40px)) scale(0.96); opacity: 0;
        transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    }
    .claex-toast.show { transform: translateX(0) scale(1); opacity: 1; }
    .claex-toast.hide { transform: translateX(calc(100% + 40px)) scale(0.96); opacity: 0;
        transition: transform 0.4s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.35s ease; }

    .claex-toast::before {
        content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px;
        border-radius: 0 3px 3px 0; background: var(--claex-accent);
        box-shadow: 0 0 12px var(--claex-accent);
    }
    .claex-toast.type-error   { --claex-accent: #FF5A5F; }
    .claex-toast.type-warning { --claex-accent: #F5B544; }

    .claex-toast-icon {
        position: relative; width: 44px; height: 44px; border-radius: 13px;
        background: linear-gradient(180deg, #1A1E2A 0%, #0B0D13 100%);
        border: 1px solid rgba(255, 255, 255, 0.14);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 18px rgba(255, 255, 255, 0.05);
    }
    .claex-toast-icon svg { width: 22px; height: 22px; fill: #FFFFFF;
        filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35)); }
    .claex-toast-icon .claex-status-dot {
        position: absolute; right: -5px; bottom: -5px; width: 18px; height: 18px; border-radius: 50%;
        background: var(--claex-accent); color: #050508;
        font: 800 10px/18px 'JetBrains Mono', monospace; text-align: center;
        border: 2px solid #0A0C12; box-shadow: 0 0 10px var(--claex-accent);
    }

    .claex-toast-body { min-width: 0; }
    .claex-toast-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700;
        letter-spacing: 0.14em; text-transform: uppercase; color: var(--claex-accent);
        margin-bottom: 4px;
    }
    .claex-toast-title { font-size: 0.96rem; font-weight: 700; color: #FFFFFF;
        letter-spacing: -0.01em; line-height: 1.3; }
    .claex-toast-msg { margin-top: 4px; font-size: 0.84rem; line-height: 1.5; color: #A1A7B5;
        word-wrap: break-word; }
    .claex-toast-list { list-style: none; margin: 10px 0 0; padding: 0;
        display: flex; flex-direction: column; gap: 6px; }
    .claex-toast-list li {
        display: flex; align-items: flex-start; gap: 8px; font-size: 0.8rem; color: #D1D5DB;
        padding: 7px 10px; border-radius: 10px;
        background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.07);
    }
    .claex-toast-list li .chk {
        flex: 0 0 16px; height: 16px; border-radius: 5px; margin-top: 1px;
        background: var(--claex-accent); color: #050508;
        font: 800 10px/16px 'JetBrains Mono', monospace; text-align: center;
    }

    .claex-toast-close {
        width: 26px; height: 26px; border-radius: 8px; cursor: pointer;
        background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.10);
        color: #9CA3AF; font-size: 0.75rem; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }
    .claex-toast-close:hover { color: #FFFFFF; border-color: var(--claex-accent);
        background: rgba(255, 255, 255, 0.08); }

    .claex-toast-progress {
        position: absolute; left: 0; bottom: 0; height: 2.5px; width: 100%;
        background: var(--claex-accent); box-shadow: 0 0 10px var(--claex-accent);
        transform-origin: left center; transform: scaleX(1);
    }

    /* ── POP-UP DE CONFIRMAÇÃO (substitui confirm()) ── */
    .claex-dialog-overlay {
        position: fixed; inset: 0; z-index: 100001;
        background: rgba(3, 4, 7, 0.78);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        display: flex; align-items: center; justify-content: center; padding: 20px;
        opacity: 0; transition: opacity 0.28s ease;
    }
    .claex-dialog-overlay.show { opacity: 1; }
    .claex-dialog {
        --claex-accent: var(--neon-bright, #3B82F6);
        position: relative; width: min(460px, 100%); padding: 28px 26px 22px;
        background: linear-gradient(180deg, #171A24 0%, #0A0C12 100%);
        border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 22px;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(59, 130, 246, 0.12),
                    inset 0 1px 0 rgba(255, 255, 255, 0.12);
        font-family: 'Plus Jakarta Sans', 'Space Grotesk', system-ui, sans-serif; color: #E5E7EB;
        transform: translateY(18px) scale(0.96);
        transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .claex-dialog.danger { --claex-accent: #FF5A5F; }
    .claex-dialog-overlay.show .claex-dialog { transform: translateY(0) scale(1); }
    .claex-dialog-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .claex-dialog-head .claex-toast-icon { width: 52px; height: 52px; border-radius: 15px; }
    .claex-dialog-head .claex-toast-icon svg { width: 26px; height: 26px; }
    .claex-dialog-title { font-size: 1.25rem; font-weight: 700; color: #FFFFFF; margin: 0; }
    .claex-dialog-msg { font-size: 0.92rem; line-height: 1.65; color: #B0B5C3; margin: 0 0 22px; }
    .claex-dialog-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .claex-dialog-btn {
        font-family: inherit; font-size: 0.84rem; font-weight: 700; letter-spacing: 0.02em;
        padding: 11px 20px; border-radius: 999px; cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .claex-dialog-btn:hover { transform: translateY(-1px); }
    .claex-dialog-btn.ghost { background: rgba(255, 255, 255, 0.05); color: #D1D5DB;
        border: 1px solid rgba(255, 255, 255, 0.14); }
    .claex-dialog-btn.ghost:hover { border-color: rgba(255, 255, 255, 0.3); color: #FFFFFF; }
    .claex-dialog-btn.primary { background: var(--claex-accent); color: #FFFFFF;
        border: 1px solid var(--claex-accent); box-shadow: 0 0 22px var(--claex-accent); }
    .claex-dialog-btn.primary:hover { box-shadow: 0 0 32px var(--claex-accent); }

    @media (max-width: 600px) {
        .claex-toast-stack { top: auto; bottom: 16px; right: 16px; left: 16px; width: auto; }
        .claex-toast { transform: translateY(calc(100% + 40px)); }
        .claex-toast.show { transform: translateY(0); }
        .claex-toast.hide { transform: translateY(calc(100% + 40px)); }
    }
    @media (prefers-reduced-motion: reduce) {
        .claex-toast, .claex-dialog, .claex-dialog-overlay { transition: none !important; }
    }`;

    function injectStyles() {
        if (document.getElementById('claex-notify-styles')) return;
        const style = document.createElement('style');
        style.id = 'claex-notify-styles';
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Detecta o tipo da notificação pelo texto da mensagem
    function detectType(msg) {
        const t = String(msg || '').toLowerCase();
        if (/(erro|falha|não foi possível|nao foi possivel|inválid|invalid)/.test(t)) return 'error';
        if (/(sucesso|criad|salv|atualizad|excluíd|aprendida|calculada|realizado)/.test(t)) return 'success';
        if (/(aviso|apenas|restrito|selecione|atenção|permissão)/.test(t)) return 'warning';
        return 'info';
    }

    // Separa a mensagem: 1ª linha = título, linhas com ✅/✔/- viram checklist, o resto = texto
    function parseMessage(raw) {
        const lines = String(raw == null ? '' : raw).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const bullets = [];
        const text = [];
        lines.forEach(line => {
            const m = line.match(/^(✅|✔️|✔|☑️|•|-)\s*(.+)$/u);
            if (m) bullets.push(m[2]);
            else text.push(line);
        });
        return { text, bullets };
    }

    let stack = null;
    function getStack() {
        if (stack && document.body.contains(stack)) return stack;
        stack = document.createElement('div');
        stack.className = 'claex-toast-stack';
        stack.setAttribute('role', 'region');
        stack.setAttribute('aria-live', 'polite');
        stack.setAttribute('aria-label', 'Notificações CLAEX');
        document.body.appendChild(stack);
        return stack;
    }

    const active = new Set();

    function notify(message, opts) {
        opts = opts || {};
        const type = TYPES[opts.type] ? opts.type : detectType(message);
        const meta = TYPES[type];
        const parsed = parseMessage(message);

        let title = opts.title;
        let bodyLines = parsed.text;
        if (!title) {
            if (bodyLines.length > 1 || (bodyLines.length === 1 && parsed.bullets.length)) {
                title = bodyLines[0];
                bodyLines = bodyLines.slice(1);
            } else if (bodyLines.length === 1 && bodyLines[0].length <= 70) {
                title = bodyLines[0];
                bodyLines = [];
            } else {
                title = meta.title;
            }
        }

        const duration = typeof opts.duration === 'number'
            ? opts.duration
            : Math.min(9000, 4200 + String(message || '').length * 35);

        const record = { message: String(message == null ? '' : message), type, title: opts.title || null, duration };
        // Registra já, para sobreviver a um redirecionamento imediato (alert + location.href)
        active.add(record);

        const run = () => {
            injectStyles();
            const el = document.createElement('div');
            el.className = 'claex-toast type-' + type;
            el.setAttribute('role', type === 'error' ? 'alert' : 'status');

            el.innerHTML =
                '<div class="claex-toast-icon">' + AMPULHETA_SVG +
                    '<span class="claex-status-dot">' + meta.icon + '</span></div>' +
                '<div class="claex-toast-body">' +
                    '<div class="claex-toast-tag">' + meta.tag + '</div>' +
                    '<div class="claex-toast-title">' + escapeHtml(title) + '</div>' +
                    (bodyLines.length ? '<div class="claex-toast-msg">' + bodyLines.map(escapeHtml).join('<br>') + '</div>' : '') +
                    (parsed.bullets.length
                        ? '<ul class="claex-toast-list">' + parsed.bullets.map(b =>
                            '<li><span class="chk">✓</span><span>' + escapeHtml(b) + '</span></li>').join('') + '</ul>'
                        : '') +
                '</div>' +
                '<button type="button" class="claex-toast-close" aria-label="Fechar notificação">✕</button>' +
                '<div class="claex-toast-progress"></div>';

            getStack().appendChild(el);

            const progress = el.querySelector('.claex-toast-progress');
            let remaining = duration;
            let startedAt = 0;
            let timer = null;
            let closed = false;

            function close() {
                if (closed) return;
                closed = true;
                clearTimeout(timer);
                active.delete(record);
                el.classList.remove('show');
                el.classList.add('hide');
                setTimeout(() => el.remove(), 420);
            }

            function startTimer() {
                if (duration <= 0) return;
                startedAt = performance.now();
                progress.style.transition = 'transform ' + remaining + 'ms linear';
                progress.style.transform = 'scaleX(0)';
                timer = setTimeout(close, remaining);
            }

            function pauseTimer() {
                if (duration <= 0 || closed) return;
                clearTimeout(timer);
                remaining = Math.max(0, remaining - (performance.now() - startedAt));
                const ratio = remaining / duration;
                progress.style.transition = 'none';
                progress.style.transform = 'scaleX(' + ratio + ')';
            }

            el.querySelector('.claex-toast-close').addEventListener('click', close);
            el.addEventListener('mouseenter', pauseTimer);
            el.addEventListener('mouseleave', startTimer);

            requestAnimationFrame(() => {
                el.classList.add('show');
                requestAnimationFrame(startTimer);
            });

            // Limita a pilha a 4 notificações visíveis
            const toasts = getStack().querySelectorAll('.claex-toast:not(.hide)');
            if (toasts.length > 4) toasts[0].querySelector('.claex-toast-close').click();
        };

        if (document.body) run();
        else document.addEventListener('DOMContentLoaded', run, { once: true });
    }

    // ── POP-UP DE CONFIRMAÇÃO ESTILO CLAEX (Promise<boolean>) ────────────────
    function confirmDialog(message, opts) {
        opts = opts || {};
        return new Promise(resolve => {
            const open = () => {
                injectStyles();
                const danger = opts.danger != null
                    ? opts.danger
                    : /(excluir|deletar|remov|desvincular|apagar)/i.test(String(message));

                const overlay = document.createElement('div');
                overlay.className = 'claex-dialog-overlay';
                overlay.innerHTML =
                    '<div class="claex-dialog' + (danger ? ' danger' : '') + '" role="alertdialog" aria-modal="true" aria-labelledby="claex-dialog-title">' +
                        '<div class="claex-dialog-head">' +
                            '<div class="claex-toast-icon">' + AMPULHETA_SVG +
                                '<span class="claex-status-dot">' + (danger ? '!' : '?') + '</span></div>' +
                            '<div>' +
                                '<div class="claex-toast-tag">' + (danger ? 'MOTOR CLAEX // CONFIRMAR AÇÃO' : 'MOTOR CLAEX // CONFIRMAÇÃO') + '</div>' +
                                '<h3 class="claex-dialog-title" id="claex-dialog-title">' + escapeHtml(opts.title || (danger ? 'Tem certeza?' : 'Confirmar')) + '</h3>' +
                            '</div>' +
                        '</div>' +
                        '<p class="claex-dialog-msg">' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>' +
                        '<div class="claex-dialog-actions">' +
                            '<button type="button" class="claex-dialog-btn ghost" data-act="cancel">' + escapeHtml(opts.cancelText || 'Cancelar') + '</button>' +
                            '<button type="button" class="claex-dialog-btn primary" data-act="ok">' + escapeHtml(opts.confirmText || (danger ? 'Sim, confirmar' : 'Confirmar')) + '</button>' +
                        '</div>' +
                    '</div>';

                document.body.appendChild(overlay);
                const prevFocus = document.activeElement;
                const okBtn = overlay.querySelector('[data-act="ok"]');
                const cancelBtn = overlay.querySelector('[data-act="cancel"]');

                function finish(value) {
                    document.removeEventListener('keydown', onKey, true);
                    overlay.classList.remove('show');
                    setTimeout(() => overlay.remove(), 300);
                    if (prevFocus && prevFocus.focus) prevFocus.focus();
                    resolve(value);
                }

                function onKey(e) {
                    if (e.key === 'Escape') { e.preventDefault(); finish(false); }
                    else if (e.key === 'Enter') { e.preventDefault(); finish(true); }
                    else if (e.key === 'Tab') {
                        e.preventDefault();
                        (document.activeElement === okBtn ? cancelBtn : okBtn).focus();
                    }
                }

                okBtn.addEventListener('click', () => finish(true));
                cancelBtn.addEventListener('click', () => finish(false));
                overlay.addEventListener('click', e => { if (e.target === overlay) finish(false); });
                document.addEventListener('keydown', onKey, true);

                requestAnimationFrame(() => {
                    overlay.classList.add('show');
                    (danger ? cancelBtn : okBtn).focus();
                });
            };

            if (document.body) open();
            else document.addEventListener('DOMContentLoaded', open, { once: true });
        });
    }

    // ── PERSISTÊNCIA ENTRE PÁGINAS (alert + redirect) ────────────────────────
    function savePending() {
        if (!active.size) return;
        try {
            const items = Array.from(active).map(r => ({ message: r.message, type: r.type, title: r.title }));
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) { /* storage indisponível */ }
    }

    function restorePending() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            sessionStorage.removeItem(STORAGE_KEY);
            JSON.parse(raw).forEach((n, i) => {
                setTimeout(() => notify(n.message, { type: n.type, title: n.title || undefined }), 250 + i * 140);
            });
        } catch (e) { /* ignora */ }
    }

    window.addEventListener('pagehide', savePending);
    window.addEventListener('beforeunload', savePending);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restorePending, { once: true });
    } else {
        restorePending();
    }

    // ── API PÚBLICA ──────────────────────────────────────────────────────────
    window.CLAEX = Object.assign(window.CLAEX || {}, {
        __notifyReady: true,
        notify,
        success: (m, o) => notify(m, Object.assign({}, o, { type: 'success' })),
        error:   (m, o) => notify(m, Object.assign({}, o, { type: 'error' })),
        warning: (m, o) => notify(m, Object.assign({}, o, { type: 'warning' })),
        info:    (m, o) => notify(m, Object.assign({}, o, { type: 'info' })),
        confirm: confirmDialog,
        nativeAlert
    });

    // Substitui o alert() nativo ("localhost:8081 diz...") pela notificação CLAEX
    window.alert = function (message) {
        notify(message);
    };
})();
