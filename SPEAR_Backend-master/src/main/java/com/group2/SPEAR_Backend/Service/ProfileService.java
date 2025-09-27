package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.ProfileDTO;
import com.group2.SPEAR_Backend.Model.ProfileEntity;
import com.group2.SPEAR_Backend.Model.SurveyEntity;
import com.group2.SPEAR_Backend.Model.TechnicalSkill;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.ProfileRepository;
import com.group2.SPEAR_Backend.Repository.SurveyRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfileService {

    @Autowired private ProfileRepository profileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SurveyRepository surveyRepository;

    @Transactional(readOnly = true)
    public ProfileEntity getOrCreateProfileByUserId(Integer userId) {
        return profileRepository.findByUser_Uid(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            ProfileEntity p = new ProfileEntity();
            p.setUser(user);
            return profileRepository.save(p);
        });
    }

    @Transactional(readOnly = true)
    public ProfileEntity getProfileByUserId(Integer userId) {
        return getOrCreateProfileByUserId(userId);
    }

    @Transactional
    public ProfileEntity saveOrUpdateProfile(Integer userId, ProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        ProfileEntity profile = profileRepository.findByUser_Uid(userId).orElseGet(() -> {
            ProfileEntity np = new ProfileEntity();
            np.setUser(user);
            return np;
        });

        // Upsert simple fields (only overwrite when non-null)
        if (dto.getProfilePicture() != null) profile.setProfilePicture(dto.getProfilePicture());
        if (dto.getGithub() != null)          profile.setGithub(dto.getGithub());
        if (dto.getFacebook() != null)        profile.setFacebook(dto.getFacebook());

        // Survey mapping (upsert)
        SurveyEntity survey = profile.getSurvey();
        if (survey == null) survey = new SurveyEntity();

        if (dto.getTechnicalSkills() != null) {
            List<TechnicalSkill> technicalSkills = dto.getTechnicalSkills().stream()
                    .map(s -> {
                        TechnicalSkill ts = new TechnicalSkill();
                        ts.setSkill(s.getSkill());
                        ts.setMasteryLevel(s.getMasteryLevel());
                        return ts;
                    }).toList();
            survey.setTechnicalSkills(technicalSkills);
        }
        if (dto.getProjectInterests() != null) survey.setProjectInterests(dto.getProjectInterests());
        if (dto.getPreferredRoles() != null)    survey.setPreferredRoles(dto.getPreferredRoles());
        if (dto.getPersonality() != null)       survey.setPersonality(dto.getPersonality());

        survey = surveyRepository.save(survey);
        profile.setSurvey(survey);

        return profileRepository.save(profile);
    }

    @Transactional
    public ProfileDTO updateProfilePicture(Integer userId, String profilePictureUrl) {
        if (profilePictureUrl == null || profilePictureUrl.isBlank())
            throw new RuntimeException("profilePictureUrl cannot be blank");
        ProfileEntity profile = getOrCreateProfileByUserId(userId);
        profile.setProfilePicture(profilePictureUrl);
        return profileRepository.save(profile).toDTO();
    }

    @Transactional
    public ProfileDTO updateSocials(Integer userId, String github, String facebook) {
        ProfileEntity profile = getOrCreateProfileByUserId(userId);
        if (github != null)   profile.setGithub(github);
        if (facebook != null) profile.setFacebook(facebook);
        return profileRepository.save(profile).toDTO();
    }
}