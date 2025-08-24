package com.QueueIt.capstone.API.DTO;

public class DataPoint {
    private Long x;
    private Double y;

    public DataPoint(Long x, Double y) {
        this.x = x;
        this.y = y;
    }

    public Long getX() {
        return x;
    }

    public void setX(Long x) {
        this.x = x;
    }

    public Double getY() {
        return Math.round(y * 10 ) / 10.0;
    }

    public void setY(Double y) {
        this.y = y;
    }
}
