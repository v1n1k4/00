package com.claex.crud.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.claex.crud.Entity.CadastroEntity; 
import com.claex.crud.Entity.DisponibilidadeEntity;
import com.claex.crud.Repository.DisponibilidadeRepository; 

@Service
public class DisponibilidadeService {
    @Autowired
    private DisponibilidadeRepository repository;

    @Autowired
    private AuditoriaService auditoriaService;

    public DisponibilidadeEntity cadastrar(DisponibilidadeEntity d, CadastroEntity professorLogado) {
        // Validação de horário inicial/final
        if (!d.getHorarioFinal().isAfter(d.getHorarioInicial())) {
            throw new IllegalArgumentException("O horário final deve ser posterior ao horário inicial.");
        }

        // Validação de sobreposição e duplicidade
        List<DisponibilidadeEntity> existentes = repository.findByProfessorIdAndDiaSemana(
            professorLogado.getId(), d.getDiaSemana()
        );

        for (DisponibilidadeEntity item : existentes) {
            boolean sobrepoe = (d.getHorarioInicial().isBefore(item.getHorarioFinal()) && 
                                d.getHorarioFinal().isAfter(item.getHorarioInicial()));
            if (sobrepoe) {
                throw new IllegalArgumentException("Já existe um intervalo sobreposto ou duplicado para este dia.");
            }
        }

        d.setProfessor(professorLogado);
        DisponibilidadeEntity salva = repository.save(d);
        
        auditoriaService.registrar(professorLogado.getNome(), "CADASTRAR_DISPONIBILIDADE", 
            "Cadastrou intervalo no dia " + d.getDiaSemana());
            
        return salva;
    }

    public List<DisponibilidadeEntity> listarPorProfessor(Long idProfessor) {
        return repository.findByProfessorId(idProfessor);
    }

    public void remover(Long id, CadastroEntity professorLogado) {
        DisponibilidadeEntity d = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro não encontrado"));

        if (!d.getProfessor().getId().equals(professorLogado.getId())) {
            throw new SecurityException("Operação não autorizada para este perfil.");
        }

        repository.delete(d);
        auditoriaService.registrar(professorLogado.getNome(), "REMOVER_DISPONIBILIDADE", "Removeu registro #" + id);
    }
    
}
