package com.QueueIt.capstone.API.Entities;

import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meetingID;
    private LocalDateTime start = LocalDateTime.now();
    private LocalDateTime end;
    @OneToMany(mappedBy = "meeting")
    @JsonManagedReference
    private List<Grade> grades;
    @Enumerated(EnumType.STRING)
    private MeetingStatus meetingStatus;
    @OneToOne
    @JoinColumn(name = "queueingEntry_id")
    @JsonManagedReference("entry-meeting")
    private QueueingEntry queueingEntry;
    @OneToOne(mappedBy = "meeting", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH})
    @JsonBackReference
    private QueueingManager queueingManager;
    @Column(columnDefinition = "TEXT")
    private String notedAssignedTasks;
    @Column(columnDefinition = "TEXT")
    private String impedimentsEncountered;

    public Meeting() {
    }

    public Long getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(Long meetingID) {
        this.meetingID = meetingID;
    }

    //constructor for enqueueing a team
    public Meeting(MeetingStatus meetingStatus, QueueingEntry queueingEntry, QueueingManager queueingManager) {
        this.meetingStatus = meetingStatus;
        this.queueingEntry = queueingEntry;
        this.queueingManager = queueingManager;
    }

    //constructor for mentors manually creating appointments via calendar
    public Meeting(LocalDateTime start, LocalDateTime end, MeetingStatus meetingStatus, QueueingEntry queueingEntry, QueueingManager queueingManager) {
        this.start = start;
        this.end = end;
        this.meetingStatus = meetingStatus;
        this.queueingEntry = queueingEntry;
        this.queueingManager = queueingManager;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public List<Grade> getGrades() {
        return grades;
    }

    public MeetingStatus getMeetingStatus() {
        return meetingStatus;
    }

    public QueueingEntry getQueueingEntry() {
        return queueingEntry;
    }

    public QueueingManager getQueueingManager() {
        return queueingManager;
    }

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public void setGrades(List<Grade> grades) {
        this.grades = grades;
    }

    public void setImpedimentsEncountered(String impedimentsEncountered) {
        this.impedimentsEncountered = impedimentsEncountered;
    }

    public void setNotedAssignedTasks(String notedAssignedTasks) {
        this.notedAssignedTasks = notedAssignedTasks;
    }

    public void setMeetingStatus(MeetingStatus meetingStatus) {
        this.meetingStatus = meetingStatus;
    }

    public void setQueueingEntry(QueueingEntry queueingEntry) {
        this.queueingEntry = queueingEntry;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }
}
