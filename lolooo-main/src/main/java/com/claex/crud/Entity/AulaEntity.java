package com.claex.crud.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "tbl_aula")
public class AulaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_aula;

    @ManyToOne
    @JoinColumn(name = "id_grade")
    private GradeEntity grade;

    @Column(nullable = false)
    private int dia;

    @Column(nullable = false)
    private int periodo;

    @ManyToOne
    @JoinColumn(name = "id_materia")
    private MateriaEntity id_materia;

    @ManyToOne
    @JoinColumn(name = "id_professor")
    private ProfessorEntity id_professor;

    public AulaEntity() {
    }

    public Long getId_aula() {
        return id_aula;
    }

    public void setId_aula(Long id_aula) {
        this.id_aula = id_aula;
    }

    public GradeEntity getGrade() {
        return grade;
    }

    public void setGrade(GradeEntity grade) {
        this.grade = grade;
    }

    public int getDia() {
        return dia;
    }

    public void setDia(int dia) {
        this.dia = dia;
    }

    public int getPeriodo() {
        return periodo;
    }

    public void setPeriodo(int periodo) {
        this.periodo = periodo;
    }

    public MateriaEntity getId_materia() {
        return id_materia;
    }

    public void setId_materia(MateriaEntity id_materia) {
        this.id_materia = id_materia;
    }

    public ProfessorEntity getId_professor() {
        return id_professor;
    }

    public void setId_professor(ProfessorEntity id_professor) {
        this.id_professor = id_professor;
    }
}
