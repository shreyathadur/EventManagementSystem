package com.eventmgmt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private EventCategory category;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private LocalTime time;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String venue;
    
    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;
    
    private Integer maxAttendees;
    
    @Builder.Default
    private Integer currentAttendees = 0;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.PENDING;
    
    private LocalDate registrationDeadline;
    
    @Column(length = 1000)
    private String imageUrl;
    
    @Builder.Default
    private Double ticketPrice = 0.0;
    
    @Builder.Default
    private Boolean isPaid = false;
    
    @Builder.Default
    private Double averageRating = 0.0;
    
    @Builder.Default
    private Integer reviewCount = 0;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Registration> registrations;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Review> reviews;
}
