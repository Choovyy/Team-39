package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.FeatureDTO;
import com.group2.SPEAR_Backend.DTO.ProjectProposalDTO;
import com.group2.SPEAR_Backend.Model.ProjectStatus;
import com.group2.SPEAR_Backend.Service.ProjectProposalService;
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
public class ProjectProposalController {

    @Autowired
    private ProjectProposalService ppServ;

    @PostMapping("/student/create-proposal")
    public ResponseEntity<Map<String, String>> createProposal(@RequestBody Map<String, Object> payload) {
        try {
            ProjectProposalDTO dto = new ProjectProposalDTO(
                    0,
                    (String) payload.get("projectName"),
                    (String) payload.get("description"),
                    "PENDING",
                    null,
                    (int) payload.get("proposedById"),
                    Long.valueOf(String.valueOf(payload.get("classId"))),
                    payload.get("teamId") != null ? (Integer) payload.get("teamId") : null,
                    false
            );

            List<Map<String, String>> featurePayload = (List<Map<String, String>>) payload.get("features");
            List<FeatureDTO> features = featurePayload != null
                    ? featurePayload.stream().map(f -> new FeatureDTO(f.get("featureTitle"), f.get("featureDescription"))).toList()
                    : null;

            ppServ.createProjectProposal(dto, features);
            return ResponseEntity.ok(Map.of("message", "Proposal created successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PutMapping("/student/update-proposal/{proposalId}")
    public ResponseEntity<Map<String, String>> updateProposal(
            @PathVariable("proposalId") int proposalId,
            @RequestBody Map<String, Object> payload) {
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());

            List<Map<String, String>> featurePayload = (List<Map<String, String>>) payload.get("features");
            List<FeatureDTO> features = featurePayload != null
                    ? featurePayload.stream().map(f -> new FeatureDTO(f.get("featureTitle"), f.get("featureDescription"))).toList()
                    : null;

            ppServ.updateProposalAndFeatures(proposalId, userId, (String) payload.get("projectName"), (String) payload.get("description"), features);
            return ResponseEntity.ok(Map.of("message", "Proposal updated successfully"));
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid userId format"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/student/delete-proposal/{id}")
    public ResponseEntity<Map<String, String>> deleteProposal(
            @PathVariable int id,
            @RequestParam int userId) {
        try {
            return ResponseEntity.ok(Map.of("message", ppServ.deleteProjectProposal(id, userId)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/teacher/status-proposal/{id}")
    public ResponseEntity<Map<String, String>> updateProposalStatus(@PathVariable int id, @RequestBody Map<String, String> payload) {
        try {
            ppServ.updateProposalStatus(id, payload.get("status"), payload.get("reason"));
            return ResponseEntity.ok(Map.of("message", "Proposal status updated to " + payload.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/student/update-denied/{proposalId}")
    public ResponseEntity<Map<String, String>> updateDeniedToPending(@PathVariable int proposalId) {
        ppServ.updateDeniedToPending(proposalId);
        return ResponseEntity.ok(Map.of("message", "Proposal updated to PENDING status"));
    }

    @PutMapping("/student/set-to-open-project/{proposalId}")
    public ResponseEntity<Map<String, String>> updateApprovedToOpenProject(
            @PathVariable int proposalId,
            @RequestParam int userId) {
        try {
            ppServ.updateApprovedToOpenProject(proposalId, userId);
            return ResponseEntity.ok(Map.of("message", "Proposal updated to OPEN status"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/student/take-ownership/{proposalId}")
    public ResponseEntity<Map<String, String>> takeOwnership(
            @PathVariable int proposalId,
            @RequestParam int userId) {
        try {
            ppServ.takeOwnershipOfProject(proposalId, userId);
            return ResponseEntity.ok(Map.of("message", "Project successfully claimed and accepted."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }








    //get functions
    @GetMapping("/proposals/class/{classId}/student/{studentId}")
    public ResponseEntity<List<ProjectProposalDTO>> getProposalsByClassAndStudent(@PathVariable Long classId, @PathVariable int studentId) {
        return ResponseEntity.ok(ppServ.getProposalsByClassAndStudent(classId, studentId));
    }

    @GetMapping("/proposals/adviser/{adviserId}")
    public ResponseEntity<List<ProjectProposalDTO>> getProposalsByAdviser(@PathVariable int adviserId) {
        return ResponseEntity.ok(ppServ.getProposalsByAdviser(adviserId));
    }

    @GetMapping("/proposals/status/{status}")
    public ResponseEntity<?> getProposalsByStatus(@PathVariable String status) {
        try {
            ProjectStatus projectStatus = ProjectStatus.valueOf(status.toUpperCase()); // Convert to ENUM
            return ResponseEntity.ok(ppServ.getProposalsByStatus(projectStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + status);
        }
    }

    @GetMapping("/proposals/team/{teamId}")
    public ResponseEntity<List<ProjectProposalDTO>> getProposalsByTeamId(@PathVariable int teamId) {
        return ResponseEntity.ok(ppServ.getProposalsByTeamId(teamId));
    }

    @GetMapping("/proposals/class/{classId}/open-projects")
    public ResponseEntity<List<ProjectProposalDTO>> getOpenProjectsByClassId(@PathVariable Long classId) {
        return ResponseEntity.ok(ppServ.getOpenProjectsByClassId(classId));
    }

    @GetMapping("/proposals/{proposalId}")
    public ResponseEntity<ProjectProposalDTO> getProposalById(@PathVariable int proposalId) {
        return ResponseEntity.ok(ppServ.getProposalById(proposalId));
    }

    @GetMapping("/proposals/adviser/{adviserId}/teams")
    public ResponseEntity<List<ProjectProposalDTO>> getProposalsByAdviserAssignedTeams(@PathVariable int adviserId) {
        return ResponseEntity.ok(ppServ.getProposalsByAdviserAssignedTeams(adviserId));
    }
    @GetMapping("/teacher/proposals/{classId}")
    public ResponseEntity<List<ProjectProposalDTO>> getProposalsByClassId(@PathVariable Long classId) {
        return ResponseEntity.ok(ppServ.getProposalsByClassId(classId));
    }
    @PutMapping("/teacher/rate-project/{proposalId}")
    public ResponseEntity<Map<String, String>> rateProject(
            @PathVariable int proposalId,
            @RequestBody Map<String, Object> payload) {
        //System.out.println("Received Rating Request: " + payload);
        try {
            int userId = Integer.parseInt(payload.get("userId").toString());
            String rating = payload.get("rating").toString();

            ppServ.rateProjectProposal(proposalId, userId, rating);
            return ResponseEntity.ok(Map.of("message", "Project proposal rated successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/admin/proposals/deleted")
    public ResponseEntity<List<ProjectProposalDTO>> getAllDeletedProposals() {
        return ResponseEntity.ok(ppServ.getAllDeletedProposals());
    }











}