package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.QueueingManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QueueingManagerRepository extends JpaRepository<QueueingManager, Long> {
    public Optional<QueueingManager> findByFacultyID(Long facultyID);
}
