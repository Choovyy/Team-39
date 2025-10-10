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

    @Autowired
    public void logConfiguredMatchingServiceUrl() {
        try {
            System.out.println("[SPEAR] matching.service.url = " + matchingServiceUrl);
        } catch (Exception ignored) {}
    }

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
        sendSurveyToMatchingService(user, savedSurvey.toDTO());

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
        // Send updated survey data to matching service
        sendSurveyToMatchingService(profile.getUser(), savedSurvey.toDTO());
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
    }

    // Backward-compatible entry point (no email)
    public List<MatchResultDTO> getMatchesFromAISystem(SurveyDTO surveyDTO) {
        return getMatchesFromAISystem(surveyDTO, null);
    }

    // New entry point: allow passing caller email to help matching layer exclude self explicitly
    public List<MatchResultDTO> getMatchesFromAISystem(SurveyDTO surveyDTO, String requesterEmail) {
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
        if (requesterEmail != null && !requesterEmail.isBlank()) {
            requestBody.put("email", requesterEmail);
        }

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ObjectMapper mapper = new ObjectMapper();
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Matching service returned status " + response.getStatusCode());
            }

            Map<String, List<MatchResultDTO>> responseMap = mapper.readValue(
                    response.getBody(),
                    new TypeReference<Map<String, List<MatchResultDTO>>>() {}
            );

            List<MatchResultDTO> matches = responseMap.get("matches");
            if (matches == null) {
                return new ArrayList<>();
            }

            // Preload users and profiles for enrichment and latest profile-backed fields
            List<User> users = userRepository.findAll();
            Map<String, String> emailByFullName = new HashMap<>();
            Map<String, User> userByEmail = new HashMap<>();
            for (User u : users) {
                emailByFullName.put(u.getFullName(), u.getEmail());
                userByEmail.put(u.getEmail(), u);
            }

            List<ProfileEntity> profiles = profileRepository.findAll();
            Map<String, ProfileEntity> profileByFullName = new HashMap<>();
            Map<String, ProfileEntity> profileByEmail = new HashMap<>();
            for (ProfileEntity p : profiles) {
                if (p.getUser() != null) {
                    if (p.getUser().getFullName() != null) {
                        profileByFullName.put(p.getUser().getFullName(), p);
                    }
                    if (p.getUser().getEmail() != null) {
                        profileByEmail.put(p.getUser().getEmail(), p);
                    }
                }
            }

            // Enrich and overlay latest profile data
            for (MatchResultDTO match : matches) {
                // 1) Fill missing email using full name
                if (match.getEmail() == null || match.getEmail().isBlank()) {
                    String enrichedEmail = emailByFullName.get(match.getName());
                    if (enrichedEmail != null) match.setEmail(enrichedEmail);
                }

                // 2) Resolve profile by email (preferred) or by name
                ProfileEntity matchedProfile = null;
                if (match.getEmail() != null && !match.getEmail().isBlank()) {
                    matchedProfile = profileByEmail.get(match.getEmail());
                }
                if (matchedProfile == null && match.getName() != null) {
                    matchedProfile = profileByFullName.get(match.getName());
                }

                // 3) Socials and picture enrichment from profile
                if (matchedProfile != null) {
                    if (match.getProfilePicture() == null || match.getProfilePicture().isBlank()) {
                        match.setProfilePicture(matchedProfile.getProfilePicture());
                    }
                    if (match.getGithub() == null || match.getGithub().isBlank()) {
                        match.setGithub(matchedProfile.getGithub());
                    }
                    if (match.getFacebook() == null || match.getFacebook().isBlank()) {
                        match.setFacebook(matchedProfile.getFacebook());
                    }

                    // 4) Overlay the latest profile-backed descriptive fields
                    if (matchedProfile.getSurvey() != null) {
                        // technicalSkills
                        if (matchedProfile.getSurvey().getTechnicalSkills() != null) {
                            List<com.group2.SPEAR_Backend.DTO.TechnicalSkillDTO> skillDTOs = matchedProfile.getSurvey().getTechnicalSkills().stream()
                                    .map(ts -> new com.group2.SPEAR_Backend.DTO.TechnicalSkillDTO(ts.getSkill(), ts.getMasteryLevel()))
                                    .toList();
                            match.setTechnicalSkills(skillDTOs);
                        }

                        // preferredRoles (with de-duplication, case-insensitive, preserve order)
                        if (matchedProfile.getSurvey().getPreferredRoles() != null) {
                            List<String> roles = matchedProfile.getSurvey().getPreferredRoles();
                            List<String> deduped = new ArrayList<>();
                            Map<String, Boolean> seen = new HashMap<>();
                            for (String r : roles) {
                                if (r == null) continue;
                                String key = r.trim().toLowerCase();
                                if (key.isEmpty()) continue;
                                if (!seen.containsKey(key)) {
                                    seen.put(key, true);
                                    deduped.add(r);
                                }
                            }
                            match.setPreferredRoles(deduped);
                        }

                        // projectInterests (de-duplicate while preserving order)
                        if (matchedProfile.getSurvey().getProjectInterests() != null) {
                            List<String> interests = matchedProfile.getSurvey().getProjectInterests();
                            List<String> deduped = new ArrayList<>();
                            Map<String, Boolean> seen = new HashMap<>();
                            for (String pi : interests) {
                                if (pi == null) continue;
                                String key = pi.trim().toLowerCase();
                                if (key.isEmpty()) continue;
                                if (!seen.containsKey(key)) {
                                    seen.put(key, true);
                                    deduped.add(pi);
                                }
                            }
                            match.setProjectInterests(deduped);
                        }

                        // personality text from latest survey (scores remain from AI)
                        if (matchedProfile.getSurvey().getPersonality() != null && !matchedProfile.getSurvey().getPersonality().isBlank()) {
                            match.setPersonality(matchedProfile.getSurvey().getPersonality());
                        }
                    }
                }
            }

            // De-duplicate entire match list by email (preferred) then name, keeping the higher overallScore
            Map<String, MatchResultDTO> bestByKey = new HashMap<>();
            for (MatchResultDTO m : matches) {
                String key = (m.getEmail() != null && !m.getEmail().isBlank()) ? ("email:" + m.getEmail()) : ("name:" + (m.getName() == null ? "" : m.getName()));
                MatchResultDTO existing = bestByKey.get(key);
                if (existing == null) {
                    bestByKey.put(key, m);
                } else {
                    double curr = m.getOverallScore();
                    double prev = existing.getOverallScore();
                    if (Double.compare(curr, prev) > 0) {
                        bestByKey.put(key, m);
                    }
                }
            }

            return new ArrayList<>(bestByKey.values());
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // Connection issues (timeout/refused) → 503
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Matching service unreachable at " + matchingServiceUrl + ": " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Matching service error: " + e.getMessage());
        }
    }

    // Persist personality summary onto existing survey for a user
    public SurveyDTO applyPersonalityToUser(Integer userId, String personalitySummary) {
        if(personalitySummary == null || personalitySummary.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Personality summary is empty");
        }
        ProfileEntity profile = profileRepository.findByUser_Uid(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found for user"));
        SurveyEntity survey = profile.getSurvey();
        if(survey == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Survey must be created before applying personality");
        }
        survey.setPersonality(personalitySummary);
        surveyRepository.save(survey);
        return survey.toDTO();
    }


}

