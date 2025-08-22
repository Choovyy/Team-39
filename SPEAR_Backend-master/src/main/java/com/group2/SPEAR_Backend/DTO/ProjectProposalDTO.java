package com.group2.SPEAR_Backend.DTO;

import java.util.List;

public class ProjectProposalDTO {

    private int pid;
    private String projectName;
    private String description;
    private String status;
    private String reason;
    private int proposedById;
    private Long classId;
    private Integer teamId;
    private Boolean isDeleted;
    private List<FeatureDTO> features;
    private String courseCode;
    private String ratings;
    private String proposedByName;
    private String teamName;

    public ProjectProposalDTO() {}




    // general
    public ProjectProposalDTO(int pid, String projectName, String description, String status, String reason,
                              int proposedById, Long classId, Integer teamId, Boolean isDeleted) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.status = status;
        this.reason = reason;
        this.proposedById = proposedById;
        this.classId = classId;
        this.teamId = teamId;
        this.isDeleted = isDeleted;
    }

    // general with features
    public ProjectProposalDTO(int pid, String projectName, String description, String status, String reason,
                              int proposedById, Long classId, Integer teamId, Boolean isDeleted, List<FeatureDTO> features) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.status = status;
        this.reason = reason;
        this.proposedById = proposedById;
        this.classId = classId;
        this.teamId = teamId;
        this.isDeleted = isDeleted;
        this.features = features;
    }

    // student only
    public ProjectProposalDTO(int pid, String projectName, String description, String status, String reason,
                              int proposedById, Long classId, Integer teamId, List<FeatureDTO> features, String proposedByName) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.status = status;
        this.reason = reason;
        this.proposedById = proposedById;
        this.classId = classId;
        this.teamId = teamId;
        this.features = features;
        this.proposedByName = proposedByName;
    }

    // open project
    public ProjectProposalDTO(int pid, String projectName, String description, List<FeatureDTO> features) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.features = features;
        this.status = "OPEN PROJECT";
    }

    // adviser for reading only
    public ProjectProposalDTO(int pid, String projectName, String description, List<FeatureDTO> features, String proposedByName, String status) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.features = features;
        this.proposedByName = proposedByName;
        this.status = status;
    }


    // team creator
    public ProjectProposalDTO(int pid, String projectName, String description, String status, String reason,
                              int proposedById, Long classId, Integer teamId, List<FeatureDTO> features,
                              String proposedByName, String teamName) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.status = status;
        this.reason = reason;
        this.proposedById = proposedById;
        this.classId = classId;
        this.teamId = teamId;
        this.features = features;
        this.proposedByName = proposedByName;
        this.teamName = teamName;
    }

    // class creator
    public ProjectProposalDTO(int pid, String projectName, String description, List<FeatureDTO> features,
                              String proposedByName, String teamName, String status) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.features = features;
        this.proposedByName = proposedByName;
        this.teamName = teamName;
        this.status = status;
    }

    public ProjectProposalDTO(int pid, String projectName, String description, String status, String reason,
                              int proposedById, Long classId, Integer teamId, List<FeatureDTO> features,
                              String proposedByName, String teamName, String ratings) {
        this.pid = pid;
        this.projectName = projectName;
        this.description = description;
        this.status = status;
        this.reason = reason;
        this.proposedById = proposedById;
        this.classId = classId;
        this.teamId = teamId;
        this.features = features;
        this.proposedByName = proposedByName;
        this.teamName = teamName;
        this.ratings = ratings;
    }


    public int getPid() { return pid; }
    public void setPid(int pid) { this.pid = pid; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public int getProposedById() { return proposedById; }
    public void setProposedById(int proposedById) { this.proposedById = proposedById; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }

    public Boolean getDeleted() { return isDeleted; }
    public void setDeleted(Boolean deleted) { isDeleted = deleted; }

    public List<FeatureDTO> getFeatures() { return features; }
    public void setFeatures(List<FeatureDTO> features) { this.features = features; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getRatings() { return ratings; }
    public void setRatings(String ratings) { this.ratings = ratings; }

    public String getProposedByName() { return proposedByName; }
    public void setProposedByName(String proposedByName) { this.proposedByName = proposedByName; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
}