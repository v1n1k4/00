---
title: "02 - Design Tokens OKLCH e Theme Studio"
aliases:
  - "OKLCH Tokens"
  - "Theme Studio CLAEX"
tags:
  - claex/v10
  - oklch
  - css-tokens
  - frontend/claude-design-toolkit
created: 2026-04-20
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[01 - Modernização Frontend (Claude Code Design Toolkit)]]"
---

# 🌈 02 — Design Tokens `OKLCH` & Live Theme Studio

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]** | **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**

> [!tip] Por que `OKLCH` em vez de `HEX` ou `HSL`?
> Conforme destacado no `Claude-Code-Frontend-Design-Toolkit` (*Bencium Innovative UX Design*), o espaço de cor `HSL` distorce a luminosidade percebida pelo olho humano quando mudamos o matiz (amarelo e ciano parecem muito mais claros que azul ou violeta na mesma luminosidade HSL de `50%`). Já o espaço **`OKLCH(Lightness Chroma Hue)`** garante **uniformidade perceptual**: ao girar `--brand-hue` de `0°` a `360°`, o contraste de leitura WCAG permanece consistente sem quebrar a legibilidade da interface.

---

## 1. Arquitetura de Variável Raiz Única (`--brand-hue`)

No arquivo `lolooo-main/src/main/resources/static/css/design-tokens-oklch.css`, definimos toda a atmosfera cromática a partir de `--brand-hue`:

```css
:root {
    /* Semente única de matiz (0 a 360) — Padrão: LN4 Acid Lime (#D2FF00) */
    --brand-hue: 112;
    --brand-lightness: 0.91;
    --brand-chroma: 0.23;
    --text-on-accent: #0B0C0E;

    /* Superfícies de Asfalto de Pista (#111112) com Tinta Atmosférica */
    --surface-canvas:   oklch(11% 0.012 var(--brand-hue));
    --surface-elevated: oklch(14.5% 0.016 var(--brand-hue));
    --surface-card:     oklch(17.5% 0.020 var(--brand-hue));

    /* Acentos Principais Perceptualmente Uniformes */
    --accent-primary:   oklch(var(--brand-lightness) var(--brand-chroma) var(--brand-hue));
    --accent-bright:    oklch(94% calc(var(--brand-chroma) * 0.92) var(--brand-hue));
    --accent-deep:      oklch(72% calc(var(--brand-chroma) * 1.05) var(--brand-hue));
    --accent-glow:      oklch(var(--brand-lightness) var(--brand-chroma) var(--brand-hue) / 0.36);
}
```

---

## 2. Os 5 Capacetes / Liveries Oficiais do Theme Studio (`landonorris.com` Edition)

O controlador interativo em `unlumen-effects.js` (`window.CLAEXThemeStudio`) disponibiliza 5 pinturas inspiradas nos capacetes de Lando Norris na Fórmula 1 mais o **Slider Contínuo (`0°–360°`)**:

| ID do Tema (`data-accent`) | Livery no Studio | Matiz (`--brand-hue`) | Equivalente Sólido | Contexto Recomendado |
| :--- | :--- | :---: | :---: | :--- |
| `lime` *(default)* | **LN4 Acid Lime** | `112°` | `#D2FF00` | Assinatura oficial `landonorris.com` sobre asfalto `#111112` |
| `papaya` | **McLaren Papaya** | `52°` | `#FF8000` | Laranja corrida McLaren F1 Team e alertas de telemetria |
| `aero` | **Silverstone Aero** | `195°` | `#00F0FF` | Ciano aerodinâmico para inspeção de métricas NSGA-II |
| `violet` | **Dark Glitter GP** | `292°` | `#A855F7` | Auditoria com `anthropics/claude-code` e `Claude Sonnet 4` |
| `monaco` | **Monaco Porcelain** | `255°` | `#3B82F6` | Edição especial GP de Mônaco / modo institucional clássico |

---

## 3. Persistência e Sincronização com WebGL / SVGs

Quando o usuário escolhe um preset ou arrasta o controle deslizante `0°–360°`:
1. `document.documentElement.style.setProperty('--brand-hue', hue)` atualiza instantaneamente todas as variáveis CSS `oklCH` a `60fps`.
2. Uma função de conversão matemática `oklchToHex(0.62, 0.20, hue)` gera os equivalentes RGB/Hex em tempo real para alimentar os shaders **WebGL** (`webgl-background.js`) e gradientes **SVG** da Ampulheta CLAEX.
3. A preferência é salva em `localStorage` (`claex_accent_theme` e `claex_brand_hue`) e restaurada automaticamente em todas as páginas do sistema.

➡️ Próxima leitura: **[[03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing)]]**
