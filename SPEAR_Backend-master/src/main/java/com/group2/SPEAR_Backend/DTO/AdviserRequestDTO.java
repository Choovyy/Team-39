package com.group2.SPEAR_Backend.DTO;

import java.util.List;

public class AdviserRequestDTO {

    private Long requestId;

    private int teamId;
    private String groupName;
    private int leaderId;
    private String leaderName;
    private List<Integer> memberIds;
    private List<String> memberNames;
    private int adviserId;
    private String adviserName;
    private int scheduleId;
    private String scheduleDay;
    private String scheduleTime;
    private String status;
    private String reason;
    private String classDescription;
    private String classCreator;

    public AdviserRequestDTO() {}

    public AdviserRequestDTO(Long requestId, int teamId, String groupName,
                             int leaderId, String leaderName,
                             List<Integer> memberIds, List<String> memberNames,
                             int adviserId, String adviserName,
                             int scheduleId, String scheduleDay, String scheduleTime,
                             String status, String reason, String classDescription, String classCreator) {
        this.requestId = requestId;
        this.teamId = teamId;
        this.groupName = groupName;
        this.leaderId = leaderId;
        this.leaderName = leaderName;
        this.memberIds = memberIds;
        this.memberNames = memberNames;
        this.adviserId = adviserId;
        this.adviserName = adviserName;
        this.scheduleId = scheduleId;
        this.scheduleDay = scheduleDay;
        this.scheduleTime = scheduleTime;
        this.status = status;
        this.reason = reason;
        this.classDescription = classDescription;
        this.classCreator = classCreator;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public int getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(int leaderId) {
        this.leaderId = leaderId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

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

    public int getAdviserId() {
        return adviserId;
    }

    public void setAdviserId(int adviserId) {
        this.adviserId = adviserId;
    }

    public String getAdviserName() {
        return adviserName;
    }

    public void setAdviserName(String adviserName) {
        this.adviserName = adviserName;
    }

    public int getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(int scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getScheduleDay() {
        return scheduleDay;
    }

    public void setScheduleDay(String scheduleDay) {
        this.scheduleDay = scheduleDay;
    }

    public String getScheduleTime() {
        return scheduleTime;
    }

    public void setScheduleTime(String scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getClassDescription() {
        return classDescription;
    }

    public void setClassDescription(String classDescription) {
        this.classDescription = classDescription;
    }

    public String getClassCreator() {
        return classCreator;
    }

    public void setClassCreator(String classCreator) {
        this.classCreator = classCreator;
    }
}
