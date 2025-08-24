package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Enums.AttendanceStatus;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.QueueIt.capstone.API.Repository.AttendanceRepository;
import com.QueueIt.capstone.API.Repository.GradeRepository;
import com.QueueIt.capstone.API.Repository.MeetingRepository;
import com.QueueIt.capstone.API.Utilities.StringUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private QueueingEntryService queueingEntryService;

    public ClassroomAnalyticsDTO generateClassroomAnalytics(Long classroomID){
        return new ClassroomAnalyticsDTO(
                retrieveTopThreeTeams(classroomID),
                retrieveFacultyPerformanceInClassroom(classroomID),
                getTeamsPerformance(classroomID)
        );
    }

    public GroupAnalyticsDTO generateGroupAnalytics(Long teamID){
        return new GroupAnalyticsDTO(
                generateAttendanceHistogramData(teamID),
                generatePerformanceRadarData(teamID)
        );
    }

    public HistogramData generateAttendanceHistogramData(Long teamID){
        List<HistogramObservation> histogramObservationList = meetingRepository.getAttendanceHistogram(
                teamID,
                List.of(AttendanceStatus.PRESENT),
                List.of(MeetingStatus.ATTENDED_FACULTY_CONDUCTED,
                        MeetingStatus.ATTENDED_QUEUEING_CONDUCTED,
                        MeetingStatus.FOLLOWUP_MEETING,
                        MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED));
        if (histogramObservationList.size() > 1){
            List<String> labels = new ArrayList<>();
            List<DataEntry> datasets = new ArrayList<>();
            datasets.add(new DataEntry(
                    new ArrayList<>(),
                    new ArrayList<>()
            ));
            for(int i = 0; i < histogramObservationList.size(); i++){
                labels.add(histogramObservationList.get(i).getStudentName());
                datasets.getFirst().getData().add(histogramObservationList.get(i).getAttendanceCount());
                datasets.getFirst().getBackgroundColor().add(StringUtility.randomBackgroundColorString(i));
            }
            return new HistogramData(labels, datasets);
        }
        return new HistogramData();
    }

    public RadarData generatePerformanceRadarData(Long teamID){
        List<RadarChartObservation> radarChartObservations = meetingRepository.getTeamPerformanceWeb(teamID);
        if (radarChartObservations.size() > 1){
            List<String> labels = new ArrayList<>();
            List<DataEntryv2> datasets = new ArrayList<>();
            datasets.add(new DataEntryv2(
                    new ArrayList<>(),
                    "rgba(125,87,252,0.2)",
                    "rgb(125,87,252)",
                    "rgb(125,87,252)"
            ));
            for(int i =0; i < radarChartObservations.size(); i++){
                labels.add(radarChartObservations.get(i).getStudentName());
                datasets.getFirst().getData().add(radarChartObservations.get(i).getGradeAverage());
            }
            return new RadarData(
                    labels,
                    datasets
            );
        }
        return new RadarData();
    }

    public List<TopTeam> retrieveTopThreeTeams(Long classroomID){
        if (queueingEntryService.countUniqueTeamsForClassroom(classroomID) == 0){
            return Collections.emptyList();
        }
        Pageable pageable = PageRequest.of(0,3);
        return meetingRepository.topThreeTeams(
                classroomID,
                pageable
        );
    }

    public PieChartData retrieveFacultyPerformanceInClassroom(Long classroomID){
        List<PieChartObservation> observations = meetingRepository.meetingCountPerFaculty(classroomID, List.of(MeetingStatus.ATTENDED_FACULTY_CONDUCTED, MeetingStatus.ATTENDED_QUEUEING_CONDUCTED, MeetingStatus.FOLLOWUP_MEETING));
        List<String> labels = new ArrayList<>();
        DataEntry pieChartDataEntry = new DataEntry(
                new ArrayList<>(),
                new ArrayList<>()
        );
        List<DataEntry> datasets = new ArrayList<>();
        observations.stream()
                .forEach(pieChartObservation -> {
                    if (pieChartObservation.getFacultyName() != null){
                        labels.add(pieChartObservation.getFacultyName());
                        pieChartDataEntry.getData().add(pieChartObservation.getMeetingCount());
                    }
                });

        if(labels.size()>0){
            for(int i = 0; i < labels.size(); i++){
                pieChartDataEntry.getBackgroundColor().add(StringUtility.randomBackgroundColorString(i%(labels.size()-1)));
            }
        }

        datasets.add(pieChartDataEntry);

        return new PieChartData(
                labels,
                datasets
        );
    }

    public ScatterPlotDataset getTeamsPerformance(Long classroomID){
        List<ScatterPlotObservation> observations = meetingRepository.getTeamsPerformance(
                classroomID,
                MeetingStatus.ATTENDED_FACULTY_CONDUCTED,
                MeetingStatus.ATTENDED_QUEUEING_CONDUCTED);

        for(int i = 0; i < observations.size(); i++){
            observations.get(i).setBackgroundColor(StringUtility.randomBackgroundColorString(i));
        }

        return new ScatterPlotDataset(
                observations
        );
    }

    public List<classroomMeetingsTableDTO> getClassroomMeetings(Long classroomID, DaterangeDTO daterangeDTO) {
        List<Object[]> result = meetingRepository.classroomMeetingsTable(
                classroomID,
                daterangeDTO.getStart(),
                daterangeDTO.getEnd()
        );

        // Map the result to classroomMeetingsTableDTO
        List<classroomMeetingsTableDTO> tableDate = new ArrayList<>();
        for (Object[] row : result) {
            String groupName = (String) row[0];
            String facultyName = (String) row[1];
            Long numGradedMeetings = (Long) row[2];
            Long numUngradedMeetings = (Long) row[3];
            Long numFailedMeetings = (Long) row[4];

            classroomMeetingsTableDTO dto = new classroomMeetingsTableDTO(groupName, facultyName, numGradedMeetings, numUngradedMeetings, numFailedMeetings);
            tableDate.add(dto);
        }

        return tableDate;
    }
}
