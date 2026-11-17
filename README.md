# CLAEX v10 — Motor Inteligente de Grades Escolares & Multi-Model AI

> **Modernização de Design System (OKLCH) & Otimização Meta-Heurística Híbrida**  
> Baseado no [**wilwaldon/Claude-Code-Frontend-Design-Toolkit**](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit) + **Motor Memético NSGA-II / Simulated Annealing** + **Orquestrador Multi-Modelo IA**.

---

## ✨ Destaques da Modernização v10

### 1. Frontend & Design System (`Claude-Code-Frontend-Design-Toolkit`)
- **Arquitetura de Design Tokens em `OKLCH`** ([`design-tokens-oklch.css`](lolooo-main/src/main/resources/static/css/design-tokens-oklch.css)):
  - Toda a atmosfera cromática deriva de uma única variável raiz `--brand-hue` (padrão `255` — Azul Escolar), mantendo luminosidade perceptual uniforme (`L`) e croma controlado (`C`) em superfícies escuras (`oklch(11% 0.015 var(--brand-hue))`).
- **Live OKLCH Theme Studio** ([`unlumen-effects.js`](lolooo-main/src/main/resources/static/js/unlumen-effects.js)):
  - Popover interativo em todas as páginas com **5 Presets Estéticos** (*Azul Escolar 255°*, *Esmeralda Docente 162°*, *Violeta IA 282°*, *Âmbar Solar 68°*, *Ciano Telemetria 202°*) e **Slider Contínuo de Matiz OKLCH (`0°–360°`)** em tempo real.
- **Pipeline de Qualidade (`baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`)**:
  - Tipografia tabular (`font-variant-numeric: tabular-nums`) nas matrizes horárias e KPIs, `text-wrap: balance` em títulos, anéis de foco `:focus-visible`, Skip Links (`Pular para o conteúdo principal`), e suporte integral a `prefers-reduced-motion: reduce`.
- **Documentação de Governança Visual**:
  - [`CLAUDE.md`](CLAUDE.md) e [`DESIGN.md`](DESIGN.md) na raiz do projeto com os *Theme Blocks*, anti-patterns proibidos e regras de arquitetura.

---

### 2. Otimizador Meta-Heurístico Híbrido (Java + Python)
Substituímos a mutação aleatória simples por um solver **Memético NSGA-II + Recozimento Simulado (Simulated Annealing) + Reparo Local 2-Opt Kempe-Chain** em [`GradeService.java`](lolooo-main/src/main/java/com/claex/crud/Service/GradeService.java) e [`backend_python/main.py`](backend_python/main.py):

- **Travas Rígidas (Hard Constraints)**:
  - Máximo estrito de **2 aulas consecutivas** do mesmo professor ou disciplina.
  - Proibição de um único docente dominar o dia letivo inteiro de uma turma.
  - Verificação multi-escolar (`verificarDisponibilidadeProfessor`) impedindo conflitos de horário entre salas ou instituições distintas.
- **Otimização Multi-Objetivo (Soft Constraints & Bem-Estar)**:
  - **Equilíbrio de Carga Cognitiva (`pesoCognitivoMateria`)**: Evita concentrar disciplinas de alta abstração analítica nos últimos slots ou em sequência exaustiva.
  - **Minimização de Janelas Ociosas Docentes (`janelasDocentes`)**: Compacta os blocos de aula do professor no mesmo dia.
  - **Alinhamento de Aulas Geminadas**: Evita quebrar blocos duplos ao meio pelo intervalo/recreio.

---

### 3. Orquestrador Multi-Modelo de IA (`GeminiScheduleAdvisorService`)
Suporte a múltiplos modelos de raciocínio com roteamento inteligente e fallback **Neuro-Simbólico Contextual** offline:
1. **`gemini-2.5-pro`** (*Deep Pedagogical & Combinatorial Reasoning*)
2. **`gemini-2.5-flash`** (*Low-Latency Real-Time Schedule Telemetry*)
3. **`claude-sonnet-4-20250514`** (*Pedagogical Architecture & Human Ergonomics*)
4. **`o3-mini`** (*Formal Constraint Satisfaction & Math Verification*)
5. **`claex-neuro-symbolic-v10`** (*Motor Local Determinístico com Telemetria Real da Sala*)

---

### 4. Segundo Cérebro / Vault do Obsidian (`obsidian-vault/`)
Toda a arquitetura, fórmulas matemáticas, decisões de design e guias de uso foram documentados em um cofre nativo do **Obsidian** em [`obsidian-vault/`](obsidian-vault/):
- [`00 - MOC (Mapa de Conteúdo CLAEX v10).md`](obsidian-vault/00%20-%20MOC%20(Mapa%20de%20Conteúdo%20CLAEX%20v10).md)
- [`01 - Modernização Frontend (Claude Code Design Toolkit).md`](obsidian-vault/01%20-%20Modernização%20Frontend%20(Claude%20Code%20Design%20Toolkit).md)
- [`02 - Design Tokens OKLCH e Theme Studio.md`](obsidian-vault/02%20-%20Design%20Tokens%20OKLCH%20e%20Theme%20Studio.md)
- [`03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing).md`](obsidian-vault/03%20-%20Otimizador%20Híbrido%20(Memético%20NSGA-II%20+%20Simulated%20Annealing).md)
- [`04 - Orquestração Multi-Modelo IA (Gemini 2.5 Pro, Claude Sonnet 4, o3-mini).md`](obsidian-vault/04%20-%20Orquestração%20Multi-Modelo%20IA%20(Gemini%202.5%20Pro,%20Claude%20Sonnet%204,%20o3-mini).md)
- [`05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion).md`](obsidian-vault/05%20-%20Pipeline%20de%20Qualidade%20(Baseline%20UI,%20Acessibilidade%20WCAG%20e%20Motion).md)
- [`CLAEX-v10-Architecture.canvas`](obsidian-vault/CLAEX-v10-Architecture.canvas) (Quadro Visual nativo do Obsidian Canvas)

---

## 🚀 Como Executar

### Opção A: Backend FastAPI + Frontend Unificado (Porta `8081`)
```bash
cd backend_python
uv run --with fastapi --with uvicorn --with sqlalchemy --with itsdangerous uvicorn main:app --host 0.0.0.0 --port 8081
```

### Opção B: Backend Java 17 + Spring Boot (Porta `8081`)
```bash
cd lolooo-main
./mvnw spring-boot:run
```
*(Configurado com fallback automático H2 em memória quando offline ou PostgreSQL/Supabase via variáveis de ambiente).*