package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.QuestionTemplate;
import com.group2.SPEAR_Backend.Model.QuestionTemplateSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionTemplateSetRepository extends JpaRepository<QuestionTemplateSet, Long> {
    boolean existsByName(String name);

}

