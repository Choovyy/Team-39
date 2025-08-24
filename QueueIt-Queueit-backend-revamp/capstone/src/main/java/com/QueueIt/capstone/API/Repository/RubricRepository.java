package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.Rubric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RubricRepository extends JpaRepository<Rubric, Long> {
    List<Rubric> findByUserID(Long userID);  // Find rubrics by user
    @Query("SELECT r FROM Rubric r WHERE r.isPrivate = false AND (r.userID != :userID OR r.userID IS NULL) ORDER BY r.id")
    List<Rubric> findByIsPrivateFalse(Long userID);  // Find all public (system) rubrics
}
