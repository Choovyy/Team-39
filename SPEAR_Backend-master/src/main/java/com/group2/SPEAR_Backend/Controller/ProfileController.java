package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.ProfileDTO;
import com.group2.SPEAR_Backend.Service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/*
Endpoints:
GET  /api/profile/{userId}          -> fetch (auto-create if absent)
PUT  /api/profile/{userId}          -> upsert full profile (partial fields allowed)
PATCH /api/profile/{userId}/socials -> update github/facebook only
PUT  /api/profile/{userId}/picture  -> update profile picture only
(legacy) POST /api/profile/update/{userId} retained if needed by old frontend
*/

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/{userId}")
    public ProfileDTO getProfile(@PathVariable Integer userId) {
        return profileService.getProfileByUserId(userId).toDTO();
    }

    @PutMapping("/{userId}")
    public ProfileDTO upsertProfile(@PathVariable Integer userId, @RequestBody ProfileDTO dto) {
        return profileService.saveOrUpdateProfile(userId, dto).toDTO();
    }

    @PatchMapping("/{userId}/socials")
    public ProfileDTO updateSocials(@PathVariable Integer userId,
                                    @RequestBody ProfileDTO dto) {
        return profileService.updateSocials(userId, dto.getGithub(), dto.getFacebook());
    }

    @PutMapping("/{userId}/picture")
    public ProfileDTO updatePicture(@PathVariable Integer userId,
                                    @RequestBody ProfileDTO dto) {
        return profileService.updateProfilePicture(userId, dto.getProfilePicture());
    }

    // Legacy compatibility (optional)
    @PostMapping("/update/{userId}")
    public ProfileDTO legacyUpdate(@PathVariable Integer userId, @RequestBody ProfileDTO dto) {
        return profileService.saveOrUpdateProfile(userId, dto).toDTO();
    }
}