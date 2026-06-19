package com.eventmgmt.service;

import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.PaymentRepository;
import com.eventmgmt.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RegistrationRepository registrationRepository;
    private final EmailService emailService;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Transactional
    public Payment processPayment(String registrationId, String ticketTier) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        Double amount = getTicketPrice(ticketTier);

        Payment payment = Payment.builder()
                .registration(reg)
                .amount(amount)
                .ticketTier(ticketTier)
                .status(PaymentStatus.COMPLETED) // Mock mode
                .stripePaymentId("mock_" + UUID.randomUUID().toString().substring(0, 8))
                .build();

        if (!stripeApiKey.isEmpty()) {
            // TODO: Real Stripe integration
            log.info("[STRIPE] Would process ${} for registration {}", amount, registrationId);
        } else {
            log.info("[PAYMENT] Mock payment of ${} for tier '{}' - registration {}", amount, ticketTier, registrationId);
        }

        Payment saved = paymentRepository.save(payment);

        // Send receipt email
        emailService.sendPaymentReceipt(
                reg.getUser().getEmail(),
                reg.getEvent().getTitle(),
                amount
        );

        return saved;
    }

    public List<Payment> getUserPayments(String userId) {
        return paymentRepository.findByRegistrationUserId(userId);
    }

    public List<Payment> getEventPayments(String eventId) {
        return paymentRepository.findByEventId(eventId);
    }

    @Transactional
    public Payment refundPayment(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setStatus(PaymentStatus.REFUNDED);
        log.info("[PAYMENT] Refund processed for payment {}", paymentId);
        return paymentRepository.save(payment);
    }

    private Double getTicketPrice(String tier) {
        return switch (tier != null ? tier.toUpperCase() : "FREE") {
            case "STUDENT" -> 5.0;
            case "FACULTY" -> 10.0;
            case "VIP" -> 20.0;
            default -> 0.0;
        };
    }
}
