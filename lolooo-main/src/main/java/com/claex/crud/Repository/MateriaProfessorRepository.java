package com.claex.crud.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.claex.crud.Entity.MateriaProfessorEntity;

public interface MateriaProfessorRepository extends JpaRepository<MateriaProfessorEntity, Long> {
    @Query("SELECT mp FROM MateriaProfessorEntity mp WHERE mp.professor.id = :idProfessor")
    List<MateriaProfessorEntity> findByProfessorId(@Param("idProfessor") Long idProfessor);

    @Query("SELECT COUNT(mp) > 0 FROM MateriaProfessorEntity mp WHERE mp.professor.id = :idProfessor AND mp.materia.id_materia = :idMateria")
    boolean existsByProfessorIdAndMateriaIdMateria(@Param("idProfessor") Long idProfessor, @Param("idMateria") Long idMateria);
}
