"""CLAEX — Camadas de segurança do back-end Python (FastAPI).

Espelha exatamente o que foi feito no back-end Java (pacote com.claex.crud.security):

1. SQL Injection  -> SQLAlchemy ORM sempre gera consultas parametrizadas + este módulo
                     barra assinaturas clássicas (UNION SELECT, ' OR 1=1, ;DROP ...).
2. JavaScript Injection (XSS) -> barra <script>, javascript:, onerror= ... na entrada e
                     adiciona Content-Security-Policy e outros headers na saída.
3. Força-bruta no login -> LoginAttemptLimiter: 5 falhas por IP+login => bloqueio de 15 min
                     (HTTP 429 + Retry-After).
4. Senhas -> PBKDF2-HMAC-SHA256 (biblioteca padrão do Python, 310 mil iterações, salt aleatório),
                     com migração transparente de senhas antigas em texto puro.

Tudo usa apenas a biblioteca padrão (sem dependências novas).
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import threading
import time
from urllib.parse import parse_qsl, unquote_plus

log = logging.getLogger("claex.security")

# ----------------------------------------------------------------- 1 + 2. detector
SQLI = re.compile(
    r"(\bunion\b\s+(all\s+)?\bselect\b"
    r"|'\s*(or|and)\s+'?\w+'?\s*=\s*'?\w+"
    r"|'\s*(or|and)\s+\d+\s*=\s*\d+"
    r"|'\s*;?\s*--"
    r"|;\s*(drop|delete|insert|update|alter|truncate|create|exec)\b"
    r"|\b(sleep|benchmark|pg_sleep|waitfor\s+delay)\s*\("
    r"|\binformation_schema\b|\bxp_cmdshell\b"
    r"|/\*.*\*/)",
    re.IGNORECASE,
)
XSS = re.compile(
    r"(<\s*/?\s*(script|iframe|object|embed|svg|img|link|meta|style|base|form|body|html|video|audio)\b"
    r"|javascript\s*:|vbscript\s*:|data\s*:\s*text/html"
    r"|<[^>]*\bon[a-z]+\s*="
    r"|[\"'`]\s*on[a-z]+\s*="
    r"|expression\s*\(|document\.cookie|eval\s*\()",
    re.IGNORECASE,
)


def detectar_ameaca(valor: str | None) -> str | None:
    if not valor:
        return None
    for v in (valor, unquote_plus(valor)):
        if SQLI.search(v):
            return "SQL_INJECTION"
        if XSS.search(v):
            return "XSS"
    return None


# ----------------------------------------------------------------- headers
CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; "
    "img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self'; "
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
)
SECURITY_HEADERS = [
    (b"content-security-policy", CSP.encode()),
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"DENY"),
    (b"referrer-policy", b"strict-origin-when-cross-origin"),
    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
]

MAX_BODY = 1024 * 1024


class SecurityMiddleware:
    """Middleware ASGI puro: inspeciona query string + corpo e injeta headers de segurança.

    É "ASGI puro" (e não BaseHTTPMiddleware) porque precisa LER o corpo e depois
    "devolvê-lo" intacto para o FastAPI — fazemos isso guardando o corpo em memória e
    reapresentando-o através de uma nova função receive().
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_com_headers(message):
            if message["type"] == "http.response.start":
                existentes = {k.lower() for k, _ in message.get("headers", [])}
                message.setdefault("headers", [])
                message["headers"] = list(message["headers"]) + [
                    (k, v) for k, v in SECURITY_HEADERS if k not in existentes
                ]
            await send(message)

        # 1) query string
        qs = scope.get("query_string", b"").decode("latin-1")
        for _, v in parse_qsl(qs, keep_blank_values=True):
            ameaca = detectar_ameaca(v)
            if ameaca:
                return await self._bloquear(scope, send_com_headers, ameaca, 400)

        # 2) corpo (JSON ou formulário)
        if scope.get("method") in ("POST", "PUT", "PATCH"):
            corpo = b""
            mais = True
            while mais:
                msg = await receive()
                corpo += msg.get("body", b"")
                mais = msg.get("more_body", False)
                if len(corpo) > MAX_BODY:
                    return await self._bloquear(scope, send_com_headers, "PAYLOAD_TOO_LARGE", 413)
            texto = corpo.decode("utf-8", errors="ignore")
            ameaca = detectar_ameaca(texto)
            if ameaca:
                return await self._bloquear(scope, send_com_headers, ameaca, 400)

            entregue = False

            async def receive_replay():
                nonlocal entregue
                if not entregue:
                    entregue = True
                    return {"type": "http.request", "body": corpo, "more_body": False}
                return await receive()

            return await self.app(scope, receive_replay, send_com_headers)

        return await self.app(scope, receive, send_com_headers)

    @staticmethod
    async def _bloquear(scope, send, tipo, status):
        ip = (scope.get("client") or ("?",))[0]
        log.warning("[CLAEX SECURITY] Bloqueado %s de %s em %s", tipo, ip, scope.get("path"))
        body = json.dumps(
            {"erro": "Entrada recusada por conter conteúdo potencialmente malicioso.", "tipo": tipo}
        ).encode()
        await send({
            "type": "http.response.start",
            "status": status,
            "headers": [(b"content-type", b"application/json; charset=utf-8"),
                        (b"content-length", str(len(body)).encode())],
        })
        await send({"type": "http.response.body", "body": body})


# ----------------------------------------------------------------- 3. limitador de login
class LoginAttemptLimiter:
    def __init__(self):
        self.max_falhas = int(os.getenv("LOGIN_MAX_ATTEMPTS", "5"))
        self.max_falhas_ip = int(os.getenv("LOGIN_MAX_ATTEMPTS_IP", "20"))
        self.janela = int(os.getenv("LOGIN_WINDOW_MINUTES", "15")) * 60
        self.bloqueio = int(os.getenv("LOGIN_LOCK_MINUTES", "15")) * 60
        self._por_usuario: dict[str, dict] = {}
        self._por_ip: dict[str, dict] = {}
        self._lock = threading.Lock()

    @staticmethod
    def _chave(ip: str, login: str) -> str:
        return f"{ip}|{(login or '').strip().lower()}"

    @staticmethod
    def _restante(t: dict | None) -> int:
        if not t or not t.get("bloqueado_ate"):
            return 0
        return max(0, int(t["bloqueado_ate"] - time.time()))

    def segundos_bloqueado(self, ip: str, login: str) -> int:
        with self._lock:
            return max(self._restante(self._por_usuario.get(self._chave(ip, login))),
                       self._restante(self._por_ip.get(ip)))

    def _inc(self, mapa: dict, chave: str, limite: int) -> dict:
        agora = time.time()
        t = mapa.get(chave)
        if (not t or (t.get("bloqueado_ate") and agora > t["bloqueado_ate"])
                or agora > t["inicio"] + self.janela):
            t = {"falhas": 0, "inicio": agora, "bloqueado_ate": None}
        t["falhas"] += 1
        if t["falhas"] >= limite:
            t["bloqueado_ate"] = agora + self.bloqueio
        mapa[chave] = t
        return t

    def registrar_falha(self, ip: str, login: str) -> int:
        with self._lock:
            t = self._inc(self._por_usuario, self._chave(ip, login), self.max_falhas)
            self._inc(self._por_ip, ip, self.max_falhas_ip)
            return max(0, self.max_falhas - t["falhas"])

    def registrar_sucesso(self, ip: str, login: str) -> None:
        with self._lock:
            self._por_usuario.pop(self._chave(ip, login), None)


def client_ip(request) -> str:
    if os.getenv("TRUST_PROXY_HEADERS", "false").lower() == "true":
        xff = request.headers.get("x-forwarded-for")
        if xff:
            return xff.split(",")[0].strip()
    return request.client.host if request.client else "?"


# ----------------------------------------------------------------- 4. senhas
_ITER = 310_000
_PREFIXO = "pbkdf2_sha256"


def is_hash(valor: str | None) -> bool:
    return bool(valor) and valor.startswith(_PREFIXO + "$")


def hash_senha(senha: str) -> str:
    if is_hash(senha):
        return senha
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", senha.encode(), salt, _ITER)
    return f"{_PREFIXO}${_ITER}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verificar_senha(senha: str, armazenada: str | None) -> bool:
    if senha is None or not armazenada:
        return False
    if is_hash(armazenada):
        try:
            _, it, salt_b64, dk_b64 = armazenada.split("$")
            dk = hashlib.pbkdf2_hmac("sha256", senha.encode(), base64.b64decode(salt_b64), int(it))
            return hmac.compare_digest(dk, base64.b64decode(dk_b64))
        except (ValueError, TypeError):
            return False
    # legado em texto puro -> comparação em tempo constante
    return hmac.compare_digest(senha.encode(), armazenada.encode())


def validar_forca(senha: str | None) -> str | None:
    if not senha or len(senha) < 8:
        return "A senha deve ter pelo menos 8 caracteres."
    if len(senha) > 72:
        return "A senha deve ter no máximo 72 caracteres."
    if not re.search(r"[A-Za-z]", senha) or not re.search(r"\d", senha):
        return "A senha deve conter letras e números."
    return None


NOME_VALIDO = re.compile(r"^[\w .'\-]{2,120}$", re.UNICODE)
EMAIL_VALIDO = re.compile(r"^[\w.+\-]{1,64}@[\w\-]+(\.[\w\-]+)+$")
TIPOS_VALIDOS = {"aluno", "professor", "administrador"}
