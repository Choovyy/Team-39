package com.group2.SPEAR_Backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "responses")
public class Response {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rid;

    @ManyToOne
    @JoinColumn(name = "evaluator_id", referencedColumnName = "uid", nullable = false)
    private User evaluator;

    @ManyToOne
    @JoinColumn(name = "evaluatee_id", referencedColumnName = "uid", nullable = false)
    private User evaluatee;

    @ManyToOne
    @JoinColumn(name = "question_id", referencedColumnName = "qid", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "evaluation_id", referencedColumnName = "eid", nullable = false)
    private Evaluation evaluation;

    @Column(name = "score", nullable = false)
    private double score;

    @Column(name = "text_response")
    private String textResponse;  // Optional, nullable

    public Response() {}

    public Response(User evaluator, User evaluatee, Question question, Evaluation evaluation, double score, String textResponse) {
        this.evaluator = evaluator;
        this.evaluatee = evaluatee;
        this.question = question;
        this.evaluation = evaluation;
        this.score = score;
        this.textResponse = textResponse;
    }

    public Long getRid() {
        return rid;
    }

    public void setRid(Long rid) {
        this.rid = rid;
    }

    public User getEvaluator() {
        return evaluator;
    }

    public void setEvaluator(User evaluator) {
        this.evaluator = evaluator;
    }

    public User getEvaluatee() {
        return evaluatee;
    }

    public void setEvaluatee(User evaluatee) {
        this.evaluatee = evaluatee;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public Evaluation getEvaluation() {
        return evaluation;
    }

    public void setEvaluation(Evaluation evaluation) {
        this.evaluation = evaluation;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getTextResponse() {
        return textResponse;
    }

    public void setTextResponse(String textResponse) {
        this.textResponse = textResponse;
    }
}
