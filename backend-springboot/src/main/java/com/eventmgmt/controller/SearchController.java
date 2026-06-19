package com.eventmgmt.controller;

import com.eventmgmt.dto.EventResponse;
import com.eventmgmt.model.Event;
import com.eventmgmt.model.User;
import com.eventmgmt.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search & Recommendations", description = "Event search and recommendations")
public class SearchController {

    private final RecommendationService recommendationService;

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized event recommendations")
    public ResponseEntity<List<Event>> getRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recommendationService.getRecommendations(user.getId()));
    }

    @GetMapping("/similar/{eventId}")
    @Operation(summary = "Get similar events")
    public ResponseEntity<List<Event>> getSimilarEvents(@PathVariable String eventId) {
        return ResponseEntity.ok(recommendationService.getSimilarEvents(eventId));
    }
}
