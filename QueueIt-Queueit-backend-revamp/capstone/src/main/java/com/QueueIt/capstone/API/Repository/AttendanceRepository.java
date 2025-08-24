package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.Attendance;
import com.QueueIt.capstone.API.Entities.QueueingEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    public List<Attendance> findByQueueingEntry(QueueingEntry queueingEntry);
}
