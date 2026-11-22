# 09 — Segurança (API Keys, SQLi, XSS, Rate Limit), Docker, Android e CI/CD

> Nota sincronizada com o guia completo em [`docs/GUIA_ESTUDO_SEGURANCA_DOCKER_ANDROID.md`](../docs/GUIA_ESTUDO_SEGURANCA_DOCKER_ANDROID.md).  
> **Responsável Back-End Java, Arquitetura & IA:** Vini (`VC` — Dev #01).

## Resumo Rápido das Camadas Implementadas

- **Ocultação de API Keys & APIs:**
  - Chaves `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `DB_PASSWORD` e `SECRET_KEY` lidas exclusivamente de variáveis de ambiente (`.env` ignorado no Git; `.env.example` versionado).
  - Chave do Gemini enviada no header `x-goog-api-key` (nunca na URL).
  - Senhas enviadas no corpo `application/x-www-form-urlencoded` (nunca na query string) e ocultadas das respostas JSON (`@JsonProperty(WRITE_ONLY)` no Java e omissão em `s_cadastro`/`s_professor` no Python).
- **Defesa contra SQL Injection (SQLi):**
  - Consultas 100% parametrizadas (Spring Data JPA `@Query` com `:param` e SQLAlchemy ORM).
  - Filtro WAF na entrada (`InputSanitizationFilter` + `InputThreatDetector` no Java; `SecurityMiddleware` no Python) bloqueando `UNION SELECT`, `' OR 1=1`, `; DROP`, `SLEEP()`, etc. com `HTTP 400`.
- **Defesa contra JavaScript Injection (XSS):**
  - Filtro de entrada barra `<script>`, `<iframe>`, `<svg>`, `javascript:`, `onerror=`, `onload=`.
  - Escape de saída com `window.API.escapeHtml()` em todas as tabelas e cards dinâmicos do front-end.
  - Headers `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` e cookies `HttpOnly`.
- **Limitação de Tentativas de Login (Anti Força-Bruta) & Hash de Senhas:**
  - `LoginAttemptService` (Java) / `LoginAttemptLimiter` (Python): 5 falhas por `IP + login` (ou 20 por IP) em 15 minutos bloqueiam novas tentativas por 15 minutos com **`HTTP 429 Too Many Requests`** e cabeçalho `Retry-After`.
  - Senhas armazenadas com **BCrypt (custo 12)** no Java e **PBKDF2-HMAC-SHA256 (310.000 iterações)** no Python, com migração automática de senhas legadas no primeiro login.
- **Portabilidade Android:**
  - PWA (`manifest.json`, `sw.js`, ícones 192/512, meta tags mobile e CSS touch).
  - Projeto Capacitor (`capacitor.config.json`, `package.json`) + workflow `.github/workflows/android-apk.yml` gerando o `CLAEX-android-debug.apk`.
  - App React Native modular em `mobile-snack/` (`app.json`).
- **Docker:**
  - `Dockerfile` (Python FastAPI + Front-End não-root + healthcheck), `lolooo-main/Dockerfile` (Java 17 Spring Boot multi-stage Maven -> JRE 17 não-root), `docker-compose.yml` e `.dockerignore`.
