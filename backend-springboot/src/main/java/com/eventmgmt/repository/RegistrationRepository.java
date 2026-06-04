package com.eventmgmt.repository;

import com.eventmgmt.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);
    boolean existsByEventIdAndAttendeeEmailIgnoreCase(String eventId, String email);
}
