---
title: "02 - Design Tokens OKLCH e Theme Studio"
aliases:
  - "OKLCH Tokens"
  - "Editorial vs Carbon Surfaces"
  - "Theme Studio CLAEX"
tags:
  - claex/v10
  - oklch
  - css-tokens
  - wcag-contrast
  - frontend/claude-design-toolkit
updated: 2026-11-17
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[01 - Modernização Frontend (Claude Code Design Toolkit)]]"
---

# 🌈 02 — Design Tokens `OKLCH`, Polaridade Editorial/Carbon & Theme Studio

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]** | **[[01 - Modernização Frontend (Claude Code Design Toolkit)]]**

> [!tip] Contraste Seguro em Papel Claro (`#F5F5F0`) e Carvão Escuro (`#111112`)
> Cores neon claras como Acid Lime (`#D2FF00`) têm contraste excelente contra preto `#111112`, mas **falham em legibilidade** quando usadas como cor de texto sobre branco (`#FFFFFF` / `#F5F5F0`). Por isso, em `css/design-tokens-oklch.css` separamos explicitamente o **acento preenchido (`--neon-lime`)** da **tinta de texto (`--accent-ink` / `--neon-bright`)** conforme a polaridade da superfície ativa.

---

## 1. Arquitetura de Polaridade Dupla (`data-surface`)

No arquivo `lolooo-main/src/main/resources/static/css/design-tokens-oklch.css`:

### A. Superfície Padrão: `data-surface="editorial"` (Lando Norris Gallery Paper)
```css
:root,
html[data-surface="editorial"] {
    --brand-hue: 112;
    --bg-obsidian: #F5F5F0;     /* Fundo papel editorial quente */
    --bg-surface:  #FFFFFF;     /* Cartões elevados sem brilho */
    --bg-carbon:   #ECECE6;     /* Inputs e células secundárias */
    --surface-dark: #111112;    /* Painéis de contraste binário */
    --text-pure:   #111112;     /* Tinta principal */
    --text-secondary: #52525B;  /* Tinta secundária neutra */
    --neon-lime:   oklch(0.92 0.22 var(--brand-hue));   /* #D2FF00 para preenchimentos */
    --text-on-accent: #111112;                           /* Preto ink sobre botões #D2FF00 */
    --accent-ink:  oklch(0.36 0.13 var(--brand-hue));   /* Texto/links acessíveis WCAG AA sobre claro */
    --border-card: rgba(17, 17, 18, 0.12);
}
```

### B. Superfície Opcional: `data-surface="carbon"` (Motorsport Paddock Matte Dark)
```css
html[data-surface="carbon"] {
    --bg-obsidian: #111112;
    --bg-surface:  #18181A;
    --bg-carbon:   #202024;
    --text-pure:   #F5F5F0;
    --text-secondary: #A1A1AA;
    --neon-bright: oklch(0.92 0.22 var(--brand-hue));
    --accent-ink:  oklch(0.92 0.22 var(--brand-hue));
    --border-card: rgba(245, 245, 240, 0.12);
}
```

---

## 2. Os 5 Liveries Oficiais do Theme Studio (`window.CLAEXThemeStudio`)

Em [`unlumen-effects.js`](../lolooo-main/src/main/resources/static/js/unlumen-effects.js), o usuário pode alternar **Polaridade de Superfície (`Editorial` ↔ `Carbon`)**, **Livery F1** e o **Slider contínuo `--brand-hue` (`0°–360°`)**:

| Preset (`data-accent`) | Livery no Studio | `--brand-hue` | Contexto Principal |
| :--- | :--- | :---: | :--- |
| `lime` *(default)* | **LN4 Acid Lime** | `112°` | Paddock oficial `landonorris.com` (`#D2FF00` sobre `#F5F5F0` / `#111112`) |
| `amber` | **McLaren Papaya** | `52°` | Laranja corrida McLaren F1 Team |
| `cyan` | **Silverstone Aero** | `195°` | Ciano técnico para métricas e simulador NSGA-II |
| `violet` | **Night GP Violet** | `292°` | Roxo editorial sob medida para auditoria `Claude Sonnet 4` |
| `blue` | **Porcelain Blue** | `245°` | Azul institucional de alto contraste |

---

## 3. Persistência entre Páginas & Comandos CLI

1. As preferências ficam gravadas em `localStorage` (`claex_surface_mode`, `claex_accent_theme`, `claex_brand_hue`) e aplicadas instantaneamente antes da pintura para evitar flash entre navegações.
2. O terminal minimalista **`claude-code`** na home page permite invocar `/livery --lime` e `/surface --toggle` chamando diretamente `CLAEXThemeStudio.setLivery()` e `CLAEXThemeStudio.setSurface()`.
3. O fundo CAD em [`webgl-background.js`](../lolooo-main/src/main/resources/static/js/webgl-background.js) lê `--brand-hue` e `data-surface` para desenhar linhas topográficas sutis sem halos ou partículas brilhantes.

➡️ Próxima leitura: **[[05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)]]**
