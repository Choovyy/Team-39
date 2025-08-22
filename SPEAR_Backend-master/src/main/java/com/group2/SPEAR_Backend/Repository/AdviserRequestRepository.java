package com.group2.SPEAR_Backend.Repository;

import com.group2.SPEAR_Backend.Model.AdviserRequest;
import com.group2.SPEAR_Backend.Model.RequestStatus;
import com.group2.SPEAR_Backend.Model.Schedule;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdviserRequestRepository extends JpaRepository<AdviserRequest, Long> {

    List<AdviserRequest> findByAdviserUidAndStatus(int adviserId, RequestStatus status);

    List<AdviserRequest> findByScheduleAndAdviserAndStatus(Schedule schedule, User adviser, RequestStatus status);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.team.tid = :teamId AND ar.status = 'PENDING'")
    List<AdviserRequest> findPendingByTeam(@Param("teamId") int teamId);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.adviser.uid = :adviserId AND ar.status = 'PENDING'")
    List<AdviserRequest> findPendingByAdviser(@Param("adviserId") int adviserId);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.team.tid = :teamId AND ar.adviser.uid = :adviserId")
    List<AdviserRequest> findAllByTeamAndAdviser(@Param("teamId") int teamId, @Param("adviserId") int adviserId);

    @Modifying
    @Query("DELETE FROM AdviserRequest ar WHERE ar.schedule = :schedule AND ar.adviser = :adviser AND ar.status = 'PENDING'")
    void deleteOtherPendingRequestsForSchedule(@Param("schedule") Schedule schedule, @Param("adviser") User adviser);

    @Modifying
    @Query("UPDATE AdviserRequest ar SET ar.status = 'REJECTED', ar.reason = :reason WHERE ar.arid = :requestId")
    void rejectRequestWithReason(@Param("requestId") Long requestId, @Param("reason") String reason);

    @Modifying
    @Query("UPDATE AdviserRequest ar SET ar.status = 'ACCEPTED' WHERE ar.arid = :requestId")
    void acceptRequest(@Param("requestId") Long requestId);

    @Query("SELECT COUNT(ar) > 0 FROM AdviserRequest ar " +
            "WHERE ar.team.tid = :teamId " +
            "AND ar.adviser.uid = :adviserId " +
            "AND ar.schedule.schedid = :scheduleId " +
            "AND ar.status = :status")
    boolean existsByTeamTidAndAdviserUidAndScheduleSchedidAndStatus(
            @Param("teamId") int teamId,
            @Param("adviserId") int adviserId,
            @Param("scheduleId") int scheduleId,
            @Param("status") RequestStatus status);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.team.tid = :teamId")
    List<AdviserRequest> findAllByTeamTid(@Param("teamId") int teamId);

    @Modifying
    @Query("DELETE FROM AdviserRequest ar WHERE ar.arid = :requestId")
    void deleteByArid(@Param("requestId") Long requestId);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.adviser.uid = :adviserId")
    List<AdviserRequest> findAllByAdviserUid(@Param("adviserId") int adviserId);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.adviser.uid = :adviserId AND ar.status = 'ACCEPTED'")
    List<AdviserRequest> findAcceptedByAdviser(@Param("adviserId") int adviserId);

    @Query("SELECT ar FROM AdviserRequest ar WHERE ar.adviser.uid = :adviserId AND ar.status = 'REJECTED'")
    List<AdviserRequest> findRejectedByAdviser(@Param("adviserId") int adviserId);

    boolean existsByTeamTidAndStatus(int teamId, RequestStatus status);

    List<AdviserRequest> findByTeamTidAndStatus(int teamId, RequestStatus status);

    @Modifying
    @Query("DELETE FROM AdviserRequest ar WHERE ar.team.tid = :teamId")
    void deleteByTeamTid(@Param("teamId") int teamId);




}