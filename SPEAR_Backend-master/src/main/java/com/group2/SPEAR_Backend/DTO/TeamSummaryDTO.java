package com.group2.SPEAR_Backend.DTO;

public class TeamSummaryDTO {
    private int teamId;
    private String teamName;

    public TeamSummaryDTO(int teamId, String teamName) {
        this.teamId = teamId;
        this.teamName = teamName;
    }

    public int getTeamId() { return teamId; }
    public String getTeamName() { return teamName; }
}
