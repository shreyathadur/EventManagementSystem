package com.eventmgmt.dto;

import com.eventmgmt.model.EventCategory;
import com.eventmgmt.model.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private String id;
    private String title;
    private String description;
    private EventCategory category;
    private LocalDate date;
    private LocalTime time;
    private String venue;
    private String organizerId;
    private String organizerName;
    private Integer maxAttendees;
    private Integer currentAttendees;
    private EventStatus status;
    private LocalDate registrationDeadline;
    private String imageUrl;
}
