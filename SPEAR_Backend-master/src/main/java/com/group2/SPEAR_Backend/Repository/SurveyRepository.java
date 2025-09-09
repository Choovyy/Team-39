package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.SurveyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<SurveyEntity, Long> {
}
