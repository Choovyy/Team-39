package com.group2.SPEAR_Backend.Model;


import com.group2.SPEAR_Backend.DTO.SurveyDTO;
import com.group2.SPEAR_Backend.DTO.TechnicalSkillDTO;
import jakarta.persistence.*;

import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "surveys")
public class SurveyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "survey_technical_skills", joinColumns = @JoinColumn(name = "survey_id"))
    @Column(name = "technical_skill")
    private List<TechnicalSkill> technicalSkills;

    @ElementCollection
    @CollectionTable(name = "survey_project_interests", joinColumns = @JoinColumn(name = "survey_id"))
    @Column(name = "project_interest")
    private List<String> projectInterests;    @ElementCollection
    @CollectionTable(name = "survey_preferred_roles", joinColumns = @JoinColumn(name = "survey_id"))
    @Column(name = "preferred_role")
    private List<String> preferredRoles;

    @Column(name = "personality")
    private String personality;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<TechnicalSkill> getTechnicalSkills() {
        return technicalSkills;
    }

    public void setTechnicalSkills(List<TechnicalSkill> technicalSkills) {
        this.technicalSkills = technicalSkills;
    }

    public List<String> getProjectInterests() {
        return projectInterests;
    }

    public void setProjectInterests(List<String> projectInterests) {
        this.projectInterests = projectInterests;
    }

    public List<String> getPreferredRoles() {
        return preferredRoles;
    }    public void setPreferredRoles(List<String> preferredRoles) {
        this.preferredRoles = preferredRoles;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }    // SurveyDTO conversion
    public SurveyDTO toDTO() {
        SurveyDTO surveyDTO = new SurveyDTO();
        surveyDTO.setId(this.id);

        // Map entity skills -> DTO skills
        if (this.technicalSkills != null) {
            List<TechnicalSkillDTO> skillDTOs = this.technicalSkills.stream()
                    .map(skill -> new TechnicalSkillDTO(skill.getSkill(), skill.getMasteryLevel()))
                    .toList();
            surveyDTO.setTechnicalSkills(skillDTOs);
        }
        surveyDTO.setProjectInterests(this.projectInterests);
        surveyDTO.setPreferredRoles(this.preferredRoles);
        surveyDTO.setPersonality(this.personality);
        return surveyDTO;
    }


}
