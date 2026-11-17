package com.claex.crud.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.MateriaEntity;

@Repository
public interface MateriaRepository extends JpaRepository<MateriaEntity, Long>{
    @Query("SELECT m FROM MateriaEntity m WHERE LOWER(m.nome_materia) = LOWER(:nome)")
    Optional<MateriaEntity> findByNomeMateriaIgnoreCase(@Param("nome") String nome);
}
