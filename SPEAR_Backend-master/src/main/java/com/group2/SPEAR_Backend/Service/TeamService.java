package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.*;
import com.group2.SPEAR_Backend.Model.*;
import com.group2.SPEAR_Backend.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    @Autowired
    private TeamRepository tRepo;

    @Autowired
    private ProjectProposalRepository ppRepo;

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private TeamRecuitmentRepository trRepo;

    @Autowired
    private FeatureRepository fRepo;

    @Autowired
    private ClassesRepository cRepo;

    @Autowired
    private ScheduleRepository sRepo;

    @Autowired
    private AdviserRequestRepository arRepo;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");


    //reverse function from create project proposal
    //instead of created by member, do it by group
    //fix also the leader functionality
    @Transactional
    public Team createTeam(int studentId, Long classId, String groupName) {
        User student = uRepo.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student with ID " + studentId + " not found."));

        Classes classRef = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class with ID " + classId + " not found."));

        if (!classRef.getEnrolledStudents().contains(student)) {
            throw new IllegalStateException("Student must be enrolled in the class to create a team.");
        }

        boolean isAlreadyLeader = tRepo.existsByLeaderAndClassRef(student, classRef);
        if (isAlreadyLeader) {
            throw new IllegalStateException("Student is already leading a team in this class.");
        }

        Team newTeam = new Team(null, student, classRef, groupName, null, null);
        newTeam.getMembers().add(student);
        newTeam.setRecruitmentOpen(true);
        return tRepo.save(newTeam);
    }

    //all the leader functions
//    @Transactional
//    public void addPreferredMember(int teamId, int requesterId, int memberId) {
//        Team team = tRepo.findById(teamId)
//                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));
//
//        if (team.getLeader().getUid() != requesterId) {
//            throw new IllegalStateException("Only the team leader can add members.");
//        }
//
//        Classes teamClass = team.getClassRef();
//        int maxTeamSize = teamClass.getMaxTeamSize();
//
//        if (!team.isRecruitmentOpen()) {
//            throw new IllegalStateException("Cannot add members. Recruitment is closed.");
//        }
//
//        User newMember = uRepo.findById(memberId)
//                .orElseThrow(() -> new NoSuchElementException("User with ID " + memberId + " not found."));
//
//        if (!teamClass.getEnrolledStudents().contains(newMember)) {
//            throw new IllegalStateException("The new member must be enrolled in the same class as the team.");
//        }
//        team.getMembers().add(newMember);
//
//        if (team.getMembers().size() >= maxTeamSize) {
//            team.setRecruitmentOpen(false);
//        }
//
//        tRepo.save(team);
//    }

    @Deprecated
    public void addPreferredMember(int teamId, int requesterId, int memberId) {
        throw new UnsupportedOperationException("addPreferredMember is deprecated. Use TeamInvitationService.inviteStudent instead.");
    }

    public Team updateGroupName(int teamId, String groupName, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can update the group name.");
        }
        team.setGroupName(groupName);
        return tRepo.save(team);
    }

    public StatusDTO openRecruitment(int teamId, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can open recruitment.");
        }

        team.setRecruitmentOpen(true);
        tRepo.save(team);

        String leaderFullName = uRepo.findFullNameById(team.getLeader().getUid());

        return new StatusDTO(
                team.getGroupName(),
                leaderFullName,
                "Team is open for recruitment"
        );
    }

    public StatusDTO closeRecruitment(int teamId, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can close recruitment.");
        }

        team.setRecruitmentOpen(false);
        tRepo.save(team);

        String leaderFullName = uRepo.findFullNameById(team.getLeader().getUid());

        return new StatusDTO(
                team.getGroupName(),
                leaderFullName,
                "Team is not available for recruitment"
        );
    }

    @Transactional
    public void kickMember(int teamId, int requesterId, int memberId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can remove members.");
        }

        User memberToRemove = team.getMembers().stream()
                .filter(member -> member.getUid() == memberId)
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Member with ID " + memberId + " not found in the team."));

        team.getMembers().remove(memberToRemove);

        Optional<TeamRecuitment> recruitmentRecord = trRepo.findByTeamIdAndStudentId(teamId, memberId);
        recruitmentRecord.ifPresent(trRepo::delete);

        tRepo.save(team);
    }

    @Transactional
    public void transferLeadership(int teamId, int requesterId, int newLeaderId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the current leader can transfer leadership.");
        }

        User newLeader = uRepo.findById(newLeaderId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + newLeaderId + " not found."));

        if (!team.getMembers().contains(newLeader)) {
            throw new IllegalStateException("The new leader must be a current member of the team.");
        }

        team.setLeader(newLeader);
        tRepo.save(team);
    }

    @Transactional
    public void deleteTeam(int teamId, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));
        // … leader & member checks …

        // 3) soft-delete & unlink *every* proposal, even those already soft-deleted
        List<ProjectProposal> proposals = ppRepo.findAllByTeamIdIncludeDeleted(teamId);
        for (ProjectProposal p : proposals) {
            p.setDeleted(true);
            p.setTeamProject(null);
        }
        ppRepo.saveAll(proposals);
        ppRepo.flush();  // force those UPDATEs before the DELETE

        // 4) cleanup members/advisor
        tRepo.deleteTeamMembers(teamId);
        arRepo.deleteByTeamTid(teamId);

        // 5) unlink schedule
        team.setSchedule(null);
        tRepo.save(team);

        // 6) finally delete the team
        tRepo.deleteById(teamId);
    }

    //scheduling
    //schedule to change
    public List<ScheduleDTO> getAvailableSchedulesForAdviser(int adviserId) {
        List<Schedule> schedules = sRepo.findAvailableSchedulesForAdviser(adviserId);

        return schedules.stream()
                .map(schedule -> new ScheduleDTO(
                        schedule.getSchedid(),
                        schedule.getDay(),
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getTeacher().getUid(),
                        schedule.getTeacher().getFirstname() + " " + schedule.getTeacher().getLastname(),
                        null,
                        null,
                        null
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public String assignAdviserAndSchedule(int teamId, int adviserId, int scheduleId, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        User requester = uRepo.findById(requesterId)
                .orElseThrow(() -> new NoSuchElementException("Requester not found"));

        // Ensure only the leader can assign an adviser
        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can assign an adviser and schedule.");
        }

        User adviser = uRepo.findById(adviserId)
                .orElseThrow(() -> new NoSuchElementException("Adviser not found"));

        Schedule schedule = sRepo.findById(scheduleId)
                .orElseThrow(() -> new NoSuchElementException("Schedule not found"));

        // Check if the schedule is already assigned to another team
        Optional<Team> conflictingTeam = tRepo.findBySchedule(schedule);
        if (conflictingTeam.isPresent() && conflictingTeam.get().getTid() != teamId) {
            throw new IllegalStateException("This schedule is already assigned to another team.");
        }

        team.setAdviser(adviser);
        team.setSchedule(schedule);
        tRepo.save(team);

        return "Adviser and Schedule successfully assigned to the team.";
    }


//    public List<UserDTO> getStudentsWithoutTeam(Long classId) {
//        Classes clazz = cRepo.findById(classId)
//                .orElseThrow(() -> new NoSuchElementException("Class not found"));
//
//        List<User> enrolledStudents = new ArrayList<>(clazz.getEnrolledStudents());
//
//        List<User> studentsWithoutTeam = enrolledStudents.stream()
//                .filter(student -> tRepo.findTeamByStudentAndClass(Long.valueOf(student.getUid()), classId) == null)
//                .toList();
//
//        return studentsWithoutTeam.stream()
//                .map(s -> new UserDTO(s.getFirstname(), s.getLastname(), s.getEmail(), s.getUid()))
//                .toList();
//    }

    public List<UserDTO> getStudentsWithoutTeam(Long classId) {
        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found"));

        Set<User> enrolledStudents = clazz.getEnrolledStudents();
        if (enrolledStudents == null || enrolledStudents.isEmpty()) {
            return List.of();
        }

        return enrolledStudents.stream()
                .filter(student -> tRepo.findTeamByStudentAndClass(Long.valueOf(student.getUid()), classId) == null)
                .map(student -> new UserDTO(student.getFirstname(), student.getLastname(), student.getEmail(), student.getUid()))
                .toList();
    }

    public List<TeamMembersDTO> getTeamsWithMembers(Long classId) {
        List<Team> teams = tRepo.findActiveTeamsByClassId(classId.intValue());

        return teams.stream()
                .map(team -> new TeamMembersDTO(
                        team.getTid(),
                        team.getGroupName(),
                        team.getMembers().stream()
                                .map(member -> new MemberDTO(
                                        member.getUid(),
                                        member.getFirstname() + " " + member.getLastname()
                                ))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTeamAndUnlinkProposals(int teamId) {
        // 1) load team
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // 2) nullify the foreign key on any proposal
        List<ProjectProposal> proposals = ppRepo.findByTeamId(teamId);
        for (ProjectProposal p : proposals) {
            p.setTeamProject(null);
        }
        ppRepo.saveAll(proposals);

        // 3) finally delete the team
        tRepo.delete(team);
    }


    //leader
    @Transactional
    public String dropAdviserAndSchedule(int teamId, int requesterId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        User requester = uRepo.findById(requesterId)
                .orElseThrow(() -> new NoSuchElementException("Requester not found"));

        // Ensure only the leader can remove adviser/schedule
        if (team.getLeader().getUid() != requesterId) {
            throw new IllegalStateException("Only the team leader can drop the adviser and schedule.");
        }

        if (team.getAdviser() == null && team.getSchedule() == null) {
            throw new IllegalStateException("No adviser or schedule assigned to this team.");
        }

        team.setAdviser(null);
        team.setSchedule(null);
        tRepo.save(team);

        return "Adviser and Schedule successfully removed from the team.";
    }

    //rekta adviser
    @Transactional
    public String adviserDropsTeam(int teamId, String reason, int adviserId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        if (team.getAdviser() == null || team.getSchedule() == null) {
            throw new IllegalStateException("This team has no adviser or schedule to drop.");
        }

        if (team.getAdviser().getUid() != adviserId) {
            throw new IllegalStateException("You are not the adviser of this team.");
        }

        // Remove accepted advisory request
        AdviserRequest accepted = arRepo.findByTeamTidAndStatus(teamId, RequestStatus.ACCEPTED)
                .stream()
                .findFirst()
                .orElse(null);

        if (accepted != null) {
            arRepo.delete(accepted);
        }

        // Create DROP record
        AdviserRequest dropRequest = new AdviserRequest(team, team.getAdviser(), team.getSchedule());
        dropRequest.setStatus(RequestStatus.DROP);
        dropRequest.setReason(reason);
        arRepo.save(dropRequest);

        // Null out adviser/schedule
        team.setAdviser(null);
        team.setSchedule(null);
        tRepo.save(team);

        return "Team adviser and schedule dropped successfully.";
    }

    //for team recuitment only
    public List<TeamDTO> getOpenTeamsForRecruitment(Long classId) {
        List<Team> openTeams = tRepo.findOpenTeamsForRecruitmentByClassId(classId);
        return openTeams.stream()
                .map(team -> new TeamDTO(
                        team.getTid(),
                        team.getGroupName(),
                        team.getProject()!=null?team.getProject().getProjectName():"No Project Assigned",
                        team.getProject()!=null?team.getProject().getPid():null,
                        team.getLeader().getFirstname() + " " + team.getLeader().getLastname(),
                        team.getClassRef().getCid(),
                        team.getMembers().stream().map(User::getUid).toList(),
                        team.isRecruitmentOpen(),
                        null,
                        team.getProject()!=null?team.getProject().getDescription():"No Description Available",
                        team.getAdviser()!=null?team.getAdviser().getUid():null,
                        team.getSchedule()!=null?team.getSchedule().getSchedid():null,
                        team.getClassRef().getMaxTeamSize()
                ))
                .toList();
    }





    //non-member function
    @Transactional
    public void leaveTeam(int teamId, int userId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found."));

        User user = uRepo.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with ID " + userId + " not found."));

        if (!team.getMembers().contains(user)) {
            throw new IllegalStateException("User is not a member of this team.");
        }

        if (team.getLeader().getUid() == userId) {
            throw new IllegalStateException("Leaders cannot leave their own team. Transfer leadership first.");
        }
        team.getMembers().remove(user);
        tRepo.save(team);
        trRepo.deleteByTeamIdAndStudentId(teamId, userId);
    }



    //all get functions
    public List<TeamDTO> getAllActiveTeams() {
        return tRepo.findAllActiveTeams().stream()
                .map(team -> new TeamDTO(
                        team.getTid(),
                        team.getGroupName(),
                        (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned",
                        (team.getProject() != null) ? team.getProject().getPid() : null,
                        team.getLeader().getFirstname() + " " + team.getLeader().getLastname(),
                        team.getClassRef().getCid(),
                        team.getMembers().stream().map(User::getUid).toList(),
                        team.isRecruitmentOpen(),
                        null,
                        (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available",
                        (team.getAdviser() != null) ? team.getAdviser().getUid() : null,
                        (team.getSchedule() != null) ? team.getSchedule().getSchedid() : null
                ))
                .toList();
    }

    public TeamDTO getTeamById(int teamId) {
        Team team = tRepo.findActiveTeamById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team with ID " + teamId + " not found or has been deleted."));

        List<FeatureDTO> features = (team.getProject() != null) ?
                fRepo.findByProjectId(team.getProject().getPid()).stream()
                        .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                        .toList()
                : new ArrayList<>();

        return new TeamDTO(
                team.getTid(),
                team.getGroupName(),
                (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned",
                (team.getProject() != null) ? team.getProject().getPid() : null,
                team.getLeader().getFirstname() + " " + team.getLeader().getLastname(),
                team.getClassRef().getCid(),
                team.getMembers().stream().map(User::getUid).toList(),
                team.isRecruitmentOpen(),
                features,
                (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available",
                (team.getAdviser() != null) ? team.getAdviser().getUid() : null,
                (team.getSchedule() != null) ? team.getSchedule().getSchedid() : null
        );
    }

    //will customize
    public List<TeamDTO> getTeamsByClassId(int classId) {
        List<Team> activeTeams = tRepo.findActiveTeamsByClassId(classId);

        if (activeTeams.isEmpty()) {
            throw new NoSuchElementException("No active teams found for class ID " + classId);
        }

        List<TeamDTO> teamDTOs = new ArrayList<>();

        for (Team team : activeTeams) {
            String projectName = (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned";
            Integer projectId = (team.getProject() != null) ? team.getProject().getPid() : null;
            String projectDescription = (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available";

            String leaderName = (team.getLeader() != null) ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname() : "Unknown Leader";

            String adviserName = (team.getAdviser() != null) ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname() : "No Adviser Assigned";

            String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Day Set";

            String scheduleTime = (team.getSchedule() != null)
                    ? team.getSchedule().getStartTime().format(TIME_FORMATTER) + " - " + team.getSchedule().getEndTime().format(TIME_FORMATTER)
                    : "No Time Set";

            String courseDescription = (team.getClassRef() != null) ? team.getClassRef().getCourseDescription() : "No Class Info Available";

            List<String> memberNames = team.getMembers().stream()
                    .filter(member -> team.getLeader() == null || member.getUid() != team.getLeader().getUid())
                    .map(member -> member.getFirstname() + " " + member.getLastname())
                    .collect(Collectors.toList());

            List<FeatureDTO> features = new ArrayList<>();
            if (team.getProject() != null) {
                features = fRepo.findByProjectId(projectId).stream()
                        .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                        .toList();
            }

            teamDTOs.add(new TeamDTO(
                    team.getTid(),
                    team.getGroupName(),
                    projectName,
                    projectId,
                    leaderName,
                    team.getClassRef().getCid(),
                    team.getMembers().stream().map(User::getUid).toList(),
                    team.isRecruitmentOpen(),
                    features,
                    projectDescription,
                    adviserName,
                    scheduleDay,
                    scheduleTime,
                    courseDescription,
                    memberNames
            ));
        }
        return teamDTOs;
    }

    public TeamDTO getMyTeam(int userId, int classId) {
        Team team = tRepo.findMyTeamByClassId(userId, classId)
                .orElseThrow(() -> new NoSuchElementException("No team found for the user in this class."));

        String projectName = (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned";
        Integer projectId = (team.getProject() != null) ? team.getProject().getPid() : null;
        String projectDescription = (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available";
        String leaderName = (team.getLeader() != null) ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname() : "Unknown Leader";

        String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Day Set";

        String scheduleTime = (team.getSchedule() != null)
                ? team.getSchedule().getStartTime().format(TIME_FORMATTER) + " - " + team.getSchedule().getEndTime().format(TIME_FORMATTER)
                : "No Time Set";

        String adviserName = (team.getAdviser() != null) ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname() : "No Adviser Assigned";

        String courseDescription = (team.getClassRef() != null) ? team.getClassRef().getCourseDescription() : "No Class Info Available";

        List<String> memberNames = team.getMembers().stream()
                .filter(member -> team.getLeader() == null || member.getUid() != team.getLeader().getUid())
                .map(member -> member.getFirstname() + " " + member.getLastname())
                .collect(Collectors.toList());

        return new TeamDTO(
                team.getTid(),
                team.getGroupName(),
                projectName,
                projectId,
                leaderName,
                team.getClassRef().getCid(),
                team.getMembers().stream().map(User::getUid).toList(),
                team.isRecruitmentOpen(),
                null,
                projectDescription,
                adviserName,
                scheduleDay,
                scheduleTime,
                courseDescription,
                memberNames
        );
    }

    public List<UserDTO> getTeamMembers(int teamId) {
        List<User> members = tRepo.findMembersByTeamId(teamId);
        return members.stream()
                .map(member -> new UserDTO(member.getFirstname(), member.getLastname()))
                .toList();
    }

    public List<UserDTO> getAvailableStudentsForTeam(Long classId, String searchTerm) {
        List<User> availableStudents = uRepo.findAvailableStudentsForTeamWithSearch(classId, searchTerm);
        return availableStudents.stream()
                .map(student -> new UserDTO(student.getFirstname(), student.getLastname(), student.getEmail(), student.getUid()))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getTeamMembersAndAdviser(int teamId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found"));

        // Get member names and IDs
        List<String> memberNames = new ArrayList<>();
        List<Integer> memberIds = new ArrayList<>();
        for (User member : team.getMembers()) {
            memberNames.add(member.getFirstname() + " " + member.getLastname());
            memberIds.add(member.getUid());
        }

        // Get adviser name and ID
        String adviserName = "No Adviser Assigned";
        Integer adviserId = null;
        if (team.getAdviser() != null) {
            adviserName = team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname();
            adviserId = team.getAdviser().getUid();
        }

        // Build response
        Map<String, Object> result = new HashMap<>();
        result.put("teamId", team.getTid());
        result.put("groupName", team.getGroupName());
        result.put("memberNames", memberNames);
        result.put("memberIds", memberIds);
        result.put("adviserName", adviserName);
        result.put("adviserId", adviserId);

        return result;
    }

//    public List<UserDTO> getQualifiedAdvisersForClass(Long classId) {
//        List<User> advisers = cRepo.findQualifiedAdvisersByClassId(classId);
//
//        return advisers.stream()
//                .map(adviser -> new UserDTO(
//                        adviser.getUid(),
//                        adviser.getFirstname(),
//                        adviser.getLastname(),
//                        adviser.getEmail(),
//                        adviser.getRole(),
//                        adviser.getInterests(),
//                        adviser.getDepartment()
//                ))
//                .collect(Collectors.toList());
//    }

    public List<UserDTO> getAllAdvisers() {
        List<User> advisers = uRepo.findByRole("TEACHER");

        return advisers.stream()
                .map(adviser -> new UserDTO(
                        adviser.getUid(),
                        adviser.getFirstname(),
                        adviser.getLastname(),
                        adviser.getEmail(),
                        adviser.getRole(),
                        adviser.getInterests(),
                        adviser.getDepartment()
                ))
                .collect(Collectors.toList());
    }

    public List<TeamDTO> getTeamsByAdviser(int adviserId) {
        List<Team> teams = tRepo.findTeamsByAdviserAndSchedule(adviserId);

        if (teams.isEmpty()) {
            throw new NoSuchElementException("No teams found for adviser ID " + adviserId);
        }

        List<TeamDTO> teamDTOs = new ArrayList<>();

        for (Team team : teams) {
            String projectName = (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned";
            Integer projectId = (team.getProject() != null) ? team.getProject().getPid() : null;
            String projectDescription = (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available";
            String leaderName = (team.getLeader() != null) ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname() : "Unknown Leader";
            String adviserName = (team.getAdviser() != null) ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname() : "No Adviser Assigned";
            String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Day Set";
            String scheduleTime = (team.getSchedule() != null)
                    ? team.getSchedule().getStartTime().format(TIME_FORMATTER) + " - " + team.getSchedule().getEndTime().format(TIME_FORMATTER)
                    : "No Time Set";

            String courseDescription = (team.getClassRef() != null) ? team.getClassRef().getCourseDescription() : "No Class Info Available";

            List<String> memberNames = team.getMembers().stream()
                    .filter(member -> team.getLeader() == null || member.getUid() != team.getLeader().getUid())
                    .map(member -> member.getFirstname() + " " + member.getLastname())
                    .collect(Collectors.toList());

            List<FeatureDTO> features = new ArrayList<>();
            if (team.getProject() != null) {
                features = fRepo.findByProjectId(projectId).stream()
                        .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                        .toList();
            }
            teamDTOs.add(new TeamDTO(
                    team.getTid(),
                    team.getGroupName(),
                    projectName,
                    projectId,
                    leaderName,
                    team.getClassRef().getCid(),
                    team.getMembers().stream().map(User::getUid).toList(),
                    team.isRecruitmentOpen(),
                    features,
                    projectDescription,
                    adviserName,
                    scheduleDay,
                    scheduleTime,
                    courseDescription,
                    memberNames
            ));
        }
        return teamDTOs;
    }

    @Transactional
    public void setOfficialProject(int teamId, int proposalId, int leaderId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team with ID " + teamId + " not found"));

        if (team.getLeader().getUid() != leaderId) {
            throw new IllegalArgumentException("Only the team leader can set an official project.");
        }

        ProjectProposal proposal = ppRepo.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Project proposal with ID " + proposalId + " not found"));

        if (proposal.getStatus() != ProjectStatus.APPROVED) {
            throw new RuntimeException("Only an APPROVED project can be set as the official project.");
        }

        team.setProject(proposal);
        tRepo.save(team);
    }

    @Transactional
    public void unsetOfficialProject(int teamId, int leaderId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team with ID " + teamId + " not found"));

        if (team.getLeader().getUid() != leaderId) {
            throw new IllegalArgumentException("Only the team leader can remove the official project.");
        }

        team.setProject(null);
        tRepo.save(team);
    }

    @Transactional
    public Map<String, Object> getOfficialProjectWithAdviserAndFeatures(int teamId) {
        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team with ID " + teamId + " not found"));

        if (team.getProject() == null) {
            throw new RuntimeException("This team does not have an official project assigned.");
        }

        ProjectProposal project = team.getProject();

        // Retrieve leader's name
        String leaderName = team.getLeader() != null
                ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname()
                : "No Leader Assigned";

        // Retrieve adviser name
        String adviserName = team.getAdviser() != null
                ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname()
                : "No Adviser Assigned";

        // Retrieve project features
        List<FeatureDTO> features = fRepo.findByProjectId(project.getPid()).stream()
                .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                .collect(Collectors.toList());

        // Get project rating or set default if null
        String rating = (project.getRatings() != null && !project.getRatings().isBlank()) ? project.getRatings() : "No Rating";

        // Retrieve schedule details
        String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Schedule Set";
        String scheduleTime = (team.getSchedule() != null)
                ? team.getSchedule().getStartTime().format(DateTimeFormatter.ofPattern("h:mm a")) + " - " +
                team.getSchedule().getEndTime().format(DateTimeFormatter.ofPattern("h:mm a"))
                : "No Time Set";

        // Retrieve course description
        String courseDescription = team.getClassRef() != null ? team.getClassRef().getCourseDescription() : "No Class Info Available";

        // Retrieve team members' names
        List<String> memberNames = team.getMembers().stream()
                .map(member -> member.getFirstname() + " " + member.getLastname())
                .collect(Collectors.toList());

        // Prepare the response
        Map<String, Object> response = new HashMap<>();
        response.put("teamId", team.getTid());
        response.put("teamName", team.getGroupName());
        response.put("classId", team.getClassRef().getCid());
        response.put("leaderName", leaderName);
        response.put("memberNames", memberNames);
        response.put("scheduleDay", scheduleDay);
        response.put("scheduleTime", scheduleTime);
        response.put("courseDescription", courseDescription);
        response.put("projectId", project.getPid());
        response.put("projectName", project.getProjectName());
        response.put("description", project.getDescription());
        response.put("status", project.getStatus().name());
        response.put("adviserName", adviserName);
        response.put("features", features);
        response.put("rating", rating); // Adding project rating

        return response;
    }

    public TeamProjectDTO getProjectAndMembersByTeamName(String teamName) {
        Team team = tRepo.findByTeamName(teamName)
                .orElseThrow(() -> new NoSuchElementException("No team found with name: " + teamName));

        ProjectProposal project = team.getProject();
        if (project == null) {
            throw new NoSuchElementException("No official project assigned to team: " + teamName);
        }

        // Extract Member IDs
        List<Integer> memberIds = team.getMembers()
                .stream()
                .map(User::getUid)  // Get user ID
                .toList();

        // Extract Member Names
        List<String> memberNames = team.getMembers()
                .stream()
                .map(m -> m.getFirstname() + " " + m.getLastname())  // Get full name
                .toList();

        // Create DTO with Member IDs and Names
        return new TeamProjectDTO(
                team.getTid(),
                team.getGroupName(),
                project.getPid(),
                project.getProjectName(),
                project.getDescription(),
                project.getStatus().toString(),
                project.getRatings(),
                memberIds,  // Include member IDs
                memberNames  // Include member names
        );
    }










    //Q it services (for maboi Jandel
    public List<TeamDTO> retrieveTeamsForMentor(int mentorID) {
        List<Team> retrievedTeams = tRepo.retrieveTeamsForMentor(mentorID);
        List<TeamDTO> teamsToReturn = new ArrayList<>();

        retrievedTeams.stream()
                .forEach(team -> {
                    List<String> memberNames = team.getMembers().stream()
                            .map(member -> member.getFirstname() + " " + member.getLastname())
                            .collect(Collectors.toList());
                    TeamDTO foo = new TeamDTO(
                        team.getTid(),
                        team.getGroupName(),
                        team.getClassRef().getCid(),
                        team.getMembers().stream().map(User::getUid).toList(),
                        memberNames,
                        team.getSchedule().getDay(),
                        team.getSchedule().getStartTime(),
                        team.getSchedule().getEndTime()
                    );
                    teamsToReturn.add(foo);
                });
        return teamsToReturn;
    }

    public List<TeamDTO> retrieveScheduledTeamsForMeetingAutomation(String concernedDay){
        DayOfWeek day = DayOfWeek.valueOf(concernedDay);
        List<Team> retrievedTeams = tRepo.retrieveScheduledTeamsForMeetingAutomation(day);
        List<TeamDTO> teamsToReturn = new ArrayList<>();

        retrievedTeams.stream()
                .forEach(team -> {
                    List<String> memberNames = team.getMembers().stream()
                            .map(member -> member.getFirstname() + " " + member.getLastname())
                            .collect(Collectors.toList());
                    TeamDTO foo = new TeamDTO(
                            team.getTid(),
                            team.getGroupName(),
                            team.getClassRef().getCid(),
                            team.getMembers().stream().map(User::getUid).toList(),
                            memberNames,
                            team.getSchedule().getDay(),
                            team.getSchedule().getStartTime(),
                            team.getSchedule().getEndTime(),
                            team.getAdviser().getUid(),
                            team.getAdviser().getFirstname()+" "+team.getAdviser().getLastname()
                    );
                    teamsToReturn.add(foo);
                });
        return teamsToReturn;
    }

    //nag create nalang ko akoa endpoint version 2 sa myTeam,
    // kay need jud nako ang adviser ID since relational database man ato gamit
    public TeamDTO retrieveTeamForStudentWithinClassroom(int userId, int classId) {
        Team team = tRepo.findMyTeamByClassId(userId, classId)
                .orElseThrow(() -> new NoSuchElementException("No team found for the user in this class."));

        List<String> memberNames = team.getMembers().stream()
                .map(member -> member.getFirstname() + " " + member.getLastname())
                .collect(Collectors.toList());

        // Get the schedule
        Schedule schedule = team.getSchedule();

        // Check if schedule is null and handle accordingly
        DayOfWeek day = (schedule != null) ? schedule.getDay() : null;
        LocalTime startTime = (schedule != null) ? schedule.getStartTime() : null;
        LocalTime endTime = (schedule != null) ? schedule.getEndTime() : null;

        return new TeamDTO(
                team.getTid(),
                team.getGroupName(),
                team.getClassRef().getCid(),
                team.getMembers().stream().map(User::getUid).toList(),
                memberNames,
                day,
                startTime,
                endTime,
                team.getAdviser() == null? -1:team.getAdviser().getUid()
        );
    }

    public HashSet<Integer> retrieveNotificationRecipientsForAllClasses(int facultyID){
        List<Classes> allClasses = cRepo.findAllByFaculty(facultyID);
        Set<Integer> userIDList = new HashSet<>();
        allClasses.stream()
                .forEach(classes -> {
                    classes.getEnrolledStudents().stream()
                            .forEach(student ->{
                                userIDList.add(Integer.valueOf(student.getUid()));
                            });
                });

        return (HashSet<Integer>) userIDList;
    }

    public HashSet<Integer> retrieveNotificationRecipientsForSelectClasses(int facultyID, List<Integer> classIDList){
        List<Classes> selectedClasses = cRepo.findSelectedByFaculty(facultyID, classIDList);

        Set<Integer> userIDList = new HashSet<>();
        selectedClasses.stream()
                .forEach(classes -> {
                    List<Team> teams = tRepo.findActiveTeamsByClassId(classes.getCid().intValue());
                    teams.stream()
                            .forEach(team -> {
                                team.getMembers().stream()
                                        .forEach(member -> {
                                            userIDList.add(member.getUid());
                                        });
                            });
                });

        return (HashSet<Integer>) userIDList;
    }

    public HashSet<Integer> retrieveNotificationRecipientsForAllTeams(int facultyID){
        List<Team> teams = tRepo.retrieveTeamsForMentor(facultyID);
        Set<Integer> userIDList = new HashSet<>();
        teams.stream()
                .forEach(team -> {
                    team.getMembers().stream()
                            .forEach(member->{
                                userIDList.add(member.getUid());
                            });
                });

        return (HashSet<Integer>) userIDList;
    }

    public HashSet<Integer> retrieveNotificationRecipientsForSelectedTeams(int facultyID, List<Integer> teamIDList){
        List<Team> teams = tRepo.retrieveSelectedTeamsForMentor(facultyID, teamIDList);
        Set<Integer> userIDList = new HashSet<>();
        teams.stream()
                .forEach(team -> {
                    team.getMembers().stream()
                            .forEach(member->{
                                userIDList.add(member.getUid());
                            });
                });

        return (HashSet<Integer>) userIDList;
    }


    //THIS IS THE UNIVERSAL!!!!!!!
    public TeamDTO getStudentTeam(Long studentId, Long classId) {
        Team team = tRepo.findTeamByStudentAndClass(studentId, classId);
        if (team == null) return null;

        // Extract member IDs and names
        List<Integer> memberIds = team.getMembers()
                .stream()
                .map(User::getUid)  // Extract ID
                .collect(Collectors.toList());

        List<String> memberNames = team.getMembers()
                .stream()
                .map(m -> m.getFirstname() + " " + m.getLastname())
                .collect(Collectors.toList());

        // Extract advisor details
        User adviser = team.getAdviser();
        Integer adviserId = adviser != null ? adviser.getUid() : null;
        String adviserName = adviser != null ? adviser.getFirstname() + " " + adviser.getLastname() : "No Adviser Assigned";

        // Extract course description (Assuming it's a field in the 'Classes' entity)
        String courseDescription = team.getClassRef() != null ? team.getClassRef().getCourseDescription() : "No Course Description Available";

        // Extract the schedule details
        DayOfWeek scheduledDay = team.getSchedule() != null ? team.getSchedule().getDay() : null;
        LocalTime start = team.getSchedule() != null ? team.getSchedule().getStartTime() : null;
        LocalTime end = team.getSchedule() != null ? team.getSchedule().getEndTime() : null;

        // Return the TeamDTO
        return new TeamDTO(
                team.getTid(),  // teamId
                team.getGroupName(),
                team.getClassRef() != null ? team.getClassRef().getCid() : null,  // classId
                memberIds,
                memberNames,
                adviserId,
                adviserName,
                courseDescription,
                scheduledDay,  // DayOfWeek type
                start,  // LocalTime type
                end  // LocalTime type
        );
    }

    public AdviserDTO getAdviserByTeam(Long studentId, Long classId) {
        Team team = tRepo.findTeamByStudentAndClass(studentId, classId);
        if (team == null || team.getAdviser() == null) {
            return null;
        }

        User adviser = team.getAdviser();
        return new AdviserDTO((long) adviser.getUid(), adviser.getFirstname() + " " + adviser.getLastname());
    }




    public List<Classes> getClassroomsForMentor(int mentorId) {
        return tRepo.findClassroomsForMentor(mentorId);
    }

    public List<TeamDTO> getTeamsByMentorAndClassroom(int mentorId, int classId) {
        List<Team> activeTeams = tRepo.findTeamsByMentorAndClassroom(mentorId,classId);

        if (activeTeams.isEmpty()) {
            throw new NoSuchElementException("No active teams found for class ID " + classId);
        }

        List<TeamDTO> teamDTOs = new ArrayList<>();

        for (Team team : activeTeams) {
            String projectName = (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned";
            Integer projectId = (team.getProject() != null) ? team.getProject().getPid() : null;
            String projectDescription = (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available";

            String leaderName = (team.getLeader() != null) ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname() : "Unknown Leader";

            String adviserName = (team.getAdviser() != null) ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname() : "No Adviser Assigned";

            String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Day Set";

            String scheduleTime = (team.getSchedule() != null)
                    ? team.getSchedule().getStartTime().format(TIME_FORMATTER) + " - " + team.getSchedule().getEndTime().format(TIME_FORMATTER)
                    : "No Time Set";

            String courseDescription = (team.getClassRef() != null) ? team.getClassRef().getCourseDescription() : "No Class Info Available";

            List<String> memberNames = team.getMembers().stream()
                    .map(member -> member.getFirstname() + " " + member.getLastname())
                    .collect(Collectors.toList());

            teamDTOs.add(new TeamDTO(
                    team.getTid(),
                    team.getGroupName(),
                    team.getClassRef().getCid(),
                    team.getMembers().stream().map(User::getUid).toList(),
                    memberNames,
                    team.getSchedule().getDay(),
                    team.getSchedule().getStartTime(),
                    team.getSchedule().getEndTime(),
                    team.getAdviser().getUid(),
                    team.getAdviser().getFirstname()+" "+team.getAdviser().getLastname()
            ));
        }
        return teamDTOs;
    }

    public List<TeamDTO> getTeambyClassroomID(int classId) {
        List<Team> activeTeams = tRepo.findActiveTeamsByClassId(classId);

        if (activeTeams.isEmpty()) {
            throw new NoSuchElementException("No active teams found for class ID " + classId);
        }

        List<TeamDTO> teamDTOs = new ArrayList<>();

        for (Team team : activeTeams) {
            String projectName = (team.getProject() != null) ? team.getProject().getProjectName() : "No Project Assigned";
            Integer projectId = (team.getProject() != null) ? team.getProject().getPid() : null;
            String projectDescription = (team.getProject() != null) ? team.getProject().getDescription() : "No Description Available";

            String leaderName = (team.getLeader() != null) ? team.getLeader().getFirstname() + " " + team.getLeader().getLastname() : "Unknown Leader";

            String adviserName = (team.getAdviser() != null) ? team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname() : "No Adviser Assigned";

            String scheduleDay = (team.getSchedule() != null) ? team.getSchedule().getDay().name() : "No Day Set";

            String scheduleTime = (team.getSchedule() != null)
                    ? team.getSchedule().getStartTime().format(TIME_FORMATTER) + " - " + team.getSchedule().getEndTime().format(TIME_FORMATTER)
                    : "No Time Set";

            String courseDescription = (team.getClassRef() != null) ? team.getClassRef().getCourseDescription() : "No Class Info Available";

            List<String> memberNames = team.getMembers().stream()
                    .map(member -> member.getFirstname() + " " + member.getLastname())
                    .collect(Collectors.toList());

            List<FeatureDTO> features = new ArrayList<>();
            if (team.getProject() != null) {
                features = fRepo.findByProjectId(projectId).stream()
                        .map(feature -> new FeatureDTO(feature.getFeatureTitle(), feature.getFeatureDescription()))
                        .toList();
            }

            teamDTOs.add(new TeamDTO(
                    team.getTid(),
                    team.getGroupName(),
                    team.getClassRef().getCid(),
                    team.getMembers().stream().map(User::getUid).toList(),
                    memberNames,
                    team.getSchedule() == null? null:team.getSchedule().getDay(),
                    team.getSchedule() == null? null:team.getSchedule().getStartTime(),
                    team.getSchedule() == null? null:team.getSchedule().getEndTime(),
                    team.getAdviser() == null? -1 : team.getAdviser().getUid(),
                    team.getAdviser() == null? null:team.getAdviser().getFirstname()+" "+team.getAdviser().getLastname()
            ));
        }
        return teamDTOs;
    }

}
