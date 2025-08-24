package com.QueueIt.capstone.API.DTO;

public class ClassRecordEntry {
    private String studentName;
    private Double gradeAverage;
    private String teamName;

    public ClassRecordEntry(String studentName, Double gradeAverage, String teamName) {
        this.studentName = studentName;
        this.gradeAverage = gradeAverage;
        this.teamName = teamName;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Double getGradeAverage() {
        return Math.round(gradeAverage * 10 ) / 10.0 ;
    }

    public void setGradeAverage(Double gradeAverage) {
        this.gradeAverage = gradeAverage;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}
