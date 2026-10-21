package com.eventmgmt.config;

import com.eventmgmt.model.Role;
import com.eventmgmt.model.User;
import com.eventmgmt.model.Venue;
import com.eventmgmt.repository.UserRepository;
import com.eventmgmt.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Idempotent data initializer that ensures essential reference data (initial admin user,
 * default venues) exists upon application startup.
 *
 * Safe to execute on every application boot: verifies existing records and never duplicates
 * or overwrites existing production data.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email:admin@university.edu}")
    private String adminEmail;

    @Value("${app.seed.admin-password:Admin@123}")
    private String adminPassword;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Data initialization is disabled via app.seed.enabled=false");
            return;
        }

        seedAdminUser();
        seedDefaultVenues();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ROLE_ADMIN)
                    .organizationName("University Administration")
                    .department("Information Technology")
                    .enabled(true)
                    .verified(true)
                    .build();

            userRepository.save(admin);
            log.info("Initialized default administrator account: {}", adminEmail);
        } else {
            log.debug("Administrator account already exists: {}", adminEmail);
        }
    }

    private void seedDefaultVenues() {
        if (venueRepository.count() == 0) {
            List<Venue> defaultVenues = List.of(
                    Venue.builder()
                            .name("Main Campus Auditorium")
                            .capacity(500)
                            .type("Auditorium")
                            .location("Building A, Ground Floor")
                            .amenities("Stage, Projector, Sound System, Lighting, Air Conditioning")
                            .isAvailable(true)
                            .hasWifi(true)
                            .hasAudioVisual(true)
                            .parkingCapacity(100)
                            .build(),
                    Venue.builder()
                            .name("Science Complex Lecture Hall")
                            .capacity(200)
                            .type("Lecture Hall")
                            .location("Science Block, 2nd Floor, Room 204")
                            .amenities("Dual Displays, Tiered Seating, Whiteboards, Podium Mic")
                            .isAvailable(true)
                            .hasWifi(true)
                            .hasAudioVisual(true)
                            .parkingCapacity(50)
                            .build(),
                    Venue.builder()
                            .name("Student Union Multipurpose Hall")
                            .capacity(150)
                            .type("Multipurpose")
                            .location("Student Center, 1st Floor")
                            .amenities("Flexible Seating, PA System, Projector Screen")
                            .isAvailable(true)
                            .hasWifi(true)
                            .hasAudioVisual(true)
                            .parkingCapacity(30)
                            .build()
            );

            venueRepository.saveAll(defaultVenues);
            log.info("Initialized {} default campus venues", defaultVenues.size());
        }
    }
}
