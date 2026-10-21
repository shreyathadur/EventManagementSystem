package com.eventmgmt.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.util.StringUtils;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes PostgreSQL database connection properties for Render, Docker, and local environments.
 *
 * <p>Cloud platforms like Render provide database connection strings in standard URI format
 * (e.g., {@code postgres://user:password@host:port/database} or
 * {@code postgresql://user:password@host:port/database}).
 * Java JDBC requires the {@code jdbc:postgresql://} protocol and prefers separate
 * username/password credentials.
 *
 * <p>Registered in {@code META-INF/spring.factories} and ordered after {@code ConfigDataEnvironmentPostProcessor}
 * (order = {@code Ordered.LOWEST_PRECEDENCE}) so that {@code normalizedDatabaseProperties} is added with the highest
 * precedence, ensuring {@code DATABASE_URL} overrides any defaults in {@code application-prod.properties}.
 *
 * <ul>
 *   <li>Detects {@code DATABASE_URL}, {@code INTERNAL_DATABASE_URL}, {@code EXTERNAL_DATABASE_URL},
 *       {@code JDBC_DATABASE_URL}, or {@code SPRING_DATASOURCE_URL}.</li>
 *   <li>Converts raw {@code postgres://} and {@code postgresql://} URIs to valid JDBC URLs.</li>
 *   <li>Extracts URL-encoded credentials and sets {@code spring.datasource.username}
 *       and {@code spring.datasource.password}.</li>
 *   <li>Harmonizes {@code DB_USER} and {@code DB_USERNAME} variable naming conventions.</li>
 *   <li>Configures SSL mode (defaulting to {@code require} for remote hosts, customizable via {@code DB_SSL_MODE}).</li>
 *   <li>Never logs sensitive passwords or credentials.</li>
 * </ul>
 */
@Order(Ordered.LOWEST_PRECEDENCE)
public class DatabaseEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DatabaseEnvironmentPostProcessor.class);
    private static final String PROPERTY_SOURCE_NAME = "normalizedDatabaseProperties";

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> targetProperties = new HashMap<>();

        // Check for single database URL candidates
        String rawDatabaseUrl = getFirstNonBlank(environment,
                "DATABASE_URL",
                "INTERNAL_DATABASE_URL",
                "EXTERNAL_DATABASE_URL",
                "JDBC_DATABASE_URL",
                "SPRING_DATASOURCE_URL");

        if (!StringUtils.hasText(rawDatabaseUrl)) {
            // Also check if spring.datasource.url was explicitly provided as a raw postgres:// or postgresql:// URL
            String datasourceUrl = environment.getProperty("spring.datasource.url");
            if (StringUtils.hasText(datasourceUrl) &&
                    (datasourceUrl.startsWith("postgres://") ||
                     datasourceUrl.startsWith("postgresql://") ||
                     datasourceUrl.startsWith("jdbc:postgres://"))) {
                rawDatabaseUrl = datasourceUrl;
            }
        }

        if (StringUtils.hasText(rawDatabaseUrl)) {
            parseAndApplyDatabaseUrl(rawDatabaseUrl.trim(), environment, targetProperties);
        }

        // Harmonize individual DB_USER / DB_USERNAME credentials if not already set by URL
        harmonizeUserCredentials(environment, targetProperties);

        // Register normalized properties with highest precedence so HikariCP uses them
        if (!targetProperties.isEmpty()) {
            PropertySource<?> propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, targetProperties);
            environment.getPropertySources().addFirst(propertySource);
        }
    }

    private void parseAndApplyDatabaseUrl(String rawUrl, ConfigurableEnvironment environment, Map<String, Object> targetProperties) {
        String cleanUrl = rawUrl;
        if (cleanUrl.startsWith("jdbc:postgres://")) {
            cleanUrl = "postgres://" + cleanUrl.substring("jdbc:postgres://".length());
        } else if (cleanUrl.startsWith("jdbc:postgresql://")) {
            // If the JDBC URL has embedded user:password@, normalize it as standard URI
            String afterPrefix = cleanUrl.substring("jdbc:postgresql://".length());
            int slashIdx = afterPrefix.indexOf('/');
            String hostPart = slashIdx != -1 ? afterPrefix.substring(0, slashIdx) : afterPrefix;
            if (hostPart.contains("@")) {
                cleanUrl = "postgresql://" + afterPrefix;
            } else {
                // Clean JDBC URL prefix without embedded user:pass
                targetProperties.put("spring.datasource.url", cleanUrl);
                targetProperties.put("spring.datasource.driver-class-name", "org.postgresql.Driver");
                log.info("Using configured JDBC URL: {}", maskUrl(cleanUrl));
                return;
            }
        }

        if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
            try {
                ParsedUri parsed = parseConnectionUri(cleanUrl);

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(parsed.host)
                        .append(":")
                        .append(parsed.port)
                        .append("/")
                        .append(parsed.database);

                String sslMode = environment.getProperty("DB_SSL_MODE");
                if (!StringUtils.hasText(sslMode)) {
                    sslMode = "require";
                }

                // Preserve or add SSL mode
                if (StringUtils.hasText(parsed.query)) {
                    jdbcUrl.append("?").append(parsed.query);
                    if (!parsed.query.contains("sslmode") && !"localhost".equalsIgnoreCase(parsed.host) && !"127.0.0.1".equals(parsed.host)) {
                        jdbcUrl.append("&sslmode=").append(sslMode);
                    }
                } else if (!"localhost".equalsIgnoreCase(parsed.host) && !"127.0.0.1".equals(parsed.host)) {
                    jdbcUrl.append("?sslmode=").append(sslMode);
                }

                targetProperties.put("spring.datasource.url", jdbcUrl.toString());
                targetProperties.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

                if (StringUtils.hasText(parsed.username)) {
                    targetProperties.put("spring.datasource.username", parsed.username);
                }
                if (parsed.password != null) {
                    targetProperties.put("spring.datasource.password", parsed.password);
                }

                log.info("Normalized PostgreSQL connection URL -> host={}:{}, database={} (credentials extracted safely)",
                        parsed.host, parsed.port, parsed.database);
            } catch (Exception e) {
                log.warn("Failed to parse database connection URL [{}]: {}", maskUrl(rawUrl), e.getMessage());
            }
        }
    }

    private ParsedUri parseConnectionUri(String uriString) {
        // Form: scheme://[user:pass@]host[:port][/database][?query]
        int schemeEnd = uriString.indexOf("://");
        if (schemeEnd == -1) {
            throw new IllegalArgumentException("Invalid URI scheme");
        }
        String afterScheme = uriString.substring(schemeEnd + 3);

        String query = null;
        int queryIdx = afterScheme.indexOf('?');
        if (queryIdx != -1) {
            query = afterScheme.substring(queryIdx + 1);
            afterScheme = afterScheme.substring(0, queryIdx);
        }

        String database = "";
        int pathIdx = afterScheme.indexOf('/');
        if (pathIdx != -1) {
            database = afterScheme.substring(pathIdx + 1);
            afterScheme = afterScheme.substring(0, pathIdx);
        }

        String username = null;
        String password = null;
        int atIdx = afterScheme.lastIndexOf('@');
        String hostAndPort = afterScheme;
        if (atIdx != -1) {
            String userInfo = afterScheme.substring(0, atIdx);
            hostAndPort = afterScheme.substring(atIdx + 1);

            int colonIdx = userInfo.indexOf(':');
            if (colonIdx != -1) {
                username = urlDecode(userInfo.substring(0, colonIdx));
                password = urlDecode(userInfo.substring(colonIdx + 1));
            } else {
                username = urlDecode(userInfo);
            }
        }

        String host = hostAndPort;
        int port = 5432;
        int colonIdx = hostAndPort.lastIndexOf(':');
        if (colonIdx != -1) {
            host = hostAndPort.substring(0, colonIdx);
            try {
                port = Integer.parseInt(hostAndPort.substring(colonIdx + 1));
            } catch (NumberFormatException ignored) {
                port = 5432;
            }
        }

        return new ParsedUri(host, port, database, username, password, query);
    }

    private void harmonizeUserCredentials(ConfigurableEnvironment environment, Map<String, Object> targetProperties) {
        if (!targetProperties.containsKey("spring.datasource.username")) {
            String user = getFirstNonBlank(environment,
                    "DB_USER",
                    "DB_USERNAME",
                    "POSTGRES_USER");
            if (StringUtils.hasText(user)) {
                targetProperties.put("spring.datasource.username", user.trim());
            }
        }

        if (!targetProperties.containsKey("spring.datasource.password")) {
            String pass = getFirstNonBlank(environment,
                    "DB_PASSWORD",
                    "POSTGRES_PASSWORD");
            if (pass != null) {
                targetProperties.put("spring.datasource.password", pass);
            }
        }
    }

    private String getFirstNonBlank(ConfigurableEnvironment environment, String... keys) {
        for (String key : keys) {
            String val = environment.getProperty(key);
            if (StringUtils.hasText(val)) {
                return val;
            }
        }
        return null;
    }

    private String urlDecode(String value) {
        if (value == null) {
            return null;
        }
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8.name());
        } catch (Exception e) {
            return value;
        }
    }

    private String maskUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return "<empty>";
        }
        // Mask user:password if present
        return url.replaceAll("://([^:]+):([^@]+)@", "://$1:****@");
    }

    private static class ParsedUri {
        final String host;
        final int port;
        final String database;
        final String username;
        final String password;
        final String query;

        ParsedUri(String host, int port, String database, String username, String password, String query) {
            this.host = host;
            this.port = port;
            this.database = database;
            this.username = username;
            this.password = password;
            this.query = query;
        }
    }
}
