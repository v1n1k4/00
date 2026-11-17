package com.claex.crud.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.claex.crud.Entity.AuditoriaEntity;
import com.claex.crud.Repository.AuditoriaRepository;

@Service
public class AuditoriaService {
    @Autowired
    private AuditoriaRepository repository;

    public void registrar(String usuario, String acao, String detalhe) {
        AuditoriaEntity log = new AuditoriaEntity();
        log.setUsuario(usuario);
        log.setAcao(acao);
        log.setDetalhe(detalhe);
        
        repository.save(log);
    }

    public List<AuditoriaEntity> listarHistorico() {
        return repository.findAll();
    }
    
}
