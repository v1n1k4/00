# ============================================================================
# Dockerfile (Principal) — CLAEX v10 (FastAPI + SQLAlchemy + Front-End Estático)
# ============================================================================
# Para estudos futuros — O que cada instrução faz:
#
#   FROM       -> Define a imagem base (Python 3.12 slim: enxuta, menos pacotes
#                 instalados = menor superfície de ataque).
#   ENV        -> Define variáveis de ambiente dentro do container.
#   WORKDIR    -> Cria e entra no diretório de trabalho da aplicação (/app).
#   RUN        -> Executa comandos durante a construção da imagem (criação de
#                 usuário sem privilégio de root e instalação de dependências).
#   COPY       -> Copia arquivos da sua máquina para dentro da imagem.
#                 Copiamos requirements.txt ANTES do código para aproveitar o
#                 cache de camadas do Docker (só reinstala pacotes se o
#                 requirements.txt mudar).
#   USER       -> Troca do usuário "root" para "claexuser" (UID 10001). Se alguém
#                 explorar uma falha na aplicação, não terá poder de root no
#                 container.
#   EXPOSE     -> Documenta que o container escuta na porta 8081.
#   HEALTHCHECK-> O Docker testa periodicamente se a API continua respondendo;
#                 se travar, o orquestrador sabe que o container ficou "unhealthy".
#   CMD        -> Comando executado quando o container inicia.
# ============================================================================

FROM python:3.12-slim AS runtime

# 1. Variáveis de ambiente para Python rodar limpo em containers:
#    - PYTHONDONTWRITEBYTECODE=1: não grava arquivos .pyc em disco
#    - PYTHONUNBUFFERED=1: logs aparecem imediatamente no "docker logs"
#    - STATIC_DIR=/app/static: aponta para os arquivos HTML/CSS/JS do CLAEX
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    STATIC_DIR=/app/static \
    PORT=8081

WORKDIR /app

# 2. Cria usuário e grupo sem privilégios de root (UID/GID 10001) e pasta de dados
RUN groupadd --gid 10001 claexgroup \
    && useradd --uid 10001 --gid claexgroup --shell /bin/false --create-home claexuser \
    && mkdir -p /app/data /app/static \
    && chown -R claexuser:claexgroup /app

# 3. Instala apenas as dependências do back-end (camada cacheável)
COPY backend_python/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# 4. Copia o código do back-end (com as camadas anti-SQLi, anti-XSS e Rate Limit)
#    e o front-end estático institucional (com manifesto PWA Android)
COPY --chown=claexuser:claexgroup backend_python/main.py backend_python/security.py /app/
COPY --chown=claexuser:claexgroup lolooo-main/src/main/resources/static/ /app/static/

# 5. Abandona o root: a aplicação roda como claexuser
USER claexuser

EXPOSE 8081

# 6. Healthcheck nativo usando apenas a biblioteca padrão do Python
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8081/materias/listar', timeout=3)" || exit 1

# 7. Inicia o servidor ASGI Uvicorn na porta 8081
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8081", "--no-server-header"]
