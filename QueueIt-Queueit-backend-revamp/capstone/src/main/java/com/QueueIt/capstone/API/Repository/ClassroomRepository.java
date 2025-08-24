package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
}
