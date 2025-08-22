package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.ClassesDTO;
import com.group2.SPEAR_Backend.DTO.UserDTO;
import com.group2.SPEAR_Backend.Model.Classes;
import com.group2.SPEAR_Backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassesRepository extends JpaRepository<Classes, Long> {

    Classes findByCourseCode(String courseCode);

    @Query("SELECT u FROM User u WHERE CONCAT(u.firstname, ' ', u.lastname) = :fullName")
    Optional<User> findByFullName(@Param("fullName") String fullName);

    List<Classes> findAllByIsDeletedFalse();

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO(c.cid, c.classKey, c.courseCode, c.courseDescription, c.schoolYear, c.section, c.semester, u.firstname, u.lastname, u.role) " +
            "FROM Classes c JOIN c.createdBy u " +
            "WHERE c.isDeleted = false AND u.uid = :userId")
    List<ClassesDTO> findClassesByCreator2(@Param("userId") int userId);

    @Query("SELECT c FROM Classes c WHERE c.cid = :classId AND c.isDeleted = false")
    Optional<Classes> findActiveClassById(@Param("classId") Long classId);


    @Query("SELECT c FROM Classes c WHERE c.classKey = :classKey AND c.isDeleted = false")
    Optional<Classes> findByClassKey(@Param("classKey") String classKey);

    @Query("SELECT c FROM Classes c WHERE c.courseCode = :courseCode AND c.section = :section AND c.isDeleted = false")
    Classes findByCourseCodeAndSection(@Param("courseCode") String courseCode, @Param("section") String section);


    @Query("SELECT COUNT(u) FROM Classes c LEFT JOIN c.enrolledStudents u WHERE c.cid = :classId GROUP BY c.cid")
    Long findTotalUsersInClass(@Param("classId") Long classId);


    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO( " +
            "c.cid, c.classKey, c.courseCode, c.courseDescription, c.schoolYear, c.section, c.semester, " +
            "c.createdBy.firstname, c.createdBy.lastname, c.createdBy.role) " +
            "FROM Classes c " +
            "WHERE c.isDeleted = true")
    List<ClassesDTO> findAllDeletedClasses();


    //changed for queueit from u.role from the end, to u.uid 3rd from last.
    //took the liberty to change this because I did not see any changes from this endpoint
    //namely 'incremented refactor (to be continued) dated feb 16, 2025.
    //meaning, this endpoint might be unused for SPEAR.
    //should this change be reverted, please inform queueit team, so that we can also change our fetch endpoint accordingly
    //please include u.uid should spear team restore u.role
    //thank you
    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO(c.cid, c.classKey, c.courseCode, c.courseDescription, c.schoolYear, c.section, c.semester,u.uid, u.firstname, u.lastname) " +
            "FROM Classes c JOIN c.createdBy u " +
            "WHERE c.isDeleted = false AND u.uid = :userId")
    List<ClassesDTO> findClassesByCreator(@Param("userId") int userId);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO( " +
            "c.cid, c.courseCode, c.section, c.schoolYear, c.semester, c.courseDescription, " +
            "c.maxTeamSize, c.classKey, c.createdBy.uid, c.createdBy.firstname, c.createdBy.lastname) " +
            "FROM Classes c JOIN c.createdBy u " +
            "WHERE c.isDeleted = false")
    List<ClassesDTO> findAllClassesWithCreator();


    @Query("SELECT new com.group2.SPEAR_Backend.DTO.UserDTO(200, 'User retrieved successfully', u.firstname, u.lastname, u.email, u.role) " +
            "FROM Classes c JOIN c.enrolledStudents u " +
            "WHERE c.classKey = :classKey AND u.isDeleted = false AND u.role = 'STUDENT'")
    List<UserDTO> findStudentsInClass(@Param("classKey") String classKey);


    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO(c.cid, c.courseCode, c.courseDescription, c.schoolYear, c.section, c.semester, c.createdBy.uid, c.createdBy.firstname, c.createdBy.lastname) " +
            "FROM Classes c JOIN c.enrolledStudents u " +
            "WHERE u.uid = :studentId AND c.isDeleted = false")
    List<ClassesDTO> findClassesEnrolledByStudent(@Param("studentId") int studentId);


    @Query("SELECT c FROM Classes c WHERE c.courseCode = :courseCode AND c.section = :section AND c.isDeleted = false")
    Optional<Classes> findByCourseCodeAndSectionPage(@Param("courseCode") String courseCode, @Param("section") String section);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.UserDTO(u.firstname, u.lastname, u.email, u.interests, u.department) FROM User u WHERE u.role = 'TEACHER' AND u.department = :department")
    List<User> findTeachersByDepartment(@Param("department") String department);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.UserDTO(u.firstname, u.lastname, u.email, u.interests, u.department) FROM User u WHERE u.role = 'TEACHER' AND u.department = :department AND u.interests = :interest")
    List<User> findCandidateAdvisers(@Param("department") String department, @Param("interest") String interest);

    @Query("SELECT c FROM Classes c WHERE c.courseCode = :courseCode AND c.section = :section AND c.schoolYear = :schoolYear AND c.isDeleted = false")
    Optional<Classes> findByCourseCodeAndSectionAndSchoolYear(
            @Param("courseCode") String courseCode,
            @Param("section") String section,
            @Param("schoolYear") String schoolYear
    );
    @Query("SELECT c FROM Classes c JOIN c.createdBy f WHERE f.uid = :facultyID")
    List<Classes> findAllByFaculty(@Param("facultyID") int facultyID);

    @Query("SELECT c FROM Classes c WHERE c.createdBy.uid = :facultyID AND c.cid IN :classIDList")
    List<Classes> findSelectedByFaculty(@Param("facultyID") int facultyID, @Param("classIDList") List<Integer> classIDList);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.ClassesDTO( " +
            "c.cid, c.classKey, c.courseCode, c.courseDescription, c.schoolYear, c.section, c.semester, " +
            "c.createdBy.firstname, c.createdBy.lastname, c.createdBy.role, c.maxTeamSize, c.needsAdvisory) " +
            "FROM Classes c " +
            "WHERE c.needsAdvisory = true AND c.isDeleted = false")
    List<ClassesDTO> findDTOsForClassesNeedingAdvisory();



}





