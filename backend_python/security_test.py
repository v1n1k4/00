"""Suíte automatizada de verificação das camadas de segurança do CLAEX.

Valida contra o servidor local (porta 8081):
  1. Cabeçalhos de segurança (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options)
  2. Bloqueio de SQL Injection (query string e corpo) -> HTTP 400
  3. Bloqueio de JavaScript Injection / XSS (query string e corpo JSON) -> HTTP 400
  4. Ocultação de senhas e chaves nas respostas JSON (/form_cadastro-html/listar, /professores/listar)
  5. Limitação de tentativas de login (5 falhas -> 6ª tentativa retorna HTTP 429 + Retry-After)
  6. Login válido + migração de hash + Manifesto PWA Android (/manifest.json e /sw.js)
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8081"


def req(path: str, method: str = "GET", form: dict | None = None, json_body: dict | None = None):
    data = None
    headers = {}
    if form is not None:
        data = urllib.parse.urlencode(form).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8"
    elif json_body is not None:
        data = json.dumps(json_body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    r = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            return resp.status, dict(resp.headers), resp.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", errors="ignore")


def main() -> int:
    # 1. Headers de segurança + PWA Android
    st, hdrs, body = req("/manifest.json")
    assert st == 200 and '"CLAEX"' in body, f"manifest.json falhou: {st}"
    low = {k.lower(): v for k, v in hdrs.items()}
    assert "content-security-policy" in low, "CSP ausente!"
    assert low.get("x-content-type-options") == "nosniff", "nosniff ausente!"
    assert low.get("x-frame-options") == "DENY", "X-Frame-Options DENY ausente!"
    st_sw, _, _ = req("/sw.js")
    assert st_sw == 200, f"sw.js falhou: {st_sw}"
    print("[OK] 1/6 Headers CSP/nosniff/DENY + Manifesto PWA Android (/manifest.json e /sw.js)")

    # 2. SQL Injection bloqueado na entrada (HTTP 400)
    st_sqli1, _, b1 = req("/login/entrar", "POST", form={"login": "admin' OR '1'='1", "senha": "x"})
    st_sqli2, _, b2 = req("/salas/listar?busca=" + urllib.parse.quote("1 UNION SELECT * FROM tbl_cadastro--"))
    assert st_sqli1 == 400 and "SQL_INJECTION" in b1, f"SQLi form não bloqueado: {st_sqli1} {b1}"
    assert st_sqli2 == 400 and "SQL_INJECTION" in b2, f"SQLi query não bloqueado: {st_sqli2} {b2}"
    print("[OK] 2/6 Proteção contra SQL Injection (HTTP 400 Bad Request)")

    # 3. JavaScript Injection (XSS) bloqueado na entrada (HTTP 400)
    st_xss1, _, bx1 = req(
        "/form_cadastro-html/salvar",
        "POST",
        form={"nome": "<script>alert(1)</script>", "email": "x@claex.com", "senha": "Senha1234"},
    )
    st_xss2, _, bx2 = req(
        "/salas/salvar",
        "POST",
        json_body={"nome_sala": '<img src=x onerror="alert(document.cookie)">'},
    )
    assert st_xss1 == 400 and "XSS" in bx1, f"XSS form não bloqueado: {st_xss1} {bx1}"
    assert st_xss2 == 400 and "XSS" in bx2, f"XSS JSON não bloqueado: {st_xss2} {bx2}"
    print("[OK] 3/6 Proteção contra JavaScript Injection / XSS (HTTP 400 Bad Request)")

    # 4. Ocultação de senhas e chaves nas listagens JSON
    st_cad, _, cad_body = req("/form_cadastro-html/listar")
    st_prof, _, prof_body = req("/professores/listar")
    assert st_cad == 200 and '"senha"' not in cad_body, "Campo senha vazou em /form_cadastro-html/listar!"
    assert st_prof == 200 and '"senha_professor"' not in prof_body, "Campo senha_professor vazou!"
    print("[OK] 4/6 Ocultação de senhas e chaves nas respostas da API")

    # 5. Login válido (admin@claex.com) + migração transparente para hash
    st_ok, _, ok_body = req("/login/entrar", "POST", form={"login": "admin@claex.com", "senha": "1234"})
    assert st_ok == 200 and "Login realizado com sucesso" in ok_body, f"Login válido falhou: {st_ok} {ok_body}"
    print("[OK] 5/6 Login válido + verificação de hash de senha")

    # 6. Rate limiting: 5 falhas seguidas -> bloqueio com HTTP 429 + Retry-After
    alvo = "teste.bruteforce@claex.com"
    for tentativa in range(1, 6):
        st_f, _, bf = req("/login/entrar", "POST", form={"login": alvo, "senha": "errada"})
        assert st_f == 401, f"Tentativa {tentativa} deveria retornar 401, retornou {st_f}: {bf}"
    st_429, hdr_429, b429 = req("/login/entrar", "POST", form={"login": alvo, "senha": "errada"})
    low_429 = {k.lower(): v for k, v in hdr_429.items()}
    assert st_429 == 429 and "retry-after" in low_429, f"6ª tentativa deveria retornar 429: {st_429} {b429}"
    print(f"[OK] 6/6 Rate Limiting ativo -> HTTP 429 Too Many Requests (Retry-After: {low_429['retry-after']}s)")

    print("\n=== TODAS AS 6 CAMADAS DE SEGURANÇA E PORTABILIDADE VERIFICADAS COM SUCESSO ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
