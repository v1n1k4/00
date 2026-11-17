# DESIGN.md — CLAEX Design System & UX Specification

> Baseado no **Claude Code Frontend Design Toolkit** (`wilwaldon/Claude-Code-Frontend-Design-Toolkit`), combinando **Design System Architect (OKLCH)**, **Bencium Controlled/Innovative UX Designer** e **Addy Osmani Web Quality Skills**.

---

## 1. Direção Estética (Aesthetic Direction)

- **Arquétipo Primário**: **Dark OLED Luxury (#10)** + **Swiss Minimalism Grids (#1)** + **Precision Telemetry**.
- **Filosofia Visual**:
  - Superfícies em preto absoluto e carbono (`#040508` → `#0D1017`) para reduzir fadiga visual de coordenadores e professores durante o planejamento escolar.
  - Foco em **uma única matiz ativa (`--brand-hue`)** derivada matematicamente no espaço perceptual **OKLCH**, evitando poluição cromática.
  - Hierarquia tipográfica clara para leitura rápida de matrizes de horários (5 dias × $N$ períodos), diagnósticos de IA e indicadores de conformidade pedagógica.

---

## 2. Sistema de Tokens em Espaço Perceptual OKLCH

Todo o sistema de cores deriva de `--brand-hue` (0 a 360):

```css
:root {
  --brand-hue: 255; /* Safira Acadêmico por padrão */
  --color-primary: oklch(0.62 0.21 var(--brand-hue));
  --color-primary-bright: oklch(0.74 0.18 var(--brand-hue));
  --color-primary-hover: oklch(0.55 0.22 var(--brand-hue));
  --color-surface-obsidian: oklch(0.11 0.015 var(--brand-hue));
  --color-surface-carbon: oklch(0.14 0.018 var(--brand-hue));
  --color-surface-elevated: oklch(0.18 0.022 var(--brand-hue));
  --color-border-hairline: oklch(0.98 0.01 var(--brand-hue) / 0.08);
  --color-border-accent: oklch(0.68 0.19 var(--brand-hue) / 0.42);
}
```

### Presets Estéticos Disponíveis no Theme Studio
1. **Safira OLED (`--brand-hue: 255`)**: Azul institucional profundo com brilho platinado.
2. **Violeta Opticore (`--brand-hue: 285`)**: Estética futurista de alta precisão.
3. **Âmbar Telemetria (`--brand-hue: 38`)**: Inspirado em telemetria automobilística (Lando Norris / McLaren).
4. **Esmeralda Solarpunk (`--brand-hue: 155`)**: Harmonia orgânica de alta legibilidade.
5. **Rubi Editorial (`--brand-hue: 15`)**: Contraste suíço dramático para auditoria.

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
