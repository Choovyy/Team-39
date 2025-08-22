package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eid;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_type", nullable = false)
    private EvaluationType evaluationType;

    @Column(name = "availability", nullable = false)
    private String availability;

    @Column(name = "date_open", nullable = false)
    private LocalDate dateOpen;

    @Column(name = "date_close", nullable = false)
    private LocalDate dateClose;

    @Column(name = "period", nullable = false)
    private String period;

    @ManyToOne
    @JoinColumn(name = "class_id", referencedColumnName = "cid", nullable = false)
    private Classes classRef;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Submission> submissions = new HashSet<>();

    public Evaluation() {}

    public Evaluation(EvaluationType evaluationType, String availability, LocalDate dateOpen, LocalDate dateClose,
                      String period, Classes classRef) {
        this.evaluationType = evaluationType;
        this.availability = availability;
        this.dateOpen = dateOpen;
        this.dateClose = dateClose;
        this.period = period;
        this.classRef = classRef;
    }

    public Long getEid() {
        return eid;
    }

    public void setEid(Long eid) {
        this.eid = eid;
    }

    public EvaluationType getEvaluationType() {
        return evaluationType;
    }

    public void setEvaluationType(EvaluationType evaluationType) {
        this.evaluationType = evaluationType;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public LocalDate getDateOpen() {
        return dateOpen;
    }

    public void setDateOpen(LocalDate dateOpen) {
        this.dateOpen = dateOpen;
    }

    public LocalDate getDateClose() {
        return dateClose;
    }

    public void setDateClose(LocalDate dateClose) {
        this.dateClose = dateClose;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public Classes getClassRef() {
        return classRef;
    }

    public void setClassRef(Classes classRef) {
        this.classRef = classRef;
    }

    public Set<Submission> getSubmissions() {
        return submissions;
    }

    public void setSubmissions(Set<Submission> submissions) {
        this.submissions = submissions;
    }
}