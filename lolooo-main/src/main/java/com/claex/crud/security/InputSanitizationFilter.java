package com.claex.crud.security;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

/**
 * CAMADAS DE SEGURANÇA #1 e #2 — Filtro de entrada contra SQL Injection e JavaScript Injection.
 *
 * Para TODA requisição à API:
 *  1. Inspeciona os parâmetros (query string e formulário).
 *  2. Inspeciona o corpo JSON (até 1 MB) — o corpo é guardado em memória e "devolvido"
 *     ao Spring através de um wrapper, então o controller continua lendo normalmente.
 *  3. Se encontrar um padrão malicioso responde 400 Bad Request e registra no log.
 *
 * Arquivos estáticos (.html/.css/.js/imagens) não passam pela inspeção de corpo.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class InputSanitizationFilter extends OncePerRequestFilter {

    private static final Logger LOG = Logger.getLogger(InputSanitizationFilter.class.getName());
    private static final int MAX_BODY = 1024 * 1024;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        HttpServletRequest req = request;

        // 1) corpo JSON
        String ct = request.getContentType();
        if (ct != null && ct.toLowerCase().contains("application/json")) {
            byte[] body = request.getInputStream().readNBytes(MAX_BODY + 1);
            if (body.length > MAX_BODY) {
                bloquear(response, request, "PAYLOAD_TOO_LARGE", 413);
                return;
            }
            String texto = new String(body, StandardCharsets.UTF_8);
            String ameaca = InputThreatDetector.detectar(texto);
            if (ameaca != null) {
                bloquear(response, request, ameaca, 400);
                return;
            }
            req = new CachedBodyRequest(request, body);
        }

        // 2) parâmetros (query + x-www-form-urlencoded)
        for (Map.Entry<String, String[]> e : req.getParameterMap().entrySet()) {
            for (String v : e.getValue()) {
                String ameaca = InputThreatDetector.detectar(v);
                if (ameaca == null) ameaca = InputThreatDetector.detectar(decode(v));
                if (ameaca != null) {
                    bloquear(response, request, ameaca, 400);
                    return;
                }
            }
        }

        chain.doFilter(req, response);
    }

    private static String decode(String v) {
        try { return URLDecoder.decode(v, StandardCharsets.UTF_8); } catch (Exception e) { return v; }
    }

    private void bloquear(HttpServletResponse res, HttpServletRequest req, String tipo, int status) throws IOException {
        LOG.warning("[CLAEX SECURITY] Bloqueado " + tipo + " de " + ClientIp.of(req) + " em " + req.getRequestURI());
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"erro\":\"Entrada recusada por conter conteúdo potencialmente malicioso.\",\"tipo\":\"" + tipo + "\"}");
    }

    /** Wrapper que permite ler o corpo novamente depois da inspeção. */
    static final class CachedBodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;

        CachedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream in = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override public boolean isFinished() { return in.available() == 0; }
                @Override public boolean isReady() { return true; }
                @Override public void setReadListener(ReadListener l) { }
                @Override public int read() { return in.read(); }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
