package com.QueueIt.capstone.API.DTO;

import com.QueueIt.capstone.API.Entities.Classroom;

import java.sql.Time;
import java.util.List;

public class FacultyDTO {
    private Long facultyID;
    private Time timeEnds;
    private Long cateringLimit;
    private List<Long> cateredClassrooms;
    private String facultyName;

    public FacultyDTO(Long facultyID, Time timeEnds, Long cateringLimit, List<Long> cateredClassrooms, String facultyName) {
        this.facultyID = facultyID;
        this.timeEnds = timeEnds;
        this.cateringLimit = cateringLimit;
        this.cateredClassrooms = cateredClassrooms;
        this.facultyName = facultyName;
    }

    public Boolean isAllClassrooms(){
        if (this.cateredClassrooms.isEmpty()){
            return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

    public List<Long> getCateredClassrooms() {
        return cateredClassrooms;
    }

    public FacultyDTO(Long facultyID) {
        this.facultyID = facultyID;
    }

    public Long getFacultyID() {
        return facultyID;
    }

    public Time getTimeEnds() {
        return timeEnds;
    }

    public Long getCateringLimit() {
        return cateringLimit;
    }

    public String getFacultyName() {
        return facultyName;
    }
}
