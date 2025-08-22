package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.ResponseDTO;
import com.group2.SPEAR_Backend.Model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    List<Response> findByEvaluatorUid(int evaluatorId);
    List<Response> findByEvaluateeUid(int evaluateeId);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ResponseDTO( " +
            "r.rid, " +
            "evaluator.uid, " +
            "CONCAT(evaluator.firstname, ' ', evaluator.lastname), " +
            "evaluatee.uid, " +
            "CONCAT(evaluatee.firstname, ' ', evaluatee.lastname), " +
            "r.question.qid, " +
            "r.score) " +
            "FROM Response r " +
            "JOIN r.evaluator evaluator " +
            "JOIN r.evaluatee evaluatee " +
            "WHERE evaluator.uid = :evaluatorId")
    List<ResponseDTO> findResponsesByEvaluatorId(@Param("evaluatorId") int evaluatorId);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ResponseDTO( " +
            "r.rid, " +
            "evaluator.uid, " +
            "CONCAT(evaluator.firstname, ' ', evaluator.lastname), " +
            "evaluatee.uid, " +
            "CONCAT(evaluatee.firstname, ' ', evaluatee.lastname), " +
            "r.question.qid, " +
            "r.score) " +
            "FROM Response r " +
            "JOIN r.evaluator evaluator " +
            "JOIN r.evaluatee evaluatee " +
            "WHERE evaluatee.uid = :evaluateeId")
    List<ResponseDTO> findResponsesByEvaluateeId(@Param("evaluateeId") int evaluateeId);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ResponseDTO( " +
            "r.rid, " +
            "evaluator.uid, " +
            "CONCAT(evaluator.firstname, ' ', evaluator.lastname), " +
            "evaluatee.uid, " +
            "CONCAT(evaluatee.firstname, ' ', evaluatee.lastname), " +
            "r.question.qid, " +
            "r.question.questionTitle, " +
            "r.evaluation.period, " +
            "r.score, " +
            "r.textResponse, " +
            "r.question.questionDetails, " +
            "r.question.questionType) " +
            "FROM Response r " +
            "JOIN r.evaluator evaluator " +
            "JOIN r.evaluatee evaluatee " +
            "JOIN r.question question " +
            "JOIN r.evaluation evaluation " +
            "WHERE r.evaluation.eid = :evaluationId")
    List<ResponseDTO> findResponsesByEvaluationId(@Param("evaluationId") Long evaluationId);




}
