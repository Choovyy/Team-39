package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Constants;
import com.QueueIt.capstone.API.DTO.MeetingDTO;
import com.QueueIt.capstone.API.DTO.TeamsIDRequest;
import com.QueueIt.capstone.API.Entities.Attendance;
import com.QueueIt.capstone.API.Entities.Meeting;
import com.QueueIt.capstone.API.Enums.AttendanceStatus;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Middlewares.QueueingManagerNotFoundException;
import com.QueueIt.capstone.API.Repository.AttendanceRepository;
import com.QueueIt.capstone.API.Repository.MeetingRepository;
import com.QueueIt.capstone.API.Repository.QueueingManagerRepository;
import com.QueueIt.capstone.API.Utilities.DateUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduledTasksService {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private APIService apiService;

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private QueueingManagerRepository queueingManagerRepository;

    @Scheduled(cron = "0 0,30 8-17 * * 1-5")
    public void manageMeetings(){
        LocalDateTime fiveMinuteOffsetFromNow = LocalDateTime.now().minusMinutes(5);
        LocalDateTime tenMinuteOffset = LocalDateTime.now().minusMinutes(10);
        LocalDateTime now = LocalDateTime.now();


        //[1] retrieves the meetings that were created via automation @midnight of this day
        //that is supposed to start at n:00 or n:30 or 5 minutes before that.
        // e.g: 7:55 - 8:00 or 8:25 - 8:30 ... 4:25 : 4:30
        // that has a meeting status of SET_AUTOMATICALLY

        startMeetings(fiveMinuteOffsetFromNow, now);

        defaultMeetings(fiveMinuteOffsetFromNow, now);

    }

    //runs every midnight every weekday
    //creates meetings for each week day
    @Scheduled(cron = "0 0 0 * * 1-5")
//    @Scheduled(cron = "0 49 * * * 1-5")
    public void createScheduledMeetingsForToday(){
        System.out.println("\n\n*** Scheduled Meetings Generation Function Ran @ "+DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now())+" ***\n\n");
        //WebClient is supposed to do subscribe, according to blackbox.
        apiService.fetchTeamsForAutomationTodayFromSpear()
                .subscribe(teams -> {
                    if (teams != null && !teams.isEmpty()){
                        teams.stream()
                                .forEach(team -> {
                                    //in here, I reused meeting service on creating meeting appointments
                                    //thus creating a new MeetingDTO and passing MeetingStatus.SET_AUTOMATED

                                    List<Attendance> attendanceList = new ArrayList<>();

                                    for (int i =0; i<team.getMemberIds().size(); i++){
                                        String[] fullname = team.getMemberNames().get(i).split(" ");
                                        String firstname = fullname[0];
                                        String lastname = fullname[1];
                                        Attendance attendance = new Attendance(
                                                firstname+"."+lastname+"@cit.edu",
                                                firstname,
                                                lastname,
                                                AttendanceStatus.PRESENT
                                        );

                                        attendanceList.add(attendance);
                                    }

                                    //Spear stored their time as LocalTime, and start and end in queueit is LocalDatetime
                                    //Since the WebClient retrieves teams for today each weekday, so we know that today is a weekday
                                    //So I just combined today's day and the LocalTime of start and end provided by spear
                                    LocalDateTime startTime = LocalDateTime.of(LocalDate.now(), team.getStart());
                                    LocalDateTime endTime = LocalDateTime.of(LocalDate.now(), team.getEnd());


                                    MeetingDTO meetingDTO = new MeetingDTO(
                                            startTime,
                                            endTime,
                                            attendanceList,
                                            team.getAdviserId(),
                                            team.getTid(),
                                            team.getGroupName(),
                                            team.getClassId(),
                                            team.getAdviserName()
                                    );

                                    try{
                                        meetingService.createMeetingAppointment(meetingDTO, MeetingStatus.SET_AUTOMATED);
                                        
                                    }catch (QueueingManagerNotFoundException e){
                                        System.out.println(e.getMessage());
                                    }
                                });
                    }
                }, error ->{
                   System.err.println("Error fetching teams: "+error.getMessage());
                });
    }


    //all the meetings that were created prior to this method has a status of SET_AUTOMATED
    //meaning igo ra sha na create, wala pa sha masugdi
    //so ato sha sugdan automatically via this scheduled method or STARTED_AUTOMATED.
    //nya if kinsay una maka sulod sa meeting, ang status ilisan.
    //e.g a team member naka sud una sa meeting, meetingStatus = MeetingStatus.STARTED_TEAM_INITIATED,
    // if faculty maka una then meetingStatus = STARTED_FACULTY_INITIATED,
    public void startMeetings(LocalDateTime fiveMinuteOffsetFromNow, LocalDateTime now){
        System.out.println("\n\n!!! Automated Starting of Meetings Function Ran @ "+DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now())+" !!!\n\n");

        List<MeetingStatus> statusList = new ArrayList<>();
        statusList.add(MeetingStatus.SET_AUTOMATED);
        List<Meeting> retrievedMeetings = meetingRepository.retrieveAutomatedMeetings(fiveMinuteOffsetFromNow,now,statusList);
        retrievedMeetings.stream()
                .forEach(meeting -> {
                    meeting.setMeetingStatus(MeetingStatus.STARTED_AUTOMATED);
                    notificationService.generateEnqueueNotificationForFaculty(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            meeting.getQueueingEntry().getTeamID(),
                            null,
                            "The system generated appointment with " + meeting.getQueueingEntry().getTeamName()+" has now started.",
                            NotificationType.AUTOMATED_APPOINTMENT_STARTED
                    );
                    List<Integer> teamIDs = new ArrayList<>();
                    teamIDs.add(meeting.getQueueingEntry().getTeamID().intValue());
                    notificationService.generateNotificationRecipientsForSelectedTeams(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            new TeamsIDRequest(teamIDs),
                            Constants.QUEUEIT_FRONTEND_URL+"/meetingLobby/"+meeting.getMeetingID(),
                            "The system generated appointment with " + meeting.getQueueingEntry().getQueueingManager().getFacultyName()+" has now started. Click this notification to get you lobbied.",
                            NotificationType.AUTOMATED_APPOINTMENT_STARTED
                    );
                });

        meetingRepository.saveAll(retrievedMeetings);
    }


    //if ang method prio ani, naabot nalang sa end time niya, nya iyang satatus STARTED_AUTOMATED gihapon
    //meaning way nitunga sa either sides, team ug faculty.
    //so set nato siya as Defaulted
    public void defaultMeetings(LocalDateTime fiveMinuteOffsetFromNow, LocalDateTime now){
        System.out.println("\n\n~ ~ ~ Defaulting of Automated Meetings Function Ran @ "+ DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now()) +" ~ ~ ~\n\n");
        List<MeetingStatus> statusList = new ArrayList<>();
        statusList.add(MeetingStatus.STARTED_AUTOMATED);
        statusList.add(MeetingStatus.STARTED_FACULTY_INITIATED);
        statusList.add(MeetingStatus.STARTED_TEAM_INITIATED);
        List<Meeting> retrievedMeetings = meetingRepository.retrieveAutomatedMeetingsForDefault(fiveMinuteOffsetFromNow,now,statusList);
        retrievedMeetings.stream()
                .forEach(meeting -> {
                    switch(meeting.getMeetingStatus()){
                        case MeetingStatus.STARTED_AUTOMATED ->
                                meeting.setMeetingStatus(MeetingStatus.FAILED_DEFAULTED);
                        case MeetingStatus.STARTED_FACULTY_INITIATED ->
                                meeting.setMeetingStatus(MeetingStatus.FAILED_TEAM_NO_SHOW);
                        case MeetingStatus.STARTED_TEAM_INITIATED ->
                                meeting.setMeetingStatus(MeetingStatus.FAILED_FACULTY_NO_SHOW);
                    }

                    notificationService.generateEnqueueNotificationForFaculty(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            meeting.getQueueingEntry().getTeamID(),
                            Constants.QUEUEIT_FRONTEND_URL+"/availability",
                            "The system generated appointment with " + meeting.getQueueingEntry().getTeamName()+" has been defaulted.",
                            NotificationType.APPOINTMENT_DEFAULTED
                    );
                    List<Integer> teamIDs = new ArrayList<>();
                    teamIDs.add(meeting.getQueueingEntry().getTeamID().intValue());
                    notificationService.generateNotificationRecipientsForSelectedTeams(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            new TeamsIDRequest(teamIDs),
                            null,
                            "The system generated appointment with " + meeting.getQueueingEntry().getQueueingManager().getFacultyName()+" has been defaulted.",
                            NotificationType.APPOINTMENT_DEFAULTED
                    );
                });

        meetingRepository.saveAll(retrievedMeetings);
    }

    @Scheduled(cron = "0 20,50 8-17 * * 1-5")
    public void remindMeetings(){
        System.out.println("\n\n@@@ Meeting Reminder Script ran @ "+DateUtility.formatLocalDateTimeToReadable(LocalDateTime.now())+" ~ ~ ~\n\n");
        LocalDateTime offset = LocalDateTime.now().plusMinutes(15);
        LocalDateTime now = LocalDateTime.now();
        List<MeetingStatus> statusList = new ArrayList<>();
        statusList.add(MeetingStatus.SET_AUTOMATED);
        statusList.add(MeetingStatus.SET_MANUALLY);
        List<Meeting> retrievedMeetings = meetingRepository.retrieveMeetingsForReminder(offset,now,statusList);
        retrievedMeetings.stream()
                .forEach(meeting -> {
                    List<Integer> teamsIDList = new ArrayList<>();
                    teamsIDList.add(meeting.getQueueingEntry().getTeamID().intValue());
                    notificationService.generateNotificationRecipientsForSelectedTeams(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            new TeamsIDRequest(teamsIDList),
                            Constants.QUEUEIT_FRONTEND_URL+"/lobby/"+meeting.getMeetingID(),
                            "Your appointment with "+meeting.getQueueingEntry().getQueueingManager().getFacultyName()+" will start in 10 minutes. You can click this notification as early as now to be lobbied and wait for the faculty member.",
                            NotificationType.REMINDER
                    );

                    notificationService.generateEnqueueNotificationForFaculty(
                            meeting.getQueueingEntry().getQueueingManager().getFacultyID(),
                            meeting.getQueueingEntry().getTeamID(),
                            null,
                            "Your appointment with "+meeting.getQueueingEntry().getTeamName()+" will start in 10 minutes. You can click this notification to start this meeting as early as now, as they might be already in the lobby.",
                            NotificationType.REMINDER
                    );
                });
    }
}
