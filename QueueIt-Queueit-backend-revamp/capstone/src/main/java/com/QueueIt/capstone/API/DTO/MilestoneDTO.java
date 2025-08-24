package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class MilestoneDTO {
    private String title;
    private List<ModuleDTO> modules;

    public MilestoneDTO(String title, List<ModuleDTO> modules) {
        this.title = title;
        this.modules = modules;
    }

    public String getTitle() {
        return title;
    }

    public List<ModuleDTO> getModules() {
        return modules;
    }
}
