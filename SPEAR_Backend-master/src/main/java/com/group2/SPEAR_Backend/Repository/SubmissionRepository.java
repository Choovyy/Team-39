package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.SubmissionDTO;
import com.group2.SPEAR_Backend.Model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByEvaluationEid(Long evaluationId);

    List<Submission> findByEvaluatorUid(int evaluatorId);

    List<Submission> findByStatus(String status);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.SubmissionDTO( " +
            "s.sid, " +
            "evaluator.uid, " +
            "CONCAT(evaluator.firstname, ' ', evaluator.lastname), " +
            "s.evaluation.eid, " +
            "s.evaluation.period, " + // Fetch evaluation period
            "s.submittedAt, " +
            "s.status) " +
            "FROM Submission s " +
            "JOIN s.evaluator evaluator " +
            "JOIN s.evaluation evaluation " +
            "WHERE s.evaluation.eid = :evaluationId")
    List<SubmissionDTO> findSubmissionsByEvaluationWithDetails(@Param("evaluationId") Long evaluationId);

}
