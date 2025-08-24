package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class ScatterPlotDataset {
    private List<ScatterPlotObservation> datasets;

    public ScatterPlotDataset(List<ScatterPlotObservation> datasets) {
        this.datasets = datasets;
    }

    public List<ScatterPlotObservation> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<ScatterPlotObservation> datasets) {
        this.datasets = datasets;
    }
}
