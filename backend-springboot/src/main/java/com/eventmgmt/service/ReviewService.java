package com.eventmgmt.service;

import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.RegistrationRepository;
import com.eventmgmt.repository.ReviewRepository;
import com.eventmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;

    @Transactional
    public Review createReview(String eventId, String userId, Integer rating, String comment) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user attended the event
        boolean attended = registrationRepository.existsByUserIdAndEventId(userId, eventId);
        if (!attended) {
            throw new RuntimeException("You must attend the event before reviewing it");
        }

        if (reviewRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("You have already reviewed this event");
        }

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .event(event)
                .user(user)
                .rating(rating)
                .comment(comment)
                .isVerified(true)
                .build();

        Review saved = reviewRepository.save(review);
        updateEventRating(eventId);
        return saved;
    }

    public Page<Review> getEventReviews(String eventId, Pageable pageable) {
        return reviewRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable);
    }

    public java.util.List<Review> getUserReviews(String userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Transactional
    public Review updateReview(String reviewId, String userId, Integer rating, String comment) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own reviews");
        }

        if (rating != null) review.setRating(rating);
        if (comment != null) review.setComment(comment);

        Review saved = reviewRepository.save(review);
        updateEventRating(review.getEvent().getId());
        return saved;
    }

    @Transactional
    public void deleteReview(String reviewId, String userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!isAdmin && !review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        String eventId = review.getEvent().getId();
        reviewRepository.delete(review);
        updateEventRating(eventId);
    }

    private void updateEventRating(String eventId) {
        Double avg = reviewRepository.getAverageRatingByEventId(eventId);
        Long count = reviewRepository.getReviewCountByEventId(eventId);
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            event.setAverageRating(avg != null ? avg : 0.0);
            event.setReviewCount(count != null ? count.intValue() : 0);
            eventRepository.save(event);
        }
    }
}
