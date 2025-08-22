package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qid;

    @Column(name = "question_title", nullable = false)
    private String questionTitle;

    @Column(name = "question_details", columnDefinition = "TEXT")
    private String questionDetails;

    @ManyToOne
    @JoinColumn(name = "evaluation_id", referencedColumnName = "eid", nullable = false)
    private Evaluation evaluation;

    @ManyToOne
    @JoinColumn(name = "class_id", referencedColumnName = "cid", nullable = false)
    private Classes classes;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "uid", nullable = false)
    private User createdBy;

    @Column(name = "is_editable", nullable = false)
    private boolean isEditable;

    @ManyToOne
    @JoinColumn(name = "template_set_id")
    private QuestionTemplateSet templateSet;

    public Question() {}

    public Question(String questionTitle, String questionDetails, Evaluation evaluation, Classes classes,
                    QuestionType questionType, User createdBy, boolean isEditable) {
        this.questionTitle = questionTitle;
        this.questionDetails = questionDetails;
        this.evaluation = evaluation;
        this.classes = classes;
        this.questionType = questionType;
        this.createdBy = createdBy;
        this.isEditable = isEditable;
    }

    public Question(String questionTitle, String questionDetails, Evaluation evaluation, Classes classes,
                    QuestionType questionType, User createdBy, boolean isEditable, QuestionTemplateSet templateSet) {
        this.questionTitle = questionTitle;
        this.questionDetails = questionDetails;
        this.evaluation = evaluation;
        this.classes = classes;
        this.questionType = questionType;
        this.createdBy = createdBy;
        this.isEditable = isEditable;
        this.templateSet = templateSet;
    }

    public Long getQid() { return qid; }
    public void setQid(Long qid) { this.qid = qid; }

    public String getQuestionTitle() { return questionTitle; }
    public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

    public String getQuestionDetails() { return questionDetails; }
    public void setQuestionDetails(String questionDetails) { this.questionDetails = questionDetails; }

    public Evaluation getEvaluation() { return evaluation; }
    public void setEvaluation(Evaluation evaluation) { this.evaluation = evaluation; }

    public Classes getClasses() { return classes; }
    public void setClasses(Classes classes) { this.classes = classes; }

    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public boolean isEditable() { return isEditable; }
    public void setEditable(boolean editable) { isEditable = editable; }

    public QuestionTemplateSet getTemplateSet() { return templateSet; }
    public void setTemplateSet(QuestionTemplateSet templateSet) { this.templateSet = templateSet; }
}