package com.eventmgmt.controller;

import com.eventmgmt.dto.EventRequest;
import com.eventmgmt.dto.EventResponse;
import com.eventmgmt.model.EventCategory;
import com.eventmgmt.model.EventStatus;
import com.eventmgmt.model.User;
import com.eventmgmt.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestBody EventRequest request,
            @AuthenticationPrincipal User user
    ) {
        EventResponse event = eventService.createEvent(request, user.getId());
        return ResponseEntity.status(201).body(event);
    }

    @GetMapping
    public ResponseEntity<Page<EventResponse>> getAllEvents(
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<EventResponse> events = eventService.getAllEvents(status, category, query, pageable);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable String id) {
        EventResponse event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable String id,
            @RequestBody EventRequest request,
            @AuthenticationPrincipal User user
    ) {
        EventResponse event = eventService.updateEvent(id, request, user.getId());
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable String id,
            @AuthenticationPrincipal User user
    ) {
        eventService.deleteEvent(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventResponse>> getMyEvents(@AuthenticationPrincipal User user) {
        List<EventResponse> events = eventService.getMyEvents(user.getId());
        return ResponseEntity.ok(events);
    }
}
