package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskID;
    private String taskName;
    @Column(columnDefinition = "TEXT")
    private String description="";
    private boolean isCompleted = false;
    private LocalDateTime completionDate;
    @ManyToOne
    @JoinColumn(name = "module_id", referencedColumnName = "moduleID", nullable = false)
    @JsonBackReference
    private Module module;

    public Task() {
    }

    public Task(String description, String taskName, Module module) {
        this.description = description;
        this.taskName = taskName;
        this.module = module;
    }

    public Long getTaskID() {
        return taskID;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getDescription() {
        if (description==null){
            return "";
        }
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    public Module getModule() {
        return module;
    }

    public void setModule(Module module) {
        this.module = module;
    }


}
