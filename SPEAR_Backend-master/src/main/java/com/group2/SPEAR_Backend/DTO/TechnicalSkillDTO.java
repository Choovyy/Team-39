package com.group2.SPEAR_Backend.DTO;


public class TechnicalSkillDTO {
    private String skill;
    private int masteryLevel;

    // Constructors
    public TechnicalSkillDTO() {}

    public TechnicalSkillDTO(String skill, int masteryLevel) {
        this.skill = skill;
        this.masteryLevel = masteryLevel;
    }

    // Getters & Setters
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public int getMasteryLevel() { return masteryLevel; }
    public void setMasteryLevel(int masteryLevel) { this.masteryLevel = masteryLevel; }
}
