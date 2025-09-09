package com.group2.SPEAR_Backend.DTO;

import java.util.List;

public class ProfileDTO {

    private Long id; // Profile ID
    private Integer userId; // maps to User.uid
    private String firstname;
    private String lastname;
    private String name; // ✅ convenience field (firstname + lastname)
    private String email;
    private String profilePicture;
    private List<TechnicalSkillDTO> technicalSkills;
    private List<String> projectInterests;
    private List<String> preferredRoles;
    private String personality;
    private String github;

    public ProfileDTO() {}

    public ProfileDTO(Long id, Integer userId, String firstname, String lastname, String name,
                      String email, String profilePicture, List<TechnicalSkillDTO> technicalSkills,
                      List<String> projectInterests, List<String> preferredRoles,
                      String personality, String github) {
        this.id = id;
        this.userId = userId;
        this.firstname = firstname;
        this.lastname = lastname;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.technicalSkills = technicalSkills;
        this.projectInterests = projectInterests;
        this.preferredRoles = preferredRoles;
        this.personality = personality;
        this.github = github;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public List<TechnicalSkillDTO> getTechnicalSkills() { return technicalSkills; }
    public void setTechnicalSkills(List<TechnicalSkillDTO> technicalSkills) { this.technicalSkills = technicalSkills; }

    public List<String> getProjectInterests() { return projectInterests; }
    public void setProjectInterests(List<String> projectInterests) { this.projectInterests = projectInterests; }

    public List<String> getPreferredRoles() { return preferredRoles; }
    public void setPreferredRoles(List<String> preferredRoles) { this.preferredRoles = preferredRoles; }

    public String getPersonality() { return personality; }
    public void setPersonality(String personality) { this.personality = personality; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }
}
