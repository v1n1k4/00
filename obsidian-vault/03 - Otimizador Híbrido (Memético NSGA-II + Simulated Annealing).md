---
title: "03 - Otimizador Híbrido (Memético NSGA-II + Simulated Annealing)"
aliases:
  - "Motor Memético NSGA-II"
  - "Simulated Annealing CLAEX"
  - "Algoritmo de Horários v10"
tags:
  - claex/v10
  - algoritmos/nsga-ii
  - algoritmos/simulated-annealing
  - otimizacao-combinatoria
  - kempe-chain
created: 2026-04-20
related:
  - "[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]"
  - "[[04 - Orquestração Multi-Modelo IA (Gemini 2.5 Pro, Claude Sonnet 4, o3-mini)]]"
---

# 🧬 03 — Otimizador Híbrido: Memético NSGA-II + Simulated Annealing + Kempe-Chain 2-Opt

⬅️ Voltar para **[[00 - MOC (Mapa de Conteúdo CLAEX v10)]]**

> [!important] Evolução Algorítmica (Legado vs. v10)
> O solver anterior (`GradeService.java`) utilizava uma mutação aleatória simples de 1 troca (*hill-climbing* ingênuo), que frequentemente ficava preso em ótimos locais e ignorava a fadiga cognitiva dos alunos e as janelas ociosas dos professores.
> Na **v10**, implementamos tanto em Java (`GradeService.java`) quanto em Python (`backend_python/main.py`) um **Motor Híbrido Memético NSGA-II + Recozimento Simulado (Simulated Annealing) + Reparo Local 2-Opt Kempe-Chain**.

---

## 1. Formulação Matemática da Função Multi-Objetivo ($F$)

Seja $G = \{g_{d, s}\}$ a matriz horária semanal da turma para os dias letivos $d \in \{1..5\}$ e slots diários $s \in \{1..Q\}$. A aptidão multi-objetivo $F(G)$ maximizada pelo motor é dada por:

$$F(G) = F_{\text{base}} - P_{\text{hard}}(G) - P_{\text{cognitiva}}(G) - P_{\text{janelas}}(G) + B_{\text{geminadas}}(G) + R_{\text{IA}}(G)$$

Onde:
1. **Penalidades Rígidas ($P_{\text{hard}}$)**:
   - **Trava de Consecutividade ($\le 2$ aulas seguidas)**: Se um mesmo professor ou matéria ocupa $>2$ slots consecutivos no dia $d$:
     $$P_{\text{consec}}(d, s) = 75 \text{ pts (3 seguidas)} \quad \text{ou} \quad 160 \text{ pts (}\ge 4\text{ seguidas)}$$
   - **Trava de Domínio Diário**: Proíbe que um único professor ministre todas as aulas de um dia letivo ($+190\text{ pts}$ de penalidade) ou exceda o teto saudável diário ($>3$ aulas do mesmo docente no mesmo dia).
   - **Conflito Multi-Escolar (`verificarDisponibilidadeProfessor`)**: Verifica em tempo real a tabela `Grade` global e a grade de disponibilidade `Horarios_professor` para garantir **zero choques** entre salas ou escolas diferentes ($+95\text{ pts}$ por violação).

2. **Fadiga e Carga Cognitiva ($P_{\text{cognitiva}}$)**:
   - Cada disciplina recebe um peso cognitivo $\omega(m) \in \{1, 2, 3\}$ (ex.: *Matemática, Física, Química, Programação* $\rightarrow \omega = 3$; *História, Português, Biologia* $\rightarrow \omega = 2$; *Artes, Educação Física* $\rightarrow \omega = 1$).
   - Penaliza sequências exaustivas de matérias pesadas consecutivas ($\omega(m_{s}) = 3 \land \omega(m_{s-1}) = 3 \implies -7.5\text{ pts}$) e sobrecarga no último horário do turno ($\omega(m_{Q}) = 3 \implies -4.0\text{ pts}$), além do desvio padrão da carga diária:
     $$P_{\text{var}} = 1.6 \times \sum_{d=1}^{5} \max\left(0, \left|\sum_{s=1}^{Q} \omega(g_{d,s}) - 2.15 \cdot Q\right| - 2.0\right)$$

3. **Minimização de Janelas Ociosas Docentes ($P_{\text{janelas}}$)**:
   - Para cada professor $p$ no dia $d$, sejam $s_{\min}(p,d)$ e $s_{\max}(p,d)$ a primeira e a última aula ministradas e $n(p,d)$ o total de aulas no dia. O número de janelas ociosas é:
     $$J(p, d) = \big(s_{\max}(p,d) - s_{\min}(p,d) + 1\big) - n(p,d)$$
   - Cada janela ociosa aplica uma penalidade de $11.5\text{ pts}$, compactando os horários do docente.

4. **Alinhamento de Aulas Geminadas ($B_{\text{geminadas}}$)**:
   - Recompensa blocos duplos legítimos ($+11.0\text{ pts}$) e penaliza aulas duplas partidas ao meio pelo horário de intervalo/recreio ($-14.0\text{ pts}$).

---

## 2. Recozimento Simulado (Simulated Annealing) & Critério de Metropolis

Durante a evolução da população ($N = 48$ indivíduos, $72$ gerações com elitismo de $15\%$ e seleção por torneio ternário), cada descendente passa por uma fase de **Simulated Annealing** com temperatura decrescente:

$$T_g = T_0 \cdot \alpha^g \quad \text{com } T_0 = 42.0, \; \alpha = 0.945$$

Se uma perturbação gera uma variação de energia $\Delta E = F(G_{\text{novo}}) - F(G_{\text{atual}}) < 0$, o movimento ainda pode ser aceito com probabilidade de Boltzmann-Metropolis para escapar de ótimos locais:

$$P(\text{aceitar}) = \exp\left(\frac{\Delta E}{T_g}\right)$$

---

## 3. Busca Local Memética: Reparo 2-Opt Kempe-Chain

Ao final do ciclo evolutivo (ou a cada 6 gerações nos indivíduos de elite), o operador `reparoKempeChain2Opt`:
1. Varre todos os slots $(d_1, s_1)$ que apresentem atrito local ($\ge 3$ aulas seguidas, janela docente ou aula pesada no fim do turno).
2. Avalia trocas 2-Opt com todos os candidatos $(d_2, s_2)$ compatíveis com a disponibilidade do professor.
3. Executa imediatamente a troca que maximiza $\Delta F > 0$ (First-Improvement / Steepest-Ascent Local Search).

---

## 4. Estratégias Selecionáveis na API e UI

O endpoint `POST /grade/gerargrade/{id_sala}?estrategia=...` suporta 3 modos:
- `MEMETIC_NSGA2_SA` *(Recomendado)*: Ciclo completo Memético NSGA-II + Simulated Annealing + Kempe-Chain 2-Opt.
- `SIMULATED_ANNEALING`: Foco intensivo em têmpera estocástica + reparo Kempe-Chain.
- `KEMPE_2OPT_FAST`: Convergência ultra-rápida para reajustes imediatos.

➡️ Próxima leitura: **[[04 - Orquestração Multi-Modelo IA (Gemini 2.5 Pro, Claude Sonnet 4, o3-mini)]]**
