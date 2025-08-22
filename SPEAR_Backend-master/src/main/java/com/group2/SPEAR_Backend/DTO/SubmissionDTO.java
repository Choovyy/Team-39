package com.group2.SPEAR_Backend.DTO;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class SubmissionDTO {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long sid;
    private int evaluatorId;
    private String evaluatorName;
    private Long evaluationId;
    private String evaluationPeriod;
    private String submittedAt;
    private String status;

    public SubmissionDTO() {}

    public SubmissionDTO(Long sid, int evaluatorId, String evaluatorName, Long evaluationId, String evaluationPeriod,
                         LocalDateTime submittedAt, String status) {
        this.sid = sid;
        this.evaluatorId = evaluatorId;
        this.evaluatorName = evaluatorName;
        this.evaluationId = evaluationId;
        this.evaluationPeriod = evaluationPeriod;
        this.submittedAt = submittedAt.format(FORMATTER);
        this.status = status;
    }

    public SubmissionDTO(Long sid, int evaluatorId, Long evaluationId, LocalDateTime submittedAt, String status) {
        this.sid = sid;
        this.evaluatorId = evaluatorId;
        this.evaluatorName = null;
        this.evaluationId = evaluationId;
        this.evaluationPeriod = null;
        this.submittedAt = submittedAt.format(FORMATTER); // Format LocalDateTime
        this.status = status;
    }

    public Long getSid() {
        return sid;
    }

    public void setSid(Long sid) {
        this.sid = sid;
    }

    public int getEvaluatorId() {
        return evaluatorId;
    }

    public void setEvaluatorId(int evaluatorId) {
        this.evaluatorId = evaluatorId;
    }

    public Long getEvaluationId() {
        return evaluationId;
    }

    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt.format(FORMATTER);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEvaluatorName() {
        return evaluatorName;
    }

    public void setEvaluatorName(String evaluatorName) {
        this.evaluatorName = evaluatorName;
    }

    public String getEvaluationPeriod() {
        return evaluationPeriod;
    }

    public void setEvaluationPeriod(String evaluationPeriod) {
        this.evaluationPeriod = evaluationPeriod;
    }
}
