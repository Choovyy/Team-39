package com.group2.SPEAR_Backend.Controller;


import com.group2.SPEAR_Backend.DTO.SurveyDTO;
import com.group2.SPEAR_Backend.Service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.group2.SPEAR_Backend.Repository.ProfileRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;
import com.group2.SPEAR_Backend.Model.ProfileEntity;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class SurveyController {

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

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

    // Convenience endpoint: fetch a user's stored survey (via profile) and call AI without client needing to send survey body
    @GetMapping("/match/user/{userId}")
    public ResponseEntity<?> getMatchesForUser(@PathVariable Integer userId) {
    userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        ProfileEntity profile = profileRepository.findByUser_Uid(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found for user"));
        if (profile.getSurvey() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User has not completed survey");
        }
        SurveyDTO surveyDTO = profile.getSurvey().toDTO();
        return ResponseEntity.ok(surveyService.getMatchesFromAISystem(surveyDTO));
    }


}
