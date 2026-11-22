/* CLAEX — landing storytelling (front-end only).
   01 Abertura: tela escura → X → "CLAE" sai de dentro do X para a esquerda → CLAEX centralizado.
   02 Como funciona: rede neural interativa (rolagem no desktop + seleção por toque/botões 01..06).
   03 Exemplo: 4 passos da grade (rolagem no desktop + seleção direta 01..04 e Anterior/Próximo).
   No celular (<= 900px) a rolagem é 100% livre/natural e o usuário seleciona cada etapa tocando nos botões. */
(function () {
    'use strict';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = function () { return window.innerWidth <= 900; };
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

    /* progresso (0..1) de uma seção "pinned" no desktop */
    function progressOf(section) {
        var r = section.getBoundingClientRect();
        var span = section.offsetHeight - window.innerHeight;
        return span > 0 ? clamp(-r.top / span, 0, 1) : 1;
    }
    function scrollToProgress(section, p) {
        var top = section.getBoundingClientRect().top + window.scrollY;
        var span = section.offsetHeight - window.innerHeight;
        if (span > 0) {
            window.scrollTo({ top: top + span * p, behavior: reduce ? 'auto' : 'smooth' });
        }
    }

    /* ── 02 Como funciona (6 partes selecionáveis) ── */
    var como = document.getElementById('como');
    var stepsEl = document.getElementById('storySteps');
    if (como && stepsEl) {
        var steps = JSON.parse(stepsEl.textContent);
        var N = steps.length;
        var nodes = como.querySelectorAll('.net-node');
        var links = como.querySelectorAll('.net-link');
        var core = como.querySelector('.net-core');
        var pills = como.querySelectorAll('.cx-step-pill');
        var prevBtn = document.getElementById('comoPrev');
        var nextBtn = document.getElementById('comoNext');
        var num = document.getElementById('stepNum'), ttl = document.getElementById('stepTitle'),
            txt = document.getElementById('stepText'), bar = document.getElementById('stepBar');
        var current = -1;

        var setStep = function (i) {
            i = clamp(i, 0, N - 1);
            if (i === current) return;
            current = i;
            nodes.forEach(function (n, k) { n.classList.toggle('is-active', k === i); n.classList.toggle('is-done', k < i); });
            links.forEach(function (l, k) { l.classList.toggle('is-on', k <= i); l.classList.toggle('is-active', k === i); });
            pills.forEach(function (p, k) {
                p.classList.toggle('is-active', k === i);
                p.setAttribute('aria-pressed', k === i ? 'true' : 'false');
            });
            if (prevBtn) prevBtn.disabled = (i === 0);
            if (nextBtn) nextBtn.disabled = (i === N - 1);
            core.classList.toggle('is-final', i === N - 1);
            num.textContent = ('0' + (i + 1)).slice(-2);
            ttl.textContent = steps[i].n;
            txt.textContent = steps[i].t;
            bar.style.width = ((i + 1) / N * 100) + '%';
        };

        var selectComo = function (k) {
            setStep(k);
            if (!isMobile() && !reduce) {
                scrollToProgress(como, (k + 0.5) / N);
            }
        };

        var updateComo = function () {
            if (isMobile()) return;
            setStep(clamp(Math.floor(progressOf(como) * N * 0.999), 0, N - 1));
        };

        setStep(0);
        if (reduce) {
            nodes.forEach(function (n) { n.classList.add('is-done'); });
            links.forEach(function (l) { l.classList.add('is-on'); });
        } else {
            updateComo();
            window.addEventListener('scroll', updateComo, { passive: true });
            window.addEventListener('resize', updateComo);
        }

        nodes.forEach(function (n, k) {
            n.addEventListener('click', function () { selectComo(k); });
            n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectComo(k); } });
        });
        pills.forEach(function (p, k) {
            p.addEventListener('click', function () { selectComo(k); });
        });
        if (prevBtn) prevBtn.addEventListener('click', function () { selectComo(current - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { selectComo(current + 1); });
    }

    /* ── 03 Exemplo (4 passos selecionáveis da grade) ── */
    var ex = document.getElementById('exemplo');
    if (ex) {
        var evs = Array.prototype.slice.call(ex.querySelectorAll('.cx-ev'));
        var conflicts = evs.filter(function (e) { return e.dataset.c; })
            .sort(function (a, b) { return a.dataset.c - b.dataset.c; });
        var olis = ex.querySelectorAll('.cx-ex-steps li');
        var exPrev = document.getElementById('exPrev');
        var exNext = document.getElementById('exNext');
        var exStepLabel = document.getElementById('exStepLabel');
        var confEl = document.getElementById('exConf'), qEl = document.getElementById('exQ'), barEl = document.getElementById('exBar');
        var NC = conflicts.length;
        var last = '';
        var currentStep = 0;

        /* Mapeamento de progresso para cada um dos 4 passos */
        var STEP_PROGRESS = [0.05, 0.30, 0.68, 1.0];

        var render = function (p) {
            var s = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.86 ? 2 : 3;
            var resolved = s === 3 ? NC : s === 2 ? Math.max(1, Math.floor(clamp((p - 0.42) / 0.44, 0, 1) * NC)) : 0;
            var key = s + ':' + resolved;
            if (key === last) return;
            last = key;
            currentStep = s;

            olis.forEach(function (li, k) {
                li.classList.toggle('is-active', k === s);
                li.classList.toggle('is-done', k < s);
                li.setAttribute('aria-selected', k === s ? 'true' : 'false');
            });
            if (exStepLabel) exStepLabel.textContent = 'Passo ' + (s + 1) + ' de 4';
            if (exPrev) exPrev.disabled = (s === 0);
            if (exNext) exNext.disabled = (s === 3);

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
            var q = s === 0 ? 0 : s === 1 ? 18 : s === 3 ? 100 : Math.round(18 + (resolved / NC) * 76);
            qEl.textContent = q + '%';
            barEl.style.width = q + '%';
        };

        var selectExStep = function (stepIdx) {
            stepIdx = clamp(stepIdx, 0, 3);
            var p = STEP_PROGRESS[stepIdx];
            render(p);
            if (!isMobile() && !reduce) {
                scrollToProgress(ex, p);
            }
        };

        var updateEx = function () {
            if (isMobile()) return;
            render(progressOf(ex));
        };

        if (reduce) {
            render(1);
        } else if (isMobile()) {
            /* No celular começa no passo 2 (Conflitos aparecem) para já mostrar a grade viva e colorida */
            render(STEP_PROGRESS[1]);
        } else {
            render(progressOf(ex));
        }

        if (!reduce) {
            window.addEventListener('scroll', updateEx, { passive: true });
            window.addEventListener('resize', updateEx);
        }

        olis.forEach(function (li, k) {
            li.addEventListener('click', function () { selectExStep(k); });
            li.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectExStep(k); }
            });
        });
        if (exPrev) exPrev.addEventListener('click', function () { selectExStep(currentStep - 1); });
        if (exNext) exNext.addEventListener('click', function () { selectExStep(currentStep + 1); });
    }
})();
