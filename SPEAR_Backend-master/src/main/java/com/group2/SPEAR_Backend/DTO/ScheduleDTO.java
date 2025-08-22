package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.Classes;
import com.group2.SPEAR_Backend.Model.DayOfWeek;
import com.group2.SPEAR_Backend.Model.Schedule;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class ScheduleDTO {

    private int schedid;
    private DayOfWeek day;
    private LocalTime startTime;
    private LocalTime endTime;
    private int teacherId;
    private String teacherName;
    private Long classId;
    private String className;
    private String courseDescription;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    public ScheduleDTO() {}

    public ScheduleDTO(int schedid, DayOfWeek day, LocalTime startTime, LocalTime endTime, int teacherId, String teacherName, Long classId, String className, String courseDescription) {
        this.schedid = schedid;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.classId = classId;
        this.className = className;
        this.courseDescription = courseDescription;
    }



    public static ScheduleDTO convertToDTO(Schedule schedule) {
        Classes cls = schedule.getScheduleOfClasses();
        return new ScheduleDTO(
                schedule.getSchedid(),
                schedule.getDay(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getTeacher().getUid(),
                schedule.getTeacher().getFirstname() + " " + schedule.getTeacher().getLastname(),
                cls != null ? cls.getCid() : null,
                cls != null ? cls.getCourseCode() : "No Class Assigned",
                cls != null ? cls.getCourseDescription() : "No Description"
        );
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

    public int getSchedid() {
        return schedid;
    }

    public void setSchedid(int schedid) {
        this.schedid = schedid;
    }

    public int getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(int teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getCourseDescription() {
        return courseDescription;
    }

    public void setCourseDescription(String courseDescription) {
        this.courseDescription = courseDescription;
    }
}