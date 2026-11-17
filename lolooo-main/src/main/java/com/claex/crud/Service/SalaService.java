package com.claex.crud.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.claex.crud.Entity.SalaEntity;
import com.claex.crud.Repository.AulaRepository;
import com.claex.crud.Repository.GradeRepository;
import com.claex.crud.Repository.SalaRepository;

@Service
public class SalaService {

    @Autowired
    private SalaRepository repository;

    @Autowired
    private AulaRepository aulaRepository;

    @Autowired
    private GradeRepository gradeRepository;

    public List<SalaEntity> listarTodos() {
        return repository.findAll();
    }

    public List<SalaEntity> BuscarPorEscola(Long id_escola) {
        return repository.findByEscolaId(id_escola)
                .orElseThrow(() -> new RuntimeException("Sala não encontrada"));
    }

    public SalaEntity buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala não encontrada"));
    }

    public SalaEntity salvar(SalaEntity sala) {
        return repository.save(sala);
    }

    public SalaEntity atualizar(Long id, SalaEntity sala) {
        SalaEntity existente = buscarPorId(id);

        existente.setNome_sala(sala.getNome_sala());
        existente.setDuracao_aula(sala.getDuracao_aula());
        existente.setDuracao_intervalo(sala.getDuracao_intervalo());
        existente.setInicio_aula(sala.getInicio_aula());
        existente.setQuant_aula(sala.getQuant_aula());

        return repository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        SalaEntity existente = buscarPorId(id);
        aulaRepository.deleteAllBySalaId(existente.getId_sala());
        gradeRepository.deleteAllBySalaId(existente.getId_sala());
        repository.deleteById(id);
    }
}
