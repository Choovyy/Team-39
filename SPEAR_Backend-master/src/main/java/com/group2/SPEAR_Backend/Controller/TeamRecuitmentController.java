package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.TeamRecuitmentDTO;
import com.group2.SPEAR_Backend.Service.TeamRecuitmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.147.17.37:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8081",
        "http://172.16.103.209:3000",
        "http://172.16.103.209",
        "http://172.16.103.209:8081"
})
public class TeamRecuitmentController {

    @Autowired
    private TeamRecuitmentService trServ;

    @PostMapping("/student/apply")
    public ResponseEntity<?> applyToTeam(@RequestBody Map<String, Object> requestBody) {
        try {
            int teamId = Integer.parseInt(requestBody.get("teamId").toString());
            int studentId = Integer.parseInt(requestBody.get("uid").toString());
            String role = requestBody.get("role").toString();
            String reason = requestBody.get("reason").toString();

            trServ.applyToTeam(teamId, studentId, role, reason);
            return ResponseEntity.ok(Map.of("message", "Application submitted successfully."));
        } catch (NumberFormatException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid number format for teamId or studentId."));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred."));
        }
    }

    @PostMapping("/student/review/{recruitmentId}")
    public ResponseEntity<?> reviewApplication(
            @PathVariable int recruitmentId,
            @RequestBody Map<String, Object> requestBody) {
        try {
            boolean isAccepted = (boolean) requestBody.get("isAccepted");
            String leaderReason = (String) requestBody.getOrDefault("leaderReason", null);

            trServ.reviewApplication(recruitmentId, isAccepted, leaderReason);
            return ResponseEntity.ok(isAccepted ? "Application accepted" : "Application rejected");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/team/{teamId}/pending-applications")
    public ResponseEntity<List<TeamRecuitmentDTO>> getPendingApplications(@PathVariable int teamId) {
        return ResponseEntity.ok(trServ.getPendingApplicationsByTeam(teamId));
    }

    @GetMapping("/student/{studentId}/my-applications")
    public ResponseEntity<List<TeamRecuitmentDTO>> getMyApplications(@PathVariable int studentId) {
        return ResponseEntity.ok(trServ.getApplicationsByStudent(studentId));
    }



}
