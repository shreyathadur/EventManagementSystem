package com.eventmgmt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    /**
     * Root endpoint — visible at https://ems-backend-jisu.onrender.com/
     * Confirms the API is live without requiring authentication.
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "service", "University Event Management System — API",
            "status", "UP",
            "timestamp", LocalDateTime.now().toString(),
            "docs", "/swagger-ui/index.html",
            "health", "/api/health"
        ));
    }

    /**
     * /api root endpoint
     */
    @GetMapping({"/api", "/api/"})
    public ResponseEntity<Map<String, Object>> apiRoot() {
        return ResponseEntity.ok(Map.of(
            "service", "University EMS REST API",
            "status", "UP",
            "version", "1.0.0",
            "endpoints", Map.of(
                "auth", "/api/auth/login  |  /api/auth/register",
                "events", "/api/events",
                "health", "/api/health",
                "docs", "/swagger-ui/index.html"
            )
        ));
    }

    /**
     * /api/health — explicit health check endpoint
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
