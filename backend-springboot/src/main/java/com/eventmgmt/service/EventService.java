package com.eventmgmt.service;

import com.eventmgmt.dto.EventRequest;
import com.eventmgmt.dto.EventResponse;
import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventResponse createEvent(EventRequest request, String organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer not found"));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setCategory(request.getCategory());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setVenue(request.getVenue());
        event.setOrganizer(organizer);
        event.setMaxAttendees(request.getMaxAttendees());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        event.setImageUrl(request.getImageUrl());

        // Faculty/Admin events are auto-approved
        if (organizer.getRole() == Role.ROLE_FACULTY || organizer.getRole() == Role.ROLE_ADMIN) {
            event.setStatus(EventStatus.APPROVED);
        } else {
            event.setStatus(EventStatus.PENDING);
        }

        Event saved = eventRepository.save(event);
        return toResponse(saved);
    }

    public Page<EventResponse> getAllEvents(EventStatus status, EventCategory category, String query, Pageable pageable) {
        return eventRepository.findWithFilters(status, category, query, pageable)
                .map(this::toResponse);
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return toResponse(event);
    }

    @Transactional
    public EventResponse updateEvent(String id, EventRequest request, String userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getOrganizer().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (user.getRole() != Role.ROLE_ADMIN) {
                throw new RuntimeException("You can only update your own events");
            }
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getCategory() != null) event.setCategory(request.getCategory());
        if (request.getDate() != null) event.setDate(request.getDate());
        if (request.getTime() != null) event.setTime(request.getTime());
        if (request.getVenue() != null) event.setVenue(request.getVenue());
        if (request.getMaxAttendees() != null) event.setMaxAttendees(request.getMaxAttendees());
        if (request.getRegistrationDeadline() != null) event.setRegistrationDeadline(request.getRegistrationDeadline());
        if (request.getImageUrl() != null) event.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null) event.setStatus(request.getStatus());

        return toResponse(eventRepository.save(event));
    }

    public void deleteEvent(String id, String userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getOrganizer().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (user.getRole() != Role.ROLE_ADMIN) {
                throw new RuntimeException("You can only delete your own events");
            }
        }

        eventRepository.delete(event);
    }

    public List<EventResponse> getMyEvents(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::toResponse)
                .toList();
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .category(event.getCategory())
                .date(event.getDate())
                .time(event.getTime())
                .venue(event.getVenue())
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getName() : null)
                .maxAttendees(event.getMaxAttendees())
                .currentAttendees(event.getCurrentAttendees())
                .status(event.getStatus())
                .registrationDeadline(event.getRegistrationDeadline())
                .imageUrl(event.getImageUrl())
                .build();
    }
}
