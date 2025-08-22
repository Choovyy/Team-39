package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.SubmissionDTO;
import com.group2.SPEAR_Backend.Model.Submission;
import com.group2.SPEAR_Backend.Service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
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
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @PostMapping("/submit")
    public ResponseEntity<SubmissionDTO> createSubmission(
            @RequestParam Long evaluationId,
            @RequestParam int evaluatorId) {
        Submission submission = submissionService.createSubmission(evaluationId, evaluatorId);
        SubmissionDTO submissionDTO = new SubmissionDTO(
                submission.getSid(),
                submission.getEvaluator().getUid(),
                submission.getEvaluation().getEid(),
                submission.getSubmittedAt(),
                submission.getStatus()
        );
        return ResponseEntity.ok(submissionDTO);
    }


    @PostMapping("/submit-adviser")
    public ResponseEntity<SubmissionDTO> createAdviserSubmission(
            @RequestParam Long evaluationId,
            @RequestParam int evaluatorId) {
        Submission submission = submissionService.createAdviserSubmission(evaluationId, evaluatorId);
        SubmissionDTO submissionDTO = new SubmissionDTO(
                submission.getSid(),
                submission.getEvaluator().getUid(),
                submission.getEvaluation().getEid(),
                submission.getSubmittedAt(),
                submission.getStatus()
        );
        return ResponseEntity.ok(submissionDTO);
    }

    @GetMapping("/by-evaluation/{evaluationId}")
    public List<SubmissionDTO> getSubmissionsByEvaluation(@PathVariable Long evaluationId) {
        return submissionService.getSubmissionsByEvaluation(evaluationId);
    }

    @GetMapping("/by-evaluator/{evaluatorId}")
    public List<SubmissionDTO> getSubmissionsByEvaluator(@PathVariable int evaluatorId) {
        return submissionService.getSubmissionsByEvaluator(evaluatorId);
    }

    @GetMapping("/by-status/{status}")
    public List<SubmissionDTO> getSubmissionsByStatus(@PathVariable String status) {
        return submissionService.getSubmissionsByStatus(status);
    }
}
