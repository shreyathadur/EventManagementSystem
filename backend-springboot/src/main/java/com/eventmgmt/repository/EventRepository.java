package com.eventmgmt.repository;

import com.eventmgmt.model.Event;
import com.eventmgmt.model.EventCategory;
import com.eventmgmt.model.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByCategoryAndStatus(EventCategory category, EventStatus status, Pageable pageable);

    List<Event> findByOrganizerId(String organizerId);

    @Query("SELECT e FROM Event e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:query IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(CAST(e.venue AS string)) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Event> findWithFilters(
            @Param("status") EventStatus status,
            @Param("category") EventCategory category,
            @Param("query") String query,
            Pageable pageable);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.organizer.id = :organizerId")
    long countByOrganizerId(@Param("organizerId") String organizerId);

    @Query("SELECT e.category, COUNT(e) FROM Event e GROUP BY e.category ORDER BY COUNT(e) DESC")
    List<Object[]> findCategoryStats();

    long countByStatus(EventStatus status);
}
