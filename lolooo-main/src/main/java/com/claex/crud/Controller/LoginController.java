package com.claex.crud.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Repository.CadastroRepository;

import jakarta.servlet.http.HttpSession;

@CrossOrigin(originPatterns = "*")
@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private CadastroRepository repository;

    @PostMapping("/entrar")
    public ResponseEntity<Map<String, String>> login(
            @RequestParam String login,
            @RequestParam String senha,
            HttpSession session) {

        Optional<CadastroEntity> usuarioOpt = repository.findByNome(login)
                .or(() -> repository.findByEmail(login));

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Usuário não cadastrado!"));
        }

        CadastroEntity usuario = usuarioOpt.get();

        if (!usuario.getSenha().equals(senha)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Senha incorreta!"));
        }

        session.setAttribute("usuarioLogado", usuario);

        Map<String, String> response = new HashMap<>();
        response.put("mensagem", "Login realizado com sucesso!");
        response.put("id", String.valueOf(usuario.getId()));
        response.put("nome", usuario.getNome());
        response.put("email", usuario.getEmail());
        response.put("tipo", usuario.getTipo());

        return ResponseEntity.ok(response);
    }
}
