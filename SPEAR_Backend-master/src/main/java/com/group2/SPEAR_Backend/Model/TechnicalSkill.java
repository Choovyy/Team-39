package com.group2.SPEAR_Backend.Model;


import jakarta.persistence.Embeddable;

@Embeddable
public class TechnicalSkill {

    private String skill;
    private int masteryLevel;

    public TechnicalSkill() {}

    public TechnicalSkill(String skill, int masteryLevel) {
        this.skill = skill;
        this.masteryLevel = masteryLevel;
    }

    // Getters and Setters
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public int getMasteryLevel() { return masteryLevel; }
    public void setMasteryLevel(int masteryLevel) { this.masteryLevel = masteryLevel; }
}
