package com.claex.crud.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Entity.ProfessorEntity;
import com.claex.crud.Repository.CadastroRepository;
import com.claex.crud.Repository.ProfessorRepository;
import com.claex.crud.security.PasswordService;

import java.util.List;

@Service
public class CadastroService {
    @Autowired
    private CadastroRepository repository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private PasswordService passwordService;

    // LISTAR TODOS
    public List<CadastroEntity> listarTodos() {
        return repository.findAll();
    }

    // BUSCAR POR ID
    public CadastroEntity buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cadastro não encontrado"));
    }

    // SALVAR
    public CadastroEntity salvar(CadastroEntity cadastro) {
        // Senha SEMPRE gravada como hash BCrypt (nunca texto puro)
        cadastro.setSenha(passwordService.hash(cadastro.getSenha()));
        CadastroEntity salvo = repository.save(cadastro);
        sincronizarProfessor(salvo);
        return salvo;
    }

    private void sincronizarProfessor(CadastroEntity cadastro) {
        if (cadastro.getTipo() != null && cadastro.getTipo().equalsIgnoreCase("professor")) {
            ProfessorEntity prof = professorRepository.findByEmailProfessorIgnoreCase(cadastro.getEmail())
                    .orElse(new ProfessorEntity());
            prof.setNome_professor(cadastro.getNome());
            prof.setEmail_professor(cadastro.getEmail());
            prof.setSenha_professor(cadastro.getSenha());
            professorRepository.save(prof);
        }
    }

    // ATUALIZAR
    public CadastroEntity atualizar(Long id, CadastroEntity cadastro) {
        CadastroEntity existente = buscarPorId(id);
        existente.setNome(cadastro.getNome());
        existente.setSenha(passwordService.hash(cadastro.getSenha()));
        existente.setEmail(cadastro.getEmail());
        existente.setTipo(cadastro.getTipo());
        CadastroEntity salvo = repository.save(existente);
        sincronizarProfessor(salvo);
        return salvo;
    }

    // DELETAR
    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
