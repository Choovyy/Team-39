package com.QueueIt.capstone.API.DTO;

public class TaskDTO {
    private String taskName;
    private String description;

    public TaskDTO(String taskName, String description) {
        this.taskName = taskName;
        this.description = description;
    }

    public String getTaskName() {
        return taskName;
    }

    public String getDescription() {
        return description;
    }
}
