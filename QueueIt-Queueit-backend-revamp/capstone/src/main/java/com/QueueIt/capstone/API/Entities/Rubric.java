package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Rubric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    private String description;

    @OneToMany(mappedBy = "rubric", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Prevent infinite recursion
    private List<Criterion> criteria = new ArrayList<>();

    private Boolean isPrivate;
    private Long userID;
    private String facultyName;
    private boolean isWeighted;

    public Rubric() {}

    public Rubric(String title, String description, List<Criterion> criteria, Boolean isPrivate, Long userID, String facultyName, boolean isWeighted) {
        this.title = title;
        this.description = description;
        this.criteria = criteria;
        this.isPrivate = isPrivate;
        this.userID = userID;
        this.facultyName = facultyName;
        this.isWeighted = isWeighted;
    }

    public Rubric(Long id, String title, String description, List<Criterion> criteria, Boolean isPrivate, Long userID, String facultyName, boolean isWeighted) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.criteria = criteria;
        this.isPrivate = isPrivate;
        this.userID = userID;
        this.facultyName = facultyName;
        this.isWeighted = isWeighted;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public List<Criterion> getCriteria() { return criteria; }
    public Long getUserID() { return userID; }
    public Boolean getIsPrivate(){return isPrivate;}
    public String getFacultyName() {
        return facultyName;
    }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCriteria(List<Criterion> criteria) { this.criteria = criteria; }
    public void setUserID(Long userID) { this.userID = userID; }

    public void setPrivate(Boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public boolean getIsWeighted() {
        return isWeighted;
    }

    public void setWeighted(boolean weighted) {
        isWeighted = weighted;
    }
}
