package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.TeamInvitation.Status;

import java.util.List;
import java.util.stream.Collectors;

public class TeamInvitationDTO {

    private int invitationId;
    private int teamId;
    private int studentId;
    private String studentName;
    private String groupName;
    private String classDescription;
    private String leaderName;
    private List<String> members;
    private Status status;

    public TeamInvitationDTO() {}

    public TeamInvitationDTO(int invitationId, int teamId, int studentId, String studentName, String groupName,
                             String classDescription, String leaderName, List<String> allMembers, Status status) {
        this.invitationId = invitationId;
        this.teamId = teamId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.groupName = groupName;
        this.classDescription = classDescription;
        this.leaderName = leaderName;
        this.members = allMembers.stream()
                .filter(member -> !member.equalsIgnoreCase(leaderName))
                .collect(Collectors.toList());
        this.status = status;
    }

    public int getInvitationId() {
        return invitationId;
    }

    public void setInvitationId(int invitationId) {
        this.invitationId = invitationId;
    }

    public int getTeamId() {
        return teamId;
    }

    public void setTeamId(int teamId) {
        this.teamId = teamId;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getClassDescription() {
        return classDescription;
    }

    public void setClassDescription(String classDescription) {
        this.classDescription = classDescription;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public List<String> getMembers() {
        return members;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
