package com.eventmgmt.config;

import com.eventmgmt.model.Role;
import com.eventmgmt.model.User;
import com.eventmgmt.repository.UserRepository;
import com.eventmgmt.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DatabaseSchemaInitializationTest {

    private UserRepository userRepository;
    private VenueRepository venueRepository;
    private PasswordEncoder passwordEncoder;
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        venueRepository = mock(VenueRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);

        when(passwordEncoder.encode(anyString())).thenReturn("hashedSecretPassword");

        dataInitializer = new DataInitializer(userRepository, venueRepository, passwordEncoder);
        ReflectionTestUtils.setField(dataInitializer, "adminEmail", "admin@university.edu");
        ReflectionTestUtils.setField(dataInitializer, "adminPassword", "Admin@123");
        ReflectionTestUtils.setField(dataInitializer, "seedEnabled", true);
    }

    @Test
    @DisplayName("schema.sql should exist on classpath and define essential tables")
    void schemaSqlShouldContainRequiredTables() throws IOException {
        ClassPathResource resource = new ClassPathResource("schema.sql");
        assertTrue(resource.exists(), "schema.sql must exist on the classpath for version-controlled migration");

        String sql = resource.getContentAsString(StandardCharsets.UTF_8);

        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS users"), "schema.sql must define users table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS user_profiles"), "schema.sql must define user_profiles table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS events"), "schema.sql must define events table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS venues"), "schema.sql must define venues table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS registrations"), "schema.sql must define registrations table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS payments"), "schema.sql must define payments table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS reviews"), "schema.sql must define reviews table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS approvals"), "schema.sql must define approvals table");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS audit_logs"), "schema.sql must define audit_logs table");
    }

    @Test
    @DisplayName("DataInitializer should seed default admin when users table does not have the admin")
    void shouldSeedDefaultAdminWhenNotExists() {
        when(userRepository.existsByEmail("admin@university.edu")).thenReturn(false);
        when(venueRepository.count()).thenReturn(0L);

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User seededAdmin = userCaptor.getValue();
        assertEquals("admin@university.edu", seededAdmin.getEmail());
        assertEquals(Role.ROLE_ADMIN, seededAdmin.getRole());
        assertEquals("hashedSecretPassword", seededAdmin.getPassword());
        assertTrue(seededAdmin.isEnabled());
        assertTrue(seededAdmin.isVerified());

        verify(venueRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("DataInitializer should be idempotent and never duplicate or overwrite existing admin or venues")
    void shouldBeIdempotentWhenDataAlreadyExists() {
        when(userRepository.existsByEmail("admin@university.edu")).thenReturn(true);
        when(venueRepository.count()).thenReturn(3L);

        // Run multiple times
        dataInitializer.run();
        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(venueRepository, never()).saveAll(anyList());
    }
}
