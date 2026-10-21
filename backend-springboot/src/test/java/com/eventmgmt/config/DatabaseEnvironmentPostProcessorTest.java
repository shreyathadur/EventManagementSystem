package com.eventmgmt.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.support.SpringFactoriesLoader;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseEnvironmentPostProcessorTest {

    private DatabaseEnvironmentPostProcessor processor;
    private ConfigurableEnvironment environment;
    private SpringApplication application;

    @BeforeEach
    void setUp() {
        processor = new DatabaseEnvironmentPostProcessor();
        environment = new StandardEnvironment();
        application = new SpringApplication();
    }

    @Test
    @DisplayName("Should be registered in META-INF/spring.factories for Spring Boot discovery")
    void shouldBeRegisteredInSpringFactories() {
        List<String> factoryNames = SpringFactoriesLoader.loadFactoryNames(
                EnvironmentPostProcessor.class,
                getClass().getClassLoader()
        );

        assertTrue(factoryNames.contains(DatabaseEnvironmentPostProcessor.class.getName()),
                "DatabaseEnvironmentPostProcessor must be registered under EnvironmentPostProcessor in META-INF/spring.factories");
    }

    @Test
    @DisplayName("Should convert postgres:// URL to jdbc:postgresql:// and extract credentials")
    void shouldConvertPostgresUriToJdbc() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgres://ems_user:secret_pass123@dpg-c1234567-a:5432/university_ems"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://dpg-c1234567-a:5432/university_ems?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("ems_user", environment.getProperty("spring.datasource.username"));
        assertEquals("secret_pass123", environment.getProperty("spring.datasource.password"));
        assertEquals("org.postgresql.Driver", environment.getProperty("spring.datasource.driver-class-name"));
    }

    @Test
    @DisplayName("Should preserve existing query parameters and decode special characters in credentials")
    void shouldPreserveQueryAndDecodeCredentials() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgresql://admin_user:p%40ss%3Aword@oregon-postgres.render.com:5432/event_db?sslmode=require"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://oregon-postgres.render.com:5432/event_db?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("admin_user", environment.getProperty("spring.datasource.username"));
        assertEquals("p@ss:word", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should handle URL without port by defaulting to 5432")
    void shouldHandleUrlWithoutPort() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgres://my_user:my_pass@internal-db/prod_db"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://internal-db:5432/prod_db?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("my_user", environment.getProperty("spring.datasource.username"));
        assertEquals("my_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should correctly parse Render internal PostgreSQL connection string with no port")
    void shouldParseRenderInternalPostgreSqlUrl() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgresql://ems_user:testSecret123@dpg-mockinternal1234-a/university_ems_db"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://dpg-mockinternal1234-a:5432/university_ems_db?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("ems_user", environment.getProperty("spring.datasource.username"));
        assertEquals("testSecret123", environment.getProperty("spring.datasource.password"));
        assertEquals("org.postgresql.Driver", environment.getProperty("spring.datasource.driver-class-name"));
    }

    @Test
    @DisplayName("Should preserve clean jdbc:postgresql:// URL format as is")
    void shouldPreserveJdbcPostgresqlUrl() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "jdbc:postgresql://dpg-c1234567-a:5432/university_ems?sslmode=require"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://dpg-c1234567-a:5432/university_ems?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("org.postgresql.Driver", environment.getProperty("spring.datasource.driver-class-name"));
    }

    @Test
    @DisplayName("Should normalize jdbc URL with embedded credentials")
    void shouldNormalizeJdbcUrlWithEmbeddedCredentials() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "jdbc:postgresql://embedded_user:embedded_pass@dpg-c1234567-a:5432/university_ems"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://dpg-c1234567-a:5432/university_ems?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("embedded_user", environment.getProperty("spring.datasource.username"));
        assertEquals("embedded_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("DATABASE_URL credentials should take precedence over conflicting individual variables")
    void shouldGivePrecedenceToDatabaseUrlOverIndividualVariables() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgresql://render_user:render_pass@render-db:5432/live_db",
                "DB_USER", "ignored_local_user",
                "DB_PASSWORD", "ignored_local_pass"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://render-db:5432/live_db?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("render_user", environment.getProperty("spring.datasource.username"));
        assertEquals("render_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should override lower-precedence application-prod.properties values")
    void shouldOverrideApplicationPropertiesValues() {
        environment.getPropertySources().addLast(new MapPropertySource("applicationConfig: [classpath:/application-prod.properties]", Map.of(
                "spring.datasource.url", "jdbc:postgresql://localhost:5432/university_ems?sslmode=require",
                "spring.datasource.username", "ems_user",
                "spring.datasource.password", ""
        )));

        environment.getPropertySources().addLast(new MapPropertySource("renderEnvVars", Map.of(
                "DATABASE_URL", "postgresql://real_user:real_pass@dpg-live-internal:5432/university_ems"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://dpg-live-internal:5432/university_ems?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("real_user", environment.getProperty("spring.datasource.username"));
        assertEquals("real_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should fallback to individual credentials when DATABASE_URL has no credentials")
    void shouldFallbackToIndividualCredentialsWhenUrlHasNone() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgresql://render-db:5432/live_db",
                "DB_USER", "fallback_user",
                "DB_PASSWORD", "fallback_pass"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://render-db:5432/live_db?sslmode=require",
                environment.getProperty("spring.datasource.url"));
        assertEquals("fallback_user", environment.getProperty("spring.datasource.username"));
        assertEquals("fallback_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should not add sslmode=require to localhost database URLs")
    void shouldNotAddSslModeToLocalhost() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DATABASE_URL", "postgresql://local_user:local_pass@localhost:5432/local_db"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("jdbc:postgresql://localhost:5432/local_db",
                environment.getProperty("spring.datasource.url"));
        assertEquals("local_user", environment.getProperty("spring.datasource.username"));
        assertEquals("local_pass", environment.getProperty("spring.datasource.password"));
    }

    @Test
    @DisplayName("Should harmonize DB_USERNAME and DB_USER when no DATABASE_URL is present")
    void shouldHarmonizeDbUsernameAndDbUser() {
        environment.getPropertySources().addLast(new MapPropertySource("testEnv", Map.of(
                "DB_USERNAME", "custom_pg_user",
                "DB_PASSWORD", "custom_pg_pass"
        )));

        processor.postProcessEnvironment(environment, application);

        assertEquals("custom_pg_user", environment.getProperty("spring.datasource.username"));
        assertEquals("custom_pg_pass", environment.getProperty("spring.datasource.password"));
    }
}
