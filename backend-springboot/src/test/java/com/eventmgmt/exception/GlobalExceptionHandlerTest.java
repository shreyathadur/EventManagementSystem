package com.eventmgmt.exception;

import org.hibernate.HibernateException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.sql.SQLException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should return HTTP 503 Service Unavailable for DataAccessException without disguising as HTTP 400")
    void shouldReturn503ForDataAccessException() {
        SQLException sqlException = new SQLException("relation \"users\" does not exist", "42P01", 1146);
        BadSqlGrammarException ex = new BadSqlGrammarException("task", "select * from users", sqlException);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleDatabaseException(ex);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Database service is temporarily unavailable. Please try again shortly.",
                response.getBody().get("message"));
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals(503, response.getBody().get("status"));
    }

    @Test
    @DisplayName("Should return HTTP 503 when RuntimeException wraps a database or persistence error")
    void shouldReturn503WhenRuntimeExceptionWrapsDatabaseException() {
        SQLException sqlException = new SQLException("relation \"users\" does not exist");
        RuntimeException wrappedDbEx = new RuntimeException("Could not execute statement", sqlException);

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleRuntimeException(wrappedDbEx);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Database service is temporarily unavailable. Please try again shortly.",
                response.getBody().get("message"));
    }

    @Test
    @DisplayName("Should return HTTP 401 Unauthorized for BadCredentialsException and UsernameNotFoundException")
    void shouldReturn401ForAuthenticationFailures() {
        ResponseEntity<Map<String, Object>> badCreds =
                exceptionHandler.handleAuthenticationException(new BadCredentialsException("Bad credentials"));
        assertEquals(HttpStatus.UNAUTHORIZED, badCreds.getStatusCode());
        assertEquals("Invalid email or password", badCreds.getBody().get("message"));

        ResponseEntity<Map<String, Object>> userNotFound =
                exceptionHandler.handleAuthenticationException(new UsernameNotFoundException("User not found"));
        assertEquals(HttpStatus.UNAUTHORIZED, userNotFound.getStatusCode());
        assertEquals("Invalid email or password", userNotFound.getBody().get("message"));
    }

    @Test
    @DisplayName("Should return HTTP 400 Bad Request for normal business RuntimeExceptions")
    void shouldReturn400ForBusinessRuntimeExceptions() {
        RuntimeException businessEx = new RuntimeException("Email is already registered");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleRuntimeException(businessEx);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Email is already registered", response.getBody().get("message"));
        assertFalse((Boolean) response.getBody().get("success"));
    }

    @Test
    @DisplayName("Should return HTTP 404 for ResourceNotFoundException")
    void shouldReturn404ForResourceNotFound() {
        ResourceNotFoundException notFound = new ResourceNotFoundException("Event not found with id 123");

        ResponseEntity<Map<String, Object>> response = exceptionHandler.handleNotFound(notFound);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Event not found with id 123", response.getBody().get("message"));
    }
}
