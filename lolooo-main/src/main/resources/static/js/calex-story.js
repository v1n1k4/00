/* CLAEX — landing storytelling (front-end only).
   01 Abertura: tela preta → X → "CLAE" sai de dentro do X para a esquerda → CLAEX centralizado.
   02 Como funciona: rede neural em volta do motor; a rolagem acende uma parte por vez.
   03 Exemplo: conflitos aparecem e são resolvidos conforme a rolagem.
   Sem dependências; respeita prefers-reduced-motion (estado final estático). */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

    /* ── 01 Abertura ── */
    var intro = document.getElementById('capa_index');
    if (intro) {
        if (reduce) { intro.classList.add('is-on', 'is-done'); }
        else {
            requestAnimationFrame(function () { requestAnimationFrame(function () {
                intro.classList.add('is-x');
                setTimeout(function () { intro.classList.add('is-on'); }, 900);
                setTimeout(function () { intro.classList.add('is-done'); }, 2300);
            }); });
        }
    }

    /* progresso (0..1) de uma seção "pinned" */
    function progressOf(section) {
        var r = section.getBoundingClientRect();
        var span = section.offsetHeight - window.innerHeight;
        return span > 0 ? clamp(-r.top / span, 0, 1) : 1;
    }
    function scrollToProgress(section, p) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        var span = section.offsetHeight - window.innerHeight;
        window.scrollTo({ top: top + span * p, behavior: reduce ? 'auto' : 'smooth' });
    }

    /* ── 02 Como funciona ── */
    var como = document.getElementById('como');
    var stepsEl = document.getElementById('storySteps');
    if (como && stepsEl) {
        var steps = JSON.parse(stepsEl.textContent);
        var N = steps.length;
        var nodes = como.querySelectorAll('.net-node');
        var links = como.querySelectorAll('.net-link');
        var core = como.querySelector('.net-core');
        var num = document.getElementById('stepNum'), ttl = document.getElementById('stepTitle'),
            txt = document.getElementById('stepText'), bar = document.getElementById('stepBar');
        var current = -1;

        var setStep = function (i) {
            if (i === current) return;
            current = i;
            nodes.forEach(function (n, k) { n.classList.toggle('is-active', k === i); n.classList.toggle('is-done', k < i); });
            links.forEach(function (l, k) { l.classList.toggle('is-on', k <= i); l.classList.toggle('is-active', k === i); });
            core.classList.toggle('is-final', i === N - 1);
            num.textContent = ('0' + (i + 1)).slice(-2);
            ttl.textContent = steps[i].n;
            txt.textContent = steps[i].t;
            bar.style.width = ((i + 1) / N * 100) + '%';
        };
        var update = function () { setStep(clamp(Math.floor(progressOf(como) * N * 0.999), 0, N - 1)); };

        if (reduce) { nodes.forEach(function (n) { n.classList.add('is-done'); }); links.forEach(function (l) { l.classList.add('is-on'); }); }
        else { update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); }

        nodes.forEach(function (n, k) {
            var go = function () { scrollToProgress(como, (k + 0.5) / N); };
            n.addEventListener('click', go);
            n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
    }

    /* ── 03 Exemplo ── */
    var ex = document.getElementById('exemplo');
    if (ex) {
        var evs = Array.prototype.slice.call(ex.querySelectorAll('.cx-ev'));
        var conflicts = evs.filter(function (e) { return e.dataset.c; })
            .sort(function (a, b) { return a.dataset.c - b.dataset.c; });
        var olis = ex.querySelectorAll('.cx-ex-steps li');
        var confEl = document.getElementById('exConf'), qEl = document.getElementById('exQ'), barEl = document.getElementById('exBar');
        var NC = conflicts.length;
        var last = '';

        var render = function (p) {
            var s = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.86 ? 2 : 3;
            var resolved = s === 3 ? NC : s === 2 ? Math.floor(clamp((p - 0.42) / 0.44, 0, 1) * NC) : 0;
            var key = s + ':' + resolved;
            if (key === last) return; last = key;
            olis.forEach(function (li, k) { li.classList.toggle('is-active', k === s); li.classList.toggle('is-done', k < s); });
            evs.forEach(function (e) {
                var c = e.dataset.c ? parseInt(e.dataset.c, 10) : 0;
                var ghost = s === 0;
                var bad = c && s >= 1 && c > resolved;
                e.classList.toggle('is-ghost', ghost);
                e.classList.toggle('is-bad', !!bad);
                e.classList.toggle('is-ok', !!c && !bad && s >= 2);
            });
            var left = s === 0 ? 0 : NC - resolved;
            confEl.textContent = left;
            confEl.classList.toggle('is-zero', s >= 2 && left === 0);
            var q = s === 0 ? 0 : s === 1 ? 18 : Math.round(18 + (resolved / NC) * 76);
            qEl.textContent = q + '%';
            barEl.style.width = q + '%';
        };
        if (reduce) { render(1); }
        else { render(progressOf(ex)); window.addEventListener('scroll', function () { render(progressOf(ex)); }, { passive: true }); }
    }
})();
