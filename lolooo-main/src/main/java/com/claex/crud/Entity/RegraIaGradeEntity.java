package com.claex.crud.Entity;

import java.time.LocalDateTime;

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
@Table(name = "tbl_regra_ia_grade")
public class RegraIaGradeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_sala")
    private SalaEntity sala;

    @Column(nullable = false, length = 30)
    private String tipoRegra = "PREFERENCIA"; // PROIBICAO, PREFERENCIA, FEEDBACK_IA

    @Column(length = 120)
    private String alvo; // Ex: Nome do professor ou matéria

    @Column(length = 30)
    private String diaSemana; // Ex: Segunda-feira, Todos

    @Column
    private Integer maxAulasSeguidas = 2;

    @Column
    private Integer maxAulasDiaProfessor = 3;

    @Column(nullable = false, length = 1000)
    private String descricao;

    @Column(length = 2000)
    private String analiseGemini;

    @Column(nullable = false)
    private boolean ativa = true;

    private LocalDateTime criadoEm = LocalDateTime.now();

    public RegraIaGradeEntity() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SalaEntity getSala() {
        return sala;
    }

    public void setSala(SalaEntity sala) {
        this.sala = sala;
    }

    public String getTipoRegra() {
        return tipoRegra;
    }

    public void setTipoRegra(String tipoRegra) {
        this.tipoRegra = tipoRegra;
    }

    public String getAlvo() {
        return alvo;
    }

    public void setAlvo(String alvo) {
        this.alvo = alvo;
    }

    public String getDiaSemana() {
        return diaSemana;
    }

    public void setDiaSemana(String diaSemana) {
        this.diaSemana = diaSemana;
    }

    public Integer getMaxAulasSeguidas() {
        return maxAulasSeguidas;
    }

    public void setMaxAulasSeguidas(Integer maxAulasSeguidas) {
        this.maxAulasSeguidas = maxAulasSeguidas;
    }

    public Integer getMaxAulasDiaProfessor() {
        return maxAulasDiaProfessor;
    }

    public void setMaxAulasDiaProfessor(Integer maxAulasDiaProfessor) {
        this.maxAulasDiaProfessor = maxAulasDiaProfessor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getAnaliseGemini() {
        return analiseGemini;
    }

    public void setAnaliseGemini(String analiseGemini) {
        this.analiseGemini = analiseGemini;
    }

    public boolean isAtiva() {
        return ativa;
    }

    public void setAtiva(boolean ativa) {
        this.ativa = ativa;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
