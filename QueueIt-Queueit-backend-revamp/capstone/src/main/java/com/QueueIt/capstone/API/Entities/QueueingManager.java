package com.QueueIt.capstone.API.Entities;

import com.QueueIt.capstone.API.DTO.FacultyDTO;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Entity
public class QueueingManager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long queueingManagerID;
    @Column(unique = true)
    private Long facultyID;
    private String facultyName;
    private Time timeEnds;
    private Boolean isActive;
    private Long cateringLimit;
    @OneToMany(mappedBy = "queueingManager", cascade = CascadeType.ALL)
    @JsonManagedReference("queueingEntry-manager")
    private List<QueueingEntry> queueingEntries = new ArrayList<>();
    @OneToOne
    @JoinColumn(name = "meetingID")
    @JsonManagedReference
    private Meeting meeting;
    @ManyToMany(mappedBy = "queueingManagers")
    private List<Classroom> cateredClassrooms;
    private LocalDateTime lastActive;

    public QueueingManager() {
    }

    public QueueingManager(Long facultyID, String facultyName) {
        this.facultyID = facultyID;
        this.facultyName = facultyName;
    }

    public void setCateredClassrooms(List<Classroom> cateredClassrooms) {
        this.cateredClassrooms = cateredClassrooms;
    }

    public List<Classroom> getCateredClassrooms() {
        if (cateredClassrooms == null) {
            cateredClassrooms = new ArrayList<>();
        }
        return cateredClassrooms;
    }

    public void setTimeEnds(Time timeEnds) {
        this.timeEnds = timeEnds;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public void setCateringLimit(Long cateringLimit) {
        this.cateringLimit = cateringLimit;
    }

    public Long getQueueingManagerID() {
        return queueingManagerID;
    }

    public Long getFacultyID() {
        return facultyID;
    }

    public Time getTimeEnds() {
        return timeEnds;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public Long getCateringLimit() {
        return cateringLimit;
    }

    public LocalDateTime getLastActive() {
        return lastActive;
    }

    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public int getQueueLength(){
        if (this.queueingEntries == null){
            return 0;
        }
        return this.queueingEntries
                .stream()
                .filter(queueingEntry -> queueingEntry.getMeeting() == null)
                .collect(Collectors.toList()).size();
    }

    public void sortQueueingEntries(){
        this.queueingEntries
                .stream()
                .sorted(Comparator.comparing(QueueingEntry::getDateTimeQueued))
                .collect(Collectors.toList());
    }

    public List<QueueingEntry> getQueueingEntries() {
        if (!queueingEntries.isEmpty()){
            this.sortQueueingEntries();
            List<QueueingEntry> filteredEntries = this.queueingEntries.stream()
                    .filter(queueingEntry -> queueingEntry.getMeeting() == null)
                    .collect(Collectors.toList());
//        System.out.println(filteredEntries.size());
            return filteredEntries;
        }
        return Collections.emptyList();
    }

    public Boolean checkDuplicateEntry(Long teamID){
        return this.queueingEntries
                .stream()
                .filter(queueingEntry -> queueingEntry.getMeeting() == null)
                .anyMatch(queueingEntry -> queueingEntry.getTeamID().equals(teamID));
    }

    public void addQueueingEntry(QueueingEntry queueingEntry){
        queueingEntry.getAttendanceList()
                .stream()
                .forEach(attendance -> {
                    Attendance foo = attendance;
                    foo.setQueueingEntry(queueingEntry);
                });
    }

    public void setQueueingEntryToTending(QueueingEntry queueingEntry, Meeting meeting) {
        this.meeting = meeting;
        queueingEntry.setQueueingManager(null); // Detach from the manager
        this.queueingEntries.remove(queueingEntry);
    }

    public Boolean isQueueingEntryTending(Long teamID){
        if (this.meeting == null){
            return Boolean.FALSE;
        }
        if (this.meeting.getQueueingEntry().getTeamID().equals(teamID)){
            return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

    public void goInactive(){
        this.isActive = Boolean.FALSE;
        this.cateringLimit = null;
        this.timeEnds = null;
        setLastActive(LocalDateTime.now());
        this.cateredClassrooms.clear();
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public String getFacultyName() {
        return facultyName;
    }
}
