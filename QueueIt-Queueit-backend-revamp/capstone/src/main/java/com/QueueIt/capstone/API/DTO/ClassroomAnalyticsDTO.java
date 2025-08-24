package com.QueueIt.capstone.API.DTO;

import com.QueueIt.capstone.API.Entities.Meeting;
import com.QueueIt.capstone.API.Entities.QueueingEntry;
import com.QueueIt.capstone.API.Entities.QueueingManager;

import java.util.List;

public class ClassroomAnalyticsDTO {
    private List<LowestEngagementDTO> lowestEngagementDTO;
    private List<StudentAtRiskForKickOut> atRiskForKickOuts;
    private List<TopTeam> topTeams;
    private PieChartData pieChartData;
    private ScatterPlotDataset scatterPlotDataset;

    public ClassroomAnalyticsDTO(List<TopTeam> topTeams, PieChartData pieChartData, ScatterPlotDataset scatterPlotDataset) {
        this.topTeams = topTeams;
        this.pieChartData = pieChartData;
        this.scatterPlotDataset = scatterPlotDataset;
    }

    public List<LowestEngagementDTO> getLowestEngagementDTO() {
        return lowestEngagementDTO;
    }

    public void setLowestEngagementDTO(List<LowestEngagementDTO> lowestEngagementDTO) {
        this.lowestEngagementDTO = lowestEngagementDTO;
    }

    public List<StudentAtRiskForKickOut> getAtRiskForKickOuts() {
        return atRiskForKickOuts;
    }

    public void setAtRiskForKickOuts(List<StudentAtRiskForKickOut> atRiskForKickOuts) {
        this.atRiskForKickOuts = atRiskForKickOuts;
    }

    public List<TopTeam> getTopTeams() {
        return topTeams;
    }

    public void setTopTeams(List<TopTeam> topTeams) {
        this.topTeams = topTeams;
    }

    public PieChartData getPieChartData() {
        return pieChartData;
    }

    public void setPieChartData(PieChartData pieChartData) {
        this.pieChartData = pieChartData;
    }

    public ScatterPlotDataset getScatterPlotDataset() {
        return scatterPlotDataset;
    }

    public void setScatterPlotDataset(ScatterPlotDataset scatterPlotDataset) {
        this.scatterPlotDataset = scatterPlotDataset;
    }
}
