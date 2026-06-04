package com.eventmgmt.controller;

import com.eventmgmt.model.Attendee;
import com.eventmgmt.model.Event;
import com.eventmgmt.model.Registration;
import com.eventmgmt.repository.AttendeeRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendeeRepository attendeeRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        event.setRegisteredCount(0);
        if (event.getBanner() == null || event.getBanner().isEmpty()) {
            event.setBanner("https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60");
        }
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable String id, @Valid @RequestBody Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setTitle(eventDetails.getTitle());
                    event.setDescription(eventDetails.getDescription());
                    event.setDate(eventDetails.getDate());
                    event.setTime(eventDetails.getTime());
                    event.setLocation(eventDetails.getLocation());
                    event.setCategory(eventDetails.getCategory());
                    event.setCapacity(eventDetails.getCapacity());
                    event.setBanner(eventDetails.getBanner());
                    event.setPrice(eventDetails.getPrice());
                    event.setStatus(eventDetails.getStatus());
                    event.setOrganizer(eventDetails.getOrganizer());
                    return ResponseEntity.ok(eventRepository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    // Manual cascade: remove standard registrations linked to this event
                    List<Registration> regs = registrationRepository.findByEventId(id);
                    registrationRepository.deleteAll(regs);
                    
                    eventRepository.delete(event);
                    return ResponseEntity.ok().body(Map.of("success", true, "message", "Event deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/registrations")
    public List<Registration> getEventRegistrations(@PathVariable String id) {
        return registrationRepository.findByEventId(id);
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return eventRepository.findById(id)
                .map(event -> {
                    if (event.getRegisteredCount() >= event.getCapacity()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Event is at full capacity"));
                    }

                    String name = payload.get("name");
                    String email = payload.get("email");
                    String company = payload.getOrDefault("company", "");
                    String role = payload.getOrDefault("role", "");
                    String ticketType = payload.getOrDefault("ticketType", "standard");

                    if (name == null || email == null || name.isEmpty() || email.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "Name and email are required fields"));
                    }

                    boolean alreadyRegistered = registrationRepository
                            .existsByEventIdAndAttendeeEmailIgnoreCase(id, email);
                    if (alreadyRegistered) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("error", "This email has already registered for this event"));
                    }

                    // Retrieve or create Attendee record
                    Attendee attendee = attendeeRepository.findByEmailIgnoreCase(email)
                            .orElseGet(() -> {
                                Attendee newAttendee = new Attendee();
                                newAttendee.setName(name);
                                newAttendee.setEmail(email);
                                newAttendee.setCompany(company);
                                newAttendee.setRole(role);
                                return attendeeRepository.save(newAttendee);
                            });

                    // Create registration
                    Registration registration = new Registration();
                    registration.setEventId(id);
                    registration.setAttendeeId(attendee.getId());
                    registration.setAttendeeName(attendee.getName());
                    registration.setAttendeeEmail(attendee.getEmail());
                    registration.setTicketType(ticketType);
                    registration.setRegisteredAt(LocalDateTime.now());
                    
                    Registration savedReg = registrationRepository.save(registration);

                    // Update event capacity tracker
                    event.setRegisteredCount(event.getRegisteredCount() + 1);
                    eventRepository.save(event);

                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(Map.of("registration", savedReg, "event", event));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
