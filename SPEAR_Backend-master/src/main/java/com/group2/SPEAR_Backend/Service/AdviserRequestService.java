package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.Model.*;
import com.group2.SPEAR_Backend.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.group2.SPEAR_Backend.DTO.AdviserRequestDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class AdviserRequestService {

    @Autowired
    private AdviserRequestRepository arRepo;

    @Autowired
    private TeamRepository tRepo;

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private ScheduleRepository sRepo;


    @Transactional
    public AdviserRequest submitRequest(int teamId, int adviserId, int scheduleId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        if (team.getAdviser() != null) {
            throw new IllegalStateException("You already have an adviser.");
        }

        User adviser = uRepo.findById(adviserId)
                .orElseThrow(() -> new NoSuchElementException("Adviser not found"));

        Schedule schedule = sRepo.findById(scheduleId)
                .orElseThrow(() -> new NoSuchElementException("Schedule not found"));

        boolean exists = arRepo.existsByTeamTidAndAdviserUidAndScheduleSchedidAndStatus(
                teamId, adviserId, scheduleId, RequestStatus.PENDING);

        if (exists) {
            throw new IllegalStateException("You have already submitted this request. Please wait for the adviser's response.");
        }

        AdviserRequest request = new AdviserRequest(team, adviser, schedule);
        return arRepo.save(request);
    }

    @Transactional
    public void reviewRequest(Long requestId, boolean accept, String reason) {
        AdviserRequest request = arRepo.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("AdviserRequest not found"));

        if (accept) {
            Team team = request.getTeam();
            User adviser = request.getAdviser();
            Schedule schedule = request.getSchedule();

            team.setAdviser(adviser);
            team.setSchedule(schedule);
            tRepo.save(team);

            request.setStatus(RequestStatus.ACCEPTED);
            request.setReason(null);
            arRepo.save(request);

            List<AdviserRequest> allTeamPending = arRepo.findPendingByTeam(team.getTid());
            for (AdviserRequest r : allTeamPending) {
                if (!r.getArid().equals(requestId)) {
                    r.setStatus(RequestStatus.REJECTED);
                    r.setReason("This team already has an assigned adviser.");
                    arRepo.save(r);
                }
            }

            List<AdviserRequest> conflicts = arRepo.findByScheduleAndAdviserAndStatus(schedule, adviser, RequestStatus.PENDING);
            for (AdviserRequest r : conflicts) {
                if (!r.getArid().equals(requestId)) {
                    r.setStatus(RequestStatus.REJECTED);
                    r.setReason("Schedule taken by another team.");
                    arRepo.save(r);
                }
            }

        } else {
            request.setStatus(RequestStatus.REJECTED);
            request.setReason(reason != null ? reason : "Rejected by adviser.");
            arRepo.save(request);
        }
    }


    public List<AdviserRequest> getPendingRequestsForAdviser(int adviserId) {
        return arRepo.findByAdviserUidAndStatus(adviserId, RequestStatus.PENDING);
    }


    public List<AdviserRequest> getRequestsByTeam(int teamId) {
        return arRepo.findPendingByTeam(teamId);
    }

    @Transactional
    public List<AdviserRequestDTO> getRequestsByTeamDTO(int teamId) {
        return arRepo.findPendingByTeam(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdviserRequestDTO> getRequestsForAdviserDTO(int adviserId) {
        return arRepo.findByAdviserUidAndStatus(adviserId, RequestStatus.PENDING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AdviserRequestDTO convertToDTO(AdviserRequest req) {
        Team team = req.getTeam();
        User adviser = req.getAdviser();
        Schedule sched = req.getSchedule();
        User leader = team.getLeader();
        Classes clazz = team.getClassRef();

        List<User> members = new ArrayList<>(team.getMembers());

        List<Integer> memberIds = members.stream()
                .filter(u -> u.getUid() != leader.getUid())
                .map(User::getUid)
                .toList();

        List<String> memberNames = members.stream()
                .filter(u -> u.getUid() != leader.getUid())
                .map(u -> u.getFirstname() + " " + u.getLastname())
                .toList();

        String scheduleDay = sched.getDay().toString();
        String scheduleTime = sched.getStartTime() + " - " + sched.getEndTime();

        String classDescription = clazz.getCourseDescription();
        String classCreator = clazz.getCreatedBy().getFirstname() + " " + clazz.getCreatedBy().getLastname();

        return new AdviserRequestDTO(
                req.getArid(),
                team.getTid(),
                team.getGroupName(),
                leader.getUid(),
                leader.getFirstname() + " " + leader.getLastname(),
                memberIds,
                memberNames,
                adviser.getUid(),
                adviser.getFirstname() + " " + adviser.getLastname(),
                sched.getSchedid(),
                scheduleDay,
                scheduleTime,
                req.getStatus().name(),
                req.getReason(),
                classDescription,
                classCreator
        );
    }

    @Transactional
    public List<AdviserRequestDTO> getAllRequestsByTeamDTO(int teamId) {
        return arRepo.findAllByTeamTid(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRequest(Long requestId) {
        if (!arRepo.existsById(requestId)) {
            throw new NoSuchElementException("Request not found.");
        }
        arRepo.deleteByArid(requestId);
    }

    public List<AdviserRequestDTO> getAllRequestsForAdviserDTO(int adviserId) {
        return arRepo.findAllByAdviserUid(adviserId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdviserRequestDTO> getAcceptedRequestsForAdviser(int adviserId) {
        return arRepo.findAcceptedByAdviser(adviserId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdviserRequestDTO> getRejectedRequestsForAdviser(int adviserId) {
        return arRepo.findRejectedByAdviser(adviserId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AdviserRequestDTO> getRequestsForAdviserByStatus(int adviserId, String status) {
        return arRepo.findByAdviserUidAndStatus(adviserId, RequestStatus.valueOf(status))
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    //request
    @Transactional
    public AdviserRequest submitLeaveRequest(int teamId, int requesterId, String reason) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can submit a leave request.");
        }

        if (team.getAdviser() == null || team.getSchedule() == null) {
            throw new IllegalStateException("No assigned adviser or schedule to leave.");
        }

        boolean alreadyRequested = arRepo.existsByTeamTidAndStatus(teamId, RequestStatus.REQUEST_TO_LEAVE);
        if (alreadyRequested) {
            throw new IllegalStateException("You have already submitted a leave request.");
        }

        AdviserRequest leaveRequest = new AdviserRequest(team, team.getAdviser(), team.getSchedule());
        leaveRequest.setStatus(RequestStatus.REQUEST_TO_LEAVE);
        leaveRequest.setReason(reason);

        return arRepo.save(leaveRequest);
    }

    //for dropping
    @Transactional
    public void handleLeaveRequest(Long requestId, boolean approve, String reason) {
        AdviserRequest leaveRequest = arRepo.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Leave request not found."));

        if (leaveRequest.getStatus() != RequestStatus.REQUEST_TO_LEAVE) {
            throw new IllegalStateException("Only REQUEST_TO_LEAVE requests can be handled here.");
        }

        if (approve) {
            Team team = leaveRequest.getTeam();
            team.setAdviser(null);
            team.setSchedule(null);
            tRepo.save(team);

            leaveRequest.setStatus(RequestStatus.DROP);
            arRepo.save(leaveRequest);

            List<AdviserRequest> acceptedRequests = arRepo.findByTeamTidAndStatus(team.getTid(), RequestStatus.ACCEPTED);
            for (AdviserRequest r : acceptedRequests) {
                arRepo.delete(r);
            }

        } else {
            leaveRequest.setStatus(RequestStatus.REJECTED);
            leaveRequest.setReason(reason != null ? reason : "Leave request rejected.");
            arRepo.save(leaveRequest);
        }
    }








}
