# CLAEX — Paleta Institucional (v14, ativa em `css/brutalist.css`)

Troca o amarelo ácido e o preto puro por uma paleta acadêmica/institucional, mantendo a estrutura brutalista e a narrativa da landing:
- Tinta / bordas / sombras / abertura / rodapé: marinho escuro `#0F172A`
- Fundo: ardósia clara `#F1F5F9` · superfícies: `#FFFFFF`
- Acento primário: azul institucional `#1E3A8A` (hover `#172554`)
- Destaque secundário (chips, abas ativas, blocos do calendário): azul gelo `#DBEAFE` (sobre marinho escuro: `#93C5FD`)
- Estado (conflitos / sucesso): bordô `#B91C1C` / verde-petróleo `#0F766E`
- Rótulos retos (sem inclinação).

---

# CLAEX — Landing narrativa (v13, camada ativa na `index.html`)

Roteiro pedido pelo time (áudio transcrito): **abertura com a logo → CLAEX → explicação em rede neural → exemplo → integrantes**. Implementado em `index.html` + `js/calex-story.js` + bloco "STORYTELLING" de `css/brutalist.css`.

1. **Abertura** (`#capa_index`): tela preta; o **X** (ampulheta) aparece no centro; a palavra **CLAE** sai de dentro do X para a esquerda e o conjunto fica centralizado como nome do projeto (**CLAEX**).
2. **Como funciona** (`#como`): ao rolar, uma rede neural em volta do motor acende uma parte por vez (Professores, Salas, Turmas, Regras, Otimizador, Grade final). Cada parte tem sua explicação, dois pulsos correm para o centro e há caminhos extras entre os nós. Os nós são clicáveis/teclado.
3. **Exemplo** (`#exemplo`): grade de uma turma; conflitos (vermelho) aparecem e são resolvidos conforme a rolagem — contador 7 → 0 e qualidade 0 → 94%.
4. **Perfis** (abas Administração/Professores/Alunos) e **Equipe** (Daniel, Vini, Samuel).

Acessibilidade: `prefers-reduced-motion` mostra o estado final estático; nós com `role="button"`/`tabindex`; `aria-live` nos painéis. Nome da marca: **CLAEX** em todas as páginas. Nenhum backend alterado.

---

# Projeto Calex — Redesign Brutalista (v12, camada ativa)

> Camada final `css/brutalist.css` (após `minimal.css`) aplicada às 9 páginas. Substitui o visual minimalista; `calex-ui.js` (abas, reveals) continua.

**Linguagem:** bordas pretas de 3px, sombras duras sem blur (`6px 6px 0`), cantos retos, tipografia pesada em caixa alta (Archivo Black / Space Grotesk / Space Mono), fundo papel `#F4F1E8` com grade, acento azul `#1F3DFF` + destaque amarelo `#FFE600`, rodapé preto. Sem neon/glow.

**O que cada repositório trouxe**
- `ui-ux-pro-max-skill`: estilo "Brutalism" + checklist (contraste ≥4.5:1, foco visível, `prefers-reduced-motion`, responsivo, texto sem clipping).
- `anthropics/skills` (frontend-design): assumir uma direção ousada e consistente em vez de layout genérico.
- `vercel-labs/agent-skills` (web-design-guidelines): `:focus-visible` forte (amarelo + preto), tabs ARIA/teclado, `tabular-nums` em tabelas, sem `transition: all`.
- `Claude-Code-Frontend-Design-Toolkit`: tokens por variável (`--ink`, `--blue`, `--yellow`) e pipeline de qualidade.
- `claude-code`: honestidade de terminal — mono em rótulos e botões.
- `landonorris.com`: tipografia gigante e contraste forte.
- Motion UI: movimento por passos (`steps()`), hover que "levanta" o bloco, clique que "afunda".

Escopo: nenhum backend (`*.java`, `*.py`, `js/api.js`) alterado.

---

# Projeto Calex — Redesign Minimalista (v11, camada ativa)

> Esta seção **substitui** o tema editorial/lime descrito abaixo para o front-end. O código vive em `css/minimal.css` (carregado por último em todas as páginas) e `js/calex-ui.js`.

**Público:** administração, professores e alunos de uma escola — a prioridade é compreensão imediata.

**Referências aplicadas**
- [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill): checklist de entrega (ícones SVG, contraste 4.5:1, foco visível, `prefers-reduced-motion`, responsivo 375/768/1024/1440, texto sem clipping).
- [`anthropics/skills`](https://github.com/anthropics/skills) (frontend-design): direção estética clara e intencional, sem layout genérico.
- [`vercel-labs/agent-skills` web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md): `:focus-visible`, `touch-action`, `text-wrap: balance`, `tabular-nums`, tabs com ARIA/teclado, nada de `transition: all`.
- Anteriores: Claude-Code-Frontend-Design-Toolkit (tokens OKLCH `--brand-hue`, agora 258° azul), claude-code (minimalismo), landonorris.com (espaço negativo), Motion UI (reveals sutis).

**Regras**
- Paleta neutra: `#FAFAFA` / `#FFFFFF` / bordas `#E8E8EC`; acento único azul elétrico `oklch(0.55 0.2 258)` só em botões, links e dados.
- Tipografia: Inter, títulos 700–800, tracking -0.04em. Zero neon/glow, sem faixas escuras.
- Animações sutis: reveal on scroll (`.cx-reveal`), calendário do hero em cascata (`.cx-pop`), barras e métrica animadas, troca de abas por perfil. Tudo desativado com `prefers-reduced-motion`.
- Landing por perfil: abas Administração / Professores / Alunos com ação direta para cada área.
- Escopo: nenhum backend (`*.java`, `*.py`, `js/api.js`) foi alterado.

---

# CLAEX — Claude Code Frontend Design Toolkit & Editorial Spec

Este projeto integra as metodologias do **[`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)**, o minimalismo técnico de **[`anthropics/claude-code`](https://github.com/anthropics/claude-code)**, a direção editorial de **[McLaren F1 — Lando Norris (`landonorris.com`)](https://landonorris.com/)** e animações físicas de **[Motion / Motion UI (`motiondivision/motion` + `ibelick/motion-primitives`)](https://motion.dev/)** sobre o **Motor Híbrido CLAEX (NSGA-II Memético + Simulated Annealing + Multi-Model IA)**.

---

## Frontend Theme (`CLAUDE.md` Theme Block — Zero-Neon Editorial Light & Carbon)

<always_use_claex_editorial_theme>
Always design with the **CLAEX Zero-Neon Editorial Light & Stark Charcoal Binary Contrast** aesthetic:
- **Zero-Neon Hard Rule**: **Zero** `box-shadow: 0 0 ...` colored neon halos, **zero** blurred light beams (`.edge-light-*`), **zero** ambient glow blobs, and **zero** unprompted purple overrides (`#5f33ff`, `#7033ff`).
- **Binary Surface Polarity (`data-surface`)**:
  - `editorial` *(default)*: Off-white warm gallery canvas (`#F5F5F0`), elevated paper cards (`#FFFFFF`), `1px solid #DEDED6` architectural hairlines, ink black (`#111112`) typography, interspersed with high-contrast dark charcoal (`#111112`) bands (`.dark-gallery-band`, `.ln4-marquee-strip`, and `footer` framed by `#D2FF00`).
  - `carbon` *(optional toggle)*: Flat motorsport paddock matte charcoal (`#111112` / `#18181A`) available cleanly via Theme Studio (`CLAEXThemeStudio.setSurface('carbon')`).
- **OKLCH Single-Hue Accent Token Architecture (`--brand-hue`)**:
  - All accent states derive from `--brand-hue` (`112°` LN4 Acid Lime `#D2FF00` default) in `css/design-tokens-oklch.css`.
  - Contrast-safe ink rules: use `--text-on-accent: #111112` inside `#D2FF00` filled buttons/pills and `--accent-ink: oklch(0.36 0.13 var(--brand-hue))` for text/badges on light paper (`#F5F5F0` / `#FFFFFF`).
- **Typography Quartet**:
  - Editorial Italic Emphasis: `Instrument Serif` (italic) paired inside `Syne` display headlines (highlighted like `landonorris.com`).
  - Display / Headlines: `Syne` (`-0.04em` tight tracking, `text-wrap: balance`).
  - Body / UI Controls: `Mona Sans` + `Space Grotesk`.
  - Telemetry / Schedules / CLI: `JetBrains Mono` (`tabular-nums`).
- **Motion UI Choreography (`js/motion-ui.js`)**:
  - Powered by `https://cdn.jsdelivr.net/npm/motion@11.15.0/dist/motion.js` (`window.Motion`).
  - Physics presets (`MotionTheme`): `snap`, `ui`, `gentle`, `lively`, `reducedMotion: 'calm'`.
  - Patterns from `ibelick/motion-primitives`: `textScramble`, `slidingNumber`, `inView`, `scroll` docking (`#logo-ampulheta` → `#hub-center-target`), restrained magnetic buttons, and CAD card object tilt.
- **Scope Rule**: Never alter backend Java (`*.java`), Python (`*.py`), or API endpoints (`js/api.js`) when iterating on visual frontend design.
</always_use_claex_editorial_theme>

---

## OKLCH Liveries (`css/design-tokens-oklch.css`)

| Preset Key (`data-accent`) | Name | `--brand-hue` | Aesthetic Role |
| :--- | :--- | :---: | :--- |
| `lime` *(default)* | **LN4 Acid Lime** | `112°` | Assinatura Lando Norris `#D2FF00` sobre Editorial `#F5F5F0` e Charcoal `#111112` |
| `amber` | **McLaren Papaya** | `52°` | Laranja clássico McLaren Racing para alertas e telemetria |
| `cyan` | **Silverstone Aero** | `195°` | Azul-ciano de túnel de vento e inspeção algorítmica |
| `violet` | **Night GP Violet** | `292°` | Roxo sóbrio editorial para modo Claude Code CLI |
| `blue` | **Porcelain Blue** | `245°` | Azul cobalto institucional clássico |

---

## Polish Pipeline (`baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`)

1. **`baseline-ui`**: Espaçamento 4px/8px consistente, tipografia tabular (`tabular-nums`), cápsula flutuante única e zero neon/decoração gratuita.
2. **`fixing-accessibility`**: Skip-to-content link, `:focus-visible` de alto contraste, contraste WCAG 2.1 AA garantido em Claro (`editorial`) e Escuro (`carbon`), navegação por teclado (`Escape`, `Tab`, `Enter`) e regiões `aria-live="polite"`.
3. **`fixing-motion-performance`**: Somente propriedades compositor (`transform`, `opacity`), `MotionTheme` calibrated curves, pausa de `<canvas>` CAD em abas inativas (`document.hidden`), e respeito absoluto a `@media (prefers-reduced-motion: reduce)`.

---

## Architecture & File Map

- **OKLCH Tokens**: [`design-tokens-oklch.css`](lolooo-main/src/main/resources/static/css/design-tokens-oklch.css)
- **Core & Editorial Extensions CSS**: [`style.css`](lolooo-main/src/main/resources/static/css/style.css), [`style-v5-extensions.css`](lolooo-main/src/main/resources/static/css/style-v5-extensions.css)
- **Motion UI & Primitives Engine**: [`motion-ui.js`](lolooo-main/src/main/resources/static/js/motion-ui.js)
- **CAD Contour Canvas & Notifications**: [`webgl-background.js`](lolooo-main/src/main/resources/static/js/webgl-background.js), [`claex-notify.js`](lolooo-main/src/main/resources/static/js/claex-notify.js)
- **Theme Studio & Interactive Controllers**: [`unlumen-effects.js`](lolooo-main/src/main/resources/static/js/unlumen-effects.js), [`gsap-animations.js`](lolooo-main/src/main/resources/static/js/gsap-animations.js)
- **9 Unified Pages**: `index.html`, `grade.html`, `listar_sala.html`, `painel_professor.html`, `tabela_cadastros.html`, `form_login.html`, `form_cadastro.html`, `form_nova_sala.html`, `config_sala.html`
- **Untouched Backends**: `lolooo-main/src/main/java/**`, `backend_python/main.py`, `lolooo-main/src/main/resources/static/js/api.js`
- **Obsidian Knowledge Vault**: [`obsidian-vault/`](obsidian-vault/)
