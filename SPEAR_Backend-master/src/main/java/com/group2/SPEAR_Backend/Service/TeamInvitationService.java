package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.TeamInvitationDTO;
import com.group2.SPEAR_Backend.Model.*;
import com.group2.SPEAR_Backend.Repository.TeamInvitationRepository;
import com.group2.SPEAR_Backend.Repository.TeamRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeamInvitationService {

    @Autowired
    private TeamInvitationRepository invitationRepo;

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private UserRepository userRepo;

    @Transactional
    public void inviteStudent(int teamId, int leaderId, int studentId) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        if (team.getLeader().getUid() != leaderId) {
            throw new IllegalStateException("Only the team leader can invite members.");
        }

        User student = userRepo.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found"));

        if (!team.getClassRef().getEnrolledStudents().contains(student)) {
            throw new IllegalStateException("Student must be enrolled in the same class.");
        }

        if (teamRepo.findTeamByStudentAndClass((long) studentId, team.getClassRef().getCid()) != null) {
            throw new IllegalStateException("Student is already in a team for this class.");
        }

        Optional<TeamInvitation> existing = invitationRepo.findByTeamIdAndStudentId(teamId, studentId);
        if (existing.isPresent() && existing.get().getStatus() == TeamInvitation.Status.PENDING) {
            throw new IllegalStateException("Invitation already sent and is pending.");
        }

        TeamInvitation invite = new TeamInvitation(team, student, TeamInvitation.Status.PENDING);
        invitationRepo.save(invite);
    }

    @Transactional
    public void acceptInvitation(int invitationId) {
        TeamInvitation invitation = invitationRepo.findById(invitationId)
                .orElseThrow(() -> new NoSuchElementException("Invitation not found"));

        Team team = invitation.getTeam();
        User student = invitation.getStudent();

        if (teamRepo.findTeamByStudentAndClass((long) student.getUid(), team.getClassRef().getCid()) != null
                || teamRepo.existsByLeaderUid(student.getUid())) {
            throw new IllegalStateException("Student is already in a team or is a team leader.");
        }

        team.getMembers().add(student);
        invitation.setStatus(TeamInvitation.Status.ACCEPTED);

        teamRepo.save(team);
        invitationRepo.save(invitation);
    }

    @Transactional
    public void rejectInvitation(int invitationId) {
        TeamInvitation invitation = invitationRepo.findById(invitationId)
                .orElseThrow(() -> new NoSuchElementException("Invitation not found"));

        invitation.setStatus(TeamInvitation.Status.REJECTED);
        invitationRepo.save(invitation);
    }

    public List<TeamInvitationDTO> getPendingInvitationsByStudent(int studentId) {
        List<TeamInvitation> invites = invitationRepo.findPendingInvitationsByStudent(studentId);

        return invites.stream()
                .map(i -> {
                    var team = i.getTeam();
                    var leader = team.getLeader();

                    List<String> members = team.getMembers().stream()
                            .filter(m -> m.getUid() != leader.getUid())
                            .map(m -> m.getFirstname() + " " + m.getLastname())
                            .collect(Collectors.toList());

                    return new TeamInvitationDTO(
                            i.getInvitationId(),
                            team.getTid(),
                            i.getStudent().getUid(),
                            i.getStudent().getFirstname() + " " + i.getStudent().getLastname(),
                            team.getGroupName(),
                            team.getClassRef().getCourseDescription(),
                            leader.getFirstname() + " " + leader.getLastname(),
                            members,
                            i.getStatus()
                    );
                })
                .collect(Collectors.toList());
    }
}
