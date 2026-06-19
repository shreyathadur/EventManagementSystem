package com.eventmgmt.controller;

import com.eventmgmt.model.Venue;
import com.eventmgmt.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VenueController {

    private final VenueRepository venueRepository;

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        List<Venue> venues = venueRepository.findByIsAvailableTrue();
        return ResponseEntity.ok(venues);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Venue> createVenue(@RequestBody Venue venue) {
        Venue saved = venueRepository.save(venue);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @RequestBody Venue venueDetails) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (venueDetails.getName() != null) venue.setName(venueDetails.getName());
        if (venueDetails.getCapacity() != null) venue.setCapacity(venueDetails.getCapacity());
        if (venueDetails.getType() != null) venue.setType(venueDetails.getType());
        if (venueDetails.getLocation() != null) venue.setLocation(venueDetails.getLocation());
        if (venueDetails.getAmenities() != null) venue.setAmenities(venueDetails.getAmenities());
        if (venueDetails.getIsAvailable() != null) venue.setIsAvailable(venueDetails.getIsAvailable());

        return ResponseEntity.ok(venueRepository.save(venue));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
