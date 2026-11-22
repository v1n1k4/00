package com.claex.crud.config;

import java.sql.Connection;
import java.sql.DriverManager;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Credenciais do banco vêm de VARIÁVEIS DE AMBIENTE (nunca fixas no código / GitHub):
 *   DB_URL, DB_USERNAME, DB_PASSWORD  (ver .env.example e docker-compose.yml)
 *
 * Ordem de resolução:
 *  0. DB_URL definido (ex.: Docker Compose -> MySQL do container)
 *  1. MySQL local 3307 / 3306 (ambiente de desenvolvimento, ex.: XAMPP)
 *  2. H2 persistente em arquivo (fallback zero-config)
 */
@Configuration
public class DatabaseConfig {

    private static String env(String nome, String padrao) {
        String v = System.getenv(nome);
        return (v == null || v.isBlank()) ? padrao : v;
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        String user = env("DB_USERNAME", "root");
        String pass = env("DB_PASSWORD", "");

        // 0. URL explícita via ambiente (Docker / produção)
        String urlEnv = System.getenv("DB_URL");
        if (urlEnv != null && !urlEnv.isBlank()) {
            System.out.println("[CLAEX DB] Usando DB_URL do ambiente");
            String driver = urlEnv.startsWith("jdbc:postgresql") ? "org.postgresql.Driver"
                    : urlEnv.startsWith("jdbc:h2") ? "org.h2.Driver" : "com.mysql.cj.jdbc.Driver";
            return DataSourceBuilder.create().url(urlEnv).username(user).password(pass)
                    .driverClassName(driver).build();
        }

        String params = "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        for (int porta : new int[] {3307, 3306}) {
            String url = "jdbc:mysql://localhost:" + porta + "/crud_clientes" + params;
            if (testarConexao(url, user, pass)) {
                System.out.println("[CLAEX DB] Conectado ao MySQL na porta " + porta + " (crud_clientes)");
                return DataSourceBuilder.create().url(url).username(user).password(pass)
                        .driverClassName("com.mysql.cj.jdbc.Driver").build();
            }
        }

        // Fallback automático para banco local H2 persistente em arquivo
        String urlH2 = "jdbc:h2:file:./data/claex_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE";
        System.out.println("[CLAEX DB] MySQL offline -> Usando banco de dados persistente local H2 (./data/claex_db)");
        return DataSourceBuilder.create()
                .url(urlH2)
                .username("sa")
                .password(env("H2_PASSWORD", ""))
                .driverClassName("org.h2.Driver")
                .build();
    }

    private boolean testarConexao(String url, String user, String pass) {
        try {
            DriverManager.setLoginTimeout(2);
            try (Connection conn = DriverManager.getConnection(url, user, pass)) {
                return conn != null && !conn.isClosed();
            }
        } catch (Exception e) {
            return false;
        }
    }
}
