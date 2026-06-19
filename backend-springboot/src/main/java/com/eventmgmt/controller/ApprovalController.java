package com.eventmgmt.controller;

import com.eventmgmt.dto.ApprovalRequest;
import com.eventmgmt.model.Approval;
import com.eventmgmt.model.User;
import com.eventmgmt.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @PostMapping("/request")
    public ResponseEntity<Approval> requestApproval(@RequestBody ApprovalRequest request) {
        Approval approval = approvalService.requestApproval(request.getEventId());
        return ResponseEntity.status(201).body(approval);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_ADMIN')")
    public ResponseEntity<List<Approval>> getPendingApprovals() {
        List<Approval> approvals = approvalService.getPendingApprovals();
        return ResponseEntity.ok(approvals);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_ADMIN')")
    public ResponseEntity<Approval> approveEvent(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User user
    ) {
        String comments = request != null ? request.getComments() : null;
        Approval approval = approvalService.approveEvent(id, user.getId(), comments);
        return ResponseEntity.ok(approval);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_ADMIN')")
    public ResponseEntity<Approval> rejectEvent(
            @PathVariable String id,
            @RequestBody(required = false) ApprovalRequest request,
            @AuthenticationPrincipal User user
    ) {
        String comments = request != null ? request.getComments() : null;
        Approval approval = approvalService.rejectEvent(id, user.getId(), comments);
        return ResponseEntity.ok(approval);
    }
}
