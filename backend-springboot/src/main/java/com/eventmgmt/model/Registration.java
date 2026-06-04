package com.eventmgmt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "event_id")
    private String eventId;

    @Column(name = "attendee_id")
    private String attendeeId;

    private String attendeeName;

    private String attendeeEmail;

    private LocalDateTime registeredAt = LocalDateTime.now();

    private String status = "confirmed"; // confirmed, pending, cancelled

    @Column(name = "ticket_type")
    private String ticketType = "standard"; // standard, vip, early_bird
}
