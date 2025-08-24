package com.QueueIt.capstone.API.DTO;

public class RadarChartObservation {
    private String studentName;
    private Double gradeAverage;

    public RadarChartObservation() {
    }

    public RadarChartObservation(String studentName, Double gradeAverage) {
        this.studentName = studentName;
        this.gradeAverage = gradeAverage;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Double getGradeAverage() {
        return gradeAverage;
    }

    public void setGradeAverage(Double gradeAverage) {
        this.gradeAverage = gradeAverage;
    }
}
