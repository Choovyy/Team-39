package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class MilestoneSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneSetID;
    @JsonManagedReference
    @OneToMany(mappedBy = "milestoneSet",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Milestone> milestones = new ArrayList<>();
    @Column(unique = true, nullable = false)
    private Long teamID;
    private String teamName;
    private Long approverID;
    private boolean isApproved;
    private LocalDateTime approvedDate;
    private int completionPercentage = 0;

    public MilestoneSet() {
    }

    public MilestoneSet(String teamName, Long teamID, Long approverID) {
        this.teamID = teamID;
        this.approverID = approverID;
        this.teamName = teamName;
    }

    public Long getMilestoneSetID() {
        return milestoneSetID;
    }

    public Long getTeamID() {
        return teamID;
    }

    public Long getApproverID() {
        return approverID;
    }

    public List<Milestone> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<Milestone> milestones) {
        this.milestones = milestones;
    }

    public boolean isApproved() {
        return isApproved;
    }

    public void setApproved(boolean approved) {
        isApproved = approved;
    }

    public LocalDateTime getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(LocalDateTime approvedDate) {
        this.approvedDate = approvedDate;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public String getTeamName() {
        return teamName;
    }
}
