package com.group2.SPEAR_Backend.DTO;

import java.util.Map;

public class PersonalityResultDTO {
    private Map<String, Integer> traitScores; // axis -> 0-100
    private String archetype;
    private String personalityString; // concise descriptor string
    private String summary; // narrative sentence used for embedding

    public PersonalityResultDTO() {}

    public PersonalityResultDTO(Map<String, Integer> traitScores, String archetype, String personalityString, String summary) {
        this.traitScores = traitScores;
        this.archetype = archetype;
        this.personalityString = personalityString;
        this.summary = summary;
    }

    public Map<String, Integer> getTraitScores() { return traitScores; }
    public void setTraitScores(Map<String, Integer> traitScores) { this.traitScores = traitScores; }
    public String getArchetype() { return archetype; }
    public void setArchetype(String archetype) { this.archetype = archetype; }
    public String getPersonalityString() { return personalityString; }
    public void setPersonalityString(String personalityString) { this.personalityString = personalityString; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
