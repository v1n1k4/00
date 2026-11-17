# CLAEX — Claude Code Frontend Design Toolkit Configuration

Este projeto utiliza a arquitetura e as diretrizes do **[Claude Code Frontend Design Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)** combinadas com o **Motor de Otimização Híbrido CLAEX (NSGA-II Memético + Simulated Annealing + Multi-Model AI)**.

---

## Frontend Theme (`CLAUDE.md` Theme Block — Anthropic Aesthetics Cookbook)

<always_use_claex_oled_telemetry_theme>
Always design with the **CLAEX Dark OLED Luxury + Swiss Editorial Telemetry** aesthetic:
- **OKLCH Single-Hue Token Architecture (`--brand-hue`)**: Never hardcode disconnected hex colors. Derive all brand, surface, border, and specular glow states from `--brand-hue` using perceptual `oklch(L C var(--brand-hue))` math (`css/design-tokens-oklch.css`).
- **True OLED Depth & Specular Hairlines**: Use deep obsidian/carbon surfaces (`#040508` to `#0E111A`) with `1px` specular borders (`rgba(255, 255, 255, 0.08)`) and radial proximity spotlights (`--mouse-x`, `--mouse-y`).
- **Editorial & Technical Typography Pairing**:
  - Display / Hero: `Syne` / `Space Grotesk` with tight negative tracking (`-0.03em`)
  - Body / UI: `Plus Jakarta Sans` for high-legibility academic schedules
  - Telemetry / Metrics / Badges: `JetBrains Mono` (`tabular-nums`) for timestamps, fitness scores, and rule diagnostics
- **Zero AI Slop**: Avoid generic purple-on-white cards, unstyled tables, or arbitrary color mixing. Every page shares the unified Floating Capsule Header, Top Telemetry Announcement Bar, and Live OKLCH Theme Studio.
- **Controlled Accessibility & Motion (`Bencium UX + Baseline UI`)**:
  - Maintain WCAG 2.1 AA contrast ratios, visible `:focus-visible` outlines, keyboard navigation (`Escape`, `Tab`, `Enter`), and `aria-live="polite"` regions for schedule generation and AI diagnostics.
  - Respect `@media (prefers-reduced-motion: reduce)` across all CSS keyframes, WebGL/Canvas particles, and GSAP ScrollTrigger timelines.
</always_use_claex_oled_telemetry_theme>

---

## Design Tokens & Preset Themes (`css/design-tokens-oklch.css`)

| Preset Key | Name | `--brand-hue` | Aesthetic Reference (Frontend Design Pro Demo) |
| :--- | :--- | :---: | :--- |
| `blue` (default) | **Azul Safira OLED** | `255` | Dark OLED Luxury + Academic Sapphire |
| `violet` | **Violeta Opticore** | `285` | Retro-Futuristic / Opticore Deep Violet |
| `amber` | **Âmbar Telemetria** | `38` | Lando Norris / McLaren F1 Telemetry |
| `emerald` | **Esmeralda Solarpunk** | `155` | Solarpunk / Organic Biomorphic |
| `crimson` | **Rubi Editorial** | `15` | Swiss Editorial / High-Impact Accent |

---

## Polish Pipeline (`baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`)

1. **`/frontend-design`**: Aesthetic direction locked to Dark OLED Luxury + Telemetry.
2. **`/baseline-ui`**: Consistent 4px/8px spatial grid, unified capsule navigation, tabular numbers in schedule matrices, and semantic status badges.
3. **`/fixing-accessibility`**: Skip-to-content links, ARIA landmarks, modal focus management, and high-contrast keyboard focus rings.
4. **`/fixing-motion-performance`**: Compositor-only animations (`transform`, `opacity`), `will-change` cleanup, visibility-aware `<canvas>` loop, and `prefers-reduced-motion` compliance.

---

## Architecture & Component Paths

- **Frontend Design Tokens (OKLCH)**: `lolooo-main/src/main/resources/static/css/design-tokens-oklch.css`
- **Core Stylesheets**: `lolooo-main/src/main/resources/static/css/style.css` & `style-v5-extensions.css`
- **Interactive Controllers & Theme Studio**: `lolooo-main/src/main/resources/static/js/unlumen-effects.js`
- **GSAP Scroll & Ampulheta Docking Engine**: `lolooo-main/src/main/resources/static/js/gsap-animations.js`
- **Java Hybrid Optimizer (NSGA-II + Simulated Annealing)**: `lolooo-main/src/main/java/com/claex/crud/Service/GradeService.java`
- **Java Multi-Model AI Advisor**: `lolooo-main/src/main/java/com/claex/crud/Service/GeminiScheduleAdvisorService.java`
- **Python FastAPI Full-Parity Backend**: `backend_python/main.py`
- **Obsidian Knowledge Vault**: `obsidian-vault/`
