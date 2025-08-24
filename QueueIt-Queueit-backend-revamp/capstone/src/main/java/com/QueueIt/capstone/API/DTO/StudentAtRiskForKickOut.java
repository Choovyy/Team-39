package com.QueueIt.capstone.API.DTO;

public class StudentAtRiskForKickOut {
    private String firstName;
    private String lastName;
    private Long attendanceCount;
    private Double gradeAverage;
    private Double attendanceRate;

    public StudentAtRiskForKickOut(String firstName, String lastName, Long attendanceCount, Double gradeAverage, Double attendanceRate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.attendanceCount = attendanceCount;
        this.gradeAverage = gradeAverage;
        this.attendanceRate = attendanceRate;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Long getAttendanceCount() {
        return attendanceCount;
    }

    public void setAttendanceCount(Long attendanceCount) {
        this.attendanceCount = attendanceCount;
    }

    public Double getGradeAverage() {
        return Math.round(gradeAverage * 10 ) / 10.0 ;    }

    public void setGradeAverage(Double gradeAverage) {
        this.gradeAverage = gradeAverage;
    }

    public Long getAttendanceRate() {
        return (long) Math.ceil(attendanceRate);
    }

    public void setAttendanceRate(Double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}
