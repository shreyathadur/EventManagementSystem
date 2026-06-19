package com.eventmgmt.service;

import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.ApprovalRepository;
import com.eventmgmt.repository.EventRepository;
import com.eventmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public Approval requestApproval(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (event.getStatus() != EventStatus.PENDING) {
            throw new RuntimeException("Event is not in PENDING status");
        }

        Approval approval = Approval.builder()
                .event(event)
                .status(ApprovalStatus.PENDING)
                .build();

        return approvalRepository.save(approval);
    }

    public List<Approval> getPendingApprovals() {
        return approvalRepository.findByStatus(ApprovalStatus.PENDING);
    }

    @Transactional
    public Approval approveEvent(String approvalId, String facultyId, String comments) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setFaculty(faculty);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());

        Event event = approval.getEvent();
        event.setStatus(EventStatus.APPROVED);
        eventRepository.save(event);

        return approvalRepository.save(approval);
    }

    @Transactional
    public Approval rejectEvent(String approvalId, String facultyId, String comments) {
        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval not found"));

        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setFaculty(faculty);
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());

        Event event = approval.getEvent();
        event.setStatus(EventStatus.REJECTED);
        eventRepository.save(event);

        return approvalRepository.save(approval);
    }
}
