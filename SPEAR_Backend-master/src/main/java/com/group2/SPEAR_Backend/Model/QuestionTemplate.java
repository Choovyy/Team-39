package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "question_templates")
public class QuestionTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_title", nullable = false)
    private String questionTitle;

    @Column(name = "question_details", columnDefinition = "TEXT")
    private String questionDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @ManyToOne
    @JoinColumn(name = "template_set_id")
    private QuestionTemplateSet templateSet;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "uid", nullable = false)
    private User createdBy;

    public QuestionTemplate() {}

    public QuestionTemplate(String questionTitle, String questionDetails, QuestionType questionType,
                            QuestionTemplateSet templateSet, User createdBy) {
        this.questionTitle = questionTitle;
        this.questionDetails = questionDetails;
        this.questionType = questionType;
        this.templateSet = templateSet;
        this.createdBy = createdBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionTitle() {
        return questionTitle;
    }

    public void setQuestionTitle(String questionTitle) {
        this.questionTitle = questionTitle;
    }

    public String getQuestionDetails() {
        return questionDetails;
    }

    public void setQuestionDetails(String questionDetails) {
        this.questionDetails = questionDetails;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public QuestionTemplateSet getTemplateSet() {
        return templateSet;
    }

    public void setTemplateSet(QuestionTemplateSet templateSet) {
        this.templateSet = templateSet;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}