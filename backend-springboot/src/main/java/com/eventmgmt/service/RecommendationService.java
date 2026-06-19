package com.eventmgmt.service;

import com.eventmgmt.model.Event;
import com.eventmgmt.model.EventCategory;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public List<Event> getRecommendations(String userId) {
        // Get user's past event categories
        var userRegistrations = registrationRepository.findByUserId(userId);
        Set<EventCategory> preferredCategories = userRegistrations.stream()
                .map(r -> r.getEvent().getCategory())
                .collect(Collectors.toSet());

        if (preferredCategories.isEmpty()) {
            // New user — return top-rated upcoming events
            return eventRepository.findAll().stream()
                    .filter(e -> e.getDate() != null && !e.getDate().isBefore(java.time.LocalDate.now()))
                    .sorted(Comparator.comparingDouble(Event::getAverageRating).reversed())
                    .limit(10)
                    .collect(Collectors.toList());
        }

        // Return upcoming events in preferred categories
        return eventRepository.findAll().stream()
                .filter(e -> e.getDate() != null && !e.getDate().isBefore(java.time.LocalDate.now()))
                .filter(e -> preferredCategories.contains(e.getCategory()))
                .filter(e -> userRegistrations.stream().noneMatch(r -> r.getEvent().getId().equals(e.getId())))
                .sorted(Comparator.comparingDouble(Event::getAverageRating).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<Event> getSimilarEvents(String eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null) return Collections.emptyList();

        return eventRepository.findAll().stream()
                .filter(e -> !e.getId().equals(eventId))
                .filter(e -> e.getCategory() == event.getCategory())
                .filter(e -> e.getDate() != null && !e.getDate().isBefore(java.time.LocalDate.now()))
                .sorted(Comparator.comparingDouble(Event::getAverageRating).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
}
