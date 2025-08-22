package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.DTO.TeamRecuitmentDTO;
import com.group2.SPEAR_Backend.Model.TeamRecuitment;
import com.group2.SPEAR_Backend.Model.TeamRecuitment.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamRecuitmentRepository extends JpaRepository<TeamRecuitment, Integer> {

    @Query("SELECT r FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.status = 'PENDING'")
    List<TeamRecuitment> findPendingByTeamId(@Param("teamId") int teamId);

    @Query("SELECT r FROM TeamRecuitment r WHERE r.student.uid = :studentId")
    List<TeamRecuitment> findByStudentId(@Param("studentId") int studentId);

    @Query("SELECT r FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.status = 'ACCEPTED'")
    List<TeamRecuitment> findAcceptedByTeamId(@Param("teamId") int teamId);

    List<TeamRecuitment> findByTeamTidAndStatus(int teamId, Status status);

    @Query("SELECT new com.group2.SPEAR_Backend.DTO.TeamRecuitmentDTO(r.team.tid, r.student.uid, " +
            "CONCAT(r.student.firstname, ' ', r.student.lastname), r.role, r.reason, r.status) " +
            "FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.status = 'PENDING'")
    List<TeamRecuitmentDTO> findPendingApplicationsByTeamId(@Param("teamId") int teamId);

    @Query("SELECT r FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.student.uid = :studentId")
    Optional<TeamRecuitment> findByTeamIdAndStudentId(@Param("teamId") int teamId, @Param("studentId") int studentId);

    @Query("SELECT r FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.status = 'PENDING'")
    List<TeamRecuitment> findPendingApplicationsByTeam(@Param("teamId") int teamId);

    @Query("SELECT r FROM TeamRecuitment r WHERE r.student.uid = :studentId")
    List<TeamRecuitment> findApplicationsByStudent(@Param("studentId") int studentId);

//    @Query("SELECT r FROM TeamRecuitment r WHERE r.team.leader.uid = :leaderId AND r.status = 'PENDING'")
//    List<TeamRecuitment> findPendingApplicationsByLeader(@Param("leaderId") int leaderId);

    @Query("SELECT r FROM TeamRecuitment r " +
            "WHERE r.team.leader.uid = :leaderId " +
            "AND r.status = 'PENDING' " +
            "AND r.student.uid NOT IN (SELECT r2.student.uid FROM TeamRecuitment r2 WHERE r2.status = 'ACCEPTED')")
    List<TeamRecuitment> findPendingApplicationsByLeader(@Param("leaderId") int leaderId);

    @Modifying
    @Query("UPDATE TeamRecuitment r SET r.status = 'EXPIRED' WHERE r.student.uid = :studentId AND r.team.tid <> :teamId AND r.status = 'PENDING'")
    void updateOtherApplicationsAsExpired(@Param("studentId") int studentId, @Param("teamId") int teamId);

    @Modifying
    @Query("DELETE FROM TeamRecuitment r WHERE r.team.tid = :teamId AND r.student.uid = :studentId")
    void deleteByTeamIdAndStudentId(@Param("teamId") int teamId, @Param("studentId") int studentId);










}
