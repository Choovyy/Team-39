//package com.group2.SPEAR_Backend.Repository;
//
//import com.group2.SPEAR_Backend.Model.Result;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface ResultRepository extends JpaRepository<Result, Long> {
//    List<Result> findByEvaluateeUid(int evaluateeId);
//    List<Result> findByEvaluationEid(Long evaluationId);
//    Optional<Result> findByEvaluationEidAndEvaluateeUid(Long evaluationId, int evaluateeId);
//}
