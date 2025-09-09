package com.group2.SPEAR_Backend.Service;


import com.group2.SPEAR_Backend.Model.ProfileEntity;
import com.group2.SPEAR_Backend.DTO.ProfileDTO;
import com.group2.SPEAR_Backend.Model.SurveyEntity;
import com.group2.SPEAR_Backend.Model.TechnicalSkill;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.ProfileRepository;
import com.group2.SPEAR_Backend.Repository.SurveyRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

//import CapstoneConnect.Capstone_1.dto.ProfileDTO;
@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SurveyRepository surveyRepository;


    public ProfileEntity getProfileByUserId(Integer userId) {
        return profileRepository.findByUser_Uid(userId).orElseThrow(() -> new RuntimeException("Profile not found"));
    }

    public ProfileEntity saveOrUpdateProfile(Integer userId, ProfileDTO profileDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Try to find existing profile for this user
        ProfileEntity profileEntity = profileRepository.findByUser_Uid(userId).orElseGet(() -> {
            ProfileEntity newProfile = new ProfileEntity();
            newProfile.setUser(user);
            return newProfile;
        });

        profileEntity.setProfilePicture(profileDTO.getProfilePicture());
        profileEntity.setGithub(profileDTO.getGithub());

        // Update survey or create if missing
        SurveyEntity surveyEntity = profileEntity.getSurvey();
        if (surveyEntity == null) {
            surveyEntity = new SurveyEntity();
        }
        // ✅ Map TechnicalSkillDTO → TechnicalSkill
        if (profileDTO.getTechnicalSkills() != null) {
            List<TechnicalSkill> technicalSkills = profileDTO.getTechnicalSkills().stream()
                    .map(dto -> {
                        TechnicalSkill skill = new TechnicalSkill();
                        skill.setSkill(dto.getSkill());
                        skill.setMasteryLevel(dto.getMasteryLevel());
                        return skill;
                    })
                    .toList();
            surveyEntity.setTechnicalSkills(technicalSkills);
        }
        surveyEntity.setProjectInterests(profileDTO.getProjectInterests());
        surveyEntity.setPreferredRoles(profileDTO.getPreferredRoles());

        SurveyEntity savedSurvey = surveyRepository.save(surveyEntity);
        profileEntity.setSurvey(savedSurvey);

        return profileRepository.save(profileEntity);
    }

    public ProfileDTO updateProfilePicture(Integer profileId, String profilePictureUrl) {
        ProfileEntity profile = profileRepository.findByUser_Uid(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found with id: " + profileId));

        profile.setProfilePicture(profilePictureUrl);
        ProfileEntity savedProfile = profileRepository.save(profile);

        return savedProfile.toDTO();
    }

}
