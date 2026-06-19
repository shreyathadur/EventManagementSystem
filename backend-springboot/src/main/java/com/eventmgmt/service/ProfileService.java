package com.eventmgmt.service;

import com.eventmgmt.exception.ResourceNotFoundException;
import com.eventmgmt.model.*;
import com.eventmgmt.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final ReviewRepository reviewRepository;

    public UserProfile getProfile(String userId) {
        return profileRepository.findById(userId)
                .orElseGet(() -> createDefaultProfile(userId));
    }

    @Transactional
    public UserProfile updateProfile(String userId, String bio, String department, String phone) {
        UserProfile profile = getProfile(userId);
        if (bio != null) profile.setBio(bio);
        if (department != null) profile.setDepartment(department);
        if (phone != null) profile.setPhone(phone);
        return profileRepository.save(profile);
    }

    @Transactional
    public UserProfile updateProfileImage(String userId, String imageUrl) {
        UserProfile profile = getProfile(userId);
        profile.setProfileImageUrl(imageUrl);
        return profileRepository.save(profile);
    }

    public List<String> calculateBadges(String userId) {
        UserProfile profile = getProfile(userId);
        List<String> badges = new ArrayList<>();

        long registrations = registrationRepository.findByUserId(userId).size();
        long eventsOrganized = eventRepository.findByOrganizerId(userId).size();
        long reviewsGiven = reviewRepository.countByUserId(userId);

        if (registrations >= 5) badges.add("Early Bird");
        if (registrations >= 10) badges.add("Active Attendee");
        if (eventsOrganized >= 5) badges.add("Top Organizer");
        if (reviewsGiven >= 20) badges.add("Review Expert");
        if (registrations >= 1) badges.add("Event Explorer");

        profile.setBadges(badges);
        profile.setTotalEventsAttended((int) registrations);
        profile.setTotalEventsOrganized((int) eventsOrganized);
        profile.setReviewsGiven((int) reviewsGiven);
        profileRepository.save(profile);

        return badges;
    }

    private UserProfile createDefaultProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfile profile = UserProfile.builder()
                .user(user)
                .build();
        return profileRepository.save(profile);
    }
}
