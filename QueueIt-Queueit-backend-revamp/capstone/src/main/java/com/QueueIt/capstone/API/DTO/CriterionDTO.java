package com.QueueIt.capstone.API.DTO;

public class CriterionDTO {
    private String title;
    private String description;
    private float weight;

    //create rubric DTO
    public CriterionDTO(String title, String description, float weight) {
        this.title = title;
        this.description = description;
        this.weight = weight;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public float getWeight() {
        return weight;
    }
}
