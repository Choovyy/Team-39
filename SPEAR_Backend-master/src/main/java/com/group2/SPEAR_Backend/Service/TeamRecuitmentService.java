package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.TeamRecuitmentDTO;
import com.group2.SPEAR_Backend.Model.Team;
import com.group2.SPEAR_Backend.Model.TeamRecuitment;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.TeamRecuitmentRepository;
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
public class TeamRecuitmentService {

    @Autowired
    private TeamRecuitmentRepository trRepo;

    @Autowired
    private TeamRepository tRepo;

    @Autowired
    private UserRepository uRepo;


    @Transactional
    public TeamRecuitment applyToTeam(int teamId, int studentId, String role, String reason) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found"));

        // Get the student
        User student = uRepo.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student with ID " + studentId + " not found"));

        // Ensure the student is enrolled in the class
        if (!team.getClassRef().getEnrolledStudents().contains(student)) {
            throw new IllegalStateException("Student must be enrolled in the class to apply for a team.");
        }

        // Check if the student already has a pending or accepted application
        Optional<TeamRecuitment> existingApplication = trRepo.findByTeamIdAndStudentId(teamId, studentId);
        if (existingApplication.isPresent()) {
            TeamRecuitment existing = existingApplication.get();
            if (existing.getStatus() == TeamRecuitment.Status.PENDING ||
                    existing.getStatus() == TeamRecuitment.Status.ACCEPTED) {
                throw new IllegalStateException("You already applied for this team. Please wait for the leader's decision");
            }
            // If rejected, allow re-application by resetting to pending
            existing.setStatus(TeamRecuitment.Status.PENDING);
            existing.setRole(role);
            existing.setReason(reason);
            return trRepo.save(existing);
        }

        // Create new recruitment request
        TeamRecuitment recruitment = new TeamRecuitment(team, student, role, reason, TeamRecuitment.Status.PENDING);
        return trRepo.save(recruitment);
    }
//in case shits hit the fan
//    @Transactional
//    public void reviewApplication(int recruitmentId, boolean isAccepted, String leaderReason) {
//        // Find recruitment request
//        TeamRecuitment recruitment = trRepo.findById(recruitmentId)
//                .orElseThrow(() -> new NoSuchElementException("Recruitment request not found"));
//
//        Team team = recruitment.getTeam();
//
//        if (isAccepted) {
//            // Check if team has reached its max size
//            if (team.getMembers().size() >= team.getClassRef().getMaxTeamSize()) {
//                throw new IllegalStateException("Team is already full.");
//            }
//
//            recruitment.setStatus(TeamRecuitment.Status.ACCEPTED);
//            recruitment.setReason(null); // Clear reason since it's accepted
//            team.getMembers().add(recruitment.getStudent()); // Add student to team
//            tRepo.save(team);
//        } else {
//            recruitment.setStatus(TeamRecuitment.Status.REJECTED);
//            recruitment.setReason(leaderReason != null ? leaderReason : "No reason provided.");
//        }
//
//        trRepo.save(recruitment);
//    }

    @Transactional
    public void reviewApplication(int recruitmentId, boolean isAccepted, String leaderReason) {
        TeamRecuitment recruitment = trRepo.findById(recruitmentId)
                .orElseThrow(() -> new NoSuchElementException("Recruitment request not found"));

        Team team = recruitment.getTeam();
        User student = recruitment.getStudent();
        Long classId = team.getClassRef().getCid();

        if (isAccepted) {
            // 1) only block if the student is already in *this* class
            boolean alreadyAcceptedInThisClass = trRepo.findByStudentId(student.getUid()).stream()
                    .anyMatch(r ->
                            r.getStatus() == TeamRecuitment.Status.ACCEPTED &&
                                    r.getTeam().getClassRef().getCid().equals(classId)
                    );

            boolean isLeaderInThisClass = tRepo.findByLeaderUid(student.getUid()).stream()
                    .anyMatch(t2 -> t2.getClassRef().getCid().equals(classId));

            if (alreadyAcceptedInThisClass || isLeaderInThisClass) {
                throw new IllegalStateException("This student is already in a team in this class.");
            }

            if (team.getMembers().size() >= team.getClassRef().getMaxTeamSize()) {
                throw new IllegalStateException("Team is already full.");
            }

            // accept them
            recruitment.setStatus(TeamRecuitment.Status.ACCEPTED);
            recruitment.setReason("Accepted by leader.");
            team.getMembers().add(student);

            // expire any other pending apps from this student in *other* teams
            trRepo.updateOtherApplicationsAsExpired(student.getUid(), team.getTid());
        } else {
            recruitment.setStatus(TeamRecuitment.Status.REJECTED);
            recruitment.setReason(leaderReason != null ? leaderReason : "No reason provided.");
        }

        tRepo.save(team);
        trRepo.save(recruitment);
    }

    public List<TeamRecuitmentDTO> getPendingApplicationsByTeam(int teamId) {
        List<TeamRecuitment> applications = trRepo.findPendingApplicationsByTeam(teamId);
        return applications.stream()
                .map(app -> new TeamRecuitmentDTO(
                        app.getTrid(),
                        app.getTeam().getTid(),
                        app.getStudent().getUid(),
                        app.getStudent().getFirstname() + " " + app.getStudent().getLastname(),
                        app.getTeam().getGroupName(),
                        app.getTeam().getClassRef().getCourseDescription(),
                        app.getRole(),
                        app.getReason(),
                        app.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public List<TeamRecuitmentDTO> getApplicationsByStudent(int studentId) {
        List<TeamRecuitment> applications = trRepo.findApplicationsByStudent(studentId);
        return applications.stream()
                .map(app -> new TeamRecuitmentDTO(
                        app.getTrid(),
                        app.getTeam().getTid(),
                        app.getStudent().getUid(),
                        app.getStudent().getFirstname() + " " + app.getStudent().getLastname(),
                        app.getTeam().getGroupName(),
                        app.getTeam().getClassRef() != null ? app.getTeam().getClassRef().getCourseDescription() : "No Class Assigned",
                        app.getTeam().getLeader().getFirstname() + " " + app.getTeam().getLeader().getLastname(),
                        app.getRole(),
                        app.getReason(),
                        app.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public List<TeamRecuitmentDTO> getPendingApplicationsByLeader(int leaderId) {
        List<TeamRecuitment> applications = trRepo.findPendingApplicationsByLeader(leaderId);

        return applications.stream()
                .map(app -> new TeamRecuitmentDTO(
                        app.getTrid(),
                        app.getTeam().getTid(),
                        app.getStudent().getUid(),
                        app.getStudent().getFirstname() + " " + app.getStudent().getLastname(),
                        app.getTeam().getGroupName(),
                        app.getTeam().getClassRef() != null ? app.getTeam().getClassRef().getCourseDescription() : "No Class Assigned",
                        app.getRole(),
                        app.getReason(),
                        app.getStatus()
                ))
                .collect(Collectors.toList());
    }

}
