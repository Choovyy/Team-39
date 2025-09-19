package com.group2.SPEAR_Backend.DTO;

public class PersonalityQuestionDTO {
    private Long id;
    private String text;
    private String axis; // e.g., COLLABORATION, INNOVATION, PLANNING, DETAIL

    public PersonalityQuestionDTO() {}

    public PersonalityQuestionDTO(Long id, String text, String axis) {
        this.id = id;
        this.text = text;
        this.axis = axis;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAxis() { return axis; }
    public void setAxis(String axis) { this.axis = axis; }
}
