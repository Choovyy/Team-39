package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Constants;
import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Entities.*;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Middlewares.ClassroomNotFoundException;
import com.QueueIt.capstone.API.Middlewares.QueueingEntryNotFoundException;
import com.QueueIt.capstone.API.Middlewares.QueueingManagerNotFoundException;
import com.QueueIt.capstone.API.Repository.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import com.QueueIt.capstone.API.Repository.CriterionRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private static final Logger log = LoggerFactory.getLogger(FacultyService.class);
    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;

    @Autowired
    private QueueingManagerRepository queueingManagerRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private QueueingEntryRepository queueingEntryRepository;

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private CriterionRepository criterionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Transactional
    public Boolean facultyOpenQueueing(FacultyDTO facultyDTO){
        QueueingManager queueingManager = null;
        try{
            queueingManager =   queueingManagerRepository
                                                .findByFacultyID(facultyDTO.getFacultyID())
                                                .orElseThrow(()->new QueueingManagerNotFoundException("Queueing Manager not found."));
        }catch (QueueingManagerNotFoundException e){
            //creates a new QueueingManager entry in the database
            queueingManager = createQueueingManager(facultyDTO.getFacultyID(), facultyDTO.getFacultyName());
        }

        if(queueingManager == null){
            return Boolean.FALSE;
        }
        log.info("facultyDTO: "+facultyDTO.getCateringLimit().toString());
        queueingManager.setIsActive(Boolean.TRUE);
        queueingManager.setTimeEnds(facultyDTO.getTimeEnds());
        queueingManager.setCateringLimit(facultyDTO.getCateringLimit());
        queueingManagerRepository.save(queueingManager);
        QueueingManager finalQueueingManager = queueingManager;


        if (!facultyDTO.isAllClassrooms()){
            facultyDTO.getCateredClassrooms().forEach(
                    classroomID -> {
                        try{
                            Classroom foo = classroomRepository
                                    .findById(classroomID)
                                    .orElseThrow(()->new ClassroomNotFoundException("Classroom does not exist."));
//                            finalQueueingManager.getCateredClassrooms().add(foo);
                            foo.addQueueingManager(finalQueueingManager);
                        }catch (ClassroomNotFoundException e){
                            Classroom foo = new Classroom(classroomID);
                            foo.addQueueingManager(finalQueueingManager);
                            classroomRepository.save(foo);
                        }
                    }
            );
            List<Integer> idList = facultyDTO.getCateredClassrooms()
                    .stream()
                    .map(Long::intValue)
                    .toList();
            notificationService.generateNotificationRecipientsForSelectClasses(
                    queueingManager.getFacultyID(),
                    new ClassesIDRequest(idList),
                    Constants.QUEUEIT_FRONTEND_URL+"/queue",
                    queueingManager.getFacultyName()+" is now available for queueing.",
                    NotificationType.QUEUEING_OPEN
            );
        }else{
            // Clear the catered classrooms and remove the reference from each Classroom
            if (queueingManager.getCateredClassrooms() == null) {
                queueingManager.setCateredClassrooms(new ArrayList<>()); // ✅ Prevent NullPointerException
            }

            if (!queueingManager.getCateredClassrooms().isEmpty()) {
                for (Classroom classroom : new ArrayList<>(queueingManager.getCateredClassrooms())) {
                    classroom.getQueueingManagers().remove(queueingManager);
                }
            }
            queueingManager.getCateredClassrooms().clear(); // Clear the list
            notificationService.generateNotificationRecipientsForAllClasses(
                    queueingManager.getFacultyID(),
                    Constants.QUEUEIT_FRONTEND_URL+"/queue",
                    queueingManager.getFacultyName()+" is now available for queueing.",
                    NotificationType.QUEUEING_OPEN
            );
        }

        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+facultyDTO.getFacultyID(), queueingManager);
        return Boolean.TRUE;
    }

    public Boolean facultyCloseQueueing(Long facultyID) throws QueueingManagerNotFoundException {
        QueueingManager queueingManager = queueingManagerRepository
                .findByFacultyID(facultyID)
                .orElseThrow(()-> new QueueingManagerNotFoundException("Queueing Manager not found"));
        if (queueingManager.getCateredClassrooms().isEmpty()){
            notificationService.generateNotificationRecipientsForAllClasses(
                    queueingManager.getFacultyID(),
                    null,
                    queueingManager.getFacultyName()+" has severed the line. Queueing stopped just now.",
                    NotificationType.QUEUEING_CLOSE
            );
        }else{
            List<Integer> idList = queueingManager.getCateredClassrooms()
                    .stream()
                    .map(classroom -> classroom.getClassroomID().intValue())
                    .toList();
            notificationService.generateNotificationRecipientsForSelectClasses(
                    queueingManager.getFacultyID(),
                    new ClassesIDRequest(idList),
                    null,
                    queueingManager.getFacultyName()+" has severed the line. Queueing stopped just now.",
                    NotificationType.QUEUEING_CLOSE
            );
        }
        for (Classroom classroom : new ArrayList<>(queueingManager.getCateredClassrooms())) {
            classroom.getQueueingManagers().remove(queueingManager); // Remove the reference from Classroom
        }
        queueingManager.getCateredClassrooms().clear(); // Clear the list
        queueingManager.goInactive();
        queueingManagerRepository.save(queueingManager);
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+facultyID, queueingManager);

        return Boolean.TRUE;
    }

    public QueueingManager createQueueingManager(Long facultyID, String facultyName){
        try{
            QueueingManager queueingManager = new QueueingManager(facultyID, facultyName);
            return queueingManagerRepository.save(queueingManager);
        } catch (Exception e){
            return null;
        }
    }

    public QueueingManager getFacultyQueueingManager(Long facultyID) throws QueueingManagerNotFoundException {
        return queueingManagerRepository
                .findByFacultyID(facultyID)
                .orElseThrow(()-> new QueueingManagerNotFoundException("Queueing Manager not found"));
    }

    @Transactional
    public Boolean admitQueueingEntry(QueueingEntryDTO queueingEntryDTO) throws QueueingEntryNotFoundException, QueueingManagerNotFoundException {
        QueueingEntry queueingEntry = queueingEntryRepository
                .findById(queueingEntryDTO.getQueueingEntryID())
                .orElseThrow(()-> new QueueingEntryNotFoundException("Queueing entry not found"));

        QueueingManager queueingManager = queueingManagerRepository
                .findById(queueingEntry.getQueueingManager().getQueueingManagerID())
                .orElseThrow(()->new QueueingManagerNotFoundException("Queueing manager not found."));

        Meeting meeting = new Meeting(
            MeetingStatus.ATTENDED_QUEUEING_CONDUCTED,
            queueingEntry,
            queueingManager
        );

        meetingRepository.save(meeting);

        queueingManager.setQueueingEntryToTending(queueingEntry, meeting);

        queueingManagerRepository.save(queueingManager);

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingManager.getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingManager.getFacultyID(), queueingManager);

        return Boolean.TRUE;
    }

    @Transactional
    public void concludeMeeting(ConcludeMeetingDTO concludeMeetingDTO, Long meetingID) {
        Meeting meeting = meetingRepository.findById(meetingID)
                .orElseThrow(()->new RuntimeException("Meeting not found."));

        if (concludeMeetingDTO.getIsFollowup()){
            meeting.setMeetingStatus(MeetingStatus.FOLLOWUP_MEETING);
        }else{
            concludeMeetingDTO.getGrades().forEach(gradeDTO -> {
                Criterion criterion = criterionRepository.findById(gradeDTO.getCriterionID())
                        .orElseThrow(() -> new RuntimeException("Criterion with id " + gradeDTO.getCriterionID() + " not found"));
                Grade tempGrade = new Grade(
                        meeting,
                        criterion,
                        gradeDTO.getStudentName(),
                        gradeDTO.getMark(),
                        gradeDTO.getWeightedGrade()
                );
                Grade savedGrade = gradeRepository.save(tempGrade);
                meeting.getGrades().add(savedGrade);
            });
        }

        List<Attendance> attendanceList = attendanceRepository.findAllById(concludeMeetingDTO.getAttendanceList().stream().map(Attendance::getAttendanceID).toList());
        attendanceList.stream().forEach(
                attendance -> {
                    concludeMeetingDTO.getAttendanceList().stream()
                            .filter(editedAttendanceEntry ->
                                    editedAttendanceEntry.getAttendanceID() == attendance.getAttendanceID()
                            )
                            .findFirst() // Returns Optional<Attendance>
                            .ifPresent(editedAttendance ->
                                    attendance.setAttendanceStatus(editedAttendance.getAttendanceStatus())
                            );
                }
        );

        attendanceRepository.saveAll(attendanceList);

        // Ensure meeting and gradeList are set correctly
        meeting.setEnd(LocalDateTime.now());
        meeting.setNotedAssignedTasks(concludeMeetingDTO.getNotedAssignedTasks());
        meeting.setImpedimentsEncountered(concludeMeetingDTO.getImpedimentsEncountered());
        if (meeting.getMeetingStatus().equals(MeetingStatus.STARTED_MANUALLY)){
            meeting.setMeetingStatus(MeetingStatus.ATTENDED_FACULTY_CONDUCTED);
        }

        if (meeting.getMeetingStatus().equals(MeetingStatus.STARTED_TEAM_INITIATED) || meeting.getMeetingStatus().equals(MeetingStatus.STARTED_FACULTY_INITIATED)){
            meeting.setMeetingStatus(MeetingStatus.ATTENDED_SCHEDULE_CONDUCTED);
        }
        // Save changes
        meetingRepository.save(meeting);

        QueueingManager queueingManager = queueingManagerRepository.findById(concludeMeetingDTO.getQueueingManagerID())
                        .orElseThrow(()-> new RuntimeException("Queueing Manager not found."));

        queueingManager.setMeeting(null);

        queueingManagerRepository.save(queueingManager);

        QueueingEntry queueingEntry = meeting.getQueueingEntry();
        queueingEntry.setQueueingManager(queueingManager);
        queueingEntryRepository.save(queueingEntry);

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingManager.getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingManager.getFacultyID(), queueingManager);
    }

    public List<ClassRecordEntry> generateClassRecord(Long classroomID) {
        List<Object[]> rawResults = meetingRepository.generateClassRecordNative(classroomID);

        return rawResults.stream()
                .map(row -> new ClassRecordEntry(
                        (String) row[0],
                        (double) ((Number) row[1]).floatValue(),
                        (String) row[2]
                ))
                .collect(Collectors.toList());
    }


    public Boolean startAutomatedMeeting(Long meetingID, Long facultyID) {
        Meeting meeting = meetingRepository.findById(meetingID)
                .orElseThrow(()-> new RuntimeException("Meeting not found"));
        QueueingEntry queueingEntry = meeting.getQueueingEntry();
        QueueingManager queueingManager = queueingEntry.getQueueingManager();

        if (!Objects.equals(queueingManager.getFacultyID(), facultyID)){
            throw new RuntimeException("You have no permission to precide over this meeting.");
        }

        if (queueingManager.getMeeting() != null){
            throw new RuntimeException("Please conclude existing meeting with "+queueingManager.getMeeting().getQueueingEntry().getTeamName());
        }
        if (meeting.getMeetingStatus().equals(MeetingStatus.STARTED_AUTOMATED)){
            meeting.setMeetingStatus(MeetingStatus.STARTED_FACULTY_INITIATED);
        }

        List<Integer> teamIDList = new ArrayList<>();
        teamIDList.add(queueingEntry.getTeamID().intValue());

        notificationService.generateNotificationRecipientsForSelectedTeams(
                queueingManager.getFacultyID(),
                new TeamsIDRequest(teamIDList),
                Constants.QUEUEIT_FRONTEND_URL+"/lobby/"+meetingID,
                queueingManager.getFacultyName()+" is now waiting for your team's scheduled consultation.",
                NotificationType.AUTOMATED_APPOINTMENT_STARTED
        );

        queueingManager.setMeeting(meeting);
        queueingManagerRepository.save(queueingManager);

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingManager.getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingManager.getFacultyID(), queueingManager);

        return Boolean.TRUE;
    }
}
