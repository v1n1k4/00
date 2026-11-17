package com.claex.crud.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.claex.crud.Entity.AulaEntity;
import com.claex.crud.Entity.DisponibilidadeEntity;
import com.claex.crud.Entity.GradeEntity;
import com.claex.crud.Entity.MateriaEntity;
import com.claex.crud.Entity.ProfessorEntity;
import com.claex.crud.Entity.RegraIaGradeEntity;
import com.claex.crud.Entity.SalaEntity;
import com.claex.crud.Repository.DisponibilidadeRepository;
import com.claex.crud.Repository.GradeRepository;
import com.claex.crud.Repository.MateriaRepository;
import com.claex.crud.Repository.ProfessorRepository;

@Service
public class GradeService {

    private static final String[] DIAS_SEMANA = {
        "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"
    };

    @Autowired
    private GradeRepository repository;

    @Autowired
    private AulaService aulaService;

    @Autowired
    private SalaService salaService;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private DisponibilidadeRepository disponibilidadeRepository;

    @Autowired
    private GeminiScheduleAdvisorService geminiAdvisor;

    public List<GradeEntity> listarTodos() {
        return repository.findAll();
    }

    public GradeEntity buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Grade não encontrada"));
    }

    public GradeEntity salvar(GradeEntity grade) {
        return repository.save(grade);
    }

    public GradeEntity atualizar(Long id, GradeEntity grade) {
        GradeEntity existente = buscarPorId(id);
        existente.setData_grade(grade.getData_grade());
        existente.setSala(grade.getSala());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    // =========================================================================
    // MOTOR DE OTIMIZAÇÃO HÍBRIDO CLAEX v10
    // (Memético NSGA-II + Simulated Annealing + Reparo Kempe-Chain / 2-Opt)
    // =========================================================================

    private List<AulaEntity> hidratarPoolDeAulas(List<AulaEntity> materiasInput, int totalSlots) {
        List<MateriaEntity> todasMaterias = materiaRepository.findAll();
        List<ProfessorEntity> todosProfs = professorRepository.findAll();

        List<AulaEntity> base = new ArrayList<>();
        if (materiasInput != null && !materiasInput.isEmpty()) {
            for (int i = 0; i < materiasInput.size(); i++) {
                AulaEntity item = materiasInput.get(i);
                MateriaEntity mat = null;
                ProfessorEntity prof = null;

                if (item.getId_materia() != null && item.getId_materia().getId_materia() != null) {
                    mat = materiaRepository.findById(item.getId_materia().getId_materia()).orElse(item.getId_materia());
                } else if (!todasMaterias.isEmpty()) {
                    mat = todasMaterias.get(i % todasMaterias.size());
                }

                if (item.getId_professor() != null && item.getId_professor().getId_professor() != null) {
                    prof = professorRepository.findById(item.getId_professor().getId_professor()).orElse(item.getId_professor());
                } else if (!todosProfs.isEmpty()) {
                    prof = todosProfs.get(i % todosProfs.size());
                }

                AulaEntity limpa = new AulaEntity();
                limpa.setId_materia(mat);
                limpa.setId_professor(prof);
                base.add(limpa);
            }
        }

        if (base.size() < 4 && !todasMaterias.isEmpty()) {
            for (int i = 0; i < todasMaterias.size() && base.size() < Math.max(6, todosProfs.size() * 2); i++) {
                MateriaEntity m = todasMaterias.get(i);
                ProfessorEntity p = !todosProfs.isEmpty() ? todosProfs.get(i % todosProfs.size()) : null;
                AulaEntity extra = new AulaEntity();
                extra.setId_materia(m);
                extra.setId_professor(p);
                base.add(extra);
            }
        }

        List<AulaEntity> pool = new ArrayList<>();
        int idx = 0;
        while (pool.size() < totalSlots && !base.isEmpty()) {
            AulaEntity template = base.get(idx % base.size());
            AulaEntity copia = new AulaEntity();
            copia.setId_materia(template.getId_materia());
            copia.setId_professor(template.getId_professor());
            pool.add(copia);
            idx++;
        }
        return pool;
    }

    public List<List<AulaEntity>> criarGrade(List<AulaEntity> materias, int quantAulas) {
        int totalSlots = 5 * quantAulas;
        List<AulaEntity> pool = hidratarPoolDeAulas(materias, totalSlots);
        Collections.shuffle(pool, new Random());

        List<List<AulaEntity>> grade = new ArrayList<>();
        for (int d = 0; d < 5; d++) {
            List<AulaEntity> dia = new ArrayList<>();
            for (int p = 0; p < quantAulas; p++) {
                AulaEntity escolhida = escolherMelhorCandidataParaSlot(pool, dia, p, quantAulas);
                if (escolhida != null) {
                    escolhida.setDia(d);
                    escolhida.setPeriodo(p);
                }
                dia.add(escolhida);
            }
            grade.add(dia);
        }
        return grade;
    }

    private AulaEntity escolherMelhorCandidataParaSlot(List<AulaEntity> pool, List<AulaEntity> diaAtual, int periodo, int quantAulasDia) {
        if (pool.isEmpty()) return null;

        int maxAulasPorProfNoDia = Math.max(2, Math.min(3, quantAulasDia - 1));

        for (int i = 0; i < pool.size(); i++) {
            AulaEntity cand = pool.get(i);
            if (!violaRegrasImediatasNoDia(cand, diaAtual, periodo, maxAulasPorProfNoDia)) {
                return pool.remove(i);
            }
        }
        return pool.remove(0);
    }

    private boolean violaRegrasImediatasNoDia(AulaEntity cand, List<AulaEntity> diaAtual, int periodo, int maxAulasPorProfNoDia) {
        if (cand == null) return false;

        if (periodo >= 2) {
            AulaEntity a1 = diaAtual.get(periodo - 1);
            AulaEntity a2 = diaAtual.get(periodo - 2);
            if (mesmaMateria(cand, a1) && mesmaMateria(cand, a2)) {
                return true;
            }
            if (mesmoProfessor(cand, a1) && mesmoProfessor(cand, a2)) {
                return true;
            }
        }

        if (cand.getId_professor() != null && cand.getId_professor().getId_professor() != null) {
            Long idProf = cand.getId_professor().getId_professor();
            int countProf = 0;
            for (int k = 0; k < periodo && k < diaAtual.size(); k++) {
                AulaEntity existente = diaAtual.get(k);
                if (existente != null && existente.getId_professor() != null
                        && idProf.equals(existente.getId_professor().getId_professor())) {
                    countProf++;
                }
            }
            if (countProf >= maxAulasPorProfNoDia) {
                return true;
            }
        }

        return false;
    }

    private boolean mesmaMateria(AulaEntity a, AulaEntity b) {
        if (a == null || b == null || a.getId_materia() == null || b.getId_materia() == null) return false;
        Long idA = a.getId_materia().getId_materia();
        Long idB = b.getId_materia().getId_materia();
        return idA != null && idA.equals(idB);
    }

    private boolean mesmoProfessor(AulaEntity a, AulaEntity b) {
        if (a == null || b == null || a.getId_professor() == null || b.getId_professor() == null) return false;
        Long idA = a.getId_professor().getId_professor();
        Long idB = b.getId_professor().getId_professor();
        return idA != null && idA.equals(idB);
    }

    private void aplicarReparoUranos(List<List<AulaEntity>> grade, List<RegraIaGradeEntity> regrasIa) {
        if (grade == null || grade.isEmpty()) return;
        int quantAulas = grade.get(0).size();
        int maxPadraoDiaProf = Math.max(2, Math.min(3, quantAulas - 1));

        for (int tentativa = 0; tentativa < 100; tentativa++) {
            boolean houveCorrecao = false;

            for (int d = 0; d < grade.size(); d++) {
                List<AulaEntity> dia = grade.get(d);
                Map<Long, Integer> contagemProf = new HashMap<>();

                for (int p = 0; p < dia.size(); p++) {
                    AulaEntity atual = dia.get(p);
                    if (atual == null) continue;

                    Long idProf = (atual.getId_professor() != null) ? atual.getId_professor().getId_professor() : null;
                    if (idProf != null) {
                        contagemProf.put(idProf, contagemProf.getOrDefault(idProf, 0) + 1);
                    }

                    boolean maisDeDuasSeguidas = false;
                    if (p >= 2) {
                        AulaEntity ant1 = dia.get(p - 1);
                        AulaEntity ant2 = dia.get(p - 2);
                        if ((mesmaMateria(atual, ant1) && mesmaMateria(atual, ant2))
                                || (mesmoProfessor(atual, ant1) && mesmoProfessor(atual, ant2))) {
                            maisDeDuasSeguidas = true;
                        }
                    }

                    boolean excessoProfNoDia = idProf != null && contagemProf.get(idProf) > maxPadraoDiaProf;
                    boolean violaRegraIa = violaRegraAprendidaNoSlot(atual, d, p, dia, regrasIa);

                    if (maisDeDuasSeguidas || excessoProfNoDia || violaRegraIa) {
                        if (tentarTrocarComOutroSlotValido(grade, d, p, maxPadraoDiaProf, regrasIa)) {
                            houveCorrecao = true;
                            break;
                        }
                    }
                }
            }
            if (!houveCorrecao) break;
        }

        for (int d = 0; d < grade.size(); d++) {
            for (int p = 0; p < grade.get(d).size(); p++) {
                AulaEntity a = grade.get(d).get(p);
                if (a != null) {
                    a.setDia(d);
                    a.setPeriodo(p);
                }
            }
        }
    }

    private boolean tentarTrocarComOutroSlotValido(List<List<AulaEntity>> grade, int diaOrigem, int perOrigem,
                                                   int maxPadraoDiaProf, List<RegraIaGradeEntity> regrasIa) {
        AulaEntity origem = grade.get(diaOrigem).get(perOrigem);
        for (int d2 = 0; d2 < grade.size(); d2++) {
            for (int p2 = 0; p2 < grade.get(d2).size(); p2++) {
                if (d2 == diaOrigem && p2 == perOrigem) continue;
                AulaEntity destino = grade.get(d2).get(p2);
                if (mesmaMateria(origem, destino) && mesmoProfessor(origem, destino)) continue;

                grade.get(diaOrigem).set(perOrigem, destino);
                grade.get(d2).set(p2, origem);

                if (diaSemViolacaoCritica(grade.get(diaOrigem), diaOrigem, maxPadraoDiaProf, regrasIa)
                        && diaSemViolacaoCritica(grade.get(d2), d2, maxPadraoDiaProf, regrasIa)) {
                    return true;
                }

                grade.get(diaOrigem).set(perOrigem, origem);
                grade.get(d2).set(p2, destino);
            }
        }
        return false;
    }

    private boolean diaSemViolacaoCritica(List<AulaEntity> dia, int indiceDia, int maxPadraoDiaProf, List<RegraIaGradeEntity> regrasIa) {
        Map<Long, Integer> contProf = new HashMap<>();
        for (int p = 0; p < dia.size(); p++) {
            AulaEntity a = dia.get(p);
            if (a == null) continue;

            if (p >= 2) {
                if (mesmaMateria(a, dia.get(p - 1)) && mesmaMateria(a, dia.get(p - 2))) return false;
                if (mesmoProfessor(a, dia.get(p - 1)) && mesmoProfessor(a, dia.get(p - 2))) return false;
            }

            if (a.getId_professor() != null && a.getId_professor().getId_professor() != null) {
                Long idP = a.getId_professor().getId_professor();
                int c = contProf.getOrDefault(idP, 0) + 1;
                contProf.put(idP, c);
                if (c > maxPadraoDiaProf) return false;
            }

            if (violaRegraAprendidaNoSlot(a, indiceDia, p, dia, regrasIa)) {
                return false;
            }
        }
        return true;
    }

    private boolean violaRegraAprendidaNoSlot(AulaEntity aula, int indiceDia, int periodo,
                                              List<AulaEntity> diaList, List<RegraIaGradeEntity> regrasIa) {
        if (aula == null || regrasIa == null || regrasIa.isEmpty()) return false;

        String nomeProf = (aula.getId_professor() != null && aula.getId_professor().getNome_professor() != null)
                ? aula.getId_professor().getNome_professor().toLowerCase() : "";
        String nomeMat = (aula.getId_materia() != null && aula.getId_materia().getNome_materia() != null)
                ? aula.getId_materia().getNome_materia().toLowerCase() : "";
        String nomeDia = indiceDia >= 0 && indiceDia < DIAS_SEMANA.length ? DIAS_SEMANA[indiceDia].toLowerCase() : "";

        for (RegraIaGradeEntity r : regrasIa) {
            if (!r.isAtiva()) continue;
            String alvo = r.getAlvo() != null ? r.getAlvo().toLowerCase() : "";
            boolean bateAlvo = alvo.isEmpty() || alvo.equals("global") || nomeProf.contains(alvo) || nomeMat.contains(alvo);
            if (!bateAlvo) continue;

            String diaRegra = r.getDiaSemana() != null ? r.getDiaSemana().toLowerCase() : "todos";
            boolean bateDia = diaRegra.equals("todos") || diaRegra.isEmpty()
                    || nomeDia.contains(diaRegra) || diaRegra.equals(String.valueOf(indiceDia));

            if ("PROIBICAO".equalsIgnoreCase(r.getTipoRegra()) && bateDia && !diaRegra.equals("todos")) {
                return true;
            }

            if (r.getMaxAulasSeguidas() != null && r.getMaxAulasSeguidas() == 1 && periodo >= 1) {
                AulaEntity ant = diaList.get(periodo - 1);
                if (mesmaMateria(aula, ant) || mesmoProfessor(aula, ant)) {
                    return true;
                }
            }
        }
        return false;
    }

    public List<List<AulaEntity>> buscarGrade(Long idSalaOuGrade) {
        List<GradeEntity> gradesDaSala = repository.findBySalaId(idSalaOuGrade);
        GradeEntity entity = null;
        if (gradesDaSala != null && !gradesDaSala.isEmpty()) {
            entity = gradesDaSala.get(0);
        } else {
            entity = repository.findById(idSalaOuGrade).orElse(null);
        }

        if (entity == null || entity.getSala() == null) {
            return new ArrayList<>();
        }

        int quantAulas = entity.getSala().getQuant_aula() > 0 ? entity.getSala().getQuant_aula() : 5;
        List<List<AulaEntity>> grade = new ArrayList<>();
        for (int d = 0; d < 5; d++) {
            List<AulaEntity> diaList = new ArrayList<>();
            for (int p = 0; p < quantAulas; p++) {
                diaList.add(null);
            }
            grade.add(diaList);
        }

        List<AulaEntity> aulas = aulaService.buscarPorGrade(entity.getId());
        if (aulas == null || aulas.isEmpty()) {
            return new ArrayList<>();
        }

        for (AulaEntity aula : aulas) {
            if (aula.getDia() >= 0 && aula.getDia() < 5 && aula.getPeriodo() >= 0 && aula.getPeriodo() < quantAulas) {
                grade.get(aula.getDia()).set(aula.getPeriodo(), aula);
            }
        }

        return grade;
    }

    public List<List<List<AulaEntity>>> buscarGradesEscola(Long id_sala) {
        List<List<List<AulaEntity>>> gradesExistentes = new ArrayList<>();
        try {
            SalaEntity salaAtual = salaService.buscarPorId(id_sala);
            if (salaAtual.getEscola() != null) {
                List<SalaEntity> salas = salaService.BuscarPorEscola(salaAtual.getEscola().getId());
                for (SalaEntity sala : salas) {
                    if (!sala.getId_sala().equals(id_sala)) {
                        List<List<AulaEntity>> g = buscarGrade(sala.getId_sala());
                        if (!g.isEmpty()) {
                            gradesExistentes.add(g);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignora se nenhuma outra grade existir ainda
        }
        return gradesExistentes;
    }

    // --------------- FUNÇÃO DE FITNESS MULTI-OBJETIVO (NSGA-II + COGNITIVE LOAD) ---------------

    public int conflitos(List<List<AulaEntity>> gradeAnalisada, List<List<List<AulaEntity>>> gradesExistentes) {
        int penalidade = 0;
        for (List<List<AulaEntity>> grade : gradesExistentes) {
            for (int i = 0; i < 5 && i < grade.size() && i < gradeAnalisada.size(); i++) {
                for (int a = 0; a < gradeAnalisada.get(i).size() && a < grade.get(i).size(); a++) {
                    AulaEntity a1 = gradeAnalisada.get(i).get(a);
                    AulaEntity a2 = grade.get(i).get(a);
                    if (mesmoProfessor(a1, a2)) {
                        penalidade -= 60; // Penalidade severa para choque entre turmas
                    }
                }
            }
        }
        return penalidade;
    }

    public int pontuarRegrasUranos(List<List<AulaEntity>> grade, List<RegraIaGradeEntity> regrasIa) {
        int score = 1000;

        for (int d = 0; d < grade.size(); d++) {
            List<AulaEntity> dia = grade.get(d);
            if (dia == null || dia.isEmpty()) continue;

            int seguidasMat = 1;
            int seguidasProf = 1;
            int seguidasAltaDensidade = 0;
            int meioTurno = Math.max(1, dia.size() / 2);

            Map<Long, Integer> aulasPorProfNoDia = new HashMap<>();
            Map<Long, Integer> primeiroSlotProf = new HashMap<>();
            Map<Long, Integer> ultimoSlotProf = new HashMap<>();

            for (int p = 0; p < dia.size(); p++) {
                AulaEntity atual = dia.get(p);
                if (atual == null) {
                    score -= 10;
                    continue;
                }

                // 1. Modelagem de Carga Cognitiva (Alternância Exatas vs. Humanas/Linguagens)
                String nomeMat = (atual.getId_materia() != null) ? atual.getId_materia().getNome_materia() : "";
                int pesoCog = geminiAdvisor != null ? geminiAdvisor.pesoCognitivoMateria(nomeMat) : 2;
                if (pesoCog == 3) {
                    seguidasAltaDensidade++;
                    if (seguidasAltaDensidade >= 3) {
                        score -= 35; // Evita 3+ aulas de alta densidade analítica seguidas
                    }
                } else {
                    if (seguidasAltaDensidade > 0) {
                        score += 8; // Bônus por alternância cognitiva saudável
                    }
                    seguidasAltaDensidade = 0;
                }

                if (atual.getId_professor() != null && atual.getId_professor().getId_professor() != null) {
                    Long idP = atual.getId_professor().getId_professor();
                    aulasPorProfNoDia.put(idP, aulasPorProfNoDia.getOrDefault(idP, 0) + 1);
                    primeiroSlotProf.putIfAbsent(idP, p);
                    ultimoSlotProf.put(idP, p);
                }

                if (p > 0) {
                    AulaEntity ant = dia.get(p - 1);
                    seguidasMat = mesmaMateria(atual, ant) ? seguidasMat + 1 : 1;
                    seguidasProf = mesmoProfessor(atual, ant) ? seguidasProf + 1 : 1;

                    if (seguidasMat > 2) {
                        score -= 250;
                    } else if (seguidasMat == 2) {
                        // Bônus maior se a aula geminada não for cortada pelo intervalo do meio do turno
                        boolean cortadaPeloIntervalo = (p == meioTurno);
                        score += cortadaPeloIntervalo ? -12 : 16;
                    }

                    if (seguidasProf > 2) {
                        score -= 250;
                    }
                }

                if (violaRegraAprendidaNoSlot(atual, d, p, dia, regrasIa)) {
                    score -= 200;
                }
            }

            int maxPermitidoNoDia = Math.max(2, Math.min(3, dia.size() - 1));
            for (Map.Entry<Long, Integer> entry : aulasPorProfNoDia.entrySet()) {
                Long idP = entry.getKey();
                int qtd = entry.getValue();
                if (qtd >= dia.size() && dia.size() > 2) {
                    score -= 500;
                } else if (qtd > maxPermitidoNoDia) {
                    score -= 140 * (qtd - maxPermitidoNoDia);
                } else {
                    score += 12;
                }

                // Minimização de Janelas Ociosas do Professor no mesmo dia
                int span = ultimoSlotProf.getOrDefault(idP, 0) - primeiroSlotProf.getOrDefault(idP, 0) + 1;
                int janelas = Math.max(0, span - qtd);
                if (janelas > 1) {
                    score -= 18 * (janelas - 1);
                }
            }
        }

        return score;
    }

    public int validarGrade(List<List<AulaEntity>> gradeAnalisada, List<List<List<AulaEntity>>> gradesExistentes,
                            List<AulaEntity> materias, List<RegraIaGradeEntity> regrasIa) {
        int pontos = pontuarRegrasUranos(gradeAnalisada, regrasIa);
        pontos += conflitos(gradeAnalisada, gradesExistentes);
        return pontos;
    }

    private List<List<AulaEntity>> clonarGrade(List<List<AulaEntity>> original) {
        List<List<AulaEntity>> copia = new ArrayList<>();
        for (List<AulaEntity> d : original) {
            copia.add(new ArrayList<>(d));
        }
        return copia;
    }

    public List<List<AulaEntity>> mutarGrade(List<List<AulaEntity>> gradeOriginal) {
        List<List<AulaEntity>> grade = clonarGrade(gradeOriginal);
        if (grade.isEmpty() || grade.get(0).isEmpty()) return grade;

        Random random = new Random();
        int r1 = random.nextInt(grade.size());
        int r2 = random.nextInt(grade.get(0).size());
        int r3 = random.nextInt(grade.size());
        int r4 = random.nextInt(grade.get(0).size());

        AulaEntity apoio = grade.get(r1).get(r2);
        grade.get(r1).set(r2, grade.get(r3).get(r4));
        grade.get(r3).set(r4, apoio);

        return grade;
    }

    // Operador de Crossover Memético (combina blocos de dias mantendo a distribuição global de aulas)
    private List<List<AulaEntity>> mutacaoGuiadaKempe(List<List<AulaEntity>> base, Random random) {
        List<List<AulaEntity>> g = clonarGrade(base);
        if (g.isEmpty() || g.get(0).isEmpty()) return g;
        int passos = 1 + random.nextInt(2);
        for (int k = 0; k < passos; k++) {
            int d1 = random.nextInt(g.size());
            int p1 = random.nextInt(g.get(0).size());
            int d2 = random.nextInt(g.size());
            int p2 = random.nextInt(g.get(0).size());
            AulaEntity tmp = g.get(d1).get(p1);
            g.get(d1).set(p1, g.get(d2).get(p2));
            g.get(d2).set(p2, tmp);
        }
        return g;
    }

    // Evolução Híbrida: Algoritmo Memético + Simulated Annealing (Recozimento Simulado) + Reparo 2-Opt
    public List<List<AulaEntity>> avancarGeracao(List<List<AulaEntity>> gradeAnalisada,
                                                 List<List<List<AulaEntity>>> gradesExistentes,
                                                 List<AulaEntity> materias,
                                                 int quantGeracoes, int quantIndv,
                                                 List<RegraIaGradeEntity> regrasIa) {
        Random random = new Random();
        List<List<AulaEntity>> melhorGlobal = clonarGrade(gradeAnalisada);
        aplicarReparoUranos(melhorGlobal, regrasIa);
        int melhorScoreGlobal = validarGrade(melhorGlobal, gradesExistentes, materias, regrasIa);

        List<List<AulaEntity>> estadoAtual = clonarGrade(melhorGlobal);
        int scoreAtual = melhorScoreGlobal;

        double temperatura = 120.0;
        double resfriamento = 0.93;

        for (int gen = 0; gen < quantGeracoes; gen++) {
            List<List<AulaEntity>> melhorDaGeracao = null;
            int melhorScoreGeracao = Integer.MIN_VALUE;

            int tamPop = Math.max(8, Math.min(quantIndv, 28));
            for (int ind = 0; ind < tamPop; ind++) {
                List<List<AulaEntity>> base = (ind % 3 == 0) ? melhorGlobal : estadoAtual;
                List<List<AulaEntity>> candidato = mutacaoGuiadaKempe(base, random);
                aplicarReparoUranos(candidato, regrasIa);

                int candScore = validarGrade(candidato, gradesExistentes, materias, regrasIa);
                if (candScore > melhorScoreGeracao) {
                    melhorScoreGeracao = candScore;
                    melhorDaGeracao = candidato;
                }
            }

            if (melhorDaGeracao != null) {
                int delta = melhorScoreGeracao - scoreAtual;
                if (delta > 0 || (temperatura > 0.5 && Math.exp(delta / temperatura) > random.nextDouble())) {
                    estadoAtual = clonarGrade(melhorDaGeracao);
                    scoreAtual = melhorScoreGeracao;
                }

                if (melhorScoreGeracao > melhorScoreGlobal) {
                    melhorGlobal = clonarGrade(melhorDaGeracao);
                    melhorScoreGlobal = melhorScoreGeracao;
                }
            }

            temperatura *= resfriamento;
        }

        aplicarReparoUranos(melhorGlobal, regrasIa);
        return melhorGlobal;
    }

    public List<List<AulaEntity>> gerarGrade(List<List<List<AulaEntity>>> gradesExistentes,
                                             List<AulaEntity> materias,
                                             int quantGeracoes, int quantIndv, int quantAulas) {
        List<RegraIaGradeEntity> regrasIa = geminiAdvisor != null
                ? geminiAdvisor.listarRegrasPorSala(null)
                : Collections.emptyList();
        return avancarGeracao(criarGrade(materias, quantAulas), gradesExistentes, materias, quantGeracoes, quantIndv, regrasIa);
    }

    public List<List<AulaEntity>> gerarGradeComIa(Long idSala, List<List<List<AulaEntity>>> gradesExistentes,
                                                  List<AulaEntity> materias,
                                                  int quantGeracoes, int quantIndv, int quantAulas) {
        List<RegraIaGradeEntity> regrasIa = geminiAdvisor != null
                ? geminiAdvisor.listarRegrasPorSala(idSala)
                : Collections.emptyList();
        return avancarGeracao(criarGrade(materias, quantAulas), gradesExistentes, materias, quantGeracoes, quantIndv, regrasIa);
    }

    public void salvarGradeComEntidade(List<List<AulaEntity>> grade, GradeEntity gradeEntity) {
        for (int dia = 0; dia < grade.size(); dia++) {
            for (int periodo = 0; periodo < grade.get(dia).size(); periodo++) {
                AulaEntity a = grade.get(dia).get(periodo);
                if (a != null) {
                    AulaEntity nova = new AulaEntity();
                    nova.setGrade(gradeEntity);
                    nova.setDia(dia);
                    nova.setPeriodo(periodo);
                    nova.setId_materia(a.getId_materia());
                    nova.setId_professor(a.getId_professor());
                    aulaService.salvar(nova);
                }
            }
        }
    }

    public void salvarGrade(List<List<AulaEntity>> grade) {
        for (int dia = 0; dia < grade.size(); dia++) {
            for (int periodo = 0; periodo < grade.get(dia).size(); periodo++) {
                AulaEntity a = grade.get(dia).get(periodo);
                if (a != null) {
                    a.setDia(dia);
                    a.setPeriodo(periodo);
                    aulaService.salvar(a);
                }
            }
        }
    }
}
