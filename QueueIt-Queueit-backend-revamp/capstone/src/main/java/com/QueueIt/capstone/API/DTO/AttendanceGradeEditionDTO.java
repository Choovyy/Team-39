package com.QueueIt.capstone.API.DTO;

import com.QueueIt.capstone.API.Entities.Attendance;
import com.QueueIt.capstone.API.Entities.Grade;

import java.util.List;

public class AttendanceGradeEditionDTO {
    private Long meetingID;
    private String firstName;
    private String lastName;
    private Attendance attendance;
    private List<Grade> grades;

    public AttendanceGradeEditionDTO() {
    }

    //for controller parameters
    public AttendanceGradeEditionDTO(Long meetingID, String firstName, String lastName) {
        this.meetingID = meetingID;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    //for return data
    public AttendanceGradeEditionDTO(Attendance attendance, List<Grade> grades) {
        this.attendance = attendance;
        this.grades = grades;
    }

    public Long getMeetingID() {
        return meetingID;
    }

    public Attendance getAttendance() {
        return attendance;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public List<Grade> getGrades() {
        return grades;
    }
}

