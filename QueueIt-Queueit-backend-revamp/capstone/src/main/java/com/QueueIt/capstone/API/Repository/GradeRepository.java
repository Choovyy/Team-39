package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.Grade;
import com.QueueIt.capstone.API.Entities.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    public List<Grade> findByMeeting(Meeting meeting);

    public List<Grade> findByStudentNameAndMeeting(String studentName, Meeting meeting);
}
