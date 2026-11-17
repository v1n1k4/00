---
title: "05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)"
aliases:
  - "Pipeline Baseline UI"
  - "Acessibilidade e Motion CLAEX"
tags:
  - claex/v10
  - frontend/claude-design-toolkit
  - wcag-aa
  - motion-performance
  - baseline-ui
created: 2026-04-20
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[01 - Modernização Frontend (Claude Code Design Toolkit)]]"
  - "[[02 - Design Tokens OKLCH e Theme Studio]]"
---

# ♿ 05 — Pipeline de Qualidade: `baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]** | **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**

> [!info] O Pipeline de 3 Skills do Toolkit
> No repositório [`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit), a recomendação central para garantir acabamento de nível produção é rodar três verificações em sequência:
> 1. **`baseline-ui`**: Consistência de espaçamento, hierarquia tipográfica, alinhamento tabular e estados vazios/erro.
> 2. **`fixing-accessibility`**: Navegação por teclado, anéis `:focus-visible`, *Skip Links*, semântica ARIA e contraste WCAG 2.1 AA.
> 3. **`fixing-motion-performance`**: Animações restritas a `transform` e `opacity` (GPU-composited) e respeito estrito a `@media (prefers-reduced-motion: reduce)`.

---

## 1. Fase 1: `baseline-ui` (Fundação Visual e Tipográfica)

- **Alinhamento Numérico Tabular (`tabular-nums`)**:
  - Aplicado a todas as células de horário (`.col-horario`), contadores de salas/professores, badges de carga cognitiva e KPIs de telemetria (`.kpi-telemetry-value`):
  ```css
  .tabular-nums, .col-horario, .metric-display, .kpi-telemetry-value {
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum" 1, "zero" 1;
  }
  ```
- **Prevenção de Linhas Órfãs (`text-wrap`)**:
  - `h1, h2, h3` utilizam `text-wrap: balance` para distribuir títulos de forma simétrica.
  - Parágrafos e relatórios da IA utilizam `text-wrap: pretty` com largura máxima de leitura confortável (`65ch`).

---

## 2. Fase 2: `fixing-accessibility` (WCAG 2.1 AA)

- **Injeção Automática de Skip-Link**:
  - `unlumen-effects.js` injeta automaticamente `<a href="#main-content" class="skip-to-content">Pular para o conteúdo principal</a>` no topo do `<body>` e garante que o `<main>` possua `id="main-content"`.
- **Anel de Foco de Alta Visibilidade (`:focus-visible`)**:
  - Todos os botões, links da cápsula flutuante, seletores de modelo e inputs exibem um anel duplo em `OKLCH`:
  ```css
  :focus-visible {
      outline: 2px solid var(--accent-bright);
      outline-offset: 3px;
      box-shadow: 0 0 0 5px oklch(62% 0.20 var(--brand-hue) / 0.22);
  }
  ```
- **Regiões `aria-live="polite"`**:
  - Os KPIs de telemetria e o console do **Orquestrador Multi-Modelo IA** em `grade.html` anunciam atualizações de status sem interromper leitores de tela.

---

## 3. Fase 3: `fixing-motion-performance` (60fps & Reduced Motion)

- **Curvas de Easing Naturais**:
  - Substituímos transições lineares por `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` e `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Proteção Vestibular (`prefers-reduced-motion: reduce`)**:
  - Em `design-tokens-oklch.css`, usuários com sensibilidade a movimento têm todas as animações decorativas, feixes de circuito e deslocamentos 3D desativados instantaneamente, preservando 100% da funcionalidade.
