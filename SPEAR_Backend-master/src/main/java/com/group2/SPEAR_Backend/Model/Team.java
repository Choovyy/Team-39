package com.group2.SPEAR_Backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int tid;

    @Column(name = "group_name", nullable = false)
    private String groupName;


    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "leader_id", referencedColumnName = "uid")
    private User leader;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "class_id", referencedColumnName = "cid")
    private Classes classRef;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "officialProject", referencedColumnName = "pid")
    private ProjectProposal project;

    @ManyToOne
    @JoinColumn(name = "adviser_id", referencedColumnName = "uid")
    private User adviser;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedid", unique = true)
    private Schedule schedule;


    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    @Column(name = "is_recruitment_open")
    private boolean isRecruitmentOpen;



    public Team() {}

    public Team(ProjectProposal project, User leader, Classes classRef, String groupName, User adviser, Schedule schedule) {
        this.project = project;
        this.leader = leader;
        this.classRef = classRef;
        this.groupName = groupName;
        this.isRecruitmentOpen = true;
        this.adviser = adviser;
        this.schedule = schedule;
    }

    public int getTid() {
        return tid;
    }

    public void setTid(int tid) {
        this.tid = tid;
    }

    public ProjectProposal getProject() {
        return project;
    }

    public void setProject(ProjectProposal project) {
        this.project = project;
    }

    public User getLeader() {
        return leader;
    }

    public void setLeader(User leader) {
        this.leader = leader;
    }

    public Classes getClassRef() {
        return classRef;
    }

    public void setClassRef(Classes classRef) {
        this.classRef = classRef;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Set<User> getMembers() {
        return members;
    }

    public void setMembers(Set<User> members) {
        this.members = members;
    }

    public boolean isRecruitmentOpen() {
        return isRecruitmentOpen;
    }

    public void setRecruitmentOpen(boolean recruitmentOpen) {
        isRecruitmentOpen = recruitmentOpen;
    }

    public User getAdviser() {
        return adviser;
    }

    public void setAdviser(User adviser) {
        this.adviser = adviser;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }
}
