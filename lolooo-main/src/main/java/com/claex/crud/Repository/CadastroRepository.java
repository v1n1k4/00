package com.claex.crud.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.claex.crud.Entity.CadastroEntity;

public interface CadastroRepository extends JpaRepository<CadastroEntity, Long> {

    Optional<CadastroEntity> findByNome(String nome);

    Optional<CadastroEntity> findByEmail(String email);

    Optional<CadastroEntity> findByNomeOrEmail(String nome, String email);

  
}