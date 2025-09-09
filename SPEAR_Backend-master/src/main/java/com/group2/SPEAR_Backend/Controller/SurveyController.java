package com.group2.SPEAR_Backend.Controller;


import com.group2.SPEAR_Backend.DTO.SurveyDTO;
import com.group2.SPEAR_Backend.Service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/survey")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @GetMapping("/{profileId}")
    public SurveyDTO getSurvey(@PathVariable Long profileId) {
        return surveyService.getSurveyByProfileId(profileId);
    }

    @PostMapping("/save/{userId}")
    public SurveyDTO saveSurvey(@PathVariable Integer userId, @RequestBody SurveyDTO surveyDTO) {
        return surveyService.saveSurvey(userId, surveyDTO);
    }

    @PostMapping("/update/{profileId}")
    public SurveyDTO updateSurvey(@PathVariable Long profileId, @RequestBody SurveyDTO surveyDTO) {
        return surveyService.updateSurvey(profileId, surveyDTO);
    }

    @PostMapping("/match")
    public ResponseEntity<?> getMatches(@RequestBody SurveyDTO surveyDTO) {
        return ResponseEntity.ok(surveyService.getMatchesFromAISystem(surveyDTO));
    }


}
