package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class ClassesIDRequest {
    private List<Integer> classesIDList;

    public ClassesIDRequest() {
    }

    public ClassesIDRequest(List<Integer> classesIDList) {
        this.classesIDList = classesIDList;
    }

    public List<Integer> getClassesIDList() {
        return classesIDList;
    }

    public void setClassesIDList(List<Integer> classesIDList) {
        this.classesIDList = classesIDList;
    }
}