package com.claex.crud.config;

import java.sql.Connection;
import java.sql.DriverManager;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. Tenta conectar no MySQL porta 3307 (configuração original do projeto)
        String url3307 = "jdbc:mysql://localhost:3307/crud_clientes?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        if (testarConexao(url3307, "root", "")) {
            System.out.println("[CLAEX DB] Conectado ao MySQL na porta 3307 (crud_clientes)");
            return DataSourceBuilder.create()
                    .url(url3307)
                    .username("root")
                    .password("")
                    .driverClassName("com.mysql.cj.jdbc.Driver")
                    .build();
        }

        // 2. Tenta conectar no MySQL porta 3306 (porta padrão MySQL/XAMPP)
        String url3306 = "jdbc:mysql://localhost:3306/crud_clientes?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        if (testarConexao(url3306, "root", "")) {
            System.out.println("[CLAEX DB] Conectado ao MySQL na porta 3306 (crud_clientes)");
            return DataSourceBuilder.create()
                    .url(url3306)
                    .username("root")
                    .password("")
                    .driverClassName("com.mysql.cj.jdbc.Driver")
                    .build();
        }

        // 3. Fallback automático para banco local H2 persistente em arquivo (sem precisar de MySQL rodando)
        String urlH2 = "jdbc:h2:file:./data/claex_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE";
        System.out.println("[CLAEX DB] MySQL offline -> Usando banco de dados persistente local H2 (./data/claex_db)");
        return DataSourceBuilder.create()
                .url(urlH2)
                .username("sa")
                .password("")
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

