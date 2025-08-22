package com.group2.SPEAR_Backend.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.group2.SPEAR_Backend.Model.EvaluationType;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.util.List;

public class EvaluationDTO {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long eid;
    private EvaluationType evaluationType;
    private String availability;
    private LocalDate dateOpen;
    private LocalDate dateClose;
    private String period;
    private Long classId;
    private String courseCode;
    private String section;
    private String courseDescription;
    private String teamName;
    private String adviserName;
    private List<String> evaluatorNames;
    private List<String> evaluateeNames;
    private boolean isEvaluated;
    private List<Long> teamIds;


    public EvaluationDTO() {}

    public EvaluationDTO(Long eid, EvaluationType evaluationType, String availability, LocalDate dateOpen,
                         LocalDate dateClose, String period, Long classId, String courseCode, String section,
                         String courseDescription, String teamName, String adviserName,
                         List<String> evaluatorNames, List<String> evaluateeNames, boolean isEvaluated) {
        this.eid = eid;
        this.evaluationType = evaluationType;
        this.availability = availability;
        this.dateOpen = dateOpen;
        this.dateClose = dateClose;
        this.period = period;
        this.classId = classId;
        this.courseCode = courseCode;
        this.section = section;
        this.courseDescription = courseDescription;
        this.teamName = teamName;
        this.adviserName = adviserName;
        this.evaluatorNames = evaluatorNames;
        this.evaluateeNames = evaluateeNames;
        this.isEvaluated = isEvaluated;
    }

    public EvaluationDTO(Long eid, EvaluationType evaluationType, String availability, LocalDate dateOpen,
                         LocalDate dateClose, String period, Long classId, String courseCode,
                         String section, String courseDescription) {
        this.eid = eid;
        this.evaluationType = evaluationType;
        this.availability = availability;
        this.dateOpen = dateOpen;
        this.dateClose = dateClose;
        this.period = period;
        this.classId = classId;
        this.courseCode = courseCode;
        this.section = section;
        this.courseDescription = courseDescription;
    }

    public EvaluationDTO(Long eid, EvaluationType evaluationType, String availability, LocalDate dateOpen,
                         LocalDate dateClose, String period, Long classId, String courseCode, String section,
                         String courseDescription, String teamName, String adviserName,
                         List<String> evaluatorNames, List<String> evaluateeNames, boolean isEvaluated, List<Long> teamIds) {
        this.eid = eid;
        this.evaluationType = evaluationType;
        this.availability = availability;
        this.dateOpen = dateOpen;
        this.dateClose = dateClose;
        this.period = period;
        this.classId = classId;
        this.courseCode = courseCode;
        this.section = section;
        this.courseDescription = courseDescription;
        this.teamName = teamName;
        this.adviserName = adviserName;
        this.evaluatorNames = evaluatorNames;
        this.evaluateeNames = evaluateeNames;
        this.isEvaluated = isEvaluated;
        this.teamIds = teamIds;
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

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getCourseDescription() {
        return courseDescription;
    }

    public void setCourseDescription(String courseDescription) {
        this.courseDescription = courseDescription;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getAdviserName() {
        return adviserName;
    }

    public void setAdviserName(String adviserName) {
        this.adviserName = adviserName;
    }

    public List<String> getEvaluatorNames() {
        return evaluatorNames;
    }

    public void setEvaluatorNames(List<String> evaluatorNames) {
        this.evaluatorNames = evaluatorNames;
    }

    public List<String> getEvaluateeNames() {
        return evaluateeNames;
    }

    public void setEvaluateeNames(List<String> evaluateeNames) {
        this.evaluateeNames = evaluateeNames;
    }

    public boolean isEvaluated() {
        return isEvaluated;
    }

    public void setEvaluated(boolean evaluated) {
        isEvaluated = evaluated;
    }

    public List<Long> getTeamIds() {
        return teamIds;
    }

    public void setTeamIds(List<Long> teamIds) {
        this.teamIds = teamIds;
    }
}