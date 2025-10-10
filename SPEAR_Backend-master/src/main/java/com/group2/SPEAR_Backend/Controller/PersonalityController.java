package com.group2.SPEAR_Backend.Controller;

import com.group2.SPEAR_Backend.DTO.PersonalityQuestionDTO;
import com.group2.SPEAR_Backend.DTO.PersonalityResultDTO;
import com.group2.SPEAR_Backend.DTO.PersonalitySubmissionDTO;
import com.group2.SPEAR_Backend.Service.PersonalityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/personality")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "https://capstoneconnect.netlify.app", "https://queueit39.netlify.app"}, allowCredentials = "true")
public class PersonalityController {

    @Autowired
    private PersonalityService personalityService;

    @GetMapping("/questions")
    public List<PersonalityQuestionDTO> getQuestions(){
        return personalityService.getQuestions();
    }

    @PostMapping("/evaluate")
    public PersonalityResultDTO evaluate(@RequestBody PersonalitySubmissionDTO submission){
        return personalityService.evaluate(submission);
    }

    @PostMapping("/apply/{userId}")
    public PersonalityResultDTO evaluateAndApply(@PathVariable Integer userId, @RequestBody PersonalitySubmissionDTO submission){
        return personalityService.evaluateAndApply(userId, submission);
    }
}
