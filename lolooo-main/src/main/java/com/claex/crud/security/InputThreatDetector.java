package com.claex.crud.security;

import java.util.regex.Pattern;

/**
 * Detector de padrões maliciosos (SQL Injection e JavaScript Injection / XSS).
 *
 * IMPORTANTE (para estudo): esta classe é uma camada EXTRA ("defesa em profundidade").
 * A proteção principal contra SQL Injection é o uso de consultas parametrizadas
 * (Spring Data JPA / JPQL com :parametros), que já separam DADO de COMANDO SQL.
 * A proteção principal contra XSS é o escape de saída no front-end + CSP.
 * Este filtro barra cedo payloads óbvios e gera log de tentativas.
 */
public final class InputThreatDetector {

    private InputThreatDetector() {}

    /** Assinaturas clássicas de SQL Injection. */
    private static final Pattern SQLI = Pattern.compile(
            "(?i)("
            + "\\bunion\\b\\s+(all\\s+)?\\bselect\\b"           // UNION SELECT
            + "|'\\s*(or|and)\\s+'?[\\w]+'?\\s*=\\s*'?[\\w]+"     // ' OR '1'='1
            + "|'\\s*(or|and)\\s+\\d+\\s*=\\s*\\d+"               // ' OR 1=1
            + "|'\\s*;?\\s*--"                                  // '--  (comentário)
            + "|;\\s*(drop|delete|insert|update|alter|truncate|create|exec)\\b" // empilhamento
            + "|\\b(sleep|benchmark|pg_sleep|waitfor\\s+delay)\\s*\\(" // time-based blind
            + "|\\binformation_schema\\b|\\bxp_cmdshell\\b"
            + "|/\\*.*\\*/"                                     // comentário inline
            + ")");

    /** Assinaturas de JavaScript Injection / XSS. */
    private static final Pattern XSS = Pattern.compile(
            "(?i)("
            + "<\\s*/?\\s*(script|iframe|object|embed|svg|img|link|meta|style|base|form|body|html|video|audio)\\b"
            + "|javascript\\s*:|vbscript\\s*:|data\\s*:\\s*text/html"
            + "|<[^>]*\\bon[a-z]+\\s*="                         // <img onerror=...>
            + "|[\"'`]\\s*on[a-z]+\\s*="                         // \" onmouseover=... (quebra de atributo)
            + "|expression\\s*\\(|document\\.cookie|eval\\s*\\("
            + ")");

    public static String detectar(String valor) {
        if (valor == null || valor.isEmpty()) return null;
        if (SQLI.matcher(valor).find()) return "SQL_INJECTION";
        if (XSS.matcher(valor).find()) return "XSS";
        return null;
    }
}
