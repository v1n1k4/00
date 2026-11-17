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
