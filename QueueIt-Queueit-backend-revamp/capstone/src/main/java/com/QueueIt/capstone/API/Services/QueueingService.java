package com.QueueIt.capstone.API.Services;

import com.QueueIt.capstone.API.Constants;
import com.QueueIt.capstone.API.DTO.QueueingEntryDTO;
import com.QueueIt.capstone.API.Entities.Attendance;
import com.QueueIt.capstone.API.Entities.QueueingEntry;
import com.QueueIt.capstone.API.Entities.QueueingManager;
import com.QueueIt.capstone.API.Enums.NotificationType;
import com.QueueIt.capstone.API.Middlewares.*;
import com.QueueIt.capstone.API.Repository.QueueingEntryRepository;
import com.QueueIt.capstone.API.Repository.QueueingManagerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Comparator;

@Service
public class QueueingService {

    private static final Logger log = LoggerFactory.getLogger(QueueingService.class);
    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;

    @Autowired
    private QueueingManagerRepository queueingManagerRepository;

    @Autowired
    private QueueingEntryRepository queueingEntryRepository;

    @Autowired
    private NotificationService notificationService;

    public void enqueueTeam(QueueingEntryDTO queueingEntryDTO)
            throws
            QueueingManagerNotFoundException,
            DuplicateQueueingEntryException,
            QueueingManagerInactiveException,
            QueueingCapacityExceeded,
            QueueingEntryIsTendingEntryException {

        // [1] find the faculty's associated queueing manager
        QueueingManager queueingManager = queueingManagerRepository
                .findByFacultyID(queueingEntryDTO.getFacultyID())
                .orElseThrow(()-> new QueueingManagerNotFoundException("Queueing manager for faculty not found."));
        if(queueingManager.checkDuplicateEntry(queueingEntryDTO.getTeamID())){
            throw new DuplicateQueueingEntryException("Team already exists in the queue");
        }
        if(!queueingManager.getIsActive()){
            throw new QueueingManagerInactiveException("Faculty does not entertain any meetings as of this moment");
        }
        if(queueingManager.getQueueLength() == queueingManager.getCateringLimit() && queueingManager.getCateringLimit() > 0){
            throw new QueueingCapacityExceeded("Queueing capacity exceeded");
        }
        if (queueingManager.isQueueingEntryTending(queueingEntryDTO.getTeamID())){
            throw new QueueingEntryIsTendingEntryException("Queueing entry is tending entry.");
        }

        QueueingEntry queueingEntry = createQueueingEntry(queueingEntryDTO, queueingManager);

        notificationService.generateEnqueueNotificationForFaculty(
                queueingManager.getFacultyID(),
                queueingEntry.getTeamID(),
                Constants.QUEUEIT_FRONTEND_URL+"/queue",
                queueingEntry.getTeamName()+" has queued in line.",
                NotificationType.TEAM_ENQUEUE
        );

        //I just sent a true message, since frontend refetches the queueing manager.
        //For some reasons, queueing entries in the updated queueing manager is not serialized by jackson for this method
        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingEntry.getQueueingManager().getFacultyID(), Boolean.TRUE);

    }

    public void dequeueTeam(QueueingEntryDTO queueingEntryDTO)
            throws
            QueueingEntryNotFoundException,
            QueueingManagerNotFoundException {

        QueueingEntry queueingEntry = queueingEntryRepository
                .findById(queueingEntryDTO.getQueueingEntryID())
                .orElseThrow(()-> new QueueingEntryNotFoundException("Queueing entry not found"));

        queueingEntryRepository.delete(queueingEntry);

        QueueingManager queueingManager = queueingManagerRepository
                .findById(queueingEntry.getQueueingManager().getQueueingManagerID())
                .orElseThrow(()->new QueueingManagerNotFoundException("Queueing manager not found."));

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingEntry.getQueueingManager().getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingEntry.getQueueingManager().getFacultyID(), queueingManager);
    }

    public void setTeamOnHold(QueueingEntryDTO queueingEntryDTO) throws QueueingEntryNotFoundException, AlreadyOnHoldException, QueueingManagerNotFoundException {
        QueueingEntry queueingEntry = queueingEntryRepository
                .findById(queueingEntryDTO.getQueueingEntryID())
                .orElseThrow(()-> new QueueingEntryNotFoundException("Queueing entry not found"));
        if (queueingEntry.getOnHold()){
            throw new AlreadyOnHoldException("Queueing entry is already on hold status.");
        }
        queueingEntry.setOnHold(Boolean.TRUE);
        queueingEntryRepository.save(queueingEntry);

        QueueingManager queueingManager = queueingManagerRepository
                .findById(queueingEntry.getQueueingManager().getQueueingManagerID())
                .orElseThrow(()->new QueueingManagerNotFoundException("Queueing manager not found."));

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingEntry.getQueueingManager().getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingEntry.getQueueingManager().getFacultyID(), queueingManager);
    }

    public void requeueTeam(QueueingEntryDTO queueingEntryDTO) throws QueueingEntryNotFoundException, AlreadyOnHoldException, QueueingManagerNotFoundException {
        QueueingEntry queueingEntry = queueingEntryRepository
                .findById(queueingEntryDTO.getQueueingEntryID())
                .orElseThrow(()-> new QueueingEntryNotFoundException("Queueing entry not found"));
        if (!queueingEntry.getOnHold()){
            throw new AlreadyOnHoldException("Queueing entry is already active.");
        }
        queueingEntry.setOnHold(Boolean.FALSE);
        queueingEntryRepository.save(queueingEntry);

        QueueingManager queueingManager = queueingManagerRepository
                .findById(queueingEntry.getQueueingManager().getQueueingManagerID())
                .orElseThrow(()->new QueueingManagerNotFoundException("Queueing manager not found."));

        simpMessageSendingOperations.convertAndSend("/topic/queueStatus/adviser/" + queueingEntry.getQueueingManager().getFacultyID(), queueingManager.getQueueingEntries());
        simpMessageSendingOperations.convertAndSend("/topic/facultyActivity/adviser/"+queueingEntry.getQueueingManager().getFacultyID(), queueingManager);
    }

    public QueueingEntry createQueueingEntry(QueueingEntryDTO queueingEntryDTO, QueueingManager queueingManager){
        // Initializing the queueing entry
        QueueingEntry queueingEntry = new QueueingEntry(
                queueingEntryDTO.getTeamID(),
                queueingEntryDTO.getTeamName(),
                queueingEntryDTO.getClassReference(),
                queueingEntryDTO.getClassroomID(),
                queueingManager,
                queueingEntryDTO.getAttendanceList()
        );

        // Set the queueingEntry reference for each Attendance
        for (Attendance attendance : queueingEntryDTO.getAttendanceList()) {
            attendance.setQueueingEntry(queueingEntry); // Set the reference
        }

        //saving it to the database
        return queueingEntryRepository.save(queueingEntry);
    }
}
