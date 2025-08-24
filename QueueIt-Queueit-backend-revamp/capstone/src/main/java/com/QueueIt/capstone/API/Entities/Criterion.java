package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Criterion {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long criterionID;
    @ManyToOne
    @JoinColumn(name = "rubric_id", nullable = false)
    @JsonBackReference
    private Rubric rubric;
    private String title;
    @Lob
    private String description;
    @OneToMany(mappedBy = "criterion")
    private List<Grade> grade;
    private float weight;

    public Criterion() {
    }



    public Criterion(Rubric rubric, String title, String description, float weight) {
        this.rubric = rubric;
        this.title = title;
        this.description = description;
        this.weight = weight;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCriterionID() {
        return criterionID;
    }

    public Rubric getRubric() {
        return rubric;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public float getWeight() {
        return weight;
    }
}
