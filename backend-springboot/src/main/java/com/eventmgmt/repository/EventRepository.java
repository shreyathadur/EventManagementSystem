package com.eventmgmt.repository;

import com.eventmgmt.model.Event;
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

    Page<Event> findByCategoryAndStatus(String category, EventStatus status, Pageable pageable);

    List<Event> findByOrganizerId(String organizerId);

    @Query("SELECT e FROM Event e WHERE e.status = :status AND " +
           "(LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Event> searchEvents(@Param("query") String query, @Param("status") EventStatus status, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.organizer.id = :organizerId")
    long countByOrganizerId(@Param("organizerId") String organizerId);

    @Query("SELECT e.category, COUNT(e) FROM Event e GROUP BY e.category ORDER BY COUNT(e) DESC")
    List<Object[]> findCategoryStats();
}
