package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.SubmissionDTO;
import com.group2.SPEAR_Backend.Model.Evaluation;
import com.group2.SPEAR_Backend.Model.Submission;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.EvaluationRepository;
import com.group2.SPEAR_Backend.Repository.SubmissionRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepo;

    @Autowired
    private EvaluationRepository evaluationRepo;

    @Autowired
    private UserRepository userRepo;

    public Submission createSubmission(Long evaluationId, int evaluatorId) {
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));
        User evaluator = userRepo.findById(evaluatorId)
                .orElseThrow(() -> new NoSuchElementException("Evaluator not found with ID: " + evaluatorId));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime evaluationCloseDateTime = evaluation.getDateClose().atTime(23, 59, 59);

        String status = now.isAfter(evaluationCloseDateTime) ? "Late" : "Submitted";

        Submission submission = new Submission(evaluation, evaluator, now, status);
        return submissionRepo.save(submission);
    }




    public List<SubmissionDTO> getSubmissionsByEvaluation(Long evaluationId) {
        return submissionRepo.findSubmissionsByEvaluationWithDetails(evaluationId);
    }


    public List<SubmissionDTO> getSubmissionsByEvaluator(int evaluatorId) {
        return submissionRepo.findByEvaluatorUid(evaluatorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SubmissionDTO> getSubmissionsByStatus(String status) {
        return submissionRepo.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Submission createAdviserSubmission(Long evaluationId, int evaluatorId) {
        Evaluation evaluation = evaluationRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));
        User evaluator = userRepo.findById(evaluatorId)
                .orElseThrow(() -> new NoSuchElementException("Evaluator not found with ID: " + evaluatorId));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime evaluationCloseDateTime = evaluation.getDateClose().atTime(23, 59, 59);

        String status = now.isAfter(evaluationCloseDateTime) ? "Late" : "Submitted";

        Submission submission = new Submission(evaluation, evaluator, now, status);
        return submissionRepo.save(submission);
    }

    private SubmissionDTO toDTO(Submission submission) {
        return new SubmissionDTO(
                submission.getSid(),
                submission.getEvaluator().getUid(),
                submission.getEvaluation().getEid(),
                submission.getSubmittedAt(),
                submission.getStatus()
        );
    }






}
