# DESIGN.md — CLAEX Zero-Neon Editorial Design System (Lando Norris × Claude Code × Motion UI)

> Referências arquiteturais unificadas:
> 1. **[McLaren Formula 1 Driver — Lando Norris (`landonorris.com`)](https://landonorris.com/)** — *Off-white editorial paper, stark charcoal contrast gallery, hairline wireframe cards, serif/sans typographic juxtaposition & framed lime footer.*
> 2. **[`anthropics/claude-code`](https://github.com/anthropics/claude-code)** — *Minimalist agentic engineering CLI, clean slash commands & high-craft monochrome legibility.*
> 3. **[`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)** — *Single-hue `OKLCH` tokens, `baseline-ui` → `fixing-accessibility` → `fixing-motion-performance`, Zero AI Slop.*
> 4. **[Motion & Motion UI (`motiondivision/motion` + `ibelick/motion-primitives`)](https://motion.dev/magazine/introducing-motion-ui)** — *Curated physics presets (`snap`, `ui`, `gentle`, `lively`), `TextScramble`, `SlidingNumber`, `InView` & scroll docking.*

---

## 1. Política Zero-Neon & Polaridade Editorial

A interface elimina integralmente excessos visuais luminescente ("cyberpunk glow / AI slop"):
- **Removido**: todos os `box-shadow: 0 0 ...` coloridos, blobs borrados, feixes verticais `.edge-light-*` e overrides roxos `#5f33ff` / `#7033ff`.
- **Substituído por Contraste Editorial Preciso**:
  - **Superfície Padrão (`data-surface="editorial"`)**: Papel editorial matte `#F5F5F0` + cartões `#FFFFFF` + bordas finas `1px solid #DEDED6` + tinta primária `#111112` + acento cirúrgico `#D2FF00` (preto sobre verde-limão).
  - **Faixas de Contraste Binário (`#111112`)**:
    - `.ln4-marquee-strip`: faixa ticker limpa com separadores `///` em `var(--neon-lime)`.
    - `.dark-gallery-band` (`#para-quem`): galeria em carvão profundo com 3 cards escalonados estilo Lando Norris Hall of Fame e recorte chanfrado SVG inferior direito.
    - `footer`: painel escuro `#111112` envolvido por moldura perimetral limpa de `4px` em `#D2FF00`.
  - **Superfície Alternativa (`data-surface="carbon"`)**: Paddock escuro matte `#111112` / `#18181A`, ativável em tempo real no **Theme Studio** ou pelo comando `/surface --toggle` no terminal Claude Code.

---

## 2. Componentes Assinatura Implementados

| Componente | Inspirações | Implementação |
| :--- | :--- | :--- |
| **Hero Assimétrico `1:2` + Rail de Telemetria** | `landonorris.com` | `.ln4-hero-split` + `.ln4-hero-rail` com seletor `FULL` / `ON TRACK` / `OFF TRACK` e métricas tabulares em tempo real |
| **Circuit Hub CAD + Socket da Ampulheta** | Engenharia / F1 | `.edge-hub-stage` com trilhas ortogonais matte, pulso minimalista `#111112`, inspetor interativo e acoplamento de `#logo-ampulheta` no scroll |
| **Citação Editorial & Assinatura Vetorial** | `landonorris.com` | `Instrument Serif` + destaque matte `#D2FF00` + botões de troca rápida de Livery `OKLCH` + assinatura vetorial |
| **Galeria Carvão `#111112` (3 Perfis Escolares)** | `landonorris.com` | `.dark-gallery-band` + `.lando-showcase-grid` com coluna central escalonada (`.lando-col-stagger`), moldura SVG chanfrada e objetos 3D vetoriais |
| **Cursor Narrador Minimalista** | `landonorris.com` | `.ln4-cursor-pill` sem ponto ou anel luminoso — pílula de texto discreta que narra alvos com `[data-cursor-label]` |
| **Claude Code CLI + RBAC Inspector** | `anthropics/claude-code` | `.claude-code-terminal` minimalista com comandos `/optimize --nsga2`, `/audit --claude-4`, `/livery --lime`, `/surface --toggle` e `MotionUI.textScramble` |
| **Fundo CAD Topográfico Matte** | Lando Blob Topographic | `webgl-background.js` — linhas vetoriais finas em `#111112` (claro) ou `#F5F5F0` (carbon) em `0.06` opacidade |

---

## 3. Tipografia & Tokens Perceptuais `OKLCH`

```css
:root {
  --brand-hue: 112;
  --neon-lime: oklch(0.92 0.22 var(--brand-hue));          /* #D2FF00 default */
  --accent-ink: oklch(0.36 0.13 var(--brand-hue));         /* Contraste AA sobre claro */
  --text-on-accent: #111112;                               /* Preto ink sobre botões #D2FF00 */
  --bg-obsidian: #F5F5F0;                                  /* Papel editorial matte */
  --bg-surface: #FFFFFF;                                   /* Cartões limpos */
  --surface-dark: #111112;                                 /* Painéis contrastantes */
}
```

- **Display (`--font-display`)**: `'Syne', sans-serif` (`-0.04em` tracking, peso `800`)
- **Serif Editorial (`--font-serif`)**: `'Instrument Serif', Georgia, serif` (*italic accents*)
- **Interface (`--font-heading` / `--font-body`)**: `'Mona Sans', 'Space Grotesk', system-ui`
- **Telemetria (`--font-mono`)**: `'JetBrains Mono', monospace` (`font-variant-numeric: tabular-nums`)

---

## 4. Motor de Animação (`js/motion-ui.js` — Motion × Motion Primitives)

Carrega `https://cdn.jsdelivr.net/npm/motion@11.15.0/dist/motion.js` (`window.Motion`) com fallbacks seguros e `prefers-reduced-motion: reduce`:
- **`MotionTheme`**: `snap` (`0.28s`), `ui` (`0.42s`), `gentle` (`0.65s`), `lively` (`0.50s` com overshoot controlado), `reducedMotion: 'calm'`.
- **Primitivas**:
  - `MotionUI.textScramble(el, text, ms)` — decodificação técnica em terminal e eyebrows.
  - `MotionUI.slidingNumber(el, num, suffix, ms)` — contagem tabular fluida ao otimizar grade no simulador.
  - `initHeroMotion()` — entrada sequenciada (`Motion.stagger(0.06)`).
  - `initInViewReveals()` — revela apenas blocos abaixo da dobra via `Motion.inView` sem jamais travar seções em `opacity: 0`.
  - `initScrollMechanics()` — barra de progresso e acoplamento da Ampulheta CLAEX dirigidos por `Motion.scroll`.
  - `initMagneticButtons()` & `initGalleryInteractiveObjects()` — micro-deslocamento tátil discreto sem distorção excessiva.
