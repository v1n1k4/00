package com.claex.crud.Controller;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Entity.DisponibilidadeEntity;
import com.claex.crud.Entity.MateriaEntity;
import com.claex.crud.Entity.MateriaProfessorEntity;
import com.claex.crud.Repository.CadastroRepository;
import com.claex.crud.Repository.MateriaRepository;
import com.claex.crud.Service.DisponibilidadeService;
import com.claex.crud.Service.MateriaProfessorService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/professor")
public class ProfessorAreaController {

    @Autowired
    private DisponibilidadeService disponibilidadeService;

    @Autowired
    private MateriaProfessorService materiaProfessorService;

    @Autowired
    private CadastroRepository cadastroRepository;

    @Autowired
    private MateriaRepository materiaRepository;

    private CadastroEntity resolverProfessor(Long idProfessor, HttpSession session) {
        if (session != null) {
            Object sessUser = session.getAttribute("usuarioLogado");
            if (sessUser instanceof CadastroEntity) {
                return (CadastroEntity) sessUser;
            }
        }
        if (idProfessor != null) {
            return cadastroRepository.findById(idProfessor).orElse(null);
        }
        return null;
    }

    // --- DISPONIBILIDADE ---
    @GetMapping("/disponibilidade")
    public ResponseEntity<?> listarMinhaDisponibilidade(
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        CadastroEntity prof = resolverProfessor(idProfessor, session);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado. Faça login novamente.");
        }
        return ResponseEntity.ok(disponibilidadeService.listarPorProfessor(prof.getId()));
    }

    @PostMapping("/disponibilidade")
    public ResponseEntity<?> salvarDisponibilidade(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        try {
            Long idParam = idProfessor != null ? idProfessor :
                    (body.get("idProfessor") != null ? Long.valueOf(body.get("idProfessor").toString()) : null);
            CadastroEntity prof = resolverProfessor(idParam, session);
            if (prof == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado.");
            }

            DisponibilidadeEntity d = new DisponibilidadeEntity();
            d.setDiaSemana(String.valueOf(body.getOrDefault("diaSemana", "Segunda-feira")));
            String ini = String.valueOf(body.get("horarioInicial"));
            String fim = String.valueOf(body.get("horarioFinal"));
            if (ini.length() == 5) ini += ":00";
            if (fim.length() == 5) fim += ":00";
            d.setHorarioInicial(LocalTime.parse(ini));
            d.setHorarioFinal(LocalTime.parse(fim));
            d.setModalidade(String.valueOf(body.getOrDefault("modalidade", "Presencial")));
            d.setObservacao(body.get("observacao") != null ? String.valueOf(body.get("observacao")) : "");

            return ResponseEntity.ok(disponibilidadeService.cadastrar(d, prof));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar disponibilidade: " + e.getMessage());
        }
    }

    @DeleteMapping("/disponibilidade/{id}")
    public ResponseEntity<?> deletarDisponibilidade(
            @PathVariable Long id,
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        CadastroEntity prof = resolverProfessor(idProfessor, session);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado.");
        }
        disponibilidadeService.remover(id, prof);
        return ResponseEntity.ok("Disponibilidade removida com sucesso!");
    }

    // --- MINHAS MATÉRIAS ---
    @GetMapping("/materias")
    public ResponseEntity<?> listarMinhasMaterias(
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        CadastroEntity prof = resolverProfessor(idProfessor, session);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado.");
        }
        return ResponseEntity.ok(materiaProfessorService.listarPorProfessor(prof.getId()));
    }

    @PostMapping("/materias")
    public ResponseEntity<?> vincularMateria(
            @RequestBody Map<String, Object> body,
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        try {
            Long idParam = idProfessor != null ? idProfessor :
                    (body.get("idProfessor") != null ? Long.valueOf(body.get("idProfessor").toString()) : null);
            CadastroEntity prof = resolverProfessor(idParam, session);
            if (prof == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado.");
            }

            String nomeMateria = body.get("nomeMateria") != null ? String.valueOf(body.get("nomeMateria")).trim() : null;
            if (nomeMateria == null || nomeMateria.isEmpty()) {
                return ResponseEntity.badRequest().body("Informe o nome da matéria.");
            }

            MateriaEntity materia = materiaRepository.findByNomeMateriaIgnoreCase(nomeMateria)
                    .orElseGet(() -> {
                        MateriaEntity nova = new MateriaEntity();
                        nova.setNome_materia(nomeMateria);
                        return materiaRepository.save(nova);
                    });

            MateriaProfessorEntity mp = new MateriaProfessorEntity();
            mp.setMateria(materia);
            mp.setNivelEnsino(String.valueOf(body.getOrDefault("nivelEnsino", "Médio")));
            mp.setExperiencia(String.valueOf(body.getOrDefault("experiencia", "1 ano")));
            if (body.get("descricao") != null) {
                mp.setDescricao(String.valueOf(body.get("descricao")));
            }

            return ResponseEntity.ok(materiaProfessorService.vincular(mp, prof));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao vincular matéria: " + e.getMessage());
        }
    }

    @DeleteMapping("/materias/{id}")
    public ResponseEntity<?> desvincularMateria(
            @PathVariable Long id,
            @RequestParam(required = false) Long idProfessor,
            HttpSession session) {
        CadastroEntity prof = resolverProfessor(idProfessor, session);
        if (prof == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Professor não identificado.");
        }
        materiaProfessorService.remover(id, prof);
        return ResponseEntity.ok("Matéria desvinculada com sucesso!");
    }
}
