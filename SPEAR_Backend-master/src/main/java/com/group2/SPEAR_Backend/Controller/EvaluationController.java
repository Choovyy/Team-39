package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.EvaluationDTO;
import com.group2.SPEAR_Backend.DTO.MemberSubmissionDTO;
import com.group2.SPEAR_Backend.DTO.TeamSummaryDTO;
import com.group2.SPEAR_Backend.Model.Evaluation;
import com.group2.SPEAR_Backend.Model.EvaluationType;
import com.group2.SPEAR_Backend.Model.Team;
import com.group2.SPEAR_Backend.Repository.EvaluationRepository;
import com.group2.SPEAR_Backend.Repository.TeamRepository;
import com.group2.SPEAR_Backend.Service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

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
public class EvaluationController {

    @Autowired
    private EvaluationService eServ;

    @Autowired
    private EvaluationRepository eRepo;

    @Autowired
    private TeamRepository tRepo;

    @PostMapping("teacher/create-evaluation/{classId}")
    public ResponseEntity<?> createEvaluation(
            @RequestBody Evaluation evaluation,
            @PathVariable Long classId) {

        try {
            if (evaluation.getEvaluationType() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Evaluation type is required."));
            }

            EvaluationDTO savedEvaluation = eServ.createEvaluation(evaluation, classId, evaluation.getEvaluationType());
            return ResponseEntity.ok(savedEvaluation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("teacher/update-evaluation/{id}")
    public ResponseEntity<?> updateEvaluation(
            @PathVariable Long id,
            @RequestBody Evaluation updatedEvaluation) {

        try {
            EvaluationDTO response = eServ.updateEvaluation(id, updatedEvaluation, updatedEvaluation.getEvaluationType());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("teacher/delete-evaluation/{id}")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id) {
        try {
            String result = eServ.deleteEvaluation(id);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    //get functions
    //get evaluations for a specific class
    @GetMapping("/teacher/class/{classId}/evaluations")
    public ResponseEntity<List<EvaluationDTO>> getEvaluationsByClass(@PathVariable Long classId) {
        List<EvaluationDTO> evaluations = eServ.getEvaluationsByClassAsDTO(classId);
        return ResponseEntity.ok(evaluations);
    }

    //get by availability
    @GetMapping("student/check-availability/{availability}")
    public List<Evaluation> getEvaluationsByAvailability(@PathVariable String availability) {
        return eServ.getEvaluationsByAvailability(availability);
    }

    //get by period
    @GetMapping("/student/evaluation-period/{period}")
    public List<Evaluation> getEvaluationsByPeriod(@PathVariable String period) {
        return eServ.getEvaluationsByPeriod(period);
    }

    //get by availability and period
    @GetMapping("/student/availability/{availability}/period/{period}")
    public List<Evaluation> getEvaluationsByAvailabilityAndPeriod(
            @PathVariable String availability, @PathVariable String period) {
        return eServ.getEvaluationsByAvailabilityAndPeriod(availability, period);
    }

    //get by evaluation type
    @GetMapping("/evaluation/{evaluationId}/get-type")
    public ResponseEntity<EvaluationType> getEvaluationType(@PathVariable Long evaluationId) {
        Evaluation evaluation = eRepo.findById(evaluationId).orElse(null);
        if (evaluation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(evaluation.getEvaluationType());
    }

    //get members
    @GetMapping("/team/{classId}/my-members")
    public ResponseEntity<String> getYourTeamMembers(@PathVariable Long classId, @RequestParam Long studentId) {
        String members = eServ.getYourTeamMembers(classId, studentId);
        return ResponseEntity.ok(members);
    }

    @GetMapping("/student/{studentId}/available-evaluations")
    public ResponseEntity<List<EvaluationDTO>> getAvailableEvaluations(@PathVariable Long studentId) {
        List<EvaluationDTO> evaluations = eServ.getEvaluationsForStudent(studentId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/teacher/{adviserId}/available-evaluations")
    public ResponseEntity<List<EvaluationDTO>> getAvailableEvaluationsForAdviser(@PathVariable Long adviserId) {
        List<EvaluationDTO> evaluations = eServ.getEvaluationsForAdviser(adviserId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/{studentId}/team/{classId}")
    public ResponseEntity<Long> getStudentTeamId(@PathVariable Long studentId, @PathVariable Long classId) {
        Long teamId = eServ.getTeamId(studentId, classId);
        if (teamId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(teamId);
    }

    @GetMapping("/teacher/evaluation/{evaluationId}/team/{teamId}/submitted-members")
    public ResponseEntity<?> getSubmittedMembers(
            @PathVariable Long evaluationId,
            @PathVariable int teamId) {
        try {

            Team team = tRepo.findById(teamId)
                    .orElseThrow(() -> new NoSuchElementException("Team not found: " + teamId));

            List<MemberSubmissionDTO> result =
                    eServ.getSubmittedMembersForTeam(evaluationId, teamId);
            return ResponseEntity.ok(Map.of(
                    "teamId",   teamId,
                    "submitted", result,
                    "teamName",  team.getGroupName()
            ));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", ex.getMessage()));
        }
    }



    // summary first
    @GetMapping("/teacher/evaluation/{evaluationId}/teams")
    public ResponseEntity<?> getTeamsForEvaluation(@PathVariable Long evaluationId) {
        try {
            List<TeamSummaryDTO> teams = eServ.getTeamsForEvaluation(evaluationId);
            return ResponseEntity.ok(teams);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/teacher/evaluation/{evaluationId}/team/{teamId}/pending-members")
    public ResponseEntity<?> getPendingMembers(
            @PathVariable Long evaluationId,
            @PathVariable int teamId) {
        try {
            Team team = tRepo.findById(teamId)
                    .orElseThrow(() -> new NoSuchElementException("Team not found: " + teamId));

            List<MemberSubmissionDTO> result =
                    eServ.getPendingMembersForTeam(evaluationId, teamId);
            return ResponseEntity.ok(Map.of(
                    "teamId",  teamId,
                    "teamName", team.getGroupName(),
                    "pending", result
            ));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/teacher/evaluation/{evaluationId}/advisers/submission-status")
    public ResponseEntity<?> getAdviserSubmissionStatus(@PathVariable Long evaluationId) {
        try {
            Map<String, List<Map<String, Object>>> result = eServ.getAdviserSubmissionStatus(evaluationId);
            return ResponseEntity.ok(result);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }
    //for admin download
    @GetMapping("/admin/students-to-adviser-evaluations")
    public ResponseEntity<List<EvaluationDTO>> getAllStudentsToAdviserEvaluations() {
        List<EvaluationDTO> evaluations = eServ.getAllStudentsToAdviserEvaluations();
        return ResponseEntity.ok(evaluations);
    }



}