package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.MilestoneSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MilestoneSetRespository extends JpaRepository<MilestoneSet, Long> {
    public Optional<MilestoneSet> findByTeamID(Long teamID);
}
