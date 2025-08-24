package com.QueueIt.capstone.API.DTO;

public class LowestEngagementDTO {
    private String teamName;
    private Long meetingCount;

    public LowestEngagementDTO(String teamName, Long averageMeeting) {
        this.teamName = teamName;
        this.meetingCount = averageMeeting;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Long getMeetingCount() {
        return meetingCount;
    }

    public void setMeetingCount(Long meetingCount) {
        this.meetingCount = meetingCount;
    }
}
