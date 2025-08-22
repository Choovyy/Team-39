//package com.group2.SPEAR_Backend.Model;
//
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import jakarta.persistence.*;
//
//@Entity
//@Table(name = "results")
//public class Result{
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long resultId;
//
//    @ManyToOne
//    @JoinColumn(name = "evaluatee_id", referencedColumnName = "uid", nullable = false)
//    private User evaluatee;
//
//    @ManyToOne
//    @JoinColumn(name = "evaluation_id", referencedColumnName = "eid", nullable = false)
//    private Evaluation evaluation;
//
//    @Column(name = "average_score", nullable = false)
//    private double averageScore;
//
//    public Result() {}
//
//    public Result(User evaluatee, Evaluation evaluation, double averageScore) {
//        this.evaluatee = evaluatee;
//        this.evaluation = evaluation;
//        this.averageScore = averageScore;
//    }
//
//    public Long getResultId() {
//        return resultId;
//    }
//
//    public void setResultId(Long resultId) {
//        this.resultId = resultId;
//    }
//
//    public User getEvaluatee() {
//        return evaluatee;
//    }
//
//    public void setEvaluatee(User evaluatee) {
//        this.evaluatee = evaluatee;
//    }
//
//    public Evaluation getEvaluation() {
//        return evaluation;
//    }
//
//    public void setEvaluation(Evaluation evaluation) {
//        this.evaluation = evaluation;
//    }
//
//    public double getAverageScore() {
//        return averageScore;
//    }
//
//    public void setAverageScore(double averageScore) {
//        this.averageScore = averageScore;
//    }
//}
