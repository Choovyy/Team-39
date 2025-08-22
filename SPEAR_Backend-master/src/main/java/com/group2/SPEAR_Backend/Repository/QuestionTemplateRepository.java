package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.QuestionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionTemplateRepository extends JpaRepository<QuestionTemplate, Long> {

}