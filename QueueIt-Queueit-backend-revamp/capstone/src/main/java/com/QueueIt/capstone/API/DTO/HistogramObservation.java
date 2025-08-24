package com.QueueIt.capstone.API.DTO;

public class HistogramObservation {
    private String studentName;
    private Long attendanceCount;

    public HistogramObservation() {
    }

    public HistogramObservation(String studentName, Long attendanceCount) {
        this.studentName = studentName;
        this.attendanceCount = attendanceCount;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getAttendanceCount() {
        return attendanceCount;
    }

    public void setAttendanceCount(Long attendanceCount) {
        this.attendanceCount = attendanceCount;
    }

    @Override
    public String toString() {
        return this.studentName + " count: " +this.attendanceCount;
    }
}
