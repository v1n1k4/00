package com.claex.crud.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Entity.MateriaEntity;
import com.claex.crud.Entity.ProfessorEntity;
import com.claex.crud.Repository.CadastroRepository;
import com.claex.crud.Repository.MateriaRepository;
import com.claex.crud.Repository.ProfessorRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private CadastroRepository cadastroRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Garante matérias padrão do Ensino Médio
        List<String> materiasPadrao = List.of(
            "Português", "Matemática", "Física", "Química", "Biologia",
            "História", "Geografia", "Sociologia", "Filosofia",
            "Educação Física", "Artes", "Língua Inglesa", "Língua Espanhola"
        );

        for (String nome : materiasPadrao) {
            if (materiaRepository.findByNomeMateriaIgnoreCase(nome).isEmpty()) {
                MateriaEntity m = new MateriaEntity();
                m.setNome_materia(nome);
                materiaRepository.save(m);
            }
        }

        // 2. Garante conta padrão de Administrador
        if (cadastroRepository.findByEmail("admin@claex.com").isEmpty()) {
            CadastroEntity adm = new CadastroEntity();
            adm.setNome("Administrador CLAEX");
            adm.setEmail("admin@claex.com");
            adm.setSenha("1234");
            adm.setTipo("administrador");
            cadastroRepository.save(adm);
        }

        // 3. Garante um pool mínimo de professores para o motor URÂNIA distribuir sem repetir o mesmo docente o dia inteiro
        String[][] profsPadrao = {
            {"Prof. Carlos Mendes", "carlos@claex.com"},
            {"Profa. Helena Costa", "helena@claex.com"},
            {"Prof. Roberto Alves", "roberto@claex.com"},
            {"Profa. Marina Silva", "marina@claex.com"},
            {"Prof. Lucas Oliveira", "lucas@claex.com"}
        };

        for (String[] pData : profsPadrao) {
            if (cadastroRepository.findByEmail(pData[1]).isEmpty()) {
                CadastroEntity c = new CadastroEntity();
                c.setNome(pData[0]);
                c.setEmail(pData[1]);
                c.setSenha("1234");
                c.setTipo("professor");
                cadastroRepository.save(c);
            }
        }

        // 4. Sincroniza todos os cadastros do tipo professor com tbl_professor
        for (CadastroEntity c : cadastroRepository.findAll()) {
            if ("professor".equalsIgnoreCase(c.getTipo())) {
                if (professorRepository.findByEmailProfessorIgnoreCase(c.getEmail()).isEmpty()) {
                    ProfessorEntity p = new ProfessorEntity();
                    p.setNome_professor(c.getNome());
                    p.setEmail_professor(c.getEmail());
                    p.setSenha_professor(c.getSenha());
                    professorRepository.save(p);
                }
            }
        }
    }
}
