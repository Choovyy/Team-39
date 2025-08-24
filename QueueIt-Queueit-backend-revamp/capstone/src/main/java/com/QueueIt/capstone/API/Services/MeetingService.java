package com.QueueIt.capstone.API.Services;


import com.QueueIt.capstone.API.Constants;
import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Entities.*;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Middlewares.QueueingManagerNotFoundException;
import com.QueueIt.capstone.API.Repository.*;
import com.QueueIt.capstone.API.Utilities.DateUtility;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingService.class);
    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private QueueingManagerRepository queueingManagerRepository;

    @Autowired
    private QueueingService queueingService;

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private QueueingEntryRepository queueingEntryRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private APIService apiService;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;


    public List<MeetingDTO> retrieveMeetingsForMeetingBoard(Long teamID){
        List<MeetingDTO> meetingList = meetingRepository.retrieveMeetingsForTeam(teamID);
        List<MeetingDTO> meetingDTOList = new ArrayList<>();

        meetingList.stream()
                        .forEach(meetingDTO -> {
                            meetingDTOList.add(
                                    new MeetingDTO(
                                            meetingDTO.getMeetingID(),
                                            meetingDTO.getNotedAssignedTasks(),
                                            meetingDTO.getImpedimentsEncountered(),
                                            meetingDTO.getStart(),
                                            meetingDTO.getEnd(),
                                            meetingDTO.getQueueingEntry().getAttendanceList(),
                                            meetingDTO.getMeetingStatus()
                                    )
                            );
                        });

        meetingDTOList.stream()
                .sorted(Comparator.comparing(MeetingDTO::getStart))
                .toList();

        return meetingDTOList;
    }

    public ReportSummary generateSummaryReport(Long teamID) {
        List<MeetingStatus> statusList = new ArrayList<>();
        statusList.add(MeetingStatus.ATTENDED_FACULTY_CONDUCTED);
        statusList.add(MeetingStatus.ATTENDED_QUEUEING_CONDUCTED);
        List<Meeting> meetings = meetingRepository.retrieveAllMeetingsForSummary(teamID, statusList);

        ReportSummary reportSummary = new ReportSummary();
        AtomicInteger counter = new AtomicInteger(1);

        meetings.stream()
                .sorted(Comparator.comparing(Meeting::getStart))
                .forEach(meeting -> {
                    meeting.getQueueingEntry().getAttendanceList().stream()
                            .forEach(attendance -> {
                                // Filter grades based on the student's name
                                List<Grade> studentGrades = meeting.getGrades().stream()
                                        .filter(grade -> grade.getStudentName().equals(
                                                attendance.getFirstname() + " " +
                                                        attendance.getLastname()))
                                        .collect(Collectors.toList());
                                Float sum = (float) 0;
                                Float gradeAverage = (float) 0;
                                // Calculate the sum of grades
                                // Check if grades are present and avoid lazy loading issues
                                if (!meeting.getGrades().isEmpty()) {
                                    Grade firstGrade = meeting.getGrades().getFirst();
                                    if (firstGrade.getCriterion() != null &&
                                            firstGrade.getCriterion().getRubric() != null &&
                                            firstGrade.getCriterion().getRubric().getIsWeighted()) {

                                        sum = studentGrades.stream()
                                                .map(Grade::getWeightedGrade)
                                                .reduce(0.0f, Float::sum);

                                        gradeAverage = studentGrades.isEmpty() ? 0.0f : sum;

                                    } else {
                                        sum = studentGrades.stream()
                                                .map(Grade::getMark)
                                                .reduce(0.0f, Float::sum);
                                        gradeAverage = studentGrades.isEmpty() ? 0.0f : sum / studentGrades.size();
                                    }
                                }

                                // Round to one decimal place using BigDecimal
                                BigDecimal bd = new BigDecimal(gradeAverage);
                                bd = bd.setScale(1, RoundingMode.HALF_UP); // Rounds to the nearest tenth
                                Float roundedAverage = bd.floatValue(); // Convert back to float if needed

                                // Create the report summary entry
                                ReportSummaryEntry reportSummaryEntry = new ReportSummaryEntry(
                                        counter.get(),
                                        meeting.getStart(),
                                        roundedAverage,
                                        attendance.getFirstname() + " " + attendance.getLastname()
                                );

                                reportSummary.getReportSummaryEntryList().add(reportSummaryEntry);
                            });
                    counter.getAndAdd(1);
                });

        return reportSummary;
    }

    @Transactional
    public Meeting createMeetingAppointment(MeetingDTO meetingDTO, MeetingStatus meetingStatus) throws QueueingManagerNotFoundException {
        QueueingManager queueingManager = null;
        try{
            queueingManager = queueingManagerRepository
                    .findByFacultyID(meetingDTO.getMentorID())
                    .orElseThrow(()-> new QueueingManagerNotFoundException("Queueing manager for faculty not found."));
        }catch (QueueingManagerNotFoundException e){
            queueingManager = facultyService.createQueueingManager(meetingDTO.getMentorID(), meetingDTO.getFacultyName());
        }

        if (queueingManager == null){
            throw new QueueingManagerNotFoundException("Queueing manager for faculty not found.");
        }

        QueueingEntryDTO queueingEntryDTO = new QueueingEntryDTO();
        queueingEntryDTO.setFacultyID(meetingDTO.getMentorID());
        queueingEntryDTO.setTeamID(meetingDTO.getTeamID());
        queueingEntryDTO.setAttendanceList(meetingDTO.getAttendanceList());
        queueingEntryDTO.setClassroomID(meetingDTO.getClassroomID());
        queueingEntryDTO.setClassReference(meetingDTO.getTeamID().toString());
        queueingEntryDTO.setTeamName(meetingDTO.getTeamName());

        QueueingEntry queueingEntry = queueingService.createQueueingEntry(queueingEntryDTO, queueingManager);
        Meeting savedMeeting = meetingRepository.save(new Meeting(
                meetingDTO.getStart(),
                meetingDTO.getEnd(),
                meetingStatus,
                queueingEntry,
                queueingManager
        ));
        List<Integer> teamsID = new ArrayList<>();
        teamsID.add(queueingEntryDTO.getTeamID().intValue());
        if(meetingStatus.equals(MeetingStatus.SET_AUTOMATED)){
            notificationService.generateNotificationRecipientsForSelectedTeams(
                    queueingManager.getFacultyID(),
                    new TeamsIDRequest(teamsID),
                    null,
                    "You have an appointment with " + queueingManager.getFacultyName() + " on "
                            + DateUtility.formatLocalDateTimeToReadable(savedMeeting.getStart())+" that has been generated by the system.",
                    NotificationType.APPOINTMENT_SET
            );

            notificationService.generateEnqueueNotificationForFaculty(
                    meetingDTO.getMentorID(),
                    meetingDTO.getTeamID(),
                    Constants.QUEUEIT_FRONTEND_URL+"/availability",
                    "You have an appointment today with "+meetingDTO.getTeamName()+" at "+DateUtility.formatLocalDateTimeToReadable(savedMeeting.getStart())+" that has been generated by the system.",
                    NotificationType.APPOINTMENT_SET
            );
        }else{
            notificationService.generateNotificationRecipientsForSelectedTeams(
                    queueingManager.getFacultyID(),
                    new TeamsIDRequest(teamsID),
                    null,
                    (savedMeeting.getMeetingStatus() == MeetingStatus.ATTENDED_FACULTY_CONDUCTED)
                            ? "Your meeting with " + meetingDTO.getFacultyName() + " started spontaneously."
                            : "You have an appointment with " + queueingManager.getFacultyName() + " on "
                            + DateUtility.formatLocalDateTimeToReadable(savedMeeting.getStart()),
                    NotificationType.APPOINTMENT_SET
            );
        }

        return savedMeeting;
    }

    public List<MeetingDTO> retrieveAppointmentsForFaculty(Long facultyID) {
        LocalDateTime todayMidnight = LocalDate.now().atStartOfDay();
        List<Meeting> meetings = meetingRepository.retrieveAppointmentsForFaculty(
                facultyID,
                List.of(MeetingStatus.SET_MANUALLY,
                        MeetingStatus.SET_AUTOMATED,
                        MeetingStatus.STARTED_AUTOMATED,
                        MeetingStatus.STARTED_FACULTY_INITIATED,
                        MeetingStatus.STARTED_MANUALLY,
                        MeetingStatus.FOLLOWUP_MEETING,
                        MeetingStatus.STARTED_TEAM_INITIATED,
                        MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED,
                        MeetingStatus.ATTENDED_FACULTY_CONDUCTED),
                todayMidnight);
        List<MeetingDTO> events = new ArrayList<>();

        meetings.stream()
                .forEach(meeting -> {
                    MeetingDTO foo = new MeetingDTO(
                            meeting.getMeetingID(),
                            meeting.getStart(),
                            meeting.getEnd(),
                            meeting.getQueueingEntry().getTeamName(),
                            meeting.getMeetingStatus()
                    );
                    events.add(foo);
                });

        return events;
    }

    @Transactional
    public void cancelMeetingAppointment(Long meetingID){
        Meeting meeting = meetingRepository.findById(meetingID)
                .orElseThrow(()-> new RuntimeException("Meeting not found"));
        meeting.setMeetingStatus(MeetingStatus.CANCELLED);
        meetingRepository.save(meeting);
        List<Integer> teamsID = new ArrayList<>();
        teamsID.add(meeting.getQueueingEntry().getTeamID().intValue());
        notificationService.generateNotificationRecipientsForSelectedTeams(
                meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                new TeamsIDRequest(teamsID),
                null,
                "Your appointment with "+meeting.getQueueingEntry().getQueueingManager().getFacultyName()+" on "+ DateUtility.formatLocalDateTimeToReadable(meeting.getStart())+" has been cancelled.",
                NotificationType.APPOINTMENT_CANCELLED
        );
    }

    public void manuallyStartAppointment(Long meetingID) {

        Meeting meeting = meetingRepository.findById(meetingID)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        QueueingEntry queueingEntry = meeting.getQueueingEntry();
        if (queueingEntry == null) {
            throw new RuntimeException("Queueing Entry not found.");
        }

        QueueingManager queueingManager = null;
        try{
            queueingManager =   queueingManagerRepository
                    .findByFacultyID(queueingEntry.getQueueingManager().getFacultyID())
                    .orElseThrow(()->new QueueingManagerNotFoundException("Queueing Manager not found."));
        }catch (QueueingManagerNotFoundException e){
            //creates a new QueueingManager entry in the database
            queueingManager = facultyService.createQueueingManager(queueingEntry.getQueueingManager().getFacultyID(), queueingEntry.getQueueingManager().getFacultyName());
        }

        if(queueingManager == null){
            throw new RuntimeException("Queueing Manager not found.");
        }

        if (queueingManager.getMeeting() == null) {
            meeting.setMeetingStatus(MeetingStatus.STARTED_MANUALLY);
            meeting.setStart(LocalDateTime.now());
            queueingManager.setMeeting(meeting);
            meetingRepository.save(meeting);

            List<Integer> teamIDList = new ArrayList<>();
            teamIDList.add(queueingEntry.getTeamID().intValue());
            notificationService.generateNotificationRecipientsForSelectedTeams(
                    queueingManager.getFacultyID(),
                    new TeamsIDRequest(teamIDList),
                    null,
                    queueingManager.getFacultyName()+" has started your appointment.",
                    NotificationType.MANUALLY_APPOINTMENT_STARTED
            );
        } else {
            throw new RuntimeException("Please conclude existing meeting with "
                    + queueingManager.getMeeting().getQueueingEntry().getTeamName());
        }
        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingManager.getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingManager.getFacultyID(), queueingManager);
    }


    public void createSpontaneousMeeting(MeetingDTO meetingDTO, Long facultyID) throws QueueingManagerNotFoundException {
        meetingDTO.setStart(LocalDateTime.now());
        meetingDTO.setEnd(null);
        QueueingManager queueingManager = null;
        try{
            queueingManager =   queueingManagerRepository
                    .findByFacultyID(facultyID)
                    .orElseThrow(()->new QueueingManagerNotFoundException("Queueing Manager not found."));
        }catch (QueueingManagerNotFoundException e){
            //creates a new QueueingManager entry in the database
            queueingManager = facultyService.createQueueingManager(facultyID, meetingDTO.getFacultyName());
        }

        if(queueingManager == null){
            throw new RuntimeException("Queueing Manager not found.");
        }

        if (queueingManager.getMeeting() == null){
            Meeting createdMeeting = createMeetingAppointment(meetingDTO,MeetingStatus.ATTENDED_FACULTY_CONDUCTED);
            QueueingEntry queueingEntry = createdMeeting.getQueueingEntry();
            queueingManager.setMeeting(createdMeeting);
            meetingRepository.save(createdMeeting);
            List<Integer> teamIDList = new ArrayList<>();
            teamIDList.add(queueingEntry.getTeamID().intValue());
            notificationService.generateNotificationRecipientsForSelectedTeams(
                    queueingManager.getFacultyID(),
                    new TeamsIDRequest(teamIDList),
                    null,
                    queueingManager.getFacultyName()+" has started your appointment.",
                    NotificationType.MANUALLY_APPOINTMENT_STARTED
            );
        }else{
            throw new RuntimeException("Please conclude existing meeting with "
                    + queueingManager.getMeeting().getQueueingEntry().getTeamName());
        }
        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingManager.getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingManager.getFacultyID(), queueingManager);
    }

    public AttendanceGradeEditionDTO getAttendanceAndGradeForEdition(AttendanceGradeEditionDTO attendanceGradeEditionDTO){
        Meeting meeting = meetingRepository.findById(attendanceGradeEditionDTO.getMeetingID())
                .orElseThrow(()->new RuntimeException("Meeting not found."));
        String studentName = attendanceGradeEditionDTO.getFirstName()+" "+attendanceGradeEditionDTO.getLastName();

        List<Grade> grades = gradeRepository.findByStudentNameAndMeeting(studentName, meeting);

        List<Attendance> attendanceList = meeting.getQueueingEntry().getAttendanceList();

        Attendance attendanceEntry = attendanceList.stream()
                .filter(attendance -> attendance.getFirstname().equals(attendanceGradeEditionDTO.getFirstName()) && attendance.getLastname().equals(attendanceGradeEditionDTO.getLastName()))
                .findFirst()
                .orElseThrow(()->new RuntimeException("Attendance for "+attendanceGradeEditionDTO.getFirstName()+" "+attendanceGradeEditionDTO.getLastName()+" not found."));

        return new AttendanceGradeEditionDTO(
                attendanceEntry,
                grades
        );
    }

    public void saveAttendanceGradeModification(AttendanceGradeEditionDTO attendanceGradeEditionDTO){
        Attendance attendance = attendanceRepository.findById(attendanceGradeEditionDTO.getAttendance().getAttendanceID())
                .orElseThrow(()->new RuntimeException("Attendance not found"));

        QueueingEntry queueingEntry = attendance.getQueueingEntry();
        Meeting meeting = queueingEntry.getMeeting();

        if(meeting.getMeetingStatus().equals(MeetingStatus.FOLLOWUP_MEETING)){
                attendance.setAttendanceStatus(attendanceGradeEditionDTO.getAttendance().getAttendanceStatus());
                attendance.setAttendanceNote(attendanceGradeEditionDTO.getAttendance().getAttendanceNote());
                attendanceRepository.save(attendance);

                return;
        }

        List<Grade> grades = gradeRepository.findAllById(
                attendanceGradeEditionDTO.getGrades().stream()
                        .map(Grade::getGradeID)
                        .collect(Collectors.toList()));

        if (grades.isEmpty()){
            throw new RuntimeException("Grades not found.");
        }

        attendance.setAttendanceStatus(attendanceGradeEditionDTO.getAttendance().getAttendanceStatus());
        attendance.setAttendanceNote(attendanceGradeEditionDTO.getAttendance().getAttendanceNote());
        attendanceRepository.save(attendance);

        Map<Long, Grade> gradeMap = attendanceGradeEditionDTO.getGrades().stream()
                .collect(Collectors.toMap(Grade::getGradeID, grade -> grade));

        grades.stream()
                .forEach(grade -> {
                    Grade matchingGrade = gradeMap.get(grade.getGradeID());
                    if (matchingGrade != null) {
                        grade.setMark(matchingGrade.getMark());
                    }else{
                        throw new RuntimeException("Grade missing.");
                    }
                });
        gradeRepository.saveAll(grades);

    }

    public Boolean lobbyTeam(Long meetingID){
        Meeting meeting = meetingRepository.findById(meetingID)
                .orElseThrow(()->new RuntimeException("Meeting not found."));

        QueueingEntry queueingEntry = meeting.getQueueingEntry();
        QueueingManager queueingManager = queueingEntry.getQueueingManager();

        //if started automated pa ang meeting status, meaning silay naka una ug interact sa meeting.
        if (meeting.getMeetingStatus().equals(MeetingStatus.STARTED_AUTOMATED)){
            meeting.setMeetingStatus(MeetingStatus.STARTED_TEAM_INITIATED);
        }


        //since mag agad man ta sa faculty if available na jud sha for consultation,
        // send lang ta ug notif nga si team gahulat na para sa consultation
        notificationService.generateEnqueueNotificationForFaculty(
                queueingManager.getFacultyID(),
                queueingEntry.getTeamID(),
                Constants.QUEUEIT_FRONTEND_URL+"/lobby/"+meetingID,
                queueingEntry.getTeamName()+" is now on the lobby for the scheduled appointment.",
                NotificationType.AUTOMATED_APPOINTMENT_STARTED
        );

        return Boolean.TRUE;
    }


    //commented leave lobby for now, i strict lang sa nato sha sa automation of default sa scheduledtaskservice


//    public Boolean leaveLobbyMarkAdviserLate(Long meetingID){
//        Meeting meeting = meetingRepository.findById(meetingID)
//                .orElseThrow(()-> new RuntimeException("Meeting not found"));
//
//
//        //if dili ang team naka una ug interact nor naka interact ba sila at all,
//        // then it doesn't make sense nga ipa late nila ang faculty
//        if (!meeting.getMeetingStatus().equals(MeetingStatus.STARTED_TEAM_INITIATED)){
//            throw new RuntimeException("Cannot justify marking faculty as late, when team itself is late.");
//        }
//
//
//        QueueingEntry queueingEntry = meeting.getQueueingEntry();
//        QueueingManager queueingManager = queueingEntry.getQueueingManager();
//
//
//    }

}
