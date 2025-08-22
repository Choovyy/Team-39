package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.TeamRecuitment.Status;

public class TeamRecuitmentDTO {

    private int trid;
    private int teamId;
    private int studentId;
    private String studentName;
    private String role;
    private String reason;
    private Status status;
    private String groupName;
    private String classDescription;
    private String leaderName;


    public TeamRecuitmentDTO() {}

    //general purposes
    public TeamRecuitmentDTO(int trid, int teamId, int studentId, String studentName, String role, String reason, Status status) {
        this.trid = trid;
        this.teamId = teamId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.role = role;
        this.reason = reason;
        this.status = status;
    }

    //leader only
    public TeamRecuitmentDTO(int trid, int teamId, int studentId, String studentName,
                             String groupName, String classDescription, String role,
                             String reason, Status status) {
        this.trid = trid;
        this.teamId = teamId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.groupName = groupName;
        this.classDescription = classDescription;
        this.role = role;
        this.reason = reason;
        this.status = status;
    }

    //for applicant only
    public TeamRecuitmentDTO(int trid, int teamId, int studentId, String studentName, String groupName,
                            String classDescription, String leaderName, String role, String reason, Status status) {
        this.trid = trid;
        this.teamId = teamId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.groupName = groupName;
        this.classDescription = classDescription;
        this.leaderName = leaderName;
        this.role = role;
        this.reason = reason;
        this.status = status;
    }


    public int getTrid() {
        return trid;
    }

    public void setTrid(int trid) {
        this.trid = trid;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
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
}
