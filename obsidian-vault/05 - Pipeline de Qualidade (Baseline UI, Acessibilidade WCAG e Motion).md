---
title: "05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)"
aliases:
  - "Pipeline Baseline UI"
  - "Motion UI e Motion Primitives CLAEX"
tags:
  - claex/v10
  - frontend/claude-design-toolkit
  - motion-ui
  - motion-primitives
  - wcag-aa
updated: 2026-11-17
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[01 - Modernização Frontend (Claude Code Design Toolkit)]]"
  - "[[02 - Design Tokens OKLCH e Theme Studio]]"
---

# ⚡ 05 — Pipeline de Qualidade: `baseline-ui` → `fixing-accessibility` → `Motion UI`

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]** | **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**

> [!info] Integração Oficial `Motion` + `Motion Primitives`
> Além das 3 verificações do [`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit), toda a camada cinética foi reescrita em [`motion-ui.js`](../lolooo-main/src/main/resources/static/js/motion-ui.js) utilizando **[`motion@11.15.0`](https://github.com/motiondivision/motion)** (`window.Motion`: `animate`, `inView`, `scroll`, `stagger`), presets **Motion UI Theme** (`snap`, `ui`, `gentle`, `lively`) e padrões **[`ibelick/motion-primitives`](https://github.com/ibelick/motion-primitives)**.

---

## 1. Fase 1: `baseline-ui` (Disciplina Espacial & Tipográfica)

- **Alinhamento Numérico Tabular (`tabular-nums`)**: aplicado ao rail de métricas do Hero, relógios da matriz em `grade.html`, contadores do simulador ON TRACK e placares KPI.
- **Cabeçalho em Cápsula Único (`white-space: nowrap`)**: impede que rótulos de navegação, crachás de perfil (`[ADM]`) ou botões `Minhas Infos` / `Sair` quebrem em múltiplas linhas em desktops e notebooks.
- **Notificações Zero-Collision (`claex-notify.js`)**: toasts posicionados no canto inferior direito (`bottom: 24px; right: 24px`) em carvão `#111112` limpo, sem `box-shadow` fluorescente e sem cobrir botões de cabeçalho (`Entrar`, `Criar conta`).

---

## 2. Fase 2: `fixing-accessibility` (WCAG 2.1 AA em Modo Claro & Carbon)

- **Skip-Link e Marcos ARIA**: `unlumen-effects.js` injeta automaticamente `.skip-to-content`, controla foco por `Escape` / `Tab` no Theme Studio e popup de perfis, e mantém regiões `aria-live="polite"`.
- **Contraste Verificado para Acid Lime `#D2FF00`**:
  - Em `data-surface="editorial"`, texto e links usam `--accent-ink` (`oklch(0.36 0.13 var(--brand-hue))`) ou `#111112`, enquanto `#D2FF00` é reservado para fundos de botões (`#111112` sobre lime), marcações sublinhadas e molduras.
  - Badge de usuário injetado dinamicamente por `api.js` (`.header-actions > span`) recebe cápsula com fundo sutil `--neon-subtle` e texto em tinta contrastada `--text-pure` via CSS puro (sem alterar `api.js`).

---

## 3. Fase 3: `Motion UI` & `fixing-motion-performance` (`js/motion-ui.js`)

| Primitiva / Presets | Padrão (`motion-primitives` / Motion UI) | Uso no CLAEX |
| :--- | :--- | :--- |
| **`MotionTheme`** | `{ snap: 0.28s, ui: 0.42s, gentle: 0.65s, lively: 0.50s, reducedMotion: 'calm' }` | Curvas calibrated cubic-bezier `[0.16, 1, 0.3, 1]` em todas as interações |
| **`MotionUI.textScramble`** | `TextScramble` | Decodificação de comando no CLI `claude-code` e eyebrow `PIT-WALL NOTE` |
| **`MotionUI.slidingNumber`** | `SlidingNumber` | Atualização numérica fluida de pendências no Simulador ON TRACK |
| **`Motion.inView` Seguro** | `InView` | Anima apenas elementos inicialmente abaixo da dobra (`opacity: 0.08 -> 1`), evitando elementos invisíveis em capturas ou atalhos de âncora |
| **`Motion.scroll` Docking** | `Scroll` Progress & Dock | Dirige `#lando-scroll-progress` e acopla `#logo-ampulheta` do Hero ao soquete CAD `#hub-center-target` |
| **Proteção Vestibular** | `prefers-reduced-motion: reduce` | Desativa movimentos e estabiliza transformações imediatamente sem prejudicar o funcionamento |
