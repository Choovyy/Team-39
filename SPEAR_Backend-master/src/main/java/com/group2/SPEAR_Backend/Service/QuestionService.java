package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.QuestionDTO;
import com.group2.SPEAR_Backend.DTO.QuestionTemplateSetDTO;
import com.group2.SPEAR_Backend.Model.*;
import com.group2.SPEAR_Backend.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository qRepo;

    @Autowired
    private ClassesRepository cRepo;

    @Autowired
    private EvaluationRepository eRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private QuestionTemplateRepository templateRepo;

    @Autowired
    private QuestionTemplateSetRepository templateRepoSet;

    public QuestionDTO createQuestion(Long classId, Long evaluationId, QuestionDTO questionDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User createdByUser = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));
        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));

        if (questionDTO.getQuestionType() == null) {
            throw new IllegalArgumentException("QuestionType is required!");
        }

        Question question = new Question();
        question.setQuestionTitle(questionDTO.getQuestionTitle());
        question.setQuestionDetails(questionDTO.getQuestionDetails());
        question.setClasses(clazz);
        question.setEvaluation(evaluation);
        question.setQuestionType(questionDTO.getQuestionType());
        question.setCreatedBy(createdByUser);
        question.setEditable(true);
        question.setTemplateSet(null); // ✅ Explicitly ensure this is not linked to any template

        Question savedQuestion = qRepo.save(question);
        return mapToDTO(savedQuestion);
    }

    public List<QuestionDTO> getQuestionsByClass(Long classId) {
        return qRepo.findByClassesCid(classId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getQuestionsByEvaluation(Long evaluationId) {
        return qRepo.findByEvaluationEid(evaluationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<QuestionDTO> getQuestionsByClassAndEvaluation(Long classId, Long evaluationId) {
        return qRepo.findByClassesCidAndEvaluationEid(classId, evaluationId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public QuestionDTO updateQuestion(Long questionId, QuestionDTO updatedQuestionDTO) {
        return qRepo.findById(questionId).map(question -> {
            if (!question.isEditable()) {
                throw new IllegalStateException("This question is locked and cannot be edited.");
            }

            question.setQuestionTitle(updatedQuestionDTO.getQuestionTitle());
            question.setQuestionDetails(updatedQuestionDTO.getQuestionDetails());

            if (updatedQuestionDTO.getEvaluationId() != null) {
                Evaluation evaluation = eRepo.findById(updatedQuestionDTO.getEvaluationId())
                        .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + updatedQuestionDTO.getEvaluationId()));
                question.setEvaluation(evaluation);
            }

            if (updatedQuestionDTO.getClassId() != null) {
                Classes classes = cRepo.findById(updatedQuestionDTO.getClassId())
                        .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + updatedQuestionDTO.getClassId()));
                question.setClasses(classes);
            }

            if (updatedQuestionDTO.getQuestionType() != null) {
                question.setQuestionType(updatedQuestionDTO.getQuestionType());
            }

            Question savedQuestion = qRepo.save(question);
            return mapToDTO(savedQuestion);
        }).orElseThrow(() -> new NoSuchElementException("Question not found with ID: " + questionId));
    }

    public QuestionDTO deleteQuestion(Long questionId) {
        Question question = qRepo.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Question not found with ID: " + questionId));

        if (!question.isEditable()) {
            throw new IllegalStateException("This question is locked and cannot be deleted.");
        }

        qRepo.deleteById(questionId);
        return mapToDTO(question);
    }

    public List<QuestionDTO> getQuestionsByCreator(Integer createdByUserId) {
        return qRepo.findByCreatedByUid(createdByUserId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private QuestionDTO mapToDTO(Question question) {
        return new QuestionDTO(
                question.getQid(),
                question.getQuestionTitle(),
                question.getQuestionDetails(),
                question.getEvaluation().getEid(),
                question.getClasses().getCid(),
                question.getQuestionType(),
                question.getCreatedBy().getUid(),
                question.getCreatedBy().getFirstname() + " " + question.getCreatedBy().getLastname(),
                question.isEditable(),
                question.getTemplateSet() != null ? question.getTemplateSet().getId() : null,
                question.getTemplateSet() != null ? question.getTemplateSet().getName() : null
        );
    }

    public QuestionDTO useTemplateForClass(Long templateId, Long classId, Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found with email: " + email));

        QuestionTemplate template = templateRepo.findById(templateId)
                .orElseThrow(() -> new NoSuchElementException("Template not found with ID: " + templateId));

        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));
        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));

        Question question = new Question();
        question.setQuestionTitle(template.getQuestionTitle());
        question.setQuestionDetails(template.getQuestionDetails());
        question.setQuestionType(template.getQuestionType());
        question.setClasses(clazz);
        question.setEvaluation(evaluation);
        question.setCreatedBy(teacher);
        question.setEditable(false);

        Question savedQuestion = qRepo.save(question);
        return mapToDTO(savedQuestion);
    }

    public List<QuestionDTO> getPreviousQuestionsByCreator() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found with email: " + email));

        return qRepo.findByCreatedByUid(teacher.getUid()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public QuestionDTO reusePreviousQuestion(Long questionId, Long classId, Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found with email: " + email));

        Question originalQuestion = qRepo.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Original question not found with ID: " + questionId));

        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));
        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));

        Question newQuestion = new Question();
        newQuestion.setQuestionTitle(originalQuestion.getQuestionTitle());
        newQuestion.setQuestionDetails(originalQuestion.getQuestionDetails());
        newQuestion.setQuestionType(originalQuestion.getQuestionType());
        newQuestion.setClasses(clazz);
        newQuestion.setEvaluation(evaluation);
        newQuestion.setCreatedBy(teacher);
        newQuestion.setEditable(true);

        Question savedQuestion = qRepo.save(newQuestion);
        return mapToDTO(savedQuestion);
    }

    public List<QuestionDTO> importTemplateSet(Long setId, Long classId, Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Teacher not found with email: " + email));

        QuestionTemplateSet set = templateRepoSet.findById(setId)
                .orElseThrow(() -> new NoSuchElementException("Template set not found with ID: " + setId));

        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));

        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));

        // Only add new questions; do not remove any previous ones
        List<Question> newQuestions = set.getQuestions().stream().map(template -> {
            Question q = new Question();
            q.setQuestionTitle(template.getQuestionTitle());
            q.setQuestionDetails(template.getQuestionDetails());
            q.setQuestionType(template.getQuestionType());
            q.setClasses(clazz);
            q.setEvaluation(evaluation);
            q.setCreatedBy(teacher); // optional: set the current teacher instead of template creator
            q.setEditable(false);
            q.setTemplateSet(set); // Maintain origin tracking
            return q;
        }).collect(Collectors.toList());

        List<Question> saved = qRepo.saveAll(newQuestions);

        return saved.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    public List<QuestionTemplateSetDTO> getImportedTemplateSetsByEvaluation(Long evaluationId) {
        return qRepo.findByEvaluationEid(evaluationId).stream()
                .map(Question::getTemplateSet)
                .filter(Objects::nonNull)
                .distinct()
                .map(QuestionTemplateSetDTO::new)
                .collect(Collectors.toList());
    }
    @Transactional
    public void deleteQuestionsByTemplateSetForEvaluation(Long templateSetId, Long evaluationId) {
        List<Question> toDelete = qRepo.findByTemplateSetIdAndEvaluationEid(templateSetId, evaluationId);
        if (toDelete.isEmpty()) {
            throw new NoSuchElementException(
                    "No questions found for template set " + templateSetId +
                            " in evaluation " + evaluationId
            );
        }
        qRepo.deleteAll(toDelete);
    }

    public List<QuestionDTO> getMyOwnQuestionsByEvaluation(Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return qRepo.findByEvaluationEid(evaluationId).stream()
                .filter(q -> q.getCreatedBy().getUid() == teacher.getUid())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionTemplateSetDTO saveAsTemplateSet(String templateSetName, Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        QuestionTemplateSet newSet = new QuestionTemplateSet(templateSetName, teacher);

        try {
            templateRepoSet.save(newSet);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("A template set with this name already exists. Please choose another name.");
        }

        List<Question> myQuestions = qRepo.findByEvaluationEid(evaluationId).stream()
                .filter(q -> q.getCreatedBy().getUid() == teacher.getUid() && q.getTemplateSet() == null)
                .toList();

        for (Question q : myQuestions) {
            QuestionTemplate template = new QuestionTemplate(
                    q.getQuestionTitle(),
                    q.getQuestionDetails(),
                    q.getQuestionType(),
                    newSet,
                    teacher
            );
            templateRepo.save(template);
            newSet.getQuestions().add(template);
        }

        return new QuestionTemplateSetDTO(newSet);
    }

    public List<QuestionTemplateSetDTO> getMyTemplateSets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        List<QuestionTemplateSet> sets = templateRepoSet.findAll().stream()
                .filter(set -> set.getQuestions().stream().anyMatch(q -> q.getCreatedBy().getUid() == teacher.getUid()))
                .toList();

        return sets.stream().map(QuestionTemplateSetDTO::new).collect(Collectors.toList());
    }

    public List<QuestionDTO> importMyTemplateSet(Long setId, Long classId, Long evaluationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User teacher = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        QuestionTemplateSet set = templateRepoSet.findById(setId)
                .orElseThrow(() -> new NoSuchElementException("Template set not found with ID: " + setId));

        Classes clazz = cRepo.findById(classId)
                .orElseThrow(() -> new NoSuchElementException("Class not found with ID: " + classId));

        Evaluation evaluation = eRepo.findById(evaluationId)
                .orElseThrow(() -> new NoSuchElementException("Evaluation not found with ID: " + evaluationId));

        // Only allow importing user's own sets
        if (set.getQuestions().stream().noneMatch(q -> q.getCreatedBy().getUid() == teacher.getUid())) {
            throw new IllegalStateException("You are not allowed to import this template set");
        }

        List<Question> questions = set.getQuestions().stream().map(template -> {
            Question q = new Question();
            q.setQuestionTitle(template.getQuestionTitle());
            q.setQuestionDetails(template.getQuestionDetails());
            q.setQuestionType(template.getQuestionType());
            q.setClasses(clazz);
            q.setEvaluation(evaluation);
            q.setCreatedBy(teacher);
            q.setEditable(true);
            q.setTemplateSet(set);
            return q;
        }).toList();

        List<Question> saved = qRepo.saveAll(questions);
        return saved.stream().map(this::mapToDTO).collect(Collectors.toList());
    }




}
