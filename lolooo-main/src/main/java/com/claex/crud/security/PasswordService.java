package com.claex.crud.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Hash de senhas com BCrypt (custo 12).
 *
 * - Senhas NUNCA são gravadas em texto puro: salvar() sempre chama hash().
 * - Compatibilidade: bancos antigos tinham senha em texto puro. matches() aceita esse
 *   formato legado (comparação em tempo constante) e o LoginController re-grava a senha
 *   já em BCrypt no primeiro login bem-sucedido (migração transparente).
 */
@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public String hash(String senhaPura) {
        if (senhaPura == null) return null;
        if (isHash(senhaPura)) return senhaPura; // já está protegido, não re-hasheia
        return encoder.encode(senhaPura);
    }

    public boolean isHash(String valor) {
        return valor != null && valor.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }

    public boolean matches(String senhaDigitada, String armazenada) {
        if (senhaDigitada == null || armazenada == null) return false;
        if (isHash(armazenada)) {
            return encoder.matches(senhaDigitada, armazenada);
        }
        // legado em texto puro -> comparação em tempo constante (evita timing attack)
        return MessageDigest.isEqual(
                senhaDigitada.getBytes(StandardCharsets.UTF_8),
                armazenada.getBytes(StandardCharsets.UTF_8));
    }

    /** Regras mínimas de senha forte para novos cadastros. */
    public String validarForca(String senha) {
        if (senha == null || senha.length() < 8) return "A senha deve ter pelo menos 8 caracteres.";
        if (senha.length() > 72) return "A senha deve ter no máximo 72 caracteres.";
        if (!senha.matches(".*[A-Za-z].*") || !senha.matches(".*\\d.*"))
            return "A senha deve conter letras e números.";
        return null;
    }
}
