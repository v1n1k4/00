# CLAEX — Sistema Institucional de Gestão Acadêmica e Otimização Inteligente de Grades Horárias

<p align="left">
  <img src="https://img.shields.io/badge/CLAEX-v10_Institucional-0F172A?style=for-the-badge&labelColor=1E3A8A" alt="CLAEX v10">
  <img src="https://img.shields.io/badge/Java-17_Spring_Boot-1E3A8A?style=for-the-badge&logo=springboot&logoColor=white" alt="Java 17 Spring Boot">
  <img src="https://img.shields.io/badge/Python-FastAPI_%2B_SQLAlchemy-0F172A?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Android-PWA_%2B_APK_%2B_Expo-1E3A8A?style=for-the-badge&logo=android&logoColor=white" alt="Android">
  <img src="https://img.shields.io/badge/Docker-Compose_Ready-0F172A?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Segurança-SQLi_%7C_XSS_%7C_Rate_Limit_429-15803D?style=for-the-badge" alt="Security">
</p>

> **CLAEX** é uma plataforma institucional para coordenações pedagógicas, docentes e estudantes que automatiza a construção, auditoria e visualização de **grades horárias escolares sem conflitos**, combinando **Otimização Híbrida (Algoritmo Memético NSGA-II + Simulated Annealing + Reparo Kempe-Chain)** com **Orquestração Multi-Modelo de Inteligência Artificial** e camadas de segurança em profundidade.

---

## Equipe de Desenvolvimento

| Dev | Integrante | Papel e Responsabilidades no Projeto |
| :---: | :--- | :--- |
| **`#01`** | **Vini (`VC`)** | **Criador do Back-End Java (Spring Boot / JPA), Arquitetura do Sistema, Camadas de Segurança, Docker & Motor de Inteligência Artificial** |
| **`#02`** | **Daniel (`DM`)** | **Front-End Web, Interface Institucional & Experiência do Usuário** |
| **`#03`** | **Samuel (`SM`)** | **Modelagem de Dados, Integração & Testes Operacionais** |

---

## Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO (WEB & ANDROID)                   │
│  • 9 Páginas Web Institucionais (#0F172A Navy / #F1F5F9 Slate / #1E3A8A)     │
│  • PWA Instalável no Android (manifest.json + Service Worker sw.js)          │
│  • APK Nativo Android (Capacitor + Gradle via GitHub Actions)                │
│  • App Mobile React Native (Expo Snack: 9 telas + validação de senha)        │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ Chamadas relativas via js/api.js
                                       │ (Zero API Keys no cliente / Senhas no corpo HTTP)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                  CAMADA DE SEGURANÇA E PROTEÇÃO DE BORDA                     │
│  1. Anti-SQL Injection: Filtro WAF (InputSanitizationFilter) + Prepared SQL  │
│  2. Anti-XSS (JS Injection): CSP + Headers + Filtro WAF + escapeHtml()       │
│  3. Anti-Força Bruta: LoginAttemptService (5 falhas -> HTTP 429 Retry-After) │
│  4. Criptografia de Senhas: BCrypt (custo 12) / PBKDF2-SHA256 (310k iter.)   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              ▼                                                 ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
│   BACK-END PRINCIPAL JAVA 17 (Vini #01) │   │   BACK-END ESPELHO PYTHON (FastAPI)     │
│   • Spring Boot + Spring Security       │   │   • FastAPI + SQLAlchemy + ASGI WAF     │
│   • Spring Data JPA (MySQL 8 / H2)      │   │   • 100% de paridade de rotas e regras  │
│   • Solver Memético NSGA-II + Proxy IA  │   │   • Execução leve para preview e CI     │
└─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

---

## Camadas de Segurança Implementadas

> Para uma explicação didática completa de cada ataque e de cada linha de código/Docker, consulte o **[Guia de Estudos de Segurança, Docker e Android (`docs/GUIA_ESTUDO_SEGURANCA_DOCKER_ANDROID.md`)](docs/GUIA_ESTUDO_SEGURANCA_DOCKER_ANDROID.md)**.

| Camada | Ameaça Mitigada | Implementação no Java (`lolooo-main`) | Implementação no Python (`backend_python`) & Front-End |
| :--- | :--- | :--- | :--- |
| **Ocultação de API Keys e APIs** | Vazamento de chaves em código/URL e exposição de hashes de senha | Variáveis `${GEMINI_API_KEY}`, `${DB_PASSWORD}` em [`application.properties`](lolooo-main/src/main/resources/application.properties); chave enviada no header `x-goog-api-key` em [`GeminiScheduleAdvisorService.java`](lolooo-main/src/main/java/com/claex/crud/Service/GeminiScheduleAdvisorService.java); `@JsonProperty(WRITE_ONLY)` nas entidades. | Variáveis via `os.getenv()` ([`.env.example`](.env.example)); [`js/api.js`](lolooo-main/src/main/resources/static/js/api.js) envia credenciais no corpo POST e consome apenas rotas internas. |
| **Anti-SQL Injection (SQLi)** | `UNION SELECT`, `' OR '1'='1`, `; DROP TABLE`, *time-based blind* `SLEEP()` | Consultas 100% parametrizadas no Spring Data JPA + filtro [`InputSanitizationFilter.java`](lolooo-main/src/main/java/com/claex/crud/security/InputSanitizationFilter.java) e [`InputThreatDetector.java`](lolooo-main/src/main/java/com/claex/crud/security/InputThreatDetector.java) (`HTTP 400`). | SQLAlchemy ORM com parâmetros vinculados + `SecurityMiddleware` em [`backend_python/security.py`](backend_python/security.py) (`HTTP 400`). |
| **Anti-JavaScript Injection (XSS)** | `<script>`, `<img onerror=...>`, `javascript:`, roubo de sessão | Header `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` em [`SecurityConfig.java`](lolooo-main/src/main/java/com/claex/crud/config/SecurityConfig.java) + bloqueio WAF na entrada. | Escape de saída `window.API.escapeHtml()` em todas as tabelas/cards dinâmicos + CSP no `SecurityMiddleware` + cookies `HttpOnly`. |
| **Limitação de Login & Senhas** | Força-bruta, *credential stuffing*, *timing attack* e enumeração de contas | [`LoginAttemptService.java`](lolooo-main/src/main/java/com/claex/crud/security/LoginAttemptService.java) (5 falhas por `IP+login` ou 20 por `IP` -> bloqueio de 15 min com **`HTTP 429 Too Many Requests`** + `Retry-After`) e [`PasswordService.java`](lolooo-main/src/main/java/com/claex/crud/security/PasswordService.java) (**BCrypt custo 12**). | `LoginAttemptLimiter` + **PBKDF2-HMAC-SHA256 (310.000 iterações)** em [`backend_python/security.py`](backend_python/security.py) + aviso de bloqueio e tentativas restantes em [`form_login.html`](lolooo-main/src/main/resources/static/form_login.html). |

---

## Portabilidade para Celulares Android

1. **App Nativo Android (`.apk`) via GitHub Actions + Capacitor:**
   - Configurado em [`capacitor.config.json`](capacitor.config.json), [`package.json`](package.json) e [`.github/workflows/android-apk.yml`](.github/workflows/android-apk.yml).
   - A cada push no GitHub, o workflow compila automaticamente o arquivo **`CLAEX-android-debug.apk`** (pacote `com.claex.app`) e o disponibiliza para download nos **Artifacts** da aba **Actions** (e nas **Releases** ao criar tags `v*`).
2. **PWA Instalável Direto pelo Navegador Android:**
   - Inclui [`manifest.json`](lolooo-main/src/main/resources/static/manifest.json), Service Worker [`sw.js`](lolooo-main/src/main/resources/static/sw.js), ícones `192x192` e `512x512` e ergonomia mobile/touch em [`css/brutalist.css`](lolooo-main/src/main/resources/static/css/brutalist.css).
3. **Versão Mobile em React Native (Expo Snack):**
   - Código modularizado em [`mobile-snack/`](mobile-snack/) (`App.js`, `src/styles/`, `src/data/`, `src/components/`, `src/screens/`) com todas as 9 páginas e validação de senha/confirmação no cadastro.
   - **Testar agora no navegador ou no celular (Expo Go):** <https://snack.expo.dev/BjSQzEcY-943qpFDR7ptB>

---

## Como Rodar com Docker (Recomendado)

```bash
# 1. Crie seu arquivo .env local a partir do modelo (o .env real é ignorado pelo Git)
cp .env.example .env

# 2. Suba o container principal (API + Front-End PWA na porta 8081)
docker compose up --build -d

# 3. (Opcional) Para subir também o Back-End Java 17 Spring Boot + MySQL 8 (porta 8082):
docker compose --profile java up --build -d
```

Acesse em seguida: **`http://localhost:8081`**  
*(Conta de demonstração inicial criada pelo seeder: login `admin@claex.com` | senha definida em `CLAEX_SEED_PASSWORD` no `.env`, padrão `1234`).*

---

## Como Rodar Localmente (Sem Docker)

### Opção A — Back-End Java 17 (Spring Boot — `lolooo-main/`)
```bash
cd lolooo-main
./mvnw spring-boot:run
```

### Opção B — Back-End Python (FastAPI — `backend_python/`)
```bash
cd backend_python
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8081
```

### Executar a Suíte Automatizada de Testes de Segurança
```bash
python3 backend_python/security_test.py
```

---

## Estrutura do Repositório

```
├── .env.example                                  # Modelo de variáveis de ambiente (sem segredos reais)
├── Dockerfile                                    # Container principal (não-root + healthcheck)
├── docker-compose.yml                            # Orquestração App + Java 17 Spring Boot + MySQL 8
├── capacitor.config.json                         # Configuração do empacotamento Android APK (com.claex.app)
├── .github/workflows/
│   ├── ci-security-docker.yml                    # CI: Auditoria SQLi/XSS/429 + Build Java 17 + Docker
│   ├── deploy-pages.yml                          # CD: Deploy automático para o GitHub Pages
│   └── android-apk.yml                           # Build automático do APK Android no GitHub Actions
├── docs/
│   ├── GUIA_ESTUDO_SEGURANCA_DOCKER_ANDROID.md   # Guia de estudos completo (Segurança + Docker + Android)
│   └── CLAEX_landing_demo.mp4                    # Vídeo demonstrativo da interface institucional
├── lolooo-main/                                  # Back-End Java 17 Spring Boot (Vini — Dev #01)
│   ├── Dockerfile                                # Build Multi-Stage Maven -> Eclipse Temurin 17 JRE
│   └── src/main/
│       ├── java/com/claex/crud/
│       │   ├── security/                         # Filtro Anti-SQLi/XSS, Rate Limit 429 e BCrypt
│       │   ├── config/                           # SecurityConfig (CSP), CorsConfig, DatabaseConfig
│       │   ├── Controller/                       # Endpoints REST validados
│       │   ├── Service/                          # Solver NSGA-II + Proxy IA Gemini/Claude/OpenAI
│       │   └── Repository/                       # Consultas JPA parametrizadas
│       └── resources/static/                     # 9 Telas Web + Manifesto PWA Android + Canvas Figma
├── backend_python/                               # Back-End FastAPI + Suíte security_test.py
├── mobile-snack/                                 # App React Native (Expo Snack) com as 9 telas em pastas
└── obsidian-vault/                               # Documentação técnica e notas de arquitetura (Obsidian)
```