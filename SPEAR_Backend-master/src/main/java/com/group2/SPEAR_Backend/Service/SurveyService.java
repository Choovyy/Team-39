package com.group2.SPEAR_Backend.Service;

import com.group2.SPEAR_Backend.DTO.SurveyDTO;
import com.group2.SPEAR_Backend.DTO.MatchResultDTO;
import com.group2.SPEAR_Backend.Model.ProfileEntity;
import com.group2.SPEAR_Backend.Model.SurveyEntity;
import com.group2.SPEAR_Backend.Model.TechnicalSkill;
import com.group2.SPEAR_Backend.Model.User;
import com.group2.SPEAR_Backend.Repository.ProfileRepository;
import com.group2.SPEAR_Backend.Repository.SurveyRepository;
import com.group2.SPEAR_Backend.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
//import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;


@Service
public class SurveyService {    @Autowired
private SurveyRepository surveyRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${matching.service.url}")
    private String matchingServiceUrl;

    public SurveyDTO getSurveyByProfileId(Long profileId) {
        ProfileEntity profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        SurveyEntity survey = profile.getSurvey();
        if (survey == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Survey not found for this profile");
        }

        return survey.toDTO();
    }

    @Transactional
    public SurveyDTO saveSurvey(Integer userId, SurveyDTO surveyDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ProfileEntity profile = profileRepository.findByUser_Uid(userId).orElseGet(() -> {
            ProfileEntity newProfile = new ProfileEntity();
            newProfile.setUser(user);
            return newProfile;
        });

        if (profile.getSurvey() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Survey already exists for this profile.");
        }

        SurveyEntity survey = new SurveyEntity();
        applySurveyDTOToEntity(surveyDTO, survey);

        SurveyEntity savedSurvey = surveyRepository.save(survey);        profile.setSurvey(savedSurvey);
        profileRepository.save(profile);

        updateUserFirstTimeFlag(user);

        // Send survey data to matching service
        //for testing
        //sendSurveyToMatchingService(user, savedSurvey.toDTO());

        return savedSurvey.toDTO();
    }

    @Transactional
    public SurveyDTO updateSurvey(Long profileId, SurveyDTO surveyDTO) {
        ProfileEntity profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        SurveyEntity survey = profile.getSurvey();
        if (survey == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Survey does not exist. Use save instead.");
        }

        applySurveyDTOToEntity(surveyDTO, survey);
        SurveyEntity savedSurvey = surveyRepository.save(survey);

        profile.setSurvey(savedSurvey);        profileRepository.save(profile);

        updateUserFirstTimeFlag(profile.getUser());

        // Send updated survey data to matching service

        //commented for testing
        //sendSurveyToMatchingService(profile.getUser(), savedSurvey.toDTO());

        return savedSurvey.toDTO();
    }    private void applySurveyDTOToEntity(SurveyDTO dto, SurveyEntity entity) {
        if (dto.getTechnicalSkills() != null) {
            List<TechnicalSkill> skills = dto.getTechnicalSkills().stream()
                    .map(ts -> new TechnicalSkill(ts.getSkill(), ts.getMasteryLevel()))
                    .toList();
            entity.setTechnicalSkills(skills);
        }

        entity.setProjectInterests(dto.getProjectInterests());
        entity.setPreferredRoles(dto.getPreferredRoles());

        // Ensure personality is never null or empty
        String personality = dto.getPersonality();
        if (personality == null || personality.trim().isEmpty()) {
            personality = "Unknown";
            System.out.println("⚠️ Empty personality detected, using default: 'Unknown'");
        }
        entity.setPersonality(personality);
    }private void updateUserFirstTimeFlag(User user) {
        if (user != null && user.isFirstTimeUser()) {
            user.setFirstTimeUser(false);
            userRepository.save(user);
        }
    }    private void sendSurveyToMatchingService(User user, SurveyDTO survey) {
        if (user == null || survey == null) {
            System.err.println("❌ Cannot send null user or survey data to matching service");
            return;
        }

        // Check if personality is set
        if (survey.getPersonality() == null || survey.getPersonality().isEmpty()) {
            System.err.println("❌ Personality is null or empty for user: " + user.getEmail());
            // Set a default value to avoid errors
            survey.setPersonality("Unknown");
        }

        RestTemplate restTemplate = new RestTemplate();
        String fastApiUrl = matchingServiceUrl + "/add_profile";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", user.getEmail());
        payload.put("name", user.getFullName());
        payload.put("technicalSkills", survey.getTechnicalSkills());
        payload.put("preferredRoles", survey.getPreferredRoles());
        payload.put("projectInterests", survey.getProjectInterests());
        payload.put("personality", survey.getPersonality());

        try {
            // Log what we're about to send
            System.out.println("✅ Sending data to matching service for user: " + user.getEmail());

            // Log the actual payload for debugging
            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(payload);
            System.out.println("📦 Payload: " + jsonPayload);

            HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(fastApiUrl, request, String.class);

            // Check response status
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("✅ Successfully sent to matching service: " + response.getBody());
            } else {
                System.err.println("❌ Matching service returned error status: " + response.getStatusCode());
                System.err.println("❌ Response body: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling matching service: " + e.getMessage());
            // Try to determine if it's a connection issue
            if (e.getMessage().contains("Connection refused") || e.getMessage().contains("Connection timed out")) {
                System.err.println("❌ Could not connect to matching service at URL: " + fastApiUrl);
                System.err.println("❌ Make sure the Python FastAPI service is running on the expected port");
            }
            e.printStackTrace(); // Added for more detailed debugging
        }
    }  public List<MatchResultDTO> getMatchesFromAISystem(SurveyDTO surveyDTO) {
        if (surveyDTO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Survey data cannot be null");
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = matchingServiceUrl + "/match";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("technicalSkills", surveyDTO.getTechnicalSkills());
        requestBody.put("preferredRoles", surveyDTO.getPreferredRoles());
        requestBody.put("projectInterests", surveyDTO.getProjectInterests());
        requestBody.put("personality", surveyDTO.getPersonality());


        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            // Log what we're about to send
            System.out.println("✅ Requesting matches from AI system");

            // Log request body for debugging
            ObjectMapper mapper = new ObjectMapper();
            String jsonRequestBody = mapper.writeValueAsString(requestBody);
            System.out.println("📦 Request body: " + jsonRequestBody);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            // Check response status
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("❌ Matching service returned error status: " + response.getStatusCode());
                System.err.println("❌ Response body: " + response.getBody());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Matching service returned status " + response.getStatusCode());
            }

            // Log response for debugging
            System.out.println("✅ Received response: " + response.getBody());

            try {
                mapper = new ObjectMapper();
                Map<String, List<MatchResultDTO>> responseMap = mapper.readValue(
                        response.getBody(),
                        new TypeReference<Map<String, List<MatchResultDTO>>>() {}
                );

                List<MatchResultDTO> matches = responseMap.get("matches");
                System.out.println("✅ Received " + (matches != null ? matches.size() : 0) + " matches from AI system");

                if (matches == null) {
                    return new ArrayList<>(); // Return empty list instead of null
                }
                // Enrich matches with profile picture
                for (MatchResultDTO match : matches) {
                    // Try to find the profile by user name
                    ProfileEntity profile = profileRepository.findAll().stream()
                            .filter(p -> p.getUser() != null && p.getUser().getFullName() != null && p.getUser().getFullName()  .equals(match.getName()))
                            .findFirst()
                            .orElse(null);
                    if (profile != null) {
                        match.setProfilePicture(profile.getProfilePicture());
                    } else {
                        match.setProfilePicture(null); // or set a default/placeholder if you want
                    }
                }
                // Enrich matches with profile picture using user name
                for (MatchResultDTO match : matches) {
                    // Try to find the profile by user name
                    ProfileEntity profile = profileRepository.findAll().stream()
                            .filter(p -> p.getUser() != null && p.getUser().getFullName() != null && p.getUser().getFullName().equals(match.getName()))
                            .findFirst()
                            .orElse(null);
                    if (profile != null) {
                        match.setProfilePicture(profile.getProfilePicture());
                    } else {
                        match.setProfilePicture(null); // or set a default/placeholder if you want
                    }
                }
                return matches;
            } catch (Exception e) {
                System.err.println("❌ Error parsing response from matching service: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error parsing response from matching service: " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling /match: " + e.getMessage());
            // Try to determine if it's a connection issue
            if (e.getMessage().contains("Connection refused") || e.getMessage().contains("Connection timed out")) {
                System.err.println("❌ Could not connect to matching service at URL: " + url);
                System.err.println("❌ Make sure the Python FastAPI service is running on the expected port");
            }
            e.printStackTrace(); // Added for more detailed debugging
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Matching service unavailable: " + e.getMessage());
        }
    }


}

