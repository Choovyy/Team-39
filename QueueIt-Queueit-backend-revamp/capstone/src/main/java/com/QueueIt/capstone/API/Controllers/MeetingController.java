package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.DTO.AttendanceGradeEditionDTO;
import com.QueueIt.capstone.API.DTO.MeetingDTO;
import com.QueueIt.capstone.API.Entities.Meeting;
import com.QueueIt.capstone.API.Enums.MeetingStatus;
import com.QueueIt.capstone.API.Services.MeetingService;
import org.hibernate.NonUniqueResultException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://172.16.103.209:3000",
    "http://172.16.103.209:5173",
    "http://172.16.103.209:8080"
})
@RequestMapping("/meeting")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping("/teamMeetings/{teamID}")
    public ResponseEntity<Object> retrieveMeetingsForMeetingBoard(@PathVariable Long teamID){
        return ResponseEntity.ok(meetingService.retrieveMeetingsForMeetingBoard(teamID));
    }

    @GetMapping("/teamMeetings/generateSummary/{teamID}")
    public ResponseEntity<Object> generateSummaryReport(@PathVariable Long teamID){
        return ResponseEntity.ok(meetingService.generateSummaryReport(teamID));
    }

    @PostMapping("/teamMeetings/createAppointment")
    public ResponseEntity<Object> createMeetingAppointment(@RequestBody MeetingDTO meetingDTO){
        try{
            return ResponseEntity.ok(meetingService.createMeetingAppointment(meetingDTO, MeetingStatus.SET_MANUALLY));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/teamMeetings/facultyAppointments/{facultyID}")
    public ResponseEntity<Object> retrieveAppointmentsForFaculty(@PathVariable Long facultyID){
        return ResponseEntity.ok(meetingService.retrieveAppointmentsForFaculty(facultyID));
    }

    @PostMapping("/teamMeetings/facultyAppointments/cancel/{meetingID}")
    public ResponseEntity<Object> cancelMeetingAppointment(@PathVariable Long meetingID){
        try{
            meetingService.cancelMeetingAppointment(meetingID);
            return ResponseEntity.ok("Cancelled successfully");
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/teamMeetings/startAppointment/{meetingID}")
    public ResponseEntity<Object> manuallyStartAppointment(@PathVariable Long meetingID){
        try{
            meetingService.manuallyStartAppointment(meetingID);
            return ResponseEntity.ok("Meeting Started.");
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/teamMeetings/spontaneous/{facultyID}")
    public ResponseEntity<Object> createSpontaneousMeeting(@RequestBody MeetingDTO meetingDTO, @PathVariable Long facultyID){
        try{
            meetingService.createSpontaneousMeeting(meetingDTO,facultyID);
            return ResponseEntity.ok("Spontaneous Meeting Started.");
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/teamMeetings/attendanceGradeForEdition")
    public ResponseEntity<Object> getAttendanceAndGradeForEdition(@RequestBody AttendanceGradeEditionDTO attendanceGradeEditionDTO){
        try{
            return ResponseEntity.ok(meetingService.getAttendanceAndGradeForEdition(attendanceGradeEditionDTO));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }


    @PostMapping("/teamMeetings/saveModified")
    public ResponseEntity<Object> saveAttendanceGradeModification(@RequestBody AttendanceGradeEditionDTO attendanceGradeEditionDTO){
        try{
            meetingService.saveAttendanceGradeModification(attendanceGradeEditionDTO);
            return ResponseEntity.ok("saved");
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/teamMeetings/scheduled/{meetingID}")
    public ResponseEntity<Object> lobbyTeam(@PathVariable Long meetingID){
        try{
            meetingService.lobbyTeam(meetingID);
            return ResponseEntity.ok("Lobbied");
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
