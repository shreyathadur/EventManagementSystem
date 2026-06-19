package com.eventmgmt.service;

import com.eventmgmt.dto.RegistrationResponse;
import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import com.eventmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public RegistrationResponse registerForEvent(String eventId, String userId) {
        log.info("[REGISTRATION] User {} attempting to register for event {}", userId, eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        log.info("[REGISTRATION] Event '{}' status={}, attendees={}/{}",
                event.getTitle(), event.getStatus(), event.getCurrentAttendees(), event.getMaxAttendees());

        if (event.getStatus() != EventStatus.APPROVED && event.getStatus() != EventStatus.ACTIVE) {
            throw new RuntimeException("Event is not open for registration. Current status: " + event.getStatus());
        }

        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("You are already registered for this event");
        }

        // Null-safe maxAttendees check (treat null as unlimited)
        int currentAttendees = event.getCurrentAttendees() != null ? event.getCurrentAttendees() : 0;
        Integer maxAttendees = event.getMaxAttendees();

        RegistrationStatus status;
        if (maxAttendees != null && currentAttendees >= maxAttendees) {
            status = RegistrationStatus.WAITLISTED;
            log.info("[REGISTRATION] Event full — user {} waitlisted", userId);
        } else {
            status = RegistrationStatus.CONFIRMED;
            event.setCurrentAttendees(currentAttendees + 1);
            eventRepository.save(event);
            log.info("[REGISTRATION] User {} confirmed — attendees now {}", userId, currentAttendees + 1);
        }

        Registration registration = Registration.builder()
                .user(user)
                .event(event)
                .status(status)
                .ticketType("standard")
                .build();

        Registration saved = registrationRepository.save(registration);
        log.info("[REGISTRATION] Registration {} saved successfully", saved.getId());
        return toResponse(saved);
    }

    public List<RegistrationResponse> getUserRegistrations(String userId) {
        return registrationRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void cancelRegistration(String eventId, String userId) {
        Registration registration = registrationRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (registration.getStatus() == RegistrationStatus.CONFIRMED) {
            Event event = registration.getEvent();
            event.setCurrentAttendees(Math.max(0, event.getCurrentAttendees() - 1));
            eventRepository.save(event);
        }

        registrationRepository.delete(registration);
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return registrationRepository.findByEventIdWithDetails(eventId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RegistrationResponse checkIn(String registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (reg.getStatus() != RegistrationStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed registrations can be checked in");
        }

        reg.setCheckedIn(true);
        reg.setCheckedInAt(LocalDateTime.now());
        return toResponse(registrationRepository.save(reg));
    }

    private RegistrationResponse toResponse(Registration reg) {
        return RegistrationResponse.builder()
                .id(reg.getId())
                .eventId(reg.getEvent() != null ? reg.getEvent().getId() : null)
                .eventTitle(reg.getEvent() != null ? reg.getEvent().getTitle() : null)
                .userId(reg.getUser() != null ? reg.getUser().getId() : null)
                .userName(reg.getUser() != null ? reg.getUser().getName() : null)
                .status(reg.getStatus().name())
                .ticketType(reg.getTicketType())
                .checkedIn(reg.isCheckedIn())
                .checkedInAt(reg.getCheckedInAt())
                .registeredAt(reg.getRegisteredAt())
                .build();
    }
}
