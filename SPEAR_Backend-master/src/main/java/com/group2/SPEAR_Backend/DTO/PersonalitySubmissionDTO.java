package com.group2.SPEAR_Backend.DTO;

import java.util.Map;

public class PersonalitySubmissionDTO {
    // Map questionId -> answer (1-5 Likert)
    private Map<Long, Integer> answers;

    public PersonalitySubmissionDTO() {}

    public PersonalitySubmissionDTO(Map<Long, Integer> answers) {
        this.answers = answers;
    }

    public Map<Long, Integer> getAnswers() { return answers; }
    public void setAnswers(Map<Long, Integer> answers) { this.answers = answers; }
}
