package com.QueueIt.capstone.API.DTO;

public class GradeDTO {
    private Long meetingID;
    private Long criterionID;
    private String editionNote;
    private String studentName;
    private Float mark;
    private Float weightedGrade;

    public GradeDTO(Long meetingID, Long criterionID, String editionNote, String studentName, Float grade, Float weightedGrade) {
        this.meetingID = meetingID;
        this.criterionID = criterionID;
        this.editionNote = editionNote;
        this.studentName = studentName;
        this.mark = grade;
        this.weightedGrade = weightedGrade;
    }

    public Long getMeetingID() {
        return meetingID;
    }

    public Long getCriterionID() {
        return criterionID;
    }

    public String getEditionNote() {
        return editionNote;
    }

    public String getStudentName() {
        return studentName;
    }

    public Float getMark() {
        return mark;
    }

    public Float getWeightedGrade() {
        return weightedGrade;
    }

    @Override
    public String toString() {
        return "GradeDTO{" +
                "meetingID=" + meetingID +
                ", criterionID=" + criterionID +
                ", editionNote='" + editionNote + '\'' +
                ", studentName='" + studentName + '\'' +
                ", mark=" + mark +
                ", weightedGrade=" + weightedGrade +
                '}';
    }
}
