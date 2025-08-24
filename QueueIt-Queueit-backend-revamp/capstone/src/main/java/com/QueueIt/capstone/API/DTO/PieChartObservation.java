package com.QueueIt.capstone.API.DTO;

public class PieChartObservation {
    private String facultyName;
    private Long meetingCount;

    public PieChartObservation(String facultyName, Long meetingCount) {
        this.facultyName = facultyName;
        this.meetingCount = meetingCount;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public Long getMeetingCount() {
        return meetingCount;
    }

    public void setMeetingCount(Long meetingCount) {
        this.meetingCount = meetingCount;
    }
}
