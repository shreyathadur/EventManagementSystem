package com.eventmgmt.controller;

import com.eventmgmt.model.Attendee;
import com.eventmgmt.repository.AttendeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendees")
@CrossOrigin(origins = "*")
public class AttendeeController {

    @Autowired
    private AttendeeRepository attendeeRepository;

    @GetMapping
    public List<Attendee> getAllAttendees() {
        return attendeeRepository.findAll();
    }
}
