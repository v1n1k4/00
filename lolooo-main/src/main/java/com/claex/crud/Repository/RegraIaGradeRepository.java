package com.claex.crud.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.RegraIaGradeEntity;

@Repository
public interface RegraIaGradeRepository extends JpaRepository<RegraIaGradeEntity, Long> {
    @Query("SELECT r FROM RegraIaGradeEntity r WHERE r.ativa = true AND (r.sala IS NULL OR r.sala.id_sala = :idSala) ORDER BY r.id DESC")
    List<RegraIaGradeEntity> findRegrasAtivasPorSala(@Param("idSala") Long idSala);

    @Query("SELECT r FROM RegraIaGradeEntity r WHERE r.ativa = true ORDER BY r.id DESC")
    List<RegraIaGradeEntity> findAllAtivas();
}
