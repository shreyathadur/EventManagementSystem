package com.eventmgmt.controller;

import com.eventmgmt.model.Review;
import com.eventmgmt.model.User;
import com.eventmgmt.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Event review and rating management")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create a review for an event")
    public ResponseEntity<Review> createReview(@RequestBody Map<String, Object> body,
                                                @AuthenticationPrincipal User user) {
        String eventId = (String) body.get("eventId");
        Integer rating = (Integer) body.get("rating");
        String comment = (String) body.get("comment");
        return ResponseEntity.ok(reviewService.createReview(eventId, user.getId(), rating, comment));
    }

    @GetMapping("/event/{eventId}")
    @Operation(summary = "Get reviews for an event")
    public ResponseEntity<Page<Review>> getEventReviews(@PathVariable String eventId,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getEventReviews(eventId, PageRequest.of(page, size)));
    }

    @GetMapping("/user")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<List<Review>> getUserReviews(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getUserReviews(user.getId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a review")
    public ResponseEntity<Review> updateReview(@PathVariable String id,
                                                @RequestBody Map<String, Object> body,
                                                @AuthenticationPrincipal User user) {
        Integer rating = body.containsKey("rating") ? (Integer) body.get("rating") : null;
        String comment = (String) body.get("comment");
        return ResponseEntity.ok(reviewService.updateReview(id, user.getId(), rating, comment));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a review")
    public ResponseEntity<Void> deleteReview(@PathVariable String id,
                                              @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, user.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
