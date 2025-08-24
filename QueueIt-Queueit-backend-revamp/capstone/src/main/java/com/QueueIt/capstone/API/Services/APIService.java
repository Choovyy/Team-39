package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Constants;
import com.QueueIt.capstone.API.DTO.ClassesIDRequest;
import com.QueueIt.capstone.API.DTO.TeamsIDRequest;
import com.QueueIt.capstone.API.Entities.Team;
import com.QueueIt.capstone.API.Enums.DayOfWeek;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class APIService {

    private WebClient webClient;

    public APIService(WebClient.Builder webClientBuilder){
        this.webClient = webClientBuilder.baseUrl(Constants.SPEAR_BACKEND_URL).build();
    }

    public Mono<List<Team>> fetchTeamsForAutomationTodayFromSpear(){
        LocalDateTime now = LocalDateTime.now();
        if (!(now.getDayOfWeek().toString().equals("SUNDAY") || now.getDayOfWeek().toString().equals("SATURDAY"))){
            DayOfWeek day = DayOfWeek.valueOf(now.getDayOfWeek().toString());

            return webClient.get()
                    .uri("/team/automateScheduledMeetings/"+day)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Team>>() {
                    })
                    .onErrorResume(e -> {
                       return Mono.empty();
                    });
        }

        return Mono.empty();
    }

    public Mono<List<Long>> retrieveNotificationRecipientsForAllClasses(Long facultyID){
        return webClient.get()
                .uri("/team/all/notification/"+facultyID)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Long>>() {
                })
                .onErrorResume(e -> {
                    return Mono.empty();
                });
    }

    public Mono<List<Long>> retrieveNotificationRecipientsForSelectClasses(Long facultyID, ClassesIDRequest classesIDRequest){
        return webClient.post()
                .uri("/team/selected/notification/"+facultyID)
                .bodyValue(classesIDRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Long>>() {
                })
                .onErrorResume(e -> {
                    return Mono.empty();
                });
    }

    public Mono<List<Long>> retrieveNotificationRecipientsForAllTeams(Long facultyID){
        return webClient.get()
                .uri("/team/allTeamsByFaculty/notification/"+facultyID)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Long>>() {
                })
                .onErrorResume(e -> {
                    return Mono.empty();
                });
    }

    public Mono<List<Long>> retrieveNotificationRecipientsForSelectedTeams(Long facultyID, TeamsIDRequest teamsIDRequest){
        return webClient.post()
                .uri("/team/selectedTeamsByFaculty/notification/"+facultyID)
                .bodyValue(teamsIDRequest)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Long>>() {
                })
                .onErrorResume(e -> {
                    return Mono.empty();
                });
    }


}
