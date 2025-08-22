package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.TeamInvitationDTO;
import com.group2.SPEAR_Backend.Service.TeamInvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invitations")
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
public class TeamInvitationController {

    @Autowired
    private TeamInvitationService invitationService;

    @PostMapping("/send")
    public ResponseEntity<?> sendInvitation(@RequestBody Map<String, Integer> body) {
        int teamId = body.get("teamId");
        int leaderId = body.get("leaderId");
        int studentId = body.get("studentId");

        invitationService.inviteStudent(teamId, leaderId, studentId);
        return ResponseEntity.ok(Map.of("message", "Invitation sent successfully."));
    }

    @PutMapping("/accept/{invitationId}")
    public ResponseEntity<?> acceptInvitation(@PathVariable int invitationId) {
        invitationService.acceptInvitation(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation accepted and student added to the team."));
    }

    @PutMapping("/reject/{invitationId}")
    public ResponseEntity<?> rejectInvitation(@PathVariable int invitationId) {
        invitationService.rejectInvitation(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation rejected."));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TeamInvitationDTO>> getPendingInvitations(@PathVariable int studentId) {
        return ResponseEntity.ok(invitationService.getPendingInvitationsByStudent(studentId));
    }
}
