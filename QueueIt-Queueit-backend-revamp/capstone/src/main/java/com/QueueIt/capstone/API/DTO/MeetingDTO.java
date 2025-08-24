package com.QueueIt.capstone.API.DTO;

import com.QueueIt.capstone.API.Entities.Attendance;
import com.QueueIt.capstone.API.Entities.QueueingEntry;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

public class MeetingDTO {
    private Long meetingID;
    private String notedAssignedTasks;
    private String impedimentsEncountered;
    private LocalDateTime start;
    private LocalDateTime end;
    @JsonIgnore
    private QueueingEntry queueingEntry;
    private List<Attendance> attendanceList;
    private MeetingStatus meetingStatus;
    private Long teamID;
    private String teamName;
    private Long mentorID;
    private String facultyName;
    private Long classroomID;

    public MeetingDTO() {
    }

    //DTO for repository meeting history retrieval for meeting board history
    public MeetingDTO(Long meetingID, String notedAssignedTasks, String impedimentsEncountered, LocalDateTime start, LocalDateTime end, QueueingEntry queueingEntry, MeetingStatus meetingStatus) {
        this.meetingID = meetingID;
        this.notedAssignedTasks = notedAssignedTasks;
        this.impedimentsEncountered = impedimentsEncountered;
        this.start = start;
        this.end = end;
        this.queueingEntry = queueingEntry;
        this.meetingStatus = meetingStatus;
    }

    //DTO for creating appointments via calendar for mentors
    public MeetingDTO(LocalDateTime start, LocalDateTime end, List<Attendance> attendanceList, Long mentorID, Long teamID, String teamName) {
        this.start = start;
        this.end = end;
        this.attendanceList = attendanceList;
        this.mentorID = mentorID;
        this.teamID = teamID;
        this.teamName = teamName;
    }

    //DTO for meeting automation that runs every midnight
    public MeetingDTO(LocalDateTime start, LocalDateTime end, List<Attendance> attendanceList, Long mentorID, Long teamID, String teamName, Long classroomId, String facultyName) {
        this.start = start;
        this.end = end;
        this.attendanceList = attendanceList;
        this.mentorID = mentorID;
        this.teamID = teamID;
        this.teamName = teamName;
        this.classroomID = classroomId;
        this.facultyName = facultyName;
    }

    public MeetingDTO(LocalDateTime start, LocalDateTime end, List<Attendance> attendanceList, Long mentorID, Long teamID, String teamName, String facultyName, Long classroomID) {
        this.start = start;
        this.end = end;
        this.attendanceList = attendanceList;
        this.mentorID = mentorID;
        this.teamID = teamID;
        this.teamName = teamName;
        this.facultyName = facultyName;
        this.classroomID = classroomID;
    }

    //DTO for meeting board
    public MeetingDTO(Long meetingID, String notedAssignedTasks, String impedimentsEncountered, LocalDateTime start, LocalDateTime end, List<Attendance> attendanceList, MeetingStatus meetingStatus) {
        this.meetingID = meetingID;
        this.notedAssignedTasks = notedAssignedTasks;
        this.impedimentsEncountered = impedimentsEncountered;
        this.start = start;
        this.end = end;
        this.attendanceList = attendanceList;
        this.meetingStatus = meetingStatus;
    }

    //for spontaneous meeting in group page Meet Now button
    public MeetingDTO(List<Attendance> attendanceList, String teamName, Long teamID, Long mentorID, String facultyName, Long classroomID) {
        this.attendanceList = attendanceList;
        this.teamName = teamName;
        this.teamID = teamID;
        this.mentorID = mentorID;
        this.facultyName = facultyName;
        this.classroomID = classroomID;
    }

    //Constructor for events
    public MeetingDTO(Long meetingID, LocalDateTime start, LocalDateTime end, String teamName, MeetingStatus meetingStatus) {
        this.meetingID = meetingID;
        this.start = start;
        this.end = end;
        this.teamName = teamName;
        this.meetingStatus = meetingStatus;
    }

    // Getters and Setters (if needed)
    public String getNotedAssignedTasks() {
        return notedAssignedTasks;
    }

    public void setNotedAssignedTasks(String notedAssignedTasks) {
        this.notedAssignedTasks = notedAssignedTasks;
    }

    public String getImpedimentsEncountered() {
        return impedimentsEncountered;
    }

    public void setImpedimentsEncountered(String impedimentsEncountered) {
        this.impedimentsEncountered = impedimentsEncountered;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public QueueingEntry getQueueingEntry() {
        return queueingEntry;
    }

    public void setQueueingEntry(QueueingEntry queueingEntry) {
        this.queueingEntry = queueingEntry;
    }

    public List<Attendance> getAttendanceList() {
        return attendanceList;
    }

    public void setAttendanceList(List<Attendance> attendanceList) {
        this.attendanceList = attendanceList;
    }

    public MeetingStatus getMeetingStatus() {
        return meetingStatus;
    }

    public void setMeetingStatus(MeetingStatus meetingStatus) {
        this.meetingStatus = meetingStatus;
    }

    public Long getTeamID() {
        return teamID;
    }

    public void setTeamID(Long teamID) {
        this.teamID = teamID;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Long getMentorID() {
        return mentorID;
    }

    public void setMentorID(Long mentorID) {
        this.mentorID = mentorID;
    }

    public Long getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(Long meetingID) {
        this.meetingID = meetingID;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public Long getClassroomID() {
        return classroomID;
    }

    public void setClassroomID(Long classroomID) {
        this.classroomID = classroomID;
    }
}