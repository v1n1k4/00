package com.claex.crud.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * CAMADA DE SEGURANÇA #3 — Limitação de tentativas de login (anti força-bruta).
 *
 * Como funciona:
 *  - Cada combinação "IP + login" tem um contador de falhas dentro de uma janela de tempo.
 *  - Ao atingir MAX_FALHAS (padrão 5) o par é BLOQUEADO por LOCK_MINUTOS (padrão 15).
 *  - Também existe um contador só por IP (MAX_FALHAS_IP, padrão 20) para impedir que um
 *    atacante teste muitos usuários diferentes a partir da mesma máquina (credential stuffing).
 *  - Enquanto bloqueado, o controller responde HTTP 429 (Too Many Requests) + header Retry-After.
 *  - Login com sucesso zera o contador daquele par.
 *
 * Os valores podem ser ajustados por variáveis de ambiente (ver .env.example).
 * Observação de estudo: em produção com várias instâncias, troque o ConcurrentHashMap
 * por um armazenamento compartilhado (ex.: Redis) para o limite valer em todas as réplicas.
 */
@Service
public class LoginAttemptService {

    private static final class Tentativas {
        int falhas;
        Instant inicioJanela = Instant.now();
        Instant bloqueadoAte;
    }

    private final Map<String, Tentativas> porUsuario = new ConcurrentHashMap<>();
    private final Map<String, Tentativas> porIp = new ConcurrentHashMap<>();

    private final int maxFalhas;
    private final int maxFalhasIp;
    private final Duration janela;
    private final Duration bloqueio;

    public LoginAttemptService(
            @Value("${claex.security.login.max-attempts:5}") int maxFalhas,
            @Value("${claex.security.login.max-attempts-ip:20}") int maxFalhasIp,
            @Value("${claex.security.login.window-minutes:15}") long janelaMin,
            @Value("${claex.security.login.lock-minutes:15}") long bloqueioMin) {
        this.maxFalhas = maxFalhas;
        this.maxFalhasIp = maxFalhasIp;
        this.janela = Duration.ofMinutes(janelaMin);
        this.bloqueio = Duration.ofMinutes(bloqueioMin);
    }

    private static String chave(String ip, String login) {
        return ip + "|" + (login == null ? "" : login.trim().toLowerCase());
    }

    /** Retorna quantos segundos faltam para desbloquear (0 = liberado). */
    public long segundosBloqueado(String ip, String login) {
        return Math.max(restante(porUsuario.get(chave(ip, login))), restante(porIp.get(ip)));
    }

    private long restante(Tentativas t) {
        if (t == null || t.bloqueadoAte == null) return 0;
        long s = Duration.between(Instant.now(), t.bloqueadoAte).getSeconds();
        return s > 0 ? s : 0;
    }

    /** Registra uma falha; retorna quantas tentativas ainda restam antes do bloqueio. */
    public int registrarFalha(String ip, String login) {
        Tentativas u = incrementar(porUsuario, chave(ip, login), maxFalhas);
        incrementar(porIp, ip, maxFalhasIp);
        return Math.max(0, maxFalhas - u.falhas);
    }

    private Tentativas incrementar(Map<String, Tentativas> mapa, String key, int limite) {
        return mapa.compute(key, (k, t) -> {
            Instant agora = Instant.now();
            if (t == null || (t.bloqueadoAte != null && agora.isAfter(t.bloqueadoAte))
                    || agora.isAfter(t.inicioJanela.plus(janela))) {
                t = new Tentativas();
            }
            t.falhas++;
            if (t.falhas >= limite) {
                t.bloqueadoAte = agora.plus(bloqueio);
            }
            return t;
        });
    }

    public void registrarSucesso(String ip, String login) {
        porUsuario.remove(chave(ip, login));
    }
}
