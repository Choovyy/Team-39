package com.QueueIt.capstone.API.Controllers;

import com.QueueIt.capstone.API.DTO.ChatDTO;
import com.QueueIt.capstone.API.Services.ChatService;
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
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("")
    public ResponseEntity<Void> sendMessage(@RequestBody ChatDTO chatDTO){
        return chatService.sendMessage(chatDTO);
    }
}
