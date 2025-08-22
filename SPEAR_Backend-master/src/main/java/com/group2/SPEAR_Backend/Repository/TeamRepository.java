package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.TeamDTO;
import com.group2.SPEAR_Backend.Model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Integer> {

    @Query("SELECT t FROM Team t")
    List<Team> findAllActiveTeams();

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.TeamDTO(t.tid, t.groupName, t.project.projectName, t.isRecruitmentOpen) " +
            "FROM Team t " +
            "WHERE t.classRef.cid = :classId")
    List<TeamDTO> findTeamsByClassIdWithDetails(@Param("classId") int classId);

    @Query("SELECT t FROM Team t " +
            "WHERE (t.leader.uid = :userId OR :userId IN (SELECT m.uid FROM t.members m)) " +
            "AND t.classRef.cid = :classId")
    Optional<Team> findMyTeamByClassId(@Param("userId") int userId, @Param("classId") int classId);

    @Query("SELECT m FROM Team t JOIN t.members m WHERE t.tid = :teamId")
    List<User> findMembersByTeamId(@Param("teamId") int teamId);

    List<Team> findAllByMembersContains(User user);

    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.uid = :userId")
    List<Team> findActiveTeamsByMemberId(@Param("userId") int userId);

    @Query("SELECT t FROM Team t WHERE t.tid = :teamId")
    Optional<Team> findActiveTeamById(@Param("teamId") int teamId);

    @Query("SELECT t FROM Team t WHERE t.classRef.cid = :classId")
    List<Team> findActiveTeamsByClassId(@Param("classId") int classId);

    @Query("SELECT t FROM Team t WHERE t.leader.uid = :leaderId")
    List<Team> findActiveTeamsByLeaderId(@Param("leaderId") int leaderId);

    @Query("SELECT COUNT(t) > 0 FROM Team t WHERE t.leader = :leader AND t.classRef = :classRef")
    boolean existsByLeaderAndClassRef(@Param("leader") User leader, @Param("classRef") Classes classRef);

    @Query("SELECT COUNT(t) > 0 FROM Team t WHERE t.leader.uid = :userId")
    boolean existsByLeaderUid(@Param("userId") int userId);

    @Query("SELECT t FROM Team t WHERE t.schedule = :schedule")
    Optional<Team> findBySchedule(@Param("schedule") Schedule schedule);

    @Modifying
    @Query(value = "DELETE FROM team_members WHERE team_id = :teamId", nativeQuery = true)
    void deleteTeamMembers(@Param("teamId") int teamId);

    @Query("SELECT t FROM Team t WHERE t.classRef.cid = :classId AND t.adviser.uid = :adviserId")
    List<Team> findByClassIdAndAdviserId(@Param("classId") Long classId, @Param("adviserId") Long adviserId);

    @Query("SELECT t FROM Team t WHERE t.classRef.cid = :classId")
    List<Team> findTeamsByClassId(@Param("classId") Long classId);

    @Query("SELECT t FROM Team t WHERE t.classRef = :classRef")
    Optional<Team> findByClassRef(@Param("classRef") Classes classRef);

    @Query("SELECT t FROM Team t JOIN t.adviser u WHERE u.uid = :mentorID")
    List<Team> retrieveTeamsForMentor(int mentorID);

    @Query("SELECT t FROM Team t JOIN t.adviser u WHERE u.uid = :mentorID AND t.tid IN :teamIDList")
    List<Team> retrieveSelectedTeamsForMentor(@Param("mentorID") int mentorID,@Param("teamIDList") List<Integer> teamIDList);

    @Query("SELECT t FROM Team t JOIN t.schedule s where :day = s.day")
    List<Team> retrieveScheduledTeamsForMeetingAutomation(@Param("day") DayOfWeek day);

    //for team recruitment only
    @Query("""
       SELECT t 
         FROM Team t 
         JOIN t.classRef c 
        WHERE c.cid = :classId 
          AND t.isRecruitmentOpen = true 
          AND SIZE(t.members) < c.maxTeamSize
    """)
    List<Team> findOpenTeamsForRecruitmentByClassId(@Param("classId") Long classId);

    @Query("SELECT t FROM Team t WHERE t.leader.uid = :userId")
    List<Team> findByLeaderUid(@Param("userId") int userId);

    @Query("SELECT t FROM Team t WHERE t.adviser.uid = :adviserId AND t.schedule IS NOT NULL")
    List<Team> findTeamsByAdviserAndSchedule(@Param("adviserId") int adviserId);

    @Query("""
    SELECT t
      FROM Team t
     WHERE t.classRef.cid = :classId
       AND (
             t.leader.uid = :studentId
             OR :studentId IN (SELECT m.uid FROM t.members m)
           )
  """)
    Team findTeamByStudentAndClass(@Param("studentId") Long studentId,
                                   @Param("classId") Long classId);

    @Query("SELECT t FROM Team t WHERE t.groupName = :teamName")
    Optional<Team> findByTeamName(@Param("teamName") String teamName);

    @Query("SELECT DISTINCT t.classRef FROM Team t WHERE t.adviser.uid = :mentorId")
    List<Classes> findClassroomsForMentor(@Param("mentorId") int mentorId);

    @Query("SELECT t FROM Team t WHERE t.adviser.uid = :mentorId AND t.classRef.cid = :classId")
    List<Team> findTeamsByMentorAndClassroom(@Param("mentorId") int mentorId, @Param("classId") int classId);

    @Query("SELECT t FROM Team t WHERE t.classRef.cid = :classId AND SIZE(t.members) > :maxSize")
    List<Team> findTeamsByClassIdWithMoreThan(@Param("classId") Long classId, @Param("maxSize") int maxSize);


















}