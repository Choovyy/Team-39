package com.QueueIt.capstone.API.Repository;

import com.QueueIt.capstone.API.Entities.QueueingEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QueueingEntryRepository extends JpaRepository<QueueingEntry, Long> {

    @Query("SELECT COUNT(DISTINCT qe.teamID) " +
            "FROM QueueingEntry qe " +
            "WHERE qe.classroomID = :classroomID")
    Long countUniqueTeamsForClassroom(@Param("classroomID") Long classroomID);


}
