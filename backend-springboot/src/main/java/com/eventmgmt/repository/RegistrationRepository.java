package com.eventmgmt.repository;

import com.eventmgmt.model.Registration;
import com.eventmgmt.model.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {

    List<Registration> findByEventId(String eventId);

    List<Registration> findByUserId(String userId);

    boolean existsByUserIdAndEventId(String userId, String eventId);

    Optional<Registration> findByUserIdAndEventId(String userId, String eventId);

    long countByEventIdAndStatus(String eventId, RegistrationStatus status);

    @Query("SELECT COUNT(r) FROM Registration r WHERE r.event.organizer.id = :organizerId")
    long countByOrganizerId(@Param("organizerId") String organizerId);

    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.event WHERE r.event.id = :eventId")
    List<Registration> findByEventIdWithDetails(@Param("eventId") String eventId);
}
