package com.QueueIt.capstone.API.Entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
public class NotificationRecipient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationRecipientID;
    private Long recipientID;
    @ManyToOne
    @JoinColumn(name = "notification_id", nullable = false)
    @JsonManagedReference
    private Notification notification;
    private boolean isRead = false;

    public NotificationRecipient() {
    }

    public NotificationRecipient(Long recipientID, Notification notification){
        this.recipientID = recipientID;
        this.notification = notification;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Long getNotificationRecipientID() {
        return notificationRecipientID;
    }

    public Long getRecipientID() {
        return recipientID;
    }

    public Notification getNotification() {
        return notification;
    }

    public boolean isRead() {
        return isRead;
    }


}
