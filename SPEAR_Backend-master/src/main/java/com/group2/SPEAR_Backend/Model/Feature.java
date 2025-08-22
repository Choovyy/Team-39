package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "features")
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int fid;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "project_id", referencedColumnName = "pid")
    private ProjectProposal project;

    @Column(name = "featureTitle")
    private String featureTitle;

    @Column(name = "featureDescription")
    private String featureDescription;

    public Feature() {
    }

    public Feature(String featureTitle, String featureDescription, ProjectProposal project) {
        this.featureTitle = featureTitle;
        this.featureDescription = featureDescription;
        this.project = project;
    }


    public int getFid() {
        return fid;
    }

    public String getFeatureTitle() {
        return featureTitle;
    }

    public String getFeatureDescription() {
        return featureDescription;
    }

    public ProjectProposal getProject() {
        return project;
    }

    public void setFid(int fid) {
        this.fid = fid;
    }

    public void setFeatureTitle(String featureTitle) {
        this.featureTitle = featureTitle;
    }

    public void setFeatureDescription(String featureDescription) {
        this.featureDescription = featureDescription;
    }

    public void setProject(ProjectProposal project) {
        this.project = project;
    }
}
