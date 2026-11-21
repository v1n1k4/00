# CLAEX Mobile — Expo Snack (React Native) & Figma Board

Este diretório contém o aplicativo mobile completo do **CLAEX** em **React Native (Expo SDK 52)** pronto para rodar no **[Expo Snack (`snack.expo.dev`)](https://snack.expo.dev/)**, usando a **Paleta Institucional Brutalista** (`#0F172A`, `#F1F5F9`, `#1E3A8A`, `#DBEAFE`, `#B91C1C`).

## 1. Abrir direto no Expo Snack

- **Link direto (carrega `App.js` do GitHub):**
  `https://snack.expo.dev/G-RPsJwgRYl_F98D2DTzl
- Ou acesse `https://snack.expo.dev/` e cole o conteúdo de [`mobile-snack/App.js`](App.js).

## 2. As 9 Telas Incluídas em `App.js`

| # | Tela no App (`page`) | Página Web Equivalente | Funcionalidades no Mobile |
| :-: | :--- | :--- | :--- |
| 01 | `index` | `index.html` | Abertura animada `CLAE` + `X` (`Animated`), Rede Neural interativa com 6 nós, Exemplo em 4 passos (conflitos 7 → 0, qualidade 94%), Abas por Perfil e Equipe (Daniel, Vini, Samuel) |
| 02 | `listar_sala` | `listar_sala.html` | Unidade Centro Paula Souza + lista de salas/turmas com acesso à grade |
| 03 | `grade` | `grade.html` | Orquestrador CLAEX v10 (Gemini 2.5 Pro / Claude Sonnet 4 / o3-mini), 4 KPIs, quadro horário Seg–Sex e ensino de regras para IA |
| 04 | `painel_professor` | `painel_professor.html` | Matriz interativa de disponibilidade docente por dia e turno |
| 05 | `tabela_cadastros` | `tabela_cadastros.html` | Diretório de professores, administradores e alunos |
| 06 | `form_nova_sala` | `form_nova_sala.html` | Cadastro de nova sala/turma com atualização em tempo real |
| 07 | `config_sala` | `config_sala.html` | Ajuste de horário inicial e intervalo |
| 08 | `form_login` | `form_login.html` | Autenticação central |
| 09 | `form_cadastro` | `form_cadastro.html` | Registro multiperfil (`ALUNO`, `PROFESSOR`, `ADMIN`) |

## 3. Canvas Figma com todas as páginas

- Arquivo web interativo: [`lolooo-main/src/main/resources/static/figma_canvas.html`](../lolooo-main/src/main/resources/static/figma_canvas.html) (alterna entre **Desktop 1440px** e **Mobile Snack 375px** para todos os 9 artboards).
