package com.eventmgmt.controller;

import com.eventmgmt.model.Event;
import com.eventmgmt.model.Registration;
import com.eventmgmt.repository.AttendeeRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendeeRepository attendeeRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @GetMapping
    public Map<String, Object> getDashboardStats() {
        List<Event> events = eventRepository.findAll();
        long totalEvents = events.size();
        long totalAttendees = attendeeRepository.count();

        double totalRevenue = 0;
        List<Registration> registrations = registrationRepository.findAll();
        for (Registration registration : registrations) {
            if ("confirmed".equalsIgnoreCase(registration.getStatus())) {
                Event event = eventRepository.findById(registration.getEventId()).orElse(null);
                if (event != null && event.getPrice() > 0) {
                    double finalPrice = event.getPrice();
                    if ("vip".equalsIgnoreCase(registration.getTicketType())) {
                        finalPrice *= 1.5;
                    } else if ("early_bird".equalsIgnoreCase(registration.getTicketType())) {
                        finalPrice *= 0.8;
                    }
                    totalRevenue += finalPrice;
                }
            }
        }

        LocalDate today = LocalDate.now();
        long upcomingEvents = events.stream()
                .filter(e -> e.getDate() != null && !e.getDate().isBefore(today) && !"cancelled".equalsIgnoreCase(e.getStatus()))
                .count();

        long totalCapacity = events.stream().mapToLong(Event::getCapacity).sum();
        long totalRegistered = events.stream().mapToLong(Event::getRegisteredCount).sum();
        long registrationRate = 0;
        if (totalCapacity > 0) {
            registrationRate = Math.round(((double) totalRegistered / totalCapacity) * 100);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("totalAttendees", totalAttendees);
        stats.put("totalRevenue", Math.round(totalRevenue));
        stats.put("upcomingEvents", upcomingEvents);
        stats.put("registrationRate", registrationRate);

        return stats;
    }
}
