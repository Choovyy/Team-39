package com.group2.SPEAR_Backend.DTO;

public class AdviserDTO {
    private Long adviserId;
    private String adviserName;

    public AdviserDTO(Long adviserId, String adviserName) {
        this.adviserId = adviserId;
        this.adviserName = adviserName;
    }

    public Long getAdviserId() {
        return adviserId;
    }

    public void setAdviserId(Long adviserId) {
        this.adviserId = adviserId;
    }

    public String getAdviserName() {
        return adviserName;
    }

    public void setAdviserName(String adviserName) {
        this.adviserName = adviserName;
    }
}
