package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.QuestionTemplateDTO;
import com.group2.SPEAR_Backend.DTO.QuestionTemplateSetDTO;
import com.group2.SPEAR_Backend.Model.QuestionTemplate;
import com.group2.SPEAR_Backend.Model.QuestionTemplateSet;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.QuestionTemplateRepository;
import com.group2.SPEAR_Backend.Repository.QuestionTemplateSetRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class QuestionTemplateService {

    @Autowired
    private QuestionTemplateSetRepository setRepo;

    @Autowired
    private QuestionTemplateRepository templateRepo;

    @Autowired
    private UserRepository userRepo;

    public QuestionTemplateSetDTO createSet(String name) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User creator = userRepo.findByEmail(email)
                    .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

            QuestionTemplateSet set = new QuestionTemplateSet(name, creator);
            return new QuestionTemplateSetDTO(setRepo.save(set));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("This name has been used. Try another.");
        }
    }

    public List<QuestionTemplateSetDTO> getTemplateSetsByCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return setRepo.findAll().stream()
                .filter(set -> set.getCreatedBy().getUid() == creator.getUid())
                .map(QuestionTemplateSetDTO::new)
                .collect(Collectors.toList());
    }

    public QuestionTemplateDTO addQuestionToSet(Long setId, QuestionTemplateDTO dto) {
        QuestionTemplateSet set = setRepo.findById(setId)
                .orElseThrow(() -> new NoSuchElementException("Set not found with ID: " + setId));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        QuestionTemplate question = new QuestionTemplate(
                dto.getQuestionTitle(),
                dto.getQuestionDetails(),
                dto.getQuestionType(),
                set,
                creator
        );

        return new QuestionTemplateDTO(templateRepo.save(question));
    }

    public List<QuestionTemplateSetDTO> getAllSets() {
        return setRepo.findAll().stream()
                .filter(set -> set.getQuestions().stream()
                        .anyMatch(q -> q.getCreatedBy().getRole().equalsIgnoreCase("ADMIN")))
                .map(QuestionTemplateSetDTO::new)
                .collect(Collectors.toList());
    }

    public QuestionTemplateDTO updateQuestion(Long questionId, QuestionTemplateDTO dto) {
        QuestionTemplate question = templateRepo.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Question not found with ID: " + questionId));

        question.setQuestionTitle(dto.getQuestionTitle());
        question.setQuestionDetails(dto.getQuestionDetails());
        question.setQuestionType(dto.getQuestionType());

        return new QuestionTemplateDTO(templateRepo.save(question));
    }

    @Transactional
    public void deleteSet(Long setId) {
        QuestionTemplateSet set = setRepo.findById(setId)
                .orElseThrow(() -> new IllegalArgumentException("Set not found."));
        setRepo.delete(set);
    }

    public void deleteQuestion(Long questionId) {
        templateRepo.deleteById(questionId);
    }

    public List<QuestionTemplateDTO> getTemplatesByCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        return templateRepo.findAll().stream()
                .filter(template -> template.getCreatedBy() != null && template.getCreatedBy().getUid() == creator.getUid())
                .map(QuestionTemplateDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionTemplateSetDTO renameSet(Long setId, String newName) {
        QuestionTemplateSet set = setRepo.findById(setId)
                .orElseThrow(() -> new NoSuchElementException("Template set not found with ID: " + setId));

        if (setRepo.existsByName(newName)) {
            throw new IllegalArgumentException("A template set with this name already exists.");
        }

        set.setName(newName);
        return new QuestionTemplateSetDTO(set);
    }
}
