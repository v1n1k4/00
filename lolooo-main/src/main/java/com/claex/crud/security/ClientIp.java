package com.claex.crud.security;

import jakarta.servlet.http.HttpServletRequest;

/** Descobre o IP real do cliente (considera proxy reverso / Docker via X-Forwarded-For). */
public final class ClientIp {
    private ClientIp() {}

    public static String of(HttpServletRequest req) {
        String trust = System.getenv().getOrDefault("TRUST_PROXY_HEADERS", "false");
        if ("true".equalsIgnoreCase(trust)) {
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
