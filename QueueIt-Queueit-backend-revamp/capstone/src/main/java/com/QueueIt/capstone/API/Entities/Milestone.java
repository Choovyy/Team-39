package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneID;
    private String title;
    private boolean isCompleted = false;
    private int heirarchyOrder;
    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Module> modules = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "milestoneset_id", referencedColumnName = "milestoneSetID", nullable = false)
    @JsonBackReference
    private MilestoneSet milestoneSet;
    private LocalDateTime completionDate;
    private int completionPercentage = 0;

    public Milestone() {
    }

    public Milestone(String title, int order, MilestoneSet milestoneSet) {
        this.title = title;
        this.heirarchyOrder = order;
        this.milestoneSet = milestoneSet;
    }

    public Long getMilestoneID() {
        return milestoneID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public int getHeirarchyOrder() {
        return heirarchyOrder;
    }

    public void setHeirarchyOrder(int heirarchyOrder) {
        this.heirarchyOrder = heirarchyOrder;
    }

    public MilestoneSet getMilestoneSet() {
        return milestoneSet;
    }

    public List<Module> getModules() {
        return modules;
    }

    public void setModules(List<Module> modules) {
        this.modules = modules;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public void setMilestoneSet(MilestoneSet milestoneSet) {
        this.milestoneSet = milestoneSet;
    }
}
