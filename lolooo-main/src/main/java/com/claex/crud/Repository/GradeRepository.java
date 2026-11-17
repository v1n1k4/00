package com.claex.crud.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.GradeEntity;

@Repository
public interface GradeRepository extends JpaRepository<GradeEntity, Long> {

    @Query("SELECT g FROM GradeEntity g WHERE g.sala.id_sala = :idSala ORDER BY g.id DESC")
    List<GradeEntity> findBySalaId(@Param("idSala") Long idSala);

    @Modifying
    @Query("DELETE FROM GradeEntity g WHERE g.sala.id_sala = :idSala")
    void deleteAllBySalaId(@Param("idSala") Long idSala);
}
