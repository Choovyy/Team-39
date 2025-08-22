package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "projectProposals")
public class ProjectProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int pid;

    @Column(name = "projectName")
    private String projectName;

    @Column(name = "description")
    private String description;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.PENDING;

    private String reason;
    private String ratings;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "proposed_by", referencedColumnName = "uid")
    private User proposedBy;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "class_proposal", referencedColumnName = "cid")
    private Classes classProposal;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "team_project", referencedColumnName = "tid", nullable = true)
    private Team teamProject;

    public ProjectProposal() {}

    public ProjectProposal(String projectName, String description, User proposedBy, Classes classProposal, Team teamProject) {
        this.projectName = projectName;
        this.description = description;
        this.proposedBy = proposedBy;
        this.classProposal = classProposal;
        this.teamProject = teamProject;
        this.status = ProjectStatus.PENDING;
        this.isDeleted = false;
    }

    public int getPid() {
        return pid;
    }

    public void setPid(int pid) {
        this.pid = pid;
    }

    public User getProposedBy() {
        return proposedBy;
    }

    public void setProposedBy(User proposedBy) {
        this.proposedBy = proposedBy;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Classes getClassProposal() {
        return classProposal;
    }

    public void setClassProposal(Classes classProposal) {
        this.classProposal = classProposal;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public Boolean getDeleted() {
        return isDeleted;
    }

    public String getRatings() {
        return ratings;
    }

    public void setRatings(String ratings) {
        this.ratings = ratings;
    }

    public Team getTeamProject() {
        return teamProject;
    }

    public void setTeamProject(Team teamProject) {
        this.teamProject = teamProject;
    }
}