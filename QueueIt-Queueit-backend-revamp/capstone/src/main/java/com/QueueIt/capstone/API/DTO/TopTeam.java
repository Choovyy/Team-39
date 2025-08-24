package com.QueueIt.capstone.API.DTO;

public class TopTeam {
    private String teamName;
    private Double gradeAverage;

    public TopTeam() {
    }

    public TopTeam(String teamName, Double gradeAverage) {
        this.teamName = teamName;
        this.gradeAverage = gradeAverage;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Double getGradeAverage() {
        return Math.round(gradeAverage * 10 ) / 10.0;
    }

    public void setGradeAverage(Double gradeAverage) {
        this.gradeAverage = gradeAverage;
    }
}
