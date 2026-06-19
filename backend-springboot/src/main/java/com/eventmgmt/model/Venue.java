package com.eventmgmt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "venues")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String type;

    private String location;

    @Column(length = 1000)
    private String amenities;

    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "map_image_url", length = 500)
    private String mapImageUrl;

    @Column(name = "accessibility_info", length = 500)
    private String accessibilityInfo;

    @Column(name = "parking_capacity")
    private Integer parkingCapacity;

    @Column(name = "has_wifi")
    @Builder.Default
    private Boolean hasWifi = false;

    @Column(name = "has_audio_visual")
    @Builder.Default
    private Boolean hasAudioVisual = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
