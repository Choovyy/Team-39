package com.group2.SPEAR_Backend.DTO;

public class StatusDTO {

    private String groupName;
    private String leaderName;
    private String recruitmentMessage;

    public StatusDTO() {
    }

    public StatusDTO(String groupName, String leaderName, String recruitmentMessage) {
        this.groupName = groupName;
        this.leaderName = leaderName;
        this.recruitmentMessage = recruitmentMessage;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public String getRecruitmentMessage() {
        return recruitmentMessage;
    }

    public void setRecruitmentMessage(String recruitmentMessage) {
        this.recruitmentMessage = recruitmentMessage;
    }
}
