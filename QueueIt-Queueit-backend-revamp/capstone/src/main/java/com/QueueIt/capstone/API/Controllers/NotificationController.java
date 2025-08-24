package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.DTO.NotificationReadDTO;
import com.QueueIt.capstone.API.Services.NotificationService;
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
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userID}")
    public ResponseEntity<Object> retrieveUserNotifications(@PathVariable Long userID){
        return ResponseEntity.ok(notificationService.retrieveUserNotifications(userID));
    }

    @PostMapping("/setRead")
    public ResponseEntity<Object> setNotificationsToRead(@RequestBody NotificationReadDTO notificationReadDTO){
        notificationService.setNotificationsToRead(notificationReadDTO);
        return ResponseEntity.ok(Boolean.TRUE);
    }
}
