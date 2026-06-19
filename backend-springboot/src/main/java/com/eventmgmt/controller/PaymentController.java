package com.eventmgmt.controller;

import com.eventmgmt.model.Payment;
import com.eventmgmt.model.User;
import com.eventmgmt.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing and history")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @Operation(summary = "Process a payment for registration")
    public ResponseEntity<Payment> processPayment(@RequestBody Map<String, String> body) {
        String registrationId = body.get("registrationId");
        String ticketTier = body.getOrDefault("ticketTier", "FREE");
        return ResponseEntity.ok(paymentService.processPayment(registrationId, ticketTier));
    }

    @GetMapping("/user")
    @Operation(summary = "Get current user's payment history")
    public ResponseEntity<List<Payment>> getUserPayments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(paymentService.getUserPayments(user.getId()));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get payments for an event")
    public ResponseEntity<List<Payment>> getEventPayments(@PathVariable String eventId) {
        return ResponseEntity.ok(paymentService.getEventPayments(eventId));
    }

    @PostMapping("/refund/{paymentId}")
    @Operation(summary = "Refund a payment")
    public ResponseEntity<Payment> refundPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId));
    }
}
