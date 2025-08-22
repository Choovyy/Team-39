package com.group2.SPEAR_Backend.DTO;

import java.util.ArrayList;
import java.util.List;

public class TeamProjectDTO {
    private int teamId;
    private String teamName;
    private int projectId;
    private String projectName;
    private String projectDescription;
    private String projectStatus;
    private String projectRating;
    private List<Integer> memberIds;
    private List<String> memberNames;

    public TeamProjectDTO(int teamId, String teamName, int projectId, String projectName,
                          String projectDescription, String projectStatus, String projectRating,
                          List<Integer> memberIds, List<String> memberNames) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.projectDescription = projectDescription;
        this.projectStatus = projectStatus;
        this.projectRating = projectRating;
        this.memberIds = (memberIds != null) ? memberIds : new ArrayList<>();
        this.memberNames = (memberNames != null) ? memberNames : new ArrayList<>();
    }

    public int getTeamId() { return teamId; }
    public String getTeamName() { return teamName; }
    public int getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public String getProjectDescription() { return projectDescription; }
    public String getProjectStatus() { return projectStatus; }
    public String getProjectRating() { return projectRating; }
    public List<Integer> getMemberIds() {
        return memberIds;
    }
    public void setMemberIds(List<Integer> memberIds) {
        this.memberIds = memberIds;
    }
    public List<String> getMemberNames() {
        return memberNames;
    }
    public void setMemberNames(List<String> memberNames) {
        this.memberNames = memberNames;
    }
}