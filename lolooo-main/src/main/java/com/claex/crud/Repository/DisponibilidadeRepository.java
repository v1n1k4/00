package com.claex.crud.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.claex.crud.Entity.DisponibilidadeEntity;

public interface DisponibilidadeRepository extends JpaRepository<DisponibilidadeEntity, Long> {
    @Query("SELECT d FROM DisponibilidadeEntity d WHERE d.professor.id = :idProfessor")
    List<DisponibilidadeEntity> findByProfessorId(@Param("idProfessor") Long idProfessor);

    @Query("SELECT d FROM DisponibilidadeEntity d WHERE d.professor.id = :idProfessor AND d.diaSemana = :diaSemana")
    List<DisponibilidadeEntity> findByProfessorIdAndDiaSemana(@Param("idProfessor") Long idProfessor, @Param("diaSemana") String diaSemana);
}
