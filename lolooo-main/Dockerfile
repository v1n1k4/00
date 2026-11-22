# ============================================================================
# lolooo-main/Dockerfile — Multi-Stage Build do Back-End Java 17 (Spring Boot)
# ============================================================================
# Por que Multi-Stage (2 estágios)?
#   - Estágio 1 (builder): usa a imagem com Maven + JDK completo (~500 MB) para
#     baixar dependências e compilar o arquivo .jar.
#   - Estágio 2 (runtime): copia APENAS o .jar pronto para uma imagem JRE enxuta
#     (Eclipse Temurin 17 JRE Alpine, ~180 MB), sem código-fonte, sem Maven e
#     rodando com usuário não-root (claexuser).
# ============================================================================

# ---------------------------- ESTÁGIO 1: BUILD (Maven + JDK 17)
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /build

# 1. Copia primeiro o pom.xml e baixa as dependências (camada fica em cache!)
COPY pom.xml /build/pom.xml
RUN mvn -B dependency:go-offline

# 2. Copia o código-fonte Java + front-end estático e gera o JAR executável
COPY src /build/src
RUN mvn -B -DskipTests clean package

# ---------------------------- ESTÁGIO 2: RUNTIME (Apenas JRE 17 enxuto)
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# 3. Cria usuário não-root para executar a JVM com segurança
RUN groupadd --gid 10001 claexgroup \
    && useradd --uid 10001 --gid claexgroup --shell /bin/false --create-home claexuser \
    && mkdir -p /app/data \
    && chown -R claexuser:claexgroup /app

# 4. Copia somente o JAR compilado no Estágio 1
COPY --from=builder --chown=claexuser:claexgroup /build/target/*.jar /app/claex-app.jar

USER claexuser
EXPOSE 8081

# 5. Flags da JVM para containers:
#    - MaxRAMPercentage=75.0: respeita o limite de memória do Docker
#    - java.security.egd: acelera geração de números aleatórios (BCrypt/Sessão)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/claex-app.jar"]
