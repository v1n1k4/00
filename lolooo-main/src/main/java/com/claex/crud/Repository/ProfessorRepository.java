package com.claex.crud.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.claex.crud.Entity.ProfessorEntity;

@Repository
public interface ProfessorRepository extends JpaRepository<ProfessorEntity, Long>{
    @Query("SELECT p FROM ProfessorEntity p WHERE LOWER(p.email_professor) = LOWER(:email)")
    Optional<ProfessorEntity> findByEmailProfessorIgnoreCase(@Param("email") String email);
}
