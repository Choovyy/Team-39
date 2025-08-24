package com.QueueIt.capstone.API.DTO;

import java.time.LocalDateTime;

public class ReportSummaryEntry {
    private int meetingNumber;
    private LocalDateTime meetingDate;
    private Float gradeAverage;
    private String studentName;

    public ReportSummaryEntry() {
    }

    public ReportSummaryEntry(int meetingNumber, LocalDateTime meetingDate, Float gradeAverage, String studentName) {
        this.meetingNumber = meetingNumber;
        this.meetingDate = meetingDate;
        this.gradeAverage = gradeAverage;
        this.studentName = studentName;
    }

    public int getMeetingNumber() {
        return meetingNumber;
    }

    public void setMeetingNumber(int meetingNumber) {
        this.meetingNumber = meetingNumber;
    }

    public LocalDateTime getMeetingDate() {
        return meetingDate;
    }

    public void setMeetingDate(LocalDateTime meetingDate) {
        this.meetingDate = meetingDate;
    }

    public Float getGradeAverage() {
        return gradeAverage;
    }

    public void setGradeAverage(Float gradeAverage) {
        this.gradeAverage = gradeAverage;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
}
