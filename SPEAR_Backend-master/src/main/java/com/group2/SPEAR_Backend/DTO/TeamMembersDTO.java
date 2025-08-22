package com.group2.SPEAR_Backend.DTO;

import java.util.List;

public class TeamMembersDTO {
    private int teamId;
    private String teamName;
    private List<MemberDTO> members;

    public TeamMembersDTO(int teamId, String teamName, List<MemberDTO> members) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.members = members;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public List<MemberDTO> getMembers() {
        return members;
    }

    public void setMembers(List<MemberDTO> members) {
        this.members = members;
    }
}