package com.eventmgmt.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Async
    public void sendRegistrationConfirmation(String email, String eventTitle, String date) {
        log.info("[EMAIL] Registration confirmation to {} for event '{}' on {}", email, eventTitle, date);
        // TODO: Integrate SendGrid when API key is available
        // For now, logging to console as fallback
    }

    @Async
    public void sendApprovalNotification(String email, String eventTitle, String status) {
        log.info("[EMAIL] Approval {} notification to {} for event '{}'", status, email, eventTitle);
    }

    @Async
    public void sendWaitlistConfirmation(String email, String eventTitle) {
        log.info("[EMAIL] Waitlist confirmation to {} for event '{}'", email, eventTitle);
    }

    @Async
    public void sendEventReminder(String email, String eventTitle, String date) {
        log.info("[EMAIL] Event reminder to {} for '{}' on {}", email, eventTitle, date);
    }

    @Async
    public void sendPaymentReceipt(String email, String eventTitle, Double amount) {
        log.info("[EMAIL] Payment receipt to {} - ${} for '{}'", email, amount, eventTitle);
    }

    @Async
    public void sendReviewInvitation(String email, String eventTitle) {
        log.info("[EMAIL] Review invitation to {} for '{}'", email, eventTitle);
    }
}
