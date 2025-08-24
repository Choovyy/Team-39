package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class MilestoneSetDTO {
    private Long approverID;
    private Long teamID;
    private String teamName;
    private List<MilestoneDTO> milestones;

    public MilestoneSetDTO(Long approverID, Long teamID, String teamName, List<MilestoneDTO> milestones) {
        this.approverID = approverID;
        this.teamID = teamID;
        this.teamName = teamName;
        this.milestones = milestones;
    }

    public Long getApproverID() {
        return approverID;
    }

    public Long getTeamID() {
        return teamID;
    }

    public String getTeamName() {
        return teamName;
    }

    public List<MilestoneDTO> getMilestones() {
        return milestones;
    }
}
