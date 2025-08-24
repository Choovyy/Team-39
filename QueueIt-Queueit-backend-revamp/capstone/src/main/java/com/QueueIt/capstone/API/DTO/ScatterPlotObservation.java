package com.QueueIt.capstone.API.DTO;

import java.util.ArrayList;
import java.util.List;

public class ScatterPlotObservation {
    private String label;
    private List<DataPoint> data = new ArrayList<>();
    private String backgroundColor;

    public ScatterPlotObservation(String label, Double gradeAverage, Long meetingCount) {
        this.label = label;
        this.data.add(new DataPoint(
                meetingCount,
                gradeAverage
        ));
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public List<DataPoint> getData() {
        return data;
    }

    public void setData(List<DataPoint> data) {
        this.data = data;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}
