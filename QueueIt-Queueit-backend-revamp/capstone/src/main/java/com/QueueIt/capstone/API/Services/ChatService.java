package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.DTO.ChatDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;

    public ResponseEntity<Void> sendMessage(ChatDTO chatDTO) {
        simpMessageSendingOperations.convertAndSend("/topic/chat/adviser/"+ chatDTO.getAdviserID(),chatDTO);
        return null;
    }
}
