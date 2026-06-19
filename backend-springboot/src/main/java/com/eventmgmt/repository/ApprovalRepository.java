package com.eventmgmt.repository;

import com.eventmgmt.model.Approval;
import com.eventmgmt.model.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, String> {
    List<Approval> findByStatus(ApprovalStatus status);
    Optional<Approval> findByEventId(String eventId);
    List<Approval> findByFacultyId(String facultyId);
}
