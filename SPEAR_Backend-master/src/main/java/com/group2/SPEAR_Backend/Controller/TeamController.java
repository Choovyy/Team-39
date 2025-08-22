package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.*;
import com.group2.SPEAR_Backend.Model.Classes;
import com.group2.SPEAR_Backend.Model.Team;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.TeamRepository;
import com.group2.SPEAR_Backend.Service.TeamInvitationService;
import com.group2.SPEAR_Backend.Service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.147.17.37:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:8081",
        "http://172.16.103.209:3000",
        "http://172.16.103.209",
        "http://172.16.103.209:8081"
})
public class TeamController {

    @Autowired
    private TeamService tServ;

    @Autowired
    private TeamRepository tRepo;

    @Autowired
    private TeamInvitationService invitationServ;

//    @PostMapping("/student/create/{projectId}")
//    public Team createTeam(@PathVariable int projectId, @RequestParam String groupName) {
//        return tServ.createTeam(projectId, groupName);
//    }


    @PostMapping("/student/create-team")
    public ResponseEntity<Map<String, String>> createTeam(@RequestBody Map<String, String> requestBody) {
        Map<String, String> response = new HashMap<>();
        try {
            int leaderId = Integer.parseInt(requestBody.getOrDefault("leaderId", "0"));
            Long classId = Long.parseLong(requestBody.getOrDefault("classId", "0"));
            String groupName = requestBody.get("groupName");

            if (leaderId == 0 || classId == 0 || groupName == null || groupName.trim().isEmpty()) {
                response.put("error", "Missing or invalid input data.");
                return ResponseEntity.badRequest().body(response);
            }

            // Create team with only leader and class, adviser & schedule will be null
            tServ.createTeam(leaderId, classId, groupName);
            response.put("message", "Team has been created successfully with recruitment OPEN.");
            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            response.put("error", "Invalid number format for leaderId or classId.");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("error", "An error occurred while creating the team: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }


    @PutMapping("/student/{teamId}/update-group-name")
    public ResponseEntity<Map<String, String>> updateGroupName(
            @PathVariable int teamId,
            @RequestBody Map<String, String> requestBody
    ) {
        String groupName = requestBody.get("groupName");
        int requesterId = Integer.parseInt(requestBody.get("requesterId")); // Extract requester ID

        tServ.updateGroupName(teamId, groupName, requesterId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Group name has been updated");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/student/delete-team/{teamId}/requester/{userId}")
    public ResponseEntity<Map<String, String>> deleteTeam(
            @PathVariable int teamId,
            @PathVariable int userId) {

        try {
            tServ.deleteTeam(teamId, userId);
            return ResponseEntity.ok(Map.of("message", "Team successfully deleted"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred."));
        }
    }

    @PutMapping("/student/{teamId}/open-recruitment")
    public ResponseEntity<StatusDTO> openRecruitment(
            @PathVariable int teamId,
            @RequestBody Map<String, Integer> requestBody
    ) {
        int requesterId = requestBody.get("requesterId"); // Extract requester ID
        return ResponseEntity.ok(tServ.openRecruitment(teamId, requesterId));
    }

    @PutMapping("/student/{teamId}/close-recruitment")
    public ResponseEntity<StatusDTO> closeRecruitment(
            @PathVariable int teamId,
            @RequestBody Map<String, Integer> requestBody
    ) {
        int requesterId = requestBody.get("requesterId"); // Extract requester ID
        return ResponseEntity.ok(tServ.closeRecruitment(teamId, requesterId));
    }


    @DeleteMapping("/student/{teamId}/kick-member/{memberId}")
    public ResponseEntity<Map<String, String>> kickMember(
            @PathVariable int teamId,
            @PathVariable int memberId,
            @RequestBody Map<String, Integer> requestBody
    ) {
        int requesterId = requestBody.get("requesterId"); // Extract requester ID
        tServ.kickMember(teamId, requesterId, memberId);

        return ResponseEntity.ok(Map.of("message", "A member has been removed from the team."));
    }

    @PutMapping("/team/{teamId}/transfer-leadership")
    public ResponseEntity<Map<String, String>> transferLeadership(
            @PathVariable int teamId,
            @RequestBody Map<String, Integer> requestBody) {
        int requesterId = requestBody.get("requesterId"); // Extract requester ID
        int newLeaderId = requestBody.get("newLeaderId"); // Extract new leader ID
        tServ.transferLeadership(teamId, requesterId, newLeaderId);

        return ResponseEntity.ok(Map.of("message", "Leadership transferred successfully."));
    }

    @PostMapping("/team/{teamId}/add-member")
    public ResponseEntity<Map<String, String>> addPreferredMember(
            @PathVariable int teamId,
            @RequestBody Map<String, Integer> requestBody) {

        int requesterId = requestBody.get("requesterId");
        int memberId = requestBody.get("memberId");

        invitationServ.inviteStudent(teamId, requesterId, memberId);

        return ResponseEntity.ok(Map.of("message", "Invitation sent to the student."));
    }

    @GetMapping("/teams/all-active")
    public List<TeamDTO> getAllActiveTeams() {
        return tServ.getAllActiveTeams();
    }

    @GetMapping("/teams/{teamId}")
    public TeamDTO getTeamById(@PathVariable int teamId) {
        return tServ.getTeamById(teamId);
    }


    @GetMapping("/teams/class/{classId}")
    public ResponseEntity<?> getTeamsByClass(@PathVariable int classId) {
        try {
            List<TeamDTO> teams = tServ.getTeamsByClassId(classId);
            return ResponseEntity.ok(teams);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }
    //teacher-student
    @GetMapping("/teacher/teams/adviser/{adviserId}")
    public ResponseEntity<?> getTeamsByAdviser(@PathVariable int adviserId) {
        try {
            List<TeamDTO> teams = tServ.getTeamsByAdviser(adviserId);
            return ResponseEntity.ok(teams);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }
    //student-adviser
    @GetMapping("/team/{teamId}/members-and-adviser")
    public ResponseEntity<Map<String, Object>> getTeamMembersAndAdviser(@PathVariable int teamId) {
        try {
            Map<String, Object> data = tServ.getTeamMembersAndAdviser(teamId);
            return ResponseEntity.ok(data);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    //this might be ?????
    @GetMapping("/team/my/{classId}/{userId}")
    public ResponseEntity<?> getMyTeam(@PathVariable int userId, @PathVariable int classId) {
        try {
            TeamDTO myTeam = tServ.getMyTeam(userId, classId);
            return ResponseEntity.ok(myTeam);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No team found.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }


    @GetMapping("/team/myTeam/{classId}/{userId}")
    public ResponseEntity<?> getMyTeamQueueitVersion(@PathVariable int userId, @PathVariable int classId) {
        try {
            TeamDTO myTeam = tServ.retrieveTeamForStudentWithinClassroom(userId, classId);
            return ResponseEntity.ok(myTeam);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No team found.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
    @GetMapping("/teams/{teamId}/members")
    public ResponseEntity<List<UserDTO>> getTeamMembers(@PathVariable int teamId) {
        List<UserDTO> members = tServ.getTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    @DeleteMapping("/team/{teamId}/leave")
    public ResponseEntity<Map<String, String>> leaveTeam(
            @PathVariable int teamId,
            @RequestParam int userId) {

        try {
            tServ.leaveTeam(teamId, userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "You have successfully left the team.");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred."));
        }
    }

    @GetMapping("/team/{classId}/available-students")
    public ResponseEntity<List<UserDTO>> getAvailableStudents(
            @PathVariable Long classId,
            @RequestParam(required = false, defaultValue = "") String searchTerm) {
        List<UserDTO> students = tServ.getAvailableStudentsForTeam(classId, searchTerm);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/class/{classId}/qualified-teachers")
    public ResponseEntity<List<UserDTO>> getQualifiedAdvisersForClass(@PathVariable Long classId) {
        List<UserDTO> advisers = tServ.getAllAdvisers();
        return ResponseEntity.ok(advisers);
    }
    //schedule to change
    @GetMapping("/adviser/{adviserId}/available-schedules")
    public ResponseEntity<List<ScheduleDTO>> getAvailableSchedulesForAdviser(
            @PathVariable int adviserId) {
        List<ScheduleDTO> schedules = tServ.getAvailableSchedulesForAdviser(adviserId);
        return ResponseEntity.ok(schedules);
    }

    @PutMapping("/team/{teamId}/assign-adviser-schedule")
    public ResponseEntity<Map<String, String>> assignAdviserAndSchedule(
            @PathVariable int teamId,
            @RequestBody Map<String, Integer> requestBody) {  // Accept JSON body

        int adviserId = requestBody.get("adviserId");
        int scheduleId = requestBody.get("scheduleId");
        int requesterId = requestBody.get("requesterId");

        if (adviserId == 0 || scheduleId == 0 || requesterId == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required parameters"));
        }

        try {
            String message = tServ.assignAdviserAndSchedule(teamId, adviserId, scheduleId, requesterId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred."));
        }
    }

    @GetMapping("/class/{classId}/members")
    public ResponseEntity<List<TeamMembersDTO>> getTeamsWithMembers(
            @PathVariable Long classId) {
        List<TeamMembersDTO> teams = tServ.getTeamsWithMembers(classId);
        return ResponseEntity.ok(teams);
    }


    //for team recuitment only
    @GetMapping("/teams/class/{classId}/open-for-recruitment")
    public ResponseEntity<List<TeamDTO>> getOpenTeamsForRecruitmentByClass(
            @PathVariable Long classId) {
        List<TeamDTO> openTeams = tServ.getOpenTeamsForRecruitment(classId);
        return ResponseEntity.ok(openTeams);
    }
    @GetMapping("/user/{userId}/leader-teams")
    public ResponseEntity<List<TeamDTO>> getTeamsLedByUser(@PathVariable int userId) {
        List<Team> teams = tRepo.findByLeaderUid(userId);

        List<TeamDTO> teamDTOs = teams.stream()
                .map(team -> new TeamDTO(
                        team.getTid(),
                        team.getGroupName(),
                        team.getProject() != null ? team.getProject().getProjectName() : "No Project Assigned",
                        team.getProject() != null ? team.getProject().getPid() : null,
                        team.getLeader().getFirstname() + " " + team.getLeader().getLastname(),
                        team.getClassRef() != null ? team.getClassRef().getCid() : null,
                        team.getMembers().stream().map(User::getUid).toList(),
                        team.isRecruitmentOpen(),
                        null, // Features can be added later
                        team.getProject() != null ? team.getProject().getDescription() : "No Description Available",
                        team.getAdviser() != null ? team.getAdviser().getUid() : null,
                        team.getSchedule() != null ? team.getSchedule().getSchedid() : null,
                        team.getClassRef() != null ? team.getClassRef().getMaxTeamSize() : 5
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(teamDTOs);
    }

    @PutMapping("/team/set-official/{teamId}")
    public ResponseEntity<Map<String, String>> setOfficialProject(
            @PathVariable int teamId,
            @RequestParam int proposalId,
            @RequestParam int leaderId) {
        try {
            tServ.setOfficialProject(teamId, proposalId, leaderId);
            return ResponseEntity.ok(Map.of("message", "Project successfully set as the official project for the team."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/team/unset-official/{teamId}")
    public ResponseEntity<Map<String, String>> unsetOfficialProject(
            @PathVariable int teamId,
            @RequestParam int leaderId) {
        try {
            tServ.unsetOfficialProject(teamId, leaderId);
            return ResponseEntity.ok(Map.of("message", "Official project removed from the team."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/team/{teamId}/official-project")
    public ResponseEntity<?> getOfficialProjectWithAdviserAndFeatures(@PathVariable int teamId) {
        try {
            Map<String, Object> response = tServ.getOfficialProjectWithAdviserAndFeatures(teamId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

        //UNIVERSAL!
        @GetMapping("evaluation/{studentId}/class/{classId}/team")
        public ResponseEntity<TeamDTO> getStudentTeam(@PathVariable Long studentId, @PathVariable Long classId) {
            TeamDTO teamDTO = tServ.getStudentTeam(studentId, classId);
            if (teamDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(teamDTO);
        }

        //for evaluation student-adviser
        @GetMapping("evaluation/{studentId}/class/{classId}/adviser")
        public ResponseEntity<AdviserDTO> getAdviserByTeam(@PathVariable Long studentId, @PathVariable Long classId) {
            AdviserDTO adviserDTO = tServ.getAdviserByTeam(studentId, classId);
            if (adviserDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(adviserDTO);
        }

        @GetMapping("evaluation/teacher/team-details/{teamName}")
        public ResponseEntity<?> getTeamProjectAndMembers(@PathVariable String teamName) {
            try {
                TeamProjectDTO teamProject = tServ.getProjectAndMembersByTeamName(teamName);
                return ResponseEntity.ok(teamProject);
            } catch (NoSuchElementException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
            }
        }

    @PostMapping("/adviser-drop/team/{teamId}")
    public ResponseEntity<?> adviserDropTeam(@PathVariable int teamId, @RequestBody Map<String, Object> body) {
        try {
            String reason = (String) body.getOrDefault("reason", "Dropped by adviser.");
            int adviserId = Integer.parseInt(body.get("adviserId").toString());

            String msg = tServ.adviserDropsTeam(teamId, reason, adviserId);
            return ResponseEntity.ok(Map.of("message", msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/class/{classId}/students-without-team")
    public ResponseEntity<List<UserDTO>> getStudentsWithoutTeam(@PathVariable Long classId) {
        return ResponseEntity.ok(tServ.getStudentsWithoutTeam(classId));
    }


// Q it controllers
    //created for queueit, retrieval of teams under a certain mentor
    @GetMapping("/team/mentored/{mentorID}")
    public ResponseEntity<Object> retrieveTeamsForMentor(@PathVariable int mentorID){
        try{
            return ResponseEntity.ok(tServ.retrieveTeamsForMentor(mentorID));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    //created for queueit, retrieval of teams that's scheduled for today for automation
    @GetMapping("/team/automateScheduledMeetings/{day}")
    public ResponseEntity<Object> retrieveScheduledTeamsForMeetingAutomation(@PathVariable String day){
        try{
            return ResponseEntity.ok(tServ.retrieveScheduledTeamsForMeetingAutomation(day));
        }catch (Exception e){
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping("/team/all/notification/{facultyID}")
    public ResponseEntity<Object> retrieveNotificationRecipientsForAllClasses(@PathVariable int facultyID){
        return ResponseEntity.ok(tServ.retrieveNotificationRecipientsForAllClasses(facultyID));
    }
    @PostMapping("/team/selected/notification/{facultyID}")
    public ResponseEntity<Object> retrieveNotificationRecipientsForSelectClasses(@PathVariable int facultyID, @RequestBody ClassesIDRequest classesIDRequest){
        return ResponseEntity.ok(tServ.retrieveNotificationRecipientsForSelectClasses(facultyID,classesIDRequest.getClassesIDList()));
    }

    @GetMapping("/team/allTeamsByFaculty/notification/{facultyID}")
    public ResponseEntity<Object> retrieveNotificationRecipientsForAllTeams(@PathVariable int facultyID){
        return ResponseEntity.ok(tServ.retrieveNotificationRecipientsForAllTeams(facultyID));
    }
    @PostMapping("/team/selectedTeamsByFaculty/notification/{facultyID}")
    public ResponseEntity<Object> retrieveNotificationRecipientsForSelectedTeams(@PathVariable int facultyID, @RequestBody TeamsIDRequest teamsIDRequest){
        return ResponseEntity.ok(tServ.retrieveNotificationRecipientsForSelectedTeams(facultyID, teamsIDRequest.getTeamsIDList()));
    }

    // queueit
    @GetMapping("/mentor/classrooms/{mentorId}")
    public ResponseEntity<List<Classes>> getClassroomsForMentor(@PathVariable int mentorId) {
        List<Classes> classrooms = tServ.getClassroomsForMentor(mentorId);
        return ResponseEntity.ok(classrooms);
    }

    @GetMapping("/mentor/classroom/{classId}/teams/{mentorId}")
    public ResponseEntity<Object> getTeamsByMentorAndClassroom(
            @PathVariable int mentorId,
            @PathVariable int classId) {
        List<TeamDTO> teams = tServ.getTeamsByMentorAndClassroom(mentorId, classId);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/classroom/team/{classId}")
    public ResponseEntity<?> getTeambyClassroomID(@PathVariable int classId) {
        try {
            List<TeamDTO> teams = tServ.getTeambyClassroomID(classId);
            return ResponseEntity.ok(teams);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

}
