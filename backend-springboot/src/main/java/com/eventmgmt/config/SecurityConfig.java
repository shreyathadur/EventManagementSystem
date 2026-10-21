package com.eventmgmt.config;

import com.eventmgmt.repository.UserRepository;
import com.eventmgmt.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserRepository userRepository;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:3001}")
    private String allowedOrigins;

    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthFilter, UserRepository userRepository) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // ─── Public root endpoints ───────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/", "/api", "/api/").permitAll()
                // ─── Auth (register / login) ─────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/verify-email").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/resend-verification").permitAll()
                // ─── Public read-only endpoints ───────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/event/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/calendar/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/search/similar/**").permitAll()
                // ─── Health / Docs / WebSocket ────────────────────────────────────
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // ─── CORS preflight ───────────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // ─── Organizer / Admin write endpoints ────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/events").hasAnyAuthority("ROLE_ORGANIZER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyAuthority("ROLE_ORGANIZER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasAnyAuthority("ROLE_ORGANIZER", "ROLE_ADMIN")
                .requestMatchers("/api/organizer/**").hasAuthority("ROLE_ORGANIZER")
                .requestMatchers("/api/student/**").hasAuthority("ROLE_STUDENT")
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = new java.util.ArrayList<>();
        for (String o : allowedOrigins.split(",")) {
            String trimmed = o.trim();
            if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                origins.add(trimmed);
            }
        }
        if (!origins.contains("https://*.onrender.com")) {
            origins.add("https://*.onrender.com");
        }
        if (!origins.contains("https://ems-frontend-zkqq.onrender.com")) {
            origins.add("https://ems-frontend-zkqq.onrender.com");
        }

        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
