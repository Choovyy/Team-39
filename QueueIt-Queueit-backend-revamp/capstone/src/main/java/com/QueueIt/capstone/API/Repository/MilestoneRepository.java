package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
}
