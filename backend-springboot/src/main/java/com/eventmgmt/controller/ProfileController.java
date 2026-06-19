package com.eventmgmt.controller;

import com.eventmgmt.model.User;
import com.eventmgmt.model.UserProfile;
import com.eventmgmt.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile and badges management")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user profile")
    public ResponseEntity<UserProfile> getProfile(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    @Operation(summary = "Update current user's profile")
    public ResponseEntity<UserProfile> updateProfile(@RequestBody Map<String, String> body,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.updateProfile(
                user.getId(), body.get("bio"), body.get("department"), body.get("phone")));
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Update profile image URL")
    public ResponseEntity<UserProfile> uploadImage(@RequestBody Map<String, String> body,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.updateProfileImage(user.getId(), body.get("imageUrl")));
    }

    @GetMapping("/badges/{userId}")
    @Operation(summary = "Get user badges")
    public ResponseEntity<List<String>> getBadges(@PathVariable String userId) {
        return ResponseEntity.ok(profileService.calculateBadges(userId));
    }
}
