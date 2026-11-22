package com.claex.crud.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Repository.CadastroRepository;
import com.claex.crud.security.ClientIp;
import com.claex.crud.security.LoginAttemptService;
import com.claex.crud.security.PasswordService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/login")
public class LoginController {

    /** Mensagem genérica: não revela se o usuário existe (evita enumeração de contas). */
    private static final String CREDENCIAIS_INVALIDAS = "Usuário ou senha inválidos.";

    @Autowired
    private CadastroRepository repository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private LoginAttemptService attempts;

    @PostMapping("/entrar")
    public ResponseEntity<Map<String, Object>> login(
            @RequestParam String login,
            @RequestParam String senha,
            HttpServletRequest request,
            HttpSession session) {

        String ip = ClientIp.of(request);

        // 1) Está bloqueado por excesso de tentativas? -> 429 Too Many Requests
        long espera = attempts.segundosBloqueado(ip, login);
        if (espera > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(espera))
                    .body(Map.of(
                            "erro", "Muitas tentativas de login. Tente novamente em " + Math.max(1, espera / 60) + " min.",
                            "retryAfter", espera));
        }

        if (login == null || login.isBlank() || login.length() > 120 || senha == null || senha.length() > 72) {
            return ResponseEntity.badRequest().body(Map.of("erro", CREDENCIAIS_INVALIDAS));
        }

        // 2) Busca via Spring Data JPA (consulta parametrizada -> imune a SQL Injection)
        Optional<CadastroEntity> usuarioOpt = repository.findByNome(login.trim())
                .or(() -> repository.findByEmail(login.trim()));

        if (usuarioOpt.isEmpty() || !passwordService.matches(senha, usuarioOpt.get().getSenha())) {
            int restantes = attempts.registrarFalha(ip, login);
            Map<String, Object> body = new HashMap<>();
            body.put("erro", CREDENCIAIS_INVALIDAS);
            body.put("tentativasRestantes", restantes);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }

        CadastroEntity usuario = usuarioOpt.get();
        attempts.registrarSucesso(ip, login);

        // 3) Migração transparente: senha legada em texto puro -> BCrypt
        if (!passwordService.isHash(usuario.getSenha())) {
            usuario.setSenha(passwordService.hash(senha));
            repository.save(usuario);
        }

        // 4) Evita session fixation: gera um novo ID de sessão após autenticar
        request.changeSessionId();
        session.setAttribute("usuarioLogado", usuario);

        Map<String, Object> response = new HashMap<>();
        response.put("mensagem", "Login realizado com sucesso!");
        response.put("id", String.valueOf(usuario.getId()));
        response.put("nome", usuario.getNome());
        response.put("email", usuario.getEmail());
        response.put("tipo", usuario.getTipo());

        return ResponseEntity.ok(response);
    }
}
