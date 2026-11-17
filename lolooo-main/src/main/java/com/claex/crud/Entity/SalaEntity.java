package com.claex.crud.Entity;

import java.time.LocalTime;

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
@Table(name = "tbl_salas")
public class SalaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_sala;

    @Column(nullable = false)
    private String nome_sala;

    @Column(nullable = false)
    private int duracao_aula;

    @Column(nullable = false)
    private int duracao_intervalo;

    @Column(nullable = false)
    private int quant_aula;

    @Column(nullable = false)
    private LocalTime inicio_aula;

    @ManyToOne
    @JoinColumn(name = "id_escola")
    private CadastroEntity escola;

    public SalaEntity() {
    }

    public Long getId_sala() {
        return id_sala;
    }

    public void setId_sala(Long id_sala) {
        this.id_sala = id_sala;
    }

    public String getNome_sala() {
        return nome_sala;
    }

    public void setNome_sala(String nome_sala) {
        this.nome_sala = nome_sala;
    }

    public int getDuracao_aula() {
        return duracao_aula;
    }

    public void setDuracao_aula(int duracao_aula) {
        this.duracao_aula = duracao_aula;
    }

    public int getDuracao_intervalo() {
        return duracao_intervalo;
    }

    public void setDuracao_intervalo(int duracao_intervalo) {
        this.duracao_intervalo = duracao_intervalo;
    }

    public int getQuant_aula() {
        return quant_aula;
    }

    public void setQuant_aula(int quant_aula) {
        this.quant_aula = quant_aula;
    }

    public LocalTime getInicio_aula() {
        return inicio_aula;
    }

    public void setInicio_aula(LocalTime inicio_aula) {
        this.inicio_aula = inicio_aula;
    }

    public CadastroEntity getEscola() {
        return escola;
    }

    public void setEscola(CadastroEntity escola) {
        this.escola = escola;
    }
}
