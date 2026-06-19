package com.eventmgmt.controller;

import com.eventmgmt.model.AuditLog;
import com.eventmgmt.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin operations and audit logs")
public class AdminController {

    private final AuditService auditService;

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get audit logs with pagination")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action) {
        if (userId != null) {
            return ResponseEntity.ok(auditService.getAuditLogsByUser(userId, PageRequest.of(page, size)));
        }
        if (action != null) {
            return ResponseEntity.ok(auditService.getAuditLogsByAction(action, PageRequest.of(page, size)));
        }
        return ResponseEntity.ok(auditService.getAuditLogs(PageRequest.of(page, size)));
    }
}
