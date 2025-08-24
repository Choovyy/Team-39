package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Classroom {
    @Id
    private Long classroomID;
    @ManyToMany
    @JoinTable(
            name = "QMClassroomFilters",
            joinColumns = @JoinColumn(name="classroomID"),
            inverseJoinColumns = @JoinColumn(name="queueingManagerID")

    )
    @JsonIgnore
    private List<QueueingManager> queueingManagers = new ArrayList<>();

    public Classroom() {
    }

    public Classroom(Long classroomID) {
        this.classroomID = classroomID;
    }

    public void addQueueingManager(QueueingManager queueingManager) {
        this.queueingManagers.add(queueingManager);
    }

    public Long getClassroomID() {
        return classroomID;
    }

    public List<QueueingManager> getQueueingManagers() {
        return queueingManagers;
    }


}
