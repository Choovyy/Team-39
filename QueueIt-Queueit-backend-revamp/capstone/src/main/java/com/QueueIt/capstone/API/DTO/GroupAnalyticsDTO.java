package com.QueueIt.capstone.API.DTO;

public class GroupAnalyticsDTO {
    private HistogramData histogramData;
    private RadarData radarData;

    public GroupAnalyticsDTO(HistogramData histogramData, RadarData radarData) {
        this.histogramData = histogramData;
        this.radarData = radarData;
    }

    public HistogramData getHistogramData() {
        return histogramData;
    }

    public void setHistogramData(HistogramData histogramData) {
        this.histogramData = histogramData;
    }

    public RadarData getRadarData() {
        return radarData;
    }

    public void setRadarData(RadarData radarData) {
        this.radarData = radarData;
    }
}
