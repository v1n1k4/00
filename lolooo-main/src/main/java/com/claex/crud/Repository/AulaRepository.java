package com.claex.crud.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.AulaEntity;

@Repository
public interface AulaRepository extends JpaRepository<AulaEntity, Long> {

    @Query("SELECT a FROM AulaEntity a WHERE a.grade.id = :id_grade")
    Optional<List<AulaEntity>> findByGradeId(@Param("id_grade") Long id_grade);

    @Modifying
    @Query("DELETE FROM AulaEntity a WHERE a.grade.sala.id_sala = :idSala")
    void deleteAllBySalaId(@Param("idSala") Long idSala);
}
