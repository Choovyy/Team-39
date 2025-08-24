package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.sql.Date;

@Entity
public class Grade {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long gradeID;
    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "meeting_id")
    @JsonBackReference
    private Meeting meeting;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "criterion_id")
    private Criterion criterion;

    private String studentName;
    private float mark;
    private float weightedGrade;

    public Grade() {
    }

    public Grade(Meeting meeting, Criterion criterion, String studentName, float mark, float weightedGrade) {
        this.meeting = meeting;
        this.criterion = criterion;
        this.studentName = studentName;
        this.mark = mark;
        this.weightedGrade = weightedGrade;
    }

    public Grade(Long gradeID, Criterion criterion, String studentName, float mark, float weightedGrade) {
        this.gradeID = gradeID;
        this.criterion = criterion;
        this.studentName = studentName;
        this.mark = mark;
        this.weightedGrade = weightedGrade;
    }

    public Long getGradeID() {
        return gradeID;
    }

    public Meeting getMeeting() {
        return meeting;
    }

    public Criterion getCriterion() {
        return criterion;
    }

    public String getStudentName() {
        return studentName;
    }

    public float getMark() {
        return mark;
    }

    public void setMark(float mark) {
        this.mark = mark;
    }

    public float getWeightedGrade() {
        return weightedGrade;
    }

    public void setWeightedGrade(float weightedGrade) {
        this.weightedGrade = weightedGrade;
    }
}
