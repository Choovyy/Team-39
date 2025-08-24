package com.QueueIt.capstone.API.DTO;

import java.util.ArrayList;
import java.util.List;

public class ReportSummary {
    private List<ReportSummaryEntry> reportSummaryEntryList;

    public ReportSummary() {
        this.reportSummaryEntryList = new ArrayList<>();
    }

    public List<ReportSummaryEntry> getReportSummaryEntryList() {
        return reportSummaryEntryList;
    }

    public void setReportSummaryEntryList(List<ReportSummaryEntry> reportSummaryEntryList) {
        this.reportSummaryEntryList = reportSummaryEntryList;
    }
}
