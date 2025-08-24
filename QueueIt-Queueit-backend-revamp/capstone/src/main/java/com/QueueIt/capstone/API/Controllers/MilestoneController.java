package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.DTO.MilestoneSetDTO;
import com.QueueIt.capstone.API.Entities.Milestone;
import com.QueueIt.capstone.API.Entities.MilestoneSet;
import com.QueueIt.capstone.API.Middlewares.MilestoneSetAlreadyExistException;
import com.QueueIt.capstone.API.Services.MilestoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/milestone")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://172.16.103.209:3000",
    "http://172.16.103.209:5173",
    "http://172.16.103.209:8080"
})
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    @PostMapping("/createSet")
    public ResponseEntity<Object> createMilestonesSet(@RequestBody MilestoneSetDTO milestoneSetDTO) {
        try {
            if (milestoneService.createMilestoneSet(milestoneSetDTO) != null) {
                return ResponseEntity.ok("Created");
            }
        } catch (MilestoneSetAlreadyExistException e) {
            try{
                milestoneService.updateMilestoneSet(milestoneSetDTO);
            }catch (MilestoneSetAlreadyExistException j){
                return ResponseEntity.ok("Updated");
            }
        }
        return ResponseEntity.status(200).body("Updated");
    }

    @GetMapping("/getSet/{teamID}")
    public ResponseEntity<Object> getMilestoneSet(@PathVariable Long teamID){
        try{
            return ResponseEntity.ok(milestoneService.getMilestoneSet(teamID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }


    @GetMapping("/approveSet/{milestoneSetID}/{facultyID}")
    public ResponseEntity<Object> approveMilestoneSet(@PathVariable Long milestoneSetID, @PathVariable Long facultyID){
        try{
            return ResponseEntity.ok(milestoneService.approveMilestoneSet(milestoneSetID,facultyID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/unlockSet/{milestoneSetID}/{facultyID}")
    public ResponseEntity<Object> unlockMilestoneSet(@PathVariable Long milestoneSetID, @PathVariable Long facultyID){
        try{
            return ResponseEntity.ok(milestoneService.unlockMilestoneSet(milestoneSetID,facultyID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/markTaskComplete/{taskID}/{facultyID}")
    public ResponseEntity<Object> markTaskAsComplete(@PathVariable Long taskID, @PathVariable Long facultyID){
        try{
            return ResponseEntity.ok(milestoneService.markTaskAsComplete(taskID, facultyID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/markTaskIncomplete/{taskID}/{facultyID}")
    public ResponseEntity<Object> markTaskAsIncomplete(@PathVariable Long taskID, @PathVariable Long facultyID){
        try{
            return ResponseEntity.ok(milestoneService.markTaskAsIncomplete(taskID, facultyID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }


    @GetMapping("/getPercentage/{teamID}")
    public ResponseEntity<Object> getMilestoneProgressPercentage(@PathVariable Long teamID){
        try{
            return ResponseEntity.ok(milestoneService.getMilestoneProgressPercentage(teamID));
        }catch (Exception e){
            return ResponseEntity.ok(0);
        }
    }
}
