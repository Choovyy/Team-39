package com.group2.SPEAR_Backend.DTO;

public class FeatureDTO {
    private String featureTitle;
    private String featureDescription;

    public FeatureDTO(String featureTitle, String featureDescription) {
        this.featureTitle = featureTitle;
        this.featureDescription = featureDescription;
    }

    public String getFeatureTitle() {
        return featureTitle;
    }

    public void setFeatureTitle(String featureTitle) {
        this.featureTitle = featureTitle;
    }

    public String getFeatureDescription() {
        return featureDescription;
    }

    public void setFeatureDescription(String featureDescription) {
        this.featureDescription = featureDescription;
    }
}
