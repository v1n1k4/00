package com.claex.crud.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

/**
 * Cabeçalhos HTTP de segurança (camada contra JavaScript Injection / clickjacking).
 *
 * - Content-Security-Policy: o navegador só executa scripts vindos do próprio site e do
 *   CDN jsDelivr; bloqueia plugins (object-src 'none'), troca de <base> e o carregamento
 *   do site dentro de iframes de terceiros (frame-ancestors 'none').
 * - X-Content-Type-Options: nosniff (padrão do Spring Security) — impede o navegador de
 *   "adivinhar" que um texto é script.
 * - X-Frame-Options: DENY — anti-clickjacking em navegadores antigos.
 * - Referrer-Policy e Permissions-Policy — reduzem vazamento de dados e acesso a sensores.
 */
@Configuration
public class SecurityConfig {

    public static final String CSP =
            "default-src 'self'; "
            + "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            + "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; "
            + "img-src 'self' data: blob: https:; "
            + "media-src 'self' blob:; "
            + "connect-src 'self'; "
            + "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // API stateless consumida via fetch + CORS restrito (ver CorsConfig)
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            .headers(h -> h
                .contentSecurityPolicy(csp -> csp.policyDirectives(CSP))
                .frameOptions(f -> f.deny())
                .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .addHeaderWriter(new StaticHeadersWriter("Permissions-Policy", "camera=(), microphone=(), geolocation=()"))
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
