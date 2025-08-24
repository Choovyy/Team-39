package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class DataEntry {
    private List<Long> data;
    private List<String> backgroundColor;

    public DataEntry(List<Long> data, List<String> backgroundColor) {
        this.data = data;
        this.backgroundColor = backgroundColor;
    }

    public List<Long> getData() {
        return data;
    }

    public void setData(List<Long> data) {
        this.data = data;
    }

    public List<String> getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(List<String> backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}
