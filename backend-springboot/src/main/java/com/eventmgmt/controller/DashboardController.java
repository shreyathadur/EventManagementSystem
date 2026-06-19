package com.eventmgmt.controller;

import com.eventmgmt.model.EventStatus;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import com.eventmgmt.repository.UserRepository;
import com.eventmgmt.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalEvents", eventRepository.count());
        stats.put("activeEvents", eventRepository.countByStatus(EventStatus.ACTIVE) +
                                  eventRepository.countByStatus(EventStatus.APPROVED));
        stats.put("pendingEvents", eventRepository.countByStatus(EventStatus.PENDING));
        stats.put("totalRegistrations", registrationRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalVenues", venueRepository.count());

        // Category breakdown
        List<Object[]> categoryStats = eventRepository.findCategoryStats();
        Map<String, Long> categories = new HashMap<>();
        for (Object[] row : categoryStats) {
            categories.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("categoryBreakdown", categories);

        return ResponseEntity.ok(stats);
    }
}
