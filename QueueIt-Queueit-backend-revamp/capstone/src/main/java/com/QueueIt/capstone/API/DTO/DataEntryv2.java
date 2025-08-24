package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class DataEntryv2 {
    private List<Double> data;
    private String backgroundColor;
    private String borderColor;
    private String pointBackgroundColor;

    public DataEntryv2() {
    }

    public DataEntryv2(List<Double> data, String backgroundColor, String borderColor, String pointBackgroundColor) {
        this.data = data;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.pointBackgroundColor = pointBackgroundColor;
    }

    public List<Double> getData() {
        return data;
    }

    public void setData(List<Double> data) {
        this.data = data;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public String getBorderColor() {
        return borderColor;
    }

    public String getPointBackgroundColor() {
        return pointBackgroundColor;
    }
}
