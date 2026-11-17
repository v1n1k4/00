/**
 * CLAEX NOTIFY — Clean Editorial & Charcoal Notifications (Zero Neon)
 * Substitui alert() e confirm() mantendo persistência entre redirecionamentos.
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

    const CSS = `
    .claex-toast-stack {
        position: fixed; bottom: 24px; right: 24px; z-index: 100000;
        display: flex; flex-direction: column; gap: 10px;
        width: min(390px, calc(100vw - 32px)); pointer-events: none;
    }
    .claex-toast {
        --claex-accent: var(--neon-lime, #D2FF00);
        --claex-on-accent: var(--text-on-accent, #111112);
        position: relative; pointer-events: auto; overflow: hidden;
        display: grid; grid-template-columns: 40px 1fr 26px; gap: 12px; align-items: start;
        padding: 14px 14px 16px;
        background: #111112;
        border: 1px solid #2A2A2D;
        border-radius: 14px;
        box-shadow: 0 16px 36px rgba(17, 17, 18, 0.28);
        font-family: 'Mona Sans', system-ui, sans-serif;
        color: #EAEAE4;
        transform: translateX(calc(100% + 40px)); opacity: 0;
        transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
    }
    .claex-toast.show { transform: translateX(0); opacity: 1; }
    .claex-toast.hide { transform: translateX(calc(100% + 40px)); opacity: 0; }

    .claex-toast::before {
        content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
        background: var(--claex-accent);
    }
    .claex-toast.type-error   { --claex-accent: #EF4444; --claex-on-accent: #FFFFFF; }
    .claex-toast.type-warning { --claex-accent: #F59E0B; --claex-on-accent: #111112; }

    .claex-toast-icon {
        position: relative; width: 40px; height: 40px; border-radius: 10px;
        background: #18181A; border: 1px solid #2A2A2D;
        display: flex; align-items: center; justify-content: center;
    }
    .claex-toast-icon svg { width: 20px; height: 20px; fill: #F5F5F0; }
    .claex-toast-icon .claex-status-dot {
        position: absolute; right: -4px; bottom: -4px; width: 17px; height: 17px; border-radius: 50%;
        background: var(--claex-accent); color: var(--claex-on-accent);
        font: 800 10px/17px 'JetBrains Mono', monospace; text-align: center;
        border: 2px solid #111112;
    }

    .claex-toast-body { min-width: 0; }
    .claex-toast-tag {
        font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase; color: var(--claex-accent);
        margin-bottom: 3px;
    }
    .claex-toast-title { font-size: 0.92rem; font-weight: 700; color: #F5F5F0; line-height: 1.3; }
    .claex-toast-msg { margin-top: 4px; font-size: 0.82rem; line-height: 1.5; color: #A1A1AA; word-wrap: break-word; }
    .claex-toast-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
    .claex-toast-list li {
        display: flex; align-items: flex-start; gap: 8px; font-size: 0.78rem; color: #E5E7EB;
        padding: 6px 8px; border-radius: 8px; background: #18181A; border: 1px solid #2A2A2D;
    }
    .claex-toast-list li .chk {
        flex: 0 0 15px; height: 15px; border-radius: 4px; margin-top: 1px;
        background: var(--claex-accent); color: var(--claex-on-accent);
        font: 800 9px/15px 'JetBrains Mono', monospace; text-align: center;
    }

    .claex-toast-close {
        width: 24px; height: 24px; border-radius: 6px; cursor: pointer;
        background: #18181A; border: 1px solid #2A2A2D; color: #A1A1AA;
        font-size: 0.72rem; display: flex; align-items: center; justify-content: center;
    }
    .claex-toast-close:hover { color: #FFFFFF; border-color: #FFFFFF; }

    .claex-toast-progress {
        position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
        background: var(--claex-accent); transform-origin: left center; transform: scaleX(1);
    }

    .claex-dialog-overlay {
        position: fixed; inset: 0; z-index: 100001;
        background: rgba(17, 17, 18, 0.72);
        display: flex; align-items: center; justify-content: center; padding: 20px;
        opacity: 0; transition: opacity 0.2s ease;
    }
    .claex-dialog-overlay.show { opacity: 1; }
    .claex-dialog {
        --claex-accent: var(--neon-lime, #D2FF00);
        --claex-on-accent: var(--text-on-accent, #111112);
        position: relative; width: min(440px, 100%); padding: 26px;
        background: #111112; border: 1px solid #2A2A2D; border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
        font-family: 'Mona Sans', system-ui, sans-serif; color: #EAEAE4;
        transform: translateY(12px); transition: transform 0.25s ease;
    }
    .claex-dialog.danger { --claex-accent: #EF4444; --claex-on-accent: #FFFFFF; }
    .claex-dialog-overlay.show .claex-dialog { transform: translateY(0); }
    .claex-dialog-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .claex-dialog-title { font-size: 1.2rem; font-weight: 700; color: #F5F5F0; margin: 0; }
    .claex-dialog-msg { font-size: 0.9rem; line-height: 1.6; color: #A1A1AA; margin: 0 0 20px; }
    .claex-dialog-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .claex-dialog-btn {
        font-family: inherit; font-size: 0.82rem; font-weight: 700;
        padding: 10px 18px; border-radius: 999px; cursor: pointer;
    }
    .claex-dialog-btn.ghost { background: #18181A; color: #EAEAE4; border: 1px solid #2A2A2D; }
    .claex-dialog-btn.ghost:hover { border-color: #FFFFFF; }
    .claex-dialog-btn.primary { background: var(--claex-accent); color: var(--claex-on-accent); border: 1px solid #111112; }

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

    function detectType(msg) {
        const t = String(msg || '').toLowerCase();
        if (/(erro|falha|não foi possível|nao foi possivel|inválid|invalid)/.test(t)) return 'error';
        if (/(sucesso|criad|salv|atualizad|excluíd|aprendida|calculada|realizado)/.test(t)) return 'success';
        if (/(aviso|apenas|restrito|selecione|atenção|permissão)/.test(t)) return 'warning';
        return 'info';
    }

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
                setTimeout(() => el.remove(), 340);
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
                progress.style.transition = 'none';
                progress.style.transform = 'scaleX(' + (remaining / duration) + ')';
            }

            el.querySelector('.claex-toast-close').addEventListener('click', close);
            el.addEventListener('mouseenter', pauseTimer);
            el.addEventListener('mouseleave', startTimer);

            requestAnimationFrame(() => {
                el.classList.add('show');
                requestAnimationFrame(startTimer);
            });

            const toasts = getStack().querySelectorAll('.claex-toast:not(.hide)');
            if (toasts.length > 4) toasts[0].querySelector('.claex-toast-close').click();
        };

        if (document.body) run();
        else document.addEventListener('DOMContentLoaded', run, { once: true });
    }

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
                    setTimeout(() => overlay.remove(), 220);
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

    function savePending() {
        if (!active.size) return;
        try {
            const items = Array.from(active).map(r => ({ message: r.message, type: r.type, title: r.title }));
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {}
    }

    function restorePending() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            sessionStorage.removeItem(STORAGE_KEY);
            JSON.parse(raw).forEach((n, i) => {
                setTimeout(() => notify(n.message, { type: n.type, title: n.title || undefined }), 220 + i * 120);
            });
        } catch (e) {}
    }

    window.addEventListener('pagehide', savePending);
    window.addEventListener('beforeunload', savePending);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restorePending, { once: true });
    } else {
        restorePending();
    }

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

    window.alert = function (message) {
        notify(message);
    };
})();
