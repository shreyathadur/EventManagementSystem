package com.eventmgmt.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @Column(length = 2000)
    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Time is required")
    private LocalTime time;

    @NotBlank(message = "Location is required")
    private String location;

    private String category; // e.g., conference, workshop, seminar, networking, meetup

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Integer registeredCount = 0;

    private String banner;

    private Double price = 0.0;

    private String status = "upcoming"; // upcoming, ongoing, completed, cancelled

    @NotBlank(message = "Organizer is required")
    private String organizer;
}
