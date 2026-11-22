package com.claex.crud.Controller;

import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.claex.crud.Entity.CadastroEntity;
import com.claex.crud.Service.CadastroService;
import com.claex.crud.security.ClientIp;
import com.claex.crud.security.LoginAttemptService;
import com.claex.crud.security.PasswordService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/form_cadastro-html")
public class CadastroHtmlController {

    /** Validação por lista branca (allowlist): só letras, números, espaço e pontuação de nomes. */
    private static final Pattern NOME_VALIDO = Pattern.compile("^[\\p{L}\\p{N} .'\\-]{2,120}$");
    private static final Pattern EMAIL_VALIDO = Pattern.compile("^[\\w.+\\-]{1,64}@[\\w\\-]+(\\.[\\w\\-]+)+$");
    private static final Set<String> TIPOS_VALIDOS = Set.of("aluno", "professor", "administrador");

    @Autowired
    private CadastroService service;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private LoginAttemptService attempts;

    @PostMapping("/salvar")
    public ResponseEntity<String> salvarCadastro(
        @RequestParam String nome,
        @RequestParam String email,
        @RequestParam String senha,
        @RequestParam(defaultValue = "aluno") String tipo,
        HttpServletRequest request
    ) {
        // Limita criação de contas em massa a partir do mesmo IP (reusa o limitador de login)
        String ip = ClientIp.of(request);
        long espera = attempts.segundosBloqueado(ip, "__cadastro__");
        if (espera > 0) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(espera))
                    .body("Muitas tentativas de cadastro. Aguarde alguns minutos.");
        }

        String erro = validar(nome, email, tipo);
        if (erro == null) erro = passwordService.validarForca(senha);
        if (erro != null) {
            attempts.registrarFalha(ip, "__cadastro__");
            return ResponseEntity.badRequest().body("Erro: " + erro);
        }

        try {
            CadastroEntity cadastro = new CadastroEntity();
            cadastro.setNome(nome.trim());
            cadastro.setEmail(email.trim().toLowerCase());
            cadastro.setSenha(senha); // o service converte para BCrypt
            cadastro.setTipo(tipo.toLowerCase());

            service.salvar(cadastro);
            return ResponseEntity.ok("Cadastro realizado com sucesso!");

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: O e-mail informado já está cadastrado!");
        } catch (Exception e) {
            // Não devolve e.getMessage(): mensagens internas podem vazar estrutura do banco
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno no servidor.");
        }
    }

    private String validar(String nome, String email, String tipo) {
        if (nome == null || !NOME_VALIDO.matcher(nome.trim()).matches())
            return "Nome inválido (use apenas letras, números e espaços, 2 a 120 caracteres).";
        if (email == null || email.length() > 180 || !EMAIL_VALIDO.matcher(email.trim()).matches())
            return "E-mail inválido.";
        if (tipo == null || !TIPOS_VALIDOS.contains(tipo.toLowerCase()))
            return "Tipo de perfil inválido.";
        return null;
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarTodos() {
        // A senha é anotada como WRITE_ONLY na entidade -> não aparece neste JSON
        return ResponseEntity.ok(service.listarTodos());
    }

    @PutMapping("/atualizar/{id}")
    public ResponseEntity<String> atualizar(
        @PathVariable Long id,
        @RequestParam(required = false) String nome,
        @RequestParam(required = false) String senha,
        @RequestParam(required = false, defaultValue = "aluno") String tipo
    ) {
        try {
            if (nome != null && !NOME_VALIDO.matcher(nome.trim()).matches())
                return ResponseEntity.badRequest().body("Erro: Nome inválido.");
            if (!TIPOS_VALIDOS.contains(tipo.toLowerCase()))
                return ResponseEntity.badRequest().body("Erro: Tipo de perfil inválido.");
            if (senha != null && !senha.isBlank()) {
                String erroSenha = passwordService.validarForca(senha);
                if (erroSenha != null) return ResponseEntity.badRequest().body("Erro: " + erroSenha);
            }

            CadastroEntity cadastro = service.buscarPorId(id);
            if (nome != null) cadastro.setNome(nome.trim());
            if (senha != null && !senha.isBlank()) cadastro.setSenha(senha);
            cadastro.setTipo(tipo.toLowerCase());

            service.salvar(cadastro);
            return ResponseEntity.ok("Atualizado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao atualizar cadastro.");
        }
    }

    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<String> deletar(@PathVariable Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.ok("Deletado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Registro não encontrado para deleção.");
        }
    }
}
