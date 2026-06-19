package com.eventmgmt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private String userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(length = 1000)
    private String bio;

    private String department;

    @Column(length = 20)
    private String phone;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_badges", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "badge_name")
    @Builder.Default
    private List<String> badges = new ArrayList<>();

    @Column(name = "total_events_attended")
    @Builder.Default
    private Integer totalEventsAttended = 0;

    @Column(name = "total_events_organized")
    @Builder.Default
    private Integer totalEventsOrganized = 0;

    @Column(name = "reviews_given")
    @Builder.Default
    private Integer reviewsGiven = 0;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;
}
