---
title: "01 - Modernização Frontend (Claude Code Design Toolkit)"
aliases:
  - "Frontend Design Toolkit"
  - "Opticore Precision Studio"
tags:
  - claex/v10
  - frontend/claude-design-toolkit
  - design-system
  - ui-ux
created: 2026-04-20
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[02 - Design Tokens OKLCH e Theme Studio]]"
  - "[[05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)]]"
---

# 🎨 01 — Modernização Frontend (`Claude-Code-Frontend-Design-Toolkit`)

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]**

> [!info] Referência Base
> A modernização da interface do CLAEX v10 aplica diretamente as metodologias do repositório [**wilwaldon/Claude-Code-Frontend-Design-Toolkit**](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit):
> - **CLAUDE.md Theme Blocks** & `DESIGN.md` vivo na raiz do repositório.
> - **Design Tokens em espaço `OKLCH`** controlados por uma única variável `--brand-hue`.
> - **Bencium Controlled UX** (hierarquia tipográfica intencional, superfícies de carbono com tinta sutil de matiz e zero "AI Slop").
> - **Pipeline de Revisão em 3 Estágios**: `baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`.

---

## 1. Diagnóstico do Estado Anterior vs. Arquitetura v10

| Aspecto Visual | Antes (Legado) | Agora (CLAEX v10 — Design Toolkit) |
| :--- | :--- | :--- |
| **Sistema de Cores** | Mistura inconsistente de `#d2ff00` (lime fixo) em páginas internas (`tabela_cadastros.html`, `listar_sala.html`) com azul hexadecimal em `index.html`. | **100% unificado em `OKLCH`** via `design-tokens-oklch.css` derivado de `--brand-hue` (veja **[[02 - Design Tokens OKLCH e Theme Studio]]**). |
| **Troca de Tema** | Limitada a 2 cores estáticas e presente apenas na home page. | **Theme Studio OKLCH ao Vivo** em *todas* as páginas com **5 Presets** + **Slider Contínuo `0°–360°`**. |
| **Navegação Global** | Links quebrados (`<a href="painel_professor.html">mat</a>`) e falta de barra de anúncio nas páginas internas. | Cápsula flutuante **Opticore** padronizada + injeção automática da Topbar e Skip-Link WCAG em todas as páginas via `unlumen-effects.js`. |
| **Painel de Grade (`grade.html`)** | Apenas botão de gerar grade sem visibilidade das métricas matemáticas ou escolha de modelo de IA. | **Orquestrador Multi-Modelo IA**, seletor de estratégia do solver, **4 KPIs de Telemetria em Tempo Real** e badges de carga cognitiva por aula. |

---

## 2. Regras de Ouro ("Anti-AI-Slop") Implementadas em `CLAUDE.md`

Seguindo a seção **CLAUDE.md Theme Blocks** do toolkit de `wilwaldon`:

1. **Proibição de Fundos Cinzas Puros (`#000000` / `#1a1a1a` dessaturados)**:
   - Todas as superfícies escuras recebem uma micro-saturação (`chroma: 0.015` a `0.024`) tingida pela matiz ativa (`var(--brand-hue)`):
   ```css
   --surface-canvas:   oklch(11% 0.015 var(--brand-hue));
   --surface-elevated: oklch(15% 0.020 var(--brand-hue));
   --surface-card:     oklch(18% 0.024 var(--brand-hue));
   ```
2. **Hierarquia Tipográfica Tripla Intencional**:
   - **Display / Headings**: `'Space Grotesk'` com `letter-spacing: -0.03em` e `text-wrap: balance`.
   - **Corpo & Leitura Densa**: `'Plus Jakarta Sans'` com `text-wrap: pretty`.
   - **Telemetria, Horários e KPIs**: `'JetBrains Mono'` com `font-variant-numeric: tabular-nums` para alinhamento vertical perfeito de dígitos.
3. **Bordas Hairline Luminosas**:
   - Em vez de sombras pesadas e borradas, os cartões utilizam bordas de `1px solid oklch(95% 0.01 var(--brand-hue) / 0.08)` combinadas com destaque direcional quando selecionados.

---

## 3. Telemetria Pedagógica na Interface (`grade.html`)

Na página de geração de horários (`grade.html`), adicionamos o **Grid de Telemetria Multi-Objetivo** com 4 indicadores numéricos em tempo real:
- **Fitness Score Global**: Pontuação calculada pelo solver (ex.: `118.4 pts`) + estratégia executada (`MEMETIC_NSGA2_SA`).
- **Equilíbrio Cognitivo**: Percentual de balanceamento mental da turma (`0%–100%`) com barra de progresso dinâmica.
- **Eficiência de Janelas Docentes**: Contagem de buracos ociosos entre aulas do mesmo professor no dia (`0 janelas` = ideal).
- **Aulas Geminadas Alinhadas**: Pares consecutivos da mesma disciplina preservados sem quebra pelo recreio.

➡️ Próxima leitura: **[[02 - Design Tokens OKLCH e Theme Studio]]**
