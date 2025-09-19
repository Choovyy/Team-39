package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalityService {

    private static class QDef { long id; String text; String axis; int direction; QDef(long id, String text, String axis, int direction){this.id=id;this.text=text;this.axis=axis;this.direction=direction;} }

    // Four axes
    private static final String AXIS_COLLAB = "COLLABORATION"; // Collaboration vs Independence
    private static final String AXIS_INNOV = "INNOVATION";    // Innovation vs Pragmatism
    private static final String AXIS_PLAN = "PLANNING";       // Planning vs Adaptability
    private static final String AXIS_DETAIL = "DETAIL";       // Detail vs Big Picture

    // Direction: +1 supports named axis side, -1 supports opposite
    private static final List<QDef> QUESTIONS = List.of(
            // Collaboration
            new QDef(1, "I gain energy from working closely with others.", AXIS_COLLAB, 1),
            new QDef(2, "I prefer to solve problems entirely on my own.", AXIS_COLLAB, -1),
            new QDef(3, "Group brainstorming improves my ideas.", AXIS_COLLAB, 1),
            new QDef(4, "Relying on others often slows me down.", AXIS_COLLAB, -1),
            // Innovation
            new QDef(5, "I enjoy proposing unconventional solutions.", AXIS_INNOV, 1),
            new QDef(6, "I stick to proven, reliable methods.", AXIS_INNOV, -1),
            new QDef(7, "Ambiguity excites me because it means possibilities.", AXIS_INNOV, 1),
            new QDef(8, "I avoid experimenting when a standard approach exists.", AXIS_INNOV, -1),
            // Planning
            new QDef(9, "I like to map tasks before starting work.", AXIS_PLAN, 1),
            new QDef(10, "I jump in and adjust as I go without planning.", AXIS_PLAN, -1),
            new QDef(11, "Clear timelines help me perform better.", AXIS_PLAN, 1),
            new QDef(12, "Too much planning feels restrictive.", AXIS_PLAN, -1),
            // Detail
            new QDef(13, "I naturally spot small inconsistencies.", AXIS_DETAIL, 1),
            new QDef(14, "I focus on the overall direction, not tiny details.", AXIS_DETAIL, -1),
            new QDef(15, "Accuracy matters more than speed for me.", AXIS_DETAIL, 1),
            new QDef(16, "I delegate detail work so I can think big picture.", AXIS_DETAIL, -1)
    );

    private static final Map<String,String[]> AXIS_DESCRIPTORS = Map.of(
            AXIS_COLLAB, new String[]{"Collaborative","Independent"},
            AXIS_INNOV, new String[]{"Innovative","Pragmatic"},
            AXIS_PLAN, new String[]{"Structured","Adaptive"},
            AXIS_DETAIL, new String[]{"Detail-Oriented","Big Picture"}
    );

    @Autowired
    private SurveyService surveyService;

    // Repositories can be injected later if we need direct access

    public List<PersonalityQuestionDTO> getQuestions(){
        return QUESTIONS.stream()
                .map(q -> new PersonalityQuestionDTO(q.id, q.text, q.axis))
                .collect(Collectors.toList());
    }

    public PersonalityResultDTO evaluate(PersonalitySubmissionDTO submission){
        if(submission == null || submission.getAnswers() == null || submission.getAnswers().isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answers required");
        }

        Map<Long,Integer> answers = submission.getAnswers();

        // Validate all questions answered (optional: relax)
        for(QDef q : QUESTIONS){
            if(!answers.containsKey(q.id)){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing answer for question " + q.id);
            }
            int val = answers.get(q.id);
            if(val < 1 || val > 5){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid answer value for question " + q.id);
            }
        }

        // Aggregate raw scores per axis
        Map<String,Integer> raw = new HashMap<>();
        Map<String,Integer> count = new HashMap<>();
        for(QDef q : QUESTIONS){
            int response = answers.get(q.id);
            int adjusted = q.direction == 1 ? response : (6 - response); // invert for negative keyed
            raw.merge(q.axis, adjusted, Integer::sum);
            count.merge(q.axis, 1, Integer::sum);
        }

        // Normalize 1..5 per question => total range = count .. count*5
        Map<String,Integer> percentScores = new LinkedHashMap<>();
        for(String axis : raw.keySet()){
            int c = count.get(axis);
            int min = c * 1;
            int max = c * 5;
            int val = raw.get(axis);
            int pct = (int)Math.round( ( (double)(val - min) / (double)(max - min) ) * 100.0 );
            percentScores.put(axis, pct);
        }

        // Build descriptors
        List<String> descriptorParts = new ArrayList<>();
        for(String axis : List.of(AXIS_COLLAB, AXIS_INNOV, AXIS_PLAN, AXIS_DETAIL)){
            int score = percentScores.getOrDefault(axis,50);
            String[] pair = AXIS_DESCRIPTORS.get(axis);
            descriptorParts.add(score >= 50 ? pair[0] : pair[1]);
        }
        String personalityString = String.join(" ", descriptorParts);

        String archetype = deriveArchetype(descriptorParts);
        String summary = buildSummary(descriptorParts, percentScores, archetype);

        return new PersonalityResultDTO(percentScores, archetype, personalityString, summary);
    }

    private String deriveArchetype(List<String> descriptors){
        // Simple mapping; could be expanded to a comprehensive code map
        String key = String.join("-", descriptors).toLowerCase();
        if(key.contains("collaborative") && key.contains("innovative") && key.contains("structured")) return "Structured Innovator";
        if(key.contains("collaborative") && key.contains("adaptive")) return "Agile Collaborator";
        if(key.contains("independent") && key.contains("innovative") && key.contains("adaptive")) return "Visionary Explorer";
        return "Versatile Contributor";
    }

    private String buildSummary(List<String> descriptors, Map<String,Integer> scores, String archetype){
        return String.format("%s (%s). Traits: %s. Scores: C=%d, I=%d, P=%d, D=%d.",
                archetype,
                String.join(", ", descriptors),
                String.join(", ", descriptors),
                scores.getOrDefault(AXIS_COLLAB,50),
                scores.getOrDefault(AXIS_INNOV,50),
                scores.getOrDefault(AXIS_PLAN,50),
                scores.getOrDefault(AXIS_DETAIL,50)
        );
    }

    public PersonalityResultDTO evaluateAndApply(Integer userId, PersonalitySubmissionDTO submission){
        PersonalityResultDTO result = evaluate(submission);
        // delegate to survey service to persist
        surveyService.applyPersonalityToUser(userId, result.getSummary());
        return result;
    }
}
