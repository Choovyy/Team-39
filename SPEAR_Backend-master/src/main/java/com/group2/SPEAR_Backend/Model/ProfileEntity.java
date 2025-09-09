package com.group2.SPEAR_Backend.Model;


import com.group2.SPEAR_Backend.DTO.ProfileDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.group2.SPEAR_Backend.DTO.TechnicalSkillDTO;
import jakarta.persistence.*;

import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "profiles")
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "github")
    private String github;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "uid")
    @JsonBackReference(value = "profile-user")
    private User user;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "survey_id", referencedColumnName = "id")
    @JsonBackReference
    private SurveyEntity survey;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SurveyEntity getSurvey() {
        return survey;
    }

    public void setSurvey(SurveyEntity survey) {
        this.survey = survey;
    }

    // ProfileDTO conversion

    // ProfileDTO conversion
    public ProfileDTO toDTO() {
        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setId(this.id);
        profileDTO.setProfilePicture(this.profilePicture);
        profileDTO.setGithub(this.github);

        // Set user info
        if (this.user != null) {
            profileDTO.setUserId(this.user.getUid());
            profileDTO.setName(this.user.getFirstname());
            profileDTO.setEmail(this.user.getEmail());
        }

        // Map survey info
        if (this.survey != null) {
            // Map technical skills to DTOs
            if (this.survey.getTechnicalSkills() != null) {
                List<TechnicalSkillDTO> skillDTOs = this.survey.getTechnicalSkills().stream()
                        .map(skill -> new TechnicalSkillDTO(skill.getSkill(), skill.getMasteryLevel()))
                        .toList();
                profileDTO.setTechnicalSkills(skillDTOs);
            }


            profileDTO.setProjectInterests(this.survey.getProjectInterests());
            profileDTO.setPreferredRoles(this.survey.getPreferredRoles());
            profileDTO.setPersonality(this.survey.getPersonality());
        }

        return profileDTO;
    }
}