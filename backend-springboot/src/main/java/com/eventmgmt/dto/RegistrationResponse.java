package com.eventmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private String id;
    private String eventId;
    private String eventTitle;
    private String userId;
    private String userName;
    private String status;
    private String ticketType;
    private boolean checkedIn;
    private LocalDateTime checkedInAt;
    private LocalDateTime registeredAt;
}
