package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "schedule")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int schedid;

    @Enumerated(EnumType.STRING)
    @Column(name = "day", nullable = false)
    private DayOfWeek day;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;


    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "uid", nullable = false)
    private User teacher;

    //add foreign key for classes - schedule (ClassSchedule) if qualified
    @ManyToOne
    @JoinColumn(name = "class_id", referencedColumnName = "cid")
    private Classes scheduleOfClasses;

    public Schedule() {}

    public Schedule(DayOfWeek day, LocalTime startTime, LocalTime endTime, User teacher, Classes scheduleOfClasses) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.teacher = teacher;
        this.scheduleOfClasses = scheduleOfClasses;
    }

    public int getSchedid() {
        return schedid;
    }
    public void setSchedid(int schedid) {
        this.schedid = schedid;
    }

    public DayOfWeek getDay() {
        return day;
    }

    public void setDay(DayOfWeek day) {
        this.day = day;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Classes getScheduleOfClasses() {
        return scheduleOfClasses;
    }

    public void setScheduleOfClasses(Classes scheduleOfClasses) {
        this.scheduleOfClasses = scheduleOfClasses;
    }
}
