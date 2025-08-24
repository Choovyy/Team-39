package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class ModuleDTO {
    private String moduleName;
    private List<TaskDTO> tasks;


    public ModuleDTO(String moduleName, List<TaskDTO> tasks) {
        this.moduleName = moduleName;
        this.tasks = tasks;
    }

    public String getModuleName() {
        return moduleName;
    }

    public List<TaskDTO> getTasks() {
        return tasks;
    }
}
