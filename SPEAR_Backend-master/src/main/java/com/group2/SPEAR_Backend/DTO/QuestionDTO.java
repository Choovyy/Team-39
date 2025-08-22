package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.Question;
import com.group2.SPEAR_Backend.Model.QuestionType;

public class QuestionDTO {
    private Long qid;
    private String questionTitle;
    private String questionDetails;
    private Long evaluationId;
    private Long classId;
    private QuestionType questionType;
    private Integer createdByUserId;
    private String createdByName;
    private boolean isEditable;
    private Long templateSetId;
    private String templateSetName;


    public QuestionDTO() {
    }

    public QuestionDTO(Long qid, String questionTitle, String questionDetails, Long evaluationId, Long classId,
                       QuestionType questionType, Integer createdByUserId, String createdByName, boolean isEditable,
                       Long templateSetId, String templateSetName) {
        this.qid = qid;
        this.questionTitle = questionTitle;
        this.questionDetails = questionDetails;
        this.evaluationId = evaluationId;
        this.classId = classId;
        this.questionType = questionType;
        this.createdByUserId = createdByUserId;
        this.createdByName = createdByName;
        this.isEditable = isEditable;
        this.templateSetId = templateSetId;
        this.templateSetName = templateSetName;
    }

    public QuestionDTO(Question question) {
        this.qid = question.getQid();
        this.questionTitle = question.getQuestionTitle();
        this.questionDetails = question.getQuestionDetails();
        this.evaluationId = question.getEvaluation() != null ? question.getEvaluation().getEid() : null;
        this.classId = question.getClasses() != null ? question.getClasses().getCid() : null;
        this.questionType = question.getQuestionType();
        this.createdByUserId = question.getCreatedBy() != null ? question.getCreatedBy().getUid() : null;
        this.createdByName = question.getCreatedBy() != null ? question.getCreatedBy().getFirstname() + " " + question.getCreatedBy().getLastname() : "Unknown";
        this.isEditable = question.isEditable();
        this.templateSetId = question.getTemplateSet() != null ? question.getTemplateSet().getId() : null;
        this.templateSetName = question.getTemplateSet() != null ? question.getTemplateSet().getName() : null;
    }


    public Long getQid() {
        return qid;
    }

    public void setQid(Long qid) {
        this.qid = qid;
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

    public Long getEvaluationId() {
        return evaluationId;
    }

    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }

    public Integer getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(Integer createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public boolean isEditable() {
        return isEditable;
    }

    public void setEditable(boolean editable) {
        isEditable = editable;
    }

    public Long getTemplateSetId() {
        return templateSetId;
    }

    public void setTemplateSetId(Long templateSetId) {
        this.templateSetId = templateSetId;
    }

    public String getTemplateSetName() {
        return templateSetName;
    }

    public void setTemplateSetName(String templateSetName) {
        this.templateSetName = templateSetName;
    }
}