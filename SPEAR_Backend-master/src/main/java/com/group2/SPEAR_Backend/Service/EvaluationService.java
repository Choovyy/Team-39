package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.EvaluationDTO;
import com.group2.SPEAR_Backend.DTO.MemberSubmissionDTO;
import com.group2.SPEAR_Backend.DTO.TeamSummaryDTO;
import com.group2.SPEAR_Backend.Model.Classes;
import com.group2.SPEAR_Backend.Model.Evaluation;
import com.group2.SPEAR_Backend.Model.EvaluationType;
import com.group2.SPEAR_Backend.Model.Team;
import com.group2.SPEAR_Backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationRepository eRepo;

    @Autowired
    private ClassesRepository cRepo;

    @Autowired
    private UserRepository uRepo;

    @Autowired
    private QuestionRepository qRepo;

    @Autowired
    private TeamRepository tRepo;

    @Autowired
    private SubmissionRepository submissionRepo;

    private void ensureClosed(Evaluation eval) {
        if ("Open".equalsIgnoreCase(eval.getAvailability())) {
            throw new IllegalStateException("Evaluation is still ongoing.");
        }
    }

    public EvaluationDTO createEvaluation(Evaluation evaluation,
                                          Long classId,
                                          EvaluationType evaluationType) {
        Classes classes = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));

        // ←── add this block
        if (!classes.isNeedsAdvisory() &&
                (evaluationType == EvaluationType.STUDENT_TO_ADVISER
                        || evaluationType == EvaluationType.ADVISER_TO_STUDENT)) {
            throw new IllegalArgumentException(
                    "This class does not require advisory; cannot create a "
                            + evaluationType + " evaluation.");
        }

        validateDates(evaluation.getDateOpen(), evaluation.getDateClose());
        evaluation.setClassRef(classes);
        evaluation.setEvaluationType(evaluationType);
        evaluation.setAvailability(
                calculateAvailability(evaluation.getDateOpen(), evaluation.getDateClose())
        );

        Evaluation savedEvaluation = eRepo.save(evaluation);

        return new EvaluationDTO(
                savedEvaluation.getEid(),
                savedEvaluation.getEvaluationType(),
                savedEvaluation.getAvailability(),
                savedEvaluation.getDateOpen(),
                savedEvaluation.getDateClose(),
                savedEvaluation.getPeriod(),
                savedEvaluation.getClassRef().getCid(),
                savedEvaluation.getClassRef().getCourseCode(),
                savedEvaluation.getClassRef().getSection(),
                savedEvaluation.getClassRef().getCourseDescription(),
                null, // Team Name will be fetched dynamically
                null, // Adviser Name will be fetched dynamically
                null, // Evaluators fetched dynamically
                null, // Evaluatees fetched dynamically
                false // Evaluated status fetched dynamically
        );
    }

    public EvaluationDTO updateEvaluation(Long id, Evaluation updatedEvaluation, EvaluationType evaluationType) {
        validateDates(updatedEvaluation.getDateOpen(), updatedEvaluation.getDateClose());

        return eRepo.findById(id).map(evaluation -> {
            evaluation.setDateOpen(updatedEvaluation.getDateOpen());
            evaluation.setDateClose(updatedEvaluation.getDateClose());
            evaluation.setPeriod(updatedEvaluation.getPeriod());
            evaluation.setEvaluationType(evaluationType);
            evaluation.setAvailability(calculateAvailability(updatedEvaluation.getDateOpen(), updatedEvaluation.getDateClose()));

            Evaluation savedEvaluation = eRepo.save(evaluation);

            return new EvaluationDTO(
                    savedEvaluation.getEid(),
                    savedEvaluation.getEvaluationType(),
                    savedEvaluation.getAvailability(),
                    savedEvaluation.getDateOpen(),
                    savedEvaluation.getDateClose(),
                    savedEvaluation.getPeriod(),
                    savedEvaluation.getClassRef().getCid(),
                    savedEvaluation.getClassRef().getCourseCode(),
                    savedEvaluation.getClassRef().getSection(),
                    savedEvaluation.getClassRef().getCourseDescription(),
                    null, // Team Name - Will be retrieved dynamically
                    null, // Adviser Name - Will be retrieved dynamically
                    null, // Evaluator Names - Will be retrieved dynamically
                    null, // Evaluatee Names - Will be retrieved dynamically
                    false // Evaluated Status - Will be retrieved dynamically
            );
        }).orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + id));
    }


    public String deleteEvaluation(Long id) {
        if (eRepo.existsById(id)) {
            eRepo.deleteById(id);
            return "Evaluation deleted successfully";
        } else {
            throw new NoSuchElementException("Evaluation not found with ID: " + id);
        }
    }

    //all get functions
    public List<EvaluationDTO> getEvaluationsByClassAsDTO(Long classId) {
        return eRepo.findByClassRef_Cid(classId).stream()
                .map(evaluation -> new EvaluationDTO(
                        evaluation.getEid(),
                        evaluation.getEvaluationType(),
                        evaluation.getAvailability(),
                        evaluation.getDateOpen(),
                        evaluation.getDateClose(),
                        evaluation.getPeriod(),
                        evaluation.getClassRef().getCid(),
                        evaluation.getClassRef().getCourseCode(),
                        evaluation.getClassRef().getSection(),
                        evaluation.getClassRef().getCourseDescription(),
                        null, // Team Name will be fetched dynamically
                        null, // Adviser Name will be fetched dynamically
                        null, // Evaluators fetched dynamically
                        null, // Evaluatees fetched dynamically
                        false // Evaluated status fetched dynamically
                ))
                .collect(Collectors.toList());
    }

    public List<Evaluation> getEvaluationsByType(EvaluationType evaluationType) {
        return eRepo.findByEvaluationType(evaluationType);
    }

    public List<Evaluation> getEvaluationsByTypeAndPeriod(EvaluationType evaluationType, String period) {
        return eRepo.findByTypeAndPeriod(evaluationType, period);
    }

    public List<Evaluation> getEvaluationsByPeriod(String period) {
        return eRepo.findByPeriod(period);
    }

    public List<Evaluation> getEvaluationsByAvailabilityAndPeriod(String availability, String period) {
        return eRepo.findByAvailabilityAndPeriod(availability, period);
    }

    public List<Evaluation> getEvaluationsByAvailability(String availability) {
        return eRepo.findByAvailability(availability);
    }

    public String getYourTeamMembers(Long classId, Long studentId) {
        List<String> members = eRepo.findYourTeamMembers(classId, studentId);
        return String.join(", ", members); // Convert list to string
    }

    public Long getTeamId(Long studentId, Long classId) {
        return eRepo.findTeamIdByStudent(studentId, classId);
    }


    public List<EvaluationDTO> getEvaluationsForStudent(Long studentId) {
        return eRepo.findOpenEvaluationsForStudent(studentId).stream()
                .map(evaluation -> new EvaluationDTO(
                        evaluation.getEid(),
                        evaluation.getEvaluationType(),
                        evaluation.getAvailability(),
                        evaluation.getDateOpen(),
                        evaluation.getDateClose(),
                        evaluation.getPeriod(),
                        evaluation.getClassRef().getCid(),
                        evaluation.getClassRef().getCourseCode(),
                        evaluation.getClassRef().getSection(),
                        evaluation.getClassRef().getCourseDescription(),
                        null, // Team Name
                        null, // Adviser Name
                        null, // Evaluators
                        null, // Evaluatees
                        false  // Evaluated status
                ))
                .collect(Collectors.toList());
    }



    public List<EvaluationDTO> getEvaluationsForAdviser(Long adviserId) {
        // Fetch open evaluations for the adviser
        List<Evaluation> evaluations = eRepo.findOpenEvaluationsForAdviser(adviserId);

        // Merge evaluations with the same properties but different teams
        Map<Long, EvaluationDTO> mergedEvaluations = new HashMap<>();

        for (Evaluation evaluation : evaluations) {
            // Fetch teams for the evaluation
            List<Team> teams = tRepo.findByClassIdAndAdviserId(evaluation.getClassRef().getCid(), adviserId);

            // Check if the evaluation already exists in the map, if so, merge the teams
            EvaluationDTO existingEvaluation = mergedEvaluations.get(evaluation.getEid());

            List<Long> teamIds = teams.stream()
                    .map(team -> (long) team.getTid()) // Convert Integer to Long
                    .collect(Collectors.toList());

            if (existingEvaluation != null) {
                // Combine team names and merge team IDs
                String combinedTeamName = existingEvaluation.getTeamName() + ", " + teams.get(0).getGroupName();
                existingEvaluation.setTeamName(combinedTeamName);

                List<Long> combinedTeamIds = new ArrayList<>(existingEvaluation.getTeamIds());
                combinedTeamIds.addAll(teamIds);
                existingEvaluation.setTeamIds(combinedTeamIds);
            } else {
                // Create a new EvaluationDTO if not already in the map
                String teamNames = teams.stream()
                        .map(Team::getGroupName)
                        .collect(Collectors.joining(", "));
                mergedEvaluations.put(evaluation.getEid(), new EvaluationDTO(
                        evaluation.getEid(),
                        evaluation.getEvaluationType(),
                        evaluation.getAvailability(),
                        evaluation.getDateOpen(),
                        evaluation.getDateClose(),
                        evaluation.getPeriod(),
                        evaluation.getClassRef().getCid(),
                        evaluation.getClassRef().getCourseCode(),
                        evaluation.getClassRef().getSection(),
                        evaluation.getClassRef().getCourseDescription(),
                        teamNames, // Set the team names
                        teams.get(0).getAdviser() != null
                                ? teams.get(0).getAdviser().getFirstname() + " " + teams.get(0).getAdviser().getLastname()
                                : "Unknown Adviser",
                        null, // Evaluators
                        null, // Evaluatees
                        false,  // Evaluated status
                        teamIds  // Set the list of teamIds
                ));
            }
        }

        // Return the combined evaluations
        return new ArrayList<>(mergedEvaluations.values());
    }

    //for admin download
    public List<EvaluationDTO> getAllStudentsToAdviserEvaluations() {
        return eRepo.findAllStudentsToAdviserEvaluations().stream()
                .map(evaluation -> {
                    // Get all teams in the class
                    List<Team> teams = tRepo.findTeamsByClassId(evaluation.getClassRef().getCid());

                    // Get all distinct adviser names for those teams
                    String adviserNames = teams.stream()
                            .map(Team::getAdviser)
                            .filter(Objects::nonNull)
                            .map(a -> a.getFirstname() + " " + a.getLastname())
                            .distinct()
                            .collect(Collectors.joining(", "));

                    return new EvaluationDTO(
                            evaluation.getEid(),
                            evaluation.getEvaluationType(),
                            evaluation.getAvailability(),
                            evaluation.getDateOpen(),
                            evaluation.getDateClose(),
                            evaluation.getPeriod(),
                            evaluation.getClassRef().getCid(),
                            evaluation.getClassRef().getCourseCode(),
                            evaluation.getClassRef().getSection(),
                            evaluation.getClassRef().getCourseDescription(),
                            null,           // teamName
                            adviserNames,   // combined advisers
                            null,
                            null,
                            false
                    );
                })
                .collect(Collectors.toList());
    }

    // summary first
    public List<TeamSummaryDTO> getTeamsForEvaluation(Long evaluationId) {
        Evaluation eval = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found: " + evaluationId));
        Long classId = eval.getClassRef().getCid();

        List<Team> teams = tRepo.findTeamsByClassId(classId);
        return teams.stream()
                .map(t -> new TeamSummaryDTO(t.getTid(), t.getGroupName()))
                .toList();
    }

    public List<MemberSubmissionDTO> getSubmittedMembersForTeam(Long evaluationId, int teamId) {
        Evaluation eval = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found: " + evaluationId));
        ensureClosed(eval);

        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found: " + teamId));

        // collect all evaluatorIds who submitted
        Set<Integer> submittedIds = submissionRepo.findByEvaluationEid(evaluationId).stream()
                .map(s -> s.getEvaluator().getUid())
                .collect(Collectors.toSet());

        return team.getMembers().stream()
                .filter(member -> submittedIds.contains(member.getUid()))
                .map(member -> new MemberSubmissionDTO(
                        member.getUid(),
                        member.getFirstname() + " " + member.getLastname(),
                        member.getUid()
                ))
                .toList();
    }

    public List<MemberSubmissionDTO> getPendingMembersForTeam(Long evaluationId, int teamId) {
        Evaluation eval = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found: " + evaluationId));
        ensureClosed(eval);

        Team team = tRepo.findById(teamId)
                .orElseThrow(() -> new NoSuchElementException("Team not found: " + teamId));

        Set<Integer> submittedIds = submissionRepo.findByEvaluationEid(evaluationId).stream()
                .map(s -> s.getEvaluator().getUid())
                .collect(Collectors.toSet());

        return team.getMembers().stream()
                .filter(member -> !submittedIds.contains(member.getUid()))
                .map(member -> new MemberSubmissionDTO(
                        member.getUid(),
                        member.getFirstname() + " " + member.getLastname(),
                        null
                ))
                .toList();
    }


    public Map<String, List<Map<String, Object>>> getAdviserSubmissionStatus(Long evaluationId) {
        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found: " + evaluationId));

        if (evaluation.getEvaluationType() != EvaluationType.ADVISER_TO_STUDENT) {
            throw new IllegalArgumentException("Evaluation is not of type ADVISER_TO_STUDENT.");
        }

        Long classId = evaluation.getClassRef().getCid();

        // Get all teams in the class that have advisers assigned
        List<Team> teams = tRepo.findTeamsByClassId(classId).stream()
                .filter(t -> t.getAdviser() != null)
                .toList();

        // Collect all unique adviser IDs from teams
        Map<Integer, String> allAdvisers = new HashMap<>();
        for (Team team : teams) {
            allAdvisers.put(team.getAdviser().getUid(),
                    team.getAdviser().getFirstname() + " " + team.getAdviser().getLastname());
        }

        // Get all adviser submissions for this evaluation
        Set<Integer> submittedAdviserIds = submissionRepo.findByEvaluationEid(evaluationId).stream()
                .map(sub -> sub.getEvaluator().getUid())
                .collect(Collectors.toSet());

        List<Map<String, Object>> submitted = new ArrayList<>();
        List<Map<String, Object>> notSubmitted = new ArrayList<>();

        for (Map.Entry<Integer, String> entry : allAdvisers.entrySet()) {
            Map<String, Object> adviserInfo = Map.of(
                    "adviserId", entry.getKey(),
                    "adviserName", entry.getValue()
            );
            if (submittedAdviserIds.contains(entry.getKey())) {
                submitted.add(adviserInfo);
            } else {
                notSubmitted.add(adviserInfo);
            }
        }

        return Map.of(
                "submitted", submitted,
                "notSubmitted", notSubmitted
        );
    }















    //for dates, do not touch!
    // Helper method to calculate availability based on open and close dates
    private String calculateAvailability(LocalDate dateOpen, LocalDate dateClose) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(dateOpen)) {
            return "Closed"; // Before dateOpen
        } else if ((today.isEqual(dateOpen) || today.isAfter(dateOpen)) && today.isBefore(dateClose)) {
            return "Open"; // On or after dateOpen but before dateClose
        } else {
            return "Closed"; // On or after dateClose
        }
    }

    // Scheduler to update evaluations every 15 seconds
    @Scheduled(fixedRate = 15000) // Executes every 15 seconds
    public void refreshEvaluationsAvailability() {
        List<Evaluation> allEvaluations = eRepo.findAll();
        for (Evaluation evaluation : allEvaluations) {
            String calculatedAvailability = calculateAvailability(evaluation.getDateOpen(), evaluation.getDateClose());
            if (!calculatedAvailability.equals(evaluation.getAvailability())) {
                evaluation.setAvailability(calculatedAvailability);
                eRepo.save(evaluation);
            }
        }
    }

    private void validateDates(LocalDate dateOpen, LocalDate dateClose) {
        if (dateOpen == null || dateClose == null) {
            throw new IllegalArgumentException("Date open and date close cannot be null.");
        }

        // Ensure dateOpen is strictly earlier than dateClose
        if (!dateOpen.isBefore(dateClose)) {
            throw new IllegalArgumentException("Date open must be earlier than date close.");
        }
    }

}
