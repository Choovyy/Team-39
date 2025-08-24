package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.Services.NotificationRecipientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://172.16.103.209:3000",
    "http://172.16.103.209:5173",
    "http://172.16.103.209:8080"
})
@RequestMapping("/notificationsRecipient")
public class NotificationRecipientController {

    @Autowired
    private NotificationRecipientService notificationRecipientService;

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Long id) {
        notificationRecipientService.markNotificationAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }

}
