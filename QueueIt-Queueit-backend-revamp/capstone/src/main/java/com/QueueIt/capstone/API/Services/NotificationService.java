package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.DTO.ClassesIDRequest;
import com.QueueIt.capstone.API.DTO.NotificationReadDTO;
import com.QueueIt.capstone.API.DTO.TeamsIDRequest;
import com.QueueIt.capstone.API.Entities.Notification;
import com.QueueIt.capstone.API.Entities.NotificationRecipient;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Repository.NotificationRecipientRepository;
import com.QueueIt.capstone.API.Repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private APIService apiService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationRecipientRepository notificationRecipientRepository;

    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;

    public void generateNotificationRecipientsForAllClasses(Long facultyID, String uri, String message, NotificationType notificationType){

        apiService.retrieveNotificationRecipientsForAllClasses(facultyID)
                .subscribe(IDList ->{
                    if (IDList != null && !IDList.isEmpty()){
                        Notification notification = notificationRepository.save(
                                new Notification(
                                        facultyID,
                                        notificationType,
                                        uri,
                                        message
                                )
                        );

                        List<NotificationRecipient> notificationRecipientList = new ArrayList<>();
                        IDList.stream()
                                .forEach(entry->{
                                    notificationRecipientList.add(new NotificationRecipient(
                                            entry,
                                            notification
                                    ));
                                });

                        notificationRecipientRepository.saveAll(notificationRecipientList);
                        notificationRecipientList.stream()
                                .forEach(entry->{
                                    simpMessageSendingOperations.convertAndSend("/topic/notification/"+entry.getRecipientID(),entry);
                                });
                    }
                }, error ->{
                    System.err.println("Error fetching recipients from SPEAR: "+error.getMessage());
                });
    }

    public void generateNotificationRecipientsForSelectClasses(Long facultyID, ClassesIDRequest classesIDRequest, String uri, String message, NotificationType notificationType){


        apiService.retrieveNotificationRecipientsForSelectClasses(facultyID, classesIDRequest)
                .subscribe(IDList ->{
                    if (IDList != null && !IDList.isEmpty()){
                        Notification notification = notificationRepository.save(
                                new Notification(
                                        facultyID,
                                        notificationType,
                                        uri,
                                        message
                                )
                        );

                        List<NotificationRecipient> notificationRecipientList = new ArrayList<>();
                        IDList.stream()
                                .forEach(entry->{
                                    notificationRecipientList.add(new NotificationRecipient(
                                            entry,
                                            notification
                                    ));
                                });

                        notificationRecipientRepository.saveAll(notificationRecipientList);
                        notificationRecipientList.stream()
                                .forEach(entry->{
                                    simpMessageSendingOperations.convertAndSend("/topic/notification/"+entry.getRecipientID(),entry);
                                });
                    }
                }, error ->{
                    System.err.println("Error fetching recipients from SPEAR: "+error.getMessage());
                });
    }

    public void generateNotificationRecipientsForAllTeams(Long facultyID, String uri, String message, NotificationType notificationType){


        apiService.retrieveNotificationRecipientsForAllTeams(facultyID)
                .subscribe(IDList ->{
                    if (IDList != null && !IDList.isEmpty()){
                        Notification notification = notificationRepository.save(
                                new Notification(
                                        facultyID,
                                        notificationType,
                                        uri,
                                        message
                                )
                        );

                        List<NotificationRecipient> notificationRecipientList = new ArrayList<>();
                        IDList.stream()
                                .forEach(entry->{
                                    notificationRecipientList.add(new NotificationRecipient(
                                            entry,
                                            notification
                                    ));
                                });

                        notificationRecipientRepository.saveAll(notificationRecipientList);
                        notificationRecipientList.stream()
                                .forEach(entry->{
                                    simpMessageSendingOperations.convertAndSend("/topic/notification/"+entry.getRecipientID(),entry);
                                });
                    }
                }, error ->{
                    System.err.println("Error fetching recipients from SPEAR: "+error.getMessage());
                });
    }

    public void generateNotificationRecipientsForSelectedTeams(Long facultyID, TeamsIDRequest teamsIDRequest, String uri, String message, NotificationType notificationType){


        apiService.retrieveNotificationRecipientsForSelectedTeams(facultyID, teamsIDRequest)
                .subscribe(IDList ->{
                    if (IDList != null && !IDList.isEmpty()){
                        Notification notification = notificationRepository.save(
                                new Notification(
                                        facultyID,
                                        notificationType,
                                        uri,
                                        message
                                )
                        );

                        List<NotificationRecipient> notificationRecipientList = new ArrayList<>();
                        IDList.stream()
                                .forEach(entry->{
                                    notificationRecipientList.add(new NotificationRecipient(
                                            entry,
                                            notification
                                    ));
                                });

                        notificationRecipientRepository.saveAll(notificationRecipientList);
                        notificationRecipientList.stream()
                                .forEach(entry->{
                                    simpMessageSendingOperations.convertAndSend("/topic/notification/"+entry.getRecipientID(),entry);
                                });
                    }
                }, error ->{
                    System.err.println("Error fetching recipients from SPEAR: "+error.getMessage());
                });
    }

    public void generateEnqueueNotificationForFaculty(Long facultyID, Long teamID, String uri, String message, NotificationType notificationType){
        Notification notification = notificationRepository.save( new Notification(
                teamID,
                notificationType,
                uri,
                message

        ));
         NotificationRecipient notificationRecipient = notificationRecipientRepository.save(
                 new NotificationRecipient(
                         facultyID,
                         notification
                 )
         );
        simpMessageSendingOperations.convertAndSend("/topic/notification/"+notificationRecipient.getRecipientID(),notificationRecipient);
    }

    public List<NotificationRecipient> retrieveUserNotifications(Long userID){
        List<NotificationRecipient> notifications = notificationRecipientRepository.findTop10ByRecipientIDOrderByNotificationDateTimeGeneratedDesc(userID);

        return notifications.stream()
                .sorted(Comparator.comparing(
                        notificationRecipient -> notificationRecipient.getNotification().getDateTimeGenerated(),
                        Comparator.reverseOrder()
                ))
                .toList();
    }

    public void setNotificationsToRead(NotificationReadDTO notificationReadDTO) {
        List<NotificationRecipient> notificationRecipients = notificationRecipientRepository.findAllById(notificationReadDTO.getNotificationIDs());
        notificationRecipients.stream()
                .forEach(notificationRecipientEntry -> {
                    notificationRecipientEntry.setRead(Boolean.TRUE);
                });
        notificationRecipientRepository.saveAll(notificationRecipients);

    }
}
