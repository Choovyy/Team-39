package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.DTO.*;
import com.QueueIt.capstone.API.Entities.QueueingManager;
import com.QueueIt.capstone.API.Middlewares.QueueingEntryNotFoundException;
import com.QueueIt.capstone.API.Middlewares.QueueingManagerNotFoundException;
import com.QueueIt.capstone.API.Services.AnalyticsService;
import com.QueueIt.capstone.API.Services.FacultyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/faculty")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://172.16.103.209:3000",
    "http://172.16.103.209:5173",
    "http://172.16.103.209:8080"
})
public class FacultyController {

    private static final Logger log = LoggerFactory.getLogger(FacultyController.class);

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/getQueueingManager/{facultyID}")
    private ResponseEntity<Object> getFacultyQueueingManager(@PathVariable Long facultyID){
        try{
            QueueingManager queueingManager = facultyService.getFacultyQueueingManager(facultyID);
            return ResponseEntity.ok(queueingManager);
        }catch (QueueingManagerNotFoundException e){
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/openQueueing")
    private ResponseEntity<Object> facultyOpenQueueing(@RequestBody FacultyDTO facultyDTO){
        log.info(facultyDTO.toString());
        Boolean isOpen = facultyService.facultyOpenQueueing(facultyDTO);
        return ResponseEntity.ok("Queueing successfully opened.");
    }

    @PostMapping("/closeQueueing/{facultyID}")
    private ResponseEntity<Object> facultyCloseQueueing(@PathVariable Long facultyID){
        try{
            Boolean isClose = facultyService.facultyCloseQueueing(facultyID);
            return ResponseEntity.ok("Queueing closed.");
        }catch (QueueingManagerNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/admitQueueingEntry")
    private ResponseEntity<Object> facultyAdmitQueueingEntry(@RequestBody  QueueingEntryDTO queueingEntryDTO){
        try{
            Boolean isAdmitted = facultyService.admitQueueingEntry(queueingEntryDTO);
            return ResponseEntity.ok(isAdmitted);
        } catch (QueueingEntryNotFoundException | QueueingManagerNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PostMapping("/concludeMeeting/{meetingID}")
    private ResponseEntity<Object> facultyConcludeMeeting(@RequestBody ConcludeMeetingDTO concludeMeetingDTO, @PathVariable Long meetingID){
//        try{
            facultyService.concludeMeeting(concludeMeetingDTO, meetingID);
            return ResponseEntity.ok(Boolean.TRUE);
//        }catch (Exception e){
//            return ResponseEntity.status(400).body(e.getMessage());
//        }
    }

    @GetMapping("/classroomAnalytics/{classroomID}")
    private ResponseEntity<Object> generateClassroomAnalytics(@PathVariable Long classroomID){
        return ResponseEntity.ok(analyticsService.generateClassroomAnalytics(classroomID));
    }

    @GetMapping("/teamAnalytics/{teamID}")
    private ResponseEntity<Object> generateGroupAnalytics(@PathVariable Long teamID){
        return ResponseEntity.ok(analyticsService.generateGroupAnalytics(teamID));
    }

    @GetMapping("/generateClassRecord/{classroomID}")
    private ResponseEntity<Object> generateClassRecord(@PathVariable Long classroomID){
        return ResponseEntity.ok(facultyService.generateClassRecord(classroomID));
    }


    @GetMapping("/startAutomated/{meetingID}/{facultyID}")
    private ResponseEntity<Object> startAutomatedMeeting(@PathVariable Long meetingID,@PathVariable Long facultyID){
        try{
            return ResponseEntity.ok(facultyService.startAutomatedMeeting(meetingID, facultyID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/approveMilestone/{teamID}/{facultyID}")
    private ResponseEntity<Object> approveMilestone(@PathVariable Long teamID, @PathVariable Long facultyID){
        return null;
    }

    @PostMapping("/meetingsTable/{classroomID}")
    private ResponseEntity<Object> classroomMeetingsTable(@PathVariable Long classroomID, @RequestBody DaterangeDTO daterangeDTO){
        try{
            return ResponseEntity.ok(analyticsService.getClassroomMeetings(classroomID, daterangeDTO));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

}
