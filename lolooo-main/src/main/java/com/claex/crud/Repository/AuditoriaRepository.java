package com.claex.crud.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.AuditoriaEntity;

@Repository

public interface AuditoriaRepository extends JpaRepository<AuditoriaEntity, Long> {
}