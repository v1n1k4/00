---
title: "00 - MOC (Mapa de Conteúdo CLAEX v10)"
aliases:
  - "CLAEX v10 MOC"
  - "Índice CLAEX"
tags:
  - claex/v10
  - moc
  - frontend/claude-design-toolkit
  - landonorris-editorial
  - motion-ui
  - oklch
  - algoritmos/nsga-ii
  - algoritmos/simulated-annealing
  - ia/multi-modelo
updated: 2026-11-17
status: concluído
repo: "https://github.com/v1n1k4/00"
toolkit_ref: "https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit"
cli_ref: "https://github.com/anthropics/claude-code"
aesthetic_ref: "https://landonorris.com/"
motion_ref: "https://github.com/motiondivision/motion"
---

# 🧭 00 — Mapa de Conteúdo (MOC): Arquitetura CLAEX v10 (Zero-Neon Editorial × Motion UI)

> [!abstract] Resumo Executivo
> Este cofre Obsidian documenta o ecossistema completo do **Motor Inteligente de Grades Escolares CLAEX (v10)** no repositório `v1n1k4/00`. Na evolução mais recente do front-end, todo o **excesso de neon luminescentes (`box-shadow: 0 0 ...`, feixes `.edge-light-*`, blobs borrados e overrides roxos)** foi substituído por uma arquitetura **Editorial Zero-Neon** guiada por quatro pilares:
> 1. **[Lando Norris (`landonorris.com`)](https://landonorris.com/)** — papel off-white (`#F5F5F0`), contraste binário em carvão `#111112`, cards com recorte chanfrado SVG e footer emoldurado em Acid Lime (`#D2FF00`).
> 2. **[`anthropics/claude-code`](https://github.com/anthropics/claude-code)** — minimalismo tipográfico, terminal agêntico CLAEX CLI e comandos `/optimize`, `/audit`, `/livery`, `/surface`.
> 3. **[`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)** — variável raiz `--brand-hue` em espaço perceptual `OKLCH`, zero AI slop e pipeline em 3 etapas (`baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`).
> 4. **[Motion & Motion UI (`motiondivision/motion` + `ibelick/motion-primitives`)](https://motion.dev/magazine/introducing-motion-ui)** — motor físico modular em [`motion-ui.js`](../lolooo-main/src/main/resources/static/js/motion-ui.js) sem alterar nenhuma linha do back-end Java/Python ou de `api.js`.

---

## 🗂️ Índice de Notas Atômicas (WikiLinks)

1. 🎨 **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**
   - Remoção integral de neon em excesso, contrato visual **Editorial Light (`#F5F5F0`) + Charcoal Contrast Band (`#111112`)** e referências de design aplicadas nas 9 telas do CLAEX.
2. 🌈 **[[02 - Design Tokens OKLCH e Theme Studio]]**
   - Polaridade dupla (`data-surface="editorial"` padrão vs. `data-surface="carbon"`), contraste seguro WCAG (`--accent-ink` e `--text-on-accent`), 5 liveries F1 em `--brand-hue` e **Theme Studio** ao vivo.
3. 🧬 **[[03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing)]]**
   - Formulação matemática da função de aptidão (*Fitness Function*), recozimento simulado com critério de Metropolis, busca local 2-Opt e métricas de carga cognitiva.
4. 🧠 **[[04 - Orquestração Multi-Modelo IA (Gemini 2.5 Pro, Claude Sonnet 4, o3-mini)]]**
   - Arquitetura de roteamento entre LLMs de raciocínio avançado, persistência de regras aprendidas (`RegraIaGrade`) e motor Neuro-Simbólico determinístico.
5. ⚡ **[[05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)]]**
   - Migração de efeitos pesados para **Motion UI (`motion@11.15.0`)** + **`motion-primitives`** (`TextScramble`, `SlidingNumber`, `InView`, `Scroll` docking), acessibilidade WCAG AA em temas claro/escuro e `prefers-reduced-motion`.
6. 🗺️ **[[CLAEX-v10-Architecture.canvas|Quadro Visual de Arquitetura (Obsidian Canvas)]]**
   - Mapa mental interativo conectando Frontend Editorial Zero-Neon, Motion UI, Solver Meta-Heurístico e Orquestrador Multi-Modelo.

---

## 🏗️ Diagrama Geral da Arquitetura CLAEX v10

```mermaid
flowchart TB
    subgraph UI["🎨 Frontend Editorial Zero-Neon — Lando × Claude Code × Motion UI"]
        Tokens["design-tokens-oklch.css<br/>Single --brand-hue + Editorial/Carbon"]
        Motion["motion-ui.js + motion@11.15.0<br/>MotionTheme (snap/ui/gentle/lively) & Primitives"]
        ThemeStudio["unlumen-effects.js<br/>Live Theme Studio + Claude CLI + CAD Canvas"]
        GradeUI["grade.html (9 Páginas Unificadas)<br/>KPIs de Telemetria + Matriz Semanal"]
    end

    subgraph Engine["🧬 Motor Meta-Heurístico Híbrido (Java & Python — Intocados)"]
        NSGA["População NSGA-II / Memético<br/>(Elitismo + Torneio + Crossover)"]
        SA["Simulated Annealing<br/>P = exp(ΔE / T)"]
        Kempe["2-Opt Kempe-Chain Repair<br/>Compactação de Janelas & Geminadas"]
    end

    subgraph AI["🧠 Orquestrador Multi-Modelo IA"]
        Router["GeminiScheduleAdvisorService"]
        G25Pro["Gemini 2.5 Pro"]
        G25Flash["Gemini 2.5 Flash"]
        Claude4["Claude Sonnet 4"]
        O3Mini["OpenAI o3-mini"]
        Neuro["Motor Neuro-Simbólico v10"]
    end

    Tokens --> ThemeStudio --> GradeUI
    Motion --> GradeUI
    GradeUI -->|POST /grade/gerargrade/{id}?estrategia=...| NSGA
    NSGA --> SA --> Kempe
    GradeUI -->|GET /grade/ia/analisar/{id}?modelo=...| Router
    Router --> G25Pro & G25Flash & Claude4 & O3Mini & Neuro
```

---

## 📁 Mapa de Arquivos do Repositório

| Camada | Caminho no Repositório | Papel na Arquitetura Atual |
| :--- | :--- | :--- |
| **Governança UI** | `CLAUDE.md` / `DESIGN.md` | Diretrizes Zero-Neon, Lando Norris + *Claude-Code-Frontend-Design-Toolkit* + Motion UI |
| **Tokens CSS** | `lolooo-main/src/main/resources/static/css/design-tokens-oklch.css` | Polaridade Editorial (`#F5F5F0`) / Carbon (`#111112`) + `--brand-hue` WCAG |
| **Estilos Base & Lando Layout** | `lolooo-main/src/main/resources/static/css/style.css` & `style-v5-extensions.css` | Cápsula editorial, hero `1:2`, galeria escura chanfrada, CLI terminal & footer `#D2FF00` |
| **Motor Motion UI** | `lolooo-main/src/main/resources/static/js/motion-ui.js` | `MotionTheme` presets, `textScramble`, `slidingNumber`, `inView`, docking da ampulheta via `Motion.scroll` |
| **Theme Studio & CAD** | `lolooo-main/src/main/resources/static/js/unlumen-effects.js`, `webgl-background.js`, `claex-notify.js` | Alternância Editorial/Carbon, topografia CAD matte e notificações limpas zero-neon |
| **Páginas Unificadas (9 HTML)** | `lolooo-main/src/main/resources/static/*.html` | Front-end completo mantendo 100% dos IDs DOM, RBAC e `js/api.js` originais |
| **Back-end Java / Python** | `lolooo-main/src/main/java/**`, `backend_python/main.py` | **Intocados** (regras de negócio, solver NSGA-II + SA e contratos REST preservados) |
