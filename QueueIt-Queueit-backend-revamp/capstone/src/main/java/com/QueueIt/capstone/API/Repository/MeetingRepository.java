package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Entities.Meeting;
import com.QueueIt.capstone.API.Enums.AttendanceStatus;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {


    @Query("SELECT new com.QueueIt.capstone.API.DTO.MeetingDTO(" +
            "m.meetingID,"+
            "m.notedAssignedTasks, " +
            "m.impedimentsEncountered, " +
            "m.start, " +
            "m.end, " +
            "m.queueingEntry,"+
            "m.meetingStatus) " +
            "FROM Meeting m " +
            "JOIN m.queueingEntry qe " +
            "WHERE qe.teamID = :teamID " +
            "AND m.end IS NOT NULL")
    public List<MeetingDTO> retrieveMeetingsForTeam(@Param("teamID") Long teamID);


    @Query("SELECT m FROM Meeting m " +
            "JOIN FETCH m.queueingEntry qe " +
            "LEFT JOIN FETCH m.grades g " +  // Fetch grades
            "LEFT JOIN FETCH g.criterion c " +  // Fetch criterion
            "LEFT JOIN FETCH c.rubric r " +  // Fetch rubric
            "WHERE qe.teamID = :teamID " +
            "AND m.end IS NOT NULL " +
            "AND m.meetingStatus IN :statusList")
    List<Meeting> retrieveAllMeetingsForSummary(@Param("teamID") Long teamID,
                                                @Param("statusList") List<MeetingStatus> statusList);


    @Query("SELECT m FROM Meeting m " +
            "JOIN m.queueingEntry qe " + // Join with QueueingEntry
            "JOIN qe.queueingManager qm " + // Join with QueueingManager through QueueingEntry
            "WHERE qm.facultyID = :facultyID " + // Use qm.facultyID to filter
            "AND m.meetingStatus IN :status " +
            "AND m.start >= :todayMidnight")
    List<Meeting> retrieveAppointmentsForFaculty(@Param("facultyID") Long facultyID,
                                                 @Param("status") List<MeetingStatus> status,
                                                 @Param("todayMidnight") LocalDateTime todayMidnight);


    @Query("SELECT m FROM Meeting m " +
            "WHERE m.start > :offset " +
            "AND m.start <= :now " +
            "AND m.meetingStatus IN :statusList")
    List<Meeting> retrieveAutomatedMeetings(@Param("offset") LocalDateTime offset,
                                            @Param("now") LocalDateTime now,
                                            @Param("statusList")List<MeetingStatus> statusList);


    @Query(
            "SELECT m FROM Meeting m WHERE m.start >= :now " +
            "AND m.start <= :offset " +
            "AND m.meetingStatus IN :statusList"
    )
    List<Meeting> retrieveMeetingsForReminder(@Param("offset") LocalDateTime offset,
                                              @Param("now") LocalDateTime now,
                                              @Param("statusList") List<MeetingStatus> statusList);

    @Query("SELECT m FROM Meeting m " +
            "WHERE :offset < m.end " +
            "AND :now >= m.end " +
            "AND m.meetingStatus IN :status")
    List<Meeting> retrieveAutomatedMeetingsForDefault(@Param("offset") LocalDateTime offset,
                                                      @Param("now") LocalDateTime now,
                                                      @Param("status") List<MeetingStatus> status);



    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.LowestEngagementDTO(qe.teamName, COUNT(m.meetingID)) " +
                    "FROM Meeting m " +
                    "JOIN m.queueingEntry qe " +
                    "JOIN qe.queueingManager qm " +
                    "WHERE qe.classroomID = :classroomID " +
                    "AND (m.meetingStatus = :attend_faculty OR m.meetingStatus = :attend_queueing) " +
                    "GROUP BY qe.teamName " +
                    "HAVING COUNT(m.meetingID) < (SELECT COUNT(m2.meetingID) * 0.25 FROM Meeting m2 " +
                    "JOIN m2.queueingEntry qe2 WHERE qe2.classroomID = :classroomID) " + // 25% of total meetings
                    "ORDER BY COUNT(m.meetingID) ASC"
    )
    List<LowestEngagementDTO> getLowestEngagingTeamMentor(
            @Param("classroomID") Long classroomID,
            @Param("attend_faculty") MeetingStatus status1,
            @Param("attend_queueing") MeetingStatus status2,
            Pageable pageable
    );



    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.StudentAtRiskForKickOut(" +
                    "a.firstname, a.lastname, COUNT(DISTINCT a.attendanceID), AVG(g.mark), " +
                    "(SUM(CASE WHEN a.attendanceStatus = :attendanceStatus THEN 1 ELSE 0 END) * 100.0 / COUNT(a.attendanceID))" +
                    ") " +
                    "FROM Meeting m " +
                    "JOIN m.queueingEntry qe " +
                    "JOIN qe.attendanceList a " +
                    "JOIN m.grades g " +
                    "WHERE qe.classroomID = :classroomID " +
                    "GROUP BY a.firstname, a.lastname " +
                    "HAVING AVG(g.mark) < 3 OR " +
                    "(SUM(CASE WHEN a.attendanceStatus = :attendanceStatus THEN 1 ELSE 0 END) * 100.0 / COUNT(a.attendanceID)) < 60"
    )
    List<StudentAtRiskForKickOut> getStudentsAtRiskForKickOut(
            @Param("classroomID") Long classroomID,
            @Param("attendanceStatus") AttendanceStatus attendanceStatus
    );



    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.TopTeam(qe.teamName, AVG(g.mark)) " +
                    "FROM Meeting m JOIN m.queueingEntry qe " +
                    "JOIN m.grades g " +
                    "WHERE qe.classroomID = :classroomID " +
                    "GROUP BY qe.teamName " +
                    "ORDER BY AVG(g.mark) DESC"
    )
    List<TopTeam> topThreeTeams(
            @Param("classroomID") Long classroomID,
            Pageable pageable
    );


    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.PieChartObservation(qm.facultyName, count(m.meetingID)) " +
                    "FROM Meeting m " +
                    "JOIN m.queueingEntry qe " +
                    "JOIN qe.queueingManager qm " +
                    "WHERE qe.classroomID = :classroomID AND m.meetingStatus IN :meetingStatusList " +
                    "GROUP BY qm.facultyName"
    )
    List<PieChartObservation> meetingCountPerFaculty(@Param("classroomID") Long classroomID,
                                                     @Param("meetingStatusList") List<MeetingStatus> meetingStatusList);


//    @Query(
//            "SELECT new com.QueueIt.capstone.API.DTO.ScatterPlotObservation( " +
//                    "   qe.teamName, " +
//                    "   AVG(g.mark), " +  // Correctly computes team-wide grade avg
//                    "   COUNT(DISTINCT m.meetingID) " +  // Correctly counts unique meetings
//                    ") " +
//                    "FROM Meeting m " +
//                    "JOIN m.queueingEntry qe " +
//                    "JOIN Grade g ON g.meeting = m " +
//                    "WHERE qe.classroomID = :classroomID " +
//                    "AND (m.meetingStatus = :attendQueueing OR m.meetingStatus = :attendFaculty) " +
//                    "GROUP BY qe.teamName"
//    )
    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.ScatterPlotObservation( " +
                    "   qe.teamName, " +
                    "   AVG(g.mark), " +  // Directly compute team-wide grade average
                    "   COUNT(DISTINCT m.meetingID) " +  // Correct meeting count
                    ") " +
                    "FROM Meeting m " +
                    "JOIN m.queueingEntry qe " +
                    "JOIN Grade g ON g.meeting = m " +  // Join Grade directly
                    "WHERE (m.meetingStatus = :attendQueueing OR m.meetingStatus = :attendFaculty) " +
                    "AND qe.classroomID = :classroomID " +
                    "GROUP BY qe.teamName"
    )
    List<ScatterPlotObservation> getTeamsPerformance(
            @Param("classroomID") Long classroomID,
            @Param("attendQueueing") MeetingStatus status1,  // Matches JPQL
            @Param("attendFaculty") MeetingStatus status2   // Matches JPQL
    );



    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.HistogramObservation(CONCAT(a.firstname,' ',a.lastname), COUNT(a.attendanceID)) " +
                    "FROM Meeting m JOIN m.queueingEntry qe JOIN qe.attendanceList a " +
                    "WHERE qe.teamID = :teamID AND m.meetingStatus IN :meetingStatus AND a.attendanceStatus IN :attendanceStatus " +
                    "GROUP BY a.studentEmail"
    )
    public List<HistogramObservation> getAttendanceHistogram(
            @Param("teamID") Long teamID,
            @Param("attendanceStatus") List<AttendanceStatus> attendanceStatusList,
            @Param("meetingStatus") List<MeetingStatus> meetingStatuses
    );


    @Query(
            "SELECT new com.QueueIt.capstone.API.DTO.RadarChartObservation(g.studentName, AVG(g.mark)) " +
                    "FROM Grade g JOIN g.meeting m JOIN m.queueingEntry qe " +
                    "WHERE qe.teamID = :teamID GROUP BY g.studentName"
    )
    public List<RadarChartObservation> getTeamPerformanceWeb(
            @Param("teamID") Long teamID
    );


    @Query(
            value = """
                    SELECT\s
                        meeting_total.student_name,\s
                        meeting_total.grade_sum AS final_avg,\s
                        meeting_total.team_name
                    FROM (
                        -- Compute total weighted sum per meeting per student
                        SELECT\s
                            g.student_name,\s
                            qe.team_name,\s
                            m.meetingID,\s
                            AVG(
                                CASE WHEN r.is_weighted = 1\s
                                    THEN g.weighted_grade\s
                                    ELSE g.mark\s
                                END
                            ) AS grade_sum
                        FROM grade g
                        JOIN criterion c ON g.criterion_id = c.criterionID
                        JOIN rubric r ON c.rubric_id = r.id
                        JOIN meeting m ON g.meeting_id = m.meetingID
                        JOIN queueing_entry qe ON m.queueing_entry_id = qe.queueing_entryid
                        WHERE qe.classroomID = :classroomID
                          AND m.meeting_status IN (
                              'ATTENDED_QUEUEING_CONDUCTED',\s
                              'ATTENDED_FACULTY_CONDUCTED',\s
                              'ATTENDED_SCHEDULE_CONDUCTED'
                          )
                        GROUP BY g.student_name
                    ) AS meeting_total
                    GROUP BY meeting_total.student_name, meeting_total.team_name;
                    """,
            nativeQuery = true
    )
    List<Object[]> generateClassRecordNative(@Param("classroomID") Long classroomID);

    @Query(
            value = "SELECT \n" +
                    "    queueing_entry.team_name AS groupName, \n" +
                    "    queueing_manager.faculty_name AS facultyName, \n" +
                    "    COUNT(CASE \n" +
                    "        WHEN meeting.meeting_status = 'ATTENDED_FACULTY_CONDUCTED' \n" +
                    "          OR meeting.meeting_status = 'ATTENDED_QUEUEING_CONDUCTED' \n" +
                    "          OR meeting.meeting_status = 'ATTENDED_SCHEDULE_CONDUCTED' \n" +
                    "        THEN 1 END) AS numGradedMeetings, \n" +
                    "    COUNT(CASE \n" +
                    "        WHEN meeting.meeting_status = 'FOLLOWUP_MEETING' \n" +
                    "        THEN 1 END) AS numUngradedMeetings, \n" +
                    "    COUNT(CASE \n" +
                    "        WHEN meeting.meeting_status = 'FAILED_TEAM_NO_SHOW' \n" +
                    "          OR meeting.meeting_status = 'FAILED_FACULTY_NO_SHOW' \n" +
                    "          OR meeting.meeting_status = 'FAILED_DEFAULTED' \n" +
                    "          OR meeting.meeting_status = 'CANCELLED' \n" +
                    "        THEN 1 END) AS numFailedMeetings\n" +
                    "FROM meeting \n" +
                    "JOIN queueing_entry ON meeting.queueing_entry_id = queueing_entry.queueing_entryid\n" +
                    "JOIN queueing_manager ON queueing_entry.queueing_manager_id = queueing_manager.queueing_managerid\n" +
                    "WHERE queueing_entry.classroomid = :classroomID AND meeting.start >= :start AND meeting.start <= :end\n" +
                    "group by groupName, facultyName\n" +
                    "order by groupName\n",
            nativeQuery = true
    )
    List<Object[]> classroomMeetingsTable(@Param("classroomID") Long classroomID,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);
}
