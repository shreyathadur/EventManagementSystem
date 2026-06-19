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
public class EventRequest {
    private String title;
    private String description;
    private EventCategory category;
    private LocalDate date;
    private LocalTime time;
    private String venue;
    private Integer maxAttendees;
    private LocalDate registrationDeadline;
    private String imageUrl;
    private EventStatus status;
}
