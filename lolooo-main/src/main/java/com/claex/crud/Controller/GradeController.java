package com.claex.crud.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.claex.crud.Entity.AulaEntity;
import com.claex.crud.Entity.GradeEntity;
import com.claex.crud.Entity.RegraIaGradeEntity;
import com.claex.crud.Entity.SalaEntity;
import com.claex.crud.Service.GeminiScheduleAdvisorService;
import com.claex.crud.Service.GradeService;
import com.claex.crud.Service.SalaService;

@RestController
@RequestMapping("/grade")
public class GradeController {

    @Autowired
    private GradeService service;

    @Autowired
    private SalaService salaService;

    @Autowired
    private GeminiScheduleAdvisorService geminiAdvisor;

    @GetMapping("/buscar/{id}")
    public List<List<AulaEntity>> buscarGrade(@PathVariable Long id) {
        return service.buscarGrade(id);
    }

    @PostMapping("/gerargrade/{id_sala}")
    public ResponseEntity<List<List<AulaEntity>>> gerarGrade(
            @PathVariable Long id_sala,
            @RequestParam(required = false, defaultValue = "memetico-sa") String estrategia,
            @RequestBody(required = false) List<AulaEntity> materias) {

        SalaEntity sala = salaService.buscarPorId(id_sala);
        GradeEntity grade = new GradeEntity();
        grade.setSala(sala);
        GradeEntity gradeEntity = service.salvar(grade);

        List<List<List<AulaEntity>>> gradesExistentes = service.buscarGradesEscola(sala.getId_sala());
        int quantAulas = sala.getQuant_aula() > 0 ? sala.getQuant_aula() : 5;

        int geracoes = "rapido".equalsIgnoreCase(estrategia) ? 35 : 75;
        int individuos = "rapido".equalsIgnoreCase(estrategia) ? 20 : 40;

        List<List<AulaEntity>> gradeFinalizada = service.gerarGradeComIa(
                sala.getId_sala(),
                gradesExistentes,
                materias,
                geracoes,
                individuos,
                quantAulas
        );

        service.salvarGradeComEntidade(gradeFinalizada, gradeEntity);
        return ResponseEntity.ok(gradeFinalizada);
    }

    // --- INTEGRAÇÃO MULTI-MODELO IA & TELEMETRIA DE OTIMIZAÇÃO ---

    @GetMapping("/ia/modelos")
    public ResponseEntity<List<Map<String, Object>>> listarModelosIa() {
        return ResponseEntity.ok(geminiAdvisor.listarModelosDisponiveis());
    }

    @GetMapping("/ia/analisar/{id_sala}")
    public ResponseEntity<Map<String, Object>> analisarGradeComIa(
            @PathVariable Long id_sala,
            @RequestParam(required = false, defaultValue = "gemini-2.5-pro") String modelo) {
        SalaEntity sala = salaService.buscarPorId(id_sala);
        List<List<AulaEntity>> grade = service.buscarGrade(id_sala);
        return ResponseEntity.ok(geminiAdvisor.analisarGradeComModelo(sala, grade, modelo));
    }

    @GetMapping("/ia/regras/{id_sala}")
    public ResponseEntity<List<RegraIaGradeEntity>> listarRegrasIa(@PathVariable Long id_sala) {
        return ResponseEntity.ok(geminiAdvisor.listarRegrasPorSala(id_sala));
    }

    @PostMapping("/ia/aprender/{id_sala}")
    public ResponseEntity<RegraIaGradeEntity> ensinarRegraParaIa(
            @PathVariable Long id_sala,
            @RequestBody Map<String, Object> body) {

        String tipoRegra = body.get("tipoRegra") != null ? String.valueOf(body.get("tipoRegra")) : "PROIBICAO";
        String alvo = body.get("alvo") != null ? String.valueOf(body.get("alvo")) : "";
        String diaSemana = body.get("diaSemana") != null ? String.valueOf(body.get("diaSemana")) : "Todos";
        Integer maxSeguidas = body.get("maxAulasSeguidas") != null
                ? Integer.valueOf(String.valueOf(body.get("maxAulasSeguidas"))) : 2;
        Integer maxDiaProf = body.get("maxAulasDiaProfessor") != null
                ? Integer.valueOf(String.valueOf(body.get("maxAulasDiaProfessor"))) : 3;
        String descricao = body.get("descricao") != null
                ? String.valueOf(body.get("descricao")) : "Evitar sobrecarga ou repetição na turma";

        RegraIaGradeEntity salva = geminiAdvisor.registrarAprendizado(
                id_sala, tipoRegra, alvo, diaSemana, maxSeguidas, maxDiaProf, descricao
        );
        return ResponseEntity.ok(salva);
    }

    @DeleteMapping("/ia/regras/{id_regra}")
    public ResponseEntity<String> removerRegraIa(@PathVariable Long id_regra) {
        geminiAdvisor.removerRegra(id_regra);
        return ResponseEntity.ok("Regra de IA removida com sucesso!");
    }
}
