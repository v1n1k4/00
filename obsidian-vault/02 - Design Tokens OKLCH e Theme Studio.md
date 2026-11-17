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
    /* Semente única de matiz (0 a 360) */
    --brand-hue: 255;       /* Padrão: Azul Escolar (255°) */
    --brand-chroma: 0.20;

    /* Superfícies de Carbono com Tinta Atmosférica */
    --surface-canvas:   oklch(11% 0.015 var(--brand-hue));
    --surface-elevated: oklch(15% 0.020 var(--brand-hue));
    --surface-card:     oklch(18% 0.024 var(--brand-hue));

    /* Acentos Principais Perceptualmente Uniformes */
    --accent-primary:   oklch(62% var(--brand-chroma) var(--brand-hue));
    --accent-bright:    oklch(74% calc(var(--brand-chroma) * 0.92) var(--brand-hue));
    --accent-deep:      oklch(48% calc(var(--brand-chroma) * 1.05) var(--brand-hue));
    --accent-glow:      oklch(62% var(--brand-chroma) var(--brand-hue) / 0.34);
}
```

---

## 2. Os 5 Presets Oficiais do Theme Studio

O controlador interativo em `unlumen-effects.js` (`window.CLAEXThemeStudio`) disponibiliza 5 temas calibrados mais o **Slider Contínuo (`0°–360°`)**:

| ID do Tema (`data-accent`) | Nome no Studio | Matiz (`--brand-hue`) | Equivalente Sólido | Contexto Recomendado |
| :--- | :--- | :---: | :---: | :--- |
| `blue` *(default)* | **Azul Escolar** | `255°` | `#3B82F6` | Uso institucional padrão e apresentações |
| `emerald` | **Esmeralda Docente** | `162°` | `#10B981` | Foco em validação de grades e disponibilidade docente |
| `violet` | **Violeta IA** | `282°` | `#8B5CF6` | Auditoria com modelos de raciocínio profundo (`Claude 4` / `Gemini 2.5 Pro`) |
| `amber` | **Âmbar Solar** | `68°` | `#F59E0B` | Inspeção de alertas de carga cognitiva e alto contraste |
| `cyan` | **Ciano Telemetria** | `202°` | `#06B6D4` | Monitoramento de métricas NSGA-II e janelas docentes |

---

## 3. Persistência e Sincronização com WebGL / SVGs

Quando o usuário escolhe um preset ou arrasta o controle deslizante `0°–360°`:
1. `document.documentElement.style.setProperty('--brand-hue', hue)` atualiza instantaneamente todas as variáveis CSS `oklCH` a `60fps`.
2. Uma função de conversão matemática `oklchToHex(0.62, 0.20, hue)` gera os equivalentes RGB/Hex em tempo real para alimentar os shaders **WebGL** (`webgl-background.js`) e gradientes **SVG** da Ampulheta CLAEX.
3. A preferência é salva em `localStorage` (`claex_accent_theme` e `claex_brand_hue`) e restaurada automaticamente em todas as páginas do sistema.

➡️ Próxima leitura: **[[03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing)]]**
