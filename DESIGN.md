# DESIGN.md — CLAEX Design System & UX Specification (LN04 × Claude Code Edition)

> Baseado na tríade:
> 1. **[McLaren Formula 1 Driver — Lando Norris (`landonorris.com`)](https://landonorris.com/)** (*Awwwards Site of the Year 2025 — OFF+BRAND*)
> 2. **[`anthropics/claude-code`](https://github.com/anthropics/claude-code)** (*Agentic Terminal & Telemetry HUD*)
> 3. **[`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)** (*OKLCH Design System Architect, Bencium Controlled/Innovative UX & 3-Stage Quality Pipeline*)

---

## 1. Direção Estética (Aesthetic Direction — LN04 Pit-Wall Edition)

- **Arquétipo Primário**: **Lando Norris LN04 Motorsport Editorial** (`#D2FF00` Acid Lime + `#111112` Track Asphalt + `#F4F4F0` Ivory Off-White) + **Claude Code Agentic Terminal**.
- **Contrato Cromático de Dois Tokens (Two-Token Livery Contract)**:
  - **Asfalto de Pista (`#111112` / `#0B0C0E`)**: Fundo escuro de alta densidade com linhas de contorno topográfico orgânicas inspiradas no capacete LN4 Blob (`LandoTopographicCanvas`).
  - **LN4 Acid Lime (`#D2FF00` / `--brand-hue: 112`)**: Acento de altíssima visibilidade (`--brand-lightness: 0.91`, `--brand-chroma: 0.23`) com contraste invertido automático (`--text-on-accent: #0B0C0E`) em botões e faixas de marquee.
- **Componentes Assinatura (`landonorris.com` + `anthropics/claude-code`)**:
  - **The Cursor as Narrator (`.ln4-cursor-pill`)**: Pílula de telemetria em fonte monoespaçada que persegue o cursor com interpolação física (`lerp`) e narra a ação contextual (`[INSPECIONAR]`, `[SIMULAR SLOT]`, `[EXECUTAR CLI]`, `[LIVERY]`).
  - **Alternador `ON TRACK` / `OFF TRACK` (`.ln4-mode-bar`)**: Permite alternar entre a visão completa, o modo de corrida (`ON TRACK · MOTOR & SIMULADOR`) e os bastidores (`OFF TRACK · PERFIS & EQUIPE`).
  - **Faixa Marquee Infinita (`#D2FF00`)**: Ticker editorial em diagonal sutil com telemetria do solver e status dos modelos de IA.
  - **Citação Editorial & Assinatura Neon Autodesenhada**: Tipografia monumental `Syne` 800 uppercase com palavras grifadas em `#D2FF00` e assinatura vetorial animada no scroll.
  - **Claude Code Agentic Terminal (`.claude-code-terminal`)**: Console interativo inspirado em `anthropics/claude-code` com chips clicáveis (`/optimize --nsga2`, `/audit --claude-4`, `/livery --ln4-lime`, `/livery --papaya`).

---

## 2. Sistema de Tokens em Espaço Perceptual OKLCH

Todo o sistema de cores deriva de `--brand-hue` (`0°` a `360°`), `--brand-lightness` e `--brand-chroma`:

```css
:root {
  --brand-hue: 112;        /* LN4 Acid Lime (#D2FF00) por padrão */
  --brand-lightness: 0.91;
  --brand-chroma: 0.23;
  --text-on-accent: #0B0C0E;
  --surface-canvas: oklch(11% 0.012 var(--brand-hue));
  --surface-elevated: oklch(14.5% 0.016 var(--brand-hue));
  --surface-card: oklch(17.5% 0.020 var(--brand-hue));
  --accent-primary: oklch(var(--brand-lightness) var(--brand-chroma) var(--brand-hue));
}
```

### 5 F1 Helmet Liveries Disponíveis no Theme Studio
1. **LN4 Acid Lime (`--brand-hue: 112`, `#D2FF00`)**: Pintura oficial do capacete Lando Norris LN04 (padrão).
2. **McLaren Papaya (`--brand-hue: 52`, `#FF8000`)**: Laranja corrida histórico da McLaren F1 Team.
3. **Silverstone Aero (`--brand-hue: 195`, `#00F0FF`)**: Ciano aerodinâmico de túnel de vento e telemetria CFD.
4. **Dark Glitter GP (`--brand-hue: 292`, `#A855F7`)**: Roxo metálico de corrida noturna (Singapura / Las Vegas GP) + Claude Code.
5. **Monaco Porcelain (`--brand-hue: 255`, `#3B82F6`)**: Azul cobalto da edição especial do GP de Mônaco.

---

## 3. Tipografia & Escala Fluida

- **Display (`--font-display`)**: `'Syne', 'Space Grotesk', sans-serif` — Títulos monumentais e marcas d'água vazadas.
- **Heading (`--font-heading`)**: `'Space Grotesk', sans-serif` — Cabeçalhos de seções, modais e cards (`letter-spacing: -0.025em`).
- **Body (`--font-body`)**: `'Plus Jakarta Sans', sans-serif` — Textos corridos, formulários e células de disciplinas.
- **Telemetry / Mono (`--font-mono`)**: `'JetBrains Mono', monospace` (`font-variant-numeric: tabular-nums`) — Horários (`07:30`), contadores de conflito, fitness score e logs da IA.

---

## 4. Especificação de Acessibilidade (WCAG 2.1 AA — Bencium Controlled Mode)

1. **Navegação por Teclado**:
   - Link `Pular para o conteúdo principal` (`.skip-to-content`) visível no foco (`Tab`).
   - Todos os cards interativos possuem `role="button"`, `tabindex="0"` e suporte a `Enter` / `Space`.
   - Modais e gavetas fecham com a tecla `Escape` e restauram o foco.
2. **Semântica & Leitores de Tela**:
   - Regiões dinâmicas da matriz horária e pareceres da IA utilizam `aria-live="polite"`.
   - Ícones decorativos e SVGs de circuito utilizam `aria-hidden="true"`.
3. **Contraste & Foco**:
   - Anel de foco `:focus-visible` nítido com `2px solid var(--neon-bright)` e `outline-offset: 3px`.

---

## 5. Especificação de Movimento & Performance (Motion Principles)

1. **Animações Baseadas em Scroll (GSAP + ScrollTrigger)**:
   - A logo monumental `CLAEX` no Hero recolhe as letras `C L A E` durante o scroll enquanto a **Ampulheta (`X`)** desce e acopla no núcleo do circuito central (`#hub-center-target`).
2. **Micro-Interações**:
   - **Spotlight Radial**: Cards reagem à proximidade do cursor via variáveis CSS `--mouse-x` e `--mouse-y` (listener `passive: true`).
   - **Botões Magnéticos**: Deslocamento elástico suave (`power2.out` / `elastic.out`).
3. **Orçamento de Performance & Reduced Motion**:
   - Canvas de partículas pausa automaticamente quando a aba fica oculta (`document.hidden`) ou quando `prefers-reduced-motion: reduce` está ativo.
