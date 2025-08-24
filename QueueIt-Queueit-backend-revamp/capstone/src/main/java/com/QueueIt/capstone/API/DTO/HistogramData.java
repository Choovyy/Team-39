package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class HistogramData {
    private List<String> labels;
    private List<DataEntry> datasets;

    public HistogramData() {
    }

    public HistogramData(List<String> labels, List<DataEntry> datasets) {
        this.labels = labels;
        this.datasets = datasets;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<DataEntry> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<DataEntry> datasets) {
        this.datasets = datasets;
    }
}
