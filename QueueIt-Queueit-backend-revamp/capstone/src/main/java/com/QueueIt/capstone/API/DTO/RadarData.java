package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class RadarData {
    private List<String> labels;
    private List<DataEntryv2> datasets;

    public RadarData() {
    }

    public RadarData(List<String> labels, List<DataEntryv2> datasets) {
        this.labels = labels;
        this.datasets = datasets;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<DataEntryv2> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<DataEntryv2> datasets) {
        this.datasets = datasets;
    }
}
