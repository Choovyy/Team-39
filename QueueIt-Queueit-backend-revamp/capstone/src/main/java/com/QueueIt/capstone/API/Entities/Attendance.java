package com.QueueIt.capstone.API.Entities;

import com.QueueIt.capstone.API.Enums.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.sql.Date;
import java.time.LocalDate;

@Entity
public class Attendance {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long attendanceID;
//    private Long studentID;
    private String studentEmail;
    private String firstname;
    private String lastname;
    @ManyToOne
    @JoinColumn(name = "queueingEntryID")
    @JsonBackReference
    private QueueingEntry queueingEntry;
    private Date attendanceDate = Date.valueOf(LocalDate.now());
    private String attendanceNote;
    @Enumerated(EnumType.STRING)
    private AttendanceStatus attendanceStatus;

    public Attendance() {
    }

    public Attendance(String studentEmail, String firstname, String lastname, AttendanceStatus attendanceStatus) {
        this.studentEmail = studentEmail;
        this.firstname = firstname;
        this.lastname = lastname;
        this.attendanceStatus = attendanceStatus;
    }

    public Attendance(Long attendanceID, String studentEmail, String firstname, String lastname, Date attendanceDate, String attendanceNote, AttendanceStatus attendanceStatus) {
        this.attendanceID = attendanceID;
        this.studentEmail = studentEmail;
        this.firstname = firstname;
        this.lastname = lastname;
        this.attendanceDate = attendanceDate;
        this.attendanceNote = attendanceNote;
        this.attendanceStatus = attendanceStatus;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setAttendanceNote(String attendanceNote) {
        this.attendanceNote = attendanceNote;
    }

    public void setAttendanceDate(Date attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public void setAttendanceStatus(AttendanceStatus attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }

    public Long getAttendanceID() {
        return attendanceID;
    }

    public String getFirstname() {
        return firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public QueueingEntry getQueueingEntry() {
        return queueingEntry;
    }

    public Date getAttendanceDate() {
        return attendanceDate;
    }

    public String getAttendanceNote() {
        return attendanceNote;
    }

    public AttendanceStatus getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setQueueingEntry(QueueingEntry queueingEntry) {
        this.queueingEntry = queueingEntry;
    }
}
