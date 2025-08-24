package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Entities.NotificationRecipient;
import com.QueueIt.capstone.API.Repository.NotificationRecipientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationRecipientService {

    @Autowired
    private NotificationRecipientRepository notificationRecipientRepository;

    @Transactional
    public void markNotificationAsRead(Long notificationRecipientID) {
        NotificationRecipient recipient = notificationRecipientRepository.findById(notificationRecipientID)
                .orElseThrow(() -> new RuntimeException("NotificationRecipient not found"));
        recipient.setRead(true);
        notificationRecipientRepository.save(recipient);
    }
}
