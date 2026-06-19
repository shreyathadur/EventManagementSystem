package com.eventmgmt.controller;

import com.eventmgmt.dto.CheckInRequest;
import com.eventmgmt.dto.MessageResponse;
import com.eventmgmt.dto.RegistrationResponse;
import com.eventmgmt.model.User;
import com.eventmgmt.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> registerForEvent(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            log.error("[REGISTRATION] User is null — JWT authentication may have failed");
            return ResponseEntity.status(401).build();
        }

        String eventId = body.get("eventId");
        if (eventId == null || eventId.isBlank()) {
            log.error("[REGISTRATION] eventId is missing from request body");
            throw new RuntimeException("eventId is required in request body");
        }

        log.info("[REGISTRATION] POST /register — user={} ({}), eventId={}", user.getName(), user.getId(), eventId);
        RegistrationResponse registration = registrationService.registerForEvent(eventId, user.getId());
        return ResponseEntity.status(201).body(registration);
    }

    @GetMapping("/user")
    public ResponseEntity<List<RegistrationResponse>> getUserRegistrations(
            @AuthenticationPrincipal User user
    ) {
        List<RegistrationResponse> registrations = registrationService.getUserRegistrations(user.getId());
        return ResponseEntity.ok(registrations);
    }

    @DeleteMapping("/cancel/{eventId}")
    public ResponseEntity<MessageResponse> cancelRegistration(
            @PathVariable String eventId,
            @AuthenticationPrincipal User user
    ) {
        registrationService.cancelRegistration(eventId, user.getId());
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Registration cancelled successfully")
                .success(true)
                .build());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponse>> getEventRegistrations(
            @PathVariable String eventId
    ) {
        List<RegistrationResponse> registrations = registrationService.getEventRegistrations(eventId);
        return ResponseEntity.ok(registrations);
    }

    @PostMapping("/checkin")
    public ResponseEntity<RegistrationResponse> checkInUser(
            @RequestBody CheckInRequest request
    ) {
        RegistrationResponse response = registrationService.checkIn(request.getRegistrationId());
        return ResponseEntity.ok(response);
    }
}
