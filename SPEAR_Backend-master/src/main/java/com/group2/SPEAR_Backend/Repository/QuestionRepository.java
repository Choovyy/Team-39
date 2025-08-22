package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByClassesCid(Long classId);
    List<Question> findByEvaluationEid(Long evaluationId);
    List<Question> findByClassesCidAndEvaluationEid(Long classId, Long evaluationId);
    List<Question> findByCreatedByUid(Integer createdByUserId);
    List<Question> findByTemplateSetId(Long templateSetId);
    List<Question> findByTemplateSetIdAndEvaluationEid(Long templateSetId, Long evaluationId);
}