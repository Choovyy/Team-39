package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.Team;
import com.group2.SPEAR_Backend.Model.TeamInvitation;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Model.TeamInvitation.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Integer> {

    @Query("SELECT i FROM TeamInvitation i WHERE i.student.uid = :studentId AND i.status = 'PENDING'")
    List<TeamInvitation> findPendingInvitationsByStudent(@Param("studentId") int studentId);

    @Query("SELECT i FROM TeamInvitation i WHERE i.team.tid = :teamId AND i.student.uid = :studentId")
    Optional<TeamInvitation> findByTeamIdAndStudentId(@Param("teamId") int teamId, @Param("studentId") int studentId);

    List<TeamInvitation> findByTeamAndStatus(Team team, Status status);

    List<TeamInvitation> findByStudentAndStatus(User student, Status status);
}