package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.DTO.CriterionDTO;
import com.QueueIt.capstone.API.DTO.RubricDTO;
import com.QueueIt.capstone.API.Entities.Rubric;
import com.QueueIt.capstone.API.Entities.Criterion;
import com.QueueIt.capstone.API.Repository.RubricRepository;
import com.QueueIt.capstone.API.Repository.CriterionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class RubricService {
    private static final Logger log = LoggerFactory.getLogger(RubricService.class);
    private final RubricRepository rubricRepository;
    private final CriterionRepository criterionRepository;

    public RubricService(RubricRepository rubricRepository, CriterionRepository criterionRepository) {
        this.rubricRepository = rubricRepository;
        this.criterionRepository = criterionRepository;
    }

    /**
     * ✅ CREATE a new rubric
     */
    @Transactional
    public Rubric createRubric(RubricDTO rubricDTO) {
        Rubric rubric = new Rubric(
                rubricDTO.getTitle(),
                rubricDTO.getDescription(),
                null,
                rubricDTO.getIsPrivate(),
                rubricDTO.getUserID(),
                rubricDTO.getFacultyName(),
                rubricDTO.getIsWeighted()
        );
        System.out.println(rubricDTO.getIsWeighted());

        if (rubricDTO.getIsWeighted() &&
                (rubricDTO.getCriteria().stream()
                        .mapToDouble(CriterionDTO::getWeight) // Use mapToDouble to get a double stream
                        .sum() > 100 || rubricDTO.getCriteria().stream()
                        .mapToDouble(CriterionDTO::getWeight)
                        .sum() < 1)) {
            throw new RuntimeException("Weight(s) must not exceed 100% and no more less than 1%");
        }else if (rubricDTO.getIsWeighted() &&
                (rubricDTO.getCriteria().stream()
                        .mapToDouble(CriterionDTO::getWeight) // Use mapToDouble to get a double stream
                        .sum() < 100 || rubricDTO.getCriteria().stream()
                        .mapToDouble(CriterionDTO::getWeight)
                        .sum() < 1)) {
            throw new RuntimeException("Total weights must equal to 100%");
        }else if(rubric.getIsWeighted()){
            List<Criterion> criteria = rubricDTO.getCriteria().stream()
                    .map(dto -> new Criterion(rubric, dto.getTitle(), dto.getDescription(), dto.getWeight()))
                    .collect(Collectors.toList());

            rubric.setCriteria(criteria);
            Rubric savedRubric = rubricRepository.save(rubric);
            criterionRepository.saveAll(criteria);

            return savedRubric;
        }else{
            List<Criterion> criteria = rubricDTO.getCriteria().stream()
                    .map(dto -> new Criterion(rubric, dto.getTitle(), dto.getDescription(),0))
                    .collect(Collectors.toList());

            rubric.setCriteria(criteria);
            Rubric savedRubric = rubricRepository.save(rubric);
            criterionRepository.saveAll(criteria);

            return savedRubric;
        }
    }

    /**
     * ✅ READ all rubrics (public system rubrics + user rubrics)
     */
    public List<Rubric> getRubrics(Long userID) {
        List<Rubric> userRubrics = rubricRepository.findByUserID(userID);
        List<Rubric> publiclyAvailableRubrics = rubricRepository.findByIsPrivateFalse(userID);

        // Combine both lists
        userRubrics.addAll(publiclyAvailableRubrics);

        // Sort the combined list and collect it back into a new list
        List<Rubric> sortedRubrics = userRubrics.stream()
                .sorted(Comparator.comparing(Rubric::getId))
                .collect(Collectors.toList());

        return sortedRubrics; // Return the sorted list
    }

    /**
     * ✅ READ a single rubric by ID
     */
    public Optional<Rubric> getRubricById(Long rubricID) {
        return rubricRepository.findById(rubricID);
    }

    /**
     * ✅ UPDATE a rubric (if system-made, clone it first)
     */
    @Transactional
    public Rubric updateRubric(Rubric updatedRubricInstance) {
        Optional<Rubric> optionalRubric = rubricRepository.findById(updatedRubricInstance.getId());
        System.out.println(updatedRubricInstance.getIsWeighted());
        if (updatedRubricInstance.getIsWeighted() &&
                (updatedRubricInstance.getCriteria().stream()
                        .mapToDouble(Criterion::getWeight) // Use mapToDouble to get a double stream
                        .sum() > 100 || updatedRubricInstance.getCriteria().stream()
                        .mapToDouble(Criterion::getWeight)
                        .sum() < 1)
        ){
            throw new RuntimeException("Weight(s) must not exceed 100% and no more less than 1%");
        }

        if (updatedRubricInstance.getIsWeighted() &&
                (updatedRubricInstance.getCriteria().stream()
                        .mapToDouble(Criterion::getWeight) // Use mapToDouble to get a double stream
                        .sum() < 100 || updatedRubricInstance.getCriteria().stream()
                        .mapToDouble(Criterion::getWeight)
                        .sum() < 1)
        ){
            throw new RuntimeException("Total weights must equal to 100%");
        }

        if (optionalRubric.isPresent()) {
            Rubric rubric = optionalRubric.get();

            rubric.setTitle(updatedRubricInstance.getTitle());
            rubric.setDescription(updatedRubricInstance.getDescription());
            rubric.setPrivate(updatedRubricInstance.getIsPrivate());
            rubric.setFacultyName(updatedRubricInstance.getFacultyName());
            rubric.setWeighted(updatedRubricInstance.getIsWeighted());

            // Clear old criteria and save new ones
            rubric.getCriteria().clear(); // Clear the existing criteria
            List<Criterion> newCriteria = updatedRubricInstance.getCriteria().stream()
                    .map(dto -> new Criterion(rubric, dto.getTitle(), dto.getDescription(), dto.getWeight()))
                    .collect(Collectors.toList());

            rubric.getCriteria().addAll(newCriteria); // Add new criteria
            criterionRepository.saveAll(newCriteria); // Save new criteria
            return rubricRepository.save(rubric);
        }

        return null;
    }

    /**
     * ✅ DELETE a rubric by ID
     */
    @Transactional
    public boolean deleteRubric(Long rubricID) {
        if (rubricRepository.existsById(rubricID)) {
            rubricRepository.deleteById(rubricID);
            return true;
        }
        return false;
    }

    /**
     * ✅ Create default system rubrics on startup
     */
    @PostConstruct
    public void createDefaultRubrics() {
        if (rubricRepository.findAll().isEmpty()) {
            Rubric systemRubric = new Rubric("General Rubric", "Standard evaluation rubric", null, false, null,"System",false);
            Rubric savedRubric = rubricRepository.save(systemRubric);
            List<Criterion> systemGeneratedCriterion = new ArrayList<Criterion>(
                List.of(
                    new Criterion(
                            savedRubric,
                            "Preparedness",
                            "Preparedness refers to the extent to which students come to the project presentation or submission ready to engage with the material. This includes having all necessary materials, completing required research, and being able to answer questions or discuss the project confidently. A well-prepared student demonstrates a thorough understanding of the project topic and is able to articulate their ideas clearly.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Punctuality",
                            "Punctuality assesses the timeliness of project submissions and presentations. This criterion evaluates whether students meet deadlines and adhere to the schedule set for the project. Being punctual reflects a student’s ability to manage their time effectively and respect the timelines established by the instructor or project guidelines.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Conciseness",
                            "Conciseness measures the ability to communicate ideas clearly and succinctly without unnecessary elaboration or filler content. This criterion evaluates how well students can distill their thoughts and present information in a straightforward manner, ensuring that the main points are easily understood without overwhelming the audience with excessive detail.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Specific",
                            "Specificity refers to the clarity and precision of the project’s objectives, goals, and content. This criterion evaluates whether students provide clear, detailed information that directly addresses the project requirements. Specific projects outline exact expectations and avoid vague statements, making it easier for the audience to grasp the intended message.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Measurable",
                            "Measurability assesses whether the goals and outcomes of the project can be quantified or evaluated. This criterion looks at whether students have established clear metrics or indicators that demonstrate success or progress. Measurable projects allow for objective assessment of results, making it easier to determine if the objectives have been met.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Attainable",
                            "Attainability evaluates whether the goals set for the project are realistic and achievable within the given constraints, such as time, resources, and skills. This criterion encourages students to set goals that are challenging yet feasible, promoting a sense of accomplishment upon completion. Projects should reflect a balance between ambition and practicality.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Relevance",
                            "Relevance assesses the significance and applicability of the project to the intended audience or context. This criterion evaluates whether the project addresses a pertinent issue, topic, or question that resonates with the audience or aligns with the course objectives. Relevant projects demonstrate a clear connection to real-world applications or academic concepts.",
                            0
                    ),
                    new Criterion(
                            savedRubric,
                            "Time-Bound",
                            "Time-bound refers to the establishment of a clear timeline for project completion, including deadlines for various phases of the project. This criterion evaluates whether students have set specific timeframes for achieving their goals, ensuring that the project progresses in a structured manner. Time-bound projects help students manage their workload effectively and maintain focus on timely completion.",
                            0
                    )
                )
            );
            criterionRepository.saveAll(systemGeneratedCriterion);
            savedRubric.setCriteria(systemGeneratedCriterion);
            rubricRepository.save(savedRubric);
        }


    }
}
