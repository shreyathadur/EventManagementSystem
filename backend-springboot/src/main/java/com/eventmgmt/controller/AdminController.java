package com.eventmgmt.controller;

import com.eventmgmt.dto.ApprovalRequest;
import com.eventmgmt.model.AuditLog;
import com.eventmgmt.model.Approval;
import com.eventmgmt.model.User;
import com.eventmgmt.model.Role;
import com.eventmgmt.repository.UserRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import com.eventmgmt.service.AuditService;
import com.eventmgmt.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management operations")
public class AdminController {

    private final AuditService auditService;
    private final ApprovalService approvalService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    @Operation(summary = "Get audit logs with pagination and optional filters")
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

    // ─── Event Approvals ──────────────────────────────────────────────────────

    @GetMapping("/approvals/pending")
    @Operation(summary = "Get all pending event approval requests")
    public ResponseEntity<List<Approval>> getPendingApprovals() {
        return ResponseEntity.ok(approvalService.getPendingApprovals());
    }

    @PutMapping("/approvals/{id}/approve")
    @Operation(summary = "Approve an event by approval ID")
    public ResponseEntity<Approval> approveEvent(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User admin) {
        String comments = request != null ? request.getComments() : "Approved by admin";
        Approval approval = approvalService.approveEvent(id, admin.getId(), comments);
        return ResponseEntity.ok(approval);
    }

    @PutMapping("/approvals/{id}/reject")
    @Operation(summary = "Reject an event by approval ID")
    public ResponseEntity<Approval> rejectEvent(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User admin) {
        String comments = request != null ? request.getComments() : "Rejected by admin";
        Approval approval = approvalService.rejectEvent(id, admin.getId(), comments);
        return ResponseEntity.ok(approval);
    }

    // ─── User Management ─────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all registered users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userRepository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/users/organizers")
    @Operation(summary = "List all organizer accounts")
    public ResponseEntity<List<User>> getOrganizers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.ROLE_ORGANIZER));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user account")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Platform Analytics ───────────────────────────────────────────────────

    @GetMapping("/analytics")
    @Operation(summary = "Get admin analytics overview")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalEvents", eventRepository.count());
        analytics.put("totalRegistrations", registrationRepository.count());

        // Role breakdown
        Map<String, Long> roles = new HashMap<>();
        roles.put("students", userRepository.countByRole(Role.ROLE_STUDENT));
        roles.put("organizers", userRepository.countByRole(Role.ROLE_ORGANIZER));
        roles.put("admins", userRepository.countByRole(Role.ROLE_ADMIN));
        analytics.put("usersByRole", roles);

        return ResponseEntity.ok(analytics);
    }
}
