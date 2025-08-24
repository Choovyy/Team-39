package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Repository.QueueingEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QueueingEntryService {

    @Autowired
    private QueueingEntryRepository queueingEntryRepository;

    public Long countUniqueTeamsForClassroom(Long classroomID){
        return queueingEntryRepository.countUniqueTeamsForClassroom(classroomID);
    }
}
