package com.eventmgmt.repository;

import com.eventmgmt.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    Page<Review> findByEventIdOrderByCreatedAtDesc(String eventId, Pageable pageable);

    List<Review> findByUserId(String userId);

    Optional<Review> findByEventIdAndUserId(String eventId, String userId);

    boolean existsByEventIdAndUserId(String eventId, String userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.id = :eventId")
    Double getAverageRatingByEventId(String eventId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.event.id = :eventId")
    Long getReviewCountByEventId(String eventId);

    long countByUserId(String userId);
}
