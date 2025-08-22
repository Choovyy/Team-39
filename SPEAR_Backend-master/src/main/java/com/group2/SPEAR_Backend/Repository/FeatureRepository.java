package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, Integer> {

    @Query("SELECT f FROM Feature f WHERE f.project.pid = :projectId AND f.project.isDeleted = false")
    List<Feature> findByProjectIdAndNotDeleted(@Param("projectId") int projectId);

    @Query("SELECT f FROM Feature f WHERE f.project.pid = :projectId AND f.project.isDeleted = true")
    List<Feature> findByProjectIdDeleted(@Param("projectId") int projectId);

    @Query("SELECT f FROM Feature f WHERE f.project.pid = :projectId")
    List<Feature> findByProjectId(@Param("projectId") int projectId);
}
