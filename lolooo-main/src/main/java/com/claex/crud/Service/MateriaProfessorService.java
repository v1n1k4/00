package com.claex.crud.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Entity.MateriaProfessorEntity; 
import com.claex.crud.Repository.MateriaProfessorRepository; 

@Service 

public class MateriaProfessorService {

    @Autowired
    private MateriaProfessorRepository repository;

    @Autowired
    private AuditoriaService auditoriaService;

    // Vincular matéria ao perfil do professor
    public MateriaProfessorEntity vincular(MateriaProfessorEntity mp, CadastroEntity professorLogado) {
        // Valida se a matéria já está vinculada a este professor
        boolean jaExiste = repository.existsByProfessorIdAndMateriaIdMateria(
                professorLogado.getId(), 
                mp.getMateria().getId_materia()
        );

        if (jaExiste) {
            throw new IllegalArgumentException("Esta matéria já está vinculada ao seu perfil.");
        }

        // Garante que o vínculo seja criado exclusivamente para o professor autenticado
        mp.setProfessor(professorLogado);
        MateriaProfessorEntity salva = repository.save(mp);

        auditoriaService.registrar(
                professorLogado.getNome(), 
                "VINCULAR_MATERIA", 
                "Vinculou a matéria ID: " + mp.getMateria().getId_materia()
        );

        return salva;
    }

    // Listar matérias do professor autenticado
    public List<MateriaProfessorEntity> listarPorProfessor(Long idProfessor) {
        return repository.findByProfessorId(idProfessor);
    }

    // Desvincular matéria do perfil
    public void remover(Long id, CadastroEntity professorLogado) {
        MateriaProfessorEntity mp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vínculo de matéria não encontrado."));

        // Garante que o professor só remova suas próprias matérias
        if (!mp.getProfessor().getId().equals(professorLogado.getId())) {
            throw new SecurityException("Operação não autorizada para este perfil.");
        }

        repository.delete(mp);
        
        auditoriaService.registrar(
                professorLogado.getNome(), 
                "REMOVER_MATERIA", 
                "Desvinculou o registro de matéria #" + id
        );
    }
    
}
