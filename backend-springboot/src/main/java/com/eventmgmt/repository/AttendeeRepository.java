package com.eventmgmt.repository;

import com.eventmgmt.model.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendeeRepository extends JpaRepository<Attendee, String> {
    Optional<Attendee> findByEmailIgnoreCase(String email);
}
