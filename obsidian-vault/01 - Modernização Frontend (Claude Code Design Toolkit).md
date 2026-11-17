---
title: "01 - Modernização Frontend (Claude Code Design Toolkit)"
aliases:
  - "Frontend Design Toolkit"
  - "Zero-Neon Editorial Lando Norris"
tags:
  - claex/v10
  - frontend/claude-design-toolkit
  - landonorris-editorial
  - motion-ui
  - design-system
  - ui-ux
updated: 2026-11-17
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[02 - Design Tokens OKLCH e Theme Studio]]"
  - "[[05 - Pipeline de Qualidade (Baseline UI, Acessibilidade WCAG e Motion)]]"
---

# 🎨 01 — Redesign Editorial Zero-Neon (`landonorris.com` × `claude-code` × `Motion UI`)

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]**

> [!info] Referências Arquiteturais
> O redesign integral do front-end (`lolooo-main/src/main/resources/static/`) manteve intacto todo o back-end (`*.java`, `*.py`, `js/api.js`) e substituiu a estética escura carregada de neon por:
> - **[McLaren F1 — Lando Norris (`landonorris.com`)](https://landonorris.com/)**: superfície principal **Editorial Off-White (`#F5F5F0`)**, hero assimétrico `1:2`, tipografia `Instrument Serif` + `Syne`, faixa divisória ticker e galeria escura contrastante em carvão `#111112`.
> - **[`anthropics/claude-code`](https://github.com/anthropics/claude-code)**: minimalismo de alta legibilidade, console interativo `.claude-code-terminal` e comandos `/optimize`, `/audit`, `/livery`, `/surface`.
> - **[`wilwaldon/Claude-Code-Frontend-Design-Toolkit`](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit)**: variável única `--brand-hue` em `OKLCH`, zero AI slop e pipeline em 3 fases.
> - **[`motiondivision/motion`](https://github.com/motiondivision/motion) & [`ibelick/motion-primitives`](https://github.com/ibelick/motion-primitives)**: animações físicas e de scroll dirigidas por [`motion-ui.js`](../lolooo-main/src/main/resources/static/js/motion-ui.js).

---

## 1. Remoção Integral de Excesso de Neon ("Zero-Neon Audit")

| Elemento Removido (Passado) | Substituição Arquitetural (Atual) | Ganho Real |
| :--- | :--- | :--- |
| **`box-shadow: 0 0 ...` fluorescentes** em botões, badges, painéis e toast | Bordas nítidas matte `1px solid var(--border-card)` e sombras neutras sutis | Acabamento editorial limpo de engenharia suíça sem brilho borrado |
| **Feixes verticais `.edge-light-*` e blobs gigantes** (`filter: blur(...)`) | Linhas topográficas CAD finíssimas (`0.06` opacidade) em `webgl-background.js` | Zero poluição visual atrás de textos e formulários |
| **Overrides roxos (`#5f33ff`, `#7033ff`, `98, 0, 255`)** | 100% governado por `OKLCH` via `--brand-hue` + Acid Lime `#D2FF00` cirúrgico | Consistência absoluta em todas as 9 páginas HTML |
| **Cursor glowing dot + anel** | `.ln4-cursor-pill` minimalista estilo Lando Norris narrando rótulos `[INICIAR]`, `[SALAS]` | Interação narrativa sem distrações luminosas |

---

## 2. Estrutura Visual das 9 Páginas Unificadas

Todas as 9 páginas (`index.html`, `grade.html`, `listar_sala.html`, `painel_professor.html`, `tabela_cadastros.html`, `form_login.html`, `form_cadastro.html`, `form_nova_sala.html`, `config_sala.html`) compartilham:

1. **Topbar de Telemetria (`36px`) + Header Cápsula Flutuante**: logotipo `CLAEX` com ampulheta geométrica, links em cápsula central e botão rápido de superfície (`Editorial` / `Carbon`) no **Theme Studio**.
2. **Quarteto Tipográfico Intencional**:
   - **`Instrument Serif` (itálico)** destacado por barra matte Acid Lime (`respeita`, `a precisão com que cada horário se encaixa`, `CLAEX`).
   - **`Syne` (`-0.04em`)** em títulos monumentais e cabeçalhos.
   - **`Mona Sans` + `Space Grotesk`** em labels, formulários e tabelas.
   - **`JetBrains Mono` (`tabular-nums`)** em horários (`07:30`), fitness scores e saída do terminal `claude-code`.
3. **Galeria Dark Charcoal (`#para-quem`) + Footer Contido Lando Norris**:
   - Cards com recorte chanfrado em SVG (`.lando-frame-svg`), coluna central escalonada (`.lando-col-stagger`) e objetos geométricos interativos no hover via `MotionUI`.
   - Painel final `footer` em `#111112` emoldurado por borda perimetral limpa de `4px` em `var(--neon-lime)`.
4. **Resiliência Sem Imagens Quebradas**:
   - `#painel` (`grade.html` e `listar_sala.html`) usa escudo arquitetônico SVG inline (`CPS // SP`), e os cartões da equipe (`Daniel`, `Vini`, `Samuel`) incluem monogramas tipográficos `DSP`, `VC`, `SAB` em caso de indisponibilidade de avatar externo.

➡️ Próxima leitura: **[[02 - Design Tokens OKLCH e Theme Studio]]**
