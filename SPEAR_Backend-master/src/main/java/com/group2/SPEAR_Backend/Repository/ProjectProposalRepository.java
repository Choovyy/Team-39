package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.ProjectProposal;
import com.group2.SPEAR_Backend.Model.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectProposalRepository extends JpaRepository<ProjectProposal, Integer> {

    @Query("SELECT p FROM ProjectProposal p WHERE p.isDeleted = false")
    List<ProjectProposal> findAllActive();

    @Query("SELECT p FROM ProjectProposal p WHERE p.classProposal.cid = :classId AND p.proposedBy.uid = :studentId AND p.isDeleted = false")
    List<ProjectProposal> findByClassAndStudent(@Param("classId") Long classId, @Param("studentId") int studentId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.status = :status AND p.isDeleted = false")
    List<ProjectProposal> findByStatus(@Param("status") ProjectStatus status);

    @Query("SELECT p FROM ProjectProposal p WHERE p.proposedBy.uid = :adviserId AND p.isDeleted = false")
    List<ProjectProposal> findByAdviser(@Param("adviserId") int adviserId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.proposedBy.uid = :userId AND p.isDeleted = false")
    List<ProjectProposal> findAllByProposedBy(@Param("userId") int userId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.teamProject.tid = :teamId AND p.isDeleted = false")
    List<ProjectProposal> findByTeamId(@Param("teamId") int teamId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.classProposal.cid = :classId AND p.status = 'OPEN' AND p.isDeleted = false")
    List<ProjectProposal> findOpenProjectsByClassId(@Param("classId") Long classId);

    @Query("SELECT p FROM ProjectProposal p " +
            "JOIN p.teamProject t " +
            "JOIN t.adviser a " +
            "WHERE a.uid = :adviserId AND p.isDeleted = false")
    List<ProjectProposal> findProposalsByAdviserAssignedTeams(@Param("adviserId") int adviserId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.classProposal.cid = :classId AND p.isDeleted = false")
    List<ProjectProposal> findByClassId(@Param("classId") Long classId);

    @Query("SELECT p FROM ProjectProposal p WHERE p.isDeleted = true")
    List<ProjectProposal> findAllDeleted();

    // In ProjectProposalRepository
    @Query("SELECT p FROM ProjectProposal p WHERE p.teamProject.tid = :teamId")
    List<ProjectProposal> findAllByTeamIdIncludeDeleted(@Param("teamId") int teamId);

}