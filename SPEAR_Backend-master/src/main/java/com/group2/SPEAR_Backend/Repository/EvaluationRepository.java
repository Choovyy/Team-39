package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.EvaluationDTO;
import com.group2.SPEAR_Backend.Model.Evaluation;
import com.group2.SPEAR_Backend.Model.EvaluationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    // Get evaluations by availability
    List<Evaluation> findByAvailability(String availability);

    // Get evaluations by period (Prelims, Midterms, Prefinals, Finals)
    List<Evaluation> findByPeriod(String period);

    // Get evaluations that are both open and belong to a certain period
    List<Evaluation> findByAvailabilityAndPeriod(String availability, String period);

    // Get evaluations that belong to a specific class
    List<Evaluation> findByClassRef_Cid(Long classId);

    // Get evaluations by their type (STUDENT-TO-STUDENT, STUDENT-TO-ADVISER, ADVISER-TO-STUDENT)
    List<Evaluation> findByEvaluationType(EvaluationType evaluationType);

    //for admin download
    @Query("SELECT e FROM Evaluation e WHERE e.evaluationType = 'STUDENT_TO_ADVISER'")
    List<Evaluation> findAllStudentsToAdviserEvaluations();

    // Get all open evaluations to students
    @Query("SELECT e FROM Evaluation e " +
            "JOIN e.classRef c " +
            "JOIN c.enrolledStudents s " +
            "WHERE s.uid = :studentId " +
            "AND e.availability = 'Open' " +
            "AND (e.evaluationType = 'STUDENT_TO_STUDENT' OR e.evaluationType = 'STUDENT_TO_ADVISER')")
    List<Evaluation> findOpenEvaluationsForStudent(@Param("studentId") Long studentId);

    //Get all open evaluations to adviser
    @Query("SELECT DISTINCT e FROM Evaluation e " +
            "JOIN e.classRef c " +
            "JOIN Team t ON t.classRef = c " +
            "WHERE t.adviser.uid = :adviserId " +
            "AND e.availability = 'Open' " +
            "AND e.evaluationType = 'ADVISER_TO_STUDENT'")
    List<Evaluation> findOpenEvaluationsForAdviser(@Param("adviserId") Long adviserId);



    // Get evaluations filtered by type and period
    @Query("SELECT e FROM Evaluation e WHERE e.evaluationType = :evaluationType AND e.period = :period")
    List<Evaluation> findByTypeAndPeriod(@Param("evaluationType") EvaluationType evaluationType, @Param("period") String period);

    //members only
    @Query("SELECT CONCAT(m.firstname, ' ', m.lastname) " +
            "FROM Team t JOIN t.members m " +
            "WHERE t.classRef.cid = :classId " +
            "AND t.tid = (SELECT t2.tid FROM Team t2 JOIN t2.members m2 " +
            "WHERE m2.uid = :studentId AND t2.classRef.cid = :classId)")
    List<String> findYourTeamMembers(@Param("classId") Long classId, @Param("studentId") Long studentId);

    @Query("SELECT t.tid FROM Team t JOIN t.members m " +
            "WHERE m.uid = :studentId AND t.classRef.cid = :classId")
    Long findTeamIdByStudent(@Param("studentId") Long studentId, @Param("classId") Long classId);




}