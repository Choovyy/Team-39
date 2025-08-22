package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.QuestionTemplate;
import com.group2.SPEAR_Backend.Model.QuestionType;

public class QuestionTemplateDTO {
    private Long id;
    private String questionTitle;
    private String questionDetails;
    private QuestionType questionType;
    private Integer createdByUserId;

    // ✅ Add flattened reference
    private Long templateSetId;
    private String templateSetName;

    public QuestionTemplateDTO() {}

    public QuestionTemplateDTO(QuestionTemplate template) {
        this.id = template.getId();
        this.questionTitle = template.getQuestionTitle();
        this.questionDetails = template.getQuestionDetails();
        this.questionType = template.getQuestionType();
        this.createdByUserId = template.getCreatedBy() != null ? template.getCreatedBy().getUid() : null;

        // flatten the nested set info
        this.templateSetId = template.getTemplateSet() != null ? template.getTemplateSet().getId() : null;
        this.templateSetName = template.getTemplateSet() != null ? template.getTemplateSet().getName() : null;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionTitle() { return questionTitle; }
    public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

    public String getQuestionDetails() { return questionDetails; }
    public void setQuestionDetails(String questionDetails) { this.questionDetails = questionDetails; }

    public QuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuestionType questionType) { this.questionType = questionType; }

    public Integer getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Integer createdByUserId) { this.createdByUserId = createdByUserId; }

    public Long getTemplateSetId() { return templateSetId; }
    public void setTemplateSetId(Long templateSetId) { this.templateSetId = templateSetId; }

    public String getTemplateSetName() { return templateSetName; }
    public void setTemplateSetName(String templateSetName) { this.templateSetName = templateSetName; }
}