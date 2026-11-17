---
title: "00 - MOC (Mapa de Conteúdo CLAEX v10)"
aliases:
  - "CLAEX v10 MOC"
  - "Índice CLAEX"
tags:
  - claex/v10
  - moc
  - frontend/claude-design-toolkit
  - oklch
  - algoritmos/nsga-ii
  - algoritmos/simulated-annealing
  - ia/multi-modelo
created: 2026-04-20
status: concluído
repo: "https://github.com/v1n1k4/00"
toolkit_ref: "https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit"
---

# 🧭 00 — Mapa de Conteúdo (MOC): Modernização CLAEX v10

> [!abstract] Resumo Executivo
> Este cofre Obsidian documenta a modernização completa do **Motor Inteligente de Grades Escolares CLAEX (v10)** no repositório `v1n1k4/00`. A atualização une os fundamentos visuais do [**wilwaldon/Claude-Code-Frontend-Design-Toolkit**](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit) com uma nova arquitetura algorítmica **Memética NSGA-II + Simulated Annealing + Kempe-Chain 2-Opt** e **Orquestração Multi-Modelo de IA** (`gemini-2.5-pro`, `gemini-2.5-flash`, `claude-sonnet-4-20250514`, `o3-mini` e fallback Neuro-Simbólico).

---

## 🗂️ Índice de Notas Atômicas (WikiLinks)

1. 🎨 **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**
   - Aplicação prática dos *CLAUDE.md Theme Blocks*, *Bencium Controlled UX*, anti-patterns evitados ("AI Slop") e arquitetura visual **Opticore Precision Studio**.
2. 🌈 **[[02 - Design Tokens OKLCH e Theme Studio]]**
   - Como uma única variável raiz `--brand-hue` governa toda a paleta cromática em espaço perceptual `oklch(L C H)`, mais o funcionamento do **Theme Studio ao Vivo** com 5 presets e slider `0°–360°`.
3. 🧬 **[[03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing)]]**
   - Formulação matemática da função de aptidão (*Fitness Function*), recozimento simulado com critério de Metropolis, busca local 2-Opt e métricas de carga cognitiva e janelas docentes.
4. 🧠 **[[04 - Orquestração Multi-Modelo IA (Gemini 2.5 Pro, Claude Sonnet 4, o3-mini)]]**
   - Arquitetura de roteamento entre LLMs de raciocínio avançado, persistência de regras aprendidas (`RegraIaGrade`) e motor Neuro-Simbólico determinístico para operação resiliente offline.
5. ♿ **[[05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)]]**
   - Sequência de auditoria em 3 fases (`baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`), tipografia `tabular-nums`, contraste WCAG AA e respeito a `prefers-reduced-motion`.
6. 🗺️ **[[CLAEX-v10-Architecture.canvas|Quadro Visual de Arquitetura (Obsidian Canvas)]]**
   - Mapa mental interativo conectando Frontend OKLCH, Solver Meta-Heurístico e Orquestrador Multi-Modelo.

---

## 🏗️ Diagrama Geral da Arquitetura CLAEX v10

```mermaid
flowchart TB
    subgraph UI["🎨 Frontend — Claude Code Design Toolkit"]
        Tokens["design-tokens-oklch.css<br/>Single --brand-hue (0°–360°)"]
        ThemeStudio["unlumen-effects.js<br/>Live OKLCH Theme Studio + Topbar"]
        GradeUI["grade.html<br/>KPIs de Telemetria + Seletor Multi-Modelo"]
    end

    subgraph Engine["🧬 Motor Meta-Heurístico Híbrido (Java & Python)"]
        NSGA["População NSGA-II / Memético<br/>(Elitismo + Torneio + Crossover)"]
        SA["Simulated Annealing<br/>P = exp(ΔE / T)"]
        Kempe["2-Opt Kempe-Chain Repair<br/>Compactação de Janelas & Geminadas"]
    end

    subgraph AI["🧠 Orquestrador Multi-Modelo IA"]
        Router["GeminiScheduleAdvisorService"]
        G25Pro["Gemini 2.5 Pro<br/>(Deep Reasoning)"]
        G25Flash["Gemini 2.5 Flash<br/>(Low-Latency)"]
        Claude4["Claude Sonnet 4<br/>(Ergonomia Pedagógica)"]
        O3Mini["OpenAI o3-mini<br/>(Formal CSP)"]
        Neuro["Motor Neuro-Simbólico v10<br/>(Fallback Determinístico)"]
    end

    Tokens --> ThemeStudio --> GradeUI
    GradeUI -->|POST /grade/gerargrade/{id}?estrategia=...| NSGA
    NSGA --> SA --> Kempe
    GradeUI -->|GET /grade/ia/analisar/{id}?modelo=...| Router
    Router --> G25Pro & G25Flash & Claude4 & O3Mini & Neuro
```

---

## 📁 Mapa de Arquivos Modificados no Repositório

| Camada | Caminho no Repositório | Papel na Modernização v10 |
| :--- | :--- | :--- |
| **Governança UI** | `CLAUDE.md` / `DESIGN.md` | Diretrizes do *Claude-Code-Frontend-Design-Toolkit*, Theme Blocks e tokens OKLCH |
| **Tokens CSS** | `lolooo-main/src/main/resources/static/css/design-tokens-oklch.css` | Sistema cromático perceptual baseado em `--brand-hue` e escala tipográfica fluida |
| **Theme Studio** | `lolooo-main/src/main/resources/static/js/unlumen-effects.js` | Popover interativo OKLCH, injeção de topbar global e skip-link WCAG |
| **Cliente API** | `lolooo-main/src/main/resources/static/js/api.js` | Suporte a parâmetros de `estrategia` e `modelo` nos endpoints de grade e IA |
| **Painel de Grade** | `lolooo-main/src/main/resources/static/grade.html` | Barra de Orquestração IA + 4 KPIs de telemetria + badges de carga cognitiva |
| **Solver Java** | `lolooo-main/src/main/java/com/claex/crud/Service/GradeService.java` | Algoritmo Memético NSGA-II + Simulated Annealing + Kempe-Chain 2-Opt |
| **Advisor IA Java** | `lolooo-main/src/main/java/com/claex/crud/Service/GeminiScheduleAdvisorService.java` | Roteamento Multi-Modelo (`gemini-2.5-pro`, `claude-sonnet-4`, `o3-mini`) + Neuro-Simbólico |
| **Backend Python** | `backend_python/main.py` | Paridade 100% com o backend Java em FastAPI + SQLAlchemy + auto-seed de demonstração |

> [!tip] Como abrir este cofre no seu computador
> 1. Abra o **Obsidian** → **Open folder as vault** (Abrir pasta como cofre).
> 2. Selecione a pasta `obsidian-vault/` dentro do seu repositório `00`.
> 3. Clique em `CLAEX-v10-Architecture.canvas` ou abra o **Graph View (`Ctrl/Cmd + G`)** para visualizar todas as conexões entre as notas!
