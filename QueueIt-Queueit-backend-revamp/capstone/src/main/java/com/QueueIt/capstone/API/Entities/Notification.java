package com.QueueIt.capstone.API.Entities;

import com.QueueIt.capstone.API.Enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationID;
    private Long trigerringPersonID;
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;
    private LocalDateTime dateTimeGenerated = LocalDateTime.now();
    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private List<NotificationRecipient> recipients = new ArrayList<>();
    private String redirectedUrl;
    private String notificationMessage;

    public Notification() {
    }

    public Notification(Long trigerringPersonID, NotificationType notificationType, String redirectedUrl, String notificationMessage) {
        this.trigerringPersonID = trigerringPersonID;
        this.notificationType = notificationType;
        this.redirectedUrl = redirectedUrl;
        this.notificationMessage = notificationMessage;
    }

    public Long getNotificationID() {
        return notificationID;
    }

    public Long getTrigerringPersonID() {
        return trigerringPersonID;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public LocalDateTime getDateTimeGenerated() {
        return dateTimeGenerated;
    }

    public List<NotificationRecipient> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<NotificationRecipient> recipients) {
        this.recipients = recipients;
    }

    public String getRedirectedUrl() {
        return redirectedUrl;
    }

    public void setRedirectedUrl(String redirectedUrl) {
        this.redirectedUrl = redirectedUrl;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }

    public void setNotificationMessage(String notificationMessage) {
        this.notificationMessage = notificationMessage;
    }
}
