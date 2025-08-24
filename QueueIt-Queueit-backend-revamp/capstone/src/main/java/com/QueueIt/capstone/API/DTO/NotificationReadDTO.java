package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class NotificationReadDTO {
    List<Long> notificationIDs;

    public NotificationReadDTO() {
    }

    public NotificationReadDTO(List<Long> notificationIDs) {
        this.notificationIDs = notificationIDs;
    }

    public List<Long> getNotificationIDs() {
        return notificationIDs;
    }
}
