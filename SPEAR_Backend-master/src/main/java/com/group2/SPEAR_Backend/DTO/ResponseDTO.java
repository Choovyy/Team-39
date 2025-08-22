package com.group2.SPEAR_Backend.DTO;
import com.group2.SPEAR_Backend.Model.QuestionType;

public class ResponseDTO {

    private Long rid;
    private int evaluatorId;
    private String evaluatorName;
    private int evaluateeId;
    private String evaluateeName;
    private Long questionId;
    private double score;
    private String questionName;
    private String evaluationPeriod;
    private String questionDetails;
    private String textResponse;
    private QuestionType questionType;

    public ResponseDTO() {}

    public ResponseDTO(Long rid, int evaluatorId, String evaluatorName, int evaluateeId, String evaluateeName,
                       Long questionId, String questionName, String evaluationPeriod,
                       double score, String textResponse, String questionDetails, QuestionType questionType) {
        this.rid = rid;
        this.evaluatorId = evaluatorId;
        this.evaluatorName = evaluatorName;
        this.evaluateeId = evaluateeId;
        this.evaluateeName = evaluateeName;
        this.questionId = questionId;
        this.questionName = questionName;
        this.evaluationPeriod = evaluationPeriod;
        this.score = score;
        this.textResponse = textResponse;
        this.questionDetails = questionDetails;
        this.questionType = questionType;
    }


    public Long getRid() {
        return rid;
    }

    public void setRid(Long rid) {
        this.rid = rid;
    }

    public int getEvaluatorId() {
        return evaluatorId;
    }

    public void setEvaluatorId(int evaluatorId) {
        this.evaluatorId = evaluatorId;
    }

    public int getEvaluateeId() {
        return evaluateeId;
    }

    public void setEvaluateeId(int evaluateeId) {
        this.evaluateeId = evaluateeId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getEvaluatorName() {
        return evaluatorName;
    }

    public void setEvaluatorName(String evaluatorName) {
        this.evaluatorName = evaluatorName;
    }

    public String getEvaluateeName() {
        return evaluateeName;
    }

    public void setEvaluateeName(String evaluateeName) {
        this.evaluateeName = evaluateeName;
    }

    public String getQuestionName() {
        return questionName;
    }

    public void setQuestionName(String questionName) {
        this.questionName = questionName;
    }

    public String getEvaluationPeriod() {
        return evaluationPeriod;
    }

    public void setEvaluationPeriod(String evaluationPeriod) {
        this.evaluationPeriod = evaluationPeriod;
    }
    public String getTextResponse() {
        return textResponse;
    }

    public void setTextResponse(String textResponse) {
        this.textResponse = textResponse;
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
}
