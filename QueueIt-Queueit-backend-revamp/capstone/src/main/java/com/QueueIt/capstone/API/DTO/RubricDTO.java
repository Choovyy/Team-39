package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class RubricDTO {
    private String title;
    private String description;
    private List<CriterionDTO> criteria;
    private Boolean isPrivate;
    private Long userID;
    private String facultyName;
    private boolean isWeighted;

    public RubricDTO() {}


    public RubricDTO(String title, String description, List<CriterionDTO> criteria, Boolean isPrivate, Long userID, String facultyName, boolean isWeighted) {
        this.title = title;
        this.description = description;
        this.criteria = criteria;
        this.isPrivate = isPrivate;
        this.userID = userID;
        this.facultyName = facultyName;
        this.isWeighted = isWeighted;
    }

    // Getters
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public List<CriterionDTO> getCriteria() { return criteria; }
    public Boolean getIsPrivate() { return isPrivate; }  // ✅ Ensure this getter exists
    public Long getUserID() { return userID; }

    public Boolean getPrivate() {
        return isPrivate;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public boolean getIsWeighted() {
        return isWeighted;
    }
}
