package com.claex.crud.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.SalaEntity;

@Repository
public interface SalaRepository extends JpaRepository<SalaEntity, Long>{
    @Query("SELECT s FROM SalaEntity s WHERE s.escola.id = :id_escola")
    Optional<List<SalaEntity>> findByEscolaId(@Param("id_escola") Long id_escola);
}
