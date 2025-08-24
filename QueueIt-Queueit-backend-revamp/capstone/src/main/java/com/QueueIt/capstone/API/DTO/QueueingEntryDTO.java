package com.QueueIt.capstone.API.DTO;


import com.QueueIt.capstone.API.Entities.Attendance;

import java.util.List;

public class QueueingEntryDTO {
    private Long queueingEntryID;
    private Long facultyID;
    private Long teamID;
    private String teamName;
    private String classReference;
    private Long classroomID;
    private List<Attendance> attendanceList;

    public QueueingEntryDTO() {
    }

    //DTO for Enqueue
    public QueueingEntryDTO(Long facultyID, Long teamID, String teamName, String classReference, Long classroomID, List<Attendance> attendanceList) {
        this.facultyID = facultyID;
        this.teamID = teamID;
        this.teamName = teamName;
        this.classReference = classReference;
        this.classroomID = classroomID;
        this.attendanceList = attendanceList;
    }

    //DTO for Dequeue
    //DTO for Admit Queueing Entry
    public QueueingEntryDTO(Long queueingEntryID, Long facultyID) {
        this.queueingEntryID = queueingEntryID;
    }

    public String getClassReference() {
        return classReference;
    }

    public Long getFacultyID() {
        return facultyID;
    }

    public Long getTeamID() {
        return teamID;
    }

    public String getTeamName() {
        return teamName;
    }

    public List<Attendance> getAttendanceList() {
        return attendanceList;
    }

    public Long getQueueingEntryID() {
        return queueingEntryID;
    }

    public void setQueueingEntryID(Long queueingEntryID) {
        this.queueingEntryID = queueingEntryID;
    }

    public void setFacultyID(Long facultyID) {
        this.facultyID = facultyID;
    }

    public void setTeamID(Long teamID) {
        this.teamID = teamID;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setClassReference(String classReference) {
        this.classReference = classReference;
    }

    public void setAttendanceList(List<Attendance> attendanceList) {
        this.attendanceList = attendanceList;
    }

    public Long getClassroomID() {
        return classroomID;
    }

    public void setClassroomID(Long classroomID) {
        this.classroomID = classroomID;
    }
}
